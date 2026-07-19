import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProfileForm } from './ProfileForm'; 

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    // 💡 මුලින්ම profile එකක් තිබ්බොත් View Mode (false) එකේ පෙන්වන්න හදාගන්න පුළුවන්
    const [isEditing, setIsEditing] = useState(false); 

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            
            if (!token) {
                console.error("No token found!");
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:5139/api/Candidate', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                }
            });

            console.log("🔍 Live Backend Response:", response.data);

            if (response.data) {
                setProfile(response.data);
                // 💡 Profile එකක් Backend එකේ නැත්නම් කෙලින්ම Form එක (Edit Mode) පෙන්වනවා
                setIsEditing(false);
            } else {
                setProfile(null);
                setIsEditing(true); 
            }
            
        } catch (error) {
            console.error("Error fetching profile:", error);
            setProfile(null);
            setIsEditing(true); // Error එකක් ආවොත් (නැති වෙලාවක) Form එක පෙන්වනවා
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    if (loading) return <div style={{ padding: '20px', color: '#666' }}>⏳ Loading Profile Data...</div>;

    return (
        <div className="profile-container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            
            {!profile || isEditing ? (
                <ProfileForm 
                    userId={profile?.userId || 3} 
                    existingProfile={profile} 
                    onSave={() => {
                        setIsEditing(false); 
                        fetchProfileData(); 
                    }}
                    onCancel={profile ? () => setIsEditing(false) : null} 
                />
            ) : (
                /* 💡 [විසඳුම] Form එකේ දාපු සියලුම විස්තර පෙන්වන පරිදි සකස් කළ Profile View Area */
                <div className="profile-view-card" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    
                    {/* Header Details */}
                    <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '20px', marginBottom: '20px' }}>
                        <h2 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '26px' }}>{profile.firstName} {profile.lastName}</h2>
                        <p style={{ margin: 0, color: '#2563eb', fontWeight: '600', fontSize: '16px' }}>{profile.headline || "No Headline Provided"}</p>
                    </div>

                    {/* All Info Grid (දැන් මෙතන හැමදේම තියෙනවා) */}
                    <h3 style={{ color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>ℹ️ Personal & Professional Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px', color: '#4b5563', marginBottom: '25px' }}>
                        <p><strong>📍 Location:</strong> {profile.location || 'N/A'}</p>
                        <p><strong>📞 Phone:</strong> {profile.phoneNumber || 'N/A'}</p>
                        <p><strong>💼 Experience:</strong> {profile.yearsOfExperience} Years</p>
                        <p><strong>🌐 Work Mode:</strong> {profile.preferredWorkMode}</p>
                        <p><strong>📅 Date of Birth:</strong> {profile.dateOfBirth ? String(profile.dateOfBirth).split('T')[0] : 'N/A'}</p>
                        <p><strong>🧬 Gender:</strong> {profile.gender}</p>
                        <p><strong>🌍 Nationality:</strong> {profile.nationality}</p>
                        <p><strong>💍 Marital Status:</strong> {profile.maritalStatus}</p>
                        <p style={{ gridColumn: 'span 2' }}><strong>🗣️ Languages:</strong> {profile.languages}</p>
                    </div>

                    {/* Social Links Section */}
                    <h3 style={{ color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>🔗 Links & Portfolios</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '14px', marginBottom: '25px' }}>
                        {profile.linkedInUrl && (
                            <p><strong>💙 LinkedIn:</strong> <a href={profile.linkedInUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{profile.linkedInUrl}</a></p>
                        )}
                        {profile.gitHubUrl && (
                            <p><strong>🖤 GitHub:</strong> <a href={profile.gitHubUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{profile.gitHubUrl}</a></p>
                        )}
                        {profile.portfolioUrl && (
                            <p><strong>🌐 Portfolio:</strong> <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{profile.portfolioUrl}</a></p>
                        )}
                        {!profile.linkedInUrl && !profile.gitHubUrl && !profile.portfolioUrl && <p style={{ color: '#9ca3af', italic: 'true' }}>No social links added yet.</p>}
                    </div>

                    {/* Summary Section */}
                    <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>📝 Professional Summary</h4>
                        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>{profile.summary || "No summary provided yet."}</p>
                    </div>

                    {/* Edit Button */}
                    <button 
                        onClick={() => setIsEditing(true)} 
                        style={{ 
                            marginTop: '10px', 
                            padding: '12px 24px', 
                            backgroundColor: '#2563eb', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                    >
                        ✏️ Edit Profile Details
                    </button>
                </div>
            )}
        </div>
    );
}

export default Profile;