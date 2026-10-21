import type { Activity } from "@/components/activity-mark"

// Demo "current time" for the day: 10h45.
export const NOW = 10.75

export type TimelineEvent = {
  activity: Activity
  label: string
  start: number
  end: number
  kind?: "arrival" | "departure"
}

export const timeline: TimelineEvent[] = [
  {
    activity: "Pension",
    end: 9,
    kind: "departure",
    label: "Caramel",
    start: 8,
  },
  { activity: "Pension", end: 10, kind: "arrival", label: "Ulysse", start: 9 },
  {
    activity: "Pension",
    end: 11,
    kind: "departure",
    label: "Pixel",
    start: 10,
  },
  {
    activity: "Pension",
    end: 12.5,
    kind: "arrival",
    label: "Gaïa",
    start: 11.5,
  },
  { activity: "Pension", end: 15, kind: "arrival", label: "Tango", start: 14 },
  {
    activity: "Pension",
    end: 17,
    kind: "departure",
    label: "Sirius",
    start: 16,
  },
  {
    activity: "Pension",
    end: 18.5,
    kind: "arrival",
    label: "Mochi",
    start: 17.5,
  },
  { activity: "Toilettage", end: 10.25, label: "Flocon", start: 9 },
  { activity: "Toilettage", end: 11.5, label: "Rex", start: 10.5 },
  { activity: "Toilettage", end: 12.5, label: "Cannelle", start: 11.75 },
  { activity: "Toilettage", end: 15.5, label: "Rocky", start: 14 },
  { activity: "Toilettage", end: 17, label: "Filou", start: 16 },
  { activity: "Éducation", end: 11, label: "Cours chiots", start: 10 },
  { activity: "Éducation", end: 15.5, label: "Pepper", start: 14.5 },
  { activity: "Éducation", end: 19, label: "Hachiko", start: 18 },
]

export type Movement = {
  id: string
  type: "arrival" | "departure"
  time: string
  pet: string
  breed: string
  client: string
  initials: string
  box: string
  status: "done" | "expected" | "late"
}

export const movements: Movement[] = [
  {
    box: "Box 5",
    breed: "Cocker",
    client: "Lucas Garnier",
    id: "caramel",
    initials: "LG",
    pet: "Caramel",
    status: "done",
    time: "08:00",
    type: "departure",
  },
  {
    box: "Box 2",
    breed: "Beagle",
    client: "Marie Fontaine",
    id: "ulysse",
    initials: "MF",
    pet: "Ulysse",
    status: "done",
    time: "09:00",
    type: "arrival",
  },
  {
    box: "Box 14",
    breed: "Teckel",
    client: "Nina Robert",
    id: "pixel",
    initials: "NR",
    pet: "Pixel",
    status: "late",
    time: "10:00",
    type: "departure",
  },
  {
    box: "Box 9",
    breed: "Berger blanc suisse",
    client: "Antoine Roux",
    id: "gaia",
    initials: "AR",
    pet: "Gaïa",
    status: "expected",
    time: "11:30",
    type: "arrival",
  },
  {
    box: "Box 12",
    breed: "Jack Russell",
    client: "Claire Vidal",
    id: "tango",
    initials: "CV",
    pet: "Tango",
    status: "expected",
    time: "14:00",
    type: "arrival",
  },
  {
    box: "Box 18",
    breed: "Husky",
    client: "Hugo Lambert",
    id: "sirius",
    initials: "HL",
    pet: "Sirius",
    status: "expected",
    time: "16:00",
    type: "departure",
  },
  {
    box: "Chatterie 3",
    breed: "Sacré de Birmanie",
    client: "Inès Faure",
    id: "mochi",
    initials: "IF",
    pet: "Mochi",
    status: "expected",
    time: "17:30",
    type: "arrival",
  },
]

export type CareTask = {
  id: string
  time: string
  pet: string
  box: string
  task: string
  done: boolean
}

export const careTasks: CareTask[] = [
  {
    box: "Box 4",
    done: true,
    id: "max-am",
    pet: "Max",
    task: "Anti-inflammatoire · 1 comprimé",
    time: "08:00",
  },
  {
    box: "Chatterie 1",
    done: true,
    id: "pistache-am",
    pet: "Pistache",
    task: "Repas sans céréales",
    time: "08:30",
  },
  {
    box: "Box 2",
    done: false,
    id: "ulysse-noon",
    pet: "Ulysse",
    task: "Collyre · 2 gouttes par œil",
    time: "12:00",
  },
  {
    box: "Chatterie 1",
    done: false,
    id: "pistache-noon",
    pet: "Pistache",
    task: "Repas sans céréales",
    time: "12:00",
  },
  {
    box: "Box 18",
    done: false,
    id: "sirius",
    pet: "Sirius",
    task: "Brossage avant le départ",
    time: "15:00",
  },
  {
    box: "Box 4",
    done: false,
    id: "max-pm",
    pet: "Max",
    task: "Anti-inflammatoire · 1 comprimé",
    time: "18:00",
  },
]

export type BoxStatus =
  "occupied" | "departing" | "arriving" | "cleaning" | "free"

const boxOverrides: Record<number, BoxStatus> = {
  3: "free",
  5: "cleaning",
  9: "arriving",
  12: "arriving",
  14: "departing",
  16: "free",
  18: "departing",
  21: "free",
}

export const boxes = Array.from({ length: 24 }, (_, i) => ({
  number: i + 1,
  status: boxOverrides[i + 1] ?? ("occupied" as BoxStatus),
}))

export const revenue: { activity: Activity; amount: number }[] = [
  { activity: "Pension", amount: 756 },
  { activity: "Toilettage", amount: 348 },
  { activity: "Éducation", amount: 180 },
]

export const week = [
  { amount: 980, day: "Lun" },
  { amount: 1120, day: "Mar" },
  { amount: 1284, day: "Mer", today: true },
  { amount: 1050, day: "Jeu" },
  { amount: 1390, day: "Ven" },
  { amount: 1610, day: "Sam" },
  { amount: 720, day: "Dim" },
]

export type Todo = {
  id: string
  label: string
  tag: Activity | "Facturation" | "Achats"
  href?: string
  done: boolean
}

export const todos: Todo[] = [
  {
    done: false,
    href: "/inbox",
    id: "lea",
    label: "Valider la demande de séjour de Léa Moreau",
    tag: "Pension",
  },
  {
    done: false,
    href: "/inbox",
    id: "thomas",
    label: "Relancer la facture de Thomas Petit (89 €)",
    tag: "Facturation",
  },
  {
    done: false,
    id: "box5",
    label: "Désinfecter le box 5",
    tag: "Pension",
  },
  {
    done: true,
    id: "vet",
    label: "Appeler le vétérinaire pour Ulysse",
    tag: "Pension",
  },
  {
    done: false,
    id: "kibble",
    label: "Commander des croquettes sans céréales",
    tag: "Achats",
  },
]

export const team = [
  { hours: "7h – 15h", initials: "CL", name: "Claire", role: "Pension" },
  { hours: "9h – 18h", initials: "MA", name: "Marc", role: "Toilettage" },
  { hours: "10h – 19h", initials: "IN", name: "Inès", role: "Éducation" },
]
