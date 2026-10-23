"use client"

import {
  Alert02Icon,
  Archive01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BedDoubleIcon,
  CalendarAdd01Icon,
  Call02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Home01Icon,
  InboxIcon,
  InjectionIcon,
  Invoice01Icon,
  Login03Icon,
  Logout03Icon,
  MailOpen01Icon,
  Message01Icon,
  Moon02Icon,
  QuoteDownIcon,
  ScissorIcon,
  StarIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import { ActivityMark, activityMeta } from "@/components/activity-mark"
import {
  type InboxItem,
  type InboxKind,
  inboxItems,
  type PriceLine,
} from "@/components/inbox/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Meter, MeterIndicator, MeterTrack } from "@/components/ui/meter"
import { cn } from "@/lib/utils"

type Filter = "all" | "unread" | "todo"
type DataOf<K extends InboxKind> = Extract<InboxItem, { kind: K }>["data"]
type Action = {
  label: string
  variant?: "outline" | "ghost"
  done?: string
  href?: string
}

const kindMeta: Record<
  InboxKind,
  { label: string; icon: IconSvgElement; tone: string }
> = {
  appointment: {
    icon: ScissorIcon,
    label: "Rendez-vous",
    tone: "bg-grooming text-grooming-foreground",
  },
  booking: {
    icon: CalendarAdd01Icon,
    label: "Réservation",
    tone: "bg-pension text-pension-foreground",
  },
  capacity: {
    icon: Home01Icon,
    label: "Capacité",
    tone: "bg-wise-orange text-wise-maroon",
  },
  health: {
    icon: InjectionIcon,
    label: "Santé",
    tone: "bg-wise-pink text-wise-purple",
  },
  message: {
    icon: Message01Icon,
    label: "Message",
    tone: "bg-wise-blue text-wise-charcoal",
  },
  payment: {
    icon: Invoice01Icon,
    label: "Facturation",
    tone: "bg-warning-soft text-warning-foreground",
  },
  review: {
    icon: StarIcon,
    label: "Avis client",
    tone: "bg-wise-yellow text-wise-gold",
  },
}

const groups = ["Aujourd'hui", "Hier", "Plus tôt"] as const

const vaccineStatus = {
  expired: { label: "Expiré", tone: "bg-destructive-soft" },
  ok: { label: "À jour", tone: "bg-success-soft" },
  soon: { label: "Expire bientôt", tone: "bg-warning-soft" },
} as const

/** Carte crème qui regroupe des blocs blancs, comme partout dans l'espace pro. */
const panel = "rounded-3xl bg-muted p-3 md:p-4"
const block = "rounded-2xl bg-background p-4"
const list = "divide-y-2 divide-muted overflow-hidden rounded-2xl bg-background"
const pill = "inline-block rounded-full px-3 py-1 text-sm font-semibold"

const formatEuro = (amount: number) =>
  `${Number.isInteger(amount) ? amount : amount.toFixed(2).replace(".", ",")} €`

const formatDuration = (minutes: number) =>
  minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`

const sum = (lines: { amount: number }[]) =>
  lines.reduce((total, line) => total + line.amount, 0)

function actionsFor(item: InboxItem): Action[] {
  switch (item.kind) {
    case "booking":
      return [
        {
          done: "Demande refusée, le client a été prévenu",
          label: "Refuser",
          variant: "ghost",
        },
        { label: "Proposer d'autres dates", variant: "outline" },
        {
          done: `Réservation acceptée · ${item.data.box} attribué`,
          label: "Accepter la réservation",
        },
      ]
    case "message":
      return [{ href: "/messages", label: "Ouvrir la conversation" }]
    case "appointment":
      return [
        { label: "Proposer un autre créneau", variant: "outline" },
        { done: "Rendez-vous confirmé", label: "Confirmer le rendez-vous" },
      ]
    case "health":
      return [
        {
          done: "Demande de carnet envoyée",
          label: "Demander le carnet",
          variant: "outline",
        },
        { done: "Vaccins vérifiés", label: "Marquer comme vérifié" },
      ]
    case "payment":
      return item.data.status === "paid"
        ? [{ href: "/billing", label: "Voir la facture", variant: "outline" }]
        : [
            {
              done: "Facture marquée comme payée",
              label: "Marquer comme payée",
              variant: "outline",
            },
            {
              done: "Relance envoyée par e-mail",
              label: "Envoyer une relance",
            },
          ]
    case "capacity":
      return [
        {
          done: "Liste d'attente activée",
          label: "Activer la liste d'attente",
          variant: "outline",
        },
        { href: "/pension/planning", label: "Ouvrir le planning" },
      ]
    case "review":
      return [{ done: "Réponse publiée", label: "Remercier le client" }]
  }
}

function KindTile({
  kind,
  className,
}: {
  kind: InboxKind
  className?: string
}) {
  const { icon, tone } = kindMeta[kind]
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full",
        tone,
        className
      )}
    >
      <HugeiconsIcon className="size-5" icon={icon} />
    </span>
  )
}

function Section({
  title,
  aside,
  children,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl">{title}</h3>
        {aside && (
          <span className="text-sm font-semibold text-muted-foreground">
            {aside}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

function Callout({
  icon,
  title,
  tone,
  children,
}: {
  icon: IconSvgElement
  title: string
  tone: string
  children?: ReactNode
}) {
  return (
    <div className={cn("flex gap-3 rounded-3xl p-4 md:p-5", tone)}>
      <HugeiconsIcon className="mt-0.5 size-5 shrink-0" icon={icon} />
      <div className="space-y-0.5">
        <p className="font-semibold">{title}</p>
        {children && <p className="opacity-80">{children}</p>}
      </div>
    </div>
  )
}

function PriceTable({ lines }: { lines: PriceLine[] }) {
  return (
    <div className={panel}>
      <dl className={list}>
        {lines.map((line) => (
          <div
            className="flex justify-between gap-4 px-4 py-3"
            key={line.label}
          >
            <dt>{line.label}</dt>
            <dd className="tabular-nums">{formatEuro(line.amount)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 px-4 py-3">
          <dt className="font-semibold">Total</dt>
          <dd className="font-display text-3xl tabular-nums">
            {formatEuro(sum(lines))}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function StayStop({
  icon,
  label,
  day,
  time,
  end,
}: {
  icon: IconSvgElement
  label: string
  day: string
  time: string
  end?: boolean
}) {
  return (
    <div className={cn(block, end && "text-end")}>
      <span
        className={cn(
          "flex items-center gap-1.5 text-sm font-semibold text-muted-foreground",
          end && "justify-end"
        )}
      >
        <HugeiconsIcon className="size-4" icon={icon} />
        {label}
      </span>
      <p className="mt-1 font-display text-3xl">{day}</p>
      <p className="text-sm text-muted-foreground">{time}</p>
    </div>
  )
}

function BookingDetail({ data }: { data: DataOf<"booking"> }) {
  const { occupied, total } = data.occupancy
  return (
    <>
      <Section title="Séjour demandé">
        <div
          className={cn(
            panel,
            "grid grid-cols-[1fr_auto_1fr] items-center gap-3"
          )}
        >
          <StayStop icon={Login03Icon} label="Arrivée" {...data.arrival} />
          <div className="flex flex-col items-center gap-2 sm:px-4">
            <div className="flex gap-1 text-muted-foreground max-sm:hidden">
              {Array.from({ length: data.nights }, (_, night) => (
                <HugeiconsIcon
                  className="size-4"
                  icon={Moon02Icon}
                  key={night}
                />
              ))}
            </div>
            <span className={cn(pill, "bg-wise-orange text-wise-maroon")}>
              {data.nights} nuits
            </span>
          </div>
          <StayStop
            end
            icon={Logout03Icon}
            label="Départ"
            {...data.departure}
          />
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Hébergement">
          <div className={cn(panel, "flex-1")}>
            <div className={cn(block, "space-y-3")}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-display text-2xl">
                  <HugeiconsIcon className="size-5" icon={BedDoubleIcon} />
                  {data.box}
                </span>
                <span className={cn(pill, "bg-success-soft")}>Disponible</span>
              </div>
              <Meter aria-label="Occupation" max={total} value={occupied}>
                <MeterTrack className="h-2.5 rounded-full bg-muted">
                  <MeterIndicator className="rounded-full bg-wise-orange" />
                </MeterTrack>
              </Meter>
              <p className="text-sm text-muted-foreground">
                {occupied}/{total} box occupés sur la période ·{" "}
                {total - occupied} restants
              </p>
            </div>
          </div>
        </Section>
        <Section title="Animal">
          <div
            className={cn(panel, "flex flex-1 flex-wrap content-start gap-2")}
          >
            {data.petInfo.map((info) => (
              <span className={cn(pill, "bg-background")} key={info}>
                {info}
              </span>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Estimation">
          <PriceTable lines={data.lines} />
        </Section>
        {data.note && (
          <Section title="Note du client">
            <blockquote className={cn(panel, "flex flex-1 gap-3 p-5 md:p-5")}>
              <HugeiconsIcon
                className="mt-1 size-5 shrink-0 text-muted-foreground"
                icon={QuoteDownIcon}
              />
              <p className="text-lg font-semibold">{data.note}</p>
            </blockquote>
          </Section>
        )}
      </div>
    </>
  )
}

function MessageDetail({ data }: { data: DataOf<"message"> }) {
  return (
    <>
      <p className={cn(pill, "flex w-fit items-center gap-2 bg-muted")}>
        <HugeiconsIcon className="size-4" icon={BedDoubleIcon} />
        {data.context}
      </p>
      <Section title="Messages non lus">
        <div className={cn(panel, "space-y-3 p-4 md:p-5")}>
          {data.messages.map((message) => (
            <div className="flex flex-col items-start gap-1" key={message.text}>
              <p className="max-w-[85%] rounded-3xl bg-background px-4 py-2.5">
                {message.text}
              </p>
              <span className="px-2 text-xs text-muted-foreground">
                {message.time}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const serviceShades = ["bg-wise-purple", "bg-wise-pink", "bg-wise-pink/50"]

function AppointmentDetail({ data }: { data: DataOf<"appointment"> }) {
  const minutes = data.services.reduce((total, s) => total + s.minutes, 0)
  const price = data.services.reduce((total, s) => total + s.price, 0)
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Créneau demandé">
        <div className={cn(panel, "flex flex-1 items-center gap-3 md:gap-4")}>
          <div className="w-24 shrink-0 overflow-hidden rounded-2xl bg-background text-center">
            <div className="bg-wise-pink py-1 text-sm font-semibold text-wise-purple">
              {data.weekday}
            </div>
            <div className="pt-2 font-display text-5xl leading-none">
              {data.day}
            </div>
            <div className="pb-2 text-sm text-muted-foreground">
              {data.month}
            </div>
          </div>
          <div className="grid flex-1 grid-cols-3 gap-2">
            {data.slots.map((slot) => (
              <span
                className={cn(
                  "flex h-10 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                  slot.status === "free" && "bg-background",
                  slot.status === "busy" &&
                    "font-normal text-muted-foreground line-through",
                  slot.status === "requested" &&
                    "bg-wise-pink text-wise-purple ring-2 ring-wise-purple"
                )}
                key={slot.time}
              >
                {slot.time}
              </span>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Avec {data.groomer} · les créneaux barrés sont déjà réservés
        </p>
      </Section>

      <Section aside={formatDuration(minutes)} title="Prestations">
        <div className={cn(panel, "space-y-3")}>
          <div className="mx-1 flex h-2.5 gap-0.5 overflow-hidden rounded-full">
            {data.services.map((service, i) => (
              <span
                className={serviceShades[i % serviceShades.length]}
                key={service.label}
                style={{ width: `${(service.minutes / minutes) * 100}%` }}
              />
            ))}
          </div>
          <ul className={list}>
            {data.services.map((service, i) => (
              <li
                className="flex items-center gap-3 px-4 py-3"
                key={service.label}
              >
                <span
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    serviceShades[i % serviceShades.length]
                  )}
                />
                <span className="flex-1">{service.label}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {service.minutes} min
                </span>
                <span className="w-14 text-end tabular-nums">
                  {formatEuro(service.price)}
                </span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-3 px-4 py-3">
              <span className="font-semibold">Total</span>
              <span className="font-display text-3xl tabular-nums">
                {formatEuro(price)}
              </span>
            </li>
          </ul>
        </div>
      </Section>
    </div>
  )
}

function HealthDetail({ data }: { data: DataOf<"health"> }) {
  return (
    <>
      <Callout
        icon={Alert02Icon}
        title={`Arrivée prévue le ${data.arrival.toLowerCase()}`}
        tone="bg-warning-soft"
      >
        Le séjour ne pourra pas être confirmé tant que les vaccins ne sont pas à
        jour.
      </Callout>
      <Section title="Vaccinations">
        <div className={panel}>
          <ul className={list}>
            {data.vaccines.map((vaccine) => {
              const status = vaccineStatus[vaccine.status]
              return (
                <li
                  className="flex items-center gap-3 p-3 md:px-4"
                  key={vaccine.name}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <HugeiconsIcon className="size-5" icon={InjectionIcon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{vaccine.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {vaccine.date}
                    </p>
                  </div>
                  <span className={cn(pill, status.tone)}>{status.label}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </Section>
    </>
  )
}

function PaymentDetail({ data }: { data: DataOf<"payment"> }) {
  const paid = data.status === "paid"
  return (
    <>
      <div
        className={cn(
          panel,
          "flex flex-wrap items-end justify-between gap-4 p-5 md:p-6"
        )}
      >
        <div>
          <p className="font-semibold text-muted-foreground">
            Facture {data.invoice}
          </p>
          <p className="font-display text-6xl tabular-nums">
            {formatEuro(sum(data.lines))}
          </p>
        </div>
        <div className="space-y-1 text-end">
          <span
            className={cn(
              pill,
              paid ? "bg-success-soft" : "bg-destructive-soft"
            )}
          >
            {paid ? "Payée" : `${data.daysLate} jours de retard`}
          </span>
          <p className="text-sm text-muted-foreground">
            {paid ? data.method : `Échéance le ${data.due}`}
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Détail">
          <PriceTable lines={data.lines} />
        </Section>
        <Section title="Historique">
          <div className={panel}>
            <ol className={list}>
              {data.history.map((step, i) => (
                <li
                  className="flex items-center gap-3 px-4 py-3"
                  key={step.label}
                >
                  <span
                    className={cn(
                      "size-2.5 shrink-0 rounded-full",
                      i < data.history.length - 1
                        ? "bg-muted-foreground/40"
                        : paid
                          ? "bg-success"
                          : "bg-warning"
                    )}
                  />
                  <span className="flex-1 font-semibold">{step.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {step.date}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      </div>
    </>
  )
}

function CapacityDetail({ data }: { data: DataOf<"capacity"> }) {
  return (
    <>
      <Section title="Occupation des box">
        <div
          className={cn(
            panel,
            "flex h-72 items-end justify-around gap-3 p-5 md:p-6"
          )}
        >
          {data.days.map((day) => {
            const ratio = day.occupied / day.total
            const full = ratio >= 1
            return (
              <div
                className="flex h-full max-w-24 flex-1 flex-col items-center gap-2"
                key={day.label}
              >
                <span
                  className={cn(
                    "font-display text-2xl tabular-nums",
                    full && "text-destructive-foreground"
                  )}
                >
                  {day.occupied}/{day.total}
                </span>
                <div className="relative w-full flex-1 overflow-hidden rounded-2xl bg-background">
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0",
                      full ? "bg-destructive" : "bg-wise-orange"
                    )}
                    style={{ height: `${ratio * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {day.label}
                </span>
              </div>
            )
          })}
        </div>
      </Section>
      <Callout
        icon={Clock01Icon}
        title={`${data.waiting} demandes en attente sur ces dates`}
        tone="bg-warning-soft"
      >
        La liste d&apos;attente les placera automatiquement en cas
        d&apos;annulation.
      </Callout>
    </>
  )
}

function ReviewDetail({ data }: { data: DataOf<"review"> }) {
  return (
    <figure className={cn(panel, "space-y-4 p-5 md:p-6")}>
      <div className="flex items-center justify-between gap-3">
        <div
          aria-label={`${data.rating} sur 5`}
          className="text-3xl tracking-widest text-warning"
          role="img"
        >
          {"★".repeat(data.rating)}
          <span className="text-background">{"★".repeat(5 - data.rating)}</span>
        </div>
        <span className={cn(pill, "bg-background")}>{data.source}</span>
      </div>
      <blockquote className="flex gap-3">
        <HugeiconsIcon
          className="mt-1 size-6 shrink-0 text-muted-foreground"
          icon={QuoteDownIcon}
        />
        <p className="text-xl leading-relaxed font-semibold">{data.text}</p>
      </blockquote>
    </figure>
  )
}

function ItemBody({ item }: { item: InboxItem }) {
  switch (item.kind) {
    case "booking":
      return <BookingDetail data={item.data} />
    case "message":
      return <MessageDetail data={item.data} />
    case "appointment":
      return <AppointmentDetail data={item.data} />
    case "health":
      return <HealthDetail data={item.data} />
    case "payment":
      return <PaymentDetail data={item.data} />
    case "capacity":
      return <CapacityDetail data={item.data} />
    case "review":
      return <ReviewDetail data={item.data} />
  }
}

function DetailPane({
  item,
  resolution,
  onBack,
  onArchive,
  onMarkUnread,
  onResolve,
  onUndo,
}: {
  item: InboxItem
  resolution?: string
  onBack: () => void
  onArchive: () => void
  onMarkUnread: () => void
  onResolve: (label: string) => void
  onUndo: () => void
}) {
  const meta = kindMeta[item.kind]
  const actions = actionsFor(item)
  const onTint = "border-transparent bg-white/60 text-current hover:bg-white/80"
  return (
    <>
      <header
        className={cn(
          "flex shrink-0 items-center gap-3 px-3 py-3 md:rounded-4xl md:px-5 md:py-4",
          item.activity ? activityMeta[item.activity].tint : meta.tone
        )}
      >
        <Button
          aria-label="Retour à la liste"
          className={cn("md:hidden", onTint)}
          onClick={onBack}
          size="icon"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>
        <KindTile className="bg-white/60 text-current" kind={item.kind} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-3xl leading-none">
            {meta.label}
          </p>
          <p className="mt-1 truncate text-sm opacity-80">
            {[...new Set([item.activity, item.group, item.time])]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <Button
          aria-label="Marquer non lu"
          className={onTint}
          onClick={onMarkUnread}
          size="icon"
        >
          <HugeiconsIcon icon={MailOpen01Icon} />
        </Button>
        <Button
          aria-label="Archiver"
          className={onTint}
          onClick={onArchive}
          size="icon"
        >
          <HugeiconsIcon icon={Archive01Icon} />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <article className="space-y-6 px-4 py-6 md:px-0 md:py-8">
          <header className="space-y-4">
            <h2 className="font-display text-4xl text-balance md:text-5xl">
              {item.title}
            </h2>
            {item.client && (
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-muted font-semibold">
                    {item.client.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold">
                    {item.client.name}
                    {item.kind === "booking" && item.data.newClient && (
                      <span className={cn(pill, "bg-info-soft py-0.5 text-xs")}>
                        Nouveau client
                      </span>
                    )}
                  </p>
                  {item.pet && (
                    <p className="text-sm text-muted-foreground">{item.pet}</p>
                  )}
                </div>
                <Button aria-label="Appeler" size="icon" variant="secondary">
                  <HugeiconsIcon icon={Call02Icon} />
                </Button>
              </div>
            )}
          </header>

          {resolution && (
            <div className="flex items-center gap-3 rounded-3xl bg-success-soft p-3 ps-5">
              <HugeiconsIcon
                className="size-5 shrink-0"
                icon={CheckmarkCircle02Icon}
              />
              <p className="flex-1 font-semibold">{resolution}</p>
              <Button
                className="border-transparent bg-white/60 text-current hover:bg-white/80"
                onClick={onUndo}
                size="sm"
              >
                Annuler
              </Button>
            </div>
          )}

          <ItemBody item={item} />
        </article>
      </div>

      <footer className="flex flex-wrap justify-end gap-2 border-t px-4 py-3 md:px-0 md:pb-0">
        {actions.map((action) =>
          action.href ? (
            <Button
              key={action.label}
              render={<Link href={action.href} />}
              variant={action.variant}
            >
              {action.label}
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          ) : (
            <Button
              disabled={Boolean(resolution) && Boolean(action.done)}
              key={action.label}
              onClick={() => action.done && onResolve(action.done)}
              variant={action.variant}
            >
              {action.label}
            </Button>
          )
        )}
      </footer>
    </>
  )
}

function InboxRow({
  item,
  active,
  resolved,
  onSelect,
}: {
  item: InboxItem
  active: boolean
  resolved: boolean
  onSelect: () => void
}) {
  return (
    <button
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full gap-4 rounded-3xl p-3 text-start transition-colors hover:bg-muted",
        active && "md:bg-muted"
      )}
      onClick={onSelect}
      type="button"
    >
      <KindTile kind={item.kind} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate",
              item.unread ? "font-semibold" : "font-normal"
            )}
          >
            {item.title}
          </span>
          <span className="ms-auto shrink-0 text-sm text-muted-foreground">
            {item.time}
          </span>
        </div>
        <p
          className={cn(
            "truncate text-sm",
            item.unread ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {item.preview}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          {item.activity && (
            <ActivityMark
              activity={item.activity}
              className="size-4 text-[0.5rem]"
            />
          )}
          <span className="truncate">{item.client?.name ?? item.activity}</span>
          {resolved && (
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-foreground">
              Traité
            </span>
          )}
          {item.unread && (
            <span className="ms-auto size-2.5 shrink-0 rounded-full bg-destructive">
              <span className="sr-only">Non lu</span>
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export function InboxView() {
  const [items, setItems] = useState(() =>
    inboxItems.map((item, i) => (i === 0 ? { ...item, unread: false } : item))
  )
  const [selectedId, setSelectedId] = useState<string | null>(inboxItems[0].id)
  const [filter, setFilter] = useState<Filter>("all")
  const [resolved, setResolved] = useState<Record<string, string>>({})
  const [showDetail, setShowDetail] = useState(false)

  const selected = items.find((item) => item.id === selectedId)
  const isTodo = (item: InboxItem) => item.actionable && !resolved[item.id]
  const unreadCount = items.filter((item) => item.unread).length
  const todoCount = items.filter(isTodo).length
  const visible = items.filter(
    (item) =>
      filter === "all" || (filter === "unread" ? item.unread : isTodo(item))
  )

  const setUnread = (id: string, unread: boolean) =>
    setItems((list) =>
      list.map((item) => (item.id === id ? { ...item, unread } : item))
    )

  const open = (id: string) => {
    setSelectedId(id)
    setShowDetail(true)
    setUnread(id, false)
  }

  const archive = (id: string) => {
    const index = visible.findIndex((item) => item.id === id)
    const next = visible[index + 1] ?? visible[index - 1]
    setItems((list) => list.filter((item) => item.id !== id))
    setSelectedId(next?.id ?? null)
    if (next) setUnread(next.id, false)
    else setShowDetail(false)
  }

  const filters: { label: string; value: Filter; count?: number }[] = [
    { label: "Tout", value: "all" },
    { count: unreadCount, label: "Non lus", value: "unread" },
    { count: todoCount, label: "À traiter", value: "todo" },
  ]

  const setResolution = (id: string, label?: string) =>
    setResolved((current) => {
      const next = { ...current }
      if (label) next[id] = label
      else delete next[id]
      return next
    })

  return (
    <div className="flex min-h-0 flex-1 md:mx-auto md:w-full md:max-w-[110rem] md:px-10 md:py-6">
      <aside
        className={cn(
          "w-full flex-col md:flex md:w-96 md:shrink-0 md:border-e md:pe-4 xl:w-[28rem] 2xl:w-[32rem]",
          showDetail ? "hidden" : "flex"
        )}
      >
        <div className="space-y-4 px-4 pt-6 pb-2 md:px-0 md:pt-0">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-5xl text-balance">
              Boîte de réception
            </h1>
            <Button
              aria-label="Tout marquer comme lu"
              disabled={unreadCount === 0}
              onClick={() =>
                setItems((list) =>
                  list.map((item) => ({ ...item, unread: false }))
                )
              }
              size="icon-lg"
              title="Tout marquer comme lu"
              variant="secondary"
            >
              <HugeiconsIcon icon={Tick02Icon} />
            </Button>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            {filters.map((f) => (
              <button
                aria-pressed={filter === f.value}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
                  filter === f.value
                    ? "bg-control text-control-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-neutral-hover"
                )}
                key={f.value}
                onClick={() => setFilter(f.value)}
                type="button"
              >
                {f.label}
                {f.count !== undefined && (
                  <span className="tabular-nums opacity-70">{f.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <nav
          aria-label="Notifications"
          className="flex-1 overflow-y-auto px-2 pb-4 md:px-0"
        >
          {visible.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Tout est traité 🎉
            </p>
          )}
          {groups.map((group) => {
            const list = visible.filter((item) => item.group === group)
            if (list.length === 0) return null
            return (
              <div className="mb-2" key={group}>
                <h2 className="px-3 pt-4 pb-1 text-sm font-semibold text-muted-foreground">
                  {group}
                </h2>
                <div className="space-y-0.5">
                  {list.map((item) => (
                    <InboxRow
                      active={item.id === selectedId}
                      item={item}
                      key={item.id}
                      onSelect={() => open(item.id)}
                      resolved={Boolean(resolved[item.id])}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>

      <section
        className={cn(
          "min-w-0 flex-1 flex-col md:flex md:ps-6",
          showDetail ? "flex" : "hidden"
        )}
      >
        {selected ? (
          <DetailPane
            item={selected}
            key={selected.id}
            onArchive={() => archive(selected.id)}
            onBack={() => setShowDetail(false)}
            onMarkUnread={() => {
              setUnread(selected.id, true)
              setShowDetail(false)
            }}
            onResolve={(label) => setResolution(selected.id, label)}
            onUndo={() => setResolution(selected.id)}
            resolution={resolved[selected.id]}
          />
        ) : (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={InboxIcon} />
              </EmptyMedia>
              <EmptyTitle>Aucune notification sélectionnée</EmptyTitle>
              <EmptyDescription>
                Choisissez une alerte dans la liste pour afficher ses détails.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </div>
  )
}
