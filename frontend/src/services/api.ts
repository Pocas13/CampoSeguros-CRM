import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let redirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || "");
    const isLoginRequest = requestUrl.includes("/auth/login");
    const isSessionCheck = requestUrl.includes("/auth/me");
    const isLogoutRequest = requestUrl.includes("/auth/logout");

    if (
      status === 401 &&
      !isLoginRequest &&
      !isLogoutRequest &&
      window.location.pathname !== "/login" &&
      !redirectingToLogin
    ) {
      redirectingToLogin = true;

      void fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).finally(() => {
        window.location.replace("/login?session=expired");
      });
    }

    if (status === 401 && isSessionCheck && window.location.pathname === "/login") {
      redirectingToLogin = false;
    }

    return Promise.reject(error);
  },
);
