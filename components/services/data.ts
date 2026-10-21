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
}

/* ——— Périodes tarifaires : prix des places selon la date ——— */

/** Période de l'entreprise, commune à toutes ses activités de séjour. */
export type Period = {
  id: string
  name: string
  color: string
  /** Période de base : toute l'année, prix par défaut, ne se supprime pas. */
  base?: boolean
  /** Dates ISO. Répétée chaque année : seuls le jour et le mois comptent. */
  start?: string
  end?: string
  repeat: boolean
  /** La plus haute l'emporte. Sans priorité, la plus courte gagne. */
  priority?: number
}

export type PlaceRate = {
  price: number
  /** Supplément par animal en plus dans la même place. */
  extra: number
  /** Prix différent certains jours (0 = lundi). */
  days: Record<number, number>
}

/** Réglage d'une activité sur une période de l'entreprise. */
export type PeriodRate = {
  periodId: string
  active: boolean
  /** Majoration de la période de base, à la place de prix saisis. */
  percent?: number
  places: Record<string, PlaceRate>
  /** Selon la période de la première nuit. */
  minStay: number
  closed: number[]
}

/** Ouverture ou fermeture exceptionnelle : passe avant tout le reste. */
export type DayException = { date: string; open: boolean; label: string }

type State = {
  activities: CatalogActivity[]
  services: Service[]
  offers: Record<string, Offer[]>
  places: Record<string, Place[]>
  periods: Period[]
  rates: Record<string, PeriodRate[]>
  exceptions: Record<string, DayException[]>
}

export const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
/** Aujourd'hui dans la démonstration. */
export const todayIso = "2026-10-21"
export const seasonLimits = { Gratuit: 3, Pro: Infinity, Starter: 10 }
export const currentPlan: keyof typeof seasonLimits = "Gratuit"
export const seasonLimit = seasonLimits[currentPlan]

export const placeRate = (
  price: number,
  extra = 0,
  days: Record<number, number> = {}
): PlaceRate => ({ days, extra, price })

export const periodRate = (
  periodId: string,
  patch: Partial<PeriodRate> = {}
): PeriodRate => ({
  active: true,
  closed: [],
  minStay: 1,
  periodId,
  places: {},
  ...patch,
})

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
        name: "Box",
        species: ["Chien"],
      },
      {
        animals: 2,
        count: 4,
        name: "Box famille",
        species: ["Chien"],
      },
      {
        animals: 2,
        count: 4,
        name: "Chatterie",
        species: ["Chat"],
      },
    ],
  },
  exceptions: {
    grooming: [
      { date: "2026-11-01", label: "Toussaint", open: false },
      { date: "2026-12-25", label: "Noël", open: false },
      { date: "2027-01-01", label: "Jour de l'an", open: false },
    ],
    pension: [{ date: "2027-05-01", label: "Fête du travail", open: false }],
    training: [
      { date: "2026-12-25", label: "Noël", open: false },
      { date: "2027-01-01", label: "Jour de l'an", open: false },
    ],
  },
  periods: [
    {
      base: true,
      color: "bg-zinc-400",
      id: "base",
      name: "Base",
      repeat: true,
    },
    {
      color: "bg-amber-500",
      end: "2026-08-31",
      id: "ete",
      name: "Été",
      repeat: true,
      start: "2026-07-01",
    },
    {
      color: "bg-rose-500",
      end: "2027-01-03",
      id: "fetes",
      name: "Fêtes",
      repeat: true,
      start: "2026-12-20",
    },
    {
      color: "bg-sky-500",
      end: "2026-11-01",
      id: "toussaint",
      name: "Vacances de la Toussaint",
      repeat: false,
      start: "2026-10-17",
    },
  ],
  rates: {
    pension: [
      periodRate("base", {
        places: {
          Box: placeRate(25, 0, { 5: 29 }),
          "Box famille": placeRate(38, 12, { 5: 42 }),
          Chatterie: placeRate(16, 8),
        },
      }),
      periodRate("ete", { minStay: 2, percent: 20 }),
      periodRate("fetes", {
        minStay: 3,
        places: {
          Box: placeRate(35),
          "Box famille": placeRate(50, 12),
          Chatterie: placeRate(22, 8),
        },
      }),
      periodRate("toussaint", { percent: 10 }),
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
  rates = [],
}: {
  activity: CatalogActivity
  services: Service[]
  offers: Offer[]
  places: Place[]
  rates?: PeriodRate[]
}) =>
  commit((s) => ({
    ...s,
    activities: [...s.activities, activity],
    offers: { ...s.offers, [activity.id]: offers },
    places: { ...s.places, [activity.id]: places },
    rates: { ...s.rates, [activity.id]: rates },
    services: [...s.services, ...services],
  }))

export const savePeriod = (period: Period) =>
  commit((s) => ({
    ...s,
    periods: s.periods.some((p) => p.id === period.id)
      ? s.periods.map((p) => (p.id === period.id ? period : p))
      : [...s.periods, period],
  }))

/** Les réservations existantes gardent le détail figé de leurs nuits. */
export const deletePeriod = (id: string) =>
  commit((s) => ({
    ...s,
    periods: s.periods.filter((p) => p.base || p.id !== id),
    rates: Object.fromEntries(
      Object.entries(s.rates).map(([a, list]) => [
        a,
        list.filter((r) => r.periodId !== id),
      ])
    ),
  }))

export const saveRate = (activityId: string, rate: PeriodRate) =>
  commit((s) => {
    const list = s.rates[activityId] ?? []
    return {
      ...s,
      rates: {
        ...s.rates,
        [activityId]: list.some((r) => r.periodId === rate.periodId)
          ? list.map((r) => (r.periodId === rate.periodId ? rate : r))
          : [...list, rate],
      },
    }
  })

export const removeRate = (activityId: string, periodId: string) =>
  commit((s) => ({
    ...s,
    rates: {
      ...s.rates,
      [activityId]: (s.rates[activityId] ?? []).filter(
        (r) => r.periodId !== periodId
      ),
    },
  }))

/** Ajoute ou modifie un type de place. Un renommage suit dans les prix. */
export const savePlace = (
  activityId: string,
  place: Place,
  previous?: string
) =>
  commit((s) => {
    const list = s.places[activityId] ?? []
    const rename = (rate: PeriodRate) => {
      if (!previous || previous === place.name || !rate.places[previous])
        return rate
      const { [previous]: moved, ...rest } = rate.places
      return { ...rate, places: { ...rest, [place.name]: moved } }
    }
    return {
      ...s,
      places: {
        ...s.places,
        [activityId]:
          previous === undefined
            ? [...list, place]
            : list.map((p) => (p.name === previous ? place : p)),
      },
      rates: {
        ...s.rates,
        [activityId]: (s.rates[activityId] ?? []).map(rename),
      },
    }
  })

export const deletePlace = (activityId: string, name: string) =>
  commit((s) => ({
    ...s,
    places: {
      ...s.places,
      [activityId]: (s.places[activityId] ?? []).filter((p) => p.name !== name),
    },
    rates: {
      ...s.rates,
      [activityId]: (s.rates[activityId] ?? []).map((r) => {
        const places = { ...r.places }
        delete places[name]
        return { ...r, places }
      }),
    },
  }))

export const setExceptions = (activityId: string, list: DayException[]) =>
  commit((s) => ({
    ...s,
    exceptions: {
      ...s.exceptions,
      [activityId]: [...list].sort((a, b) => a.date.localeCompare(b.date)),
    },
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

/* ——— Calcul des périodes ——— */

const dayMs = 86_400_000
const monthsShort = [
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

export const addDays = (iso: string, n: number) =>
  new Date(Date.parse(iso) + n * dayMs).toISOString().slice(0, 10)

/** 0 = lundi. */
export const weekdayOfIso = (iso: string) =>
  (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7

export const dayMonth = (iso: string) =>
  `${Number(iso.slice(8, 10))} ${monthsShort[Number(iso.slice(5, 7)) - 1]}`

export const shortIso = (iso: string) =>
  `${weekdays[weekdayOfIso(iso)]}. ${dayMonth(iso)}`

export function periodDates(p: Period) {
  if (p.base || !p.start || !p.end) return "Toute l'année"
  const range = `${dayMonth(p.start)} → ${dayMonth(p.end)}`
  return p.repeat ? `${range} · chaque année` : `${range} ${p.end.slice(0, 4)}`
}

/** Saison à dates précises dont la fin est passée. */
export const isOver = (p: Period) => !p.repeat && !!p.end && p.end < todayIso

const span = (p: Period) => {
  if (!p.start || !p.end) return 366
  const d = (Date.parse(p.end) - Date.parse(p.start)) / dayMs
  return p.repeat ? ((d % 365) + 365) % 365 : d
}

export function covers(p: Period, iso: string) {
  if (p.base || !p.start || !p.end) return false
  if (!p.repeat) return iso >= p.start && iso <= p.end
  const [d, start, end] = [iso.slice(5), p.start.slice(5), p.end.slice(5)]
  return start <= end ? d >= start && d <= end : d >= start || d <= end
}

/** Saisons qui comptent : les plus anciennes, dans la limite de l'offre. */
export const countedSeasons = (periods: Period[]) =>
  periods.filter((p) => !p.base).slice(0, seasonLimit)

/** Priorité la plus haute, sinon la saison la plus courte. */
export const winner = (seasons: Period[], iso: string) =>
  seasons
    .filter((p) => covers(p, iso))
    .sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0) || span(a) - span(b)
    )[0]

export type Night = {
  date: string
  period?: Period
  price: number
  extra: number
  minStay: number
  closed?: string
}

/** Prix d'une nuit (ou d'un jour) pour un type de place. */
export function nightFor(
  s: State,
  activityId: string,
  place: string,
  date: string
): Night {
  const rates = s.rates[activityId] ?? []
  const rateOf = (p?: Period) =>
    p ? rates.find((r) => r.periodId === p.id && r.active) : undefined
  const base = s.periods.find((p) => p.base)
  const season = winner(
    countedSeasons(s.periods).filter((p) => rateOf(p)),
    date
  )
  const period = season ?? (rateOf(base) ? base : undefined)
  const rate = rateOf(period)
  const night: Night = {
    date,
    extra: 0,
    minStay: rate?.minStay ?? 1,
    period,
    price: 0,
  }
  const exception = s.exceptions[activityId]?.find((e) => e.date === date)
  if (exception && !exception.open)
    return { ...night, closed: exception.label || "Fermeture exceptionnelle" }
  if (!rate) return { ...night, closed: "Aucun prix sur cette date" }
  const day = weekdayOfIso(date)
  if (!exception?.open && rate.closed.includes(day))
    return { ...night, closed: `Fermé le ${weekdays[day].toLowerCase()}.` }
  const source =
    rate.percent !== undefined
      ? rates.find((r) => r.periodId === base?.id)?.places[place]
      : rate.places[place]
  if (!source) return { ...night, closed: "Pas de prix pour cette place" }
  const percent = rate.percent ?? 0
  return {
    ...night,
    extra: adjusted(source.extra, percent),
    price: adjusted(source.days[day] ?? source.price, percent),
  }
}

/** Séjour calculé nuit par nuit : il peut mélanger plusieurs périodes. */
export function quote(
  s: State,
  activityId: string,
  place: string,
  arrival: string,
  nights: number,
  animals = 1
) {
  const list = Array.from({ length: Math.max(nights, 0) }, (_, i) =>
    nightFor(s, activityId, place, addDays(arrival, i))
  )
  const minStay = list[0]?.minStay ?? 1
  return {
    closed: list.filter((n) => n.closed),
    minStay,
    nights: list,
    short: nights < minStay,
    total: list.reduce((sum, n) => sum + n.price + n.extra * (animals - 1), 0),
  }
}

/** Nuits regroupées par période et par prix, pour la facture. */
export function groupNights(nights: Night[]) {
  const lines: { label: string; nights: number; price: number }[] = []
  for (const n of nights) {
    const label = n.period?.name ?? "Sans période"
    const same = lines.find((l) => l.label === label && l.price === n.price)
    if (same) same.nights++
    else lines.push({ label, nights: 1, price: n.price })
  }
  return lines
}

export function rateSummary(rate: PeriodRate | undefined, places: Place[]) {
  if (!rate) return "Pas appliquée ici"
  if (rate.percent !== undefined)
    return `${rate.percent >= 0 ? "+" : ""}${rate.percent} % sur la base`
  return (
    places
      .filter((p) => rate.places[p.name])
      .map((p) => `${p.name} ${euros(rate.places[p.name].price)}`)
      .join(" · ") || "Aucun prix saisi"
  )
}
