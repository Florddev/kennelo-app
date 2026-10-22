"use client"

import {
  Alert02Icon,
  Calendar03Icon,
  CalendarAdd01Icon,
  Call02Icon,
  Clock01Icon,
  EuroCircleIcon,
  HairDryerIcon,
  HourglassIcon,
  PackageIcon,
  ScissorIcon,
  SmartPhone01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import {
  appointments as initialAppointments,
  type GroomingAppointment,
  type GroomingStatus,
  groomingSteps,
  productSales,
  stock,
  waitlist,
} from "@/components/grooming/data"
import { NOW } from "@/components/today/data"
import {
  ActivityDayPage,
  Bar,
  formatAmount,
  formatHour,
  Kpi,
  Widget,
} from "@/components/today/widgets"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Meter, MeterIndicator, MeterTrack } from "@/components/ui/meter"
import { cn } from "@/lib/utils"

const AGENDA_START = 9
const AGENDA_END = 17
const HOUR_PX = 56
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
  if (!current) {
    return (
      <Widget description="Table 1 · Marc" title="Sur la table">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <HugeiconsIcon icon={ScissorIcon} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Table libre</p>
            <p className="text-sm text-muted-foreground">
              {notified ??
                (next
                  ? `Prochain : ${next.pet} à ${formatHour(next.start)}`
                  : "Plus de rendez-vous aujourd'hui")}
            </p>
          </div>
          {next?.status === "checked-in" && (
            <Button onClick={() => onInstall(next.id)} size="sm">
              Installer {next.pet}
            </Button>
          )}
        </div>
      </Widget>
    )
  }
  const elapsed = Math.max(0, NOW - current.start)
  const last = step === groomingSteps.length - 1
  return (
    <Widget
      action={
        <Badge variant="warning">
          <span className="size-1.5 animate-pulse rounded-full bg-current" />
          En cours
        </Badge>
      }
      description="Table 1 · Marc"
      title="Sur la table"
    >
      <div className="flex flex-wrap items-start gap-4">
        <Avatar className="size-12">
          <AvatarFallback className="bg-grooming text-grooming-foreground">
            {current.pet.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold">
            {current.pet}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              · {current.breed} · {current.size.toLowerCase()} gabarit
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            {current.services.map((s) => s.label).join(" + ")}
          </p>
        </div>
        <div className="text-end text-sm">
          <p className="font-medium tabular-nums">
            {Math.round(elapsed * 60)} min
            <span className="text-muted-foreground">
              {" "}
              / {Math.round(durationOf(current) * 60)} min
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Fin estimée {formatHour(current.end)}
          </p>
        </div>
      </div>

      <ol className="mt-5 grid grid-cols-5 gap-2">
        {groomingSteps.map((label, i) => (
          <li className="space-y-1.5" key={label}>
            <span
              className={cn(
                "block h-1.5 rounded-full",
                i < step
                  ? "bg-grooming-strong"
                  : i === step
                    ? "animate-pulse bg-grooming-strong/50"
                    : "bg-muted"
              )}
            />
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                i === step ? "font-medium" : i > step && "text-muted-foreground"
              )}
            >
              {i < step && (
                <HugeiconsIcon
                  className="size-3 text-grooming-strong"
                  icon={Tick02Icon}
                />
              )}
              {label === "Séchage" && i === step && (
                <HugeiconsIcon className="size-3" icon={HairDryerIcon} />
              )}
              {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
        <p className="min-w-0 flex-1 text-xs text-muted-foreground">
          {current.behaviour}
        </p>
        <Button
          onClick={onNext}
          size="sm"
          variant={last ? "default" : "outline"}
        >
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
    </Widget>
  )
}

function SalonAgenda({
  appointments,
  selectedId,
  onSelect,
  className,
}: {
  appointments: GroomingAppointment[]
  selectedId: string
  onSelect: (id: string) => void
  className?: string
}) {
  return (
    <Widget
      action={
        <Badge variant="outline">
          <span className="size-1.5 rounded-full bg-orange-500" />
          {formatHour(NOW)}
        </Badge>
      }
      className={className}
      description="Cliquez sur un rendez-vous pour voir sa fiche"
      title="Agenda du salon"
    >
      <div
        className="relative ms-10"
        style={{ height: (AGENDA_END - AGENDA_START) * HOUR_PX }}
      >
        {agendaHours.map((hour) => (
          <div
            className="absolute inset-x-0 border-t border-border/60"
            key={hour}
            style={{ top: top(hour) }}
          >
            <span className="absolute -start-10 -top-2 text-[0.6875rem] text-muted-foreground tabular-nums">
              {hour}h
            </span>
          </div>
        ))}

        {freeSlots(appointments).map((slot) => (
          <div
            className="absolute inset-x-0 flex items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground"
            key={slot.start}
            style={{
              height: (slot.end - slot.start) * HOUR_PX - 4,
              top: top(slot.start) + 2,
            }}
          >
            Créneau libre · {formatDuration(slot.end - slot.start)}
          </div>
        ))}

        {appointments.map((a) => (
          <button
            className={cn(
              "absolute inset-x-0 flex gap-2 overflow-hidden rounded-lg border px-2.5 py-1.5 text-start text-xs transition-shadow",
              a.status === "done" && "bg-muted text-muted-foreground",
              a.status === "in-progress" &&
                "border-grooming-strong bg-grooming text-grooming-foreground",
              a.status === "checked-in" &&
                "border-grooming-strong/40 bg-grooming/50",
              a.status === "upcoming" &&
                "border-s-4 border-s-grooming-strong bg-background",
              a.id === selectedId &&
                "ring-2 ring-ring ring-offset-2 ring-offset-background"
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
              <p className="truncate text-sm font-medium">
                {a.pet}{" "}
                <span className="font-normal opacity-70">· {a.breed}</span>
              </p>
              <p className="truncate opacity-80">
                {range(a)} · {a.services.map((s) => s.label).join(", ")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="font-medium tabular-nums">
                {formatAmount(priceOf(a))}
              </span>
              {a.alert && (
                <HugeiconsIcon
                  className="size-3.5 text-amber-500"
                  icon={Alert02Icon}
                />
              )}
              {a.status === "done" && (
                <HugeiconsIcon className="size-3.5" icon={Tick02Icon} />
              )}
            </div>
          </button>
        ))}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -start-1 end-0 h-0.5 bg-orange-500"
          style={{ top: top(NOW) }}
        >
          <span className="absolute -start-1 -top-[3px] size-2 rounded-full bg-orange-500" />
        </div>
      </div>
    </Widget>
  )
}

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
  return (
    <Widget
      action={
        <Badge variant={statusMeta[a.status].variant}>
          {statusMeta[a.status].label}
        </Badge>
      }
      description={range(a)}
      title={`Fiche de ${a.pet}`}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback>{a.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{a.owner}</p>
            <p className="text-xs text-muted-foreground">
              Dernière visite : {a.lastVisit.toLowerCase()}
            </p>
          </div>
          <Button aria-label="Appeler" size="icon-sm" variant="outline">
            <HugeiconsIcon icon={Call02Icon} />
          </Button>
        </div>

        {a.alert && (
          <Alert variant="warning">
            <HugeiconsIcon icon={Alert02Icon} />
            <AlertDescription>{a.alert}</AlertDescription>
          </Alert>
        )}

        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Race", a.breed],
            ["Gabarit", a.size],
            ["Pelage", a.coat],
          ].map(([label, value]) => (
            <div className="rounded-lg bg-muted/60 p-2" key={label}>
              <dt className="text-[0.6875rem] text-muted-foreground">
                {label}
              </dt>
              <dd className="text-xs font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon className="size-3.5" icon={ScissorIcon} />
            Coupe habituelle
          </p>
          <p className="text-sm">{a.cut}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Comportement
          </p>
          <p className="text-sm">{a.behaviour}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {a.products.map((product) => (
            <Badge key={product} variant="outline">
              {product}
            </Badge>
          ))}
        </div>

        <ul className="space-y-1 border-t pt-3 text-sm">
          {a.services.map((s) => (
            <li className="flex justify-between" key={s.label}>
              <span className="text-muted-foreground">{s.label}</span>
              <span className="tabular-nums">{formatAmount(s.price)}</span>
            </li>
          ))}
          <li className="flex justify-between font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatAmount(priceOf(a))}</span>
          </li>
        </ul>

        {a.status === "upcoming" && (
          <Button
            className="w-full"
            onClick={() => onStatus("checked-in")}
            variant="outline"
          >
            Enregistrer l&apos;arrivée
          </Button>
        )}
        {a.status === "checked-in" && (
          <Button
            className="w-full"
            disabled={tableBusy}
            onClick={() => onStatus("in-progress")}
          >
            {tableBusy ? "Table occupée" : "Installer sur la table"}
          </Button>
        )}
        {a.status === "done" &&
          (a.paid ? (
            <Badge className="w-full" size="lg" variant="success">
              <HugeiconsIcon icon={Tick02Icon} />
              Réglé
            </Badge>
          ) : (
            <Button className="w-full" onClick={onPay}>
              Encaisser {formatAmount(priceOf(a))}
            </Button>
          ))}
      </div>
    </Widget>
  )
}

function CashCard({ appointments }: { appointments: GroomingAppointment[] }) {
  const lines = [
    ...appointments.map((a) => ({
      label: `${a.pet} · ${a.services[0].label}`,
      paid: a.paid,
      price: priceOf(a),
      status: a.status,
    })),
    ...productSales.map((s) => ({ ...s, status: "sale" as const })),
  ]
  const total = lines.reduce((sum, l) => sum + l.price, 0)
  const collected = lines
    .filter((l) => l.paid)
    .reduce((sum, l) => sum + l.price, 0)
  return (
    <Widget description="Prestations et ventes" title="Caisse du jour">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-heading text-2xl font-semibold tabular-nums">
          {formatAmount(collected)}
        </span>
        <span className="text-xs text-muted-foreground">
          encaissés sur {formatAmount(total)}
        </span>
      </div>
      <div className="mt-2">
        <Bar
          className="bg-grooming-strong"
          label="Encaissé"
          value={(collected / total) * 100}
        />
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {lines.map((l) => (
          <li className="flex items-center gap-2" key={l.label}>
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                l.paid ? "bg-grooming-strong" : "bg-muted-foreground/30"
              )}
            />
            <span className="min-w-0 flex-1 truncate">{l.label}</span>
            {l.status === "sale" && (
              <Badge size="sm" variant="outline">
                Vente
              </Badge>
            )}
            <span
              className={cn("tabular-nums", !l.paid && "text-muted-foreground")}
            >
              {formatAmount(l.price)}
            </span>
          </li>
        ))}
      </ul>
    </Widget>
  )
}

function StockCard() {
  return (
    <Widget
      action={
        <Button size="xs" variant="ghost">
          <HugeiconsIcon icon={PackageIcon} />
          Commander
        </Button>
      }
      description="Niveau des produits ouverts"
      title="Produits"
    >
      <ul className="space-y-3">
        {stock.map((item) => {
          const low = item.level < 25
          return (
            <li className="space-y-1.5" key={item.label}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{item.label}</span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    low
                      ? "font-medium text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground"
                  )}
                >
                  {item.level} %
                </span>
              </div>
              <Meter aria-label={item.label} value={item.level}>
                <MeterTrack>
                  <MeterIndicator
                    className={low ? "bg-amber-500" : "bg-grooming-strong"}
                  />
                </MeterTrack>
              </Meter>
            </li>
          )
        })}
      </ul>
    </Widget>
  )
}

function WaitlistCard() {
  const [offered, setOffered] = useState<string[]>([])
  return (
    <Widget
      description="Clients à recontacter si un créneau se libère"
      title="Liste d'attente"
    >
      <ul className="divide-y">
        {waitlist.map((w) => (
          <li
            className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            key={w.id}
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{w.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-medium">{w.pet}</span>
                <span className="text-muted-foreground"> · {w.owner}</span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {w.request}
              </p>
            </div>
            {offered.includes(w.id) ? (
              <Badge variant="success">
                <HugeiconsIcon icon={Tick02Icon} />
                Proposé
              </Badge>
            ) : (
              <Button
                onClick={() => setOffered((list) => [...list, w.id])}
                size="xs"
                variant="outline"
              >
                Proposer {w.slot}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Widget>
  )
}

export function GroomingTodayView() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [step, setStep] = useState(2)
  const [selectedId, setSelectedId] = useState("cannelle")
  const [notified, setNotified] = useState<string | null>(null)

  const current = appointments.find((a) => a.status === "in-progress")
  const next = appointments.find(
    (a) => a.status === "checked-in" || a.status === "upcoming"
  )
  const selected =
    appointments.find((a) => a.id === selectedId) ?? appointments[0]
  const done = appointments.filter((a) => a.status === "done").length
  const planned = appointments.reduce((sum, a) => sum + durationOf(a), 0)
  const opening = AGENDA_END - AGENDA_START
  const slots = freeSlots(appointments)
  const revenue =
    appointments.reduce((sum, a) => sum + priceOf(a), 0) +
    productSales.reduce((sum, s) => sum + s.price, 0)

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

  return (
    <ActivityDayPage
      actions={
        <Button size="sm">
          <HugeiconsIcon icon={CalendarAdd01Icon} />
          Nouveau rendez-vous
        </Button>
      }
      activity="Toilettage"
      aside={
        <div className="flex items-center gap-2 rounded-full border py-1 ps-1 pe-3 text-sm">
          <Avatar className="size-6">
            <AvatarFallback className="text-[0.625rem]">MA</AvatarFallback>
          </Avatar>
          Marc
          <span className="text-muted-foreground">· au salon 9h – 18h</span>
        </div>
      }
      summary={
        <>
          {appointments.length} rendez-vous et {formatDuration(planned)} de
          toilettage au planning.{" "}
          {current
            ? `${current.pet} est sur la table.`
            : next && `Prochain : ${next.pet} à ${formatHour(next.start)}.`}
        </>
      }
    >
      <Alert variant="warning">
        <HugeiconsIcon icon={Alert02Icon} />
        <AlertTitle>Rocky à 14h : peau sensible</AlertTitle>
        <AlertDescription>
          Shampoing hypoallergénique obligatoire, et il n&apos;en reste
          qu&apos;un flacon entamé (12 %). Filou (16h) est stressé par le
          séchoir : prévoir un séchage serviette.
        </AlertDescription>
        <AlertAction>
          <Button size="xs" variant="outline">
            <HugeiconsIcon icon={PackageIcon} />
            Commander
          </Button>
        </AlertAction>
      </Alert>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={Calendar03Icon}
          label="Rendez-vous"
          value={`${done} / ${appointments.length}`}
        >
          {current ? `1 en cours · ${current.pet}` : "Aucun en cours"}
        </Kpi>
        <Kpi
          icon={Clock01Icon}
          label="Remplissage"
          value={`${Math.round((planned / opening) * 100)} %`}
        >
          <Bar
            className="bg-grooming-strong"
            label="Remplissage du planning"
            value={(planned / opening) * 100}
          />
          <p className="mt-1.5">
            {formatDuration(planned)} sur {opening}h d&apos;ouverture
          </p>
        </Kpi>
        <Kpi
          icon={EuroCircleIcon}
          label="CA du jour"
          value={formatAmount(revenue)}
        >
          dont {formatAmount(productSales.reduce((s, p) => s + p.price, 0))} de
          ventes de produits
        </Kpi>
        <Kpi icon={HourglassIcon} label="Créneaux libres" value={slots.length}>
          {slots
            .map(
              (s) =>
                `${formatHour(s.start)} (${formatDuration(s.end - s.start)})`
            )
            .join(" · ")}
        </Kpi>
      </div>

      <GroomingTable
        current={current}
        next={next}
        notified={notified}
        onInstall={install}
        onNext={nextStep}
        step={step}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SalonAgenda
          appointments={appointments}
          className="lg:col-span-2"
          onSelect={setSelectedId}
          selectedId={selected.id}
        />
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CashCard appointments={appointments} />
        <StockCard />
        <WaitlistCard />
      </div>
    </ActivityDayPage>
  )
}
