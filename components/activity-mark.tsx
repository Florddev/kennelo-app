import { cn } from "@/lib/utils"

/** Paires de la palette Wise : fond vif et texte foncé. */
export const activityColors = [
  "bg-wise-orange text-wise-maroon",
  "bg-wise-pink text-wise-purple",
  "bg-wise-blue text-wise-charcoal",
  "bg-wise-yellow text-wise-gold",
  "bg-wise-green text-wise-forest",
  "bg-wise-charcoal text-white",
]

const colorNames: Record<string, string> = {
  blue: "bleu",
  charcoal: "anthracite",
  green: "vert",
  orange: "orange",
  pink: "rose",
  yellow: "jaune",
}

export const colorName = (color: string) =>
  colorNames[color.split(" ")[0].replace("bg-wise-", "")] ?? color

/** `tint` pour les pastilles avec lettre, `color` pour les points et les barres. */
export const activityMeta = {
  Pension: { color: "bg-pension-strong", letter: "P", tint: activityColors[0] },
  Toilettage: {
    color: "bg-grooming-strong",
    letter: "T",
    tint: activityColors[1],
  },
  Éducation: {
    color: "bg-training-strong",
    letter: "É",
    tint: activityColors[2],
  },
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
  const { tint, letter } = activityMeta[activity]
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold",
        tint,
        className
      )}
    >
      {letter}
    </span>
  )
}
