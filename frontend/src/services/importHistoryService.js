import api from "./api";

const getImportHistory = async () => {
  const response = await api.get("/import-history");
  return response.data;
};

const createImportRecord = async (recordData) => {
  const response = await api.post("/import-history", recordData);
  return response.data;
};

const deleteImportRecord = async (id) => {
  const response = await api.delete(`/import-history/${id}`);
  return response.data;
};

export default {
  getImportHistory,
  createImportRecord,
  deleteImportRecord,
};
