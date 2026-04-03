"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "@/lib/api";
import InfoBox from "@/components/ui/InfoBox";
import CardWidget from "@/components/ui/CardWidget";
import DataTableWidget from "@/components/ui/DataTableWidget";

const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

export default function InsightsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [fiiDii, setFiiDii] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"news" | "activity" | "fiidii">("news");

  const fetchData = useCallback(async () => {
    try {
      const [newsRes, activityRes, fiiRes] = await Promise.all([
        api.get("/market/news"),
        api.get("/market/activity"),
        api.get("/market/fii-dii"),
      ]);
      setNews(newsRes.data);
      setActivity(activityRes.data);
      setFiiDii(fiiRes.data);
    } catch (err) {
      console.error("Failed to load market data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const TYPE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
    bulk_deal: { bg: "#cce5ff", color: "#004085" },
    block_deal: { bg: "#d1ecf1", color: "#0c5460" },
    insider: { bg: "#fff3cd", color: "#856404" },
    fii_dii: { bg: "#d4edda", color: "#155724" },
  };

  const actColumns = [
    { key: "symbol", label: "Symbol", render: (v: string) => <span style={{ fontWeight: 600, color: "#007bff" }}>{v}</span> },
    {
      key: "activity_type", label: "Type", render: (v: string) => {
        const tc = TYPE_BADGE_COLORS[v] || { bg: "#e9ecef", color: "#495057" };
        return <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: tc.bg, color: tc.color }}>{v.replace("_", " ")}</span>;
      }
    },
    { key: "investor_name", label: "Investor" },
    {
      key: "action", label: "Action", render: (v: string) => (
        <span style={{ color: v === "buy" ? "#28a745" : "#dc3545", fontWeight: 600, textTransform: "uppercase" as const, fontSize: 12 }}>{v}</span>
      )
    },
    { key: "quantity", label: "Qty", render: (v: number) => v.toLocaleString() },
    { key: "price", label: "Price", render: (v: number) => formatCurrency(v) },
    { key: "date", label: "Date" },
  ];

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "6px 14px", borderRadius: 4, fontSize: 13, fontWeight: 600,
    border: isActive ? "none" : "1px solid #ced4da",
    background: isActive ? "#007bff" : "#fff",
    color: isActive ? "#fff" : "#495057",
    cursor: "pointer",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>Market Intelligence</h1>
        <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
          Stay updated with market news, investor activity, and FII/DII data
        </p>
      </div>

      {/* Info Boxes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <InfoBox icon="📰" label="News Articles" value={news.length} color="#007bff" />
        <InfoBox icon="📊" label="Investor Activities" value={activity.length} color="#ffc107" />
        <InfoBox icon="🏛️" label="FII/DII Days" value={fiiDii.length} color="#17a2b8" />
      </div>

      {/* Tab Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button style={tabStyle(activeTab === "news")} onClick={() => setActiveTab("news")}>📰 News Feed</button>
        <button style={tabStyle(activeTab === "activity")} onClick={() => setActiveTab("activity")}>📊 Investor Activity</button>
        <button style={tabStyle(activeTab === "fiidii")} onClick={() => setActiveTab("fiidii")}>🏛️ FII/DII</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#adb5bd" }}>Loading market data...</div>
      ) : (
        <>
          {/* News Feed */}
          {activeTab === "news" && (
            <CardWidget title="Stock News" icon="📰" borderColor="#007bff">
              {news.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {news.map((n, i) => (
                    <a key={i} href={n.url} target="_blank" rel="noopener"
                      style={{
                        display: "block", padding: 16, borderRadius: 6, transition: "all 0.15s",
                        background: "#f8f9fa", border: "1px solid #e9ecef", textDecoration: "none",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f4f8"; e.currentTarget.style.borderColor = "#007bff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#f8f9fa"; e.currentTarget.style.borderColor = "#e9ecef"; }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: "#343a40" }}>{n.title}</h4>
                          {n.summary && <p style={{ fontSize: 12, color: "#6c757d", margin: "0 0 8px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{n.summary}</p>}
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 12, color: "#007bff", fontWeight: 500 }}>{n.source}</span>
                            {n.symbol && (
                              <span style={{
                                fontSize: 11, padding: "2px 8px", borderRadius: 4,
                                background: "#cce5ff", color: "#004085", fontWeight: 600,
                              }}>{n.symbol}</span>
                            )}
                            {n.published_at && <span style={{ fontSize: 11, color: "#adb5bd" }}>{n.published_at}</span>}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 32, color: "#adb5bd" }}>
                  No news available. Add stocks to your portfolio to see relevant news.
                </div>
              )}
            </CardWidget>
          )}

          {/* Investor Activity */}
          {activeTab === "activity" && (
            <CardWidget title="Bulk Deals, Block Deals & Insider Trading" icon="📊" borderColor="#ffc107">
              <DataTableWidget
                columns={actColumns}
                data={activity}
                searchPlaceholder="Search by symbol or investor..."
                emptyMessage="No investor activity data available."
              />
            </CardWidget>
          )}

          {/* FII/DII */}
          {activeTab === "fiidii" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <CardWidget title="FII/DII Activity (₹ Cr)" icon="🏛️" borderColor="#17a2b8">
                {fiiDii.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={fiiDii}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                      <XAxis dataKey="date" tick={{ fill: "#6c757d", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#6c757d", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 6, fontSize: 12 }} />
                      <Bar dataKey="fii_net" name="FII Net" fill="#007bff" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="dii_net" name="DII Net" fill="#17a2b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: "center", padding: 32, color: "#adb5bd" }}>No FII/DII data available.</div>
                )}
              </CardWidget>

              <CardWidget title="Daily FII/DII Data" icon="📋" borderColor="#6f42c1">
                <DataTableWidget
                  columns={[
                    { key: "date", label: "Date" },
                    { key: "fii_buy", label: "FII Buy", render: (v: number) => `₹${v}Cr` },
                    { key: "fii_sell", label: "FII Sell", render: (v: number) => `₹${v}Cr` },
                    { key: "fii_net", label: "FII Net", render: (v: number) => <span style={{ color: v >= 0 ? "#28a745" : "#dc3545", fontWeight: 600 }}>₹{v}Cr</span> },
                    { key: "dii_buy", label: "DII Buy", render: (v: number) => `₹${v}Cr` },
                    { key: "dii_sell", label: "DII Sell", render: (v: number) => `₹${v}Cr` },
                    { key: "dii_net", label: "DII Net", render: (v: number) => <span style={{ color: v >= 0 ? "#28a745" : "#dc3545", fontWeight: 600 }}>₹{v}Cr</span> },
                  ]}
                  data={fiiDii}
                  searchable={false}
                />
              </CardWidget>
            </div>
          )}
        </>
      )}
    </div>
  );
}