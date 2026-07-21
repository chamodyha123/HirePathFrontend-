import api from "./axios";

const unwrap = (data) => data?.$values || data || [];

const companyAdminService = {
  getHiringManagers: async () => unwrap((await api.get("/company/hiring-managers")).data),
  inviteHiringManager: async (payload) => (await api.post("/company/hiring-managers", payload)).data,
  updateHiringManagerStatus: async (id, isActive) =>
    (await api.put(`/company/hiring-managers/${id}/status`, { isActive })).data,
  deleteHiringManager: async (id) => (await api.delete(`/company/hiring-managers/${id}`)).data,
};

export default companyAdminService;
