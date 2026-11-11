import adminApi from "./adminApiService";

const login = async (credentials) => {
  const response = await adminApi.post("/login", credentials);
  return response.data;
};

export default {
  login,
};

