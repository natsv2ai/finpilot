"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface AssetDetailsModalProps {
    asset: any;
    onClose: () => void;
    api: any;
}

export default function AssetDetailsModal({ asset, onClose, api }: AssetDetailsModalProps) {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isRealEstate = asset?.asset_type === "real_estate";

    useEffect(() => {
        if (!isRealEstate || !asset?.location) return;

        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/assets/${asset.id}/analysis`);
                setAnalysis(res.data.analysis);
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to load predictive analysis.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [asset.id, isRealEstate, asset.location, api]);

    const formatCurrency = (v: number) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center",
                padding: 16, backdropFilter: "blur(4px)"
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#f8f9fa", borderRadius: 12, width: "100%", maxWidth: 800,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)", maxHeight: "90vh", display: "flex", flexDirection: "column"
                }}
            >
                {/* Header */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.08)",
                    borderLeft: "4px solid #17a2b8", background: "#fff", borderTopLeftRadius: 12, borderTopRightRadius: 12
                }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#343a40", margin: 0 }}>
                            {asset.name}
                        </h2>
                        <span style={{ fontSize: 13, color: "#6c757d", fontWeight: 600, display: "inline-block", marginTop: 4 }}>
                            {asset.asset_type.toUpperCase().replace("_", " ")}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: 8, border: "none", background: "rgba(0,0,0,0.05)", borderRadius: "50%",
                            cursor: "pointer", color: "#495057", display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Body */}
                <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                        <div style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid rgba(0,0,0,0.05)" }}>
                            <div style={{ fontSize: 13, color: "#6c757d", marginBottom: 4 }}>Current Value</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#28a745" }}>{formatCurrency(asset.value)}</div>
                        </div>
                        <div style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid rgba(0,0,0,0.05)" }}>
                            <div style={{ fontSize: 13, color: "#6c757d", marginBottom: 4 }}>Purchase Price</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#495057" }}>{formatCurrency(asset.purchase_price)}</div>
                        </div>
                        {asset.loan_outstanding > 0 && (
                            <div style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid rgba(0,0,0,0.05)" }}>
                                <div style={{ fontSize: 13, color: "#6c757d", marginBottom: 4 }}>Outstanding Loan</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#dc3545" }}>{formatCurrency(asset.loan_outstanding)}</div>
                            </div>
                        )}
                        {asset.emi > 0 && (
                            <div style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid rgba(0,0,0,0.05)" }}>
                                <div style={{ fontSize: 13, color: "#6c757d", marginBottom: 4 }}>Monthly EMI</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: "#ffc107" }}>{formatCurrency(asset.emi)}</div>
                            </div>
                        )}
                    </div>

                    {isRealEstate && (
                        <div style={{ background: "#fff", borderRadius: 8, border: "1px solid rgba(0,123,255,0.2)", overflow: "hidden" }}>
                            <div style={{ background: "linear-gradient(90deg, #f8f9fa, #e9ecef)", padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 18 }}>🤖</span>
                                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0056b3" }}>AI Predictive Analysis</h3>
                                {loading && <span style={{ fontSize: 12, color: "#6c757d", marginLeft: "auto", fontStyle: "italic" }}>Analyzing market trends...</span>}
                            </div>

                            <div className="markdown-body" style={{ padding: "20px 16px", fontSize: 14, color: "#343a40", lineHeight: 1.6 }}>
                                {loading ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        <div style={{ height: 16, background: "#e9ecef", borderRadius: 4, width: "100%", animation: "pulse 1.5s infinite" }} />
                                        <div style={{ height: 16, background: "#e9ecef", borderRadius: 4, width: "95%", animation: "pulse 1.5s infinite" }} />
                                        <div style={{ height: 16, background: "#e9ecef", borderRadius: 4, width: "80%", animation: "pulse 1.5s infinite" }} />
                                    </div>
                                ) : error ? (
                                    <div style={{ color: "#dc3545", background: "#f8d7da", padding: 12, borderRadius: 6, border: "1px solid #f5c6cb" }}>
                                        {error}
                                    </div>
                                ) : analysis ? (
                                    <ReactMarkdown>{analysis}</ReactMarkdown>
                                ) : (
                                    <div style={{ color: "#6c757d", fontStyle: "italic" }}>No analysis available. Make sure Location is set to generate predictions.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
                .markdown-body h1, .markdown-body h2, .markdown-body h3 { margin-top: 0; color: #343a40; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
                .markdown-body p { margin-bottom: 12px; }
                .markdown-body ul, .markdown-body ol { margin-bottom: 12px; padding-left: 20px; }
                .markdown-body li { margin-bottom: 4px; }
                .markdown-body strong { color: #212529; }
            `}} />
        </div>
    );
}
