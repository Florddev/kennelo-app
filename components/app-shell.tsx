"use client"

import {
  CircleArrowUpIcon,
  Compass01Icon,
  LogOutIcon,
  Menu01Icon,
  Moon02Icon,
  ReceiptIcon,
  SettingsIcon,
  Store01Icon,
  Sun03Icon,
  UsersIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { type ReactNode, useState } from "react"
import {
  hostTabs,
  inboxLink,
  isTabActive,
  messagesLink,
  type NavItem,
  statsLink,
} from "@/components/navigation"
import { venueOf } from "@/components/site/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Menu,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { cn } from "@/lib/utils"

/** L'établissement connecté, avec sa couleur du site. */
const place = venueOf("les-coteaux")!
const placeInitials = place.name
  .split(" ")
  .map((w) => w[0])
  .join("")

/** Le reste de l'espace pro : dans le menu de l'établissement et « Plus ». */
const moreLinks: { href: string; icon: IconSvgElement; title: string }[][] = [
  [
    statsLink,
    { href: "/settings", icon: SettingsIcon, title: "Paramètres" },
    {
      href: "/settings/members",
      icon: UsersIcon,
      title: "Inviter des membres",
    },
    {
      href: "/settings/billing",
      icon: CircleArrowUpIcon,
      title: "Offre gratuite",
    },
  ],
  [
    {
      href: `/places/${place.slug}`,
      icon: Store01Icon,
      title: "Voir ma page publique",
    },
    { href: "/explore", icon: Compass01Icon, title: "Passer côté client" },
  ],
]

function Wordmark() {
  return (
    <Link
      aria-label="Kennelo Pro, ma journée"
      className="flex shrink-0 items-center gap-2"
      href="/today"
    >
      <span className="font-display text-3xl text-link">Kennelo</span>
      <span className="rounded-full bg-wise-forest px-2.5 py-1 text-xs font-bold tracking-wide text-wise-green uppercase">
        Pro
      </span>
    </Link>
  )
}

function PlaceAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={cn("size-10", className)}>
      <AvatarFallback className={cn("font-semibold", place.tone)}>
        {placeInitials}
      </AvatarFallback>
    </Avatar>
  )
}

/** Bouton rond avec compteur, comme « Messages » sur le site. */
function IconLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  return (
    <Button
      aria-current={isTabActive(pathname, item) ? "page" : undefined}
      aria-label={
        item.badge ? `${item.title}, ${item.badge} non lus` : item.title
      }
      className="relative aria-[current=page]:bg-control aria-[current=page]:text-control-foreground"
      render={<Link href={item.href} />}
      size="icon"
      variant="secondary"
    >
      <HugeiconsIcon icon={item.icon} />
      {item.badge ? (
        <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-white">
          {item.badge}
        </span>
      ) : null}
      {item.dot && (
        <span className="absolute top-0.5 right-0.5 size-2.5 rounded-full bg-destructive ring-2 ring-background" />
      )}
    </Button>
  )
}

function ThemeIcon() {
  return (
    <>
      <HugeiconsIcon className="dark:hidden" icon={Moon02Icon} />
      <HugeiconsIcon className="hidden dark:block" icon={Sun03Icon} />
    </>
  )
}

function useToggleTheme() {
  const { resolvedTheme, setTheme } = useTheme()
  return () => setTheme(resolvedTheme === "dark" ? "light" : "dark")
}

function PlaceMenu() {
  const toggleTheme = useToggleTheme()
  return (
    <Menu>
      <MenuTrigger
        render={
          <button
            aria-label={`Menu ${place.name}`}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring max-lg:hidden"
            type="button"
          />
        }
      >
        <PlaceAvatar />
      </MenuTrigger>
      <MenuPopup align="end" className="min-w-64">
        <div className="px-2 py-1.5">
          <p className="font-semibold">{place.name}</p>
          <p className="text-sm text-muted-foreground">Espace professionnel</p>
        </div>
        {moreLinks.map((group) => (
          <div key={group[0].href}>
            <MenuSeparator />
            {group.map((link) => (
              <MenuLinkItem key={link.href} render={<Link href={link.href} />}>
                <HugeiconsIcon icon={link.icon} />
                {link.title}
              </MenuLinkItem>
            ))}
          </div>
        ))}
        <MenuSeparator />
        <MenuItem onClick={toggleTheme}>
          <ThemeIcon />
          Mode sombre
        </MenuItem>
        <MenuLinkItem render={<Link href="/login" />}>
          <HugeiconsIcon icon={LogOutIcon} />
          Se déconnecter
        </MenuLinkItem>
      </MenuPopup>
    </Menu>
  )
}

const tabClass =
  "flex flex-col items-center gap-1 py-2 text-[0.6875rem] font-semibold text-muted-foreground"
const pillClass = "flex h-8 w-14 items-center justify-center rounded-full"

const rowClass =
  "flex min-h-14 w-full items-center gap-4 rounded-2xl px-3 text-start text-lg font-semibold active:bg-neutral-hover"
const rowIcon =
  "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted"

/** « Plus » sur mobile : tout ce qui n'a pas d'onglet, en grandes lignes. */
function MoreDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const toggleTheme = useToggleTheme()
  const close = () => onOpenChange(false)
  const groups = [
    [
      { href: "/billing", icon: ReceiptIcon, title: "Facturation" },
      ...moreLinks[0],
    ],
    moreLinks[1],
  ]
  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerPopup showBar>
        <DrawerHeader className="flex-row items-center gap-3">
          <PlaceAvatar className="size-12" />
          <div>
            <DrawerTitle className="font-display text-3xl">
              {place.name}
            </DrawerTitle>
            <p className="text-muted-foreground">Espace professionnel</p>
          </div>
        </DrawerHeader>
        <DrawerPanel className="space-y-4">
          {groups.map((group) => (
            <div className="rounded-3xl bg-muted/50 p-1" key={group[0].href}>
              {group.map((link) => (
                <Link
                  className={rowClass}
                  href={link.href}
                  key={link.href}
                  onClick={close}
                >
                  <span className={rowIcon}>
                    <HugeiconsIcon className="size-5" icon={link.icon} />
                  </span>
                  {link.title}
                </Link>
              ))}
            </div>
          ))}
          <div className="rounded-3xl bg-muted/50 p-1">
            <button className={rowClass} onClick={toggleTheme} type="button">
              <span className={rowIcon}>
                <ThemeIcon />
              </span>
              Mode sombre
            </button>
            <Link className={rowClass} href="/login" onClick={close}>
              <span className={rowIcon}>
                <HugeiconsIcon className="size-5" icon={LogOutIcon} />
              </span>
              Se déconnecter
            </Link>
          </div>
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  )
}

/** Barre d'onglets mobile et tablette : les mêmes onglets qu'en haut. */
function BottomNav() {
  const pathname = usePathname()
  const [more, setMore] = useState(false)
  return (
    <nav className="grid shrink-0 grid-cols-5 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
      {hostTabs.slice(0, 4).map((tab) => {
        const active = isTabActive(pathname, tab)
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(tabClass, active && "text-foreground")}
            href={tab.href}
            key={tab.href}
          >
            <span
              className={cn(
                pillClass,
                active && "bg-primary text-primary-foreground"
              )}
            >
              <HugeiconsIcon className="size-5" icon={tab.icon} />
            </span>
            {tab.short ?? tab.title}
          </Link>
        )
      })}
      <button className={tabClass} onClick={() => setMore(true)} type="button">
        <span className={pillClass}>
          <HugeiconsIcon className="size-5" icon={Menu01Icon} />
        </span>
        Plus
      </button>
      <MoreDrawer onOpenChange={setMore} open={more} />
    </nav>
  )
}

/** La même barre que le site, avec les onglets du pro. */
function Header() {
  const pathname = usePathname()
  return (
    <header className="shrink-0 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-[110rem] items-center gap-6 px-4 md:h-20 md:px-10">
        <Wordmark />
        <nav
          aria-label="Espace pro"
          className="flex flex-1 items-center gap-1 max-lg:hidden"
        >
          {hostTabs.map((tab) => {
            const active = isTabActive(pathname, tab)
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center rounded-full px-4 font-semibold transition-colors hover:bg-accent",
                  active && "bg-secondary"
                )}
                href={tab.href}
                key={tab.href}
              >
                {tab.title}
              </Link>
            )
          })}
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <IconLink item={inboxLink} />
          <IconLink item={messagesLink} />
          <PlaceMenu />
        </div>
      </div>
    </header>
  )
}

export function AppShell({
  aside,
  children,
}: {
  /** Navigation secondaire, à gauche sur grand écran (paramètres). */
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex h-svh flex-col bg-background">
      <Header />
      <div
        className={cn(
          "flex min-h-0 flex-1",
          // Même largeur que les messages : la colonne de gauche s'aligne sur le logo.
          aside && "mx-auto w-full max-w-[110rem] lg:px-10"
        )}
      >
        {aside && (
          <aside className="w-80 shrink-0 overflow-y-auto py-6 max-lg:hidden xl:w-96">
            {aside}
          </aside>
        )}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
