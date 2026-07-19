import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

export const ProfileForm = ({ userId, existingProfile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    headline: '', 
    summary: '',
    location: '', 
    phoneNumber: '', 
    linkedInUrl: '', 
    portfolioUrl: '', 
    yearsOfExperience: 0,
    dateOfBirth: '',
    gender: 'Male',
    nationality: 'Sri Lankan',
    maritalStatus: 'Single',
    preferredWorkMode: 'Remote',
    gitHubUrl: '',
    languages: 'English'
  });

  useEffect(() => {
    if (existingProfile) {
      // 💡 Safe Date Formatting
      let formattedDate = '';
      if (existingProfile.dateOfBirth) {
         formattedDate = String(existingProfile.dateOfBirth).split('T')[0];
      }

      setFormData({
        firstName: existingProfile.firstName || '',
        lastName: existingProfile.lastName || '',
        headline: existingProfile.headline || '',
        summary: existingProfile.summary || '',
        location: existingProfile.location || '',
        phoneNumber: existingProfile.phoneNumber || '',
        linkedInUrl: existingProfile.linkedInUrl || '',
        portfolioUrl: existingProfile.portfolioUrl || '',
        yearsOfExperience: existingProfile.yearsOfExperience || 0,
        dateOfBirth: formattedDate,
        gender: existingProfile.gender || 'Male',
        nationality: existingProfile.nationality || 'Sri Lankan',
        maritalStatus: existingProfile.maritalStatus || 'Single',
        preferredWorkMode: existingProfile.preferredWorkMode || 'Remote',
        gitHubUrl: existingProfile.gitHubUrl || '',
        languages: existingProfile.languages || 'English'
      });
    }
  }, [existingProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired! Please log in again.");
        return;
      }

      const profileData = {
        id: existingProfile ? existingProfile.id : 0, 
        userId: existingProfile ? existingProfile.userId : Number(userId || 3),
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        headline: formData.headline || "",
        summary: formData.summary || "",
        location: formData.location || "",
        phoneNumber: formData.phoneNumber || "",
        linkedInUrl: formData.linkedInUrl || "",
        portfolioUrl: formData.portfolioUrl || "",
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        dateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00` : new Date().toISOString(),
        gender: formData.gender, 
        nationality: formData.nationality,
        maritalStatus: formData.maritalStatus,
        preferredWorkMode: formData.preferredWorkMode, 
        gitHubUrl: formData.gitHubUrl || "",
        languages: formData.languages || "English"
      };

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      };

      if (existingProfile) {
        await axios.put('http://localhost:5139/api/Candidate', profileData, config);
        alert("🎉 Profile updated successfully!");
      } else {
        await axios.post('http://localhost:5139/api/Candidate', profileData, config);
        alert("🎉 Profile created successfully!");
      }
      
      onSave(); 
    } catch (err) {
      console.error("❌ BACKEND ERROR:", err.response?.data || err.message);
      alert("Failed to save profile. Check console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h3>{existingProfile ? "✏️ Edit Profile Details" : "🆕 Create Your Profile"}</h3>
      
      <div className="form-row">
        <input 
          type="text" 
          placeholder="First Name" 
          required 
          value={formData.firstName} 
          className="form-input" 
          onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
        />
        <input 
          type="text" 
          placeholder="Last Name" 
          required 
          value={formData.lastName} 
          className="form-input" 
          onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
        />
      </div>

      <input 
        type="text" 
        placeholder="Professional Headline" 
        value={formData.headline} 
        className="form-input" 
        onChange={(e) => setFormData({...formData, headline: e.target.value})} 
      />
      <textarea 
        placeholder="Professional Summary" 
        rows="4" 
        value={formData.summary} 
        className="form-textarea" 
        onChange={(e) => setFormData({...formData, summary: e.target.value})} 
      />

      <div className="form-row">
        <input 
          type="text" 
          placeholder="Location" 
          value={formData.location} 
          className="form-input" 
          onChange={(e) => setFormData({...formData, location: e.target.value})} 
        />
        <input 
          type="text" 
          placeholder="Phone Number" 
          value={formData.phoneNumber} 
          className="form-input" 
          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
        />
      </div>

      <div className="form-row">
        <label className="form-label">
          Date of Birth:
          <input 
            type="date" 
            value={formData.dateOfBirth} 
            className="form-input" 
            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} 
          />
        </label>
        <label className="form-label">
          Gender:
          <select 
            value={formData.gender} 
            className="form-input" 
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <div className="form-row">
        <input 
          type="text" 
          placeholder="Nationality" 
          value={formData.nationality} 
          className="form-input" 
          onChange={(e) => setFormData({...formData, nationality: e.target.value})} 
        />
        <label className="form-label">
          Marital Status:
          <select 
            value={formData.maritalStatus} 
            className="form-input" 
            onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
          >
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>
        </label>
      </div>

      <div className="form-row">
        <label className="form-label">
          Preferred Work Mode:
          <select 
            value={formData.preferredWorkMode} 
            className="form-input" 
            onChange={(e) => setFormData({...formData, preferredWorkMode: e.target.value})}
          >
            <option value="Remote">Remote</option>
            <option value="Onsite">Onsite</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </label>
        <input 
          type="text" 
          placeholder="Languages" 
          value={formData.languages} 
          className="form-input" 
          onChange={(e) => setFormData({...formData, languages: e.target.value})} 
        />
      </div>

      <input 
        type="url" 
        placeholder="LinkedIn URL" 
        value={formData.linkedInUrl} 
        className="form-input" 
        onChange={(e) => setFormData({...formData, linkedInUrl: e.target.value})} 
      />
      <input 
        type="url" 
        placeholder="GitHub URL" 
        value={formData.gitHubUrl} 
        className="form-input" 
        onChange={(e) => setFormData({...formData, gitHubUrl: e.target.value})} 
      />
      <input 
        type="url" 
        placeholder="Portfolio URL" 
        value={formData.portfolioUrl} 
        className="form-input" 
        onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})} 
      />

      <label className="form-label">
        Years of Experience:
        <input 
          type="number" 
          min="0" 
          value={formData.yearsOfExperience} 
          style={{ width: '80px', marginLeft: '10px' }} 
          className="form-input" 
          onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})} 
        />
      </label>

      <div className="form-row" style={{ marginTop: '20px' }}>
        <button type="submit" className="btn-primary">Save Profile</button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
      </div>
    </form>
  );
};