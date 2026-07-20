import React, { useEffect, useState } from 'react';
import applicationApi, { statusLabel, TERMINAL_STATUSES, STATUS_VALUE } from '../../api/applicationApi';
import interviewApi from '../../api/interviewApi';
import './ApplicationTracker.css';

const INTERVIEW_TYPE_LABEL = { 1: 'Online', 2: 'Physical', 3: 'Phone' };
const INTERVIEW_STATUS_LABEL = { 1: 'Scheduled', 2: 'Completed', 3: 'Cancelled', 4: 'Rescheduled', 5: 'No Show' };

// Only these statuses mean an interview might exist to show.
const HAS_INTERVIEW_STATUSES = [
    STATUS_VALUE.InterviewScheduled,
    STATUS_VALUE.Interviewed,
    STATUS_VALUE.Offered,
    STATUS_VALUE.Hired,
];

function ApplicationTracker() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null);

    // Expandable interview-details row
    const [expandedId, setExpandedId] = useState(null);
    const [interviewsByApp, setInterviewsByApp] = useState({});
    const [interviewLoading, setInterviewLoading] = useState(false);
    const [interviewError, setInterviewError] = useState('');

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await applicationApi.getMine();
            setApplications(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to load your applications.');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (id) => {
        if (!window.confirm('Withdraw this application? This cannot be undone.')) return;

        setActionId(id);
        try {
            await applicationApi.withdraw(id);
            await loadApplications();
        } catch (err) {
            alert(err.response?.data || err.response?.data?.message || 'Failed to withdraw application.');
        } finally {
            setActionId(null);
        }
    };

    const toggleDetails = async (app) => {
        if (expandedId === app.id) {
            setExpandedId(null);
            return;
        }

        setExpandedId(app.id);
        setInterviewError('');

        // Already fetched — no need to hit the API again.
        if (interviewsByApp[app.id]) return;

        setInterviewLoading(true);
        try {
            const res = await interviewApi.getByApplication(app.id);
            setInterviewsByApp((prev) => ({ ...prev, [app.id]: res.data || [] }));
        } catch (err) {
            setInterviewError('Failed to load interview details.');
        } finally {
            setInterviewLoading(false);
        }
    };

    return (
        <div>
            <div className="tracker-header">
                <h2>📊 Job Application Tracker</h2>
                <button className="btn-secondary" onClick={loadApplications} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {error && <div className="tracker-error">{error}</div>}

            {!loading && applications.length === 0 && !error && (
                <p className="tracker-empty">You haven't applied to any jobs yet. Head over to Search Jobs to get started.</p>
            )}

            {applications.length > 0 && (
                <table className="tracker-table">
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Applied Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => {
                            const isTerminal = TERMINAL_STATUSES.includes(app.status);
                            const canHaveInterview = HAS_INTERVIEW_STATUSES.includes(app.status);
                            const isExpanded = expandedId === app.id;
                            const interviews = interviewsByApp[app.id] || [];
                            const history = [...(app.statusHistory || [])].sort(
                                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                            );

                            return (
                                <React.Fragment key={app.id}>
                                    <tr>
                                        <td><strong>{app.job?.title || 'Job'}</strong></td>
                                        <td>{app.job?.company?.name || '—'}</td>
                                        <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge status-${app.status}`}>
                                                {statusLabel(app.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => toggleDetails(app)}
                                                >
                                                    {isExpanded ? 'Hide Details' : 'View Details'}
                                                </button>
                                                <button
                                                    className="btn-withdraw"
                                                    disabled={isTerminal || actionId === app.id}
                                                    onClick={() => handleWithdraw(app.id)}
                                                    title={isTerminal ? 'This application is already closed' : 'Withdraw application'}
                                                >
                                                    {actionId === app.id ? 'Withdrawing...' : 'Withdraw'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <tr className="tracker-detail-row">
                                            <td colSpan={5}>
                                                {canHaveInterview && (
                                                    <>
                                                        <div className="detail-section-title">Interview</div>
                                                        {interviewLoading && <p className="tracker-detail-loading">Loading interview details...</p>}
                                                        {interviewError && <p className="tracker-error" style={{ margin: 0 }}>{interviewError}</p>}

                                                        {!interviewLoading && !interviewError && interviews.length === 0 && (
                                                            <p className="tracker-detail-empty">No interview has been scheduled yet.</p>
                                                        )}

                                                        {!interviewLoading && interviews.map((iv) => (
                                                            <div key={iv.id} className="interview-detail-card">
                                                                <div className="interview-detail-row">
                                                                    <span className="interview-detail-label">When</span>
                                                                    <span>{new Date(iv.scheduledAt).toLocaleString()}</span>
                                                                </div>
                                                                <div className="interview-detail-row">
                                                                    <span className="interview-detail-label">Type</span>
                                                                    <span>{INTERVIEW_TYPE_LABEL[iv.interviewType] || iv.interviewType}</span>
                                                                </div>
                                                                {iv.meetingLink && (
                                                                    <div className="interview-detail-row">
                                                                        <span className="interview-detail-label">Link</span>
                                                                        <a href={iv.meetingLink} target="_blank" rel="noreferrer">{iv.meetingLink}</a>
                                                                    </div>
                                                                )}
                                                                {iv.location && (
                                                                    <div className="interview-detail-row">
                                                                        <span className="interview-detail-label">Location</span>
                                                                        <span>{iv.location}</span>
                                                                    </div>
                                                                )}
                                                                <div className="interview-detail-row">
                                                                    <span className="interview-detail-label">Status</span>
                                                                    <span>{INTERVIEW_STATUS_LABEL[iv.status] || iv.status}</span>
                                                                </div>
                                                                {iv.notes && (
                                                                    <div className="interview-detail-row">
                                                                        <span className="interview-detail-label">Notes</span>
                                                                        <span>{iv.notes}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </>
                                                )}

                                                <div className="detail-section-title" style={{ marginTop: canHaveInterview ? '16px' : 0 }}>
                                                    Application Timeline
                                                </div>
                                                {history.length === 0 && (
                                                    <p className="tracker-detail-empty">No status changes recorded yet.</p>
                                                )}
                                                {history.length > 0 && (
                                                    <div className="timeline">
                                                        {history.map((h) => (
                                                            <div key={h.id} className="timeline-item">
                                                                <div className="timeline-dot" />
                                                                <div className="timeline-content">
                                                                    <div className="timeline-status">
                                                                        {statusLabel(h.fromStatus)} → <b>{statusLabel(h.toStatus)}</b>
                                                                    </div>
                                                                    {h.notes && <div className="timeline-notes">{h.notes}</div>}
                                                                    <div className="timeline-date">{new Date(h.createdAt).toLocaleString()}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ApplicationTracker;