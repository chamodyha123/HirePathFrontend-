import React, { useState, useEffect } from 'react';
import RecruiterSidebar from './RecruiterSidebar';
import api from '../../api/axios';

const RecruiterDashboard = () => {
  // ⚡ Backend එකෙන් එන real data තබා ගැනීමට state එකක් සකසයි
  const [stats, setStats] = useState({
    activeJobs: 0,
    newApplications: 0,
    interviewsThisWeek: 0
  });
  const [loading, setLoading] = useState(true);

  const [recentJobs, setRecentJobs] = useState([]);


  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/Recruiter/dashboard/stats');
      const data = res.data;
      setStats({
        activeJobs: data.activeJobs ?? 0,
        newApplications: data.newApplications ?? 0,
        interviewsThisWeek: data.interviewsThisWeek ?? 0
      });
      if (Array.isArray(data.recentJobs)) {
        setRecentJobs(data.recentJobs);
      } else if (data.recentJobs?.$values) {
        setRecentJobs(data.recentJobs.$values);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar rendered properly here */}
      <RecruiterSidebar />
      
      {/* Main Content Dashboard */}
      <div style={{ flex: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto' }}>
        
        {/* Header Section (Cleaned up by removing duplicate button) */}
        <div style={{ marginBottom: '32px', width: '100%' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>Recruiter Dashboard Overview</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>Welcome back! Here is your recruitment pipeline summary for today.</p>
        </div>
        
        {loading ? (
          <div style={{ color: '#6b7280', fontSize: '16px', fontWeight: '500', display: 'flex', alignItems: 'center', height: '200px' }}>Loading real-time statistics...</div>
        ) : (
          <>
            {/* CARD GRID LAYOUT */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
              
              {/* CARD 1: Active Jobs */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#9ca3af', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Jobs</h4>
                  <p style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: '#111827' }}>{stats.activeJobs}</p>
                </div>
                <div style={{ padding: '14px', backgroundColor: '#eef2ff', color: '#4f46e5', borderRadius: '12px', display: 'flex' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                </div>
              </div>

              {/* CARD 2: New Applications */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#9ca3af', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Applications</h4>
                  <p style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: '#111827' }}>{stats.newApplications}</p>
                </div>
                <div style={{ padding: '14px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '12px', display: 'flex' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
              </div>

              {/* CARD 3: Interviews This Week */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#9ca3af', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interviews This Week</h4>
                  <p style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: '#111827' }}>{stats.interviewsThisWeek}</p>
                </div>
                <div style={{ padding: '14px', backgroundColor: '#fffbeb', color: '#d97706', borderRadius: '12px', display: 'flex' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
              </div>

            </div>

            {/* LOWER CONTENT: Split Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
              
              {/* Recent Openings Table Container */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>Recent Job Openings</h3>
                  <button style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <span>View all</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 5"></polyline></svg>
                  </button>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>Job Title</th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>Department</th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#4b5563', textAlign: 'center' }}>Applicants</th>
                      <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((job) => (
                      <tr key={job.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{job.title}</td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{job.department}</td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'center' }}>
                          <span style={{ backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '12px', fontWeight: '500' }}>{job.applicants}</span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px' }}>
                          <span style={{ 
                            backgroundColor: job.status === 'Active' ? '#f0fdf4' : '#fef2f2', 
                            color: job.status === 'Active' ? '#166534' : '#991b1b', 
                            padding: '4px 8px', 
                            borderRadius: '10px', 
                            fontWeight: '600' 
                          }}>{job.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick Actions Panel */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>Quick Actions</h3>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' }}>Frequently used recruitment workflows.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #f3f4f6', cursor: 'pointer' }}>
                      <div style={{ padding: '8px', backgroundColor: '#faf5ff', color: '#a855f7', borderRadius: '8px', display: 'flex' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      </div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>Review Candidates</h5>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>View new resumes & shortlist</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #f3f4f6', cursor: 'pointer' }}>
                      <div style={{ padding: '8px', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '8px', display: 'flex' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>Schedule Interview</h5>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Set up Jitsi / Teams links</p>
                      </div>
                    </div>

                  </div>
                </div>
                
                <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #f9fafb', color: '#9ca3af', fontSize: '11px', fontWeight: '500' }}>
                  HirePath Recruiter Portal v1.0
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;