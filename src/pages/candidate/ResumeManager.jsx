import React, { useState, useEffect } from 'react';
import candidateService from '../../api/candidateService';
import './Profile.css';

const ResumeManager = ({ userId }) => {
    const [file, setFile] = useState(null);
    const [isPrimary, setIsPrimary] = useState(false);
    const [resumesList, setResumesList] = useState([]);

    const loadResumes = () => {
        // Profile එක ඇතුළෙන් Resumes list එක ගන්නවා
        candidateService.getProfile().then(res => setResumesList(res.resumes || []));
    };

    useEffect(() => { 
        loadResumes(); 
    }, []);

    const handleUpload = async () => {
        if (!file) return;
        try {
            // 💡 ️Fix: සර්විස් එක බලාපොරොත්තු වන පරිදි (file, isPrimary) පමණක් ලබා දීම
            await candidateService.uploadResume(file, isPrimary);
            setFile(null);
            setIsPrimary(false);
            loadResumes(); // ලිස්ට් එක Refresh කිරීම
            alert("Resume uploaded successfully!");
        } catch (err) { 
            console.error(err);
            alert("Upload failed. Please check the console for details."); 
        }
    };

    return (
        <div>
            <h2>📄 Manage Resumes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '20px 0' }}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
                <label>
                    <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} /> 
                    Primary Resume
                </label>
                <button onClick={handleUpload} className="btn-primary" style={{ width: 'fit-content' }}>
                    Upload
                </button>
            </div>
            
            <ul className="section-list">
                {resumesList.map(item => (
                    <li key={item.id} className="section-item">
                        <a href={`http://localhost:5139${item.filePath}`} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>
                            {item.fileName} {item.isPrimary && <strong style={{ color: '#10b981' }}>(Primary)</strong>}
                        </a>
                        <button onClick={() => candidateService.deleteResume(item.id).then(loadResumes)} className="btn-delete">
                            ❌ Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ResumeManager;