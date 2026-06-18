import type { Role, Transaction, User } from "./types"

export type ViewKey =
  | "overview"
  | "map"
  | "transactions"
  | "new-contract"
  | "notifications"
  | "area-prep"
  | "reports"

export interface NavItem {
  key: ViewKey
  label: string
  icon: string
}

const ALL_NAV: Record<ViewKey, { label: string; icon: string }> = {
  overview: { label: "لوحة المعلومات", icon: "LayoutDashboard" },
  map: { label: "الخريطة التفاعلية", icon: "Map" },
  transactions: { label: "المعاملات", icon: "ListChecks" },
  "new-contract": { label: "عقد جديد", icon: "FilePlus2" },
  notifications: { label: "الإشعارات والمشاكل", icon: "Bell" },
  "area-prep": { label: "تجهيز المنطقة", icon: "HardHat" },
  reports: { label: "التقارير والتصدير", icon: "FileSpreadsheet" },
}

const ROLE_VIEWS: Record<Role, ViewKey[]> = {
  sales: ["overview", "map", "transactions", "new-contract"],
  dispatcher: ["overview", "map", "transactions"],
  installer: ["overview", "map", "transactions"],
  splicer: ["overview", "map", "transactions"],
  activator: ["overview", "map", "transactions"],
  supervisor: ["overview", "map", "transactions", "notifications", "area-prep"],
  admin: ["overview", "map", "transactions", "reports", "area-prep"],
}

export function navForRole(role: Role): NavItem[] {
  return ROLE_VIEWS[role].map((key) => ({ key, ...ALL_NAV[key] }))
}

export function defaultViewForRole(role: Role): ViewKey {
  return ROLE_VIEWS[role][0]
}

// المعاملات التي يراها الدور
// - الموزّع، مشرف المنطقة، الإدارة العليا: يرون كل المعاملات
// - المبيعات: يرى فقط المعاملات التي أنشأها بنفسه
// - كل فني يرى فقط المعاملات التي تخص مرحلته (ومسندة إليه)
export function visibleTransactions(user: User, transactions: Transaction[]): Transaction[] {
  switch (user.role) {
    case "sales":
      // المبيعات: فقط ما أضافه بنفسه
      return transactions.filter((t) => t.createdById === user.id)
    case "installer":
      // فني المد: فقط ما يحتاج إلى مد (جاهز للتركيب) ومُسند إليه
      return transactions.filter((t) => t.assignedInstallerId === user.id && t.status === "new")
    case "splicer":
      // فني اللحام: فقط ما تم مدّه ويحتاج إلى لحام ومُسند إليه
      return transactions.filter((t) => t.assignedSplicerId === user.id && t.status === "laid")
    case "activator":
      // موظف التفعيل: فقط ما تم لحامه ويحتاج إلى تفعيل
      return transactions.filter((t) => t.status === "spliced")
    case "dispatcher":
    case "supervisor":
    case "admin":
    default:
      // الموزّع والمشرف والإدارة: كل المعاملات
      return transactions
  }
}

// هل يستطيع الدور تنفيذ إجراء معيّن على معاملة
export function canAssign(role: Role): boolean {
  return role === "dispatcher" || role === "supervisor"
}
