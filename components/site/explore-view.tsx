"use client"

import {
  Alert02Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Clock01Icon,
  CreditCardIcon,
  Location01Icon,
  QuoteDownIcon,
  SecurityCheckIcon,
  StarIcon,
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
  ratingText,
  reviewPool,
  statusMeta,
  useSite,
  venueOf,
  venues,
} from "@/components/site/data"
import { Paws, Sparkle, Squiggle } from "@/components/site/doodles"
import {
  activityIcons,
  bookingDates,
  PetAvatar,
  Photo,
  priceUnit,
  SectionTitle,
  SitePage,
  Stars,
  useFrom,
  VenueCard,
  VenueCover,
} from "@/components/site/site-ui"
import { explorePhotos } from "@/components/site/venues"
import { dayMonth, euros } from "@/components/services/data"
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

const pill = (on: boolean) =>
  cn(
    "flex h-12 items-center rounded-full border px-5 font-semibold transition-colors",
    on
      ? "border-control bg-control text-control-foreground"
      : "bg-background hover:bg-accent"
  )

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
      className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 rounded-3xl border bg-background p-3 text-start shadow-lg md:flex-row md:items-center md:rounded-full md:p-2"
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

/** Titre centré, recherche, puis un bandeau de photos avec un avis au milieu. */
function Hero() {
  const quote = reviewPool[0]
  return (
    <section className="overflow-hidden pt-12 pb-4 md:pt-20">
      <div className="px-4 text-center md:px-10">
        <p className="inline-flex items-center gap-2 font-semibold">
          <Stars className="text-warning" n={5} />
          4,8 / 5 · 760 avis de propriétaires
        </p>
        <h1 className="relative mx-auto mt-5 max-w-4xl font-display text-6xl text-balance md:text-8xl">
          Le bon endroit pour votre animal
          <Paws className="absolute -bottom-2 left-0 text-5xl max-md:hidden" />
          <Sparkle className="absolute -top-6 right-2 size-12 md:size-16" />
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
          Pensions, toilettage, éducation : comparez, réservez et payez en
          quelques minutes.
        </p>
        <HeroSearch />
      </div>

      <div className="mt-14 flex justify-center gap-4 md:gap-6">
        {explorePhotos.strip.map((src, i) =>
          i === 2 ? (
            <figure
              className="relative h-96 w-72 shrink-0 overflow-hidden rounded-4xl md:h-112 md:w-80"
              key={src}
            >
              <Photo
                alt="Un chien heureux après son séjour"
                className="absolute inset-0"
                sizes="320px"
                src={src}
              />
              <figcaption className="absolute inset-x-4 bottom-4 rounded-3xl bg-background/95 p-4 text-start">
                <p className="font-semibold">« {quote.text.split(".")[0]}. »</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {quote.author} · {quote.pet}
                </p>
              </figcaption>
            </figure>
          ) : (
            <Photo
              alt=""
              className="h-80 w-60 shrink-0 self-end rounded-4xl md:h-96 md:w-72"
              key={src}
              sizes="288px"
              src={src}
            />
          )
        )}
      </div>
    </section>
  )
}

/** Prochaine réservation et vaccin à renouveler, s'il y en a. */
function Greeting() {
  const site = useSite()
  const next = site.bookings
    .filter(isUpcoming)
    .sort((a, b) => a.start.localeCompare(b.start))[0]
  const nextVenue = next && venueOf(next.venue)
  const nextPet = next && site.pets.find((p) => p.id === next.pets[0])
  const alert = site.pets.flatMap((pet) =>
    petAlerts(pet).map((v) => ({ pet, vaccine: v }))
  )[0]
  if (!next && !alert) return null
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-3xl font-semibold">
        Bonjour {me.first}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
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
                Vaccin « {alert.vaccine.name} » de {alert.pet.name} à renouveler
              </p>
              <p className="text-muted-foreground">
                Valable jusqu&apos;au {dayMonth(alert.vaccine.expires)}
              </p>
            </div>
          </Link>
        )}
      </div>
    </section>
  )
}

/** Les trois activités comme une carte de prix ; la photo suit le survol. */
function Services() {
  const from = useFrom()
  const [shown, setShown] = useState<Activity>("Pension")
  const minFrom = (a: Activity) => {
    const prices = venues.flatMap((v) => {
      const p = v.activities.includes(a) ? from(v, a) : undefined
      return p === undefined ? [] : [p]
    })
    return prices.length ? Math.min(...prices) : undefined
  }
  return (
    <section className="space-y-8">
      <SectionTitle
        action={
          <Button render={<Link href="/search" />} size="lg">
            Voir les établissements
          </Button>
        }
        description="Des professionnels près de chez vous, des prix affichés à l'avance."
        title="Tout ce qu'il lui faut"
      />
      <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
        <div
          className={cn(
            "relative min-h-72 rounded-4xl p-3 transition-colors duration-300",
            activityMeta[shown].tint
          )}
        >
          <Photo
            alt=""
            className="size-full min-h-66 rounded-3xl"
            key={shown}
            sizes="(min-width: 768px) 40vw, 100vw"
            src={explorePhotos.tiles[shown]}
          />
          <span
            className={cn(
              "absolute bottom-7 left-7 flex items-center gap-2 rounded-full px-4 py-2 font-semibold",
              activityMeta[shown].tint
            )}
          >
            <HugeiconsIcon className="size-5" icon={activityIcons[shown]} />
            {shown}
          </span>
        </div>
        <ul className="space-y-1 rounded-4xl bg-muted p-2 md:p-3">
          {activityNames.map((a) => {
            const price = minFrom(a)
            const count = venues.filter((v) => v.activities.includes(a)).length
            return (
              <li key={a}>
                <Link
                  className={cn(
                    "group flex items-center gap-4 rounded-3xl p-4 transition-colors md:p-6",
                    shown === a ? "bg-background" : "hover:bg-background"
                  )}
                  href={`/search?activity=${encodeURIComponent(a)}`}
                  onFocus={() => setShown(a)}
                  onMouseEnter={() => setShown(a)}
                >
                  <span
                    className={cn(
                      "flex size-14 shrink-0 items-center justify-center rounded-full",
                      activityMeta[a].tint
                    )}
                  >
                    <HugeiconsIcon className="size-6" icon={activityIcons[a]} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <span className="font-display text-3xl md:text-4xl">
                        {a}
                      </span>
                      {price !== undefined && (
                        <span>
                          <span className="text-muted-foreground">dès </span>
                          <span className="text-xl font-semibold">
                            {euros(price)}
                          </span>
                          <span className="text-muted-foreground">
                            {priceUnit[a]}
                          </span>
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-muted-foreground">
                      {descriptions[a]} · {count} adresses
                    </span>
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary group-hover:text-primary-foreground max-sm:hidden">
                    <HugeiconsIcon className="size-5" icon={ArrowRight01Icon} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function Nearby() {
  const [weekend, setWeekend] = useState(false)
  const list = weekend
    ? venues.filter((v) => v.weekend)
    : [...venues].sort((a, b) => a.distance - b.distance)
  return (
    <section className="space-y-8">
      <SectionTitle
        action={
          <>
            <button
              aria-pressed={!weekend}
              className={pill(!weekend)}
              onClick={() => setWeekend(false)}
              type="button"
            >
              Les plus proches
            </button>
            <button
              aria-pressed={weekend}
              className={pill(weekend)}
              onClick={() => setWeekend(true)}
              type="button"
            >
              Libres ce week-end
            </button>
          </>
        }
        description="Autour de Bordeaux"
        title="Près de chez vous"
      />
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
        {list.slice(0, 6).map((venue) => (
          <VenueCard
            className="w-72 shrink-0 snap-start md:w-auto"
            key={venue.slug}
            venue={venue}
          />
        ))}
      </div>
    </section>
  )
}

/** Pourquoi passer par Kennelo : la liste à gauche, la photo encadrée à droite. */
function Why() {
  return (
    <section className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div className="space-y-8">
        <h2 className="font-display text-5xl text-balance md:text-6xl">
          Pourquoi passer par Kennelo ? <Paws className="text-4xl" />
        </h2>
        <ul className="space-y-6">
          {trust.map((t) => (
            <li className="flex gap-4" key={t.title}>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HugeiconsIcon className="size-6" icon={t.icon} />
              </span>
              <span>
                <span className="block text-lg font-semibold">{t.title}</span>
                <span className="block text-muted-foreground">{t.text}</span>
              </span>
            </li>
          ))}
        </ul>
        <Button render={<Link href="/search" />} size="xl">
          Trouver un établissement
        </Button>
      </div>
      <div className="relative">
        <Squiggle className="absolute -top-10 -right-6 w-40 md:w-56" />
        <div className="relative rounded-4xl bg-wise-pink p-3">
          <Photo
            alt="Un chien détendu"
            className="aspect-4/5 rounded-3xl"
            sizes="(min-width: 768px) 45vw, 100vw"
            src={explorePhotos.why}
          />
          <span className="absolute -bottom-5 left-8 flex items-center gap-2 rounded-full bg-wise-forest px-5 py-3 font-semibold text-wise-green shadow-lg">
            <HugeiconsIcon
              className="size-5 [&_path]:fill-current"
              icon={StarIcon}
            />
            {venues.length} établissements vérifiés
          </span>
        </div>
      </div>
    </section>
  )
}

/** Bandeau foncé ; les photos débordent en haut et en bas. */
function Band() {
  return (
    <section className="relative my-16 overflow-x-clip bg-wise-forest text-white md:my-36">
      <Squiggle className="absolute -top-8 right-[6%] w-44 md:w-64" />
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-[1fr_1.5fr_1fr] md:px-10 md:py-20">
        <div className="-rotate-3 rounded-4xl bg-wise-orange p-2.5 max-md:hidden md:-mt-40">
          <Photo
            alt=""
            className="aspect-square rounded-3xl"
            sizes="300px"
            src={explorePhotos.band[0]}
          />
        </div>
        <div className="space-y-6 text-center">
          <h2 className="font-display text-5xl text-balance text-wise-green md:text-7xl">
            Des nouvelles tous les jours
          </h2>
          <p className="text-lg text-white/80">
            Pendant le séjour, les pros envoient photos et petits mots. Vous les
            retrouvez dans « Leurs nouvelles ».
          </p>
          <Button render={<Link href="/search?activity=Pension" />} size="xl">
            Trouver une pension
          </Button>
        </div>
        <div className="rotate-3 rounded-4xl bg-wise-blue p-2.5 max-md:hidden md:-mb-40">
          <Photo
            alt=""
            className="aspect-square rounded-3xl"
            sizes="300px"
            src={explorePhotos.band[1]}
          />
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section className="space-y-8">
      <SectionTitle
        title={
          <>
            Ce qu&apos;en disent les propriétaires{" "}
            <Sparkle className="inline size-10 align-top" />
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr_1fr]">
        <div className="rounded-4xl bg-wise-yellow p-3">
          <Photo
            alt="Une propriétaire et son chien"
            className="aspect-4/3 h-full rounded-3xl md:aspect-auto md:min-h-80"
            sizes="(min-width: 768px) 35vw, 100vw"
            src={explorePhotos.hero[2]}
          />
        </div>
        {reviewPool.slice(0, 2).map((r) => (
          <figure
            className="flex flex-col justify-between gap-8 rounded-4xl bg-muted p-6 md:p-8"
            key={r.author}
          >
            <div className="space-y-4">
              <HugeiconsIcon
                className="size-9 text-link"
                icon={QuoteDownIcon}
              />
              <blockquote className="font-heading text-2xl leading-snug font-semibold text-pretty">
                {r.text}
              </blockquote>
            </div>
            <figcaption className="flex flex-wrap items-end justify-between gap-2">
              <span>
                <span className="block font-semibold">{r.author}</span>
                <span className="block text-muted-foreground">{r.pet}</span>
              </span>
              <Stars className="text-warning" n={r.rating} />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/** Les mieux notés en grandes cartes à leur couleur. */
function BestRated() {
  const best = [...venues].sort((a, b) => b.rating - a.rating).slice(0, 2)
  return (
    <section className="space-y-8">
      <SectionTitle
        action={
          <Button render={<Link href="/search" />} size="lg" variant="outline">
            Voir sur la carte
          </Button>
        }
        description="Les adresses que les propriétaires préfèrent"
        title="Les mieux notés"
      />
      <div className="grid gap-6 md:grid-cols-2">
        {best.map((v) => (
          <Link
            className={cn(
              "group block rounded-4xl p-3 transition-transform hover:scale-[0.99]",
              v.tone
            )}
            href={`/places/${v.slug}`}
            key={v.slug}
          >
            <VenueCover
              className="aspect-16/10"
              sizes="(min-width: 768px) 50vw, 100vw"
              venue={v}
            />
            <div className="space-y-4 p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="font-display text-4xl">{v.name}</p>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/60 px-3 py-1.5 font-semibold">
                  <HugeiconsIcon
                    className="size-4 [&_path]:fill-current"
                    icon={StarIcon}
                  />
                  {ratingText(v.rating)}
                </span>
              </div>
              <p className="text-lg">{v.tagline}</p>
              <ul className="space-y-2 font-semibold">
                {[
                  { icon: Location01Icon, text: v.address },
                  { icon: Clock01Icon, text: v.hours },
                ].map((row) => (
                  <li className="flex items-center gap-3" key={row.text}>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/60">
                      <HugeiconsIcon className="size-4" icon={row.icon} />
                    </span>
                    {row.text}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

const mosaicSpots = [
  "row-span-2",
  "md:col-span-2",
  "",
  "",
  "md:col-start-4 md:row-span-2 md:row-start-1",
]

/** Mosaïque de photos envoyées par les établissements. */
function Mosaic() {
  const shots = venues
    .flatMap((v) => (v.photos[1] ? [{ src: v.photos[1], venue: v }] : []))
    .slice(0, 5)
  return (
    <section className="space-y-8">
      <SectionTitle
        className="justify-center text-center [&_p]:mx-auto"
        description="Les établissements en partagent tous les jours"
        title="Ils passent du bon temps"
      />
      <div className="grid auto-rows-44 grid-cols-2 gap-3 md:h-136 md:grid-cols-4 md:grid-rows-2 md:gap-4">
        {shots.map(({ src, venue }, i) => (
          <Link
            className={cn(
              "group relative overflow-hidden rounded-4xl",
              mosaicSpots[i]
            )}
            href={`/places/${venue.slug}`}
            key={src}
          >
            <Photo
              alt={`Chez ${venue.name}`}
              className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 768px) 25vw, 50vw"
              src={src}
            />
            <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-background/90 px-3 py-1.5 text-sm font-semibold">
              chez {venue.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/** Dernier appel : trois activités en ronds de couleur, deux boutons. */
function Cta() {
  return (
    <section className="relative overflow-hidden rounded-4xl bg-wise-green p-8 text-wise-forest md:p-12">
      <Sparkle className="absolute top-6 right-6 size-14 text-wise-forest/30" />
      <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
        <div className="flex -space-x-6">
          {activityNames.map((a) => (
            <span
              className={cn(
                "size-28 rounded-full p-1.5 ring-6 ring-wise-green md:size-36",
                activityMeta[a].tint
              )}
              key={a}
            >
              <Photo
                alt=""
                className="size-full rounded-full"
                sizes="144px"
                src={explorePhotos.tiles[a]}
              />
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-6 text-center md:text-start">
          <h2 className="font-display text-5xl text-balance md:text-6xl">
            Sa prochaine visite, en trois minutes
          </h2>
          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <Button
              className="border-wise-forest bg-wise-forest text-wise-green hover:border-wise-forest hover:bg-wise-forest/90"
              render={<Link href="/search" />}
              size="xl"
            >
              Rechercher
            </Button>
            <Button
              className="border-transparent bg-white/60 text-wise-forest hover:bg-white/80"
              render={<Link href="/me/pets/new" />}
              size="xl"
            >
              Ajouter mon animal
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ExploreView() {
  return (
    <>
      <Hero />
      <SitePage className="space-y-20 md:space-y-28">
        <Greeting />
        <Services />
        <Nearby />
        <Why />
      </SitePage>
      <Band />
      <SitePage className="space-y-20 pt-0 md:space-y-28 md:pt-0">
        <Testimonials />
        <BestRated />
        <Mosaic />
        <Cta />
      </SitePage>
    </>
  )
}
