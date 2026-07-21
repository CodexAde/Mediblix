import api from "./api";

const createSale = async (saleData) => {
  const response = await api.post("/sales", saleData);
  return response.data;
};

const getSales = async (params) => {
  const response = await api.get("/sales", { params });
  return response.data;
};

const generateInvoice = async (saleId) => {
  const response = await api.get(`/sales/${saleId}/invoice`, {
    responseType: "blob", // Important for handling PDF files
  });
  return response.data;
};

const processReturn = async (saleId, itemId, returnQuantity) => {
  const response = await api.post(`/sales/${saleId}/return`, { itemId, returnQuantity });
  return response.data;
};

export default {
  createSale,
  getSales,
  generateInvoice,
  processReturn,
};
