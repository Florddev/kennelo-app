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
    dog: "Rex",
    name: "Éducation de base",
    owner: "Karim Benali",
    total: 8,
    used: 7,
  },
  {
    dog: "Oslo",
    name: "Programme rappel",
    owner: "Sophie Leroy",
    total: 10,
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

export type WeekSession = {
  id: string
  /** Day offset, see components/calendar.ts */
  day: number
  start: number
  end: number
  title: string
  kind: SessionKind
  place: string
  owner?: string
  programme?: { name: string; session: number; total: number }
  group?: { enrolled: number; capacity: number }
  report?: string
  cancelled?: boolean
}

export const weekSessions: WeekSession[] = [
  {
    day: 0,
    end: 19,
    id: "rex-7",
    kind: "Individuel",
    owner: "Karim Benali",
    place: "Terrain B",
    programme: { name: "Éducation de base", session: 7, total: 8 },
    report:
      "Le « pas bouger » tient 30 secondes avec distractions. Travailler le rappel en longe à la maison avant la dernière séance.",
    start: 18,
    title: "Rex",
  },
  {
    day: 1,
    end: 18,
    id: "oslo-3",
    kind: "Individuel",
    owner: "Sophie Leroy",
    place: "Terrain B",
    programme: { name: "Programme rappel", session: 3, total: 10 },
    start: 17,
    title: "Oslo",
  },
  {
    day: 1,
    end: 19.5,
    group: { capacity: 8, enrolled: 5 },
    id: "ados-tue",
    kind: "Collectif",
    place: "Terrain A",
    report:
      "Thème : marche en laisse au milieu du groupe. Bandit et Sky progressent bien, Oreo encore très excité au début.",
    start: 18.5,
    title: "Cours ados",
  },
  ...sessions.map((s) => ({
    day: 2,
    end: s.end,
    group: s.kind === "Collectif" ? { capacity: 8, enrolled: 6 } : undefined,
    id: s.id,
    kind: s.kind,
    owner: s.owner,
    place: s.place,
    programme: s.programme,
    start: s.start,
    title: s.title,
  })),
  {
    day: 3,
    end: 11,
    group: { capacity: 8, enrolled: 4 },
    id: "walk-thu",
    kind: "Collectif",
    place: "Bois des Coteaux",
    start: 10,
    title: "Balade éducative",
  },
  {
    day: 3,
    end: 19,
    id: "oslo-4",
    kind: "Individuel",
    owner: "Sophie Leroy",
    place: "Terrain B",
    programme: { name: "Programme rappel", session: 4, total: 10 },
    start: 18,
    title: "Oslo",
  },
  {
    day: 4,
    end: 18.5,
    id: "moka",
    kind: "À domicile",
    owner: "Paul Girard",
    place: "Domicile · Écully",
    programme: { name: "Bilan comportemental", session: 1, total: 1 },
    start: 17,
    title: "Moka",
  },
  {
    day: 4,
    end: 19.5,
    id: "rex-8",
    kind: "Individuel",
    owner: "Karim Benali",
    place: "Terrain B",
    programme: { name: "Éducation de base", session: 8, total: 8 },
    start: 18.5,
    title: "Rex",
  },
  {
    day: 5,
    end: 11,
    group: { capacity: 8, enrolled: 6 },
    id: "puppies-sat",
    kind: "Collectif",
    place: "Terrain A",
    programme: { name: "École du chiot", session: 4, total: 6 },
    start: 10,
    title: "Cours chiots",
  },
  {
    day: 5,
    end: 12.25,
    group: { capacity: 8, enrolled: 5 },
    id: "ados-sat",
    kind: "Collectif",
    place: "Terrain A",
    start: 11.25,
    title: "Cours ados",
  },
  {
    day: 5,
    end: 15.5,
    group: { capacity: 8, enrolled: 7 },
    id: "agility",
    kind: "Collectif",
    place: "Terrain B · agility",
    start: 14,
    title: "Agility loisir",
  },
  {
    day: 5,
    end: 17,
    id: "luna",
    kind: "Individuel",
    owner: "Thomas Girard",
    place: "Terrain B",
    programme: { name: "Rappel & marche", session: 2, total: 5 },
    start: 16,
    title: "Luna",
  },
  {
    cancelled: true,
    day: 6,
    end: 11.5,
    group: { capacity: 8, enrolled: 3 },
    id: "walk-sun",
    kind: "Collectif",
    place: "Bois des Coteaux",
    start: 10,
    title: "Balade éducative",
  },
]

export type Programme = {
  dog: string
  breed: string
  owner: string
  name: string
  done: number
  total: number
  next: string
  goal: string
  skills: { label: string; value: number }[]
  note: string
}

export const programmes: Programme[] = [
  {
    breed: "Berger allemand",
    done: 7,
    dog: "Rex",
    goal: "Obéissance de base fiable en extérieur",
    name: "Éducation de base",
    next: "Ven. 23 oct. · 18h30",
    note: "Dernière séance vendredi : prévoir le bilan et proposer la suite.",
    owner: "Karim Benali",
    skills: [
      { label: "Assis / couché", value: 95 },
      { label: "Pas bouger", value: 75 },
      { label: "Rappel", value: 60 },
    ],
    total: 8,
  },
  {
    breed: "Berger australien",
    done: 3,
    dog: "Oslo",
    goal: "Rappel à 30 m malgré les distractions",
    name: "Programme rappel",
    next: "Jeu. 22 oct. · 18h",
    note: "Revient bien sans distraction, décroche dès qu'il voit un joggeur.",
    owner: "Sophie Leroy",
    skills: [
      { label: "Rappel sans distraction", value: 85 },
      { label: "Rappel avec distraction", value: 35 },
      { label: "Attention au maître", value: 60 },
    ],
    total: 10,
  },
  ...sessions
    .filter((s) => s.dog && s.skills)
    .map((s) => ({
      breed: s.breed ?? "",
      done: s.programme.session - 1,
      dog: s.dog ?? "",
      goal: s.goal,
      name: s.programme.name,
      next: `Aujourd'hui · ${s.start === 18 ? "18h" : "14h30"}`,
      note:
        s.kind === "À domicile"
          ? "Séance à domicile : travailler dans la rue du client."
          : "Très motivé par la balle, à utiliser comme récompense.",
      owner: s.owner ?? "",
      skills: s.skills ?? [],
      total: s.programme.total,
    })),
  {
    breed: "Berger australien",
    done: 1,
    dog: "Luna",
    goal: "Rappel et marche en laisse au quotidien",
    name: "Rappel & marche",
    next: "Sam. 24 oct. · 16h",
    note: "Chiot très attentif, participe aussi à l'école du chiot.",
    owner: "Thomas Girard",
    skills: [
      { label: "Rappel", value: 45 },
      { label: "Marche en laisse", value: 30 },
    ],
    total: 5,
  },
]

export const groups = [
  {
    age: "2 à 6 mois",
    capacity: 8,
    id: "puppies",
    members: ["Tofu", "Biscotte", "Pruneau", "Luna", "Pepito", "Nouille"],
    name: "École du chiot",
    place: "Terrain A",
    price: "120 € les 6 séances",
    schedule: "Mer. 10h · Sam. 10h",
    waitlist: 2,
  },
  {
    age: "6 à 12 mois",
    capacity: 8,
    id: "ados",
    members: ["Bandit", "Sky", "Oreo", "Iris", "Choco"],
    name: "Cours ados",
    place: "Terrain A",
    price: "130 € les 8 séances",
    schedule: "Mar. 18h30 · Sam. 11h15",
    waitlist: 0,
  },
  {
    age: "Adultes",
    capacity: 8,
    id: "agility",
    members: ["Pepper", "Flash", "Tornade", "Ruby", "Bella", "Kenzo", "Indie"],
    name: "Agility loisir",
    place: "Terrain B · agility",
    price: "15 € la séance · carte 10 : 135 €",
    schedule: "Sam. 14h",
    waitlist: 1,
  },
  {
    age: "Tous âges",
    capacity: 8,
    id: "walk",
    members: ["Gus", "Praline", "Ruby", "Oscar"],
    name: "Balade éducative",
    place: "Bois des Coteaux",
    price: "12 € la balade",
    schedule: "Jeu. 10h · Dim. 10h",
    waitlist: 0,
  },
]
