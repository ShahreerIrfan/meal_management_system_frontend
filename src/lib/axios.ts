/**
 * Axios instance with JWT interceptors.
 */
import axios from "axios";

const PRODUCTION_API_URL = "https://meal-management-system-backend-zcpt.vercel.app/api/v1";
const DEV_API_URL = "http://localhost:8000/api/v1";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? PRODUCTION_API_URL
    : DEV_API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ---------- Request interceptor: attach access token ----------
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const tokens = localStorage.getItem("tokens");
    if (tokens) {
      const { access } = JSON.parse(tokens);
      config.headers.Authorization = `Bearer ${access}`;
    }
    // Attach active flat ID header
    const flatId = localStorage.getItem("active_flat_id");
    if (flatId) {
      config.headers["X-Flat-ID"] = flatId;
    }
  }
  return config;
});

// ---------- Response interceptor: auto-refresh on 401 ----------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const tokens = JSON.parse(localStorage.getItem("tokens") || "{}");
        const res = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: tokens.refresh,
        });
        const newTokens = { access: res.data.access, refresh: res.data.refresh };
        localStorage.setItem("tokens", JSON.stringify(newTokens));
        original.headers.Authorization = `Bearer ${newTokens.access}`;
        return api(original);
      } catch {
        localStorage.removeItem("tokens");
        localStorage.removeItem("active_flat_id");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
