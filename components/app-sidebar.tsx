"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  CalendarIcon,
  ChartNoAxesColumnIcon,
  ChevronDownIcon,
  CircleArrowUpIcon,
  ClipboardIcon,
  ClipboardListIcon,
  FileTextIcon,
  InboxIcon,
  LayoutPanelLeftIcon,
  LogOutIcon,
  MessageCircleIcon,
  PlusIcon,
  ReceiptIcon,
  SearchIcon,
  SettingsIcon,
  SunDimIcon,
  SunIcon,
  UsersIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type * as React from "react"
import { type Activity, ActivityMark } from "@/components/activity-mark"
import { inboxUnreadCount } from "@/components/inbox/data"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Menu,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  icon: IconSvgElement
  href?: string
  badge?: number
  dot?: boolean
}

const primary: NavItem[] = [
  {
    badge: inboxUnreadCount,
    href: "/inbox",
    icon: InboxIcon,
    title: "Boîte de réception",
  },
  { href: "/today", icon: SunIcon, title: "Ma journée" },
]

const organisation: NavItem[] = [
  { icon: ClipboardListIcon, title: "Réservations" },
  { icon: UsersIcon, title: "Clients & animaux" },
  { icon: ReceiptIcon, title: "Facturation" },
  { dot: true, href: "/messages", icon: MessageCircleIcon, title: "Messages" },
  { icon: ChartNoAxesColumnIcon, title: "Statistiques" },
]

const activities: {
  name: Activity
  defaultOpen?: boolean
  items: NavItem[]
}[] = [
  {
    defaultOpen: true,
    items: [
      { icon: SunDimIcon, title: "Aujourd'hui" },
      { href: "/", icon: LayoutPanelLeftIcon, title: "Planning des box" },
      { icon: ClipboardIcon, title: "Séjours" },
      { icon: FileTextIcon, title: "Factures" },
    ],
    name: "Pension",
  },
  {
    items: [
      { icon: SunDimIcon, title: "Aujourd'hui" },
      { icon: CalendarIcon, title: "Rendez-vous" },
      { icon: FileTextIcon, title: "Factures" },
    ],
    name: "Toilettage",
  },
  {
    items: [
      { icon: SunDimIcon, title: "Aujourd'hui" },
      { icon: CalendarIcon, title: "Séances" },
      { icon: FileTextIcon, title: "Factures" },
    ],
    name: "Éducation",
  },
]

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={item.href === pathname}
        render={<Link href={item.href ?? "#"} />}
      >
        <HugeiconsIcon icon={item.icon} />
        <span>{item.title}</span>
      </SidebarMenuButton>
      {item.badge ? (
        <SidebarMenuBadge>
          <span className="rounded-full bg-emerald-800 px-1.5 text-white">
            {item.badge}
          </span>
        </SidebarMenuBadge>
      ) : null}
      {item.dot && (
        <SidebarMenuBadge>
          <span className="size-2 rounded-full bg-orange-500" />
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  )
}

function NavSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Collapsible defaultOpen render={<SidebarGroup />}>
      <SidebarGroupLabel
        className="group/trigger w-fit gap-1 hover:bg-sidebar-accent"
        render={<CollapsibleTrigger />}
      >
        {label}
        <HugeiconsIcon
          icon={ChevronDownIcon}
          className="size-3! -rotate-90 transition-transform group-data-panel-open/trigger:rotate-0"
        />
      </SidebarGroupLabel>
      <CollapsiblePanel>
        <SidebarMenu>{children}</SidebarMenu>
      </CollapsiblePanel>
    </Collapsible>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <>
      <SidebarHeader className="flex-row items-center justify-between">
        <Menu>
          <MenuTrigger
            render={<Button className="px-1.5" size="sm" variant="ghost" />}
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-emerald-800 text-[0.625rem] font-semibold text-white">
              LC
            </span>
            Les Coteaux
            <HugeiconsIcon icon={ChevronDownIcon} />
          </MenuTrigger>
          <MenuPopup align="start">
            <MenuLinkItem render={<Link href="/settings" />}>
              <HugeiconsIcon icon={SettingsIcon} />
              Paramètres
            </MenuLinkItem>
            <MenuItem>
              <HugeiconsIcon icon={UsersIcon} />
              Inviter des membres
            </MenuItem>
            <MenuSeparator />
            <MenuItem>
              <HugeiconsIcon icon={LogOutIcon} />
              Se déconnecter
            </MenuItem>
          </MenuPopup>
        </Menu>
        <div className="flex items-center gap-1">
          <Button aria-label="Rechercher" size="icon-sm" variant="ghost">
            <HugeiconsIcon icon={SearchIcon} />
          </Button>
          <Button aria-label="Créer" size="icon-sm" variant="outline">
            <HugeiconsIcon icon={PlusIcon} />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {primary.map((item) => (
              <NavLink item={item} key={item.title} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <NavSection label="Organisation">
          {organisation.map((item) => (
            <NavLink item={item} key={item.title} />
          ))}
        </NavSection>

        <NavSection label="Vos activités">
          {activities.map((activity) => (
            <Collapsible
              defaultOpen={activity.defaultOpen}
              key={activity.name}
              render={<SidebarMenuItem />}
            >
              <SidebarMenuButton
                className="group/trigger font-semibold"
                render={<CollapsibleTrigger />}
              >
                <ActivityMark activity={activity.name} />
                <span>{activity.name}</span>
                <HugeiconsIcon
                  icon={ChevronDownIcon}
                  className="ms-auto size-3 -rotate-90 opacity-60 transition-transform group-data-panel-open/trigger:rotate-0"
                />
              </SidebarMenuButton>
              <CollapsiblePanel>
                <SidebarMenuSub className="border-transparent">
                  {activity.items.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton
                        isActive={item.href === pathname}
                        render={<Link href={item.href ?? "#"} />}
                      >
                        <HugeiconsIcon icon={item.icon} />
                        <span>{item.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsiblePanel>
            </Collapsible>
          ))}
        </NavSection>
      </SidebarContent>

      <SidebarFooter className="flex-row items-center">
        <Button
          aria-label="Aide"
          className="rounded-full"
          size="icon-sm"
          variant="outline"
        >
          ?
        </Button>
        <Button className="rounded-full" size="sm" variant="outline">
          <HugeiconsIcon icon={CircleArrowUpIcon} />
          Offre gratuite
        </Button>
      </SidebarFooter>
    </>
  )
}
