import api from './axios'; // අපේ සකස් කළ instance (api) එක (Token එක auto-inject වෙන එක)

export const candidateService = {
  // ==========================================
  // 1. Profile Management
  // ==========================================
  
  // සියලුම අපේක්ෂකයින් ලබා ගැනීම (GET /api/Candidate)
  getAllCandidates: () => api.get('/Candidate'),
  
  // අලුත් Profile එකක් සෑදීම (POST /api/Candidate)
  createProfile: (data) => api.post('/Candidate', data),
  
  // ප්‍රොෆයිල් එක සම්පූර්ණයෙන්ම යාවත්කාලීන කිරීම (PUT /api/Candidate)
  updateProfile: (data) => api.put('/Candidate', data),
  
  // ප්‍රොෆයිල් එකේ කොටසක් පමණක් යාවත්කාලීන කිරීම (PATCH /api/Candidate)
  patchProfile: (data) => api.patch('/Candidate', data),
  
  // ප්‍රොෆයිල් එක මකා දැමීම (DELETE /api/Candidate)
  deleteProfile: () => api.delete('/Candidate'),
  
  // 💡 ID එක අනුව ප්‍රොෆයිල් එක ලබා ගැනීම (GET /api/Candidate/{userId})
  getProfile: (userId) => api.get(`/Candidate/${userId}`),
  
  // අපේක්ෂකයින් සෙවීම (GET /api/Candidate/search)
  searchCandidates: (params) => api.get('/Candidate/search', { params }),
  
  // නිපුණතා නම අනුව සෙවීම (GET /api/Candidate/skill/{skillName})
  getCandidatesBySkill: (skillName) => api.get(`/Candidate/skill/${skillName}`),


  // ==========================================
  // 2. Skills Section
  // ==========================================
  
  // අලුත් Skill එකක් එකතු කිරීම (POST /api/Candidate/skills)
  addSkill: (data) => api.post('/Candidate/skills', data),
  
  // Skill එකක් වෙනස් කිරීම (PUT /api/Candidate/skills/{id})
  updateSkill: (id, data) => api.put(`/Candidate/skills/${id}`, data),
  
  // Skill එකක් මකා දැමීම (DELETE /api/Candidate/skills/${id})
  deleteSkill: (id) => api.delete(`/Candidate/skills/${id}`),


  // ==========================================
  // 3. Education Section
  // ==========================================
  
  // අධ්‍යාපන විස්තර එකතු කිරීම (POST /api/Candidate/education)
  addEducation: (data) => api.post('/Candidate/education', data),
  
  // අධ්‍යාපන විස්තර වෙනස් කිරීම (PUT /api/Candidate/education/{id})
  updateEducation: (id, data) => api.put(`/Candidate/education/${id}`, data),
  
  // අධ්‍යාපන විස්තර මකා දැමීම (DELETE /api/Candidate/education/${id})
  deleteEducation: (id) => api.delete(`/Candidate/education/${id}`),


  // ==========================================
  // 4. Experience Section
  // ==========================================
  
  // රැකියා පළපුරුද්දක් එකතු කිරීම (POST /api/Candidate/experience)
  addExperience: (data) => api.post('/Candidate/experience', data),
  
  // රැකියා පළපුරුද්දක් වෙනස් කිරීම (PUT /api/Candidate/experience/{id})
  updateExperience: (id, data) => api.put(`/Candidate/experience/${id}`, data),
  
  // රැකියා පළපුරුද්දක් මකා දැමීම (DELETE /api/Candidate/experience/${id})
  deleteExperience: (id) => api.delete(`/Candidate/experience/${id}`),


  // ==========================================
  // 5. Resume Management
  // ==========================================
  
  // සියලුම CV ලැයිස්තුව ලබා ගැනීම (GET /api/Candidate/resumes)
  getResumes: () => api.get('/Candidate/resumes'),
  
  // අලුත් CV එකක් අප්ලෝඩ් කිරීම (POST /api/Candidate/resume)
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/Candidate/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // CV එකක් මකා දැමීම (DELETE /api/Candidate/resume/{id})
  deleteResume: (id) => api.delete(`/Candidate/resume/${id}`),
  
  // ප්‍රධාන CV එක ලෙස තේරීම (PUT /api/Candidate/resume/{id}/primary)
  setPrimaryResume: (id) => api.put(`/Candidate/resume/${id}/primary`)
};