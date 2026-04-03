"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import InfoBox from "@/components/ui/InfoBox";
import CardWidget from "@/components/ui/CardWidget";
import DataTableWidget from "@/components/ui/DataTableWidget";
import FormModal from "@/components/ui/FormModal";
import CsvUploadModal from "@/components/ui/CsvUploadModal";
import AssetDetailsModal from "@/components/ui/AssetDetailsModal";

const ASSET_TYPES = [
    { value: "real_estate", label: "Real Estate" },
    { value: "gold", label: "Gold" },
    { value: "fd", label: "Fixed Deposit" },
    { value: "ppf", label: "PPF" },
    { value: "nps", label: "NPS" },
    { value: "epf", label: "EPF" },
];

const calculateFdRates = (bank: string, civilStatus: string) => {
    let baseRate = 6.5; // Default safe estimate
    if (bank === "SBI") baseRate = 6.8;
    else if (bank === "HDFC" || bank === "ICICI") baseRate = 7.0;
    else if (bank === "Post Office" || bank === "Postal") baseRate = 7.5;

    // Add senior citizen bonus (~0.50%)
    if (civilStatus === "Senior Citizen") {
        baseRate += 0.50;
    }
    return baseRate;
};

const calculateFdMaturity = (val: any, form: any) => {
    // Only auto-calc if it's an FD/PPF/NPS/EPF style asset with rate/dates
    if (!["fd", "ppf", "epf", "nps"].includes(form.asset_type)) return {};

    const principal = parseFloat(form.purchase_price) || 0;
    const rate = parseFloat(form.interest_rate) || 0;

    if (principal > 0 && rate > 0 && form.purchase_date && form.maturity_date) {
        const pDate = new Date(form.purchase_date);
        const mDate = new Date(form.maturity_date);
        const diffTime = Math.abs(mDate.getTime() - pDate.getTime());
        const tenureYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

        if (tenureYears > 0) {
            // Quarterly compounding formula: A = P(1 + r/n)^(nt)
            const n = 4; // Compounded quarterly
            const r = rate / 100;
            const amount = principal * Math.pow(1 + r / n, n * tenureYears);
            return { value: Math.round(amount) };
        }
    }
    return {};
};

const FIELDS = [
    { key: "name", label: "Asset Name", required: true },
    { key: "asset_type", label: "Type", type: "select" as const, options: ASSET_TYPES, required: true },
    {
        key: "value", label: "Current/Maturity Value (₹)", type: "number" as const,
        placeholder: "Auto-calculates for FD/PPF if empty"
    },
    {
        key: "purchase_price", label: "Purchase Price / Invested Amount (₹)", type: "number" as const,
        onChangeEffect: calculateFdMaturity
    },
    {
        key: "location",
        label: "Location / Bank",
        type: "select" as const,
        options: [
            { value: "", label: "N/A" }, { value: "SBI", label: "SBI" }, { value: "HDFC", label: "HDFC" },
            { value: "ICICI", label: "ICICI" }, { value: "Post Office", label: "Post Office" }
        ],
        showIf: (form: any) => ["real_estate", "fd"].includes(form.asset_type),
        onChangeEffect: (val: any, form: any) => {
            if (form.asset_type === "fd") {
                const newRate = calculateFdRates(val, form.property_type);
                const updates = { interest_rate: newRate };
                return { ...updates, ...calculateFdMaturity(val, { ...form, ...updates }) };
            }
            return {};
        }
    },
    {
        key: "property_type",
        label: "Property / Citizen Type",
        type: "select" as const,
        options: [
            { value: "", label: "N/A" }, { value: "Residential", label: "Residential (RE)" }, { value: "Commercial", label: "Commercial (RE)" },
            { value: "Land", label: "Land (RE)" }, { value: "General", label: "General Citizen (FD)" }, { value: "Senior Citizen", label: "Senior Citizen (FD)" }
        ],
        showIf: (form: any) => ["real_estate", "fd"].includes(form.asset_type),
        onChangeEffect: (val: any, form: any) => {
            if (form.asset_type === "fd") {
                const newRate = calculateFdRates(form.location, val);
                const updates = { interest_rate: newRate };
                return { ...updates, ...calculateFdMaturity(val, { ...form, ...updates }) };
            }
            return {};
        }
    },
    {
        key: "property_details",
        label: "Property Details (Area, BHK, Face, etc.)",
        type: "textarea" as const,
        placeholder: "Enter more details about the property for accurate AI analysis...",
        showIf: (form: any) => form.asset_type === "real_estate"
    },
    {
        key: "loan_outstanding", label: "Loan Outstanding (₹)", type: "number" as const,
        showIf: (form: any) => form.asset_type === "real_estate"
    },
    {
        key: "emi", label: "EMI (₹)", type: "number" as const,
        showIf: (form: any) => form.asset_type === "real_estate"
    },
    {
        key: "interest_rate", label: "Interest Rate (%)", type: "number" as const,
        showIf: (form: any) => ["fd", "ppf", "epf"].includes(form.asset_type),
        onChangeEffect: calculateFdMaturity
    },
    {
        key: "purchase_date", label: "Purchase / Investment Date", type: "date" as const,
        onChangeEffect: calculateFdMaturity
    },
    {
        key: "maturity_date", label: "Maturity Date", type: "date" as const,
        showIf: (form: any) => ["fd", "ppf", "epf", "nps"].includes(form.asset_type),
        onChangeEffect: calculateFdMaturity
    },
];

const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

const TYPE_ICONS: Record<string, string> = {
    real_estate: "🏠", gold: "🪙", fd: "🏦", ppf: "📋", nps: "📊", epf: "🏢"
};

export default function AssetsPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [viewItem, setViewItem] = useState<any>(null);
    const [showCsv, setShowCsv] = useState(false);
    const [filterType, setFilterType] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get(`/assets${filterType ? `?asset_type=${filterType}` : ""}`);
            setAssets(res.data);
        } catch { setAssets([]); }
        finally { setLoading(false); }
    }, [filterType]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (data: Record<string, any>) => {
        if (editItem) {
            await api.put(`/assets/${editItem.id}`, data);
        } else {
            await api.post("/assets", data);
        }
        setShowForm(false);
        setEditItem(null);
        fetchData();
    };

    const handleDelete = async (row: any) => {
        if (!confirm("Delete this asset?")) return;
        await api.delete(`/assets/${row.id}`);
        fetchData();
    };

    const totalValue = assets.reduce((s, a) => s + a.value, 0);
    const totalLoan = assets.reduce((s, a) => s + a.loan_outstanding, 0);
    const totalEmi = assets.reduce((s, a) => s + a.emi, 0);
    const netEquity = totalValue - totalLoan;

    const columns = [
        { key: "name", label: "Name" },
        {
            key: "asset_type", label: "Type", render: (v: string) => (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {TYPE_ICONS[v] || "📦"} {ASSET_TYPES.find(t => t.value === v)?.label || v}
                </span>
            )
        },
        { key: "value", label: "Current Value", render: (v: number) => formatCurrency(v) },
        { key: "purchase_price", label: "Purchase Price", render: (v: number) => v ? formatCurrency(v) : "—" },
        { key: "loan_outstanding", label: "Loan", render: (v: number) => v ? formatCurrency(v) : "—" },
        { key: "emi", label: "EMI", render: (v: number) => v ? formatCurrency(v) : "—" },
        { key: "location", label: "Location", render: (v: string) => v || "—" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Page Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>Assets</h1>
                    <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
                        Manage your real estate, gold, FD, PPF, NPS, and other assets
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                        onClick={() => setShowCsv(true)}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                            border: "1px solid #ced4da", background: "#f8f9fa", color: "#495057",
                            cursor: "pointer", transition: "all 0.15s",
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
                        + Add Asset
                    </button>
                </div>
            </div>

            {/* Info Boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <InfoBox icon="💎" label="Total Value" value={formatCurrency(totalValue)} color="#007bff" />
                <InfoBox icon="✨" label="Net Equity" value={formatCurrency(netEquity)} color="#28a745" />
                <InfoBox icon="🏦" label="Loan Outstanding" value={formatCurrency(totalLoan)} color="#dc3545" />
                <InfoBox icon="📆" label="Monthly EMI" value={formatCurrency(totalEmi)} color="#ffc107" />
            </div>

            {/* Filter */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <button
                    onClick={() => setFilterType("")}
                    style={{
                        padding: "6px 14px", borderRadius: 4, fontSize: 13, fontWeight: 600,
                        border: !filterType ? "none" : "1px solid #ced4da",
                        background: !filterType ? "#007bff" : "#fff",
                        color: !filterType ? "#fff" : "#495057",
                        cursor: "pointer",
                    }}
                >
                    All
                </button>
                {ASSET_TYPES.map(t => (
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
                    >
                        {TYPE_ICONS[t.value]} {t.label}
                    </button>
                ))}
            </div>

            {/* Data Table */}
            <CardWidget title="All Assets" icon="💎" borderColor="#17a2b8">
                {loading ? (
                    <div style={{ textAlign: "center", padding: 32, color: "#adb5bd" }}>Loading...</div>
                ) : (
                    <DataTableWidget
                        columns={columns}
                        data={assets}
                        onRowClick={(row) => setViewItem(row)}
                        onEdit={(row) => { setEditItem(row); setShowForm(true); }}
                        onDelete={handleDelete}
                        emptyMessage="No assets yet. Click 'Add Asset' to start tracking real estate, gold, FD, PPF, NPS, EPF."
                    />
                )}
            </CardWidget>

            {showForm && (
                <FormModal
                    title={editItem ? "Edit Asset" : "Add Asset"}
                    fields={FIELDS}
                    initial={editItem}
                    onSubmit={handleSubmit}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                />
            )}

            {viewItem && (
                <AssetDetailsModal
                    asset={viewItem}
                    onClose={() => setViewItem(null)}
                    api={api}
                />
            )}

            {showCsv && (
                <CsvUploadModal
                    title="Upload Assets CSV"
                    uploadUrl="/assets/upload-csv"
                    expectedColumns="name, asset_type, value, purchase_price, location, property_type, loan_outstanding, emi, interest_rate, maturity_date, purchase_date"
                    onClose={() => setShowCsv(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}
