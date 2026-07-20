import api from "./axios";

const unwrapList = (data) => data?.$values || data || [];
const normalizeCompany = (company) => ({
  ...company,
  companyName: company.companyName || company.name || "",
});

const platformAdminService = {
  getDashboardStats: async () => {
    const response = await api.get("/platform-admin/dashboard");
    return response.data;
  },

  getRecentActivity: async () => {
    try {
      const response = await api.get("/platform-admin/activity");
      return unwrapList(response.data);
    } catch (error) {
      if (error.response?.status === 404) return [];
      throw error;
    }
  },

  getAllCompanies: async () => {
    const response = await api.get("/platform-admin/companies");
    return unwrapList(response.data).map(normalizeCompany);
  },

  getPendingCompanies: async () => {
    const response = await api.get("/platform-admin/companies/pending");
    return unwrapList(response.data).map(normalizeCompany);
  },

  approveCompany: async (companyId, adminNotes = null) => {
    const response = await api.put(
      `/platform-admin/companies/${companyId}/approve`,
      { adminNotes }
    );
    return response.data;
  },

  rejectCompany: async (companyId, rejectionReason) => {
    const response = await api.put(
      `/platform-admin/companies/${companyId}/reject`,
      { rejectionReason }
    );
    return response.data;
  },

  suspendCompany: async (companyId) => {
    const response = await api.put(`/platform-admin/companies/${companyId}/suspend`);
    return response.data;
  },

  activateCompany: async (companyId) => {
    const response = await api.put(`/platform-admin/companies/${companyId}/activate`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/platform-admin/users");
    return unwrapList(response.data);
  },
};

export default platformAdminService;
