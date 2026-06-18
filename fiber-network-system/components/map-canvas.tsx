"use client"

import dynamic from "next/dynamic"
import type { Transaction } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

const FiberMap = dynamic(() => import("./fiber-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-muted">
      <Spinner className="size-6" />
      <span className="ms-2 text-sm text-muted-foreground">جارٍ تحميل الخريطة...</span>
    </div>
  ),
})

interface MapCanvasProps {
  transactions: Transaction[]
  onSelectTx?: (tx: Transaction) => void
  picking?: boolean
  pickedPoint?: { lat: number; lng: number } | null
  onPick?: (lat: number, lng: number) => void
}

export function MapCanvas(props: MapCanvasProps) {
  return <FiberMap {...props} />
}
