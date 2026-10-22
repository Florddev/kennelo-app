"use client"

import {
  hourOf,
  NowCard,
  Timeline,
  type TimelineItem,
} from "@/components/agenda/agenda"
import {
  Alert02Icon,
  ArrowRight01Icon,
  BedDoubleIcon,
  Call02Icon,
  Camera01Icon,
  CleaningBucketIcon,
  CalendarAdd01Icon,
  Login03Icon,
  Logout03Icon,
  MedicineBottle01Icon,
  PrinterIcon,
  Restaurant01Icon,
  Tick02Icon,
  WalkingIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import { shortDate } from "@/components/calendar"
import {
  type Kennel,
  type KennelStatus,
  kennels as initialKennels,
  meals as initialMeals,
  outings,
  ownerNews,
  type StayMovement,
  stayMovements,
  stayProgress,
} from "@/components/pension/data"
import { careTasks, NOW } from "@/components/today/data"
import { formatHour } from "@/components/today/widgets"
import {
  ActivityDayPage,
  Bar,
  formatAmount,
  Kpi,
  Widget,
} from "@/components/today/widgets"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckFlow } from "@/components/pension/check-flow"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const kennelStyles: Record<KennelStatus, { label: string; className: string }> =
  {
    arriving: {
      className:
        "border-2 border-dashed border-pension-strong text-pension-strong",
      label: "Arrivée prévue",
    },
    cleaning: {
      className: "bg-wise-blue/70 text-wise-charcoal",
      label: "Nettoyage",
    },
    departing: {
      className: "bg-warning text-warning-foreground",
      label: "Départ prévu",
    },
    free: { className: "bg-muted text-muted-foreground", label: "Libre" },
    occupied: {
      className: "bg-pension text-pension-foreground",
      label: "Occupé",
    },
  }

const isPresent = (k: Kennel) =>
  k.status === "occupied" || k.status === "departing"

const kennelIdOf = (label: string) =>
  label.startsWith("Box ")
    ? `b${label.slice(4)}`
    : `c${label.replace("Chatterie ", "")}`

function KennelTile({
  kennel,
  selected,
  onSelect,
}: {
  kennel: Kennel
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      className={cn(
        "flex min-h-16 flex-col justify-between rounded-lg p-1.5 text-start text-xs transition-shadow",
        kennelStyles[kennel.status].className,
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
      )}
      onClick={onSelect}
      title={`${kennel.area} ${kennel.label} · ${kennelStyles[kennel.status].label}`}
      type="button"
    >
      <span className="flex items-center justify-between gap-1 opacity-80">
        <span className="font-semibold tabular-nums">{kennel.label}</span>
        <span className="flex gap-0.5">
          {kennel.meds && (
            <HugeiconsIcon className="size-3" icon={MedicineBottle01Icon} />
          )}
          {kennel.diet && (
            <HugeiconsIcon className="size-3" icon={Restaurant01Icon} />
          )}
          {kennel.warning && (
            <HugeiconsIcon className="size-3" icon={Alert02Icon} />
          )}
        </span>
      </span>
      <span className="truncate font-semibold">
        {kennel.status === "cleaning"
          ? "Nettoyage"
          : kennel.status === "free"
            ? "Libre"
            : kennel.pet}
      </span>
    </button>
  )
}

function KennelDetail({ kennel }: { kennel: Kennel }) {
  if (!kennel.pet || !kennel.stay) {
    return (
      <p className="text-sm text-muted-foreground">
        {kennel.area} {kennel.label} · {kennelStyles[kennel.status].label}.
        {kennel.status === "free" && " Disponible pour une nouvelle arrivée."}
      </p>
    )
  }
  const { elapsed, label, nights } = stayProgress(kennel.stay)
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="min-w-48 flex-1 space-y-1">
        <p className="font-semibold">
          {kennel.pet}{" "}
          <span className="font-normal text-muted-foreground">
            · {kennel.breed}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          {kennel.owner} · {kennel.area} {kennel.label}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {kennel.meds && (
            <Badge variant="info">
              <HugeiconsIcon icon={MedicineBottle01Icon} />
              {kennel.meds}
            </Badge>
          )}
          {kennel.diet && (
            <Badge variant="outline">
              <HugeiconsIcon icon={Restaurant01Icon} />
              {kennel.diet}
            </Badge>
          )}
          {kennel.warning && (
            <Badge variant="warning">
              <HugeiconsIcon icon={Alert02Icon} />
              {kennel.warning}
            </Badge>
          )}
        </div>
      </div>
      <div className="w-full space-y-1.5 sm:w-56">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>Départ {shortDate(kennel.stay.departure)}</span>
        </div>
        <Bar
          className="bg-pension-strong"
          label="Avancement du séjour"
          value={(elapsed / nights) * 100}
        />
      </div>
    </div>
  )
}

function KennelMap({
  kennels,
  className,
}: {
  kennels: Kennel[]
  className?: string
}) {
  const [selectedId, setSelectedId] = useState("b4")
  const selected = kennels.find((k) => k.id === selectedId) ?? kennels[0]
  const countOf = (status: KennelStatus) =>
    kennels.filter((k) => k.status === status).length
  return (
    <Widget
      action={
        <Button
          render={<Link href="/pension/planning" />}
          size="sm"
          variant="ghost"
        >
          Planning des box
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      }
      className={className}
      description={`${kennels.filter(isPresent).length} pensionnaires sur ${kennels.length} places`}
      title="Plan du chenil"
    >
      <div className="space-y-4">
        {(["Chenil", "Chatterie"] as const).map((area) => (
          <div key={area}>
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              {area}
            </p>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
              {kennels
                .filter((k) => k.area === area)
                .map((kennel) => (
                  <KennelTile
                    kennel={kennel}
                    key={kennel.id}
                    onSelect={() => setSelectedId(kennel.id)}
                    selected={kennel.id === selected.id}
                  />
                ))}
            </div>
          </div>
        ))}
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {(Object.keys(kennelStyles) as KennelStatus[]).map((status) => (
            <li className="flex items-center gap-1.5" key={status}>
              <span
                className={cn(
                  "size-2.5 rounded-sm",
                  kennelStyles[status].className
                )}
              />
              <span className="text-muted-foreground">
                {kennelStyles[status].label}
              </span>
              <span className="font-semibold tabular-nums">
                {countOf(status)}
              </span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border bg-muted/40 p-3">
          <KennelDetail kennel={selected} />
        </div>
      </div>
    </Widget>
  )
}

function NewsCard() {
  const [news, setNews] = useState(ownerNews)
  const sent = news.filter((n) => n.sent).length
  return (
    <Widget
      description={`${sent} sur ${news.length} envoyées`}
      title="Nouvelles aux propriétaires"
    >
      <ul className="divide-y">
        {news.map((n) => (
          <li
            className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            key={n.id}
          >
            <Avatar className="size-10">
              <AvatarFallback className="text-xs">{n.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-semibold">{n.pet}</span>
                <span className="text-muted-foreground"> · {n.owner}</span>
              </p>
              <p className="truncate text-sm text-muted-foreground">
                « {n.note} »
              </p>
            </div>
            {n.sent ? (
              <Badge variant="success">
                <HugeiconsIcon icon={Tick02Icon} />
                Envoyée
              </Badge>
            ) : (
              <Button
                onClick={() =>
                  setNews((list) =>
                    list.map((i) => (i.id === n.id ? { ...i, sent: true } : i))
                  )
                }
                size="sm"
                variant="outline"
              >
                <HugeiconsIcon icon={Camera01Icon} />
                Photo
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Widget>
  )
}

const cleaning = [
  {
    detail: "Après le départ de Caramel",
    done: false,
    id: "b5",
    label: "Désinfecter le box 5",
    time: 8.5,
  },
  {
    detail: "Après le départ de Pixel",
    done: false,
    id: "b14",
    label: "Désinfecter le box 14",
    time: 10.5,
  },
  {
    detail: "Couverture et gamelles, avant l'arrivée de Gaïa",
    done: true,
    id: "b9",
    label: "Préparer le box 9",
    time: 11,
  },
  {
    detail: "Avant l'arrivée de Tango",
    done: false,
    id: "b12",
    label: "Préparer le box 12",
    time: 13.5,
  },
  {
    detail: "Litière neuve avant l'arrivée de Mochi",
    done: false,
    id: "c3",
    label: "Préparer la chatterie 3",
    time: 17,
  },
]

const filters = [
  { label: "Arrivées & départs", value: "moves" },
  { label: "Soins", value: "care" },
  { label: "Repas", value: "meals" },
  { label: "Sorties", value: "outings" },
  { label: "Ménage", value: "cleaning" },
]

export function PensionTodayView() {
  const [kennels, setKennels] = useState(initialKennels)
  const [movements, setMovements] = useState(stayMovements)
  const [meals, setMeals] = useState(initialMeals)
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([...careTasks, ...cleaning].map((t) => [t.id, t.done]))
  )
  const [flowId, setFlowId] = useState<string | null>(null)
  const [flowOpen, setFlowOpen] = useState(false)
  const present = kennels.filter(isPresent).length
  const count = (type: StayMovement["type"]) =>
    movements.filter((m) => m.type === type)
  const doneOf = (type: StayMovement["type"]) =>
    count(type).filter((m) => m.status === "done").length
  const late = movements.filter((m) => m.status === "late").length
  const pendingCare = careTasks.filter((t) => !done[t.id])
  const diets = kennels.filter((k) => k.diet && k.status !== "free")
  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: true }))
  const openFlow = (m: StayMovement) => {
    setFlowId(m.id)
    setFlowOpen(true)
  }

  const complete = (movement: StayMovement) => {
    const status: KennelStatus =
      movement.type === "arrival" ? "occupied" : "cleaning"
    const id = kennelIdOf(movement.kennel)
    setMovements((list) =>
      list.map((m) => (m.id === movement.id ? { ...m, status: "done" } : m))
    )
    setKennels((list) => list.map((k) => (k.id === id ? { ...k, status } : k)))
  }

  const items: TimelineItem[] = [
    ...movements.map((m) => {
      const arrival = m.type === "arrival"
      return {
        action: {
          label: arrival ? "Enregistrer l'arrivée" : "Valider le départ",
          onClick: () => openFlow(m),
        },
        detail: [
          m.kennel,
          m.owner,
          arrival
            ? m.checks?.join(", ")
            : m.balance
              ? `reste ${formatAmount(m.balance)} à régler`
              : undefined,
        ]
          .filter(Boolean)
          .join(" · "),
        done: m.status === "done",
        icon: arrival ? Login03Icon : Logout03Icon,
        id: m.id,
        kind: "moves",
        late: m.status === "late",
        time: hourOf(m.time),
        title: `${arrival ? "Arrivée" : "Départ"} de ${m.pet}`,
        tone: "bg-pension text-pension-foreground",
      }
    }),
    ...careTasks.map((t) => ({
      action: { label: "C'est fait", onClick: () => toggle(t.id) },
      detail: `${t.task} · ${t.box}`,
      done: done[t.id],
      icon: MedicineBottle01Icon,
      id: t.id,
      kind: "care",
      time: hourOf(t.time),
      title: `Soin de ${t.pet}`,
      tone: "bg-wise-pink text-wise-purple",
    })),
    ...meals.map((meal) => ({
      action: {
        label: "Repas servi",
        onClick: () =>
          setMeals((list) =>
            list.map((m) => (m.id === meal.id ? { ...m, served: m.total } : m))
          ),
      },
      detail: `${meal.total} gamelles${diets.length ? ` · régimes : ${diets.map((k) => k.pet).join(", ")}` : ""}`,
      done: meal.served === meal.total,
      icon: Restaurant01Icon,
      id: meal.id,
      kind: "meals",
      time: meal.start,
      title: `Repas du ${meal.label.toLowerCase()}`,
      tone: "bg-wise-yellow text-wise-gold",
    })),
    ...outings.map((o) => ({
      detail: `${o.place} · ${o.pets.join(", ")}`,
      done: o.end <= NOW,
      icon: WalkingIcon,
      id: o.id,
      kind: "outings",
      time: o.start,
      title: o.label,
      tone: "bg-wise-green text-wise-forest",
    })),
    ...cleaning.map((c) => ({
      action: { label: "C'est fait", onClick: () => toggle(c.id) },
      detail: c.detail,
      done: done[c.id],
      icon: CleaningBucketIcon,
      id: c.id,
      kind: "cleaning",
      time: c.time,
      title: c.label,
      tone: "bg-wise-blue text-wise-charcoal",
    })),
  ]
  const now = items
    .filter((i) => !i.done && i.action)
    .sort(
      (a, b) => Number(b.late ?? 0) - Number(a.late ?? 0) || a.time - b.time
    )[0]
  const nowMove = movements.find((m) => m.id === now?.id)

  return (
    <ActivityDayPage
      actions={
        <>
          <Button className="max-sm:hidden" variant="outline">
            <HugeiconsIcon icon={PrinterIcon} />
            Feuille de soins
          </Button>
          <NewStayDialog
            trigger={
              <Button>
                <HugeiconsIcon icon={CalendarAdd01Icon} />
                Nouveau séjour
              </Button>
            }
          />
        </>
      }
      activity="Pension"
      aside={
        <div className="flex h-10 items-center gap-2 rounded-full bg-muted ps-1 pe-4 text-sm font-semibold">
          <Avatar className="size-8">
            <AvatarFallback className="bg-background text-xs">
              CL
            </AvatarFallback>
          </Avatar>
          Claire
          <span className="font-normal text-muted-foreground">
            · de garde 7h – 15h
          </span>
        </div>
      }
      summary={
        <>
          {present} pensionnaires, {count("arrival").length} arrivées et{" "}
          {count("departure").length} départs prévus.
        </>
      }
    >
      {now && (
        <NowCard
          actions={
            <>
              {nowMove?.status === "late" && (
                <Button size="lg" variant="secondary">
                  <HugeiconsIcon icon={Call02Icon} />
                  Appeler {nowMove.owner.split(" ")[0]}
                </Button>
              )}
              <Button onClick={now.action?.onClick} size="lg">
                {now.action?.label}
              </Button>
            </>
          }
          detail={now.detail}
          eyebrow={
            now.late
              ? `En retard · prévu à ${formatHour(now.time)}`
              : `À faire maintenant · ${formatHour(now.time)}`
          }
          media={
            <span
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-full",
                now.late ? "bg-destructive-soft text-destructive" : now.tone
              )}
            >
              <HugeiconsIcon className="size-7" icon={now.icon} />
            </span>
          }
          title={now.title}
        />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          icon={BedDoubleIcon}
          label="Pensionnaires"
          value={
            <>
              {present}
              <span className="text-base text-muted-foreground">
                {" "}
                / {kennels.length}
              </span>
            </>
          }
        >
          <Bar
            className="bg-pension-strong"
            label="Taux d'occupation"
            value={(present / kennels.length) * 100}
          />
          <p className="mt-1.5">
            {Math.round((present / kennels.length) * 100)} % d&apos;occupation
          </p>
        </Kpi>
        <Kpi
          icon={Login03Icon}
          label="Arrivées"
          value={`${doneOf("arrival")} / ${count("arrival").length}`}
        >
          {count("arrival").length - doneOf("arrival")} encore attendues
        </Kpi>
        <Kpi
          icon={Logout03Icon}
          label="Départs"
          value={`${doneOf("departure")} / ${count("departure").length}`}
        >
          {late > 0 ? (
            <span className="text-destructive-foreground">
              {late} en retard
            </span>
          ) : (
            "Tous dans les temps"
          )}
        </Kpi>
        <Kpi
          icon={MedicineBottle01Icon}
          label="Soins à faire"
          value={pendingCare.length}
        >
          {pendingCare[0]
            ? `Prochain à ${pendingCare[0].time.replace(":", "h")} · ${pendingCare[0].pet}`
            : "Tous faits"}
        </Kpi>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Widget
          className="lg:col-span-2"
          description="Tout ce qui est prévu aujourd'hui, dans l'ordre"
          title="Programme de la journée"
        >
          <Timeline filters={filters} items={items} />
        </Widget>
        <div className="space-y-6">
          <KennelMap kennels={kennels} />
          <NewsCard />
        </div>
      </div>

      <CheckFlow
        movement={movements.find((m) => m.id === flowId) ?? null}
        onComplete={complete}
        onOpenChange={setFlowOpen}
        open={flowOpen}
      />
    </ActivityDayPage>
  )
}
