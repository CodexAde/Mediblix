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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const msg = error.response.data?.message || "";
      if (msg.toLowerCase().includes("frozen")) {
        window.dispatchEvent(
          new CustomEvent("Mediblix:account_frozen", {
            detail: { message: msg },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
