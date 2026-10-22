"use client"

import {
  Alert02Icon,
  Login03Icon,
  Logout03Icon,
  MedicineBottle01Icon,
  Restaurant01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import type { ReactNode } from "react"
import { relativeDate, shortDate, TODAY } from "@/components/calendar"
import {
  kennels,
  type Stay,
  type StayPayment,
  type StayStatus,
  stayAmount,
  stayDeposit,
  stayLines,
  stayProgress,
} from "@/components/pension/data"
import { Bar, formatAmount } from "@/components/today/widgets"
import { petHref } from "@/components/pets/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet"

export const stayStatusMeta: Record<
  StayStatus,
  {
    label: string
    variant: "success" | "info" | "warning" | "secondary"
    bar: string
  }
> = {
  done: {
    bar: "bg-muted text-muted-foreground",
    label: "Terminé",
    variant: "secondary",
  },
  ongoing: {
    bar: "bg-pension text-pension-foreground",
    label: "En cours",
    variant: "success",
  },
  pending: {
    bar: "border border-dashed border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-300",
    label: "À confirmer",
    variant: "warning",
  },
  upcoming: {
    bar: "border border-pension-strong/40 bg-pension/35 text-pension-foreground",
    label: "À venir",
    variant: "info",
  },
}

export const paymentMeta: Record<StayPayment, { label: string; dot: string }> =
  {
    deposit: { dot: "bg-sky-500", label: "Acompte versé" },
    due: { dot: "bg-amber-500", label: "À régler" },
    paid: { dot: "bg-success", label: "Soldé" },
  }

export const kennelLabel = (kennelId?: string) => {
  const kennel = kennels.find((k) => k.id === kennelId)
  return kennel
    ? `${kennel.area === "Chenil" ? "Box" : "Chatterie"} ${kennel.label.replace("C", "")}`
    : "À placer"
}

const journal = [
  "Arrivée sereine, a fait le tour du box et s'est vite installé.",
  "A mangé toute sa gamelle, belle sortie avec le groupe du matin.",
  "Grosse séance de jeu au parc, sieste bien méritée l'après-midi.",
  "Très câlin avec l'équipe, selles normales, rien à signaler.",
  "Balade en forêt, s'entend très bien avec ses voisins de box.",
  "Brossage complet, toujours aussi gourmand.",
]

export function StaySheet({
  stay,
  open,
  onOpenChange,
  onConfirm,
  onDecline,
}: {
  stay: Stay | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (id: string) => void
  onDecline?: (id: string) => void
}) {
  const kennel = kennels.find((k) => k.id === stay?.kennelId)
  const current = kennel?.pet === stay?.pet ? kennel : undefined

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup variant="inset">
        {stay && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Badge variant={stayStatusMeta[stay.status].variant}>
                  {stayStatusMeta[stay.status].label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {kennelLabel(stay.kennelId)}
                </span>
              </div>
              <SheetTitle>Séjour de {stay.pet}</SheetTitle>
              <SheetDescription>
                {stay.breed} · {stay.owner} ·{" "}
                <Link
                  className="underline underline-offset-2"
                  href={petHref(stay.pet, stay.owner)}
                >
                  Fiche de {stay.pet}
                </Link>
              </SheetDescription>
            </SheetHeader>
            <SheetPanel className="space-y-6">
              <StayDates stay={stay} />

              {(current?.meds || current?.diet || stay.note) && (
                <section className="space-y-2">
                  <SectionTitle>Consignes</SectionTitle>
                  <ul className="space-y-2 text-sm">
                    {current?.meds && (
                      <Consigne icon={MedicineBottle01Icon}>
                        {current.meds}
                      </Consigne>
                    )}
                    {current?.diet && (
                      <Consigne icon={Restaurant01Icon}>
                        {current.diet}
                      </Consigne>
                    )}
                    {stay.note && (
                      <Consigne icon={Alert02Icon}>{stay.note}</Consigne>
                    )}
                  </ul>
                </section>
              )}

              <section className="space-y-2">
                <SectionTitle>Facturation</SectionTitle>
                <dl className="divide-y rounded-xl border text-sm">
                  {stayLines(stay).map((line) => (
                    <div
                      className="flex justify-between gap-4 px-4 py-2"
                      key={line.label}
                    >
                      <dt className="text-muted-foreground">{line.label}</dt>
                      <dd className="tabular-nums">
                        {formatAmount(line.amount)}
                      </dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 px-4 py-2 font-medium">
                    <dt>Total</dt>
                    <dd className="tabular-nums">
                      {formatAmount(stayAmount(stay))}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-2">
                    <dt className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className={`size-1.5 rounded-full ${paymentMeta[stay.payment].dot}`}
                      />
                      {paymentMeta[stay.payment].label}
                    </dt>
                    <dd className="tabular-nums">
                      {stay.payment === "paid"
                        ? "0 €"
                        : `Reste ${formatAmount(
                            stayAmount(stay) - stayDeposit(stay)
                          )}`}
                    </dd>
                  </div>
                </dl>
              </section>

              {stay.status !== "upcoming" && stay.status !== "pending" && (
                <section className="space-y-2">
                  <SectionTitle>Journal du séjour</SectionTitle>
                  <ol className="ms-1 space-y-3 border-s ps-4">
                    {Array.from(
                      {
                        length:
                          Math.min(TODAY, stay.departure) - stay.arrival + 1,
                      },
                      (_, i) => stay.arrival + i
                    )
                      .reverse()
                      .slice(0, 5)
                      .map((day, i) => (
                        <li className="relative text-sm" key={day}>
                          <span className="absolute start-[calc(-1rem-4.5px)] top-1.5 size-2 rounded-full bg-pension-strong" />
                          <p className="text-xs text-muted-foreground">
                            {relativeDate(day)}
                          </p>
                          <p>
                            {day === stay.departure
                              ? "Départ, remis à son propriétaire en pleine forme."
                              : journal[
                                  (day - stay.arrival + i) % journal.length
                                ]}
                          </p>
                        </li>
                      ))}
                  </ol>
                </section>
              )}
            </SheetPanel>
            <SheetFooter>
              {stay.status === "pending" ? (
                <>
                  <Button
                    onClick={() => onDecline?.(stay.id)}
                    variant="outline"
                  >
                    Refuser
                  </Button>
                  <Button
                    disabled={!stay.kennelId}
                    onClick={() => onConfirm?.(stay.id)}
                  >
                    {stay.kennelId ? "Confirmer le séjour" : "À placer d'abord"}
                  </Button>
                </>
              ) : stay.status === "ongoing" ? (
                <>
                  <Button variant="outline">Prolonger</Button>
                  <Button>Envoyer une nouvelle</Button>
                </>
              ) : stay.status === "upcoming" ? (
                <>
                  <Button variant="outline">Modifier</Button>
                  <Button>Envoyer un rappel</Button>
                </>
              ) : (
                <Button variant="outline">Voir la facture</Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetPopup>
    </Sheet>
  )
}

function StayDates({ stay }: { stay: Stay }) {
  const { elapsed, label, nights } = stayProgress(stay)
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon className="size-3.5" icon={Login03Icon} />
            Arrivée
          </p>
          <p className="text-sm font-medium">{shortDate(stay.arrival)}</p>
        </div>
        <Badge variant="outline">
          {nights} nuit{nights > 1 && "s"}
        </Badge>
        <div className="text-end">
          <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
            Départ
            <HugeiconsIcon className="size-3.5" icon={Logout03Icon} />
          </p>
          <p className="text-sm font-medium">{shortDate(stay.departure)}</p>
        </div>
      </div>
      {stay.status === "ongoing" && (
        <div className="space-y-1.5">
          <Bar
            className="bg-pension-strong"
            label="Avancement du séjour"
            value={(elapsed / nights) * 100}
          />
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      )}
      {stay.options.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t pt-3">
          {stay.options.map((option) => (
            <Badge key={option} variant="secondary">
              {option}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

function Consigne({
  icon,
  children,
}: {
  icon: typeof Alert02Icon
  children: ReactNode
}) {
  return (
    <li className="flex items-start gap-2">
      <HugeiconsIcon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        icon={icon}
      />
      {children}
    </li>
  )
}
