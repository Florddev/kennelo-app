import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  ClipboardIcon,
  ClipboardListIcon,
  InboxIcon,
  LayoutPanelLeftIcon,
  MessageCircleIcon,
  PawPrintIcon,
  ReceiptIcon,
  SunDimIcon,
  SunIcon,
  UsersIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import type { Activity } from "@/components/activity-mark"
import { inboxUnreadCount } from "@/components/inbox/data"

export type NavItem = {
  title: string
  /** Libellé court de la barre d'onglets mobile. */
  short?: string
  icon: IconSvgElement
  href: string
  /** Autres adresses qui rendent l'onglet actif. */
  match?: string[]
  badge?: number
  dot?: boolean
}

/** Onglets de la barre du haut ; les quatre premiers vont en bas sur mobile. */
export const hostTabs: NavItem[] = [
  { href: "/today", icon: SunIcon, title: "Ma journée" },
  {
    href: "/pension/today",
    icon: PawPrintIcon,
    match: ["/pension", "/grooming", "/training"],
    title: "Activités",
  },
  { href: "/reservations", icon: ClipboardListIcon, title: "Réservations" },
  { href: "/clients", icon: UsersIcon, title: "Clients" },
  { href: "/billing", icon: ReceiptIcon, title: "Facturation" },
]

export const inboxLink: NavItem = {
  badge: inboxUnreadCount,
  href: "/inbox",
  icon: InboxIcon,
  title: "Boîte de réception",
}

export const messagesLink: NavItem = {
  dot: true,
  href: "/messages",
  icon: MessageCircleIcon,
  title: "Messages",
}

export const statsLink: NavItem = {
  href: "/statistics",
  icon: ChartNoAxesColumnIcon,
  title: "Statistiques",
}

/** Une entrée par activité dans la barre latérale, ses pages en onglets. */
export const activityNav: { name: Activity; base: string; items: NavItem[] }[] =
  [
    {
      base: "/pension",
      items: [
        { href: "/pension/today", icon: SunDimIcon, title: "Aujourd'hui" },
        {
          href: "/pension/planning",
          icon: LayoutPanelLeftIcon,
          title: "Calendrier",
        },
        { href: "/pension/stays", icon: ClipboardIcon, title: "Séjours" },
      ],
      name: "Pension",
    },
    {
      base: "/grooming",
      items: [
        { href: "/grooming/today", icon: SunDimIcon, title: "Aujourd'hui" },
        {
          href: "/grooming/appointments",
          icon: CalendarIcon,
          title: "Calendrier",
        },
      ],
      name: "Toilettage",
    },
    {
      base: "/training",
      items: [
        { href: "/training/today", icon: SunDimIcon, title: "Aujourd'hui" },
        { href: "/training/sessions", icon: CalendarIcon, title: "Séances" },
      ],
      name: "Éducation",
    },
  ]

export const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

export const isTabActive = (pathname: string, item: NavItem) =>
  [item.href, ...(item.match ?? [])].some((href) => isActive(pathname, href))
