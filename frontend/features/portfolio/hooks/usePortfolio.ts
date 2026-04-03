"use client";

import { useEffect, useState } from "react";
import {
  getHoldings,
  getPortfolioSummary,
  getAllocation,
  getPerformance,
} from "../services/portfolioService";
import type {
  Holding,
  PortfolioSummary,
  AllocationItem,
  PerformancePoint,
} from "../types";

// Demo fallback data
const DEMO_HOLDINGS: Holding[] = [
  { id: 1, symbol: "RELIANCE", name: "Reliance Industries", asset_type: "stock", quantity: 25, avg_price: 2200, current_price: 2485.5, broker: "groww", sector: "Energy", total_value: 62137.5, gain_loss: 7137.5, gain_loss_pct: 12.97, day_change: 856.5, day_change_pct: 1.38, xirr: 18.4 },
  { id: 2, symbol: "TCS", name: "Tata Consultancy Services", asset_type: "stock", quantity: 15, avg_price: 3500, current_price: 3820.75, broker: "upstox", sector: "Technology", total_value: 57311.25, gain_loss: 4811.25, gain_loss_pct: 9.17, day_change: -430.1, day_change_pct: -0.75, xirr: 14.2 },
  { id: 3, symbol: "HDFCBANK", name: "HDFC Bank", asset_type: "stock", quantity: 40, avg_price: 1480, current_price: 1650.3, broker: "groww", sector: "Financial Services", total_value: 66012, gain_loss: 6812, gain_loss_pct: 11.5, day_change: 924.2, day_change_pct: 1.4, xirr: 22.1 },
  { id: 4, symbol: "INFY", name: "Infosys", asset_type: "stock", quantity: 30, avg_price: 1420, current_price: 1575.8, broker: "upstox", sector: "Technology", total_value: 47274, gain_loss: 4674, gain_loss_pct: 10.96, day_change: -283.6, day_change_pct: -0.6, xirr: 16.8 },
  { id: 5, symbol: "ITC", name: "ITC Limited", asset_type: "stock", quantity: 100, avg_price: 380, current_price: 458.25, broker: "groww", sector: "FMCG", total_value: 45825, gain_loss: 7825, gain_loss_pct: 20.59, day_change: 641.6, day_change_pct: 1.4, xirr: 28.3 },
  { id: 6, symbol: "SBIN", name: "State Bank of India", asset_type: "stock", quantity: 50, avg_price: 620, current_price: 780.9, broker: "manual", sector: "Financial Services", total_value: 39045, gain_loss: 8045, gain_loss_pct: 25.95, day_change: -273.3, day_change_pct: -0.7, xirr: 32.5 },
  { id: 7, symbol: "BHARTIARTL", name: "Bharti Airtel", asset_type: "stock", quantity: 20, avg_price: 1180, current_price: 1420.6, broker: "groww", sector: "Telecom", total_value: 28412, gain_loss: 4812, gain_loss_pct: 20.39, day_change: 426.2, day_change_pct: 1.5, xirr: 24.1 },
  { id: 8, symbol: "HINDUNILVR", name: "Hindustan Unilever", asset_type: "stock", quantity: 10, avg_price: 2150, current_price: 2340.15, broker: "upstox", sector: "FMCG", total_value: 23401.5, gain_loss: 1901.5, gain_loss_pct: 8.84, day_change: -163.8, day_change_pct: -0.7, xirr: 11.2 },
  { id: 9, symbol: "BAJFINANCE", name: "Bajaj Finance", asset_type: "stock", quantity: 5, avg_price: 6200, current_price: 6890.45, broker: "groww", sector: "Financial Services", total_value: 34452.25, gain_loss: 3452.25, gain_loss_pct: 11.14, day_change: 1033.6, day_change_pct: 3.0, xirr: 19.7 },
  { id: 10, symbol: "MARUTI", name: "Maruti Suzuki", asset_type: "stock", quantity: 3, avg_price: 10200, current_price: 11450.8, broker: "manual", sector: "Automobile", total_value: 34352.4, gain_loss: 3752.4, gain_loss_pct: 12.27, day_change: -515.3, day_change_pct: -1.5, xirr: 15.6 },
  { id: 11, symbol: "SUNPHARMA", name: "Sun Pharma", asset_type: "mutual_fund", quantity: 35, avg_price: 980, current_price: 1120.35, broker: "groww", sector: "Pharma", total_value: 39212.25, gain_loss: 4912.25, gain_loss_pct: 14.33, day_change: 784.2, day_change_pct: 2.0, xirr: 20.8 },
  { id: 12, symbol: "TATAMOTORS", name: "Tata Motors", asset_type: "stock", quantity: 45, avg_price: 650, current_price: 780.6, broker: "upstox", sector: "Automobile", total_value: 35127, gain_loss: 5877, gain_loss_pct: 20.10, day_change: -351.3, day_change_pct: -1.0, xirr: 26.4 },
];

const DEMO_SUMMARY: PortfolioSummary = {
  total_value: 512562.15,
  total_invested: 448550,
  total_gain_loss: 64012.15,
  total_gain_loss_pct: 14.27,
  day_change: 2649.1,
  day_change_pct: 0.52,
  stock_count: 11,
  mf_count: 1,
};

const DEMO_ALLOCATION: AllocationItem[] = [
  { name: "Financial Services", value: 139509.25, percentage: 27.2, color: "#f59e0b" },
  { name: "Technology", value: 104585.25, percentage: 20.4, color: "#6366f1" },
  { name: "FMCG", value: 69226.5, percentage: 13.5, color: "#84cc16" },
  { name: "Automobile", value: 69479.4, percentage: 13.6, color: "#3b82f6" },
  { name: "Energy", value: 62137.5, percentage: 12.1, color: "#ef4444" },
  { name: "Pharma", value: 39212.25, percentage: 7.7, color: "#14b8a6" },
  { name: "Telecom", value: 28412, percentage: 5.5, color: "#06b6d4" },
];

export const usePortfolio = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [allocation, setAllocation] = useState<AllocationItem[]>([]);
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [h, s, a, p] = await Promise.all([
        getHoldings(),
        getPortfolioSummary(),
        getAllocation(),
        getPerformance("1Y"),
      ]);
      setHoldings(h);
      setSummary(s);
      setAllocation(a);
      setPerformance(p);
    } catch {
      // Use demo data as fallback
      setHoldings(DEMO_HOLDINGS);
      setSummary(DEMO_SUMMARY);
      setAllocation(DEMO_ALLOCATION);
      // Generate demo performance
      const pts: PerformancePoint[] = [];
      let val = 420000;
      for (let i = 0; i < 60; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (365 - i * 6));
        val *= 1 + (Math.random() * 0.02 - 0.005);
        pts.push({ date: d.toISOString().split("T")[0], value: Math.round(val) });
      }
      setPerformance(pts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { holdings, summary, allocation, performance, loading, refetch: fetchAll };
};