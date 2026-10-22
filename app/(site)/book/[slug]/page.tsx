import { notFound } from "next/navigation"
import { activityNames } from "@/components/activity-mark"
import { BookingFlow } from "@/components/site/booking-flow"
import { venueOf } from "@/components/site/venues"

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const { activity } = await searchParams
  if (!venueOf(slug)) notFound()
  return (
    <BookingFlow
      initialActivity={activityNames.find((a) => a === activity)}
      slug={slug}
    />
  )
}
