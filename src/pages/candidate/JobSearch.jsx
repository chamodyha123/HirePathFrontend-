import React, { useState } from 'react';
import './JobSearch.css';
import './Profile.css';

function JobSearch({ userId }) {
    // mock data පෙන්නන්න හදලා තියෙන්නේ, පස්සේ backend job API එකට සම්බන්ධ කරන්න පුළුවන්
    const [jobs] = useState([
        { id: 1, title: 'Full Stack Developer', company: 'TechLK Solutions', location: 'Colombo' },
        { id: 2, title: 'Backend Engineer (Java)', company: 'CloudNexus', location: 'Remote' }
    ]);

    const handleApply = (jobId) => {
        alert(`Applied successfully for Job ID: ${jobId}`);
    };

    return (
        <div>
            <h2>🔍 Search & Apply Jobs</h2>
            <div className="search-container">
                <input type="text" placeholder="Search by job title or keyword..." className="form-input" style={{ maxWidth: '400px' }} />
                <button className="btn-primary">Search</button>
            </div>

            <div className="job-grid">
                {jobs.map(job => (
                    <div key={job.id} className="job-card">
                        <div>
                            <h3 className="job-title">{job.title}</h3>
                            <div className="job-company">🏢 {job.company} | 📍 {job.location}</div>
                        </div>
                        <button onClick={() => handleApply(job.id)} className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Apply Now</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default JobSearch;