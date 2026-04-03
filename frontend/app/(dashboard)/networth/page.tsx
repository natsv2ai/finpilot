"use client";

import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import InfoBox from "@/components/ui/InfoBox";
import CardWidget from "@/components/ui/CardWidget";

const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

const COLORS = ["#007bff", "#28a745", "#17a2b8", "#ffc107", "#dc3545", "#6f42c1", "#e83e8c", "#fd7e14", "#20c997"];

export default function NetWorthPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get("/networth");
            setData(res.data);
        } catch { setData(null); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return <div style={{ textAlign: "center", padding: "80px 0", color: "#6c757d" }}>Loading net worth...</div>;
    }

    if (!data) {
        return <div style={{ textAlign: "center", padding: "80px 0", color: "#6c757d" }}>Failed to load net worth data.</div>;
    }

    const assetBreakdown = [
        { name: "Stocks", value: data.stocks_value },
        { name: "Mutual Funds", value: data.mutual_funds_value },
        { name: "Real Estate", value: data.real_estate_value },
        { name: "Gold", value: data.gold_value },
        { name: "FD", value: data.fd_value },
        { name: "PPF", value: data.ppf_value },
        { name: "NPS", value: data.nps_value },
        { name: "EPF", value: data.epf_value },
        { name: "Other", value: data.other_assets_value },
    ].filter(a => a.value > 0);

    const liabilityBreakdown = [
        { name: "Home Loan", value: data.home_loan },
        { name: "Other Loans", value: data.other_loans },
    ].filter(l => l.value > 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Page Header */}
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>Net Worth</h1>
                <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
                    Track your total assets, liabilities, and net worth
                </p>
            </div>

            {/* Summary Info Boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <InfoBox icon="💰" label="Net Worth" value={formatCurrency(data.net_worth)} color="#28a745" />
                <InfoBox icon="📈" label="Total Assets" value={formatCurrency(data.total_assets)} color="#007bff" />
                <InfoBox icon="📉" label="Total Liabilities" value={formatCurrency(data.total_liabilities)} color="#dc3545" />
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Asset Breakdown Pie */}
                <CardWidget title="Asset Breakdown" icon="💎" borderColor="#007bff">
                    {assetBreakdown.length > 0 ? (
                        <div>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={assetBreakdown} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value"
                                        label={({ name, percent }: any) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                        {assetBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 6, fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
                                {assetBreakdown.map((a, i) => (
                                    <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                                        <span style={{ color: "#6c757d" }}>{a.name}</span>
                                        <span style={{ marginLeft: "auto", fontWeight: 600, color: "#343a40" }}>{formatCurrency(a.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "32px 0", color: "#adb5bd" }}>No assets recorded yet. Add assets to see your breakdown.</div>
                    )}
                </CardWidget>

                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <CardWidget title="Monthly Overview" icon="📅" borderColor="#ffc107">
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 6, background: "#f8f9fa" }}>
                                <span style={{ color: "#6c757d", fontSize: 14 }}>Monthly Expenses</span>
                                <span style={{ fontWeight: 600, color: "#dc3545", fontSize: 14 }}>{formatCurrency(data.monthly_expenses)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 6, background: "#f8f9fa" }}>
                                <span style={{ color: "#6c757d", fontSize: 14 }}>Monthly EMI</span>
                                <span style={{ fontWeight: 600, color: "#ffc107", fontSize: 14 }}>{formatCurrency(data.monthly_emi)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 6, background: "#f8f9fa" }}>
                                <span style={{ color: "#6c757d", fontSize: 14 }}>Monthly SIP</span>
                                <span style={{ fontWeight: 600, color: "#28a745", fontSize: 14 }}>{formatCurrency(data.monthly_sip)}</span>
                            </div>
                        </div>
                    </CardWidget>

                    {liabilityBreakdown.length > 0 && (
                        <CardWidget title="Liabilities" icon="📉" borderColor="#dc3545">
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {liabilityBreakdown.map(l => (
                                    <div key={l.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 6, background: "#fff5f5" }}>
                                        <span style={{ color: "#6c757d", fontSize: 14 }}>{l.name}</span>
                                        <span style={{ fontWeight: 600, color: "#dc3545", fontSize: 14 }}>{formatCurrency(l.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardWidget>
                    )}
                </div>
            </div>
        </div>
    );
}
