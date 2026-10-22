"use client"

import {
  Alert02Icon,
  ArrowRight01Icon,
  BedDoubleIcon,
  Call02Icon,
  Camera01Icon,
  CalendarAdd01Icon,
  Login03Icon,
  Logout03Icon,
  MedicineBottle01Icon,
  PrinterIcon,
  Restaurant01Icon,
  SunCloud01Icon,
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
import {
  ActivityDayPage,
  Bar,
  ChecklistWidget,
  formatAmount,
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
      className: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
      label: "Nettoyage",
    },
    departing: { className: "bg-amber-500 text-white", label: "Départ prévu" },
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
        <span className="font-medium tabular-nums">{kennel.label}</span>
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
        <p className="font-medium">
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
          size="xs"
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
            <p className="mb-2 text-xs font-medium text-muted-foreground">
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
              <span className="font-medium tabular-nums">
                {countOf(status)}
              </span>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border bg-muted/40 p-3">
          <KennelDetail kennel={selected} />
        </div>
      </div>
    </Widget>
  )
}

function MovementsCard({
  movements,
  onComplete,
}: {
  movements: StayMovement[]
  onComplete: (movement: StayMovement) => void
}) {
  const done = movements.filter((m) => m.status === "done").length
  return (
    <Widget
      description={`${done} sur ${movements.length} effectués`}
      title="Arrivées & départs"
    >
      <ol className="relative space-y-4 before:absolute before:inset-y-1 before:start-3.5 before:w-px before:bg-border">
        {movements.map((m) => {
          const arrival = m.type === "arrival"
          return (
            <li className="relative flex gap-3" key={m.id}>
              <span
                className={cn(
                  "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-background",
                  m.status === "done" &&
                    "border-pension-strong bg-pension text-pension-foreground",
                  m.status === "late" && "border-destructive text-destructive"
                )}
              >
                <HugeiconsIcon
                  className="size-3.5"
                  icon={
                    m.status === "done"
                      ? Tick02Icon
                      : arrival
                        ? Login03Icon
                        : Logout03Icon
                  }
                />
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-medium">{m.pet}</span>
                  <span className="text-xs text-muted-foreground">
                    {m.time} · {arrival ? "Arrivée" : "Départ"} · {m.kennel}
                  </span>
                  {m.status === "late" && (
                    <Badge size="sm" variant="error">
                      En retard
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{m.owner}</p>
                {m.status !== "done" && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {arrival ? (
                      m.checks?.map((check) => (
                        <Badge key={check} size="sm" variant="outline">
                          {check}
                        </Badge>
                      ))
                    ) : (
                      <Badge size="sm" variant="secondary">
                        Solde {formatAmount(m.balance ?? 0)}
                      </Badge>
                    )}
                    <Button
                      className="ms-auto"
                      onClick={() => onComplete(m)}
                      size="xs"
                      variant="outline"
                    >
                      {arrival
                        ? "Enregistrer l'arrivée"
                        : "Encaisser & valider"}
                    </Button>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </Widget>
  )
}

function MealsCard({ kennels }: { kennels: Kennel[] }) {
  const [meals, setMeals] = useState(initialMeals)
  const next = meals.find((meal) => meal.served < meal.total)
  const diets = kennels.filter((k) => k.diet && k.status !== "free")
  return (
    <Widget description="3 services par jour" title="Repas">
      <ul className="space-y-3">
        {meals.map((meal) => {
          const complete = meal.served === meal.total
          return (
            <li className="space-y-1.5" key={meal.id}>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{meal.label}</span>
                <span className="text-xs text-muted-foreground">
                  {meal.time}
                </span>
                <span className="ms-auto text-xs text-muted-foreground tabular-nums">
                  {meal.served} / {meal.total}
                </span>
                {complete ? (
                  <Badge size="sm" variant="success">
                    Servi
                  </Badge>
                ) : meal.id === next?.id ? (
                  <Button
                    onClick={() =>
                      setMeals((list) =>
                        list.map((m) =>
                          m.id === meal.id ? { ...m, served: m.total } : m
                        )
                      )
                    }
                    size="xs"
                    variant="outline"
                  >
                    Valider
                  </Button>
                ) : (
                  <Badge size="sm" variant="outline">
                    À venir
                  </Badge>
                )}
              </div>
              <Bar
                className="bg-pension-strong"
                label={`Repas du ${meal.label.toLowerCase()}`}
                value={(meal.served / meal.total) * 100}
              />
            </li>
          )
        })}
      </ul>
      <div className="mt-4 border-t pt-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Régimes particuliers
        </p>
        <ul className="space-y-2">
          {diets.map((k) => (
            <li className="flex items-start gap-2 text-sm" key={k.id}>
              <HugeiconsIcon
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                icon={Restaurant01Icon}
              />
              <span>
                <span className="font-medium">{k.pet}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {k.area} {k.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {k.diet}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Widget>
  )
}

function OutingsCard() {
  return (
    <Widget
      action={
        <Badge variant="outline">
          <HugeiconsIcon className="text-amber-500" icon={SunCloud01Icon} />
          16 °C · sec
        </Badge>
      }
      description="Groupes constitués selon les affinités"
      title="Sorties & promenades"
    >
      <ol className="space-y-3">
        {outings.map((outing) => {
          const past = outing.end <= NOW
          const live = outing.start <= NOW && NOW < outing.end
          return (
            <li
              className={cn("flex gap-3", past && "opacity-50")}
              key={outing.id}
            >
              <span className="w-11 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
                {outing.time}
              </span>
              <div
                className={cn(
                  "min-w-0 flex-1 rounded-lg border p-2.5",
                  live && "border-orange-500/60 bg-orange-500/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    className="size-4 shrink-0 text-muted-foreground"
                    icon={WalkingIcon}
                  />
                  <span className="truncate text-sm font-medium">
                    {outing.label}
                  </span>
                  {live && (
                    <Badge className="ms-auto" size="sm" variant="warning">
                      En cours
                    </Badge>
                  )}
                  {past && (
                    <HugeiconsIcon
                      className="ms-auto size-4 text-pension-strong"
                      icon={Tick02Icon}
                    />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {outing.place}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {outing.pets.map((pet) => (
                    <Badge key={pet} size="sm" variant="secondary">
                      {pet}
                    </Badge>
                  ))}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
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
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{n.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-medium">{n.pet}</span>
                <span className="text-muted-foreground"> · {n.owner}</span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
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
                size="xs"
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

export function PensionTodayView() {
  const [kennels, setKennels] = useState(initialKennels)
  const [movements, setMovements] = useState(stayMovements)
  const [flowId, setFlowId] = useState<string | null>(null)
  const [flowOpen, setFlowOpen] = useState(false)
  const present = kennels.filter(isPresent).length
  const count = (type: StayMovement["type"]) =>
    movements.filter((m) => m.type === type)
  const doneOf = (type: StayMovement["type"]) =>
    count(type).filter((m) => m.status === "done").length
  const late = movements.filter((m) => m.status === "late").length
  const nextMove = movements.find((m) => m.status !== "done")
  const pendingCare = careTasks.filter((t) => !t.done)

  const complete = (movement: StayMovement) => {
    const status: KennelStatus =
      movement.type === "arrival" ? "occupied" : "cleaning"
    const id = kennelIdOf(movement.kennel)
    setMovements((list) =>
      list.map((m) => (m.id === movement.id ? { ...m, status: "done" } : m))
    )
    setKennels((list) =>
      list.map((k) =>
        k.id === id
          ? {
              ...k,
              status,
            }
          : k
      )
    )
  }

  return (
    <ActivityDayPage
      actions={
        <>
          <Button className="max-sm:hidden" size="sm" variant="outline">
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
        <div className="flex items-center gap-2 rounded-full border py-1 ps-1 pe-3 text-sm">
          <Avatar className="size-6">
            <AvatarFallback className="text-[0.625rem]">CL</AvatarFallback>
          </Avatar>
          Claire
          <span className="text-muted-foreground">· de garde 7h – 15h</span>
        </div>
      }
      summary={
        <>
          {present} pensionnaires, {count("arrival").length} arrivées et{" "}
          {count("departure").length} départs prévus.
          {nextMove &&
            ` Prochain mouvement : ${nextMove.pet} à ${nextMove.time.replace(":", "h")}.`}
        </>
      }
    >
      <Alert variant="warning">
        <HugeiconsIcon icon={Alert02Icon} />
        <AlertTitle>Pixel attend toujours sa propriétaire</AlertTitle>
        <AlertDescription>
          Départ prévu à 10h, Nina Robert n&apos;a pas donné de nouvelles. Gaïa
          arrive à 11h30 pour son premier séjour : pensez à vérifier son carnet
          de vaccination.
        </AlertDescription>
        <AlertAction>
          <Button size="xs" variant="outline">
            <HugeiconsIcon icon={Call02Icon} />
            Appeler Nina
          </Button>
        </AlertAction>
      </Alert>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
          Prochain à {pendingCare[0]?.time.replace(":", "h")} ·{" "}
          {pendingCare[0]?.pet}
        </Kpi>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <KennelMap className="lg:col-span-2" kennels={kennels} />
        <MovementsCard
          movements={movements}
          onComplete={(m) => {
            setFlowId(m.id)
            setFlowOpen(true)
          }}
        />
        <CheckFlow
          movement={movements.find((m) => m.id === flowId) ?? null}
          onComplete={complete}
          onOpenChange={setFlowOpen}
          open={flowOpen}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MealsCard kennels={kennels} />
        <ChecklistWidget
          barClassName="bg-pension-strong"
          items={careTasks.map((t) => ({
            detail: `${t.time} · ${t.box}`,
            done: t.done,
            id: t.id,
            label: (
              <>
                <span className="font-medium">{t.pet}</span> · {t.task}
              </>
            ),
          }))}
          title="Soins & traitements"
        />
        <OutingsCard />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <NewsCard />
        <ChecklistWidget
          barClassName="bg-sky-600"
          items={[
            {
              detail: "Après le départ de Caramel",
              done: false,
              id: "b5",
              label: "Désinfecter le box 5",
            },
            {
              detail: "Avant 11h30 · couverture et gamelles",
              done: true,
              id: "b9",
              label: "Préparer le box 9 pour Gaïa",
            },
            {
              detail: "Avant 14h",
              done: false,
              id: "b12",
              label: "Préparer le box 12 pour Tango",
            },
            {
              detail: "Après le départ de Pixel",
              done: false,
              id: "b14",
              label: "Désinfecter le box 14",
            },
            {
              detail: "Litière neuve avant 17h30",
              done: false,
              id: "c3",
              label: "Préparer la chatterie 3 pour Mochi",
            },
          ]}
          title="Ménage des box"
        />
      </div>
    </ActivityDayPage>
  )
}
