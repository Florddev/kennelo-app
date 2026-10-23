"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { Fragment, type ReactNode, useState } from "react"
import { dateOf, TODAY, weekdayOf } from "@/components/calendar"
import { NOW } from "@/components/today/data"
import { formatHour } from "@/components/today/widgets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/** « 08:00 » → 8, « 8h15 » → 8,25 */
export const hourOf = (time: string) => {
  const [h, m = "0"] = time.split(/[:h]/)
  return Number(h) + (Number(m) || 0) / 60
}

export type AgendaView = "day" | "week" | "month" | "list"

const viewLabels: Record<AgendaView, string> = {
  day: "Jour",
  list: "Liste",
  month: "Mois",
  week: "Semaine",
}

/** Précédent · Aujourd'hui · Suivant, la période affichée, et la vue. */
export function AgendaToolbar({
  label,
  onPrev,
  onNext,
  onToday,
  atToday,
  prevDisabled,
  nextDisabled,
  view,
  views = ["day", "week", "list"],
  onView,
  children,
}: {
  label: ReactNode
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  atToday?: boolean
  prevDisabled?: boolean
  nextDisabled?: boolean
  view?: AgendaView
  views?: AgendaView[]
  onView?: (view: AgendaView) => void
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="flex items-center gap-2">
        <Button
          aria-label="Précédent"
          disabled={prevDisabled}
          onClick={onPrev}
          size="icon"
          variant="secondary"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>
        <Button disabled={atToday} onClick={onToday} variant="secondary">
          Aujourd&apos;hui
        </Button>
        <Button
          aria-label="Suivant"
          disabled={nextDisabled}
          onClick={onNext}
          size="icon"
          variant="secondary"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </div>
      <h2 className="font-display text-3xl">{label}</h2>
      <div className="flex flex-wrap items-center gap-3 sm:ms-auto">
        {children}
        {view && onView && (
          <Tabs onValueChange={(v) => onView(v as AgendaView)} value={view}>
            <TabsList>
              {views.map((v) => (
                <TabsTab key={v} value={v}>
                  {viewLabels[v]}
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>
    </div>
  )
}

export type GridEvent = {
  id: string
  day: number
  start: number
  end: number
  title: string
  subtitle?: string
  /** Couleurs du bloc selon son statut. */
  className: string
  icon?: IconSvgElement
}

/**
 * Agenda en grille horaire, sur un jour ou une semaine. Un créneau vide se
 * touche pour créer un rendez-vous à cette heure.
 */
export function TimeGrid({
  days,
  open,
  close,
  events,
  onOpen,
  onSlot,
  isClosed,
  hourPx = 64,
  onDay,
}: {
  days: number[]
  open: number
  close: number
  events: GridEvent[]
  onOpen: (id: string) => void
  onSlot?: (day: number, start: number) => void
  isClosed?: (day: number) => boolean
  hourPx?: number
  /** Touche l'en-tête d'un jour pour l'afficher seul. */
  onDay?: (day: number) => void
}) {
  const single = days.length === 1
  const height = (close - open) * hourPx
  const hours = Array.from({ length: close - open + 1 }, (_, i) => open + i)
  const halves = Array.from(
    { length: (close - open) * 2 },
    (_, i) => open + i / 2
  )
  const top = (hour: number) => (hour - open) * hourPx
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <div className={cn(!single && "min-w-[46rem]")}>
        {!single && (
          <div className="flex border-b">
            <div className="w-14 shrink-0" />
            {days.map((day) => (
              <button
                className="flex flex-1 flex-col items-center gap-0.5 border-s py-2 transition-colors hover:bg-accent disabled:pointer-events-none"
                disabled={!onDay}
                key={day}
                onClick={() => onDay?.(day)}
                type="button"
              >
                <span className="text-xs font-semibold text-muted-foreground">
                  {weekdayOf(day)}
                </span>
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full font-semibold tabular-nums",
                    day === TODAY && "bg-control text-control-foreground"
                  )}
                >
                  {dateOf(day).day}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="flex">
          <div className="relative w-14 shrink-0" style={{ height }}>
            {hours.slice(0, -1).map((hour) => (
              <span
                className="absolute end-2 text-xs text-muted-foreground tabular-nums"
                key={hour}
                style={{ top: top(hour) + 4 }}
              >
                {hour}h
              </span>
            ))}
          </div>
          {days.map((day) => {
            const closed = isClosed?.(day)
            return (
              <div
                className={cn(
                  "relative flex-1 border-s",
                  day === TODAY && !single && "bg-accent/40"
                )}
                key={day}
                style={{ height }}
              >
                {hours.slice(1, -1).map((hour) => (
                  <span
                    className="pointer-events-none absolute inset-x-0 border-t border-border/60"
                    key={hour}
                    style={{ top: top(hour) }}
                  />
                ))}
                {onSlot &&
                  !closed &&
                  halves
                    .filter((t) => !(day === TODAY && t < NOW) && day >= TODAY)
                    .map((t) => (
                      <button
                        aria-label={`Nouveau à ${formatHour(t)}`}
                        className="absolute inset-x-0 flex items-center px-2.5 text-xs font-semibold text-transparent transition-colors hover:bg-accent hover:text-link"
                        key={t}
                        onClick={() => onSlot(day, t)}
                        style={{ height: hourPx / 2, top: top(t) }}
                        type="button"
                      >
                        + {formatHour(t)}
                      </button>
                    ))}
                {closed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(135deg,transparent,transparent_8px,var(--color-muted)_8px,var(--color-muted)_9px)] text-sm text-muted-foreground">
                    Fermé
                  </div>
                )}
                {events
                  .filter((e) => e.day === day)
                  .map((e) => {
                    const tall = (e.end - e.start) * hourPx >= 44
                    return (
                      <button
                        className={cn(
                          "absolute inset-x-1 z-1 flex flex-col overflow-hidden rounded-xl px-2.5 py-1.5 text-start text-sm transition-[filter] hover:brightness-95",
                          e.className
                        )}
                        key={e.id}
                        onClick={() => onOpen(e.id)}
                        style={{
                          height: (e.end - e.start) * hourPx - 4,
                          top: top(e.start) + 2,
                        }}
                        title={`${e.title} · ${formatHour(e.start)} – ${formatHour(e.end)}${e.subtitle ? ` · ${e.subtitle}` : ""}`}
                        type="button"
                      >
                        <span className="flex items-center gap-1 font-semibold">
                          {e.icon && (
                            <HugeiconsIcon
                              className="size-3.5 shrink-0"
                              icon={e.icon}
                            />
                          )}
                          <span className="truncate">{e.title}</span>
                          {single && (
                            <span className="ms-auto shrink-0 text-xs font-normal tabular-nums opacity-80">
                              {formatHour(e.start)} – {formatHour(e.end)}
                            </span>
                          )}
                        </span>
                        {tall && e.subtitle && (
                          <span className="truncate text-xs opacity-80">
                            {!single && `${formatHour(e.start)} · `}
                            {e.subtitle}
                          </span>
                        )}
                      </button>
                    )
                  })}
                {day === TODAY && NOW > open && NOW < close && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 z-0 h-0.5 bg-control"
                    style={{ top: top(NOW) }}
                  >
                    <span className="absolute -start-1 -top-[3px] size-2 rounded-full bg-control" />
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export type TimelineItem = {
  id: string
  time: number
  title: ReactNode
  detail?: ReactNode
  icon: IconSvgElement
  /** Couleurs du rond quand ce n'est pas encore fait. */
  tone?: string
  done?: boolean
  late?: boolean
  kind?: string
  action?: { label: string; onClick: () => void }
}

function NowMarker() {
  return (
    <li
      aria-label={`Maintenant, ${formatHour(NOW)}`}
      className="flex items-center gap-4 px-3 py-1.5 text-sm font-semibold text-link"
    >
      <span className="w-12 shrink-0 tabular-nums">{formatHour(NOW)}</span>
      <span className="flex w-11 shrink-0 justify-center">
        <span className="size-2.5 rounded-full bg-control" />
      </span>
      <span className="h-0.5 flex-1 rounded-full bg-control" />
      Maintenant
    </li>
  )
}

/**
 * Le programme de la journée dans l'ordre : l'heure, ce qu'il y a à faire et
 * un seul bouton. La prochaine chose à faire est mise en avant.
 */
export function Timeline({
  items,
  filters,
}: {
  items: TimelineItem[]
  filters?: { value: string; label: string }[]
}) {
  const [filter, setFilter] = useState("all")
  const shown = items
    .filter((i) => filter === "all" || i.kind === filter)
    .sort((a, b) => a.time - b.time)
  const nextId = shown.find((i) => !i.done && i.action)?.id
  const nowIndex = shown.findIndex((i) => i.time > NOW)
  const count = (value: string) =>
    items.filter((i) => (value === "all" || i.kind === value) && !i.done).length
  return (
    <div className="space-y-4">
      {filters && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
          {[{ label: "Tout", value: "all" }, ...filters].map((f) => (
            <button
              aria-pressed={filter === f.value}
              className={cn(
                "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
                filter === f.value
                  ? "bg-control text-control-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-neutral-hover"
              )}
              key={f.value}
              onClick={() => setFilter(f.value)}
              type="button"
            >
              {f.label}
              <span className="tabular-nums opacity-70">{count(f.value)}</span>
            </button>
          ))}
        </div>
      )}
      <ol className="-mx-3">
        {shown.map((item, i) => (
          <Fragment key={item.id}>
            {i === nowIndex && <NowMarker />}
            <li
              className={cn(
                "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl p-3 sm:flex-nowrap",
                item.id === nextId && "bg-accent"
              )}
            >
              <span
                className={cn(
                  "w-12 shrink-0 font-semibold tabular-nums",
                  item.done && "text-muted-foreground"
                )}
              >
                {formatHour(item.time)}
              </span>
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full",
                  item.done
                    ? "bg-muted text-muted-foreground"
                    : (item.tone ?? "bg-muted")
                )}
              >
                <HugeiconsIcon
                  className="size-5"
                  icon={item.done ? Tick02Icon : item.icon}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-semibold",
                    item.done && "text-muted-foreground"
                  )}
                >
                  {item.title}
                </p>
                {item.detail && (
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                )}
              </div>
              {item.late && !item.done && (
                <Badge variant="error">En retard</Badge>
              )}
              {item.action && !item.done && (
                <Button
                  className="max-sm:ms-28"
                  onClick={item.action.onClick}
                  size="sm"
                  variant={item.id === nextId ? "default" : "secondary"}
                >
                  {item.action.label}
                </Button>
              )}
            </li>
          </Fragment>
        ))}
        {shown.length > 0 && nowIndex === -1 && <NowMarker />}
        {shown.length === 0 && (
          <li className="px-3 py-6 text-center text-muted-foreground">
            Rien de prévu.
          </li>
        )}
      </ol>
    </div>
  )
}

/** La prochaine chose à faire, en grand. */
export function NowCard({
  eyebrow,
  title,
  detail,
  media,
  actions,
}: {
  eyebrow: ReactNode
  title: ReactNode
  detail?: ReactNode
  media?: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-3xl bg-muted p-5 md:p-6">
      {media}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold text-muted-foreground">{eyebrow}</p>
        <p className="font-heading text-2xl font-semibold">{title}</p>
        {detail && <p className="text-muted-foreground">{detail}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>
  )
}
