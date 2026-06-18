"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { SLIDES, type Slide } from "@/lib/slides"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Network,
  Map,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Users,
  Workflow,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Wrench,
  Cable,
  Zap,
  FileSignature,
} from "lucide-react"

const KIND_ICON: Record<Slide["kind"], typeof Network> = {
  title: Network,
  concept: Map,
  problem: AlertTriangle,
  market: TrendingUp,
  uvp: Sparkles,
  founders: Users,
  how: Workflow,
  thanks: Network,
}

const STEP_ICONS = [FileSignature, MapPin, Wrench, Cable, Zap]

export function SlideDeck() {
  const [index, setIndex] = useState(0)
  const total = SLIDES.length
  const slide = SLIDES[index]

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => Math.min(total - 1, Math.max(0, i + dir)))
    },
    [total],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // RTL: السهم الأيسر = التالي، الأيمن = السابق
      if (e.key === "ArrowLeft" || e.key === "PageDown" || e.key === " ") go(1)
      if (e.key === "ArrowRight" || e.key === "PageUp") go(-1)
      if (e.key === "Home") setIndex(0)
      if (e.key === "End") setIndex(total - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go, total])

  const Icon = KIND_ICON[slide.kind]

  return (
    <div className="flex min-h-screen flex-col bg-sidebar text-sidebar-foreground">
      {/* الشريط العلوي */}
      <header className="flex items-center justify-between border-b border-sidebar-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Network className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold">FiberFlow · العرض التقديمي</span>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> العودة للتطبيق
          </Link>
        </Button>
      </header>

      {/* الشريحة */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-sidebar-border bg-card text-card-foreground shadow-2xl">
          <SlideContent slide={slide} Icon={Icon} />
        </div>
      </main>

      {/* أدوات التنقل */}
      <footer className="flex items-center justify-between gap-4 border-t border-sidebar-border px-4 py-3 sm:px-6">
        <Button
          variant="secondary"
          size="sm"
          className="gap-1"
          onClick={() => go(-1)}
          disabled={index === 0}
        >
          <ChevronRight className="h-4 w-4" /> السابق
        </Button>

        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`الانتقال إلى الشريحة ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-sidebar-primary" : "w-2 bg-sidebar-border hover:bg-sidebar-accent"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-sidebar-foreground/70">
            {index + 1} / {total}
          </span>
          <Button size="sm" className="gap-1" onClick={() => go(1)} disabled={index === total - 1}>
            التالي <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  )
}

function SlideContent({ slide, Icon }: { slide: Slide; Icon: typeof Network }) {
  // شريحة الغلاف وشريحة الشكر
  if (slide.kind === "title" || slide.kind === "thanks") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-sidebar p-8 text-center text-sidebar-foreground">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg">
          <Network className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <h1 className="text-balance text-5xl font-black tracking-tight sm:text-6xl">{slide.title}</h1>
          {slide.subtitle && (
            <p className="text-balance text-xl font-medium text-sidebar-primary sm:text-2xl">{slide.subtitle}</p>
          )}
          {slide.body && (
            <p className="mx-auto max-w-xl text-pretty text-base text-sidebar-foreground/70">{slide.body}</p>
          )}
        </div>
        {slide.kind === "thanks" && (
          <div className="mt-2 flex items-center gap-2 rounded-full bg-sidebar-accent px-5 py-2 text-sm font-semibold text-sidebar-accent-foreground">
            <CheckCircle2 className="h-4 w-4" /> انضمّوا إلينا الآن
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-8 sm:p-12">
      {/* العنوان */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          {slide.eyebrow && (
            <span className="text-sm font-bold uppercase tracking-wider text-primary">{slide.eyebrow}</span>
          )}
          <h2 className="text-balance text-3xl font-black leading-tight sm:text-4xl">{slide.title}</h2>
        </div>
      </div>

      {slide.body && (
        <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {slide.body}
        </p>
      )}

      {/* الإحصائيات */}
      {slide.stats && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          {slide.stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-muted/40 p-4 text-center">
              <div className="text-3xl font-black text-primary sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* النقاط */}
      {slide.bullets && (
        <div
          className={`mt-6 grid flex-1 content-start gap-3 ${
            slide.kind === "how" || slide.bullets.length > 3 ? "sm:grid-cols-2" : "sm:grid-cols-1"
          }`}
        >
          {slide.bullets.map((b, i) => {
            const StepIcon = slide.kind === "how" ? STEP_ICONS[i] ?? CheckCircle2 : CheckCircle2
            return (
              <div key={b.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <StepIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold leading-snug">{b.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
