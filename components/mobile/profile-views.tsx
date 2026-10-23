"use client"

import {
  Calendar03Icon,
  CreditCardIcon,
  FavouriteIcon,
  HelpCircleIcon,
  Logout03Icon,
  Mail01Icon,
  Moon02Icon,
  Notification01Icon,
  PawPrintIcon,
  Store01Icon,
  TextFontIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState } from "react"
import {
  IconDot,
  MobileVenueCard,
  Row,
  Rows,
  Section,
  setLargeText,
  TabHeader,
  TopBar,
  useLargeText,
} from "@/components/mobile/mobile-ui"
import { isUpcoming, me, useSite, venueOf } from "@/components/site/data"
import { Paws, Squiggle } from "@/components/site/doodles"
import { Switch } from "@/components/ui/switch"

function SwitchRow({
  icon,
  title,
  text,
  checked,
  onChange,
}: {
  icon: typeof UserIcon
  title: string
  text?: string
  checked: boolean
  onChange: (on: boolean) => void
}) {
  return (
    <label className="flex min-h-18 items-center gap-4 px-4 py-3">
      <IconDot icon={icon} />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        {text && (
          <span className="block text-[0.9375rem] text-muted-foreground">
            {text}
          </span>
        )}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}

export function MobileProfile() {
  const site = useSite()
  const { resolvedTheme, setTheme } = useTheme()
  const large = useLargeText()
  const [news, setNews] = useState(true)
  const [reminders, setReminders] = useState(true)
  const upcoming = site.bookings.filter(isUpcoming).length

  return (
    <div className="space-y-8">
      <TabHeader title="Profil" />

      <Link
        className="relative mx-4 flex items-center gap-4 overflow-hidden rounded-4xl bg-wise-forest p-5 text-white active:opacity-90"
        href="/mobile/profile/settings"
      >
        <Squiggle className="absolute -right-10 -bottom-12 w-40" />
        <span className="relative flex size-18 shrink-0 items-center justify-center rounded-full bg-wise-green font-display text-3xl text-wise-forest">
          {me.first[0]}
          {me.last[0]}
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block font-display text-4xl leading-none text-wise-green">
            {me.first} {me.last}
          </span>
          <span className="mt-1 block truncate text-white/70">{me.email}</span>
          <span className="mt-1 block font-semibold underline underline-offset-4">
            Modifier mes informations
          </span>
        </span>
      </Link>

      <Section title="Mon activité">
        <Rows>
          <Row
            href="/mobile/bookings"
            media={<IconDot icon={Calendar03Icon} />}
            text={upcoming ? `${upcoming} à venir` : "Aucune à venir"}
            title="Mes réservations"
          />
          <Row
            href="/mobile/pets"
            media={<IconDot icon={PawPrintIcon} />}
            text={site.pets.map((p) => p.name).join(", ")}
            title="Mes animaux"
          />
          <Row
            href="/mobile/favorites"
            media={<IconDot icon={FavouriteIcon} />}
            text={`${site.favorites.length} établissement${site.favorites.length > 1 ? "s" : ""}`}
            title="Mes favoris"
          />
        </Rows>
      </Section>

      <Section title="Mon compte">
        <Rows>
          <Row
            href="/mobile/profile/settings"
            media={<IconDot icon={UserIcon} />}
            text="Nom, e-mail, téléphone, adresse"
            title="Informations personnelles"
          />
          <Row
            href="/mobile/profile/settings"
            media={<IconDot icon={CreditCardIcon} />}
            text={me.card}
            title="Moyen de paiement"
          />
        </Rows>
      </Section>

      <Section title="Confort de lecture">
        <Rows>
          <SwitchRow
            checked={large}
            icon={TextFontIcon}
            onChange={setLargeText}
            text="Tout le texte de l'app, en plus grand"
            title="Texte plus grand"
          />
          <SwitchRow
            checked={resolvedTheme === "dark"}
            icon={Moon02Icon}
            onChange={(on) => setTheme(on ? "dark" : "light")}
            text="Plus reposant le soir"
            title="Mode sombre"
          />
        </Rows>
      </Section>

      <Section title="Notifications">
        <Rows>
          <SwitchRow
            checked={news}
            icon={PawPrintIcon}
            onChange={setNews}
            text="Quand un établissement laisse un mot"
            title="Nouvelles de mes animaux"
          />
          <SwitchRow
            checked={reminders}
            icon={Notification01Icon}
            onChange={setReminders}
            text="La veille, et pour les vaccins"
            title="Rappels"
          />
        </Rows>
      </Section>

      <Section title="Aide">
        <Rows>
          <Row
            href="/mobile/profile"
            media={<IconDot icon={HelpCircleIcon} />}
            text="Réserver, annuler, payer"
            title="Questions fréquentes"
          />
          <Row
            href="/mobile/messages"
            media={<IconDot icon={Mail01Icon} />}
            text="Une réponse en moins de 24 h"
            title="Contacter Kennelo"
          />
          <Row
            href="/"
            media={<IconDot icon={Store01Icon} />}
            text="Vous avez un établissement ?"
            title="Espace pro"
          />
          <Row
            chevron={false}
            className="text-destructive-foreground"
            href="/login"
            media={<IconDot icon={Logout03Icon} />}
            title="Se déconnecter"
          />
        </Rows>
      </Section>

      <p className="px-4 pb-2 text-center text-sm text-muted-foreground">
        Kennelo · version 1.0
      </p>
    </div>
  )
}

export function MobileFavorites() {
  const { favorites } = useSite()
  const list = favorites.flatMap((slug) => venueOf(slug) ?? [])
  return (
    <div className="space-y-6 pb-6">
      <TopBar back="/mobile/profile" />
      <h1 className="px-4 font-display text-6xl">
        Favoris
        <Paws className="ms-2 text-4xl" />
      </h1>
      {list.length ? (
        <div className="space-y-8 px-4">
          {list.map((v) => (
            <MobileVenueCard key={v.slug} venue={v} />
          ))}
        </div>
      ) : (
        <div className="mx-4 space-y-3 rounded-3xl bg-muted p-6 text-center">
          <HugeiconsIcon className="mx-auto size-10" icon={FavouriteIcon} />
          <p className="text-lg font-semibold">Pas encore de favori</p>
          <p className="text-muted-foreground">
            Touchez le cœur sur un établissement pour le retrouver ici.
          </p>
          <Link
            className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground"
            href="/mobile/explore"
          >
            Explorer
          </Link>
        </div>
      )}
    </div>
  )
}
