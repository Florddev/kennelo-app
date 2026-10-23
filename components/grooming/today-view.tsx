"use client"

import {
  Alert02Icon,
  CalendarAdd01Icon,
  Call02Icon,
  EuroCircleIcon,
  HairDryerIcon,
  PackageIcon,
  PlusSignIcon,
  ScissorIcon,
  SmartPhone01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { activityMeta } from "@/components/activity-mark"
import { TODAY } from "@/components/calendar"
import {
  appointments as initialAppointments,
  type GroomingAppointment,
  type GroomingStatus,
  groomingSteps,
  salonBookings,
  stock,
  waitlist,
} from "@/components/grooming/data"
import { NewAppointmentDialog } from "@/components/grooming/new-appointment-dialog"
import { bookingRequests } from "@/components/grooming/requests"
import { NOW } from "@/components/today/data"
import {
  ActivityDayPage,
  type Attention,
  AttentionList,
  formatAmount,
  formatHour,
  Section,
} from "@/components/today/widgets"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AGENDA_START = 9
const AGENDA_END = 17
const HOUR_PX = 72
const agendaHours = Array.from(
  { length: AGENDA_END - AGENDA_START + 1 },
  (_, i) => AGENDA_START + i
)
const top = (hour: number) => (hour - AGENDA_START) * HOUR_PX

const statusMeta: Record<
  GroomingStatus,
  { label: string; variant: "secondary" | "warning" | "info" | "outline" }
> = {
  "checked-in": { label: "Arrivé", variant: "info" },
  done: { label: "Terminé", variant: "secondary" },
  "in-progress": { label: "Sur la table", variant: "warning" },
  upcoming: { label: "À venir", variant: "outline" },
}

const priceOf = (a: GroomingAppointment) =>
  a.services.reduce((sum, s) => sum + s.price, 0)
const durationOf = (a: GroomingAppointment) => a.end - a.start
const formatDuration = (hours: number) =>
  hours >= 1 ? formatHour(hours) : `${hours * 60} min`
const range = (a: GroomingAppointment) =>
  `${formatHour(a.start)} – ${formatHour(a.end)}`

function freeSlots(list: GroomingAppointment[]) {
  const sorted = [...list].sort((a, b) => a.start - b.start)
  const slots: { start: number; end: number }[] = []
  let cursor = AGENDA_START
  for (const a of [...sorted, { end: AGENDA_END, start: AGENDA_END }]) {
    if (a.start - cursor >= 0.5) slots.push({ end: a.start, start: cursor })
    cursor = Math.max(cursor, a.end)
  }
  return slots
}

/** Bouton principal sur une carte teintée, comme dans le bandeau. */
const onTint =
  "border-wise-forest bg-wise-forest text-wise-green hover:border-wise-forest hover:bg-wise-forest/90"

/** L'animal en cours, en grand, dans la couleur du toilettage. */
function GroomingTable({
  current,
  step,
  next,
  notified,
  onNext,
  onInstall,
}: {
  current?: GroomingAppointment
  step: number
  next?: GroomingAppointment
  notified: string | null
  onNext: () => void
  onInstall: (id: string) => void
}) {
  const tint = activityMeta.Toilettage.tint
  if (!current) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 rounded-4xl p-5 md:p-6",
          tint
        )}
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/60">
          <HugeiconsIcon className="size-6" icon={ScissorIcon} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-4xl">Table libre</p>
          <p className="opacity-80">
            {notified ??
              (next
                ? `Prochain : ${next.pet} à ${formatHour(next.start)}`
                : "Plus de rendez-vous aujourd'hui")}
          </p>
        </div>
        {next?.status === "checked-in" && (
          <Button
            className={onTint}
            onClick={() => onInstall(next.id)}
            size="lg"
          >
            Installer {next.pet}
          </Button>
        )}
      </div>
    )
  }
  const elapsed = Math.max(0, NOW - current.start)
  const last = step === groomingSteps.length - 1
  return (
    <div className={cn("space-y-5 rounded-4xl p-5 md:p-6", tint)}>
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/60 text-lg font-semibold">
          {current.pet.slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold opacity-80">
            <span className="size-2 animate-pulse rounded-full bg-current" />
            Sur la table · Marc
          </p>
          <p className="font-display text-5xl">{current.pet}</p>
          <p className="opacity-80">
            {current.breed} · {current.services.map((s) => s.label).join(" + ")}
          </p>
        </div>
        <div className="text-end">
          <p className="font-display text-4xl tabular-nums">
            {Math.round(elapsed * 60)} min
          </p>
          <p className="text-sm opacity-80">
            sur {Math.round(durationOf(current) * 60)} · fin{" "}
            {formatHour(current.end)}
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-5 gap-2">
        {groomingSteps.map((label, i) => (
          <li className="space-y-1.5" key={label}>
            <span
              className={cn(
                "block h-2 rounded-full",
                i < step
                  ? "bg-current"
                  : i === step
                    ? "animate-pulse bg-current/50"
                    : "bg-white/50"
              )}
            />
            <span
              className={cn(
                "flex items-center gap-1 text-xs md:text-sm",
                i === step ? "font-semibold" : i > step && "opacity-70"
              )}
            >
              {i < step && (
                <HugeiconsIcon className="size-3.5" icon={Tick02Icon} />
              )}
              {label === "Séchage" && i === step && (
                <HugeiconsIcon className="size-3.5" icon={HairDryerIcon} />
              )}
              {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-3 border-t border-current/15 pt-4">
        <p className="min-w-48 flex-1 text-sm opacity-80">
          {current.behaviour}
        </p>
        <Button className={onTint} onClick={onNext} size="lg">
          {last ? (
            <>
              <HugeiconsIcon icon={SmartPhone01Icon} />
              Terminer & prévenir {current.owner.split(" ")[0]}
            </>
          ) : (
            `Étape suivante : ${groomingSteps[step + 1]}`
          )}
        </Button>
      </div>
    </div>
  )
}

/** Couleur des rendez-vous : le rose du toilettage pour ce qui se passe au salon. */
const blockStyles: Record<GroomingStatus, string> = {
  "checked-in": "bg-wise-pink/60 text-wise-purple",
  done: "bg-background/50 text-muted-foreground",
  "in-progress": "bg-wise-pink text-wise-purple",
  upcoming: "bg-background",
}

function SalonAgenda({
  appointments,
  selectedId,
  offered,
  onSelect,
  onSlot,
  onOffer,
  className,
}: {
  appointments: GroomingAppointment[]
  selectedId: string
  offered: string[]
  onSelect: (id: string) => void
  onSlot: (start: number) => void
  onOffer: (id: string) => void
  className?: string
}) {
  return (
    <Section
      action={
        <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-semibold">
          <span className="size-2 rounded-full bg-control" />
          {formatHour(NOW)}
        </span>
      }
      className={className}
      title="La journée"
    >
      <div className="rounded-3xl bg-muted p-4 md:p-5">
        <div
          className="relative ms-12"
          style={{ height: (AGENDA_END - AGENDA_START) * HOUR_PX }}
        >
          {agendaHours.map((hour) => (
            <div
              className="absolute inset-x-0 border-t-2 border-background"
              key={hour}
              style={{ top: top(hour) }}
            >
              <span className="absolute -start-12 -top-3 text-sm font-semibold text-muted-foreground tabular-nums">
                {hour}h
              </span>
            </div>
          ))}

          {freeSlots(appointments).map((slot) => {
            const past = slot.end <= NOW
            const waiting = waitlist.find(
              (w) => w.slot === formatHour(slot.start)
            )
            return (
              <div
                className={cn(
                  "absolute inset-x-0 flex items-center gap-2 rounded-2xl border-2 border-dashed border-foreground/15 pe-1.5 font-semibold text-muted-foreground",
                  past && "opacity-60"
                )}
                key={slot.start}
                style={{
                  height: (slot.end - slot.start) * HOUR_PX - 4,
                  top: top(slot.start) + 2,
                }}
              >
                <button
                  className="flex min-w-0 flex-1 items-center justify-center gap-1.5 self-stretch rounded-2xl transition-colors hover:bg-background/60 hover:text-foreground disabled:pointer-events-none"
                  disabled={past}
                  onClick={() =>
                    onSlot(Math.max(slot.start, Math.ceil(NOW * 2) / 2))
                  }
                  type="button"
                >
                  <HugeiconsIcon className="size-4" icon={PlusSignIcon} />
                  Libre · {formatDuration(slot.end - slot.start)}
                </button>
                {waiting &&
                  !past &&
                  (offered.includes(waiting.id) ? (
                    <span className="flex items-center gap-1 pe-2 text-sm">
                      <HugeiconsIcon className="size-4" icon={Tick02Icon} />
                      Proposé à {waiting.pet}
                    </span>
                  ) : (
                    <Button
                      className="h-7 rounded-full bg-background"
                      onClick={() => onOffer(waiting.id)}
                      size="sm"
                      title={`${waiting.pet} attend : ${waiting.request}`}
                      variant="outline"
                    >
                      Proposer à {waiting.pet}
                    </Button>
                  ))}
              </div>
            )
          })}

          {appointments.map((a) => (
            <button
              className={cn(
                "absolute inset-x-0 z-1 flex gap-3 overflow-hidden rounded-2xl px-3 py-1.5 text-start leading-snug transition-[filter] hover:brightness-95",
                blockStyles[a.status],
                a.id === selectedId && "ring-2 ring-control"
              )}
              key={a.id}
              onClick={() => onSelect(a.id)}
              style={{
                height: durationOf(a) * HOUR_PX - 4,
                top: top(a.start) + 2,
              }}
              type="button"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {a.pet}{" "}
                  <span className="font-normal opacity-70">· {a.breed}</span>
                </p>
                <p className="truncate text-sm opacity-80">
                  {range(a)} · {a.services.map((x) => x.label).join(", ")}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-semibold tabular-nums">
                  {formatAmount(priceOf(a))}
                </span>
                {a.alert && a.status !== "done" && (
                  <HugeiconsIcon
                    className="size-4 text-warning-foreground"
                    icon={Alert02Icon}
                  />
                )}
                {a.status === "done" && (
                  <HugeiconsIcon className="size-4" icon={Tick02Icon} />
                )}
              </div>
            </button>
          ))}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -start-1 end-0 z-0 h-0.5 bg-control"
            style={{ top: top(NOW) }}
          >
            <span className="absolute -start-1 -top-[3px] size-2 rounded-full bg-control" />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Touchez un rendez-vous pour voir sa fiche, ou un créneau libre pour
        réserver.
      </p>
    </Section>
  )
}

/** La fiche du rendez-vous choisi : ce qu'il faut savoir quand le client arrive. */
function GroomingSheet({
  appointment: a,
  tableBusy,
  onStatus,
  onPay,
}: {
  appointment: GroomingAppointment
  tableBusy: boolean
  onStatus: (status: GroomingStatus) => void
  onPay: () => void
}) {
  const label = "text-xs font-semibold text-muted-foreground"
  return (
    <Section
      action={
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
          {statusMeta[a.status].label}
        </span>
      }
      title={a.pet}
    >
      <div className="space-y-2 rounded-3xl bg-muted p-3 md:p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-background p-3">
          <Avatar className="size-11">
            <AvatarFallback className="bg-muted font-semibold">
              {a.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{a.owner}</p>
            <p className="text-sm text-muted-foreground">
              {range(a)} · dernière visite {a.lastVisit.toLowerCase()}
            </p>
          </div>
          <Button
            aria-label={`Appeler ${a.owner}`}
            size="icon"
            variant="secondary"
          >
            <HugeiconsIcon icon={Call02Icon} />
          </Button>
        </div>

        {a.alert && (
          <p className="flex gap-3 rounded-2xl bg-warning-soft p-3 font-semibold">
            <HugeiconsIcon
              className="mt-0.5 size-5 shrink-0"
              icon={Alert02Icon}
            />
            {a.alert}
          </p>
        )}

        <dl className="grid grid-cols-3 gap-2">
          {[
            ["Race", a.breed],
            ["Gabarit", a.size],
            ["Pelage", a.coat],
          ].map(([name, value]) => (
            <div className="rounded-2xl bg-background p-3" key={name}>
              <dt className={label}>{name}</dt>
              <dd className="leading-tight font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <dl className="divide-y-2 divide-muted overflow-hidden rounded-2xl bg-background">
          <div className="space-y-0.5 p-3">
            <dt className={cn(label, "flex items-center gap-1.5")}>
              <HugeiconsIcon className="size-3.5" icon={ScissorIcon} />
              Coupe habituelle
            </dt>
            <dd>{a.cut}</dd>
          </div>
          <div className="space-y-0.5 p-3">
            <dt className={label}>Comportement</dt>
            <dd>{a.behaviour}</dd>
          </div>
          <div className="space-y-1.5 p-3">
            <dt className={label}>Produits</dt>
            <dd className="flex flex-wrap gap-1.5">
              {a.products.map((product) => (
                <span
                  className="rounded-full bg-muted px-3 py-1 text-sm font-semibold"
                  key={product}
                >
                  {product}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <ul className="divide-y-2 divide-muted overflow-hidden rounded-2xl bg-background">
          {a.services.map((x) => (
            <li
              className="flex justify-between gap-3 px-3 py-2.5"
              key={x.label}
            >
              <span>{x.label}</span>
              <span className="tabular-nums">{formatAmount(x.price)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-3 px-3 py-2.5 text-lg font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatAmount(priceOf(a))}</span>
          </li>
        </ul>

        {a.status === "upcoming" && (
          <Button
            className="w-full"
            onClick={() => onStatus("checked-in")}
            size="lg"
          >
            Enregistrer l&apos;arrivée
          </Button>
        )}
        {a.status === "checked-in" && (
          <Button
            className="w-full"
            disabled={tableBusy}
            onClick={() => onStatus("in-progress")}
            size="lg"
          >
            {tableBusy ? "Table occupée" : "Installer sur la table"}
          </Button>
        )}
        {a.status === "done" &&
          (a.paid ? (
            <p className="flex h-11 items-center justify-center gap-2 rounded-full bg-success-soft font-semibold">
              <HugeiconsIcon className="size-5" icon={Tick02Icon} />
              Réglé
            </p>
          ) : (
            <Button className="w-full" onClick={onPay} size="lg">
              Encaisser {formatAmount(priceOf(a))}
            </Button>
          ))}
      </div>
    </Section>
  )
}

export function GroomingTodayView() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [bookings, setBookings] = useState(salonBookings)
  const [step, setStep] = useState(2)
  const [selectedId, setSelectedId] = useState("cannelle")
  const [notified, setNotified] = useState<string | null>(null)
  const [slot, setSlot] = useState<number | null>(null)
  const [offered, setOffered] = useState<string[]>([])
  const [ordered, setOrdered] = useState(false)

  const current = appointments.find((a) => a.status === "in-progress")
  const next = appointments.find(
    (a) => a.status === "checked-in" || a.status === "upcoming"
  )
  const selected =
    appointments.find((a) => a.id === selectedId) ?? appointments[0]
  const planned = appointments.reduce((sum, a) => sum + durationOf(a), 0)
  const low = stock.filter((item) => item.level < 25)

  const update = (id: string, patch: Partial<GroomingAppointment>) =>
    setAppointments((list) =>
      list.map((a) => (a.id === id ? { ...a, ...patch } : a))
    )

  const install = (id: string) => {
    update(id, { status: "in-progress" })
    setStep(1)
    setNotified(null)
  }

  const nextStep = () => {
    if (!current) return
    if (step < groomingSteps.length - 1) {
      setStep(step + 1)
      return
    }
    update(current.id, { status: "done" })
    setSelectedId(current.id)
    setNotified(
      `${current.owner.split(" ")[0]} a été prévenu par SMS que ${current.pet} est prêt.`
    )
  }

  const attention: Attention[] = [
    ...appointments
      .filter((a) => a.status === "done" && !a.paid)
      .map((a) => ({
        actions: (
          <Button onClick={() => update(a.id, { paid: true })}>
            Encaisser {formatAmount(priceOf(a))}
          </Button>
        ),
        detail: `${a.services.map((x) => x.label).join(" + ")} · ${a.owner}`,
        icon: EuroCircleIcon,
        id: a.id,
        onOpen: () => setSelectedId(a.id),
        title: `${a.pet} · à encaisser`,
        tone: "bg-success-soft",
      })),
    ...(low.length && !ordered
      ? [
          {
            actions: (
              <Button onClick={() => setOrdered(true)}>
                <HugeiconsIcon icon={PackageIcon} />
                Commander
              </Button>
            ),
            detail: low
              .map((item) => `${item.label} ${item.level} %`)
              .join(" · "),
            icon: PackageIcon,
            id: "stock",
            title: `${low.length} produit${low.length > 1 ? "s" : ""} presque vide${low.length > 1 ? "s" : ""}`,
            tone: "bg-warning-soft text-warning-foreground",
          },
        ]
      : []),
    ...bookingRequests(bookings, {
      setStatus: (id, status) =>
        setBookings((list) =>
          list.map((b) => (b.id === id ? { ...b, status } : b))
        ),
    }),
  ]

  return (
    <ActivityDayPage
      actions={
        <NewAppointmentDialog
          trigger={
            <Button>
              <HugeiconsIcon icon={CalendarAdd01Icon} />
              Nouveau rendez-vous
            </Button>
          }
        />
      }
      activity="Toilettage"
      aside={
        <div className="flex h-10 items-center gap-2 rounded-full bg-muted ps-1 pe-4 text-sm font-semibold">
          <Avatar className="size-8">
            <AvatarFallback className="bg-background text-xs">
              MA
            </AvatarFallback>
          </Avatar>
          Marc
          <span className="font-normal text-muted-foreground">
            · au salon 9h – 18h
          </span>
        </div>
      }
      summary={
        <>
          {appointments.length} rendez-vous et {formatDuration(planned)} de
          toilettage aujourd&apos;hui.
        </>
      }
    >
      <GroomingTable
        current={current}
        next={next}
        notified={notified}
        onInstall={install}
        onNext={nextStep}
        step={step}
      />

      <Section count={attention.length || undefined} title="À traiter">
        <AttentionList
          items={attention}
          limit={3}
          moreHref="/grooming/appointments"
        />
      </Section>

      <div className="grid items-start gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <SalonAgenda
            appointments={appointments}
            offered={offered}
            onOffer={(id) => setOffered((list) => [...list, id])}
            onSelect={setSelectedId}
            onSlot={setSlot}
            selectedId={selected.id}
          />
        </div>
        <div className="lg:sticky lg:top-6">
          <GroomingSheet
            appointment={selected}
            onPay={() => update(selected.id, { paid: true })}
            onStatus={(status) =>
              status === "in-progress"
                ? install(selected.id)
                : update(selected.id, { status })
            }
            tableBusy={Boolean(current)}
          />
        </div>
      </div>

      {slot !== null && (
        <NewAppointmentDialog
          defaultOpen
          initial={{ day: TODAY, start: slot }}
          key={slot}
          onOpenChange={(open) => !open && setSlot(null)}
        />
      )}
    </ActivityDayPage>
  )
}
