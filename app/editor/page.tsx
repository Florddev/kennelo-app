import type { Metadata } from "next"
import { SiteEditor } from "@/components/editor/site-editor"
import { ToastProvider } from "@/components/ui/toast"

export const metadata: Metadata = { title: "Éditeur de site" }

export default function EditorPage() {
  return (
    <ToastProvider position="bottom-center">
      <SiteEditor />
    </ToastProvider>
  )
}
