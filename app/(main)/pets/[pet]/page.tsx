import { notFound } from "next/navigation"
import { findPet, petProfiles } from "@/components/pets/data"
import { PetView } from "@/components/pets/pet-view"

export function generateStaticParams() {
  return petProfiles.map((pet) => ({ pet: pet.slug }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ pet: string }>
}) {
  const { pet } = await params
  if (!findPet(pet)) notFound()
  return <PetView slug={pet} />
}
