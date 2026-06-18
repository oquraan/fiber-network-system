"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { visibleTransactions } from "@/lib/permissions"
import { MapCanvas } from "@/components/map-canvas"
import { TransactionDialog } from "@/components/transaction-dialog"
import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER, type Transaction } from "@/lib/types"
import { Card } from "@/components/ui/card"

export function MapView() {
  const { currentUser, transactions } = useStore()
  const visible = visibleTransactions(currentUser, transactions)
  const [selected, setSelected] = useState<Transaction | null>(null)

  const current = selected ? transactions.find((t) => t.id === selected.id) ?? null : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الخريطة التفاعلية</h1>
          <p className="text-sm text-muted-foreground">
            حي الصحة - إربد · الحدود الخضراء تمثل المنطقة المخدومة
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
          {STATUS_ORDER.map((s) => (
            <span key={s} className="flex items-center gap-1.5 text-xs">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
              {STATUS_LABELS[s]}
            </span>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="h-[70vh] w-full">
          <MapCanvas transactions={visible} onSelectTx={setSelected} />
        </div>
      </Card>

      <TransactionDialog tx={current} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  )
}
