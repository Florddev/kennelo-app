"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import {
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useState,
} from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const InDialog = createContext(false)

function FlowTitle({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return useContext(InDialog) ? (
    <DialogPrimitive.Title className={className}>
      {children}
    </DialogPrimitive.Title>
  ) : (
    <h1 className={className}>{children}</h1>
  )
}

function FlowDescription({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return useContext(InDialog) ? (
    <DialogPrimitive.Description className={className}>
      {children}
    </DialogPrimitive.Description>
  ) : (
    <p className={className}>{children}</p>
  )
}

/** Le logo, « Quitter » et la barre de progression. */
function FlowTopBar({
  progress,
  close,
}: {
  progress?: number
  close: ReactElement
}) {
  return (
    <header className="sticky top-0 z-10 bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:h-20 md:px-10">
        <span className="font-display text-3xl text-link">Kennelo</span>
        {close}
      </div>
      {progress === undefined ? (
        <div className="h-px bg-border" />
      ) : (
        <div className="h-1 bg-muted">
          <div
            className="h-full rounded-e-full bg-primary transition-[width] duration-300"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          />
        </div>
      )}
    </header>
  )
}

const quitIcon = <HugeiconsIcon className="size-6" icon={Cancel01Icon} />

/**
 * Parcours guidé plein écran façon Wise : le logo, « Quitter », une barre de
 * progression, puis une question par écran.
 */
export function FlowDialog({
  trigger,
  open,
  onOpenChange,
  progress,
  children,
}: {
  trigger?: ReactElement
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Avancement de 0 à 1, masqué sur l'écran de fin. */
  progress?: number
  children: ReactNode
}) {
  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      {trigger && <DialogPrimitive.Trigger render={trigger} />}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background text-foreground transition-[opacity,translate] duration-200 outline-none data-ending-style:translate-y-2 data-ending-style:opacity-0 data-starting-style:translate-y-2 data-starting-style:opacity-0">
          <InDialog value>
            <FlowTopBar
              close={
                <DialogPrimitive.Close
                  render={
                    <Button
                      aria-label="Quitter"
                      size="icon-lg"
                      variant="ghost"
                    />
                  }
                >
                  {quitIcon}
                </DialogPrimitive.Close>
              }
              progress={progress}
            />
            {children}
          </InDialog>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Même parcours, pour une page entière (ex. création d'activité). */
export function FlowPage({
  closeHref,
  progress,
  children,
}: {
  closeHref: string
  progress?: number
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background text-foreground">
      <FlowTopBar
        close={
          <Button
            aria-label="Quitter"
            render={<Link href={closeHref} />}
            size="icon-lg"
            variant="ghost"
          >
            {quitIcon}
          </Button>
        }
        progress={progress}
      />
      {children}
    </div>
  )
}

/** Un écran du parcours : la question en titre, centrée dans une colonne étroite. */
export function FlowScreen({
  eyebrow,
  title,
  description,
  onBack,
  footer,
  wide,
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  onBack?: () => void
  footer?: ReactNode
  wide?: boolean
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full flex-1 px-4 pt-6 pb-12 md:pt-10",
        wide ? "max-w-3xl" : "max-w-136"
      )}
    >
      {onBack && (
        <Button
          aria-label="Retour"
          className="mb-6 xl:absolute xl:top-10 xl:-left-32 xl:mb-0"
          onClick={onBack}
          size="icon-lg"
          variant="secondary"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>
      )}
      <div className="space-y-3 text-center">
        {eyebrow && (
          <p className="text-sm font-semibold text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <FlowTitle className="font-heading text-3xl font-semibold text-balance">
          {title}
        </FlowTitle>
        {description && (
          <FlowDescription className="text-balance text-muted-foreground">
            {description}
          </FlowDescription>
        )}
      </div>
      <div className="mt-8 space-y-6">{children}</div>
      {footer && <div className="mt-8 flex flex-col gap-3">{footer}</div>}
    </div>
  )
}

/** Rond de 48 px à gauche des lignes. */
export function FlowMedia({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold [&_svg]:size-6",
        className
      )}
    >
      {children}
    </span>
  )
}

/** Choix sur une ligne : un clic passe à l'écran suivant. */
export function ChoiceRow({
  media,
  title,
  description,
  aside,
  selected,
  onClick,
}: {
  media?: ReactNode
  title: ReactNode
  description?: ReactNode
  aside?: ReactNode
  selected?: boolean
  onClick: () => void
}) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl p-3 text-start transition-colors hover:bg-accent",
        selected && "bg-accent"
      )}
      onClick={onClick}
      type="button"
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
      {aside}
      <HugeiconsIcon
        className="size-5 shrink-0 text-muted-foreground"
        icon={ArrowRight01Icon}
      />
    </button>
  )
}

/** Ligne du récapitulatif : la réponse, ce qu'elle concerne, et « Modifier ». */
export function SummaryRow({
  media,
  label,
  value,
  onEdit,
}: {
  media?: ReactNode
  label: ReactNode
  value: ReactNode
  onEdit: () => void
}) {
  return (
    <button
      className="flex w-full items-center gap-4 rounded-2xl bg-muted p-3 text-start transition-colors hover:bg-neutral-hover"
      onClick={onEdit}
      type="button"
    >
      {media}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{value}</span>
        <span className="block text-sm text-muted-foreground">{label}</span>
      </span>
      <span className="pe-1 text-sm font-semibold text-link underline underline-offset-4">
        Modifier
      </span>
    </button>
  )
}

/** Libellé au-dessus du champ, aide en dessous. */
export function FlowField({
  id,
  label,
  hint,
  children,
}: {
  id?: string
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="font-semibold" htmlFor={id}>
        {label}
      </Label>
      {children}
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Deux à trois grandes cartes à choisir (Chien / Chat…). */
export function ChoiceCards<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string; description?: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          className={cn(
            "rounded-2xl border p-4 text-start transition-colors",
            value === option.value
              ? "border-control bg-accent ring-1 ring-control"
              : "hover:bg-accent"
          )}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          <span className="block font-semibold">{option.label}</span>
          {option.description && (
            <span className="block text-sm text-muted-foreground">
              {option.description}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/** Écran de fin : grand rond vert, titre en capitales, suite possible. */
export function FlowDone({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: ReactNode
  actions: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-136 flex-1 flex-col items-center px-4 pt-12 pb-12 text-center md:pt-20">
      <span className="flex size-24 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <HugeiconsIcon
          className="size-12"
          icon={Tick02Icon}
          strokeWidth={2.5}
        />
      </span>
      <FlowTitle className="mt-8 font-display text-5xl md:text-6xl">
        {title}
      </FlowTitle>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      )}
      {children && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {children}
        </div>
      )}
      <div className="mt-10 flex w-full flex-col gap-3">{actions}</div>
    </div>
  )
}

/**
 * Enchaînement des écrans avec retour arrière. `edit` ouvre une étape depuis
 * le récapitulatif et `next` y revient directement ensuite.
 */
export function useSteps<T extends string>(first: T) {
  const [history, setHistory] = useState<T[]>([first])
  const [returnTo, setReturnTo] = useState<T | null>(null)
  const step = history[history.length - 1]
  return {
    back:
      history.length > 1 ? () => setHistory((h) => h.slice(0, -1)) : undefined,
    edit: (target: T) => {
      setReturnTo(step)
      setHistory((h) => [...h, target])
    },
    /** Avance sans quitter un retour au récapitulatif en cours. */
    go: (target: T) => setHistory((h) => [...h, target]),
    next: (target: T) => {
      const to = returnTo ?? target
      setReturnTo(null)
      setHistory((h) => [...h, to])
    },
    reset: (start: T) => {
      setReturnTo(null)
      setHistory([start])
    },
    step,
  }
}
