import api, { API_BASE_URL } from './axios';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/i, '');

export const toPublicFileUrl = (filePath) => {
  if (!filePath) return '';
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return `${API_ORIGIN}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
};

const candidateService = {
  // The backend identifies the logged-in candidate from the JWT token.
  getProfile: async () => (await api.get('/Candidate')).data,
  getProfileById: async (userId) => (await api.get(`/Candidate/${userId}`)).data,
  createProfile: async (profileData) => (await api.post('/Candidate', profileData)).data,
  updateProfile: async (profileData) => (await api.put('/Candidate', profileData)).data,
  deleteProfile: async () => (await api.delete('/Candidate')).data,

  addSkill: async (skillData) => (await api.post('/Candidate/skills', skillData)).data,
  updateSkill: async (skillId, skillData) => (await api.put(`/Candidate/skills/${skillId}`, skillData)).data,
  deleteSkill: async (skillId) => (await api.delete(`/Candidate/skills/${skillId}`)).data,

  addEducation: async (educationData) => (await api.post('/Candidate/education', educationData)).data,
  updateEducation: async (educationId, educationData) => (await api.put(`/Candidate/education/${educationId}`, educationData)).data,
  deleteEducation: async (educationId) => (await api.delete(`/Candidate/education/${educationId}`)).data,

  addExperience: async (experienceData) => (await api.post('/Candidate/experience', experienceData)).data,
  updateExperience: async (experienceId, experienceData) => (await api.put(`/Candidate/experience/${experienceId}`, experienceData)).data,
  deleteExperience: async (experienceId) => (await api.delete(`/Candidate/experience/${experienceId}`)).data,

  getResumes: async () => (await api.get('/Candidate/resumes')).data,
  uploadResume: async (file, isPrimary = false) => {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('IsPrimary', String(isPrimary));
    return (await api.post('/Candidate/resume', formData)).data;
  },
  deleteResume: async (resumeId) => (await api.delete(`/Candidate/resume/${resumeId}`)).data,
  setPrimaryResume: async (resumeId) => (await api.put(`/Candidate/resume/${resumeId}/primary`)).data,

  getProfilePicture: async () => (await api.get('/Candidate/profile-picture')).data,
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('File', file);
    return (await api.post('/Candidate/profile-picture', formData)).data;
  },
  deleteProfilePicture: async () => (await api.delete('/Candidate/profile-picture')).data,
};

export default candidateService;
