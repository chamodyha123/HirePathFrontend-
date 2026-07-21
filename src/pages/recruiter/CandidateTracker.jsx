import React, { useEffect, useState } from 'react';
import RecruiterSidebar from './RecruiterSidebar';
import applicationApi, { statusLabel, STATUS_VALUE, normalizeApplication, normalizeCollection } from '../../api/applicationApi';
import interviewApi, { INTERVIEW_TYPE } from '../../api/interviewApi';
import feedbackApi from '../../api/feedbackApi';

const COLUMNS = [
    { key: 'new', title: 'New Applications', statuses: [STATUS_VALUE.Applied, STATUS_VALUE.UnderReview] },
    { key: 'shortlisted', title: 'Shortlisted', statuses: [STATUS_VALUE.Shortlisted] },
    { key: 'interview', title: 'Interview', statuses: [STATUS_VALUE.InterviewScheduled, STATUS_VALUE.Interviewed] },
    { key: 'decision', title: 'Offer / Hired', statuses: [STATUS_VALUE.Offered, STATUS_VALUE.Hired] },
];

const ARCHIVE_STATUSES = [STATUS_VALUE.Rejected, STATUS_VALUE.Withdrawn];

const INTERVIEW_TYPE_LABEL = { 1: 'Online', 2: 'Physical', 3: 'Phone' };
const INTERVIEW_STATUS_LABEL = { 1: 'Scheduled', 2: 'Completed', 3: 'Cancelled', 4: 'Rescheduled', 5: 'No Show' };
const RECOMMENDATION_LABEL = { 1: 'Hire', 2: 'Hold', 3: 'Reject' };

// Statuses at which an interview has at least been conducted, so feedback might exist.
const HAS_FEEDBACK_STATUSES = [STATUS_VALUE.Interviewed, STATUS_VALUE.Offered, STATUS_VALUE.Hired];

function candidateName(app) {
    return app.candidateProfile?.user?.fullName || app.candidateProfile?.headline || 'Candidate';
}

function candidateEmail(app) {
    return app.candidateProfile?.user?.email || '';
}

const CandidateTracker = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null);
    const [showArchive, setShowArchive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Schedule Interview modal
    const [scheduleFor, setScheduleFor] = useState(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [scheduleType, setScheduleType] = useState('Online');
    const [scheduleLink, setScheduleLink] = useState('');
    const [scheduleLocation, setScheduleLocation] = useState('');
    const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
    const [scheduleError, setScheduleError] = useState('');

    // Manage (update/cancel) Interview modal
    const [manageFor, setManageFor] = useState(null); // application
    const [manageInterview, setManageInterview] = useState(null); // loaded interview record
    const [manageLoading, setManageLoading] = useState(false);
    const [manageError, setManageError] = useState('');
    const [manageDate, setManageDate] = useState('');
    const [manageTime, setManageTime] = useState('');
    const [manageLink, setManageLink] = useState('');
    const [manageLocation, setManageLocation] = useState('');
    const [manageNotes, setManageNotes] = useState('');
    const [manageSubmitting, setManageSubmitting] = useState(false);

    // View Feedback modal
    const [feedbackViewFor, setFeedbackViewFor] = useState(null);
    const [feedbackList, setFeedbackList] = useState([]);
    const [feedbackViewLoading, setFeedbackViewLoading] = useState(false);
    const [feedbackViewError, setFeedbackViewError] = useState('');

    // Timeline modal (uses statusHistory already present on the application object)
    const [timelineFor, setTimelineFor] = useState(null);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await applicationApi.getByCompany();
            setApplications(normalizeCollection(res.data).map(normalizeApplication));
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to load applications.');
        } finally {
            setLoading(false);
        }
    };

    const filtered = applications.filter((app) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            candidateName(app).toLowerCase().includes(term) ||
            (app.job?.title || '').toLowerCase().includes(term)
        );
    });

    const boardApps = filtered.filter((app) => !ARCHIVE_STATUSES.includes(app.status));
    const archiveApps = filtered.filter((app) => ARCHIVE_STATUSES.includes(app.status));

    const runAction = async (id, action) => {
        setActionId(id);
        try {
            await action();
            await loadApplications();
        } catch (err) {
            alert(err.response?.data || err.response?.data?.message || 'Action failed.');
        } finally {
            setActionId(null);
        }
    };

    const handleUnderReview = (app) =>
        runAction(app.id, () => applicationApi.updateStatus(app.id, STATUS_VALUE.UnderReview, null));

    const handleShortlist = (app) =>
        runAction(app.id, () => applicationApi.shortlist(app.id, null));

    const handleReject = (app) => {
        if (!window.confirm(`Reject ${candidateName(app)}'s application?`)) return;
        runAction(app.id, () => applicationApi.reject(app.id, null));
    };

    // ---- Schedule Interview modal ----

    const openScheduleModal = (app) => {
        setScheduleFor(app);
        setScheduleDate('');
        setScheduleTime('');
        setScheduleType('Online');
        setScheduleLink('');
        setScheduleLocation('');
        setScheduleError('');
    };

    const submitSchedule = async (e) => {
        e.preventDefault();
        if (!scheduleFor) return;

        setScheduleSubmitting(true);
        setScheduleError('');
        try {
            const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
            await interviewApi.schedule(
                scheduleFor.id,
                scheduledAt,
                INTERVIEW_TYPE[scheduleType],
                scheduleType === 'Online' ? scheduleLink : null,
                scheduleType !== 'Online' ? scheduleLocation : null,
                null,
                null
            );
            setScheduleFor(null);
            await loadApplications();
        } catch (err) {
            setScheduleError(err.response?.data || err.response?.data?.message || 'Failed to schedule interview.');
        } finally {
            setScheduleSubmitting(false);
        }
    };

    // ---- Manage (view / update / cancel) Interview modal ----

    const openManageModal = async (app) => {
        setManageFor(app);
        setManageInterview(null);
        setManageError('');
        setManageLoading(true);

        try {
            const res = await interviewApi.getByApplication(app.id);
            const interviews = res.data || [];
            // Most recent non-cancelled interview, or just the most recent one.
            const target =
                [...interviews].reverse().find((iv) => iv.status !== 3) || interviews[interviews.length - 1];

            if (!target) {
                setManageError('No interview found for this application.');
                return;
            }

            setManageInterview(target);
            const dt = new Date(target.scheduledAt);
            setManageDate(dt.toISOString().slice(0, 10));
            setManageTime(dt.toISOString().slice(11, 16));
            setManageLink(target.meetingLink || '');
            setManageLocation(target.location || '');
            setManageNotes(target.notes || '');
        } catch (err) {
            setManageError('Failed to load interview details.');
        } finally {
            setManageLoading(false);
        }
    };

    const submitManageUpdate = async (e) => {
        e.preventDefault();
        if (!manageInterview) return;

        setManageSubmitting(true);
        setManageError('');
        try {
            const scheduledAt = new Date(`${manageDate}T${manageTime}`).toISOString();
            await interviewApi.update(manageInterview.id, {
                scheduledAt,
                meetingLink: manageLink || null,
                location: manageLocation || null,
                panel: manageInterview.panel || null,
                notes: manageNotes || null,
                status: 'Scheduled',
            });
            setManageFor(null);
            await loadApplications();
        } catch (err) {
            setManageError(err.response?.data || err.response?.data?.message || 'Failed to update interview.');
        } finally {
            setManageSubmitting(false);
        }
    };

    const submitManageCancel = async () => {
        if (!manageInterview) return;
        if (!window.confirm('Cancel this interview?')) return;

        setManageSubmitting(true);
        setManageError('');
        try {
            await interviewApi.cancel(manageInterview.id, manageNotes || null);
            setManageFor(null);
            await loadApplications();
        } catch (err) {
            setManageError(err.response?.data || err.response?.data?.message || 'Failed to cancel interview.');
        } finally {
            setManageSubmitting(false);
        }
    };

    // ---- View Feedback modal ----

    const openFeedbackView = async (app) => {
        setFeedbackViewFor(app);
        setFeedbackList([]);
        setFeedbackViewError('');
        setFeedbackViewLoading(true);

        try {
            const res = await feedbackApi.getByApplication(app.id);
            setFeedbackList(res.data || []);
        } catch (err) {
            setFeedbackViewError(err.response?.data || err.response?.data?.message || 'Failed to load feedback.');
        } finally {
            setFeedbackViewLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#f9fafb' }}>
            <RecruiterSidebar />

            <div style={{ flex: 1, padding: '40px', boxSizing: 'border-box' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Candidate Pipeline</h2>
                <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>Review, shortlist, and manage interviews for your company's applicants.</p>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <input
                        type="text"
                        placeholder="🔍 Search candidate or job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                    <button
                        onClick={loadApplications}
                        disabled={loading}
                        style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '20px' }}>
                    {COLUMNS.map((column) => {
                        const columnApps = boardApps.filter((app) => column.statuses.includes(app.status));

                        return (
                            <div key={column.key} style={{ flex: 1, background: '#f3f4f6', padding: '16px', borderRadius: '12px', minHeight: '450px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h4 style={{ margin: 0, color: '#374151', fontWeight: '600' }}>{column.title}</h4>
                                    <span style={{ backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: '#4b5563' }}>
                                        {columnApps.length}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {columnApps.map((app) => {
                                        const busy = actionId === app.id;

                                        return (
                                            <div key={app.id} style={{ background: '#fff', padding: '14px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                    <span style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{candidateName(app)}</span>
                                                </div>

                                                <div style={{ color: '#4b5563', fontSize: '13px', fontWeight: '500' }}>{app.job?.title || 'Job'}</div>
                                                {candidateEmail(app) && (
                                                    <div style={{ color: '#9ca3af', fontSize: '11px', margin: '4px 0' }}>{candidateEmail(app)}</div>
                                                )}
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', margin: '4px 0 10px 0' }}>
                                                    {statusLabel(app.status)}
                                                </div>

                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {app.status === STATUS_VALUE.Applied && (
                                                        <button
                                                            disabled={busy}
                                                            onClick={() => handleUnderReview(app)}
                                                            style={{ flex: 1, backgroundColor: '#eff6ff', border: 'none', color: '#1d4ed8', fontSize: '11px', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            {busy ? '...' : 'Start Review'}
                                                        </button>
                                                    )}

                                                    {(app.status === STATUS_VALUE.Applied || app.status === STATUS_VALUE.UnderReview) && (
                                                        <>
                                                            <button
                                                                disabled={busy}
                                                                onClick={() => handleShortlist(app)}
                                                                style={{ flex: 1, backgroundColor: '#f0fdf4', border: 'none', color: '#166534', fontSize: '11px', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                            >
                                                                {busy ? '...' : 'Shortlist'}
                                                            </button>
                                                            <button
                                                                disabled={busy}
                                                                onClick={() => handleReject(app)}
                                                                style={{ flex: 1, backgroundColor: '#fef2f2', border: 'none', color: '#991b1b', fontSize: '11px', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                            >
                                                                {busy ? '...' : 'Reject'}
                                                            </button>
                                                        </>
                                                    )}

                                                    {app.status === STATUS_VALUE.Shortlisted && (
                                                        <button
                                                            disabled={busy}
                                                            onClick={() => openScheduleModal(app)}
                                                            style={{ flex: 1, backgroundColor: '#f5f3ff', border: 'none', color: '#6d28d9', fontSize: '11px', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            📅 Schedule Interview
                                                        </button>
                                                    )}

                                                    {app.status === STATUS_VALUE.InterviewScheduled && (
                                                        <button
                                                            onClick={() => openManageModal(app)}
                                                            style={{ flex: 1, backgroundColor: '#fffbeb', border: 'none', color: '#b45309', fontSize: '11px', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            🛠 Manage Interview
                                                        </button>
                                                    )}

                                                    {HAS_FEEDBACK_STATUSES.includes(app.status) && (
                                                        <button
                                                            onClick={() => openFeedbackView(app)}
                                                            style={{ flex: 1, backgroundColor: '#ecfeff', border: 'none', color: '#0e7490', fontSize: '11px', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                        >
                                                            📝 View Feedback
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => setTimelineFor(app)}
                                                        style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '11px', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                    >
                                                        🕒 Timeline
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: '24px' }}>
                    <button
                        onClick={() => setShowArchive(!showArchive)}
                        style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        {showArchive ? '▾' : '▸'} Rejected / Withdrawn ({archiveApps.length})
                    </button>

                    {showArchive && (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {archiveApps.map((app) => (
                                <div key={app.id} style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                    <span>{candidateName(app)} — {app.job?.title}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ color: '#9ca3af' }}>{statusLabel(app.status)}</span>
                                        <button
                                            onClick={() => setTimelineFor(app)}
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '11px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Timeline
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {archiveApps.length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px' }}>Nothing here.</p>}
                        </div>
                    )}
                </div>
            </div>

            {scheduleFor && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '400px' }}>
                        <h3 style={{ margin: '0 0 16px 0' }}>Schedule Interview</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                            For <b>{candidateName(scheduleFor)}</b> — {scheduleFor.job?.title}
                        </p>

                        {scheduleError && (
                            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
                                {scheduleError}
                            </div>
                        )}

                        <form onSubmit={submitSchedule}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Date</label>
                                <input type="date" required value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Time</label>
                                <input type="time" required value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Type</label>
                                <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}>
                                    <option value="Online">Online</option>
                                    <option value="Physical">Physical</option>
                                    <option value="Phone">Phone</option>
                                </select>
                            </div>
                            {scheduleType === 'Online' ? (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Meeting Link</label>
                                    <input type="url" placeholder="https://meet..." value={scheduleLink} onChange={(e) => setScheduleLink(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                                </div>
                            ) : (
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Location</label>
                                    <input type="text" placeholder="Office address" value={scheduleLocation} onChange={(e) => setScheduleLocation(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setScheduleFor(null)} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={scheduleSubmitting} style={{ padding: '8px 14px', background: '#6d28d9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    {scheduleSubmitting ? 'Scheduling...' : 'Confirm Slot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {manageFor && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '420px' }}>
                        <h3 style={{ margin: '0 0 8px 0' }}>Manage Interview</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                            For <b>{candidateName(manageFor)}</b> — {manageFor.job?.title}
                        </p>

                        {manageError && (
                            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
                                {manageError}
                            </div>
                        )}

                        {manageLoading && <p style={{ color: '#6b7280', fontSize: '13px' }}>Loading interview details...</p>}

                        {manageInterview && (
                            <>
                                <div style={{ backgroundColor: '#f9fafb', padding: '10px 12px', borderRadius: '6px', marginBottom: '16px', fontSize: '12px', color: '#6b7280' }}>
                                    Current status: <b>{INTERVIEW_STATUS_LABEL[manageInterview.status] || manageInterview.status}</b>
                                    {' · '}Type: <b>{INTERVIEW_TYPE_LABEL[manageInterview.interviewType] || manageInterview.interviewType}</b>
                                </div>

                                <form onSubmit={submitManageUpdate}>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Date</label>
                                        <input type="date" required value={manageDate} onChange={(e) => setManageDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Time</label>
                                        <input type="time" required value={manageTime} onChange={(e) => setManageTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Meeting Link (if online)</label>
                                        <input type="url" value={manageLink} onChange={(e) => setManageLink(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Location (if physical)</label>
                                        <input type="text" value={manageLocation} onChange={(e) => setManageLocation(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Notes</label>
                                        <textarea rows={3} value={manageNotes} onChange={(e) => setManageNotes(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                        <button
                                            type="button"
                                            onClick={submitManageCancel}
                                            disabled={manageSubmitting}
                                            style={{ padding: '8px 14px', background: '#fef2f2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            Cancel Interview
                                        </button>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button type="button" onClick={() => setManageFor(null)} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                                            <button type="submit" disabled={manageSubmitting} style={{ padding: '8px 14px', background: '#6d28d9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                                {manageSubmitting ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {feedbackViewFor && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '440px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 8px 0' }}>Interview Feedback</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                            For <b>{candidateName(feedbackViewFor)}</b> — {feedbackViewFor.job?.title}
                        </p>

                        {feedbackViewLoading && <p style={{ color: '#6b7280', fontSize: '13px' }}>Loading feedback...</p>}

                        {feedbackViewError && (
                            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
                                {feedbackViewError}
                            </div>
                        )}

                        {!feedbackViewLoading && !feedbackViewError && feedbackList.length === 0 && (
                            <p style={{ color: '#9ca3af', fontSize: '13px' }}>No feedback has been submitted yet.</p>
                        )}

                        {feedbackList.map((fb) => (
                            <div key={fb.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px', fontSize: '13px' }}>
                                    <div><span style={{ color: '#6b7280' }}>Technical</span><br /><b>{fb.technicalScore}/10</b></div>
                                    <div><span style={{ color: '#6b7280' }}>Communication</span><br /><b>{fb.communicationScore}/10</b></div>
                                    <div><span style={{ color: '#6b7280' }}>Problem Solving</span><br /><b>{fb.problemSolvingScore}/10</b></div>
                                </div>
                                <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                                    <span style={{ color: '#6b7280' }}>Recommendation: </span>
                                    <b style={{
                                        color: fb.recommendation === 1 ? '#166534' : fb.recommendation === 3 ? '#991b1b' : '#b45309'
                                    }}>
                                        {RECOMMENDATION_LABEL[fb.recommendation] || fb.recommendation}
                                    </b>
                                </div>
                                {fb.comments && (
                                    <div style={{ fontSize: '13px', color: '#374151', marginBottom: '6px' }}>{fb.comments}</div>
                                )}
                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                    Submitted {new Date(fb.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button onClick={() => setFeedbackViewFor(null)} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {timelineFor && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '420px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 8px 0' }}>Application Timeline</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                            For <b>{candidateName(timelineFor)}</b> — {timelineFor.job?.title}
                        </p>

                        {(() => {
                            const history = [...(timelineFor.statusHistory || [])].sort(
                                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                            );

                            if (history.length === 0) {
                                return <p style={{ color: '#9ca3af', fontSize: '13px' }}>No status changes recorded yet.</p>;
                            }

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {history.map((h, idx) => (
                                        <div key={h.id} style={{ display: 'flex', gap: '10px', position: 'relative', paddingBottom: '14px' }}>
                                            {idx !== history.length - 1 && (
                                                <div style={{ position: 'absolute', left: '4px', top: '12px', bottom: 0, width: '2px', background: '#e2e8f0' }} />
                                            )}
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4f46e5', marginTop: '3px', flexShrink: 0 }} />
                                            <div style={{ fontSize: '13px' }}>
                                                <div style={{ color: '#111827' }}>
                                                    {statusLabel(h.fromStatus)} → <b>{statusLabel(h.toStatus)}</b>
                                                </div>
                                                {h.notes && <div style={{ color: '#4b5563', marginTop: '2px' }}>{h.notes}</div>}
                                                <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '2px' }}>
                                                    {new Date(h.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button onClick={() => setTimelineFor(null)} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateTracker;