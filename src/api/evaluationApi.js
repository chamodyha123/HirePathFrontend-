// src/api/evaluationApi.js
import api from './axios';

const evaluationApi = {
    /**
     * Create or update an evaluation
     * @param {number} jobApplicationId - Application ID
     * @param {number|null} resumeScore - Resume score (0-100)
     * @param {number|null} aiScore - AI match score (0-100)
     * @returns {Promise} - Evaluation data
     */
    createOrUpdate: async (jobApplicationId, resumeScore, aiScore) => {
        const response = await api.post('/evaluation', { 
            jobApplicationId, 
            resumeScore, 
            aiScore 
        });
        return response.data;
    },

    /**
     * Get evaluation by application ID
     * @param {number} applicationId - Application ID
     * @returns {Promise} - Evaluation data
     */
    getByApplication: async (applicationId) => {
        const response = await api.get(`/evaluation/${applicationId}`);
        return response.data;
    },
};

export default evaluationApi;