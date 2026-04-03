"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "MAIN NAVIGATION",
    items: [
      {
        name: "Dashboard",
        href: "/portfolio",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-2a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" /></svg>,
      },
      {
        name: "Net Worth",
        href: "/networth",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      },
    ],
  },
  {
    label: "INVESTMENTS",
    items: [
      {
        name: "Portfolio",
        href: "/portfolio",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
      },
      {
        name: "Assets",
        href: "/assets",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        badge: "New",
        badgeColor: "#28a745",
      },
      {
        name: "Watchlist",
        href: "/watchlist",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
      },
      {
        name: "IPO Insights",
        href: "/ipos",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
        badge: "New",
        badgeColor: "#6f42c1",
      },
    ],
  },
  {
    label: "PROTECTION",
    items: [
      {
        name: "Insurance",
        href: "/insurance",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      },
    ],
  },
  {
    label: "PLANNING",
    items: [
      {
        name: "Expenses",
        href: "/expenses",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
      },
      {
        name: "Family",
        href: "/family",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      },
      {
        name: "Insights",
        href: "/insights",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        badge: "3",
        badgeColor: "#dc3545",
      },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      {
        name: "Settings",
        href: "/settings",
        icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      },
    ],
  },
];

const SIDEBAR_WIDTH = 260;

export default function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = searchQuery
    ? navSections.map(s => ({
      ...s,
      items: s.items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())),
    })).filter(s => s.items.length > 0)
    : navSections;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        style={{
          width: open ? SIDEBAR_WIDTH : 0,
          minWidth: open ? SIDEBAR_WIDTH : 0,
          background: "#343a40",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
          transition: "width 0.25s ease, min-width 0.25s ease",
          height: "100%",
        }}
      >
        {/* ═══ Brand ═══ */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", background: "#3c444b",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0, whiteSpace: "nowrap",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #007bff, #0056b3)",
            flexShrink: 0, boxShadow: "0 2px 8px rgba(0,123,255,0.3)",
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>FinPilot</span>
            <span style={{ display: "block", fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Personal Finance</span>
          </div>
        </div>

        {/* ═══ User Panel ═══ */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "18px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0, whiteSpace: "nowrap",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14, fontWeight: 700,
            background: "linear-gradient(135deg, #007bff, #17a2b8)", flexShrink: 0,
          }}>N</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Nagaraju
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#28a745", flexShrink: 0, display: "inline-block" }} />
              <span>Online</span>
            </div>
          </div>
        </div>

        {/* ═══ Search ═══ */}
        <div style={{
          padding: "16px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, background: "transparent", border: "none",
                padding: "9px 14px", fontSize: 13,
                color: "rgba(255,255,255,0.75)", outline: "none",
              }}
            />
            <button style={{ padding: "0 12px", display: "flex", alignItems: "center", color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ═══ Navigation ═══ */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {filteredSections.map((section, sectionIdx) => (
            <div
              key={section.label}
              style={{
                paddingBottom: 12,
                ...(sectionIdx > 0 ? { marginTop: 4, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" } : {}),
              }}
            >
              <div style={{
                padding: "10px 24px 6px",
                fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.06em", textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}>
                {section.label}
              </div>
              <ul style={{ listStyle: "none", padding: "0 12px", margin: 0 }}>
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.name} style={{ marginBottom: 4 }}>
                      <Link
                        href={item.href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 16px",
                          borderRadius: 6,
                          fontSize: 14,
                          fontWeight: 500,
                          textDecoration: "none",
                          transition: "all 0.15s ease",
                          borderLeft: active ? "3px solid #007bff" : "3px solid transparent",
                          color: active ? "#fff" : "rgba(255,255,255,0.6)",
                          background: active ? "rgba(255,255,255,0.1)" : "transparent",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span style={{ flexShrink: 0, color: active ? "#007bff" : "rgba(255,255,255,0.35)", display: "flex", alignItems: "center" }}>
                          {item.icon}
                        </span>
                        <span style={{ flex: 1 }}>{item.name}</span>
                        {item.badge && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, color: "#fff", lineHeight: 1.4, background: item.badgeColor || "#007bff" }}>
                            {item.badge}
                          </span>
                        )}
                        {active && (
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "rgba(255,255,255,0.4)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ═══ Footer ═══ */}
        <div style={{
          padding: "14px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(0,0,0,0.1)",
          textAlign: "center", fontSize: 11,
          color: "rgba(255,255,255,0.25)", flexShrink: 0,
          whiteSpace: "nowrap",
        }}>
          <span>© 2026 FinPilot</span>
        </div>
      </aside>
    </>
  );
}