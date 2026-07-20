import api from './axios';

export const INTERVIEW_TYPE = {
    Online: 1,
    Physical: 2,
    Phone: 3,
};

const interviewApi = {
    schedule: (jobApplicationId, scheduledAt, interviewType, meetingLink, location, panel, notes) =>
        api.post('/Interview/schedule', {
            jobApplicationId,
            scheduledAt,
            interviewType,
            meetingLink: meetingLink || null,
            location: location || null,
            panel: panel || null,
            notes: notes || null,
        }),

    getByApplication: (applicationId) => api.get(`/Interview/application/${applicationId}`),

    getById: (id) => api.get(`/Interview/${id}`),

    getByCompany: () => api.get('/Interview/company'),

    update: (interviewId, { scheduledAt, meetingLink, location, panel, notes, status }) =>
        api.put('/Interview/update', {
            interviewId,
            scheduledAt,
            meetingLink,
            location,
            panel,
            notes,
            status,
        }),

    cancel: (id, notes) => api.put(`/Interview/cancel/${id}`, notes, {
        headers: { 'Content-Type': 'application/json' },
    }),
};

export default interviewApi;