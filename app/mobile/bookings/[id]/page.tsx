import { MobileBooking } from "@/components/mobile/booking-view"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <MobileBooking id={id} />
}
