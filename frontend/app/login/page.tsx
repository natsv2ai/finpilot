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
  logo: { width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #007bff, #0056b3)", display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const, margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(0,123,255,0.4)" },
  title: { fontSize: 28, fontWeight: 700 as const, color: "#fff", margin: 0 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 },
  card: { background: "#fff", borderRadius: 10, padding: "32px 28px", boxShadow: "0 2px 20px rgba(0,0,0,0.15)" },
  label: { display: "block" as const, fontSize: 13, fontWeight: 600 as const, color: "#495057", marginBottom: 6 },
  input: { width: "100%", padding: "11px 14px", borderRadius: 6, border: "1px solid #ced4da", fontSize: 14, color: "#343a40", background: "#fff", outline: "none" as const, transition: "border 0.15s", boxSizing: "border-box" as const },
  inputDisabled: { width: "100%", padding: "11px 14px", borderRadius: 6, border: "1px solid #ced4da", fontSize: 14, color: "#868e96", background: "#e9ecef", outline: "none" as const, boxSizing: "border-box" as const },
  fieldGroup: { marginBottom: 20 },
  btn: { width: "100%", padding: "12px 20px", borderRadius: 6, fontSize: 15, fontWeight: 600 as const, border: "none" as const, background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff", cursor: "pointer" as const, boxShadow: "0 3px 12px rgba(0,123,255,0.3)", transition: "all 0.15s", marginTop: 8 },
  error: { padding: "10px 14px", borderRadius: 6, background: "#f8d7da", border: "1px solid #f5c6cb", fontSize: 13, color: "#721c24", marginBottom: 16 },
  link: { color: "#007bff", fontWeight: 600 as const, textDecoration: "none" as const },
  footer: { marginTop: 20, textAlign: "center" as const, fontSize: 13, color: "#6c757d" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address"); return; }
    if (!password) { setError("Please enter your password"); return; }
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/portfolio");
    } catch {
      setError("Invalid email or password");
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 style={S.title}>Welcome back</h1>
          <p style={S.subtitle}>Sign in to your FinPilot account</p>
        </div>

        <div style={S.card}>
          <form onSubmit={handleSubmit}>
            {error && <div style={S.error}>{error}</div>}

            <div style={S.fieldGroup}>
              <label style={S.label}>Email Address</label>
              <input style={S.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>

            <div style={S.fieldGroup}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...S.label, marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: "#007bff", textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={S.footer}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={S.link}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
