import type { Activity } from "@/components/activity-mark"
import type { ChatDeliveryIndicatorProps } from "@/components/chat/chat-delivery-indicator"

export type Reaction = { emoji: string; count: number; selected: boolean }

export type BookingStatus =
  "pending" | "upcoming" | "ongoing" | "done" | "cancelled"

export type Booking = {
  id: string
  reference: string
  activity: Activity
  pet: string
  title: string
  dates: string
  details: string[]
  amount: number
  status: BookingStatus
}

export type BookingEvent = "created" | "confirmed" | "started" | "shared"

export type Message = {
  kind: "message"
  id: string
  day: string
  side: "incoming" | "outgoing"
  text: string
  time: string
  status?: ChatDeliveryIndicatorProps["status"]
  reactions?: Reaction[]
}

export type BookingEntry = {
  kind: "booking"
  id: string
  day: string
  time: string
  bookingId: string
  event: BookingEvent
}

export type ChatEntry = Message | BookingEntry

export type Conversation = {
  id: string
  client: string
  initials: string
  pets: string[]
  bookings: Booking[]
  unread: number
  unreadFromId?: string
  typing?: boolean
  entries: ChatEntry[]
}

export const reactionOptions = [
  { emoji: "❤️", label: "J'adore" },
  { emoji: "👍", label: "D'accord" },
  { emoji: "😂", label: "Drôle" },
  { emoji: "🐶", label: "Toutou" },
  { emoji: "🙏", label: "Merci" },
] as const

// Quick replies per activity. `{pet}` is replaced by the booking's pet.
export const quickReplies: Record<Activity, { label: string; text: string }[]> =
  {
    Pension: [
      {
        label: "📷 Photo du jour",
        text: "📷 Voici la photo du jour de {pet} !",
      },
      {
        label: "Bilan de la journée",
        text: "Excellente journée pour {pet} : repas terminés, jeux et deux belles promenades 🐾",
      },
    ],
    Toilettage: [
      {
        label: "✨ Prêt à récupérer",
        text: "{pet} est tout beau et prêt à être récupéré ✨",
      },
      {
        label: "Retard",
        text: "Nous avons un peu de retard, comptez 20 minutes de plus pour {pet}.",
      },
    ],
    Éducation: [
      {
        label: "Compte-rendu",
        text: "Compte-rendu de la séance : {pet} a bien progressé, on continue sur cette lancée !",
      },
      {
        label: "Exercices",
        text: "Pour cette semaine : 5 minutes de rappel par jour avec {pet}, en variant les lieux.",
      },
    ],
  }

export const conversations: Conversation[] = [
  {
    bookings: [
      {
        activity: "Pension",
        amount: 168,
        dates: "Du 18 au 24 oct.",
        details: ["6 nuits", "Traitement quotidien à 8h"],
        id: "r-0318",
        pet: "Max",
        reference: "R-2026-0318",
        status: "ongoing",
        title: "Séjour · Box 4",
      },
      {
        activity: "Toilettage",
        amount: 68,
        dates: "Sam. 24 oct. · 9h",
        details: ["Bain, coupe et griffes", "Avant le départ de pension"],
        id: "r-0341",
        pet: "Max",
        reference: "R-2026-0341",
        status: "pending",
        title: "Toilettage complet",
      },
      {
        activity: "Éducation",
        amount: 45,
        dates: "12 sept.",
        details: ["1 h", "Séance individuelle"],
        id: "r-0254",
        pet: "Max",
        reference: "R-2026-0254",
        status: "done",
        title: "Bilan comportemental",
      },
    ],
    client: "Camille Martin",
    entries: [
      {
        bookingId: "r-0318",
        day: "Ven. 17 oct.",
        event: "confirmed",
        id: "c0",
        kind: "booking",
        time: "14:20",
      },
      {
        day: "Ven. 17 oct.",
        id: "c0b",
        kind: "message",
        side: "outgoing",
        status: "read",
        text: "Tout est prêt pour accueillir Max demain 🐾",
        time: "14:21",
      },
      {
        bookingId: "r-0318",
        day: "Sam. 18 oct.",
        event: "started",
        id: "c0c",
        kind: "booking",
        time: "09:05",
      },
      {
        day: "Dim. 19 oct.",
        id: "c1",
        kind: "message",
        side: "incoming",
        text: "Bonjour ! Comment s'est passée la première nuit de Max ? 🐶",
        time: "09:12",
      },
      {
        day: "Dim. 19 oct.",
        id: "c2",
        kind: "message",
        reactions: [{ count: 1, emoji: "❤️", selected: false }],
        side: "outgoing",
        status: "read",
        text: "Bonjour Camille ! Très bien, il a mangé toute sa gamelle et a beaucoup joué avec Nala ce matin.",
        time: "09:20",
      },
      {
        day: "Dim. 19 oct.",
        id: "c3",
        kind: "message",
        side: "outgoing",
        status: "read",
        text: "Son traitement lui a été donné à 8h comme convenu.",
        time: "09:21",
      },
      {
        day: "Aujourd'hui",
        id: "c4",
        kind: "message",
        side: "incoming",
        text: "Super, merci beaucoup ! Serait-il possible d'ajouter une séance de toilettage avant son départ samedi ?",
        time: "10:02",
      },
      {
        day: "Aujourd'hui",
        id: "c5",
        kind: "message",
        side: "incoming",
        text: "Plutôt le matin si possible 🙏",
        time: "10:03",
      },
      {
        bookingId: "r-0341",
        day: "Aujourd'hui",
        event: "created",
        id: "c6",
        kind: "booking",
        time: "10:04",
      },
    ],
    id: "camille",
    initials: "CM",
    pets: ["Max · Golden retriever"],
    unread: 3,
    unreadFromId: "c4",
  },
  {
    bookings: [
      {
        activity: "Toilettage",
        amount: 45,
        dates: "Aujourd'hui · 14h – 15h30",
        details: [
          "Bain et brossage",
          "Peau sensible : shampoing hypoallergénique",
        ],
        id: "r-0336",
        pet: "Rocky",
        reference: "R-2026-0336",
        status: "ongoing",
        title: "Bain & brossage",
      },
      {
        activity: "Pension",
        amount: 196,
        dates: "Du 20 au 27 déc.",
        details: ["7 nuits", "Vacances de Noël"],
        id: "r-0322",
        pet: "Rocky",
        reference: "R-2026-0322",
        status: "upcoming",
        title: "Séjour · Box 11",
      },
    ],
    client: "Emma Dubois",
    entries: [
      {
        bookingId: "r-0322",
        day: "Lun. 13 oct.",
        event: "confirmed",
        id: "e0",
        kind: "booking",
        time: "18:30",
      },
      {
        day: "Lun. 13 oct.",
        id: "e0b",
        kind: "message",
        side: "outgoing",
        status: "read",
        text: "C'est noté pour les vacances de Noël, Rocky aura le box 11 🎄",
        time: "18:32",
      },
      {
        day: "Lun. 13 oct.",
        id: "e0c",
        kind: "message",
        side: "incoming",
        text: "Parfait, merci !",
        time: "18:40",
      },
      {
        bookingId: "r-0336",
        day: "Aujourd'hui",
        event: "started",
        id: "e0d",
        kind: "booking",
        time: "14:00",
      },
      {
        day: "Aujourd'hui",
        id: "e1",
        kind: "message",
        side: "outgoing",
        status: "read",
        text: "Rocky est bien arrivé, on commence le bain !",
        time: "14:05",
      },
      {
        day: "Aujourd'hui",
        id: "e2",
        kind: "message",
        side: "incoming",
        text: "Super ! Je peux passer le récupérer vers 17h ?",
        time: "15:40",
      },
    ],
    id: "emma",
    initials: "ED",
    pets: ["Rocky · Bouledogue français"],
    unread: 1,
    unreadFromId: "e2",
  },
  {
    bookings: [
      {
        activity: "Pension",
        amount: 126,
        dates: "Du 20 au 22 oct.",
        details: ["2 nuits", "Alimentation sans céréales"],
        id: "r-0329",
        pet: "Pistache",
        reference: "R-2026-0329",
        status: "ongoing",
        title: "Séjour · Chatterie 1",
      },
    ],
    client: "Julien Bernard",
    entries: [
      {
        bookingId: "r-0329",
        day: "Hier",
        event: "started",
        id: "j0",
        kind: "booking",
        time: "08:30",
      },
      {
        day: "Hier",
        id: "j1",
        kind: "message",
        side: "outgoing",
        status: "delivered",
        text: "Pistache est bien installée, elle explore sa chambre tranquillement.",
        time: "08:45",
      },
      {
        day: "Hier",
        id: "j2",
        kind: "message",
        side: "incoming",
        text: "Merci ! Elle peut être un peu timide au début.",
        time: "08:51",
      },
    ],
    id: "julien",
    initials: "JB",
    pets: ["Pistache · Chat européen"],
    typing: true,
    unread: 0,
  },
  {
    bookings: [
      {
        activity: "Éducation",
        amount: 380,
        dates: "Séance 4/10 · Jeu. 22 oct. 18h",
        details: ["Programme de 10 séances", "Rappel et marche en laisse"],
        id: "r-0287",
        pet: "Oslo",
        reference: "R-2026-0287",
        status: "ongoing",
        title: "Programme rappel",
      },
      {
        activity: "Toilettage",
        amount: 40,
        dates: "Mar. 3 nov. · 11h",
        details: ["Brossage et démêlage", "Période de mue"],
        id: "r-0345",
        pet: "Oslo",
        reference: "R-2026-0345",
        status: "upcoming",
        title: "Brossage & démêlage",
      },
    ],
    client: "Sophie Leroy",
    entries: [
      {
        day: "Hier",
        id: "s1",
        kind: "message",
        side: "incoming",
        text: "Merci pour la séance d'hier, Oslo revient beaucoup mieux au rappel !",
        time: "19:10",
      },
      {
        day: "Hier",
        id: "s2",
        kind: "message",
        side: "outgoing",
        status: "read",
        text: "Avec plaisir ! Continuez les exercices 5 minutes par jour, on fera le point jeudi.",
        time: "19:25",
      },
      {
        day: "Hier",
        id: "s3",
        kind: "message",
        side: "incoming",
        text: "Et est-ce que vous pourriez lui faire un brossage début novembre ? Il perd beaucoup ses poils 😅",
        time: "19:30",
      },
      {
        bookingId: "r-0345",
        day: "Hier",
        event: "confirmed",
        id: "s4",
        kind: "booking",
        time: "19:32",
      },
      {
        day: "Hier",
        id: "s5",
        kind: "message",
        side: "outgoing",
        status: "read",
        text: "C'est réservé pour le mardi 3 novembre à 11h !",
        time: "19:33",
      },
    ],
    id: "sophie",
    initials: "SL",
    pets: ["Oslo · Berger australien"],
    unread: 0,
  },
  {
    bookings: [
      {
        activity: "Toilettage",
        amount: 68,
        dates: "Ven. 23 oct. · 14h",
        details: ["Bain, coupe aux ciseaux et griffes", "1 h 30"],
        id: "r-0339",
        pet: "Lune",
        reference: "R-2026-0339",
        status: "upcoming",
        title: "Toilettage complet",
      },
      {
        activity: "Toilettage",
        amount: 89,
        dates: "29 sept.",
        details: ["Toilettage complet et soin hydratant", "Facture impayée"],
        id: "r-0261",
        pet: "Lune",
        reference: "R-2026-0261",
        status: "done",
        title: "Toilettage & soin",
      },
      {
        activity: "Pension",
        amount: 96,
        dates: "Du 14 au 16 août",
        details: ["2 nuits"],
        id: "r-0198",
        pet: "Gribouille",
        reference: "R-2026-0198",
        status: "done",
        title: "Séjour · Chatterie 2",
      },
    ],
    client: "Thomas Petit",
    entries: [
      {
        day: "Lun. 19 oct.",
        id: "t1",
        kind: "message",
        side: "incoming",
        text: "Est-ce qu'il reste une place jeudi après-midi pour Lune ?",
        time: "11:20",
      },
      {
        bookingId: "r-0339",
        day: "Lun. 19 oct.",
        event: "confirmed",
        id: "t1b",
        kind: "booking",
        time: "11:28",
      },
      {
        day: "Lun. 19 oct.",
        id: "t2",
        kind: "message",
        side: "outgoing",
        status: "sent",
        text: "C'est noté pour jeudi 14h, à bientôt !",
        time: "11:29",
      },
    ],
    id: "thomas",
    initials: "TP",
    pets: ["Lune · Caniche", "Gribouille · Maine coon"],
    unread: 0,
  },
]
