import { api } from "@/lib/api";
import type { WatchlistItem, WatchlistItemCreate } from "../types";

export const getWatchlist = async (): Promise<WatchlistItem[]> => {
  const response = await api.get("/watchlist");
  return response.data;
};

export const addToWatchlist = async (
  payload: WatchlistItemCreate
): Promise<WatchlistItem> => {
  const response = await api.post("/watchlist", payload);
  return response.data;
};

export const removeFromWatchlist = async (id: number): Promise<void> => {
  await api.delete(`/watchlist/${id}`);
};