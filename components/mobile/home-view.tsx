"use client"

import {
  Alert02Icon,
  Clock01Icon,
  Message01Icon,
  PlusSignIcon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import { activityMeta, activityNames } from "@/components/activity-mark"
import {
  BookingCard,
  BookingItem,
  Carousel,
  IconDot,
  NoteCard,
  RoundButton,
  Row,
  Rows,
  Section,
  Segmented,
  TopBar,
} from "@/components/mobile/mobile-ui"
import {
  ageOf,
  isUpcoming,
  me,
  type MyBooking,
  petAlerts,
  useSite,
  vaxStatus,
  venueOf,
} from "@/components/site/data"
import { Sparkle, Squiggle } from "@/components/site/doodles"
import { activityIcons, Photo } from "@/components/site/site-ui"
import { explorePhotos } from "@/components/site/venues"
import { dayMonth, shortIso, todayIso } from "@/components/services/data"
import { cn } from "@/lib/utils"

const todayLabel = new Date(`${todayIso}T00:00:00Z`).toLocaleDateString(
  "fr-FR",
  { day: "numeric", month: "long", timeZone: "UTC", weekday: "long" }
)

const byStart = (a: MyBooking, b: MyBooking) => a.start.localeCompare(b.start)

const monthOf = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  })

const activityVerb = {
  Éducation: "Une séance d'éducation",
  Pension: "Une pension",
  Toilettage: "Un toilettage",
}

function NothingPlanned() {
  return (
    <div className="mx-4 space-y-4 rounded-3xl bg-wise-green p-6 text-wise-forest">
      <p className="font-display text-5xl">Rien de prévu</p>
      <p className="text-lg">
        Une pension pour les vacances, un toilettage avant l&apos;été ?
      </p>
      <Link
        className="flex min-h-14 items-center justify-center rounded-full bg-wise-forest px-6 text-lg font-semibold text-wise-green"
        href="/mobile/explore"
      >
        Trouver un établissement
      </Link>
    </div>
  )
}

export function MobileHome() {
  const site = useSite()
  const [next, ...later] = site.bookings.filter(isUpcoming).sort(byStart)
  const past = site.bookings
    .filter((b) => !isUpcoming(b))
    .sort((a, b) => b.start.localeCompare(a.start))
  const unread = site.threads.reduce((n, t) => n + t.unread, 0)
  const last = [...site.notes].sort((a, b) => b.date.localeCompare(a.date))[0]
  const todo: {
    href: string
    icon: IconSvgElement
    tone: string
    title: string
    text: string
  }[] = [
    ...site.pets.flatMap((pet) =>
      petAlerts(pet).map((v) => ({
        href: `/mobile/pets/${pet.id}`,
        icon: Alert02Icon,
        text:
          vaxStatus(v.expires) === "expired"
            ? "Expiré : à refaire chez le vétérinaire"
            : `À renouveler avant le ${dayMonth(v.expires)}`,
        title: `Vaccin « ${v.name} » de ${pet.name}`,
        tone: "bg-warning-soft",
      }))
    ),
    ...site.bookings
      .filter((b) => b.status === "pending")
      .map((b) => ({
        href: `/mobile/bookings/${b.id}`,
        icon: Clock01Icon,
        text: `${venueOf(b.venue)?.name} vous répond bientôt`,
        title: `Demande du ${shortIso(b.start).toLowerCase()}`,
        tone: "bg-muted",
      })),
    ...site.bookings
      .filter((b) => b.status === "done" && !b.reviewed)
      .slice(0, 1)
      .map((b) => ({
        href: `/mobile/bookings/${b.id}`,
        icon: StarIcon,
        text: "Ça prend 30 secondes",
        title: `Votre avis sur ${venueOf(b.venue)?.name}`,
        tone: "bg-success-soft",
      })),
    ...(unread
      ? [
          {
            href: "/mobile/messages",
            icon: Message01Icon,
            text: "Les établissements vous ont écrit",
            title: `${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}`,
            tone: "bg-info-soft",
          },
        ]
      : []),
  ]
  const shortList = later.length ? later.slice(0, 3) : past.slice(0, 2)

  return (
    <div className="space-y-8">
      <header className="px-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="relative overflow-hidden rounded-4xl bg-wise-forest p-5 text-white">
          <Squiggle className="absolute -right-12 -bottom-14 w-48" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-white/70 first-letter:uppercase">
                {todayLabel}
              </p>
              <h1 className="mt-1 font-display text-6xl leading-[0.9] text-wise-green">
                Bonjour {me.first}
              </h1>
            </div>
            <Link
              aria-label="Mon profil"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-wise-green text-lg font-semibold text-wise-forest"
              href="/mobile/profile"
            >
              {me.first[0]}
              {me.last[0]}
            </Link>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2">
            {[
              {
                href: "/mobile/bookings",
                text: `${later.length + (next ? 1 : 0)} à venir`,
              },
              {
                href: "/mobile/pets",
                text: `${site.pets.length} ${site.pets.length > 1 ? "animaux" : "animal"}`,
              },
              {
                href: "/mobile/messages",
                text: unread
                  ? `${unread} message${unread > 1 ? "s" : ""} à lire`
                  : "Messages",
              },
            ].map((c) => (
              <Link
                className="flex min-h-11 items-center rounded-full bg-white/10 px-4 font-semibold active:bg-white/20"
                href={c.href}
                key={c.href}
              >
                {c.text}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {next ? (
        <BookingCard booking={next} href={`/mobile/bookings/${next.id}`} />
      ) : (
        <NothingPlanned />
      )}

      <Section title="Réserver">
        <div className="grid grid-cols-3 gap-3 px-4">
          {activityNames.map((a) => (
            <Link
              className={cn(
                "relative flex flex-col gap-2 rounded-3xl p-1.5 pb-3 transition-transform active:scale-95",
                activityMeta[a].tint
              )}
              href={`/mobile/search?activity=${encodeURIComponent(a)}`}
              key={a}
            >
              <Photo
                alt=""
                className="aspect-square rounded-[1.25rem]"
                sizes="128px"
                src={explorePhotos.tiles[a]}
              />
              <span className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-full bg-white/85">
                <HugeiconsIcon className="size-5" icon={activityIcons[a]} />
              </span>
              <span className="px-1.5 leading-tight font-semibold">{a}</span>
              <span className="sr-only">{activityVerb[a]}</span>
            </Link>
          ))}
        </div>
      </Section>

      {todo.length > 0 && (
        <Section title="À faire">
          <Rows>
            {todo.map((t) => (
              <Row
                href={t.href}
                key={t.title}
                media={<IconDot className={t.tone} icon={t.icon} />}
                text={t.text}
                title={t.title}
              />
            ))}
          </Rows>
        </Section>
      )}

      <Section href="/mobile/pets" title="Mes animaux">
        <Carousel>
          {site.pets.map((pet) => (
            <Link
              className={cn(
                "w-40 shrink-0 snap-start rounded-3xl p-2 transition-transform active:scale-95",
                pet.tone
              )}
              href={`/mobile/pets/${pet.id}`}
              key={pet.id}
            >
              {pet.photo ? (
                <Photo
                  alt={pet.name}
                  className="aspect-square rounded-2xl"
                  sizes="160px"
                  src={pet.photo}
                />
              ) : (
                <span className="flex aspect-square items-center justify-center rounded-2xl bg-white/40 font-display text-6xl">
                  {pet.name[0]}
                </span>
              )}
              <p className="truncate px-1.5 pt-3 font-display text-3xl">
                {pet.name}
              </p>
              <p className="truncate px-1.5 pb-1 text-sm font-semibold opacity-80">
                {ageOf(pet.birth)}
              </p>
            </Link>
          ))}
          <Link
            className="flex w-40 shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed font-semibold text-muted-foreground"
            href="/mobile/pets/new"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HugeiconsIcon className="size-6" icon={PlusSignIcon} />
            </span>
            Ajouter
          </Link>
        </Carousel>
      </Section>

      {last && (
        <Section href="/mobile/pets" title="Dernières nouvelles">
          <NoteCard compact note={last} />
        </Section>
      )}

      {shortList.length > 0 && (
        <Section href="/mobile/bookings" title="Mes réservations">
          <Rows>
            {shortList.map((b) => (
              <BookingItem booking={b} key={b.id} />
            ))}
          </Rows>
        </Section>
      )}
    </div>
  )
}

/* ——— Toutes les réservations ——— */

export function MobileBookings() {
  const { bookings } = useSite()
  const [view, setView] = useState<"next" | "past">("next")
  const upcoming = bookings.filter(isUpcoming).sort(byStart)
  const past = bookings
    .filter((b) => !isUpcoming(b))
    .sort((a, b) => b.start.localeCompare(a.start))
  const groups: { label: string; list: MyBooking[] }[] = []
  for (const b of past) {
    const label = monthOf(b.start)
    const group = groups.find((g) => g.label === label)
    if (group) group.list.push(b)
    else groups.push({ label, list: [b] })
  }

  return (
    <div className="space-y-6 pb-6">
      <TopBar
        action={
          <RoundButton
            className="bg-primary text-primary-foreground"
            href="/mobile/explore"
            icon={PlusSignIcon}
            label="Réserver"
          />
        }
        back="/mobile"
      />
      <h1 className="px-4 font-display text-6xl">
        Réservations
        <Sparkle className="ms-1 inline size-9 align-top" />
      </h1>
      <Segmented
        onChange={setView}
        options={[
          { label: `À venir (${upcoming.length})`, value: "next" },
          { label: "Passées", value: "past" },
        ]}
        value={view}
      />

      {view === "next" &&
        (upcoming.length ? (
          <div className="space-y-4">
            {upcoming.map((b) => (
              <BookingCard
                booking={b}
                href={`/mobile/bookings/${b.id}`}
                key={b.id}
              />
            ))}
          </div>
        ) : (
          <NothingPlanned />
        ))}

      {view === "past" &&
        groups.map((g) => (
          <section className="space-y-2" key={g.label}>
            <h2 className="px-4 font-semibold text-muted-foreground first-letter:uppercase">
              {g.label}
            </h2>
            <Rows>
              {g.list.map((b) => (
                <BookingItem booking={b} key={b.id} />
              ))}
            </Rows>
          </section>
        ))}
    </div>
  )
}
