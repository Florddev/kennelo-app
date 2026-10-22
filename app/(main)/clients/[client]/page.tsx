import { notFound } from "next/navigation"
import { ClientProfile } from "@/components/clients/client-profile"
import { clientSlugs, findClient } from "@/components/clients/data"

export function generateStaticParams() {
  return clientSlugs().map((client) => ({ client }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ client: string }>
}) {
  const { client } = await params
  if (!findClient(client)) notFound()
  return <ClientProfile slug={client} />
}
