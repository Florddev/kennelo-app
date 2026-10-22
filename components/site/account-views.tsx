"use client"

import {
  Alert02Icon,
  Clock01Icon,
  CreditCardIcon,
  HelpCircleIcon,
  Logout03Icon,
  Mail01Icon,
  Message01Icon,
  Notification01Icon,
  PlusSignIcon,
  Settings01Icon,
  StarIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import type { ReactNode } from "react"
import { BookingHero } from "@/components/site/booking-detail"
import {
  ageOf,
  isUpcoming,
  me,
  petAlerts,
  useSite,
  vaxStatus,
  venueOf,
} from "@/components/site/data"
import {
  BookingRow,
  PetAvatar,
  Photo,
  RowsCard,
  SeeAll,
  SitePage,
  VenueCard,
  VenueLogo,
} from "@/components/site/site-ui"
import { dayMonth, shortIso } from "@/components/services/data"
import {
  LinkRow,
  options,
  SettingsGroups,
  SettingsPage,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-ui"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

/* ——— Accueil du compte ——— */

const monthNames = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
]
const monthOf = (iso: string) =>
  `${monthNames[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`

function Panel({
  title,
  action,
  className,
  children,
}: {
  title: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn("space-y-4 rounded-3xl border bg-card p-6", className)}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function NothingPlanned() {
  return (
    <div className="flex h-full min-h-56 flex-col items-start justify-end gap-4 rounded-3xl bg-wise-green p-6 text-wise-forest md:p-8">
      <p className="font-display text-5xl md:text-6xl">Rien de prévu</p>
      <p className="text-lg">
        Une pension pour les vacances, un toilettage avant l&apos;été ?
      </p>
      <Button
        className="bg-wise-forest text-wise-green hover:bg-wise-forest/90"
        render={<Link href="/search" />}
        size="lg"
      >
        Trouver un établissement
      </Button>
    </div>
  )
}

export function AccountHome() {
  const site = useSite()
  const upcoming = site.bookings
    .filter(isUpcoming)
    .sort((a, b) => a.start.localeCompare(b.start))
  const next = upcoming[0]
  const unread = site.threads.reduce((n, t) => n + t.unread, 0)
  const last = [...site.notes].sort((a, b) => b.date.localeCompare(a.date))[0]
  const lastBooking = last && site.bookings.find((b) => b.id === last.booking)
  const lastVenue = lastBooking && venueOf(lastBooking.venue)
  const lastPet = last && site.pets.find((p) => p.id === last.pet)
  const todo: {
    href: string
    icon: IconSvgElement
    tone: string
    title: string
    text: string
  }[] = [
    ...site.pets.flatMap((pet) =>
      petAlerts(pet).map((v) => ({
        href: `/me/pets/${pet.id}`,
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
        href: `/me/bookings/${b.id}`,
        icon: Clock01Icon,
        text: `${venueOf(b.venue)?.name} vous répond bientôt`,
        title: `Demande du ${shortIso(b.start).toLowerCase()}`,
        tone: "bg-muted",
      })),
    ...site.bookings
      .filter((b) => b.status === "done" && !b.reviewed)
      .map((b) => ({
        href: `/me/bookings/${b.id}`,
        icon: StarIcon,
        text: "Ça prend 30 secondes",
        title: `Votre avis sur ${venueOf(b.venue)?.name}`,
        tone: "bg-success-soft",
      })),
    ...(unread
      ? [
          {
            href: "/me/messages",
            icon: Message01Icon,
            text: "Les établissements vous ont écrit",
            title: `${unread} message${unread > 1 ? "s" : ""} non lu${unread > 1 ? "s" : ""}`,
            tone: "bg-info-soft",
          },
        ]
      : []),
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-10 md:py-10">
      <header className="flex flex-wrap items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="bg-secondary text-xl font-semibold">
            {me.first[0]}
            {me.last[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl font-semibold md:text-4xl">
            Bonjour {me.first}
          </h1>
          <p className="text-muted-foreground">{me.email}</p>
        </div>
        <Button render={<Link href="/me/settings" />} variant="secondary">
          <HugeiconsIcon icon={Settings01Icon} />
          Paramètres
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {next ? (
            <BookingHero
              booking={next}
              compact
              href={`/me/bookings/${next.id}`}
            />
          ) : (
            <NothingPlanned />
          )}
        </div>

        <Panel title="À faire">
          {todo.length ? (
            <ul className="-mx-2 space-y-1">
              {todo.map((t) => (
                <li key={t.title}>
                  <Link
                    className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-accent"
                    href={t.href}
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        t.tone
                      )}
                    >
                      <HugeiconsIcon className="size-5" icon={t.icon} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{t.title}</span>
                      <span className="block text-sm text-muted-foreground">
                        {t.text}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Tout est en ordre.</p>
          )}
        </Panel>

        <Panel
          action={<SeeAll href="/me/pets" />}
          className="lg:col-span-2"
          title="Mes animaux"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {site.pets.map((pet) => (
              <Link
                className={cn(
                  "flex flex-col overflow-hidden rounded-3xl p-2 transition-transform hover:scale-[0.98]",
                  pet.tone
                )}
                href={`/me/pets/${pet.id}`}
                key={pet.id}
              >
                {pet.photo ? (
                  <Photo
                    alt={pet.name}
                    className="aspect-square rounded-2xl"
                    sizes="240px"
                    src={pet.photo}
                  />
                ) : (
                  <span className="flex aspect-square items-center justify-center rounded-2xl bg-white/40 font-display text-6xl">
                    {pet.name[0]}
                  </span>
                )}
                <p className="truncate px-2 pt-3 font-display text-3xl">
                  {pet.name}
                </p>
                <p className="truncate px-2 pb-2 text-sm font-semibold opacity-80">
                  {pet.breed} · {ageOf(pet.birth)}
                </p>
              </Link>
            ))}
            <Link
              className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              href="/me/pets/new"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HugeiconsIcon className="size-6" icon={PlusSignIcon} />
              </span>
              Ajouter
            </Link>
          </div>
        </Panel>

        <Panel title="Le dernier mot des pros">
          {last && lastVenue && lastPet ? (
            <Link
              className="group block space-y-4"
              href={`/me/pets/${lastPet.id}`}
            >
              <div className="flex items-center gap-3">
                <VenueLogo venue={lastVenue} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{lastVenue.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {last.author} · {dayMonth(last.date)}
                  </p>
                </div>
              </div>
              <p className="line-clamp-5 text-lg text-pretty">
                « {last.text} »
              </p>
              <span className="flex items-center gap-2 font-semibold text-link group-hover:underline">
                <PetAvatar className="size-8 text-base" pet={lastPet} />
                Voir le profil de {lastPet.name}
              </span>
            </Link>
          ) : (
            <p className="text-muted-foreground">
              Après chaque visite, l&apos;établissement pourra laisser un mot
              sur votre animal.
            </p>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SettingsSection title="Votre compte">
          <LinkRow
            description="Nom, e-mail, téléphone, adresse"
            href="/me/settings"
            icon={UserIcon}
            title="Informations personnelles"
          />
          <LinkRow
            href="/me/settings"
            icon={CreditCardIcon}
            title="Moyens de paiement"
            value={me.card}
          />
          <LinkRow
            description="Rappels, nouvelles de vos animaux"
            href="/me/settings"
            icon={Notification01Icon}
            title="Notifications"
          />
        </SettingsSection>
        <SettingsSection title="Aide">
          <LinkRow
            description="Réserver, annuler, payer"
            href="/me"
            icon={HelpCircleIcon}
            title="Questions fréquentes"
          />
          <LinkRow
            description="Une réponse en moins de 24 h"
            href="/me/messages"
            icon={Mail01Icon}
            title="Contacter Kennelo"
          />
          <LinkRow href="/login" icon={Logout03Icon} title="Se déconnecter" />
        </SettingsSection>
      </div>
    </div>
  )
}

/* ——— Réservations ——— */

export function BookingsView() {
  const { bookings } = useSite()
  const [next, ...later] = bookings
    .filter(isUpcoming)
    .sort((a, b) => a.start.localeCompare(b.start))
  const past = bookings
    .filter((b) => !isUpcoming(b))
    .sort((a, b) => b.start.localeCompare(a.start))
  const groups: { label: string; list: typeof past }[] = []
  for (const b of past) {
    const label = monthOf(b.start)
    const group = groups.find((g) => g.label === label)
    if (group) group.list.push(b)
    else groups.push({ label, list: [b] })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-10 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-3xl font-semibold md:text-4xl">
          Réservations
        </h1>
        <Button render={<Link href="/search" />}>
          <HugeiconsIcon icon={PlusSignIcon} />
          Réserver
        </Button>
      </div>

      {next ? (
        <BookingHero booking={next} compact href={`/me/bookings/${next.id}`} />
      ) : (
        <NothingPlanned />
      )}

      {later.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">Aussi à venir</h2>
          <RowsCard>
            {later.map((b) => (
              <BookingRow booking={b} key={b.id} />
            ))}
          </RowsCard>
        </section>
      )}

      {groups.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-heading text-xl font-semibold">Historique</h2>
          {groups.map((g) => (
            <div className="space-y-2" key={g.label}>
              <p className="font-semibold text-muted-foreground first-letter:uppercase">
                {g.label}
              </p>
              <RowsCard>
                {g.list.map((b) => (
                  <BookingRow booking={b} key={b.id} />
                ))}
              </RowsCard>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

/* ——— Favoris ——— */

export function FavoritesView() {
  const { favorites } = useSite()
  const list = favorites.flatMap((slug) => venueOf(slug) ?? [])
  return (
    <SitePage className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold md:text-4xl">
          Favoris
        </h1>
        <p className="text-muted-foreground">
          Les adresses que vous avez gardées de côté.
        </p>
      </div>
      {list.length ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {list.map((venue) => (
            <VenueCard key={venue.slug} venue={venue} />
          ))}
        </div>
      ) : (
        <Empty className="rounded-3xl bg-muted py-16">
          <EmptyHeader>
            <EmptyTitle>Aucun favori</EmptyTitle>
            <EmptyDescription>
              Touchez le cœur d&apos;un établissement pour le retrouver ici.
            </EmptyDescription>
          </EmptyHeader>
          <Button render={<Link href="/explore" />}>Découvrir</Button>
        </Empty>
      )}
    </SitePage>
  )
}

/* ——— Paramètres ——— */

export function AccountSettings({ mobile }: { mobile?: boolean }) {
  return (
    <SettingsPage
      back={
        mobile
          ? { href: "/mobile/profile", label: "Profil" }
          : { href: "/me", label: "Compte" }
      }
      title="Paramètres"
    >
      <SettingsGroups
        groups={[
          {
            settings: [
              { defaultValue: me.first, title: "Prénom", type: "input" },
              { defaultValue: me.last, title: "Nom", type: "input" },
              { defaultValue: me.email, title: "E-mail", type: "input" },
              { defaultValue: me.phone, title: "Téléphone", type: "input" },
              { defaultValue: me.address, title: "Adresse", type: "input" },
              {
                defaultValue: "Français",
                items: options("Français", "English"),
                title: "Langue",
                type: "select",
              },
            ],
            title: "Vos informations",
          },
        ]}
      />
      <SettingsSection
        action={<Button variant="secondary">Ajouter une carte</Button>}
        title="Paiement"
      >
        <SettingsRow
          description="Expire en 08/28 · utilisée par défaut"
          media={
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon className="size-5" icon={CreditCardIcon} />
            </span>
          }
          title={me.card}
        >
          <Button variant="ghost">Retirer</Button>
        </SettingsRow>
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            description: "Par e-mail et sur votre téléphone",
            settings: [
              {
                defaultChecked: true,
                description: "La veille et le jour même",
                title: "Rappels de réservation",
                type: "switch",
              },
              {
                defaultChecked: true,
                description: "Photos et messages pendant un séjour",
                title: "Nouvelles de mes animaux",
                type: "switch",
              },
              {
                defaultChecked: true,
                description: "Rappel avant la date d'expiration",
                title: "Vaccins à renouveler",
                type: "switch",
              },
              {
                defaultChecked: false,
                title: "Bons plans Kennelo",
                type: "switch",
              },
            ],
            title: "Notifications",
          },
          {
            settings: [
              {
                label: "Modifier",
                title: "Mot de passe",
                type: "button",
              },
              {
                defaultChecked: true,
                title: "Connexion avec Google",
                type: "switch",
              },
            ],
            title: "Sécurité",
          },
        ]}
      />
      <SettingsSection title="Zone sensible">
        <SettingsRow
          description="Vos réservations passées et vos animaux seront effacés."
          media={
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive-foreground">
              <HugeiconsIcon className="size-5" icon={Settings01Icon} />
            </span>
          }
          title="Supprimer mon compte"
        >
          <Button variant="destructive-outline">Supprimer</Button>
        </SettingsRow>
      </SettingsSection>
    </SettingsPage>
  )
}
