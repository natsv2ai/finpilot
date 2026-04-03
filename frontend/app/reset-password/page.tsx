"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import PasswordInput from "@/components/ui/PasswordInput";

const S = {
    page: { minHeight: "100vh", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, padding: 16, background: "linear-gradient(135deg, #343a40 0%, #1a1e23 100%)" },
    wrapper: { width: "100%", maxWidth: 420 },
    logoWrap: { textAlign: "center" as const, marginBottom: 32 },
    logo: { width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #17a2b8, #117a8b)", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(23,162,184,0.4)" },
    title: { fontSize: 28, fontWeight: 700 as const, color: "#fff", margin: 0 },
    subtitle: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 },
    card: { background: "#fff", borderRadius: 10, padding: "32px 28px", boxShadow: "0 2px 20px rgba(0,0,0,0.15)" },
    label: { display: "block" as const, fontSize: 13, fontWeight: 600 as const, color: "#495057", marginBottom: 6 },
    input: { width: "100%", padding: "11px 14px", borderRadius: 6, border: "1px solid #ced4da", fontSize: 14, color: "#343a40", background: "#fff", outline: "none" as const, transition: "border 0.15s", boxSizing: "border-box" as const },
    fieldGroup: { marginBottom: 20 },
    btn: { width: "100%", padding: "12px 20px", borderRadius: 6, fontSize: 15, fontWeight: 600 as const, border: "none" as const, background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff", cursor: "pointer" as const, boxShadow: "0 3px 12px rgba(0,123,255,0.3)", transition: "all 0.15s", marginTop: 8 },
    error: { padding: "10px 14px", borderRadius: 6, background: "#f8d7da", border: "1px solid #f5c6cb", fontSize: 13, color: "#721c24", marginBottom: 16 },
    successIcon: { width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #d4edda, #c3e6cb)", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, margin: "0 auto 16px" },
};

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (password !== confirm) { setError("Passwords do not match"); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        setLoading(true);
        try {
            await api.post("/auth/reset-password", { token, new_password: password });
            setSuccess(true);
        } catch {
            setError("Invalid or expired reset link. Please request a new one.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{ textAlign: "center" }}>
                <p style={{ color: "#dc3545", fontSize: 14, marginBottom: 16 }}>Invalid reset link.</p>
                <Link href="/forgot-password" style={{ ...S.btn, display: "block", textAlign: "center" as const, textDecoration: "none" }}>
                    Request New Reset Link
                </Link>
            </div>
        );
    }

    return success ? (
        <div style={{ textAlign: "center" }}>
            <div style={S.successIcon}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#28a745" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <p style={{ fontSize: 14, color: "#495057", marginBottom: 20 }}>
                Your password has been reset successfully!
            </p>
            <Link href="/login" style={{ ...S.btn, display: "block", textAlign: "center" as const, textDecoration: "none" }}>
                Sign In →
            </Link>
        </div>
    ) : (
        <form onSubmit={handleSubmit}>
            {error && <div style={S.error}>{error}</div>}
            <div style={S.fieldGroup}>
                <label style={S.label}>New Password</label>
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
            </div>
            <div style={S.fieldGroup}>
                <label style={S.label}>Confirm Password</label>
                <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" />
            </div>
            <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Resetting..." : "Reset Password →"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div style={S.page}>
            <div style={S.wrapper}>
                <div style={S.logoWrap}>
                    <div style={S.logo}>
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 style={S.title}>Reset Password</h1>
                    <p style={S.subtitle}>Enter your new password below</p>
                </div>
                <div style={S.card}>
                    <Suspense fallback={<div style={{ textAlign: "center", padding: 16, color: "#6c757d" }}>Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
