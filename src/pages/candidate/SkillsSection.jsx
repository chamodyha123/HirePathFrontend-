import React, { useState } from 'react';
// 💡 { candidateService } ලෙස Named Import එක නිවැරදි kar ඇත
import { candidateService } from '../../api/candidateService';

const SkillsSection = () => {
    const [skill, setSkill] = useState({ skillName: '', skillLevel: 'Beginner', yearsOfExperience: 0 });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!skill.skillName.trim()) {
            alert("Please enter a skill name!");
            return;
        }
        try {
            await candidateService.addSkill(skill);
            alert("Skill added successfully!");
        } catch (err) {
            console.error("Error adding skill:", err);
            alert("Failed to add skill. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Add New Skill</h3>
            <div style={{ margin: "10px 0" }}>
                <input 
                    placeholder="Skill Name" 
                    value={skill.skillName}
                    onChange={(e) => setSkill({...skill, skillName: e.target.value})} 
                />
            </div>
            <div style={{ margin: "10px 0" }}>
                <select value={skill.skillLevel} onChange={(e) => setSkill({...skill, skillLevel: e.target.value})}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                </select>
            </div>
            <button type="submit">Add Skill</button>
        </form>
    );
};

export default SkillsSection;