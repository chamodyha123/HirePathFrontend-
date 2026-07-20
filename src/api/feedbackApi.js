import api from './axios';

export const RECOMMENDATION = {
    Hire: 'Hire',
    Hold: 'Hold',
    Reject: 'Reject',
};

const feedbackApi = {
    submit: (interviewId, technicalScore, communicationScore, problemSolvingScore, comments, recommendation) =>
        api.post('/feedback', {
            interviewId,
            technicalScore,
            communicationScore,
            problemSolvingScore,
            comments,
            recommendation,
        }),

    getByApplication: (applicationId) => api.get(`/feedback/${applicationId}`),
};

export default feedbackApi;