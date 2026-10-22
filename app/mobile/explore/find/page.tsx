import { activityNames } from "@/components/activity-mark"
import { type FindStep, GuidedSearch } from "@/components/mobile/explore-views"

const stepNames: FindStep[] = ["activity", "pet", "when"]

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { activity, pet, step } = await searchParams
  return (
    <GuidedSearch
      initial={{
        activity: activityNames.find((a) => a === activity),
        pet: typeof pet === "string" ? pet : undefined,
        step: stepNames.find((s) => s === step),
      }}
    />
  )
}
