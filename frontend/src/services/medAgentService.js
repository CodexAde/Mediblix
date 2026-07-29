import api from "./api";

const sendMessage = async (message, conversationHistory = []) => {
  const response = await api.post("/medagent/chat", {
    message,
    conversationHistory,
  });
  return response.data;
};

const getAlternatives = async (medicineName, category) => {
  const response = await api.post("/medagent/alternatives", {
    medicineName,
    category,
  });
  return response.data;
};

const getCategories = async () => {
  const response = await api.get("/medagent/categories");
  return response.data;
};

export default {
  sendMessage,
  getAlternatives,
  getCategories,
};
