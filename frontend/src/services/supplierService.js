import api from "./api";

const getSuppliers = async () => {
  const response = await api.get("/suppliers");
  return response.data;
};

const createSupplier = async (supplierData) => {
  const response = await api.post("/suppliers", supplierData);
  return response.data;
};

const deleteSupplier = async (id) => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};

export default {
  getSuppliers,
  createSupplier,
  deleteSupplier,
};
