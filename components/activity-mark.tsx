import { cn } from "@/lib/utils"

export const activityMeta = {
  Pension: { color: "bg-emerald-800", letter: "P" },
  Toilettage: { color: "bg-violet-600", letter: "T" },
  Éducation: { color: "bg-blue-700", letter: "É" },
} as const

export type Activity = keyof typeof activityMeta

export const activityNames = Object.keys(activityMeta) as Activity[]

export function ActivityMark({
  activity,
  className,
}: {
  activity: Activity
  className?: string
}) {
  const { color, letter } = activityMeta[activity]
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-semibold text-white",
        color,
        className
      )}
    >
      {letter}
    </span>
  )
}
