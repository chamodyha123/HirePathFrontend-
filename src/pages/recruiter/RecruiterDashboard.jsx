import React, { useState, useEffect } from 'react';
import RecruiterSidebar from './RecruiterSidebar';

const API_BASE_URL = 'https://localhost:7253/api/Recruiter';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJqYW5lLmRvZUBoaXJlcGF0aC5jb20iLCJ1bmlxdWVfbmFtZSI6ImphbmVkb2VfcmVjcnVpdGVyIiwiZnVsbE5hbWUiOiJKYW5lIERvZSIsImp0aSI6IjgwMDY3NThhLTU3MWEtNDZlMS1iZjA1LWExZWEwNDViNjliMCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlJlY3J1aXRlciIsImV4cCI6MTc4MzY5OTAxOSwiaXNzIjoiSGlyZVBhdGhBUEkiLCJhdWQiOiJIaXJlUGF0aENsaWVudCJ9.9WWeLEmpI13gs54QZt0SXJbRhu0Je4-4ppz0bTk6qgY';

const RecruiterDashboard = () => {
  // ⚡ Backend එකෙන් එන real data තබා ගැනීමට state එකක් සකසයි
  const [stats, setStats] = useState({
    activeJobs: 0,
    newApplications: 0,
    interviewsThisWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': AUTH_TOKEN
        }
      });

      if (res.ok) {
        const data = await res.json();
        
        // 💡 Backend එකෙන් PascalCase හෝ camelCase ක්‍රම දෙකෙන් කිනම් එකකින් ආවත් ඩේටා මිස් නොවීමට nullish coalescing භාවිතා කර ඇත.
        setStats({
          activeJobs: data.activeJobs ?? data.activeJobsCount ?? 0,
          newApplications: data.newApplications ?? data.newApplicationsCount ?? 0,
          interviewsThisWeek: data.interviewsThisWeek ?? data.interviewsCount ?? 0
        });
      } else {
        console.error("Failed to fetch real dashboard stats.");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#f9fafb' }}>
      {/* Sidebar rendered properly here */}
      <RecruiterSidebar />
      
      {/* Main Content Dashboard */}
      <div style={{ flex: 1, padding: '40px', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Recruiter Dashboard Overview</h2>
        <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>Welcome back! Here is your recruitment pipeline summary.</p>
        
        {loading ? (
          <div style={{ color: '#6b7280', fontSize: '16px', fontWeight: '500' }}>Loading real-time statistics...</div>
        ) : (
          /* ඔයාගේ original grid layout එකම ආරක්ෂා කර ගනිමින් dynamic stats එක් කර ඇත */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            
            {/* CARD 1: Active Jobs */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '14px', fontWeight: '600' }}>Active Jobs</h4>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                {stats.activeJobs}
              </p>
            </div>

            {/* CARD 2: New Applications */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '14px', fontWeight: '600' }}>New Applications</h4>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                {stats.newApplications}
              </p>
            </div>

            {/* CARD 3: Interviews This Week */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '14px', fontWeight: '600' }}>Interviews This Week</h4>
              <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#111827' }}>
                {stats.interviewsThisWeek}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;