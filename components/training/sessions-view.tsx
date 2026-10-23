"use client"

import {
  AgendaToolbar,
  type AgendaView,
  TimeGrid,
} from "@/components/agenda/agenda"
import { NewSessionDialog } from "@/components/training/new-session-dialog"
import {
  Calendar03Icon,
  CalendarAdd01Icon,
  FileEditIcon,
  Home01Icon,
  Location01Icon,
  Target02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { dateOf, longDate, relativeDate, TODAY } from "@/components/calendar"
import { NOW } from "@/components/today/data"
import {
  ActivityPage,
  AttentionList,
  Bar,
  formatHour,
  Section,
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
  Individuel: { bar: "bg-training-strong", icon: Target02Icon },
  "À domicile": { bar: "bg-wise-blue", icon: Home01Icon },
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
        "flex w-full items-stretch gap-3 rounded-xl border bg-card p-3 text-start transition-colors hover:bg-muted/40",
        state === "live" && "border-control bg-accent",
        (state === "done" || state === "cancelled") && "opacity-60"
      )}
      onClick={onOpen}
      type="button"
    >
      <span
        className={cn("w-1 shrink-0 rounded-full", kindMeta[session.kind].bar)}
      />
      <span className="w-24 shrink-0 text-sm tabular-nums">
        <span className="block font-semibold">{formatHour(session.start)}</span>
        <span className="block text-xs text-muted-foreground">
          {formatHour(session.end)}
        </span>
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span
          className={cn(
            "flex items-center gap-2 text-sm font-semibold",
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
          <span className="text-[0.6875rem] text-warning-foreground">
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
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Compte-rendu
                  </h3>
                  {session.report ? (
                    <p className="rounded-xl border p-3 text-sm">
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
                "flex items-center gap-2 text-sm font-semibold",
                day === TODAY && "text-link"
              )}
            >
              {relativeDate(day)}
              {day === TODAY && (
                <span className="size-1.5 rounded-full bg-control" />
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
                  <span className="font-semibold tabular-nums">
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
                  <Button size="sm" variant="outline">
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
                  <p className="font-semibold">{g.schedule}</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-2.5">
                  <p className="text-xs text-muted-foreground">Tarif</p>
                  <p className="font-semibold">{g.price}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Bar
                  className={fill >= 0.85 ? "bg-warning" : "bg-training-strong"}
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
                    <Avatar className="size-10" key={member} title={member}>
                      <AvatarFallback className="bg-training text-[0.625rem] text-training-foreground">
                        {member.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarGroup>
                <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
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

const OPEN = 9
const CLOSE = 20
const WEEK = Array.from({ length: 7 }, (_, i) => i)

const blockOf = (s: WeekSession) => {
  const state = stateOf(s)
  return state === "cancelled"
    ? "border border-dashed text-muted-foreground line-through"
    : state === "done"
      ? "bg-muted text-muted-foreground"
      : state === "live"
        ? "bg-control text-control-foreground"
        : "bg-training text-training-foreground"
}

export function SessionsView() {
  const [sessions, setSessions] = useState(weekSessions)
  const [tab, setTab] = useState("agenda")
  const [view, setView] = useState<AgendaView>("week")
  const [focus, setFocus] = useState(TODAY)
  const [slot, setSlot] = useState<{ day: number; start: number } | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const toReport = sessions.filter((s) => stateOf(s) === "done" && !s.report)
  const openSession = sessions.find((s) => s.id === openId) ?? null
  const open = (id: string) => {
    setOpenId(id)
    setSheetOpen(true)
  }
  const add = (session: WeekSession) =>
    setSessions((list) => [...list, session])

  return (
    <ActivityPage
      actions={
        <NewSessionDialog
          onCreate={add}
          trigger={
            <Button>
              <HugeiconsIcon icon={CalendarAdd01Icon} />
              Planifier une séance
            </Button>
          }
        />
      }
      activity="Éducation"
      title="Séances"
    >
      {toReport.length > 0 && (
        <Section count={toReport.length} title="À traiter">
          <AttentionList
            items={toReport.map((x) => ({
              actions: <Button onClick={() => open(x.id)}>Rédiger</Button>,
              detail: `${relativeDate(x.day)} · ${range(x)} · ${x.place}`,
              icon: FileEditIcon,
              id: x.id,
              onOpen: () => open(x.id),
              title: `Compte-rendu · ${x.title}${x.owner ? ` · ${x.owner}` : ""}`,
              tone: "bg-training text-training-foreground",
            }))}
          />
        </Section>
      )}

      <Tabs onValueChange={(value) => setTab(String(value))} value={tab}>
        <TabsList>
          <TabsTab value="agenda">Agenda</TabsTab>
          <TabsTab value="programmes">Programmes individuels</TabsTab>
          <TabsTab value="groups">Cours collectifs</TabsTab>
        </TabsList>
      </Tabs>

      {tab === "agenda" && (
        <section className="space-y-4">
          <AgendaToolbar
            atToday={view === "day" ? focus === TODAY : true}
            label={
              view === "day"
                ? longDate(focus)
                : `Semaine du ${dateOf(WEEK[0]).day} au ${dateOf(WEEK[6]).day} ${dateOf(WEEK[6]).month}`
            }
            nextDisabled={view !== "day" || focus >= WEEK[6]}
            onNext={() => setFocus(focus + 1)}
            onPrev={() => setFocus(focus - 1)}
            onToday={() => setFocus(TODAY)}
            onView={setView}
            prevDisabled={view !== "day" || focus <= WEEK[0]}
            view={view}
          />
          {view === "list" ? (
            <Agenda onOpen={open} sessions={sessions} />
          ) : (
            <>
              <TimeGrid
                close={CLOSE}
                days={view === "day" ? [focus] : WEEK}
                events={sessions.map((s) => ({
                  className: blockOf(s),
                  day: s.day,
                  end: s.end,
                  icon: kindMeta[s.kind].icon,
                  id: s.id,
                  start: s.start,
                  subtitle: [
                    s.owner ??
                      (s.group &&
                        `${s.group.enrolled}/${s.group.capacity} inscrits`),
                    s.place,
                  ]
                    .filter(Boolean)
                    .join(" · "),
                  title: s.title,
                }))}
                onDay={(day) => {
                  setFocus(day)
                  setView("day")
                }}
                onOpen={open}
                onSlot={(day, start) => setSlot({ day, start })}
                open={OPEN}
              />
              <p className="text-sm text-muted-foreground">
                Touchez un créneau libre pour planifier une séance, ou un jour
                pour le voir en grand.
              </p>
            </>
          )}
        </section>
      )}
      {tab === "programmes" && <Programmes />}
      {tab === "groups" && <Groups />}

      {slot && (
        <NewSessionDialog
          defaultOpen
          initial={slot}
          key={`${slot.day}-${slot.start}`}
          onCreate={add}
          onOpenChange={(next) => !next && setSlot(null)}
        />
      )}

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
