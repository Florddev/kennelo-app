import { ServiceSettings } from "@/components/services/service-settings"

export default async function Page({
  params,
}: {
  params: Promise<{ activity: string; service: string }>
}) {
  const { service } = await params
  return <ServiceSettings serviceId={service} />
}
