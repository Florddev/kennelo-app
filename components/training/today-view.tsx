"use client"

import {
  Alert02Icon,
  Calendar03Icon,
  CalendarAdd01Icon,
  CloudAngledRainIcon,
  Clock01Icon,
  FileEditIcon,
  Home01Icon,
  Location01Icon,
  Sun01Icon,
  SunCloud01Icon,
  Target02Icon,
  Tick02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { NOW } from "@/components/today/data"
import {
  ActivityDayPage,
  Bar,
  ChecklistWidget,
  formatHour,
  Kpi,
  Widget,
} from "@/components/today/widgets"
import {
  forecast,
  packages,
  type Puppy,
  puppies as initialPuppies,
  puppyPlan,
  reports as initialReports,
  type SessionKind,
  sessions,
  type TrainingSession,
} from "@/components/training/data"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Meter, MeterIndicator, MeterTrack } from "@/components/ui/meter"
import { cn } from "@/lib/utils"

const kindIcons: Record<SessionKind, typeof UserGroupIcon> = {
  Collectif: UserGroupIcon,
  Individuel: Target02Icon,
  "À domicile": Home01Icon,
}

const skyIcons = {
  cloud: SunCloud01Icon,
  rain: CloudAngledRainIcon,
  sun: Sun01Icon,
}

const range = (s: TrainingSession) =>
  `${formatHour(s.start)} – ${formatHour(s.end)}`

const sessionState = (s: TrainingSession) =>
  s.end <= NOW ? "done" : s.start <= NOW ? "live" : "upcoming"

/** Exercise plan with the state of each step, `elapsed` minutes in. */
function planAt(elapsed: number) {
  let cursor = 0
  return puppyPlan.map((exercise) => {
    const from = cursor
    cursor += exercise.minutes
    return {
      ...exercise,
      from,
      state:
        cursor <= elapsed ? "done" : from <= elapsed ? "live" : "upcoming",
    }
  })
}

function LiveSession({
  session,
  puppies,
  onToggle,
  className,
}: {
  session: TrainingSession
  puppies: Puppy[]
  onToggle: (id: string) => void
  className?: string
}) {
  const elapsed = (NOW - session.start) * 60
  const total = (session.end - session.start) * 60
  const present = puppies.filter((p) => p.present).length
  const plan = planAt(elapsed)

  return (
    <Widget
      action={
        <Badge variant="warning">
          <span className="size-1.5 animate-pulse rounded-full bg-current" />
          En cours
        </Badge>
      }
      className={className}
      description={`${session.programme.name} · séance ${session.programme.session}/${session.programme.total} · ${session.place}`}
      title={session.title}
    >
      <div className="mb-5 space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{range(session)}</span>
          <span>{Math.round(total - elapsed)} min restantes</span>
        </div>
        <Bar
          className="bg-blue-700"
          label="Avancement de la séance"
          value={(elapsed / total) * 100}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Déroulé de la séance
          </p>
          <ol className="relative space-y-3 before:absolute before:inset-y-1 before:start-2.5 before:w-px before:bg-border">
            {plan.map((exercise) => (
              <li className="relative flex gap-3" key={exercise.label}>
                <span
                  className={cn(
                    "z-10 flex size-5 shrink-0 items-center justify-center rounded-full border bg-background",
                    exercise.state === "done" &&
                      "border-blue-700 bg-blue-700 text-white",
                    exercise.state === "live" &&
                      "border-orange-500 ring-4 ring-orange-500/20"
                  )}
                >
                  {exercise.state === "done" && (
                    <HugeiconsIcon className="size-3" icon={Tick02Icon} />
                  )}
                  {exercise.state === "live" && (
                    <span className="size-1.5 rounded-full bg-orange-500" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      exercise.state === "live" && "font-medium",
                      exercise.state === "done" && "text-muted-foreground"
                    )}
                  >
                    {exercise.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatHour(session.start + exercise.from / 60)} ·{" "}
                    {exercise.minutes} min
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Appel</p>
            <span className="text-xs text-muted-foreground tabular-nums">
              {present} / {puppies.length} présents
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {puppies.map((puppy) => (
              <li key={puppy.id}>
                <button
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border p-2 text-start transition-colors",
                    puppy.present
                      ? "border-blue-700/40 bg-blue-700/5"
                      : "border-dashed opacity-60"
                  )}
                  onClick={() => onToggle(puppy.id)}
                  title={`${puppy.owner} · cliquer pour changer`}
                  type="button"
                >
                  <Avatar className="size-7">
                    <AvatarFallback
                      className={cn(
                        "text-[0.625rem]",
                        puppy.present && "bg-blue-700 text-white"
                      )}
                    >
                      {puppy.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {puppy.name}
                    </span>
                    <span className="block truncate text-[0.6875rem] text-muted-foreground">
                      {puppy.present
                        ? `${puppy.breed} · ${puppy.age}`
                        : "Absent"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Widget>
  )
}

function WeatherCard() {
  return (
    <Widget description="Terrains extérieurs" title="Météo des séances">
      <div className="grid grid-cols-6 gap-1 text-center">
        {forecast.map((f) => {
          const session = sessions.find(
            (s) => s.start <= f.hour && f.hour < s.end
          )
          return (
            <div
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg py-2",
                f.sky === "rain" && "bg-sky-500/10"
              )}
              key={f.hour}
            >
              <span className="text-[0.6875rem] text-muted-foreground">
                {f.hour}h
              </span>
              <HugeiconsIcon
                className={cn(
                  "size-5",
                  f.sky === "rain" ? "text-sky-600" : "text-amber-500"
                )}
                icon={skyIcons[f.sky]}
              />
              <span className="text-xs font-medium tabular-nums">
                {f.temp}°
              </span>
              <span
                className={cn(
                  "h-1 w-4 rounded-full",
                  session ? "bg-blue-700" : "bg-transparent"
                )}
                title={session?.title}
              />
            </div>
          )
        })}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {sessions.map((s) => {
          const rainy = forecast.some(
            (f) => f.sky === "rain" && s.start <= f.hour && f.hour < s.end
          )
          return (
            <li className="flex items-center gap-2" key={s.id}>
              <span className="w-12 shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatHour(s.start)}
              </span>
              <span className="min-w-0 flex-1 truncate">{s.title}</span>
              {rainy ? (
                <Badge size="sm" variant="warning">
                  Pluie : prévoir l&apos;intérieur
                </Badge>
              ) : (
                <Badge size="sm" variant="success">
                  Terrain praticable
                </Badge>
              )}
            </li>
          )
        })}
      </ul>
    </Widget>
  )
}

function SessionCard({ session }: { session: TrainingSession }) {
  const state = sessionState(session)
  const { name, session: index, total } = session.programme
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4",
        state === "live" && "border-orange-500/60 bg-orange-500/5",
        state === "done" && "opacity-60"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium tabular-nums">
          {range(session)}
        </span>
        <Badge className="ms-auto" variant="outline">
          <HugeiconsIcon icon={kindIcons[session.kind]} />
          {session.kind}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarFallback className="bg-blue-700 text-white">
            {session.initials ?? "6"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">
            {session.title}
            {session.breed && (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {session.breed}
              </span>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {session.owner ?? "6 chiots inscrits"}
          </p>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <HugeiconsIcon className="size-3.5 shrink-0" icon={Location01Icon} />
        <span className="truncate">{session.place}</span>
      </p>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="truncate text-muted-foreground">{name}</span>
          <span className="font-medium tabular-nums">
            Séance {index}/{total}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: total }, (_, i) => (
            <span
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i < index - 1
                  ? "bg-blue-700"
                  : i === index - 1
                    ? "bg-blue-700/40"
                    : "bg-muted"
              )}
              key={i}
            />
          ))}
        </div>
      </div>
      <p className="flex items-start gap-1.5 rounded-lg bg-muted/60 p-2 text-xs">
        <HugeiconsIcon
          className="mt-px size-3.5 shrink-0"
          icon={Target02Icon}
        />
        {session.goal}
      </p>
      {session.skills && (
        <ul className="space-y-2 border-t pt-3">
          {session.skills.map((skill) => (
            <li className="space-y-1" key={skill.label}>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{skill.label}</span>
                <span className="tabular-nums">{skill.value} %</span>
              </div>
              <Meter aria-label={skill.label} value={skill.value}>
                <MeterTrack>
                  <MeterIndicator className="bg-blue-700" />
                </MeterTrack>
              </Meter>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ReportsCard() {
  const [reports, setReports] = useState(initialReports)
  const pending = reports.filter((r) => !r.sent).length
  return (
    <Widget description={`${pending} à envoyer`} title="Comptes-rendus">
      <ul className="divide-y">
        {reports.map((r) => {
          const waiting = r.after !== undefined && NOW < r.after
          return (
            <li
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              key={r.id}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <HugeiconsIcon className="size-4" icon={FileEditIcon} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  <span className="font-medium">{r.dog}</span>
                  <span className="text-muted-foreground"> · {r.owner}</span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.session}
                </p>
              </div>
              {r.sent ? (
                <Badge variant="success">
                  <HugeiconsIcon icon={Tick02Icon} />
                  Envoyé
                </Badge>
              ) : waiting ? (
                <Badge variant="outline">
                  Après {formatHour(r.after ?? 0)}
                </Badge>
              ) : (
                <Button
                  onClick={() =>
                    setReports((list) =>
                      list.map((i) =>
                        i.id === r.id ? { ...i, sent: true } : i
                      )
                    )
                  }
                  size="xs"
                  variant="outline"
                >
                  Rédiger
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </Widget>
  )
}

function PackagesCard() {
  const [offered, setOffered] = useState<string[]>([])
  return (
    <Widget description="Séances consommées" title="Forfaits en cours">
      <ul className="space-y-4">
        {packages.map((p) => {
          const ending = p.total - p.used <= 1
          return (
            <li className="space-y-1.5" key={p.dog}>
              <div className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium">{p.dog}</span>
                  <span className="text-muted-foreground"> · {p.name}</span>
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {p.used}/{p.total}
                </span>
              </div>
              <Bar
                className={ending ? "bg-amber-500" : "bg-blue-700"}
                label={`Forfait de ${p.dog}`}
                value={(p.used / p.total) * 100}
              />
              {ending &&
                (offered.includes(p.dog) ? (
                  <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                    <HugeiconsIcon className="size-3.5" icon={Tick02Icon} />
                    Renouvellement proposé à {p.owner}
                  </p>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Dernière séance à venir
                    </span>
                    <Button
                      onClick={() => setOffered((list) => [...list, p.dog])}
                      size="xs"
                      variant="outline"
                    >
                      Proposer un renouvellement
                    </Button>
                  </div>
                ))}
            </li>
          )
        })}
      </ul>
    </Widget>
  )
}

export function TrainingTodayView() {
  const [puppies, setPuppies] = useState(initialPuppies)
  const live = sessions.find((s) => sessionState(s) === "live")
  const present = puppies.filter((p) => p.present).length
  const individuals = sessions.filter((s) => s.dog).length
  const hours = sessions.reduce((sum, s) => sum + s.end - s.start, 0)

  return (
    <ActivityDayPage
      actions={
        <Button size="sm">
          <HugeiconsIcon icon={CalendarAdd01Icon} />
          Planifier une séance
        </Button>
      }
      activity="Éducation"
      aside={
        <div className="flex items-center gap-2 rounded-full border py-1 ps-1 pe-3 text-sm">
          <Avatar className="size-6">
            <AvatarFallback className="text-[0.625rem]">IN</AvatarFallback>
          </Avatar>
          Inès
          <span className="text-muted-foreground">· éducatrice 10h – 19h</span>
        </div>
      }
      summary={
        <>
          {sessions.length} séances et {present + individuals} chiens
          accompagnés aujourd&apos;hui.
          {live && ` ${live.title} en cours sur le ${live.place}.`}
        </>
      }
    >
      <Alert variant="warning">
        <HugeiconsIcon icon={Alert02Icon} />
        <AlertTitle>2 points d&apos;attention</AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-0.5 ps-4">
            <li>
              Pluie annoncée dès 18h : la séance d&apos;Hachiko à domicile devra
              se faire en intérieur ou être décalée.
            </li>
            <li>
              Nouille est absent du cours chiots sans avoir prévenu : séance à
              rattraper avec Maxime Vidal.
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Calendar03Icon} label="Séances" value={sessions.length}>
          {sessions.filter((s) => sessionState(s) === "done").length} terminée ·{" "}
          {live ? "1 en cours" : "aucune en cours"}
        </Kpi>
        <Kpi
          icon={UserGroupIcon}
          label="Chiens accompagnés"
          value={present + individuals}
        >
          {present} chiots · {individuals} en individuel
        </Kpi>
        <Kpi
          icon={Tick02Icon}
          label="Présence cours chiots"
          value={`${Math.round((present / puppies.length) * 100)} %`}
        >
          <Bar
            className="bg-blue-700"
            label="Taux de présence"
            value={(present / puppies.length) * 100}
          />
          <p className="mt-1.5">
            {present} présents sur {puppies.length} inscrits
          </p>
        </Kpi>
        <Kpi
          icon={Clock01Icon}
          label="Temps de coaching"
          value={formatHour(hours)}
        >
          Prochaine séance à{" "}
          {formatHour(
            sessions.find((s) => sessionState(s) === "upcoming")?.start ?? 0
          )}
        </Kpi>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {live && (
          <LiveSession
            className="lg:col-span-2"
            onToggle={(id) =>
              setPuppies((list) =>
                list.map((p) =>
                  p.id === id ? { ...p, present: !p.present } : p
                )
              )
            }
            puppies={puppies}
            session={live}
          />
        )}
        <WeatherCard />
      </div>

      <Widget
        description="Programmes et objectifs de chaque séance"
        title="Séances du jour"
      >
        <div className="grid gap-3 md:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </Widget>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChecklistWidget
          barClassName="bg-blue-700"
          items={[
            {
              detail: "Cours chiots",
              done: true,
              id: "leashes",
              label: "Longes de 10 m × 6",
            },
            {
              detail: "Parcours sensoriel",
              done: true,
              id: "sensory",
              label: "Bâche, tunnel souple et plaque métallique",
            },
            {
              detail: "Toutes les séances",
              done: true,
              id: "treats",
              label: "Friandises haute valeur",
            },
            {
              detail: "Pepper · 14h30",
              done: false,
              id: "balls",
              label: "Balles et frisbee",
            },
            {
              detail: "Terrain B",
              done: false,
              id: "cones",
              label: "Cônes et barres d'agility",
            },
            {
              detail: "Hachiko · 18h",
              done: false,
              id: "indoor",
              label: "Tapis antidérapant pour l'intérieur",
            },
          ]}
          title="Matériel à préparer"
        />
        <ReportsCard />
        <PackagesCard />
      </div>
    </ActivityDayPage>
  )
}
