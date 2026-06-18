"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import {
  INSTALLER_FEEDBACK_OPTIONS,
  SPLICER_FEEDBACK_OPTIONS,
  ROLE_LABELS,
  type MaterialRow,
  type Transaction,
} from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "./status-badge"
import {
  User,
  Phone,
  IdCard,
  MapPin,
  Calendar,
  Wifi,
  Plus,
  Trash2,
  Send,
  Check,
  CircleCheck,
  Wrench,
  Zap,
  ShieldCheck,
  ImageIcon,
  Video,
  AlertTriangle,
  Router,
  Gauge,
  FileImage,
  ScanLine,
  PackageCheck,
} from "lucide-react"

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}

export function TransactionDialog({
  tx,
  open,
  onClose,
}: {
  tx: Transaction | null
  open: boolean
  onClose: () => void
}) {
  const store = useStore()
  const { currentUser, users } = store
  const [rows, setRows] = useState<MaterialRow[]>([])
  const [fbText, setFbText] = useState("")
  const [attachImg, setAttachImg] = useState(false)
  const [attachVid, setAttachVid] = useState(false)
  
  const [isRollback, setIsRollback] = useState(false)
  const [rollbackRole, setRollbackRole] = useState<"installer" | "splicer">("installer")
  const [rollbackAssignee, setRollbackAssignee] = useState<string>("dispatcher")

  useEffect(() => {
    if (tx) setRows(tx.materials.length ? tx.materials : [])
  }, [tx])

  if (!tx) return null

  const installers = users.filter((u) => u.role === "installer")
  const splicers = users.filter((u) => u.role === "splicer")
  const canAssign = currentUser.role === "dispatcher" || currentUser.role === "supervisor"

  const isMyInstall = currentUser.role === "installer" && tx.assignedInstallerId === currentUser.id
  const isMySplice = currentUser.role === "splicer" && tx.assignedSplicerId === currentUser.id

  const feedbackOptions =
    currentUser.role === "installer"
      ? INSTALLER_FEEDBACK_OPTIONS
      : currentUser.role === "splicer"
        ? SPLICER_FEEDBACK_OPTIONS
        : []

  function addRow() {
    setRows((r) => [...r, { id: `M-${Date.now()}`, name: "", quantity: 0, unit: "متر" }])
  }
  function updateRow(id: string, patch: Partial<MaterialRow>) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }
  function removeRow(id: string) {
    setRows((r) => r.filter((x) => x.id !== id))
  }
  function saveMaterials() {
    store.submitMaterials(tx!.id, rows.filter((r) => r.name.trim()))
  }

  function sendFeedback() {
    if (!fbText.trim()) return
    const attachments: { type: "image" | "video"; label: string }[] = []
    if (attachImg) attachments.push({ type: "image", label: "صورة الموقع" })
    if (attachVid) attachments.push({ type: "video", label: "فيديو توضيحي" })
    const kind =
      currentUser.role === "supervisor"
        ? "supervisor"
        : fbText.startsWith("لا يوجد مشاكل")
          ? "info"
          : "issue"
    store.addFeedback(tx!.id, fbText, kind, attachments.length ? attachments : undefined)
    
    if (currentUser.role === "supervisor" && isRollback) {
      store.rollbackTransaction(tx!.id, rollbackRole, rollbackAssignee)
    }

    setFbText("")
    setAttachImg(false)
    setAttachVid(false)
    setIsRollback(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="z-[2000] max-h-[92vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="font-mono text-lg">{tx.id}</DialogTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {tx.customerName} — {tx.month} — {tx.service}
              </p>
            </div>
            <StatusBadge status={tx.status} />
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex max-h-[calc(92vh-80px)] flex-col">
          <TabsList className="mx-4 mt-3 grid w-auto grid-cols-4">
            <TabsTrigger value="details">التفاصيل</TabsTrigger>
            <TabsTrigger value="materials">الكميات</TabsTrigger>
            <TabsTrigger value="feedback">
              الفيدباك {tx.feedback.length > 0 && `(${tx.feedback.length})`}
            </TabsTrigger>
            <TabsTrigger value="history">السجل</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto p-4">
            {/* التفاصيل */}
            <TabsContent value="details" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <DetailRow icon={User} label="اسم المشترك" value={tx.customerName} />
                <DetailRow icon={Phone} label="رقم التواصل" value={tx.phone} />
                <DetailRow icon={IdCard} label="الرقم الوطني" value={tx.nationalId} />
                <DetailRow icon={MapPin} label="المنطقة" value={tx.area} />
                <DetailRow icon={Wifi} label="نوع الخدمة" value={tx.service} />
                <DetailRow icon={Calendar} label="الشهر" value={tx.month} />
                <DetailRow icon={Router} label="نوع الجهاز المتفق عليه" value={tx.deviceType || "—"} />
                <DetailRow icon={Gauge} label="السرعة المتفق عليها" value={tx.speed || "—"} />
              </div>

              {/* موقع التركيب */}
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-primary" /> موقع التركيب الدقيق
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${tx.lat},${tx.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  فتح في خرائط جوجل
                </a>
              </div>

              {/* صورة العقد */}
              {tx.contractImage && (
                <div className="space-y-1.5 rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <FileImage className="h-4 w-4 text-primary" /> صورة العقد الموقّع
                  </div>
                  <a href={tx.contractImage} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tx.contractImage || "/placeholder.svg"}
                      alt={`صورة عقد ${tx.customerName}`}
                      className="max-h-56 w-full rounded-md border border-border object-cover"
                    />
                  </a>
                </div>
              )}

              {/* باركود الجهاز */}
              <DeviceScanSection tx={tx} />

              {/* الإسناد */}
              <div className="space-y-2 rounded-lg border border-border p-3">
                <h4 className="text-sm font-semibold">الإسناد</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">فني المد</Label>
                    {canAssign ? (
                      <Select
                        value={tx.assignedInstallerId ?? ""}
                        onValueChange={(v) => store.assignInstaller(tx.id, v)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="اختر فني المد" />
                        </SelectTrigger>
                        <SelectContent>
                          {installers.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                        {users.find((u) => u.id === tx.assignedInstallerId)?.name ?? "غير مُسند"}
                      </div>
                    )}
                  </div>
                  {tx.status !== "new" && (
                    <div className="space-y-1">
                      <Label className="text-xs">فني اللحام</Label>
                      {canAssign ? (
                        <Select
                          value={tx.assignedSplicerId ?? ""}
                          onValueChange={(v) => store.assignSplicer(tx.id, v)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="اختر فني اللحام" />
                          </SelectTrigger>
                          <SelectContent>
                            {splicers.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                          {users.find((u) => u.id === tx.assignedSplicerId)?.name ?? "غير مُسند"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* بيانات التفعيل */}
              {tx.activation && (
                <div className="space-y-1.5 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Zap className="h-4 w-4" /> بيانات التفعيل (من نظام الشركة)
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="rounded bg-card px-2 py-1.5">
                      <span className="text-muted-foreground">Username: </span>
                      {tx.activation.username}
                    </div>
                    <div className="rounded bg-card px-2 py-1.5">
                      <span className="text-muted-foreground">Password: </span>
                      {tx.activation.password}
                    </div>
                  </div>
                  {tx.activation.online && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      <span className="h-2 w-2 rounded-full bg-green-500" /> الاشتراك Online
                    </div>
                  )}
                </div>
              )}

              <WorkflowActions tx={tx} />
            </TabsContent>

            {/* الكميات */}
            <TabsContent value="materials" className="mt-0 space-y-3">
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="p-2 text-right font-medium">المادة</th>
                      <th className="p-2 text-right font-medium">الكمية</th>
                      <th className="p-2 text-right font-medium">الوحدة</th>
                      {isMyInstall && <th className="w-10 p-2" />}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          لا توجد كميات مُدخلة
                        </td>
                      </tr>
                    )}
                    {rows.map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="p-1.5">
                          <Input
                            disabled={!isMyInstall}
                            value={r.name}
                            onChange={(e) => updateRow(r.id, { name: e.target.value })}
                            placeholder="اسم المادة"
                            className="h-8 border-0 bg-transparent"
                          />
                        </td>
                        <td className="p-1.5">
                          <Input
                            disabled={!isMyInstall}
                            type="number"
                            value={r.quantity}
                            onChange={(e) => updateRow(r.id, { quantity: Number(e.target.value) })}
                            className="h-8 w-24 border-0 bg-transparent"
                          />
                        </td>
                        <td className="p-1.5">
                          <Input
                            disabled={!isMyInstall}
                            value={r.unit}
                            onChange={(e) => updateRow(r.id, { unit: e.target.value })}
                            className="h-8 w-24 border-0 bg-transparent"
                          />
                        </td>
                        {isMyInstall && (
                          <td className="p-1.5">
                            <Button size="icon" variant="ghost" onClick={() => removeRow(r.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {isMyInstall && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addRow}>
                    <Plus className="h-4 w-4" /> إضافة مادة
                  </Button>
                  <Button size="sm" onClick={saveMaterials}>
                    <Check className="h-4 w-4" /> حفظ الكميات
                  </Button>
                </div>
              )}
              {!isMyInstall && (
                <p className="text-xs text-muted-foreground">
                  إدخال الكميات متاح لفني المد المُسند لهذه المهمة فقط.
                </p>
              )}
            </TabsContent>

            {/* الفيدباك */}
            <TabsContent value="feedback" className="mt-0 space-y-3">
              <div className="space-y-2">
                {tx.feedback.length === 0 && (
                  <p className="text-sm text-muted-foreground">لا يوجد ملاحظات بعد.</p>
                )}
                {tx.feedback.map((f) => (
                  <div
                    key={f.id}
                    className={`rounded-lg border p-3 ${
                      f.kind === "issue"
                        ? "border-destructive/30 bg-destructive/5"
                        : f.kind === "supervisor"
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        {f.kind === "issue" && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                        {f.byName}
                        <span className="font-normal text-muted-foreground">({ROLE_LABELS[f.role]})</span>
                      </div>
                      {f.resolved && (
                        <span className="text-xs font-semibold text-green-600">تمت المعالجة</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{f.message}</p>
                    {f.attachments && f.attachments.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {f.attachments.map((a, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
                          >
                            {a.type === "image" ? (
                              <ImageIcon className="h-3.5 w-3.5" />
                            ) : (
                              <Video className="h-3.5 w-3.5" />
                            )}
                            {a.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {currentUser.role === "supervisor" && f.kind === "issue" && !f.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7"
                        onClick={() => store.resolveFeedback(tx.id, f.id)}
                      >
                        <CircleCheck className="h-3.5 w-3.5" /> تعليم كمُعالجة
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* إضافة فيدباك */}
              {(currentUser.role === "installer" ||
                currentUser.role === "splicer" ||
                currentUser.role === "supervisor") && (
                <div className="space-y-2 rounded-lg border border-border p-3">
                  <h4 className="text-sm font-semibold">إضافة ملاحظة / فيدباك</h4>
                  {feedbackOptions.length > 0 ? (
                    <Select value={fbText} onValueChange={setFbText}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفيدباك" />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackOptions.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={fbText}
                      onChange={(e) => setFbText(e.target.value)}
                      placeholder="اكتب ملاحظة المشرف (تحديد أعمدة / مسار حفر / طريقة مد...)"
                    />
                  )}
                  {currentUser.role === "supervisor" && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={attachImg ? "default" : "outline"}
                          onClick={() => setAttachImg((v) => !v)}
                        >
                          <ImageIcon className="h-4 w-4" /> إرفاق صورة
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={attachVid ? "default" : "outline"}
                          onClick={() => setAttachVid((v) => !v)}
                        >
                          <Video className="h-4 w-4" /> إرفاق فيديو
                        </Button>
                      </div>

                      <div className="mt-4 space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-destructive cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isRollback} 
                            onChange={e => setIsRollback(e.target.checked)} 
                            className="h-4 w-4 rounded border-destructive text-destructive focus:ring-destructive" 
                          />
                          إرجاع المعاملة لمرحلة سابقة
                        </label>
                        {isRollback && (
                          <div className="grid gap-3 pl-6">
                            <div className="space-y-1">
                              <Label className="text-xs">إرجاع المعاملة لـ:</Label>
                              <Select value={rollbackRole} onValueChange={(v: "installer" | "splicer") => setRollbackRole(v)}>
                                <SelectTrigger className="h-8 bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="installer">فني المد</SelectItem>
                                  <SelectItem value="splicer">فني اللحام</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">المسؤول عن التنفيذ:</Label>
                              <Select value={rollbackAssignee} onValueChange={setRollbackAssignee}>
                                <SelectTrigger className="h-8 bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dispatcher">إعادتها لموزع المعاملات لاختيار الفني</SelectItem>
                                  {(rollbackRole === "installer" ? installers : splicers).map((u) => (
                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <Button size="sm" onClick={sendFeedback} disabled={!fbText.trim()}>
                    <Send className="h-4 w-4" /> إرسال
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* السجل */}
            <TabsContent value="history" className="mt-0">
              <ol className="relative space-y-3 border-r border-border pr-4">
                {[...tx.history].reverse().map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -right-[21px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                    <div className="text-sm font-medium">{h.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {h.byName} — {new Date(h.at).toLocaleString("ar-JO")}
                    </div>
                  </li>
                ))}
              </ol>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function DeviceScanSection({ tx }: { tx: Transaction }) {
  const store = useStore()
  const { currentUser } = store
  const [code, setCode] = useState("")
  const [scanning, setScanning] = useState(false)

  // يحق لفني المد المُسند (أو فني اللحام المُسند) مسح باركود الجهاز لإخراجه من العهدة
  const canScan =
    !tx.deviceScan &&
    ((currentUser.role === "installer" && tx.assignedInstallerId === currentUser.id) ||
      (currentUser.role === "splicer" && tx.assignedSplicerId === currentUser.id))

  function simulateScan() {
    setScanning(true)
    setTimeout(() => {
      const generated = `SN-${Math.floor(100000000000 + Math.random() * 899999999999)}`
      store.scanDevice(tx.id, generated)
      setScanning(false)
    }, 900)
  }

  function manualSubmit() {
    if (!code.trim()) return
    store.scanDevice(tx.id, code.trim())
    setCode("")
  }

  // إذا تم المسح: عرض للجميع
  if (tx.deviceScan) {
    return (
      <div className="space-y-1.5 rounded-lg border border-green-600/30 bg-green-50 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
          <PackageCheck className="h-4 w-4" /> الجهاز خرج من العهدة (تم مسح الباركود)
        </div>
        <div className="rounded bg-card px-2 py-1.5 font-mono text-xs">
          <span className="text-muted-foreground">Barcode / SN: </span>
          {tx.deviceScan.barcode}
        </div>
        <div className="text-xs text-muted-foreground">
          مُسجّل بواسطة {tx.deviceScan.scannedByName} •{" "}
          {new Date(tx.deviceScan.at).toLocaleString("ar-JO")}
        </div>
      </div>
    )
  }

  // إذا لم يتم المسح بعد ولا يحق للمستخدم المسح: عرض حالة فقط
  if (!canScan) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        <ScanLine className="h-4 w-4" /> لم يتم مسح باركود الجهاز بعد
      </div>
    )
  }

  // واجهة المسح للفني
  return (
    <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <ScanLine className="h-4 w-4" /> مسح باركود الجهاز (إخراج من عهدة الفني)
      </div>
      <p className="text-xs text-muted-foreground">
        امسح باركود الجهاز المركّب لدى العميل لإخراجه من عهدتك وربطه بالمشترك.
      </p>
      <Button className="w-full gap-2" onClick={simulateScan} disabled={scanning}>
        <ScanLine className="h-4 w-4" />
        {scanning ? "جارٍ المسح..." : "مسح بالكاميرا"}
      </Button>
      <div className="flex items-center gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="أو أدخل الرقم التسلسلي يدوياً"
          className="h-9"
        />
        <Button variant="outline" className="shrink-0 bg-transparent" onClick={manualSubmit} disabled={!code.trim()}>
          تسجيل
        </Button>
      </div>
    </div>
  )
}

function WorkflowActions({ tx }: { tx: Transaction }) {
  const store = useStore()
  const { currentUser } = store

  const isMyInstall = currentUser.role === "installer" && tx.assignedInstallerId === currentUser.id
  const isMySplice = currentUser.role === "splicer" && tx.assignedSplicerId === currentUser.id

  if (isMyInstall && tx.status === "new") {
    return (
      <div className="space-y-1.5">
        <Button className="w-full" disabled={!tx.deviceScan} onClick={() => store.completeInstall(tx.id)}>
          <Wrench className="h-4 w-4" /> إنهاء المد - تحويل إلى تم (Done)
        </Button>
        {!tx.deviceScan && (
          <p className="text-center text-xs text-muted-foreground">
            يجب مسح باركود الجهاز أولاً قبل إنهاء المد.
          </p>
        )}
      </div>
    )
  }
  if (isMySplice && tx.status === "laid") {
    return (
      <Button className="w-full" onClick={() => store.completeSplice(tx.id)}>
        <Zap className="h-4 w-4" /> إنهاء اللحام - تحويل إلى تم (Done)
      </Button>
    )
  }
  if (currentUser.role === "activator" && tx.status === "spliced") {
    return (
      <Button className="w-full" onClick={() => store.activateService(tx.id)}>
        <Wifi className="h-4 w-4" /> سحب بيانات التفعيل وتحويل إلى Online
      </Button>
    )
  }
  if (currentUser.role === "supervisor" && tx.status === "activated") {
    return (
      <Button className="w-full bg-green-600 text-white hover:bg-green-700" onClick={() => store.approveFinal(tx.id)}>
        <ShieldCheck className="h-4 w-4" /> الكشف النهائي والموافقة
      </Button>
    )
  }
  if (tx.status === "approved") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-green-600/30 bg-green-50 p-3 text-sm font-semibold text-green-700">
        <ShieldCheck className="h-4 w-4" /> مكتملة - تمت الموافقة النهائية
      </div>
    )
  }
  return null
}
