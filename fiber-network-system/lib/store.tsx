"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type {
  AreaPrep,
  FeedbackEntry,
  FeedbackKind,
  MaterialRow,
  Notification,
  Role,
  Transaction,
  User,
} from "./types"
import { USERS, INITIAL_TRANSACTIONS, INITIAL_AREAS, AREA_CENTER } from "./mock-data"

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function nowHist(byName: string, action: string) {
  return { id: uid("H"), at: new Date().toISOString(), byName, action }
}

interface NewContractInput {
  customerName: string
  phone: string
  nationalId: string
  service: string
  area: string
  deviceType: string
  speed: string
  contractImage?: string
  lat: number
  lng: number
}

interface StoreValue {
  currentUser: User
  users: User[]
  transactions: Transaction[]
  areas: AreaPrep[]
  notifications: Notification[]
  setRole: (role: Role) => void
  createContract: (input: NewContractInput) => Transaction
  assignInstaller: (txId: string, installerId: string) => void
  assignSplicer: (txId: string, splicerId: string) => void
  submitMaterials: (txId: string, materials: MaterialRow[]) => void
  scanDevice: (txId: string, barcode: string) => void
  completeInstall: (txId: string) => void
  completeSplice: (txId: string) => void
  activateService: (txId: string) => void
  approveFinal: (txId: string) => void
  addFeedback: (txId: string, message: string, kind: FeedbackKind, attachments?: FeedbackEntry["attachments"]) => void
  resolveFeedback: (txId: string, feedbackId: string) => void
  rollbackTransaction: (txId: string, targetRole: "installer" | "splicer", assignToId: string | "dispatcher") => void
  markNotificationsRead: (role: Role) => void
  toggleAreaStage: (areaId: string, stageKey: string) => void
  toggleDbPower: (areaId: string, dbId: string) => void
  addDbSplitter: (areaId: string, dbId: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users] = useState<User[]>(USERS)
  const [currentUser, setCurrentUser] = useState<User>(USERS[8]) // admin افتراضياً
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [areas, setAreas] = useState<AreaPrep[]>(INITIAL_AREAS)
  const [notifications, setNotifications] = useState<Notification[]>([])

  function setRole(role: Role) {
    const u = users.find((x) => x.role === role)
    if (u) setCurrentUser(u)
  }

  function updateTx(txId: string, fn: (tx: Transaction) => Transaction) {
    setTransactions((prev) => prev.map((t) => (t.id === txId ? fn(t) : t)))
  }

  function pushNotification(transactionId: string, message: string, forRole: Role) {
    setNotifications((prev) => [
      { id: uid("N"), transactionId, message, createdAt: new Date().toISOString(), read: false, forRole },
      ...prev,
    ])
  }

  function createContract(input: NewContractInput): Transaction {
    const serial = `INT${Math.floor(80000000 + Math.random() * 19999999)}`
    const tx: Transaction = {
      id: serial,
      customerName: input.customerName,
      phone: input.phone,
      nationalId: input.nationalId,
      area: input.area,
      service: input.service,
      deviceType: input.deviceType,
      speed: input.speed,
      contractImage: input.contractImage,
      month: new Date().toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      lat: input.lat,
      lng: input.lng,
      status: "new",
      createdAt: new Date().toISOString(),
      createdById: currentUser.id,
      createdByName: currentUser.name,
      materials: [],
      feedback: [],
      history: [nowHist(currentUser.name, "إنشاء العقد وإصدار رقم الاشتراك")],
    }
    setTransactions((prev) => [tx, ...prev])
    return tx
  }

  function assignInstaller(txId: string, installerId: string) {
    const inst = users.find((u) => u.id === installerId)
    updateTx(txId, (t) => ({
      ...t,
      assignedInstallerId: installerId,
      history: [...t.history, nowHist(currentUser.name, `إسناد المد إلى ${inst?.name ?? installerId}`)],
    }))
  }

  function assignSplicer(txId: string, splicerId: string) {
    const sp = users.find((u) => u.id === splicerId)
    updateTx(txId, (t) => ({
      ...t,
      assignedSplicerId: splicerId,
      history: [...t.history, nowHist(currentUser.name, `إسناد اللحام إلى ${sp?.name ?? splicerId}`)],
    }))
  }

  function submitMaterials(txId: string, materials: MaterialRow[]) {
    updateTx(txId, (t) => ({
      ...t,
      materials,
      history: [...t.history, nowHist(currentUser.name, "إدخال/تحديث الكميات المستخدمة")],
    }))
  }

  function scanDevice(txId: string, barcode: string) {
    updateTx(txId, (t) => ({
      ...t,
      deviceScan: {
        barcode,
        scannedById: currentUser.id,
        scannedByName: currentUser.name,
        at: new Date().toISOString(),
      },
      history: [...t.history, nowHist(currentUser.name, `مسح باركود الجهاز (${barcode}) - خرج من العهدة`)],
    }))
  }

  function completeInstall(txId: string) {
    updateTx(txId, (t) => ({
      ...t,
      status: t.status === "new" ? "laid" : t.status,
      history: [...t.history, nowHist(currentUser.name, "إنهاء المد - تم (Done)")],
    }))
  }

  function completeSplice(txId: string) {
    updateTx(txId, (t) => ({
      ...t,
      status: t.status === "laid" ? "spliced" : t.status,
      history: [...t.history, nowHist(currentUser.name, "إنهاء اللحام - تم (Done)")],
    }))
  }

  function activateService(txId: string) {
    const tx = transactions.find((t) => t.id === txId)
    const username = `${txId.toLowerCase()}@fiber.jo`
    const password = `Fb-${Math.random().toString(36).slice(2, 8)}`
    updateTx(txId, (t) => ({
      ...t,
      status: t.status === "spliced" ? "activated" : t.status,
      activation: { username, password, online: true, at: new Date().toISOString() },
      history: [...t.history, nowHist(currentUser.name, "سحب بيانات التفعيل وتحويل الاشتراك إلى Online")],
    }))
    void tx
  }

  function approveFinal(txId: string) {
    updateTx(txId, (t) => ({
      ...t,
      status: t.status === "activated" ? "approved" : t.status,
      supervisorApproved: true,
      history: [...t.history, nowHist(currentUser.name, "الكشف النهائي والموافقة - دبوس أخضر")],
    }))
  }

  function addFeedback(
    txId: string,
    message: string,
    kind: FeedbackKind,
    attachments?: FeedbackEntry["attachments"],
  ) {
    const fb: FeedbackEntry = {
      id: uid("F"),
      byId: currentUser.id,
      byName: currentUser.name,
      role: currentUser.role,
      message,
      kind,
      attachments,
      createdAt: new Date().toISOString(),
    }
    updateTx(txId, (t) => ({
      ...t,
      feedback: [...t.feedback, fb],
      history: [...t.history, nowHist(currentUser.name, `فيدباك: ${message}`)],
    }))
    if (kind === "issue") {
      pushNotification(txId, `${currentUser.name}: ${message}`, "supervisor")
    } else if (kind === "supervisor") {
      pushNotification(txId, `توجيه من المشرف: ${message}`, "dispatcher")
    }
  }

  function resolveFeedback(txId: string, feedbackId: string) {
    updateTx(txId, (t) => ({
      ...t,
      feedback: t.feedback.map((f) => (f.id === feedbackId ? { ...f, resolved: true } : f)),
      history: [...t.history, nowHist(currentUser.name, "معالجة فيدباك من قبل المشرف")],
    }))
  }

  function rollbackTransaction(txId: string, targetRole: "installer" | "splicer", assignToId: string | "dispatcher") {
    const assignedUser = assignToId !== "dispatcher" ? users.find((u) => u.id === assignToId) : null
    
    updateTx(txId, (t) => {
      const historyEntry = nowHist(
        currentUser.name,
        `إرجاع المعاملة لمرحلة ${targetRole === "installer" ? "المد" : "اللحام"} وتوجيهها إلى ${
          assignToId === "dispatcher" ? "الموزع لإعادة التعيين" : assignedUser?.name
        }`
      )
      
      if (targetRole === "installer") {
        return {
          ...t,
          status: "new",
          activation: undefined,
          // keeping deviceScan as requested by user
          assignedInstallerId: assignToId === "dispatcher" ? undefined : assignToId,
          assignedSplicerId: undefined,
          history: [...t.history, historyEntry],
        }
      } else {
        return {
          ...t,
          status: "laid",
          activation: undefined,
          assignedSplicerId: assignToId === "dispatcher" ? undefined : assignToId,
          history: [...t.history, historyEntry],
        }
      }
    })

    pushNotification(txId, `المشرف قام بإرجاع المعاملة لمرحلة ${targetRole === "installer" ? "المد" : "اللحام"}`, "dispatcher")
  }

  function markNotificationsRead(role: Role) {
    setNotifications((prev) => prev.map((n) => (n.forRole === role ? { ...n, read: true } : n)))
  }

  function toggleAreaStage(areaId: string, stageKey: string) {
    setAreas((prev) =>
      prev.map((a) =>
        a.id === areaId
          ? { ...a, stages: a.stages.map((s) => (s.key === stageKey ? { ...s, done: !s.done } : s)) }
          : a,
      ),
    )
  }

  function toggleDbPower(areaId: string, dbId: string) {
    setAreas((prev) =>
      prev.map((a) =>
        a.id === areaId
          ? { ...a, dbs: a.dbs.map((d) => (d.id === dbId ? { ...d, hasPower: !d.hasPower } : d)) }
          : a,
      ),
    )
  }

  function addDbSplitter(areaId: string, dbId: string) {
    setAreas((prev) =>
      prev.map((a) =>
        a.id === areaId
          ? { ...a, dbs: a.dbs.map((d) => (d.id === dbId ? { ...d, splitterCount: d.splitterCount + 1, full: false } : d)) }
          : a,
      ),
    )
  }

  const value = useMemo<StoreValue>(
    () => ({
      currentUser,
      users,
      transactions,
      areas,
      notifications,
      setRole,
      createContract,
      assignInstaller,
      assignSplicer,
      submitMaterials,
      scanDevice,
      completeInstall,
      completeSplice,
      activateService,
      approveFinal,
      addFeedback,
      resolveFeedback,
      rollbackTransaction,
      markNotificationsRead,
      toggleAreaStage,
      toggleDbPower,
      addDbSplitter,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, users, transactions, areas, notifications],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export { AREA_CENTER }
