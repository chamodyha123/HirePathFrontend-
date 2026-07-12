import React, { useState, useEffect } from 'react';
import { candidateService } from '../../api/candidateService';

// 💡 Named Export ලෙස වෙනස් කරන ලදී
export const ProfileForm = ({ existingProfile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    summary: '',
    location: '',
    phoneNumber: '',
    linkedInUrl: '',
    portfolioUrl: '',
    yearsOfExperience: 0
  });

  useEffect(() => {
    if (existingProfile) {
      setFormData(existingProfile);
    }
  }, [existingProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (existingProfile) {
        await candidateService.updateProfile(formData);
        alert("Profile updated successfully!");
      } else {
        await candidateService.createProfile(formData);
        alert("Profile created successfully!");
      }
      onSave(); 
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please check your data.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px' }}>
      <h3 style={{ color: '#1e293b' }}>{existingProfile ? "✏️ Edit Profile Details" : "🆕 Create Your Profile"}</h3>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="text" placeholder="First Name" required value={formData.firstName} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
        <input type="text" placeholder="Last Name" required value={formData.lastName} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
      </div>

      <input type="text" placeholder="Professional Headline (e.g., Full Stack Developer)" value={formData.headline} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        onChange={(e) => setFormData({...formData, headline: e.target.value})} />

      <textarea placeholder="Professional Summary" rows="4" value={formData.summary} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        onChange={(e) => setFormData({...formData, summary: e.target.value})} />

      <input type="text" placeholder="Location (e.g., Colombo, Sri Lanka)" value={formData.location} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        onChange={(e) => setFormData({...formData, location: e.target.value})} />

      <input type="text" placeholder="Phone Number" value={formData.phoneNumber} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />

      <input type="url" placeholder="LinkedIn URL" value={formData.linkedInUrl} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        onChange={(e) => setFormData({...formData, linkedInUrl: e.target.value})} />

      <input type="url" placeholder="Portfolio URL" value={formData.portfolioUrl} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})} />

      <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}>
        Years of Experience:
        <input type="number" min="0" value={formData.yearsOfExperience} style={{ padding: '8px', marginLeft: '10px', width: '80px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})} />
      </label>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Save Profile
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#cbd5e1', color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};