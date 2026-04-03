"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface IPO {
    id: number;
    company_name: string;
    symbol: string;
    exchange: string;
    price_band_low: number | null;
    price_band_high: number | null;
    issue_size: string | null;
    lot_size: number | null;
    open_date: string | null;
    close_date: string | null;
    listing_date: string | null;
    retail_subscription: number | null;
    hni_subscription: number | null;
    qib_subscription: number | null;
    total_subscription: number | null;
    listing_price: number | null;
    listing_gain_pct: number | null;
    current_price: number | null;
    status: string;
    gmp: number | null;
    ai_verdict: string | null;
    ai_reasoning: string | null;
    sector: string | null;
    lead_manager: string | null;
}

// Sample data for development
const SAMPLE_IPOS: IPO[] = [
    {
        id: 1, company_name: "NextGen Semiconductors Ltd", symbol: "NEXTGENSEMI", exchange: "NSE",
        price_band_low: 540, price_band_high: 570, issue_size: "₹2,800 Cr", lot_size: 26,
        open_date: "2026-03-15", close_date: "2026-03-18", listing_date: null,
        retail_subscription: null, hni_subscription: null, qib_subscription: null, total_subscription: null,
        listing_price: null, listing_gain_pct: null, current_price: null,
        status: "upcoming", gmp: 180, ai_verdict: "subscribe", sector: "Semiconductors",
        ai_reasoning: "India's semiconductor push with ₹76,000 Cr PLI scheme creates massive tailwind. Strong tech team (ex-TSMC). First pure-play fab-lite semiconductor IPO in India. GMP of ₹180 (+31.6%) indicates strong demand. Risk: Execution in capital-intensive industry.",
        lead_manager: "Kotak Mahindra Capital, ICICI Securities",
    },
    {
        id: 2, company_name: "GreenHydro Energy Ltd", symbol: "GREENHYDRO", exchange: "NSE",
        price_band_low: 320, price_band_high: 340, issue_size: "₹1,500 Cr", lot_size: 44,
        open_date: "2026-03-01", close_date: "2026-03-04", listing_date: null,
        retail_subscription: 4.2, hni_subscription: 8.7, qib_subscription: 12.3, total_subscription: 8.5,
        listing_price: null, listing_gain_pct: null, current_price: null,
        status: "open", gmp: 95, ai_verdict: "subscribe", sector: "Renewable Energy",
        ai_reasoning: "Hydrogen economy play with government backing. 8.5x total subscription shows strong institutional interest. Revenue growing 85% YoY. QIB subscription at 12.3x is encouraging. Risk: Pre-revenue hydrogen segment, technology risk.",
        lead_manager: "Axis Capital, JM Financial",
    },
    {
        id: 3, company_name: "TechVista AI Solutions Ltd", symbol: "TECHVISTA", exchange: "NSE",
        price_band_low: 890, price_band_high: 940, issue_size: "₹4,200 Cr", lot_size: 15,
        open_date: "2026-02-10", close_date: "2026-02-13", listing_date: "2026-02-18",
        retail_subscription: 12.5, hni_subscription: 38.2, qib_subscription: 56.1, total_subscription: 35.6,
        listing_price: 1380, listing_gain_pct: 46.8, current_price: 1290,
        status: "listed", gmp: 320, ai_verdict: "subscribe", sector: "IT / AI",
        ai_reasoning: "Strong AI-first product portfolio with 85% recurring revenue. Market leader in enterprise AI solutions in India. 35.6x oversubscribed. Listed at 46.8% premium. Currently trading at ₹1,290 (37.2% above issue price). Risk: High client concentration.",
        lead_manager: "Goldman Sachs, Morgan Stanley India",
    },
    {
        id: 4, company_name: "Bharat Defence Systems Ltd", symbol: "BHARATDEF", exchange: "BSE",
        price_band_low: 450, price_band_high: 475, issue_size: "₹3,600 Cr", lot_size: 31,
        open_date: "2026-01-20", close_date: "2026-01-23", listing_date: "2026-01-28",
        retail_subscription: 6.8, hni_subscription: 15.4, qib_subscription: 22.7, total_subscription: 15.0,
        listing_price: 580, listing_gain_pct: 22.1, current_price: 620,
        status: "listed", gmp: 120, ai_verdict: "subscribe", sector: "Defence",
        ai_reasoning: "Government defence spending at all-time high. Order book of ₹18,000 Cr provides 5-year visibility. Make-in-India tailwind. P/E of 35x vs sector avg 42x — reasonably priced. Listed at 22% premium and now up 30% from issue price.",
        lead_manager: "SBI Capital Markets",
    },
    {
        id: 5, company_name: "QuickCart Logistics Ltd", symbol: "QUICKCART", exchange: "NSE",
        price_band_low: 280, price_band_high: 295, issue_size: "₹900 Cr", lot_size: 50,
        open_date: "2026-02-01", close_date: "2026-02-04", listing_date: "2026-02-09",
        retail_subscription: 1.2, hni_subscription: 0.8, qib_subscription: 1.5, total_subscription: 1.2,
        listing_price: 245, listing_gain_pct: -16.9, current_price: 210,
        status: "listed", gmp: -15, ai_verdict: "avoid", sector: "Logistics",
        ai_reasoning: "Loss-making for 3 consecutive years. Negative operating cash flow. Intense competition from Delhivery, Blue Dart. 1.2x subscription shows weak demand. Listed at 16.9% discount and continues to fall. Negative GMP was a clear warning signal.",
        lead_manager: "HDFC Securities",
    },
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    upcoming: { bg: "#007bff", text: "#fff", label: "Upcoming" },
    open: { bg: "#28a745", text: "#fff", label: "Open Now" },
    closed: { bg: "#ffc107", text: "#333", label: "Closed" },
    listed: { bg: "#6f42c1", text: "#fff", label: "Listed" },
    withdrawn: { bg: "#dc3545", text: "#fff", label: "Withdrawn" },
};

const verdictColors: Record<string, { bg: string; text: string; icon: string }> = {
    subscribe: { bg: "#d4edda", text: "#155724", icon: "✓" },
    avoid: { bg: "#f8d7da", text: "#721c24", icon: "✗" },
    neutral: { bg: "#fff3cd", text: "#856404", icon: "◐" },
};

export default function IPOPage() {
    const [ipos, setIpos] = useState<IPO[]>(SAMPLE_IPOS);
    const [filter, setFilter] = useState<string>("all");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const filtered = filter === "all" ? ipos : ipos.filter(i => i.status === filter);

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#333", margin: 0 }}>IPO Insights</h1>
                    <p style={{ color: "#6c757d", margin: "4px 0 0", fontSize: 14 }}>Track, analyze, and get AI-powered recommendations on IPOs</p>
                </div>
            </div>

            {/* Filter Pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {["all", "upcoming", "open", "listed"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: "6px 16px", borderRadius: 20, border: "1px solid #dee2e6",
                        background: filter === f ? "#007bff" : "#fff",
                        color: filter === f ? "#fff" : "#495057",
                        fontSize: 13, fontWeight: 500, cursor: "pointer",
                        transition: "all 0.2s",
                    }}>
                        {f === "all" ? "All IPOs" : f.charAt(0).toUpperCase() + f.slice(1)}
                        <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>
                            ({f === "all" ? ipos.length : ipos.filter(i => i.status === f).length})
                        </span>
                    </button>
                ))}
            </div>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                {[
                    { label: "Total IPOs", value: ipos.length, color: "#007bff", icon: "📊" },
                    { label: "Upcoming", value: ipos.filter(i => i.status === "upcoming").length, color: "#17a2b8", icon: "🔜" },
                    { label: "Open Now", value: ipos.filter(i => i.status === "open").length, color: "#28a745", icon: "🟢" },
                    {
                        label: "Avg Listing Gain", value: (() => {
                            const listed = ipos.filter(i => i.listing_gain_pct !== null);
                            return listed.length ? (listed.reduce((s, i) => s + (i.listing_gain_pct || 0), 0) / listed.length).toFixed(1) + "%" : "N/A";
                        })(), color: "#6f42c1", icon: "📈"
                    },
                ].map((card, idx) => (
                    <div key={idx} style={{
                        background: "#fff", borderRadius: 8, padding: 16,
                        borderLeft: `4px solid ${card.color}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}>
                        <div style={{ fontSize: 12, color: "#6c757d", fontWeight: 500 }}>{card.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#333", marginTop: 4 }}>
                            {card.icon} {card.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* IPO Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {filtered.map(ipo => {
                    const sc = statusColors[ipo.status] || statusColors.upcoming;
                    const vc = ipo.ai_verdict ? verdictColors[ipo.ai_verdict] || verdictColors.neutral : null;
                    const isExpanded = expandedId === ipo.id;

                    return (
                        <div key={ipo.id} className="adminlte-card" style={{
                            borderRadius: 8, overflow: "hidden",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                            transition: "box-shadow 0.2s",
                        }}>
                            {/* Card Header */}
                            <div className="adminlte-card-header" style={{
                                padding: "12px 16px", display: "flex", justifyContent: "space-between",
                                alignItems: "center", borderBottom: "1px solid #f0f0f0",
                                borderLeft: `4px solid ${sc.bg}`,
                            }}>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>{ipo.company_name}</span>
                                    <span style={{ marginLeft: 8, fontSize: 12, color: "#6c757d" }}>{ipo.symbol} · {ipo.exchange}</span>
                                    {ipo.sector && <span style={{
                                        marginLeft: 8, fontSize: 11, padding: "2px 8px", borderRadius: 10,
                                        background: "#e9ecef", color: "#495057",
                                    }}>{ipo.sector}</span>}
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    {vc && (
                                        <span style={{
                                            padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                                            background: vc.bg, color: vc.text,
                                        }}>
                                            {vc.icon} {ipo.ai_verdict?.toUpperCase()}
                                        </span>
                                    )}
                                    <span style={{
                                        padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 500,
                                        background: sc.bg, color: sc.text,
                                    }}>
                                        {sc.label}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="adminlte-card-body" style={{ padding: 16 }}>
                                {/* Key Metrics Row */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                                    {ipo.price_band_low && ipo.price_band_high && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#6c757d", fontWeight: 500 }}>Price Band</div>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: "#333" }}>₹{ipo.price_band_low} - ₹{ipo.price_band_high}</div>
                                        </div>
                                    )}
                                    {ipo.issue_size && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#6c757d", fontWeight: 500 }}>Issue Size</div>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: "#333" }}>{ipo.issue_size}</div>
                                        </div>
                                    )}
                                    {ipo.lot_size && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#6c757d", fontWeight: 500 }}>Lot Size</div>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: "#333" }}>{ipo.lot_size} shares</div>
                                        </div>
                                    )}
                                    {ipo.gmp !== null && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#6c757d", fontWeight: 500 }}>GMP</div>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: ipo.gmp >= 0 ? "#28a745" : "#dc3545" }}>
                                                {ipo.gmp >= 0 ? "+" : ""}₹{ipo.gmp}
                                                {ipo.price_band_high && <span style={{ fontSize: 11, marginLeft: 4 }}>
                                                    ({((ipo.gmp / ipo.price_band_high) * 100).toFixed(1)}%)
                                                </span>}
                                            </div>
                                        </div>
                                    )}
                                    {ipo.total_subscription !== null && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#6c757d", fontWeight: 500 }}>Total Subscription</div>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: ipo.total_subscription >= 3 ? "#28a745" : "#ffc107" }}>
                                                {ipo.total_subscription}x
                                            </div>
                                        </div>
                                    )}
                                    {ipo.listing_gain_pct !== null && (
                                        <div>
                                            <div style={{ fontSize: 11, color: "#6c757d", fontWeight: 500 }}>Listing Gain</div>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: ipo.listing_gain_pct >= 0 ? "#28a745" : "#dc3545" }}>
                                                {ipo.listing_gain_pct >= 0 ? "+" : ""}{ipo.listing_gain_pct}%
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Subscription Breakdown */}
                                {ipo.retail_subscription !== null && (
                                    <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                                        {[
                                            { label: "Retail", value: ipo.retail_subscription },
                                            { label: "HNI", value: ipo.hni_subscription },
                                            { label: "QIB", value: ipo.qib_subscription },
                                        ].map(sub => sub.value !== null && (
                                            <div key={sub.label} style={{
                                                padding: "4px 12px", borderRadius: 6, background: "#f8f9fa",
                                                fontSize: 12, color: "#495057",
                                            }}>
                                                <strong>{sub.label}:</strong> {sub.value}x
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Dates */}
                                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#6c757d", marginBottom: 12, flexWrap: "wrap" }}>
                                    {ipo.open_date && <span>📅 Open: {new Date(ipo.open_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                                    {ipo.close_date && <span>📅 Close: {new Date(ipo.close_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                                    {ipo.listing_date && <span>📅 Listed: {new Date(ipo.listing_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                                    {ipo.lead_manager && <span>🏦 {ipo.lead_manager}</span>}
                                </div>

                                {/* AI Reasoning (Toggle) */}
                                {ipo.ai_reasoning && (
                                    <div>
                                        <button onClick={() => setExpandedId(isExpanded ? null : ipo.id)} style={{
                                            background: "none", border: "1px solid #dee2e6", padding: "6px 14px",
                                            borderRadius: 6, fontSize: 12, color: "#007bff", cursor: "pointer",
                                            fontWeight: 500,
                                        }}>
                                            {isExpanded ? "▲ Hide" : "▼ Show"} AI Analysis
                                        </button>
                                        {isExpanded && (
                                            <div style={{
                                                marginTop: 12, padding: 16, background: "#f8f9fa", borderRadius: 8,
                                                borderLeft: `3px solid ${vc?.bg === "#f8d7da" ? "#dc3545" : "#28a745"}`,
                                                fontSize: 13, lineHeight: 1.6, color: "#333",
                                                whiteSpace: "pre-wrap",
                                            }}>
                                                <strong style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
                                                    🤖 AI Recommendation: <span style={{ color: ipo.ai_verdict === "subscribe" ? "#28a745" : ipo.ai_verdict === "avoid" ? "#dc3545" : "#856404" }}>
                                                        {ipo.ai_verdict?.toUpperCase()}
                                                    </span>
                                                </strong>
                                                {ipo.ai_reasoning}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "#6c757d" }}>
                    No IPOs found for the selected filter.
                </div>
            )}
        </div>
    );
}
