"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useTheme, THEMES, type ThemeKey } from "@/components/ThemeProvider";
import { useAuth } from "@/features/auth/hooks/useAuth";
import PasswordInput from "@/components/ui/PasswordInput";

const BROKERS = [
  { key: "upstox", name: "Upstox", color: "#7b61ff", gradient: "linear-gradient(135deg, #7b61ff, #5b3fc4)", icon: "🟣" },
  { key: "groww", name: "Groww", color: "#00d09c", gradient: "linear-gradient(135deg, #00d09c, #00a97d)", icon: "🟢" },
  { key: "zerodha", name: "Zerodha", color: "#387ed1", gradient: "linear-gradient(135deg, #387ed1, #2a5fa8)", icon: "🔵" },
  { key: "angelone", name: "Angel One", color: "#f5a623", gradient: "linear-gradient(135deg, #f5a623, #d4891a)", icon: "🟡" },
];

const RISK_OPTIONS = [
  {
    value: "conservative",
    label: "Conservative",
    desc: "Low risk, stable returns. Best for capital preservation.",
    icon: "🛡️",
    color: "#28a745",
    bgGradient: "linear-gradient(135deg, #d4edda, #c3e6cb)",
    borderColor: "#28a745",
  },
  {
    value: "moderate",
    label: "Moderate",
    desc: "Balanced risk-reward. Mix of growth and stability.",
    icon: "⚖️",
    color: "#007bff",
    bgGradient: "linear-gradient(135deg, #cce5ff, #b8daff)",
    borderColor: "#007bff",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    desc: "High risk, high returns. Maximum growth potential.",
    icon: "🚀",
    color: "#dc3545",
    bgGradient: "linear-gradient(135deg, #f8d7da, #f5c6cb)",
    borderColor: "#dc3545",
  },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 6,
  border: "1px solid #ced4da", fontSize: 14, color: "#343a40",
  background: "#fff", outline: "none", transition: "border 0.15s",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [riskAppetite, setRiskAppetite] = useState("moderate");
  const [saved, setSaved] = useState(false);
  const [brokerStatus, setBrokerStatus] = useState<any[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const userEmail = user?.email || "";
  const userInitial = name ? name.charAt(0).toUpperCase() : (userEmail ? userEmail.charAt(0).toUpperCase() : "U");

  // Password modal state
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const fetchBrokerStatus = useCallback(async () => {
    try {
      const res = await api.get("/brokers/status");
      setBrokerStatus(res.data);
    } catch { setBrokerStatus([]); }
  }, []);

  useEffect(() => { fetchBrokerStatus(); }, [fetchBrokerStatus]);

  const handleSave = async () => {
    try {
      await api.put("/users/me", { name, risk_appetite: riskAppetite });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleConnect = async (brokerKey: string) => {
    try {
      const res = await api.get(`/brokers/connect/${brokerKey}`);
      window.open(res.data.auth_url, "_blank", "width=600,height=700");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to connect. Check API key configuration.";
      alert(msg);
    }
  };

  const handleDisconnect = async (brokerKey: string) => {
    if (!confirm(`Disconnect from ${brokerKey}?`)) return;
    try {
      await api.delete(`/brokers/disconnect/${brokerKey}`);
      fetchBrokerStatus();
    } catch { alert("Failed to disconnect."); }
  };

  const handleSync = async (brokerKey: string) => {
    setSyncing(brokerKey);
    try {
      await api.post(`/brokers/sync/${brokerKey}`);
      fetchBrokerStatus();
    } catch { alert("Sync failed."); }
    finally { setSyncing(null); }
  };

  const isConnected = (brokerKey: string) =>
    brokerStatus.some(b => b.broker_name === brokerKey && b.status === "connected");

  const getLastSynced = (brokerKey: string) => {
    const b = brokerStatus.find(s => s.broker_name === brokerKey);
    return b?.last_synced ? new Date(b.last_synced).toLocaleString() : null;
  };

  const handleChangePassword = async () => {
    setPwdError("");
    setPwdSuccess(false);
    if (!currentPwd) { setPwdError("Enter your current password"); return; }
    if (newPwd.length < 6) { setPwdError("New password must be at least 6 characters"); return; }
    if (newPwd !== confirmPwd) { setPwdError("Passwords don't match"); return; }
    setPwdLoading(true);
    try {
      await api.put("/auth/change-password", { current_password: currentPwd, new_password: newPwd });
      setPwdSuccess(true);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setTimeout(() => { setShowPwdModal(false); setPwdSuccess(false); }, 1500);
    } catch (err: any) {
      setPwdError(err?.response?.data?.detail || "Failed to change password.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
            Manage your profile, appearance, security, and broker connections
          </p>
        </div>

        {/* ═══ Profile Card ═══ */}
        <div className="adminlte-card">
          <div className="adminlte-card-header" style={{ borderLeftColor: "#007bff" }}>
            <div className="adminlte-card-title">
              <span style={{ marginRight: 8 }}>👤</span> Profile Information
            </div>
          </div>
          <div className="adminlte-card-body">
            {/* Avatar + Info */}
            <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, #007bff, #17a2b8)",
                color: "#fff", fontSize: 32, fontWeight: 700,
                boxShadow: "0 4px 16px rgba(0,123,255,0.3)",
                flexShrink: 0,
              }}>
                {userInitial}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#343a40", margin: "0 0 4px" }}>{name}</h3>
                <p style={{ fontSize: 13, color: "#6c757d", margin: 0 }}>{userEmail || "No email set"}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, padding: "3px 10px", borderRadius: 4,
                    background: "#d4edda", color: "#155724", fontWeight: 600,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#28a745", display: "inline-block" }} />
                    Active
                  </span>
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 4,
                    background: "#cce5ff", color: "#004085", fontWeight: 600,
                  }}>
                    Member since 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Name + Email Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#80bdff"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#ced4da"}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  style={{
                    ...inputStyle,
                    color: "#868e96",
                    background: "#e9ecef",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Change Password Card ═══ */}
        <div className="adminlte-card">
          <div className="adminlte-card-header" style={{ borderLeftColor: "#dc3545" }}>
            <div className="adminlte-card-title">
              <span style={{ marginRight: 8 }}>🔒</span> Security
            </div>
          </div>
          <div className="adminlte-card-body">
            <p style={{ fontSize: 13, color: "#6c757d", marginBottom: 20 }}>
              Keep your account secure by using a strong, unique password.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                  Current Password
                </label>
                <PasswordInput
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                  New Password
                </label>
                <PasswordInput
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <PasswordInput
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>
            </div>
            {pwdError && (
              <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 6,
                background: "#f8d7da", border: "1px solid rgba(220,53,69,0.2)",
                fontSize: 13, color: "#721c24",
              }}>
                ⚠️ {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 6,
                background: "#d4edda", border: "1px solid rgba(40,167,69,0.2)",
                fontSize: 13, color: "#155724",
              }}>
                ✓ Password changed successfully!
              </div>
            )}
            <button
              onClick={handleChangePassword}
              disabled={pwdLoading}
              style={{
                marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 24px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                border: "none", background: "linear-gradient(135deg, #dc3545, #c82333)", color: "#fff",
                cursor: "pointer", boxShadow: "0 2px 8px rgba(220,53,69,0.3)",
                opacity: pwdLoading ? 0.7 : 1, transition: "all 0.15s",
              }}
            >
              🔒 {pwdLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>

        {/* ═══ Theme Chooser Card ═══ */}
        <div className="adminlte-card">
          <div className="adminlte-card-header" style={{ borderLeftColor: "#6f42c1" }}>
            <div className="adminlte-card-title">
              <span style={{ marginRight: 8 }}>🎨</span> Appearance
            </div>
          </div>
          <div className="adminlte-card-body">
            <p style={{ fontSize: 13, color: "#6c757d", marginBottom: 20 }}>
              Choose a theme that suits your preference. Changes apply instantly.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {THEMES.map((t) => {
                const selected = theme === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key as ThemeKey)}
                    style={{
                      padding: "24px 16px",
                      borderRadius: 10,
                      border: selected ? `2px solid ${t.color}` : "2px solid #e9ecef",
                      background: selected ? `${t.color}12` : "#fff",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: selected ? `0 4px 15px ${t.color}33` : "0 1px 3px rgba(0,0,0,0.08)",
                      transform: selected ? "scale(1.03)" : "scale(1)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {selected && (
                      <div style={{
                        position: "absolute", top: 8, right: 8,
                        width: 22, height: 22, borderRadius: "50%",
                        background: t.color, display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`,
                      margin: "0 auto 12px",
                      boxShadow: `0 4px 12px ${t.color}40`,
                    }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: selected ? t.color : "#343a40", marginBottom: 4 }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#6c757d", lineHeight: 1.4 }}>
                      {t.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ Risk Appetite Card ═══ */}
        <div className="adminlte-card">
          <div className="adminlte-card-header" style={{ borderLeftColor: "#ffc107" }}>
            <div className="adminlte-card-title">
              <span style={{ marginRight: 8 }}>⚖️</span> Risk Appetite
            </div>
          </div>
          <div className="adminlte-card-body">
            <p style={{ fontSize: 13, color: "#6c757d", marginBottom: 20 }}>
              Your risk preference affects portfolio rebalancing suggestions and trade recommendations.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {RISK_OPTIONS.map((opt) => {
                const selected = riskAppetite === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setRiskAppetite(opt.value)}
                    style={{
                      padding: "24px 18px",
                      borderRadius: 10,
                      border: selected ? `2px solid ${opt.borderColor}` : "2px solid #e9ecef",
                      background: selected ? opt.bgGradient : "#fff",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: selected ? `0 4px 15px ${opt.borderColor}33` : "0 1px 3px rgba(0,0,0,0.08)",
                      transform: selected ? "scale(1.03)" : "scale(1)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {selected && (
                      <div style={{
                        position: "absolute", top: 8, right: 8,
                        width: 22, height: 22, borderRadius: "50%",
                        background: opt.borderColor, display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{opt.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: selected ? opt.color : "#343a40", marginBottom: 6 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 12, color: "#6c757d", lineHeight: 1.4 }}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ Broker Connections Card ═══ */}
        <div className="adminlte-card">
          <div className="adminlte-card-header" style={{ borderLeftColor: "#17a2b8" }}>
            <div className="adminlte-card-title">
              <span style={{ marginRight: 8 }}>🔗</span> Broker Connections
            </div>
          </div>
          <div className="adminlte-card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {BROKERS.map((broker) => {
                const connected = isConnected(broker.key);
                const lastSynced = getLastSynced(broker.key);
                return (
                  <div
                    key={broker.key}
                    style={{
                      padding: 20,
                      borderRadius: 10,
                      border: connected ? "1px solid rgba(40,167,69,0.3)" : "1px solid #e9ecef",
                      background: connected ? "linear-gradient(135deg, #f0fff4, #e6fcf2)" : "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 10,
                          background: broker.gradient,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20, boxShadow: `0 3px 10px ${broker.color}33`,
                        }}>
                          {broker.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#343a40" }}>{broker.name}</div>
                          <div style={{
                            fontSize: 11, fontWeight: 600, marginTop: 2,
                            color: connected ? "#28a745" : "#adb5bd",
                            display: "flex", alignItems: "center", gap: 4,
                          }}>
                            <span style={{
                              width: 7, height: 7, borderRadius: "50%",
                              background: connected ? "#28a745" : "#ced4da",
                              display: "inline-block",
                            }} />
                            {connected ? "Connected" : "Not connected"}
                          </div>
                        </div>
                      </div>
                    </div>
                    {lastSynced && (
                      <p style={{ fontSize: 11, color: "#6c757d", marginBottom: 10 }}>
                        Last synced: {lastSynced}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      {connected ? (
                        <>
                          <button
                            onClick={() => handleSync(broker.key)}
                            disabled={syncing === broker.key}
                            style={{
                              flex: 1, padding: "8px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                              border: "none", background: "#007bff", color: "#fff",
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                            }}
                          >
                            {syncing === broker.key ? "Syncing..." : "🔄 Sync"}
                          </button>
                          <button
                            onClick={() => handleDisconnect(broker.key)}
                            style={{
                              padding: "8px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                              border: "1px solid #dc3545", background: "transparent", color: "#dc3545",
                              cursor: "pointer",
                            }}
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(broker.key)}
                          style={{
                            flex: 1, padding: "8px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                            border: "none", background: broker.gradient, color: "#fff",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                            boxShadow: `0 2px 8px ${broker.color}33`,
                          }}
                        >
                          Connect {broker.name}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              marginTop: 20, padding: "12px 16px", borderRadius: 6,
              background: "#d1ecf1", border: "1px solid #bee5eb",
              fontSize: 12, color: "#0c5460", lineHeight: 1.5,
            }}>
              <strong>ℹ Note:</strong> To connect a broker, register an app on the broker&apos;s developer portal and provide the API key/secret in the backend <code style={{ background: "#c3dde5", padding: "1px 4px", borderRadius: 3 }}>.env</code> file.
            </div>
          </div>
        </div>

        {/* ═══ Save Button ═══ */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 32 }}>
          <button
            onClick={handleSave}
            style={{
              padding: "12px 32px", borderRadius: 6, fontSize: 14, fontWeight: 600,
              border: "none", background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff",
              cursor: "pointer", boxShadow: "0 3px 12px rgba(0,123,255,0.3)",
              transition: "all 0.15s",
            }}
          >
            💾 Save Changes
          </button>
          {saved && (
            <span style={{
              fontSize: 13, color: "#28a745", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              ✓ Saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}