import { notFound } from "next/navigation"
import { venueOf, venues } from "@/components/site/venues"
import { VenueView } from "@/components/site/venue-view"

export function generateStaticParams() {
  return venues.map((v) => ({ slug: v.slug }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!venueOf(slug)) notFound()
  return <VenueView slug={slug} />
}
