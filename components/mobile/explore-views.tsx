"use client"

import {
  Airplane01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Clock01Icon,
  FilterHorizontalIcon,
  FlashIcon,
  HelpCircleIcon,
  Image01Icon,
  Location01Icon,
  MapsIcon,
  Message01Icon,
  PawPrintIcon,
  PencilEdit02Icon,
  Search01Icon,
  Share08Icon,
  StarIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type ReactNode, useState } from "react"
import {
  type Activity,
  activityMeta,
  activityNames,
} from "@/components/activity-mark"
import {
  ChoiceRow,
  FlowMedia,
  FlowPage,
  FlowScreen,
  useSteps,
} from "@/components/flow/flow"
import {
  BottomBar,
  Carousel,
  chip,
  chipOff,
  chipOn,
  IconDot,
  MobileVenueCard,
  RoundButton,
  Row,
  Rows,
  Section,
  Segmented,
  TabHeader,
  TopBar,
} from "@/components/mobile/mobile-ui"
import {
  explorePhotos,
  ratingText,
  reviewPool,
  useSite,
  type Venue,
  venueOf,
  venues,
} from "@/components/site/data"
import {
  activityIcons,
  FavoriteButton,
  PetAvatar,
  Photo,
  PhotoDialog,
  priceUnit,
  useFrom,
  VenueCover,
  VenueLogo,
  VenueMap,
} from "@/components/site/site-ui"
import { Offers } from "@/components/site/venue-view"
import { dayMonth, euros } from "@/components/services/data"
import { notify, RadioDot } from "@/components/settings/settings-ui"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const activityText: Record<Activity, string> = {
  Éducation: "Cours, rappel, comportement",
  Pension: "Garde de jour comme de nuit",
  Toilettage: "Bain, coupe, griffes",
}

const km = (v: Venue) => `${String(v.distance).replace(".", ",")} km`

/* ——— Explorer ——— */

export function MobileExplore() {
  const nearest = [...venues].sort((a, b) => a.distance - b.distance)
  const best = [...venues].sort((a, b) => b.rating - a.rating)
  const instant = venues.filter((v) => v.instant)
  const carousel = (list: Venue[]) => (
    <Carousel>
      {list.map((v) => (
        <MobileVenueCard
          className="w-72 shrink-0 snap-start"
          key={v.slug}
          venue={v}
        />
      ))}
    </Carousel>
  )

  return (
    <div className="space-y-8">
      <TabHeader title="Explorer" />

      <div className="px-4">
        <Link
          className="flex min-h-14 items-center gap-3 rounded-full bg-secondary px-5 text-muted-foreground"
          href="/mobile/search"
        >
          <HugeiconsIcon
            className="size-6 text-foreground"
            icon={Search01Icon}
          />
          Nom, ville, activité…
        </Link>
      </div>

      <div className="mx-4 rounded-3xl bg-wise-forest p-6 text-wise-green">
        <p className="font-display text-5xl">On vous guide</p>
        <p className="mt-3 text-lg text-white/90">
          Trois questions, et on vous montre les établissements faits pour votre
          animal.
        </p>
        <Link
          className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-full bg-wise-green text-lg font-semibold text-wise-forest"
          href="/mobile/explore/find"
        >
          C&apos;est parti
          <HugeiconsIcon className="size-5" icon={ArrowRight01Icon} />
        </Link>
      </div>

      <Section title="Par activité">
        <div className="space-y-3 px-4">
          {activityNames.map((a) => (
            <Link
              className={cn(
                "flex min-h-24 items-center gap-4 rounded-3xl p-2 pe-5 transition-transform active:scale-[0.98]",
                activityMeta[a].tint
              )}
              href={`/mobile/explore/find?activity=${encodeURIComponent(a)}`}
              key={a}
            >
              <Photo
                alt=""
                className="size-20 shrink-0 rounded-2xl"
                sizes="80px"
                src={explorePhotos.tiles[a]}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-3xl">{a}</span>
                <span className="block font-semibold opacity-80">
                  {activityText[a]}
                </span>
              </span>
              <HugeiconsIcon className="size-6" icon={ArrowRight01Icon} />
            </Link>
          ))}
        </div>
      </Section>

      <Section href="/mobile/search?sort=near" title="Près de chez vous">
        {carousel(nearest)}
      </Section>
      <Section href="/mobile/search?sort=rating" title="Les mieux notés">
        {carousel(best)}
      </Section>
      <Section href="/mobile/search?instant=1" title="Réservation immédiate">
        {carousel(instant)}
      </Section>
    </div>
  )
}
/* ——— Recherche guidée : trois questions ——— */

export type FindStep = "activity" | "pet" | "when"

const whenOptions: {
  icon: IconSvgElement
  label: string
  description: string
  value: string
}[] = [
  {
    description: "Cette semaine",
    icon: FlashIcon,
    label: "Dès que possible",
    value: "asap",
  },
  {
    description: "Samedi ou dimanche",
    icon: Calendar03Icon,
    label: "Un week-end",
    value: "weekend",
  },
  {
    description: "Plusieurs jours d'affilée",
    icon: Airplane01Icon,
    label: "Pendant les vacances",
    value: "holidays",
  },
  {
    description: "Je regarde, simplement",
    icon: HelpCircleIcon,
    label: "Je ne sais pas encore",
    value: "later",
  },
]

const tile =
  "w-full rounded-3xl text-start transition-transform active:scale-[0.98]"

export function GuidedSearch({
  initial,
}: {
  initial: { activity?: Activity; pet?: string; step?: FindStep }
}) {
  const router = useRouter()
  const { pets } = useSite()
  const steps = useSteps<FindStep>(
    initial.step ?? (initial.activity ? "pet" : "activity")
  )
  const [activity, setActivity] = useState(initial.activity)
  const [pet, setPet] = useState(initial.pet)
  const order: FindStep[] = ["activity", "pet", "when"]
  const finish = (when: string) => {
    const params = new URLSearchParams({ when })
    if (activity) params.set("activity", activity)
    if (pet) params.set("pet", pet)
    router.push(`/mobile/search?${params}`)
  }

  return (
    <FlowPage
      closeHref="/mobile/explore"
      mobile
      progress={(order.indexOf(steps.step) + 1) / order.length}
    >
      {steps.step === "activity" && (
        <FlowScreen
          eyebrow="Question 1 sur 3"
          title="De quoi a besoin votre animal ?"
        >
          <div className="space-y-3">
            {activityNames.map((a) => (
              <button
                aria-pressed={activity === a}
                className={cn(
                  tile,
                  "flex min-h-28 items-center gap-4 p-2 pe-5",
                  activityMeta[a].tint,
                  activity === a && "ring-4 ring-control"
                )}
                key={a}
                onClick={() => {
                  setActivity(a)
                  steps.next("pet")
                }}
                type="button"
              >
                <Photo
                  alt=""
                  className="size-24 shrink-0 rounded-2xl"
                  sizes="96px"
                  src={explorePhotos.tiles[a]}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-4xl">{a}</span>
                  <span className="block font-semibold opacity-80">
                    {activityText[a]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </FlowScreen>
      )}

      {steps.step === "pet" && (
        <FlowScreen
          description="On ne vous montre que les lieux qui l'accueillent."
          eyebrow="Question 2 sur 3"
          onBack={steps.back}
          title="Pour qui ?"
        >
          <div className="grid grid-cols-2 gap-3">
            {pets.map((p) => (
              <button
                aria-pressed={pet === p.id}
                className={cn(
                  tile,
                  "p-2",
                  p.tone,
                  pet === p.id && "ring-4 ring-control"
                )}
                key={p.id}
                onClick={() => {
                  setPet(p.id)
                  steps.next("when")
                }}
                type="button"
              >
                {p.photo ? (
                  <Photo
                    alt=""
                    className="aspect-square rounded-2xl"
                    sizes="200px"
                    src={p.photo}
                  />
                ) : (
                  <span className="flex aspect-square items-center justify-center rounded-2xl bg-white/40 font-display text-6xl">
                    {p.name[0]}
                  </span>
                )}
                <span className="block truncate px-2 pt-3 pb-1 font-display text-3xl">
                  {p.name}
                </span>
              </button>
            ))}
            <button
              className={cn(
                tile,
                "flex min-h-48 flex-col items-center justify-center gap-3 border-2 border-dashed p-4 text-center text-lg font-semibold"
              )}
              onClick={() => {
                setPet(undefined)
                steps.next("when")
              }}
              type="button"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
                <HugeiconsIcon className="size-6" icon={PawPrintIcon} />
              </span>
              Un autre animal
            </button>
          </div>
        </FlowScreen>
      )}

      {steps.step === "when" && (
        <FlowScreen
          description="Vous choisirez les dates exactes ensuite."
          eyebrow="Question 3 sur 3"
          onBack={steps.back}
          title="Pour quand ?"
        >
          <div className="space-y-2">
            {whenOptions.map((o) => (
              <ChoiceRow
                description={o.description}
                key={o.value}
                media={
                  <FlowMedia>
                    <HugeiconsIcon icon={o.icon} />
                  </FlowMedia>
                }
                onClick={() => finish(o.value)}
                title={o.label}
              />
            ))}
          </div>
        </FlowScreen>
      )}
    </FlowPage>
  )
}

/* ——— Résultats ——— */

type Sort = "near" | "rating" | "price"

const sortLabels: Record<Sort, string> = {
  near: "Les plus proches",
  price: "Les moins chers",
  rating: "Les mieux notés",
}

function Stars({ venue }: { venue: Venue }) {
  return (
    <span className="flex items-center gap-1">
      <HugeiconsIcon
        className="size-4 text-foreground [&_path]:fill-current"
        icon={StarIcon}
      />
      <span className="font-semibold text-foreground">
        {ratingText(venue.rating)}
      </span>
      ({venue.reviews})
    </span>
  )
}

/** Ligne de résultat : la photo à gauche, l'essentiel à droite. */
function ResultRow({ venue, activity }: { venue: Venue; activity?: Activity }) {
  const from = useFrom()
  const shown =
    activity && venue.activities.includes(activity)
      ? activity
      : venue.activities[0]
  const price = from(venue, shown)
  return (
    <Link
      className="flex gap-4 py-4 transition-opacity active:opacity-70"
      href={`/mobile/places/${venue.slug}`}
    >
      <VenueCover
        className="size-28 shrink-0 rounded-2xl"
        sizes="112px"
        venue={venue}
      />
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block truncate text-lg font-semibold">
          {venue.name}
        </span>
        <span className="flex flex-wrap items-center gap-x-1.5 text-muted-foreground">
          <Stars venue={venue} />· {km(venue)}
        </span>
        {price !== undefined && (
          <span className="block">
            <span className="font-semibold">Dès {euros(price)}</span>
            <span className="text-muted-foreground">{priceUnit[shown]}</span>
          </span>
        )}
        {venue.instant && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-sm font-semibold text-primary-foreground">
            <HugeiconsIcon className="size-3.5" icon={FlashIcon} />
            Réservation immédiate
          </span>
        )}
      </span>
    </Link>
  )
}

/** Le lieu qui répond le mieux aux réponses, mis en avant. */
function BestMatch({
  venue,
  activity,
  reasons,
}: {
  venue: Venue
  activity?: Activity
  reasons: string[]
}) {
  const from = useFrom()
  const shown =
    activity && venue.activities.includes(activity)
      ? activity
      : venue.activities[0]
  const price = from(venue, shown)
  return (
    <section className="mx-4 overflow-hidden rounded-3xl bg-wise-forest text-wise-green">
      <Link className="block" href={`/mobile/places/${venue.slug}`}>
        <VenueCover
          className="h-44 rounded-none"
          logo
          sizes="448px"
          venue={venue}
        />
      </Link>
      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="font-semibold">Notre conseil</p>
          <Link
            className="block font-display text-5xl"
            href={`/mobile/places/${venue.slug}`}
          >
            {venue.name}
          </Link>
          <p className="text-white/85">
            {ratingText(venue.rating)} sur 5 · {venue.city} · {km(venue)}
          </p>
        </div>
        <ul className="space-y-2">
          {reasons.map((r) => (
            <li className="flex items-start gap-3 text-white" key={r}>
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-wise-green text-wise-forest">
                <HugeiconsIcon
                  className="size-3.5"
                  icon={Tick02Icon}
                  strokeWidth={3}
                />
              </span>
              {r}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          {price !== undefined && (
            <p className="min-w-0 flex-1">
              <span className="block text-sm text-white/80">Dès</span>
              <span className="text-xl font-semibold">{euros(price)}</span>
              <span className="text-white/80">{priceUnit[shown]}</span>
            </p>
          )}
          <Link
            className="flex min-h-14 items-center rounded-full bg-wise-green px-7 text-lg font-semibold text-wise-forest"
            href={`/mobile/book/${venue.slug}${activity ? `?activity=${encodeURIComponent(activity)}` : ""}`}
          >
            Réserver
          </Link>
        </div>
      </div>
    </section>
  )
}

/** Une réponse de la recherche guidée, qu'on touche pour la changer. */
function AnswerChip({
  href,
  media,
  label,
}: {
  href: string
  media: ReactNode
  label: string
}) {
  return (
    <Link
      aria-label={`Modifier : ${label}`}
      className="flex min-h-11 items-center gap-2 rounded-full bg-secondary ps-1.5 pe-3 font-semibold"
      href={href}
    >
      {media}
      {label}
      <HugeiconsIcon
        className="size-4 text-muted-foreground"
        icon={PencilEdit02Icon}
      />
    </Link>
  )
}

const chipDot =
  "flex size-8 items-center justify-center rounded-full bg-background [&_svg]:size-4"

export function MobileSearch({
  initial,
}: {
  initial: {
    activity?: Activity
    pet?: string
    when?: string
    sort?: Sort
    instant?: boolean
  }
}) {
  const site = useSite()
  const from = useFrom()
  const guided = !!initial.when
  const [q, setQ] = useState("")
  const [activity, setActivity] = useState(initial.activity)
  const [instant, setInstant] = useState(
    !!initial.instant || initial.when === "asap"
  )
  const [weekend, setWeekend] = useState(initial.when === "weekend")
  const [top, setTop] = useState(false)
  const [sort, setSort] = useState<Sort>(initial.sort ?? "near")
  const [map, setMap] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const pet = site.pets.find((p) => p.id === initial.pet)
  const shownActivity = (v: Venue) =>
    activity && v.activities.includes(activity) ? activity : v.activities[0]
  const priceOf = (v: Venue) => from(v, shownActivity(v)) ?? 0
  const needle = q.trim().toLowerCase()
  const list = venues
    .filter(
      (v) =>
        (!activity || v.activities.includes(activity)) &&
        (!pet || v.species.includes(pet.species)) &&
        (!instant || v.instant) &&
        (!weekend || v.weekend) &&
        (!top || v.rating >= 4.8) &&
        (!needle ||
          `${v.name} ${v.city} ${v.activities.join(" ")}`
            .toLowerCase()
            .includes(needle))
    )
    .sort((a, b) =>
      sort === "near"
        ? a.distance - b.distance
        : sort === "rating"
          ? b.rating - a.rating
          : priceOf(a) - priceOf(b)
    )
  const score = (v: Venue) =>
    v.rating * 2 - v.distance / 10 + (v.instant ? 0.3 : 0)
  const best = guided
    ? [...list].sort((a, b) => score(b) - score(a))[0]
    : undefined
  const rest = list.filter((v) => v !== best)
  const reasons = (v: Venue) =>
    [
      pet &&
        `Accueille ${pet.species === "Chat" ? "les chats" : "les chiens"} comme ${pet.name}`,
      initial.when === "weekend" && v.weekend && "Ouvert le week-end",
      v.instant ? "Réservation immédiate, sans attendre" : v.response,
      `Noté ${ratingText(v.rating)} par ${v.reviews} propriétaires`,
    ].filter((r): r is string => !!r)
  const toggles = [
    { label: "Réservation immédiate", on: instant, set: setInstant },
    { label: "Ouvert le week-end", on: weekend, set: setWeekend },
    { label: "Note 4,8 et plus", on: top, set: setTop },
  ]
  const active = toggles.filter((t) => t.on).length
  const findHref = (step: FindStep) => {
    const params = new URLSearchParams({ step })
    if (activity) params.set("activity", activity)
    if (pet) params.set("pet", pet.id)
    return `/mobile/explore/find?${params}`
  }
  const count = `${list.length} établissement${list.length > 1 ? "s" : ""}`

  return (
    <div className="space-y-5 pb-6">
      <TopBar
        action={
          <RoundButton
            className={cn(map && chipOn)}
            icon={MapsIcon}
            label={map ? "Voir la liste" : "Voir la carte"}
            onClick={() => setMap(!map)}
          />
        }
        back="/mobile/explore"
        title={guided ? "Vos résultats" : "Rechercher"}
      />

      {guided ? (
        <div className="space-y-4 px-4">
          <h1 className="font-display text-5xl text-balance">
            {list.length
              ? `${list.length} lieu${list.length > 1 ? "x" : ""} pour ${pet?.name ?? "vous"}`
              : "Aucun lieu pour l'instant"}
          </h1>
          <div className="flex flex-wrap gap-2">
            {activity && (
              <AnswerChip
                href={findHref("activity")}
                label={activity}
                media={
                  <span className={cn(chipDot, activityMeta[activity].tint)}>
                    <HugeiconsIcon icon={activityIcons[activity]} />
                  </span>
                }
              />
            )}
            <AnswerChip
              href={findHref("pet")}
              label={pet?.name ?? "Un autre animal"}
              media={
                pet ? (
                  <PetAvatar className="size-8 p-0.5 text-sm" pet={pet} />
                ) : (
                  <span className={chipDot}>
                    <HugeiconsIcon icon={PawPrintIcon} />
                  </span>
                )
              }
            />
            <AnswerChip
              href={findHref("when")}
              label={
                whenOptions.find((o) => o.value === initial.when)?.label ??
                "Quand"
              }
              media={
                <span className={chipDot}>
                  <HugeiconsIcon icon={Clock01Icon} />
                </span>
              }
            />
          </div>
        </div>
      ) : (
        <>
          <label className="mx-4 flex min-h-14 items-center gap-3 rounded-full bg-secondary px-5 focus-within:ring-2 focus-within:ring-ring">
            <HugeiconsIcon className="size-6 shrink-0" icon={Search01Icon} />
            <span className="sr-only">Rechercher un établissement</span>
            <input
              autoFocus={!initial.activity && !initial.sort && !initial.instant}
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nom, ville, activité…"
              type="search"
              value={q}
            />
          </label>
          <Carousel className="gap-2">
            <button
              aria-pressed={!activity}
              className={cn(chip, !activity ? chipOn : chipOff)}
              onClick={() => setActivity(undefined)}
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
          </Carousel>
        </>
      )}

      <div className="flex items-center justify-between gap-3 px-4">
        <p aria-live="polite" className="min-w-0">
          {!guided && <span className="block font-semibold">{count}</span>}
          <span className="block text-sm text-muted-foreground">
            {sortLabels[sort]} d&apos;abord
          </span>
        </p>
        <button
          className={cn(chip, active ? chipOn : chipOff)}
          onClick={() => setFiltersOpen(true)}
          type="button"
        >
          <HugeiconsIcon className="size-5" icon={FilterHorizontalIcon} />
          Filtres{active ? ` · ${active}` : ""}
        </button>
      </div>

      {map && (
        <VenueMap
          base="/mobile/places"
          className="mx-4 h-72"
          items={list.map((venue) => ({ price: priceOf(venue), venue }))}
        />
      )}

      {best && (
        <BestMatch activity={activity} reasons={reasons(best)} venue={best} />
      )}

      {best && rest.length > 0 && (
        <h2 className="px-4 pt-3 font-heading text-xl font-semibold">
          Les autres possibilités
        </h2>
      )}

      <div className="-mt-2 divide-y px-4">
        {(guided ? rest : list).map((v) => (
          <ResultRow activity={activity} key={v.slug} venue={v} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="mx-4 space-y-4 rounded-3xl bg-muted p-6 text-center">
          <p className="text-lg font-semibold">
            Aucun établissement ne correspond
          </p>
          <p className="text-muted-foreground">
            Essayez avec moins de filtres
            {guided ? ", ou changez vos réponses" : ""}.
          </p>
          {active > 0 && (
            <Button
              className="w-full rounded-full"
              onClick={() => toggles.forEach((t) => t.set(false))}
              size="xl"
            >
              Retirer les filtres
            </Button>
          )}
        </div>
      )}

      <Drawer onOpenChange={setFiltersOpen} open={filtersOpen}>
        <DrawerPopup showBar>
          <DrawerHeader>
            <DrawerTitle className="font-heading text-2xl">
              Filtres et tri
            </DrawerTitle>
          </DrawerHeader>
          <DrawerPanel className="space-y-6">
            <div className="space-y-1" role="radiogroup" aria-label="Trier par">
              <p className="pb-1 font-semibold">Trier par</p>
              {(Object.keys(sortLabels) as Sort[]).map((s) => (
                <button
                  aria-checked={sort === s}
                  className="flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl text-start text-lg"
                  key={s}
                  onClick={() => setSort(s)}
                  role="radio"
                  type="button"
                >
                  {sortLabels[s]}
                  <RadioDot checked={sort === s} />
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <p className="pb-1 font-semibold">Afficher seulement</p>
              {toggles.map((t) => (
                <label
                  className="flex min-h-14 items-center justify-between gap-4 text-lg"
                  key={t.label}
                >
                  {t.label}
                  <Switch checked={t.on} onCheckedChange={t.set} />
                </label>
              ))}
            </div>
          </DrawerPanel>
          <DrawerFooter variant="bare">
            <Button
              className="w-full rounded-full"
              onClick={() => setFiltersOpen(false)}
              size="xl"
            >
              Voir {count}
            </Button>
          </DrawerFooter>
        </DrawerPopup>
      </Drawer>
    </div>
  )
}

/* ——— Page d'un établissement ——— */

export function MobileVenue({ slug }: { slug: string }) {
  const router = useRouter()
  const venue = venueOf(slug)!
  const from = useFrom()
  const [activity, setActivity] = useState(venue.activities[0])
  const [gallery, setGallery] = useState(false)
  const price = from(venue, activity)
  const back = () =>
    window.history.length > 1 ? router.back() : router.push("/mobile/explore")

  return (
    <div className="space-y-8 pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <div className="relative">
        {venue.photos.length ? (
          <div className="flex h-80 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto">
            {venue.photos.map((p, i) => (
              <Photo
                alt={`${venue.name}, photo ${i + 1}`}
                className="h-full w-full shrink-0 snap-center"
                key={p}
                sizes="448px"
                src={p}
              />
            ))}
          </div>
        ) : (
          <VenueCover className="h-72 rounded-none" venue={venue} />
        )}
        <div className="absolute inset-x-0 top-0 flex justify-between p-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <RoundButton
            className="bg-background/90"
            icon={ArrowLeft01Icon}
            label="Retour"
            onClick={back}
          />
          <div className="flex gap-2">
            <RoundButton
              className="bg-background/90"
              icon={Share08Icon}
              label="Partager"
              onClick={() => notify("Lien copié")}
            />
            <FavoriteButton className="size-12" slug={venue.slug} />
          </div>
        </div>
        {venue.photos.length > 1 && (
          <button
            className="absolute right-3 bottom-9 flex min-h-10 items-center gap-2 rounded-full bg-background/90 px-4 text-sm font-semibold"
            onClick={() => setGallery(true)}
            type="button"
          >
            <HugeiconsIcon className="size-4" icon={Image01Icon} />
            {venue.photos.length} photos
          </button>
        )}
        <span className="absolute inset-x-0 -bottom-px h-6 rounded-t-3xl bg-background" />
      </div>

      <header className="-mt-4 space-y-4 px-4">
        <div className="flex items-center gap-3">
          <VenueLogo className="size-14 text-2xl" venue={venue} />
          <p className="font-semibold text-muted-foreground">
            {venue.city} · {km(venue)}
          </p>
        </div>
        <h1 className="font-display text-5xl text-balance">{venue.name}</h1>
        <p className="text-lg text-muted-foreground">{venue.tagline}</p>
        <div className="flex flex-wrap gap-2">
          <span className="flex min-h-9 items-center gap-1.5 rounded-full bg-secondary px-3 font-semibold">
            <HugeiconsIcon
              className="size-4 [&_path]:fill-current"
              icon={StarIcon}
            />
            {ratingText(venue.rating)} · {venue.reviews} avis
          </span>
          {venue.instant && (
            <span className="flex min-h-9 items-center gap-1.5 rounded-full bg-primary px-3 font-semibold text-primary-foreground">
              <HugeiconsIcon className="size-4" icon={FlashIcon} />
              Réservation immédiate
            </span>
          )}
        </div>
      </header>

      <Section title="Prestations et prix">
        {venue.activities.length > 1 && (
          <Segmented
            onChange={setActivity}
            options={venue.activities.map((a) => ({ label: a, value: a }))}
            value={activity}
          />
        )}
        <div className="px-4">
          <Offers activity={activity} venue={venue} />
        </div>
      </Section>

      {venue.highlights.length > 0 && (
        <Section title="Les plus">
          <ul className="space-y-3 px-4">
            {venue.highlights.map((h) => (
              <li className="flex gap-3" key={h}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <HugeiconsIcon
                    className="size-4"
                    icon={Tick02Icon}
                    strokeWidth={3}
                  />
                </span>
                <span className="text-lg">{h}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="À propos">
        <p className="px-4 text-lg text-pretty">{venue.about}</p>
        <p className="px-4 text-muted-foreground">
          Tenu par {venue.owner} depuis {venue.since}.
        </p>
      </Section>

      <Section title="Infos pratiques">
        <Rows>
          <Row
            media={<IconDot icon={Clock01Icon} />}
            text={venue.hours}
            title="Horaires"
          />
          <Row
            media={<IconDot icon={Location01Icon} />}
            onClick={() => notify("Itinéraire ouvert dans Plans")}
            text={venue.address}
            title="Y aller"
          />
          <Row
            href={`/mobile/messages/${venue.slug}`}
            media={<IconDot icon={Message01Icon} />}
            text={venue.response}
            title={`Écrire à ${venue.name}`}
          />
        </Rows>
        <VenueMap
          active={venue.slug}
          base="/mobile/places"
          className="mx-4 h-44"
          items={[{ venue }]}
        />
      </Section>

      <Section title={`${venue.reviews} avis · ${ratingText(venue.rating)}`}>
        <Carousel>
          {reviewPool.map((r) => (
            <article
              className="w-72 shrink-0 snap-start space-y-3 rounded-3xl bg-muted p-5"
              key={r.author}
            >
              <div className="flex gap-0.5" aria-label={`${r.rating} sur 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <HugeiconsIcon
                    className={cn(
                      "size-5",
                      n <= r.rating
                        ? "[&_path]:fill-current"
                        : "text-muted-foreground/40"
                    )}
                    icon={StarIcon}
                    key={n}
                  />
                ))}
              </div>
              <p className="line-clamp-5 text-pretty">{r.text}</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {r.author}
                </span>{" "}
                · {r.pet} · {dayMonth(r.date)}
              </p>
            </article>
          ))}
        </Carousel>
      </Section>

      <BottomBar>
        <div className="min-w-0 flex-1">
          {price !== undefined && (
            <>
              <p className="text-sm text-muted-foreground">{activity}, dès</p>
              <p className="text-xl font-semibold">
                {euros(price)}
                <span className="text-base font-normal text-muted-foreground">
                  {priceUnit[activity]}
                </span>
              </p>
            </>
          )}
        </div>
        <Link
          className="flex min-h-14 items-center rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground"
          href={`/mobile/book/${venue.slug}?activity=${encodeURIComponent(activity)}`}
        >
          Réserver
        </Link>
      </BottomBar>

      <PhotoDialog
        onOpenChange={setGallery}
        open={gallery}
        photos={venue.photos}
        title={venue.name}
      />
    </div>
  )
}
