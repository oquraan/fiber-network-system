"use client"

import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from "react-leaflet"
import { AREA_BOUNDARY, AREA_CENTER } from "@/lib/mock-data"
import { STATUS_COLORS, STATUS_LABELS, type Transaction } from "@/lib/types"

function pinIcon(color: string) {
  return L.divIcon({
    className: "fiber-pin",
    html: `<span style="background:${color}"><b></b></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  })
}

function pickIcon() {
  return L.divIcon({
    className: "fiber-pin",
    html: `<span style="background:#111827"><b>+</b></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  })
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface FiberMapProps {
  transactions: Transaction[]
  onSelectTx?: (tx: Transaction) => void
  picking?: boolean
  pickedPoint?: { lat: number; lng: number } | null
  onPick?: (lat: number, lng: number) => void
}

export default function FiberMap({ transactions, onSelectTx, picking, pickedPoint, onPick }: FiberMapProps) {
  return (
    <MapContainer
      center={AREA_CENTER}
      zoom={15}
      scrollWheelZoom
      className="h-full w-full"
      style={{ minHeight: 400 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polygon
        positions={AREA_BOUNDARY}
        pathOptions={{ color: "#16a34a", weight: 2, fillColor: "#16a34a", fillOpacity: 0.08 }}
      />

      {transactions.map((tx) => (
        <Marker
          key={tx.id}
          position={[tx.lat, tx.lng]}
          icon={pinIcon(STATUS_COLORS[tx.status])}
          eventHandlers={{ click: () => onSelectTx?.(tx) }}
        >
          <Popup>
            <div className="space-y-1 text-right">
              <div className="font-bold text-sm">{tx.id}</div>
              <div className="text-xs">{tx.customerName}</div>
              <div className="text-xs text-muted-foreground">{tx.area}</div>
              <div
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                style={{ background: STATUS_COLORS[tx.status] }}
              >
                {STATUS_LABELS[tx.status]}
              </div>
              <button
                onClick={() => onSelectTx?.(tx)}
                className="mt-2 block w-full rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground"
              >
                فتح بطاقة المعاملة
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {picking && onPick && <ClickHandler onPick={onPick} />}
      {pickedPoint && <Marker position={[pickedPoint.lat, pickedPoint.lng]} icon={pickIcon()} />}
    </MapContainer>
  )
}
