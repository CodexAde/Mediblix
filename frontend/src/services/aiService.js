import api from "./api";

const parseInvoice = async (fileData, mimeType) => {
  const response = await api.post("/ai/parse-invoice", { fileData, mimeType });
  return response.data;
};

const parseBill = async (fileDataOrPayload, mimeType) => {
  const body = typeof fileDataOrPayload === "object" && fileDataOrPayload.files
    ? { files: fileDataOrPayload.files }
    : { fileData: fileDataOrPayload, mimeType };
  const response = await api.post("/ai/parse-bill", body);
  return response.data;
};

export default {
  parseInvoice,
  parseBill,
};
