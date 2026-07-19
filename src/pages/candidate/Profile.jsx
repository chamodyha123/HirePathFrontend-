import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProfileForm } from './ProfileForm';
import './Profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found!");
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:5139/api/Candidate', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                }
            });

            if (response.data) {
                setProfile(response.data);
                setIsEditing(false);
            } else {
                setProfile(null);
                setIsEditing(true);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setProfile(null);
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const getInitials = () => {
        if (!profile) return "?";
        const f = profile.firstName?.[0] || "";
        const l = profile.lastName?.[0] || "";
        return (f + l).toUpperCase() || "?";
    };

    const formatDate = (d) => {
        if (!d) return "Present";
        return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    if (loading) return <div className="loading-state">⏳ Loading Profile Data...</div>;

    return (
        <div className="profile-container">
            {!profile || isEditing ? (
                <ProfileForm
                    userId={profile?.userId || 3}
                    existingProfile={profile}
                    onSave={() => {
                        setIsEditing(false);
                        fetchProfileData();
                    }}
                    onCancel={profile ? () => setIsEditing(false) : null}
                />
            ) : (
                <div className="profile-view-card">

                    {/* Header */}
                    <div className="profile-header">
                        <div className="profile-identity">
                            <div className="profile-avatar">{getInitials()}</div>
                            <div>
                                <h2 className="profile-title">{profile.firstName} {profile.lastName}</h2>
                                <p className="profile-headline">{profile.headline || "No Headline Provided"}</p>
                                <div className="profile-badges">
                                    {profile.location && <span className="badge">📍 {profile.location}</span>}
                                    <span className="badge">💼 {profile.yearsOfExperience} yrs experience</span>
                                    <span className="badge">🌐 {profile.preferredWorkMode}</span>
                                </div>
                            </div>
                        </div>
                        <button className="btn-primary" onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
                    </div>

                    {/* Personal Details */}
                    <div className="profile-section">
                        <h3 className="section-title">ℹ️ Personal & Professional Details</h3>
                        <div className="profile-details profile-details-grid">
                            <p><strong>📞 Phone:</strong> {profile.phoneNumber || 'N/A'}</p>
                            <p><strong>📅 Date of Birth:</strong> {profile.dateOfBirth ? String(profile.dateOfBirth).split('T')[0] : 'N/A'}</p>
                            <p><strong>🧬 Gender:</strong> {profile.gender || 'N/A'}</p>
                            <p><strong>🌍 Nationality:</strong> {profile.nationality || 'N/A'}</p>
                            <p><strong>💍 Marital Status:</strong> {profile.maritalStatus || 'N/A'}</p>
                            <p><strong>🗣️ Languages:</strong> {profile.languages || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="profile-section">
                        <h3 className="section-title">🔗 Links & Portfolios</h3>
                        <div className="profile-links">
                            {profile.linkedInUrl && <a href={profile.linkedInUrl} target="_blank" rel="noreferrer" className="link-chip">💙 LinkedIn</a>}
                            {profile.gitHubUrl && <a href={profile.gitHubUrl} target="_blank" rel="noreferrer" className="link-chip">🖤 GitHub</a>}
                            {profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="link-chip">🌐 Portfolio</a>}
                            {!profile.linkedInUrl && !profile.gitHubUrl && !profile.portfolioUrl && <p className="empty-note">No social links added yet.</p>}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="profile-section summary-box">
                        <h3 className="section-title">📝 Professional Summary</h3>
                        <p className="summary-text">{profile.summary || "No summary provided yet."}</p>
                    </div>

                    {/* Skills */}
                    {profile.skills?.length > 0 && (
                        <div className="profile-section">
                            <h3 className="section-title">⚡ Skills</h3>
                            <div className="skills-chip-row">
                                {profile.skills.map(s => (
                                    <span key={s.id} className={`skill-chip skill-${s.skillLevel?.toLowerCase()}`}>
                                        {s.skillName} <span className="skill-level">· {s.skillLevel}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {profile.experiences?.length > 0 && (
                        <div className="profile-section">
                            <h3 className="section-title">💼 Experience</h3>
                            <div className="timeline">
                                {profile.experiences.map(exp => (
                                    <div key={exp.id} className="timeline-item">
                                        <div className="timeline-dot" />
                                        <div className="timeline-content">
                                            <p className="timeline-title">{exp.jobTitle} · <span>{exp.companyName}</span></p>
                                            <p className="timeline-meta">
                                                {formatDate(exp.startDate)} – {exp.isCurrent ? "Present" : formatDate(exp.endDate)} · {exp.employmentType}
                                                {exp.location ? ` · ${exp.location}` : ""}
                                            </p>
                                            {exp.description && <p className="timeline-desc">{exp.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {profile.educations?.length > 0 && (
                        <div className="profile-section">
                            <h3 className="section-title">🎓 Education</h3>
                            <div className="timeline">
                                {profile.educations.map(edu => (
                                    <div key={edu.id} className="timeline-item">
                                        <div className="timeline-dot" />
                                        <div className="timeline-content">
                                            <p className="timeline-title">{edu.qualification} · <span>{edu.institute}</span></p>
                                            <p className="timeline-meta">
                                                {formatDate(edu.startDate)} – {edu.isCurrent ? "Present" : formatDate(edu.endDate)}
                                                {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                                                {edu.grade ? ` · Grade: ${edu.grade}` : ""}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resumes */}
                    {profile.resumes?.length > 0 && (
                        <div className="profile-section">
                            <h3 className="section-title">📄 Resumes</h3>
                            <div className="resume-list">
                                {profile.resumes.map(r => (
                                    <a key={r.id} href={`http://localhost:5139${r.filePath}`} target="_blank" rel="noreferrer" className="resume-chip">
                                        📎 {r.fileName} {r.isPrimary && <strong className="primary-tag">Primary</strong>}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Profile;