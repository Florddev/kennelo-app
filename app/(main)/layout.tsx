import type * as React from "react"
import { AppShell } from "@/components/app-shell"
import { ToastProvider } from "@/components/ui/toast"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider position="bottom-center">
      <AppShell>{children}</AppShell>
    </ToastProvider>
  )
}
