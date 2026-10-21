import { notFound } from "next/navigation"
import { settingsPages } from "@/components/settings/registry"

export function generateStaticParams() {
  return Object.keys(settingsPages).map((page) => ({ page }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page } = await params
  const View = settingsPages[page]
  if (!View) notFound()
  return <View />
}
