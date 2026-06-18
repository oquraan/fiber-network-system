import { STATUS_COLORS, STATUS_LABELS, type Status } from "@/lib/types"

export function StatusBadge({ status, className = "" }: { status: Status; className?: string }) {
  const color = STATUS_COLORS[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {STATUS_LABELS[status]}
    </span>
  )
}
