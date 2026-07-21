// src/pages/candidate/JobSearch.jsx
import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import applicationApi from '../../api/applicationApi';
import { useAI } from '../../hooks/useAI';
import './JobSearch.css';
import './Profile.css';

const arr = d => Array.isArray(d) ? d : (d?.$values || []);

export default function JobSearch({ userId }) {
    const [jobs, setJobs] = useState([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(null);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const { loading: aiLoading, results: recommendations, getRecommendations } = useAI();

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/Jobs/active');
            setJobs(arr(data));
        } catch (e) {
            setError(e.response?.data?.detail || e.response?.data?.message || e.response?.data?.title || 'Unable to load jobs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        if (userId) {
            getRecommendations(userId, 10);
        }
    }, [userId]);

    const shown = useMemo(() => {
        let filtered = jobs.filter(j => 
            `${j.title} ${j.description} ${j.company?.name || j.companyName || ''} ${j.location}`.toLowerCase().includes(q.toLowerCase())
        );

        if (showRecommendations && recommendations?.recommendations) {
            const recommendedIds = new Set(recommendations.recommendations.map(r => r.jobId));
            const recommended = filtered.filter(j => recommendedIds.has(j.id));
            const other = filtered.filter(j => !recommendedIds.has(j.id));
            return [...recommended, ...other];
        }
        return filtered;
    }, [jobs, q, showRecommendations, recommendations]);

    const getMatchLevel = (score) => {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    };

    const apply = async (job) => {
        const coverLetter = window.prompt('Optional cover letter:', '');
        if (coverLetter === null) return;
        setBusy(job.id);
        try {
            await applicationApi.apply(job.id, coverLetter || null, null);
            alert('Application submitted successfully. Track it from Application Tracker.');
            await load();
        } catch (e) {
            alert(e.response?.data?.message || e.response?.data || 'Unable to apply.');
        } finally {
            setBusy(null);
        }
    };

    return (
        <div>
            <h2>🔍 Search & Apply Jobs</h2>
            
            <div className="search-container">
                <input 
                    value={q} 
                    onChange={e => setQ(e.target.value)} 
                    placeholder="Search by job title, company, location or keyword..." 
                    className="form-input" 
                />
                <button className="btn-primary" onClick={load}>Refresh</button>
                <button 
                    className={`btn-secondary ${showRecommendations ? 'active' : ''}`}
                    onClick={() => {
                        setShowRecommendations(!showRecommendations);
                        if (!showRecommendations && userId) {
                            getRecommendations(userId, 10);
                        }
                    }}
                >
                    {showRecommendations ? '🤖 Hide AI Matches' : '🤖 Show AI Matches'}
                </button>
            </div>

            {aiLoading && <p style={{ color: '#6b7280' }}>Loading AI recommendations...</p>}
            
            {showRecommendations && recommendations?.recommendations?.length > 0 && (
                <div className="ai-match-banner">
                    <span className="ai-icon">🤖</span>
                    <span className="ai-text">
                        <strong>{recommendations.recommendations.length}</strong> AI-matched jobs found 
                        {recommendations.summary?.averageMatchScore && 
                            ` · Average match: ${Math.round(recommendations.summary.averageMatchScore)}%`
                        }
                    </span>
                    {recommendations.recommendations.slice(0, 2).map((r, i) => (
                        <span key={r.jobId} className="ai-tag">
                            {r.jobTitle} ({Math.round(r.matchScore)}%)
                        </span>
                    ))}
                    {recommendations.recommendations.length > 2 && (
                        <span className="ai-tag">+{recommendations.recommendations.length - 2} more</span>
                    )}
                </div>
            )}

            {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
            
            {loading ? (
                <div className="skeleton-grid">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-line title"></div>
                            <div className="skeleton-line subtitle"></div>
                            <div className="skeleton-line body"></div>
                            <div className="skeleton-line" style={{ width: '40%' }}></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="job-grid">
                    {shown.map(job => {
                        const aiMatch = recommendations?.recommendations?.find(r => r.jobId === job.id);
                        const matchLevel = aiMatch ? getMatchLevel(aiMatch.matchScore) : null;
                        
                        return (
                            <div key={job.id} className="job-card">
                                <div>
                                    <h3 className="job-title">{job.title}</h3>
                                    <div className="job-company">
                                        <span className="company-name">🏢 {job.company?.name || job.companyName || 'Company'}</span>
                                        <span>📍 {job.location || 'Location not specified'}</span>
                                    </div>
                                    
                                    <div className="job-meta">
                                        <span className="type">{job.employmentType || 'Full-Time'}</span>
                                        <span className="location">{job.workMode || 'On-site'}</span>
                                    </div>
                                    
                                    <p>{job.description?.slice(0, 150)}...</p>
                                    
                                    {aiMatch && showRecommendations && (
                                        <div className="ai-insights">
                                            <div className="insight-item">
                                                <span className="icon">🎯</span>
                                                <span>
                                                    AI Match Score: <strong>{Math.round(aiMatch.matchScore)}%</strong>
                                                    {aiMatch.matchScore >= 80 && ' 🔥 Excellent fit!'}
                                                    {aiMatch.matchScore >= 60 && aiMatch.matchScore < 80 && ' 👍 Good match'}
                                                    {aiMatch.matchScore < 60 && ' 💪 Consider improving some skills'}
                                                </span>
                                            </div>
                                            {aiMatch.matchedSkills?.length > 0 && (
                                                <div className="skill-match">
                                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Matched skills:</span>
                                                    {aiMatch.matchedSkills.slice(0, 4).map((skill, i) => (
                                                        <span key={i} className="skill-tag">{skill}</span>
                                                    ))}
                                                    {aiMatch.matchedSkills.length > 4 && 
                                                        <span className="skill-tag">+{aiMatch.matchedSkills.length - 4}</span>
                                                    }
                                                </div>
                                            )}
                                            {aiMatch.skillsToImprove?.length > 0 && (
                                                <div className="skill-match" style={{ marginTop: '2px' }}>
                                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Skills to improve:</span>
                                                    {aiMatch.skillsToImprove.slice(0, 3).map((skill, i) => (
                                                        <span key={i} className="skill-tag missing">{skill}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {aiMatch && showRecommendations && (
                                    <div className={`ai-match-badge ${matchLevel}`}>
                                        🤖 {Math.round(aiMatch.matchScore)}% Match
                                    </div>
                                )}
                                
                                <button 
                                    disabled={busy === job.id} 
                                    onClick={() => apply(job)} 
                                    className="btn-primary"
                                >
                                    {busy === job.id ? '⏳ Applying...' : '📝 Apply Now'}
                                </button>
                            </div>
                        );
                    })}
                    {!shown.length && (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>No jobs found</h3>
                            <p>Try adjusting your search criteria or check back later.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}