import type { Metadata, Viewport } from "next"
import type * as React from "react"
import { MobileShell } from "@/components/mobile/mobile-ui"
import { ToastProvider } from "@/components/ui/toast"

export const metadata: Metadata = { title: "Kennelo" }

export const viewport: Viewport = { viewportFit: "cover" }

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider position="top-center">
      <MobileShell>{children}</MobileShell>
    </ToastProvider>
  )
}
