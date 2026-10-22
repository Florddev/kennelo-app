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
import { type Activity, activityNames } from "@/components/activity-mark"
import { venues } from "@/components/site/data"
import {
  ActivityPill,
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
  "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 font-semibold transition-colors"
const chipOn = "bg-control text-control-foreground"
const chipOff = "bg-secondary text-secondary-foreground hover:bg-neutral-hover"

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
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-10 md:py-8">
      <div className="space-y-4">
        <label className="flex h-14 items-center gap-3 rounded-full border bg-card px-5 shadow-xs focus-within:ring-2 focus-within:ring-ring">
          <HugeiconsIcon
            className="size-5 shrink-0 text-muted-foreground"
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
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
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
              {a}
            </button>
          ))}
          <span className="mx-1 w-px shrink-0 bg-border" />
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

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className={cn("space-y-4", mapOnMobile && "max-lg:hidden")}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="font-heading text-2xl font-semibold">
              {results.length} établissement{results.length > 1 && "s"}
              <span className="font-normal text-muted-foreground">
                {" "}
                autour de Bordeaux
              </span>
            </h1>
            <Menu>
              <MenuTrigger render={<Button variant="secondary" />}>
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
            <Empty className="rounded-3xl bg-muted py-16">
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
              className="relative flex gap-4 rounded-3xl border bg-card p-3 transition-colors hover:bg-accent"
              key={venue.slug}
              onMouseEnter={() => setHover(venue.slug)}
              onMouseLeave={() => setHover(null)}
            >
              <Link
                aria-label={venue.name}
                className="absolute inset-0 z-0 rounded-3xl"
                href={`/places/${venue.slug}`}
              />
              <VenueCover
                className="size-28 shrink-0 rounded-2xl md:size-40"
                venue={venue}
              />
              <FavoriteButton
                className="absolute top-5 left-5 z-10 size-8"
                slug={venue.slug}
              />
              <div className="pointer-events-none flex min-w-0 flex-1 flex-col py-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-lg font-semibold">{venue.name}</p>
                  <Rating className="mt-0.5" venue={venue} />
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {venue.city} · {String(venue.distance).replace(".", ",")} km ·{" "}
                  {venue.response}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 max-md:hidden">
                  {venue.activities.map((a) => (
                    <ActivityPill activity={a} key={a} />
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 pt-2">
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    {venue.instant && (
                      <HugeiconsIcon className="size-4" icon={FlashIcon} />
                    )}
                    {venue.instant ? "Réservation immédiate" : "Sur demande"}
                  </p>
                  {price !== undefined && (
                    <p>
                      <span className="text-lg font-semibold">
                        Dès {euros(price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
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
            "h-[70svh] lg:sticky lg:top-28 lg:h-[calc(100svh-9rem)]",
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
  )
}
