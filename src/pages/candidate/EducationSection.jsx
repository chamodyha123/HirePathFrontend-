import React, { useState, useEffect } from 'react';
import candidateService from '../../api/candidateService';
import './Profile.css';

function EducationSection() {
  const [educationList, setEducationList] = useState([]);
  const [edu, setEdu] = useState({ institute: '', qualification: '', fieldOfStudy: '', startDate: '', endDate: '', isCurrent: false, grade: '' });

  const loadEducation = () => {
    candidateService.getProfile().then(res => setEducationList(res.educations || []));
  };

  useEffect(() => { 
    loadEducation(); 
  }, []);

  const handleSubmit = async (e) => {
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
        // 💡 Backend එකේ Model Validation එක Pass වෙන්න අවශ්‍ය අමතර Fields:
        description: "",
        certificateUrl: "",
        city: "",
        country: "",
        educationLevel: "",
        gpa: 0,
        percentage: 0
      };

      await candidateService.addEducation(payload);
      
      alert("Education added successfully!");
      setEdu({ institute: '', qualification: '', fieldOfStudy: '', startDate: '', endDate: '', isCurrent: false, grade: '' });
      loadEducation();
    } catch (err) { 
      console.error("Full Error:", err.response?.data);
      alert("Failed to add education."); 
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="profile-form" style={{ maxWidth: '500px' }}>
        <h3>🎓 Add Education</h3>
        <input type="text" placeholder="Institute / University" required value={edu.institute} className="form-input" onChange={e => setEdu({...edu, institute: e.target.value})} />
        <input type="text" placeholder="Qualification (e.g., B.Sc.)" required value={edu.qualification} className="form-input" onChange={e => setEdu({...edu, qualification: e.target.value})} />
        <input type="text" placeholder="Field of Study" value={edu.fieldOfStudy} className="form-input" onChange={e => setEdu({...edu, fieldOfStudy: e.target.value})} />
        <input type="text" placeholder="Grade / GPA (Optional)" value={edu.grade} className="form-input" onChange={e => setEdu({...edu, grade: e.target.value})} />
        
        <div className="form-row">
          <label style={{ flex: 1 }}>Start: <input type="date" value={edu.startDate} className="form-input" onChange={e => setEdu({...edu, startDate: e.target.value})} /></label>
          <label style={{ flex: 1 }}>End: <input type="date" value={edu.endDate} disabled={edu.isCurrent} className="form-input" onChange={e => setEdu({...edu, endDate: e.target.value})} /></label>
        </div>
        <label>
          <input type="checkbox" checked={edu.isCurrent} onChange={e => setEdu({...edu, isCurrent: e.target.checked, endDate: e.target.checked ? '' : edu.endDate})} /> Currently Studying Here
        </label>
        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Add Education</button>
      </form>
      
      <ul className="section-list">
        {educationList.map(item => (
          <li key={item.id} className="section-item">
            <div><strong>{item.qualification}</strong> at {item.institute}</div>
            <button onClick={() => candidateService.deleteEducation(item.id).then(loadEducation)} className="btn-delete">❌ Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 💡 මෙන්න මේ පේළිය තමයි කලින් missing වෙලා තිබුණේ!
export default EducationSection;