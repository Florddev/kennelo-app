import type { Activity } from "@/components/activity-mark"
import { type Client, clients } from "@/components/clients/data"
import { kennels } from "@/components/pension/data"
import type { Reservation } from "@/components/reservations/data"

/** ISO date of the demo "today", see components/calendar.ts */
export const TODAY_ISO = "2026-10-21"

const months = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
]

const utc = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number)
  return Date.UTC(y, m - 1, d)
}

/** "14 mars 2026" */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return `${d} ${months[m - 1]} ${y}`
}

export const daysBetween = (from: string, to: string) =>
  Math.round((utc(to) - utc(from)) / 86_400_000)

/** Day offset (components/calendar.ts) to ISO date. */
export const isoOf = (offset: number) =>
  new Date(Date.UTC(2026, 9, 19 + offset)).toISOString().slice(0, 10)

const shift = (iso: string, years: number) => {
  const [y, m, d] = iso.split("-")
  return `${Number(y) + years}-${m}-${d}`
}

export type Vaccine = {
  name: string
  done: string
  expires: string
  /** Required to be accepted in boarding. */
  required: boolean
}

export type VaccineStatus = "valid" | "soon" | "expired"

/** Status of a vaccine on a given date (defaults to today). */
export function vaccineStatus(vaccine: Vaccine, on = TODAY_ISO): VaccineStatus {
  const left = daysBetween(on, vaccine.expires)
  if (left < 0) return "expired"
  return left <= 45 ? "soon" : "valid"
}

export type Compat = "yes" | "careful" | "no"

export type PetNote = {
  activity: Activity
  author: string
  date: string
  text: string
}

export type PetProfile = {
  slug: string
  name: string
  species: "Chien" | "Chat"
  breed: string
  sex: "Mâle" | "Femelle"
  neutered: boolean
  birth: string
  weight: number
  color: string
  chip: string
  owner: Client
  vet: { name: string; phone: string; city: string }
  vaccines: Vaccine[]
  allergies: string[]
  treatments: { name: string; dose: string; when: string }[]
  conditions: string[]
  lastVetVisit: string
  food: {
    brand: string
    ration: string
    meals: string[]
    providedByOwner: boolean
    treats: string
  }
  behavior: {
    dogs: Compat
    cats: Compat
    people: Compat
    traits: string[]
    fears: string[]
    warning?: string
  }
  belongings: string[]
  contractSigned: boolean
  notes: PetNote[]
  photos: { caption: string; date: string; tone: string }[]
  history: Reservation[]
  activities: Activity[]
  care?: string
}

const hash = (s: string) =>
  [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 2_147_483_647

const pick = <T>(list: T[], h: number) => list[h % list.length]
const pad = (n: number) => String(n % 100).padStart(2, "0")

const slugOf = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")

const vets = [
  {
    city: "Libourne",
    name: "Clinique vétérinaire des Coteaux",
    phone: "05 57 51 22 10",
  },
  { city: "Saint-Émilion", name: "Dr Morel", phone: "05 57 24 70 31" },
  { city: "Coutras", name: "Cabinet du Pont", phone: "05 57 49 03 88" },
]
const dogColors = [
  "Fauve",
  "Noir et feu",
  "Bringé",
  "Blanc",
  "Tricolore",
  "Sable",
]
const catColors = ["Tigré", "Noir", "Roux", "Écaille de tortue", "Seal point"]
const dogFood = [
  "Royal Canin Medium Adult",
  "Purina Pro Plan",
  "Ultima Adult",
  "Hill's Science Plan",
  "Orijen Original",
]
const catFood = [
  "Royal Canin Indoor",
  "Purina One Stérilisé",
  "Hill's Feline Adult",
]
const dogTraits = [
  "Joueur",
  "Calme",
  "Gourmand",
  "Câlin",
  "Énergique",
  "Discret",
  "Tire en laisse",
  "Aboie à l'arrivée",
]
const catTraits = [
  "Indépendant",
  "Câlin",
  "Curieux",
  "Craintif au début",
  "Joueur",
]
const fears = [
  "Orages",
  "Aspirateur",
  "Hommes en casquette",
  "Pétards",
  "Voiture",
]
const tones = [
  "from-wise-green to-wise-green",
  "from-wise-orange to-wise-orange",
  "from-wise-blue to-wise-blue",
  "from-wise-pink to-wise-pink",
  "from-wise-yellow to-wise-yellow",
  "from-wise-green/60 to-wise-blue",
]
const authors: Record<Activity, string[]> = {
  Pension: ["Claire Dumas", "Lucas Bernard"],
  Toilettage: ["Marc Lefèvre"],
  Éducation: ["Inès Haddad"],
}
const noteTexts: Record<Activity, string[]> = {
  Pension: [
    "Très bon séjour, mange tout et dort bien. Adore les promenades du soir.",
    "Un peu stressé la première nuit, rassuré avec son plaid.",
    "S'entend bien avec les autres chiens au parc de jeu.",
  ],
  Toilettage: [
    "Supporte bien le séchoir, coupe ciseaux sur les pattes. Shampoing peau sensible.",
    "Nœuds derrière les oreilles, prévoir 15 min de plus.",
  ],
  Éducation: [
    "Rappel acquis en environnement calme, à consolider avec distractions.",
    "Progrès nets sur la marche en laisse, continuer les exercices à la maison.",
  ],
}

type Override = Partial<
  Omit<PetProfile, "owner" | "history" | "activities" | "slug" | "name">
>

const overrides: Record<string, Override> = {
  Gaïa: {
    behavior: {
      cats: "careful",
      dogs: "yes",
      fears: ["Orages"],
      people: "yes",
      traits: ["Douce", "Un peu timide", "Gourmande"],
      warning: "Premier séjour : la présenter au groupe calme d'abord.",
    },
    belongings: ["Croquettes (3 kg)", "Laisse", "Panier", "Doudou"],
    contractSigned: false,
    notes: [
      {
        activity: "Pension",
        author: "Claire Dumas",
        date: "2026-10-14",
        text: "Visite de pré-accueil faite avec Antoine. Gaïa est restée 1 h au parc, très sociable.",
      },
    ],
    vaccines: [
      {
        done: "2026-02-03",
        expires: "2027-02-03",
        name: "CHPPi-L",
        required: true,
      },
      {
        done: "2025-10-10",
        expires: "2026-10-10",
        name: "Toux du chenil",
        required: true,
      },
      {
        done: "2024-06-18",
        expires: "2027-06-18",
        name: "Rage",
        required: false,
      },
    ],
  },
  Hercule: {
    allergies: ["Poulet"],
    conditions: ["Syndrome brachycéphale", "Surpoids léger"],
  },
  Sirius: {
    belongings: [
      "Croquettes (5 kg)",
      "Harnais",
      "Laisse",
      "Couverture",
      "Jouet corde",
    ],
  },
  Pixel: {
    belongings: ["Croquettes (2 kg)", "Manteau", "Laisse"],
  },
}

function buildProfile(
  client: Client,
  pet: Client["pets"][number],
  slug: string
): PetProfile {
  const h = hash(`${pet.name}${client.name}`)
  const dog = pet.species === "Chien"
  const kennel = kennels.find((k) => k.pet === pet.name)
  const month = pad((h % 9) + 1)
  const done = `2026-${month}-${pad((h % 27) + 1)}`
  const override = overrides[pet.name] ?? {}
  const activities = pet.activities
  return {
    activities,
    allergies: h % 5 === 0 ? ["Bœuf"] : [],
    behavior: {
      cats: dog ? pick<Compat>(["yes", "careful", "no"], h >> 3) : "yes",
      dogs: dog ? pick<Compat>(["yes", "yes", "careful"], h >> 2) : "no",
      fears: h % 3 === 0 ? [pick(fears, h >> 4)] : [],
      people: pick<Compat>(["yes", "yes", "yes", "careful"], h >> 5),
      traits: dog
        ? [pick(dogTraits, h), pick(dogTraits, h >> 6)].filter(
            (t, i, a) => a.indexOf(t) === i
          )
        : [pick(catTraits, h), pick(catTraits, h >> 6)].filter(
            (t, i, a) => a.indexOf(t) === i
          ),
      warning: kennel?.warning,
    },
    belongings: dog
      ? ["Croquettes", "Laisse", "Panier"]
      : ["Croquettes", "Litière habituelle", "Griffoir"],
    birth: `${2015 + (h % 9)}-${pad((h % 12) + 1)}-${pad((h % 27) + 1)}`,
    breed: pet.breed || (dog ? "Croisé" : "Européen"),
    care: pet.care,
    chip: `250269${String(h).padStart(9, "0").slice(0, 9)}`,
    color: dog ? pick(dogColors, h) : pick(catColors, h),
    conditions: [],
    contractSigned: h % 4 !== 0,
    food: {
      brand: dog ? pick(dogFood, h) : pick(catFood, h),
      meals: dog
        ? ["Matin · 8 h", "Soir · 18 h"]
        : ["Matin · 8 h", "Midi · 12 h", "Soir · 19 h"],
      providedByOwner: h % 3 !== 1,
      ration:
        kennel?.diet ?? (dog ? `2 × ${100 + (h % 8) * 25} g` : "3 × 20 g"),
      treats: kennel?.diet ? "Aucune" : "Autorisées, avec modération",
    },
    history: client.reservations
      .filter((r) => r.pet === pet.name)
      .sort((a, b) => b.start - a.start),
    lastVetVisit: `2026-${month}-${pad((h % 27) + 1)}`,
    name: pet.name,
    neutered: h % 3 !== 0,
    notes: activities.flatMap((activity, i) => [
      {
        activity,
        author: pick(authors[activity], h + i),
        date: `2026-${pad(((h >> i) % 9) + 1)}-${pad(((h >> 2) % 27) + 1)}`,
        text: pick(noteTexts[activity], h + i),
      },
    ]),
    owner: client,
    photos: Array.from({ length: 6 }, (_, i) => ({
      caption: pick(
        [
          "Au parc de jeu",
          "Sieste au box",
          "Après le toilettage",
          "Promenade du matin",
          "Séance d'éducation",
          "Câlin du soir",
        ],
        h + i
      ),
      date: `2026-${pad(10 - (i % 3))}-${pad(((h >> i) % 20) + 1)}`,
      tone: tones[(h + i) % tones.length],
    })),
    sex: h % 2 ? "Mâle" : "Femelle",
    slug,
    species: pet.species,
    treatments: kennel?.meds
      ? [
          {
            dose: kennel.meds,
            name: kennel.meds.split(" ")[0],
            when: "Voir posologie",
          },
        ]
      : [],
    vaccines: dog
      ? [
          { done, expires: shift(done, 1), name: "CHPPi-L", required: true },
          {
            done,
            expires: shift(done, 1),
            name: "Toux du chenil",
            required: true,
          },
          {
            done: shift(done, -1),
            expires: shift(done, 2),
            name: "Rage",
            required: false,
          },
        ]
      : [
          {
            done,
            expires: shift(done, 1),
            name: "Typhus · Coryza",
            required: true,
          },
          {
            done,
            expires: shift(done, 1),
            name: "Leucose (FeLV)",
            required: false,
          },
        ],
    vet: pick(vets, h),
    weight: dog ? 6 + (h % 32) : Math.round(35 + (h % 30)) / 10,
    ...override,
  }
}

function buildProfiles() {
  const list: PetProfile[] = []
  for (const client of clients) {
    for (const pet of client.pets) {
      const base = slugOf(pet.name)
      const slug = list.some((p) => p.slug === base)
        ? `${base}-${slugOf(client.name.split(" ").at(-1) ?? "")}`
        : base
      list.push(buildProfile(client, pet, slug))
    }
  }
  return list
}

export const petProfiles = buildProfiles()

export const findPet = (slug: string) =>
  petProfiles.find((p) => p.slug === slug)

export const petByName = (name: string, owner?: string) =>
  petProfiles.find((p) => p.name === name && (!owner || p.owner.name === owner))

export const petHref = (name: string, owner?: string) => {
  const pet = petByName(name, owner)
  return pet ? `/pets/${pet.slug}` : "/clients"
}

/** Age in years, or months under a year. */
export function ageOf(birth: string) {
  const months = Math.floor(daysBetween(birth, TODAY_ISO) / 30.44)
  return months < 12
    ? `${months} mois`
    : `${Math.floor(months / 12)} an${months >= 24 ? "s" : ""}`
}

/** Vaccines that will not be valid for the whole stay. */
export const vaccineIssues = (pet: PetProfile, until = TODAY_ISO) =>
  pet.vaccines.filter(
    (v) => v.required && vaccineStatus(v, until) === "expired"
  )
