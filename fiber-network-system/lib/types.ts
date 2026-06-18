export type Role =
  | "sales" // المبيعات
  | "dispatcher" // موزع المعاملات
  | "installer" // فني التركيب (المد)
  | "splicer" // فني التفعيل (اللحام)
  | "activator" // موظف التفعيل
  | "supervisor" // مشرف المنطقة
  | "admin" // الإدارة العليا

export type Status =
  | "new" // أحمر - جاهز للتركيب
  | "laid" // برتقالي - تم المد
  | "spliced" // أزرق - تم اللحام
  | "activated" // بنفسجي - Online
  | "approved" // أخضر - الكشف النهائي

export interface User {
  id: string
  name: string
  role: Role
  area?: string
  phone?: string
}

export interface MaterialRow {
  id: string
  name: string
  quantity: number
  unit: string
}

export type FeedbackKind = "info" | "issue" | "supervisor"

export interface FeedbackEntry {
  id: string
  byId: string
  byName: string
  role: Role
  message: string
  kind: FeedbackKind
  attachments?: { type: "image" | "video"; label: string }[]
  resolved?: boolean
  createdAt: string
}

export interface HistoryEntry {
  id: string
  at: string
  byName: string
  action: string
}

export interface Activation {
  username: string
  password: string
  online: boolean
  at?: string
}

export interface DeviceScan {
  barcode: string
  scannedById: string
  scannedByName: string
  at: string
}

export interface Transaction {
  id: string // INT086795618
  customerName: string
  phone: string
  nationalId: string
  area: string
  service: string
  deviceType: string // نوع الجهاز المتفق عليه
  speed: string // السرعة المتفق عليها
  contractImage?: string // صورة العقد المرفوعة (Data URL)
  deviceScan?: DeviceScan // باركود الجهاز الذي يخرج من عهدة فني التركيب
  month: string
  lat: number
  lng: number
  status: Status
  createdAt: string
  createdById: string
  createdByName: string
  assignedInstallerId?: string
  assignedSplicerId?: string
  materials: MaterialRow[]
  feedback: FeedbackEntry[]
  activation?: Activation
  supervisorApproved?: boolean
  history: HistoryEntry[]
}

export interface AreaDb {
  id: string
  name: string
  hasPower: boolean
  splitterCount: number
  full: boolean
}

export interface AreaStage {
  key: string
  label: string
  done: boolean
}

export interface AreaPrep {
  id: string
  name: string
  stages: AreaStage[]
  dbs: AreaDb[]
}

export interface Notification {
  id: string
  transactionId: string
  message: string
  createdAt: string
  read: boolean
  forRole: Role
}

export const ROLE_LABELS: Record<Role, string> = {
  sales: "المبيعات",
  dispatcher: "موزّع المعاملات",
  installer: "فني التركيب (المد)",
  splicer: "فني التفعيل (اللحام)",
  activator: "موظف التفعيل",
  supervisor: "مشرف المنطقة",
  admin: "الإدارة العليا",
}

export const STATUS_LABELS: Record<Status, string> = {
  new: "جاهز للتركيب",
  laid: "تم المد",
  spliced: "تم اللحام",
  activated: "تم التفعيل (Online)",
  approved: "الكشف النهائي",
}

// Hex colors for the pins / badges
export const STATUS_COLORS: Record<Status, string> = {
  new: "#dc2626", // أحمر
  laid: "#ea580c", // برتقالي
  spliced: "#2563eb", // أزرق
  activated: "#9333ea", // بنفسجي
  approved: "#16a34a", // أخضر
}

export const STATUS_ORDER: Status[] = ["new", "laid", "spliced", "activated", "approved"]

export const INSTALLER_FEEDBACK_OPTIONS = [
  "لا يوجد مشاكل - جاهز للتركيب",
  "طلب موعد من قبل المشترك",
  "المشترك لا يجيب",
  "بحاجة إلى كشف مشرف منطقة لإيجاد طريقة للمد",
  "بحاجة إلى أعمدة",
  "بحاجة إلى حفر",
  "بحاجة إلى إضافة splitter على db",
  "الـ db full",
  "الموقع غير مخدوم",
  "طلب إلغاء الاشتراك",
  "يوجد تمديد مسبق بالموقع",
]

// أنواع الأجهزة المتفق عليها
export const DEVICE_TYPE_OPTIONS = [
  "ONT - Huawei HG8145V5",
  "ONT - Huawei EG8145X6",
  "ONT - ZTE F660",
  "ONT - ZTE F670L",
  "ONT - Nokia G-140W",
  "Router - TP-Link Archer AX23",
  "Router - TP-Link Deco X50 (Mesh)",
]

// السرعات المتفق عليها
export const SPEED_OPTIONS = [
  "25 Mbps",
  "50 Mbps",
  "100 Mbps",
  "200 Mbps",
  "500 Mbps",
  "1 Gbps",
]

export const SPLICER_FEEDBACK_OPTIONS = [
  "لا يوجد مشاكل - جاهز للتفعيل",
  "طلب موعد من قبل المشترك",
  "المشترك لا يجيب",
  "لا يوجد power على db (بحاجة إلى صيانة)",
  "بحاجة إلى إضافة splitter على db",
]
