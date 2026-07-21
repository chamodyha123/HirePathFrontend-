// src/pages/candidate/CandidateDashboard.jsx
import React, { useState } from 'react';
import Profile from './Profile';
import JobSearch from './JobSearch';
import ApplicationTracker from './ApplicationTracker';
import './CandidateDashboard.css';

function CandidateDashboard() {
    const [activeTab, setActiveTab] = useState('profile');

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    let candidateId = null;

    if (storedToken) {
        try {
            const base64Url = storedToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                window.atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const tokenData = JSON.parse(jsonPayload);
            candidateId = tokenData.sub || tokenData.nameid;
        } catch (e) {
            console.error("Error decoding JWT token:", e);
        }
    }

    if (!candidateId && storedUser) {
        try {
            const parsedData = JSON.parse(storedUser);
            candidateId = parsedData.candidateId || parsedData.id || parsedData.userId;
        } catch (e) {
            console.error("Error parsing user object:", e);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    if (!candidateId) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
                <div style={{
                    maxWidth: '450px',
                    margin: '0 auto',
                    padding: '30px',
                    border: '1px solid #fee2e2',
                    borderRadius: '8px',
                    backgroundColor: '#fef2f2',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ color: '#dc2626', fontSize: '20px', marginBottom: '10px' }}>⚠️ Session Authentication Error</h3>
                    <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '20px' }}>
                        Your login session details could not be found or have expired.
                    </p>
                    <button
                        onClick={() => window.location.href = "/login"}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                        }}
                    >
                        Go to Login Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="logo-area">
                        <h2 className="logo-text">HirePath AI</h2>
                        <p className="sub-text">Candidate Panel</p>
                    </div>
                    <ul className="tab-list">
                        <li>
                            <button className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                                👤 My Profile
                            </button>
                        </li>
                        <li>
                            <button className={`tab-button ${activeTab === 'jobsearch' ? 'active' : ''}`} onClick={() => setActiveTab('jobsearch')}>
                                🔍 Search Jobs
                            </button>
                        </li>
                        <li>
                            <button className={`tab-button ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')}>
                                📊 Track Applications
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="sidebar-bottom">
                    <button className="logout-button" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <main className="content-area">
                {activeTab === 'profile' && (
                    <div className="profile-all-in-one">
                        <Profile userId={candidateId} />
                    </div>
                )}
                {activeTab === 'jobsearch' && (
                    <div className="card">
                        <JobSearch userId={candidateId} />
                    </div>
                )}
                {activeTab === 'tracker' && (
                    <div className="card">
                        <ApplicationTracker userId={candidateId} />
                    </div>
                )}
            </main>
        </div>
    );
}

export default CandidateDashboard;