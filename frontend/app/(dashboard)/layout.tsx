"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AuthGuard from "@/features/auth/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthGuard>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f4f6f9" }}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}