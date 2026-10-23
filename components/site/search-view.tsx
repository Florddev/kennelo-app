"use client"

import {
  Cancel01Icon,
  FlashIcon,
  MapsIcon,
  Menu01Icon,
  Search01Icon,
  SortingDownIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import {
  type Activity,
  activityMeta,
  activityNames,
} from "@/components/activity-mark"
import { venues } from "@/components/site/data"
import { Paws, Sparkle } from "@/components/site/doodles"
import {
  ActivityPill,
  activityIcons,
  FavoriteButton,
  priceUnit,
  Rating,
  useFrom,
  VenueCover,
  VenueMap,
} from "@/components/site/site-ui"
import { euros } from "@/components/services/data"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@/components/ui/menu"
import { cn } from "@/lib/utils"

const sorts = {
  distance: "Les plus proches",
  price: "Les moins chers",
  rating: "Les mieux notés",
} as const

type Sort = keyof typeof sorts

const plain = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const chip =
  "flex h-12 shrink-0 items-center gap-2 rounded-full px-5 font-semibold transition-colors"
const chipOn = "bg-control text-control-foreground"
/** Sur le bandeau coloré. */
const chipOff = "bg-white/60 hover:bg-white/85"

export function SearchView({
  initialActivity,
  initialQuery = "",
}: {
  initialActivity?: Activity
  initialQuery?: string
}) {
  const from = useFrom()
  const [activity, setActivity] = useState<Activity | null>(
    initialActivity ?? null
  )
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<string[]>([])
  const [sort, setSort] = useState<Sort>("distance")
  const [hover, setHover] = useState<string | null>(null)
  const [mapOnMobile, setMapOnMobile] = useState(false)

  const toggles = [
    { id: "cats", label: "Chats acceptés" },
    { id: "instant", label: "Réservation immédiate" },
    { id: "weekend", label: "Libre ce week-end" },
  ]
  const toggle = (id: string) =>
    setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  const results = venues
    .filter((v) => !activity || v.activities.includes(activity))
    .filter(
      (v) =>
        !query ||
        plain(`${v.name} ${v.city} ${v.address} ${v.tagline}`).includes(
          plain(query)
        )
    )
    .filter((v) => !filters.includes("cats") || v.species.includes("Chat"))
    .filter((v) => !filters.includes("instant") || v.instant)
    .filter((v) => !filters.includes("weekend") || v.weekend)
    .map((venue) => {
      const shown = activity ?? venue.activities[0]
      return { price: from(venue, shown), shown, venue }
    })
    .sort((a, b) =>
      sort === "distance"
        ? a.venue.distance - b.venue.distance
        : sort === "rating"
          ? b.venue.rating - a.venue.rating
          : (a.price ?? 0) - (b.price ?? 0)
    )

  const reset = () => {
    setQuery("")
    setFilters([])
    setActivity(null)
  }

  return (
    <>
      <section
        className={cn(
          "transition-colors duration-300",
          activity ? activityMeta[activity].tint : "bg-muted"
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-8 md:px-10 md:pt-14 md:pb-10">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h1 className="font-display text-6xl md:text-8xl">
              {activity ?? "Tous les lieux"}
              <Sparkle className="ms-2 inline size-10 align-top text-current opacity-40 md:size-14" />
            </h1>
            <p className="pb-2 text-lg font-semibold">Autour de Bordeaux</p>
          </div>
          <label className="mt-6 flex h-16 items-center gap-3 rounded-full bg-background px-6 text-foreground shadow-lg focus-within:ring-2 focus-within:ring-ring">
            <HugeiconsIcon
              className="size-6 shrink-0 text-muted-foreground"
              icon={Search01Icon}
            />
            <input
              aria-label="Rechercher"
              className="h-full min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-placeholder"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ville, code postal ou nom"
              value={query}
            />
            {query && (
              <Button
                aria-label="Effacer"
                onClick={() => setQuery("")}
                size="icon-sm"
                variant="ghost"
              >
                <HugeiconsIcon icon={Cancel01Icon} />
              </Button>
            )}
          </label>
          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            <button
              aria-pressed={!activity}
              className={cn(chip, !activity ? chipOn : chipOff)}
              onClick={() => setActivity(null)}
              type="button"
            >
              Tout
            </button>
            {activityNames.map((a) => (
              <button
                aria-pressed={activity === a}
                className={cn(chip, activity === a ? chipOn : chipOff)}
                key={a}
                onClick={() => setActivity(a)}
                type="button"
              >
                <HugeiconsIcon className="size-5" icon={activityIcons[a]} />
                {a}
              </button>
            ))}
            <span className="mx-1 w-px shrink-0 bg-current opacity-15" />
            {toggles.map((t) => {
              const on = filters.includes(t.id)
              return (
                <button
                  aria-pressed={on}
                  className={cn(chip, on ? chipOn : chipOff)}
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  type="button"
                >
                  {on && <HugeiconsIcon className="size-4" icon={Tick02Icon} />}
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-10 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <div className={cn("space-y-4", mapOnMobile && "max-lg:hidden")}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-3xl">
                {results.length} établissement{results.length > 1 && "s"}
              </p>
              <Menu>
                <MenuTrigger render={<Button size="lg" variant="secondary" />}>
                  <HugeiconsIcon icon={SortingDownIcon} />
                  {sorts[sort]}
                </MenuTrigger>
                <MenuPopup align="end">
                  <MenuRadioGroup
                    onValueChange={(v) => setSort(v as Sort)}
                    value={sort}
                  >
                    {(Object.keys(sorts) as Sort[]).map((s) => (
                      <MenuRadioItem key={s} value={s}>
                        {sorts[s]}
                      </MenuRadioItem>
                    ))}
                  </MenuRadioGroup>
                </MenuPopup>
              </Menu>
            </div>

            {results.length === 0 && (
              <Empty className="rounded-4xl bg-muted py-16">
                <Paws className="text-5xl" />
                <EmptyHeader>
                  <EmptyTitle>Aucun établissement ne correspond</EmptyTitle>
                  <EmptyDescription>
                    Essayez une autre ville ou retirez des filtres.
                  </EmptyDescription>
                </EmptyHeader>
                <Button onClick={reset}>Tout effacer</Button>
              </Empty>
            )}

            {results.map(({ venue, price, shown }) => (
              <div
                className="relative flex gap-4 rounded-4xl bg-muted p-3 transition-colors hover:bg-neutral-hover md:gap-5"
                key={venue.slug}
                onMouseEnter={() => setHover(venue.slug)}
                onMouseLeave={() => setHover(null)}
              >
                <Link
                  aria-label={venue.name}
                  className="absolute inset-0 z-0 rounded-4xl"
                  href={`/places/${venue.slug}`}
                />
                <div className={cn("shrink-0 rounded-3xl p-1.5", venue.tone)}>
                  <VenueCover
                    className="size-28 rounded-[1.25rem] md:size-44"
                    venue={venue}
                  />
                </div>
                <FavoriteButton
                  className="absolute top-6 left-6 z-10 size-8"
                  slug={venue.slug}
                />
                <div className="pointer-events-none flex min-w-0 flex-1 flex-col py-2 pe-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-display text-3xl md:text-4xl">
                      {venue.name}
                    </p>
                    <Rating
                      className="shrink-0 rounded-full bg-background px-3 py-1"
                      venue={venue}
                    />
                  </div>
                  <p className="truncate text-muted-foreground">
                    {venue.city} · {String(venue.distance).replace(".", ",")} km
                    · {venue.response}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 max-md:hidden">
                    {venue.activities.map((a) => (
                      <ActivityPill activity={a} key={a} />
                    ))}
                  </div>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 pt-3">
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      {venue.instant && (
                        <HugeiconsIcon className="size-4" icon={FlashIcon} />
                      )}
                      {venue.instant ? "Réservation immédiate" : "Sur demande"}
                    </p>
                    {price !== undefined && (
                      <p>
                        <span className="text-muted-foreground">dès </span>
                        <span className="text-xl font-semibold">
                          {euros(price)}
                        </span>
                        <span className="text-muted-foreground">
                          {priceUnit[shown]}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <VenueMap
            active={hover}
            className={cn(
              "h-[70svh] rounded-4xl lg:sticky lg:top-28 lg:h-[calc(100svh-9rem)]",
              !mapOnMobile && "max-lg:hidden"
            )}
            items={results.map(({ venue, price }) => ({ price, venue }))}
          />
        </div>

        <Button
          className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 bg-control text-control-foreground shadow-lg hover:bg-control/90 lg:hidden"
          onClick={() => setMapOnMobile((m) => !m)}
          size="lg"
        >
          <HugeiconsIcon icon={mapOnMobile ? Menu01Icon : MapsIcon} />
          {mapOnMobile ? "Liste" : "Carte"}
        </Button>
      </div>
    </>
  )
}
