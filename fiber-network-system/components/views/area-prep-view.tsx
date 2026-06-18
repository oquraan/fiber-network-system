"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Power, PowerOff, Plus, HardHat, AlertCircle } from "lucide-react"

export function AreaPrepView() {
  const { areas, toggleAreaStage, toggleDbPower, addDbSplitter } = useStore()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">تجهيز المنطقة</h1>
        <p className="text-sm text-muted-foreground">
          مراحل تجهيز المنطقة قبل الخدمة وإدارة الـ DBs والـ Power
        </p>
      </div>

      {areas.map((area) => {
        const doneStages = area.stages.filter((s) => s.done).length
        const pct = Math.round((doneStages / area.stages.length) * 100)
        const noPower = area.dbs.filter((d) => !d.hasPower).length
        return (
          <div key={area.id} className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <HardHat className="h-4 w-4 text-primary" /> {area.name}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">{pct}%</span>
                </CardTitle>
                <Progress value={pct} className="h-2" />
              </CardHeader>
              <CardContent className="space-y-2">
                {area.stages.map((s) => (
                  <label
                    key={s.key}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/40"
                  >
                    <Checkbox checked={s.done} onCheckedChange={() => toggleAreaStage(area.id, s.key)} />
                    <span className={`text-sm ${s.done ? "text-muted-foreground line-through" : "font-medium"}`}>
                      {s.label}
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>صناديق التوزيع (DBs)</span>
                  {noPower > 0 && (
                    <span className="flex items-center gap-1 text-xs font-normal text-destructive">
                      <AlertCircle className="h-3.5 w-3.5" /> {noPower} بدون Power
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {area.dbs.map((db) => (
                  <div
                    key={db.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono text-sm font-semibold">
                        {db.name}
                        {db.full && (
                          <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                            FULL
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">عدد الـ Splitters: {db.splitterCount}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={db.hasPower ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => toggleDbPower(area.id, db.id)}
                      >
                        {db.hasPower ? (
                          <>
                            <Power className="h-4 w-4 text-green-600" /> Power
                          </>
                        ) : (
                          <>
                            <PowerOff className="h-4 w-4" /> لا يوجد Power
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addDbSplitter(area.id, db.id)}>
                        <Plus className="h-4 w-4" /> Splitter
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
