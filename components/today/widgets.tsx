"use client"

import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useState } from "react"
import { type Activity, activityMeta } from "@/components/activity-mark"
import { activityNav } from "@/components/navigation"
import { Sparkle } from "@/components/site/doodles"
import { activityIcons } from "@/components/site/site-ui"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export const formatHour = (hour: number) =>
  `${Math.floor(hour)}h${hour % 1 ? String(Math.round((hour % 1) * 60)).padStart(2, "0") : ""}`

export const formatAmount = (amount: number) =>
  `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} €`

/** Une section sans carte : grand titre, compteur, action à droite. */
export function Section({
  title,
  count,
  action,
  className,
  children,
}: {
  title: string
  count?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <h2 className="font-display text-3xl">
          {title}
          {count !== undefined && (
            <span className="ms-2 text-muted-foreground">{count}</span>
          )}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export type Attention = {
  id: string
  icon: IconSvgElement
  tone: string
  title: ReactNode
  detail?: ReactNode
  actions?: ReactNode
  onOpen?: () => void
}

/** « À traiter » : quelques cartes, chacune avec son bouton. */
export function AttentionList({
  items,
  empty = "Tout est à jour",
  limit,
  moreHref,
}: {
  items: Attention[]
  empty?: string
  /** Au-delà, un lien vers la page où tout est listé. */
  limit?: number
  moreHref?: string
}) {
  const hidden = limit ? items.length - limit : 0
  if (!items.length) {
    return (
      <p className="flex items-center gap-3 rounded-3xl bg-muted p-4 text-lg font-semibold md:p-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-success-soft">
          <HugeiconsIcon className="size-6" icon={Tick02Icon} />
        </span>
        {empty}
      </p>
    )
  }
  return (
    <ul className="space-y-3">
      {items.slice(0, limit).map((item) => {
        const text = (
          <>
            <span className="block text-lg font-semibold">{item.title}</span>
            {item.detail && (
              <span className="block text-muted-foreground">{item.detail}</span>
            )}
          </>
        )
        return (
          <li
            className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-3xl bg-muted p-4 md:p-5"
            key={item.id}
          >
            <span
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full",
                item.tone
              )}
            >
              <HugeiconsIcon className="size-6" icon={item.icon} />
            </span>
            {item.onOpen ? (
              <button
                className="min-w-0 flex-1 text-start"
                onClick={item.onOpen}
                type="button"
              >
                {text}
              </button>
            ) : (
              <div className="min-w-0 flex-1">{text}</div>
            )}
            {item.actions && (
              <div className="flex flex-wrap gap-2 max-sm:w-full max-sm:*:flex-1">
                {item.actions}
              </div>
            )}
          </li>
        )
      })}
      {hidden > 0 && moreHref && (
        <li>
          <Link
            className="flex h-12 items-center justify-center rounded-3xl bg-muted font-semibold text-muted-foreground transition-colors hover:text-foreground"
            href={moreHref}
          >
            {hidden > 1 ? `Voir les ${hidden} autres` : "Voir la suivante"}
          </Link>
        </li>
      )}
    </ul>
  )
}

export type Task = {
  id: string
  time?: number
  title: string
  detail?: string
  icon: IconSvgElement
  tone: string
  done?: boolean
  action?: { label: string; onClick: () => void }
}

function TaskRow({ task }: { task: Task }) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 px-4 py-3 md:gap-4 md:px-5",
        task.done && "opacity-60"
      )}
    >
      {task.time !== undefined && (
        <span className="w-12 shrink-0 font-semibold tabular-nums">
          {formatHour(task.time)}
        </span>
      )}
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          task.tone
        )}
      >
        <HugeiconsIcon className="size-5" icon={task.icon} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{task.title}</p>
        {task.detail && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {task.detail}
          </p>
        )}
      </div>
      {task.done ? (
        <HugeiconsIcon
          aria-label="Fait"
          className="size-5 shrink-0 text-muted-foreground"
          icon={Tick02Icon}
        />
      ) : (
        task.action && (
          <Button
            className="shrink-0 bg-background"
            onClick={task.action.onClick}
            variant="outline"
          >
            {task.action.label}
          </Button>
        )
      )}
    </li>
  )
}

/** Liste crème à lignes blanches, comme l'appli mobile ; ce qui est fait se replie. */
export function TaskList({ tasks, empty }: { tasks: Task[]; empty: string }) {
  const [showDone, setShowDone] = useState(false)
  const todo = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done)
  const shown = showDone ? [...todo, ...done] : todo
  return (
    <div className="overflow-hidden rounded-3xl bg-muted">
      {shown.length === 0 && (
        <p className="flex items-center gap-3 px-5 py-5 font-semibold text-muted-foreground">
          <HugeiconsIcon className="size-5" icon={Tick02Icon} />
          {empty}
        </p>
      )}
      <ul className="divide-y-2 divide-background">
        {shown.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
      {done.length > 0 && (
        <button
          className="flex h-12 w-full items-center justify-center border-t-2 border-background text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setShowDone((v) => !v)}
          type="button"
        >
          {showDone
            ? "Masquer ce qui est fait"
            : done.length > 1
              ? `Voir les ${done.length} faits`
              : "Voir ce qui est fait"}
        </button>
      )}
    </div>
  )
}

/** Une section : titre au-dessus, contenu dans une grande carte. */
export function Widget({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className="font-display text-3xl">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1 rounded-3xl border bg-card p-5">{children}</div>
    </section>
  )
}

/** Chiffre clé, comme les cartes de solde de Wise. */
export function Kpi({
  label,
  icon,
  value,
  children,
}: {
  label: string
  icon: IconSvgElement
  value: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-4 rounded-3xl bg-muted p-5">
      <span className="flex size-10 items-center justify-center rounded-full bg-background">
        <HugeiconsIcon className="size-5" icon={icon} />
      </span>
      <div>
        <p className="font-display text-5xl tabular-nums [&_.text-muted-foreground]:font-heading [&_.text-muted-foreground]:text-xl [&_.text-muted-foreground]:font-semibold">
          {value}
        </p>
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      </div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  )
}

export function Bar({
  value,
  label,
  className,
}: {
  value: number
  label: string
  className?: string
}) {
  return (
    <Progress aria-label={label} value={value}>
      <ProgressTrack>
        <ProgressIndicator className={className} />
      </ProgressTrack>
    </Progress>
  )
}

/** En-tête de page : grand titre, actions à droite, onglets en dessous. */
export function PageHeader({
  title,
  eyebrow,
  media,
  actions,
  children,
}: {
  title: ReactNode
  eyebrow?: ReactNode
  media?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {media}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-sm font-semibold text-muted-foreground">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-5xl text-balance md:text-7xl">
              {title}
              <Sparkle className="ms-1 inline size-8 align-top md:size-12" />
            </h1>
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
      {children}
    </header>
  )
}

/** Corps de page défilant et centré. */
export function PageBody({
  hero,
  className,
  children,
}: {
  /** Bandeau pleine largeur au-dessus du contenu. */
  hero?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {hero}
      <div
        className={cn(
          "mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-10 md:py-10",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

/** Les pages d'une activité, en segments sur le bandeau. */
export function ActivityTabs({ activity }: { activity: Activity }) {
  const pathname = usePathname()
  const items = activityNav.find((a) => a.name === activity)?.items ?? []
  return (
    <nav
      aria-label={`Pages ${activity}`}
      className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0"
    >
      <div className="flex w-max gap-1 rounded-full bg-white/50 p-1">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 shrink-0 items-center gap-2 rounded-full px-5 font-semibold transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-white/60"
              )}
              href={item.href}
              key={item.href}
            >
              <HugeiconsIcon className="size-5" icon={item.icon} />
              {item.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/** Passer d'une activité à l'autre, comme les filtres de la recherche. */
function ActivitySwitch({ activity }: { activity: Activity }) {
  if (activityNav.length < 2) return null
  return (
    <nav aria-label="Activités" className="flex flex-wrap gap-2">
      {activityNav.map((a) => (
        <Link
          aria-current={a.name === activity ? "page" : undefined}
          className={cn(
            "flex h-11 shrink-0 items-center gap-2 rounded-full px-4 font-semibold transition-colors",
            a.name === activity
              ? "bg-control text-control-foreground"
              : "bg-white/60 hover:bg-white/85"
          )}
          href={a.items[0].href}
          key={a.name}
        >
          <HugeiconsIcon className="size-5" icon={activityIcons[a.name]} />
          {a.name}
        </Link>
      ))}
    </nav>
  )
}

/** Bandeau à la couleur de l'activité : la couleur est le cadre. */
function ActivityBand({
  activity,
  actions,
  className,
}: {
  activity: Activity
  actions?: ReactNode
  /** La même largeur que le contenu de la page. */
  className?: string
}) {
  return (
    <section className={activityMeta[activity].tint}>
      <div
        className={cn(
          "mx-auto max-w-7xl space-y-6 px-4 pt-8 pb-6 md:px-10 md:pt-12 md:pb-8",
          className
        )}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-6xl md:text-8xl">
            {activity}
            <Sparkle className="ms-2 inline size-10 align-top text-current opacity-40 md:size-14" />
          </h1>
          {actions && (
            <div className="flex flex-wrap items-center gap-2 md:pb-3 [&_[data-slot=button]]:border-transparent [&_[data-slot=button]]:bg-white/60 [&_[data-slot=button]]:text-current [&_[data-slot=button]:last-child]:bg-wise-forest [&_[data-slot=button]:last-child]:text-wise-green [&_[data-slot=button]:last-child:hover]:bg-wise-forest/90">
              {actions}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ActivityTabs activity={activity} />
          <ActivitySwitch activity={activity} />
        </div>
      </div>
    </section>
  )
}

/** Page d'organisation : grand titre puis contenu. */
export function PageShell({
  title,
  actions,
  className,
  children,
}: {
  title: string
  icon?: IconSvgElement
  actions?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <PageBody className={className}>
      <PageHeader actions={actions} title={title} />
      {children}
    </PageBody>
  )
}

/** Page d'une activité : l'activité en titre, ses pages en onglets. */
export function ActivityPage({
  activity,
  actions,
  className,
  children,
}: {
  activity: Activity
  title: string
  actions?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <PageBody
      className={className}
      hero={
        <ActivityBand
          actions={actions}
          activity={activity}
          className={className}
        />
      }
    >
      {children}
    </PageBody>
  )
}

/** Page « Aujourd'hui » d'une activité. */
export function ActivityDayPage({
  activity,
  summary,
  actions,
  aside,
  children,
}: {
  activity: Activity
  summary: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <PageBody hero={<ActivityBand actions={actions} activity={activity} />}>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-muted-foreground">
            Mercredi 21 octobre
          </p>
          <p className="max-w-xl text-lg">{summary}</p>
        </div>
        {aside}
      </section>
      {children}
    </PageBody>
  )
}

export type CheckItem = {
  id: string
  label: ReactNode
  detail?: string
  done: boolean
}

/** Widget holding a self-contained checklist with its progress. */
export function ChecklistWidget({
  title,
  items: initial,
  barClassName,
  className,
}: {
  title: string
  items: CheckItem[]
  barClassName?: string
  className?: string
}) {
  const [items, setItems] = useState(initial)
  const done = items.filter((item) => item.done).length
  return (
    <Widget
      className={className}
      description={`${done} sur ${items.length} effectués`}
      title={title}
    >
      <div className="mb-4">
        <Bar
          className={barClassName}
          label={title}
          value={(done / items.length) * 100}
        />
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={item.done}
                className="mt-0.5"
                onCheckedChange={(checked) =>
                  setItems((list) =>
                    list.map((i) =>
                      i.id === item.id ? { ...i, done: checked } : i
                    )
                  )
                }
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm",
                    item.done && "text-muted-foreground line-through"
                  )}
                >
                  {item.label}
                </span>
                {item.detail && (
                  <span className="block text-xs text-muted-foreground">
                    {item.detail}
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </Widget>
  )
}
