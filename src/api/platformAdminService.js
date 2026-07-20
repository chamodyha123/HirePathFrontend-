import api from "./axios";

const platformAdminService = {
    // Dashboard metrics
    getDashboardStats: async () => {
        const response = await api.get("/platform-admin/dashboard");
        return response.data;
    },

    // Live activity feed for the Control Room ticker
    getRecentActivity: async () => {
        const response = await api.get("/platform-admin/activity");
        return response.data;
    },

    // Companies operations
    getAllCompanies: async () => {
        const response = await api.get("/platform-admin/companies");
        return response.data;
    },

    getPendingCompanies: async () => {
        const response = await api.get("/platform-admin/companies/pending");
        return response.data;
    },

    approveCompany: async (companyId) => {
        const response = await api.put(`/platform-admin/companies/${companyId}/approve`);
        return response.data;
    },

    rejectCompany: async (companyId, reason) => {
        const response = await api.put(`/platform-admin/companies/${companyId}/reject`, { reason });
        return response.data;
    },

    suspendCompany: async (companyId) => {
        const response = await api.put(`/platform-admin/companies/${companyId}/suspend`);
        return response.data;
    },

    activateCompany: async (companyId) => {
        const response = await api.put(`/platform-admin/companies/${companyId}/activate`);
        return response.data;
    }
};

export default platformAdminService;