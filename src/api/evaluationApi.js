import api from './axios';

const evaluationApi = {
    createOrUpdate: (jobApplicationId, resumeScore, aiScore) =>
        api.post('/evaluation', { jobApplicationId, resumeScore, aiScore }),

    getByApplication: (applicationId) => api.get(`/evaluation/${applicationId}`),
};

export default evaluationApi;