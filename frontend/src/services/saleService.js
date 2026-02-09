import api from "./api";

const createSale = async (saleData) => {
  const response = await api.post("/sales", saleData);
  return response.data;
};

const getSales = async () => {
  const response = await api.get("/sales");
  return response.data;
};

const generateInvoice = async (saleId) => {
  const response = await api.get(`/sales/${saleId}/invoice`, {
    responseType: "blob", // Important for handling PDF files
  });
  return response.data;
};

export default {
  createSale,
  getSales,
  generateInvoice,
};
