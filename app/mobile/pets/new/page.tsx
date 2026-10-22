import { NewPetFlow } from "@/components/site/pet-views"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { next } = await searchParams
  /* Retour seulement vers une page de l'app */
  const safe =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : undefined
  return <NewPetFlow mobile next={safe} />
}
