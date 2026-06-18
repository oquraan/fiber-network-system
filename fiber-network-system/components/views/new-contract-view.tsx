"use client"

import { useRef, useState } from "react"
import { useStore } from "@/lib/store"
import { MapCanvas } from "@/components/map-canvas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEVICE_TYPE_OPTIONS, SPEED_OPTIONS } from "@/lib/types"
import { MapPin, FileSignature, CircleCheck, Camera, X } from "lucide-react"

export function NewContractView({ onCreated }: { onCreated?: () => void }) {
  const store = useStore()
  const [customerName, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [service, setService] = useState("New Network Access")
  const [deviceType, setDeviceType] = useState(DEVICE_TYPE_OPTIONS[0])
  const [speed, setSpeed] = useState(SPEED_OPTIONS[2])
  const [contractImage, setContractImage] = useState<string | null>(null)
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null)
  const [created, setCreated] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const valid = customerName.trim() && phone.trim() && nationalId.trim() && point

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setContractImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  function submit() {
    if (!valid || !point) return
    const tx = store.createContract({
      customerName,
      phone,
      nationalId,
      service,
      deviceType,
      speed,
      contractImage: contractImage ?? undefined,
      area: "إربد / حي الصحة",
      lat: point.lat,
      lng: point.lng,
    })
    setCreated(tx.id)
    setName("")
    setPhone("")
    setNationalId("")
    setDeviceType(DEVICE_TYPE_OPTIONS[0])
    setSpeed(SPEED_OPTIONS[2])
    setContractImage(null)
    setPoint(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">إنشاء عقد جديد</h1>
        <p className="text-sm text-muted-foreground">
          أدخل بيانات العميل وحدّد الموقع المبدئي للتركيب على الخريطة. سيتم إصدار رقم اشتراك INT تلقائياً.
        </p>
      </div>

      {created && (
        <Card className="border-green-600/30 bg-green-50">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CircleCheck className="h-5 w-5" />
              <span className="text-sm font-semibold">
                تم إنشاء العقد بنجاح — رقم الاشتراك: <span className="font-mono">{created}</span> (دبوس أحمر - جاهز للتركيب)
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onCreated?.()}>
              عرض على الخريطة
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSignature className="h-4 w-4" /> بيانات العميل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>اسم المشترك</Label>
              <Input value={customerName} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>رقم التواصل</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xxxxxxxx" />
              </div>
              <div className="space-y-1">
                <Label>الرقم الوطني</Label>
                <Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="99xxxxxxxx" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>نوع الخدمة</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New Network Access">New Network Access</SelectItem>
                  <SelectItem value="Fiber Upgrade">Fiber Upgrade</SelectItem>
                  <SelectItem value="Business Line">Business Line</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>نوع الجهاز المتفق عليه</Label>
                <Select value={deviceType} onValueChange={setDeviceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVICE_TYPE_OPTIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>السرعة المتفق عليها</Label>
                <Select value={speed} onValueChange={setSpeed}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPEED_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>صورة العقد الموقّع</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFile}
              />
              {contractImage ? (
                <div className="relative overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={contractImage || "/placeholder.svg"} alt="صورة العقد الموقّع" className="h-40 w-full object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute left-2 top-2 h-7 w-7"
                    onClick={() => setContractImage(null)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">إزالة الصورة</span>
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center gap-2 border-dashed bg-transparent"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-4 w-4" /> التقاط / رفع صورة العقد
                </Button>
              )}
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-primary" /> الموقع المختار
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {point
                  ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
                  : "اضغط على الخريطة لتحديد موقع التركيب"}
              </div>
            </div>
            <Button className="w-full" disabled={!valid} onClick={submit}>
              توقيع العقد وإصدار رقم الاشتراك
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="h-[500px] w-full">
            <MapCanvas
              transactions={store.transactions}
              picking
              pickedPoint={point}
              onPick={(lat, lng) => setPoint({ lat, lng })}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
