import { activityNames } from "@/components/activity-mark"
import { MobileSearch } from "@/components/mobile/explore-views"

const sorts = ["near", "rating", "price"] as const

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { activity, pet, when, sort, instant } = await searchParams
  const one = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : undefined
  return (
    <MobileSearch
      initial={{
        activity: activityNames.find((a) => a === activity),
        instant: instant === "1",
        pet: one(pet),
        sort: sorts.find((s) => s === sort),
        when: one(when),
      }}
    />
  )
}
