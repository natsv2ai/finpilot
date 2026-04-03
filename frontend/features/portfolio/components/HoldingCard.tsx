import { Holding } from "../types";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function HoldingCard({ holding }: { holding: Holding }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-[var(--text-primary)]">{holding.symbol}</h3>
        <span className={`badge ${holding.gain_loss >= 0 ? "badge-green" : "badge-red"}`}>
          {formatPercent(holding.gain_loss_pct)}
        </span>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-3">{holding.name}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-[var(--text-muted)]">Qty:</span>{" "}
          <span className="text-[var(--text-primary)]">{holding.quantity}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Avg:</span>{" "}
          <span className="text-[var(--text-primary)]">{formatCurrency(holding.avg_price)}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">CMP:</span>{" "}
          <span className="text-[var(--text-primary)]">{formatCurrency(holding.current_price)}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)]">Value:</span>{" "}
          <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(holding.total_value)}</span>
        </div>
      </div>
    </div>
  );
}