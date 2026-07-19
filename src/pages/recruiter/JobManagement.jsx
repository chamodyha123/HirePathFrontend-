import React, { useState, useEffect } from 'react';
import RecruiterSidebar from './RecruiterSidebar';

const API_BASE_URL = 'https://localhost:7253/api/Recruiter';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJqYW5lLmRvZUBoaXJlcGF0aC5jb20iLCJ1bmlxdWVfbmFtZSI6ImphbmVkb2VfcmVjcnVpdGVyIiwiZnVsbE5hbWUiOiJKYW5lIERvZSIsImp0aSI6IjgwMDY3NThhLTU3MWEtNDZlMS1iZjA1LWExZWEwNDViNjliMCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlJlY3J1aXRlciIsImV4cCI6MTc4MzY5OTAxOSwiaXNzIjoiSGlyZVBhdGhBUEkiLCJhdWQiOiJIaXJlUGF0aENsaWVudCJ9.9WWeLEmpI13gs54QZt0SXJbRhu0Je4-4ppz0bTk6qgY';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);

  const [jobForm, setJobForm] = useState({
    title: '',
    companyName: '',
    departmentName: '',
    skills: '', 
    status: 'Active'
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try { await fetchCompanies(); } catch (err) { console.error("Companies fetch error:", err); }
    try { await fetchJobs(); } catch (err) { console.error("Jobs fetch error:", err); }
    try { await fetchDepartments(); } catch (err) { console.error("Departments fetch error:", err); }
    setLoading(false);
  };

  const extractArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.$values && Array.isArray(data.$values)) return data.$values;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/search`, {
        method: 'GET', 
        headers: { 
          'Accept': 'application/json',
          'Authorization': AUTH_TOKEN 
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setJobs(extractArray(data));
      } else {
        console.error(`Jobs fetch failed with status: ${res.status}`);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': AUTH_TOKEN }
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(extractArray(data));
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/companies/1/departments`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': AUTH_TOKEN }
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(extractArray(data));
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.companyName || !jobForm.departmentName || !jobForm.skills) {
      alert("Please fill all required fields including skills!");
      return;
    }

    try {
      let companyId = 1; 
      let departmentId = 1; 

      const targetCompanyName = jobForm.companyName.trim();
      const existingCompany = companies.find(
        c => c.name?.toLowerCase() === targetCompanyName.toLowerCase()
      );
      
      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const compRes = await fetch(`${API_BASE_URL}/companies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': AUTH_TOKEN },
          body: JSON.stringify({ name: targetCompanyName, description: "Auto Created", website: "", location: "Colombo" })
        });
        if (compRes.ok) {
          const newComp = await compRes.json();
          companyId = newComp.id;
        }
      }

      const targetDeptName = jobForm.departmentName.trim();
      const existingDept = departments.find(
        d => d.name?.toLowerCase() === targetDeptName.toLowerCase()
      );

      if (existingDept) {
        departmentId = existingDept.id;
      } else {
        const deptRes = await fetch(`${API_BASE_URL}/departments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': AUTH_TOKEN },
          body: JSON.stringify({ name: targetDeptName, companyId: companyId })
        });
        if (deptRes.ok) {
          const newDept = await deptRes.json();
          departmentId = newDept.id;
        }
      }

      // Splitting skills from input by commas and cleaning them up
      const skillsArray = jobForm.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== "");

      const payload = {
        title: jobForm.title,
        description: "Job dynamic entry via portal.",
        employmentType: 1,
        workMode: 1,
        location: "Colombo",
        experienceLevel: 1,
        salaryMin: 120000,
        salaryMax: 250000,
        applicationDeadline: "2026-12-31T23:59:59.000Z",
        companyId: Number(companyId),
        departmentId: Number(departmentId),
        skills: skillsArray 
      };

      const url = isEditing ? `${API_BASE_URL}/jobs/${currentJobId}` : `${API_BASE_URL}/jobs`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': AUTH_TOKEN },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(isEditing ? "Job updated successfully!" : "Job posted successfully!");
        
        if (isEditing) {
          // ⚡ [CRITICAL FIX] Force React to re-render using Deep Cloning State Injection
          setJobs(prevJobs => {
            const nextJobs = prevJobs.map(job => {
              if (job.id === currentJobId) {
                return {
                  ...job,
                  title: jobForm.title,
                  companyName: targetCompanyName,
                  company: { ...job.company, name: targetCompanyName },
                  departmentName: targetDeptName,
                  department: { ...job.department, name: targetDeptName },
                  skills: [...skillsArray], // Providing a new array reference to guarantee a re-render
                  status: jobForm.status
                };
              }
              return job;
            });
            return [...nextJobs]; // Making the outer array reference completely new as well
          });
        } else {
          // Fetch the entire list only if a new job is added
          await loadAllData();
        }

      } else {
        const errData = await res.text();
        alert(`Server Error: Backend failed to save data. \nDetails: ${errData}`);
      }
    } catch (err) {
      console.error("Error saving job:", err);
      alert("Network error or Backend is offline.");
    } finally {
      closeModal();
    }
  };

  const handleEditClick = (job) => {
    setIsEditing(true);
    setCurrentJobId(job.id);
    
    let loadedSkills = '';
    if (job.skills) {
      const parsedSkills = extractArray(job.skills);
      loadedSkills = parsedSkills.join(', ');
    }

    setJobForm({
      title: job.title || '',
      companyName: job.companyName || job.company?.name || '',
      departmentName: job.departmentName || job.department?.name || '',
      skills: loadedSkills,
      status: job.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job opportunity?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/jobs/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': AUTH_TOKEN }
        });
        if (res.ok) {
          alert("Job deleted successfully!");
          await loadAllData();
        } else {
          alert("Failed to delete job.");
        }
      } catch (err) {
        console.error("Error deleting job:", err);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentJobId(null);
    setJobForm({ title: '', companyName: '', departmentName: '', skills: '', status: 'Active' });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#f9fafb' }}>
      <RecruiterSidebar />
      
      <div style={{ flex: 1, padding: '40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>Job Management</h2>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage live career opportunities connecting to your backend.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
          >
            + Post a Job
          </button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563' }}>Loading jobs from backend...</div>
        ) : (
          <table style={{ width: '100%', backgroundColor: '#fff', borderCollapse: 'collapse', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>Position Title</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>Company</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>Department</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>Required Skills</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#4b5563', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr key={job.id || index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', color: '#111827', fontWeight: '500' }}>{job.title}</td>
                  <td style={{ padding: '16px', color: '#4b5563' }}>{job.companyName || job.company?.name || 'N/A'}</td>
                  <td style={{ padding: '16px', color: '#4b5563' }}>{job.departmentName || job.department?.name || 'N/A'}</td>
                  
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {job.skills && extractArray(job.skills).length > 0 ? (
                        extractArray(job.skills).map((skill, sIdx) => (
                          <span key={sIdx} style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px', fontStyle: 'italic' }}>None Specified</span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      color: job.status === 'Closed' ? '#981b1b' : '#065f46',
                      backgroundColor: job.status === 'Closed' ? '#fee2e2' : '#d1fae5',
                      padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '500'
                    }}>{job.status || 'Active'}</span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button onClick={() => handleEditClick(job)} style={{ marginRight: '10px', background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: '500' }}>Edit</button>
                    <button onClick={() => handleDelete(job.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- POP-UP MODAL FORM --- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '450px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
              {isEditing ? 'Edit Job Position' : 'Post a New Job'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Job Title *</label>
                <input 
                  type="text" 
                  value={jobForm.title}
                  onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Company Name *</label>
                <input 
                  type="text"
                  value={jobForm.companyName}
                  onChange={(e) => setJobForm({...jobForm, companyName: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Department Name *</label>
                <input 
                  type="text"
                  value={jobForm.departmentName}
                  onChange={(e) => setJobForm({...jobForm, departmentName: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Required Skills *</label>
                <input 
                  type="text"
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({...jobForm, skills: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={closeModal} style={{ backgroundColor: '#e5e7eb', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>{isEditing ? 'Save Changes' : 'Add Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;