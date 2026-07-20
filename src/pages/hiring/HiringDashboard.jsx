import React, { useEffect, useState } from 'react';
import HiringSidebar from './HiringSidebar';
import applicationApi, { statusLabel, STATUS_VALUE } from '../../api/applicationApi';
import interviewApi from '../../api/interviewApi';
import feedbackApi, { RECOMMENDATION } from '../../api/feedbackApi';
import evaluationApi from '../../api/evaluationApi';

const RELEVANT_STATUSES = [
    STATUS_VALUE.InterviewScheduled,
    STATUS_VALUE.Interviewed,
    STATUS_VALUE.Offered,
    STATUS_VALUE.Hired,
];

const HAS_FEEDBACK_STATUSES = [STATUS_VALUE.Interviewed, STATUS_VALUE.Offered, STATUS_VALUE.Hired];
const RECOMMENDATION_LABEL = { 1: 'Hire', 2: 'Hold', 3: 'Reject' };

function candidateName(app) {
    return app.candidateProfile?.user?.fullName || app.candidateProfile?.headline || 'Candidate';
}

const HiringDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null);

    // Feedback submission modal
    const [feedbackFor, setFeedbackFor] = useState(null);
    const [interviewId, setInterviewId] = useState(null);
    const [technicalScore, setTechnicalScore] = useState(7);
    const [communicationScore, setCommunicationScore] = useState(7);
    const [problemSolvingScore, setProblemSolvingScore] = useState(7);
    const [comments, setComments] = useState('');
    const [recommendation, setRecommendation] = useState(RECOMMENDATION.Hire);
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');

    // Evaluation modal
    const [evalFor, setEvalFor] = useState(null);
    const [resumeScore, setResumeScore] = useState('');
    const [aiScore, setAiScore] = useState('');
    const [evalResult, setEvalResult] = useState(null);
    const [evalSubmitting, setEvalSubmitting] = useState(false);
    const [evalError, setEvalError] = useState('');

    // View Feedback modal (read-only)
    const [feedbackViewFor, setFeedbackViewFor] = useState(null);
    const [feedbackList, setFeedbackList] = useState([]);
    const [feedbackViewLoading, setFeedbackViewLoading] = useState(false);
    const [feedbackViewError, setFeedbackViewError] = useState('');

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await applicationApi.getByCompany();
            setApplications(res.data.filter((app) => RELEVANT_STATUSES.includes(app.status)));
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to load applications.');
        } finally {
            setLoading(false);
        }
    };

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

    const handleOffer = (app) =>
        runAction(app.id, () => applicationApi.offer(app.id, null));

    const handleHire = (app) =>
        runAction(app.id, () => applicationApi.hire(app.id, null));

    // ---- Submit Feedback modal ----

    const openFeedback = async (app) => {
        setFeedbackFor(app);
        setInterviewId(null);
        setTechnicalScore(7);
        setCommunicationScore(7);
        setProblemSolvingScore(7);
        setComments('');
        setRecommendation(RECOMMENDATION.Hire);
        setFeedbackError('');

        try {
            const res = await interviewApi.getByApplication(app.id);
            const interviews = res.data || [];
            // Prefer a still-Scheduled interview (status 1); otherwise take the most recent.
            const target = interviews.find((iv) => iv.status === 1) || interviews[interviews.length - 1];
            if (!target) {
                setFeedbackError('No interview found for this application.');
                return;
            }
            setInterviewId(target.id);
        } catch (err) {
            setFeedbackError('Failed to load interview details.');
        }
    };

    const submitFeedback = async (e) => {
        e.preventDefault();
        if (!interviewId) return;

        setFeedbackSubmitting(true);
        setFeedbackError('');
        try {
            await feedbackApi.submit(
                interviewId,
                Number(technicalScore),
                Number(communicationScore),
                Number(problemSolvingScore),
                comments || null,
                recommendation
            );
            setFeedbackFor(null);
            await loadApplications();
        } catch (err) {
            setFeedbackError(err.response?.data || err.response?.data?.message || 'Failed to submit feedback.');
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    // ---- Evaluation modal ----

    const openEvaluation = async (app) => {
        setEvalFor(app);
        setResumeScore('');
        setAiScore('');
        setEvalResult(null);
        setEvalError('');

        try {
            const res = await evaluationApi.getByApplication(app.id);
            setEvalResult(res.data);
        } catch {
            // No evaluation yet — that's fine, the form starts blank.
        }
    };

    const submitEvaluation = async (e) => {
        e.preventDefault();
        if (!evalFor) return;

        setEvalSubmitting(true);
        setEvalError('');
        try {
            const res = await evaluationApi.createOrUpdate(
                evalFor.id,
                resumeScore === '' ? null : Number(resumeScore),
                aiScore === '' ? null : Number(aiScore)
            );
            setEvalResult(res.data);
        } catch (err) {
            setEvalError(err.response?.data || err.response?.data?.message || 'Failed to run evaluation.');
        } finally {
            setEvalSubmitting(false);
        }
    };

    // ---- View Feedback modal (read-only) ----

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
            <HiringSidebar />

            <div style={{ flex: 1, padding: '40px', boxSizing: 'border-box' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Interview Pipeline</h2>
                <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>Submit feedback, evaluate, and progress candidates through offer and hire.</p>

                <div style={{ marginBottom: '20px' }}>
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

                {!loading && applications.length === 0 && !error && (
                    <p style={{ color: '#9ca3af' }}>No candidates in your interview pipeline right now.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {applications.map((app) => {
                        const busy = actionId === app.id;

                        return (
                            <div key={app.id} style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{candidateName(app)}</div>
                                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{app.job?.title}</div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', marginTop: '4px' }}>{statusLabel(app.status)}</div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {app.status === STATUS_VALUE.InterviewScheduled && (
                                        <button
                                            onClick={() => openFeedback(app)}
                                            style={{ backgroundColor: '#eff6ff', border: 'none', color: '#1d4ed8', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            Submit Feedback
                                        </button>
                                    )}

                                    {HAS_FEEDBACK_STATUSES.includes(app.status) && (
                                        <button
                                            onClick={() => openFeedbackView(app)}
                                            style={{ backgroundColor: '#ecfeff', border: 'none', color: '#0e7490', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            View Feedback
                                        </button>
                                    )}

                                    {app.status === STATUS_VALUE.Interviewed && (
                                        <>
                                            <button
                                                onClick={() => openEvaluation(app)}
                                                style={{ backgroundColor: '#f5f3ff', border: 'none', color: '#6d28d9', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                Evaluate
                                            </button>
                                            <button
                                                disabled={busy}
                                                onClick={() => handleOffer(app)}
                                                style={{ backgroundColor: '#fffbeb', border: 'none', color: '#b45309', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                {busy ? '...' : 'Send Offer'}
                                            </button>
                                        </>
                                    )}

                                    {app.status === STATUS_VALUE.Offered && (
                                        <button
                                            disabled={busy}
                                            onClick={() => handleHire(app)}
                                            style={{ backgroundColor: '#f0fdf4', border: 'none', color: '#166534', fontSize: '12px', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            {busy ? '...' : 'Mark Hired'}
                                        </button>
                                    )}

                                    {app.status === STATUS_VALUE.Hired && (
                                        <span style={{ color: '#166534', fontWeight: '700', fontSize: '13px' }}>✓ Hired</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {feedbackFor && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '420px' }}>
                        <h3 style={{ margin: '0 0 16px 0' }}>Interview Feedback</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>For <b>{candidateName(feedbackFor)}</b></p>

                        {feedbackError && (
                            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
                                {feedbackError}
                            </div>
                        )}

                        <form onSubmit={submitFeedback}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Technical</label>
                                    <input type="number" min="0" max="10" value={technicalScore} onChange={(e) => setTechnicalScore(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Communication</label>
                                    <input type="number" min="0" max="10" value={communicationScore} onChange={(e) => setCommunicationScore(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Problem Solving</label>
                                    <input type="number" min="0" max="10" value={problemSolvingScore} onChange={(e) => setProblemSolvingScore(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Comments</label>
                                <textarea rows={3} value={comments} onChange={(e) => setComments(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Recommendation</label>
                                <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}>
                                    <option value={RECOMMENDATION.Hire}>Hire</option>
                                    <option value={RECOMMENDATION.Hold}>Hold</option>
                                    <option value={RECOMMENDATION.Reject}>Reject</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setFeedbackFor(null)} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={feedbackSubmitting || !interviewId} style={{ padding: '8px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {evalFor && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '400px' }}>
                        <h3 style={{ margin: '0 0 16px 0' }}>Candidate Evaluation</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>For <b>{candidateName(evalFor)}</b></p>

                        {evalError && (
                            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px' }}>
                                {evalError}
                            </div>
                        )}

                        <form onSubmit={submitEvaluation}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>Resume Score (0-100, optional)</label>
                                <input type="number" min="0" max="100" value={resumeScore} onChange={(e) => setResumeScore(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>AI Score (0-100, optional — leave blank to use the system's match score)</label>
                                <input type="number" min="0" max="100" value={aiScore} onChange={(e) => setAiScore(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                            </div>

                            {evalResult && (
                                <div style={{ backgroundColor: '#f5f3ff', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                                    <div>Resume Score: <b>{evalResult.resumeScore ?? '—'}</b></div>
                                    <div>AI Match: <b>{evalResult.aiScore ?? '—'}</b></div>
                                    <div>Interview Score: <b>{evalResult.interviewScore ?? '—'}</b></div>
                                    <div style={{ marginTop: '4px', fontSize: '15px' }}>Overall Score: <b>{evalResult.overallScore ?? '—'}</b></div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setEvalFor(null)} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                                <button type="submit" disabled={evalSubmitting} style={{ padding: '8px 14px', background: '#6d28d9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    {evalSubmitting ? 'Running...' : 'Run / Update Evaluation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {feedbackViewFor && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '440px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 8px 0' }}>Interview Feedback</h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>For <b>{candidateName(feedbackViewFor)}</b></p>

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
        </div>
    );
};

export default HiringDashboard;