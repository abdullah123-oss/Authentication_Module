import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: false,
});

// ✅ Attach token to every request if exists
API.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
