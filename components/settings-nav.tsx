"use client"

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useState } from "react"
import { ActivityMark } from "@/components/activity-mark"
import { activitySettings } from "@/components/settings/data"
import { settingsNav } from "@/components/settings/nav"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

const linkClass =
  "flex h-11 items-center gap-3 rounded-full px-3 font-semibold transition-colors hover:bg-muted [&_svg]:size-5"

function NavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(linkClass, active && "bg-muted")}
      href={href}
    >
      {children}
    </Link>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-sm font-semibold text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  )
}

/** Les réglages, en colonne ouverte à gauche de la page, comme la liste des messages. */
export function SettingsNav() {
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const match = (title: string) =>
    title.toLowerCase().includes(query.trim().toLowerCase())
  const activities = activitySettings.filter((a) => match(a.name))

  return (
    <nav aria-label="Paramètres" className="min-h-full space-y-6 border-e pe-4">
      <div className="space-y-4">
        <Link className="block font-display text-5xl" href="/settings">
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
      </div>

      {settingsNav.map((section) => {
        const items = section.items.filter((item) => match(item.title))
        if (items.length === 0) return null
        return (
          <Group key={section.label} label={section.label}>
            {items.map((item) => (
              <NavLink
                active={
                  pathname === item.href ||
                  (item.href === "/settings/activities" &&
                    pathname === "/settings/activities/new")
                }
                href={item.href}
                key={item.href}
              >
                <HugeiconsIcon icon={item.icon} />
                {item.title}
              </NavLink>
            ))}
          </Group>
        )
      })}

      {(activities.length > 0 || !query) && (
        <Group label="Vos activités">
          {activities.map((activity) => {
            const href = `/settings/activities/${activity.slug}`
            return (
              <NavLink
                active={pathname === href || pathname.startsWith(`${href}/`)}
                href={href}
                key={activity.slug}
              >
                <ActivityMark
                  activity={activity.name}
                  className="size-6 text-[0.6875rem]"
                />
                {activity.name}
              </NavLink>
            )
          })}
          {!query && (
            <Link
              className={cn(linkClass, "text-muted-foreground")}
              href="/settings/activities/new"
            >
              <HugeiconsIcon icon={PlusSignIcon} />
              Créer une activité
            </Link>
          )}
        </Group>
      )}
    </nav>
  )
}
