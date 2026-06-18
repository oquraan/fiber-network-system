"use client"

import { useStore } from "@/lib/store"
import { visibleTransactions } from "@/lib/permissions"
import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER, ROLE_LABELS, type Status } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CircleAlert, MapPinned, CheckCircle2, Activity } from "lucide-react"

export function OverviewView() {
  const { currentUser, transactions } = useStore()
  const visible = visibleTransactions(currentUser, transactions)

  const counts = STATUS_ORDER.reduce(
    (acc, s) => {
      acc[s] = visible.filter((t) => t.status === s).length
      return acc
    },
    {} as Record<Status, number>,
  )
  const total = visible.length
  const issues = visible.reduce(
    (n, t) => n + t.feedback.filter((f) => f.kind === "issue" && !f.resolved).length,
    0,
  )
  const done = counts.approved
  const online = visible.filter((t) => t.activation?.online).length

  const kpis = [
    { label: "إجمالي المعاملات", value: total, icon: MapPinned, color: "#0e7490" },
    { label: "قيد التنفيذ", value: total - done, icon: Activity, color: "#ea580c" },
    { label: "مكتملة (أخضر)", value: done, icon: CheckCircle2, color: "#16a34a" },
    { label: "مشاكل مفتوحة", value: issues, icon: CircleAlert, color: "#dc2626" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة المعلومات</h1>
        <p className="text-sm text-muted-foreground">
          مرحباً {currentUser.name} — {ROLE_LABELS[currentUser.role]} · منطقة حي الصحة، إربد
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${k.color}1a` }}
              >
                <k.icon className="h-5 w-5" style={{ color: k.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold leading-tight">{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">توزيع المعاملات حسب الحالة (دورة حياة الدبوس)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {STATUS_ORDER.map((s) => {
              const pct = total ? Math.round((counts[s] / total) * 100) : 0
              return (
                <div key={s}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
                      {STATUS_LABELS[s]}
                    </span>
                    <span className="font-semibold">
                      {counts[s]} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">مؤشرات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Stat label="اشتراكات Online" value={online} />
            <Stat label="بانتظار التركيب (أحمر)" value={counts.new} />
            <Stat label="بانتظار اللحام (برتقالي)" value={counts.laid} />
            <Stat label="بانتظار التفعيل (أزرق)" value={counts.spliced} />
            <Stat label="بانتظار الكشف النهائي (بنفسجي)" value={counts.activated} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
