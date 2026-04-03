export interface WatchlistItem {
  id: number;
  symbol: string;
  name: string;
  target_price: number;
  current_price: number;
  week_high_52: number;
  week_low_52: number;
  change_percent: number;
}

export interface WatchlistItemCreate {
  symbol: string;
  name?: string;
  target_price?: number;
}