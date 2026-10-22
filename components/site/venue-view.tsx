"use client"

import {
  ArrowLeft01Icon,
  Calendar03Icon,
  Image01Icon,
  Clock01Icon,
  FlashIcon,
  InjectionIcon,
  Location01Icon,
  Message01Icon,
  SecurityCheckIcon,
  Share08Icon,
  StarIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import type { Activity } from "@/components/activity-mark"
import { formatDate } from "@/components/pets/data"
import {
  catalogIds,
  ratingText,
  reviewPool,
  scale,
  type Venue,
  venueOf,
} from "@/components/site/data"
import {
  ActivityPill,
  activityIcons,
  FavoriteButton,
  priceUnit,
  Rating,
  RowsCard,
  SectionHead,
  useFrom,
  Photo,
  PhotoDialog,
  VenueCover,
  VenueLogo,
  VenueMap,
} from "@/components/site/site-ui"
import {
  adjusted,
  euros,
  fromPrice,
  minutes,
  useCatalog,
} from "@/components/services/data"
import { notify } from "@/components/settings/settings-ui"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const chip =
  "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 font-semibold transition-colors"

function ActivityChips({
  venue,
  value,
  onChange,
}: {
  venue: Venue
  value: Activity
  onChange: (a: Activity) => void
}) {
  if (venue.activities.length < 2) return null
  return (
    <div className="flex flex-wrap gap-2">
      {venue.activities.map((a) => (
        <button
          aria-pressed={a === value}
          className={cn(
            chip,
            a === value
              ? "bg-control text-control-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-neutral-hover"
          )}
          key={a}
          onClick={() => onChange(a)}
          type="button"
        >
          <HugeiconsIcon className="size-5" icon={activityIcons[a]} />
          {a}
        </button>
      ))}
    </div>
  )
}

function PriceRow({
  title,
  description,
  price,
}: {
  title: string
  description?: string
  price: ReactNode
}) {
  return (
    <div className="flex min-h-16 items-center gap-4 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <p className="shrink-0 text-end">{price}</p>
    </div>
  )
}

/** Ce que l'établissement propose pour l'activité choisie, avec ses prix. */
export function Offers({ venue, activity }: { venue: Venue; activity: Activity }) {
  const catalog = useCatalog()
  const id = catalogIds[activity]
  const entries = (catalog.offers[id] ?? []).flatMap((offer) => {
    const service = catalog.services.find((s) => s.id === offer.serviceId)
    return offer.active && service?.active ? [{ offer, service }] : []
  })
  const main = entries.filter((e) => e.service.owner === id)
  const extras = entries.filter((e) => e.service.owner !== id)
  const priceOf = (e: (typeof entries)[number]) =>
    scale(venue, adjusted(fromPrice(e.service), e.offer.adjust))
  const from = (n: number, unit = "") => (
    <>
      <span className="text-muted-foreground">dès </span>
      <span className="text-lg font-semibold">{euros(n)}</span>
      {unit && <span className="text-muted-foreground">{unit}</span>}
    </>
  )

  if (activity === "Pension") {
    const base = catalog.rates.pension?.find((r) => r.periodId === "base")
    const places = (catalog.places.pension ?? []).filter(
      (p) => !venue.places || venue.places.includes(p.name)
    )
    const seasons = (catalog.rates.pension ?? []).flatMap((r) => {
      const period = catalog.periods.find((p) => p.id === r.periodId)
      return period && !period.base && r.active ? [{ period, rate: r }] : []
    })
    return (
      <div className="space-y-6">
        <RowsCard>
          {places.map((p) => (
            <PriceRow
              description={`${p.animals > 1 ? `Jusqu'à ${p.animals} animaux` : "1 animal"} · ${p.species.join(", ")}`}
              key={p.name}
              price={from(
                scale(venue, base?.places[p.name]?.price ?? 0),
                " / nuit"
              )}
              title={p.name}
            />
          ))}
        </RowsCard>
        {seasons.length > 0 && (
          <p className="text-muted-foreground">
            Les prix changent pendant{" "}
            {seasons.map(({ period, rate }, i) => (
              <span key={period.id}>
                {i > 0 && (i === seasons.length - 1 ? " et " : ", ")}
                <span className="font-semibold text-foreground">
                  {period.name}
                </span>
                {rate.percent ? ` (+${rate.percent} %)` : ""}
              </span>
            ))}
            .
          </p>
        )}
        {entries.length > 0 && (
          <div className="space-y-3">
            <p className="text-lg font-semibold">Options à ajouter au séjour</p>
            <RowsCard>
              {entries.map((e) => (
                <PriceRow
                  description={e.service.description}
                  key={e.service.id}
                  price={
                    e.offer.included ? (
                      <span className="font-semibold text-success-foreground">
                        Inclus
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold">
                          {euros(priceOf(e))}
                        </span>
                        <span className="text-muted-foreground">
                          {e.offer.perNight ? " / nuit" : ""}
                        </span>
                      </>
                    )
                  }
                  title={e.service.name}
                />
              ))}
            </RowsCard>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RowsCard>
        {main.map((e) => (
          <PriceRow
            description={[
              minutes(Math.min(...e.service.grid.map((r) => r.duration))),
              e.service.description,
            ]
              .filter(Boolean)
              .join(" · ")}
            key={e.service.id}
            price={from(priceOf(e))}
            title={e.service.name}
          />
        ))}
      </RowsCard>
      {extras.length > 0 && (
        <div className="space-y-3">
          <p className="text-lg font-semibold">Aussi proposé</p>
          <RowsCard>
            {extras.map((e) => (
              <PriceRow
                key={e.service.id}
                price={from(priceOf(e))}
                title={e.service.name}
              />
            ))}
          </RowsCard>
        </div>
      )}
    </div>
  )
}

/** Une grande photo et quatre petites ; toutes en grand d'un clic. */
function Gallery({ venue }: { venue: Venue }) {
  const [open, setOpen] = useState(false)
  if (!venue.photos.length)
    return <VenueCover className="h-56 w-full md:h-96" venue={venue} />
  return (
    <div className="relative">
      <div className="grid h-64 gap-2 overflow-hidden rounded-3xl md:h-[26rem] md:grid-cols-4 md:grid-rows-2">
        {venue.photos.slice(0, 5).map((p, i) => (
          <button
            aria-label={`Voir les photos de ${venue.name}`}
            className={cn(
              "relative transition-opacity hover:opacity-90",
              i === 0 ? "md:col-span-2 md:row-span-2" : "max-md:hidden"
            )}
            key={p}
            onClick={() => setOpen(true)}
            type="button"
          >
            <Photo
              alt={`${venue.name}, photo ${i + 1}`}
              className="absolute inset-0"
              sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "25vw"}
              src={p}
            />
          </button>
        ))}
      </div>
      <Button
        className="absolute right-4 bottom-4 border-transparent shadow-md"
        onClick={() => setOpen(true)}
        variant="outline"
      >
        <HugeiconsIcon icon={Image01Icon} />
        Voir les {venue.photos.length} photos
      </Button>
      <PhotoDialog
        onOpenChange={setOpen}
        open={open}
        photos={venue.photos}
        title={venue.name}
      />
    </div>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <HugeiconsIcon
          className={cn(
            "size-4",
            i < n ? "[&_path]:fill-current" : "text-muted-foreground/40"
          )}
          icon={StarIcon}
          key={i}
        />
      ))}
    </span>
  )
}

export function VenueView({ slug }: { slug: string }) {
  const venue = venueOf(slug)!
  const from = useFrom()
  const [activity, setActivity] = useState<Activity>(venue.activities[0])
  const price = from(venue, activity)
  const bookHref = `/book/${venue.slug}?activity=${encodeURIComponent(activity)}`
  const reviews = reviewPool
  const facts = [
    { icon: Clock01Icon, text: venue.hours, title: "Horaires" },
    ...(venue.activities.includes("Pension")
      ? [
          {
            icon: InjectionIcon,
            text: "Chien : CHPPiL et toux du chenil · Chat : typhus et coryza",
            title: "Vaccins demandés en pension",
          },
        ]
      : []),
    {
      icon: Calendar03Icon,
      text: "Gratuite jusqu'à 48 h avant l'arrivée",
      title: "Annulation",
    },
    {
      icon: venue.instant ? FlashIcon : Message01Icon,
      text: venue.instant
        ? "Confirmée tout de suite, payée en ligne"
        : `Sur demande : vous payez une fois acceptée · ${venue.response}`,
      title: "Réservation",
    },
  ]

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-10 md:py-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button
            aria-label="Retour"
            render={<Link href="/search" />}
            size="icon"
            variant="secondary"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <div className="flex gap-2">
            <Button onClick={() => notify("Lien copié")} variant="secondary">
              <HugeiconsIcon icon={Share08Icon} />
              Partager
            </Button>
            <FavoriteButton
              className="bg-secondary hover:bg-neutral-hover"
              slug={venue.slug}
            />
          </div>
        </div>

        <Gallery venue={venue} />

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-12">
            <header className="space-y-4">
              <VenueLogo
                className="relative z-10 -mt-20 size-20 border-4 border-background text-3xl md:-mt-24 md:size-24 md:text-4xl"
                venue={venue}
              />
              <h1 className="font-display text-5xl md:text-7xl">
                {venue.name}
              </h1>
              <p className="text-xl text-balance">{venue.tagline}</p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
                <Rating className="text-foreground" venue={venue} />·
                <span>{venue.city}</span>·
                <span>{String(venue.distance).replace(".", ",")} km</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {venue.activities.map((a) => (
                  <ActivityPill activity={a} key={a} />
                ))}
              </div>
            </header>

            <section className="space-y-4">
              <SectionHead
                description="Tarifs indicatifs, le prix exact est calculé à la réservation"
                title="Prestations et prix"
              />
              <ActivityChips
                onChange={setActivity}
                value={activity}
                venue={venue}
              />
              <Offers activity={activity} venue={venue} />
            </section>

            <section className="space-y-4">
              <SectionHead title="À propos" />
              <p className="text-lg">{venue.about}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {venue.highlights.map((h) => (
                  <li className="flex items-center gap-3" key={h}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <HugeiconsIcon className="size-4" icon={Tick02Icon} />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-4 rounded-3xl bg-muted p-5">
                <Avatar className="size-14">
                  <AvatarFallback className="bg-background text-lg font-semibold">
                    {venue.owner
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Tenu par {venue.owner}</p>
                  <p className="text-sm text-muted-foreground">
                    Sur Kennelo depuis {venue.since} · {venue.response}
                  </p>
                </div>
                <Button
                  className="max-sm:hidden"
                  render={<Link href={`/me/messages?venue=${venue.slug}`} />}
                  variant="secondary"
                >
                  Écrire
                </Button>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHead title="Bon à savoir" />
              <RowsCard>
                {facts.map((f) => (
                  <div
                    className="flex min-h-16 items-center gap-4 px-5 py-4"
                    key={f.title}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <HugeiconsIcon className="size-5" icon={f.icon} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">{f.title}</p>
                      <p className="text-sm text-muted-foreground">{f.text}</p>
                    </div>
                  </div>
                ))}
              </RowsCard>
            </section>

            <section className="space-y-6">
              <div className="flex items-end gap-4">
                <p className="font-display text-7xl">
                  {ratingText(venue.rating)}
                </p>
                <div className="pb-1">
                  <Stars n={Math.round(venue.rating)} />
                  <p className="mt-1 text-muted-foreground">
                    {venue.reviews} avis de propriétaires
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((r) => (
                  <div
                    className="space-y-3 rounded-3xl bg-muted p-5"
                    key={r.author}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-background font-semibold">
                          {r.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{r.author}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {r.pet} · {formatDate(r.date)}
                        </p>
                      </div>
                    </div>
                    <Stars n={r.rating} />
                    <p>{r.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <SectionHead title="Où se trouve l'établissement" />
              <VenueMap
                active={venue.slug}
                className="h-64"
                items={[{ venue }]}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2">
                  <HugeiconsIcon className="size-5" icon={Location01Icon} />
                  {venue.address}
                </p>
                <Button variant="secondary">Itinéraire</Button>
              </div>
            </section>
          </div>

          <aside className="h-fit space-y-5 rounded-3xl border bg-card p-6 max-lg:hidden lg:sticky lg:top-28">
            {price !== undefined && (
              <p>
                <span className="text-muted-foreground">Dès </span>
                <span className="text-3xl font-semibold">{euros(price)}</span>
                <span className="text-muted-foreground">
                  {priceUnit[activity]}
                </span>
              </p>
            )}
            <ActivityChips
              onChange={setActivity}
              value={activity}
              venue={venue}
            />
            <Button
              className="w-full"
              render={<Link href={bookHref} />}
              size="xl"
            >
              Réserver
            </Button>
            <ul className="space-y-3">
              {[
                {
                  icon: venue.instant ? FlashIcon : Message01Icon,
                  text: venue.instant
                    ? "Confirmation immédiate"
                    : `Sur demande · ${venue.response}`,
                },
                {
                  icon: Calendar03Icon,
                  text: "Annulation gratuite jusqu'à 48 h avant",
                },
                { icon: SecurityCheckIcon, text: "Paiement sécurisé" },
              ].map((item) => (
                <li className="flex items-center gap-3" key={item.text}>
                  <HugeiconsIcon
                    className="size-5 shrink-0 text-muted-foreground"
                    icon={item.icon}
                  />
                  {item.text}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              render={<Link href={`/me/messages?venue=${venue.slug}`} />}
              variant="secondary"
            >
              Poser une question
            </Button>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        {price !== undefined && (
          <p className="min-w-0">
            <span className="block text-sm text-muted-foreground">
              {activity}
            </span>
            <span className="text-xl font-semibold">Dès {euros(price)}</span>
            <span className="text-muted-foreground">{priceUnit[activity]}</span>
          </p>
        )}
        <Button render={<Link href={bookHref} />} size="lg">
          Réserver
        </Button>
      </div>
    </>
  )
}
