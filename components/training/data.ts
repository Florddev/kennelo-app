export type SessionKind = "Collectif" | "Individuel" | "À domicile"

export type TrainingSession = {
  id: string
  title: string
  kind: SessionKind
  start: number
  end: number
  place: string
  dog?: string
  breed?: string
  owner?: string
  initials?: string
  programme: { name: string; session: number; total: number }
  goal: string
  skills?: { label: string; value: number }[]
}

export const sessions: TrainingSession[] = [
  {
    end: 11,
    goal: "Socialisation et rappel au milieu des distractions",
    id: "puppies",
    kind: "Collectif",
    place: "Terrain A",
    programme: { name: "École du chiot", session: 3, total: 6 },
    start: 10,
    title: "Cours chiots",
  },
  {
    breed: "Border collie",
    dog: "Pepper",
    end: 15.5,
    goal: "Rester calme au départ de la balle",
    id: "pepper",
    initials: "LM",
    kind: "Individuel",
    owner: "Laura Mercier",
    place: "Terrain B · agility",
    programme: { name: "Gestion de l'excitation", session: 4, total: 8 },
    skills: [
      { label: "Rappel", value: 80 },
      { label: "Auto-contrôle", value: 55 },
      { label: "Calme au jeu", value: 40 },
    ],
    start: 14.5,
    title: "Pepper",
  },
  {
    breed: "Akita inu",
    dog: "Hachiko",
    end: 19,
    goal: "Croiser des congénères sans tirer en laisse",
    id: "hachiko",
    initials: "MD",
    kind: "À domicile",
    owner: "Mathieu Dupuis",
    place: "Domicile · Tassin-la-Demi-Lune",
    programme: { name: "Marche en laisse", session: 2, total: 6 },
    skills: [
      { label: "Marche en laisse", value: 25 },
      { label: "Attention au maître", value: 40 },
      { label: "Réactivité congénères", value: 30 },
    ],
    start: 18,
    title: "Hachiko",
  },
]

export type Puppy = {
  id: string
  name: string
  breed: string
  age: string
  owner: string
  present: boolean
}

export const puppies: Puppy[] = [
  {
    age: "4 mois",
    breed: "Shiba inu",
    id: "tofu",
    name: "Tofu",
    owner: "Léna Bertin",
    present: true,
  },
  {
    age: "5 mois",
    breed: "Golden retriever",
    id: "biscotte",
    name: "Biscotte",
    owner: "Famille Durand",
    present: true,
  },
  {
    age: "4 mois",
    breed: "Teckel",
    id: "pruneau",
    name: "Pruneau",
    owner: "Alice Roche",
    present: true,
  },
  {
    age: "5 mois",
    breed: "Berger australien",
    id: "luna",
    name: "Luna",
    owner: "Thomas Girard",
    present: true,
  },
  {
    age: "3 mois",
    breed: "Jack Russell",
    id: "pepito",
    name: "Pepito",
    owner: "Chloé Faure",
    present: true,
  },
  {
    age: "4 mois",
    breed: "Cavalier King Charles",
    id: "nouille",
    name: "Nouille",
    owner: "Maxime Vidal",
    present: false,
  },
]

/** Exercise plan of the live group session, in minutes. */
export const puppyPlan = [
  { label: "Accueil & jeux libres", minutes: 10 },
  { label: "Rappel en longe", minutes: 15 },
  { label: "Assis / couché au leurre", minutes: 15 },
  { label: "Parcours sensoriel : sons & surfaces", minutes: 15 },
  { label: "Bilan & devoirs de la semaine", minutes: 5 },
]

export const forecast = [
  { hour: 10, temp: 16, sky: "sun" },
  { hour: 12, temp: 18, sky: "sun" },
  { hour: 14, temp: 18, sky: "cloud" },
  { hour: 16, temp: 16, sky: "cloud" },
  { hour: 18, temp: 13, sky: "rain" },
  { hour: 19, temp: 12, sky: "rain" },
] as const

export type Report = {
  id: string
  dog: string
  owner: string
  session: string
  /** Hour the session ends; the report can be written after it. */
  after?: number
  sent: boolean
}

export const reports: Report[] = [
  {
    id: "oslo",
    dog: "Oslo",
    owner: "Sophie Leroy",
    sent: false,
    session: "Hier · Rappel à distance",
  },
  {
    after: 11,
    dog: "Cours chiots",
    id: "puppies",
    owner: "6 familles",
    sent: false,
    session: "Séance 3 + devoirs",
  },
  {
    after: 15.5,
    dog: "Pepper",
    id: "pepper",
    owner: "Laura Mercier",
    sent: false,
    session: "Séance 4 · Excitation",
  },
  {
    after: 19,
    dog: "Hachiko",
    id: "hachiko",
    owner: "Mathieu Dupuis",
    sent: false,
    session: "Séance 2 · Laisse",
  },
]

export const packages = [
  {
    dog: "Oslo",
    name: "Programme rappel",
    owner: "Sophie Leroy",
    total: 10,
    used: 9,
  },
  {
    dog: "Biscotte",
    name: "École du chiot",
    owner: "Famille Durand",
    total: 6,
    used: 3,
  },
  {
    dog: "Pepper",
    name: "Gestion de l'excitation",
    owner: "Laura Mercier",
    total: 8,
    used: 4,
  },
  {
    dog: "Hachiko",
    name: "Marche en laisse",
    owner: "Mathieu Dupuis",
    total: 6,
    used: 2,
  },
]
