import axios from "axios";

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: "/api", // Proxy will handle the rest
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
