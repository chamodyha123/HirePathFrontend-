import React, { useState, useEffect } from 'react';
import { candidateService } from '../../api/candidateService';

function ExperienceSection() {
  const [experienceList, setExperienceList] = useState([]);
  const [exp, setExp] = useState({
    companyName: '', jobTitle: '', location: '', description: '',
    startDate: '', endDate: '', isCurrent: false, employmentType: 'Full-Time'
  });

  const loadExperience = () => {
    candidateService.getAllCandidates()
      .then(res => setExperienceList(res.data.experiences || []))
      .catch(err => console.error("Error loading experience:", err));
  };

  useEffect(() => { loadExperience(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exp.companyName || !exp.jobTitle) {
      alert("Company Name and Job Title are required!");
      return;
    }
    try {
      const payload = {
        ...exp,
        startDate: exp.startDate ? new Date(exp.startDate).toISOString() : new Date().toISOString(),
        endDate: exp.endDate ? new Date(exp.endDate).toISOString() : new Date().toISOString(),
      };
      await candidateService.addExperience(payload);
      alert("Experience added successfully!");
      setExp({ companyName: '', jobTitle: '', location: '', description: '', startDate: '', endDate: '', isCurrent: false, employmentType: 'Full-Time' });
      loadExperience();
    } catch (err) {
      console.error("Error adding experience:", err);
      alert("Failed to add experience.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) return;
    try {
      await candidateService.deleteExperience(id);
      alert("Experience deleted!");
      loadExperience();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px', marginBottom: '30px' }}>
        <h3>💼 Add Experience</h3>
        <input type="text" placeholder="Company Name" required value={exp.companyName} style={{ padding: '8px' }} onChange={e => setExp({...exp, companyName: e.target.value})} />
        <input type="text" placeholder="Job Title" required value={exp.jobTitle} style={{ padding: '8px' }} onChange={e => setExp({...exp, jobTitle: e.target.value})} />
        <input type="text" placeholder="Location" value={exp.location} style={{ padding: '8px' }} onChange={e => setExp({...exp, location: e.target.value})} />
        
        <select value={exp.employmentType} style={{ padding: '8px' }} onChange={e => setExp({...exp, employmentType: e.target.value})}>
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>

        <div style={{ display: 'flex', gap: '10px' }}>
          <label style={{ flex: 1 }}>Start Date: <input type="date" value={exp.startDate} style={{ width: '100%', padding: '5px' }} onChange={e => setExp({...exp, startDate: e.target.value})} /></label>
          <label style={{ flex: 1 }}>End Date: <input type="date" value={exp.endDate} disabled={exp.isCurrent} style={{ width: '100%', padding: '5px' }} onChange={e => setExp({...exp, endDate: e.target.value})} /></label>
        </div>

        <label><input type="checkbox" checked={exp.isCurrent} onChange={e => setExp({...exp, isCurrent: e.target.checked, endDate: e.target.checked ? '' : exp.endDate})} /> Currently Working Here</label>
        <textarea placeholder="Job Description" rows="3" value={exp.description} style={{ padding: '8px' }} onChange={e => setExp({...exp, description: e.target.value})} />
        
        <button type="submit" style={{ padding: '10px', backgroundColor: '#38bdf8', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Add Experience</button>
      </form>

      <h4>My Work History</h4>
      {experienceList.length > 0 ? (
        <ul>
          {experienceList.map(item => (
            <li key={item.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', listStyle: 'none' }}>
              <strong>{item.jobTitle}</strong> at {item.companyName} ({item.employmentType})
              <button onClick={() => handleDelete(item.id)} style={{ marginLeft: '15px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>❌ Delete</button>
            </li>
          ))}
        </ul>
      ) : <p>No experience details added yet.</p>}
    </div>
  );
}

export default ExperienceSection; // 💡 Default Export ලෙස ස්ථාවර කරන ලදී