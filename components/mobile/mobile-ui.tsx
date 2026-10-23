"use client"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FavouriteIcon,
  Compass01Icon,
  Home01Icon,
  Message01Icon,
  PawPrintIcon,
  QuoteDownIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  type ReactNode,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react"
import { type Activity, activityMeta } from "@/components/activity-mark"
import { daysBetween } from "@/components/pets/data"
import { countdown } from "@/components/site/booking-detail"
import {
  bookingTotal,
  type MyBooking,
  nightsOf,
  type PetNote,
  statusMeta,
  useSite,
  type Venue,
  venueOf,
} from "@/components/site/data"
import { NoteExtras } from "@/components/site/pet-profile"
import {
  activityIcons,
  bookingDates,
  FavoriteButton,
  PetAvatar,
  Photo,
  priceUnit,
  Rating,
  useFrom,
  VenueCover,
  VenueLogo,
} from "@/components/site/site-ui"
import { dayMonth, euros, todayIso } from "@/components/services/data"
import { Paws, Sparkle } from "@/components/site/doodles"
import { cn } from "@/lib/utils"

/* ——— La coque de l'app ——— */

export const LARGE_TEXT_KEY = "kennelo-large-text"

const textListeners = new Set<() => void>()

export const setLargeText = (on: boolean) => {
  document.documentElement.style.fontSize = on ? "112.5%" : ""
  try {
    localStorage.setItem(LARGE_TEXT_KEY, on ? "1" : "0")
  } catch {}
  for (const l of textListeners) l()
}

/** « Texte plus grand », retenu sur l'appareil. */
export const useLargeText = () =>
  useSyncExternalStore(
    (cb) => {
      textListeners.add(cb)
      return () => textListeners.delete(cb)
    },
    () => {
      try {
        return localStorage.getItem(LARGE_TEXT_KEY) === "1"
      } catch {
        return false
      }
    },
    () => false
  )

const tabs: {
  href: string
  icon: IconSvgElement
  label: string
  match: RegExp
}[] = [
  {
    href: "/mobile",
    icon: Home01Icon,
    label: "Accueil",
    match: /^\/mobile(\/bookings.*)?$/,
  },
  {
    href: "/mobile/explore",
    icon: Compass01Icon,
    label: "Explorer",
    match: /^\/mobile\/(explore|search|places)/,
  },
  {
    href: "/mobile/pets",
    icon: PawPrintIcon,
    label: "Animaux",
    match: /^\/mobile\/pets/,
  },
  {
    href: "/mobile/messages",
    icon: Message01Icon,
    label: "Messages",
    match: /^\/mobile\/messages/,
  },
  {
    href: "/mobile/profile",
    icon: UserCircleIcon,
    label: "Profil",
    match: /^\/mobile\/(profile|favorites)/,
  },
]

export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { threads } = useSite()
  const unread = threads.reduce((n, t) => n + t.unread, 0)
  /* Les parcours et les pages avec leur propre barre en bas la masquent. */
  const hideNav =
    /^\/mobile\/(places|messages\/|explore\/find|pets\/new|book)/.test(pathname)

  useEffect(() => {
    try {
      if (localStorage.getItem(LARGE_TEXT_KEY) === "1")
        document.documentElement.style.fontSize = "112.5%"
    } catch {}
    return () => {
      document.documentElement.style.fontSize = ""
    }
  }, [])

  return (
    <div className="min-h-dvh bg-muted">
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col bg-background md:shadow-2xl">
        <main
          className={cn(
            "flex-1",
            !hideNav && "pb-[calc(6rem+env(safe-area-inset-bottom))]"
          )}
        >
          {children}
        </main>
        {!hideNav && (
          <nav
            aria-label="Navigation principale"
            className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
          >
            <ul className="grid grid-cols-5">
              {tabs.map((tab) => {
                const on = tab.match.test(pathname)
                const badge = tab.href === "/mobile/messages" && unread > 0
                return (
                  <li key={tab.href}>
                    <Link
                      aria-current={on ? "page" : undefined}
                      className="flex min-h-18 flex-col items-center justify-center gap-1 py-2"
                      href={tab.href}
                    >
                      <span
                        className={cn(
                          "relative flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                          on
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <HugeiconsIcon
                          className="size-6"
                          icon={tab.icon}
                          strokeWidth={on ? 2 : 1.5}
                        />
                        {badge && (
                          <span className="absolute -top-1 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-white">
                            {unread}
                            <span className="sr-only"> non lus</span>
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[0.8125rem]",
                          on
                            ? "font-bold text-foreground"
                            : "font-medium text-muted-foreground"
                        )}
                      >
                        {tab.label}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}

/* ——— En-têtes ——— */

/** Titre d'un onglet : grand, en haut à gauche. */
export function TabHeader({
  title,
  eyebrow,
  doodle = "sparkle",
  children,
}: {
  title: ReactNode
  eyebrow?: ReactNode
  doodle?: "sparkle" | "paws" | false
  children?: ReactNode
}) {
  return (
    <header className="flex items-end justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-2">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 font-semibold text-muted-foreground first-letter:uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-5xl">
          {title}
          {doodle === "sparkle" && (
            <Sparkle className="ms-1 inline size-8 align-top" />
          )}
          {doodle === "paws" && <Paws className="ms-2 text-3xl" />}
        </h1>
      </div>
      {children}
    </header>
  )
}

/** Bouton rond de 48 px, avec un nom lisible par les lecteurs d'écran. */
export function RoundButton({
  icon,
  label,
  href,
  onClick,
  className,
}: {
  icon: IconSvgElement
  label: string
  href?: string
  onClick?: () => void
  className?: string
}) {
  const cls = cn(
    "flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors active:bg-neutral-hover [&_svg]:size-6",
    className
  )
  return href ? (
    <Link aria-label={label} className={cls} href={href}>
      <HugeiconsIcon icon={icon} />
    </Link>
  ) : (
    <button aria-label={label} className={cls} onClick={onClick} type="button">
      <HugeiconsIcon icon={icon} />
    </button>
  )
}

/** Barre du haut d'une page secondaire : retour, titre, action. */
export function TopBar({
  back,
  title,
  action,
  className,
}: {
  back: string
  title?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-18 items-center gap-3 bg-background/95 px-3 pt-[env(safe-area-inset-top)] backdrop-blur",
        className
      )}
    >
      <RoundButton href={back} icon={ArrowLeft01Icon} label="Retour" />
      <p className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</p>
      {action}
    </header>
  )
}

/* ——— Blocs ——— */

export function Section({
  title,
  href,
  linkLabel = "Tout voir",
  className,
  children,
}: {
  title: ReactNode
  href?: string
  linkLabel?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-4 px-4">
        <h2 className="font-display text-3xl text-balance">{title}</h2>
        {href && (
          <Link
            className="flex min-h-11 items-center font-semibold text-link underline underline-offset-4"
            href={href}
          >
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

/** Défilement horizontal, aligné sur les marges. */
export function Carousel({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-1",
        className
      )}
    >
      {children}
    </div>
  )
}

/** Groupe de lignes dans une carte. */
export function Rows({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "mx-4 divide-y-2 divide-background overflow-hidden rounded-3xl bg-muted",
        className
      )}
    >
      {children}
    </div>
  )
}

/** Ligne de liste : au moins 72 px de haut, facile à toucher. */
export function Row({
  href,
  onClick,
  media,
  title,
  text,
  aside,
  chevron = true,
  className,
}: {
  href?: string
  onClick?: () => void
  media?: ReactNode
  title: ReactNode
  text?: ReactNode
  aside?: ReactNode
  chevron?: boolean
  className?: string
}) {
  const inner = (
    <>
      {media}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        {text && (
          <span className="block text-[0.9375rem] text-muted-foreground">
            {text}
          </span>
        )}
      </span>
      {aside}
      {chevron && (href || onClick) && (
        <HugeiconsIcon
          className="size-5 shrink-0 text-muted-foreground"
          icon={ArrowRight01Icon}
        />
      )}
    </>
  )
  const cls = cn(
    "flex min-h-18 w-full items-center gap-4 px-4 py-3 text-start transition-colors",
    (href || onClick) && "active:bg-neutral-hover",
    className
  )
  if (href)
    return (
      <Link className={cls} href={href}>
        {inner}
      </Link>
    )
  if (onClick)
    return (
      <button className={cls} onClick={onClick} type="button">
        {inner}
      </button>
    )
  return <div className={cls}>{inner}</div>
}

export function IconDot({
  icon,
  className,
}: {
  icon: IconSvgElement
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full bg-background [&_svg]:size-6",
        className
      )}
    >
      <HugeiconsIcon icon={icon} />
    </span>
  )
}

export const chip =
  "flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 font-semibold transition-colors"
export const chipOn = "bg-control text-control-foreground"
export const chipOff = "bg-secondary text-secondary-foreground"

/** Deux ou trois vues d'une même page. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-4 grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-secondary p-1",
        className
      )}
      role="tablist"
    >
      {options.map((o) => (
        <button
          aria-selected={o.value === value}
          className={cn(
            "min-h-11 rounded-full px-3 font-semibold transition-colors",
            o.value === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          )}
          key={o.value}
          onClick={() => onChange(o.value)}
          role="tab"
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Barre fixée en bas, pour l'action principale de la page. */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center gap-4 border-t bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {children}
    </div>
  )
}

/* ——— Établissements ——— */

export function MobileVenueCard({
  venue,
  activity,
  className,
}: {
  venue: Venue
  activity?: Activity
  className?: string
}) {
  const from = useFrom()
  const shown =
    activity && venue.activities.includes(activity)
      ? activity
      : venue.activities[0]
  const price = from(venue, shown)
  return (
    <div className={cn("relative", className)}>
      <Link className="block" href={`/mobile/places/${venue.slug}`}>
        <VenueCover
          className="aspect-4/3"
          logo
          sizes="(min-width: 448px) 416px, 100vw"
          venue={venue}
        />
        <div className="mt-3 flex items-start justify-between gap-3">
          <p className="truncate text-lg font-semibold">{venue.name}</p>
          <Rating className="mt-0.5" venue={venue} />
        </div>
        <p className="truncate text-muted-foreground">
          {venue.city} · {String(venue.distance).replace(".", ",")} km
        </p>
        {price !== undefined && (
          <p className="mt-0.5">
            <span className="font-semibold">Dès {euros(price)}</span>
            <span className="text-muted-foreground">
              {priceUnit[shown]} · {shown}
            </span>
          </p>
        )}
      </Link>
      <FavoriteButton
        className="absolute top-3 right-3 size-11"
        slug={venue.slug}
      />
    </div>
  )
}

/* ——— Réservations ——— */

export const petsOf = (
  booking: MyBooking,
  pets: ReturnType<typeof useSite>["pets"]
) => booking.pets.flatMap((p) => pets.find((x) => x.id === p) ?? [])

/** Ligne de réservation : activité, lieu, dates, prix. */
export function BookingItem({ booking }: { booking: MyBooking }) {
  const { pets } = useSite()
  const venue = venueOf(booking.venue)
  const cancelled = booking.status === "cancelled"
  return (
    <Row
      aside={
        <span className="shrink-0 text-end">
          <span
            className={cn(
              "block font-semibold tabular-nums",
              cancelled && "text-muted-foreground line-through"
            )}
          >
            {euros(bookingTotal(booking))}
          </span>
          <span
            className={cn(
              "block text-sm",
              booking.status === "pending"
                ? "font-semibold text-warning-foreground"
                : "text-muted-foreground"
            )}
          >
            {statusMeta[booking.status].label}
          </span>
        </span>
      }
      chevron={false}
      href={`/mobile/bookings/${booking.id}`}
      media={
        <IconDot
          className={cn(
            activityMeta[booking.activity].tint,
            cancelled && "opacity-50"
          )}
          icon={activityIcons[booking.activity]}
        />
      }
      text={
        <>
          {petsOf(booking, pets)
            .map((p) => p.name)
            .join(", ")}{" "}
          · {bookingDates(booking)}
        </>
      }
      title={venue?.name}
    />
  )
}

/** La grande carte d'une réservation : photo du lieu, compte à rebours, animaux. */
export function BookingCard({
  booking,
  href,
}: {
  booking: MyBooking
  /** Toute la carte mène à cette adresse ; sinon la photo mène au lieu. */
  href?: string
}) {
  const site = useSite()
  const venue = venueOf(booking.venue)!
  const pets = petsOf(booking, site.pets)
  const nights = nightsOf(booking)
  const photo = (
    <>
      {venue.photos[0] && (
        <Photo
          alt={venue.name}
          className="absolute inset-0"
          sizes="448px"
          src={venue.photos[0]}
        />
      )}
      <span className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4 text-white">
        <VenueLogo className="border-2 border-white" venue={venue} />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{venue.name}</span>
          <span className="block truncate text-sm text-white/85">
            {venue.city}
            {!href && " · Voir la page"}
          </span>
        </span>
      </span>
    </>
  )
  const body = (
    <>
      {href ? (
        <div className="relative h-36">{photo}</div>
      ) : (
        <Link
          className="relative block h-44"
          href={`/mobile/places/${venue.slug}`}
        >
          {photo}
        </Link>
      )}
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-wise-forest">
            {statusMeta[booking.status].label}
          </span>
          <span className="rounded-full bg-white/40 px-3 py-1 text-sm font-semibold">
            {booking.activity}
          </span>
        </div>
        <div>
          <p className="font-display text-6xl text-balance">
            {countdown(booking)}
          </p>
          <p className="mt-2 text-lg font-semibold">
            {bookingDates(booking)}
            {nights > 0 && ` · ${nights} nuit${nights > 1 ? "s" : ""}`}
          </p>
          <p className="opacity-80">{booking.item}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {pets.map((p) => (
              <PetAvatar
                className="size-12 bg-white/60 p-1"
                key={p.id}
                pet={p}
              />
            ))}
          </div>
          <p className="min-w-0 flex-1 font-semibold">
            {pets.map((p) => p.name).join(" et ")}
          </p>
          {href && (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/60">
              <HugeiconsIcon className="size-5" icon={ArrowRight01Icon} />
            </span>
          )}
        </div>
      </div>
    </>
  )
  const className = cn(
    "mx-4 block overflow-hidden rounded-3xl",
    booking.status === "cancelled"
      ? "bg-muted"
      : activityMeta[booking.activity].tint
  )
  return href ? (
    <Link
      aria-label={`Réservation chez ${venue.name}, ${countdown(booking)}`}
      className={cn(className, "transition-transform active:scale-[0.98]")}
      href={href}
    >
      {body}
    </Link>
  ) : (
    <section className={className}>{body}</section>
  )
}

/* ——— Nouvelles des animaux ——— */

/** Le mot d'un pro, comme une publication : qui, sur qui, quoi, en photos. */
export function NoteCard({
  note,
  compact,
}: {
  note: PetNote
  /** Juste le texte et la première photo. */
  compact?: boolean
}) {
  const site = useSite()
  const booking = site.bookings.find((b) => b.id === note.booking)
  const venue = booking && venueOf(booking.venue)
  const pet = site.pets.find((p) => p.id === note.pet)
  if (!booking || !venue || !pet) return null
  return (
    <article className="mx-4 space-y-4 rounded-3xl border bg-card p-4">
      <Link
        className="flex items-center gap-3"
        href={`/mobile/bookings/${booking.id}`}
      >
        <span className="relative shrink-0">
          <VenueLogo venue={venue} />
          <PetAvatar
            className="absolute -right-2 -bottom-1.5 size-6 border-2 border-card p-0 text-[0.625rem]"
            pet={pet}
          />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{venue.name}</span>
          <span className="block truncate text-[0.9375rem] text-muted-foreground">
            sur {pet.name} · {booking.activity} · {dayMonth(note.date)}
          </span>
        </span>
      </Link>
      {compact && note.photos?.[0] && (
        <Photo
          alt=""
          className="aspect-video rounded-2xl"
          sizes="416px"
          src={note.photos[0]}
        />
      )}
      <p className={cn("text-pretty", compact ? "line-clamp-4" : "text-lg")}>
        {note.text}
      </p>
      {!compact && (
        <NoteExtras
          author={note.author}
          mood={note.mood}
          photos={note.photos}
          tags={note.tags}
          tip={note.tip}
          title={`${venue.name} · ${dayMonth(note.date)}`}
        />
      )}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{note.author}</span> ·{" "}
        {note.role}
      </p>
    </article>
  )
}

/** Action en rond avec son nom dessous, comme dans l'app Wise. */
export function QuickAction({
  icon,
  label,
  href,
  onClick,
  primary,
  circleClassName,
}: {
  icon: IconSvgElement
  label: string
  href?: string
  onClick?: () => void
  primary?: boolean
  /** Couleur du rond, par exemple sur un fond coloré. */
  circleClassName?: string
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-full [&_svg]:size-6",
          primary
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground",
          circleClassName
        )}
      >
        <HugeiconsIcon icon={icon} />
      </span>
      <span className="text-center text-sm leading-tight font-semibold">
        {label}
      </span>
    </>
  )
  const cls =
    "flex min-w-0 flex-col items-center gap-2 transition-transform active:scale-95"
  return href ? (
    <Link className={cls} href={href}>
      {inner}
    </Link>
  ) : (
    <button className={cls} onClick={onClick} type="button">
      {inner}
    </button>
  )
}

/* ——— Établissement en photo, nouvelles ——— */

/** Avatar d'un établissement : sa photo dans un anneau à sa couleur. */
export function VenueAvatar({
  venue,
  className,
}: {
  venue: Venue
  className?: string
}) {
  const cover = venue.photos[0]
  if (!cover) return <VenueLogo className={className} venue={venue} />
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full",
        venue.tone,
        className
      )}
    >
      <Photo
        alt=""
        className="size-[88%] rounded-full"
        sizes="96px"
        src={cover}
      />
    </span>
  )
}

/** « Aujourd'hui », « hier », « il y a 5 jours », puis la date. */
export function ago(iso: string) {
  const days = daysBetween(iso, todayIso)
  if (days <= 0) return "aujourd'hui"
  if (days === 1) return "hier"
  if (days < 7) return `il y a ${days} jours`
  return `le ${dayMonth(iso)}`
}

/**
 * Le mot d'un pro comme une publication : qui, les photos en grand,
 * le texte, le bulletin, puis « Dire merci » et « Répondre ».
 */
export function NotePost({
  note,
  showPet = true,
}: {
  note: PetNote
  showPet?: boolean
}) {
  const site = useSite()
  const [thanked, setThanked] = useState(false)
  const booking = site.bookings.find((b) => b.id === note.booking)
  const venue = booking && venueOf(booking.venue)
  const pet = site.pets.find((p) => p.id === note.pet)
  if (!booking || !venue || !pet) return null
  const photos = note.photos ?? []
  const action =
    "flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold transition-colors active:bg-accent [&_svg]:size-5"

  return (
    <article className="mx-4 overflow-hidden rounded-3xl border bg-card">
      <header className="flex items-center gap-3 p-4">
        <VenueAvatar venue={venue} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{venue.name}</p>
          <p className="truncate text-[0.9375rem] text-muted-foreground">
            {note.author} · {ago(note.date)}
          </p>
        </div>
        {showPet && (
          <span
            className={cn(
              "flex min-h-9 shrink-0 items-center gap-1.5 rounded-full ps-1 pe-3 text-sm font-semibold",
              pet.tone
            )}
          >
            <PetAvatar className="size-7 bg-white/60 text-xs" pet={pet} />
            {pet.name}
          </span>
        )}
      </header>

      {photos.length > 0 ? (
        <div className="relative">
          <div className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto">
            {photos.map((p, i) => (
              <Photo
                alt={`Photo ${i + 1} sur ${photos.length}, par ${venue.name}`}
                className="aspect-4/5 w-full shrink-0 snap-center"
                key={p}
                sizes="448px"
                src={p}
              />
            ))}
          </div>
          {photos.length > 1 && (
            <span className="absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white">
              {photos.length} photos · faites glisser
            </span>
          )}
        </div>
      ) : (
        <div className={cn("mx-4 rounded-3xl p-5", pet.tone)}>
          <HugeiconsIcon className="size-8 opacity-50" icon={QuoteDownIcon} />
          <p className="mt-2 font-heading text-2xl leading-snug font-semibold text-pretty">
            {note.text}
          </p>
        </div>
      )}

      <div className="space-y-4 p-4">
        {photos.length > 0 && (
          <p className="text-lg text-pretty">{note.text}</p>
        )}
        <NoteExtras
          author={note.author}
          mood={note.mood}
          tags={note.tags}
          tip={note.tip}
          title={venue.name}
        />
        <div className="-mx-2 flex items-center gap-1 border-t pt-2">
          <button
            aria-pressed={thanked}
            className={action}
            onClick={() => setThanked(!thanked)}
            type="button"
          >
            <HugeiconsIcon
              className={cn(
                thanked && "text-destructive [&_path]:fill-current"
              )}
              icon={FavouriteIcon}
            />
            {thanked ? "Merci envoyé" : "Dire merci"}
          </button>
          <Link className={action} href={`/mobile/messages/${venue.slug}`}>
            <HugeiconsIcon icon={Message01Icon} />
            Répondre
          </Link>
          <Link
            className={cn(action, "ms-auto text-link")}
            href={`/mobile/bookings/${booking.id}`}
          >
            La visite
          </Link>
        </div>
      </div>
    </article>
  )
}
