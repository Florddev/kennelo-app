import type { Activity } from "@/components/activity-mark"
import type { ChatDeliveryIndicatorProps } from "@/components/chat/chat-delivery-indicator"

export type Reaction = { emoji: string; count: number; selected: boolean }

export type Message = {
  id: string
  side: "incoming" | "outgoing"
  text: string
  time: string
  status?: ChatDeliveryIndicatorProps["status"]
  reactions?: Reaction[]
}

export type Conversation = {
  id: string
  client: string
  initials: string
  pet: string
  activity: Activity
  context: { title: string; description: string }
  unread: number
  unreadFromId?: string
  typing?: boolean
  messages: Message[]
}

export const reactionOptions = [
  { emoji: "❤️", label: "J'adore" },
  { emoji: "👍", label: "D'accord" },
  { emoji: "😂", label: "Drôle" },
  { emoji: "🐶", label: "Toutou" },
  { emoji: "🙏", label: "Merci" },
] as const

// Contextual action + quick replies per activity. `{pet}` is replaced by the pet's name.
export const activityMessaging: Record<
  Activity,
  { contextAction: string; quickReplies: { label: string; text: string }[] }
> = {
  Pension: {
    contextAction: "Voir le séjour",
    quickReplies: [
      {
        label: "📷 Photo du jour",
        text: "📷 Voici la photo du jour de {pet} !",
      },
      {
        label: "Bilan de la journée",
        text: "Excellente journée pour {pet} : repas terminés, jeux et deux belles promenades 🐾",
      },
      {
        label: "Rappel de départ",
        text: "Petit rappel : le départ de {pet} se fait entre 9h et 12h le jour de fin du séjour.",
      },
    ],
  },
  Toilettage: {
    contextAction: "Voir le rendez-vous",
    quickReplies: [
      {
        label: "✨ Prêt à récupérer",
        text: "{pet} est tout beau et prêt à être récupéré ✨",
      },
      {
        label: "Confirmer le RDV",
        text: "Je vous confirme le rendez-vous de {pet}. À bientôt !",
      },
      {
        label: "Retard",
        text: "Nous avons un peu de retard, comptez 20 minutes de plus pour {pet}.",
      },
    ],
  },
  Éducation: {
    contextAction: "Voir le programme",
    quickReplies: [
      {
        label: "Compte-rendu",
        text: "Compte-rendu de la séance : {pet} a bien progressé, on continue sur cette lancée !",
      },
      {
        label: "Exercices de la semaine",
        text: "Pour cette semaine : 5 minutes de rappel par jour avec {pet}, en variant les lieux.",
      },
      {
        label: "Prochaine séance",
        text: "La prochaine séance de {pet} est confirmée, pensez à apporter des friandises.",
      },
    ],
  },
}

export const conversations: Conversation[] = [
  {
    activity: "Pension",
    client: "Camille Martin",
    context: {
      description: "Du 18 au 25 oct. · Traitement quotidien à 8h",
      title: "Séjour en cours · Box 4",
    },
    id: "camille",
    initials: "CM",
    messages: [
      {
        id: "c1",
        side: "incoming",
        text: "Bonjour ! Comment s'est passée la première nuit de Max ? 🐶",
        time: "09:12",
      },
      {
        id: "c2",
        reactions: [{ count: 1, emoji: "❤️", selected: false }],
        side: "outgoing",
        status: "read",
        text: "Bonjour Camille ! Très bien, il a mangé toute sa gamelle et a beaucoup joué avec Nala ce matin.",
        time: "09:20",
      },
      {
        id: "c3",
        side: "outgoing",
        status: "read",
        text: "Son traitement lui a été donné à 8h comme convenu.",
        time: "09:21",
      },
      {
        id: "c4",
        side: "incoming",
        text: "Super, merci beaucoup ! Serait-il possible d'ajouter une séance de toilettage avant son départ samedi ?",
        time: "10:02",
      },
      {
        id: "c5",
        side: "incoming",
        text: "Plutôt le matin si possible 🙏",
        time: "10:03",
      },
    ],
    pet: "Max · Golden retriever",
    unread: 2,
    unreadFromId: "c4",
  },
  {
    activity: "Toilettage",
    client: "Emma Dubois",
    context: {
      description: "Bain et brossage · Récupération prévue à 17h",
      title: "Rendez-vous aujourd'hui · 14h",
    },
    id: "emma",
    initials: "ED",
    messages: [
      {
        id: "e1",
        side: "outgoing",
        status: "read",
        text: "Rocky est bien arrivé, on commence le bain !",
        time: "14:05",
      },
      {
        id: "e2",
        side: "incoming",
        text: "Super ! Je peux passer le récupérer vers 17h ?",
        time: "15:40",
      },
    ],
    pet: "Rocky · Bouledogue français",
    unread: 1,
    unreadFromId: "e2",
  },
  {
    activity: "Pension",
    client: "Julien Bernard",
    context: {
      description: "Du 20 au 22 oct. · Alimentation sans céréales",
      title: "Séjour en cours · Box 11",
    },
    id: "julien",
    initials: "JB",
    messages: [
      {
        id: "j1",
        side: "outgoing",
        status: "delivered",
        text: "Pistache est bien installée, elle explore sa chambre tranquillement.",
        time: "08:45",
      },
      {
        id: "j2",
        side: "incoming",
        text: "Merci ! Elle peut être un peu timide au début.",
        time: "08:51",
      },
    ],
    pet: "Pistache · Chat européen",
    typing: true,
    unread: 0,
  },
  {
    activity: "Éducation",
    client: "Sophie Leroy",
    context: {
      description: "Objectifs : rappel et marche en laisse",
      title: "Séance 4 sur 10 · Jeudi 18h",
    },
    id: "sophie",
    initials: "SL",
    messages: [
      {
        id: "s1",
        side: "incoming",
        text: "Merci pour la séance d'hier, Oslo revient beaucoup mieux au rappel !",
        time: "Hier",
      },
      {
        id: "s2",
        side: "outgoing",
        status: "read",
        text: "Avec plaisir ! Continuez les exercices 5 minutes par jour, on fera le point jeudi.",
        time: "Hier",
      },
    ],
    pet: "Oslo · Berger australien",
    unread: 0,
  },
  {
    activity: "Toilettage",
    client: "Thomas Petit",
    context: {
      description: "Bain, coupe aux ciseaux et griffes · 1h30",
      title: "Rendez-vous jeudi · 14h",
    },
    id: "thomas",
    initials: "TP",
    messages: [
      {
        id: "t1",
        side: "incoming",
        text: "Est-ce qu'il reste une place jeudi après-midi pour Lune ?",
        time: "Lun.",
      },
      {
        id: "t2",
        side: "outgoing",
        status: "sent",
        text: "C'est noté pour jeudi 14h, à bientôt !",
        time: "Lun.",
      },
    ],
    pet: "Lune · Caniche",
    unread: 0,
  },
]
