import { NewPetFlow } from "@/components/site/pet-views"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { next } = await searchParams
  /* Retour seulement vers une page du site */
  const safe =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : undefined
  return <NewPetFlow next={safe} />
}
