import type { Activity } from "@/components/activity-mark"

export type Person = { name: string; initials: string }

export type PriceLine = { label: string; amount: number }

type Base = {
  id: string
  title: string
  preview: string
  time: string
  group: "Aujourd'hui" | "Hier" | "Plus tôt"
  unread: boolean
  actionable: boolean
  activity?: Activity
  client?: Person
  pet?: string
}

export type InboxItem = Base &
  (
    | {
        kind: "booking"
        data: {
          newClient: boolean
          petInfo: string[]
          arrival: { day: string; time: string }
          departure: { day: string; time: string }
          nights: number
          box: string
          occupancy: { occupied: number; total: number }
          lines: PriceLine[]
          note?: string
        }
      }
    | {
        kind: "message"
        data: {
          context: string
          messages: { text: string; time: string }[]
        }
      }
    | {
        kind: "appointment"
        data: {
          weekday: string
          day: string
          month: string
          groomer: string
          services: { label: string; minutes: number; price: number }[]
          slots: { time: string; status: "busy" | "free" | "requested" }[]
        }
      }
    | {
        kind: "health"
        data: {
          arrival: string
          vaccines: {
            name: string
            date: string
            status: "ok" | "soon" | "expired"
          }[]
        }
      }
    | {
        kind: "payment"
        data: {
          invoice: string
          status: "overdue" | "paid"
          due: string
          daysLate?: number
          method?: string
          lines: PriceLine[]
          history: { label: string; date: string }[]
        }
      }
    | {
        kind: "capacity"
        data: {
          days: { label: string; occupied: number; total: number }[]
          waiting: number
        }
      }
    | {
        kind: "review"
        data: { rating: number; text: string; source: string }
      }
  )

export type InboxKind = InboxItem["kind"]

export const inboxItems: InboxItem[] = [
  {
    actionable: true,
    activity: "Pension",
    client: { initials: "LM", name: "Léa Moreau" },
    data: {
      arrival: { day: "Ven. 30 oct.", time: "Entre 9h et 12h" },
      box: "Box 7",
      departure: { day: "Lun. 2 nov.", time: "Avant 18h" },
      lines: [
        { amount: 84, label: "3 nuits × 28 €" },
        { amount: 15, label: "Promenade individuelle" },
        { amount: 12, label: "Photo quotidienne" },
      ],
      newClient: true,
      nights: 3,
      note: "Nala a peur de l'orage, merci de laisser sa couverture avec elle.",
      occupancy: { occupied: 21, total: 24 },
      petInfo: ["4 ans", "18 kg", "Stérilisée", "Vaccins à jour"],
    },
    group: "Aujourd'hui",
    id: "booking-lea",
    kind: "booking",
    pet: "Nala · Border collie",
    preview: "3 nuits du 30 oct. au 2 nov. · Box 7 proposé",
    time: "10:24",
    title: "Nouvelle demande de séjour",
    unread: true,
  },
  {
    actionable: false,
    activity: "Pension",
    client: { initials: "CM", name: "Camille Martin" },
    data: {
      context: "Séjour en cours · Box 4",
      messages: [
        {
          text: "Super, merci beaucoup ! Serait-il possible d'ajouter une séance de toilettage avant son départ samedi ?",
          time: "10:02",
        },
        { text: "Plutôt le matin si possible 🙏", time: "10:03" },
      ],
    },
    group: "Aujourd'hui",
    id: "message-camille",
    kind: "message",
    pet: "Max · Golden retriever",
    preview: "Serait-il possible d'ajouter une séance de toilettage…",
    time: "10:03",
    title: "2 nouveaux messages",
    unread: true,
  },
  {
    actionable: true,
    activity: "Toilettage",
    client: { initials: "HL", name: "Hugo Lambert" },
    data: {
      day: "24",
      groomer: "Marc",
      month: "octobre",
      services: [
        { label: "Bain & séchage", minutes: 45, price: 35 },
        { label: "Coupe aux ciseaux", minutes: 30, price: 25 },
        { label: "Coupe des griffes", minutes: 10, price: 8 },
      ],
      slots: [
        { status: "busy", time: "09:00" },
        { status: "requested", time: "10:00" },
        { status: "free", time: "11:30" },
        { status: "busy", time: "14:00" },
        { status: "free", time: "15:30" },
        { status: "busy", time: "17:00" },
      ],
      weekday: "Samedi",
    },
    group: "Aujourd'hui",
    id: "appointment-hugo",
    kind: "appointment",
    pet: "Biscuit · Shih tzu",
    preview: "Samedi 24 oct. à 10h · Bain, coupe et griffes",
    time: "09:41",
    title: "Demande de rendez-vous",
    unread: true,
  },
  {
    actionable: true,
    activity: "Pension",
    client: { initials: "PG", name: "Paul Girard" },
    data: {
      arrival: "Mar. 27 oct.",
      vaccines: [
        { date: "Valide jusqu'en mars 2027", name: "Rage", status: "ok" },
        { date: "Expiré le 12 oct. 2026", name: "CHPPiL", status: "expired" },
        {
          date: "Expire le 2 nov. 2026",
          name: "Toux du chenil",
          status: "soon",
        },
        { date: "Fait le 4 sept. 2026", name: "Vermifuge", status: "ok" },
      ],
    },
    group: "Aujourd'hui",
    id: "health-paul",
    kind: "health",
    pet: "Moka · Labrador",
    preview: "Vaccin CHPPiL expiré avant l'arrivée du 27 oct.",
    time: "08:15",
    title: "Carnet de santé à mettre à jour",
    unread: true,
  },
  {
    actionable: true,
    client: { initials: "TP", name: "Thomas Petit" },
    data: {
      daysLate: 15,
      due: "6 oct. 2026",
      history: [
        { date: "29 sept.", label: "Facture envoyée" },
        { date: "7 oct.", label: "Relance automatique n°1" },
        { date: "14 oct.", label: "Relance automatique n°2" },
      ],
      invoice: "F-2026-0142",
      lines: [
        { amount: 68, label: "Toilettage complet · Lune" },
        { amount: 21, label: "Soin hydratant" },
      ],
      status: "overdue",
    },
    group: "Hier",
    id: "payment-thomas",
    kind: "payment",
    pet: "Lune · Caniche",
    preview: "Facture F-2026-0142 · 89 € · 15 jours de retard",
    time: "Hier",
    title: "Facture impayée",
    unread: true,
  },
  {
    actionable: true,
    activity: "Pension",
    data: {
      days: [
        { label: "Ven. 30", occupied: 22, total: 24 },
        { label: "Sam. 31", occupied: 24, total: 24 },
        { label: "Dim. 1", occupied: 24, total: 24 },
        { label: "Lun. 2", occupied: 19, total: 24 },
      ],
      waiting: 3,
    },
    group: "Hier",
    id: "capacity-weekend",
    kind: "capacity",
    preview: "Samedi et dimanche complets · 3 demandes en attente",
    time: "Hier",
    title: "Pension complète ce week-end",
    unread: true,
  },
  {
    actionable: false,
    activity: "Toilettage",
    client: { initials: "ED", name: "Emma Dubois" },
    data: {
      rating: 5,
      source: "Avis Google",
      text: "Rocky est revenu tout beau et sentait si bon ! L'équipe est adorable et très douce avec lui. Je recommande les yeux fermés.",
    },
    group: "Hier",
    id: "review-emma",
    kind: "review",
    pet: "Rocky · Bouledogue français",
    preview: "« Rocky est revenu tout beau et sentait si bon ! »",
    time: "Hier",
    title: "Nouvel avis 5 étoiles",
    unread: false,
  },
  {
    actionable: false,
    activity: "Pension",
    client: { initials: "JB", name: "Julien Bernard" },
    data: {
      due: "19 oct. 2026",
      history: [
        { date: "15 oct.", label: "Facture envoyée" },
        { date: "19 oct.", label: "Paiement reçu" },
      ],
      invoice: "F-2026-0151",
      lines: [
        { amount: 96, label: "2 nuits en chatterie × 48 €" },
        { amount: 30, label: "Alimentation sans céréales" },
      ],
      method: "Carte bancaire •••• 4242",
      status: "paid",
    },
    group: "Plus tôt",
    id: "payment-julien",
    kind: "payment",
    pet: "Pistache · Chat européen",
    preview: "Facture F-2026-0151 réglée par carte · 126 €",
    time: "Lun.",
    title: "Paiement reçu",
    unread: false,
  },
]

export const inboxUnreadCount = inboxItems.filter((item) => item.unread).length
