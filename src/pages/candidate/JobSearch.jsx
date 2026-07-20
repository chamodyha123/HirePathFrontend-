import React, { useEffect, useState } from 'react';
import applicationApi from '../../api/applicationApi';
import candidateService from '../../api/candidateService';
import api from '../../api/axios';
import './JobSearch.css';
import './Profile.css';

function JobSearch() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');

    const [openJobId, setOpenJobId] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [applyingId, setApplyingId] = useState(null);
    const [feedback, setFeedback] = useState({}); // { [jobId]: { type, message } }

    // Candidate's resumes, loaded once — used to populate the picker in
    // the apply form. If this stays empty, applying still works (the
    // backend falls back to the candidate's primary resume).
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');

    useEffect(() => {
        loadActiveJobs();
        loadResumes();
    }, []);

    const loadActiveJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/Jobs/active');
            setJobs(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load jobs.');
        } finally {
            setLoading(false);
        }
    };

    const loadResumes = async () => {
        try {
            const data = await candidateService.getResumes();
            const list = data || [];
            setResumes(list);

            const primary = list.find((r) => r.isPrimary);
            if (primary) setSelectedResumeId(String(primary.id));
            else if (list.length > 0) setSelectedResumeId(String(list[0].id));
        } catch (err) {
            // Not fatal — the apply form still works without a resume list,
            // the backend will fall back to the primary resume on file.
            console.error('Failed to load resumes:', err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!keyword.trim()) {
            loadActiveJobs();
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await api.get('/Jobs/search', { params: { keyword } });
            setJobs(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Search failed.');
        } finally {
            setLoading(false);
        }
    };

    const openApplyForm = (jobId) => {
        setOpenJobId(openJobId === jobId ? null : jobId);
        setCoverLetter('');
        setFeedback((prev) => ({ ...prev, [jobId]: null }));
    };

    const submitApplication = async (jobId) => {
        setApplyingId(jobId);
        setFeedback((prev) => ({ ...prev, [jobId]: null }));

        try {
            await applicationApi.apply(jobId, coverLetter || null, selectedResumeId || null);
            setFeedback((prev) => ({
                ...prev,
                [jobId]: { type: 'success', message: 'Applied successfully! Check Track Applications for status.' },
            }));
            setOpenJobId(null);
        } catch (err) {
            const message = err.response?.data || err.response?.data?.message || 'Failed to apply for this job.';
            setFeedback((prev) => ({ ...prev, [jobId]: { type: 'error', message } }));
        } finally {
            setApplyingId(null);
        }
    };

    return (
        <div>
            <h2>🔍 Search & Apply Jobs</h2>

            <form className="search-container" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search by job title or keyword..."
                    className="form-input"
                    style={{ maxWidth: '400px' }}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <div className="tracker-error">{error}</div>}

            {!loading && jobs.length === 0 && !error && (
                <p className="tracker-empty">No open jobs found right now. Try a different search.</p>
            )}

            {resumes.length === 0 && (
                <div className="tracker-error" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
                    You haven't uploaded a resume yet. Add one in your Profile before applying, or applications will be rejected.
                </div>
            )}

            <div className="job-grid">
                {jobs.map((job) => {
                    const isOpen = openJobId === job.id;
                    const jobFeedback = feedback[job.id];

                    return (
                        <div key={job.id} className="job-card">
                            <div>
                                <h3 className="job-title">{job.title}</h3>
                                <div className="job-company">
                                    🏢 {job.company?.name || 'Company'} | 📍 {job.location}
                                </div>
                            </div>

                            {jobFeedback && (
                                <div
                                    className="tracker-error"
                                    style={
                                        jobFeedback.type === 'success'
                                            ? { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }
                                            : undefined
                                    }
                                >
                                    {jobFeedback.message}
                                </div>
                            )}

                            {isOpen ? (
                                <div>
                                    {resumes.length > 0 && (
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
                                                Resume to submit
                                            </label>
                                            <select
                                                className="form-input"
                                                style={{ width: '100%', boxSizing: 'border-box' }}
                                                value={selectedResumeId}
                                                onChange={(e) => setSelectedResumeId(e.target.value)}
                                            >
                                                {resumes.map((r) => (
                                                    <option key={r.id} value={r.id}>
                                                        {r.fileName}{r.isPrimary ? ' (Primary)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <textarea
                                        className="form-input"
                                        placeholder="Add a short cover letter (optional)..."
                                        rows={4}
                                        style={{ width: '100%', marginTop: '10px', boxSizing: 'border-box' }}
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button
                                            className="btn-primary"
                                            style={{ flex: 1 }}
                                            disabled={applyingId === job.id}
                                            onClick={() => submitApplication(job.id)}
                                        >
                                            {applyingId === job.id ? 'Submitting...' : 'Submit Application'}
                                        </button>
                                        <button className="btn-secondary" onClick={() => openApplyForm(job.id)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => openApplyForm(job.id)}
                                    className="btn-primary"
                                    style={{ width: '100%', marginTop: '10px' }}
                                >
                                    Apply Now
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default JobSearch;