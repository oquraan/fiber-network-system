"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { TransactionDialog } from "@/components/transaction-dialog"
import { ROLE_LABELS, type Transaction } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Bell, ImageIcon, Video, MapPin } from "lucide-react"

export function NotificationsView() {
  const { transactions, currentUser, resolveFeedback } = useStore()
  const [selected, setSelected] = useState<Transaction | null>(null)

  // كل المشاكل المفتوحة الموجهة للمشرف
  const issues = transactions.flatMap((t) =>
    t.feedback
      .filter((f) => f.kind === "issue" && !f.resolved)
      .map((f) => ({ tx: t, fb: f })),
  )

  const current = selected ? transactions.find((t) => t.id === selected.id) ?? null : null

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">الإشعارات والمشاكل</h1>
        <p className="text-sm text-muted-foreground">
          المشاكل المرسلة من الفنيين والتي تتطلب تدخل مشرف المنطقة ({issues.length})
        </p>
      </div>

      {issues.length === 0 && (
        <Card className="p-10 text-center">
          <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">لا توجد مشاكل مفتوحة حالياً.</p>
        </Card>
      )}

      <div className="grid gap-3">
        {issues.map(({ tx, fb }) => (
          <Card key={fb.id} className="border-destructive/30">
            <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-mono text-sm font-semibold">{tx.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {fb.byName} ({ROLE_LABELS[fb.role]})
                  </span>
                </div>
                <p className="text-sm font-medium">{fb.message}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {tx.customerName} — {tx.area}
                  </span>
                </div>
                {fb.attachments && fb.attachments.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {fb.attachments.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
                        {a.type === "image" ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                        {a.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelected(tx)}>
                  فتح المعاملة
                </Button>
                {currentUser.role === "supervisor" && (
                  <Button size="sm" onClick={() => resolveFeedback(tx.id, fb.id)}>
                    معالجة
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TransactionDialog tx={current} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  )
}
