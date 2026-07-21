import api from "./axios";

const unwrapList = (data) => data?.$values || data || [];
const normalizeCompany = (company) => ({
  ...company,
  companyName: company.companyName || company.name || "",
});

const platformAdminService = {
  // ─── DASHBOARD ───────────────────────────────────────────────
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

  // ─── COMPANIES ───────────────────────────────────────────────
  getAllCompanies: async () => {
    const response = await api.get("/platform-admin/companies");
    return unwrapList(response.data).map(normalizeCompany);
  },

  getPendingCompanies: async () => {
    const response = await api.get("/company-onboarding/registrations", {
      params: { status: "Pending" },
    });
    return unwrapList(response.data).map(normalizeCompany);
  },

  getCompanyById: async (companyId) => {
    const response = await api.get(`/platform-admin/companies/${companyId}`);
    return response.data;
  },

  approveCompany: async (companyId, adminNotes = null) => {
    const response = await api.post(
      `/company-onboarding/registrations/${companyId}/approve`,
      { note: adminNotes }
    );
    return response.data;
  },

  rejectCompany: async (companyId, rejectionReason) => {
    const response = await api.post(
      `/company-onboarding/registrations/${companyId}/reject`,
      { note: rejectionReason }
    );
    return response.data;
  },

  requestInformation: async (companyId, message) => {
    const response = await api.put(
      `/platform-admin/companies/${companyId}/request-information`,
      { message }
    );
    return response.data;
  },

  suspendCompany: async (companyId) => {
    const response = await api.put(
      `/platform-admin/companies/${companyId}/suspend`
    );
    return response.data;
  },

  activateCompany: async (companyId) => {
    const response = await api.put(
      `/platform-admin/companies/${companyId}/activate`
    );
    return response.data;
  },

  deleteCompany: async (companyId) => {
    const response = await api.delete(
      `/platform-admin/companies/${companyId}`
    );
    return response.data;
  },

  // ─── USERS ───────────────────────────────────────────────────
  getAllUsers: async (query = null, role = null, status = null) => {
    const params = {};
    if (query) params.query = query;
    if (role && role !== "All") params.role = role;
    if (status && status !== "All") params.status = status;
    const response = await api.get("/platform-admin/users", { params });
    return unwrapList(response.data);
  },

  updateUser: async (userId, data) => {
    const response = await api.put(`/platform-admin/users/${userId}`, data);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/platform-admin/users/${userId}/role`, {
      role,
    });
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.put(
      `/platform-admin/users/${userId}/status`
    );
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/platform-admin/users/${userId}`);
    return response.data;
  },

  // ─── ANALYTICS ───────────────────────────────────────────────
  getAnalyticsData: async () => {
    const response = await api.get("/platform-admin/analytics");
    return response.data;
  },
};

export default platformAdminService;
