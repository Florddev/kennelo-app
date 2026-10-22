import { photo } from "@/components/site/venues"

/* Photos de démonstration (Unsplash), attribuées selon le nom de l'animal. */

const dogs = [
  "1543466835-00a7907e9de1",
  "1561037404-61cd46aa615b",
  "1552053831-71594a27632d",
  "1530281700549-e82e7bf110d6",
  "1537151625747-768eb6cf92b2",
  "1558788353-f76d92427f16",
  "1503256207526-0d5d80fa2f47",
  "1534361960057-19889db9621e",
  "1477884213360-7e9d7dcc1e48",
  "1560807707-8cc77767d783",
  "1518717758536-85ae29035b6d",
  "1507146426996-ef05306b995a",
  "1544568100-847a948585b9",
  "1596492784531-6e6eb5ea9993",
  "1598133894008-61f7fdb8cc3a",
  "1594149929911-78975a43d4f5",
  "1583511655857-d19b40a7a54e",
].map(photo)

const cats = [
  "1514888286974-6c03e2ca1dba",
  "1573865526739-10659fec78a5",
  "1495360010541-f48722b34f7d",
  "1574158622682-e40e69881006",
  "1518791841217-8f162f1e1131",
  "1592194996308-7b43878e84a6",
  "1543852786-1cf6624b9987",
  "1519052537078-e6302a4968d4",
  "1511044568932-338cba0ad803",
  "1513360371669-4adf3dd7dff8",
].map(photo)

const tones = [
  "bg-wise-yellow text-wise-gold",
  "bg-wise-pink text-wise-purple",
  "bg-wise-blue text-wise-charcoal",
  "bg-wise-orange text-wise-maroon",
]

const hash = (s: string) =>
  [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

const poolOf = (species: string) => (species === "Chat" ? cats : dogs)

export const petPhoto = (slug: string, species: string) => {
  const pool = poolOf(species)
  return pool[hash(slug) % pool.length]
}

/** La n-ième photo de la galerie, différente de la photo de profil. */
export const petGalleryPhoto = (slug: string, species: string, n: number) => {
  const pool = poolOf(species)
  return pool[(hash(slug) + 1 + n) % pool.length]
}

export const petTone = (slug: string) => tones[hash(slug) % tones.length]
