"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import InfoBox from "@/components/ui/InfoBox";
import CardWidget from "@/components/ui/CardWidget";
import DataTableWidget from "@/components/ui/DataTableWidget";
import FormModal from "@/components/ui/FormModal";
import CsvUploadModal from "@/components/ui/CsvUploadModal";

const CATEGORIES = ["Housing", "Food", "Transport", "Shopping", "Entertainment", "Utilities", "Healthcare", "Education", "SIP", "Other"];
const COLORS = ["#007bff", "#28a745", "#17a2b8", "#ffc107", "#dc3545", "#6f42c1", "#e83e8c", "#20c997", "#fd7e14", "#6c757d"];

const FIELDS = [
    { key: "category", label: "Category", type: "select" as const, options: CATEGORIES.map(c => ({ value: c, label: c })), required: true },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount (₹)", type: "number" as const, required: true },
    {
        key: "type", label: "Type", type: "select" as const, options: [
            { value: "variable", label: "Variable" }, { value: "recurring", label: "Recurring" },
        ]
    },
    { key: "date", label: "Date", type: "date" as const },
];

const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [showCsv, setShowCsv] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [expRes, budRes] = await Promise.all([
                api.get("/expenses"),
                api.get("/expenses/budgets/all"),
            ]);
            setExpenses(expRes.data);
            setBudgets(budRes.data);
        } catch { setExpenses([]); setBudgets([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (data: Record<string, any>) => {
        if (editItem) {
            await api.put(`/expenses/${editItem.id}`, data);
        } else {
            await api.post("/expenses", data);
        }
        setShowForm(false);
        setEditItem(null);
        fetchData();
    };

    const handleDelete = async (row: any) => {
        if (!confirm("Delete this expense?")) return;
        await api.delete(`/expenses/${row.id}`);
        fetchData();
    };

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const recurringTotal = expenses.filter(e => e.type === "recurring").reduce((s, e) => s + e.amount, 0);
    const variableTotal = expenses.filter(e => e.type === "variable").reduce((s, e) => s + e.amount, 0);

    // Category breakdown
    const categoryData = useMemo(() => {
        const map: Record<string, number> = {};
        expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
        return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [expenses]);

    const columns = [
        {
            key: "category", label: "Category", render: (v: string) => {
                const ci = CATEGORIES.indexOf(v);
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[ci >= 0 ? ci : COLORS.length - 1] }} />
                        {v}
                    </div>
                );
            }
        },
        { key: "description", label: "Description" },
        { key: "amount", label: "Amount", render: (v: number) => formatCurrency(v) },
        {
            key: "type", label: "Type", render: (v: string) => (
                <span style={{
                    display: "inline-flex", padding: "3px 10px", borderRadius: 4,
                    fontSize: 12, fontWeight: 600,
                    background: v === "recurring" ? "#cce5ff" : "#e9ecef",
                    color: v === "recurring" ? "#004085" : "#495057",
                }}>
                    {v}
                </span>
            )
        },
        { key: "date", label: "Date" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Page Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>Expenses</h1>
                    <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
                        Track and categorize your monthly expenses
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                        onClick={() => setShowCsv(true)}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                            border: "1px solid #ced4da", background: "#f8f9fa", color: "#495057", cursor: "pointer",
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
                        + Add Expense
                    </button>
                </div>
            </div>

            {/* Info Boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <InfoBox icon="💸" label="Total Expenses" value={formatCurrency(totalExpenses)} color="#dc3545" />
                <InfoBox icon="🔄" label="Recurring" value={formatCurrency(recurringTotal)} color="#007bff" />
                <InfoBox icon="📊" label="Variable" value={formatCurrency(variableTotal)} color="#ffc107" />
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <CardWidget title="By Category" icon="📊" borderColor="#6f42c1">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value" label={({ name, percent }: any) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 6, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: "center", padding: 32, color: "#adb5bd" }}>No data</div>
                    )}
                </CardWidget>

                <CardWidget title="Category Breakdown" icon="📋" borderColor="#17a2b8">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 60 }}>
                                <XAxis type="number" tick={{ fill: "#6c757d", fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" tick={{ fill: "#6c757d", fontSize: 11 }} width={80} />
                                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ background: "#fff", border: "1px solid #dee2e6", borderRadius: 6, fontSize: 12 }} />
                                <Bar dataKey="value" fill="#007bff" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: "center", padding: 32, color: "#adb5bd" }}>No data</div>
                    )}
                </CardWidget>
            </div>

            {/* Data Table */}
            <CardWidget title="All Expenses" icon="💸" borderColor="#dc3545">
                {loading ? (
                    <div style={{ textAlign: "center", padding: 32, color: "#adb5bd" }}>Loading...</div>
                ) : (
                    <DataTableWidget
                        columns={columns}
                        data={expenses}
                        onEdit={(row) => { setEditItem(row); setShowForm(true); }}
                        onDelete={handleDelete}
                        emptyMessage="No expenses yet. Click 'Add Expense' to start tracking."
                    />
                )}
            </CardWidget>

            {showForm && (
                <FormModal
                    title={editItem ? "Edit Expense" : "Add Expense"}
                    fields={FIELDS}
                    initial={editItem}
                    onSubmit={handleSubmit}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                />
            )}

            {showCsv && (
                <CsvUploadModal
                    title="Upload Expenses CSV"
                    uploadUrl="/expenses/upload-csv"
                    expectedColumns="category, description, amount, type, date"
                    onClose={() => setShowCsv(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}
