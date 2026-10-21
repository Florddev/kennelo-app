import type * as React from "react"
import { AppShell } from "@/components/app-shell"
import { SettingsSidebar } from "@/components/settings-sidebar"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell sidebar={<SettingsSidebar />}>{children}</AppShell>
}
