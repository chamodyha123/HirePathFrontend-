import React, { useState } from 'react';
import Profile from './Profile';
import JobSearch from './JobSearch';
import ApplicationTracker from './ApplicationTracker';
import './CandidateDashboard.css';

function CandidateDashboard() {
    const [activeTab, setActiveTab] = useState('profile');

    // 1. localStorage එකෙන් දත්ත කියවමු
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    let candidateId = null;

    if (storedToken) {
        try {
            // JWT Token එකේ මැද කොටස (Payload) එක වෙන් කරලා Decode කරගන්නවා
            const base64Url = storedToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                window.atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            const tokenData = JSON.parse(jsonPayload);

            // Token එක ඇතුළේ තියෙන 'sub' claim එකෙන් User ID එක ගන්නවා
            candidateId = tokenData.sub || tokenData.nameid;
        } catch (e) {
            console.error("Error decoding JWT token:", e);
        }
    }

    // fallback එකක් විදිහට user object එකත් චෙක් කරලා බලනවා
    if (!candidateId && storedUser) {
        try {
            const parsedData = JSON.parse(storedUser);
            candidateId = parsedData.candidateId || parsedData.id || parsedData.userId;
        } catch (e) {
            console.error("Error parsing user object:", e);
        }
    }

    // 🚪 Logout Function එක
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login"; // Login පේජ් එකට රීඩිරෙක්ට් කරයි
    };

    // 2. Auth ID එකක් හොයාගන්න බැරි වුණොත් පෙන්වන Error Screen එක
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

                    <div style={{ textAlign: 'left', backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb', marginBottom: '20px', fontSize: '12px', color: '#374151' }}>
                        <strong>💡 How to fix this:</strong>
                        <ul style={{ margin: '5px 0 0 15px', padding: '0' }}>
                            <li>Make sure you log in via the <code>/login</code> page first.</li>
                            <li>Open browser DevTools (F12) → <strong>Application</strong> → <strong>Local Storage</strong> and check if the <code>token</code> is present.</li>
                        </ul>
                    </div>

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
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
                        onMouseOut={(e) => e.target.style.background = '#2563eb'}
                    >
                        Go to Login Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar Section */}
            <aside className="sidebar">
                {/* උඩ කොටස: Logo සහ Tabs */}
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

                {/* පහළ කොටස: Logout බටන් එක */}
                <div className="sidebar-bottom">
                    <button className="logout-button" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
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