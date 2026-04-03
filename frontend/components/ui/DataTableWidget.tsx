"use client";

import { useState, useMemo } from "react";

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableWidgetProps {
    columns: Column[];
    data: any[];
    searchable?: boolean;
    searchPlaceholder?: string;
    pageSize?: number;
    actions?: (row: any) => React.ReactNode;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onRowClick?: (row: any) => void;
    emptyMessage?: string;
}

export default function DataTableWidget({
    columns, data, searchable = true, searchPlaceholder = "Search...",
    pageSize = 10, actions, onEdit, onDelete, onRowClick, emptyMessage = "No data found",
}: DataTableWidgetProps) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(0);

    const filtered = useMemo(() => {
        let result = [...data];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter((row) =>
                columns.some((col) => String(row[col.key] ?? "").toLowerCase().includes(q))
            );
        }
        if (sortKey) {
            result.sort((a, b) => {
                const va = a[sortKey] ?? "";
                const vb = b[sortKey] ?? "";
                const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
                return sortDir === "asc" ? cmp : -cmp;
            });
        }
        return result;
    }, [data, search, sortKey, sortDir, columns]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    return (
        <div>
            {searchable && (
                <div style={{ marginBottom: 16 }}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        placeholder={searchPlaceholder}
                        style={{
                            maxWidth: 320, width: "100%", padding: "8px 12px",
                            border: "1px solid #ced4da", borderRadius: 4,
                            fontSize: 14, color: "#495057", background: "#fff",
                            outline: "none", transition: "border-color 0.15s",
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "#80bdff"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "#ced4da"}
                    />
                </div>
            )}
            <div style={{ overflowX: "auto" }}>
                <table className="adminlte-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                    style={{ cursor: col.sortable !== false ? "pointer" : "default" }}
                                >
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                        {col.label}
                                        {sortKey === col.key && (
                                            <span style={{ fontSize: 10 }}>{sortDir === "asc" ? "▲" : "▼"}</span>
                                        )}
                                    </span>
                                </th>
                            ))}
                            {(actions || onEdit || onDelete) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paged.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions || onEdit || onDelete ? 1 : 0)} style={{ textAlign: "center", padding: 32, color: "#adb5bd" }}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paged.map((row, i) => (
                                <tr
                                    key={row.id ?? i}
                                    onClick={() => onRowClick?.(row)}
                                    style={{ cursor: onRowClick ? "pointer" : "default" }}
                                    className={onRowClick ? "hover-row" : ""}
                                >
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {(actions || onEdit || onDelete) && (
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                {actions?.(row)}
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(row)}
                                                        title="Edit"
                                                        style={{
                                                            display: "inline-flex", alignItems: "center", gap: 4,
                                                            padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 500,
                                                            border: "1px solid #007bff", background: "transparent", color: "#007bff",
                                                            cursor: "pointer", transition: "all 0.15s",
                                                        }}
                                                    >
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(row)}
                                                        title="Delete"
                                                        style={{
                                                            display: "inline-flex", alignItems: "center", gap: 4,
                                                            padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 500,
                                                            border: "1px solid #dc3545", background: "transparent", color: "#dc3545",
                                                            cursor: "pointer", transition: "all 0.15s",
                                                        }}
                                                    >
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "8px 0" }}>
                    <span style={{ fontSize: 13, color: "#6c757d" }}>
                        Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                            style={{
                                padding: "6px 12px", borderRadius: 4, fontSize: 13, fontWeight: 500,
                                border: "1px solid #ced4da", background: page === 0 ? "#e9ecef" : "#fff",
                                color: page === 0 ? "#adb5bd" : "#495057", cursor: page === 0 ? "default" : "pointer",
                            }}
                        >
                            « Prev
                        </button>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(page + 1)}
                            style={{
                                padding: "6px 12px", borderRadius: 4, fontSize: 13, fontWeight: 500,
                                border: "1px solid #ced4da", background: page >= totalPages - 1 ? "#e9ecef" : "#fff",
                                color: page >= totalPages - 1 ? "#adb5bd" : "#495057",
                                cursor: page >= totalPages - 1 ? "default" : "pointer",
                            }}
                        >
                            Next »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
