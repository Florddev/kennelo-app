"use client"

import {
  CalendarAdd01Icon,
  CloudAngledRainIcon,
  FileEditIcon,
  Home01Icon,
  PackageIcon,
  Target02Icon,
  Tick02Icon,
  UserGroupIcon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import { activityMeta } from "@/components/activity-mark"
import { NOW } from "@/components/today/data"
import {
  ActivityDayPage,
  type Attention,
  AttentionList,
  formatHour,
  Section,
  type Task,
  TaskList,
} from "@/components/today/widgets"
import {
  forecast,
  packages,
  type Puppy,
  puppies as initialPuppies,
  puppyPlan,
  reports,
  type SessionKind,
  sessions,
  type TrainingSession,
} from "@/components/training/data"
import { NewSessionDialog } from "@/components/training/new-session-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const kindIcons: Record<SessionKind, typeof UserGroupIcon> = {
  Collectif: UserGroupIcon,
  Individuel: Target02Icon,
  "À domicile": Home01Icon,
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
      state: cursor <= elapsed ? "done" : from <= elapsed ? "live" : "upcoming",
    }
  })
}

const equipment = [
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
]

/** La séance en cours, en grand, dans la couleur de l'éducation. */
function LiveSession({
  session,
  puppies,
  onToggle,
}: {
  session: TrainingSession
  puppies: Puppy[]
  onToggle: (id: string) => void
}) {
  const elapsed = (NOW - session.start) * 60
  const total = (session.end - session.start) * 60
  const present = puppies.filter((p) => p.present).length
  const plan = planAt(elapsed)

  return (
    <div
      className={cn(
        "space-y-5 rounded-4xl p-5 md:p-6",
        activityMeta["Éducation"].tint
      )}
    >
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/60">
          <HugeiconsIcon className="size-6" icon={kindIcons[session.kind]} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold opacity-80">
            <span className="size-2 animate-pulse rounded-full bg-current" />
            En cours · {session.place}
          </p>
          <p className="font-display text-5xl">{session.title}</p>
          <p className="opacity-80">
            {session.programme.name} · séance {session.programme.session}/
            {session.programme.total}
          </p>
        </div>
        <div className="text-end">
          <p className="font-display text-4xl tabular-nums">
            {Math.round(total - elapsed)} min
          </p>
          <p className="text-sm opacity-80">
            restantes · fin {formatHour(session.end)}
          </p>
        </div>
      </div>

      <div
        aria-label="Avancement de la séance"
        className="h-2 overflow-hidden rounded-full bg-white/50"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-current"
          style={{ width: `${(elapsed / total) * 100}%` }}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-3 rounded-3xl bg-white/50 p-4">
          <p className="font-semibold">Déroulé</p>
          <ol className="relative space-y-3 before:absolute before:inset-y-2 before:start-3 before:w-0.5 before:bg-current/15">
            {plan.map((exercise) => (
              <li className="relative flex gap-3" key={exercise.label}>
                <span
                  className={cn(
                    "z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
                    exercise.state === "done" && "bg-wise-charcoal text-white",
                    exercise.state === "live" &&
                      "bg-background ring-4 ring-white/70",
                    exercise.state === "upcoming" &&
                      "border-2 border-current/25 bg-wise-blue"
                  )}
                >
                  {exercise.state === "done" && (
                    <HugeiconsIcon className="size-3.5" icon={Tick02Icon} />
                  )}
                  {exercise.state === "live" && (
                    <span className="size-2 rounded-full bg-wise-charcoal" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      exercise.state === "live" && "font-semibold",
                      exercise.state === "done" && "opacity-60"
                    )}
                  >
                    {exercise.label}
                  </p>
                  <p className="text-sm opacity-70">
                    {formatHour(session.start + exercise.from / 60)} ·{" "}
                    {exercise.minutes} min
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-3 rounded-3xl bg-white/50 p-4">
          <p className="flex items-center justify-between font-semibold">
            Appel
            <span className="text-sm tabular-nums opacity-70">
              {present} / {puppies.length} présents
            </span>
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {puppies.map((puppy) => (
              <li key={puppy.id}>
                <button
                  aria-pressed={puppy.present}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-2xl p-2 text-start transition-colors",
                    puppy.present
                      ? "bg-background"
                      : "border-2 border-dashed border-current/25 opacity-70"
                  )}
                  onClick={() => onToggle(puppy.id)}
                  title={`${puppy.owner} · toucher pour changer`}
                  type="button"
                >
                  <Avatar className="size-10">
                    <AvatarFallback
                      className={cn(
                        "text-xs font-semibold",
                        puppy.present ? "bg-wise-blue" : "bg-white/60"
                      )}
                    >
                      {puppy.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {puppy.name}
                    </span>
                    <span className="block truncate text-xs opacity-70">
                      {puppy.present ? puppy.breed : "Absent"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/** Sans séance en cours : la prochaine, dans la même carte. */
function NextSession({ session }: { session: TrainingSession }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-4xl p-5 md:p-6",
        activityMeta["Éducation"].tint
      )}
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/60">
        <HugeiconsIcon className="size-6" icon={kindIcons[session.kind]} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold opacity-80">
          Prochaine séance · {range(session)}
        </p>
        <p className="font-display text-4xl">{session.title}</p>
        <p className="opacity-80">
          {session.place} · {session.programme.name}
        </p>
      </div>
    </div>
  )
}

export function TrainingTodayView() {
  const [puppies, setPuppies] = useState(initialPuppies)
  const [handled, setHandled] = useState<string[]>([])
  const [ready, setReady] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(equipment.map((e) => [e.id, e.done]))
  )
  const live = sessions.find((s) => sessionState(s) === "live")
  const next = sessions.find((s) => sessionState(s) === "upcoming")
  const present = puppies.filter((p) => p.present).length
  const individuals = sessions.filter((s) => s.dog).length
  const handle = (id: string) => setHandled((list) => [...list, id])

  const toWrite = reports.filter(
    (r) => !r.sent && !(r.after !== undefined && NOW < r.after)
  )
  const rainy = sessions.flatMap((s) => {
    const rain = forecast.find(
      (f) => f.sky === "rain" && s.start <= f.hour && f.hour < s.end
    )
    return rain ? [{ hour: rain.hour, session: s }] : []
  })

  const attention: Attention[] = [
    ...puppies
      .filter((p) => !p.present)
      .map((p) => ({
        actions: (
          <Button onClick={() => handle(`absent-${p.id}`)}>
            Proposer un rattrapage
          </Button>
        ),
        detail: `${p.owner} n'a pas prévenu · séance à rattraper`,
        icon: UserRemove01Icon,
        id: `absent-${p.id}`,
        title: `${p.name} absent ${live ? `au ${live.title.toLowerCase()}` : "aujourd'hui"}`,
        tone: "bg-destructive-soft text-destructive",
      })),
    ...rainy.map(({ hour, session }) => ({
      actions: (
        <Button onClick={() => handle(`rain-${session.id}`)}>
          Prévenir {session.owner?.split(" ")[0] ?? "les familles"}
        </Button>
      ),
      detail: `${session.place} : prévoir l'intérieur ou décaler`,
      icon: CloudAngledRainIcon,
      id: `rain-${session.id}`,
      title: `Pluie à ${formatHour(hour)} · ${session.title}`,
      tone: "bg-wise-blue text-wise-charcoal",
    })),
    ...(toWrite.length
      ? [
          {
            actions: (
              <Button render={<Link href="/training/sessions" />}>
                Rédiger
              </Button>
            ),
            detail: toWrite.map((r) => `${r.dog} · ${r.session}`).join(" — "),
            icon: FileEditIcon,
            id: "reports",
            title: `${toWrite.length} compte${toWrite.length > 1 ? "s" : ""}-rendu${toWrite.length > 1 ? "s" : ""} à envoyer`,
            tone: "bg-training text-training-foreground",
          },
        ]
      : []),
    ...packages
      .filter((p) => p.total - p.used <= 1)
      .map((p) => ({
        actions: (
          <Button
            className="bg-background"
            onClick={() => handle(`package-${p.dog}`)}
            variant="outline"
          >
            Proposer un renouvellement
          </Button>
        ),
        detail: `${p.name} · ${p.used}/${p.total} séances · ${p.owner}`,
        icon: Tick02Icon,
        id: `package-${p.dog}`,
        title: `Forfait de ${p.dog} presque terminé`,
        tone: "bg-warning-soft text-warning-foreground",
      })),
  ].filter((item) => !handled.includes(item.id))

  const dayTasks: Task[] = sessions.map((s) => ({
    detail: [
      s.owner ?? `${puppies.length} chiots inscrits`,
      s.place,
      `Objectif : ${s.goal}`,
    ].join(" · "),
    done: sessionState(s) === "done",
    icon: kindIcons[s.kind],
    id: s.id,
    time: s.start,
    title: `${s.title}${s.breed ? ` · ${s.breed}` : ""}`,
    tone:
      sessionState(s) === "live"
        ? "bg-control text-control-foreground"
        : "bg-training text-training-foreground",
  }))

  const prepTasks: Task[] = equipment.map((e) => ({
    action: {
      label: "Prêt",
      onClick: () => setReady((r) => ({ ...r, [e.id]: true })),
    },
    detail: e.detail,
    done: ready[e.id],
    icon: PackageIcon,
    id: e.id,
    title: e.label,
    tone: "bg-wise-blue text-wise-charcoal",
  }))

  return (
    <ActivityDayPage
      actions={
        <NewSessionDialog
          trigger={
            <Button>
              <HugeiconsIcon icon={CalendarAdd01Icon} />
              Planifier une séance
            </Button>
          }
        />
      }
      activity="Éducation"
      aside={
        <div className="flex h-10 items-center gap-2 rounded-full bg-muted ps-1 pe-4 text-sm font-semibold">
          <Avatar className="size-8">
            <AvatarFallback className="bg-background text-xs">
              IN
            </AvatarFallback>
          </Avatar>
          Inès
          <span className="font-normal text-muted-foreground">
            · éducatrice 10h – 19h
          </span>
        </div>
      }
      summary={
        <>
          {sessions.length} séances et {present + individuals} chiens
          accompagnés aujourd&apos;hui.
        </>
      }
    >
      {live ? (
        <LiveSession
          onToggle={(id) =>
            setPuppies((list) =>
              list.map((p) => (p.id === id ? { ...p, present: !p.present } : p))
            )
          }
          puppies={puppies}
          session={live}
        />
      ) : (
        next && <NextSession session={next} />
      )}

      <Section count={attention.length || undefined} title="À traiter">
        <AttentionList
          items={attention}
          limit={3}
          moreHref="/training/sessions"
        />
      </Section>

      <div className="grid items-start gap-8 lg:grid-cols-3">
        <Section className="lg:col-span-2" title="La journée">
          <TaskList
            empty="Toutes les séances sont terminées"
            tasks={dayTasks}
          />
        </Section>
        <Section title="À préparer">
          <TaskList empty="Tout le matériel est prêt" tasks={prepTasks} />
        </Section>
      </div>
    </ActivityDayPage>
  )
}
