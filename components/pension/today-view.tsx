"use client"

import {
  Alert02Icon,
  ArrowRight01Icon,
  CalendarAdd01Icon,
  Call02Icon,
  Camera01Icon,
  CleaningBucketIcon,
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
import { hourOf } from "@/components/agenda/agenda"
import { shortDate } from "@/components/calendar"
import { CheckFlow } from "@/components/pension/check-flow"
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
  stays as initialStays,
} from "@/components/pension/data"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import { stayRequests } from "@/components/pension/requests"
import { careTasks, NOW } from "@/components/today/data"
import {
  ActivityDayPage,
  type Attention,
  AttentionList,
  Bar,
  formatAmount,
  formatHour,
  Section,
  type Task,
  TaskList,
} from "@/components/today/widgets"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
    free: { className: "bg-background text-muted-foreground", label: "Libre" },
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
        "flex min-h-16 flex-col justify-between rounded-xl p-1.5 text-start text-xs transition-shadow",
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
    <Section
      action={
        <Button
          render={<Link href="/pension/planning" />}
          size="sm"
          variant="ghost"
        >
          Calendrier
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      }
      className={className}
      title="Plan du chenil"
    >
      <div className="space-y-4 rounded-3xl bg-muted p-4">
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
        <div className="rounded-2xl bg-background p-3">
          <KennelDetail kennel={selected} />
        </div>
      </div>
    </Section>
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

/** La journée découpée en moments, pour ne voir que ce qui compte maintenant. */
const moments = [
  { from: 0, label: "Matin", to: 12 },
  { from: 12, label: "Midi", to: 14 },
  { from: 14, label: "Après-midi", to: 18 },
  { from: 18, label: "Soir", to: 24 },
]

const momentOf = (hour: number) =>
  Math.max(
    0,
    moments.findIndex((m) => hour >= m.from && hour < m.to)
  )

export function PensionTodayView() {
  const [kennels, setKennels] = useState(initialKennels)
  const [movements, setMovements] = useState(stayMovements)
  const [meals, setMeals] = useState(initialMeals)
  const [stays, setStays] = useState(initialStays)
  const [newsSent, setNewsSent] = useState(false)
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([...careTasks, ...cleaning].map((t) => [t.id, t.done]))
  )
  const [moment, setMoment] = useState(() => momentOf(NOW))
  const [flowId, setFlowId] = useState<string | null>(null)
  const [flowOpen, setFlowOpen] = useState(false)
  const present = kennels.filter(isPresent).length
  const arrivals = movements.filter((m) => m.type === "arrival")
  const departures = movements.filter((m) => m.type === "departure")
  const diets = kennels.filter((k) => k.diet && k.status !== "free")
  const news = ownerNews.filter((n) => !n.sent)
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

  const attention: Attention[] = [
    ...movements
      .filter((m) => m.status === "late")
      .map((m) => {
        const arrival = m.type === "arrival"
        return {
          actions: (
            <>
              <Button className="bg-background" variant="outline">
                <HugeiconsIcon icon={Call02Icon} />
                Appeler {m.owner.split(" ")[0]}
              </Button>
              <Button onClick={() => openFlow(m)}>
                {arrival ? "Enregistrer l'arrivée" : "Valider le départ"}
              </Button>
            </>
          ),
          detail: [
            `Prévu à ${formatHour(hourOf(m.time))}`,
            m.kennel,
            m.owner,
            !arrival && m.balance
              ? `reste ${formatAmount(m.balance)} à régler`
              : undefined,
          ]
            .filter(Boolean)
            .join(" · "),
          icon: arrival ? Login03Icon : Logout03Icon,
          id: m.id,
          title: `${arrival ? "Arrivée" : "Départ"} de ${m.pet} · en retard`,
          tone: "bg-destructive-soft text-destructive",
        }
      }),
    ...stayRequests(stays, {
      decline: (id) => setStays((list) => list.filter((s) => s.id !== id)),
      update: (id, patch) =>
        setStays((list) =>
          list.map((s) => (s.id === id ? { ...s, ...patch } : s))
        ),
    }),
  ]

  /** Arrivées et départs ; un retard reste en haut, dans « À traiter ». */
  const moveTasks = (list: StayMovement[]): Task[] =>
    list
      .filter((m) => m.status !== "late")
      .map((m) => {
        const arrival = m.type === "arrival"
        return {
          action: {
            label: arrival ? "Enregistrer" : "Valider",
            onClick: () => openFlow(m),
          },
          detail: [
            m.kennel,
            m.owner,
            !arrival && m.balance
              ? `reste ${formatAmount(m.balance)}`
              : undefined,
          ]
            .filter(Boolean)
            .join(" · "),
          done: m.status === "done",
          icon: arrival ? Login03Icon : Logout03Icon,
          id: m.id,
          time: hourOf(m.time),
          title: m.pet,
          tone: "bg-pension text-pension-foreground",
        }
      })

  const dayTasks: Task[] = [
    ...careTasks.map((t) => ({
      action: { label: "C'est fait", onClick: () => toggle(t.id) },
      detail: `${t.task} · ${t.box}`,
      done: done[t.id],
      icon: MedicineBottle01Icon,
      id: t.id,
      time: hourOf(t.time),
      title: `Soin de ${t.pet}`,
      tone: "bg-wise-pink text-wise-purple",
    })),
    ...meals.map((meal) => ({
      action: {
        label: "Servi",
        onClick: () =>
          setMeals((list) =>
            list.map((m) => (m.id === meal.id ? { ...m, served: m.total } : m))
          ),
      },
      detail: `${meal.total} gamelles${diets.length ? ` · régimes : ${diets.map((k) => k.pet).join(", ")}` : ""}`,
      done: meal.served === meal.total,
      icon: Restaurant01Icon,
      id: meal.id,
      time: meal.start,
      title: `Repas du ${meal.label.toLowerCase()}`,
      tone: "bg-wise-yellow text-wise-gold",
    })),
    ...outings.map((o) => ({
      detail: `${o.place} · ${o.pets.join(", ")}`,
      done: o.end <= NOW,
      icon: WalkingIcon,
      id: o.id,
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
      time: c.time,
      title: c.label,
      tone: "bg-wise-blue text-wise-charcoal",
    })),
    {
      action: { label: "Envoyer", onClick: () => setNewsSent(true) },
      detail: `${news.map((n) => n.pet).join(", ")} attendent une photo`,
      done: newsSent || news.length === 0,
      icon: Camera01Icon,
      id: "news",
      time: 17,
      title: "Nouvelles aux propriétaires",
      tone: "bg-background",
    },
  ]
  const tasksOf = (i: number) =>
    dayTasks
      .filter((t) => momentOf(t.time ?? 0) === i)
      .sort((a, b) => (a.time ?? 0) - (b.time ?? 0))
  const momentTasks = tasksOf(moment)
  const left = (list: Task[]) => list.filter((t) => !t.done).length

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
          {present} pensionnaires sur {kennels.length} places, {arrivals.length}{" "}
          arrivées et {departures.length} départs aujourd&apos;hui.
        </>
      }
    >
      <Section count={attention.length || undefined} title="À traiter">
        <AttentionList
          items={attention}
          limit={3}
          moreHref="/pension/planning"
        />
      </Section>

      <div className="grid items-start gap-8 md:grid-cols-2">
        <Section count={left(moveTasks(arrivals))} title="Arrivées">
          <TaskList
            empty="Tout le monde est arrivé"
            tasks={moveTasks(arrivals)}
          />
        </Section>
        <Section count={left(moveTasks(departures))} title="Départs">
          <TaskList
            empty="Tous les départs sont faits"
            tasks={moveTasks(departures)}
          />
        </Section>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-3">
        <Section
          className="lg:col-span-2"
          action={
            <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
              <div
                aria-label="Moment de la journée"
                className="flex w-max gap-1 rounded-full bg-muted p-1"
                role="tablist"
              >
                {moments.map((m, i) => {
                  const count = left(tasksOf(i))
                  return (
                    <button
                      aria-selected={i === moment}
                      className={cn(
                        "flex h-11 items-center gap-2 rounded-full px-4 font-semibold transition-colors",
                        i === moment
                          ? "bg-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      key={m.label}
                      onClick={() => setMoment(i)}
                      role="tab"
                      type="button"
                    >
                      {m.label}
                      {count > 0 ? (
                        <span className="rounded-full bg-control px-2 text-xs text-control-foreground tabular-nums">
                          {count}
                        </span>
                      ) : (
                        <HugeiconsIcon className="size-4" icon={Tick02Icon} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          }
          title="La journée"
        >
          <TaskList
            empty={
              momentTasks.length
                ? "Tout est fait pour ce moment"
                : "Rien de prévu pour ce moment"
            }
            key={moment}
            tasks={momentTasks}
          />
        </Section>
        <KennelMap kennels={kennels} />
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
