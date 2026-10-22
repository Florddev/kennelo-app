"use client"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toastManager } from "@/components/ui/toast"
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

type Editable = Extract<
  Setting,
  { type: "select" | "input" | "number" | "textarea" }
>

export type SettingsGroup = {
  title?: string
  description?: string
  settings: Setting[]
}

export const options = (...labels: string[]): Option[] =>
  labels.map((label) => ({ label, value: label }))

/** Petit message de confirmation en bas de l'écran. */
export const notify = (title = "Modification enregistrée") =>
  toastManager.add({ title, type: "success" })

const rowClass = "flex min-h-16 items-center gap-4 px-5 py-4"

const Chevron = () => (
  <HugeiconsIcon
    className="size-5 shrink-0 text-muted-foreground"
    icon={ArrowRight01Icon}
  />
)

/** Une page de réglages : retour, grand titre, puis des sections empilées. */
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
      <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 pt-6 pb-16 md:pt-12">
        <div className="space-y-6">
          {back && (
            <Button
              className="-ms-1.5 gap-3 ps-1.5 pe-4"
              render={<Link href={back.href} />}
              variant="ghost"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon icon={ArrowLeft01Icon} />
              </span>
              {back.label}
            </Button>
          )}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <h1 className="flex items-center gap-3 font-heading text-3xl font-semibold md:text-4xl">
                {title}
              </h1>
              {description && (
                <p className="text-base text-muted-foreground">{description}</p>
              )}
            </div>
            {action}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Grande carte en tête de page : l'état de la chose réglée et son action. */
export function SettingsHero({
  media,
  eyebrow,
  title,
  description,
  actions,
  tone = "muted",
  children,
}: {
  media?: ReactNode
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  tone?: "muted" | "primary" | "success" | "warning"
  children?: ReactNode
}) {
  const primary = tone === "primary"
  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-3xl p-6",
        primary && "bg-primary text-primary-foreground",
        tone === "muted" && "bg-muted",
        tone === "success" && "bg-success-soft",
        tone === "warning" && "bg-warning-soft"
      )}
    >
      <div className="flex items-center gap-4">
        {media}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p
              className={cn(
                "text-sm font-semibold",
                primary ? "opacity-80" : "text-muted-foreground"
              )}
            >
              {eyebrow}
            </p>
          )}
          <p className="text-2xl font-semibold text-balance">{title}</p>
          {description && (
            <p className={cn(primary ? "opacity-80" : "text-muted-foreground")}>
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

/** Un groupe de réglages : titre au-dessus, lignes dans une carte arrondie. */
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
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div className="space-y-0.5">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="divide-y overflow-hidden rounded-2xl border bg-card">
        {children}
      </div>
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
        "flex min-h-16 flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4",
        stacked && "flex-col items-stretch",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {media}
        <div className="min-w-0">
          <div className="font-semibold">{title}</div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
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
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground",
        className
      )}
    >
      <HugeiconsIcon className="size-5" icon={icon} />
    </span>
  )
}

/** Rond de choix façon Wise : plein quand il est sélectionné. */
export function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-6 shrink-0 rounded-full border-2 border-input transition-[border]",
        checked && "border-[7px] border-control"
      )}
    />
  )
}

/** Une ligne entière qui bascule un interrupteur. */
export function SwitchRow({
  title,
  description,
  media,
  checked,
  defaultChecked,
  onCheckedChange,
}: {
  title: ReactNode
  description?: ReactNode
  media?: ReactNode
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <label
      className={cn(
        rowClass,
        "cursor-pointer transition-colors hover:bg-accent"
      )}
    >
      {media}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        {description && (
          <span className="block text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <Switch
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
      />
    </label>
  )
}

const initialOf = (setting: Editable) =>
  setting.type === "number"
    ? String(setting.defaultValue)
    : (setting.defaultValue ?? "")

const displayOf = (setting: Editable, value: string) => {
  if (setting.type === "number")
    return `${value.replace(".", ",")} ${setting.unit}`
  if (setting.type === "select")
    return setting.items.find((i) => i.value === value)?.label ?? value
  return value || "Non renseigné"
}

function EditForm({
  setting,
  value,
  onSave,
}: {
  setting: Exclude<Editable, { type: "select" }>
  value: string
  onSave: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const id = useId()
  return (
    <>
      <DialogPanel>
        <form
          id={id}
          onSubmit={(e) => {
            e.preventDefault()
            onSave(draft.trim())
          }}
        >
          {setting.type === "textarea" ? (
            <Textarea
              aria-label={setting.title}
              autoFocus
              className="min-h-40"
              onChange={(e) => setDraft(e.target.value)}
              value={draft}
            />
          ) : setting.type === "number" ? (
            <InputGroup>
              <InputGroupInput
                aria-label={setting.title}
                autoFocus
                className="tabular-nums"
                inputMode="decimal"
                onChange={(e) => setDraft(e.target.value)}
                size="lg"
                type="number"
                value={draft}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{setting.unit}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          ) : (
            <Input
              aria-label={setting.title}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              placeholder={setting.placeholder}
              size="lg"
              value={draft}
            />
          )}
        </form>
      </DialogPanel>
      <DialogFooter variant="bare">
        <DialogClose render={<Button size="lg" variant="secondary" />}>
          Annuler
        </DialogClose>
        <Button form={id} size="lg" type="submit">
          Enregistrer
        </Button>
      </DialogFooter>
    </>
  )
}

/** Un réglage à valeur : la valeur actuelle, puis une fenêtre pour la changer. */
export function ValueRow({ setting }: { setting: Editable }) {
  const [value, setValue] = useState(() => initialOf(setting))
  const [open, setOpen] = useState(false)
  const text = displayOf(setting, value)
  const textarea = setting.type === "textarea"
  const save = (next: string) => {
    setOpen(false)
    if (next === value) return
    setValue(next)
    notify()
  }
  return (
    <>
      <button
        className={cn(
          rowClass,
          "w-full text-start transition-colors hover:bg-accent"
        )}
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{setting.title}</span>
          <span
            className={cn(
              "block text-muted-foreground",
              textarea ? "mt-0.5 line-clamp-2 whitespace-pre-line" : "sm:hidden"
            )}
          >
            {text}
          </span>
          {setting.description && (
            <span className="block text-sm text-muted-foreground">
              {setting.description}
            </span>
          )}
        </span>
        {!textarea && (
          <span className="max-w-[45%] truncate text-end text-muted-foreground max-sm:hidden">
            {text}
          </span>
        )}
        <Chevron />
      </button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogPopup className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{setting.title}</DialogTitle>
            {setting.description && (
              <DialogDescription>{setting.description}</DialogDescription>
            )}
          </DialogHeader>
          {setting.type === "select" ? (
            <DialogPanel>
              <div className="-mx-3 space-y-1" role="radiogroup">
                {setting.items.map((item) => (
                  <button
                    aria-checked={item.value === value}
                    className="flex w-full items-center gap-4 rounded-2xl p-3 text-start font-semibold transition-colors hover:bg-accent"
                    key={item.value}
                    onClick={() => save(item.value)}
                    role="radio"
                    type="button"
                  >
                    <RadioDot checked={item.value === value} />
                    {item.label}
                  </button>
                ))}
              </div>
            </DialogPanel>
          ) : (
            <EditForm onSave={save} setting={setting} value={value} />
          )}
        </DialogPopup>
      </Dialog>
    </>
  )
}

/** Des choix visuels côte à côte (thème, taille du texte…). */
export function ChoiceTiles({
  label,
  items,
  value,
  onChange,
}: {
  label: string
  items: { label: string; value: string; preview: ReactNode }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div
      aria-label={label}
      className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4"
      role="radiogroup"
    >
      {items.map((item) => {
        const checked = item.value === value
        return (
          <button
            aria-checked={checked}
            className={cn(
              "flex flex-col gap-3 rounded-2xl p-2 pb-3 font-semibold ring-2 ring-transparent transition-[background-color,box-shadow] hover:bg-accent",
              checked && "ring-control"
            )}
            key={item.value}
            onClick={() => onChange(item.value)}
            role="radio"
            type="button"
          >
            {item.preview}
            <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
              <RadioDot checked={checked} />
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function SettingControl({ setting }: { setting: Setting }) {
  switch (setting.type) {
    case "switch":
      return (
        <Switch
          aria-label={setting.title}
          defaultChecked={setting.defaultChecked}
        />
      )
    case "button":
      return (
        <Button
          variant={
            setting.variant === "destructive-outline"
              ? "destructive-outline"
              : setting.variant === "ghost"
                ? "ghost"
                : "secondary"
          }
        >
          {setting.label}
        </Button>
      )
    case "text":
      return <span className="text-muted-foreground">{setting.value}</span>
    case "custom":
      return setting.control
    default:
      return null
  }
}

/** Une ligne par réglage, rendue selon son type. */
export function SettingItem({ setting }: { setting: Setting }) {
  switch (setting.type) {
    case "select":
    case "input":
    case "number":
    case "textarea":
      return <ValueRow setting={setting} />
    case "switch":
      return (
        <SwitchRow
          defaultChecked={setting.defaultChecked}
          description={setting.description}
          title={setting.title}
        />
      )
    default:
      return (
        <SettingsRow description={setting.description} title={setting.title}>
          <SettingControl setting={setting} />
        </SettingsRow>
      )
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
        <SettingItem key={setting.title} setting={setting} />
      ))}
    </SettingsSection>
  ))
}

/** Une ligne qui mène à une autre page, avec un rond d'icône et un chevron. */
export function LinkRow({
  icon,
  title,
  description,
  value,
  href,
  locked,
  media,
}: {
  icon?: IconSvgElement
  title: string
  description?: string
  value?: string
  href: string
  locked?: string
  media?: ReactNode
}) {
  const content = (
    <>
      {media ?? (icon && <IconTile icon={icon} />)}
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="truncate text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {locked ? (
        <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-sm font-semibold">
          {locked}
        </span>
      ) : (
        <>
          {value && (
            <span className="shrink-0 text-sm text-muted-foreground max-sm:hidden">
              {value}
            </span>
          )}
          <Chevron />
        </>
      )}
    </>
  )
  return locked ? (
    <div className={cn(rowClass, "[&>:not(:last-child)]:opacity-60")}>
      {content}
    </div>
  ) : (
    <Link
      className={cn(rowClass, "transition-colors hover:bg-accent")}
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
      className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3"
      key={dayNames[i]}
    >
      <Switch
        aria-label={`Ouvert le ${dayNames[i].toLowerCase()}`}
        checked={day.open}
        onCheckedChange={(open) =>
          setDays((list) => list.map((d, j) => (j === i ? { ...d, open } : d)))
        }
      />
      <span className="w-24 font-semibold">{dayNames[i]}</span>
      {day.open ? (
        <div className="ms-auto flex items-center gap-2">
          <Input
            aria-label={`Ouverture le ${dayNames[i].toLowerCase()}`}
            className="w-28"
            defaultValue={day.from}
            type="time"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            aria-label={`Fermeture le ${dayNames[i].toLowerCase()}`}
            className="w-28"
            defaultValue={day.to}
            type="time"
          />
        </div>
      ) : (
        <span className="ms-auto rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
          Fermé
        </span>
      )}
    </div>
  ))
}
