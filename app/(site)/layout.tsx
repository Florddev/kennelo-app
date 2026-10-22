import type * as React from "react"
import { SiteShell } from "@/components/site/site-shell"
import { ToastProvider } from "@/components/ui/toast"

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider position="bottom-center">
      <SiteShell>{children}</SiteShell>
    </ToastProvider>
  )
}
