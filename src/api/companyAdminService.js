import api from "./axios";
const unwrap = (data) => data?.$values || data || [];
const companyAdminService = {
  getHiringManagers: async () => unwrap((await api.get("/company/hiring-managers")).data),
  inviteHiringManager: async (payload) => (await api.post("/company/hiring-managers", payload)).data,
  updateHiringManagerStatus: async (id,isActive)=>(await api.put(`/company/hiring-managers/${id}/status`,{isActive})).data,
  deleteHiringManager: async(id)=>(await api.delete(`/company/hiring-managers/${id}`)).data,
  getRecruiters: async()=>unwrap((await api.get("/company/recruiters")).data),
  inviteRecruiter: async(payload)=>(await api.post("/company/recruiters",payload)).data,
  updateRecruiterStatus: async(id,isActive)=>(await api.put(`/company/recruiters/${id}/status`,{isActive})).data,
  deleteRecruiter: async(id)=>(await api.delete(`/company/recruiters/${id}`)).data,
  getCompanyProfile: async()=>(await api.get("/company/profile")).data,
  updateCompanyProfile: async(payload)=>(await api.put("/company/profile",payload)).data,
};
export default companyAdminService;
