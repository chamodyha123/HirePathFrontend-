import React, { useState, useEffect } from 'react';
import candidateService, { toPublicFileUrl } from '../../api/candidateService';

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

  const loadProfileSubSections = async () => {
    try {
      const data = await candidateService.getProfile();
      if (data) {
        setSkillsList(data.skills || []);
        setResumesList(data.resumes || []);
        setExperienceList(data.experiences || []);
        setEducationList(data.educations || []);
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

      setSkillsList(existingProfile.skills || []);
      setResumesList(existingProfile.resumes || []);
      setExperienceList(existingProfile.experiences || []);
      setEducationList(existingProfile.educations || []);
    }
  }, [existingProfile]);


  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired! Please log in again.");
        return;
      }

      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        headline: formData.headline || "",
        summary: formData.summary || "",
        location: formData.location || "",
        phoneNumber: formData.phoneNumber || "",
        linkedInUrl: formData.linkedInUrl || "",
        portfolioUrl: formData.portfolioUrl || "",
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        dateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00` : null,
        gender: formData.gender, 
        nationality: formData.nationality,
        maritalStatus: formData.maritalStatus,
        preferredWorkMode: formData.preferredWorkMode, 
        gitHubUrl: formData.gitHubUrl || "",
        languages: formData.languages || "English"
      };

      if (existingProfile) {
        await candidateService.updateProfile(profileData);
        alert("🎉 Profile updated successfully!");
      } else {
        await candidateService.createProfile(profileData);
        alert("🎉 Profile created successfully!");
      }
      onSave(); 
    } catch (err) {
      console.error("❌ BACKEND ERROR:", err.response?.data || err.message);
      alert("Failed to save profile.");
    }
  };

  // Skills Handlers
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

  // Resume Handlers
  const handleUploadResume = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    try {
      await candidateService.uploadResume(file, isPrimary);
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

  // Experience Handlers
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
      await candidateService.addExperience(payload);
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
      await candidateService.deleteExperience(id);
      loadProfileSubSections();
    } catch (err) {
      console.error(err);
      alert("Error deleting experience");
    }
  };

  // Education Handlers
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
      await candidateService.addEducation(payload);
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
      await candidateService.deleteEducation(id);
      loadProfileSubSections();
    } catch (err) {
      console.error(err);
      alert("Error deleting education");
    }
  };

  return (
    <div className="profile-form-container-wide">
      
      {/* 1. Main Profile Info Form */}
      <form onSubmit={handleProfileSubmit} className="profile-form-card">
        <div className="form-header-action">
          <h3>{existingProfile ? "✏️ Edit Profile Details" : "🆕 Create Your Profile"}</h3>
          <div className="action-button-group">
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn-action-secondary">Cancel</button>
            )}
            <button type="submit" className="btn-action-primary">💾 Save Profile Info</button>
          </div>
        </div>
        
        {/* 💡 පැහැදිලි Labels එක් කරන ලදී */}
        <div className="form-grid-2">
          <label className="form-label-container">
            <span>First Name <span className="required-star">*</span></span>
            <input type="text" placeholder="Enter first name" required value={formData.firstName} className="form-input" onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
          </label>
          <label className="form-label-container">
            <span>Last Name <span className="required-star">*</span></span>
            <input type="text" placeholder="Enter last name" required value={formData.lastName} className="form-input" onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
          </label>
        </div>

        <label className="form-label-container">
          <span>Professional Headline</span>
          <input type="text" placeholder="e.g. Full Stack Developer | React & Spring Boot Undergraduate" value={formData.headline} className="form-input" onChange={(e) => setFormData({...formData, headline: e.target.value})} />
        </label>

        <label className="form-label-container">
          <span>Professional Summary</span>
          <textarea placeholder="Write a brief overview about your career, goals, and core technical skills..." rows="4" value={formData.summary} className="form-textarea" onChange={(e) => setFormData({...formData, summary: e.target.value})} />
        </label>

        <div className="form-grid-2">
          <label className="form-label-container">
            <span>Location</span>
            <input type="text" placeholder="e.g. Nittambuwa, Sri Lanka" value={formData.location} className="form-input" onChange={(e) => setFormData({...formData, location: e.target.value})} />
          </label>
          <label className="form-label-container">
            <span>Phone Number</span>
            <input type="text" placeholder="e.g. +947XXXXXXXX" value={formData.phoneNumber} className="form-input" onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
          </label>
        </div>

        <div className="form-grid-2">
          <label className="form-label-container">
            <span>Date of Birth</span>
            <input type="date" value={formData.dateOfBirth} className="form-input" onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
          </label>
          <label className="form-label-container">
            <span>Gender</span>
            <select value={formData.gender} className="form-input" onChange={(e) => setFormData({...formData, gender: e.target.value})}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        <div className="form-grid-2">
          <label className="form-label-container">
            <span>Nationality</span>
            <input type="text" placeholder="e.g. Sri Lankan" value={formData.nationality} className="form-input" onChange={(e) => setFormData({...formData, nationality: e.target.value})} />
          </label>
          <label className="form-label-container">
            <span>Marital Status</span>
            <select value={formData.maritalStatus} className="form-input" onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          </label>
        </div>

        <div className="form-grid-2">
          <label className="form-label-container">
            <span>Preferred Work Mode</span>
            <select value={formData.preferredWorkMode} className="form-input" onChange={(e) => setFormData({...formData, preferredWorkMode: e.target.value})}>
              <option value="Remote">Remote</option>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </label>
          <label className="form-label-container">
            <span>Languages</span>
            <input type="text" placeholder="e.g. English, Sinhala" value={formData.languages} className="form-input" onChange={(e) => setFormData({...formData, languages: e.target.value})} />
          </label>
        </div>

        <div className="form-grid-3">
          <label className="form-label-container">
            <span>LinkedIn Profile URL</span>
            <input type="url" placeholder="https://linkedin.com/in/username" value={formData.linkedInUrl} className="form-input" onChange={(e) => setFormData({...formData, linkedInUrl: e.target.value})} />
          </label>
          <label className="form-label-container">
            <span>GitHub Profile URL</span>
            <input type="url" placeholder="https://github.com/username" value={formData.gitHubUrl} className="form-input" onChange={(e) => setFormData({...formData, gitHubUrl: e.target.value})} />
          </label>
          <label className="form-label-container">
            <span>Portfolio Website URL</span>
            <input type="url" placeholder="https://username.github.io" value={formData.portfolioUrl} className="form-input" onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})} />
          </label>
        </div>

        <div style={{ marginTop: '5px' }}>
          <label className="form-label-inline">
            <span>Years of Experience:</span>
            <input type="number" min="0" value={formData.yearsOfExperience} className="form-input-number" onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})} />
          </label>
        </div>
      </form>

      {/* Sub Sections */}
      {existingProfile && (
        <>
          {/* 2. Skills Section */}
          <div className="profile-form-card">
            <h3>⚡ Manage Skills</h3>
            <div className="sub-form-row-grid">
              <label className="form-label-container">
                <span>Skill Name</span>
                <input type="text" placeholder="e.g. Java, React, Spring Boot" required value={skill.skillName} className="form-input" onChange={(e) => setSkill({...skill, skillName: e.target.value})} />
              </label>
              <label className="form-label-container">
                <span>Skill Level</span>
                <select value={skill.skillLevel} className="form-input" onChange={(e) => setSkill({...skill, skillLevel: e.target.value})}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </label>
              <button type="button" onClick={handleAddSkill} className="btn-action-primary align-self-end">Add Skill</button>
            </div>
            <ul className="section-list">
              {skillsList.map(item => (
                <li key={item.id} className="section-item">
                  <div><strong>{item.skillName}</strong> <span className="badge-level">{item.skillLevel}</span></div>
                  <button type="button" onClick={() => handleDeleteSkill(item.id)} className="btn-delete-icon">❌ Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Resume Section */}
          <div className="profile-form-card">
            <h3>📄 Manage Resumes</h3>
            <div className="resume-upload-box">
              <label className="form-label-container">
                <span>Select Resume File (PDF, DOCX)</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} className="file-picker" />
              </label>
              <label className="checkbox-container">
                <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
                <span>Set as Primary Resume</span>
              </label>
              <button type="button" onClick={handleUploadResume} className="btn-action-primary" style={{ width: 'fit-content' }}>Upload Resume</button>
            </div>
            <ul className="section-list">
              {resumesList.map(item => (
                <li key={item.id} className="section-item">
                  <a href={toPublicFileUrl(item.filePath)} target="_blank" rel="noreferrer" className="resume-link">
                    📁 {item.fileName} {item.isPrimary && <span className="badge-primary">(Primary)</span>}
                  </a>
                  <button type="button" onClick={() => handleDeleteResume(item.id)} className="btn-delete-icon">❌ Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Experience Section */}
          <form onSubmit={handleAddExperience} className="profile-form-card">
            <h3>💼 Add Professional Experience</h3>
            <div className="form-grid-2">
              <label className="form-label-container">
                <span>Company Name <span className="required-star">*</span></span>
                <input type="text" placeholder="e.g. DAMRO Group" required value={exp.companyName} className="form-input" onChange={e => setExp({...exp, companyName: e.target.value})} />
              </label>
              <label className="form-label-container">
                <span>Job Title <span className="required-star">*</span></span>
                <input type="text" placeholder="e.g. Payroll Clerk / Frontend Developer" required value={exp.jobTitle} className="form-input" onChange={e => setExp({...exp, jobTitle: e.target.value})} />
              </label>
            </div>
            
            <div className="form-grid-2">
              <label className="form-label-container">
                <span>Employment Type</span>
                <select value={exp.employmentType} className="form-input" onChange={e => setExp({...exp, employmentType: e.target.value})}>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
              </label>
              <label className="form-label-container">
                <span>Location</span>
                <input type="text" placeholder="e.g. Colombo, Sri Lanka / Remote" value={exp.location} className="form-input" onChange={e => setExp({...exp, location: e.target.value})} />
              </label>
            </div>
            
            <div className="form-grid-2">
              <label className="form-label-container">
                <span>Start Date</span>
                <input type="date" value={exp.startDate} className="form-input" onChange={e => setExp({...exp, startDate: e.target.value})} />
              </label>
              <label className="form-label-container">
                <span>End Date</span>
                <input type="date" value={exp.endDate} disabled={exp.isCurrent} className="form-input" onChange={e => setExp({...exp, endDate: e.target.value})} />
              </label>
            </div>
            
            <div style={{ margin: '5px 0' }}>
              <label className="checkbox-container">
                <input type="checkbox" checked={exp.isCurrent} onChange={e => setExp({...exp, isCurrent: e.target.checked, endDate: e.target.checked ? '' : exp.endDate})} />
                <span>Currently Working Here</span>
              </label>
            </div>

            <label className="form-label-container">
              <span>Job Description</span>
              <textarea placeholder="Describe your responsibilities, key tasks, and technologies used..." rows="3" value={exp.description} className="form-textarea" onChange={e => setExp({...exp, description: e.target.value})} />
            </label>
            
            <button type="submit" className="btn-action-primary" style={{ marginTop: '5px' }}>Add Experience</button>

            <ul className="section-list" style={{ marginTop: '20px' }}>
              {experienceList.map(item => (
                <li key={item.id} className="section-item">
                  <div><strong>{item.jobTitle}</strong> at {item.companyName} <span className="text-muted">({item.employmentType})</span></div>
                  <button type="button" onClick={() => handleDeleteExperience(item.id)} className="btn-delete-icon">❌ Delete</button>
                </li>
              ))}
            </ul>
          </form>

          {/* 5. Education Section */}
          <form onSubmit={handleAddEducation} className="profile-form-card">
            <h3>🎓 Add Education</h3>
            <div className="form-grid-2">
              <label className="form-label-container">
                <span>Institute / University <span className="required-star">*</span></span>
                <input type="text" placeholder="e.g. NSBM Green University" required value={edu.institute} className="form-input" onChange={e => setEdu({...edu, institute: e.target.value})} />
              </label>
              <label className="form-label-container">
                <span>Qualification <span className="required-star">*</span></span>
                <input type="text" placeholder="e.g. BSc in Software Engineering" required value={edu.qualification} className="form-input" onChange={e => setEdu({...edu, qualification: e.target.value})} />
              </label>
            </div>
            
            <div className="form-grid-2">
              <label className="form-label-container">
                <span>Field of Study</span>
                <input type="text" placeholder="e.g. Information Technology" value={edu.fieldOfStudy} className="form-input" onChange={e => setEdu({...edu, fieldOfStudy: e.target.value})} />
              </label>
              <label className="form-label-container">
                <span>Grade / GPA</span>
                <input type="text" placeholder="e.g. 3.8 / First Class" value={edu.grade} className="form-input" onChange={e => setEdu({...edu, grade: e.target.value})} />
              </label>
            </div>
            
            <div className="form-grid-2">
              <label className="form-label-container">
                <span>Start Date</span>
                <input type="date" value={edu.startDate} className="form-input" onChange={e => setEdu({...edu, startDate: e.target.value})} /></label>
              <label className="form-label-container">
                <span>End Date</span>
                <input type="date" value={edu.endDate} disabled={edu.isCurrent} className="form-input" onChange={e => setEdu({...edu, endDate: e.target.value})} /></label>
            </div>
            
            <div style={{ margin: '5px 0' }}>
              <label className="checkbox-container">
                <input type="checkbox" checked={edu.isCurrent} onChange={e => setEdu({...edu, isCurrent: e.target.checked, endDate: e.target.checked ? '' : edu.endDate})} />
                <span>Currently Studying Here</span>
              </label>
            </div>

            <button type="submit" className="btn-action-primary" style={{ marginTop: '5px' }}>Add Education</button>

            <ul className="section-list" style={{ marginTop: '20px' }}>
              {educationList.map(item => (
                <li key={item.id} className="section-item">
                  <div><strong>{item.qualification}</strong> at {item.institute}</div>
                  <button type="button" onClick={() => handleDeleteEducation(item.id)} className="btn-delete-icon">❌ Delete</button>
                </li>
              ))}
            </ul>
          </form>
        </>
      )}
    </div>
  );
};