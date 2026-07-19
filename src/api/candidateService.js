import api from './axios'; // ඔයා හදපු axios instance එක

const candidateService = {
    // ============ PROFILE MANAGEMENT ============
    
    // ලොගින් වෙලා ඉන්න Candidate ගේ Profile එක ලබා ගැනීම
    getProfile: async (userId) => {
        // 💡 ලොගින් වෙලා ඉන්න යූසර්ගේ data ඇදලා ගන්න query parameter එකක් විදිහට userId එක යැවීම සුරක්ෂිතයි
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
        // 💡 FIX: Backend .NET DTO Wrapper එකට ගැලපෙන්න { dto: profileData } ලෙසත්, 
        // query path එකට userId එකත් එකතු කර ඇත.
        const response = await api.post(`/Candidate?userId=${userId}`, { dto: profileData });
        return response.data;
    },

    // Profile එක Full Update කිරීම (PUT)
    updateProfile: async (userId, profileData) => {
        // 💡 FIX: UpdateCandidateProfileDto එකේ Id/UserId නැති නිසා, 
        // backend එක හඳුනාගන්නේ query එකේ යන userId එකෙන් සහ { dto: ... } wrapper එකෙනි.
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
    uploadResume: async (file, isPrimary) => {
        const formData = new FormData();
        formData.append('File', file);
        formData.append('IsPrimary', String(isPrimary));

        // 💡 Content-Type Header එක අතින් දාන්නේ නැත (Axios විසින් Boundary එක ඇතුළුව Auto සකසයි)
        const response = await api.post('/Candidate/resume', formData);
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

        const response = await api.post('/Candidate/profile-picture', formData);
        return response.data;
    },

    // Profile Picture එක Delete කිරීම
    deleteProfilePicture: async () => {
        const response = await api.delete('/Candidate/profile-picture');
        return response.data;
    }
};

export default candidateService;