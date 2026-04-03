"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

const S = {
    page: { minHeight: "100vh", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, padding: 16, background: "linear-gradient(135deg, #343a40 0%, #1a1e23 100%)" },
    wrapper: { width: "100%", maxWidth: 420 },
    logoWrap: { textAlign: "center" as const, marginBottom: 32 },
    logo: { width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #ffc107, #e0a800)", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(255,193,7,0.4)" },
    title: { fontSize: 28, fontWeight: 700 as const, color: "#fff", margin: 0 },
    subtitle: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 },
    card: { background: "#fff", borderRadius: 10, padding: "32px 28px", boxShadow: "0 2px 20px rgba(0,0,0,0.15)" },
    label: { display: "block" as const, fontSize: 13, fontWeight: 600 as const, color: "#495057", marginBottom: 6 },
    input: { width: "100%", padding: "11px 14px", borderRadius: 6, border: "1px solid #ced4da", fontSize: 14, color: "#343a40", background: "#fff", outline: "none" as const, transition: "border 0.15s", boxSizing: "border-box" as const },
    fieldGroup: { marginBottom: 20 },
    btn: { width: "100%", padding: "12px 20px", borderRadius: 6, fontSize: 15, fontWeight: 600 as const, border: "none" as const, background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff", cursor: "pointer" as const, boxShadow: "0 3px 12px rgba(0,123,255,0.3)", transition: "all 0.15s", marginTop: 8 },
    error: { padding: "10px 14px", borderRadius: 6, background: "#f8d7da", border: "1px solid #f5c6cb", fontSize: 13, color: "#721c24", marginBottom: 16 },
    successIcon: { width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #d4edda, #c3e6cb)", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, margin: "0 auto 16px" },
    link: { color: "#007bff", fontWeight: 600 as const, textDecoration: "none" as const },
    footer: { marginTop: 20, textAlign: "center" as const, fontSize: 13, color: "#6c757d" },
};

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={S.page}>
            <div style={S.wrapper}>
                <div style={S.logoWrap}>
                    <div style={S.logo}>
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 style={S.title}>Forgot Password</h1>
                    <p style={S.subtitle}>
                        {sent ? "Check your email for a reset link" : "Enter your email to reset your password"}
                    </p>
                </div>

                <div style={S.card}>
                    {sent ? (
                        <div style={{ textAlign: "center" }}>
                            <div style={S.successIcon}>
                                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#28a745" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p style={{ fontSize: 14, color: "#495057", marginBottom: 20, lineHeight: 1.6 }}>
                                If an account with <strong style={{ color: "#007bff" }}>{email}</strong> exists, you&apos;ll receive a password reset link shortly.
                            </p>
                            <Link href="/login" style={{ ...S.btn, display: "block", textAlign: "center" as const, textDecoration: "none" }}>
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {error && <div style={S.error}>{error}</div>}
                            <div style={S.fieldGroup}>
                                <label style={S.label}>Email Address</label>
                                <input style={S.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                            </div>
                            <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>
                                {loading ? "Sending..." : "Send Reset Link →"}
                            </button>
                        </form>
                    )}

                    <div style={S.footer}>
                        Remember your password?{" "}
                        <Link href="/login" style={S.link}>Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
