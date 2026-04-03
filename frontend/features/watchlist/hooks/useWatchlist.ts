"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../services/watchlistService";
import type { WatchlistItem, WatchlistItemCreate } from "../types";

const DEMO_WATCHLIST: WatchlistItem[] = [
  { id: 1, symbol: "WIPRO", name: "Wipro", target_price: 420, current_price: 470.25, week_high_52: 580, week_low_52: 350, change_percent: 2.1 },
  { id: 2, symbol: "AXISBANK", name: "Axis Bank", target_price: 1000, current_price: 1120.4, week_high_52: 1320, week_low_52: 820, change_percent: -0.8 },
  { id: 3, symbol: "TITAN", name: "Titan Company", target_price: 2900, current_price: 3250.7, week_high_52: 3900, week_low_52: 2400, change_percent: 1.5 },
  { id: 4, symbol: "LTIM", name: "LTIMindtree", target_price: 4800, current_price: 5240.9, week_high_52: 6200, week_low_52: 4100, change_percent: -1.2 },
];

export const useWatchlist = () => {
  const [data, setData] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await getWatchlist();
      setData(res);
    } catch {
      setData(DEMO_WATCHLIST);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addItem = async (payload: WatchlistItemCreate) => {
    try {
      const item = await addToWatchlist(payload);
      setData((prev) => [...prev, item]);
    } catch {
      // Demo fallback
      const newItem: WatchlistItem = {
        id: Date.now(),
        symbol: payload.symbol.toUpperCase(),
        name: payload.name || payload.symbol,
        target_price: payload.target_price || 0,
        current_price: 1000,
        week_high_52: 1200,
        week_low_52: 700,
        change_percent: 0,
      };
      setData((prev) => [...prev, newItem]);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await removeFromWatchlist(id);
    } catch {
      // continue with local removal
    }
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  return { data, loading, addItem, removeItem, refetch: fetchWatchlist };
};