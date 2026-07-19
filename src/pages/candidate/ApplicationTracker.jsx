import React, { useState } from 'react';
import './ApplicationTracker.css';

function ApplicationTracker({ userId }) {
    const [applications] = useState([
        { id: 101, title: 'Full Stack Developer', company: 'TechLK Solutions', date: '2026-07-15', status: 'Pending' },
        { id: 102, title: 'React Developer', company: 'Mitra Innovation', date: '2026-07-10', status: 'Reviewed' }
    ]);

    return (
        <div>
            <h2>📊 Job Application Tracker</h2>
            <table className="tracker-table">
                <thead>
                    <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map(app => (
                        <tr key={app.id}>
                            <td><strong>{app.title}</strong></td>
                            <td>{app.company}</td>
                            <td>{app.date}</td>
                            <td>
                                <span className={`status-badge ${app.status.toLowerCase()}`}>
                                    {app.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ApplicationTracker;