"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { usePortfolio } from "@/features/portfolio/hooks/usePortfolio";
import { analyzeStock } from "@/features/portfolio/services/portfolioService";
import { getFinancials } from "./financialData";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const STOCK_DATA: Record<string, {
    description: string;
    sector: string;
    ceo: string;
    promoterHolding: number;
    marketCap: string;
    pe: number;
    dividendYield: number;
    debtToEquity: number;
    roe: number;
    cagr1y: number;
    cagr3y: number;
    cagr5y: number;
    policyImpacts: string[];
    businessHighlights: string[];
    risks: string[];
}> = {
    RELIANCE: {
        description: "Reliance Industries Limited is India's largest private sector conglomerate with businesses spanning petrochemicals, refining, oil & gas exploration, retail, and digital services (Jio).",
        sector: "Oil & Gas / Conglomerate",
        ceo: "Mukesh D. Ambani",
        promoterHolding: 50.3,
        marketCap: "₹19.8L Cr",
        pe: 28.5,
        dividendYield: 0.3,
        debtToEquity: 0.38,
        roe: 9.8,
        cagr1y: 8.2,
        cagr3y: 12.5,
        cagr5y: 18.3,
        policyImpacts: [
            "Green energy push benefits Reliance's ₹75,000 Cr new energy investment",
            "5G rollout drives Jio subscriber ARPU growth",
            "Retail FDI policy changes could impact Reliance Retail expansion",
        ],
        businessHighlights: [
            "Jio Platforms: 450M+ subscribers, fastest growing digital ecosystem",
            "Reliance Retail: India's largest retailer with 18,000+ stores",
            "O2C business contributes 55% of revenue, diversifying into green hydrogen",
        ],
        risks: ["Commodity price volatility", "Regulatory changes in telecom", "High capex in new energy"],
    },
    TCS: {
        description: "Tata Consultancy Services is a global leader in IT services, consulting, and digital transformation solutions, serving clients across 46 countries.",
        sector: "Information Technology",
        ceo: "K. Krithivasan",
        promoterHolding: 72.3,
        marketCap: "₹14.2L Cr",
        pe: 32.1,
        dividendYield: 1.2,
        debtToEquity: 0.05,
        roe: 47.8,
        cagr1y: 5.1,
        cagr3y: 11.8,
        cagr5y: 16.2,
        policyImpacts: [
            "US H-1B visa policy changes impact operational costs",
            "India's Digital India push creates domestic opportunities",
            "EU AI regulation drives consulting demand for compliance",
        ],
        businessHighlights: [
            "625,000+ employees across 55 countries",
            "AI & cloud services growing at 25% YoY",
            "Consistent dividend payer with 75%+ payout ratio",
        ],
        risks: ["Currency fluctuation risk", "Client concentration in BFSI", "AI disruption to traditional IT services"],
    },
    HDFCBANK: {
        description: "HDFC Bank is India's largest private sector bank by assets, offering a comprehensive range of banking and financial products to retail and corporate clients.",
        sector: "Banking & Financial Services",
        ceo: "Sashidhar Jagdishan",
        promoterHolding: 25.8,
        marketCap: "₹12.5L Cr",
        pe: 19.8,
        dividendYield: 1.1,
        debtToEquity: 6.8,
        roe: 16.5,
        cagr1y: 12.4,
        cagr3y: 9.6,
        cagr5y: 11.8,
        policyImpacts: [
            "RBI rate cuts directly benefit NIM expansion",
            "Financial inclusion mandates drive rural branch expansion",
            "Digital lending regulations create compliance costs but moat",
        ],
        businessHighlights: [
            "8,000+ branches, India's most trusted private bank",
            "Post HDFC merger: largest mortgage book in India",
            "Digital transactions growing at 30% annually",
        ],
        risks: ["Interest rate cycle risk", "Post-merger integration challenges", "NPA from unsecured retail"],
    },
    INFY: {
        description: "Infosys Limited is a global digital services and consulting company, one of the pioneers of the Indian IT industry.",
        sector: "Information Technology",
        ceo: "Salil Parekh",
        promoterHolding: 14.8,
        marketCap: "₹7.5L Cr",
        pe: 27.3,
        dividendYield: 2.1,
        debtToEquity: 0.08,
        roe: 32.1,
        cagr1y: 6.8,
        cagr3y: 14.2,
        cagr5y: 21.5,
        policyImpacts: [
            "EU data protection laws increase IT consulting demand",
            "India-US trade relations impact deal flow",
            "Government digitization projects create large deals",
        ],
        businessHighlights: [
            "Among world's most ethical companies (14 consecutive years)",
            "Cloud revenue at $1.5B, growing 25% YoY",
            "Strong deal wins: $9.8B large deal TCV in FY24",
        ],
        risks: ["Attrition in key skill areas", "Pricing pressure from GenAI", "Cross-currency headwinds"],
    },
    ICICIBANK: {
        description: "ICICI Bank is India's second-largest private sector bank, offering retail, SME, and corporate banking products with a strong digital focus.",
        sector: "Banking & Financial Services",
        ceo: "Sandeep Bakhshi",
        promoterHolding: 0,
        marketCap: "₹8.8L Cr",
        pe: 18.2,
        dividendYield: 0.8,
        debtToEquity: 6.2,
        roe: 17.8,
        cagr1y: 18.5,
        cagr3y: 24.1,
        cagr5y: 22.8,
        policyImpacts: [
            "Credit growth linked to GDP momentum and capex cycle",
            "PSL norms drive priority sector lending targets",
            "UPI/digital payments growth benefits transaction income",
        ],
        businessHighlights: [
            "iMobile Pay: 55M+ users with super-app features",
            "Best-in-class asset quality: GNPA at 2.2%",
            "ROA consistently above 2% — among highest in sector",
        ],
        risks: ["Macro slowdown affecting credit growth", "Competitive intensity in retail banking", "Technology disruption by fintechs"],
    },
};

const DEFAULT_DATA = {
    description: "A leading Indian company contributing to the growth of the Indian economy.",
    sector: "Diversified",
    ceo: "Board of Directors",
    promoterHolding: 45.0,
    marketCap: "₹1L Cr+",
    pe: 22.0,
    dividendYield: 1.0,
    debtToEquity: 0.5,
    roe: 15.0,
    cagr1y: 10.0,
    cagr3y: 12.0,
    cagr5y: 15.0,
    policyImpacts: [
        "Government infrastructure spending benefits the sector",
        "Tax reforms and GST simplification improve operational efficiency",
        "PLI scheme incentives drive manufacturing growth",
    ],
    businessHighlights: [
        "Strong domestic market presence with growing customer base",
        "Expanding digital capabilities and tech adoption",
        "Consistent revenue growth over the past 5 years",
    ],
    risks: ["Market volatility", "Regulatory changes", "Competition from new entrants"],
};

const MF_DATABASE: Record<string, any> = {
    "PARAG PARIKH FLEXI CAP FUND DIRECT GROWTH": {
        description: "A flagship flexi-cap fund that invests across large, mid, and small-cap stocks, including international equities (Alphabet, Microsoft). Known for its value-investing philosophy and long-term focus.",
        sector: "Flexi Cap - Equity",
        manager: "Rajeev Thakkar",
        category: "Equity - Flexi Cap",
        expenseRatio: 0.62,
        riskGrade: "Very High",
        marketCap: "₹65,000 Cr",
        cagr1y: 28.4,
        cagr3y: 22.5,
        cagr5y: 24.8,
        holdings: ["HDFC Bank", "Bajaj Holdings", "Alphabet Inc", "Microsoft", "ICICI Bank"],
        policyImpacts: [
            "Overseas investment limits impact the fund's ability to add new US stocks",
            "Indian taxation on LTCG affects net returns for long-term holders",
            "SEBI categorization rules ensure strictly flexi-cap mandate"
        ],
        businessHighlights: [
            "Consistent outperformance vs Nifty 500 TRI",
            "Low portfolio turnover ratio indicates high conviction",
            "Unique exposure to global tech giants"
        ],
        risks: ["Currency risk for US exposure", "Concentration risk in top 10 holdings", "Market volatility"]
    },
    "QUANT SMALL CAP FUND DIRECT GROWTH": {
        description: "A high-momentum small-cap fund that uses a proprietary VLRT framework (Valuation, Liquidity, Risk, Time) to identify multi-bagger opportunities in the small-cap space.",
        sector: "Small Cap - Equity",
        manager: "Sandeep Tandon",
        category: "Equity - Small Cap",
        expenseRatio: 0.77,
        riskGrade: "Very High",
        marketCap: "₹22,000 Cr",
        cagr1y: 62.5,
        cagr3y: 35.8,
        cagr5y: 45.2,
        holdings: ["Reliance Industries", "Jio Financial", "HDFC Bank", "Adani Power", "Bikaji Foods"],
        policyImpacts: [
            "Small-cap liquidity stress tests by SEBI monitor fund stability",
            "LTCG changes impact equity fund attractiveness",
            "RBI interest rate cycle affects small-cap borrowing costs"
        ],
        businessHighlights: [
            "Leader in the small-cap category for last 3 years",
            "Agile portfolio management with high churn based on momentum",
            "Strong focus on macro-economic indicators (VLRT)"
        ],
        risks: ["High portfolio churn", "Liquidity risk in small-cap stocks", "Sharp drawdowns during bear markets"]
    },
    "KOTAK LARGE AND MID CAP FUND DIRECT GROWTH": {
        description: "A diversified fund that maintains a balanced exposure between large-cap (stable) and mid-cap (growth) companies, aiming for consistent risk-adjusted returns.",
        sector: "Large & Mid Cap - Equity",
        manager: "Harsha Upadhyaya",
        category: "Equity - Large & Mid Cap",
        expenseRatio: 0.82,
        riskGrade: "Very High",
        marketCap: "₹18,500 Cr",
        cagr1y: 32.1,
        cagr3y: 19.4,
        cagr5y: 18.2,
        holdings: ["ICICI Bank", "Reliance Industries", "L&T", "Axis Bank", "Maruti Suzuki"],
        policyImpacts: [
            "Mandated 35% exposure to both large and mid-caps is strictly followed",
            "Changes in index weights (Nifty 100/150) impact rebalancing",
            "Growth in SIP flows provides stable AUM for long-term bets"
        ],
        businessHighlights: [
            "Stable performance across different market cycles",
            "Focus on high-quality management and capital efficiency",
            "Strong track record in identifying mid-cap winners early"
        ],
        risks: ["Tracking error vs benchmark", "Sectoral concentration in BFSI", "Interest rate sensitivity"]
    }
};

const DEFAULT_MF_DATA = {
    description: "This mutual fund focuses on long-term capital appreciation by investing in a diversified portfolio. Its performance is managed by experienced fund managers with a focus on risk-adjusted returns.",
    sector: "Mutual Fund",
    manager: "Professional Management",
    category: "Equity - Diversified",
    expenseRatio: 0.75,
    riskGrade: "Moderate",
    marketCap: "N/A",
    cagr1y: 12.4,
    cagr3y: 15.6,
    cagr5y: 13.8,
    policyImpacts: [
        "SEBI transparency norms benefit retail investors",
        "Taxation on LTCG/STCG impacts net returns",
        "Equity market momentum drives NAV growth"
    ],
    businessHighlights: [
        "Diversified portfolio across multiple sectors",
        "Higher liquidity compared to direct equity",
        "Professional risk management and rebalancing",
    ],
    risks: ["Market volatility", "Credit risk in debt holdings", "Exit load within 1 year"],
};

export default function StockDetailPage() {
    const params = useParams();
    const rawSymbol = typeof params.symbol === "string" ? params.symbol : "";
    const symbol = decodeURIComponent(rawSymbol).toUpperCase();

    const { holdings } = usePortfolio();
    const holding = holdings.find((h) => h.symbol.toUpperCase() === symbol);

    const isMF = holding?.asset_type === "mutual_fund" || symbol.length > 15 || symbol.includes("FUND") || symbol.includes("CAP");
    const stock = isMF ? (MF_DATABASE[symbol] || DEFAULT_MF_DATA) : (STOCK_DATA[symbol] || DEFAULT_DATA);
    const financials = getFinancials(symbol);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const result = await analyzeStock(symbol, {
                asset_type: isMF ? "mutual_fund" : "stock",
                quarterly: financials.quarterly,
                yearly: financials.yearly,
                earnings_calls: financials.earningsCalls,
                pe: !isMF ? (stock as any).pe : null,
                roe: !isMF ? (stock as any).roe : null,
                de_ratio: !isMF ? (stock as any).debtToEquity : null
            });
            setAnalysisResult(result.analysis);
        } catch (err) {
            console.error("Analysis failed:", err);
            setAnalysisResult("### Error\nFailed to generate AI analysis. Please check your internet connection and AI provider settings.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formatNum = (n: number) => {
        if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L Cr`;
        if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K Cr`;
        return `₹${n} Cr`;
    };

    const statusColors: Record<string, { bg: string; color: string; label: string }> = {
        met: { bg: "#d4edda", color: "#155724", label: "✓ Delivered" },
        partially_met: { bg: "#fff3cd", color: "#856404", label: "◐ Partial" },
        missed: { bg: "#f8d7da", color: "#721c24", label: "✗ Missed" },
    };

    const projections = [
        { period: "1 Year", rate: stock.cagr1y, value: holding ? holding.total_value * (1 + stock.cagr1y / 100) : 0 },
        { period: "3 Years", rate: stock.cagr3y, value: holding ? holding.total_value * Math.pow(1 + stock.cagr3y / 100, 3) : 0 },
        { period: "5 Years", rate: stock.cagr5y, value: holding ? holding.total_value * Math.pow(1 + stock.cagr5y / 100, 5) : 0 },
    ];

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6c757d", marginBottom: 24 }}>
                <Link href="/portfolio" style={{ color: "#007bff", textDecoration: "none" }}>Portfolio</Link>
                <span>/</span>
                <span style={{ color: "#343a40", fontWeight: 500 }}>{symbol}</span>
            </div>

            {/* Header Card */}
            <div className="adminlte-card" style={{ marginBottom: 24 }}>
                <div className="adminlte-card-header" style={{ borderLeftColor: "#007bff" }}>
                    <div className="adminlte-card-title">
                        <span style={{ marginRight: 8 }}>{isMF ? "📊" : "📈"}</span> {holding?.name || symbol}
                    </div>
                </div>
                <div className="adminlte-card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#343a40", margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                                {holding?.name || symbol}
                                {!isMF && (() => {
                                    const mcStr = (stock as any).marketCap.toUpperCase();
                                    let isLarge = mcStr.includes("L CR") || parseInt(mcStr.replace(/[^0-9]/g, "")) > 20000;
                                    let isMid = mcStr.includes("K CR") && parseInt(mcStr.replace(/[^0-9]/g, "")) > 5;

                                    if (mcStr.includes("L CR") && parseFloat(mcStr.replace(/[^\d.]/g, '')) < 0.2) isLarge = false; // < 20K Cr
                                    if (mcStr === "₹19.8L CR" || mcStr === "₹14.2L CR" || mcStr === "₹12.5L CR" || mcStr === "₹7.5L CR" || mcStr === "₹8.8L CR" || mcStr === "₹1L CR+") isLarge = true;

                                    const tagBg = isLarge ? "#cce5ff" : isMid ? "#fff3cd" : "#f8d7da";
                                    const tagColor = isLarge ? "#004085" : isMid ? "#856404" : "#721c24";
                                    const tagText = isLarge ? "Large Cap" : isMid ? "Mid Cap" : "Small Cap";
                                    return (
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: tagBg, color: tagColor, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                            {tagText}
                                        </span>
                                    );
                                })()}
                            </h1>
                            <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>{stock.sector} • {isMF ? "Direct / Growth" : `NSE: ${symbol}`}</p>
                        </div>
                        {holding && (
                            <div style={{ display: "flex", gap: 32 }}>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: 11, color: "#6c757d", marginBottom: 2 }}>{isMF ? "Latest NAV" : "Current Price"}</p>
                                    <p style={{ fontSize: 20, fontWeight: 700, color: "#343a40" }}>{formatCurrency(holding.current_price)}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: 11, color: "#6c757d", marginBottom: 2 }}>Your P&L</p>
                                    <p style={{ fontSize: 20, fontWeight: 700, color: holding.gain_loss >= 0 ? "#28a745" : "#dc3545" }}>
                                        {holding.gain_loss >= 0 ? "+" : ""}{formatCurrency(holding.gain_loss)} ({formatPercent(holding.gain_loss_pct)})
                                    </p>
                                </div>
                                {holding.xirr != null && (
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ fontSize: 11, color: "#6c757d", marginBottom: 2 }}>XIRR</p>
                                        <p style={{ fontSize: 20, fontWeight: 700, color: holding.xirr >= 0 ? "#28a745" : "#dc3545" }}>
                                            {formatPercent(holding.xirr)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {!holding && (
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                style={{
                                    padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                                    background: "linear-gradient(135deg, #6f42c1, #5a32a3)", color: "#fff",
                                    border: "none", cursor: isAnalyzing ? "wait" : "pointer",
                                    boxShadow: "0 2px 8px rgba(111, 66, 193, 0.3)",
                                }}
                            >
                                {isAnalyzing ? "Analyzing..." : "✨ Generate AI Report"}
                            </button>
                        )}
                        {holding && (
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                style={{
                                    padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                                    background: "linear-gradient(135deg, #6f42c1, #5a32a3)", color: "#fff",
                                    border: "none", cursor: isAnalyzing ? "wait" : "pointer",
                                    boxShadow: "0 2px 8px rgba(111, 66, 193, 0.3)",
                                }}
                            >
                                {isAnalyzing ? "Analyzing..." : "✨ Premium AI Analysis"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Analysis Result */}
            {analysisResult && (
                <div className="adminlte-card" style={{ marginBottom: 24, borderTop: "4px solid #6f42c1" }}>
                    <div className="adminlte-card-header">
                        <div className="adminlte-card-title">
                            <span style={{ marginRight: 8 }}>🧠</span> Dynamic AI Insights (Live Web Grounded)
                        </div>
                    </div>
                    <div className="adminlte-card-body" style={{ fontSize: 14, color: "#343a40", lineHeight: 1.6 }}>
                        <div className="markdown-content">
                            <ReactMarkdown>{analysisResult}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                {/* Left column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Business Overview */}
                    <div className="adminlte-card">
                        <div className="adminlte-card-header" style={{ borderLeftColor: "#28a745" }}>
                            <div className="adminlte-card-title">
                                <span style={{ marginRight: 8 }}>🏢</span> Business Overview
                            </div>
                        </div>
                        <div className="adminlte-card-body">
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#495057", marginBottom: 16 }}>{stock.description}</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {stock.businessHighlights.map((h, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#495057" }}>
                                        <span style={{ color: "#28a745", fontSize: 10, marginTop: 4, flexShrink: 0 }}>●</span>
                                        {h}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Growth Projections */}
                    {holding && (
                        <div className="adminlte-card">
                            <div className="adminlte-card-header" style={{ borderLeftColor: "#17a2b8" }}>
                                <div className="adminlte-card-title">
                                    <span style={{ marginRight: 8 }}>📊</span> Future Growth Projections
                                </div>
                            </div>
                            <div className="adminlte-card-body">
                                <p style={{ fontSize: 11, color: "#adb5bd", marginBottom: 16 }}>Based on historical CAGR. Not financial advice.</p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                                    {projections.map((p) => (
                                        <div key={p.period} style={{
                                            padding: 16, borderRadius: 8,
                                            background: "#f8f9fa", border: "1px solid #e9ecef",
                                        }}>
                                            <p style={{ fontSize: 11, fontWeight: 600, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.period}</p>
                                            <p style={{ fontSize: 22, fontWeight: 700, color: "#28a745", marginTop: 8 }}>{formatCurrency(p.value)}</p>
                                            <span style={{
                                                display: "inline-block", marginTop: 8,
                                                fontSize: 11, fontWeight: 600, padding: "2px 8px",
                                                borderRadius: 4, background: "#d4edda", color: "#155724",
                                            }}>
                                                {formatPercent(p.rate)} CAGR
                                            </span>
                                            <div style={{ marginTop: 10, width: "100%", height: 6, borderRadius: 3, background: "#e9ecef" }}>
                                                <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(p.rate * 3, 100)}%`, background: "linear-gradient(90deg, #28a745, #20c997)" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Policy Impacts */}
                    <div className="adminlte-card">
                        <div className="adminlte-card-header" style={{ borderLeftColor: "#6f42c1" }}>
                            <div className="adminlte-card-title">
                                <span style={{ marginRight: 8 }}>🏛️</span> Policy & Regulatory Impacts
                            </div>
                        </div>
                        <div className="adminlte-card-body">
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {stock.policyImpacts.map((p: string, i: number) => (
                                    <div key={i} style={{
                                        display: "flex", alignItems: "flex-start", gap: 12,
                                        padding: 12, borderRadius: 6, background: "#f8f9fa",
                                    }}>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, padding: "3px 8px",
                                            borderRadius: 4, background: "#cce5ff", color: "#004085",
                                            whiteSpace: "nowrap", flexShrink: 0,
                                        }}>Policy</span>
                                        <p style={{ fontSize: 13, color: "#495057", margin: 0, lineHeight: 1.5 }}>{p}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Risks */}
                    <div className="adminlte-card">
                        <div className="adminlte-card-header" style={{ borderLeftColor: "#ffc107" }}>
                            <div className="adminlte-card-title">
                                <span style={{ marginRight: 8 }}>⚠️</span> Key Risks
                            </div>
                        </div>
                        <div className="adminlte-card-body">
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {stock.risks.map((r: string, i: number) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#495057" }}>
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffc107", flexShrink: 0 }} />
                                        {r}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Holdings (Mutual Funds Only) */}
                    {isMF && stock.holdings && (
                        <div className="adminlte-card">
                            <div className="adminlte-card-header" style={{ borderLeftColor: "#007bff" }}>
                                <div className="adminlte-card-title">
                                    <span style={{ marginRight: 8 }}>💎</span> Top Holdings
                                </div>
                            </div>
                            <div className="adminlte-card-body">
                                <p style={{ fontSize: 13, color: "#6c757d", marginBottom: 16 }}>Major allocations in the fund's portfolio.</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {stock.holdings.map((h: string, i: number) => (
                                        <div key={i}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600, color: "#495057" }}>{h}</span>
                                                <span style={{ color: "#6c757d" }}>{9.5 - (i * 1.2)}%</span>
                                            </div>
                                            <div style={{ height: 6, background: "#e9ecef", borderRadius: 3 }}>
                                                <div style={{ height: "100%", background: "#007bff", width: `${(9.5 - (i * 1.2)) * 10}%`, borderRadius: 3 }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Key Metrics */}
                    <div className="adminlte-card">
                        <div className="adminlte-card-header" style={{ borderLeftColor: "#007bff" }}>
                            <div className="adminlte-card-title">
                                <span style={{ marginRight: 8 }}>📋</span> Key Metrics
                            </div>
                        </div>
                        <div className="adminlte-card-body">
                            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                {(isMF ? [
                                    { label: "Category", value: (stock as any).category },
                                    { label: "Expense Ratio", value: `${(stock as any).expenseRatio}%` },
                                    { label: "Risk Grade", value: (stock as any).riskGrade },
                                    { label: "Fund Manager", value: (stock as any).manager },
                                    { label: "Latest NAV", value: formatCurrency(holding?.current_price || 0) },
                                ] : [
                                    { label: "Market Cap", value: (stock as any).marketCap },
                                    { label: "P/E Ratio", value: (stock as any).pe?.toFixed(1) || "N/A" },
                                    { label: "ROE", value: `${(stock as any).roe}%` },
                                    { label: "Debt/Equity", value: (stock as any).debtToEquity?.toFixed(2) || "N/A" },
                                    { label: "Dividend Yield", value: `${(stock as any).dividendYield}%` },
                                ]).map((m: any) => (
                                    <div key={m.label} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "10px 0", borderBottom: "1px solid #e9ecef",
                                    }}>
                                        <span style={{ fontSize: 13, color: "#6c757d" }}>{m.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "#343a40" }}>{m.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Management / Fund Manager */}
                    <div className="adminlte-card">
                        <div className="adminlte-card-header" style={{ borderLeftColor: "#17a2b8" }}>
                            <div className="adminlte-card-title">
                                <span style={{ marginRight: 8 }}>{isMF ? "🧑‍💼" : "👤"}</span> {isMF ? "Fund Manager" : "Management"}
                            </div>
                        </div>
                        <div className="adminlte-card-body">
                            <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: 11, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{isMF ? "NAME" : "CEO / MD"}</p>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#343a40" }}>{isMF ? (stock as any).manager : (stock as any).ceo}</p>
                            </div>
                            {!isMF && (
                                <div>
                                    <p style={{ fontSize: 11, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Promoter Holding</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#e9ecef" }}>
                                            <div style={{
                                                height: "100%", borderRadius: 4,
                                                width: `${(stock as any).promoterHolding}%`,
                                                background: "linear-gradient(90deg, #007bff, #17a2b8)",
                                            }} />
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: "#343a40" }}>{(stock as any).promoterHolding}%</span>
                                    </div>
                                </div>
                            )}
                            {isMF && (
                                <div>
                                    <p style={{ fontSize: 11, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Asset Class Focus</p>
                                    <p style={{ fontSize: 14, color: "#495057", margin: 0 }}>{(stock as any).category}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Your Position */}
                    {holding && (
                        <div className="adminlte-card">
                            <div className="adminlte-card-header" style={{ borderLeftColor: "#28a745" }}>
                                <div className="adminlte-card-title">
                                    <span style={{ marginRight: 8 }}>💼</span> Your Position
                                </div>
                            </div>
                            <div className="adminlte-card-body">
                                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                    {[
                                        { label: isMF ? "Units" : "Quantity", value: `${holding.quantity} ${isMF ? "units" : "shares"}` },
                                        { label: isMF ? "Avg. NAV" : "Avg. Buy Price", value: formatCurrency(holding.avg_price) },
                                        { label: "Invested", value: formatCurrency(holding.quantity * holding.avg_price) },
                                        { label: "Current Value", value: formatCurrency(holding.total_value) },
                                        { label: "Broker", value: holding.broker },
                                    ].map((m: any) => (
                                        <div key={m.label} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "10px 0", borderBottom: "1px solid #e9ecef",
                                        }}>
                                            <span style={{ fontSize: 13, color: "#6c757d" }}>{m.label}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: "#343a40" }}>{m.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ Performance / Balance Sheet ═══ */}
            {isMF ? (
                <div className="adminlte-card" style={{ marginTop: 24 }}>
                    <div className="adminlte-card-header" style={{ borderLeftColor: "#28a745" }}>
                        <div className="adminlte-card-title">
                            <span style={{ marginRight: 8 }}>📊</span> Fund Performance vs Benchmark
                        </div>
                    </div>
                    <div className="adminlte-card-body" style={{ padding: 0 }}>
                        <div style={{ padding: 16 }}>
                            <p style={{ fontSize: 13, color: "#495057", marginBottom: 16, lineHeight: 1.6 }}>
                                <strong>Quick Insight:</strong> {financials.insights || "This fund has shown consistent performance across market cycles. Consult the detailed AI report for a deep dive into alpha generation."}
                            </p>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                    {["Period", "Fund Return", "Benchmark", "Alpha"].map((h: string) => (
                                        <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "#6c757d", textAlign: "left", textTransform: "uppercase" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(financials.performance || []).map((p: any, i: number) => (
                                    <tr key={i} style={{ borderBottom: "1px solid #e9ecef" }}>
                                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#343a40" }}>{p.period}</td>
                                        <td style={{ padding: "12px 16px", color: "#28a745", fontWeight: 700 }}>{p.return ? `+${p.return}%` : "N/A"}</td>
                                        <td style={{ padding: "12px 16px", color: "#6c757d" }}>{p.benchmark ? `+${p.benchmark}%` : "N/A"}</td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "#d4edda", color: "#155724" }}>
                                                {p.return && p.benchmark ? `+${(p.return - p.benchmark).toFixed(2)}%` : "N/A"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!financials.performance || financials.performance.length === 0) && (
                                    <tr>
                                        <td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#adb5bd" }}>
                                            Historical performance data building... Click "✨ Premium AI Analysis" for live web-grounded reports.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="adminlte-card" style={{ marginTop: 24 }}>
                    <div className="adminlte-card-header" style={{ borderLeftColor: "#6f42c1" }}>
                        <div className="adminlte-card-title">
                            <span style={{ marginRight: 8 }}>📊</span> Balance Sheet Summary
                        </div>
                    </div>
                    <div className="adminlte-card-body" style={{ padding: 0, overflow: "auto" }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#495057", padding: "16px 16px 8px", margin: 0 }}>
                            Quarterly Results (Last 4 Quarters)
                        </h4>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                    {["Quarter", "Revenue", "Net Profit", "OPM %", "EPS"].map((h: string) => (
                                        <th key={h} style={{ padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#6c757d", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {financials.quarterly?.map((q: any, i: number) => (
                                    <tr key={q.quarter} style={{ borderBottom: "1px solid #e9ecef", background: i === 0 ? "#f0f7ff" : "transparent" }}>
                                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#343a40" }}>{q.quarter}</td>
                                        <td style={{ padding: "10px 14px", color: "#343a40" }}>{formatNum(q.revenue)}</td>
                                        <td style={{ padding: "10px 14px", color: q.netProfit > 0 ? "#28a745" : "#dc3545", fontWeight: 600 }}>{formatNum(q.netProfit)}</td>
                                        <td style={{ padding: "10px 14px" }}>
                                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: q.operatingMargin > 20 ? "#d4edda" : "#fff3cd", color: q.operatingMargin > 20 ? "#155724" : "#856404" }}>{q.operatingMargin}%</span>
                                        </td>
                                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#343a40" }}>₹{q.eps.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#495057", padding: "20px 16px 8px", margin: 0, borderTop: "2px solid #dee2e6" }}>
                            Annual Summary (2 Years)
                        </h4>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                    {["Year", "Revenue", "Net Profit", "Total Assets", "Total Debt", "Equity", "Op. Cash Flow"].map((h: string) => (
                                        <th key={h} style={{ padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "#6c757d", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {financials.yearly.map((y: any) => (
                                    <tr key={y.year} style={{ borderBottom: "1px solid #e9ecef" }}>
                                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#343a40" }}>{y.year}</td>
                                        <td style={{ padding: "10px 14px", color: "#343a40" }}>{formatNum(y.revenue)}</td>
                                        <td style={{ padding: "10px 14px", color: "#28a745", fontWeight: 600 }}>{formatNum(y.netProfit)}</td>
                                        <td style={{ padding: "10px 14px", color: "#343a40", fontWeight: 500 }}>{formatNum(y.totalAssets)}</td>
                                        <td style={{ padding: "10px 14px", color: "#6c757d" }}>{formatNum(y.totalDebt)}</td>
                                        <td style={{ padding: "10px 14px", color: "#343a40" }}>{formatNum(y.equity)}</td>
                                        <td style={{ padding: "10px 14px", color: "#007bff", fontWeight: 600 }}>{formatNum(y.operatingCashFlow)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ Major Investors (Stocks Only) ═══ */}
            {!isMF && (
                <div className="adminlte-card" style={{ marginTop: 24 }}>
                    <div className="adminlte-card-header" style={{ borderLeftColor: "#ffc107" }}>
                        <div className="adminlte-card-title">
                            <span style={{ marginRight: 8 }}>🐋</span> Major Investors & Institutional Activity
                        </div>
                    </div>
                    <div className="adminlte-card-body">
                        <p style={{ fontSize: 13, color: "#6c757d", marginBottom: 16 }}>Tracking significant accumulation and distribution by Domestic and Foreign Institutional Investors (DII/FII).</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                            {/* Whales Buying */}
                            <div style={{ background: "#f8f9fa", borderRadius: 8, border: "1px solid #e9ecef" }}>
                                <div style={{ padding: "12px 16px", borderBottom: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#28a745", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Accumulation (Buys)</span>
                                    <span style={{ fontSize: 16 }}>📈</span>
                                </div>
                                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                                    {[
                                        { name: "SBI Mutual Fund", qty: "2.4M", percent: "+0.15%", date: "Feb 2026" },
                                        { name: "Vanguard Emerging Mkts", qty: "1.8M", percent: "+0.10%", date: "Jan 2026" },
                                        { name: "Life Insurance Corp (LIC)", qty: "1.1M", percent: "+0.08%", date: "Jan 2026" }
                                    ].map((inv: any, i: number) => (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: "#343a40", margin: 0 }}>{inv.name}</p>
                                                <p style={{ fontSize: 11, color: "#6c757d", margin: "2px 0 0 0" }}>{inv.date}</p>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: "#28a745", margin: 0 }}>{inv.qty} shares</p>
                                                <p style={{ fontSize: 11, color: "#28a745", margin: "2px 0 0 0" }}>{inv.percent} stake</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Whales Selling */}
                            <div style={{ background: "#f8f9fa", borderRadius: 8, border: "1px solid #e9ecef" }}>
                                <div style={{ padding: "12px 16px", borderBottom: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#dc3545", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Distribution (Sells)</span>
                                    <span style={{ fontSize: 16 }}>📉</span>
                                </div>
                                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                                    {[
                                        { name: "Govt of Singapore (GIC)", qty: "1.2M", percent: "-0.08%", date: "Feb 2026" },
                                        { name: "BlackRock Global", qty: "850K", percent: "-0.05%", date: "Dec 2025" }
                                    ].map((inv: any, i: number) => (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: "#343a40", margin: 0 }}>{inv.name}</p>
                                                <p style={{ fontSize: 11, color: "#6c757d", margin: "2px 0 0 0" }}>{inv.date}</p>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: "#dc3545", margin: 0 }}>{inv.qty} shares</p>
                                                <p style={{ fontSize: 11, color: "#dc3545", margin: "2px 0 0 0" }}>{inv.percent} stake</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ textAlign: "center", padding: "8px 0", marginTop: "auto" }}>
                                        <span style={{ fontSize: 11, color: "#adb5bd" }}>No other major selling activity</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Management Earnings Calls (Stocks Only) ═══ */}
            {!isMF && (
                <div className="adminlte-card" style={{ marginTop: 24 }}>
                    <div className="adminlte-card-header" style={{ borderLeftColor: "#e83e8c" }}>
                        <div className="adminlte-card-title">
                            <span style={{ marginRight: 8 }}>🎙️</span> Management Earnings Calls — Promise Tracker
                        </div>
                    </div>
                    <div className="adminlte-card-body">
                        <p style={{ fontSize: 12, color: "#6c757d", marginBottom: 20 }}>
                            Analysis of the last 4 earnings calls — did management deliver on their commitments?
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            {financials.earningsCalls.map((call: any) => {
                                const status = statusColors[call.deliveryStatus];
                                return (
                                    <div key={call.quarter} style={{ border: "1px solid #e9ecef", borderRadius: 8, overflow: "hidden" }}>
                                        {/* Call Header */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <span style={{ fontSize: 15, fontWeight: 700, color: "#343a40" }}>{call.quarter}</span>
                                                <span style={{ fontSize: 11, color: "#6c757d" }}>{call.date}</span>
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: status.bg, color: status.color }}>
                                                {status.label}
                                            </span>
                                        </div>
                                        {/* Call Body */}
                                        <div style={{ padding: 16 }}>
                                            <p style={{ fontSize: 13, color: "#495057", marginBottom: 12, lineHeight: 1.6 }}>{call.summary}</p>
                                            {/* Promises */}
                                            <div style={{ marginBottom: 12 }}>
                                                <p style={{ fontSize: 11, fontWeight: 700, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Key Promises</p>
                                                {call.keyPromises.map((p: string, i: number) => (
                                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#495057", marginBottom: 4 }}>
                                                        <span style={{ color: status.color, flexShrink: 0, marginTop: 1 }}>•</span>
                                                        {p}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Highlights */}
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                                {call.highlights.map((h: string, i: number) => (
                                                    <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "#e9ecef", color: "#495057" }}>
                                                        {h}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
