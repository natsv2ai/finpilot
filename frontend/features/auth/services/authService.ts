import { api } from "@/lib/api";
import {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
} from "../types";

export const loginUser = async (
  data: LoginPayload
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (
  data: RegisterPayload
) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};