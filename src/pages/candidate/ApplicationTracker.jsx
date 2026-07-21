// src/pages/candidate/ApplicationTracker.jsx
import React, { useEffect, useState } from 'react';
import applicationApi, { statusLabel } from '../../api/applicationApi';
import interviewApi from '../../api/interviewApi';
import './ApplicationTracker.css';

const arr = d => Array.isArray(d) ? d : (d?.$values || []);

export default function ApplicationTracker() {
    const [apps, setApps] = useState([]);
    const [interviews, setInterviews] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await applicationApi.getMine();
            const list = arr(data);
            setApps(list);
            const pairs = await Promise.all(list.map(async a => {
                try {
                    const r = await interviewApi.getByApplication(a.id);
                    return [a.id, arr(r.data)];
                } catch { return [a.id, []]; }
            }));
            setInterviews(Object.fromEntries(pairs));
        } catch (e) {
            setError(e.response?.data?.message || 'Unable to load applications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const withdraw = async id => {
        if (!confirm('Withdraw this application?')) return;
        try {
            await applicationApi.withdraw(id);
            await load();
        } catch (e) {
            alert(e.response?.data?.message || 'Unable to withdraw application.');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            1: '#f59e0b',  // Applied
            2: '#3b82f6',  // Under Review
            3: '#8b5cf6',  // Shortlisted
            4: '#ec4899',  // Interview Scheduled
            5: '#10b981',  // Interviewed
            6: '#f59e0b',  // Offered
            7: '#10b981',  // Hired
            8: '#ef4444',  // Rejected
            9: '#6b7280',  // Withdrawn
        };
        return colors[status] || '#6b7280';
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>📊 Job Application Tracker</h2>
                <button className="btn-primary" onClick={load}>Refresh</button>
            </div>

            {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

            {loading ? (
                <p>Loading applications...</p>
            ) : (
                <table className="tracker-table">
                    <thead>
                        <tr>
                            <th>Job</th>
                            <th>Company</th>
                            <th>Applied</th>
                            <th>Status</th>
                            <th>Interview / Notification</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apps.map(app => {
                            const interview = interviews[app.id]?.find(i => [1, 4].includes(i.status)) || interviews[app.id]?.[0];
                            return (
                                <tr key={app.id}>
                                    <td><strong>{app.job?.title || 'Job'}</strong></td>
                                    <td>{app.job?.company?.name || '—'}</td>
                                    <td>{new Date(app.appliedDate || app.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className="status-badge" style={{ backgroundColor: getStatusColor(app.status) }}>
                                            {statusLabel(app.status)}
                                        </span>
                                    </td>
                                    <td>
                                        {interview ? (
                                            <div>
                                                <b>{new Date(interview.scheduledAt).toLocaleString()}</b>
                                                <br />
                                                <small>
                                                    {interview.meetingLink ? <a href={interview.meetingLink} target="_blank" rel="noreferrer">Join interview</a> : interview.location || interview.interviewType}
                                                </small>
                                            </div>
                                        ) : 'No interview scheduled'}
                                    </td>
                                    <td>
                                        {[1, 2].includes(app.status) ? (
                                            <button onClick={() => withdraw(app.id)}>Withdraw</button>
                                        ) : '—'}
                                    </td>
                                </tr>
                            );
                        })}
                        {!apps.length && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                                    No applications yet. Start applying for jobs!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}