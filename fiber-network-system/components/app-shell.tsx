"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { navForRole, defaultViewForRole, visibleTransactions, type ViewKey } from "@/lib/permissions"
import { RoleSwitcher } from "@/components/role-switcher"
import { OverviewView } from "@/components/views/overview-view"
import { MapView } from "@/components/views/map-view"
import { TransactionsView } from "@/components/views/transactions-view"
import { NewContractView } from "@/components/views/new-contract-view"
import { NotificationsView } from "@/components/views/notifications-view"
import { AreaPrepView } from "@/components/views/area-prep-view"
import { ReportsView } from "@/components/views/reports-view"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Map,
  ListChecks,
  FilePlus2,
  Bell,
  HardHat,
  FileSpreadsheet,
  Menu,
  Cable,
  Presentation,
} from "lucide-react"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Map,
  ListChecks,
  FilePlus2,
  Bell,
  HardHat,
  FileSpreadsheet,
}

export function AppShell() {
  const { currentUser, notifications, transactions } = useStore()
  const nav = useMemo(() => navForRole(currentUser.role), [currentUser.role])
  const [view, setView] = useState<ViewKey>(() => defaultViewForRole(currentUser.role))
  const [mobileOpen, setMobileOpen] = useState(false)

  // عند تبديل الدور، إن لم تعد الشاشة الحالية متاحة، ارجع للافتراضية
  useEffect(() => {
    if (!nav.some((n) => n.key === view)) {
      setView(defaultViewForRole(currentUser.role))
    }
  }, [nav, view, currentUser.role])

  const unread = notifications.filter((n) => n.forRole === currentUser.role && !n.read).length
  const myVisible = visibleTransactions(currentUser, transactions).length

  function renderView() {
    switch (view) {
      case "overview":
        return <OverviewView />
      case "map":
        return <MapView />
      case "transactions":
        return <TransactionsView />
      case "new-contract":
        return <NewContractView onCreated={() => setView("transactions")} />
      case "notifications":
        return <NotificationsView />
      case "area-prep":
        return <AreaPrepView />
      case "reports":
        return <ReportsView />
      default:
        return <OverviewView />
    }
  }

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const Icon = ICONS[item.icon] ?? LayoutDashboard
        const active = view === item.key
        return (
          <button
            key={item.key}
            onClick={() => {
              setView(item.key)
              onNavigate?.()
            }}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <span className="flex items-center gap-3">
              <Icon className="size-4 shrink-0" />
              {item.label}
            </span>
            {item.key === "notifications" && unread > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )

  const Brand = () => (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Cable className="size-5" />
      </div>
      <div className="leading-tight">
        <div className="font-bold text-sidebar-foreground">FiberFlow</div>
        <div className="text-xs text-sidebar-foreground/60">إدارة شبكة الألياف</div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 bg-sidebar p-4 lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto rounded-lg bg-sidebar-accent/50 p-3 text-xs text-sidebar-foreground/70">
          <p className="font-semibold text-sidebar-foreground">{currentUser.name}</p>
          <p>المعاملات المتاحة لك: {myVisible}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">القائمة</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-sidebar p-4">
                <SheetTitle className="sr-only">القائمة</SheetTitle>
                <div className="flex flex-col gap-6">
                  <Brand />
                  <NavList onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-base font-bold sm:text-lg">{nav.find((n) => n.key === view)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden gap-1.5 bg-transparent sm:inline-flex">
              <Link href="/presentation">
                <Presentation className="size-4" /> العرض التقديمي
              </Link>
            </Button>
            <RoleSwitcher />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{renderView()}</main>
      </div>
    </div>
  )
}
