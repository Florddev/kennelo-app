import { type Activity, activityNames } from "@/components/activity-mark"
import { SearchView } from "@/components/site/search-view"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { activity, q } = await searchParams
  const initialActivity = activityNames.find((a) => a === activity) as
    Activity | undefined
  return (
    <SearchView
      initialActivity={initialActivity}
      initialQuery={typeof q === "string" ? q : ""}
    />
  )
}
