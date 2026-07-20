import React, { useState } from 'react';
import RecruiterSidebar from './RecruiterSidebar';

const CandidateTracker = () => {
  const columns = ['Screening', 'Interview', 'Offered'];

  // 1. Mock Data containing CV metadata and details for Review Option
  const [candidates, setCandidates] = useState([
    { 
      id: 1, name: 'Kasun Perera', role: 'React Developer', stage: 'Screening', aiScore: 92, 
      skills: 'React, Node, AWS', email: 'kasun@email.com', matchReason: 'Excellent cloud and frontend experience.',
      experience: '3+ Years as Frontend Engineer at TechCorp. Built scalable micro-frontends.',
      education: 'BSc (Hons) in Software Engineering - IIT',
      cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
    },
    { 
      id: 2, name: 'Nimal Silva', role: 'UI/UX Designer', stage: 'Interview', aiScore: 78, 
      skills: 'Figma, Tailwind, Adobe', email: 'nimal@email.com', matchReason: 'Strong portfolio, lacks active framework skills.',
      experience: '2 Years Creative Designer at StudioX. Designed mobile apps with 50k+ downloads.',
      education: 'Diploma in Graphic & UI Design - NIBM',
      cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
    },
    { 
      id: 3, name: 'Dilini Fernando', role: 'QA Engineer', stage: 'Offered', aiScore: 88, 
      skills: 'Selenium, Jira, Python', email: 'dilini@email.com', matchReason: 'Great automation background.',
      experience: '4 Years QA Lead at GlobalSoft. Specialized in automation and performance testing.',
      education: 'BSc in Computer Science - University of Colombo',
      cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
    },
    { 
      id: 4, name: 'Amara Simons', role: 'Product Manager', stage: 'Screening', aiScore: 65, 
      skills: 'Agile, Scrum, SQL', email: 'amara@email.com', matchReason: 'Good management but weak tech stack score.',
      experience: '1.5 Years Associate PM. Managed cross-functional agile engineering teams.',
      education: 'MBA in IT Management - University of Moratuwa',
      cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
    }
  ]);

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortByAi, setSortByAi] = useState(false);

  // Modal States
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false); // New CV Review Modal State
  
  // Form States
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [emailText, setEmailText] = useState('');

  // Move candidate logic
  const moveCandidate = (id, direction) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        const currentIdx = columns.indexOf(c.stage);
        let nextIdx = currentIdx + direction;
        if (nextIdx >= 0 && nextIdx < columns.length) {
          return { ...c, stage: columns[nextIdx] };
        }
      }
      return c;
    }));
  };

  // Candidate Search and Filtering Logic
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = c.skills.toLowerCase().includes(skillFilter.toLowerCase());
    return matchesSearch && matchesSkill;
  });

  // AI-Powered Ranking Logic
  const displayCandidates = sortByAi 
    ? [...filteredCandidates].sort((a, b) => b.aiScore - a.aiScore)
    : filteredCandidates;

  const handleScheduleInterview = (e) => {
    e.preventDefault();
    alert(`Interview successfully scheduled for ${selectedCandidate.name} on ${interviewDate} at ${interviewTime}`);
    setIsScheduleModalOpen(false);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    alert(`Email successfully dispatched to ${selectedCandidate.email}`);
    setIsEmailModalOpen(false);
    setEmailText('');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#f9fafb' }}>
      <RecruiterSidebar />
      
      <div style={{ flex: 1, padding: '40px', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Advanced Candidate Pipeline</h2>
        <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>AI Screening, Reviewing, Shortlisting and Global Communication Hub.</p>
        
        {/* --- SEARCH AND FILTERING BAR --- */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="🔍 Search name or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '200px' }}
          />
          <input 
            type="text" 
            placeholder="⚡ Filter by core skills (e.g. React)..." 
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '200px' }}
          />
          <button 
            onClick={() => setSortByAi(!sortByAi)}
            style={{ backgroundColor: sortByAi ? '#10b981' : '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            {sortByAi ? '✨ Sorted by AI Rank' : '🪄 Rank via AI Score'}
          </button>
        </div>

        {/* --- KANBAN BOARD --- */}
        <div style={{ display: 'flex', gap: '20px' }}>
          {columns.map((column) => {
            const columnCandidates = displayCandidates.filter(c => c.stage === column);

            return (
              <div key={column} style={{ flex: 1, background: '#f3f4f6', padding: '16px', borderRadius: '12px', minHeight: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: '#374151', fontWeight: '600' }}>{column}</h4>
                  <span style={{ backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>
                    {columnCandidates.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {columnCandidates.map((candidate) => (
                    <div 
                      key={candidate.id} 
                      style={{ background: '#fff', padding: '14px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}
                    >
                      {/* AI Rank Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{candidate.name}</span>
                        <span style={{ 
                          fontSize: '11px', fontWeight: '700', padding: '3px 6px', borderRadius: '4px',
                          backgroundColor: candidate.aiScore >= 85 ? '#d1fae5' : candidate.aiScore >= 70 ? '#fef3c7' : '#fee2e2',
                          color: candidate.aiScore >= 85 ? '#065f46' : candidate.aiScore >= 70 ? '#b45309' : '#981b1b'
                        }}>
                          AI: {candidate.aiScore}%
                        </span>
                      </div>
                      
                      <div style={{ color: '#4b5563', fontSize: '13px', fontWeight: '500' }}>{candidate.role}</div>
                      <div style={{ color: '#9ca3af', fontSize: '11px', margin: '4px 0 10px 0' }}>Tags: {candidate.skills}</div>

                      {/* --- CV REVIEW OPTION LINK / BUTTON --- */}
                      <div style={{ marginBottom: '12px' }}>
                        <button
                          onClick={() => { setSelectedCandidate(candidate); setIsCvModalOpen(true); }}
                          style={{ width: '100%', background: 'rgba(79, 70, 229, 0.05)', border: '1px dashed #4f46e5', color: '#4f46e5', fontSize: '12px', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          📄 Review Application & CV
                        </button>
                      </div>

                      {/* Lecturer Actions Point: Email, Schedule */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button 
                          onClick={() => { setSelectedCandidate(candidate); setIsEmailModalOpen(true); }}
                          style={{ flex: 1, backgroundColor: '#eff6ff', border: 'none', color: '#1d4ed8', fontSize: '11px', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                        >
                          ✉️ Contact
                        </button>
                        <button 
                          onClick={() => { setSelectedCandidate(candidate); setIsScheduleModalOpen(true); }}
                          style={{ flex: 1, backgroundColor: '#f5f3ff', border: 'none', color: '#6d28d9', fontSize: '11px', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                        >
                          📅 Schedule
                        </button>
                      </div>
                      
                      {/* Pipeline Movement */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
                        {column !== 'Screening' ? (
                          <button onClick={() => moveCandidate(candidate.id, -1)} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>← Back</button>
                        ) : <div />}
                        {column !== 'Offered' ? (
                          <button onClick={() => moveCandidate(candidate.id, 1)} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Shortlist →</button>
                        ) : <div />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- NEW: CV REVIEW MODAL --- */}
      {isCvModalOpen && selectedCandidate && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', width: '850px', maxWidth: '90%', height: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Application Review: {selectedCandidate.name}</h3>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>{selectedCandidate.role} • <span style={{ color: '#4f46e5', fontWeight: '600' }}>{selectedCandidate.stage} Stage</span></p>
              </div>
              <button onClick={() => setIsCvModalOpen(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', color: '#4b5563' }}>✕</button>
            </div>

            <div style={{ flex: 1, display: 'flex', gap: '20px', overflow: 'hidden' }}>
              {/* Left Side: Candidate Profiling Details */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#374151', fontWeight: '600' }}>✨ AI Fitment Summary ({selectedCandidate.aiScore}%)</h4>
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#166534', lineHeight: '1.5' }}>
                    {selectedCandidate.matchReason}
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#374151', fontWeight: '600' }}>💼 Professional Experience</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', lineHeight: '1.5' }}>
                    {selectedCandidate.experience}
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#374151', fontWeight: '600' }}>🎓 Education</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    {selectedCandidate.education}
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#374151', fontWeight: '600' }}>🛠️ Core Stack / Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedCandidate.skills.split(', ').map(skill => (
                      <span key={skill} style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Embedded Live Resume Preview (PDF iframe) */}
              <div style={{ flex: 1.2, border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px 14px', background: '#fff', borderBottom: '1px solid #e5e7eb', fontSize: '13px', fontWeight: '600', color: '#374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📄 Original Resume Preview</span>
                  <a href={selectedCandidate.cvUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '12px' }}>Open in New Tab ↗</a>
                </div>
                <iframe 
                  src={`${selectedCandidate.cvUrl}#toolbar=0`} 
                  title="CV Preview" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
              <button onClick={() => setIsCvModalOpen(false)} style={{ padding: '10px 18px', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Close Review</button>
              <button 
                onClick={() => { setIsCvModalOpen(false); setIsScheduleModalOpen(true); }} 
                style={{ padding: '10px 18px', background: '#6d28d9', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
              >
                📅 Move to Interview Slot
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- INTERVIEW SCHEDULER MODAL --- */}
      {isScheduleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '380px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Schedule Interview</h3>
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>Setting up a tech interview panel for <b>{selectedCandidate?.name}</b></p>
            <form onSubmit={handleScheduleInterview}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Date</label>
                <input type="date" required value={interviewDate} onChange={(e)=>setInterviewDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Time Slot</label>
                <input type="time" required value={interviewTime} onChange={(e)=>setInterviewTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                <button type="submit" style={{ padding: '8px 14px', background: '#6d28d9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Confirm Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COMMUNICATIONS MODAL --- */}
      {isEmailModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '450px' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Send Applicant Email</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>To: {selectedCandidate?.email}</p>
            <form onSubmit={handleSendEmail}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>AI Assistant Screening Insights:</label>
                <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '6px', fontSize: '12px', color: '#374151', fontStyle: 'italic', marginBottom: '12px' }}>
                  "{selectedCandidate?.matchReason}"
                </div>
                <textarea 
                  rows="4" 
                  placeholder="Type your official update letter here..." 
                  required
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsEmailModalOpen(false)} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Send Message</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidateTracker;