"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import InfoBox from "@/components/ui/InfoBox";
import CardWidget from "@/components/ui/CardWidget";
import DataTableWidget from "@/components/ui/DataTableWidget";
import FormModal from "@/components/ui/FormModal";
import CsvUploadModal from "@/components/ui/CsvUploadModal";

const POLICY_TYPES = [
    { value: "term", label: "Term Life" },
    { value: "health", label: "Health" },
    { value: "ulip", label: "ULIP" },
    { value: "endowment", label: "Endowment" },
];

const FIELDS = [
    { key: "name", label: "Policy Name", required: true },
    { key: "type", label: "Type", type: "select" as const, options: POLICY_TYPES, required: true },
    { key: "provider", label: "Provider" },
    { key: "sum_assured", label: "Sum Assured (₹)", type: "number" as const },
    { key: "premium", label: "Premium (₹)", type: "number" as const },
    {
        key: "frequency", label: "Frequency", type: "select" as const, options: [
            { value: "Annual", label: "Annual" }, { value: "Monthly", label: "Monthly" }, { value: "Quarterly", label: "Quarterly" },
        ]
    },
    { key: "start_date", label: "Start Date", type: "date" as const },
    { key: "end_date", label: "End Date", type: "date" as const },
    { key: "nominee", label: "Nominee" },
];

const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    term: { bg: "#d4edda", color: "#155724" },
    health: { bg: "#cce5ff", color: "#004085" },
    ulip: { bg: "#fff3cd", color: "#856404" },
    endowment: { bg: "#f8d7da", color: "#721c24" },
};

export default function InsurancePage() {
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [showCsv, setShowCsv] = useState(false);
    const [filterType, setFilterType] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/insurance${filterType ? `?policy_type=${filterType}` : ""}`);
            setPolicies(res.data);
        } catch { setPolicies([]); }
        finally { setLoading(false); }
    }, [filterType]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (data: Record<string, any>) => {
        if (editItem) {
            await api.put(`/insurance/${editItem.id}`, data);
        } else {
            await api.post("/insurance", data);
        }
        setShowForm(false);
        setEditItem(null);
        fetchData();
    };

    const handleDelete = async (row: any) => {
        if (!confirm("Delete this policy?")) return;
        await api.delete(`/insurance/${row.id}`);
        fetchData();
    };

    const totalCoverage = policies.reduce((s, p) => s + p.sum_assured, 0);
    const totalPremium = policies.reduce((s, p) => s + p.premium, 0);
    const termPolicies = policies.filter(p => p.type === "term").length;
    const healthPolicies = policies.filter(p => p.type === "health").length;

    const columns = [
        { key: "name", label: "Policy Name" },
        {
            key: "type", label: "Type", render: (v: string) => {
                const tc = TYPE_COLORS[v] || { bg: "#e9ecef", color: "#495057" };
                return (
                    <span style={{
                        display: "inline-flex", padding: "3px 10px", borderRadius: 4,
                        fontSize: 12, fontWeight: 600, background: tc.bg, color: tc.color,
                    }}>
                        {v}
                    </span>
                );
            }
        },
        { key: "provider", label: "Provider" },
        { key: "sum_assured", label: "Sum Assured", render: (v: number) => formatCurrency(v) },
        { key: "premium", label: "Premium", render: (v: number) => formatCurrency(v) },
        { key: "frequency", label: "Frequency" },
        { key: "nominee", label: "Nominee" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Page Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>Insurance</h1>
                    <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
                        Manage your life, health, and investment insurance policies
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                        onClick={() => setShowCsv(true)}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                            border: "1px solid #ced4da", background: "#f8f9fa", color: "#495057",
                            cursor: "pointer",
                        }}
                    >
                        📄 Upload CSV
                    </button>
                    <button
                        onClick={() => { setEditItem(null); setShowForm(true); }}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                            border: "none", background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff",
                            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,123,255,0.3)",
                        }}
                    >
                        + Add Policy
                    </button>
                </div>
            </div>

            {/* Info Boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <InfoBox icon="🛡️" label="Total Coverage" value={formatCurrency(totalCoverage)} color="#007bff" />
                <InfoBox icon="💰" label="Annual Premium" value={formatCurrency(totalPremium)} color="#ffc107" />
                <InfoBox icon="📋" label="Term Policies" value={termPolicies} color="#28a745" />
                <InfoBox icon="🏥" label="Health Policies" value={healthPolicies} color="#17a2b8" />
            </div>

            {/* Filter */}
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={() => setFilterType("")}
                    style={{
                        padding: "6px 14px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                        border: !filterType ? "none" : "1px solid #ced4da",
                        background: !filterType ? "#007bff" : "#fff",
                        color: !filterType ? "#fff" : "#495057",
                        cursor: "pointer",
                    }}
                >All</button>
                {POLICY_TYPES.map(t => (
                    <button
                        key={t.value}
                        onClick={() => setFilterType(t.value)}
                        style={{
                            padding: "6px 14px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                            border: filterType === t.value ? "none" : "1px solid #ced4da",
                            background: filterType === t.value ? "#007bff" : "#fff",
                            color: filterType === t.value ? "#fff" : "#495057",
                            cursor: "pointer",
                        }}
                    >{t.label}</button>
                ))}
            </div>

            {/* Data Table */}
            <CardWidget title="Insurance Policies" icon="🛡️" borderColor="#17a2b8">
                {loading ? (
                    <div style={{ textAlign: "center", padding: 32, color: "#adb5bd" }}>Loading...</div>
                ) : (
                    <DataTableWidget
                        columns={columns}
                        data={policies}
                        onEdit={(row) => { setEditItem(row); setShowForm(true); }}
                        onDelete={handleDelete}
                        emptyMessage="No insurance policies yet. Click 'Add Policy' to get started."
                    />
                )}
            </CardWidget>

            {showForm && (
                <FormModal
                    title={editItem ? "Edit Policy" : "Add Insurance Policy"}
                    fields={FIELDS}
                    initial={editItem}
                    onSubmit={handleSubmit}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                />
            )}

            {showCsv && (
                <CsvUploadModal
                    title="Upload Insurance CSV"
                    uploadUrl="/insurance/upload-csv"
                    expectedColumns="name, type, provider, sum_assured, premium, frequency, start_date, end_date, nominee"
                    onClose={() => setShowCsv(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}
