import api from "./api";

const getCustomers = async () => {
  const response = await api.get("/customers");
  return response.data;
};

const createCustomer = async (customerData) => {
  const response = await api.post("/customers", customerData);
  return response.data;
};

const searchCustomers = async (query) => {
  const response = await api.get(`/customers/search?q=${query}`);
  return response.data;
};

export default {
  getCustomers,
  createCustomer,
  searchCustomers,
};
