"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import InfoBox from "@/components/ui/InfoBox";
import CardWidget from "@/components/ui/CardWidget";
import FormModal from "@/components/ui/FormModal";

const RELATIONS = [
    { value: "self", label: "Self" },
    { value: "spouse", label: "Spouse" },
    { value: "child", label: "Child" },
    { value: "parent", label: "Parent" },
];

const AVATARS = ["👤", "👨", "👩", "👦", "👧", "👴", "👵", "🧑"];

const FIELDS = [
    { key: "name", label: "Name", required: true },
    { key: "relation", label: "Relation", type: "select" as const, options: RELATIONS, required: true },
    { key: "dob", label: "Date of Birth", type: "date" as const },
    { key: "avatar", label: "Avatar", type: "select" as const, options: AVATARS.map(a => ({ value: a, label: a })) },
    { key: "monthly_expense", label: "Monthly Expense (₹)", type: "number" as const },
];

const formatCurrency = (v: number) => `₹${v.toLocaleString("en-IN")}`;

const RELATION_BADGE: Record<string, { bg: string; color: string }> = {
    self: { bg: "#cce5ff", color: "#004085" },
    spouse: { bg: "#d4edda", color: "#155724" },
    child: { bg: "#fff3cd", color: "#856404" },
    parent: { bg: "#f8d7da", color: "#721c24" },
};

export default function FamilyPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get("/family");
            setMembers(res.data);
        } catch { setMembers([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (data: Record<string, any>) => {
        if (editItem) {
            await api.put(`/family/${editItem.id}`, data);
        } else {
            await api.post("/family", data);
        }
        setShowForm(false);
        setEditItem(null);
        fetchData();
    };

    const handleDelete = async (m: any) => {
        if (!confirm(`Remove ${m.name} from family?`)) return;
        await api.delete(`/family/${m.id}`);
        fetchData();
    };

    const totalMonthly = members.reduce((s, m) => s + m.monthly_expense, 0);
    const dependants = members.filter(m => m.dependant).length;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Page Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>Family</h1>
                    <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
                        Manage family members and track household expenses
                    </p>
                </div>
                <button
                    onClick={() => { setEditItem(null); setShowForm(true); }}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                        border: "none", background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff",
                        cursor: "pointer", boxShadow: "0 2px 8px rgba(0,123,255,0.3)",
                    }}
                >
                    + Add Member
                </button>
            </div>

            {/* Info Boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <InfoBox icon="👨‍👩‍👧‍👦" label="Family Members" value={members.length} color="#007bff" />
                <InfoBox icon="💰" label="Total Monthly Expense" value={formatCurrency(totalMonthly)} color="#ffc107" />
                <InfoBox icon="🛡️" label="Dependants" value={dependants} color="#17a2b8" />
            </div>

            {/* Member Cards */}
            {loading ? (
                <div style={{ textAlign: "center", padding: 32, color: "#adb5bd" }}>Loading...</div>
            ) : members.length === 0 ? (
                <CardWidget title="Family Members" icon="👨‍👩‍👧‍👦" borderColor="#007bff">
                    <div style={{ textAlign: "center", padding: 32, color: "#adb5bd" }}>
                        No family members yet. Click &quot;Add Member&quot; to get started.
                    </div>
                </CardWidget>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {members.map((m) => {
                        const rb = RELATION_BADGE[m.relation] || { bg: "#e9ecef", color: "#495057" };
                        return (
                            <div
                                key={m.id}
                                style={{
                                    background: "#fff", borderRadius: 6, padding: 20,
                                    boxShadow: "0 0 1px rgba(0,0,0,0.125), 0 1px 3px rgba(0,0,0,0.2)",
                                    transition: "box-shadow 0.2s",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: "50%",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 24, background: "#e9ecef",
                                        }}>
                                            {m.avatar || "👤"}
                                        </div>
                                        <div>
                                            <h3 style={{ fontWeight: 600, color: "#343a40", margin: 0, fontSize: 15 }}>{m.name}</h3>
                                            <span style={{
                                                display: "inline-flex", fontSize: 11, padding: "2px 8px", borderRadius: 4,
                                                fontWeight: 600, marginTop: 4,
                                                background: rb.bg, color: rb.color,
                                            }}>
                                                {RELATIONS.find(r => r.value === m.relation)?.label || m.relation}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <button
                                            onClick={() => { setEditItem(m); setShowForm(true); }}
                                            title="Edit"
                                            style={{
                                                padding: 4, border: "none", background: "transparent",
                                                cursor: "pointer", color: "#6c757d", fontSize: 14,
                                            }}
                                        >✏️</button>
                                        <button
                                            onClick={() => handleDelete(m)}
                                            title="Delete"
                                            style={{
                                                padding: 4, border: "none", background: "transparent",
                                                cursor: "pointer", color: "#6c757d", fontSize: 14,
                                            }}
                                        >🗑️</button>
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                                    {m.dob && (
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#6c757d" }}>DOB</span>
                                            <span style={{ color: "#495057" }}>{m.dob}</span>
                                        </div>
                                    )}
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#6c757d" }}>Monthly Expense</span>
                                        <span style={{ color: "#343a40", fontWeight: 600 }}>{formatCurrency(m.monthly_expense)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <FormModal
                    title={editItem ? "Edit Member" : "Add Family Member"}
                    fields={FIELDS}
                    initial={editItem}
                    onSubmit={handleSubmit}
                    onClose={() => { setShowForm(false); setEditItem(null); }}
                />
            )}
        </div>
    );
}
