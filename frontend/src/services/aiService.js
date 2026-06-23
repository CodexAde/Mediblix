import api from "./api";

const parseInvoice = async (fileData, mimeType) => {
  const response = await api.post("/ai/parse-invoice", { fileData, mimeType });
  return response.data;
};

const parseBill = async (fileData, mimeType) => {
  const response = await api.post("/ai/parse-bill", { fileData, mimeType });
  return response.data;
};

export default {
  parseInvoice,
  parseBill,
};
