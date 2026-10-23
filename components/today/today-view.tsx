"use client"

import {
  ArrowRight01Icon,
  Calendar03Icon,
  Call02Icon,
  Clock01Icon,
  CloudAngledRainIcon,
  Login03Icon,
  Logout03Icon,
  PackageIcon,
  PlusSignIcon,
  PrinterIcon,
  ScissorIcon,
  SunCloud01Icon,
  UserGroupIcon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import {
  type Activity,
  activityMeta,
  activityNames,
} from "@/components/activity-mark"
import { hourOf } from "@/components/agenda/agenda"
import { appointments, salonBookings, stock } from "@/components/grooming/data"
import { NewAppointmentDialog } from "@/components/grooming/new-appointment-dialog"
import { kennels, stayMovements, stays } from "@/components/pension/data"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import { Squiggle } from "@/components/site/doodles"
import { activityIcons } from "@/components/site/site-ui"
import { NOW, team, timeline } from "@/components/today/data"
import {
  type Attention,
  AttentionList,
  formatHour,
  PageBody,
  Section,
} from "@/components/today/widgets"
import {
  forecast,
  puppies,
  reports,
  sessions,
} from "@/components/training/data"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DAY_START = 8
const DAY_END = 19
const hours = Array.from(
  { length: DAY_END - DAY_START + 1 },
  (_, i) => DAY_START + i
)
const pct = (hour: number) => ((hour - DAY_START) / (DAY_END - DAY_START)) * 100

/** Bouton secondaire sur le bandeau vert foncé. */
const onForest = "border-transparent bg-white/10 text-white hover:bg-white/20"

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`

/** Les trois activités côte à côte, dans le même planning. */
function DayTimeline() {
  return (
    <div className="rounded-3xl bg-muted p-4 md:p-5">
      <div className="-mx-4 overflow-x-auto px-4 md:-mx-5 md:px-5">
        <div className="min-w-[720px]">
          <div className="flex">
            <div className="w-36 shrink-0" />
            <div className="relative h-6 flex-1 text-sm font-semibold text-muted-foreground tabular-nums">
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
              className="pointer-events-none absolute inset-y-0 start-36 end-0"
            >
              {hours.map((hour) => (
                <span
                  className="absolute inset-y-0 w-0.5 bg-background"
                  key={hour}
                  style={{ left: `${pct(hour)}%` }}
                />
              ))}
            </div>
            {activityNames.map((activity) => (
              <div
                className="flex items-center border-t-2 border-background py-2.5"
                key={activity}
              >
                <div className="flex w-36 shrink-0 items-center gap-2 font-semibold">
                  <HugeiconsIcon
                    className="size-5"
                    icon={activityIcons[activity]}
                  />
                  {activity}
                </div>
                <div className="relative h-10 flex-1">
                  {timeline
                    .filter((event) => event.activity === activity)
                    .map((event) => {
                      const live = event.start <= NOW && NOW < event.end
                      return (
                        <div
                          className={cn(
                            "absolute inset-y-0 z-1 flex items-center gap-1 overflow-hidden rounded-full px-3 text-sm font-semibold",
                            activityMeta[activity].tint,
                            event.end <= NOW && "opacity-50",
                            live && "ring-2 ring-control"
                          )}
                          key={event.label}
                          style={{
                            left: `${pct(event.start)}%`,
                            width: `calc(${pct(event.end) - pct(event.start)}% - 3px)`,
                          }}
                          title={`${event.label} · ${formatHour(event.start)} – ${formatHour(event.end)}`}
                        >
                          {event.kind && (
                            <HugeiconsIcon
                              className="size-3.5 shrink-0"
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
              className="pointer-events-none absolute inset-y-0 start-36 end-0"
            >
              <div
                className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-control"
                style={{ left: `${pct(NOW)}%` }}
              >
                <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-control" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Une activité en un coup d'œil, dans sa couleur ; un clic pour y aller. */
function ActivityCard({
  activity,
  href,
  figure,
  label,
  lines,
  todo,
}: {
  activity: Activity
  href: string
  figure: string
  label: string
  lines: { icon: IconSvgElement; text: string }[]
  todo?: string
}) {
  return (
    <Link
      className={cn(
        "group flex flex-col gap-5 rounded-4xl p-5 transition-[filter] hover:brightness-[0.97] md:p-6",
        activityMeta[activity].tint
      )}
      href={href}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-display text-3xl">
          <HugeiconsIcon className="size-6" icon={activityIcons[activity]} />
          {activity}
        </span>
        <span className="flex size-10 items-center justify-center rounded-full bg-white/60 transition-transform group-hover:translate-x-0.5">
          <HugeiconsIcon className="size-5" icon={ArrowRight01Icon} />
        </span>
      </div>
      <div>
        <p className="font-display text-6xl leading-none tabular-nums">
          {figure}
        </p>
        <p className="mt-1 font-semibold">{label}</p>
      </div>
      <ul className="space-y-2">
        {lines.map((line) => (
          <li
            className="flex items-center gap-2.5 rounded-2xl bg-white/50 px-3 py-2.5"
            key={line.text}
          >
            <HugeiconsIcon className="size-5 shrink-0" icon={line.icon} />
            {line.text}
          </li>
        ))}
      </ul>
      {todo && (
        <span className="mt-auto w-fit rounded-full bg-wise-forest px-3 py-1 text-sm font-semibold text-wise-green">
          {todo}
        </span>
      )}
    </Link>
  )
}

export function TodayView() {
  const [handled, setHandled] = useState<string[]>([])
  const handle = (id: string) => setHandled((list) => [...list, id])

  // Pension
  const present = kennels.filter(
    (k) => k.status === "occupied" || k.status === "departing"
  ).length
  const arrivals = stayMovements.filter((m) => m.type === "arrival")
  const departures = stayMovements.filter((m) => m.type === "departure")
  const late = stayMovements.filter((m) => m.status === "late")
  const nextArrival = arrivals.find((m) => m.status === "expected")
  const stayRequests = stays.filter((s) => s.status === "pending").length

  // Toilettage
  const onTable = appointments.find((a) => a.status === "in-progress")
  const nextGrooming = appointments.find(
    (a) => a.status === "upcoming" || a.status === "checked-in"
  )
  const groomingRequests = salonBookings.filter(
    (b) => b.status === "pending"
  ).length
  const low = stock.filter((item) => item.level < 25)

  // Éducation
  const liveSession = sessions.find((s) => s.start <= NOW && NOW < s.end)
  const nextSession = sessions.find((s) => s.start > NOW)
  const absent = puppies.filter((p) => !p.present)
  const toWrite = reports.filter(
    (r) => !r.sent && !(r.after !== undefined && NOW < r.after)
  ).length
  const rainy = sessions.flatMap((s) => {
    const rain = forecast.find(
      (f) => f.sky === "rain" && s.start <= f.hour && f.hour < s.end
    )
    return rain ? [{ hour: rain.hour, session: s }] : []
  })

  /** Seulement l'urgent du jour ; le reste attend dans chaque activité. */
  const attention: Attention[] = [
    ...late.map((m) => ({
      actions: (
        <>
          <Button className="bg-background" variant="outline">
            <HugeiconsIcon icon={Call02Icon} />
            Appeler {m.owner.split(" ")[0]}
          </Button>
          <Button render={<Link href="/pension/today" />}>
            Valider le départ
          </Button>
        </>
      ),
      detail: `Pension · prévu à ${formatHour(hourOf(m.time))} · ${m.kennel} · ${m.owner}`,
      icon: Logout03Icon,
      id: `late-${m.id}`,
      title: `Départ de ${m.pet} · en retard`,
      tone: "bg-destructive-soft text-destructive",
    })),
    ...absent.map((p) => ({
      actions: (
        <Button onClick={() => handle(`absent-${p.id}`)}>
          Proposer un rattrapage
        </Button>
      ),
      detail: `Éducation · ${p.owner} n'a pas prévenu`,
      icon: UserRemove01Icon,
      id: `absent-${p.id}`,
      title: `${p.name} absent ${liveSession ? `au ${liveSession.title.toLowerCase()}` : "aujourd'hui"}`,
      tone: activityMeta["Éducation"].tint,
    })),
    ...(low.length
      ? [
          {
            actions: (
              <Button onClick={() => handle("stock")}>
                <HugeiconsIcon icon={PackageIcon} />
                Commander
              </Button>
            ),
            detail: `Toilettage · ${low.map((item) => `${item.label} ${item.level} %`).join(" · ")}`,
            icon: PackageIcon,
            id: "stock",
            title: `${plural(low.length, "produit")} presque vide${low.length > 1 ? "s" : ""}`,
            tone: activityMeta.Toilettage.tint,
          },
        ]
      : []),
    ...rainy.map(({ hour, session }) => ({
      actions: (
        <Button onClick={() => handle(`rain-${session.id}`)}>
          Prévenir {session.owner?.split(" ")[0] ?? "les familles"}
        </Button>
      ),
      detail: `Éducation · ${session.place} : prévoir l'intérieur ou décaler`,
      icon: CloudAngledRainIcon,
      id: `rain-${session.id}`,
      title: `Pluie à ${formatHour(hour)} · ${session.title}`,
      tone: activityMeta["Éducation"].tint,
    })),
  ].filter((item) => !handled.includes(item.id))

  return (
    <PageBody>
      <section className="relative overflow-hidden rounded-4xl bg-wise-forest p-6 text-white md:p-10">
        <Squiggle className="absolute -right-10 -bottom-12 w-56 md:w-96" />
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-white/70">Mercredi 21 octobre</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold">
                <HugeiconsIcon className="size-5" icon={SunCloud01Icon} />
                16 °C
                <span className="font-normal text-white/70">
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
                    <AvatarFallback className="bg-white/15 text-xs font-semibold text-white">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="font-display text-7xl leading-[0.9] text-wise-green md:text-9xl">
              Bonjour
            </h1>
            <p className="max-w-xl text-lg text-white/80">
              {present} animaux en pension,{" "}
              {plural(appointments.length, "toilettage")} et{" "}
              {plural(sessions.length, "séance")} d&apos;éducation
              aujourd&apos;hui.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <NewStayDialog
              trigger={
                <Button size="lg">
                  <HugeiconsIcon icon={PlusSignIcon} />
                  Nouveau séjour
                </Button>
              }
            />
            <NewAppointmentDialog
              trigger={
                <Button className={onForest} size="lg">
                  <HugeiconsIcon icon={Calendar03Icon} />
                  Nouveau rendez-vous
                </Button>
              }
            />
            <Button className={onForest} size="lg">
              <HugeiconsIcon icon={PrinterIcon} />
              Feuille du jour
            </Button>
          </div>
        </div>
      </section>

      <Section count={attention.length || undefined} title="À traiter">
        <AttentionList items={attention} />
      </Section>

      <Section title="Vos activités">
        <div className="grid gap-4 md:grid-cols-3">
          <ActivityCard
            activity="Pension"
            figure={`${present}/${kennels.length}`}
            href="/pension/today"
            label="box occupés ce soir"
            lines={[
              {
                icon: Login03Icon,
                text: nextArrival
                  ? `Prochaine arrivée : ${nextArrival.pet} à ${formatHour(hourOf(nextArrival.time))}`
                  : `${plural(arrivals.length, "arrivée")} aujourd'hui`,
              },
              {
                icon: Logout03Icon,
                text: `${plural(departures.length, "départ")}${late.length ? ` · ${late.length} en retard` : ""}`,
              },
            ]}
            todo={
              stayRequests
                ? `${plural(stayRequests, "demande")} à confirmer`
                : undefined
            }
          />
          <ActivityCard
            activity="Toilettage"
            figure={String(appointments.length)}
            href="/grooming/today"
            label="rendez-vous aujourd'hui"
            lines={[
              {
                icon: ScissorIcon,
                text: onTable
                  ? `${onTable.pet} sur la table · fin ${formatHour(onTable.end)}`
                  : "Table libre",
              },
              {
                icon: Clock01Icon,
                text: nextGrooming
                  ? `Prochain : ${nextGrooming.pet} à ${formatHour(nextGrooming.start)}`
                  : "Plus de rendez-vous",
              },
            ]}
            todo={
              groomingRequests
                ? `${plural(groomingRequests, "demande")} en ligne`
                : undefined
            }
          />
          <ActivityCard
            activity="Éducation"
            figure={String(sessions.length)}
            href="/training/today"
            label="séances aujourd'hui"
            lines={[
              {
                icon: UserGroupIcon,
                text: liveSession
                  ? `${liveSession.title} en cours · fin ${formatHour(liveSession.end)}`
                  : "Aucune séance en cours",
              },
              {
                icon: Clock01Icon,
                text: nextSession
                  ? `Prochaine : ${nextSession.dog ?? nextSession.title} à ${formatHour(nextSession.start)}`
                  : "Plus de séance",
              },
            ]}
            todo={
              toWrite
                ? `${toWrite} compte${toWrite > 1 ? "s" : ""}-rendu${toWrite > 1 ? "s" : ""} à envoyer`
                : undefined
            }
          />
        </div>
      </Section>

      <Section
        action={
          <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-semibold">
            <span className="size-2 rounded-full bg-control" />
            Maintenant · {formatHour(NOW)}
          </span>
        }
        title="Le fil de la journée"
      >
        <DayTimeline />
      </Section>
    </PageBody>
  )
}
