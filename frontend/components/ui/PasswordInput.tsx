"use client";

import { useState } from "react";

const eyeOpen = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const eyeClosed = (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.588 6.588m7.532 7.532l3.29 3.29M3 3l3.588 3.588m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

interface PasswordInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

export default function PasswordInput({ value, onChange, placeholder = "••••••••", style }: PasswordInputProps) {
    const [show, setShow] = useState(false);

    return (
        <div style={{ position: "relative" }}>
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    width: "100%", padding: "10px 40px 10px 14px", borderRadius: 6,
                    border: "1px solid #ced4da", fontSize: 14, color: "#343a40",
                    background: "#fff", outline: "none", transition: "border 0.15s",
                    boxSizing: "border-box",
                    ...style,
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#80bdff"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#ced4da"}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                style={{
                    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 4,
                    color: show ? "#007bff" : "#adb5bd", display: "flex", alignItems: "center",
                }}
                tabIndex={-1}
            >
                {show ? eyeOpen : eyeClosed}
            </button>
        </div>
    );
}
