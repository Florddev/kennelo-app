"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChevronDownIcon,
  CircleArrowUpIcon,
  HelpCircleIcon,
  HistoryIcon,
  LogOutIcon,
  Moon02Icon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  Sun03Icon,
  UsersIcon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { ActivityMark } from "@/components/activity-mark"
import {
  activityNav,
  isActive,
  mainNav,
  type NavItem,
  organisationNav,
} from "@/components/navigation"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/sidebar"

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive(pathname, item.href)}
        render={<Link href={item.href} />}
      >
        <HugeiconsIcon icon={item.icon} />
        <span>{item.title}</span>
      </SidebarMenuButton>
      {item.badge ? (
        <SidebarMenuBadge>
          <span className="rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground">
            {item.badge}
          </span>
        </SidebarMenuBadge>
      ) : null}
      {item.dot && (
        <SidebarMenuBadge>
          <span className="size-2.5 rounded-full bg-destructive" />
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <>
      <SidebarHeader className="flex-row items-center justify-between p-4">
        <Menu>
          <MenuTrigger
            render={
              <Button className="h-12 gap-3 ps-1.5 pe-3" variant="ghost" />
            }
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              LC
            </span>
            <span className="text-foreground">Les Coteaux</span>
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
        <Button aria-label="Rechercher" size="icon" variant="ghost">
          <HugeiconsIcon icon={SearchIcon} />
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarMenu>
            {mainNav.map((item) => (
              <NavLink item={item} key={item.href} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Vos activités</SidebarGroupLabel>
          <SidebarMenu>
            {activityNav.map((activity) => (
              <SidebarMenuItem key={activity.name}>
                <SidebarMenuButton
                  isActive={isActive(pathname, activity.base)}
                  render={<Link href={activity.items[0].href} />}
                >
                  <ActivityMark
                    activity={activity.name}
                    className="size-6 text-[0.6875rem]"
                  />
                  <span>{activity.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Organisation</SidebarGroupLabel>
          <SidebarMenu>
            {organisationNav.map((item) => (
              <NavLink item={item} key={item.href} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-4">
        <Button
          className="w-full"
          render={<Link href="/settings/billing" />}
          variant="secondary"
        >
          <HugeiconsIcon icon={CircleArrowUpIcon} />
          Offre gratuite
        </Button>
        <div className="flex items-center justify-between">
          <Button aria-label="Aide" size="icon" variant="ghost">
            <HugeiconsIcon icon={HelpCircleIcon} />
          </Button>
          <Button aria-label="Agent" size="icon" variant="ghost">
            <HugeiconsIcon icon={SendIcon} />
          </Button>
          <Button aria-label="Historique" size="icon" variant="ghost">
            <HugeiconsIcon icon={HistoryIcon} />
          </Button>
          <Button
            aria-label="Basculer le mode sombre"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            size="icon"
            variant="ghost"
          >
            <HugeiconsIcon className="dark:hidden" icon={Moon02Icon} />
            <HugeiconsIcon className="hidden dark:block" icon={Sun03Icon} />
          </Button>
        </div>
      </SidebarFooter>
    </>
  )
}
