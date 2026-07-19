import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { ProfileForm } from './ProfileForm';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const fetchProfileData = async (abortSignal) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                console.error("No token found!");
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:5139/api/Candidate', {
                signal: abortSignal,
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
            if (axios.isCancel(error)) {
                console.log("Fetch aborted");
                return;
            }
            console.error("Error fetching profile:", error);
            setProfile(null);
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchProfileData(controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    const getInitials = () => {
        if (!profile) return "?";
        const firstInitial = profile.firstName?.[0] || "";
        const lastInitial = profile.lastName?.[0] || "";
        return `${firstInitial}${lastInitial}`.toUpperCase() || "?";
    };

    const formatDate = (d) => {
        if (!d) return "Present";
        return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const formatDateSimple = (dateString) => {
        if (!dateString) return 'N/A';
        return dateString.split('T')[0];
    };

    if (loading) return <div style={styles.loadingState}>⏳ Loading Profile Data...</div>;

    return (
        <div style={styles.pageBackground}>
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
                <div style={styles.mainContainer}>
                    
                    {/* Top Action Row */}
                    <div style={styles.topActionBar}>
                        <button onClick={() => setIsEditing(true)} style={styles.btnEditOutside}>
                            ✏️ Edit Profile
                        </button>
                    </div>
                    
                    {/* 1. Main Header Card */}
                    <div style={styles.card}>
                        <div style={styles.headerFlex}>
                            <div style={styles.avatarPlaceholder}>
                                {getInitials()}
                            </div>
                            <div style={styles.userIntro}>
                                <h2 style={styles.userName}>{profile.firstName} {profile.lastName}</h2>
                                {profile.headline && <p style={styles.professionalHeadline}>{profile.headline}</p>}
                                <p style={styles.locationText}> {profile.location || 'Location not specified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Professional Summary */}
                    {profile.summary && (
                        <div style={styles.card}>
                            <h3 style={styles.sectionTitle}>📝 Professional Summary</h3>
                            <p style={styles.summaryContent}>{profile.summary}</p>
                        </div>
                    )}

                    {/* 3. Personal & Work Details (Grid) */}
                    <div style={styles.formGrid2}>
                        <div style={styles.card}>
                            <h3 style={styles.sectionTitle}>👤 Personal Details</h3>
                            <table style={styles.infoTable}>
                                <tbody>
                                    <tr><td style={styles.tableLabel}>Birth Date:</td><td style={styles.tableValue}>{formatDateSimple(profile.dateOfBirth)}</td></tr>
                                    <tr><td style={styles.tableLabel}>Gender:</td><td style={styles.tableValue}>{profile.gender || 'N/A'}</td></tr>
                                    <tr><td style={styles.tableLabel}>Nationality:</td><td style={styles.tableValue}>{profile.nationality || 'N/A'}</td></tr>
                                    <tr><td style={styles.tableLabel}>Marital Status:</td><td style={styles.tableValue}>{profile.maritalStatus || 'N/A'}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.sectionTitle}>💼 Work & Contact</h3>
                            <table style={styles.infoTable}>
                                <tbody>
                                    <tr><td style={styles.tableLabel}>Experience:</td><td style={styles.tableValue}>{profile.yearsOfExperience || 0} Years</td></tr>
                                    <tr><td style={styles.tableLabel}>Work Mode:</td><td style={styles.tableValue}><span style={styles.badgeMode}>{profile.preferredWorkMode || 'N/A'}</span></td></tr>
                                    <tr><td style={styles.tableLabel}>Languages:</td><td style={styles.tableValue}>{profile.languages || 'N/A'}</td></tr>
                                    <tr><td style={styles.tableLabel}>Phone:</td><td style={styles.tableValue}>{profile.phoneNumber || 'N/A'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 4. Social Links */}
                    <div style={styles.card}>
                        <h3 style={styles.sectionTitle}>🔗 Links & Portfolios</h3>
                        <div style={styles.linksContainer}>
                            {profile.linkedInUrl && <a href={profile.linkedInUrl} target="_blank" rel="noreferrer" style={{...styles.linkItem, backgroundColor: '#0077b5'}}>LinkedIn</a>}
                            {profile.gitHubUrl && <a href={profile.gitHubUrl} target="_blank" rel="noreferrer" style={{...styles.linkItem, backgroundColor: '#24292e'}}>GitHub</a>}
                            {profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" style={{...styles.linkItem, backgroundColor: '#10b981'}}>Portfolio</a>}
                            {!profile.linkedInUrl && !profile.gitHubUrl && !profile.portfolioUrl && <p style={styles.mutedText}>No links attached.</p>}
                        </div>
                    </div>

                    {/* 5. Skills */}
                    {profile.skills?.length > 0 && (
                        <div style={styles.card}>
                            <h3 style={styles.sectionTitle}>⚡ Skills</h3>
                            <div style={styles.skillsContainer}>
                                {profile.skills.map((s) => (
                                    <div key={s.id} style={styles.skillBadge}>
                                        <span style={styles.skillName}>{s.skillName}</span>
                                        <span style={styles.skillLevel}>{s.skillLevel}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 6. Experience Timeline */}
                    {profile.experiences?.length > 0 && (
                        <div style={styles.card}>
                            <h3 style={styles.sectionTitle}>💼 Work Experience</h3>
                            <div>
                                {profile.experiences.map((exp) => (
                                    <div key={exp.id} style={styles.timelineItem}>
                                        <div style={styles.timelineDot}></div>
                                        <div style={styles.timelineContent}>
                                            <h4 style={styles.timelineTitle}>{exp.jobTitle} <span style={styles.companyName}>at {exp.companyName}</span></h4>
                                            <p style={styles.timelineMeta}>
                                                📅 {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate)} | 📍 {exp.location || 'Remote'} ({exp.employmentType})
                                            </p>
                                            {exp.description && <p style={styles.timelineDesc}>{exp.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 7. Education Timeline */}
                    {profile.educations?.length > 0 && (
                        <div style={styles.card}>
                            <h3 style={styles.sectionTitle}>🎓 Education</h3>
                            <div>
                                {profile.educations.map((edu) => (
                                    <div key={edu.id} style={styles.timelineItem}>
                                        <div style={{...styles.timelineDot, backgroundColor: '#10b981'}}></div>
                                        <div style={styles.timelineContent}>
                                            <h4 style={styles.timelineTitle}>{edu.qualification}</h4>
                                            <p style={styles.educationSub}>{edu.institute} {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}</p>
                                            <p style={styles.timelineMeta}>
                                                📅 {formatDate(edu.startDate)} — {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                                                {edu.grade && <span style={styles.gradeBadge}>Grade: {edu.grade}</span>}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 8. Resumes */}
                    {profile.resumes?.length > 0 && (
                        <div style={styles.card}>
                            <h3 style={styles.sectionTitle}>📄 Documents & Resumes</h3>
                            <ul style={styles.resumeList}>
                                {profile.resumes.map((r) => (
                                    <li key={r.id} style={styles.resumeItem}>
                                        <a href={`http://localhost:5139${r.filePath}`} target="_blank" rel="noreferrer" style={styles.resumeLink}>
                                            📄 {r.fileName} {r.isPrimary && <span style={styles.primaryDocBadge}>Primary</span>}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}

const styles = {
    pageBackground: {
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        padding: '30px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    mainContainer: {
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box'
    },
    loadingState: {
        textAlign: 'center',
        padding: '50px',
        fontSize: '18px',
        color: '#64748b'
    },
    topActionBar: {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%'
    },
    btnEditOutside: {
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#334155',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s'
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid #f1f5f9'
    },
    headerFlex: {
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    avatarPlaceholder: {
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
        boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
    },
    userIntro: {
        flex: '1',
        minWidth: '250px'
    },
    userName: {
        margin: '0 0 6px 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a'
    },
    professionalHeadline: {
        margin: '0 0 8px 0',
        fontSize: '17px',
        color: '#475569',
        fontWeight: '500'
    },
    locationText: {
        margin: '0',
        fontSize: '15px',
        color: '#64748b'
    },
    sectionTitle: {
        margin: '0 0 18px 0',
        fontSize: '19px',
        fontWeight: '600',
        color: '#1e293b',
        borderBottom: '2px solid #f1f5f9',
        paddingBottom: '10px'
    },
    summaryContent: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#334155',
        margin: '0'
    },
    formGrid2: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px',
        width: '100%'
    },
    infoTable: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '16px'
    },
    tableLabel: {
        padding: '10px 0',
        color: '#64748b',
        fontWeight: '500',
        width: '40%'
    },
    tableValue: {
        padding: '10px 0',
        color: '#0f172a',
        fontWeight: '600'
    },
    badgeMode: {
        backgroundColor: '#eff6ff',
        color: '#1d4ed8',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600'
    },
    linksContainer: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    linkItem: {
        color: '#ffffff',
        padding: '10px 20px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    mutedText: {
        color: '#64748b',
        margin: '0',
        fontSize: '15px'
    },
    skillsContainer: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
    },
    skillBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
    },
    skillName: {
        padding: '8px 14px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#1e293b'
    },
    skillLevel: {
        backgroundColor: '#cbd5e1',
        padding: '8px 12px',
        fontSize: '13px',
        fontWeight: '700',
        color: '#334155',
        textTransform: 'uppercase'
    },
    timelineItem: {
        position: 'relative',
        paddingLeft: '30px',
        marginBottom: '24px',
    },
    timelineDot: {
        position: 'absolute',
        left: '0',
        top: '6px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        border: '3px solid #ffffff',
        boxShadow: '0 0 0 2px #3b82f6'
    },
    timelineContent: {
        backgroundColor: '#f8fafc',
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
    },
    timelineTitle: {
        margin: '0 0 6px 0',
        fontSize: '17px',
        fontWeight: '700',
        color: '#0f172a'
    },
    companyName: {
        fontWeight: '500',
        color: '#475569'
    },
    educationSub: {
        margin: '0 0 6px 0',
        fontSize: '15px',
        color: '#475569',
        fontWeight: '500'
    },
    timelineMeta: {
        margin: '0 0 8px 0',
        fontSize: '14px',
        color: '#64748b',
        fontWeight: '500'
    },
    timelineDesc: {
        margin: '0',
        fontSize: '15px',
        lineHeight: '1.5',
        color: '#334155'
    },
    gradeBadge: {
        marginLeft: '10px',
        backgroundColor: '#f0fdf4',
        color: '#166534',
        padding: '2px 8px',
        borderRadius: '4px',
        fontWeight: '600'
    },
    resumeList: {
        listStyle: 'none',
        padding: '0',
        margin: '0'
    },
    resumeItem: {
        marginBottom: '10px'
    },
    resumeLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#2563eb',
        textDecoration: 'none',
        fontSize: '16px',
        fontWeight: '600'
    },
    primaryDocBadge: {
        backgroundColor: '#fef3c7',
        color: '#d97706',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '700',
        marginLeft: '10px'
    }
};

export default Profile;