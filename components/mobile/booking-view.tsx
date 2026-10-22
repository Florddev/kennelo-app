"use client"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CreditCardIcon,
  HelpCircleIcon,
  Invoice01Icon,
  Location01Icon,
  Message01Icon,
  Share08Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { activityMeta } from "@/components/activity-mark"
import {
  IconDot,
  NotePost,
  petsOf,
  QuickAction,
  RoundButton,
  Row,
  Rows,
  Section,
  TopBar,
} from "@/components/mobile/mobile-ui"
import {
  countdown,
  ReviewDialog,
  toBring,
} from "@/components/site/booking-detail"
import {
  bookingTotal,
  isUpcoming,
  me,
  type MyBooking,
  nightsOf,
  statusMeta,
  updateBooking,
  useSite,
  type Venue,
  venueOf,
} from "@/components/site/data"
import { routesFor } from "@/components/site/routes"
import { Photo, VenueLogo, VenueMap } from "@/components/site/site-ui"
import { euros } from "@/components/services/data"
import { notify } from "@/components/settings/settings-ui"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const dateParts = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`)
  const part = (o: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString("fr-FR", { timeZone: "UTC", ...o })
  return {
    day: part({ day: "numeric" }),
    month: part({ month: "long" }),
    weekday: part({ weekday: "long" }),
  }
}

/** Un jour en grand, comme sur un billet. */
function DateTile({
  label,
  iso,
  extra,
}: {
  label: string
  iso: string
  extra?: string
}) {
  const { day, month, weekday } = dateParts(iso)
  return (
    <div className="min-w-0 flex-1 rounded-3xl bg-muted p-4">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold first-letter:uppercase">{weekday}</p>
      <p className="font-display text-6xl">{day}</p>
      <p className="font-semibold">{month}</p>
      {extra && <p className="text-sm text-muted-foreground">{extra}</p>}
    </div>
  )
}

/** Où en est la réservation, en quatre points sur une ligne. */
function Stepper({ booking, venue }: { booking: MyBooking; venue: Venue }) {
  const { status } = booking
  const stay = !!booking.end
  type State = "done" | "now" | "next" | "fail"
  const steps: { title: string; state: State }[] =
    status === "cancelled"
      ? [
          { state: "done", title: "Envoyée" },
          { state: "fail", title: "Annulée" },
        ]
      : [
          { state: "done", title: "Envoyée" },
          {
            state: status === "pending" ? "now" : "done",
            title: status === "pending" ? "En attente" : "Confirmée",
          },
          {
            state:
              status === "done" || status === "ongoing"
                ? "done"
                : status === "confirmed"
                  ? "now"
                  : "next",
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
                  title: "Départ",
                },
              ]
            : []),
        ]
  const sentence = {
    cancelled: "Vous n'avez rien payé.",
    confirmed: `Tout est prêt : ${venue.name} vous attend.`,
    done: "C'est terminé. Merci d'avoir réservé avec Kennelo !",
    ongoing: `En ce moment chez ${venue.name}.`,
    pending: `${venue.name} ${venue.response.charAt(0).toLowerCase()}${venue.response.slice(1)}.`,
  }[status]

  return (
    <div className="mx-4 space-y-5 rounded-3xl bg-muted p-5">
      <ol className="flex">
        {steps.map((s, i) => (
          <li
            className="relative flex flex-1 flex-col items-center gap-2 text-center"
            key={s.title}
          >
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute top-4 left-1/2 h-0.5 w-full",
                  s.state === "done" ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "relative flex size-8 items-center justify-center rounded-full border-2 bg-muted",
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
            <span
              className={cn(
                "text-sm font-semibold",
                s.state === "next" && "text-muted-foreground"
              )}
            >
              {s.title}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-center text-lg font-semibold text-balance">
        {sentence}
      </p>
    </div>
  )
}

/** Ce qu'il faut emporter : on coche, la barre avance. */
function Packing({ items }: { items: string[] }) {
  const [done, setDone] = useState<string[]>([])
  return (
    <div className="mx-4 space-y-4 rounded-3xl border p-5">
      <div className="space-y-2">
        <p className="font-semibold">
          {done.length === items.length
            ? "Tout est prêt !"
            : `${done.length} sur ${items.length} prêts`}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${(done.length / items.length) * 100}%` }}
          />
        </div>
      </div>
      <ul className="-mx-2">
        {items.map((item) => {
          const on = done.includes(item)
          return (
            <li key={item}>
              <button
                aria-pressed={on}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-2 text-start text-lg transition-colors active:bg-accent"
                onClick={() =>
                  setDone((d) =>
                    on ? d.filter((x) => x !== item) : [...d, item]
                  )
                }
                type="button"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input"
                  )}
                >
                  {on && (
                    <HugeiconsIcon
                      className="size-4"
                      icon={Tick02Icon}
                      strokeWidth={3}
                    />
                  )}
                </span>
                <span
                  className={cn(on && "text-muted-foreground line-through")}
                >
                  {item}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function MobileBooking({ id }: { id: string }) {
  const router = useRouter()
  const site = useSite()
  const [reviewing, setReviewing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const booking = site.bookings.find((b) => b.id === id)
  if (!booking)
    return (
      <>
        <TopBar back="/mobile/bookings" title="Réservation" />
        <p className="px-4 text-muted-foreground">
          Cette réservation est introuvable.
        </p>
      </>
    )

  const venue = venueOf(booking.venue)!
  const pets = petsOf(booking, site.pets)
  const names = pets.map((p) => p.name).join(" et ")
  const upcoming = isUpcoming(booking)
  const cancelled = booking.status === "cancelled"
  const nights = nightsOf(booking)
  const notes = site.notes.filter((n) => n.booking === booking.id)
  const back = () =>
    window.history.length > 1 ? router.back() : router.push("/mobile/bookings")
  const onTint = "bg-white/60 text-current"

  return (
    <div className="space-y-8 pb-6">
      {/* La réservation : photo du lieu, puis le compte à rebours sur la couleur de l'activité */}
      <div
        className={cn(
          cancelled ? "bg-muted" : activityMeta[booking.activity].tint
        )}
      >
        <div className="relative h-60">
          {venue.photos[0] && (
            <Photo
              alt={venue.name}
              className="absolute inset-0"
              sizes="448px"
              src={venue.photos[0]}
            />
          )}
          <span className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/40 to-transparent" />
          <div className="absolute inset-x-0 top-0 flex justify-between p-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            <RoundButton
              className="bg-background/90"
              icon={ArrowLeft01Icon}
              label="Retour"
              onClick={back}
            />
            <RoundButton
              className="bg-background/90"
              icon={Share08Icon}
              label="Partager"
              onClick={() => notify("Lien de la réservation copié")}
            />
          </div>
        </div>
        <div className="space-y-6 px-4 pt-5 pb-7">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-wise-forest">
              {statusMeta[booking.status].label}
            </span>
            <span className="rounded-full bg-white/40 px-3 py-1 font-mono text-sm">
              {booking.id}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold opacity-80">
              {booking.activity} pour {names}
            </p>
            <h1 className="font-display text-7xl text-balance">
              {countdown(booking)}
            </h1>
            <Link
              className="mt-3 flex items-center gap-3 font-semibold"
              href={`/mobile/places/${venue.slug}`}
            >
              <VenueLogo
                className="size-10 border-2 border-white text-base"
                venue={venue}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg">{venue.name}</span>
                <span className="block truncate text-sm opacity-80">
                  {venue.city} · Voir la page
                </span>
              </span>
              <HugeiconsIcon className="size-5" icon={ArrowRight01Icon} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <QuickAction
              circleClassName={onTint}
              href={`/mobile/messages/${venue.slug}`}
              icon={Message01Icon}
              label="Écrire"
            />
            <QuickAction
              circleClassName={onTint}
              icon={Location01Icon}
              label="Itinéraire"
              onClick={() => notify("Itinéraire ouvert dans Plans")}
            />
            {upcoming ? (
              <QuickAction
                circleClassName={onTint}
                icon={Calendar03Icon}
                label="Dans mon agenda"
                onClick={() => notify("Ajouté à votre agenda")}
              />
            ) : (
              <QuickAction
                circleClassName="bg-wise-forest text-wise-green"
                href={routesFor(true).book(venue.slug, booking.activity)}
                icon={Calendar03Icon}
                label="Réserver à nouveau"
              />
            )}
          </div>
        </div>
      </div>

      {booking.status === "done" && !booking.reviewed && (
        <div className="mx-4 space-y-4 rounded-3xl bg-primary p-5 text-primary-foreground">
          <p className="font-display text-4xl">Votre avis ?</p>
          <p className="text-lg">
            Comment s&apos;est passé{" "}
            {booking.end ? "le séjour" : "le rendez-vous"} de {names} ? Ça prend
            30 secondes.
          </p>
          <Button
            className="w-full rounded-full bg-wise-forest text-wise-green hover:bg-wise-forest/90"
            onClick={() => setReviewing(true)}
            size="xl"
          >
            Donner mon avis
          </Button>
        </div>
      )}

      <Section title="Suivi">
        <Stepper booking={booking} venue={venue} />
      </Section>

      <Section title={booking.end ? "Les dates" : "Le rendez-vous"}>
        <div className="flex items-stretch gap-2 px-4">
          <DateTile
            extra={booking.time ? `à ${booking.time}` : venue.hours}
            iso={booking.start}
            label={booking.end ? "Arrivée" : booking.item}
          />
          {booking.end && (
            <>
              <span className="flex shrink-0 flex-col items-center justify-center gap-1 text-sm font-semibold text-muted-foreground">
                <HugeiconsIcon className="size-5" icon={ArrowRight01Icon} />
                {nights} nuit{nights > 1 ? "s" : ""}
              </span>
              <DateTile extra={booking.item} iso={booking.end} label="Départ" />
            </>
          )}
        </div>
      </Section>

      {notes.map((n) => (
        <Section key={n.id} title={`Le mot de ${venue.name}`}>
          <NotePost note={n} />
        </Section>
      ))}

      <Section title={pets.length > 1 ? "Les animaux" : "L'animal"}>
        <div className="space-y-2 px-4">
          {pets.map((p) => (
            <Link
              className={cn(
                "flex items-center gap-4 rounded-3xl p-2 pe-4 transition-transform active:scale-[0.98]",
                p.tone
              )}
              href={`/mobile/pets/${p.id}`}
              key={p.id}
            >
              {p.photo ? (
                <Photo
                  alt={p.name}
                  className="size-20 shrink-0 rounded-2xl"
                  sizes="80px"
                  src={p.photo}
                />
              ) : (
                <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-white/40 font-display text-4xl">
                  {p.name[0]}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-4xl">
                  {p.name}
                </span>
                <span className="block text-sm font-semibold opacity-80">
                  Sa fiche est transmise à {venue.name}
                </span>
              </span>
              <HugeiconsIcon
                className="size-5 shrink-0"
                icon={ArrowRight01Icon}
              />
            </Link>
          ))}
        </div>
      </Section>

      {upcoming && (
        <Section title="À emporter">
          <Packing items={toBring[booking.activity]} />
        </Section>
      )}

      <Section title="Prix">
        <div className="mx-4 overflow-hidden rounded-3xl border">
          <ul className="space-y-3 p-5">
            {booking.lines.map((l, i) => (
              <li className="flex justify-between gap-4 text-lg" key={i}>
                <span className="text-muted-foreground">{l.label}</span>
                <span className="font-semibold tabular-nums">
                  {l.amount ? euros(l.amount) : "Inclus"}
                </span>
              </li>
            ))}
          </ul>
          <div className="relative border-t-2 border-dashed">
            <span className="absolute -top-3 -left-3 size-6 rounded-full border bg-background" />
            <span className="absolute -top-3 -right-3 size-6 rounded-full border bg-background" />
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-lg font-semibold">Total</span>
              <span
                className={cn(
                  "font-display text-6xl tabular-nums",
                  cancelled && "text-muted-foreground line-through"
                )}
              >
                {euros(bookingTotal(booking))}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-muted p-4">
              <HugeiconsIcon
                className="size-6 shrink-0"
                icon={CreditCardIcon}
              />
              <span>
                {cancelled
                  ? "Rien n'a été débité"
                  : booking.payment === "online"
                    ? booking.status === "pending"
                      ? "Débité une fois la demande acceptée"
                      : `Payé en ligne · ${me.card}`
                    : "À régler sur place"}
              </span>
            </div>
            <Button
              className="w-full rounded-full"
              onClick={() => notify("Facture téléchargée")}
              size="xl"
              variant="secondary"
            >
              <HugeiconsIcon icon={Invoice01Icon} />
              Télécharger la facture
            </Button>
          </div>
        </div>
      </Section>

      {booking.note && (
        <Section title="Votre message">
          <div className="flex justify-end px-4">
            <p className="max-w-[85%] rounded-3xl rounded-br-md bg-primary px-4 py-3 text-lg text-primary-foreground">
              {booking.note}
            </p>
          </div>
        </Section>
      )}

      {upcoming && (
        <Section title="Y aller">
          <VenueMap
            active={venue.slug}
            base="/mobile/places"
            className="mx-4 h-44"
            items={[{ venue }]}
          />
          <div className="flex items-center gap-4 px-4">
            <p className="min-w-0 flex-1">
              <span className="block font-semibold">{venue.address}</span>
              <span className="block text-sm text-muted-foreground">
                {venue.hours}
              </span>
            </p>
            <RoundButton
              className="bg-primary text-primary-foreground"
              icon={Location01Icon}
              label="Ouvrir l'itinéraire"
              onClick={() => notify("Itinéraire ouvert dans Plans")}
            />
          </div>
        </Section>
      )}

      <Rows>
        <Row
          href={`/mobile/messages/${venue.slug}`}
          media={<IconDot icon={HelpCircleIcon} />}
          text={`Posez votre question à ${venue.name}`}
          title="Une question ?"
        />
        {upcoming && (
          <Row
            media={
              <IconDot
                className="bg-destructive/10 text-destructive-foreground"
                icon={Cancel01Icon}
              />
            }
            onClick={() => setCancelling(true)}
            text="Gratuit jusqu'à 48 h avant"
            title="Annuler la réservation"
          />
        )}
      </Rows>

      <AlertDialog onOpenChange={setCancelling} open={cancelling}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              {venue.name} sera prévenu tout de suite. Vous serez remboursé sous
              5 jours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button size="lg" variant="ghost" />}>
              Garder
            </AlertDialogClose>
            <AlertDialogClose
              onClick={() => {
                updateBooking(booking.id, { status: "cancelled" })
                notify("Réservation annulée")
              }}
              render={<Button size="lg" variant="destructive" />}
            >
              Annuler la réservation
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <ReviewDialog
        booking={booking}
        onOpenChange={setReviewing}
        open={reviewing}
      />
    </div>
  )
}
