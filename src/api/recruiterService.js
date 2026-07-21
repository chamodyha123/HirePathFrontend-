import api from './axios';

const extractArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.$values && Array.isArray(data.$values)) return data.$values;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
};

const recruiterService = {
    // Dashboard
    getDashboardStats: async () => {
        const res = await api.get('/Recruiter/dashboard/stats');
        return res.data;
    },

    getRecentJobs: async (limit = 5) => {
        const res = await api.get('/Recruiter/jobs/search');
        return extractArray(res.data).slice(0, limit);
    },

    // Jobs
    getJobs: async (params = {}) => {
        const res = await api.get('/Recruiter/jobs/search', { params });
        return extractArray(res.data);
    },

    getJobById: async (id) => {
        const res = await api.get(`/Recruiter/jobs/${id}`);
        return res.data;
    },

    createJob: async (payload) => {
        const res = await api.post('/Recruiter/jobs', payload);
        return res.data;
    },

    updateJob: async (id, payload) => {
        const res = await api.put(`/Recruiter/jobs/${id}`, payload);
        return res.data;
    },

    deleteJob: async (id) => {
        const res = await api.delete(`/Recruiter/jobs/${id}`);
        return res.data;
    },

    // Companies
    getCompanies: async () => {
        const res = await api.get('/Recruiter/companies');
        return extractArray(res.data);
    },

    createCompany: async (payload) => {
        const res = await api.post('/Recruiter/companies', payload);
        return res.data;
    },

    // Departments
    getDepartments: async (companyId) => {
        const res = await api.get(`/Recruiter/companies/${companyId}/departments`);
        return extractArray(res.data);
    },

    createDepartment: async (payload) => {
        const res = await api.post('/Recruiter/departments', payload);
        return res.data;
    },
};

export default recruiterService;
