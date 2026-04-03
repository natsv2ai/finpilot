import Link from "next/link";

export default function LandingPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "linear-gradient(135deg, #343a40 0%, #1a1e23 100%)", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
            {/* Navigation */}
            <nav style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 40px", background: "rgba(26, 30, 35, 0.8)",
                borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, zIndex: 50,
                backdropFilter: "blur(20px)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #007bff, #0056b3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 800, fontSize: 16,
                        boxShadow: "0 4px 20px rgba(0,123,255,0.4)"
                    }}>
                        FP
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                        FinPilot
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color 0.2s" }}>
                        Sign In
                    </Link>
                    <Link href="/register" style={{
                        fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff",
                        padding: "10px 20px", borderRadius: 8, textDecoration: "none",
                        boxShadow: "0 3px 12px rgba(0,123,255,0.3)", transition: "all 0.15s"
                    }}>
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                padding: "100px 40px", textAlign: "center", maxWidth: 900, margin: "0 auto", flex: 1,
                display: "flex", flexDirection: "column", justifyContent: "center"
            }}>
                <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
                    Your complete financial <br />
                    <span style={{ background: "linear-gradient(90deg, #60a5fa, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>command center.</span>
                </h1>
                <p style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", margin: "30px auto", maxWidth: 700, lineHeight: 1.6 }}>
                    FinPilot is the intelligent portfolio tracker that instantly analyzes your trades, calculates precise metrics like XIRR, and brings clarity to your wealth journey.
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap", marginTop: 20 }}>
                    <Link href="/register" style={{
                        fontSize: 16, fontWeight: 600, background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff",
                        padding: "16px 32px", borderRadius: 12, textDecoration: "none",
                        boxShadow: "0 4px 20px rgba(0,123,255,0.4)"
                    }}>
                        Create Free Account
                    </Link>
                    <Link href="/login" style={{
                        fontSize: 16, fontWeight: 600, background: "rgba(255,255,255,0.05)", color: "#fff",
                        border: "1px solid rgba(255,255,255,0.1)", padding: "16px 32px", borderRadius: 12, textDecoration: "none"
                    }}>
                        View Live Demo
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: "80px 40px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 60 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 16px 0", color: "#fff", letterSpacing: "-0.02em" }}>
                            Everything you need to grow your wealth
                        </h2>
                        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                            Seamlessly track your stocks, mutual funds, and assets in one beautifully designed dashboard.
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                        {[
                            { icon: "📊", title: "Intelligent Import", desc: "Simply drag and drop your broker statements. Our AI instantly categorizes and prices your assets." },
                            { icon: "📈", title: "Advanced Analytics", desc: "Stop guessing your returns. We calculate real-time XIRR, projected growth, and portfolio allocation." },
                            { icon: "🐋", title: "Market Intelligence", desc: "Track what the 'whales' are doing. See live FII/DII accumulation and distribution." }
                        ].map(f => (
                            <div key={f.title} style={{
                                background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: 32,
                                boxShadow: "0 4px 24px rgba(0,0,0,0.2)", transition: "transform 0.2s"
                            }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,123,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px 0", color: "#fff" }}>{f.title}</h3>
                                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: "40px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #007bff, #0056b3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 10 }}>
                        FP
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>FinPilot</span>
                </div>
                <p style={{ fontSize: 13, margin: 0 }}>© {new Date().getFullYear()} FinPilot. Built for investors.</p>
            </footer>
        </div>
    );
}
