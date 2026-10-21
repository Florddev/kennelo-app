import { ActivityOverview } from "@/components/settings/activity-pages"
import { activitySettings } from "@/components/settings/data"

export function generateStaticParams() {
  return activitySettings.map(({ slug }) => ({ activity: slug }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ activity: string }>
}) {
  const { activity } = await params
  return <ActivityOverview slug={activity} />
}
