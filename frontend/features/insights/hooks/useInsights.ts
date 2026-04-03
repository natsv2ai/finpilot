"use client";

import { useEffect, useState } from "react";
import {
  getRiskMetrics,
  getRebalanceSuggestions,
  getTradeIdeas,
  getInsightCards,
} from "../services/insightService";
import type {
  RiskMetrics,
  RebalanceResponse,
  TradeIdea,
  InsightCard,
} from "../types";

const DEMO_RISK: RiskMetrics = {
  portfolio_volatility: 18.5,
  portfolio_beta: 1.12,
  sharpe_ratio: 1.45,
  max_drawdown: 12.3,
  concentration_risk: "medium",
  top_sector: "Financial Services",
  top_sector_pct: 27.2,
  diversification_score: 72,
};

const DEMO_REBALANCE: RebalanceResponse = {
  suggestions: [
    { asset: "Financial Services", current_pct: 27.2, target_pct: 14.3, action: "sell", amount: 66100, reason: "Overweight by 12.9% vs equal allocation target" },
    { asset: "Pharma", current_pct: 7.7, target_pct: 14.3, action: "buy", amount: 33800, reason: "Underweight by 6.6% vs equal allocation target" },
    { asset: "Telecom", current_pct: 5.5, target_pct: 14.3, action: "buy", amount: 45100, reason: "Underweight by 8.8% vs equal allocation target" },
  ],
  overall_health: "needs_attention",
  summary: "Portfolio has 7 sectors. 3 sectors need rebalancing for equal allocation.",
};

const DEMO_IDEAS: TradeIdea[] = [
  { symbol: "WIPRO", name: "Wipro", action: "buy", reason: "Strong fundamentals in Technology sector. Trading below intrinsic value with consistent earnings growth.", target_price: 541, current_price: 470.25, upside_pct: 15, confidence: "high", sector: "Technology" },
  { symbol: "TITAN", name: "Titan Company", action: "buy", reason: "Strong fundamentals in Consumer Goods sector. Trading below intrinsic value with consistent earnings growth.", target_price: 3738, current_price: 3250.7, upside_pct: 15, confidence: "medium", sector: "Consumer Goods" },
  { symbol: "AXISBANK", name: "Axis Bank", action: "buy", reason: "Strong fundamentals in Financial Services sector. Trading below intrinsic value.", target_price: 1288, current_price: 1120.4, upside_pct: 15, confidence: "medium", sector: "Financial Services" },
];

const DEMO_CARDS: InsightCard[] = [
  { id: "1", title: "Portfolio Diversification", description: "Your portfolio is concentrated in Financial Services. Consider adding exposure to Healthcare and Technology sectors.", category: "risk", severity: "warning", icon: "⚠️" },
  { id: "2", title: "High XIRR Alert", description: "ITC and SBIN holdings show XIRR above 25%. Consider booking partial profits.", category: "opportunity", severity: "info", icon: "📈" },
  { id: "3", title: "Market Momentum", description: "Nifty 50 is trading near all-time highs. Maintain stop-loss levels on momentum stocks.", category: "alert", severity: "info", icon: "🔔" },
  { id: "4", title: "Tax Harvesting Opportunity", description: "2 holdings are showing unrealised losses. Consider selling to offset capital gains.", category: "opportunity", severity: "info", icon: "💰" },
];

export const useInsights = () => {
  const [risk, setRisk] = useState<RiskMetrics | null>(null);
  const [rebalance, setRebalance] = useState<RebalanceResponse | null>(null);
  const [ideas, setIdeas] = useState<TradeIdea[]>([]);
  const [cards, setCards] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [r, rb, i, c] = await Promise.all([
          getRiskMetrics(),
          getRebalanceSuggestions(),
          getTradeIdeas(),
          getInsightCards(),
        ]);
        setRisk(r);
        setRebalance(rb);
        setIdeas(i);
        setCards(c);
      } catch {
        setRisk(DEMO_RISK);
        setRebalance(DEMO_REBALANCE);
        setIdeas(DEMO_IDEAS);
        setCards(DEMO_CARDS);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { risk, rebalance, ideas, cards, loading };
};