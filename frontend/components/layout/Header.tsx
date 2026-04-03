"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme, THEMES, type ThemeKey } from "@/components/ThemeProvider";
import { usePathname, useRouter } from "next/navigation";

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/networth": "Net Worth",
  "/portfolio": "Portfolio",
  "/assets": "Assets",
  "/watchlist": "Watchlist",
  "/ipos": "IPO Insights",
  "/insurance": "Insurance",
  "/expenses": "Expenses",
  "/family": "Family",
  "/insights": "Market Intelligence",
  "/settings": "Settings",
};

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = pageNames[pathname] || "FinPilot";
  const [showThemes, setShowThemes] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowThemes(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", height: 57,
        background: "#3c444b",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        position: "sticky", top: 0, zIndex: 30, flexShrink: 0,
      }}
    >
      {/* Left: Hamburger + Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          style={{
            padding: 6, borderRadius: 6, border: "none",
            background: "transparent", cursor: "pointer",
            color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Home</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{currentPage}</span>
        </nav>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Search */}
        <button className="navbar-icon-btn" title="Search">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Notification bell */}
        <button className="navbar-icon-btn" title="Notifications" style={{ position: "relative" }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span style={{
            position: "absolute", top: -2, right: -2,
            width: 16, height: 16, borderRadius: "50%",
            fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#dc3545", color: "#fff",
          }}>5</span>
        </button>

        {/* Theme Switcher */}
        <div ref={themeRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowThemes(!showThemes)}
            className="navbar-icon-btn"
            title="Change theme"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
          {showThemes && (
            <div
              style={{
                position: "absolute", right: 0, top: 48,
                width: 220, borderRadius: 8, padding: 6,
                background: "#fff", border: "1px solid #dee2e6",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)", zIndex: 50,
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 10px 4px", color: "#6c757d" }}>
                Choose Theme
              </p>
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTheme(t.key as ThemeKey); setShowThemes(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 6,
                    border: "none", cursor: "pointer", textAlign: "left",
                    background: theme === t.key ? "#e9ecef" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (theme !== t.key) e.currentTarget.style.background = "#f8f9fa"; }}
                  onMouseLeave={(e) => { if (theme !== t.key) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                    background: t.color,
                    border: theme === t.key ? "2px solid #343a40" : "2px solid transparent",
                  }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#343a40", display: "block" }}>{t.label}</span>
                    <span style={{ fontSize: 10, color: "#6c757d", display: "block" }}>{t.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="navbar-icon-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 700,
              background: "linear-gradient(135deg, #007bff, #17a2b8)",
            }}>
              N
            </div>
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} style={{ color: "rgba(255,255,255,0.4)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showUserMenu && (
            <div
              style={{
                position: "absolute", right: 0, top: 48,
                width: 192, borderRadius: 8,
                background: "#fff", border: "1px solid #dee2e6",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)", zIndex: 50,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #dee2e6" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#343a40", margin: 0 }}>Nagaraju</p>
                <p style={{ fontSize: 10, color: "#6c757d", margin: "2px 0 0" }}>Member since 2026</p>
              </div>
              <div style={{ padding: "4px 0" }}>
                <button
                  onClick={() => { router.push("/settings"); setShowUserMenu(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", fontSize: 12, border: "none",
                    background: "transparent", cursor: "pointer", color: "#343a40", textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fa"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profile
                </button>
                <button
                  onClick={() => { router.push("/settings"); setShowUserMenu(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", fontSize: 12, border: "none",
                    background: "transparent", cursor: "pointer", color: "#343a40", textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fa"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Settings
                </button>
              </div>
              <div style={{ borderTop: "1px solid #dee2e6" }}>
                <button
                  onClick={logout}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", fontSize: 12, border: "none",
                    background: "transparent", cursor: "pointer", color: "#dc3545", textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fff5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}