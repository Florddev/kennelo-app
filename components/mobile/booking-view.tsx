"use client"

import {
  Calendar03Icon,
  CreditCardIcon,
  Invoice01Icon,
  Location01Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import {
  BookingCard,
  petsOf,
  QuickAction,
  Row,
  Rows,
  Section,
  TopBar,
} from "@/components/mobile/mobile-ui"
import {
  Checklist,
  ReviewDialog,
  toBring,
  Tracking,
} from "@/components/site/booking-detail"
import {
  bookingTotal,
  isUpcoming,
  me,
  updateBooking,
  useSite,
  venueOf,
} from "@/components/site/data"
import { ReportCard } from "@/components/site/pet-profile"
import { routesFor } from "@/components/site/routes"
import { PetAvatar } from "@/components/site/site-ui"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const card = "mx-4 rounded-3xl border bg-card p-5"

export function MobileBooking({ id }: { id: string }) {
  const site = useSite()
  const [reviewing, setReviewing] = useState(false)
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
  const upcoming = isUpcoming(booking)
  const cancelled = booking.status === "cancelled"
  const notes = site.notes.filter((n) => n.booking === booking.id)

  return (
    <div className="space-y-8 pb-6">
      <TopBar back="/mobile/bookings" title={`Réservation ${booking.id}`} />

      <div className="-mt-4">
        <BookingCard booking={booking} />
      </div>

      <div className="grid grid-cols-3 gap-2 px-4">
        <QuickAction
          href={`/mobile/messages/${venue.slug}`}
          icon={Message01Icon}
          label="Écrire"
        />
        <QuickAction
          icon={Location01Icon}
          label="Itinéraire"
          onClick={() => notify("Itinéraire ouvert dans Plans")}
        />
        {upcoming ? (
          <QuickAction
            icon={Calendar03Icon}
            label="Dans mon agenda"
            onClick={() => notify("Ajouté à votre agenda")}
          />
        ) : (
          <QuickAction
            href={routesFor(true).book(venue.slug, booking.activity)}
            icon={Calendar03Icon}
            label="Réserver à nouveau"
            primary
          />
        )}
      </div>

      {booking.status === "done" && !booking.reviewed && (
        <div className="mx-4 space-y-4 rounded-3xl bg-primary p-5 text-primary-foreground">
          <p className="text-xl font-semibold">
            Comment s&apos;est passé{" "}
            {booking.end ? "le séjour" : "le rendez-vous"} de {pets[0]?.name} ?
          </p>
          <Button
            className="w-full bg-wise-forest text-wise-green hover:bg-wise-forest/90"
            onClick={() => setReviewing(true)}
            size="xl"
          >
            Donner mon avis
          </Button>
        </div>
      )}

      {notes.map((n) => (
        <Section key={n.id} title={`Le mot de ${venue.name}`}>
          <div className="px-4">
            <ReportCard hideHeader note={n} />
          </div>
        </Section>
      ))}

      <Section title="Suivi">
        <div className={card}>
          <Tracking booking={booking} />
        </div>
      </Section>

      {upcoming && (
        <Section title="À prévoir">
          <div className={card}>
            <Checklist items={toBring[booking.activity]} />
          </div>
        </Section>
      )}

      <Section title={pets.length > 1 ? "Les animaux" : "L'animal"}>
        <Rows>
          {pets.map((p) => (
            <Row
              href={`/mobile/pets/${p.id}`}
              key={p.id}
              media={<PetAvatar className="size-14" pet={p} />}
              text="Sa fiche est transmise à l'établissement"
              title={p.name}
            />
          ))}
        </Rows>
      </Section>

      <Section title="Prix">
        <div className={cn(card, "space-y-4")}>
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
                "text-3xl font-semibold tabular-nums",
                cancelled && "text-muted-foreground line-through"
              )}
            >
              {euros(bookingTotal(booking))}
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted p-4">
            <HugeiconsIcon className="size-5 shrink-0" icon={CreditCardIcon} />
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
            className="w-full"
            onClick={() => notify("Facture téléchargée")}
            size="lg"
            variant="secondary"
          >
            <HugeiconsIcon icon={Invoice01Icon} />
            Télécharger la facture
          </Button>
        </div>
      </Section>

      {booking.note && (
        <Section title="Votre message">
          <p className="mx-4 rounded-3xl rounded-tr-md bg-primary px-4 py-3 text-primary-foreground">
            {booking.note}
          </p>
        </Section>
      )}

      {upcoming && (
        <div className="mx-4 space-y-4 rounded-3xl bg-muted p-5">
          <div>
            <p className="font-semibold">Un empêchement ?</p>
            <p className="text-muted-foreground">
              L&apos;annulation est gratuite jusqu&apos;à 48 h avant.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  className="w-full"
                  size="lg"
                  variant="destructive-outline"
                />
              }
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
