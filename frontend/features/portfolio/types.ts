export interface Holding {
  id: number;
  symbol: string;
  name: string;
  asset_type: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  broker: string;
  sector: string;
  total_value: number;
  gain_loss: number;
  gain_loss_pct: number;
  day_change: number;
  day_change_pct: number;
  xirr: number | null;
}

export interface PortfolioSummary {
  total_value: number;
  total_invested: number;
  total_gain_loss: number;
  total_gain_loss_pct: number;
  day_change: number;
  day_change_pct: number;
  stock_count: number;
  mf_count: number;
}

export interface AllocationItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PerformancePoint {
  date: string;
  value: number;
}

export interface CSVUploadResult {
  success: number;
  failed: number;
  errors: string[];
}