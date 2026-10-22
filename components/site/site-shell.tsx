"use client"

import {
  Calendar03Icon,
  Compass01Icon,
  FavouriteIcon,
  Logout03Icon,
  Message01Icon,
  PawPrintIcon,
  Search01Icon,
  Settings01Icon,
  Store01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { me, useSite } from "@/components/site/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Menu,
  MenuLinkItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/explore", icon: Compass01Icon, title: "Découvrir" },
  { href: "/search", icon: Search01Icon, title: "Rechercher" },
  { href: "/me/bookings", icon: Calendar03Icon, title: "Réservations" },
  { href: "/me/pets", icon: PawPrintIcon, title: "Animaux" },
  { href: "/me", icon: UserCircleIcon, title: "Compte" },
]

/** L'onglet actif : celui dont l'adresse correspond le plus longuement. */
const activeTab = (pathname: string) =>
  tabs
    .filter((t) => pathname === t.href || pathname.startsWith(`${t.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

const initials = `${me.first[0]}${me.last[0]}`

function AccountMenu() {
  return (
    <Menu>
      <MenuTrigger
        render={
          <button
            aria-label="Mon compte"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
          />
        }
      >
        <Avatar className="size-10">
          <AvatarFallback className="bg-secondary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </MenuTrigger>
      <MenuPopup align="end" className="min-w-56">
        <div className="px-2 py-1.5">
          <p className="font-semibold">
            {me.first} {me.last}
          </p>
          <p className="text-sm text-muted-foreground">{me.email}</p>
        </div>
        <MenuSeparator />
        <MenuLinkItem render={<Link href="/me" />}>
          <HugeiconsIcon icon={UserCircleIcon} />
          Mon compte
        </MenuLinkItem>
        <MenuLinkItem render={<Link href="/me/favorites" />}>
          <HugeiconsIcon icon={FavouriteIcon} />
          Mes favoris
        </MenuLinkItem>
        <MenuLinkItem render={<Link href="/me/settings" />}>
          <HugeiconsIcon icon={Settings01Icon} />
          Paramètres
        </MenuLinkItem>
        <MenuSeparator />
        <MenuLinkItem render={<Link href="/today" />}>
          <HugeiconsIcon icon={Store01Icon} />
          Espace professionnel
        </MenuLinkItem>
        <MenuLinkItem render={<Link href="/login" />}>
          <HugeiconsIcon icon={Logout03Icon} />
          Se déconnecter
        </MenuLinkItem>
      </MenuPopup>
    </Menu>
  )
}

function Header() {
  const pathname = usePathname()
  const active = activeTab(pathname)
  const unread = useSite().threads.reduce((n, t) => n + t.unread, 0)
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 md:h-20 md:px-10">
        <Link className="font-display text-3xl text-link" href="/explore">
          Kennelo
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {tabs.slice(0, 4).map((tab) => (
            <Link
              aria-current={active === tab.href ? "page" : undefined}
              className={cn(
                "flex h-10 items-center rounded-full px-4 font-semibold transition-colors hover:bg-accent",
                active === tab.href && "bg-secondary"
              )}
              href={tab.href}
              key={tab.href}
            >
              {tab.title}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <Button
            aria-label="Messages"
            className="relative"
            render={<Link href="/me/messages" />}
            size="icon"
            variant="secondary"
          >
            <HugeiconsIcon icon={Message01Icon} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-white">
                {unread}
              </span>
            )}
          </Button>
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}

/** Barre d'onglets mobile, comme l'appli Wise. */
function BottomNav() {
  const pathname = usePathname()
  const active = activeTab(pathname)
  if (pathname.startsWith("/places/")) return null
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {tabs.map((tab) => (
        <Link
          aria-current={active === tab.href ? "page" : undefined}
          className={cn(
            "flex flex-col items-center gap-1 py-2 text-[0.6875rem] font-semibold text-muted-foreground",
            active === tab.href && "text-foreground"
          )}
          href={tab.href}
          key={tab.href}
        >
          <span
            className={cn(
              "flex h-8 w-14 items-center justify-center rounded-full",
              active === tab.href && "bg-primary text-primary-foreground"
            )}
          >
            <HugeiconsIcon className="size-5" icon={tab.icon} />
          </span>
          {tab.title}
        </Link>
      ))}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="mt-12 bg-wise-forest text-white max-md:pb-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[2fr_1fr_1fr] md:px-10">
        <div className="space-y-3">
          <p className="font-display text-4xl text-wise-green">Kennelo</p>
          <p className="max-w-sm text-white/70">
            Pensions, toilettage et éducation près de chez vous. Réservez en
            quelques minutes, payez en toute sécurité.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-wise-green">Propriétaires</p>
          <Link className="block text-white/70 hover:text-white" href="/search">
            Trouver un établissement
          </Link>
          <Link
            className="block text-white/70 hover:text-white"
            href="/me/pets"
          >
            Mes animaux
          </Link>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-wise-green">Professionnels</p>
          <Link className="block text-white/70 hover:text-white" href="/today">
            Espace professionnel
          </Link>
          <Link
            className="block text-white/70 hover:text-white"
            href="/settings/billing"
          >
            Nos offres
          </Link>
        </div>
      </div>
    </footer>
  )
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  )
}
