// src/components/AIResumeParser.jsx
import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';
import './AIResumeParser.css';

const AIResumeParser = ({ onParsed, onClose }) => {
    const [resumeText, setResumeText] = useState('');
    const [file, setFile] = useState(null);
    const [method, setMethod] = useState('text');
    const { loading, progress, error, parseResume, parseResumeFile, data, clearData } = useAI();

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            // Read file content for preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setResumeText(event.target.result);
            };
            reader.readAsText(selected);
        }
    };

    const handleParse = async () => {
        clearData();
        try {
            let result;
            if (method === 'file' && file) {
                result = await parseResumeFile(file);
            } else if (resumeText.trim()) {
                result = await parseResume(resumeText);
            } else {
                alert('Please enter resume text or select a file.');
                return;
            }

            if (result?.success && result?.data) {
                onParsed?.(result.data);
            }
        } catch (err) {
            console.error('Parse error:', err);
        }
    };

    const handleAutoFill = () => {
        const sampleResume = `John Doe
Senior Software Engineer
Email: john.doe@email.com
Phone: +1-555-123-4567

Summary:
Experienced full-stack developer with 8 years of experience in C#, JavaScript, React, and Azure cloud services.

Technical Skills:
C#, JavaScript, TypeScript, React, Node.js, SQL Server, Azure, Docker, Kubernetes, Git, CI/CD

Professional Experience:
Senior Software Engineer | TechCorp (2020-Present)
- Led development of microservices architecture using C# and .NET Core
- Implemented CI/CD pipelines using Azure DevOps
- Mentored 5 junior developers

Software Developer | StartupTech (2016-2020)
- Built full-stack web applications using React and Node.js
- Designed and optimized SQL databases

Education:
MS in Computer Science | Stanford University (2014-2016)
BS in Software Engineering | MIT (2010-2014)

Certifications:
Microsoft Certified: Azure Developer Associate
AWS Certified Solutions Architect`;
        setResumeText(sampleResume);
    };

    return (
        <div className="ai-resume-parser">
            <div className="parser-header">
                <h3>🤖 AI Resume Parser</h3>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="parser-method">
                <label>
                    <input
                        type="radio"
                        value="text"
                        checked={method === 'text'}
                        onChange={() => setMethod('text')}
                    />
                    Paste Text
                </label>
                <label>
                    <input
                        type="radio"
                        value="file"
                        checked={method === 'file'}
                        onChange={() => setMethod('file')}
                    />
                    Upload File
                </label>
            </div>

            {method === 'text' ? (
                <textarea
                    className="parser-textarea"
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={10}
                />
            ) : (
                <div className="parser-file-upload">
                    <input
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                    />
                    {file && (
                        <div className="file-info">
                            <span>📄 {file.name}</span>
                            <span className="file-size">
                                ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div className="parser-actions">
                <button className="btn-secondary" onClick={handleAutoFill}>
                    📝 Sample Resume
                </button>
                <button
                    className="btn-primary"
                    onClick={handleParse}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner" />
                            Parsing... {progress}%
                        </>
                    ) : (
                        '🔍 Parse with AI'
                    )}
                </button>
            </div>

            {loading && (
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
            )}

            {error && (
                <div className="parser-error">⚠️ {error}</div>
            )}

            {data?.success && data?.data && (
                <div className="parser-result">
                    <h4>✅ Parsed Results</h4>
                    <div className="result-grid">
                        <div className="result-item">
                            <label>Name</label>
                            <span>{data.data.fullName || 'N/A'}</span>
                        </div>
                        <div className="result-item">
                            <label>Email</label>
                            <span>{data.data.email || 'N/A'}</span>
                        </div>
                        <div className="result-item">
                            <label>Phone</label>
                            <span>{data.data.phone || 'N/A'}</span>
                        </div>
                        <div className="result-item">
                            <label>Experience</label>
                            <span>{data.data.yearsOfExperience || 0} years</span>
                        </div>
                    </div>

                    <div className="result-section">
                        <label>Skills</label>
                        <div className="skill-tags">
                            {data.data.skills?.map((skill, i) => (
                                <span key={i} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>

                    {data.data.experience?.length > 0 && (
                        <div className="result-section">
                            <label>Experience</label>
                            {data.data.experience.map((exp, i) => (
                                <div key={i} className="exp-item">
                                    <strong>{exp.title}</strong>
                                    <span>{exp.company}</span>
                                    <span className="exp-date">
                                        {exp.startDate?.slice(0, 7)} - {exp.isCurrent ? 'Present' : exp.endDate?.slice(0, 7)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {data.data.education?.length > 0 && (
                        <div className="result-section">
                            <label>Education</label>
                            {data.data.education.map((edu, i) => (
                                <div key={i} className="edu-item">
                                    <strong>{edu.degree}</strong>
                                    <span>{edu.institution}</span>
                                    <span className="edu-date">
                                        {edu.startDate?.slice(0, 7)} - {edu.isCurrent ? 'Present' : edu.endDate?.slice(0, 7)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIResumeParser;