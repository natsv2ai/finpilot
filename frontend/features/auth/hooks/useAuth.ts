"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { loginUser, registerUser } from "../services/authService";
import { LoginPayload, RegisterPayload } from "../types";

export const useAuth = () => {
  const { user, token, login, logout } = useAuthStore();

  const handleLogin = async (payload: LoginPayload) => {
    const data = await loginUser(payload);
    login(data.user, data.token);
  };

  const handleRegister = async (payload: RegisterPayload) => {
    const data = await registerUser(payload);
    login(data.user, data.token);
  };

  return {
    user,
    token,
    isAuthenticated: !!token,
    login: handleLogin,
    register: handleRegister,
    logout,
  };
};