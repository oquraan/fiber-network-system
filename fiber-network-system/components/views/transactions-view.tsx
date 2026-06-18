"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { visibleTransactions } from "@/lib/permissions"
import { TransactionDialog } from "@/components/transaction-dialog"
import { StatusBadge } from "@/components/status-badge"
import { STATUS_LABELS, STATUS_ORDER, type Status, type Transaction } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, AlertTriangle, ChevronLeft } from "lucide-react"

export function TransactionsView() {
  const { currentUser, transactions, users } = useStore()
  const visible = visibleTransactions(currentUser, transactions)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [tech, setTech] = useState<string>("all")

  const technicians = users.filter((u) => u.role === "installer" || u.role === "splicer")

  const filtered = useMemo(() => {
    return visible.filter((t) => {
      if (status !== "all" && t.status !== status) return false
      if (tech !== "all" && t.assignedInstallerId !== tech && t.assignedSplicerId !== tech) return false
      if (q.trim()) {
        const s = q.trim().toLowerCase()
        if (
          !t.id.toLowerCase().includes(s) &&
          !t.customerName.toLowerCase().includes(s) &&
          !t.phone.includes(s)
        )
          return false
      }
      return true
    })
  }, [visible, status, tech, q])

  const current = selected ? transactions.find((t) => t.id === selected.id) ?? null : null

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">المعاملات</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} معاملة معروضة</p>
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث برقم الاشتراك، الاسم، أو الهاتف"
            className="pr-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tech} onValueChange={setTech}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="الفني" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفنيين</SelectItem>
            {technicians.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">لا توجد معاملات مطابقة.</Card>
        )}
        {filtered.map((t) => {
          const openIssues = t.feedback.filter((f) => f.kind === "issue" && !f.resolved).length
          const superNotes = t.feedback.filter((f) => f.kind === "supervisor" && !f.resolved).length
          const installer = users.find((u) => u.id === t.assignedInstallerId)
          return (
            <Card
              key={t.id}
              onClick={() => setSelected(t)}
              className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:border-primary/50 hover:bg-accent/40"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{t.id}</span>
                  {openIssues > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                      <AlertTriangle className="h-3 w-3" /> {openIssues} مشكلة
                    </span>
                  )}
                  {superNotes > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-500">
                      <AlertTriangle className="h-3 w-3" /> {superNotes} توجيه مشرف
                    </span>
                  )}
                </div>
                <div className="truncate text-sm">{t.customerName}</div>
                <div className="text-xs text-muted-foreground">
                  {t.area} · {t.phone} {installer && `· مد: ${installer.name}`}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={t.status} />
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          )
        })}
      </div>

      <TransactionDialog tx={current} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  )
}
