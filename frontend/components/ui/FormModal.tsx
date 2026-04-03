"use client";

import { useState, useEffect } from "react";

interface FormField {
    key: string;
    label: string;
    type?: "text" | "number" | "select" | "date" | "textarea";
    options?: { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
    showIf?: (form: Record<string, any>) => boolean;
    onChangeEffect?: (val: any, currentFormState: Record<string, any>) => Record<string, any>;
}

interface FormModalProps {
    title: string;
    fields: FormField[];
    initial?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void | Promise<void>;
    onClose: () => void;
    submitLabel?: string;
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 6,
    border: "1px solid #ced4da", fontSize: 14, color: "#343a40",
    background: "#fff", outline: "none", transition: "border 0.15s",
    marginTop: 4,
};

export default function FormModal({
    title, fields, initial, onSubmit, onClose, submitLabel = "Save",
}: FormModalProps) {
    const [form, setForm] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const init: Record<string, any> = {};
        fields.forEach((f) => {
            init[f.key] = initial?.[f.key] ?? (f.type === "number" ? 0 : "");
        });
        setForm(init);
    }, [initial, fields]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(form);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, val: any, effect?: (v: any, state: Record<string, any>) => Record<string, any>) => {
        let newForm = { ...form, [key]: val };
        if (effect) {
            newForm = { ...newForm, ...effect(val, newForm) };
        }
        setForm(newForm);
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
                padding: 16,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff", borderRadius: 6, width: "100%", maxWidth: 520,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto",
                }}
            >
                {/* Header */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.08)",
                    borderLeft: "3px solid #007bff", background: "#f8f9fa",
                }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#343a40" }}>{title}</span>
                    <button
                        onClick={onClose}
                        style={{
                            padding: 4, border: "none", background: "transparent",
                            cursor: "pointer", color: "#6c757d", fontSize: 18,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} style={{ padding: 20 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {fields.map((f) => {
                            if (f.showIf && !f.showIf(form)) return null;
                            return (
                                <div key={f.key}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 2 }}>
                                        {f.label}
                                    </label>
                                    {f.type === "select" ? (
                                        <select
                                            style={{ ...inputStyle, cursor: "pointer" }}
                                            value={form[f.key] ?? ""}
                                            onChange={(e) => handleChange(f.key, e.target.value, f.onChangeEffect)}
                                            required={f.required}
                                        >
                                            <option value="">Select...</option>
                                            {f.options?.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    ) : f.type === "textarea" ? (
                                        <textarea
                                            style={{ ...inputStyle, resize: "vertical" } as React.CSSProperties}
                                            value={form[f.key] ?? ""}
                                            onChange={(e) => handleChange(f.key, e.target.value, f.onChangeEffect)}
                                            placeholder={f.placeholder}
                                            rows={3}
                                            required={f.required}
                                        />
                                    ) : (
                                        <input
                                            style={inputStyle}
                                            type={f.type || "text"}
                                            value={form[f.key] ?? ""}
                                            onChange={(e) => handleChange(f.key, f.type === "number" ? (e.target.value === "" ? "" : parseFloat(e.target.value)) : e.target.value, f.onChangeEffect)}
                                            placeholder={f.placeholder}
                                            required={f.required}
                                            step={f.type === "number" ? "any" : undefined}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%", marginTop: 20, padding: "12px 20px",
                            borderRadius: 6, fontSize: 14, fontWeight: 600,
                            border: "none", background: "linear-gradient(135deg, #007bff, #0056b3)",
                            color: "#fff", cursor: "pointer",
                            boxShadow: "0 3px 12px rgba(0,123,255,0.3)",
                            transition: "all 0.15s", opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? "Saving..." : submitLabel}
                    </button>
                </form>
            </div>
        </div>
    );
}
