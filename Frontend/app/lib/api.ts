import axios from "axios";

const API_BASE_URL = typeof window !== "undefined"
  ? "/api"
  : (process.env.API_URL ?? "http://user-service:8081");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data).then((r) => r.data),
};

