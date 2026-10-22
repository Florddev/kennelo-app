import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  ClipboardIcon,
  ClipboardListIcon,
  InboxIcon,
  LayoutPanelLeftIcon,
  MessageCircleIcon,
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
  badge?: number
  dot?: boolean
}

export const mainNav: NavItem[] = [
  { href: "/today", icon: SunIcon, title: "Ma journée" },
  {
    badge: inboxUnreadCount,
    href: "/inbox",
    icon: InboxIcon,
    short: "Boîte",
    title: "Boîte de réception",
  },
]

export const organisationNav: NavItem[] = [
  { href: "/reservations", icon: ClipboardListIcon, title: "Réservations" },
  {
    href: "/clients",
    icon: UsersIcon,
    short: "Clients",
    title: "Clients & animaux",
  },
  { href: "/billing", icon: ReceiptIcon, title: "Facturation" },
  { dot: true, href: "/messages", icon: MessageCircleIcon, title: "Messages" },
  { href: "/statistics", icon: ChartNoAxesColumnIcon, title: "Statistiques" },
]

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
          title: "Planning des box",
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
          title: "Rendez-vous",
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
