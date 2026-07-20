import React, { useState, useEffect } from 'react';
import candidateService from '../../api/candidateService';
import './Profile.css';

function ExperienceSection() {
  const [experienceList, setExperienceList] = useState([]);
  const [exp, setExp] = useState({ 
    companyName: '', 
    jobTitle: '', 
    location: '', 
    description: '', 
    startDate: '', 
    endDate: '', 
    isCurrent: false, 
    employmentType: 'Full-Time' 
  });

  const loadExperience = () => {
    candidateService.getProfile().then(res => setExperienceList(res.experiences || []));
  };

  useEffect(() => { 
    loadExperience(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 💡 Fix: UI එකේ 'Full-Time' -> Backend Enum එකට ගැලපෙන්න 'FullTime' විදිහට ඉර අයින් කිරීම
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
      
      // Form එක Reset කිරීම
      setExp({ 
        companyName: '', 
        jobTitle: '', 
        location: '', 
        description: '', 
        startDate: '', 
        endDate: '', 
        isCurrent: false, 
        employmentType: 'Full-Time' 
      });
      
      loadExperience(); 
      alert("Experience added successfully!");
    } catch (err) { 
      console.error("Full Error:", err.response?.data);
      alert("Error adding experience"); 
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="profile-form" style={{ maxWidth: '500px' }}>
        <h3>💼 Add Experience</h3>
        
        <input 
          type="text" 
          placeholder="Company" 
          required 
          value={exp.companyName} 
          className="form-input" 
          onChange={e => setExp({...exp, companyName: e.target.value})} 
        />
        
        <input 
          type="text" 
          placeholder="Job Title" 
          required 
          value={exp.jobTitle} 
          className="form-input" 
          onChange={e => setExp({...exp, jobTitle: e.target.value})} 
        />
        
        <select 
          value={exp.employmentType} 
          className="form-select" 
          onChange={e => setExp({...exp, employmentType: e.target.value})}
        >
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
        </select>
        
        <div className="form-row">
          <label style={{ flex: 1 }}>
            Start: 
            <input 
              type="date" 
              value={exp.startDate} 
              className="form-input" 
              onChange={e => setExp({...exp, startDate: e.target.value})} 
            />
          </label>
          <label style={{ flex: 1 }}>
            End: 
            <input 
              type="date" 
              value={exp.endDate} 
              disabled={exp.isCurrent} 
              className="form-input" 
              onChange={e => setExp({...exp, endDate: e.target.value})} 
            />
          </label>
        </div>
        
        <label>
          <input 
            type="checkbox" 
            checked={exp.isCurrent} 
            onChange={e => setExp({...exp, isCurrent: e.target.checked, endDate: e.target.checked ? '' : exp.endDate})} 
          /> Currently Working Here
        </label>
        
        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Add Experience</button>
      </form>
      
      <ul className="section-list">
        {experienceList.map(item => (
          <li key={item.id} className="section-item">
            <div>
              <strong>{item.jobTitle}</strong> at {item.companyName} 
              <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '5px' }}>
                ({item.employmentType})
              </span>
            </div>
            <button 
              onClick={() => candidateService.deleteExperience(item.id).then(loadExperience)} 
              className="btn-delete"
            >
              ❌ Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExperienceSection;