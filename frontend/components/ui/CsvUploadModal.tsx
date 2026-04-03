"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";

interface CsvUploadModalProps {
    title: string;
    uploadUrl: string;
    expectedColumns: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CsvUploadModal({ title, uploadUrl, expectedColumns, onClose, onSuccess }: CsvUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.name.endsWith(".csv") || droppedFile?.name.endsWith(".xls") || droppedFile?.name.endsWith(".xlsx")) {
            setFile(droppedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const token = localStorage.getItem("finpilot_token");
            const res = await fetch(`http://localhost:8000/api/v1${uploadUrl}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            setResult(data);
            if (data.success > 0) {
                onSuccess();
            }
        } catch (err) {
            setResult({ success: 0, failed: 1, errors: ["Upload failed. Check your connection."] });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
                padding: 16,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff", borderRadius: 6, width: "100%", maxWidth: 520,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                }}
            >
                {/* Header */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.08)",
                    borderLeft: "3px solid #007bff", background: "#f8f9fa",
                }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#343a40" }}>{title}</span>
                    <button
                        onClick={onClose}
                        style={{
                            padding: 4, border: "none", background: "transparent",
                            cursor: "pointer", color: "#6c757d", fontSize: 18,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: 20 }}>
                    {!result ? (
                        <>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${dragOver ? "#007bff" : "#ced4da"}`,
                                    borderRadius: 6, padding: "40px 20px", textAlign: "center",
                                    cursor: "pointer", transition: "all 0.2s",
                                    background: dragOver ? "rgba(0,123,255,0.05)" : "#f8f9fa",
                                }}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".csv,.xls,.xlsx"
                                    style={{ display: "none" }}
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "#adb5bd", margin: "0 auto 12px", display: "block" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {file ? (
                                    <p style={{ color: "#007bff", fontWeight: 600, fontSize: 14 }}>📄 {file.name}</p>
                                ) : (
                                    <>
                                        <p style={{ color: "#343a40", fontWeight: 500, fontSize: 14 }}>Drop file here or click to browse</p>
                                        <p style={{ fontSize: 12, color: "#adb5bd", marginTop: 4 }}>CSV or Excel files are accepted</p>
                                    </>
                                )}
                            </div>
                            <div style={{
                                marginTop: 12, padding: 12, borderRadius: 6,
                                background: "#d1ecf1", border: "1px solid #bee5eb",
                            }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "#0c5460", marginBottom: 4 }}>Expected columns:</p>
                                <code style={{ fontSize: 12, color: "#0c5460", background: "#c3dde5", padding: "1px 4px", borderRadius: 3 }}>{expectedColumns}</code>
                                <p style={{ fontSize: 11, color: "#0c5460", marginTop: 4 }}>The system will auto-detect columns and formats automatically.</p>
                            </div>
                            <button
                                disabled={!file || uploading}
                                onClick={handleUpload}
                                style={{
                                    width: "100%", marginTop: 16, padding: "12px 20px",
                                    borderRadius: 6, fontSize: 14, fontWeight: 600,
                                    border: "none", background: (!file || uploading) ? "#e9ecef" : "linear-gradient(135deg, #007bff, #0056b3)",
                                    color: (!file || uploading) ? "#adb5bd" : "#fff",
                                    cursor: (!file || uploading) ? "default" : "pointer",
                                    boxShadow: (!file || uploading) ? "none" : "0 3px 12px rgba(0,123,255,0.3)",
                                    transition: "all 0.15s",
                                }}
                            >
                                {uploading ? "Uploading..." : "Upload File"}
                            </button>
                        </>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div style={{ padding: 16, borderRadius: 6, textAlign: "center", background: "#d4edda" }}>
                                    <p style={{ fontSize: 24, fontWeight: 700, color: "#28a745" }}>{result.success}</p>
                                    <p style={{ fontSize: 12, color: "#6c757d" }}>Imported</p>
                                </div>
                                <div style={{ padding: 16, borderRadius: 6, textAlign: "center", background: result.failed > 0 ? "#f8d7da" : "#f8f9fa" }}>
                                    <p style={{ fontSize: 24, fontWeight: 700, color: result.failed > 0 ? "#dc3545" : "#adb5bd" }}>{result.failed}</p>
                                    <p style={{ fontSize: 12, color: "#6c757d" }}>Failed</p>
                                </div>
                            </div>
                            {result.errors.length > 0 && (
                                <div style={{ padding: 12, borderRadius: 6, background: "#f8d7da", border: "1px solid rgba(220,53,69,0.2)" }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: "#721c24", marginBottom: 4 }}>Errors:</p>
                                    {result.errors.map((err, i) => (
                                        <p key={i} style={{ fontSize: 12, color: "#495057" }}>{err}</p>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                style={{
                                    width: "100%", padding: "12px 20px",
                                    borderRadius: 6, fontSize: 14, fontWeight: 600,
                                    border: "none", background: "linear-gradient(135deg, #007bff, #0056b3)",
                                    color: "#fff", cursor: "pointer",
                                    boxShadow: "0 3px 12px rgba(0,123,255,0.3)",
                                }}
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
