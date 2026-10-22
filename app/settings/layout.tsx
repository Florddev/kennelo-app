import type * as React from "react"
import { AppShell } from "@/components/app-shell"
import { SettingsSidebar } from "@/components/settings-sidebar"
import { ToastProvider } from "@/components/ui/toast"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider position="bottom-center">
      <AppShell sidebar={<SettingsSidebar />}>{children}</AppShell>
    </ToastProvider>
  )
}
