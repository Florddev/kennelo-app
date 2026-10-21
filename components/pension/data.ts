import { shortDate, TODAY } from "@/components/calendar"

export type KennelStatus =
  "occupied" | "departing" | "arriving" | "cleaning" | "free"

export type Kennel = {
  id: string
  label: string
  area: "Chenil" | "Chatterie"
  status: KennelStatus
  pet?: string
  breed?: string
  owner?: string
  /** Day offsets, see components/calendar.ts */
  stay?: { arrival: number; departure: number }
  meds?: string
  diet?: string
  warning?: string
}

const dog = (
  n: number,
  status: KennelStatus,
  rest: Omit<Kennel, "id" | "label" | "area" | "status"> = {}
): Kennel => ({
  area: "Chenil",
  id: `b${n}`,
  label: String(n),
  status,
  ...rest,
})

const cat = (
  n: number,
  status: KennelStatus,
  rest: Omit<Kennel, "id" | "label" | "area" | "status"> = {}
): Kennel => ({
  area: "Chatterie",
  id: `c${n}`,
  label: `C${n}`,
  status,
  ...rest,
})

export const kennels: Kennel[] = [
  dog(1, "occupied", {
    breed: "Labrador",
    owner: "Julie Masson",
    pet: "Oscar",
    stay: { arrival: -1, departure: 4 },
  }),
  dog(2, "occupied", {
    breed: "Beagle",
    meds: "Collyre 2×/jour",
    owner: "Marie Fontaine",
    pet: "Ulysse",
    stay: { arrival: 2, departure: 7 },
  }),
  dog(3, "free"),
  dog(4, "occupied", {
    breed: "Golden retriever",
    meds: "Anti-inflammatoire matin et soir",
    owner: "Camille Martin",
    pet: "Max",
    stay: { arrival: -1, departure: 5 },
  }),
  dog(5, "cleaning"),
  dog(6, "occupied", {
    breed: "Border collie",
    owner: "Romain Petit",
    pet: "Bella",
    stay: { arrival: 1, departure: 3 },
  }),
  dog(7, "occupied", {
    breed: "Spitz nain",
    diet: "Pâtée mélangée, 3 repas",
    owner: "Agathe Leroux",
    pet: "Kiwi",
    stay: { arrival: -2, departure: 9 },
  }),
  dog(8, "occupied", {
    breed: "Malinois",
    owner: "Yanis Morel",
    pet: "Loki",
    stay: { arrival: 1, departure: 4 },
  }),
  dog(9, "arriving", {
    breed: "Berger blanc suisse",
    owner: "Antoine Roux",
    pet: "Gaïa",
    stay: { arrival: 2, departure: 6 },
    warning: "Premier séjour",
  }),
  dog(10, "occupied", {
    breed: "Cavalier King Charles",
    owner: "Lucie Henry",
    pet: "Praline",
    stay: { arrival: -1, departure: 3 },
  }),
  dog(11, "occupied", {
    breed: "Bouledogue français",
    diet: "Ration réduite, pas de friandises",
    owner: "Olivier Blanc",
    pet: "Hercule",
    stay: { arrival: -3, departure: 12 },
    warning: "Promenades courtes",
  }),
  dog(12, "arriving", {
    breed: "Jack Russell",
    owner: "Claire Vidal",
    pet: "Tango",
    stay: { arrival: 2, departure: 5 },
  }),
  dog(13, "occupied", {
    breed: "Husky",
    owner: "Hélène Garcia",
    pet: "Taïga",
    stay: { arrival: 1, departure: 5 },
  }),
  dog(14, "departing", {
    breed: "Teckel",
    owner: "Nina Robert",
    pet: "Pixel",
    stay: { arrival: -3, departure: 2 },
  }),
  dog(15, "occupied", {
    breed: "Basset hound",
    owner: "Denis Lopez",
    pet: "Gus",
    stay: { arrival: 1, departure: 7 },
  }),
  dog(16, "free"),
  dog(17, "occupied", {
    breed: "Shiba inu",
    owner: "Kevin Nguyen",
    pet: "Nouky",
    stay: { arrival: 1, departure: 4 },
  }),
  dog(18, "departing", {
    breed: "Husky",
    owner: "Hugo Lambert",
    pet: "Sirius",
    stay: { arrival: -5, departure: 2 },
  }),
  dog(19, "occupied", {
    breed: "Setter irlandais",
    owner: "Pauline Simon",
    pet: "Ruby",
    stay: { arrival: -1, departure: 8 },
  }),
  dog(20, "occupied", {
    breed: "Rottweiler",
    owner: "Franck Rey",
    pet: "Brutus",
    stay: { arrival: 0, departure: 4 },
    warning: "Sorties seul, sans congénères",
  }),
  cat(1, "occupied", {
    breed: "Européen",
    diet: "Croquettes sans céréales fournies",
    owner: "Julien Bernard",
    pet: "Pistache",
    stay: { arrival: 1, departure: 3 },
  }),
  cat(2, "occupied", {
    breed: "Chartreux",
    owner: "Sarah Klein",
    pet: "Réglisse",
    stay: { arrival: 1, departure: 3 },
  }),
  cat(3, "arriving", {
    breed: "Sacré de Birmanie",
    owner: "Inès Faure",
    pet: "Mochi",
    stay: { arrival: 2, departure: 8 },
  }),
  cat(4, "occupied", {
    breed: "Maine coon",
    owner: "Nicolas Perrin",
    pet: "Plume",
    stay: { arrival: 0, departure: 3 },
  }),
]

export type StayMovement = {
  id: string
  type: "arrival" | "departure"
  time: string
  pet: string
  owner: string
  kennel: string
  status: "done" | "expected" | "late"
  /** Departure: balance to collect. Arrival: items to check. */
  balance?: number
  checks?: string[]
}

export const stayMovements: StayMovement[] = [
  {
    balance: 0,
    id: "caramel",
    kennel: "Box 5",
    owner: "Lucas Garnier",
    pet: "Caramel",
    status: "done",
    time: "08:00",
    type: "departure",
  },
  {
    checks: ["Carnet de vaccination", "Collyre fourni"],
    id: "ulysse",
    kennel: "Box 2",
    owner: "Marie Fontaine",
    pet: "Ulysse",
    status: "done",
    time: "09:00",
    type: "arrival",
  },
  {
    balance: 87,
    id: "pixel",
    kennel: "Box 14",
    owner: "Nina Robert",
    pet: "Pixel",
    status: "late",
    time: "10:00",
    type: "departure",
  },
  {
    checks: ["Carnet de vaccination", "Contrat signé", "Croquettes"],
    id: "gaia",
    kennel: "Box 9",
    owner: "Antoine Roux",
    pet: "Gaïa",
    status: "expected",
    time: "11:30",
    type: "arrival",
  },
  {
    checks: ["Carnet de vaccination", "Panier & jouet"],
    id: "tango",
    kennel: "Box 12",
    owner: "Claire Vidal",
    pet: "Tango",
    status: "expected",
    time: "14:00",
    type: "arrival",
  },
  {
    balance: 176,
    id: "sirius",
    kennel: "Box 18",
    owner: "Hugo Lambert",
    pet: "Sirius",
    status: "expected",
    time: "16:00",
    type: "departure",
  },
  {
    checks: ["Carnet de vaccination", "Litière habituelle"],
    id: "mochi",
    kennel: "Chatterie 3",
    owner: "Inès Faure",
    pet: "Mochi",
    status: "expected",
    time: "17:30",
    type: "arrival",
  },
]

export type MealService = {
  id: string
  label: string
  time: string
  start: number
  served: number
  total: number
}

export const meals: MealService[] = [
  { id: "am", label: "Matin", served: 18, start: 8, time: "8h00", total: 18 },
  { id: "noon", label: "Midi", served: 0, start: 12, time: "12h00", total: 4 },
  { id: "pm", label: "Soir", served: 0, start: 18, time: "18h00", total: 19 },
]

export type Outing = {
  id: string
  time: string
  start: number
  end: number
  label: string
  place: string
  pets: string[]
}

export const outings: Outing[] = [
  {
    end: 9,
    id: "morning",
    label: "Sortie matinale",
    pets: ["Tous les chiens"],
    place: "Parc nord",
    start: 8.25,
    time: "8h15",
  },
  {
    end: 11,
    id: "players",
    label: "Groupe joueurs",
    pets: ["Bella", "Loki", "Taïga", "Nouky"],
    place: "Grand parc",
    start: 10.25,
    time: "10h15",
  },
  {
    end: 11.75,
    id: "calm",
    label: "Groupe calmes",
    pets: ["Oscar", "Gus", "Praline", "Ruby", "Ulysse"],
    place: "Parc ombragé",
    start: 11.25,
    time: "11h15",
  },
  {
    end: 12,
    id: "solo",
    label: "Sorties individuelles",
    pets: ["Brutus", "Hercule", "Kiwi"],
    place: "Allée des pins",
    start: 11.75,
    time: "11h45",
  },
  {
    end: 15.5,
    id: "forest",
    label: "Balade en forêt",
    pets: ["Bella", "Loki", "Taïga", "Ruby"],
    place: "Bois des Coteaux",
    start: 14.5,
    time: "14h30",
  },
  {
    end: 17.75,
    id: "evening",
    label: "Sortie du soir",
    pets: ["Tous les chiens"],
    place: "Parc nord",
    start: 17,
    time: "17h00",
  },
]

export type OwnerNews = {
  id: string
  pet: string
  owner: string
  initials: string
  kennel: string
  note: string
  sent: boolean
}

export const ownerNews: OwnerNews[] = [
  {
    id: "max",
    initials: "CM",
    kennel: "Box 4",
    note: "A bien mangé, boite moins ce matin",
    owner: "Camille Martin",
    pet: "Max",
    sent: true,
  },
  {
    id: "ulysse",
    initials: "MF",
    kennel: "Box 2",
    note: "Premier jour : s'installe tranquillement",
    owner: "Marie Fontaine",
    pet: "Ulysse",
    sent: false,
  },
  {
    id: "pistache",
    initials: "JB",
    kennel: "Chatterie 1",
    note: "Joue beaucoup avec la canne à plume",
    owner: "Julien Bernard",
    pet: "Pistache",
    sent: false,
  },
  {
    id: "taiga",
    initials: "HG",
    kennel: "Box 13",
    note: "Super balade avec le groupe joueurs",
    owner: "Hélène Garcia",
    pet: "Taïga",
    sent: false,
  },
]

/** Nights elapsed and a human label for a stay, relative to today. */
export function stayProgress({
  arrival,
  departure,
}: {
  arrival: number
  departure: number
}) {
  const nights = departure - arrival
  const elapsed = Math.min(Math.max(TODAY - arrival, 0), nights)
  const label =
    arrival === TODAY
      ? "Arrive aujourd'hui"
      : departure === TODAY
        ? "Part aujourd'hui"
        : arrival > TODAY
          ? `Arrive le ${shortDate(arrival)}`
          : departure < TODAY
            ? "Terminé"
            : `${elapsed} nuit${elapsed > 1 ? "s" : ""} sur ${nights}`
  return { elapsed, label, nights }
}

export type StayStatus = "ongoing" | "upcoming" | "pending" | "done"
export type StayPayment = "deposit" | "paid" | "due"

export type Stay = {
  id: string
  /** Undefined while a request still has to be placed in a box. */
  kennelId?: string
  pet: string
  breed: string
  owner: string
  arrival: number
  departure: number
  status: StayStatus
  payment: StayPayment
  options: string[]
  note?: string
}

export type OptionPrices = Record<string, { price: number; perNight?: boolean }>

export const optionPrices: OptionPrices = {
  Promenade: { perNight: true, price: 6 },
  Régime: { perNight: true, price: 2 },
  "Bain & brossage": { price: 35 },
  Traitement: { perNight: true, price: 3 },
}

export const nightlyRate = (kennelId?: string) =>
  kennelId?.startsWith("c") ? 16 : 25

export function stayLines(stay: Stay, prices = optionPrices) {
  const nights = stay.departure - stay.arrival
  const rate = nightlyRate(stay.kennelId)
  return [
    { amount: nights * rate, label: `${nights} nuits × ${rate} €` },
    ...stay.options.map((option) => {
      const { perNight, price } = prices[option] ?? { price: 0 }
      return {
        amount: perNight ? price * nights : price,
        label: perNight ? `${option} · ${nights} × ${price} €` : option,
      }
    }),
  ]
}

export const stayAmount = (stay: Stay, prices = optionPrices) =>
  stayLines(stay, prices).reduce((sum, line) => sum + line.amount, 0)

export const stayDeposit = (stay: Stay, prices = optionPrices) =>
  Math.round(stayAmount(stay, prices) * 0.3)

const extraOptions: Record<string, string[]> = {
  b13: ["Promenade"],
  b18: ["Promenade", "Bain & brossage"],
  b4: ["Bain & brossage"],
  b7: ["Promenade"],
}

const currentStays: Stay[] = kennels
  .filter((k) => k.pet && k.stay)
  .map((k) => ({
    arrival: k.stay!.arrival,
    breed: k.breed ?? "",
    departure: k.stay!.departure,
    id: `${k.id}-now`,
    kennelId: k.id,
    note: k.warning,
    options: [
      ...(k.meds ? ["Traitement"] : []),
      ...(k.diet ? ["Régime"] : []),
      ...(extraOptions[k.id] ?? []),
    ],
    owner: k.owner ?? "",
    payment:
      k.status === "departing"
        ? "due"
        : k.id === "b11" || k.id === "c1"
          ? "paid"
          : "deposit",
    pet: k.pet ?? "",
    status: k.status === "arriving" ? "upcoming" : "ongoing",
  }))

const stay = (
  id: string,
  kennelId: string | undefined,
  pet: string,
  breed: string,
  owner: string,
  [arrival, departure]: [number, number],
  status: StayStatus,
  payment: StayPayment,
  options: string[] = [],
  note?: string
): Stay => ({
  arrival,
  breed,
  departure,
  id,
  kennelId,
  note,
  options,
  owner,
  payment,
  pet,
  status,
})

const otherStays: Stay[] = [
  stay(
    "sultan",
    "b3",
    "Sultan",
    "Dogue allemand",
    "Patrick Morin",
    [-9, -2],
    "done",
    "paid"
  ),
  stay(
    "choupette",
    "c4",
    "Choupette",
    "Persan",
    "Émilie Roy",
    [-8, -1],
    "done",
    "paid",
    ["Régime"]
  ),
  stay(
    "rio",
    "b12",
    "Rio",
    "Épagneul breton",
    "Benoît Caron",
    [-7, -3],
    "done",
    "due",
    ["Promenade"]
  ),
  stay(
    "ficelle",
    "b16",
    "Ficelle",
    "Whippet",
    "Anne Lefèvre",
    [-6, 0],
    "done",
    "paid"
  ),
  stay(
    "caramel",
    "b5",
    "Caramel",
    "Cocker",
    "Lucas Garnier",
    [-3, 2],
    "done",
    "paid",
    ["Bain & brossage"]
  ),
  stay(
    "vanille",
    "b3",
    "Vanille",
    "Bichon frisé",
    "Monique Petit",
    [3, 6],
    "upcoming",
    "deposit"
  ),
  stay(
    "cookie",
    "b10",
    "Cookie",
    "Carlin",
    "Manon Rivière",
    [3, 5],
    "upcoming",
    "deposit",
    ["Régime"]
  ),
  stay(
    "rocco",
    "b18",
    "Rocco",
    "Cane corso",
    "Samuel Leblanc",
    [3, 10],
    "upcoming",
    "deposit",
    [],
    "Sorties seul"
  ),
  stay(
    "saphir",
    "b5",
    "Saphir",
    "Lévrier afghan",
    "Sandrine Colas",
    [4, 8],
    "upcoming",
    "deposit",
    ["Bain & brossage"]
  ),
  stay(
    "iris",
    "b14",
    "Iris",
    "Whippet",
    "Jeanne Barbier",
    [4, 7],
    "upcoming",
    "deposit"
  ),
  stay(
    "sushi",
    "c4",
    "Sushi",
    "Ragdoll",
    "Yuki Tanaka",
    [4, 9],
    "upcoming",
    "deposit"
  ),
  stay(
    "indie",
    "b6",
    "Indie",
    "Berger australien",
    "Arthur Noël",
    [5, 9],
    "upcoming",
    "deposit",
    ["Promenade"]
  ),
  stay(
    "minou",
    "c1",
    "Minou",
    "Européen",
    "Clara Duval",
    [5, 12],
    "upcoming",
    "deposit"
  ),
  stay(
    "gaston",
    "b1",
    "Gaston",
    "Épagneul breton",
    "Céline Marchal",
    [6, 10],
    "upcoming",
    "deposit"
  ),
  stay(
    "ozzy",
    "b12",
    "Ozzy",
    "Staffordshire",
    "Lisa Martins",
    [6, 13],
    "upcoming",
    "deposit",
    ["Promenade"]
  ),
  stay(
    "tenor",
    "b4",
    "Ténor",
    "Bouvier bernois",
    "Famille Lemoine",
    [7, 12],
    "upcoming",
    "deposit",
    ["Traitement"]
  ),
  stay(
    "moka",
    "b16",
    "Moka",
    "Labrador",
    "Paul Girard",
    [8, 11],
    "pending",
    "deposit",
    [],
    "Rappel CHPPiL expiré : certificat à fournir"
  ),
  stay(
    "lucky",
    "b2",
    "Lucky",
    "Labrador",
    "Jérôme Faure",
    [9, 13],
    "upcoming",
    "deposit"
  ),
  stay(
    "zeus",
    "b20",
    "Zeus",
    "Dobermann",
    "Fabrice Morel",
    [9, 12],
    "upcoming",
    "deposit"
  ),
  stay(
    "pacha",
    "b8",
    "Pacha",
    "Chow-chow",
    "Victor Hugues",
    [10, 15],
    "upcoming",
    "deposit"
  ),
  stay(
    "nala",
    "b7",
    "Nala",
    "Border collie",
    "Léa Moreau",
    [11, 14],
    "pending",
    "deposit",
    [],
    "A peur de l'orage, laisser sa couverture"
  ),
  stay(
    "elfe",
    "b17",
    "Elfe",
    "Samoyède",
    "Damien Roux",
    [11, 16],
    "upcoming",
    "deposit",
    ["Promenade"]
  ),
  stay(
    "caline",
    undefined,
    "Câline",
    "Golden retriever",
    "Laura Mercier",
    [12, 17],
    "pending",
    "deposit",
    ["Promenade"]
  ),
]

export const stays: Stay[] = [...currentStays, ...otherStays]

/** First kennel of the right area with no stay overlapping the dates. */
export function findFreeKennel(list: Stay[], target: Stay) {
  const area = target.breed.match(/Persan|Ragdoll|Européen|Chartreux/)
    ? "Chatterie"
    : "Chenil"
  return kennels.find(
    (k) =>
      k.area === area &&
      !list.some(
        (s) =>
          s.kennelId === k.id &&
          s.id !== target.id &&
          s.arrival < target.departure &&
          target.arrival < s.departure
      )
  )
}
