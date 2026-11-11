import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const userInfoStr = localStorage.getItem("userInfo");
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
      if (userInfo.organization && userInfo.organization._id) {
        config.headers["x-organization-id"] = userInfo.organization._id;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return config;
});

export default api;
