"use client"

import { AgendaToolbar, type AgendaView } from "@/components/agenda/agenda"
import {
  CalendarAdd01Icon,
  Login03Icon,
  Logout03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import {
  dateOf,
  isWeekend,
  longDate,
  shortDate,
  TODAY,
  weekdayOf,
} from "@/components/calendar"
import {
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
import { stayRequests } from "@/components/pension/requests"
import {
  ActivityPage,
  AttentionList,
  Section,
} from "@/components/today/widgets"
import { Badge } from "@/components/ui/badge"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const DAYS = 7
const FIRST = -7
const LAST = 13
const areas = ["Tous", "Chenil", "Chatterie"] as const
type Area = (typeof areas)[number]

const nightsOn = (list: Stay[], day: number) =>
  list.filter((s) => s.kennelId && s.arrival <= day && day < s.departure).length

const stayOn = (list: Stay[], kennelId: string, day: number) =>
  list.find(
    (s) => s.kennelId === kennelId && s.arrival <= day && day < s.departure
  )

function occupancyClass(ratio: number) {
  if (ratio >= 1) return "bg-control text-control-foreground"
  if (ratio >= 0.8) return "bg-pension text-pension-foreground"
  if (ratio >= 0.5) return "bg-pension/60 text-pension-foreground"
  return "bg-muted text-muted-foreground"
}

function KennelRow({
  kennel,
  stays,
  start,
  onOpen,
  onBook,
}: {
  kennel: Kennel
  stays: Stay[]
  start: number
  onOpen: (id: string) => void
  onBook: (day: number) => void
}) {
  const days = Array.from({ length: DAYS }, (_, i) => start + i)
  return (
    <div className="flex border-t">
      <div className="sticky start-0 z-10 flex w-32 shrink-0 items-center border-e bg-card px-4 font-semibold">
        {kennelLabel(kennel.id)}
      </div>
      <div className="relative h-14 flex-1">
        <div className="absolute inset-0 grid grid-cols-7">
          {days.map((day) => {
            const busy = Boolean(stayOn(stays, kennel.id, day))
            return (
              <button
                aria-label={`Réserver ${kennelLabel(kennel.id)} le ${shortDate(day)}`}
                className={cn(
                  "border-e border-border/40 text-sm font-semibold text-transparent transition-colors",
                  isWeekend(day) && "bg-muted/50",
                  day === TODAY && "bg-accent",
                  !busy && day >= TODAY && "hover:bg-accent hover:text-link"
                )}
                disabled={busy || day < TODAY}
                key={day}
                onClick={() => onBook(day)}
                type="button"
              >
                + Réserver
              </button>
            )
          })}
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
                  "absolute inset-y-2 z-1 flex items-center gap-2 overflow-hidden rounded-full px-1.5 text-start text-sm font-semibold transition-[filter] hover:brightness-95",
                  stayStatusMeta[s.status].bar,
                  from < 0 && "rounded-s-none ps-3",
                  to > 100 && "rounded-e-none"
                )}
                key={s.id}
                onClick={() => onOpen(s.id)}
                style={{
                  left: `calc(${left}% + 2px)`,
                  width: `calc(${right - left}% - 4px)`,
                }}
                title={`${s.pet} · ${shortDate(s.arrival)} → ${shortDate(s.departure)}`}
                type="button"
              >
                {from >= 0 && (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background/70 text-xs">
                    {s.pet.slice(0, 2)}
                  </span>
                )}
                <span className="truncate">{s.pet}</span>
                <span className="truncate font-normal opacity-70 max-lg:hidden">
                  {s.owner}
                </span>
              </button>
            )
          })}
        {start <= TODAY && TODAY < start + DAYS && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 z-2 w-0.5 -translate-x-1/2 bg-control"
            style={{ left: `${((TODAY - start + 0.5) / DAYS) * 100}%` }}
          />
        )}
      </div>
    </div>
  )
}

/** Les 5 semaines à venir, à partir du lundi de cette semaine. */
const MONTH_START = 0
const MONTH_DAYS = 35
const monthLabel = `${dateOf(MONTH_START).day} ${dateOf(MONTH_START).month} – ${dateOf(MONTH_START + MONTH_DAYS - 1).day} ${dateOf(MONTH_START + MONTH_DAYS - 1).month}`

/** Vue « Mois » : les places libres chaque jour, pour répondre vite au téléphone. */
function MonthGrid({
  stays,
  onPick,
}: {
  stays: Stay[]
  onPick: (day: number) => void
}) {
  const capacity = kennels.length
  const days = Array.from({ length: MONTH_DAYS }, (_, i) => MONTH_START + i)
  const booked = stays.filter((s) => s.status !== "pending")
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {days.slice(0, 7).map((d) => (
            <span
              className="py-2 text-center text-xs font-semibold text-muted-foreground"
              key={d}
            >
              {weekdayOf(d)}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 p-1 md:gap-1.5 md:p-1.5">
          {days.map((d) => {
            const { day, month } = dateOf(d)
            const past = d < TODAY
            const taken = nightsOn(stays, d)
            const free = capacity - taken
            const arrivals = booked.filter((s) => s.arrival === d).length
            const departures = booked.filter((s) => s.departure === d).length
            return (
              <button
                aria-label={`${longDate(d)} · ${free} place${free > 1 ? "s" : ""} libre${free > 1 ? "s" : ""}`}
                className={cn(
                  "relative flex min-h-20 flex-col justify-between rounded-2xl p-1.5 text-start transition-[filter] hover:brightness-95 disabled:pointer-events-none md:min-h-28 md:p-3",
                  past
                    ? "bg-muted/40 text-muted-foreground"
                    : occupancyClass(taken / capacity)
                )}
                disabled={past}
                key={d}
                onClick={() => onPick(d)}
                type="button"
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                    d === TODAY && "bg-background text-foreground"
                  )}
                >
                  {day}
                </span>
                {day === 1 && (
                  <span className="absolute top-2.5 left-10 text-xs font-semibold md:top-4 md:left-12">
                    {month}
                  </span>
                )}
                {!past && (
                  <span className="space-y-1">
                    <span className="block font-display text-2xl leading-none md:text-4xl">
                      {free}
                      <span className="ms-1 font-sans text-xs font-semibold normal-case max-md:hidden">
                        {free === 0 ? "complet" : free > 1 ? "libres" : "libre"}
                      </span>
                    </span>
                    {(arrivals > 0 || departures > 0) && (
                      <span className="flex gap-2 text-xs font-semibold opacity-80 max-md:hidden">
                        {arrivals > 0 && (
                          <span className="flex items-center gap-0.5">
                            <HugeiconsIcon
                              className="size-3.5"
                              icon={Login03Icon}
                            />
                            {arrivals}
                          </span>
                        )}
                        {departures > 0 && (
                          <span className="flex items-center gap-0.5">
                            <HugeiconsIcon
                              className="size-3.5"
                              icon={Logout03Icon}
                            />
                            {departures}
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Le chiffre indique les places libres : plus la case est foncée, plus la
        pension est pleine. Touchez un jour pour voir les box.
      </p>
    </div>
  )
}

/** Vue « Jour » : chaque box et qui l'occupe, lisible sur téléphone. */
function DayList({
  day,
  kennels: list,
  stays,
  onOpen,
  onBook,
}: {
  day: number
  kennels: Kennel[]
  stays: Stay[]
  onOpen: (id: string) => void
  onBook: (kennelId: string) => void
}) {
  return (
    <div className="space-y-6">
      {(["Chenil", "Chatterie"] as const).map((area) => {
        const rows = list.filter((k) => k.area === area)
        if (!rows.length) return null
        const busy = rows.filter((k) => stayOn(stays, k.id, day)).length
        return (
          <section className="space-y-1" key={area}>
            <h3 className="text-sm font-semibold text-muted-foreground">
              {area} · {busy} occupé{busy > 1 && "s"} sur {rows.length}
            </h3>
            <ul className="-mx-3">
              {rows.map((k) => {
                const s = stayOn(stays, k.id, day)
                return (
                  <li
                    className="flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-accent"
                    key={k.id}
                  >
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                        s ? "bg-pension text-pension-foreground" : "bg-muted"
                      )}
                    >
                      {k.label}
                    </span>
                    {s ? (
                      <button
                        className="min-w-0 flex-1 text-start"
                        onClick={() => onOpen(s.id)}
                        type="button"
                      >
                        <span className="block truncate font-semibold">
                          {s.pet}
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · {s.owner}
                          </span>
                        </span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {kennelLabel(k.id)} ·{" "}
                          {s.arrival === day
                            ? "arrive ce jour-là"
                            : `depuis le ${shortDate(s.arrival)}`}{" "}
                          · part le {shortDate(s.departure)}
                        </span>
                      </button>
                    ) : (
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-muted-foreground">
                          Libre
                        </span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {kennelLabel(k.id)}
                        </span>
                      </span>
                    )}
                    {s ? (
                      <Badge variant={stayStatusMeta[s.status].variant}>
                        {s.departure === day + 1
                          ? "Dernière nuit"
                          : stayStatusMeta[s.status].label}
                      </Badge>
                    ) : (
                      day >= TODAY && (
                        <Button
                          onClick={() => onBook(k.id)}
                          size="sm"
                          variant="secondary"
                        >
                          Réserver
                        </Button>
                      )
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export function PlanningView() {
  const [stays, setStays] = useState(initialStays)
  const [view, setView] = useState<AgendaView>("week")
  const [start, setStart] = useState(TODAY - 1)
  const [day, setDay] = useState(TODAY)
  const [area, setArea] = useState<Area>("Tous")
  const [booking, setBooking] = useState<{
    arrival: number
    kennelId: string
  } | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const days = Array.from({ length: DAYS }, (_, i) => start + i)
  const visible = kennels.filter((k) => area === "Tous" || k.area === area)
  const capacity = kennels.length
  const openStay = stays.find((s) => s.id === openId) ?? null
  const isDay = view === "day"
  const isMonth = view === "month"

  const open = (id: string) => {
    setOpenId(id)
    setSheetOpen(true)
  }
  const update = (id: string, patch: Partial<Stay>) =>
    setStays((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const add = (stay: Stay) => setStays((list) => [...list, stay])
  const decline = (id: string) =>
    setStays((list) => list.filter((s) => s.id !== id))
  const requests = stayRequests(stays, { decline, open, update })

  return (
    <ActivityPage
      actions={
        <NewStayDialog
          onCreate={add}
          trigger={
            <Button>
              <HugeiconsIcon icon={CalendarAdd01Icon} />
              Nouveau séjour
            </Button>
          }
        />
      }
      activity="Pension"
      title="Calendrier"
    >
      {requests.length > 0 && (
        <Section count={requests.length} title="À traiter">
          <AttentionList items={requests} />
        </Section>
      )}

      <section className="space-y-4">
        <AgendaToolbar
          atToday={isMonth || (isDay ? day === TODAY : start === TODAY - 1)}
          label={
            isMonth
              ? monthLabel
              : isDay
                ? longDate(day)
                : `${dateOf(start).day} ${dateOf(start).month} – ${dateOf(start + DAYS - 1).day} ${dateOf(start + DAYS - 1).month}`
          }
          nextDisabled={isMonth || (isDay ? day >= LAST : start + DAYS > LAST)}
          onNext={() => (isDay ? setDay(day + 1) : setStart(start + DAYS))}
          onPrev={() => (isDay ? setDay(day - 1) : setStart(start - DAYS))}
          onToday={() => (isDay ? setDay(TODAY) : setStart(TODAY - 1))}
          onView={setView}
          prevDisabled={
            isMonth || (isDay ? day <= FIRST : start - DAYS < FIRST)
          }
          view={view}
          views={["day", "week", "month"]}
        >
          {!isMonth && (
            <Tabs
              onValueChange={(value) => setArea(value as Area)}
              value={area}
            >
              <TabsList>
                {areas.map((a) => (
                  <TabsTab key={a} value={a}>
                    {a}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          )}
        </AgendaToolbar>

        {isMonth ? (
          <MonthGrid
            onPick={(d) => {
              setDay(d)
              setView("day")
            }}
            stays={stays}
          />
        ) : isDay ? (
          <DayList
            day={day}
            kennels={visible}
            onBook={(kennelId) => setBooking({ arrival: day, kennelId })}
            onOpen={open}
            stays={stays}
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border bg-card">
              <div className="overflow-x-auto">
                <div className="min-w-[52rem]">
                  <div className="flex">
                    <div className="sticky start-0 z-10 w-32 shrink-0 border-e bg-card" />
                    <div className="grid flex-1 grid-cols-7">
                      {days.map((d) => (
                        <button
                          className={cn(
                            "flex flex-col items-center gap-0.5 border-e border-border/40 py-2 transition-colors hover:bg-accent",
                            isWeekend(d) && "bg-muted/50"
                          )}
                          key={d}
                          onClick={() => {
                            setDay(d)
                            setView("day")
                          }}
                          type="button"
                        >
                          <span className="text-xs font-semibold text-muted-foreground">
                            {weekdayOf(d)}
                          </span>
                          <span
                            className={cn(
                              "flex size-8 items-center justify-center rounded-full font-semibold tabular-nums",
                              d === TODAY &&
                                "bg-control text-control-foreground"
                            )}
                          >
                            {dateOf(d).day}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex border-t">
                    <div className="sticky start-0 z-10 flex w-32 shrink-0 items-center border-e bg-card px-4 text-sm text-muted-foreground">
                      Places prises
                    </div>
                    <div className="grid flex-1 grid-cols-7 gap-1 p-1.5">
                      {days.map((d) => {
                        const count = nightsOn(stays, d)
                        return (
                          <span
                            className={cn(
                              "rounded-full py-1 text-center text-sm font-semibold tabular-nums",
                              occupancyClass(count / capacity)
                            )}
                            key={d}
                            title={`${count} animaux sur ${capacity} places`}
                          >
                            {count} / {capacity}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  {(["Chenil", "Chatterie"] as const)
                    .filter((a) => area === "Tous" || area === a)
                    .map((a) => (
                      <div key={a}>
                        <div className="sticky start-0 border-t bg-muted/60 px-4 py-2 text-sm font-semibold text-muted-foreground">
                          {a} · {visible.filter((k) => k.area === a).length}{" "}
                          places
                        </div>
                        {visible
                          .filter((k) => k.area === a)
                          .map((kennel) => (
                            <KennelRow
                              kennel={kennel}
                              key={kennel.id}
                              onBook={(d) =>
                                setBooking({ arrival: d, kennelId: kennel.id })
                              }
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
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span>
                Touchez une case libre pour réserver ce box à cette date.
              </span>
              <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {(Object.keys(stayStatusMeta) as Stay["status"][]).map(
                  (status) => (
                    <li className="flex items-center gap-1.5" key={status}>
                      <span
                        className={cn(
                          "h-3 w-6 rounded-full",
                          stayStatusMeta[status].bar
                        )}
                      />
                      {stayStatusMeta[status].label}
                    </li>
                  )
                )}
              </ul>
            </div>
          </>
        )}
      </section>

      {booking && (
        <NewStayDialog
          defaultOpen
          initial={booking}
          key={`${booking.kennelId}-${booking.arrival}`}
          onCreate={add}
          onOpenChange={(next) => !next && setBooking(null)}
        />
      )}

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
