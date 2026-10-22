"use client"

import {
  Alert02Icon,
  ArrowRight01Icon,
  BedDoubleIcon,
  Calendar03Icon,
  ChartIncreaseIcon,
  EuroCircleIcon,
  Login03Icon,
  Logout03Icon,
  PlusSignIcon,
  PrinterIcon,
  SunCloud01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import {
  type Activity,
  ActivityMark,
  activityMeta,
  activityNames,
} from "@/components/activity-mark"
import {
  type BoxStatus,
  boxes,
  careTasks,
  type Movement,
  movements as initialMovements,
  NOW,
  revenue,
  team,
  timeline,
  todos,
  week,
} from "@/components/today/data"
import {
  formatAmount,
  formatHour,
  Kpi,
  PageBody,
  Widget,
} from "@/components/today/widgets"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const DAY_START = 8
const DAY_END = 19
const hours = Array.from(
  { length: DAY_END - DAY_START + 1 },
  (_, i) => DAY_START + i
)
const pct = (hour: number) => ((hour - DAY_START) / (DAY_END - DAY_START)) * 100

const boxStyles: Record<BoxStatus, { label: string; className: string }> = {
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

function DayTimeline() {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="min-w-[720px]">
        <div className="flex">
          <div className="w-28 shrink-0" />
          <div className="relative h-5 flex-1 text-[0.6875rem] text-muted-foreground">
            {hours.map((hour) => (
              <span
                className="absolute -translate-x-1/2"
                key={hour}
                style={{ left: `${pct(hour)}%` }}
              >
                {hour}h
              </span>
            ))}
          </div>
        </div>
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-28 end-0"
          >
            {hours.map((hour) => (
              <span
                className="absolute inset-y-0 w-px bg-border/60"
                key={hour}
                style={{ left: `${pct(hour)}%` }}
              />
            ))}
          </div>
          {activityNames.map((activity) => (
            <div className="flex items-center border-t py-2" key={activity}>
              <div className="flex w-28 shrink-0 items-center gap-2 text-sm font-medium">
                <ActivityMark activity={activity} />
                {activity}
              </div>
              <div className="relative h-8 flex-1">
                {timeline
                  .filter((event) => event.activity === activity)
                  .map((event) => {
                    const live = event.start <= NOW && NOW < event.end
                    return (
                      <div
                        className={cn(
                          "absolute inset-y-0 flex items-center gap-1 overflow-hidden rounded-md px-1.5 text-xs font-medium text-white",
                          activityMeta[activity].color,
                          event.end <= NOW && "opacity-40",
                          live &&
                            "ring-2 ring-orange-500 ring-offset-1 ring-offset-background"
                        )}
                        key={event.label}
                        style={{
                          left: `${pct(event.start)}%`,
                          width: `calc(${pct(event.end) - pct(event.start)}% - 2px)`,
                        }}
                        title={`${event.label} · ${formatHour(event.start)} – ${formatHour(event.end)}`}
                      >
                        {event.kind && (
                          <HugeiconsIcon
                            className="size-3 shrink-0"
                            icon={
                              event.kind === "arrival"
                                ? Login03Icon
                                : Logout03Icon
                            }
                          />
                        )}
                        <span className="truncate">{event.label}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-28 end-0"
          >
            <div
              className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-orange-500"
              style={{ left: `${pct(NOW)}%` }}
            >
              <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-orange-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MovementsCard({
  movements,
  onComplete,
  className,
}: {
  movements: Movement[]
  onComplete: (id: string) => void
  className?: string
}) {
  const [tab, setTab] = useState<Movement["type"]>("arrival")
  const count = (type: Movement["type"]) =>
    movements.filter((m) => m.type === type).length
  const done = movements.filter((m) => m.status === "done").length
  return (
    <Widget
      action={
        <Tabs
          onValueChange={(value) => setTab(value as Movement["type"])}
          value={tab}
        >
          <TabsList size="sm">
            <TabsTab className="gap-1.5" value="arrival">
              Arrivées
              <span className="text-muted-foreground">{count("arrival")}</span>
            </TabsTab>
            <TabsTab className="gap-1.5" value="departure">
              Départs
              <span className="text-muted-foreground">
                {count("departure")}
              </span>
            </TabsTab>
          </TabsList>
        </Tabs>
      }
      className={className}
      description={`${done} sur ${movements.length} effectués`}
      title="Arrivées & départs"
    >
      <ul className="divide-y">
        {movements
          .filter((m) => m.type === tab)
          .map((m) => (
            <li
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              key={m.id}
            >
              <Avatar className="size-12">
                <AvatarFallback className="bg-muted text-sm font-semibold">
                  {m.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {m.pet}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {m.breed}
                  </span>
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  <span className="tabular-nums">{m.time}</span> · {m.client} ·{" "}
                  {m.box}
                </p>
              </div>
              {m.status === "done" ? (
                <Badge variant="success">
                  <HugeiconsIcon icon={Tick02Icon} />
                  {m.type === "arrival" ? "Arrivée validée" : "Départ validé"}
                </Badge>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  {m.status === "late" && (
                    <Badge variant="error">En retard</Badge>
                  )}
                  <Button
                    onClick={() => onComplete(m.id)}
                    size="sm"
                    variant="secondary"
                  >
                    {m.type === "arrival" ? "Enregistrer" : "Valider le départ"}
                  </Button>
                </div>
              )}
            </li>
          ))}
      </ul>
    </Widget>
  )
}

function CareCard() {
  const [tasks, setTasks] = useState(careTasks)
  const done = tasks.filter((task) => task.done).length
  return (
    <Widget
      description={`${done} sur ${tasks.length} effectués`}
      title="Soins & traitements"
    >
      <Progress
        aria-label="Soins effectués"
        className="mb-4"
        value={(done / tasks.length) * 100}
      >
        <ProgressTrack>
          <ProgressIndicator className="bg-pension-strong" />
        </ProgressTrack>
      </Progress>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id}>
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={task.done}
                className="mt-0.5"
                onCheckedChange={(checked) =>
                  setTasks((list) =>
                    list.map((t) =>
                      t.id === task.id ? { ...t, done: checked } : t
                    )
                  )
                }
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block",
                    task.done && "text-muted-foreground line-through"
                  )}
                >
                  <span className="font-medium">{task.pet}</span> · {task.task}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {task.time} · {task.box}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </Widget>
  )
}

function BoxesCard() {
  const countOf = (status: BoxStatus) =>
    boxes.filter((box) => box.status === status).length
  return (
    <Widget
      action={
        <Button
          render={<Link href="/pension/planning" />}
          size="xs"
          variant="ghost"
        >
          Planning
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      }
      description={`${countOf("occupied") + countOf("departing")} animaux présents`}
      title="Occupation des box"
    >
      <div className="grid grid-cols-6 gap-1.5">
        {boxes.map((box) => (
          <span
            className={cn(
              "flex aspect-square items-center justify-center rounded-md text-xs font-medium tabular-nums",
              boxStyles[box.status].className
            )}
            key={box.number}
            title={`Box ${box.number} · ${boxStyles[box.status].label}`}
          >
            {box.number}
          </span>
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {(Object.keys(boxStyles) as BoxStatus[]).map((status) => (
          <li className="flex items-center gap-1.5" key={status}>
            <span
              className={cn("size-2.5 rounded-sm", boxStyles[status].className)}
            />
            <span className="flex-1 text-muted-foreground">
              {boxStyles[status].label}
            </span>
            <span className="font-medium tabular-nums">{countOf(status)}</span>
          </li>
        ))}
      </ul>
    </Widget>
  )
}

function RevenueCard() {
  const total = revenue.reduce((sum, r) => sum + r.amount, 0)
  const max = Math.max(...week.map((d) => d.amount))
  const todayIndex = week.findIndex((d) => d.today)
  return (
    <Widget description="Prévisionnel du jour" title="Chiffre d'affaires">
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-2xl font-semibold tabular-nums">
          {formatAmount(total)}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-pension-strong">
          <HugeiconsIcon className="size-3.5" icon={ChartIncreaseIcon} />
          +12 %
        </span>
      </div>
      <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full">
        {revenue.map((r) => (
          <span
            className={activityMeta[r.activity].color}
            key={r.activity}
            style={{ width: `${(r.amount / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {revenue.map((r) => (
          <li className="flex items-center gap-2" key={r.activity}>
            <ActivityMark
              activity={r.activity}
              className="size-4 rounded text-[0.5rem]"
            />
            <span className="flex-1">{r.activity}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {Math.round((r.amount / total) * 100)} %
            </span>
            <span className="w-16 text-end font-medium tabular-nums">
              {formatAmount(r.amount)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t pt-4">
        <p className="mb-2 text-xs text-muted-foreground">Cette semaine</p>
        <div className="flex items-end gap-1.5">
          {week.map((d, i) => (
            <div
              className="flex flex-1 flex-col items-center gap-1"
              key={d.day}
            >
              <div
                className={cn(
                  "w-full rounded-sm",
                  d.today
                    ? "bg-pension-strong"
                    : i < todayIndex
                      ? "bg-pension/60"
                      : "bg-muted"
                )}
                style={{ height: `${(d.amount / max) * 64}px` }}
                title={formatAmount(d.amount)}
              />
              <span
                className={cn(
                  "text-[0.625rem] text-muted-foreground",
                  d.today && "font-semibold text-foreground"
                )}
              >
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Widget>
  )
}

function TodoCard() {
  const [items, setItems] = useState(todos)
  const remaining = items.filter((todo) => !todo.done).length
  return (
    <Widget description={`${remaining} restantes`} title="À faire">
      <ul className="space-y-4">
        {items.map((todo) => (
          <li className="flex items-start gap-3" key={todo.id}>
            <Checkbox
              aria-label={todo.label}
              checked={todo.done}
              className="mt-0.5"
              onCheckedChange={(checked) =>
                setItems((list) =>
                  list.map((t) =>
                    t.id === todo.id ? { ...t, done: checked } : t
                  )
                )
              }
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p
                className={cn(
                  todo.done && "text-muted-foreground line-through"
                )}
              >
                {todo.label}
              </p>
              <Badge variant="outline">
                {todo.tag in activityMeta && (
                  <ActivityMark
                    activity={todo.tag as Activity}
                    className="size-3 rounded-sm text-[0.4375rem]"
                  />
                )}
                {todo.tag}
              </Badge>
            </div>
            {todo.href && !todo.done && (
              <Button
                aria-label="Ouvrir"
                render={<Link href={todo.href} />}
                size="icon-xs"
                variant="ghost"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Widget>
  )
}

export function TodayView() {
  const [movements, setMovements] = useState(initialMovements)
  const arrivals = movements.filter((m) => m.type === "arrival").length
  const done = movements.filter((m) => m.status === "done").length
  const late = movements.filter((m) => m.status === "late").length
  const present = boxes.filter(
    (box) => box.status === "occupied" || box.status === "departing"
  ).length
  const appointments = (activity: Activity) =>
    timeline.filter((event) => event.activity === activity).length

  return (
    <PageBody>
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">
              Mercredi 21 octobre
            </p>
            <h1 className="font-display text-6xl md:text-7xl">Bonjour</h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              {present} animaux en pension, {movements.length} arrivées et
              départs, et{" "}
              {appointments("Toilettage") + appointments("Éducation")}{" "}
              rendez-vous au programme aujourd&apos;hui.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 items-center gap-2 rounded-full bg-muted px-4 text-sm font-semibold">
              <HugeiconsIcon className="size-5" icon={SunCloud01Icon} />
              16 °C
              <span className="font-normal text-muted-foreground">
                · Promenades idéales jusqu&apos;à 16h
              </span>
            </div>
            <AvatarGroup aria-label="Équipe du jour">
              {team.map((member) => (
                <Avatar
                  className="size-10"
                  key={member.name}
                  title={`${member.name} · ${member.role} · ${member.hours}`}
                >
                  <AvatarFallback className="text-xs font-semibold">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href="/pension/stays" />} size="lg">
            <HugeiconsIcon icon={PlusSignIcon} />
            Nouveau séjour
          </Button>
          <Button
            render={<Link href="/grooming/appointments" />}
            size="lg"
            variant="secondary"
          >
            <HugeiconsIcon icon={Calendar03Icon} />
            Nouveau rendez-vous
          </Button>
          <Button size="lg" variant="secondary">
            <HugeiconsIcon icon={PrinterIcon} />
            Feuille du jour
          </Button>
        </div>
      </section>

      <Alert variant="warning">
        <HugeiconsIcon icon={Alert02Icon} />
        <AlertTitle>2 points d&apos;attention</AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-0.5 ps-4">
            <li>
              Pixel (box 14) devait partir à 10h : pas de nouvelles de Nina
              Robert pour le moment.
            </li>
            <li>
              Rocky (toilettage 14h) a la peau sensible : shampoing
              hypoallergénique uniquement.
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          icon={BedDoubleIcon}
          label="Pensionnaires"
          value={
            <>
              {present}
              <span className="text-base text-muted-foreground">
                {" "}
                / {boxes.length}
              </span>
            </>
          }
        >
          <Progress
            aria-label="Taux d'occupation"
            className="gap-1"
            value={(present / boxes.length) * 100}
          >
            <ProgressTrack>
              <ProgressIndicator className="bg-pension-strong" />
            </ProgressTrack>
          </Progress>
          <p className="mt-1.5">
            {Math.round((present / boxes.length) * 100)} % d&apos;occupation
          </p>
        </Kpi>
        <Kpi
          icon={Login03Icon}
          label="Arrivées · Départs"
          value={`${arrivals} · ${movements.length - arrivals}`}
        >
          {done} effectués
          {late > 0 && (
            <span className="text-destructive-foreground">
              {" "}
              · {late} en retard
            </span>
          )}
        </Kpi>
        <Kpi
          icon={Calendar03Icon}
          label="Rendez-vous"
          value={appointments("Toilettage") + appointments("Éducation")}
        >
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            {(["Toilettage", "Éducation"] as const).map((activity) => (
              <span className="flex items-center gap-1" key={activity}>
                <ActivityMark
                  activity={activity}
                  className="size-3.5 rounded-sm text-[0.5rem]"
                />
                {appointments(activity)} {activity.toLowerCase()}
              </span>
            ))}
          </span>
        </Kpi>
        <Kpi
          icon={EuroCircleIcon}
          label="CA prévu"
          value={formatAmount(revenue.reduce((s, r) => s + r.amount, 0))}
        >
          <span className="flex items-center gap-1 text-pension-strong">
            <HugeiconsIcon className="size-3.5" icon={ChartIncreaseIcon} />
            +12 % vs mercredi dernier
          </span>
        </Kpi>
      </div>

      <Widget
        action={
          <Badge variant="outline">
            <span className="size-1.5 rounded-full bg-orange-500" />
            Maintenant · {formatHour(NOW)}
          </Badge>
        }
        description="Toutes activités confondues"
        title="Planning de la journée"
      >
        <DayTimeline />
      </Widget>

      <div className="grid gap-4 lg:grid-cols-3">
        <MovementsCard
          className="lg:col-span-2"
          movements={movements}
          onComplete={(id) =>
            setMovements((list) =>
              list.map((m) => (m.id === id ? { ...m, status: "done" } : m))
            )
          }
        />
        <CareCard />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BoxesCard />
        <RevenueCard />
        <TodoCard />
      </div>
    </PageBody>
  )
}
