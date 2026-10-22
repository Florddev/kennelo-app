"use client"

import { dateOf, TODAY, weekdayOf } from "@/components/calendar"
import { FlowScreen } from "@/components/flow/flow"
import { NOW } from "@/components/today/data"
import { formatHour } from "@/components/today/widgets"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DAYS = Array.from({ length: 7 }, (_, i) => TODAY + i)
/** Créneaux de 9h à 19h30, toutes les demi-heures. */
const TIMES = Array.from({ length: 22 }, (_, i) => 9 + i / 2)

export const durationLabel = (minutes: number) =>
  minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}`

/** « Quel jour, à quelle heure ? » : les 7 prochains jours, puis les créneaux libres. */
export function SlotStep({
  day,
  start,
  length,
  closing = 18.5,
  description,
  busy,
  onDay,
  onPick,
  onBack,
}: {
  day: number
  start: number | null
  /** Durée en heures. */
  length: number
  /** Heure de fin au plus tard. */
  closing?: number
  description?: string
  busy: (day: number, start: number) => boolean
  onDay: (day: number) => void
  onPick: (start: number) => void
  onBack?: () => void
}) {
  const times = TIMES.filter(
    (t) => t + length <= closing && !(day === TODAY && t <= NOW)
  )
  return (
    <FlowScreen
      description={description}
      onBack={onBack}
      title="Quel jour, à quelle heure ?"
    >
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {DAYS.map((d) => (
          <button
            aria-pressed={d === day}
            className={cn(
              "flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2 transition-colors",
              d === day
                ? "border-control bg-control text-control-foreground"
                : "hover:bg-accent"
            )}
            key={d}
            onClick={() => onDay(d)}
            type="button"
          >
            <span className="text-xs font-semibold">{weekdayOf(d)}</span>
            <span className="text-xl font-semibold">{dateOf(d).day}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {times.map((t) => (
          <Button
            disabled={busy(day, t)}
            key={t}
            onClick={() => onPick(t)}
            size="lg"
            variant={start === t ? "default" : "outline"}
          >
            {formatHour(t)}
          </Button>
        ))}
      </div>
      {times.every((t) => busy(day, t)) && (
        <p className="text-center text-muted-foreground">
          Plus de créneau libre ce jour-là : essayez un autre jour.
        </p>
      )}
    </FlowScreen>
  )
}
