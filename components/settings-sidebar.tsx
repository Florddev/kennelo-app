"use client"

import {
  ArrowLeft01Icon,
  CircleArrowUpIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ActivityMark } from "@/components/activity-mark"
import { activitySettings } from "@/components/settings/data"
import { settingsNav } from "@/components/settings/nav"
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

export function SettingsSidebar() {
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const match = (title: string) =>
    title.toLowerCase().includes(query.trim().toLowerCase())
  const activities = activitySettings.filter((a) => match(a.name))

  return (
    <>
      <SidebarHeader className="gap-4 p-4">
        <Button
          className="h-12 w-fit gap-3 ps-1.5 pe-4"
          render={<Link href="/today" />}
          variant="ghost"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-muted">
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </span>
          <span className="text-foreground">Retour à l&apos;application</span>
        </Button>
        <Link className="px-2 text-2xl font-semibold" href="/settings">
          Paramètres
        </Link>
        <InputGroup className="rounded-full">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Rechercher un paramètre"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher"
            value={query}
          />
        </InputGroup>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {settingsNav.map((section) => {
          const items = section.items.filter((item) => match(item.title))
          if (items.length === 0) return null
          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={
                        pathname === item.href ||
                        (item.href === "/settings/activities" &&
                          pathname === "/settings/activities/new")
                      }
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
                        className="size-6 text-[0.6875rem]"
                      />
                      <span>{activity.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              {!query && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="text-muted-foreground"
                    render={<Link href="/settings/activities/new" />}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} />
                    <span>Créer une activité</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          className="w-full"
          render={<Link href="/settings/billing" />}
          variant="secondary"
        >
          <HugeiconsIcon icon={CircleArrowUpIcon} />
          Offre gratuite
        </Button>
      </SidebarFooter>
    </>
  )
}
