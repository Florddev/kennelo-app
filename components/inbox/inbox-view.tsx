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
import { Fragment, type ReactNode, useState } from "react"
import { ActivityMark } from "@/components/activity-mark"
import {
  type InboxItem,
  type InboxKind,
  inboxItems,
  type PriceLine,
} from "@/components/inbox/data"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Meter, MeterIndicator, MeterTrack } from "@/components/ui/meter"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
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
    tone: "bg-orange-500/12 text-orange-700 dark:text-orange-400",
  },
  health: {
    icon: InjectionIcon,
    label: "Santé",
    tone: "bg-rose-500/12 text-rose-700 dark:text-rose-400",
  },
  message: {
    icon: Message01Icon,
    label: "Message",
    tone: "bg-sky-500/12 text-sky-700 dark:text-sky-400",
  },
  payment: {
    icon: Invoice01Icon,
    label: "Facturation",
    tone: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
  },
  review: {
    icon: StarIcon,
    label: "Avis client",
    tone: "bg-yellow-500/12 text-yellow-700 dark:text-yellow-400",
  },
}

const groups = ["Aujourd'hui", "Hier", "Plus tôt"] as const

const vaccineStatus = {
  expired: { label: "Expiré", variant: "error" },
  ok: { label: "À jour", variant: "success" },
  soon: { label: "Expire bientôt", variant: "warning" },
} as const

const panel = "rounded-xl border bg-card p-4"

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
        "flex size-8 shrink-0 items-center justify-center rounded-lg",
        tone,
        className
      )}
    >
      <HugeiconsIcon className="size-4" icon={icon} />
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
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  )
}

function PriceTable({ lines }: { lines: PriceLine[] }) {
  return (
    <dl className={cn(panel, "space-y-2 text-sm")}>
      {lines.map((line) => (
        <div className="flex justify-between gap-4" key={line.label}>
          <dt className="text-muted-foreground">{line.label}</dt>
          <dd className="tabular-nums">{formatEuro(line.amount)}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatEuro(sum(lines))}</dd>
      </div>
    </dl>
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
    <div className={cn("space-y-0.5", end && "text-end")}>
      <span
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground",
          end && "justify-end"
        )}
      >
        <HugeiconsIcon className="size-3.5" icon={icon} />
        {label}
      </span>
      <p className="font-semibold">{day}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  )
}

function BookingDetail({ data }: { data: DataOf<"booking"> }) {
  const { occupied, total } = data.occupancy
  return (
    <>
      <Section title="Séjour demandé">
        <div className={cn(panel, "flex items-center gap-4")}>
          <StayStop icon={Login03Icon} label="Arrivée" {...data.arrival} />
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center gap-1">
              {Array.from({ length: data.nights }, (_, night) => (
                <Fragment key={night}>
                  <span className="h-px flex-1 bg-border" />
                  <HugeiconsIcon
                    className="size-4 text-pension-strong"
                    icon={Moon02Icon}
                  />
                </Fragment>
              ))}
              <span className="h-px flex-1 bg-border" />
            </div>
            <span className="text-xs text-muted-foreground">
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
      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="Hébergement">
          <div className={cn(panel, "space-y-3")}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <HugeiconsIcon
                  className="size-4 text-muted-foreground"
                  icon={BedDoubleIcon}
                />
                {data.box}
              </span>
              <Badge variant="success">Disponible</Badge>
            </div>
            <Meter aria-label="Occupation" max={total} value={occupied}>
              <MeterTrack>
                <MeterIndicator className="bg-pension-strong" />
              </MeterTrack>
            </Meter>
            <p className="text-xs text-muted-foreground">
              {occupied}/{total} box occupés sur la période · {total - occupied}{" "}
              restants
            </p>
          </div>
        </Section>
        <Section title="Animal">
          <div
            className={cn(panel, "flex h-full flex-wrap content-start gap-1.5")}
          >
            {data.petInfo.map((info) => (
              <Badge key={info} variant="outline">
                {info}
              </Badge>
            ))}
          </div>
        </Section>
      </div>
      <Section title="Estimation">
        <PriceTable lines={data.lines} />
      </Section>
      {data.note && (
        <Alert variant="info">
          <HugeiconsIcon icon={QuoteDownIcon} />
          <AlertTitle>Note du client</AlertTitle>
          <AlertDescription>{data.note}</AlertDescription>
        </Alert>
      )}
    </>
  )
}

function MessageDetail({ data }: { data: DataOf<"message"> }) {
  return (
    <>
      <div className={cn(panel, "flex items-center gap-3 text-sm")}>
        <HugeiconsIcon
          className="size-4 text-muted-foreground"
          icon={BedDoubleIcon}
        />
        {data.context}
      </div>
      <Section title="Messages non lus">
        <div className={cn(panel, "space-y-2 bg-muted/40")}>
          {data.messages.map((message) => (
            <div className="flex items-end gap-2" key={message.text}>
              <p className="max-w-[85%] rounded-2xl rounded-es-sm bg-background px-3 py-2 text-sm shadow-xs ring-1 ring-border">
                {message.text}
              </p>
              <span className="text-xs text-muted-foreground">
                {message.time}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

const serviceShades = ["bg-grooming-strong", "bg-grooming", "bg-grooming/50"]

function AppointmentDetail({ data }: { data: DataOf<"appointment"> }) {
  const minutes = data.services.reduce((total, s) => total + s.minutes, 0)
  const price = data.services.reduce((total, s) => total + s.price, 0)
  return (
    <>
      <Section title="Créneau demandé">
        <div className={cn(panel, "flex items-center gap-4")}>
          <div className="w-20 shrink-0 overflow-hidden rounded-lg border text-center">
            <div className="bg-grooming text-grooming-foreground py-0.5 text-xs font-medium">
              {data.weekday}
            </div>
            <div className="pt-1 text-2xl font-semibold">{data.day}</div>
            <div className="pb-1.5 text-xs text-muted-foreground">
              {data.month}
            </div>
          </div>
          <div className="grid flex-1 grid-cols-3 gap-1.5">
            {data.slots.map((slot) => (
              <span
                className={cn(
                  "rounded-md border py-1.5 text-center text-xs tabular-nums",
                  slot.status === "busy" &&
                    "bg-muted text-muted-foreground line-through",
                  slot.status === "requested" &&
                    "border-grooming-strong bg-grooming text-grooming-foreground font-medium"
                )}
                key={slot.time}
              >
                {slot.time}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Avec {data.groomer} · les créneaux barrés sont déjà réservés
        </p>
      </Section>
      <Section
        aside={
          <span className="text-xs text-muted-foreground">
            {formatDuration(minutes)}
          </span>
        }
        title="Prestations"
      >
        <div className={cn(panel, "space-y-3")}>
          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
            {data.services.map((service, i) => (
              <span
                className={serviceShades[i % serviceShades.length]}
                key={service.label}
                style={{ width: `${(service.minutes / minutes) * 100}%` }}
              />
            ))}
          </div>
          <ul className="space-y-2 text-sm">
            {data.services.map((service, i) => (
              <li className="flex items-center gap-2" key={service.label}>
                <span
                  className={cn(
                    "size-2 rounded-full",
                    serviceShades[i % serviceShades.length]
                  )}
                />
                <span className="flex-1">{service.label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {service.minutes} min
                </span>
                <span className="w-14 text-end tabular-nums">
                  {formatEuro(service.price)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t pt-2 text-sm font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatEuro(price)}</span>
          </div>
        </div>
      </Section>
    </>
  )
}

function HealthDetail({ data }: { data: DataOf<"health"> }) {
  return (
    <>
      <Alert variant="warning">
        <HugeiconsIcon icon={Alert02Icon} />
        <AlertTitle>Arrivée prévue le {data.arrival.toLowerCase()}</AlertTitle>
        <AlertDescription>
          Le séjour ne pourra pas être confirmé tant que les vaccins ne sont pas
          à jour.
        </AlertDescription>
      </Alert>
      <Section title="Vaccinations">
        <ul className={cn(panel, "divide-y p-0")}>
          {data.vaccines.map((vaccine) => {
            const status = vaccineStatus[vaccine.status]
            return (
              <li
                className="flex items-center gap-3 px-4 py-3"
                key={vaccine.name}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <HugeiconsIcon className="size-4" icon={InjectionIcon} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{vaccine.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {vaccine.date}
                  </p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </li>
            )
          })}
        </ul>
      </Section>
    </>
  )
}

function PaymentDetail({ data }: { data: DataOf<"payment"> }) {
  const paid = data.status === "paid"
  return (
    <>
      <div
        className={cn(panel, "flex flex-wrap items-end justify-between gap-4")}
      >
        <div>
          <p className="text-xs text-muted-foreground">
            Facture {data.invoice}
          </p>
          <p className="text-3xl font-semibold tabular-nums">
            {formatEuro(sum(data.lines))}
          </p>
        </div>
        <div className="space-y-1 text-end">
          <Badge variant={paid ? "success" : "error"}>
            {paid ? "Payée" : `${data.daysLate} jours de retard`}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {paid ? data.method : `Échéance le ${data.due}`}
          </p>
        </div>
      </div>
      <Section title="Détail">
        <PriceTable lines={data.lines} />
      </Section>
      <Section title="Historique">
        <ol className="ms-1 space-y-3 border-s ps-4">
          {data.history.map((step, i) => (
            <li className="relative text-sm" key={step.label}>
              <span
                className={cn(
                  "absolute start-[calc(-1rem-4.5px)] top-1.5 size-2 rounded-full",
                  i < data.history.length - 1
                    ? "bg-muted-foreground/40"
                    : paid
                      ? "bg-success"
                      : "bg-amber-500"
                )}
              />
              <span className="font-medium">{step.label}</span>
              <span className="text-muted-foreground"> · {step.date}</span>
            </li>
          ))}
        </ol>
      </Section>
    </>
  )
}

function CapacityDetail({ data }: { data: DataOf<"capacity"> }) {
  return (
    <>
      <Section title="Occupation des box">
        <div className={cn(panel, "flex h-56 items-end justify-around gap-3")}>
          {data.days.map((day) => {
            const ratio = day.occupied / day.total
            const full = ratio >= 1
            return (
              <div
                className="flex h-full max-w-16 flex-1 flex-col items-center gap-2"
                key={day.label}
              >
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    full && "text-orange-600 dark:text-orange-400"
                  )}
                >
                  {day.occupied}/{day.total}
                </span>
                <div className="relative w-full flex-1 overflow-hidden rounded-lg bg-muted">
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 rounded-lg",
                      full ? "bg-orange-500" : "bg-pension-strong"
                    )}
                    style={{ height: `${ratio * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {day.label}
                </span>
              </div>
            )
          })}
        </div>
      </Section>
      <Alert variant="warning">
        <HugeiconsIcon icon={Clock01Icon} />
        <AlertTitle>
          {data.waiting} demandes en attente sur ces dates
        </AlertTitle>
        <AlertDescription>
          La liste d&apos;attente les placera automatiquement en cas
          d&apos;annulation.
        </AlertDescription>
      </Alert>
    </>
  )
}

function ReviewDetail({ data }: { data: DataOf<"review"> }) {
  return (
    <div className={cn(panel, "space-y-4")}>
      <div className="flex items-center justify-between">
        <div
          aria-label={`${data.rating} sur 5`}
          className="text-2xl tracking-widest text-amber-400"
          role="img"
        >
          {"★".repeat(data.rating)}
          <span className="text-muted">{"★".repeat(5 - data.rating)}</span>
        </div>
        <Badge variant="outline">{data.source}</Badge>
      </div>
      <blockquote className="flex gap-3 leading-relaxed">
        <HugeiconsIcon
          className="size-5 shrink-0 text-muted-foreground"
          icon={QuoteDownIcon}
        />
        {data.text}
      </blockquote>
    </div>
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
  return (
    <>
      <div className="flex h-12 shrink-0 items-center gap-1 border-b px-2">
        <Button
          aria-label="Retour à la liste"
          className="md:hidden"
          onClick={onBack}
          size="icon-sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>
        <Button onClick={onArchive} size="sm" variant="ghost">
          <HugeiconsIcon icon={Archive01Icon} />
          Archiver
        </Button>
        <Button onClick={onMarkUnread} size="sm" variant="ghost">
          <HugeiconsIcon icon={MailOpen01Icon} />
          Marquer non lu
        </Button>
        <span className="ms-auto hidden pe-2 text-xs text-muted-foreground sm:block">
          {item.group} · {item.time}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <article className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
          <header className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <KindTile
                className="size-6 rounded-md [&_svg]:size-3.5"
                kind={item.kind}
              />
              {meta.label}
              {item.activity && (
                <>
                  <span aria-hidden="true">·</span>
                  <ActivityMark
                    activity={item.activity}
                    className="size-4 rounded text-[0.5rem]"
                  />
                  {item.activity}
                </>
              )}
            </div>
            <h2 className="font-heading text-xl font-semibold">{item.title}</h2>
            {item.client && (
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>{item.client.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {item.client.name}
                    {item.kind === "booking" && item.data.newClient && (
                      <Badge variant="info">Nouveau client</Badge>
                    )}
                  </p>
                  {item.pet && (
                    <p className="text-xs text-muted-foreground">{item.pet}</p>
                  )}
                </div>
                <Button aria-label="Appeler" size="icon-sm" variant="outline">
                  <HugeiconsIcon icon={Call02Icon} />
                </Button>
              </div>
            )}
          </header>

          {resolution && (
            <Alert variant="success">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} />
              <AlertTitle>{resolution}</AlertTitle>
              <AlertAction>
                <Button onClick={onUndo} size="xs" variant="ghost">
                  Annuler
                </Button>
              </AlertAction>
            </Alert>
          )}

          <ItemBody item={item} />
        </article>
      </div>

      <footer className="flex flex-wrap justify-end gap-2 border-t p-3">
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
        "flex w-full gap-3 rounded-lg p-2.5 text-start hover:bg-accent",
        active && "bg-accent"
      )}
      onClick={onSelect}
      type="button"
    >
      <KindTile kind={item.kind} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm",
              item.unread ? "font-semibold" : "font-medium"
            )}
          >
            {item.title}
          </span>
          <span className="ms-auto shrink-0 text-xs text-muted-foreground">
            {item.time}
          </span>
        </div>
        <p
          className={cn(
            "truncate text-xs",
            item.unread ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {item.preview}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {item.activity && (
            <ActivityMark
              activity={item.activity}
              className="size-3.5 rounded-sm text-[0.5rem]"
            />
          )}
          <span className="truncate">{item.client?.name ?? item.activity}</span>
          {resolved && (
            <Badge size="sm" variant="success">
              Traité
            </Badge>
          )}
          {item.unread && (
            <span className="ms-auto size-2 shrink-0 rounded-full bg-success">
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

  const setResolution = (id: string, label?: string) =>
    setResolved((current) => {
      const next = { ...current }
      if (label) next[id] = label
      else delete next[id]
      return next
    })

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-sm font-medium">Boîte de réception</h1>
        <Button
          className="ms-auto"
          disabled={unreadCount === 0}
          onClick={() =>
            setItems((list) => list.map((item) => ({ ...item, unread: false })))
          }
          size="sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={Tick02Icon} />
          Tout marquer comme lu
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "w-full shrink-0 flex-col border-e md:flex md:w-96",
            showDetail ? "hidden" : "flex"
          )}
        >
          <div className="p-3">
            <Tabs
              onValueChange={(value) => setFilter(value as Filter)}
              value={filter}
            >
              <TabsList className="w-full" size="sm">
                <TabsTab className="flex-1" value="all">
                  Tout
                </TabsTab>
                <TabsTab className="flex-1 gap-1.5" value="unread">
                  Non lus
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {unreadCount}
                  </span>
                </TabsTab>
                <TabsTab className="flex-1 gap-1.5" value="todo">
                  À traiter
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {todoCount}
                  </span>
                </TabsTab>
              </TabsList>
            </Tabs>
          </div>
          <nav
            aria-label="Notifications"
            className="flex-1 overflow-y-auto px-2 pb-2"
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
                  <h2 className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
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
            "min-w-0 flex-1 flex-col md:flex",
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
    </>
  )
}
