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
  stay?: { day: number; nights: number; until: string }
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
    stay: { day: 4, nights: 6, until: "Ven. 23 oct." },
  }),
  dog(2, "occupied", {
    breed: "Beagle",
    meds: "Collyre 2×/jour",
    owner: "Marie Fontaine",
    pet: "Ulysse",
    stay: { day: 1, nights: 5, until: "Lun. 26 oct." },
  }),
  dog(3, "free"),
  dog(4, "occupied", {
    breed: "Golden retriever",
    meds: "Anti-inflammatoire matin et soir",
    owner: "Camille Martin",
    pet: "Max",
    stay: { day: 3, nights: 7, until: "Dim. 25 oct." },
  }),
  dog(5, "cleaning"),
  dog(6, "occupied", {
    breed: "Border collie",
    owner: "Romain Petit",
    pet: "Bella",
    stay: { day: 2, nights: 3, until: "Jeu. 22 oct." },
  }),
  dog(7, "occupied", {
    breed: "Spitz nain",
    diet: "Pâtée mélangée, 3 repas",
    owner: "Agathe Leroux",
    pet: "Kiwi",
    stay: { day: 5, nights: 9, until: "Mer. 28 oct." },
  }),
  dog(8, "occupied", {
    breed: "Malinois",
    owner: "Yanis Morel",
    pet: "Loki",
    stay: { day: 2, nights: 4, until: "Ven. 23 oct." },
  }),
  dog(9, "arriving", {
    breed: "Berger blanc suisse",
    owner: "Antoine Roux",
    pet: "Gaïa",
    stay: { day: 0, nights: 4, until: "Dim. 25 oct." },
    warning: "Premier séjour",
  }),
  dog(10, "occupied", {
    breed: "Cavalier King Charles",
    owner: "Lucie Henry",
    pet: "Praline",
    stay: { day: 3, nights: 4, until: "Jeu. 22 oct." },
  }),
  dog(11, "occupied", {
    breed: "Bouledogue français",
    diet: "Ration réduite, pas de friandises",
    owner: "Olivier Blanc",
    pet: "Hercule",
    stay: { day: 6, nights: 10, until: "Sam. 31 oct." },
    warning: "Promenades courtes",
  }),
  dog(12, "arriving", {
    breed: "Jack Russell",
    owner: "Claire Vidal",
    pet: "Tango",
    stay: { day: 0, nights: 3, until: "Sam. 24 oct." },
  }),
  dog(13, "occupied", {
    breed: "Husky",
    owner: "Hélène Garcia",
    pet: "Taïga",
    stay: { day: 2, nights: 5, until: "Sam. 24 oct." },
  }),
  dog(14, "departing", {
    breed: "Teckel",
    owner: "Nina Robert",
    pet: "Pixel",
    stay: { day: 5, nights: 5, until: "Aujourd'hui 10h" },
  }),
  dog(15, "occupied", {
    breed: "Basset hound",
    owner: "Denis Lopez",
    pet: "Gus",
    stay: { day: 2, nights: 6, until: "Lun. 26 oct." },
  }),
  dog(16, "free"),
  dog(17, "occupied", {
    breed: "Shiba inu",
    owner: "Kevin Nguyen",
    pet: "Nouky",
    stay: { day: 1, nights: 2, until: "Ven. 23 oct." },
  }),
  dog(18, "departing", {
    breed: "Husky",
    owner: "Hugo Lambert",
    pet: "Sirius",
    stay: { day: 7, nights: 7, until: "Aujourd'hui 16h" },
  }),
  dog(19, "occupied", {
    breed: "Setter irlandais",
    owner: "Pauline Simon",
    pet: "Ruby",
    stay: { day: 4, nights: 8, until: "Mar. 27 oct." },
  }),
  dog(20, "occupied", {
    breed: "Rottweiler",
    owner: "Franck Rey",
    pet: "Brutus",
    stay: { day: 3, nights: 5, until: "Ven. 23 oct." },
    warning: "Sorties seul, sans congénères",
  }),
  cat(1, "occupied", {
    breed: "Européen",
    diet: "Croquettes sans céréales fournies",
    owner: "Julien Bernard",
    pet: "Pistache",
    stay: { day: 4, nights: 8, until: "Mer. 28 oct." },
  }),
  cat(2, "occupied", {
    breed: "Chartreux",
    owner: "Sarah Klein",
    pet: "Réglisse",
    stay: { day: 2, nights: 3, until: "Jeu. 22 oct." },
  }),
  cat(3, "arriving", {
    breed: "Sacré de Birmanie",
    owner: "Inès Faure",
    pet: "Mochi",
    stay: { day: 0, nights: 6, until: "Mar. 27 oct." },
  }),
  cat(4, "occupied", {
    breed: "Maine coon",
    owner: "Nicolas Perrin",
    pet: "Plume",
    stay: { day: 3, nights: 4, until: "Jeu. 22 oct." },
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
    balance: 126,
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
    balance: 245,
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
