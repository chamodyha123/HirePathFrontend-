import React, { useState, useEffect } from 'react';
import axios from 'axios';
import candidateService from '../../api/candidateService';
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

  // Sub-sections සඳහා Lists සහ Form States
  const [skillsList, setSkillsList] = useState([]);
  const [skill, setSkill] = useState({ skillName: '', skillLevel: 'Beginner' });

  const [resumesList, setResumesList] = useState([]);
  const [file, setFile] = useState(null);
  const [isPrimary, setIsPrimary] = useState(false);

  const [experienceList, setExperienceList] = useState([]);
  const [exp, setExp] = useState({ 
    companyName: '', jobTitle: '', location: '', description: '', 
    startDate: '', endDate: '', isCurrent: false, employmentType: 'Full-Time' 
  });

  const [educationList, setEducationList] = useState([]);
  const [edu, setEdu] = useState({ 
    institute: '', qualification: '', fieldOfStudy: '', 
    startDate: '', endDate: '', isCurrent: false, grade: '' 
  });

  // පොදුවේ Profile දත්ත සහ Sub-sections Refresh කරන ශ්‍රිතය
  const loadProfileSubSections = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get('http://localhost:5139/api/Candidate', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data) {
        setSkillsList(res.data.skills || []);
        setResumesList(res.data.resumes || []);
        setExperienceList(res.data.experiences || []);
        setEducationList(res.data.educations || []);
      }
    } catch (err) {
      console.error("Error loading profile sub-sections:", err);
    }
  };

  useEffect(() => {
    if (existingProfile) {
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

      // දැනට පවතින Profile එකේ Lists ටික State එකට එකතු කිරීම
      setSkillsList(existingProfile.skills || []);
      setResumesList(existingProfile.resumes || []);
      setExperienceList(existingProfile.experiences || []);
      setEducationList(existingProfile.educations || []);
    }
  }, [existingProfile]);

  // Axios Config Generator
  const getAxiosConfig = (contentType = 'application/json') => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': contentType,
        'accept': '*/*'
      }
    };
  };

  // Main Profile Submit
  const handleProfileSubmit = async (e) => {
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

      if (existingProfile) {
        await axios.put('http://localhost:5139/api/Candidate', profileData, getAxiosConfig());
        alert("🎉 Profile updated successfully!");
      } else {
        await axios.post('http://localhost:5139/api/Candidate', profileData, getAxiosConfig());
        alert("🎉 Profile created successfully!");
      }
      
      onSave(); 
    } catch (err) {
      console.error("❌ BACKEND ERROR:", err.response?.data || err.message);
      alert("Failed to save profile.");
    }
  };

  // ⚡ Skills Handlers (candidateService හරහා - backend route එකට match වෙන විදිහට)
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skill.skillName.trim()) return;
    try {
      await candidateService.addSkill(skill);
      setSkill({ skillName: '', skillLevel: 'Beginner' });
      loadProfileSubSections();
    } catch (err) {
      console.error(err);
      alert("Error adding skill");
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await candidateService.deleteSkill(id);
      loadProfileSubSections();
    } catch (err) {
      console.error(err);
      alert("Error deleting skill");
    }
  };

  // 📄 Resume Handlers (candidateService හරහා - backend route එකට match වෙන විදිහට)
  const handleUploadResume = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    try {
      const currentUserId = existingProfile ? existingProfile.userId : Number(userId || 3);
      await candidateService.uploadResume(file, isPrimary, currentUserId);

      setFile(null);
      setIsPrimary(false);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      loadProfileSubSections();
      alert("Resume uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  const handleDeleteResume = async (id) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        await candidateService.deleteResume(id);
        loadProfileSubSections();
      } catch (err) {
        console.error(err);
        alert("Error deleting resume");
      }
    }
  };

  // 💼 Experience Handlers
  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      const cleanEmploymentType = exp.employmentType.replace('-', ''); 
      const payload = { 
        companyName: exp.companyName,
        jobTitle: exp.jobTitle,
        employmentType: cleanEmploymentType, 
        isCurrent: exp.isCurrent,
        location: exp.location || "", 
        description: exp.description || "", 
        startDate: exp.startDate ? new Date(exp.startDate).toISOString() : new Date().toISOString(), 
        endDate: exp.endDate && !exp.isCurrent ? new Date(exp.endDate).toISOString() : null 
      };
      
      await axios.post('http://localhost:5139/api/Candidate/experience', payload, getAxiosConfig());
      setExp({ companyName: '', jobTitle: '', location: '', description: '', startDate: '', endDate: '', isCurrent: false, employmentType: 'Full-Time' });
      loadProfileSubSections();
      alert("Experience added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding experience");
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await axios.delete(`http://localhost:5139/api/Candidate/experience/${id}`, getAxiosConfig());
      loadProfileSubSections();
    } catch (err) {
      console.error(err);
      alert("Error deleting experience");
    }
  };

  // 🎓 Education Handlers
  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        institute: edu.institute,
        qualification: edu.qualification,
        fieldOfStudy: edu.fieldOfStudy || "",
        startDate: edu.startDate ? new Date(edu.startDate).toISOString() : new Date().toISOString(),
        endDate: edu.endDate && !edu.isCurrent ? new Date(edu.endDate).toISOString() : null,
        isCurrent: edu.isCurrent,
        grade: edu.grade || "",
        description: "", certificateUrl: "", city: "", country: "", educationLevel: "", gpa: 0, percentage: 0
      };

      await axios.post('http://localhost:5139/api/Candidate/education', payload, getAxiosConfig());
      setEdu({ institute: '', qualification: '', fieldOfStudy: '', startDate: '', endDate: '', isCurrent: false, grade: '' });
      loadProfileSubSections();
      alert("Education added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add education.");
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await axios.delete(`http://localhost:5139/api/Candidate/education/${id}`, getAxiosConfig());
      loadProfileSubSections();
    } catch (err) {
      console.error(err);
      alert("Error deleting education");
    }
  };

  return (
    <div className="profile-form-container" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* 1. Main Profile Info Form */}
      <form onSubmit={handleProfileSubmit} className="profile-form">
        <h3>{existingProfile ? "✏️ Edit Profile Details" : "🆕 Create Your Profile"}</h3>
        
        <div className="form-row">
          <input type="text" placeholder="First Name" required value={formData.firstName} className="form-input" onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
          <input type="text" placeholder="Last Name" required value={formData.lastName} className="form-input" onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
        </div>

        <input type="text" placeholder="Professional Headline" value={formData.headline} className="form-input" onChange={(e) => setFormData({...formData, headline: e.target.value})} />
        <textarea placeholder="Professional Summary" rows="4" value={formData.summary} className="form-textarea" onChange={(e) => setFormData({...formData, summary: e.target.value})} />

        <div className="form-row">
          <input type="text" placeholder="Location" value={formData.location} className="form-input" onChange={(e) => setFormData({...formData, location: e.target.value})} />
          <input type="text" placeholder="Phone Number" value={formData.phoneNumber} className="form-input" onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
        </div>

        <div className="form-row">
          <label className="form-label">Date of Birth:
            <input type="date" value={formData.dateOfBirth} className="form-input" onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
          </label>
          <label className="form-label">Gender:
            <select value={formData.gender} className="form-input" onChange={(e) => setFormData({...formData, gender: e.target.value})}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <input type="text" placeholder="Nationality" value={formData.nationality} className="form-input" onChange={(e) => setFormData({...formData, nationality: e.target.value})} />
          <label className="form-label">Marital Status:
            <select value={formData.maritalStatus} className="form-input" onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label className="form-label">Preferred Work Mode:
            <select value={formData.preferredWorkMode} className="form-input" onChange={(e) => setFormData({...formData, preferredWorkMode: e.target.value})}>
              <option value="Remote">Remote</option>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </label>
          <input type="text" placeholder="Languages" value={formData.languages} className="form-input" onChange={(e) => setFormData({...formData, languages: e.target.value})} />
        </div>

        <input type="url" placeholder="LinkedIn URL" value={formData.linkedInUrl} className="form-input" onChange={(e) => setFormData({...formData, linkedInUrl: e.target.value})} />
        <input type="url" placeholder="GitHub URL" value={formData.gitHubUrl} className="form-input" onChange={(e) => setFormData({...formData, gitHubUrl: e.target.value})} />
        <input type="url" placeholder="Portfolio URL" value={formData.portfolioUrl} className="form-input" onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})} />

        <label className="form-label">Years of Experience:
          <input type="number" min="0" value={formData.yearsOfExperience} style={{ width: '80px', marginLeft: '10px' }} className="form-input" onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})} />
        </label>

        <div className="form-row" style={{ marginTop: '20px' }}>
          <button type="submit" className="btn-primary">Save Profile Info</button>
          {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      {/* 💡 Sub Sections කළමනාකරණය කළ හැක්කේ Profile එකක් පවතින විට පමණි */}
      {existingProfile && (
        <>
          {/* 2. Skills Section */}
          <div className="profile-form">
            <h3>⚡ Manage Skills</h3>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input type="text" placeholder="Skill Name" required value={skill.skillName} className="form-input" onChange={(e) => setSkill({...skill, skillName: e.target.value})} />
              <select value={skill.skillLevel} className="form-input" style={{ width: '150px' }} onChange={(e) => setSkill({...skill, skillLevel: e.target.value})}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Add Skill</button>
            </form>
            <ul className="section-list">
              {skillsList.map(item => (
                <li key={item.id} className="section-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <div><strong>{item.skillName}</strong> ({item.skillLevel})</div>
                  <button type="button" onClick={() => handleDeleteSkill(item.id)} className="btn-delete">❌ Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Resume Section */}
          <div className="profile-form">
            <h3>📄 Manage Resumes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '15px 0' }}>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
              <label><input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} /> Primary Resume</label>
              <button type="button" onClick={handleUploadResume} className="btn-primary" style={{ width: 'fit-content' }}>Upload Resume</button>
            </div>
            <ul className="section-list">
              {resumesList.map(item => (
                <li key={item.id} className="section-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <a href={`http://localhost:5139${item.filePath}`} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>
                    {item.fileName} {item.isPrimary && <strong style={{ color: '#10b981' }}>(Primary)</strong>}
                  </a>
                  <button type="button" onClick={() => handleDeleteResume(item.id)} className="btn-delete">❌ Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Experience Section */}
          <form onSubmit={handleAddExperience} className="profile-form">
            <h3>💼 Add Experience</h3>
            <input type="text" placeholder="Company" required value={exp.companyName} className="form-input" onChange={e => setExp({...exp, companyName: e.target.value})} />
            <input type="text" placeholder="Job Title" required value={exp.jobTitle} className="form-input" onChange={e => setExp({...exp, jobTitle: e.target.value})} />
            
            <select value={exp.employmentType} className="form-input" onChange={e => setExp({...exp, employmentType: e.target.value})}>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
            </select>
            
            <div className="form-row">
              <label style={{ flex: 1 }}>Start: <input type="date" value={exp.startDate} className="form-input" onChange={e => setExp({...exp, startDate: e.target.value})} /></label>
              <label style={{ flex: 1 }}>End: <input type="date" value={exp.endDate} disabled={exp.isCurrent} className="form-input" onChange={e => setExp({...exp, endDate: e.target.value})} /></label>
            </div>
            
            <label><input type="checkbox" checked={exp.isCurrent} onChange={e => setExp({...exp, isCurrent: e.target.checked, endDate: e.target.checked ? '' : exp.endDate})} /> Currently Working Here</label>
            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Add Experience</button>

            <ul className="section-list" style={{ marginTop: '15px' }}>
              {experienceList.map(item => (
                <li key={item.id} className="section-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <div><strong>{item.jobTitle}</strong> at {item.companyName} <span style={{ fontSize: '0.85em', color: '#666' }}>({item.employmentType})</span></div>
                  <button type="button" onClick={() => handleDeleteExperience(item.id)} className="btn-delete">❌ Delete</button>
                </li>
              ))}
            </ul>
          </form>

          {/* 5. Education Section */}
          <form onSubmit={handleAddEducation} className="profile-form">
            <h3>🎓 Add Education</h3>
            <input type="text" placeholder="Institute / University" required value={edu.institute} className="form-input" onChange={e => setEdu({...edu, institute: e.target.value})} />
            <input type="text" placeholder="Qualification (e.g., B.Sc.)" required value={edu.qualification} className="form-input" onChange={e => setEdu({...edu, qualification: e.target.value})} />
            <input type="text" placeholder="Field of Study" value={edu.fieldOfStudy} className="form-input" onChange={e => setEdu({...edu, fieldOfStudy: e.target.value})} />
            <input type="text" placeholder="Grade / GPA (Optional)" value={edu.grade} className="form-input" onChange={e => setEdu({...edu, grade: e.target.value})} />
            
            <div className="form-row">
              <label style={{ flex: 1 }}>Start: <input type="date" value={edu.startDate} className="form-input" onChange={e => setEdu({...edu, startDate: e.target.value})} /></label>
              <label style={{ flex: 1 }}>End: <input type="date" value={edu.endDate} disabled={edu.isCurrent} className="form-input" onChange={e => setEdu({...edu, endDate: e.target.value})} /></label>
            </div>
            <label><input type="checkbox" checked={edu.isCurrent} onChange={e => setEdu({...edu, isCurrent: e.target.checked, endDate: e.target.checked ? '' : edu.endDate})} /> Currently Studying Here</label>
            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Add Education</button>

            <ul className="section-list" style={{ marginTop: '15px' }}>
              {educationList.map(item => (
                <li key={item.id} className="section-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <div><strong>{item.qualification}</strong> at {item.institute}</div>
                  <button type="button" onClick={() => handleDeleteEducation(item.id)} className="btn-delete">❌ Delete</button>
                </li>
              ))}
            </ul>
          </form>
        </>
      )}
    </div>
  );
};