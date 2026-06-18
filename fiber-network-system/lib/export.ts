import * as XLSX from "xlsx"
import { STATUS_LABELS, type Transaction, type User } from "./types"

export function exportTransactionsToExcel(transactions: Transaction[], users: User[]) {
  const byId = (id?: string) => users.find((u) => u.id === id)?.name ?? "-"

  const rows = transactions.map((t) => ({
    "رقم الاشتراك": t.id,
    "اسم المشترك": t.customerName,
    "رقم التواصل": t.phone,
    "الرقم الوطني": t.nationalId,
    "المنطقة": t.area,
    "نوع الخدمة": t.service,
    "الشهر": t.month,
    "الحالة": STATUS_LABELS[t.status],
    "فني المد": byId(t.assignedInstallerId),
    "فني اللحام": byId(t.assignedSplicerId),
    "Online": t.activation?.online ? "نعم" : "لا",
    "خط العرض": t.lat,
    "خط الطول": t.lng,
    "تاريخ الإنشاء": new Date(t.createdAt).toLocaleDateString("en-GB"),
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  ws["!cols"] = Object.keys(rows[0] ?? { a: 1 }).map(() => ({ wch: 18 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "المعاملات")
  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `fiber-report-${date}.xlsx`)
}
