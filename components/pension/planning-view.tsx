"use client"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BedDoubleIcon,
  CalendarAdd01Icon,
  ChartIncreaseIcon,
  Clock01Icon,
  Login03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import {
  dateOf,
  isWeekend,
  shortDate,
  TODAY,
  weekdayOf,
} from "@/components/calendar"
import {
  findFreeKennel,
  type Kennel,
  kennels,
  type Stay,
  stays as initialStays,
} from "@/components/pension/data"
import {
  kennelLabel,
  StaySheet,
  stayStatusMeta,
} from "@/components/pension/stay-sheet"
import { ActivityPage, Bar, Kpi, Widget } from "@/components/today/widgets"
import { Badge } from "@/components/ui/badge"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const DAYS = 14
const areas = ["Tous", "Chenil", "Chatterie"] as const
type Area = (typeof areas)[number]

const nightsOn = (list: Stay[], day: number) =>
  list.filter((s) => s.kennelId && s.arrival <= day && day < s.departure).length

function occupancyClass(ratio: number) {
  if (ratio >= 1) return "bg-orange-500 text-white"
  if (ratio >= 0.8) return "bg-pension text-pension-foreground"
  if (ratio >= 0.5) return "bg-pension/70"
  return "bg-pension/35"
}

function KennelRow({
  kennel,
  stays,
  start,
  onOpen,
}: {
  kennel: Kennel
  stays: Stay[]
  start: number
  onOpen: (id: string) => void
}) {
  const days = Array.from({ length: DAYS }, (_, i) => start + i)
  return (
    <div className="flex border-t">
      <div className="sticky start-0 z-10 flex w-28 shrink-0 items-center gap-2 border-e bg-card px-3 text-sm">
        <span className="font-medium">{kennelLabel(kennel.id)}</span>
      </div>
      <div className="relative h-10 flex-1">
        <div className="absolute inset-0 grid grid-cols-14">
          {days.map((day) => (
            <span
              className={cn(
                "border-e border-border/40",
                isWeekend(day) && "bg-muted/50",
                day === TODAY && "bg-orange-500/5"
              )}
              key={day}
            />
          ))}
        </div>
        {stays
          .filter((s) => s.kennelId === kennel.id)
          .map((s) => {
            const from = ((s.arrival - start + 0.5) / DAYS) * 100
            const to = ((s.departure - start + 0.5) / DAYS) * 100
            if (to <= 0 || from >= 100) return null
            const left = Math.max(from, 0)
            const right = Math.min(to, 100)
            return (
              <button
                className={cn(
                  "absolute inset-y-1.5 flex items-center gap-1 overflow-hidden rounded-md px-2 text-start text-xs font-medium transition-[filter] hover:brightness-95",
                  stayStatusMeta[s.status].bar,
                  from < 0 && "rounded-s-none",
                  to > 100 && "rounded-e-none"
                )}
                key={s.id}
                onClick={() => onOpen(s.id)}
                style={{
                  left: `calc(${left}% + 1px)`,
                  width: `calc(${right - left}% - 2px)`,
                }}
                title={`${s.pet} · ${shortDate(s.arrival)} → ${shortDate(s.departure)}`}
                type="button"
              >
                <span className="truncate">{s.pet}</span>
                <span className="truncate font-normal opacity-70 max-md:hidden">
                  {s.owner}
                </span>
              </button>
            )
          })}
        {start <= TODAY && TODAY < start + DAYS && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-orange-500"
            style={{ left: `${((TODAY - start + 0.5) / DAYS) * 100}%` }}
          />
        )}
      </div>
    </div>
  )
}

export function PlanningView() {
  const [stays, setStays] = useState(initialStays)
  const [start, setStart] = useState(0)
  const [area, setArea] = useState<Area>("Tous")
  const [openId, setOpenId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const days = Array.from({ length: DAYS }, (_, i) => start + i)
  const visible = kennels.filter((k) => area === "Tous" || k.area === area)
  const capacity = kennels.length
  const tonight = nightsOn(stays, TODAY)
  const average =
    days.reduce((sum, day) => sum + nightsOn(stays, day), 0) / (DAYS * capacity)
  const arrivals = stays.filter(
    (s) => s.status !== "pending" && s.arrival >= TODAY && s.arrival < TODAY + 7
  ).length
  const pending = stays.filter((s) => s.status === "pending")
  const unplaced = pending.filter((s) => !s.kennelId)
  const openStay = stays.find((s) => s.id === openId) ?? null

  const open = (id: string) => {
    setOpenId(id)
    setSheetOpen(true)
  }
  const update = (id: string, patch: Partial<Stay>) =>
    setStays((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)))

  return (
    <ActivityPage
      actions={
        <NewStayDialog
          onCreate={(stay) => setStays((list) => [...list, stay])}
          trigger={
            <Button size="sm">
              <HugeiconsIcon icon={CalendarAdd01Icon} />
              Nouveau séjour
            </Button>
          }
        />
      }
      activity="Pension"
      className="max-w-7xl"
      title="Planning des box"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={BedDoubleIcon}
          label="Cette nuit"
          value={
            <>
              {tonight}
              <span className="text-base text-muted-foreground">
                {" "}
                / {capacity}
              </span>
            </>
          }
        >
          <Bar
            className="bg-pension-strong"
            label="Occupation cette nuit"
            value={(tonight / capacity) * 100}
          />
          <p className="mt-1.5">{capacity - tonight} places libres ce soir</p>
        </Kpi>
        <Kpi
          icon={ChartIncreaseIcon}
          label="Occupation moyenne"
          value={`${Math.round(average * 100)} %`}
        >
          Du {shortDate(start)} au {shortDate(start + DAYS - 1)}
        </Kpi>
        <Kpi icon={Login03Icon} label="Arrivées sur 7 jours" value={arrivals}>
          Dont {stays.filter((s) => s.arrival === TODAY).length}{" "}
          aujourd&apos;hui
        </Kpi>
        <Kpi icon={Clock01Icon} label="À confirmer" value={pending.length}>
          {unplaced.length > 0
            ? `${unplaced.length} demande à placer`
            : "Toutes les demandes sont placées"}
        </Kpi>
      </div>

      {unplaced.length > 0 && (
        <Widget
          description="Demandes reçues sans box attribué"
          title="À placer"
        >
          <ul className="divide-y">
            {unplaced.map((s) => {
              const free = findFreeKennel(stays, s)
              return (
                <li
                  className="flex flex-wrap items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  key={s.id}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{s.pet}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {s.breed} · {s.owner}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shortDate(s.arrival)} → {shortDate(s.departure)} ·{" "}
                      {s.departure - s.arrival} nuits
                      {s.options.length > 0 && ` · ${s.options.join(", ")}`}
                    </p>
                  </div>
                  <Button onClick={() => open(s.id)} size="xs" variant="ghost">
                    Détails
                  </Button>
                  {free ? (
                    <Button
                      onClick={() => update(s.id, { kennelId: free.id })}
                      size="xs"
                      variant="outline"
                    >
                      Placer dans {kennelLabel(free.id)}
                    </Button>
                  ) : (
                    <Badge variant="error">Complet sur ces dates</Badge>
                  )}
                </li>
              )
            })}
          </ul>
        </Widget>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            aria-label="Semaine précédente"
            disabled={start <= -7}
            onClick={() => setStart(start - 7)}
            size="icon-sm"
            variant="outline"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <Button
            aria-label="Semaine suivante"
            disabled={start >= 7}
            onClick={() => setStart(start + 7)}
            size="icon-sm"
            variant="outline"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
          <Button
            disabled={start === 0}
            onClick={() => setStart(0)}
            size="sm"
            variant="outline"
          >
            Aujourd&apos;hui
          </Button>
        </div>
        <span className="text-sm font-medium">
          {dateOf(start).day} {dateOf(start).month} –{" "}
          {dateOf(start + DAYS - 1).day} {dateOf(start + DAYS - 1).month}
        </span>
        <Tabs
          className="ms-auto"
          onValueChange={(value) => setArea(value as Area)}
          value={area}
        >
          <TabsList size="sm">
            {areas.map((a) => (
              <TabsTab key={a} value={a}>
                {a}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="flex">
              <div className="sticky start-0 z-10 w-28 shrink-0 border-e bg-card" />
              <div className="grid flex-1 grid-cols-14">
                {days.map((day) => (
                  <div
                    className={cn(
                      "flex flex-col items-center gap-0.5 border-e border-border/40 py-2 text-xs",
                      isWeekend(day) && "bg-muted/50"
                    )}
                    key={day}
                  >
                    <span className="text-muted-foreground">
                      {weekdayOf(day)}
                    </span>
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full font-medium tabular-nums",
                        day === TODAY && "bg-orange-500 text-white"
                      )}
                    >
                      {dateOf(day).day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex border-t">
              <div className="sticky start-0 z-10 flex w-28 shrink-0 items-center border-e bg-card px-3 text-xs text-muted-foreground">
                Occupation
              </div>
              <div className="grid flex-1 grid-cols-14 gap-px p-1">
                {days.map((day) => {
                  const count = nightsOn(stays, day)
                  return (
                    <span
                      className={cn(
                        "rounded py-1 text-center text-[0.6875rem] font-medium tabular-nums",
                        occupancyClass(count / capacity)
                      )}
                      key={day}
                      title={`${count} animaux sur ${capacity} places`}
                    >
                      {count}
                    </span>
                  )
                })}
              </div>
            </div>
            {(["Chenil", "Chatterie"] as const)
              .filter((a) => area === "Tous" || area === a)
              .map((a) => (
                <div key={a}>
                  <div className="sticky start-0 border-t bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {a} · {visible.filter((k) => k.area === a).length} places
                  </div>
                  {visible
                    .filter((k) => k.area === a)
                    .map((kennel) => (
                      <KennelRow
                        kennel={kennel}
                        key={kennel.id}
                        onOpen={open}
                        start={start}
                        stays={stays}
                      />
                    ))}
                </div>
              ))}
          </div>
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {(Object.keys(stayStatusMeta) as Stay["status"][]).map((status) => (
          <li className="flex items-center gap-1.5" key={status}>
            <span
              className={cn("h-2.5 w-5 rounded-sm", stayStatusMeta[status].bar)}
            />
            {stayStatusMeta[status].label}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-orange-500" />
          Aujourd&apos;hui
        </li>
      </ul>

      <StaySheet
        onConfirm={(id) => {
          update(id, { status: "upcoming" })
          setSheetOpen(false)
        }}
        onDecline={(id) => {
          setStays((list) => list.filter((s) => s.id !== id))
          setSheetOpen(false)
        }}
        onOpenChange={setSheetOpen}
        open={sheetOpen}
        stay={openStay}
      />
    </ActivityPage>
  )
}
