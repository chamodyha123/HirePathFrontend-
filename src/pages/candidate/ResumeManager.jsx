import React, { useState, useEffect, useCallback } from 'react';
import candidateService from '../../api/candidateService';
import './Profile.css';

const ResumeManager = ({ userId }) => {
    const [file, setFile] = useState(null);
    const [isPrimary, setIsPrimary] = useState(false);
    const [resumesList, setResumesList] = useState([]);

    // 💡 Fix: getProfile එකට userId එක pass කිරීම සහ රී-රෙන්ඩර් වීම් වැළැක්වීමට useCallback භාවිතය
    const loadResumes = useCallback(() => {
        if (!userId) return;
        candidateService.getProfile(userId)
            .then(res => {
                setResumesList(res.resumes || []);
            })
            .catch(err => {
                console.error("Error loading profile resumes:", err);
            });
    }, [userId]);

    useEffect(() => { 
        loadResumes(); 
    }, [loadResumes]);

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }
        
        try {
            await candidateService.uploadResume(file, isPrimary);
            setFile(null);
            setIsPrimary(false);
            
            // File input එක reset කිරීම සඳහා DOM එක clean කිරීම
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = "";

            loadResumes(); // ලිස්ට් එක Refresh කිරීම
            alert("Resume uploaded successfully!");
        } catch (err) { 
            console.error(err);
            alert("Upload failed. Please check the console for details."); 
        }
    };

    const handleDelete = async (resumeId) => {
        if (window.confirm("Are you sure you want to delete this resume?")) {
            try {
                await candidateService.deleteResume(resumeId);
                loadResumes(); // ලිස්ට් එක Refresh කිරීම
            } catch (err) {
                console.error("Delete failed:", err);
                alert("Could not delete the resume.");
            }
        }
    };

    return (
        <div>
            <h2>📄 Manage Resumes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '20px 0' }}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} /> 
                    Primary Resume
                </label>
                <button onClick={handleUpload} className="btn-primary" style={{ width: 'fit-content' }}>
                    Upload
                </button>
            </div>
            
            <ul className="section-list">
                {resumesList.length === 0 ? (
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>No resumes uploaded yet.</p>
                ) : (
                    resumesList.map(item => (
                        <li key={item.id} className="section-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
                            <a href={`http://localhost:5139${item.filePath}`} target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>
                                {item.fileName} {item.isPrimary && <strong style={{ color: '#10b981', marginLeft: '5px' }}>(Primary)</strong>}
                            </a>
                            <button onClick={() => handleDelete(item.id)} className="btn-delete" style={{ cursor: 'pointer' }}>
                                ❌ Delete
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default ResumeManager;