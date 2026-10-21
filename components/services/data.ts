import { useSyncExternalStore } from "react"

/* ——— Métiers : ils imposent le parcours client ——— */

export type Journey = "stay" | "appointment"

export const metiers = [
  {
    hint: "Hébergement, prix par nuit",
    id: "pension",
    journey: "stay",
    label: "Pension",
  },
  {
    hint: "Accueil à la journée",
    id: "garderie",
    journey: "stay",
    label: "Garderie",
  },
  {
    hint: "Prix selon taille, poil et race",
    id: "toilettage",
    journey: "appointment",
    label: "Toilettage",
  },
  {
    hint: "Séances et cours",
    id: "education",
    journey: "appointment",
    label: "Éducation",
  },
  {
    hint: "Séances au cabinet ou à domicile",
    id: "osteo",
    journey: "appointment",
    label: "Ostéopathie",
  },
  {
    hint: "Bilans et suivis",
    id: "comportement",
    journey: "appointment",
    label: "Comportementaliste",
  },
  {
    hint: "Sorties individuelles ou en groupe",
    id: "promenade",
    journey: "appointment",
    label: "Promenade",
  },
  {
    hint: "Passages chez le client",
    id: "visites",
    journey: "appointment",
    label: "Visites à domicile",
  },
  {
    hint: "Transport vers la pension ou le vétérinaire",
    id: "taxi",
    journey: "appointment",
    label: "Taxi animalier",
  },
] as const satisfies {
  id: string
  label: string
  hint: string
  journey: Journey
}[]

export type MetierId = (typeof metiers)[number]["id"]
export const metierOf = (id: MetierId) => metiers.find((m) => m.id === id)!

/* ——— Catalogue de l'entreprise ——— */

export type Species = "Chien" | "Chat" | "NAC"
export type Size = "Petit" | "Moyen" | "Grand"
export type Coat = "Court" | "Long"
export const speciesList: Species[] = ["Chien", "Chat", "NAC"]
export const sizes: Size[] = ["Petit", "Moyen", "Grand"]
export const coats: Coat[] = ["Court", "Long"]

export type GridRow = {
  species: Species
  size?: Size
  coat?: Coat
  breed?: string
  price: number
  /** Minutes, utile si la prestation se place dans l'agenda. */
  duration: number
}

export type Service = {
  id: string
  name: string
  description: string
  active: boolean
  /** A une durée et occupe un membre de l'équipe. */
  scheduled: boolean
  /** Composition indicative d'un forfait. */
  bundle?: string[]
  /** Grille par taille, poil et race (toilettage). Sinon espèce seule. */
  detailed: boolean
  grid: GridRow[]
  /** Activité principale : celle qui l'a créée et gère sa grille. */
  owner: string
}

/** Réglages propres à une activité sur une prestation du catalogue. */
export type Offer = {
  serviceId: string
  adjust: number
  included: boolean
  active: boolean
  perNight: boolean
}

export type CatalogActivity = {
  id: string
  name: string
  metier: MetierId
  color: string
  href?: string
  /** Page de réglages où l'activité gère ses prix. */
  pricingHref?: string
  hours?: string
}

/** Type de place d'une activité de séjour (le séjour n'est pas une prestation). */
export type Place = {
  name: string
  count: number
  animals: number
  species: Species[]
  price: number
  /** Supplément par animal en plus du premier. */
  extra: number
  /** Prix en haute saison, si différent. */
  high?: number
}

type State = {
  activities: CatalogActivity[]
  services: Service[]
  offers: Record<string, Offer[]>
  places: Record<string, Place[]>
}

const dog = (price: number, duration = 30): GridRow => ({
  duration,
  price,
  species: "Chien",
})
const cat = (price: number, duration = 30): GridRow => ({
  duration,
  price,
  species: "Chat",
})
const sized = (
  prices: [number, number, number],
  durations: [number, number, number]
): GridRow[] =>
  sizes.map((size, i) => ({
    duration: durations[i],
    price: prices[i],
    size,
    species: "Chien",
  }))

const seedServices: Omit<Service, "owner">[] = [
  {
    active: true,
    description: "Shampoing adapté au pelage, séchage et brossage",
    detailed: true,
    grid: [
      ...sized([30, 35, 45], [30, 45, 60]),
      {
        coat: "Long",
        duration: 75,
        price: 55,
        size: "Grand",
        species: "Chien",
      },
      cat(35, 45),
    ],
    id: "bain",
    name: "Bain & brossage",
    scheduled: true,
  },
  {
    active: true,
    description: "Coupe aux ciseaux ou à la tondeuse",
    detailed: true,
    grid: [
      ...sized([30, 38, 48], [45, 60, 75]),
      { breed: "Caniche", duration: 75, price: 45, species: "Chien" },
    ],
    id: "coupe",
    name: "Coupe",
    scheduled: true,
  },
  {
    active: true,
    description: "Coupe et limage des griffes",
    detailed: true,
    grid: [dog(10, 15), cat(10, 15)],
    id: "griffes",
    name: "Griffes",
    scheduled: true,
  },
  {
    active: true,
    bundle: ["bain", "coupe", "griffes"],
    description: "Bain, coupe et griffes",
    detailed: true,
    grid: [
      ...sized([55, 65, 80], [90, 120, 150]),
      { breed: "Caniche", duration: 120, price: 75, species: "Chien" },
    ],
    id: "complet",
    name: "Toilettage complet",
    scheduled: true,
  },
  {
    active: true,
    description: "Pelage très emmêlé, avant un bain",
    detailed: true,
    grid: [
      { coat: "Long", duration: 30, price: 20, species: "Chien" },
      cat(20),
    ],
    id: "demelage",
    name: "Démêlage",
    scheduled: true,
  },
  {
    active: true,
    description: "Deux sorties de 30 min en plus par jour",
    detailed: false,
    grid: [dog(6, 60)],
    id: "promenade",
    name: "Promenade",
    scheduled: true,
  },
  {
    active: true,
    description: "Administration de médicaments",
    detailed: false,
    grid: [dog(3), cat(3), { duration: 0, price: 3, species: "NAC" }],
    id: "traitement",
    name: "Traitement",
    scheduled: false,
  },
  {
    active: true,
    description: "Alimentation spécifique préparée",
    detailed: false,
    grid: [dog(2), cat(2)],
    id: "regime",
    name: "Régime",
    scheduled: false,
  },
  {
    active: true,
    description: "Jeux en groupe dans le parc, selon compatibilité",
    detailed: false,
    grid: [dog(4)],
    id: "parc",
    name: "Sortie au parc",
    scheduled: false,
  },
  {
    active: true,
    description: "Photos et nouvelles envoyées au propriétaire",
    detailed: false,
    grid: [dog(2), cat(2)],
    id: "photos",
    name: "Nouvelles en photo",
    scheduled: false,
  },
  {
    active: true,
    description: "Une heure sur le terrain ou à domicile",
    detailed: false,
    grid: [dog(45, 60)],
    id: "seance",
    name: "Séance individuelle",
    scheduled: true,
  },
  {
    active: true,
    description: "Premier rendez-vous, entretien et observation",
    detailed: false,
    grid: [dog(60, 90), cat(60, 90)],
    id: "bilan",
    name: "Bilan comportemental",
    scheduled: true,
  },
  {
    active: true,
    description: "Chiots de 2 à 6 mois, en groupe",
    detailed: false,
    grid: [dog(20, 60)],
    id: "chiot",
    name: "École du chiot",
    scheduled: true,
  },
  {
    active: false,
    description: "Balade éducative en groupe",
    detailed: false,
    grid: [dog(18, 60)],
    id: "collectif",
    name: "Cours collectif",
    scheduled: true,
  },
]

export const offer = (
  serviceId: string,
  patch: Partial<Offer> = {}
): Offer => ({
  active: true,
  adjust: 0,
  included: false,
  perNight: false,
  serviceId,
  ...patch,
})

let state: State = {
  activities: [
    {
      color: "bg-emerald-800",
      href: "/settings/activities/pension",
      pricingHref: "/settings/activities/pension/rates",
      id: "pension",
      metier: "pension",
      name: "Pension",
    },
    {
      color: "bg-violet-600",
      href: "/settings/activities/grooming",
      pricingHref: "/settings/activities/grooming/services",
      id: "grooming",
      metier: "toilettage",
      name: "Toilettage",
    },
    {
      color: "bg-blue-700",
      href: "/settings/activities/training",
      pricingHref: "/settings/activities/training/packages",
      id: "training",
      metier: "education",
      name: "Éducation",
    },
  ],
  offers: {
    grooming: ["bain", "coupe", "griffes", "complet", "demelage"].map((id) =>
      offer(id)
    ),
    pension: [
      offer("promenade", { perNight: true }),
      offer("traitement", { perNight: true }),
      offer("regime", { perNight: true }),
      offer("parc", { included: true, perNight: true }),
      offer("photos", { included: true, perNight: true }),
      offer("bain"),
      offer("seance", { adjust: -10 }),
    ],
    training: ["seance", "bilan", "chiot", "collectif"].map((id) => offer(id)),
  },
  places: {
    pension: [
      {
        animals: 1,
        count: 16,
        extra: 0,
        high: 29,
        name: "Box",
        price: 25,
        species: ["Chien"],
      },
      {
        animals: 2,
        count: 4,
        extra: 12,
        high: 44,
        name: "Box famille",
        price: 38,
        species: ["Chien"],
      },
      {
        animals: 2,
        count: 4,
        extra: 8,
        name: "Chatterie",
        price: 16,
        species: ["Chat"],
      },
    ],
  },
  services: seedServices.map((service) => ({
    ...service,
    owner: ["promenade", "traitement", "regime", "parc", "photos"].includes(
      service.id
    )
      ? "pension"
      : ["seance", "bilan", "chiot", "collectif"].includes(service.id)
        ? "training"
        : "grooming",
  })),
}

/* ——— Store partagé par tous les écrans ——— */

const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const getState = () => state
const commit = (next: (s: State) => State) => {
  state = next(state)
  for (const listener of listeners) listener()
}

export const useCatalog = () =>
  useSyncExternalStore(subscribe, getState, getState)

export const saveService = (service: Service) =>
  commit((s) => ({
    ...s,
    services: s.services.some((x) => x.id === service.id)
      ? s.services.map((x) => (x.id === service.id ? service : x))
      : [...s.services, service],
  }))

export const addOffers = (activityId: string, serviceIds: string[]) =>
  commit((s) => {
    const current = s.offers[activityId] ?? []
    const fresh = serviceIds
      .filter((id) => !current.some((o) => o.serviceId === id))
      .map((id) => offer(id))
    return {
      ...s,
      offers: { ...s.offers, [activityId]: [...current, ...fresh] },
    }
  })

export const updateOffer = (
  activityId: string,
  serviceId: string,
  patch: Partial<Offer>
) =>
  commit((s) => ({
    ...s,
    offers: {
      ...s.offers,
      [activityId]: (s.offers[activityId] ?? []).map((o) =>
        o.serviceId === serviceId ? { ...o, ...patch } : o
      ),
    },
  }))

export const removeOffer = (activityId: string, serviceId: string) =>
  commit((s) => ({
    ...s,
    offers: {
      ...s.offers,
      [activityId]: (s.offers[activityId] ?? []).filter(
        (o) => o.serviceId !== serviceId
      ),
    },
  }))

/** Supprime la prestation partout : activité principale, reprises et forfaits. */
export const deleteService = (serviceId: string) =>
  commit((s) => ({
    ...s,
    offers: Object.fromEntries(
      Object.entries(s.offers).map(([id, list]) => [
        id,
        list.filter((o) => o.serviceId !== serviceId),
      ])
    ),
    services: s.services
      .filter((x) => x.id !== serviceId)
      .map((x) =>
        x.bundle
          ? { ...x, bundle: x.bundle.filter((id) => id !== serviceId) }
          : x
      ),
  }))

/** Crée l'activité avec ses places, ses propres prestations et celles reprises. */
export const createActivity = ({
  activity,
  services,
  offers,
  places,
}: {
  activity: CatalogActivity
  services: Service[]
  offers: Offer[]
  places: Place[]
}) =>
  commit((s) => ({
    activities: [...s.activities, activity],
    offers: { ...s.offers, [activity.id]: offers },
    places: { ...s.places, [activity.id]: places },
    services: [...s.services, ...services],
  }))

/* ——— Calculs ——— */

export const newId = (name: string) =>
  `${name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).slice(2, 6)}`

export const journeyOf = (activity?: CatalogActivity) =>
  activity ? metierOf(activity.metier).journey : "appointment"

export const saleLabel = (journey: Journey) =>
  journey === "stay" ? "En option d'un séjour" : "Vendue seule"

export const adjusted = (price: number, adjust: number) =>
  Math.round(price * (1 + adjust / 100) * 100) / 100

export const euros = (n: number) =>
  `${n.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €`

export const minutes = (n: number) =>
  n < 60 ? `${n} min` : `${Math.floor(n / 60)} h${n % 60 ? ` ${n % 60}` : ""}`

export const sizeOfWeight = (kg?: number): Size | undefined =>
  kg === undefined
    ? undefined
    : kg <= 10
      ? "Petit"
      : kg <= 25
        ? "Moyen"
        : "Grand"

/** La ligne la plus précise l'emporte. Aucune ligne : prestation non proposée. */
export function rowFor(
  service: Service,
  animal: { species: Species; size?: Size; coat?: Coat; breed?: string }
) {
  let best: GridRow | undefined
  let score = -1
  for (const row of service.grid) {
    if (row.species !== animal.species) continue
    if (row.size && row.size !== animal.size) continue
    if (row.coat && row.coat !== animal.coat) continue
    if (row.breed && !animal.breed?.includes(row.breed)) continue
    const s = (row.size ? 1 : 0) + (row.coat ? 1 : 0) + (row.breed ? 2 : 0)
    if (s > score) {
      best = row
      score = s
    }
  }
  return best
}

export function gridSummary(service: Service, adjust = 0) {
  return speciesList
    .map((species) => {
      const prices = service.grid
        .filter((r) => r.species === species)
        .map((r) => adjusted(r.price, adjust))
      if (!prices.length) return null
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      return `${species} ${min === max ? euros(min) : `${min} – ${euros(max)}`}`
    })
    .filter(Boolean)
    .join(" · ")
}

export const fromPrice = (service: Service) =>
  Math.min(...service.grid.map((r) => r.price))

export const sellersOf = (s: State, serviceId: string) =>
  s.activities.filter((a) =>
    (s.offers[a.id] ?? []).some((o) => o.serviceId === serviceId)
  )
