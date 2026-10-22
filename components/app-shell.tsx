"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type * as React from "react"
import { isActive, mainNav, organisationNav } from "@/components/navigation"
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const tabs = [...mainNav, ...organisationNav.slice(0, 2)]

const tabClass =
  "flex flex-col items-center gap-1 py-2 text-[0.6875rem] font-semibold text-muted-foreground"
const pillClass = "flex h-8 w-14 items-center justify-center rounded-full"

/** Barre d'onglets mobile : les pages du quotidien et « Plus » pour le reste. */
function BottomNav() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  return (
    <nav className="grid shrink-0 grid-cols-5 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {tabs.map((tab) => {
        const active = isActive(pathname, tab.href)
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
      <button
        className={tabClass}
        onClick={() => setOpenMobile(true)}
        type="button"
      >
        <span className={pillClass}>
          <HugeiconsIcon className="size-5" icon={Menu01Icon} />
        </span>
        Plus
      </button>
    </nav>
  )
}

export function AppShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <Sidebar>{sidebar}</Sidebar>
      <SidebarInset className="h-svh">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
