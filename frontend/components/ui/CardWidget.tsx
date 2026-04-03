"use client";

import { useState } from "react";

interface CardWidgetProps {
    title: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    collapsible?: boolean;
    className?: string;
    borderColor?: string;
}

const BORDER_COLOR_MAP: Record<string, string> = {
    "var(--accent)": "#007bff",
    "var(--green)": "#28a745",
    "var(--red)": "#dc3545",
    "var(--amber)": "#ffc107",
    "var(--cyan)": "#17a2b8",
};

export default function CardWidget({
    title, icon, actions, children, footer, collapsible = false, className = "", borderColor = "#007bff",
}: CardWidgetProps) {
    const [collapsed, setCollapsed] = useState(false);
    const resolvedBorder = BORDER_COLOR_MAP[borderColor] || borderColor;

    return (
        <div className={`adminlte-card ${className}`}>
            <div className="adminlte-card-header" style={{ borderLeftColor: resolvedBorder }}>
                <div className="adminlte-card-title">
                    {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
                    {title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {actions}
                    {collapsible && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                padding: 4, borderRadius: 4, border: "none",
                                background: "transparent", cursor: "pointer",
                                color: "#6c757d", display: "flex", alignItems: "center",
                                transition: "all 0.15s",
                            }}
                            title={collapsed ? "Expand" : "Collapse"}
                        >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            {!collapsed && (
                <div className="adminlte-card-body">
                    {children}
                </div>
            )}
            {footer && !collapsed && (
                <div className="adminlte-card-footer">
                    {footer}
                </div>
            )}
        </div>
    );
}
