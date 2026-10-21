"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  HistoryIcon,
  Moon02Icon,
  SendIcon,
  Sun03Icon,
} from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AppShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <SidebarProvider>
      <Sidebar variant="inset">{sidebar}</Sidebar>
      <SidebarInset className="h-svh bg-sidebar md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-b bg-background md:me-2 md:mt-2 md:rounded-xl md:border">
          {children}
        </div>
        <footer className="flex h-10 shrink-0 items-center justify-end gap-1 px-2">
          <Button size="sm" variant="ghost">
            <HugeiconsIcon icon={SendIcon} />
            Agent
          </Button>
          <Button aria-label="History" size="icon-sm" variant="ghost">
            <HugeiconsIcon icon={HistoryIcon} />
          </Button>
          <Button
            aria-label="Basculer le mode sombre"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            size="icon-sm"
            variant="ghost"
          >
            <HugeiconsIcon className="dark:hidden" icon={Moon02Icon} />
            <HugeiconsIcon className="hidden dark:block" icon={Sun03Icon} />
          </Button>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
