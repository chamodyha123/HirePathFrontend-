// src/api/candidateService.js
import api from './axios';

const candidateService = {
    // ============ PROFILE MANAGEMENT ============
    
    // ලොගින් වෙලා ඉන්න Candidate ගේ Profile එක ලබා ගැනීම
    getProfile: async (userId) => {
        const response = await api.get(`/Candidate?userId=${userId}`);
        return response.data;
    },

    // Admin/Recruiter කෙනෙකුට වෙනත් User කෙනෙකුගේ ID එක මඟින් Profile එක ලබා ගැනීම
    getProfileById: async (userId) => {
        const response = await api.get(`/Candidate/${userId}`);
        return response.data;
    },

    // අලුතින් Profile එකක් නිර්මාණය කිරීම
    createProfile: async (userId, profileData) => {
        const response = await api.post(`/Candidate?userId=${userId}`, { dto: profileData });
        return response.data;
    },

    // Profile එක Full Update කිරීම (PUT)
    updateProfile: async (userId, profileData) => {
        const response = await api.put(`/Candidate?userId=${userId}`, { dto: profileData });
        return response.data;
    },

    // ============ SKILLS MANAGEMENT ============
    
    // Skill එකක් ඇතුළත් කිරීම
    addSkill: async (skillData) => {
        const response = await api.post('/Candidate/skills', skillData);
        return response.data;
    },

    // Skill එකක් Update කිරීම
    updateSkill: async (skillId, skillData) => {
        const response = await api.put(`/Candidate/skills/${skillId}`, skillData);
        return response.data;
    },

    // Skill එකක් Delete කිරීම
    deleteSkill: async (skillId) => {
        const response = await api.delete(`/Candidate/skills/${skillId}`);
        return response.data;
    },

    // ============ EDUCATION MANAGEMENT ============
    
    // Education එකක් ඇතුළත් කිරීම
    addEducation: async (educationData) => {
        const response = await api.post('/Candidate/education', educationData);
        return response.data;
    },

    // Education එකක් Update කිරීම
    updateEducation: async (educationId, educationData) => {
        const response = await api.put(`/Candidate/education/${educationId}`, educationData);
        return response.data;
    },

    // Education එකක් Delete කිරීම
    deleteEducation: async (educationId) => {
        const response = await api.delete(`/Candidate/education/${educationId}`);
        return response.data;
    },

    // ============ EXPERIENCE MANAGEMENT ============
    
    // Experience එකක් ඇතුළත් කිරීම
    addExperience: async (experienceData) => {
        const response = await api.post('/Candidate/experience', experienceData);
        return response.data;
    },

    // Experience එකක් Update කිරීම
    updateExperience: async (experienceId, experienceData) => {
        const response = await api.put(`/Candidate/experience/${experienceId}`, experienceData);
        return response.data;
    },

    // Experience එකක් Delete කිරීම
    deleteExperience: async (experienceId) => {
        const response = await api.delete(`/Candidate/experience/${experienceId}`);
        return response.data;
    },

    // ============ RESUME MANAGEMENT ============
    
    // ලොගින් වී ඇති පරිශීලකයාගේ සියලුම Resumes ලබා ගැනීම
    getResumes: async () => {
        const response = await api.get('/Candidate/resumes');
        return response.data;
    },

    // Resume එකක් Upload කිරීම
    uploadResume: async (file, isPrimary = true, userId) => {
        const formData = new FormData();
        formData.append('File', file);
        formData.append('IsPrimary', isPrimary.toString());

        const url = userId ? `/Candidate/resume?userId=${userId}` : '/Candidate/resume';

        const response = await api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Resume එකක් Delete කිරීම
    deleteResume: async (resumeId) => {
        const response = await api.delete(`/Candidate/resume/${resumeId}`);
        return response.data;
    },

    // Primary Resume එක ලෙස සැකසීම
    setPrimaryResume: async (resumeId) => {
        const response = await api.put(`/Candidate/resume/${resumeId}/primary`);
        return response.data;
    },

    // ============ PROFILE PICTURE MANAGEMENT ============
    
    // Profile Picture එකක් Upload කිරීම
    uploadProfilePicture: async (file) => {
        const formData = new FormData();
        formData.append('File', file);

        const response = await api.post('/Candidate/profile-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Profile Picture එක Delete කිරීම
    deleteProfilePicture: async () => {
        const response = await api.delete('/Candidate/profile-picture');
        return response.data;
    },

    // ============================================
    // AI-POWERED FEATURES
    // ============================================

    /**
     * Parse resume using AI
     * @param {string} text - Resume text content
     * @returns {Promise} - Parsed resume data
     */
    parseResumeWithAI: async (text) => {
        const response = await api.post('/ai/parse-resume-text', { resumeText: text });
        return response.data;
    },

    /**
     * Parse resume file using AI
     * @param {File} file - Resume file (PDF, DOCX, TXT)
     * @returns {Promise} - Parsed resume data
     */
    parseResumeFileWithAI: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/ai/parse-resume-file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Extract skills from text using AI
     * @param {string} text - Text to extract skills from
     * @returns {Promise} - Extracted skills
     */
    extractSkillsWithAI: async (text) => {
        const response = await api.post('/ai/extract-skills', { text });
        return response.data;
    },

    /**
     * Get job recommendations for a candidate
     * @param {number} candidateId - Candidate ID
     * @param {number} limit - Max recommendations
     * @returns {Promise} - Job recommendations
     */
    getJobRecommendations: async (candidateId, limit = 10) => {
        const response = await api.post('/ai/recommendations', { 
            candidateId, 
            limit,
            includeApplied: false 
        });
        return response.data;
    },

    /**
     * Match a candidate to a specific job
     * @param {number} jobId - Job ID
     * @param {number} candidateId - Candidate ID
     * @returns {Promise} - Match result
     */
    matchCandidateToJob: async (jobId, candidateId) => {
        const response = await api.post('/ai/match', { jobId, candidateId });
        return response.data;
    },

    /**
     * Get recruitment analytics
     * @param {number} companyId - Company ID
     * @param {string} startDate - Start date (ISO)
     * @param {string} endDate - End date (ISO)
     * @returns {Promise} - Analytics data
     */
    getRecruitmentAnalytics: async (companyId, startDate = null, endDate = null) => {
        const response = await api.post('/ai/analytics', { companyId, startDate, endDate });
        return response.data;
    },

    /**
     * Generate AI recruitment report
     * @param {number} companyId - Company ID
     * @param {string} reportType - Type of report
     * @returns {Promise} - Report data
     */
    generateRecruitmentReport: async (companyId, reportType = 'comprehensive') => {
        const response = await api.post('/ai/report', { companyId, reportType, format: 'json' });
        return response.data;
    }
};

export default candidateService;