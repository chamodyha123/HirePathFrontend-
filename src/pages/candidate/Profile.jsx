import React, { useState, useEffect } from 'react';
import { candidateService } from '../../api/candidateService';
import { ProfileForm } from './ProfileForm'; // 💡 Named Import එකක් ලෙස සඟල වරහන් ඇතුළත කැඳවා ඇත

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // 💡 Form එක පෙන්වනවාද නැද්ද යන්න තීරණය කරන State එක

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const res = await candidateService.getAllCandidates();
      // Backend එකෙන් Profile එකක් ආවොත් ඒක දානවා, නැත්නම් null
      if (res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  if (loading) return <p>Loading Profile Information...</p>;

  return (
    <div>
      {/* 💡 1. Edit Mode එක True නම් ProfileForm එක පෙන්වයි */}
      {isEditing ? (
        <ProfileForm 
          existingProfile={profile} 
          onSave={() => {
            setIsEditing(false);
            loadProfileData(); // Save වුණු පසු අලුත් දත්ත ලෝඩ් කරයි
          }}
          onCancel={() => setIsEditing(false)} // Cancel කළොත් Form එක වහයි
        />
      ) : (
        /* 💡 2. Edit Mode එක False නම් සාමාන්‍ය Profile දත්ත පෙන්වයි */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
            <h2 style={{ margin: 0, color: '#0f172a' }}>👤 My Profile View</h2>
            <button 
              onClick={() => setIsEditing(true)} 
              style={{ padding: '8px 16px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {profile ? "✏️ Edit Profile" : "🆕 Create Profile"}
            </button>
          </div>

          {profile ? (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', color: '#334155' }}>
              <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
              <p><strong>Headline:</strong> {profile.headline || 'Not provided'}</p>
              <p><strong>Summary:</strong> {profile.summary || 'Not provided'}</p>
              <p><strong>Location:</strong> {profile.location || 'Not provided'}</p>
              <p><strong>Phone:</strong> {profile.phoneNumber || 'Not provided'}</p>
              <p><strong>Experience:</strong> {profile.yearsOfExperience} Years</p>
              {profile.linkedInUrl && <p><strong>LinkedIn:</strong> <a href={profile.linkedInUrl} target="_blank" rel="noreferrer">{profile.linkedInUrl}</a></p>}
              {profile.portfolioUrl && <p><strong>Portfolio:</strong> <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">{profile.portfolioUrl}</a></p>}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed #cbd5e1', borderRadius: '8px', marginTop: '20px' }}>
              <p style={{ color: '#64748b' }}>You haven't created a professional profile yet.</p>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>Click the "Create Profile" button above to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;