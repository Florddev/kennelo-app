import { ClientMessages } from "@/components/site/messages-view"
import { venueOf } from "@/components/site/venues"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { venue } = await searchParams
  return (
    <ClientMessages
      initialVenue={
        typeof venue === "string" && venueOf(venue) ? venue : undefined
      }
    />
  )
}
