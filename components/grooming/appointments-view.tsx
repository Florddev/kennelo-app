"use client"

import {
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  CalendarAdd01Icon,
  Clock01Icon,
  EuroCircleIcon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import {
  dateOf,
  longDate,
  relativeDate,
  shortDate,
  TODAY,
  weekdayOf,
} from "@/components/calendar"
import {
  type BookingStatus,
  type SalonBooking,
  salonBookings,
  services,
} from "@/components/grooming/data"
import { NOW } from "@/components/today/data"
import {
  ActivityPage,
  Bar,
  formatAmount,
  formatHour,
  Kpi,
  Widget,
} from "@/components/today/widgets"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardFrame } from "@/components/ui/card"
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const OPEN = 9
const CLOSE = 18
const HOUR_PX = 48
const hours = Array.from({ length: CLOSE - OPEN + 1 }, (_, i) => OPEN + i)
const OPEN_HOURS_PER_WEEK = 5 * 8

const statusMeta: Record<
  BookingStatus,
  {
    label: string
    variant: "secondary" | "info" | "warning" | "outline" | "error"
    block: string
  }
> = {
  cancelled: {
    block: "border-dashed bg-transparent text-muted-foreground line-through",
    label: "Annulé",
    variant: "outline",
  },
  confirmed: {
    block: "border-s-4 border-s-violet-600 bg-violet-600/10",
    label: "Confirmé",
    variant: "info",
  },
  done: {
    block: "bg-muted text-muted-foreground",
    label: "Terminé",
    variant: "secondary",
  },
  "no-show": {
    block: "border-destructive/40 bg-destructive/5 text-destructive-foreground",
    label: "Absent",
    variant: "error",
  },
  pending: {
    block:
      "border-dashed border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200",
    label: "À confirmer",
    variant: "warning",
  },
}

const isBooked = (b: SalonBooking) =>
  b.status !== "cancelled" && b.status !== "no-show"

function WeekGrid({
  days,
  bookings,
  onOpen,
}: {
  days: number[]
  bookings: SalonBooking[]
  onOpen: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <div className="min-w-[760px]">
        <div className="flex border-b">
          <div className="w-12 shrink-0" />
          {days.map((day) => (
            <div
              className="flex flex-1 items-center justify-center gap-1.5 border-s py-2 text-sm"
              key={day}
            >
              <span className="text-muted-foreground">{weekdayOf(day)}</span>
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
        <div className="flex">
          <div
            className="relative w-12 shrink-0"
            style={{ height: (CLOSE - OPEN) * HOUR_PX }}
          >
            {hours.slice(0, -1).map((hour) => (
              <span
                className="absolute end-2 -translate-y-1/2 text-[0.6875rem] text-muted-foreground tabular-nums first:translate-y-0"
                key={hour}
                style={{ top: (hour - OPEN) * HOUR_PX }}
              >
                {hour}h
              </span>
            ))}
          </div>
          {days.map((day) => {
            const closed = day % 7 === 0
            return (
              <div
                className={cn(
                  "relative flex-1 border-s",
                  day === TODAY && "bg-orange-500/[0.03]"
                )}
                key={day}
                style={{ height: (CLOSE - OPEN) * HOUR_PX }}
              >
                {hours.slice(1, -1).map((hour) => (
                  <span
                    className="absolute inset-x-0 border-t border-border/50"
                    key={hour}
                    style={{ top: (hour - OPEN) * HOUR_PX }}
                  />
                ))}
                {closed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(135deg,transparent,transparent_8px,var(--color-muted)_8px,var(--color-muted)_9px)] text-xs text-muted-foreground">
                    Fermé
                  </div>
                )}
                {bookings
                  .filter((b) => b.day === day)
                  .map((b) => (
                    <button
                      className={cn(
                        "absolute inset-x-1 overflow-hidden rounded-md border px-1.5 py-1 text-start text-xs transition-[filter] hover:brightness-95",
                        statusMeta[b.status].block
                      )}
                      key={b.id}
                      onClick={() => onOpen(b.id)}
                      style={{
                        height: (b.end - b.start) * HOUR_PX - 3,
                        top: (b.start - OPEN) * HOUR_PX + 1,
                      }}
                      title={`${b.pet} · ${b.service} · ${formatHour(b.start)} – ${formatHour(b.end)}`}
                      type="button"
                    >
                      <p className="flex items-center gap-1 truncate font-medium">
                        {b.note && b.status !== "done" && (
                          <HugeiconsIcon
                            className="size-3 shrink-0 text-amber-500"
                            icon={Alert02Icon}
                          />
                        )}
                        <span className="truncate">{b.pet}</span>
                      </p>
                      {b.end - b.start >= 0.75 && (
                        <p className="truncate opacity-75">{b.service}</p>
                      )}
                    </button>
                  ))}
                {day === TODAY && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 h-0.5 bg-orange-500"
                    style={{ top: (NOW - OPEN) * HOUR_PX }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BookingList({
  days,
  bookings,
  onOpen,
}: {
  days: number[]
  bookings: SalonBooking[]
  onOpen: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {days.map((day) => {
        const list = bookings
          .filter((b) => b.day === day)
          .sort((a, b) => a.start - b.start)
        if (list.length === 0) return null
        return (
          <section className="space-y-2" key={day}>
            <h3 className="text-sm font-medium">
              {relativeDate(day)}
              <span className="font-normal text-muted-foreground">
                {" "}
                · {list.length} rendez-vous
              </span>
            </h3>
            <CardFrame className="overflow-x-auto">
              <Table variant="card">
                <TableBody>
                  {list.map((b) => (
                    <TableRow
                      className="cursor-pointer"
                      key={b.id}
                      onClick={() => onOpen(b.id)}
                    >
                      <TableCell className="w-28 text-muted-foreground tabular-nums">
                        {formatHour(b.start)} – {formatHour(b.end)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{b.pet}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {b.breed}
                        </span>
                      </TableCell>
                      <TableCell>{b.service}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.owner}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {formatAmount(b.price)}
                      </TableCell>
                      <TableCell className="w-28 text-end">
                        <Badge variant={statusMeta[b.status].variant}>
                          {statusMeta[b.status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardFrame>
          </section>
        )
      })}
    </div>
  )
}

function BookingSheet({
  booking,
  open,
  onOpenChange,
  onStatus,
}: {
  booking: SalonBooking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatus: (id: string, status: BookingStatus) => void
}) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup variant="inset">
        {booking && (
          <>
            <SheetHeader>
              <Badge
                className="w-fit"
                variant={statusMeta[booking.status].variant}
              >
                {statusMeta[booking.status].label}
              </Badge>
              <SheetTitle>
                {booking.pet} · {booking.service}
              </SheetTitle>
              <SheetDescription>
                {longDate(booking.day)} · {formatHour(booking.start)} –{" "}
                {formatHour(booking.end)}
              </SheetDescription>
            </SheetHeader>
            <SheetPanel className="space-y-6">
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-violet-600 text-white">
                    {booking.pet.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{booking.pet}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.breed} · {booking.owner}
                  </p>
                </div>
                <p className="font-heading text-xl font-semibold tabular-nums">
                  {formatAmount(booking.price)}
                </p>
              </div>
              <dl className="divide-y rounded-xl border text-sm">
                {[
                  ["Prestation", booking.service],
                  ["Date", shortDate(booking.day)],
                  [
                    "Horaire",
                    `${formatHour(booking.start)} – ${formatHour(booking.end)}`,
                  ],
                  [
                    "Durée",
                    `${Math.round((booking.end - booking.start) * 60)} min`,
                  ],
                  ["Toiletteur", "Marc · Table 1"],
                ].map(([label, value]) => (
                  <div className="flex gap-4 px-4 py-2.5" key={label}>
                    <dt className="w-24 shrink-0 text-muted-foreground">
                      {label}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              {booking.note && (
                <Alert variant="warning">
                  <HugeiconsIcon icon={Alert02Icon} />
                  <AlertDescription>{booking.note}</AlertDescription>
                </Alert>
              )}
            </SheetPanel>
            <SheetFooter>
              {booking.status === "pending" && (
                <>
                  <Button
                    onClick={() => onStatus(booking.id, "cancelled")}
                    variant="outline"
                  >
                    Refuser
                  </Button>
                  <Button onClick={() => onStatus(booking.id, "confirmed")}>
                    Confirmer
                  </Button>
                </>
              )}
              {booking.status === "confirmed" && (
                <>
                  <Button
                    onClick={() => onStatus(booking.id, "cancelled")}
                    variant="destructive-outline"
                  >
                    Annuler
                  </Button>
                  {booking.day <= TODAY ? (
                    <Button
                      onClick={() => onStatus(booking.id, "no-show")}
                      variant="outline"
                    >
                      Marquer absent
                    </Button>
                  ) : (
                    <Button>
                      <HugeiconsIcon icon={SmartPhone01Icon} />
                      Envoyer un rappel
                    </Button>
                  )}
                </>
              )}
              {(booking.status === "cancelled" ||
                booking.status === "no-show") && (
                <Button
                  onClick={() => onStatus(booking.id, "confirmed")}
                  variant="outline"
                >
                  Rétablir le rendez-vous
                </Button>
              )}
              {booking.status === "done" && (
                <Button variant="outline">Voir le ticket</Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetPopup>
    </Sheet>
  )
}

export function AppointmentsView() {
  const [bookings, setBookings] = useState(salonBookings)
  const [week, setWeek] = useState(0)
  const [view, setView] = useState<"week" | "list">("week")
  const [openId, setOpenId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const days = Array.from({ length: 6 }, (_, i) => week * 7 + i)
  const inWeek = bookings.filter((b) => days.includes(b.day))
  const booked = inWeek.filter(isBooked)
  const bookedHours = booked.reduce((sum, b) => sum + b.end - b.start, 0)
  const revenue = booked.reduce((sum, b) => sum + b.price, 0)
  const pending = bookings.filter((b) => b.status === "pending")
  const lost = inWeek.filter((b) => !isBooked(b)).length
  const openBooking = bookings.find((b) => b.id === openId) ?? null

  const open = (id: string) => {
    setOpenId(id)
    setSheetOpen(true)
  }
  const setStatus = (id: string, status: BookingStatus) =>
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, status } : b)))

  const byService = Object.entries(
    booked.reduce<Record<string, number>>((acc, b) => {
      const key = b.service.split(" ")[0]
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  return (
    <ActivityPage
      actions={
        <Button size="sm">
          <HugeiconsIcon icon={CalendarAdd01Icon} />
          Nouveau rendez-vous
        </Button>
      }
      activity="Toilettage"
      className="max-w-7xl"
      title="Rendez-vous"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Calendar03Icon} label="Rendez-vous" value={booked.length}>
          {lost > 0 ? `${lost} annulé ou absent` : "Aucune annulation"}
        </Kpi>
        <Kpi
          icon={Clock01Icon}
          label="Remplissage"
          value={`${Math.round((bookedHours / OPEN_HOURS_PER_WEEK) * 100)} %`}
        >
          <Bar
            className="bg-violet-600"
            label="Remplissage de la semaine"
            value={(bookedHours / OPEN_HOURS_PER_WEEK) * 100}
          />
          <p className="mt-1.5">
            {formatHour(bookedHours)} sur {OPEN_HOURS_PER_WEEK}h ouvertes
          </p>
        </Kpi>
        <Kpi
          icon={EuroCircleIcon}
          label="CA prévu"
          value={formatAmount(revenue)}
        >
          Panier moyen {formatAmount(Math.round(revenue / booked.length))}
        </Kpi>
        <Kpi icon={Alert02Icon} label="À confirmer" value={pending.length}>
          Demandes en ligne en attente
        </Kpi>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            aria-label="Semaine précédente"
            disabled={week === 0}
            onClick={() => setWeek(week - 1)}
            size="icon-sm"
            variant="outline"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <Button
            aria-label="Semaine suivante"
            disabled={week === 1}
            onClick={() => setWeek(week + 1)}
            size="icon-sm"
            variant="outline"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
        </div>
        <span className="text-sm font-medium">
          Semaine du {dateOf(days[0]).day} au {dateOf(days[5]).day}{" "}
          {dateOf(days[5]).month}
        </span>
        <Tabs
          className="ms-auto"
          onValueChange={(value) => setView(value as "week" | "list")}
          value={view}
        >
          <TabsList size="sm">
            <TabsTab value="week">Semaine</TabsTab>
            <TabsTab value="list">Liste</TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="min-w-0 lg:col-span-3">
          {view === "week" ? (
            <WeekGrid bookings={bookings} days={days} onOpen={open} />
          ) : (
            <BookingList bookings={bookings} days={days} onOpen={open} />
          )}
        </div>
        <div className="space-y-4">
          <Widget
            description="Réservations faites en ligne"
            title="À confirmer"
          >
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Toutes les demandes ont été traitées.
              </p>
            ) : (
              <ul className="space-y-3">
                {pending.map((b) => (
                  <li className="space-y-2 rounded-lg border p-3" key={b.id}>
                    <button
                      className="block w-full text-start"
                      onClick={() => open(b.id)}
                      type="button"
                    >
                      <p className="text-sm font-medium">
                        {b.pet}
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          · {b.owner}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shortDate(b.day)} · {formatHour(b.start)} · {b.service}
                      </p>
                    </button>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => setStatus(b.id, "cancelled")}
                        size="xs"
                        variant="outline"
                      >
                        Refuser
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setStatus(b.id, "confirmed")}
                        size="xs"
                      >
                        Confirmer
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Widget>
          <Widget description="Cette semaine" title="Par prestation">
            <ul className="space-y-2.5">
              {byService.map(([service, n]) => (
                <li className="space-y-1" key={service}>
                  <div className="flex justify-between text-sm">
                    <span>{service}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {n}
                    </span>
                  </div>
                  <Bar
                    className="bg-violet-600"
                    label={service}
                    value={(n / booked.length) * 100}
                  />
                </li>
              ))}
            </ul>
          </Widget>
        </div>
      </div>

      <Widget description="Tarifs selon le gabarit" title="Prestations">
        <div className="-m-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-4">Prestation</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead className="text-end">Petit</TableHead>
                <TableHead className="text-end">Moyen</TableHead>
                <TableHead className="pe-4 text-end">Grand</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.label}>
                  <TableCell className="ps-4 font-medium">{s.label}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.duration}
                  </TableCell>
                  {s.prices.map((price, i) => (
                    <TableCell
                      className={cn("text-end tabular-nums", i === 2 && "pe-4")}
                      key={i}
                    >
                      {formatAmount(price)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Widget>

      <BookingSheet
        booking={openBooking}
        onOpenChange={setSheetOpen}
        onStatus={(id, status) => {
          setStatus(id, status)
          setSheetOpen(false)
        }}
        open={sheetOpen}
      />
    </ActivityPage>
  )
}
