"use client";

import { usePortfolio } from "@/features/portfolio/hooks/usePortfolio";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";

const COLORS = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#17a2b8", "#6f42c1", "#e83e8c"];

export default function DashboardPage() {
  const { summary, allocation, performance, holdings, loading } = usePortfolio();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
        <div style={{ color: "#6c757d", fontSize: 16 }}>Loading dashboard...</div>
      </div>
    );
  }

  const topGainers = [...(holdings || [])]
    .sort((a, b) => b.day_change_pct - a.day_change_pct)
    .slice(0, 5);
  const topLosers = [...(holdings || [])]
    .sort((a, b) => a.day_change_pct - b.day_change_pct)
    .slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Content Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <span style={{ color: "#007bff" }}>Home</span>
          <span style={{ color: "#6c757d" }}>/</span>
          <span style={{ color: "#6c757d" }}>Dashboard</span>
        </div>
      </div>

      {/* Small Boxes — Refreshed gradient colors */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {/* Portfolio Value */}
        <div className="small-box" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
          <div className="small-box-inner">
            <h3>{formatCurrency(summary?.total_value || 0)}</h3>
            <p>Total Portfolio Value</p>
          </div>
          <div className="small-box-icon">
            <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Link href="/networth" className="small-box-footer">
            More info <span>→</span>
          </Link>
        </div>

        {/* Gain/Loss */}
        <div className="small-box" style={{ background: (summary?.total_gain_loss || 0) >= 0 ? "linear-gradient(135deg, #11998e, #38ef7d)" : "linear-gradient(135deg, #eb3349, #f45c43)" }}>
          <div className="small-box-inner">
            <h3>{formatCurrency(summary?.total_gain_loss || 0)}</h3>
            <p>Total Gain / Loss ({formatPercent(summary?.total_gain_loss_pct || 0)})</p>
          </div>
          <div className="small-box-icon">
            <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <Link href="/portfolio" className="small-box-footer">
            More info <span>→</span>
          </Link>
        </div>

        {/* Today's Change */}
        <div className="small-box" style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }}>
          <div className="small-box-inner">
            <h3>{formatCurrency(summary?.day_change || 0)}</h3>
            <p>Today&apos;s Change ({formatPercent(summary?.day_change_pct || 0)})</p>
          </div>
          <div className="small-box-icon">
            <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <Link href="/portfolio" className="small-box-footer">
            More info <span>→</span>
          </Link>
        </div>

        {/* Holdings */}
        <div className="small-box" style={{ background: "linear-gradient(135deg, #4facfe, #00f2fe)" }}>
          <div className="small-box-inner">
            <h3>{`${summary?.stock_count || 0} / ${summary?.mf_count || 0}`}</h3>
            <p>Stocks / Mutual Funds</p>
          </div>
          <div className="small-box-icon">
            <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <Link href="/portfolio" className="small-box-footer">
            More info <span>→</span>
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Performance Chart */}
        <div className="adminlte-card">
          <div className="adminlte-card-header" style={{ borderLeftColor: "#667eea" }}>
            <div className="adminlte-card-title">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#667eea" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              Portfolio Performance
            </div>
          </div>
          <div className="adminlte-card-body">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance}>
                  <defs>
                    <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#667eea" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#667eea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6c757d", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "#dee2e6" }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { month: "short" })}
                    interval={Math.floor((performance?.length || 10) / 6)}
                  />
                  <YAxis
                    tick={{ fill: "#6c757d", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "#dee2e6" }}
                    tickFormatter={(v) => `₹${formatNumber(v)}`}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 6, color: "#343a40", fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                    labelFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Value"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2.5} fill="url(#perfGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="adminlte-card">
          <div className="adminlte-card-header" style={{ borderLeftColor: "#28a745" }}>
            <div className="adminlte-card-title">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#28a745" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
              Sector Allocation
            </div>
          </div>
          <div className="adminlte-card-body">
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocation} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="percentage" nameKey="name" paddingAngle={2} stroke="none">
                    {allocation.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 6, color: "#343a40", fontSize: 12 }}
                    formatter={(value: number | undefined) => [`${value ?? 0}%`, "Allocation"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {allocation.slice(0, 5).map((item, i) => (
                <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length], display: "inline-block" }} />
                    <span style={{ color: "#6c757d" }}>{item.name}</span>
                  </div>
                  <span style={{ color: "#343a40", fontWeight: 600 }}>{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Movers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="adminlte-card">
          <div className="adminlte-card-header" style={{ borderLeftColor: "#28a745" }}>
            <div className="adminlte-card-title">
              <span style={{ color: "#28a745" }}>▲</span> Top Gainers Today
            </div>
          </div>
          <div className="adminlte-card-body" style={{ padding: 0 }}>
            <table className="adminlte-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {topGainers.map((h) => (
                  <tr key={h.id}>
                    <td><Link href={`/stock/${h.symbol}`} style={{ color: "#007bff", fontWeight: 600 }}>{h.symbol}</Link></td>
                    <td style={{ color: "#6c757d" }}>{h.name}</td>
                    <td><span className="adminlte-badge-green">{formatPercent(h.day_change_pct)}</span></td>
                  </tr>
                ))}
                {topGainers.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: "center", color: "#adb5bd", padding: 20 }}>No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="adminlte-card">
          <div className="adminlte-card-header" style={{ borderLeftColor: "#dc3545" }}>
            <div className="adminlte-card-title">
              <span style={{ color: "#dc3545" }}>▼</span> Top Losers Today
            </div>
          </div>
          <div className="adminlte-card-body" style={{ padding: 0 }}>
            <table className="adminlte-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {topLosers.map((h) => (
                  <tr key={h.id}>
                    <td><Link href={`/stock/${h.symbol}`} style={{ color: "#007bff", fontWeight: 600 }}>{h.symbol}</Link></td>
                    <td style={{ color: "#6c757d" }}>{h.name}</td>
                    <td><span className="adminlte-badge-red">{formatPercent(h.day_change_pct)}</span></td>
                  </tr>
                ))}
                {topLosers.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: "center", color: "#adb5bd", padding: 20 }}>No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}