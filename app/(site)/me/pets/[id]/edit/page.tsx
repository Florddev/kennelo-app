import { PetEdit } from "@/components/site/pet-views"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PetEdit id={id} />
}
