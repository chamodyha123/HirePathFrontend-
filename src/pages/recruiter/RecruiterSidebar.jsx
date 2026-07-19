import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const RecruiterSidebar = () => {
  const location = useLocation();

  const sidebarStyle = {
    width: '260px',
    backgroundColor: '#111827',
    color: '#ffffff',
    padding: '24px 16px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box'
  };

  const linkStyle = (path) => ({
    display: 'block',
    color: location.pathname === path ? '#ffffff' : '#9ca3af',
    textDecoration: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '8px',
    backgroundColor: location.pathname === path ? '#1f2937' : 'transparent',
    fontWeight: location.pathname === path ? '600' : '500',
    fontSize: '15px',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={sidebarStyle}>
      <div style={{ marginBottom: '32px', paddingLeft: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>HirePath</h2>
        <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recruiter Space</span>
      </div>
      
      <nav style={{ flexGrow: 1 }}>
        <Link to="/recruiter-dashboard" style={linkStyle('/recruiter-dashboard')}>
          Dashboard Overview
        </Link>
        <Link to="/recruiter-dashboard/jobs" style={linkStyle('/recruiter-dashboard/jobs')}>
          Manage Jobs
        </Link>
        <Link to="/recruiter-dashboard/candidates" style={linkStyle('/recruiter-dashboard/candidates')}>
          Candidates Tracker
        </Link>
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #1f2937', paddingTop: '16px' }}>
        <Link to="/" style={{ color: '#ef4444', textDecoration: 'none', padding: '12px 16px', display: 'block', fontWeight: '500' }}>
          ← Exit Portal
        </Link>
      </div>
    </div>
  );
};

export default RecruiterSidebar;