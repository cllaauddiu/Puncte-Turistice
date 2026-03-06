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

// ── Users (Admin) ─────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "CLIENT";

export interface UserDTO {
  id: number;
  username: string;
  role: UserRole;
}

export interface CreateUserRequest {
  username: string;
  password: string;
}

export interface UpdateUserRequest {
  username: string;
  password?: string;
}

export interface ChangeRoleRequest {
  role: UserRole;
}

export const usersApi = {
  getAll: () =>
    api.get<UserDTO[]>("/users").then((r) => r.data),
  getById: (id: number) =>
    api.get<UserDTO>(`/users/${id}`).then((r) => r.data),
  create: (data: CreateUserRequest) =>
    api.post<UserDTO>("/users", data).then((r) => r.data),
  update: (id: number, data: UpdateUserRequest) =>
    api.put<UserDTO>(`/users/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    api.delete(`/users/${id}`).then((r) => r.data),
  changeRole: (id: number, data: ChangeRoleRequest) =>
    api.patch<UserDTO>(`/users/${id}/role`, data).then((r) => r.data),
};

