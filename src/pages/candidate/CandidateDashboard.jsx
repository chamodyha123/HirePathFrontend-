import React, { useState } from 'react';
import Profile from './Profile';
import ResumeManager from './ResumeManager';
import SkillsSection from './SkillsSection';
import EducationSection from './EducationSection'; // 💡 සඟල වරහන් නොමැතිව (Standard Default Import)
import ExperienceSection from './ExperienceSection'; // 💡 සඟල වරහන් නොමැතිව (Standard Default Import)

function CandidateDashboard() {
    const [activeTab, setActiveTab] = useState('profile');

    const styles = {
        dashboardContainer: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            fontFamily: 'Arial, sans-serif'
        },
        sidebar: {
            width: '260px',
            backgroundColor: '#1e293b',
            color: '#fff',
            padding: '35px 20px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
        },
        logoArea: {
            marginBottom: '40px',
            borderBottom: '1px solid #334155',
            paddingBottom: '15px'
        },
        logoText: {
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#38bdf8',
            margin: 0
        },
        subText: {
            fontSize: '12px',
            color: '#94a3b8',
            margin: '5px 0 0 0'
        },
        tabList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        tabButton: (isActive) => ({
            width: '100%',
            padding: '12px 15px',
            borderRadius: '8px',
            border: 'none',
            textAlign: 'left',
            backgroundColor: isActive ? '#38bdf8' : 'transparent',
            color: isActive ? '#0f172a' : '#cbd5e1',
            fontSize: '15px',
            fontWeight: isActive ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }),
        contentArea: {
            flex: 1,
            padding: '40px',
            overflowY: 'auto'
        },
        card: {
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }
    };

    return (
        <div style={styles.dashboardContainer}>
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <h2 style={styles.logoText}>HirePath AI</h2>
                    <p style={styles.subText}>Candidate Panel</p>
                </div>

                <ul style={styles.tabList}>
                    <li>
                        <button 
                            style={styles.tabButton(activeTab === 'profile')} 
                            onClick={() => setActiveTab('profile')}
                        >
                            👤 My Profile
                        </button>
                    </li>
                    <li>
                        <button 
                            style={styles.tabButton(activeTab === 'resumes')} 
                            onClick={() => setActiveTab('resumes')}
                        >
                            📄 Manage Resumes
                        </button>
                    </li>
                    <li>
                        <button 
                            style={styles.tabButton(activeTab === 'skills')} 
                            onClick={() => setActiveTab('skills')}
                        >
                            ⚡ Add Skills
                        </button>
                    </li>
                    <li>
                        <button 
                            style={styles.tabButton(activeTab === 'education')} 
                            onClick={() => setActiveTab('education')}
                        >
                            🎓 Education
                        </button>
                    </li>
                    <li>
                        <button 
                            style={styles.tabButton(activeTab === 'experience')} 
                            onClick={() => setActiveTab('experience')}
                        >
                            💼 Experience
                        </button>
                    </li>
                </ul>
            </aside>

            <main style={styles.contentArea}>
                <div style={styles.card}>
                    {activeTab === 'profile' && <Profile />}
                    {activeTab === 'resumes' && <ResumeManager />}
                    {activeTab === 'skills' && <SkillsSection />}
                    {activeTab === 'education' && <EducationSection />}
                    {activeTab === 'experience' && <ExperienceSection />}
                </div>
            </main>
        </div>
    );
}

export default CandidateDashboard;