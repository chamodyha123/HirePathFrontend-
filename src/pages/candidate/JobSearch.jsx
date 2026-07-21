// src/pages/candidate/JobSearch.jsx (Enhanced)
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
    const { loading: aiLoading, results: recommendations, getRecommendations, clearResults } = useAI();

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
        // Load AI recommendations
        if (userId) {
            getRecommendations(userId, 10);
        }
    }, [userId]);

    const shown = useMemo(() => {
        const filtered = jobs.filter(j => 
            `${j.title} ${j.description} ${j.company?.name || j.companyName || ''} ${j.location}`.toLowerCase().includes(q.toLowerCase())
        );

        if (showRecommendations && recommendations?.recommendations) {
            // Sort by match score
            const recommendedIds = new Set(recommendations.recommendations.map(r => r.jobId));
            const recommended = filtered.filter(j => recommendedIds.has(j.id));
            const other = filtered.filter(j => !recommendedIds.has(j.id));
            return [...recommended, ...other];
        }
        return filtered;
    }, [jobs, q, showRecommendations, recommendations]);

    const apply = async (job) => {
        const coverLetter = window.prompt('Optional cover letter:', '');
        if (coverLetter === null) return;
        setBusy(job.id);
        try {
            await applicationApi.apply(job.id, coverLetter || null, null);
            alert('Application submitted successfully. Track it from Application Tracker.');
        } catch (e) {
            alert(e.response?.data?.message || e.response?.data || 'Unable to apply. Upload a primary CV first if required.');
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
                    style={{ maxWidth: 500 }} 
                />
                <button className="btn-primary" onClick={load}>Refresh</button>
                <button 
                    className="btn-secondary" 
                    onClick={() => {
                        setShowRecommendations(!showRecommendations);
                        if (!showRecommendations && userId) {
                            getRecommendations(userId, 10);
                        }
                    }}
                    style={{ marginLeft: 10 }}
                >
                    {showRecommendations ? '🤖 Hide AI Matches' : '🤖 Show AI Matches'}
                </button>
            </div>

            {aiLoading && <p>Loading AI recommendations...</p>}
            
            {showRecommendations && recommendations?.recommendations?.length > 0 && (
                <div style={{ 
                    background: '#e8f0fe', 
                    padding: '10px 16px', 
                    borderRadius: '8px', 
                    marginBottom: '16px',
                    borderLeft: '4px solid #4f46e5'
                }}>
                    <strong>🤖 AI Match: </strong>
                    {recommendations.recommendations.slice(0, 3).map((r, i) => (
                        <span key={r.jobId}>
                            {i > 0 && ', '}
                            <span style={{ fontWeight: 600 }}>{r.jobTitle}</span>
                            <span style={{ color: '#4f46e5' }}> ({Math.round(r.matchScore)}% match)</span>
                        </span>
                    ))}
                    {recommendations.recommendations.length > 3 && ' ...'}
                </div>
            )}

            {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
            
            {loading ? (
                <p>Loading live jobs...</p>
            ) : (
                <div className="job-grid">
                    {shown.map(job => {
                        const aiMatch = recommendations?.recommendations?.find(r => r.jobId === job.id);
                        return (
                            <div key={job.id} className="job-card">
                                <div>
                                    <h3 className="job-title">{job.title}</h3>
                                    <div className="job-company">
                                        🏢 {job.company?.name || job.companyName || 'Company'} 
                                        {aiMatch && (
                                            <span style={{ 
                                                background: '#4f46e5', 
                                                color: 'white', 
                                                padding: '2px 8px', 
                                                borderRadius: '12px', 
                                                fontSize: '11px',
                                                marginLeft: '8px'
                                            }}>
                                                AI Match {Math.round(aiMatch.matchScore)}%
                                            </span>
                                        )}
                                    </div>
                                    <p>{job.description}</p>
                                    <small>{job.employmentType || ''} {job.workMode || ''}</small>
                                </div>
                                <button 
                                    disabled={busy === job.id} 
                                    onClick={() => apply(job)} 
                                    className="btn-primary" 
                                    style={{ width: '100%', marginTop: 10 }}
                                >
                                    {busy === job.id ? 'Applying...' : 'Apply Now'}
                                </button>
                            </div>
                        );
                    })}
                    {!shown.length && <p>No active jobs match your search.</p>}
                </div>
            )}
        </div>
    );
}