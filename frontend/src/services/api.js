import axios from "axios";

export const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem("mediblix_device_id");
  if (!deviceId) {
    deviceId =
      "dev_" +
      Math.random().toString(36).substring(2, 12) +
      "_" +
      Date.now().toString(36);
    localStorage.setItem("mediblix_device_id", deviceId);
  }
  return deviceId;
};

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

  const deviceSession = localStorage.getItem("active_device_session");
  if (deviceSession) {
    config.headers["x-device-session"] = deviceSession;
  }

  config.headers["x-device-id"] = getOrCreateDeviceId();

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data?.message || "";
      if (
        error.response.data?.isSessionRevoked ||
        msg.toLowerCase().includes("session") ||
        msg.toLowerCase().includes("not authorized")
      ) {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("active_device_session");
        window.dispatchEvent(
          new CustomEvent("Mediblix:session_revoked", {
            detail: {
              message: msg || "Session revoked by administrator. Please log in again.",
            },
          })
        );
      }
    }
    if (error.response && error.response.status === 403) {
      const msg = error.response.data?.message || "";
      if (msg.toLowerCase().includes("frozen")) {
        window.dispatchEvent(
          new CustomEvent("Mediblix:account_frozen", {
            detail: {
              message: msg,
              organizationName: error.response.data?.organizationName,
            },
          })
        );
      } else if (
        msg.toLowerCase().includes("expired") ||
        error.response.data?.isExpired
      ) {
        window.dispatchEvent(
          new CustomEvent("Mediblix:subscription_expired", {
            detail: {
              message: msg,
              organizationName: error.response.data?.organizationName,
              expiresAt: error.response.data?.expiresAt,
            },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
