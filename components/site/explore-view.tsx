"use client"

import {
  Alert02Icon,
  Calendar03Icon,
  CreditCardIcon,
  Location01Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  type Activity,
  activityMeta,
  activityNames,
} from "@/components/activity-mark"
import {
  isUpcoming,
  me,
  petAlerts,
  statusMeta,
  useSite,
  venueOf,
  venues,
} from "@/components/site/data"
import {
  activityIcons,
  bookingDates,
  PetAvatar,
  SectionHead,
  SeeAll,
  Photo,
  SitePage,
  VenueCard,
} from "@/components/site/site-ui"
import { explorePhotos } from "@/components/site/venues"
import { dayMonth } from "@/components/services/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const descriptions: Record<Activity, string> = {
  Éducation: "Séances individuelles et cours collectifs",
  Pension: "Quelques nuits ou plusieurs semaines",
  Toilettage: "Bain, coupe, griffes",
}

const trust = [
  {
    icon: SecurityCheckIcon,
    text: "Chaque professionnel est vérifié avant d'apparaître sur Kennelo.",
    title: "Établissements vérifiés",
  },
  {
    icon: CreditCardIcon,
    text: "Vous ne payez qu'une fois la réservation acceptée.",
    title: "Paiement sécurisé",
  },
  {
    icon: Calendar03Icon,
    text: "Gratuite jusqu'à 48 h avant, en un clic.",
    title: "Annulation simple",
  },
]

/** Grande barre de recherche du haut de page. */
function HeroSearch() {
  const router = useRouter()
  const [activity, setActivity] = useState<Activity>("Pension")
  const [query, setQuery] = useState("")
  const search = () =>
    router.push(
      `/search?activity=${encodeURIComponent(activity)}${query ? `&q=${encodeURIComponent(query)}` : ""}`
    )
  return (
    <form
      className="mt-10 flex flex-col gap-3 rounded-3xl bg-background p-3 text-foreground shadow-lg md:flex-row md:items-center md:rounded-full md:p-2"
      onSubmit={(e) => {
        e.preventDefault()
        search()
      }}
    >
      <div className="flex gap-1 overflow-x-auto">
        {activityNames.map((a) => (
          <button
            aria-pressed={a === activity}
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 rounded-full px-4 font-semibold transition-colors",
              a === activity
                ? "bg-control text-control-foreground"
                : "hover:bg-accent"
            )}
            key={a}
            onClick={() => setActivity(a)}
            type="button"
          >
            <HugeiconsIcon className="size-5" icon={activityIcons[a]} />
            {a}
          </button>
        ))}
      </div>
      <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full bg-muted px-4 md:bg-transparent">
        <HugeiconsIcon
          className="size-5 shrink-0 text-muted-foreground"
          icon={Location01Icon}
        />
        <input
          aria-label="Ville ou code postal"
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-placeholder"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ville, code postal ou nom"
          value={query}
        />
      </label>
      <Button className="md:px-8" size="lg" type="submit">
        Rechercher
      </Button>
    </form>
  )
}

export function ExploreView() {
  const site = useSite()
  const next = site.bookings
    .filter(isUpcoming)
    .sort((a, b) => a.start.localeCompare(b.start))[0]
  const nextVenue = next && venueOf(next.venue)
  const nextPet = next && site.pets.find((p) => p.id === next.pets[0])
  const alert = site.pets.flatMap((pet) =>
    petAlerts(pet).map((v) => ({ pet, vaccine: v }))
  )[0]
  const near = [...venues].sort((a, b) => a.distance - b.distance)
  const best = [...venues].sort((a, b) => b.rating - a.rating).slice(0, 3)
  const weekend = venues.filter((v) => v.weekend).slice(0, 3)

  return (
    <>
      <section className="bg-wise-green text-wise-forest">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-10 md:py-20">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center lg:gap-10">
            <div>
              <h1 className="max-w-4xl font-display text-6xl text-balance md:text-8xl">
                Le bon endroit pour votre animal
              </h1>
              <p className="mt-6 max-w-xl text-lg md:text-xl">
                Pensions, toilettage, éducation : comparez, réservez et payez en
                quelques minutes.
              </p>
            </div>
            <div className="relative hidden h-72 lg:block">
              <Photo
                alt="Un chien heureux"
                className="absolute top-0 right-0 size-56 rounded-full"
                sizes="224px"
                src={explorePhotos.hero[0]}
              />
              <Photo
                alt="Un chat"
                className="absolute bottom-0 left-0 size-32 rounded-full border-6 border-wise-green"
                sizes="128px"
                src={explorePhotos.hero[1]}
              />
              <span className="absolute right-6 bottom-4 flex items-center gap-1 rounded-full bg-wise-forest px-3 py-1.5 font-semibold text-wise-green">
                4,8 / 5 · 760 avis
              </span>
            </div>
          </div>
          <HeroSearch />
        </div>
      </section>

      <SitePage>
        <section className="space-y-4">
          <h2 className="font-heading text-3xl font-semibold">
            Bonjour {me.first}
          </h2>
          {next && nextVenue && nextPet && (
            <Link
              className="flex items-center gap-4 rounded-3xl bg-muted p-5 transition-colors hover:bg-neutral-hover"
              href={`/me/bookings/${next.id}`}
            >
              <PetAvatar className="size-14" pet={nextPet} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-muted-foreground">
                  Votre prochaine réservation
                </p>
                <p className="truncate text-lg font-semibold">
                  {nextPet.name} chez {nextVenue.name}
                </p>
                <p className="truncate text-muted-foreground">
                  {next.activity} · {bookingDates(next)}
                </p>
              </div>
              <Badge
                className="max-sm:hidden"
                size="lg"
                variant={statusMeta[next.status].variant}
              >
                {statusMeta[next.status].label}
              </Badge>
            </Link>
          )}
          {alert && (
            <Link
              className="flex items-center gap-4 rounded-3xl bg-warning-soft p-5 transition-colors hover:opacity-90"
              href={`/me/pets/${alert.pet.id}`}
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-background">
                <HugeiconsIcon className="size-6" icon={Alert02Icon} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  Vaccin « {alert.vaccine.name} » de {alert.pet.name} à
                  renouveler
                </p>
                <p className="text-muted-foreground">
                  Les pensions le demandent à l&apos;arrivée. Valable
                  jusqu&apos;au {dayMonth(alert.vaccine.expires)}
                </p>
              </div>
            </Link>
          )}
        </section>

        <section className="space-y-4">
          <SectionHead title="Que cherchez-vous ?" />
          <div className="grid gap-4 md:grid-cols-3">
            {activityNames.map((a) => (
              <Link
                className={cn(
                  "group relative flex min-h-48 flex-col justify-between overflow-hidden rounded-3xl p-6 transition-transform hover:scale-[0.98] md:min-h-64",
                  activityMeta[a].tint
                )}
                href={`/search?activity=${encodeURIComponent(a)}`}
                key={a}
              >
                <Photo
                  alt=""
                  className="absolute -top-6 -right-6 size-36 rounded-full md:size-40"
                  sizes="160px"
                  src={explorePhotos.tiles[a]}
                />
                <HugeiconsIcon className="size-10" icon={activityIcons[a]} />
                <div className="relative">
                  <p className="font-display text-5xl">{a}</p>
                  <p className="mt-2 font-semibold opacity-80">
                    {descriptions[a]} ·{" "}
                    {venues.filter((v) => v.activities.includes(a)).length}{" "}
                    adresses
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHead
            action={<SeeAll href="/search" />}
            description="Autour de Bordeaux"
            title="Près de chez vous"
          />
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
            {near.slice(0, 6).map((venue) => (
              <VenueCard
                className="w-72 shrink-0 snap-start md:w-auto"
                key={venue.slug}
                venue={venue}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHead
            description="Les avis des propriétaires"
            title="Les mieux notés"
          />
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {best.map((venue) => (
              <VenueCard key={venue.slug} venue={venue} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHead
            description="Il reste de la place samedi et dimanche"
            title="Disponibles ce week-end"
          />
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {weekend.map((venue) => (
              <VenueCard key={venue.slug} venue={venue} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {trust.map((t) => (
            <div className="space-y-3 rounded-3xl bg-muted p-6" key={t.title}>
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HugeiconsIcon className="size-6" icon={t.icon} />
              </span>
              <p className="text-lg font-semibold">{t.title}</p>
              <p className="text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </section>
      </SitePage>
    </>
  )
}
