import adminApi from "./adminApiService";

const getStats = async () => {
  const response = await adminApi.get("/stats");
  return response.data;
};

const getOrganizations = async (params = {}) => {
  const response = await adminApi.get("/organizations", { params });
  return response.data;
};

const getOrganizationById = async (id) => {
  const response = await adminApi.get(`/organizations/${id}`);
  return response.data;
};

const createOrganization = async (orgData) => {
  const response = await adminApi.post("/organizations", orgData);
  return response.data;
};

const updateOrganization = async (id, orgData) => {
  const response = await adminApi.put(`/organizations/${id}`, orgData);
  return response.data;
};

const toggleOrganizationStatus = async (id, status) => {
  const response = await adminApi.patch(`/organizations/${id}/status`, { status });
  return response.data;
};

const resetOrgPassword = async (id, newPassword) => {
  const response = await adminApi.post(`/organizations/${id}/reset-password`, { newPassword });
  return response.data;
};

export default {
  getStats,
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  toggleOrganizationStatus,
  resetOrgPassword,
};

