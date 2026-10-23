import type * as React from "react"
import { AppShell } from "@/components/app-shell"
import { SettingsNav } from "@/components/settings-nav"
import { ToastProvider } from "@/components/ui/toast"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider position="bottom-center">
      <AppShell aside={<SettingsNav />}>{children}</AppShell>
    </ToastProvider>
  )
}
