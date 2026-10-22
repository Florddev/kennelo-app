import { notFound } from "next/navigation"
import { MobileVenue } from "@/components/mobile/explore-views"
import { venueOf, venues } from "@/components/site/venues"

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
  return <MobileVenue slug={slug} />
}
