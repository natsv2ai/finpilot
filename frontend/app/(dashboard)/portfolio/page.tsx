"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePortfolio } from "@/features/portfolio/hooks/usePortfolio";
import { uploadCSV, deleteHolding } from "@/features/portfolio/services/portfolioService";
import { formatCurrency, formatPercent, formatDecimal } from "@/lib/utils";
import type { CSVUploadResult, Holding } from "@/features/portfolio/types";

// --- Components ---

function DeleteConfirmModal({
  holding,
  onConfirm,
  onClose,
  deleting,
  error
}: {
  holding: Holding;
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
  error: string | null;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, width: "100%", maxWidth: 400,
        overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
      }}>
        <div style={{ padding: "24px 24px 16px" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", background: error ? "#fee2e2" : "#fee2e2",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#dc3545" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Delete Asset?</h3>
          <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5, margin: 0 }}>
            Are you sure you want to remove <strong>{holding.symbol}</strong>? This will permanently delete the record from the database.
          </p>
          {error && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#fef2f2", color: "#991b1b", borderRadius: 6, fontSize: 13, border: "1px solid #fee2e2" }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
        <div style={{
          padding: "16px 24px", background: "#f9fafb", display: "flex", justifyContent: "flex-end", gap: 12
        }}>
          <button
            onClick={onClose}
            disabled={deleting}
            style={{
              padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 600,
              border: "1px solid #d1d5db", background: "#fff", color: "#374151",
              cursor: "pointer", transition: "all 0.2s"
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              padding: "8px 16px", borderRadius: 6, fontSize: 14, fontWeight: 600,
              border: "none", background: "#dc3545", color: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
            }}
          >
            {deleting ? "Deleting..." : "Delete Asset"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { holdings, loading, refetch } = usePortfolio();
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Deletion State
  const [holdingToDelete, setHoldingToDelete] = useState<Holding | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = holdings.filter((h: Holding) => {
    if (brokerFilter !== "all" && h.broker !== brokerFilter) return false;
    if (assetFilter !== "all" && h.asset_type !== assetFilter) return false;
    return true;
  });

  const brokers = ["all", ...new Set(holdings.map((h: Holding) => h.broker))];

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadResult(null);
    try {
      const result = await uploadCSV(file);
      setUploadResult(result);
      if (result.success > 0) refetch();
    } catch {
      setUploadResult({ success: 0, failed: 1, errors: ["Upload failed. Make sure the backend is running."] });
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!holdingToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      // Direct deletion (Instant Database call)
      await deleteHolding(holdingToDelete.id);

      // Close modal immediately for "Instant" feel
      setHoldingToDelete(null);

      // Refresh background data (Slow because it fetches live prices)
      refetch();
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Could not delete asset. Please check connection.";
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xls") || file.name.endsWith(".xlsx"))) {
      handleFileUpload(file);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256, color: "#6c757d" }}>
        Loading portfolio...
      </div>
    );
  }

  // Summary labels
  const investedLabel = assetFilter === "mutual_fund" ? "MF Invested" : assetFilter === "stock" ? "Stock Invested" : "Total Invested";
  const valueLabel = assetFilter === "mutual_fund" ? "MF Current Value" : assetFilter === "stock" ? "Stock Value" : "Total Current Value";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>My Portfolio</h1>
          <p style={{ fontSize: 13, color: "#6c757d", marginTop: 4 }}>
            {holdings.length} holdings across {new Set(holdings.map((h) => h.broker)).size} brokers
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            border: "none", background: "linear-gradient(135deg, #007bff, #0056b3)", color: "#fff",
            cursor: "pointer", boxShadow: "0 3px 12px rgba(0,123,255,0.3)",
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div className="adminlte-card" style={{ marginBottom: 0 }}>
          <div className="adminlte-card-body" style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{investedLabel}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>
              {formatCurrency(filtered.reduce((acc: number, h: Holding) => acc + (h.quantity * h.avg_price), 0))}
            </p>
          </div>
        </div>
        <div className="adminlte-card" style={{ marginBottom: 0 }}>
          <div className="adminlte-card-body" style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{valueLabel}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "#343a40", margin: 0 }}>
              {formatCurrency(filtered.reduce((acc: number, h: Holding) => acc + h.total_value, 0))}
            </p>
          </div>
        </div>
        <div className="adminlte-card" style={{ marginBottom: 0 }}>
          <div className="adminlte-card-body" style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{assetFilter === "all" ? "Portfolio" : assetFilter === "mutual_fund" ? "MF" : "Stock"} Returns</p>
            {(() => {
              const invested = filtered.reduce((acc: number, h: Holding) => acc + (h.quantity * h.avg_price), 0);
              const current = filtered.reduce((acc: number, h: Holding) => acc + h.total_value, 0);
              const pnl = current - invested;
              const pnlPct = invested ? (pnl / invested) * 100 : 0;
              return (
                <p style={{ fontSize: 24, fontWeight: 700, color: pnl >= 0 ? "#28a745" : "#dc3545", margin: 0 }}>
                  {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)} <span style={{ fontSize: 16, fontWeight: 600 }}>({formatPercent(pnlPct)})</span>
                </p>
              );
            })()}
          </div>
        </div>
        <div className="adminlte-card" style={{ marginBottom: 0 }}>
          <div className="adminlte-card-body" style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{assetFilter === "all" ? "Portfolio" : assetFilter === "mutual_fund" ? "MF" : "Stock"} 1-Day Change</p>
            {(() => {
              const dayChg = filtered.reduce((acc: number, h: Holding) => acc + h.day_change, 0);
              const current = filtered.reduce((acc: number, h: Holding) => acc + h.total_value, 0);
              const previous = current - dayChg;
              const dayChgPct = previous > 0 ? (dayChg / previous) * 100 : 0;
              return (
                <p style={{ fontSize: 24, fontWeight: 700, color: dayChg >= 0 ? "#28a745" : "#dc3545", margin: 0 }}>
                  {dayChg >= 0 ? "+" : ""}{formatCurrency(dayChg)} <span style={{ fontSize: 16, fontWeight: 600 }}>({formatPercent(dayChgPct)})</span>
                </p>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "stock", "mutual_fund"].map((t: string) => (
            <button
              key={t}
              onClick={() => setAssetFilter(t)}
              style={{
                padding: "6px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                border: "1px solid #ced4da", cursor: "pointer",
                background: assetFilter === t ? "#007bff" : "#fff",
                color: assetFilter === t ? "#fff" : "#495057",
                transition: "all 0.15s",
              }}
            >
              {t === "all" ? "All" : t === "stock" ? "📈 Stocks" : "📊 Mutual Funds"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {brokers.map((b: string) => (
            <button
              key={b}
              onClick={() => setBrokerFilter(b)}
              style={{
                padding: "6px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                border: "1px solid #ced4da", cursor: "pointer",
                background: brokerFilter === b ? "#007bff" : "#fff",
                color: brokerFilter === b ? "#fff" : "#495057",
                transition: "all 0.15s",
              }}
            >
              {b === "all" ? "All Brokers" : b.charAt(0).toUpperCase() + b.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="adminlte-card">
        <div className="adminlte-card-header" style={{ borderLeftColor: "#007bff" }}>
          <div className="adminlte-card-title">
            <span style={{ marginRight: 8 }}>💼</span> Holdings
          </div>
        </div>
        <div className="adminlte-card-body" style={{ padding: 0, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                {[
                  assetFilter === "mutual_fund" ? "MUTUAL FUND" : "STOCK",
                  assetFilter === "mutual_fund" ? "UNITS" : "QTY",
                  assetFilter === "mutual_fund" ? "AVG NAV" : "AVG PRICE",
                  "INVESTED",
                  assetFilter === "mutual_fund" ? "LATEST NAV" : "CMP",
                  "VALUE",
                  "P&L",
                  "DAY CHG",
                  "XIRR",
                  "ACTION"
                ].map((h: string) => (
                  <th key={h} style={{
                    padding: "10px 14px", fontSize: 11, fontWeight: 700,
                    color: "#6c757d", textAlign: "left",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h: Holding) => {
                const investedAmount = h.quantity * h.avg_price;
                const isMF = h.asset_type === "mutual_fund";
                return (
                  <tr key={h.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <Link href={`/stock/${h.symbol}`} style={{ color: "#007bff", fontWeight: 600, textDecoration: "none", fontSize: 13 }}>{h.symbol}</Link>
                      <span style={{ display: "block", fontSize: 11, color: "#adb5bd", marginTop: 2 }}>{h.name}</span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#343a40", fontWeight: 500 }}>
                      {formatDecimal(h.quantity, isMF ? 3 : 0)}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#6c757d" }}>
                      {formatCurrency(h.avg_price, isMF ? 4 : 2)}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#343a40", fontWeight: 500 }}>{formatCurrency(investedAmount)}</td>
                    <td style={{ padding: "12px 14px", color: "#343a40", fontWeight: 500 }}>
                      {formatCurrency(h.current_price, isMF ? 4 : 2)}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#343a40", fontWeight: 600 }}>{formatCurrency(h.total_value)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ color: h.gain_loss >= 0 ? "#28a745" : "#dc3545", fontWeight: 600 }}>
                        {formatCurrency(h.gain_loss)}
                      </span>
                      <span style={{ display: "block", fontSize: 11, color: h.gain_loss_pct >= 0 ? "#28a745" : "#dc3545" }}>
                        {formatPercent(h.gain_loss_pct)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                        background: h.day_change_pct >= 0 ? "#d4edda" : "#f8d7da",
                        color: h.day_change_pct >= 0 ? "#155724" : "#721c24",
                      }}>
                        {formatPercent(h.day_change_pct)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {h.xirr !== null ? (
                        <span style={{ fontWeight: 600, color: h.xirr >= 0 ? "#28a745" : "#dc3545" }}>
                          {h.xirr.toFixed(1)}%
                        </span>
                      ) : (
                        <span style={{ color: "#adb5bd" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <button
                        onClick={() => setHoldingToDelete(h)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#dc3545", opacity: 0.7, padding: 4, transition: "opacity 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                        onMouseOut={(e) => e.currentTarget.style.opacity = "0.7"}
                        title="Delete Holding"
                      >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 16px", color: "#adb5bd", fontSize: 14 }}>
              No holdings found for the selected filters.
            </div>
          )}
        </div>
      </div>

      {/* CSV/Excel Upload Modal */}
      {showUpload && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 6, width: "100%", maxWidth: 520, boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.08)",
              borderLeft: "3px solid #007bff", background: "#f8f9fa",
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#343a40" }}>Upload Holdings</span>
              <button
                onClick={() => { setShowUpload(false); setUploadResult(null); }}
                style={{ padding: 4, border: "none", background: "transparent", cursor: "pointer", color: "#6c757d", fontSize: 18 }}
              >✕</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#007bff" : "#ced4da"}`,
                  borderRadius: 6, padding: "40px 20px", textAlign: "center",
                  cursor: "pointer", background: dragOver ? "rgba(0,123,255,0.05)" : "#f8f9fa",
                }}
              >
                <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx" style={{ display: "none" }}
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); }}
                />
                <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#343a40" }}>
                  {uploading ? "Uploading..." : "Drag & drop your CSV or Excel file here"}
                </p>
                <p style={{ fontSize: 12, color: "#adb5bd", marginTop: 4 }}>or click to browse</p>
              </div>

              <div style={{
                padding: 12, borderRadius: 6,
                background: "#d1ecf1", border: "1px solid #bee5eb",
              }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#0c5460", marginBottom: 6 }}>Instructions:</p>
                <p style={{ fontSize: 12, color: "#0c5460", lineHeight: 1.5, margin: 0 }}>
                  Upload a CSV or Excel file. The system will auto-detect columns like Symbol, Quantity, and Price.
                  Even files with missing headers will be parsed using intelligent fallbacks.
                </p>
              </div>

              {uploadResult && (
                <div style={{
                  padding: 12, borderRadius: 6,
                  background: uploadResult.success > 0 ? "#d4edda" : "#f8d7da",
                  border: `1px solid ${uploadResult.success > 0 ? "rgba(40,167,69,0.2)" : "rgba(220,53,69,0.2)"}`,
                }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: uploadResult.success > 0 ? "#155724" : "#721c24" }}>
                    ✅ {uploadResult.success} imported · ❌ {uploadResult.failed} failed
                  </p>
                  {uploadResult.errors.length > 0 && (
                    <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                      {uploadResult.errors.map((err, i) => (
                        <li key={i} style={{ fontSize: 12, color: "#495057" }}>• {err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setShowUpload(false); setUploadResult(null); }}
                  style={{
                    padding: "8px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                    border: "1px solid #ced4da", background: "#f8f9fa", color: "#495057",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {holdingToDelete && (
        <DeleteConfirmModal
          holding={holdingToDelete}
          deleting={deleting}
          error={deleteError}
          onClose={() => { setHoldingToDelete(null); setDeleteError(null); }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
