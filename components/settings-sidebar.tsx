"use client"

import {
  ArrowLeft01Icon,
  Calendar03Icon,
  Building03Icon,
  CircleArrowUpIcon,
  CodeIcon,
  CreditCardIcon,
  ArrowDataTransferHorizontalIcon,
  Globe02Icon,
  LinkIcon,
  Message01Icon,
  Notification03Icon,
  PlugIcon,
  PlusSignIcon,
  Search01Icon,
  Shield01Icon,
  ShieldIcon,
  SlidersHorizontalIcon,
  Store01Icon,
  UserGroupIcon,
  UserIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ActivityMark } from "@/components/activity-mark"
import { activitySettings } from "@/components/settings/data"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = { title: string; icon: IconSvgElement; href: string }

const sections: { label: string; items: NavItem[] }[] = [
  {
    items: [
      {
        href: "/settings/preferences",
        icon: SlidersHorizontalIcon,
        title: "Préférences",
      },
      { href: "/settings/profile", icon: UserIcon, title: "Profil" },
      {
        href: "/settings/notifications",
        icon: Notification03Icon,
        title: "Notifications",
      },
      {
        href: "/settings/account-security",
        icon: ShieldIcon,
        title: "Sécurité & accès",
      },
      {
        href: "/settings/connected-accounts",
        icon: LinkIcon,
        title: "Comptes connectés",
      },
    ],
    label: "Compte",
  },
  {
    items: [
      {
        href: "/settings/organization",
        icon: Building03Icon,
        title: "Établissement",
      },
      { href: "/settings/members", icon: UserGroupIcon, title: "Membres" },
      { href: "/settings/activities", icon: Store01Icon, title: "Activités" },
      {
        href: "/settings/periods",
        icon: Calendar03Icon,
        title: "Périodes tarifaires",
      },
      {
        href: "/settings/booking",
        icon: Globe02Icon,
        title: "Réservation en ligne",
      },
      {
        href: "/settings/communication",
        icon: Message01Icon,
        title: "Communication",
      },
      {
        href: "/settings/payments",
        icon: Wallet01Icon,
        title: "Paiements & factures",
      },
      { href: "/settings/integrations", icon: PlugIcon, title: "Intégrations" },
      { href: "/settings/api", icon: CodeIcon, title: "API" },
      { href: "/settings/security", icon: Shield01Icon, title: "Sécurité" },
      { href: "/settings/billing", icon: CreditCardIcon, title: "Abonnement" },
      {
        href: "/settings/import-export",
        icon: ArrowDataTransferHorizontalIcon,
        title: "Import & export",
      },
    ],
    label: "Organisation",
  },
]

export function SettingsSidebar() {
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const match = (title: string) =>
    title.toLowerCase().includes(query.trim().toLowerCase())
  const activities = activitySettings.filter((a) => match(a.name))

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/today" />}>
              <HugeiconsIcon icon={ArrowLeft01Icon} />
              <span>Retour à l&apos;application</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Rechercher un paramètre"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            value={query}
          />
        </InputGroup>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => {
          const items = section.items.filter((item) => match(item.title))
          if (items.length === 0) return null
          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={item.href === pathname}
                      render={<Link href={item.href} />}
                    >
                      <HugeiconsIcon icon={item.icon} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          )
        })}

        {(activities.length > 0 || !query) && (
          <SidebarGroup>
            <SidebarGroupLabel>Vos activités</SidebarGroupLabel>
            <SidebarMenu>
              {activities.map((activity) => {
                const href = `/settings/activities/${activity.slug}`
                return (
                  <SidebarMenuItem key={activity.slug}>
                    <SidebarMenuButton
                      isActive={
                        pathname === href || pathname.startsWith(`${href}/`)
                      }
                      render={<Link href={href} />}
                    >
                      <ActivityMark
                        activity={activity.name}
                        className="size-4 rounded text-[0.5rem]"
                      />
                      <span>{activity.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              {!query && (
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-muted-foreground">
                    <HugeiconsIcon icon={PlusSignIcon} />
                    <span>Créer une activité</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
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
        <Button
          className="rounded-full"
          render={<Link href="/settings/billing" />}
          size="sm"
          variant="outline"
        >
          <HugeiconsIcon icon={CircleArrowUpIcon} />
          Offre gratuite
        </Button>
      </SidebarFooter>
    </>
  )
}
