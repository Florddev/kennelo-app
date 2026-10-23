"use client"

import {
  AgendaToolbar,
  type AgendaView,
  TimeGrid,
} from "@/components/agenda/agenda"
import { NewAppointmentDialog } from "@/components/grooming/new-appointment-dialog"
import { bookingRequests } from "@/components/grooming/requests"
import {
  Alert02Icon,
  CalendarAdd01Icon,
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
} from "@/components/calendar"
import {
  type BookingStatus,
  type SalonBooking,
  salonBookings,
} from "@/components/grooming/data"
import {
  ActivityPage,
  AttentionList,
  formatAmount,
  formatHour,
  Section,
} from "@/components/today/widgets"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet"

const OPEN = 9
const CLOSE = 18
const LAST_DAY = 13
/** Le salon est fermé le lundi. */
const isClosed = (day: number) => day % 7 === 0
const mondayOf = (day: number) => day - (((day % 7) + 7) % 7)

const statusMeta: Record<
  BookingStatus,
  {
    label: string
    variant: "secondary" | "info" | "warning" | "outline" | "error"
    block: string
  }
> = {
  cancelled: {
    block: "border border-dashed text-muted-foreground line-through",
    label: "Annulé",
    variant: "outline",
  },
  confirmed: {
    block: "bg-grooming text-grooming-foreground",
    label: "Confirmé",
    variant: "info",
  },
  done: {
    block: "bg-muted text-muted-foreground",
    label: "Terminé",
    variant: "secondary",
  },
  "no-show": {
    block: "bg-destructive-soft text-destructive-foreground line-through",
    label: "Absent",
    variant: "error",
  },
  pending: {
    block:
      "border-2 border-dashed border-warning bg-warning-soft text-warning-foreground",
    label: "À confirmer",
    variant: "warning",
  },
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
            <h3 className="text-sm font-semibold text-muted-foreground">
              {relativeDate(day)}
              <span className="font-normal text-muted-foreground">
                {" "}
                · {list.length} rendez-vous
              </span>
            </h3>
            <ul className="-mx-3">
              {list.map((b) => (
                <li key={b.id}>
                  <button
                    className="flex w-full items-center gap-4 rounded-2xl p-3 text-start transition-colors hover:bg-accent"
                    onClick={() => onOpen(b.id)}
                    type="button"
                  >
                    <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-full bg-grooming text-xs leading-tight font-semibold text-grooming-foreground tabular-nums">
                      {formatHour(b.start)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {b.pet}
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          · {b.breed}
                        </span>
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {b.service} · {b.owner} · jusqu&apos;à{" "}
                        {formatHour(b.end)}
                      </span>
                    </span>
                    <span className="shrink-0 space-y-1 text-end">
                      <span className="block font-semibold tabular-nums">
                        {formatAmount(b.price)}
                      </span>
                      <Badge variant={statusMeta[b.status].variant}>
                        {statusMeta[b.status].label}
                      </Badge>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
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
                  <AvatarFallback className="bg-grooming text-grooming-foreground">
                    {booking.pet.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{booking.pet}</p>
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
  const [view, setView] = useState<AgendaView>("week")
  const [focus, setFocus] = useState(TODAY)
  const [slot, setSlot] = useState<{ day: number; start: number } | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const monday = mondayOf(focus)
  const week = Array.from({ length: 6 }, (_, i) => monday + i)
  const days = view === "day" ? [focus] : week
  const openBooking = bookings.find((b) => b.id === openId) ?? null
  const step = view === "day" ? 1 : 7

  const open = (id: string) => {
    setOpenId(id)
    setSheetOpen(true)
  }
  const setStatus = (id: string, status: BookingStatus) =>
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, status } : b)))
  const add = (booking: SalonBooking) =>
    setBookings((list) => [...list, booking])
  const requests = bookingRequests(bookings, { open, setStatus })

  return (
    <ActivityPage
      actions={
        <NewAppointmentDialog
          onCreate={add}
          trigger={
            <Button>
              <HugeiconsIcon icon={CalendarAdd01Icon} />
              Nouveau rendez-vous
            </Button>
          }
        />
      }
      activity="Toilettage"
      title="Calendrier"
    >
      {requests.length > 0 && (
        <Section count={requests.length} title="À traiter">
          <AttentionList items={requests} />
        </Section>
      )}

      <section className="space-y-4">
        <AgendaToolbar
          atToday={view === "day" ? focus === TODAY : week.includes(TODAY)}
          label={
            view === "day"
              ? longDate(focus)
              : `Semaine du ${dateOf(week[0]).day} au ${dateOf(week[5]).day} ${dateOf(week[5]).month}`
          }
          nextDisabled={focus + step > LAST_DAY}
          onNext={() => setFocus(focus + step)}
          onPrev={() => setFocus(Math.max(0, focus - step))}
          onToday={() => setFocus(TODAY)}
          onView={setView}
          prevDisabled={view === "day" ? focus <= 0 : monday <= 0}
          view={view}
        />
        {view === "list" ? (
          <BookingList bookings={bookings} days={week} onOpen={open} />
        ) : (
          <>
            <TimeGrid
              close={CLOSE}
              days={days}
              events={bookings.map((b) => ({
                className: statusMeta[b.status].block,
                day: b.day,
                end: b.end,
                icon: b.note && b.status !== "done" ? Alert02Icon : undefined,
                id: b.id,
                start: b.start,
                subtitle: `${b.service} · ${b.owner}`,
                title: b.pet,
              }))}
              isClosed={isClosed}
              onDay={(day) => {
                setFocus(day)
                setView("day")
              }}
              onOpen={open}
              onSlot={(day, start) => setSlot({ day, start })}
              open={OPEN}
            />
            <p className="text-sm text-muted-foreground">
              Touchez un créneau libre pour y prendre un rendez-vous, ou un jour
              pour le voir en grand.
            </p>
          </>
        )}
      </section>

      {slot && (
        <NewAppointmentDialog
          defaultOpen
          initial={slot}
          key={`${slot.day}-${slot.start}`}
          onCreate={add}
          onOpenChange={(next) => !next && setSlot(null)}
        />
      )}

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
