import { PawPrintIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

/* ——— Petits dessins qui donnent du caractère aux pages du site ——— */

/** Un ruban qui boucle, posé derrière ou à côté des photos. */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none text-wise-green", className)}
      fill="none"
      viewBox="0 0 220 140"
    >
      <path
        d="M8 120c40 4 62-34 70-62 9-30 40-46 62-30 20 15 6 46-18 40-26-7-14-52 22-60 30-7 58 12 68 34"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="16"
      />
    </svg>
  )
}

/** Trois traits qui « brillent » à côté d'un titre. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none text-wise-green", className)}
      fill="none"
      viewBox="0 0 48 48"
    >
      <path
        d="M10 30 3 37M24 22V5M33 29l11-7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
    </svg>
  )
}

/** Deux empreintes de pattes, en biais. */
export function Paws({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none inline-flex items-end gap-1 text-wise-green [&_path]:fill-current",
        className
      )}
    >
      <HugeiconsIcon className="size-[1em] -rotate-20" icon={PawPrintIcon} />
      <HugeiconsIcon
        className="mb-[0.6em] size-[0.75em] rotate-12"
        icon={PawPrintIcon}
      />
    </span>
  )
}
