import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://localhost:7253/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // The configured base URL already ends with /api. Normalise accidental
    // calls such as /api/Auth/login so they do not become /api/api/Auth/login.
    if (typeof config.url === "string" && config.url.toLowerCase().startsWith("/api/")) {
      config.url = config.url.substring(4);
    }

    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl =
      error.config?.url?.toLowerCase() || "";

    const isLoginRequest =
      requestUrl.includes("/auth/login");

    if (
      error.response?.status === 401 &&
      !isLoginRequest
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("roles");
      localStorage.removeItem("role");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");

      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default api;