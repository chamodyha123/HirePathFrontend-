import React, { useState, useEffect } from 'react';
import platformAdminService from '../../api/platformAdminService';

function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        platformAdminService.getAnalyticsData()
            .then(data => {
                setAnalytics(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Analytics fetch error:', err);
                setError('Failed to load analytics data. Please try again.');
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div style={{ color: 'var(--white)', textAlign: 'center', padding: '40px' }}>
            ⏳ Computing Platform Market Metrics...
        </div>
    );

    if (error) return (
        <div className="card" style={{ color: '#b91c1c', textAlign: 'center', padding: '28px' }}>
            ⚠️ {error}
        </div>
    );

    const roleDistribution = analytics?.roleDistribution ?? [];
    const topSkills = analytics?.topSkills ?? [];

    return (
        <div className="platform-analytics">
            <section className="card analytics-summary">
                <h3 style={{ margin: '0 0 8px', color: '#10233f' }}>📈 Marketplace Supply &amp; Demand Analytics</h3>
                <p style={{ color: '#526983', margin: 0, fontSize: '14.5px', lineHeight: 1.55 }}>
                    Live recruitment metrics covering hiring success, interview conversion, screening speed,
                    platform role distribution and the most requested candidate skills.
                </p>

                <div className="analytics-kpi-grid">
                    <div className="analytics-kpi">
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#526983', textTransform: 'uppercase' }}>Hiring Success Rate</span>
                        <h2 style={{ margin: '9px 0 0', color: '#059669', fontWeight: 900 }}>{analytics?.jobSuccessRate ?? '—'}%</h2>
                    </div>
                    <div className="analytics-kpi">
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#526983', textTransform: 'uppercase' }}>Interview Conversion</span>
                        <h2 style={{ margin: '9px 0 0', color: '#2563eb', fontWeight: 900 }}>{analytics?.interviewConversionRate ?? '—'}%</h2>
                    </div>
                    <div className="analytics-kpi">
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#526983', textTransform: 'uppercase' }}>Avg AI Screening Speed</span>
                        <h2 style={{ margin: '9px 0 0', color: '#7c3aed', fontWeight: 900 }}>{analytics?.averageScreeningTime ?? '—'}</h2>
                    </div>
                </div>
            </section>

            <div className="analytics-detail-grid">
                <section className="card analytics-detail-card">
                    <h4 style={{ margin: '0 0 20px', color: '#10233f', fontWeight: 800 }}>📊 Talent Pool Role Distribution</h4>
                    {roleDistribution.length ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {roleDistribution.map((role, index) => (
                                <div key={`${role.name}-${index}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 13.5, fontWeight: 700 }}>
                                        <span style={{ color: '#263f5e' }}>{role.name}</span>
                                        <span style={{ color: '#10233f' }}>{role.percentage}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: 10, background: '#c7dcf3', borderRadius: 999, overflow: 'hidden' }}>
                                        <div style={{ width: `${role.percentage}%`, height: '100%', background: role.color || '#3b82f6', borderRadius: 999 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="analytics-empty">No role distribution data is available yet.</div>
                    )}
                </section>

                <section className="card analytics-detail-card">
                    <h4 style={{ margin: '0 0 20px', color: '#10233f', fontWeight: 800 }}>⚡ Top In-Demand Skills</h4>
                    {topSkills.length ? (
                        <div className="analytics-skills-list">
                            {topSkills.map((skill, index) => (
                                <div className="analytics-skill-item" key={`${skill.name}-${index}`}>
                                    <strong style={{ color: '#17365d', fontSize: 13.5 }}>{skill.name}</strong>
                                    <span style={{ color: '#1d4ed8', background: '#cfe3ff', borderRadius: 999, padding: '3px 8px', fontSize: 11, fontWeight: 800 }}>
                                        {skill.count} profiles
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="analytics-empty">Skill demand data will appear after candidate profiles and job skills are added.</div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Analytics;
