"use client";

import { useState } from "react";
import { useWatchlist } from "@/features/watchlist/hooks/useWatchlist";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function WatchlistPage() {
  const { data, loading, addItem, removeItem } = useWatchlist();
  const [showAdd, setShowAdd] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  const handleAdd = async () => {
    if (!symbol.trim()) return;
    await addItem({
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || undefined,
      target_price: parseFloat(targetPrice) || undefined,
    });
    setSymbol("");
    setName("");
    setTargetPrice("");
    setShowAdd(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
        <div style={{ color: "#6c757d" }}>Loading watchlist...</div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 6,
    border: "1px solid #ced4da", fontSize: 14, color: "#343a40",
    background: "#fff", outline: "none", transition: "border 0.15s",
    marginTop: 4,
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>Watchlist</h1>
          <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
            {data.length} stocks tracked
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            border: "none", background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,123,255,0.3)",
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Stock
        </button>
      </div>

      {/* Watchlist Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {data.map((item) => {
          const range = item.week_high_52 - item.week_low_52;
          const position = range > 0 ? ((item.current_price - item.week_low_52) / range) * 100 : 50;
          const nearTarget = item.target_price > 0 && item.current_price <= item.target_price * 1.05;

          return (
            <div
              key={item.id}
              style={{
                background: "#fff", borderRadius: 6, padding: 20, position: "relative",
                boxShadow: "0 0 1px rgba(0,0,0,0.125), 0 1px 3px rgba(0,0,0,0.2)",
                border: nearTarget ? "2px solid #28a745" : "1px solid transparent",
                transition: "all 0.2s",
              }}
            >
              {nearTarget && (
                <div style={{
                  position: "absolute", top: -8, right: -8,
                  background: "#28a745", color: "#fff", fontSize: 10, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 10,
                }}>
                  NEAR TARGET
                </div>
              )}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontWeight: 700, color: "#343a40", fontSize: 18, margin: 0 }}>{item.symbol}</h3>
                  <p style={{ fontSize: 12, color: "#6c757d", margin: "2px 0 0" }}>{item.name}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    padding: 4, border: "none", background: "transparent",
                    cursor: "pointer", color: "#adb5bd", transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#dc3545"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#adb5bd"}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#343a40" }}>
                  {formatCurrency(item.current_price)}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: item.change_percent >= 0 ? "#28a745" : "#dc3545",
                }}>
                  {formatPercent(item.change_percent)}
                </span>
              </div>

              {/* 52-week range bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6c757d", marginBottom: 4 }}>
                  <span>52W Low: {formatCurrency(item.week_low_52)}</span>
                  <span>52W High: {formatCurrency(item.week_high_52)}</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "#e9ecef", borderRadius: 3, position: "relative" }}>
                  <div
                    style={{
                      position: "absolute", top: "50%", transform: "translate(-50%, -50%)",
                      width: 12, height: 12, borderRadius: "50%",
                      background: "#007bff", border: "2px solid #fff",
                      boxShadow: "0 0 4px rgba(0,123,255,0.4)",
                      left: `${Math.min(100, Math.max(0, position))}%`,
                    }}
                  />
                </div>
              </div>

              {item.target_price > 0 && (
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: "#6c757d" }}>Target: </span>
                  <span style={{ fontWeight: 600, color: "#007bff" }}>
                    {formatCurrency(item.target_price)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div style={{
          background: "#fff", borderRadius: 6, textAlign: "center", padding: "64px 20px",
          boxShadow: "0 0 1px rgba(0,0,0,0.125), 0 1px 3px rgba(0,0,0,0.2)",
        }}>
          <p style={{ fontSize: 40, margin: "0 0 12px" }}>👀</p>
          <p style={{ color: "#343a40", fontWeight: 500 }}>Your watchlist is empty</p>
          <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>Add stocks to track their prices</p>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAdd && (
        <div
          onClick={() => setShowAdd(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 6, width: "100%", maxWidth: 440,
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.08)",
              borderLeft: "3px solid #007bff", background: "#f8f9fa",
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#343a40" }}>Add to Watchlist</span>
              <button
                onClick={() => setShowAdd(false)}
                style={{ padding: 4, border: "none", background: "transparent", cursor: "pointer", color: "#6c757d", fontSize: 18 }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#495057" }}>Symbol *</label>
                <input
                  style={inputStyle}
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. WIPRO"
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#495057" }}>Company Name</label>
                <input
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wipro Limited"
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#495057" }}>Target Price</label>
                <input
                  style={inputStyle}
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. 450"
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => setShowAdd(false)}
                  style={{
                    padding: "8px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                    border: "1px solid #ced4da", background: "#f8f9fa", color: "#495057", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  style={{
                    padding: "8px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                    border: "none", background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,123,255,0.3)",
                  }}
                >
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}