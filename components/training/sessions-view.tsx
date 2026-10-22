"use client"

import {
  Calendar03Icon,
  CalendarAdd01Icon,
  Clock01Icon,
  FileEditIcon,
  Home01Icon,
  Location01Icon,
  Target02Icon,
  Tick02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { longDate, relativeDate, TODAY } from "@/components/calendar"
import { NOW } from "@/components/today/data"
import {
  ActivityPage,
  Bar,
  formatHour,
  Kpi,
  Widget,
} from "@/components/today/widgets"
import {
  groups,
  programmes,
  puppies,
  type SessionKind,
  type WeekSession,
  weekSessions,
} from "@/components/training/data"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Meter, MeterIndicator, MeterTrack } from "@/components/ui/meter"
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const kindMeta: Record<
  SessionKind,
  { icon: typeof UserGroupIcon; bar: string }
> = {
  Collectif: { bar: "bg-training-strong", icon: UserGroupIcon },
  Individuel: { bar: "bg-sky-500", icon: Target02Icon },
  "À domicile": { bar: "bg-indigo-400", icon: Home01Icon },
}

type State = "done" | "live" | "upcoming" | "cancelled"

const stateOf = (s: WeekSession): State =>
  s.cancelled
    ? "cancelled"
    : s.day < TODAY || (s.day === TODAY && s.end <= NOW)
      ? "done"
      : s.day === TODAY && s.start <= NOW
        ? "live"
        : "upcoming"

const stateMeta: Record<
  State,
  { label: string; variant: "secondary" | "warning" | "outline" | "error" }
> = {
  cancelled: { label: "Annulée", variant: "error" },
  done: { label: "Terminée", variant: "secondary" },
  live: { label: "En cours", variant: "warning" },
  upcoming: { label: "À venir", variant: "outline" },
}

const range = (s: { start: number; end: number }) =>
  `${formatHour(s.start)} – ${formatHour(s.end)}`

function SkillMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">{value} %</span>
      </div>
      <Meter aria-label={label} value={value}>
        <MeterTrack>
          <MeterIndicator className="bg-training-strong" />
        </MeterTrack>
      </Meter>
    </div>
  )
}

function SessionRow({
  session,
  onOpen,
}: {
  session: WeekSession
  onOpen: () => void
}) {
  const state = stateOf(session)
  return (
    <button
      className={cn(
        "flex w-full items-stretch gap-3 rounded-lg border bg-card p-3 text-start transition-colors hover:bg-muted/40",
        state === "live" && "border-orange-500/60 bg-orange-500/5",
        (state === "done" || state === "cancelled") && "opacity-60"
      )}
      onClick={onOpen}
      type="button"
    >
      <span
        className={cn("w-1 shrink-0 rounded-full", kindMeta[session.kind].bar)}
      />
      <span className="w-24 shrink-0 text-sm tabular-nums">
        <span className="block font-medium">{formatHour(session.start)}</span>
        <span className="block text-xs text-muted-foreground">
          {formatHour(session.end)}
        </span>
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            state === "cancelled" && "line-through"
          )}
        >
          {session.title}
          {session.owner && (
            <span className="truncate font-normal text-muted-foreground">
              · {session.owner}
            </span>
          )}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <HugeiconsIcon
              className="size-3.5"
              icon={kindMeta[session.kind].icon}
            />
            {session.kind}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon className="size-3.5" icon={Location01Icon} />
            {session.place}
          </span>
          {session.programme && (
            <span>
              {session.programme.name} · {session.programme.session}/
              {session.programme.total}
            </span>
          )}
          {session.group && (
            <span>
              {session.group.enrolled}/{session.group.capacity} inscrits
            </span>
          )}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end justify-between gap-2">
        <Badge variant={stateMeta[state].variant}>
          {stateMeta[state].label}
        </Badge>
        {state === "done" && !session.report && (
          <span className="text-[0.6875rem] text-amber-600 dark:text-amber-400">
            Compte-rendu à faire
          </span>
        )}
      </span>
    </button>
  )
}

function SessionSheet({
  session,
  open,
  onOpenChange,
  onReport,
}: {
  session: WeekSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReport: (id: string, report: string) => void
}) {
  const [draft, setDraft] = useState("")
  const programme = programmes.find(
    (p) => p.dog === session?.title && p.owner === session?.owner
  )
  const group = groups.find((g) => g.name === session?.title)
  const state = session ? stateOf(session) : "upcoming"

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup variant="inset">
        {session && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Badge variant={stateMeta[state].variant}>
                  {stateMeta[state].label}
                </Badge>
                <Badge variant="outline">
                  <HugeiconsIcon icon={kindMeta[session.kind].icon} />
                  {session.kind}
                </Badge>
              </div>
              <SheetTitle>{session.title}</SheetTitle>
              <SheetDescription>
                {longDate(session.day)} · {range(session)}
              </SheetDescription>
            </SheetHeader>
            <SheetPanel className="space-y-6">
              <dl className="divide-y rounded-xl border text-sm">
                {[
                  ["Lieu", session.place],
                  ["Éducatrice", "Inès"],
                  ...(session.owner ? [["Propriétaire", session.owner]] : []),
                  ...(session.programme
                    ? [
                        [
                          "Programme",
                          `${session.programme.name} · séance ${session.programme.session}/${session.programme.total}`,
                        ],
                      ]
                    : []),
                  ...(session.group
                    ? [
                        [
                          "Inscrits",
                          `${session.group.enrolled} sur ${session.group.capacity} places`,
                        ],
                      ]
                    : []),
                ].map(([label, value]) => (
                  <div className="flex gap-4 px-4 py-2.5" key={label}>
                    <dt className="w-24 shrink-0 text-muted-foreground">
                      {label}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              {programme && (
                <section className="space-y-3">
                  <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Progression de {programme.dog}
                  </h3>
                  <p className="flex items-start gap-1.5 rounded-lg bg-muted/60 p-2 text-sm">
                    <HugeiconsIcon
                      className="mt-0.5 size-4 shrink-0"
                      icon={Target02Icon}
                    />
                    {programme.goal}
                  </p>
                  {programme.skills.map((skill) => (
                    <SkillMeter key={skill.label} {...skill} />
                  ))}
                </section>
              )}

              {group && (
                <section className="space-y-2">
                  <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Participants
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.members.map((member) => (
                      <Badge key={member} variant="secondary">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {state === "done" && (
                <section className="space-y-2">
                  <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Compte-rendu
                  </h3>
                  {session.report ? (
                    <p className="rounded-lg border p-3 text-sm">
                      {session.report}
                    </p>
                  ) : (
                    <Textarea
                      aria-label="Compte-rendu de la séance"
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Exercices travaillés, progrès, devoirs pour la semaine…"
                      value={draft}
                    />
                  )}
                </section>
              )}
            </SheetPanel>
            <SheetFooter>
              {state === "done" && !session.report ? (
                <Button
                  disabled={!draft.trim()}
                  onClick={() => {
                    onReport(session.id, draft.trim())
                    setDraft("")
                  }}
                >
                  <HugeiconsIcon icon={FileEditIcon} />
                  Envoyer le compte-rendu
                </Button>
              ) : state === "upcoming" ? (
                <>
                  <Button variant="outline">Déplacer</Button>
                  <Button>Envoyer un rappel</Button>
                </>
              ) : (
                <Button onClick={() => onOpenChange(false)} variant="outline">
                  Fermer
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetPopup>
    </Sheet>
  )
}

function Agenda({
  sessions,
  onOpen,
}: {
  sessions: WeekSession[]
  onOpen: (id: string) => void
}) {
  const days = Array.from({ length: 7 }, (_, i) => i)
  return (
    <div className="space-y-5">
      {days.map((day) => {
        const list = sessions
          .filter((s) => s.day === day)
          .sort((a, b) => a.start - b.start)
        return (
          <section className="space-y-2" key={day}>
            <h3
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                day === TODAY && "text-orange-600 dark:text-orange-400"
              )}
            >
              {relativeDate(day)}
              {day === TODAY && (
                <span className="size-1.5 rounded-full bg-orange-500" />
              )}
              <span className="font-normal text-muted-foreground">
                ·{" "}
                {list.length === 0
                  ? "Pas de séance"
                  : `${list.length} séance${list.length > 1 ? "s" : ""}`}
              </span>
            </h3>
            {list.map((session) => (
              <SessionRow
                key={session.id}
                onOpen={() => onOpen(session.id)}
                session={session}
              />
            ))}
          </section>
        )
      })}
    </div>
  )
}

function Programmes() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {programmes.map((p) => {
        const ending = p.total - p.done <= 1
        return (
          <Widget
            action={
              ending ? (
                <Badge variant="warning">Dernière séance</Badge>
              ) : undefined
            }
            description={`${p.breed} · ${p.owner}`}
            key={p.dog}
            title={p.dog}
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{p.name}</span>
                  <span className="font-medium tabular-nums">
                    {p.done}/{p.total} séances
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: p.total }, (_, i) => (
                    <span
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        i < p.done ? "bg-training-strong" : "bg-muted"
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
                {p.goal}
              </p>
              <div className="space-y-2">
                {p.skills.map((skill) => (
                  <SkillMeter key={skill.label} {...skill} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                « {p.note} »
              </p>
              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <HugeiconsIcon className="size-3.5" icon={Calendar03Icon} />
                  Prochaine : {p.next}
                </span>
                {ending && (
                  <Button size="xs" variant="outline">
                    Proposer la suite
                  </Button>
                )}
              </div>
            </div>
          </Widget>
        )
      })}
    </div>
  )
}

function Groups() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map((g) => {
        const fill = g.members.length / g.capacity
        const roster =
          g.id === "puppies"
            ? puppies.map((p) => `${p.name} · ${p.breed}`)
            : g.members
        return (
          <Widget
            action={
              <Badge variant={fill >= 0.85 ? "warning" : "outline"}>
                {g.members.length}/{g.capacity} places
              </Badge>
            }
            description={`${g.age} · ${g.place}`}
            key={g.id}
            title={g.name}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-muted/60 p-2.5">
                  <p className="text-xs text-muted-foreground">Créneaux</p>
                  <p className="font-medium">{g.schedule}</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-2.5">
                  <p className="text-xs text-muted-foreground">Tarif</p>
                  <p className="font-medium">{g.price}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Bar
                  className={fill >= 0.85 ? "bg-amber-500" : "bg-training-strong"}
                  label={`Remplissage ${g.name}`}
                  value={fill * 100}
                />
                <p className="text-xs text-muted-foreground">
                  {g.capacity - g.members.length} place
                  {g.capacity - g.members.length > 1 && "s"} libre
                  {g.capacity - g.members.length > 1 && "s"}
                  {g.waitlist > 0 && ` · ${g.waitlist} en liste d'attente`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <AvatarGroup>
                  {g.members.slice(0, 6).map((member) => (
                    <Avatar className="size-7" key={member} title={member}>
                      <AvatarFallback className="bg-training text-training-foreground text-[0.625rem]">
                        {member.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarGroup>
                <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {roster.join(", ")}
                </p>
              </div>
            </div>
          </Widget>
        )
      })}
    </div>
  )
}

export function SessionsView() {
  const [sessions, setSessions] = useState(weekSessions)
  const [tab, setTab] = useState("agenda")
  const [openId, setOpenId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const active = sessions.filter((s) => !s.cancelled)
  const hours = active.reduce((sum, s) => sum + s.end - s.start, 0)
  const dogs =
    programmes.length + groups.reduce((sum, g) => sum + g.members.length, 0)
  const missingReports = sessions.filter(
    (s) => stateOf(s) === "done" && !s.report
  ).length
  const openSession = sessions.find((s) => s.id === openId) ?? null

  return (
    <ActivityPage
      actions={
        <Button size="sm">
          <HugeiconsIcon icon={CalendarAdd01Icon} />
          Planifier une séance
        </Button>
      }
      activity="Éducation"
      title="Séances"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Calendar03Icon} label="Cette semaine" value={active.length}>
          {active.filter((s) => stateOf(s) === "done").length} terminées ·{" "}
          {sessions.length - active.length} annulée
        </Kpi>
        <Kpi icon={UserGroupIcon} label="Chiens suivis" value={dogs}>
          {programmes.length} en individuel · {groups.length} cours collectifs
        </Kpi>
        <Kpi
          icon={Clock01Icon}
          label="Heures de coaching"
          value={formatHour(hours)}
        >
          Inès · du lundi au dimanche
        </Kpi>
        <Kpi icon={Tick02Icon} label="Comptes-rendus" value={missingReports}>
          {missingReports > 0
            ? "À rédiger pour les séances passées"
            : "Tous envoyés"}
        </Kpi>
      </div>

      <Tabs onValueChange={(value) => setTab(String(value))} value={tab}>
        <TabsList size="sm">
          <TabsTab value="agenda">Agenda de la semaine</TabsTab>
          <TabsTab value="programmes">Programmes individuels</TabsTab>
          <TabsTab value="groups">Cours collectifs</TabsTab>
        </TabsList>
      </Tabs>

      {tab === "agenda" && (
        <Agenda
          onOpen={(id) => {
            setOpenId(id)
            setSheetOpen(true)
          }}
          sessions={sessions}
        />
      )}
      {tab === "programmes" && <Programmes />}
      {tab === "groups" && <Groups />}

      <SessionSheet
        onOpenChange={setSheetOpen}
        onReport={(id, report) =>
          setSessions((list) =>
            list.map((s) => (s.id === id ? { ...s, report } : s))
          )
        }
        open={sheetOpen}
        session={openSession}
      />
    </ActivityPage>
  )
}
