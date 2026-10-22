import { useSyncExternalStore } from "react"
import type { Activity } from "@/components/activity-mark"
import { daysBetween } from "@/components/pets/data"
import type { Coat, Size } from "@/components/services/data"
import { photo } from "@/components/site/venues"

export * from "@/components/site/venues"

/* ——— Le compte de la cliente ——— */

export const me = {
  address: "24 rue Sainte-Catherine, 33000 Bordeaux",
  card: "Visa •••• 4242",
  email: "julie.moreau@mail.fr",
  first: "Julie",
  last: "Moreau",
  phone: "06 12 34 56 78",
}

export type MyPet = {
  id: string
  name: string
  species: "Chien" | "Chat"
  breed: string
  sex: "Mâle" | "Femelle"
  neutered: boolean
  birth: string
  weight: number
  size?: Size
  coat: Coat
  tone: string
  photo?: string
  gallery: string[]
  chip: string
  vaccines: { name: string; expires: string }[]
  food: string
  health: string
  behaviour: string
  vet: string
  traits: string[]
  compat: { dogs: Compat; cats: Compat; kids: Compat }
  routine: { time: string; text: string }[]
  weights: { date: string; kg: number }[]
}

export type Compat = "yes" | "careful" | "no"

/** Ce qu'un établissement a noté après une visite. */
export type PetNote = {
  id: string
  pet: string
  booking: string
  author: string
  role: string
  date: string
  text: string
  tags: string[]
  /** Appétit, sommeil, moral : de 1 à 3, pour un séjour. */
  mood?: { appetite: number; sleep: number; play: number }
  tip?: string
  photos?: string[]
}

export type BookingStatus =
  "pending" | "confirmed" | "ongoing" | "done" | "cancelled"

export type MyBooking = {
  id: string
  venue: string
  activity: Activity
  pets: string[]
  status: BookingStatus
  start: string
  /** Départ, pour un séjour. */
  end?: string
  /** Heure, pour un rendez-vous. */
  time?: string
  item: string
  lines: { label: string; amount: number }[]
  payment: "online" | "onsite"
  note?: string
  reviewed?: boolean
}

export type Message = { mine: boolean; text: string; time: string }
export type Thread = { venue: string; unread: number; messages: Message[] }

export const statusMeta: Record<
  BookingStatus,
  {
    label: string
    variant: "warning" | "success" | "info" | "secondary" | "error"
  }
> = {
  cancelled: { label: "Annulée", variant: "error" },
  confirmed: { label: "Confirmée", variant: "success" },
  done: { label: "Terminée", variant: "secondary" },
  ongoing: { label: "En cours", variant: "info" },
  pending: { label: "En attente", variant: "warning" },
}

export const petTones = [
  "bg-wise-yellow text-wise-gold",
  "bg-wise-pink text-wise-purple",
  "bg-wise-blue text-wise-charcoal",
  "bg-wise-orange text-wise-maroon",
]

type SiteState = {
  pets: MyPet[]
  bookings: MyBooking[]
  favorites: string[]
  threads: Thread[]
  notes: PetNote[]
}

let state: SiteState = {
  bookings: [
    {
      activity: "Pension",
      end: "2026-11-01",
      id: "KN-4821",
      item: "Box",
      lines: [
        { amount: 229, label: "8 nuits · Box" },
        { amount: 48, label: "Promenade × 8" },
        { amount: 0, label: "Nouvelles en photo" },
      ],
      payment: "online",
      pets: ["oslo"],
      start: "2026-10-24",
      status: "confirmed",
      venue: "les-coteaux",
    },
    {
      activity: "Toilettage",
      id: "KN-4907",
      item: "Toilettage complet",
      lines: [{ amount: 72, label: "Toilettage complet · Moyen, poil long" }],
      payment: "onsite",
      pets: ["oslo"],
      start: "2026-11-05",
      status: "pending",
      time: "14h30",
      venue: "chic-et-chien",
    },
    {
      activity: "Pension",
      end: "2026-08-16",
      id: "KN-3988",
      item: "Chatterie",
      lines: [{ amount: 294, label: "14 nuits · Chatterie" }],
      payment: "online",
      pets: ["mochi"],
      start: "2026-08-02",
      status: "done",
      venue: "chatterie-du-lac",
    },
    {
      activity: "Éducation",
      id: "KN-4210",
      item: "Séance individuelle",
      lines: [{ amount: 45, label: "Séance individuelle · 1 h" }],
      payment: "onsite",
      pets: ["oslo"],
      reviewed: true,
      start: "2026-09-12",
      status: "done",
      time: "10h00",
      venue: "les-coteaux",
    },
    {
      activity: "Pension",
      end: "2026-07-24",
      id: "KN-3120",
      item: "Box",
      lines: [
        { amount: 420, label: "14 nuits · Box · Été" },
        { amount: 84, label: "Promenade × 14" },
      ],
      payment: "online",
      pets: ["oslo"],
      reviewed: true,
      start: "2026-07-10",
      status: "done",
      venue: "les-coteaux",
    },
    {
      activity: "Toilettage",
      id: "KN-2950",
      item: "Toilettage complet",
      lines: [{ amount: 72, label: "Toilettage complet · Moyen, poil long" }],
      payment: "onsite",
      pets: ["oslo"],
      reviewed: true,
      start: "2026-06-14",
      status: "done",
      time: "10h00",
      venue: "chic-et-chien",
    },
    {
      activity: "Toilettage",
      id: "KN-3712",
      item: "Griffes",
      lines: [{ amount: 9, label: "Griffes · Chat" }],
      payment: "onsite",
      pets: ["mochi"],
      start: "2026-07-04",
      status: "cancelled",
      time: "11h00",
      venue: "poils-et-bulles",
    },
  ],
  favorites: ["les-coteaux", "chatterie-du-lac"],
  notes: [
    {
      author: "Léa",
      booking: "KN-4210",
      date: "2026-09-12",
      id: "n-4",
      pet: "oslo",
      role: "Éducatrice",
      tags: ["Rappel acquis", "Très concentré"],
      text: "Très bonne séance ! Oslo revient au rappel même avec d'autres chiens autour. La prochaine fois, on travaille la marche en laisse.",
      tip: "5 minutes de rappel par jour, avec une friandise à la clé.",
    },
    {
      author: "Claire",
      booking: "KN-3120",
      date: "2026-07-24",
      id: "n-3",
      mood: { appetite: 3, play: 3, sleep: 2 },
      pet: "oslo",
      photos: [
        photo("1548199973-03cce0bbc87b"),
        photo("1534361960057-19889db9621e"),
        photo("1594149929911-78975a43d4f5"),
        photo("1444212477490-ca407925329e"),
        photo("1525253086316-d0c936c814f8"),
        photo("1576201836106-db1758fd1c97"),
      ],
      role: "Gérante",
      tags: ["A adoré le parc", "Copain avec Nala", "Orage le 18"],
      text: "Oslo a passé un super séjour. Il a joué tous les jours au parc avec Nala et n'a rien laissé dans sa gamelle. Un peu stressé pendant l'orage du 18 : on l'a gardé près de nous.",
    },
    {
      author: "Inès",
      booking: "KN-2950",
      date: "2026-06-14",
      id: "n-2",
      pet: "oslo",
      role: "Toiletteuse",
      tags: ["Calme", "Poil emmêlé"],
      text: "Très sage, même pendant le séchage. Quelques nœuds derrière les oreilles, retirés en douceur.",
      tip: "Un coup de brosse derrière les oreilles deux fois par semaine.",
    },
    {
      author: "Sophie",
      booking: "KN-3988",
      date: "2026-08-16",
      id: "n-1",
      mood: { appetite: 3, play: 2, sleep: 3 },
      pet: "mochi",
      photos: [
        photo("1513360371669-4adf3dd7dff8"),
        photo("1519052537078-e6302a4968d4"),
        photo("1495360010541-f48722b34f7d"),
      ],
      role: "Gérante",
      tags: ["Timide au début", "Aime la fenêtre"],
      text: "Mochi s'est cachée les deux premiers jours, puis elle a pris ses habitudes sur le rebord de la fenêtre. Elle a très bien mangé sa pâtée chaque soir.",
    },
  ],
  pets: [
    {
      behaviour: "Très sociable. A peur de l'orage.",
      birth: "2023-04-12",
      breed: "Berger australien",
      chip: "250 26 9 812 345 678",
      coat: "Long",
      food: "Croquettes, 2 repas par jour (matin et soir)",
      health: "Aucun traitement",
      id: "oslo",
      name: "Oslo",
      neutered: true,
      sex: "Mâle",
      size: "Moyen",
      species: "Chien",
      tone: petTones[0],
      photo: photo("1587300003388-59208cc962cb"),
      gallery: [
        photo("1503256207526-0d5d80fa2f47"),
        photo("1530281700549-e82e7bf110d6"),
        photo("1544568100-847a948585b9"),
      ],
      vaccines: [
        { expires: "2027-03-02", name: "CHPPiL" },
        { expires: "2027-03-02", name: "Rage" },
        { expires: "2026-11-20", name: "Toux du chenil" },
      ],
      vet: "Clinique des Quais · 05 56 00 00 00",
      weight: 22,
      traits: ["Sociable", "Joueur", "Très gourmand", "Peur de l'orage"],
      compat: { cats: "careful", dogs: "yes", kids: "yes" },
      routine: [
        { text: "Croquettes, 150 g", time: "7h30" },
        { text: "Promenade de 30 min", time: "12h" },
        { text: "Croquettes, 150 g", time: "19h" },
        { text: "Dernière sortie", time: "22h" },
      ],
      weights: [
        { date: "2026-03-02", kg: 20.6 },
        { date: "2026-06-14", kg: 21.2 },
        { date: "2026-07-24", kg: 21.8 },
        { date: "2026-09-12", kg: 22.1 },
        { date: "2026-10-01", kg: 22 },
      ],
    },
    {
      behaviour: "Timide au début, adore les câlins ensuite.",
      birth: "2021-06-01",
      breed: "Européen",
      chip: "250 26 9 801 234 567",
      coat: "Court",
      food: "Pâtée le soir, croquettes à volonté",
      health: "Sensible de l'estomac",
      id: "mochi",
      name: "Mochi",
      neutered: true,
      sex: "Femelle",
      species: "Chat",
      tone: petTones[1],
      photo: photo("1518791841217-8f162f1e1131"),
      gallery: [
        photo("1495360010541-f48722b34f7d"),
        photo("1574158622682-e40e69881006"),
      ],
      vaccines: [
        { expires: "2027-01-15", name: "Typhus et coryza" },
        { expires: "2026-09-30", name: "Leucose" },
      ],
      vet: "Clinique des Quais · 05 56 00 00 00",
      weight: 4,
      traits: ["Timide", "Câline", "Calme"],
      compat: { cats: "yes", dogs: "no", kids: "careful" },
      routine: [
        { text: "Croquettes à volonté", time: "8h" },
        { text: "Pâtée, un demi-sachet", time: "19h" },
      ],
      weights: [
        { date: "2026-01-15", kg: 4.1 },
        { date: "2026-08-16", kg: 3.9 },
        { date: "2026-10-05", kg: 4 },
      ],
    },
  ],
  threads: [
    {
      messages: [
        {
          mine: false,
          text: "Bonjour Julie, nous avons bien reçu la réservation d'Oslo pour la Toussaint. Pensez à apporter son carnet de santé !",
          time: "Hier · 18h02",
        },
        {
          mine: true,
          text: "Merci ! Je le dépose samedi vers 10h.",
          time: "Hier · 18h30",
        },
        {
          mine: false,
          text: "Parfait, à samedi. Oslo aura le box 4, juste à côté du parc.",
          time: "Aujourd'hui · 9h12",
        },
      ],
      unread: 1,
      venue: "les-coteaux",
    },
    {
      messages: [
        {
          mine: false,
          text: "Bonjour, nous avons bien reçu votre demande pour le 5 novembre. Nous vous confirmons très vite.",
          time: "Lun. · 11h40",
        },
      ],
      unread: 0,
      venue: "chic-et-chien",
    },
  ],
}

/* ——— Store partagé par les pages du site ——— */

const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const getState = () => state
const commit = (next: (s: SiteState) => SiteState) => {
  state = next(state)
  for (const listener of listeners) listener()
}

export const useSite = () => useSyncExternalStore(subscribe, getState, getState)

export const toggleFavorite = (slug: string) =>
  commit((s) => ({
    ...s,
    favorites: s.favorites.includes(slug)
      ? s.favorites.filter((f) => f !== slug)
      : [...s.favorites, slug],
  }))

export const addBooking = (booking: MyBooking) =>
  commit((s) => ({ ...s, bookings: [booking, ...s.bookings] }))

export const updateBooking = (id: string, patch: Partial<MyBooking>) =>
  commit((s) => ({
    ...s,
    bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
  }))

export const savePet = (pet: MyPet) =>
  commit((s) => ({
    ...s,
    pets: s.pets.some((p) => p.id === pet.id)
      ? s.pets.map((p) => (p.id === pet.id ? pet : p))
      : [...s.pets, pet],
  }))

export const sendMessage = (venue: string, text: string) =>
  commit((s) => {
    const message = { mine: true, text, time: "À l'instant" }
    const exists = s.threads.some((t) => t.venue === venue)
    return {
      ...s,
      threads: exists
        ? s.threads.map((t) =>
            t.venue === venue
              ? { ...t, messages: [...t.messages, message], unread: 0 }
              : t
          )
        : [{ messages: [message], unread: 0, venue }, ...s.threads],
    }
  })

export const markRead = (venue: string) =>
  commit((s) => ({
    ...s,
    threads: s.threads.map((t) =>
      t.venue === venue ? { ...t, unread: 0 } : t
    ),
  }))

/* ——— Aides ——— */

export const bookingTotal = (b: MyBooking) =>
  b.lines.reduce((sum, l) => sum + l.amount, 0)

export const isUpcoming = (b: MyBooking) =>
  b.status === "pending" || b.status === "confirmed" || b.status === "ongoing"

export const ageOf = (birth: string, on = "2026-10-21") => {
  const months = Math.floor(daysBetween(birth, on) / 30.44)
  return months < 12
    ? `${months} mois`
    : `${Math.floor(months / 12)} an${months >= 24 ? "s" : ""}`
}

export type VaxStatus = "valid" | "soon" | "expired"

export function vaxStatus(expires: string, on = "2026-10-21"): VaxStatus {
  const left = daysBetween(on, expires)
  if (left < 0) return "expired"
  return left <= 45 ? "soon" : "valid"
}

export const petAlerts = (pet: MyPet) =>
  pet.vaccines.filter((v) => vaxStatus(v.expires) !== "valid")

export const compatMeta: Record<Compat, { label: string; tone: string }> = {
  careful: { label: "Avec précaution", tone: "bg-warning-soft" },
  no: { label: "Non", tone: "bg-destructive-soft" },
  yes: { label: "Oui", tone: "bg-success-soft" },
}

export const nightsOf = (b: MyBooking) =>
  b.end ? daysBetween(b.start, b.end) : 0
