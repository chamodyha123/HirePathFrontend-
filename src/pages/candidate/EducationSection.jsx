import React, { useState, useEffect } from 'react';
import { candidateService } from '../../api/candidateService';

function EducationSection() {
  const [educationList, setEducationList] = useState([]);
  const [edu, setEdu] = useState({
    institute: '', qualification: '', fieldOfStudy: '',
    startDate: '', endDate: '', isCurrent: false, grade: '', description: ''
  });

  const loadEducation = () => {
    candidateService.getAllCandidates()
      .then(res => setEducationList(res.data.educations || []))
      .catch(err => console.error("Error loading education:", err));
  };

  useEffect(() => { loadEducation(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!edu.institute || !edu.qualification) {
      alert("Institute and Qualification are required!");
      return;
    }
    try {
      const payload = {
        ...edu,
        startDate: edu.startDate ? new Date(edu.startDate).toISOString() : new Date().toISOString(),
        endDate: edu.endDate ? new Date(edu.endDate).toISOString() : new Date().toISOString(),
      };
      await candidateService.addEducation(payload);
      alert("Education added successfully!");
      setEdu({ institute: '', qualification: '', fieldOfStudy: '', startDate: '', endDate: '', isCurrent: false, grade: '', description: '' });
      loadEducation();
    } catch (err) {
      console.error("Error adding education:", err);
      alert("Failed to add education.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this education?")) return;
    try {
      await candidateService.deleteEducation(id);
      alert("Education deleted!");
      loadEducation();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px', marginBottom: '30px' }}>
        <h3>🎓 Add Education</h3>
        <input type="text" placeholder="Institute / University" required value={edu.institute} style={{ padding: '8px' }} onChange={e => setEdu({...edu, institute: e.target.value})} />
        <input type="text" placeholder="Qualification" required value={edu.qualification} style={{ padding: '8px' }} onChange={e => setEdu({...edu, qualification: e.target.value})} />
        <input type="text" placeholder="Field of Study" value={edu.fieldOfStudy} style={{ padding: '8px' }} onChange={e => setEdu({...edu, fieldOfStudy: e.target.value})} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <label style={{ flex: 1 }}>Start Date: <input type="date" value={edu.startDate} style={{ width: '100%', padding: '5px' }} onChange={e => setEdu({...edu, startDate: e.target.value})} /></label>
          <label style={{ flex: 1 }}>End Date: <input type="date" value={edu.endDate} disabled={edu.isCurrent} style={{ width: '100%', padding: '5px' }} onChange={e => setEdu({...edu, endDate: e.target.value})} /></label>
        </div>

        <label><input type="checkbox" checked={edu.isCurrent} onChange={e => setEdu({...edu, isCurrent: e.target.checked, endDate: e.target.checked ? '' : edu.endDate})} /> Currently Studying Here</label>
        <input type="text" placeholder="Grade / GPA (Optional)" value={edu.grade} style={{ padding: '8px' }} onChange={e => setEdu({...edu, grade: e.target.value})} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Add Education</button>
      </form>

      <h4>My Education History</h4>
      {educationList.length > 0 ? (
        <ul>
          {educationList.map(item => (
            <li key={item.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', listStyle: 'none' }}>
              <strong>{item.qualification}</strong> at {item.institute} ({item.fieldOfStudy})
              <button onClick={() => handleDelete(item.id)} style={{ marginLeft: '15px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>❌ Delete</button>
            </li>
          ))}
        </ul>
      ) : <p>No education details added yet.</p>}
    </div>
  );
}

export default EducationSection; // 💡 Default Export ලෙස ස්ථාවර කරන ලදී