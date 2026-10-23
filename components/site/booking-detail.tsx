"use client"

import {
  ArrowLeft01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CreditCardIcon,
  Invoice01Icon,
  Location01Icon,
  Message01Icon,
  StarIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import { type Activity, activityMeta } from "@/components/activity-mark"
import { daysBetween } from "@/components/pets/data"
import {
  bookingTotal,
  isUpcoming,
  me,
  type MyBooking,
  nightsOf,
  statusMeta,
  updateBooking,
  useSite,
  venueOf,
} from "@/components/site/data"
import { ReportCard } from "@/components/site/pet-profile"
import {
  bookingDates,
  PetAvatar,
  Photo,
  VenueLogo,
  VenueMap,
} from "@/components/site/site-ui"
import { euros, shortIso, todayIso } from "@/components/services/data"
import { notify } from "@/components/settings/settings-ui"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export const toBring: Record<Activity, string[]> = {
  Éducation: [
    "Laisse et collier",
    "Des friandises qu'il adore",
    "Pas de repas dans les 2 h avant",
  ],
  Pension: [
    "Carnet de santé à jour",
    "Sa nourriture habituelle",
    "Son doudou ou sa couverture",
    "Ses médicaments, s'il en a",
  ],
  Toilettage: [
    "Une petite promenade juste avant",
    "Signaler les zones sensibles",
  ],
}

/** Le grand titre de l'en-tête : combien de temps avant le rendez-vous. */
export function countdown(b: MyBooking) {
  if (b.status === "cancelled") return "Annulée"
  if (b.status === "ongoing") return "En cours"
  if (b.status === "done") return "Terminée"
  const days = daysBetween(todayIso, b.start)
  if (days <= 0) return "Aujourd'hui"
  if (days === 1) return "Demain"
  return `Dans ${days} jours`
}

function Card({
  title,
  action,
  className,
  children,
}: {
  title: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn("space-y-4 rounded-3xl border bg-card p-6", className)}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-4xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Action({
  icon,
  label,
  href,
  onClick,
}: {
  icon: IconSvgElement
  label: string
  href?: string
  onClick?: () => void
}) {
  return (
    <Button
      onClick={onClick}
      render={href ? <Link href={href} /> : undefined}
      size="lg"
      variant="secondary"
    >
      <HugeiconsIcon icon={icon} />
      {label}
    </Button>
  )
}

/** Suivi façon virement Wise : à l'horizontale sur grand écran. */
export function Tracking({ booking }: { booking: MyBooking }) {
  const venue = venueOf(booking.venue)
  const stay = !!booking.end
  const status = booking.status
  type State = "done" | "now" | "next" | "fail"
  const steps: { title: string; text?: string; state: State }[] =
    status === "cancelled"
      ? [
          { state: "done", title: "Réservation envoyée" },
          { state: "fail", text: "Vous n'avez rien payé.", title: "Annulée" },
        ]
      : [
          { state: "done", title: "Envoyée" },
          {
            state: status === "pending" ? "now" : "done",
            text: status === "pending" ? venue?.response : undefined,
            title: status === "pending" ? "En attente" : "Confirmée",
          },
          {
            state:
              status === "done" || status === "ongoing"
                ? "done"
                : status === "confirmed"
                  ? "now"
                  : "next",
            text: `${shortIso(booking.start)}${booking.time ? ` à ${booking.time}` : ""}`,
            title: stay ? "Arrivée" : "Rendez-vous",
          },
          ...(stay
            ? [
                {
                  state: (status === "done"
                    ? "done"
                    : status === "ongoing"
                      ? "now"
                      : "next") as State,
                  text: shortIso(booking.end ?? booking.start),
                  title: "Départ",
                },
              ]
            : []),
        ]
  return (
    <ol className="grid md:auto-cols-fr md:grid-flow-col">
      {steps.map((s, i) => (
        <li
          className="relative flex gap-4 pb-6 last:pb-0 md:flex-col md:gap-3 md:pe-4 md:pb-0"
          key={s.title}
        >
          {i < steps.length - 1 && (
            <span
              className={cn(
                "absolute top-9 bottom-1 left-4 w-0.5 -translate-x-1/2 md:top-4 md:right-1 md:bottom-auto md:left-10 md:h-0.5 md:w-auto md:translate-x-0",
                s.state === "done" ? "bg-primary" : "bg-border"
              )}
            />
          )}
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
              s.state === "done" &&
                "border-primary bg-primary text-primary-foreground",
              s.state === "now" && "border-control",
              s.state === "next" && "border-border",
              s.state === "fail" &&
                "border-destructive bg-destructive text-white"
            )}
          >
            {s.state === "done" && (
              <HugeiconsIcon
                className="size-4"
                icon={Tick02Icon}
                strokeWidth={3}
              />
            )}
            {s.state === "fail" && (
              <HugeiconsIcon
                className="size-4"
                icon={Cancel01Icon}
                strokeWidth={3}
              />
            )}
            {s.state === "now" && (
              <span className="size-3 rounded-full bg-control" />
            )}
          </span>
          <div>
            <p
              className={cn(
                "font-semibold",
                s.state === "next" && "text-muted-foreground"
              )}
            >
              {s.title}
            </p>
            {s.text && (
              <p className="text-sm text-muted-foreground">{s.text}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Ce qu'il faut emporter, à cocher. */
export function Checklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<string[]>([])
  return (
    <ul className="-mx-2 space-y-1">
      {items.map((item) => {
        const on = done.includes(item)
        return (
          <li key={item}>
            <button
              aria-pressed={on}
              className="flex w-full items-center gap-3 rounded-2xl p-2 text-start transition-colors hover:bg-accent"
              onClick={() =>
                setDone((d) =>
                  on ? d.filter((x) => x !== item) : [...d, item]
                )
              }
              type="button"
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input"
                )}
              >
                {on && (
                  <HugeiconsIcon
                    className="size-3.5"
                    icon={Tick02Icon}
                    strokeWidth={3}
                  />
                )}
              </span>
              <span className={cn(on && "text-muted-foreground line-through")}>
                {item}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function ReviewDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: MyBooking
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [stars, setStars] = useState(5)
  const venue = venueOf(booking.venue)
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Votre avis sur {venue?.name}</DialogTitle>
          <DialogDescription>
            Il aide les autres propriétaires à choisir.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="space-y-5">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                className="rounded-full p-1 transition-transform hover:scale-110"
                key={n}
                onClick={() => setStars(n)}
                type="button"
              >
                <HugeiconsIcon
                  className={cn(
                    "size-10",
                    n <= stars
                      ? "text-foreground [&_path]:fill-current"
                      : "text-muted-foreground/40"
                  )}
                  icon={StarIcon}
                />
              </button>
            ))}
          </div>
          <Textarea
            aria-label="Votre avis"
            placeholder="Accueil, propreté, nouvelles reçues…"
            rows={4}
          />
        </DialogPanel>
        <DialogFooter variant="bare">
          <DialogClose render={<Button variant="ghost" />}>
            Plus tard
          </DialogClose>
          <Button
            onClick={() => {
              updateBooking(booking.id, { reviewed: true })
              onOpenChange(false)
              notify("Merci pour votre avis !")
            }}
          >
            Publier
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

/** Carte récapitulative, pour l'écran « C'est réservé ! ». */
export function BookingTicket({ booking }: { booking: MyBooking }) {
  const site = useSite()
  const venue = venueOf(booking.venue)!
  const pets = booking.pets.flatMap(
    (p) => site.pets.find((x) => x.id === p) ?? []
  )
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-3xl text-start",
        activityMeta[booking.activity].tint
      )}
    >
      <div className="relative h-40">
        {venue.photos[0] && (
          <Photo
            alt={venue.name}
            className="absolute inset-0"
            sizes="544px"
            src={venue.photos[0]}
          />
        )}
        <VenueLogo
          className="absolute bottom-3 left-4 size-12 border-2 border-white text-xl"
          venue={venue}
        />
      </div>
      <div className="space-y-1 p-5">
        <p className="font-semibold opacity-80">
          {venue.name} · {booking.item}
        </p>
        <p className="font-display text-5xl">{countdown(booking)}</p>
        <p className="text-lg font-semibold">{bookingDates(booking)}</p>
        <div className="flex items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {pets.map((p) => (
                <PetAvatar
                  className="size-10 bg-white/60 p-0.5 text-lg"
                  key={p.id}
                  pet={p}
                />
              ))}
            </div>
            <span className="font-semibold">
              {pets.map((p) => p.name).join(" et ")}
            </span>
          </div>
          <span className="text-xl font-semibold tabular-nums">
            {euros(bookingTotal(booking))}
          </span>
        </div>
      </div>
    </div>
  )
}

/** En-tête d'une réservation : le compte à rebours sur la couleur de l'activité, la photo du lieu. */
export function BookingHero({
  booking,
  href,
  compact,
}: {
  booking: MyBooking
  /** Toute la carte mène à cette adresse. */
  href?: string
  compact?: boolean
}) {
  const site = useSite()
  const venue = venueOf(booking.venue)!
  const pets = booking.pets.flatMap(
    (p) => site.pets.find((x) => x.id === p) ?? []
  )
  const names = pets.map((p) => p.name).join(" et ")
  const nights = nightsOf(booking)
  const cancelled = booking.status === "cancelled"
  const photo = (
    <>
      {venue.photos[0] && (
        <Photo
          alt={venue.name}
          className="absolute inset-0 transition-transform group-hover:scale-105"
          sizes="(min-width: 768px) 352px, 100vw"
          src={venue.photos[0]}
        />
      )}
      <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5 text-white">
        <VenueLogo
          className="size-12 border-2 border-white text-xl"
          venue={venue}
        />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{venue.name}</span>
          <span className="block truncate text-sm text-white/80">
            {venue.city}
            {!href && " · Voir la page"}
          </span>
        </span>
      </span>
    </>
  )
  const body = (
    <>
      <div
        className={cn(
          "flex flex-col gap-6",
          compact ? "p-6 md:p-8" : "p-6 md:p-10"
        )}
      >
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-wise-forest">
            {statusMeta[booking.status].label}
          </span>
          <span className="rounded-full bg-white/40 px-3 py-1 font-mono text-sm">
            {booking.id}
          </span>
        </div>
        <div>
          <p className="font-semibold opacity-80">
            {booking.activity} · {booking.item}
          </p>
          <p
            className={cn(
              "font-display text-balance",
              compact ? "text-5xl md:text-7xl" : "text-6xl md:text-8xl"
            )}
          >
            {countdown(booking)}
          </p>
          <p className="mt-3 text-xl font-semibold">
            {bookingDates(booking)}
            {nights > 0 && ` · ${nights} nuit${nights > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="mt-auto flex items-center gap-3">
          <div className="flex -space-x-3">
            {pets.map((p) => (
              <PetAvatar
                className="size-14 bg-white/60 p-1"
                key={p.id}
                pet={p}
              />
            ))}
          </div>
          <p className="font-semibold">
            {names} chez {venue.name}
          </p>
        </div>
      </div>
      {href ? (
        <div className="relative min-h-48">{photo}</div>
      ) : (
        <Link
          className="group relative min-h-56"
          href={`/places/${venue.slug}`}
        >
          {photo}
        </Link>
      )}
    </>
  )
  const className = cn(
    "grid overflow-hidden rounded-3xl",
    compact
      ? "md:grid-cols-[minmax(0,1fr)_15rem]"
      : "md:grid-cols-[minmax(0,1fr)_22rem]",
    cancelled ? "bg-muted" : activityMeta[booking.activity].tint
  )
  return href ? (
    <Link
      className={cn(className, "group transition-transform hover:scale-[0.99]")}
      href={href}
    >
      {body}
    </Link>
  ) : (
    <section className={className}>{body}</section>
  )
}

export function BookingDetail({ id }: { id: string }) {
  const site = useSite()
  const [reviewing, setReviewing] = useState(false)
  const booking = site.bookings.find((b) => b.id === id)
  const back = (
    <Link
      className="inline-flex items-center gap-2 font-semibold"
      href="/me/bookings"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-secondary">
        <HugeiconsIcon className="size-5" icon={ArrowLeft01Icon} />
      </span>
      Réservations
    </Link>
  )
  if (!booking)
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-10 md:py-10">
        {back}
        <p className="text-muted-foreground">
          Cette réservation est introuvable.
        </p>
      </div>
    )

  const venue = venueOf(booking.venue)!
  const pets = booking.pets.flatMap(
    (p) => site.pets.find((x) => x.id === p) ?? []
  )
  const upcoming = isUpcoming(booking)
  const cancelled = booking.status === "cancelled"
  const total = bookingTotal(booking)
  const notes = site.notes.filter((n) => n.booking === booking.id)
  const rebook = `/book/${venue.slug}?activity=${encodeURIComponent(booking.activity)}`

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-10 md:py-10">
      {back}

      <BookingHero booking={booking} />

      <div className="flex flex-wrap gap-2">
        <Action
          href={`/me/messages?venue=${venue.slug}`}
          icon={Message01Icon}
          label={`Écrire à ${venue.name}`}
        />
        <Action
          icon={Location01Icon}
          label="Itinéraire"
          onClick={() => notify("Itinéraire ouvert dans Plans")}
        />
        {upcoming ? (
          <Action
            icon={Calendar03Icon}
            label="Ajouter à mon agenda"
            onClick={() => notify("Ajouté à votre agenda")}
          />
        ) : (
          <Action
            href={rebook}
            icon={Calendar03Icon}
            label="Réserver à nouveau"
          />
        )}
      </div>

      {booking.status === "done" && !booking.reviewed && (
        <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-primary p-6 text-primary-foreground">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold">
              Comment s&apos;est passé{" "}
              {booking.end ? "le séjour" : "le rendez-vous"} de {pets[0]?.name}{" "}
              ?
            </p>
            <p className="opacity-80">
              Votre avis compte pour les autres propriétaires.
            </p>
          </div>
          <Button
            className="bg-wise-forest text-wise-green hover:bg-wise-forest/90"
            onClick={() => setReviewing(true)}
            size="lg"
          >
            Donner mon avis
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {notes.map((n) => (
          <section className="space-y-3 lg:col-span-2" key={n.id}>
            <h2 className="font-display text-4xl">Le mot de {venue.name}</h2>
            <ReportCard hideHeader note={n} />
          </section>
        ))}

        <Card className="lg:col-span-2" title="Suivi">
          <Tracking booking={booking} />
        </Card>

        <Card
          action={
            <Button
              onClick={() => notify("Facture téléchargée")}
              size="sm"
              variant="ghost"
            >
              <HugeiconsIcon icon={Invoice01Icon} />
              Facture
            </Button>
          }
          className="lg:row-span-2"
          title="Prix"
        >
          <ul className="space-y-3">
            {booking.lines.map((l, i) => (
              <li className="flex justify-between gap-4" key={i}>
                <span className="text-muted-foreground">{l.label}</span>
                <span className="font-semibold tabular-nums">
                  {l.amount ? euros(l.amount) : "Inclus"}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between gap-4 border-t border-dashed pt-4">
            <span className="font-semibold">Total</span>
            <span
              className={cn(
                "text-4xl font-semibold tabular-nums",
                cancelled && "text-muted-foreground line-through"
              )}
            >
              {euros(total)}
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted p-4">
            <HugeiconsIcon className="size-5 shrink-0" icon={CreditCardIcon} />
            <span className="text-sm">
              {cancelled
                ? "Rien n'a été débité"
                : booking.payment === "online"
                  ? booking.status === "pending"
                    ? "En ligne, débité une fois la demande acceptée"
                    : `Payé en ligne · ${me.card}`
                  : "À régler sur place"}
            </span>
          </div>
        </Card>

        <Card title={pets.length > 1 ? "Les animaux" : "L'animal"}>
          <div className="space-y-3">
            {pets.map((p) => (
              <Link
                className="-mx-2 flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-accent"
                href={`/me/pets/${p.id}`}
                key={p.id}
              >
                <PetAvatar className="size-14" pet={p} />
                <div className="min-w-0">
                  <p className="font-semibold">{p.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    Voir son profil
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {pets.length > 1 ? "Leurs fiches" : "Sa fiche"} (santé, repas,
            caractère){" "}
            {pets.length > 1
              ? upcoming
                ? "sont transmises"
                : "ont été transmises"
              : upcoming
                ? "est transmise"
                : "a été transmise"}{" "}
            à {venue.name}.
          </p>
        </Card>

        {upcoming ? (
          <Card title="À prévoir">
            <Checklist items={toBring[booking.activity]} />
          </Card>
        ) : (
          <Card title="Lieu">
            <p className="text-muted-foreground">{venue.address}</p>
            <p className="text-sm text-muted-foreground">{venue.hours}</p>
          </Card>
        )}

        {booking.note && (
          <Card className="lg:col-span-2" title="Votre message">
            <p className="rounded-3xl rounded-tl-md bg-primary px-4 py-3 text-primary-foreground">
              {booking.note}
            </p>
          </Card>
        )}

        {upcoming && (
          <Card className="lg:col-span-3" title="Comment y aller">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center">
              <VenueMap
                active={venue.slug}
                className="h-40"
                items={[{ venue }]}
              />
              <div className="space-y-1">
                <p className="font-semibold">{venue.address}</p>
                <p className="text-sm text-muted-foreground">{venue.hours}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {upcoming && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-muted p-6">
          <div>
            <p className="font-semibold">Un empêchement ?</p>
            <p className="text-sm text-muted-foreground">
              L&apos;annulation est gratuite jusqu&apos;à 48 h avant.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive-outline" />}
            >
              Annuler la réservation
            </AlertDialogTrigger>
            <AlertDialogPopup>
              <AlertDialogHeader>
                <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
                <AlertDialogDescription>
                  {venue.name} sera prévenu tout de suite. Vous serez remboursé
                  sous 5 jours.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose render={<Button variant="ghost" />}>
                  Garder
                </AlertDialogClose>
                <AlertDialogClose
                  onClick={() => {
                    updateBooking(booking.id, { status: "cancelled" })
                    notify("Réservation annulée")
                  }}
                  render={<Button variant="destructive" />}
                >
                  Annuler la réservation
                </AlertDialogClose>
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialog>
        </div>
      )}

      <ReviewDialog
        booking={booking}
        onOpenChange={setReviewing}
        open={reviewing}
      />
    </div>
  )
}
