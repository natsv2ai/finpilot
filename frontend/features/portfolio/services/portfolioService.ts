import { api } from "@/lib/api";
import type {
  Holding,
  PortfolioSummary,
  AllocationItem,
  PerformancePoint,
  CSVUploadResult,
} from "../types";
import axiosInstance from "@/lib/axios";

export const getHoldings = async (
  broker?: string,
  asset_type?: string
): Promise<Holding[]> => {
  const params = new URLSearchParams();
  if (broker) params.set("broker", broker);
  if (asset_type) params.set("asset_type", asset_type);
  const query = params.toString();
  const response = await api.get(`/holdings${query ? `?${query}` : ""}`);
  return response.data;
};

export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  const response = await api.get("/portfolio/summary");
  return response.data;
};

export const getAllocation = async (
  groupBy: string = "sector"
): Promise<AllocationItem[]> => {
  const response = await api.get(`/portfolio/allocation?group_by=${groupBy}`);
  return response.data;
};

export const getPerformance = async (
  period: string = "1Y"
): Promise<PerformancePoint[]> => {
  const response = await api.get(`/portfolio/performance?period=${period}`);
  return response.data;
};

export const uploadCSV = async (file: File): Promise<CSVUploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/holdings/upload-csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const importFromBroker = async (
  broker: string
): Promise<Holding[]> => {
  const response = await api.post(`/holdings/import?broker=${broker}`);
  return response.data;
};

export const analyzeStock = async (symbol: string, data: any): Promise<any> => {
  const response = await api.post("/ai/analyze-stock", { symbol, ...data });
  return response.data;
};

export const deleteHolding = async (holdingId: number): Promise<any> => {
  const response = await api.delete(`/holdings/${holdingId}`);
  return response.data;
};