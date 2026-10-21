import { notFound } from "next/navigation"
import { ActivitySection } from "@/components/settings/activity-pages"
import {
  activitySettings,
  findActivity,
  findLink,
} from "@/components/settings/data"

export function generateStaticParams() {
  return activitySettings.flatMap((activity) =>
    activity.groups
      .flatMap((group) => group.links)
      .filter((link) => !link.locked)
      .map((link) => ({ activity: activity.slug, section: link.slug }))
  )
}

export default async function Page({
  params,
}: {
  params: Promise<{ activity: string; section: string }>
}) {
  const { activity, section } = await params
  const settings = findActivity(activity)
  if (!settings || !findLink(settings, section)) notFound()
  return <ActivitySection section={section} slug={activity} />
}
