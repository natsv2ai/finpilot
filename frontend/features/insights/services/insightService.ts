import { api } from "@/lib/api";
import type {
  RiskMetrics,
  SectorConcentration,
  RebalanceResponse,
  TradeIdea,
  InsightCard,
} from "../types";

export const getRiskMetrics = async (): Promise<RiskMetrics> => {
  const response = await api.get("/insights/risk");
  return response.data;
};

export const getSectorConcentration = async (): Promise<SectorConcentration[]> => {
  const response = await api.get("/insights/sectors");
  return response.data;
};

export const getRebalanceSuggestions = async (): Promise<RebalanceResponse> => {
  const response = await api.get("/insights/rebalance");
  return response.data;
};

export const getTradeIdeas = async (): Promise<TradeIdea[]> => {
  const response = await api.get("/insights/ideas");
  return response.data;
};

export const getInsightCards = async (): Promise<InsightCard[]> => {
  const response = await api.get("/insights/cards");
  return response.data;
};