"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useState } from "react"
import { type Activity, ActivityMark } from "@/components/activity-mark"
import { activityNav } from "@/components/navigation"
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
          <h2 className="font-heading text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1 rounded-2xl border bg-card p-5">{children}</div>
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
    <div className="space-y-4 rounded-2xl bg-muted p-5">
      <span className="flex size-10 items-center justify-center rounded-full bg-background">
        <HugeiconsIcon className="size-5" icon={icon} />
      </span>
      <div>
        <p className="font-heading text-3xl font-semibold tabular-nums">
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
            <h1 className="truncate font-heading text-3xl font-semibold">
              {title}
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
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className={cn(
          "mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-10 md:py-10",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

/** Les pages d'une activité, en pastilles. */
export function ActivityTabs({ activity }: { activity: Activity }) {
  const pathname = usePathname()
  const items = activityNav.find((a) => a.name === activity)?.items ?? []
  return (
    <nav
      aria-label={`Pages ${activity}`}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0"
    >
      {items.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors",
              active
                ? "bg-control text-control-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-neutral-hover"
            )}
            href={item.href}
            key={item.href}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

function ActivityHeader({
  activity,
  actions,
}: {
  activity: Activity
  actions?: ReactNode
}) {
  return (
    <PageHeader
      actions={actions}
      media={<ActivityMark activity={activity} className="size-12 text-base" />}
      title={activity}
    >
      <ActivityTabs activity={activity} />
    </PageHeader>
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
    <PageBody className={className}>
      <ActivityHeader actions={actions} activity={activity} />
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
    <PageBody>
      <ActivityHeader actions={actions} activity={activity} />
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
