"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { exportTransactionsToExcel } from "@/lib/export"
import { ROLE_LABELS, STATUS_LABELS, STATUS_ORDER, type Status } from "@/lib/types"
import { Download, Filter } from "lucide-react"

export function ReportsView() {
  const { transactions, users } = useStore()
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")
  const [monthFilter, setMonthFilter] = useState<string>("all")
  const [installerFilter, setInstallerFilter] = useState<string>("all")

  const months = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.month))),
    [transactions],
  )
  const installers = useMemo(() => users.filter((u) => u.role === "installer"), [users])

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false
      if (monthFilter !== "all" && t.month !== monthFilter) return false
      if (installerFilter !== "all" && t.assignedInstallerId !== installerFilter) return false
      return true
    })
  }, [transactions, statusFilter, monthFilter, installerFilter])

  const nameById = (id?: string) => users.find((u) => u.id === id)?.name ?? "—"

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">التقارير والإحصائيات</h2>
          <p className="text-sm text-muted-foreground">عرض شامل للمعاملات مع إمكانية التصفية والتصدير إلى Excel</p>
        </div>
        <Button onClick={() => exportTransactionsToExcel(filtered, users)} disabled={filtered.length === 0}>
          <Download className="size-4" />
          تصدير إلى Excel
        </Button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {STATUS_ORDER.map((s) => {
          const count = transactions.filter((t) => t.status === s).length
          return (
            <Card key={s}>
              <CardContent className="p-4">
                <StatusBadge status={s} />
                <p className="mt-2 text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="size-4 text-primary" />
            التصفية
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">الحالة</label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
              <SelectTrigger>
                <SelectValue />
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
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">الشهر</label>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأشهر</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">فني المد</label>
            <Select value={installerFilter} onValueChange={setInstallerFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفنيين</SelectItem>
                {installers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">النتائج ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الاشتراك</TableHead>
                  <TableHead className="text-right">المشترك</TableHead>
                  <TableHead className="text-right">الخدمة</TableHead>
                  <TableHead className="text-right">الشهر</TableHead>
                  <TableHead className="text-right">فني المد</TableHead>
                  <TableHead className="text-right">فني اللحام</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="font-medium">{t.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">{t.service}</TableCell>
                    <TableCell>{t.month}</TableCell>
                    <TableCell>{nameById(t.assignedInstallerId)}</TableCell>
                    <TableCell>{nameById(t.assignedSplicerId)}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      لا توجد نتائج مطابقة للمرشحات المختارة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Per-role workload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">عبء العمل حسب الموظف</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {users
            .filter((u) => u.role === "installer" || u.role === "splicer")
            .map((u) => {
              const asInstaller = transactions.filter((t) => t.assignedInstallerId === u.id).length
              const asSplicer = transactions.filter((t) => t.assignedSplicerId === u.id).length
              const total = u.role === "installer" ? asInstaller : asSplicer
              return (
                <div key={u.id} className="rounded-lg border bg-muted/30 p-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABELS[u.role]}</p>
                  <p className="mt-2 text-lg font-bold text-primary">{total} مهمة</p>
                </div>
              )
            })}
        </CardContent>
      </Card>
    </div>
  )
}
