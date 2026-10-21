"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { type ReactNode, useState } from "react"
import { type Activity, ActivityMark } from "@/components/activity-mark"
import {
  Card,
  CardFrame,
  CardFrameAction,
  CardFrameDescription,
  CardFrameHeader,
  CardFrameTitle,
  CardPanel,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export const formatHour = (hour: number) =>
  `${Math.floor(hour)}h${hour % 1 ? String(Math.round((hour % 1) * 60)).padStart(2, "0") : ""}`

export const formatAmount = (amount: number) =>
  `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} €`

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
    <CardFrame className={className}>
      <CardFrameHeader className="px-4 py-3">
        <CardFrameTitle>{title}</CardFrameTitle>
        {description && (
          <CardFrameDescription>{description}</CardFrameDescription>
        )}
        {action && <CardFrameAction>{action}</CardFrameAction>}
      </CardFrameHeader>
      <Card className="flex-1">
        <CardPanel className="p-4">{children}</CardPanel>
      </Card>
    </CardFrame>
  )
}

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
    <Card>
      <CardPanel className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          {label}
          <HugeiconsIcon className="size-4 shrink-0" icon={icon} />
        </div>
        <p className="font-heading text-2xl font-semibold tabular-nums">
          {value}
        </p>
        <div className="text-xs text-muted-foreground">{children}</div>
      </CardPanel>
    </Card>
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

export function ActivityHeader({
  activity,
  title,
  actions,
}: {
  activity: Activity
  title: string
  actions?: ReactNode
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="md:hidden" />
      <ActivityMark activity={activity} />
      <h1 className="truncate text-sm font-medium">
        {activity}
        <span className="text-muted-foreground"> / {title}</span>
      </h1>
      <div className="ms-auto flex items-center gap-2">{actions}</div>
    </header>
  )
}

/** Shell for an organisation page: header and a scrollable, centered body. */
export function PageShell({
  title,
  icon,
  actions,
  className,
  children,
}: {
  title: string
  icon: IconSvgElement
  actions?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="md:hidden" />
        <HugeiconsIcon className="size-4 text-muted-foreground" icon={icon} />
        <h1 className="truncate text-sm font-medium">{title}</h1>
        <div className="ms-auto flex items-center gap-2">{actions}</div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div
          className={cn("mx-auto max-w-6xl space-y-6 p-4 md:p-6", className)}
        >
          {children}
        </div>
      </div>
    </>
  )
}

/** Shell for an activity page: header and a scrollable, centered body. */
export function ActivityPage({
  activity,
  title,
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
    <>
      <ActivityHeader actions={actions} activity={activity} title={title} />
      <div className="flex-1 overflow-y-auto">
        <div
          className={cn("mx-auto max-w-6xl space-y-6 p-4 md:p-6", className)}
        >
          {children}
        </div>
      </div>
    </>
  )
}

/** Shell shared by the activity "Aujourd'hui" pages. */
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
    <>
      <ActivityHeader
        actions={actions}
        activity={activity}
        title="Aujourd'hui"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Mercredi 21 octobre
              </p>
              <h2 className="font-heading text-2xl font-semibold">
                Aujourd&apos;hui en {activity.toLowerCase()}
              </h2>
              <p className="max-w-xl text-sm text-muted-foreground">
                {summary}
              </p>
            </div>
            {aside}
          </section>
          {children}
        </div>
      </div>
    </>
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
