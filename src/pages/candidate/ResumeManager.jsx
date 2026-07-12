import React, { useState } from 'react';
// 💡 { candidateService } ලෙස Named Import එක නිවැරදි කර ඇත
import { candidateService } from '../../api/candidateService';

const ResumeManager = () => {
    const [file, setFile] = useState(null);

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }
        try {
            await candidateService.uploadResume(file);
            alert("Resume uploaded successfully!");
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed. Please try again.");
        }
    };

    return (
        <div>
            <h2>Manage Resumes</h2>
            <div style={{ margin: "20px 0" }}>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </div>
            <button onClick={handleUpload}>Upload Resume</button>
        </div>
    );
};

export default ResumeManager;