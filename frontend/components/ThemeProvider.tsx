"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeKey = "midnight" | "ocean" | "forest" | "light";

export interface ThemeOption {
    key: ThemeKey;
    label: string;
    color: string;
    description: string;
}

export const THEMES: ThemeOption[] = [
    { key: "midnight", label: "Midnight", color: "#6366f1", description: "Deep dark indigo" },
    { key: "ocean", label: "Ocean", color: "#0ea5e9", description: "Deep blue waters" },
    { key: "forest", label: "Forest", color: "#22c55e", description: "Dark green nature" },
    { key: "light", label: "Light", color: "#4f46e5", description: "Clean & bright" },
];

const ThemeCtx = createContext<{
    theme: ThemeKey;
    setTheme: (t: ThemeKey) => void;
}>({ theme: "midnight", setTheme: () => { } });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeKey>("midnight");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("finpilot_theme") as ThemeKey | null;
        if (saved && THEMES.some((t) => t.key === saved)) {
            setThemeState(saved);
            document.documentElement.setAttribute("data-theme", saved);
        }
        setMounted(true);
    }, []);

    const setTheme = (t: ThemeKey) => {
        setThemeState(t);
        localStorage.setItem("finpilot_theme", t);
        document.documentElement.setAttribute("data-theme", t);
    };

    if (!mounted) return null;

    return (
        <ThemeCtx.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeCtx.Provider>
    );
}

export const useTheme = () => useContext(ThemeCtx);
