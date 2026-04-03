export interface RiskMetrics {
  portfolio_volatility: number;
  portfolio_beta: number;
  sharpe_ratio: number;
  max_drawdown: number;
  concentration_risk: string;
  top_sector: string;
  top_sector_pct: number;
  diversification_score: number;
}

export interface SectorConcentration {
  sector: string;
  percentage: number;
  status: string;
}

export interface RebalanceSuggestion {
  asset: string;
  current_pct: number;
  target_pct: number;
  action: string;
  amount: number;
  reason: string;
}

export interface RebalanceResponse {
  suggestions: RebalanceSuggestion[];
  overall_health: string;
  summary: string;
}

export interface TradeIdea {
  symbol: string;
  name: string;
  action: string;
  reason: string;
  target_price: number;
  current_price: number;
  upside_pct: number;
  confidence: string;
  sector: string;
}

export interface InsightCard {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  icon: string;
}