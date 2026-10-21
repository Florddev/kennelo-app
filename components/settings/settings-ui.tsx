"use client"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { Frame, FramePanel } from "@/components/ui/frame"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type Option = { label: string; value: string }

export type Setting = { title: string; description?: string } & (
  | { type: "select"; items: Option[]; defaultValue: string }
  | { type: "switch"; defaultChecked?: boolean }
  | {
      type: "button"
      label: string
      variant?: "outline" | "ghost" | "destructive-outline"
    }
  | { type: "input"; defaultValue?: string; placeholder?: string }
  | { type: "number"; defaultValue: number; unit: string }
  | { type: "text"; value: string }
  | { type: "textarea"; defaultValue: string }
  | { type: "custom"; control: ReactNode }
)

export type SettingsGroup = {
  title?: string
  description?: string
  settings: Setting[]
}

export const options = (...labels: string[]): Option[] =>
  labels.map((label) => ({ label, value: label }))

export function SettingsPage({
  title,
  description,
  back,
  action,
  children,
}: {
  title: ReactNode
  description?: string
  back?: { href: string; label: string }
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-12 items-center gap-1 px-2">
        <SidebarTrigger className="md:hidden" />
        {back && (
          <Button render={<Link href={back.href} />} size="sm" variant="ghost">
            <HugeiconsIcon icon={ArrowLeft01Icon} />
            {back.label}
          </Button>
        )}
      </div>
      <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 pt-2 pb-16 md:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4 px-1">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  )
}

export function SettingsSection({
  title,
  description,
  action,
  children,
}: {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      {(title || action) && (
        <div className="flex items-end justify-between gap-4 px-1">
          <div>
            {title && <h2 className="text-base font-medium">{title}</h2>}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <Frame>
        <FramePanel className="divide-y overflow-hidden p-0">
          {children}
        </FramePanel>
      </Frame>
    </section>
  )
}

export function SettingsRow({
  title,
  description,
  media,
  stacked,
  className,
  children,
}: {
  title: ReactNode
  description?: ReactNode
  media?: ReactNode
  stacked?: boolean
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex min-h-14 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3",
        stacked && "flex-col items-stretch",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {media}
        <div className="min-w-0">
          <div className="text-sm font-medium">{title}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export function IconTile({
  icon,
  className,
}: {
  icon: IconSvgElement
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
        className
      )}
    >
      <HugeiconsIcon className="size-4" icon={icon} />
    </span>
  )
}

export function SettingControl({ setting }: { setting: Setting }) {
  switch (setting.type) {
    case "select":
      return (
        <Select defaultValue={setting.defaultValue} items={setting.items}>
          <SelectTrigger
            aria-label={setting.title}
            className="w-fit min-w-0"
            size="sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {setting.items.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      )
    case "switch":
      return (
        <Switch
          aria-label={setting.title}
          defaultChecked={setting.defaultChecked}
        />
      )
    case "button":
      return (
        <Button size="sm" variant={setting.variant ?? "outline"}>
          {setting.label}
        </Button>
      )
    case "input":
      return (
        <Input
          aria-label={setting.title}
          className="w-full sm:w-64"
          defaultValue={setting.defaultValue}
          placeholder={setting.placeholder}
          size="sm"
        />
      )
    case "number":
      return (
        <InputGroup className="w-32">
          <InputGroupInput
            aria-label={setting.title}
            className="tabular-nums"
            defaultValue={setting.defaultValue}
            size="sm"
            type="number"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>{setting.unit}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      )
    case "text":
      return (
        <span className="text-sm text-muted-foreground">{setting.value}</span>
      )
    case "textarea":
      return (
        <Textarea
          aria-label={setting.title}
          defaultValue={setting.defaultValue}
        />
      )
    case "custom":
      return setting.control
  }
}

export function SettingsGroups({ groups }: { groups: SettingsGroup[] }) {
  return groups.map((group, index) => (
    <SettingsSection
      description={group.description}
      key={group.title ?? index}
      title={group.title}
    >
      {group.settings.map((setting) => (
        <SettingsRow
          description={setting.description}
          key={setting.title}
          stacked={setting.type === "textarea"}
          title={setting.title}
        >
          <SettingControl setting={setting} />
        </SettingsRow>
      ))}
    </SettingsSection>
  ))
}

export function LinkRow({
  icon,
  title,
  description,
  value,
  href,
  locked,
}: {
  icon: IconSvgElement
  title: string
  description: string
  value?: string
  href: string
  locked?: string
}) {
  const content = (
    <>
      <IconTile icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      {(locked ?? value) && (
        <span
          className={cn(
            "shrink-0 text-xs text-muted-foreground",
            locked && "font-medium text-foreground"
          )}
        >
          {locked ?? value}
        </span>
      )}
      {!locked && (
        <HugeiconsIcon
          className="size-4 shrink-0 text-muted-foreground"
          icon={ArrowRight01Icon}
        />
      )}
    </>
  )
  return locked ? (
    <div className="flex items-center gap-3 px-4 py-3 [&>:not(:nth-last-child(1))]:opacity-60">
      {content}
    </div>
  ) : (
    <Link
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
      href={href}
    >
      {content}
    </Link>
  )
}

export type DayHours = { open: boolean; from: string; to: string }

const dayNames = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
]

/** Builds a Monday-first week, open on the given day indexes (0 = lundi). */
export const weekHours = (
  openDays: number[],
  from: string,
  to: string
): DayHours[] =>
  dayNames.map((_, i) => ({ from, open: openDays.includes(i), to }))

export function WeeklyHours({ initial }: { initial: DayHours[] }) {
  const [days, setDays] = useState(initial)
  return days.map((day, i) => (
    <div
      className="flex min-h-13 flex-wrap items-center gap-3 px-4 py-2"
      key={dayNames[i]}
    >
      <Switch
        aria-label={`Ouvert le ${dayNames[i].toLowerCase()}`}
        checked={day.open}
        onCheckedChange={(open) =>
          setDays((list) => list.map((d, j) => (j === i ? { ...d, open } : d)))
        }
      />
      <span className="w-20 text-sm font-medium">{dayNames[i]}</span>
      {day.open ? (
        <div className="ms-auto flex items-center gap-2">
          <Input
            aria-label={`Ouverture le ${dayNames[i].toLowerCase()}`}
            className="w-28"
            defaultValue={day.from}
            size="sm"
            type="time"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            aria-label={`Fermeture le ${dayNames[i].toLowerCase()}`}
            className="w-28"
            defaultValue={day.to}
            size="sm"
            type="time"
          />
        </div>
      ) : (
        <span className="ms-auto text-sm text-muted-foreground">Fermé</span>
      )}
    </div>
  ))
}
