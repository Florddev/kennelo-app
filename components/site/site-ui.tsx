"use client"

import {
  ArrowRight01Icon,
  BedIcon,
  FavouriteIcon,
  Mortarboard01Icon,
  PawPrintIcon,
  Scissor01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Image, { type ImageLoader } from "next/image"
import Link from "next/link"
import { type ComponentProps, type ReactNode, useRef, useState } from "react"
import { type Activity, activityMeta } from "@/components/activity-mark"
import {
  bookingTotal,
  catalogIds,
  type MyBooking,
  type MyPet,
  ratingText,
  scale,
  statusMeta,
  toggleFavorite,
  type Venue,
  useSite,
  venueOf,
} from "@/components/site/data"
import {
  euros,
  fromPrice,
  shortIso,
  useCatalog,
} from "@/components/services/data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog"
import { Paws, Sparkle } from "@/components/site/doodles"
import { cn } from "@/lib/utils"

export const activityIcons: Record<Activity, IconSvgElement> = {
  Éducation: Mortarboard01Icon,
  Pension: BedIcon,
  Toilettage: Scissor01Icon,
}

export const priceUnit: Record<Activity, string> = {
  Éducation: " / séance",
  Pension: " / nuit",
  Toilettage: "",
}

/** Prix « dès » d'une activité, tiré du catalogue de démonstration. */
export function useFrom() {
  const catalog = useCatalog()
  return (venue: Venue, activity: Activity) => {
    const id = catalogIds[activity]
    if (activity === "Pension") {
      const base = catalog.rates.pension?.find((r) => r.periodId === "base")
      const prices = (catalog.places.pension ?? [])
        .filter((p) => !venue.places || venue.places.includes(p.name))
        .flatMap((p) => base?.places[p.name]?.price ?? [])
      return prices.length ? scale(venue, Math.min(...prices)) : undefined
    }
    const prices = (catalog.offers[id] ?? []).flatMap((o) => {
      const service = catalog.services.find(
        (s) => s.id === o.serviceId && s.owner === id
      )
      return o.active && service ? [fromPrice(service)] : []
    })
    return prices.length ? scale(venue, Math.min(...prices)) : undefined
  }
}

/** Conteneur centré des pages du site. */
export function SitePage({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl space-y-12 px-4 py-6 md:px-10 md:py-10",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SectionHead({
  title,
  description,
  action,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0 space-y-0.5">
        <h2 className="font-display text-4xl text-balance">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/** Lien « Tout voir » avec flèche. */
export function SeeAll({
  href,
  label = "Tout voir",
}: {
  href: string
  label?: string
}) {
  return (
    <Link
      className="inline-flex items-center gap-1 font-semibold text-link underline underline-offset-4"
      href={href}
    >
      {label}
    </Link>
  )
}

export function ActivityPill({
  activity,
  className,
}: {
  activity: Activity
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-sm font-semibold",
        activityMeta[activity].tint,
        className
      )}
    >
      <HugeiconsIcon className="size-4" icon={activityIcons[activity]} />
      {activity}
    </span>
  )
}

export function Rating({
  venue,
  className,
}: {
  venue: Venue
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 font-semibold",
        className
      )}
    >
      <HugeiconsIcon className="size-4 [&_path]:fill-current" icon={StarIcon} />
      {ratingText(venue.rating)}
      <span className="font-normal text-muted-foreground">
        ({venue.reviews})
      </span>
    </span>
  )
}

/** Visuel d'un établissement : ses couleurs, ses initiales, une patte. */
/** Unsplash redimensionne lui-même : le navigateur demande la bonne largeur. */
const unsplashLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src)
  url.searchParams.set("w", String(width))
  url.searchParams.set("q", String(quality ?? 75))
  return url.toString()
}

/** Une photo qui remplit son cadre, toujours sur un fond neutre. */
export function Photo({
  src,
  alt,
  className,
  sizes = "50vw",
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
}) {
  return (
    <span className={cn("relative block overflow-hidden bg-muted", className)}>
      <Image
        alt={alt}
        className="object-cover"
        fill
        loader={
          src.startsWith("https://images.unsplash.com/")
            ? unsplashLoader
            : undefined
        }
        sizes={sizes}
        src={src}
        unoptimized={src.startsWith("blob:")}
      />
    </span>
  )
}

/** Toutes les photos, en grand. */
export function PhotoDialog({
  title,
  photos,
  open,
  onOpenChange,
}: {
  title: string
  photos: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{photos.length} photos</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div className="grid gap-2 sm:grid-cols-2">
            {photos.map((p, i) => (
              <Photo
                alt={`${title}, photo ${i + 1}`}
                className="aspect-4/3 rounded-2xl"
                key={p}
                sizes="(min-width: 640px) 450px, 100vw"
                src={p}
              />
            ))}
          </div>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  )
}

/** Vignettes carrées ; la dernière annonce le nombre de photos restantes. */
export function PhotoStrip({
  photos,
  title,
  max = 4,
  className,
}: {
  photos: string[]
  title: string
  max?: number
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const more = photos.length - max
  return (
    <>
      <div className={cn("grid grid-cols-4 gap-2", className)}>
        {photos.slice(0, max).map((p, i) => (
          <button
            aria-label={`Voir les photos : ${title}`}
            className="relative overflow-hidden rounded-2xl transition-opacity hover:opacity-90"
            key={p}
            onClick={() => setOpen(true)}
            type="button"
          >
            <Photo alt="" className="aspect-square" sizes="240px" src={p} />
            {i === max - 1 && more > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-semibold text-white">
                +{more + 1}
              </span>
            )}
          </button>
        ))}
      </div>
      <PhotoDialog
        onOpenChange={setOpen}
        open={open}
        photos={photos}
        title={title}
      />
    </>
  )
}

/** Bouton qui ouvre le choix d'une photo sur l'appareil. */
export function PhotoButton({
  onPick,
  children,
  ...props
}: { onPick: (url: string) => void } & Omit<
  ComponentProps<typeof Button>,
  "onClick" | "onChange"
>) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <Button {...props} onClick={() => input.current?.click()} type="button">
        {children}
      </Button>
      <input
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPick(URL.createObjectURL(file))
          e.target.value = ""
        }}
        ref={input}
        type="file"
      />
    </>
  )
}

/** Logo d'un établissement : sa couleur et son initiale. */
export function VenueLogo({
  venue,
  className,
}: {
  venue: Venue
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full font-display text-xl",
        venue.tone,
        className
      )}
    >
      {venue.name[0]}
    </span>
  )
}

/** Visuel d'un établissement : sa photo de couverture, sinon ses couleurs. */
export function VenueCover({
  venue,
  className,
  logo,
  sizes = "(min-width: 768px) 33vw, 100vw",
}: {
  venue: Venue
  className?: string
  /** Pose le logo coloré sur la photo. */
  logo?: boolean
  sizes?: string
}) {
  const cover = venue.photos[0]
  if (cover)
    return (
      <div className={cn("relative overflow-hidden rounded-3xl", className)}>
        <Photo
          alt={venue.name}
          className="absolute inset-0"
          sizes={sizes}
          src={cover}
        />
        {logo && (
          <VenueLogo
            className="absolute bottom-3 left-3 size-11 border-2 border-white text-lg"
            venue={venue}
          />
        )}
      </div>
    )
  const initials = venue.name
    .split(/[\s&']+/)
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
  return (
    <div
      className={cn(
        "@container relative overflow-hidden rounded-3xl",
        venue.tone,
        className
      )}
    >
      <HugeiconsIcon
        className="absolute -top-[12%] -right-[8%] size-[70%] rotate-12 opacity-15"
        icon={PawPrintIcon}
        strokeWidth={1.5}
      />
      <span className="absolute bottom-[8%] left-[8%] font-display text-[clamp(2.5rem,22cqw,7rem)] leading-none">
        {initials}
      </span>
    </div>
  )
}

export function FavoriteButton({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  const on = useSite().favorites.includes(slug)
  return (
    <button
      aria-label={on ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={on}
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-background",
        className
      )}
      onClick={() => toggleFavorite(slug)}
      type="button"
    >
      <HugeiconsIcon
        className={cn("size-5", on && "text-destructive [&_path]:fill-current")}
        icon={FavouriteIcon}
      />
    </button>
  )
}

/** Carte d'établissement pour les carrousels et les grilles. */
export function VenueCard({
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
      <Link className="group block" href={`/places/${venue.slug}`}>
        <VenueCover
          className="aspect-4/3 transition-transform group-hover:scale-[0.98]"
          logo
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
          <p className="mt-1">
            <span className="font-semibold">Dès {euros(price)}</span>
            <span className="text-muted-foreground">
              {priceUnit[shown]} · {shown}
            </span>
          </p>
        )}
      </Link>
      <FavoriteButton className="absolute top-3 right-3" slug={venue.slug} />
    </div>
  )
}

/** Rond coloré avec l'initiale de l'animal. */
export function PetAvatar({
  pet,
  className,
}: {
  pet: Pick<MyPet, "name" | "tone" | "photo">
  className?: string
}) {
  if (pet.photo)
    return (
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          pet.tone,
          className
        )}
      >
        {/* 90 % de l'anneau, quelle que soit sa taille (un padding en % suivrait la largeur du parent). */}
        <Photo
          alt={pet.name}
          className="size-[90%] rounded-full"
          sizes="240px"
          src={pet.photo}
        />
      </span>
    )
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full font-display text-2xl",
        pet.tone,
        className
      )}
    >
      {pet.name[0]}
    </span>
  )
}

export const bookingDates = (b: Pick<MyBooking, "start" | "end" | "time">) =>
  b.end
    ? `${shortIso(b.start)} → ${shortIso(b.end)}`
    : `${shortIso(b.start)} · ${b.time}`

/** Ligne de réservation, comme une transaction Wise. */
export function BookingRow({ booking }: { booking: MyBooking }) {
  const { pets } = useSite()
  const venue = venueOf(booking.venue)
  const status = statusMeta[booking.status]
  const names = booking.pets
    .map((id) => pets.find((p) => p.id === id)?.name)
    .filter(Boolean)
    .join(", ")
  return (
    <Link
      className="flex min-h-16 items-center gap-4 px-5 py-4 transition-colors hover:bg-accent"
      href={`/me/bookings/${booking.id}`}
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full [&_svg]:size-6",
          activityMeta[booking.activity].tint,
          booking.status === "cancelled" && "opacity-50"
        )}
      >
        <HugeiconsIcon icon={activityIcons[booking.activity]} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{venue?.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {booking.activity} · {names} · {bookingDates(booking)}
        </p>
      </div>
      <div className="shrink-0 text-end">
        <p
          className={cn(
            "font-semibold tabular-nums",
            booking.status === "cancelled" &&
              "text-muted-foreground line-through"
          )}
        >
          {euros(bookingTotal(booking))}
        </p>
        <p
          className={cn(
            "text-sm",
            booking.status === "pending"
              ? "font-semibold text-warning-foreground"
              : "text-muted-foreground"
          )}
        >
          {status.label}
        </p>
      </div>
    </Link>
  )
}

/** Carte des établissements : un fond simplifié et une étiquette de prix par lieu. */
export function VenueMap({
  items,
  active,
  className,
  base = "/places",
}: {
  items: { venue: Venue; price?: number }[]
  active?: string | null
  className?: string
  /** Début de l'adresse des pages d'établissement. */
  base?: string
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-3xl bg-muted", className)}
    >
      <div className="absolute top-[58%] -left-[10%] h-10 w-[130%] -rotate-12 bg-wise-blue/50" />
      <div className="absolute top-0 left-[35%] h-full w-2 rotate-6 bg-background" />
      <div className="absolute top-[30%] left-0 h-2 w-full -rotate-3 bg-background" />
      <div className="absolute top-[78%] left-0 h-1.5 w-full rotate-6 bg-background" />
      <div className="absolute top-0 left-[70%] h-full w-1.5 -rotate-12 bg-background" />
      {items.map(({ venue, price }) => (
        <Link
          className={cn(
            "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold shadow-md transition-transform hover:scale-105",
            active === venue.slug
              ? "z-10 scale-110 bg-control text-control-foreground"
              : "bg-card"
          )}
          href={`${base}/${venue.slug}`}
          key={venue.slug}
          style={{ left: `${venue.pos[0]}%`, top: `${venue.pos[1]}%` }}
        >
          {price !== undefined ? euros(price) : venue.name}
        </Link>
      ))}
      <span className="absolute right-4 bottom-3 text-sm font-semibold text-muted-foreground">
        Bordeaux et alentours
      </span>
    </div>
  )
}

/** Ligne qui mène à une page, avec une flèche. */
export function ArrowLink({
  href,
  media,
  title,
  description,
}: {
  href: string
  media?: ReactNode
  title: ReactNode
  description?: ReactNode
}) {
  return (
    <Link
      className="flex min-h-16 items-center gap-4 px-5 py-4 transition-colors hover:bg-accent"
      href={href}
    >
      {media}
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="truncate text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <HugeiconsIcon
        className="size-5 shrink-0 text-muted-foreground"
        icon={ArrowRight01Icon}
      />
    </Link>
  )
}

/** Grande carte arrondie à lignes séparées, comme le kit des réglages. */
export function RowsCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "divide-y overflow-hidden rounded-3xl border bg-card",
        className
      )}
    >
      {children}
    </div>
  )
}

/** Cinq étoiles, pleines jusqu'à la note. */
export function Stars({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn("flex gap-0.5", className)}>
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

/** Grand titre de section des pages vitrines, avec ses boutons à droite. */
export function SectionTitle({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        <h2 className="relative font-display text-5xl text-balance md:text-6xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-xl text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}

/** En-tête des pages du site : très grand titre, un petit dessin, les actions à droite. */
export function PageHeader({
  title,
  description,
  action,
  doodle = "sparkle",
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  doodle?: "sparkle" | "paws" | false
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
        className
      )}
    >
      <div className="min-w-0 space-y-3">
        <h1 className="font-display text-6xl text-balance md:text-8xl">
          {title}
          {doodle === "sparkle" && (
            <Sparkle className="ms-2 inline size-10 align-top md:size-14" />
          )}
          {doodle === "paws" && <Paws className="ms-3 text-4xl md:text-5xl" />}
        </h1>
        {description && (
          <p className="max-w-xl text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </header>
  )
}
