"use client";

interface InfoBoxProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color?: string;
    trend?: string;
    trendUp?: boolean;
}

const COLOR_MAP: Record<string, string> = {
    "var(--accent)": "#007bff",
    "var(--green)": "#28a745",
    "var(--red)": "#dc3545",
    "var(--amber)": "#ffc107",
    "var(--cyan)": "#17a2b8",
};

export default function InfoBox({ icon, label, value, color = "#007bff", trend, trendUp }: InfoBoxProps) {
    const resolvedColor = COLOR_MAP[color] || color;

    return (
        <div className="adminlte-info-box">
            <div
                className="adminlte-info-box-icon"
                style={{ background: resolvedColor }}
            >
                {icon}
            </div>
            <div className="adminlte-info-box-content">
                <span className="adminlte-info-box-text">{label}</span>
                <span className="adminlte-info-box-number">{value}</span>
                {trend && (
                    <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: trendUp ? "#28a745" : "#dc3545",
                        marginTop: 2,
                    }}>
                        {trendUp ? "▲" : "▼"} {trend}
                    </span>
                )}
            </div>
        </div>
    );
}
