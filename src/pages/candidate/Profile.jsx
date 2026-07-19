import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProfileForm } from './ProfileForm'; 

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    // 💡 [විසඳුම] Form එක කෙලින්ම බලාගන්න Edit Mode එක default TRUE කළා
    const [isEditing, setIsEditing] = useState(true); 

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

            // 💡 කෙලින්ම Object එකක් එන නිසා සෙට් කරනවා
            if (response.data) {
                setProfile(response.data);
            } else {
                setProfile(null); 
            }
            
        } catch (error) {
            console.error("Error fetching profile:", error);
            setProfile(null); 
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
            
            {/* profile එකක් නැත්නම් හෝ Edit Mode එක True නම් Form එක පෙන්වනවා */}
            {!profile || isEditing ? (
                <ProfileForm 
                    userId={profile?.userId || 3} 
                    existingProfile={profile} 
                    onSave={() => {
                        setIsEditing(false); // Save වුණාම View Mode එකට යනවා
                        fetchProfileData(); 
                    }}
                    onCancel={profile ? () => setIsEditing(false) : null} 
                />
            ) : (
                /* Profile View Area */
                <div className="profile-view-card" style={{ background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '15px', marginBottom: '15px' }}>
                        <h2 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>{profile?.firstName} {profile?.lastName}</h2>
                        <p style={{ margin: 0, color: '#2563eb', fontWeight: '600' }}>{profile?.headline}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', color: '#4b5563' }}>
                        <p><strong>📍 Location:</strong> {profile?.location}</p>
                        <p><strong>📞 Phone:</strong> {profile?.phoneNumber}</p>
                        <p><strong>💼 Experience:</strong> {profile?.yearsOfExperience} Years</p>
                        <p><strong>🌐 Work Mode:</strong> {profile?.preferredWorkMode}</p>
                        <p><strong>🌍 Nationality:</strong> {profile?.nationality}</p>
                        <p><strong>🗣️ Languages:</strong> {profile?.languages}</p>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>📝 Summary</h4>
                        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', margin: 0 }}>{profile?.summary}</p>
                    </div>

                    <button 
                        onClick={() => setIsEditing(true)} 
                        style={{ 
                            marginTop: '25px', 
                            padding: '10px 20px', 
                            backgroundColor: '#2563eb', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        ✏️ Edit Profile Details
                    </button>
                </div>
            )}
        </div>
    );
}

export default Profile;