"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/ui/PasswordInput";

const S = {
    page: { minHeight: "100vh", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, padding: 16, background: "linear-gradient(135deg, #343a40 0%, #1a1e23 100%)" },
    wrapper: { width: "100%", maxWidth: 420 },
    logoWrap: { textAlign: "center" as const, marginBottom: 32 },
    logo: { width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #28a745, #1e7e34)", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(40,167,69,0.4)" },
    title: { fontSize: 28, fontWeight: 700 as const, color: "#fff", margin: 0 },
    subtitle: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 },
    card: { background: "#fff", borderRadius: 10, padding: "32px 28px", boxShadow: "0 2px 20px rgba(0,0,0,0.15)" },
    label: { display: "block" as const, fontSize: 13, fontWeight: 600 as const, color: "#495057", marginBottom: 6 },
    input: { width: "100%", padding: "11px 14px", borderRadius: 6, border: "1px solid #ced4da", fontSize: 14, color: "#343a40", background: "#fff", outline: "none" as const, transition: "border 0.15s", boxSizing: "border-box" as const },
    fieldGroup: { marginBottom: 20 },
    btn: { width: "100%", padding: "12px 20px", borderRadius: 6, fontSize: 15, fontWeight: 600 as const, border: "none" as const, background: "linear-gradient(135deg, #28a745, #1e7e34)", color: "#fff", cursor: "pointer" as const, boxShadow: "0 3px 12px rgba(40,167,69,0.3)", transition: "all 0.15s", marginTop: 8 },
    error: { padding: "10px 14px", borderRadius: 6, background: "#f8d7da", border: "1px solid #f5c6cb", fontSize: 13, color: "#721c24", marginBottom: 16 },
    link: { color: "#007bff", fontWeight: 600 as const, textDecoration: "none" as const },
    footer: { marginTop: 20, textAlign: "center" as const, fontSize: 13, color: "#6c757d" },
};

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name.trim()) { setError("Please enter your name"); return; }
        if (password !== confirm) { setError("Passwords do not match"); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        setLoading(true);
        try {
            await register({ email, password, name: name.trim(), phone: phone.trim() });
            router.push("/");
        } catch {
            setError("Registration failed. Try a different email.");
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 style={S.title}>Create account</h1>
                    <p style={S.subtitle}>Start tracking your portfolio with AI insights</p>
                </div>

                <div style={S.card}>
                    <form onSubmit={handleSubmit}>
                        {error && <div style={S.error}>{error}</div>}

                        <div style={S.fieldGroup}>
                            <label style={S.label}>Full Name</label>
                            <input style={S.input} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
                        </div>

                        <div style={S.fieldGroup}>
                            <label style={S.label}>Email Address</label>
                            <input style={S.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                        </div>

                        <div style={S.fieldGroup}>
                            <label style={S.label}>Phone Number</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <span style={{
                                    display: "flex", alignItems: "center", padding: "0 12px",
                                    borderRadius: 6, border: "1px solid #ced4da", background: "#e9ecef",
                                    fontSize: 14, color: "#495057", fontWeight: 500, whiteSpace: "nowrap" as const,
                                }}>+91</span>
                                <input style={{ ...S.input, flex: 1 }} type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9876543210" />
                            </div>
                        </div>

                        <div style={S.fieldGroup}>
                            <label style={S.label}>Password</label>
                            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
                        </div>

                        <div style={S.fieldGroup}>
                            <label style={S.label}>Confirm Password</label>
                            <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" />
                        </div>

                        <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Creating account..." : "Create Account →"}
                        </button>
                    </form>

                    <div style={S.footer}>
                        Already have an account?{" "}
                        <Link href="/login" style={S.link}>Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
