import React, { useState, useEffect } from 'react';
import candidateService from '../../api/candidateService';
import './Profile.css';

const SkillsSection = () => {
    const [skillsList, setSkillsList] = useState([]);
    const [skill, setSkill] = useState({ skillName: '', skillLevel: 'Beginner', yearsOfExperience: 0 });

    const loadSkills = () => {
        // 💡 Fix: getProfile එකට userId පාස් කරන්නේ නැත (Token එකෙන් backend එක අඳුරගනී)
        candidateService.getProfile().then(res => setSkillsList(res.skills || []));
    };

    useEffect(() => { 
        loadSkills(); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!skill.skillName.trim()) return;

        try {
            // 💡 Fix: userId එක මෙතනින් අයින් කළා. skill object එක විතරක් යවයි.
            await candidateService.addSkill(skill);
            setSkill({ skillName: '', skillLevel: 'Beginner', yearsOfExperience: 0 });
            loadSkills(); // ලිස්ට් එක Refresh කිරීම
        } catch (err) { 
            console.error(err);
            alert("Error adding skill"); 
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="profile-form" style={{ maxWidth: '400px' }}>
                <h3>⚡ Add Skill</h3>
                <input 
                    type="text" 
                    placeholder="Skill Name" 
                    value={skill.skillName} 
                    className="form-input" 
                    onChange={(e) => setSkill({...skill, skillName: e.target.value})} 
                />
                <select 
                    value={skill.skillLevel} 
                    className="form-select" 
                    onChange={(e) => setSkill({...skill, skillLevel: e.target.value})}
                >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                </select>
                <button type="submit" className="btn-primary">Add Skill</button>
            </form>
            
            <ul className="section-list">
                {skillsList.map(item => (
                    <li key={item.id} className="section-item">
                        <div><strong>{item.skillName}</strong> ({item.skillLevel})</div>
                        <button onClick={() => candidateService.deleteSkill(item.id).then(loadSkills)} className="btn-delete">
                            ❌ Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SkillsSection;