import { notFound } from "next/navigation"
import { MobileThread } from "@/components/mobile/messages-views"
import { venueOf, venues } from "@/components/site/venues"

export function generateStaticParams() {
  return venues.map((v) => ({ venue: v.slug }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ venue: string }>
}) {
  const { venue } = await params
  if (!venueOf(venue)) notFound()
  return <MobileThread slug={venue} />
}
