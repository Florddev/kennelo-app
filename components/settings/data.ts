import {
  Agreement01Icon,
  Award01Icon,
  BedDoubleIcon,
  Calendar03Icon,
  CalendarCheckIn01Icon,
  Camera01Icon,
  CheckListIcon,
  Clock01Icon,
  Coins01Icon,
  DocumentValidationIcon,
  EuroCircleIcon,
  FileEditIcon,
  HourglassIcon,
  LaptopIcon,
  Location01Icon,
  MedicineBottle01Icon,
  Notification03Icon,
  PackageIcon,
  Scissor01Icon,
  Settings01Icon,
  SmartPhone01Icon,
  Target02Icon,
  UserGroupIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import type { Activity } from "@/components/activity-mark"

export type Role = "Propriétaire" | "Administrateur" | "Membre"

export type Member = {
  name: string
  initials: string
  email: string
  job: string
  role: Role
  activities: Activity[]
  lastSeen: string
}

export const members: Member[] = [
  {
    activities: ["Pension", "Toilettage", "Éducation"],
    email: "alex@lescoteaux.fr",
    initials: "AM",
    job: "Direction",
    lastSeen: "En ligne",
    name: "Alex Martin",
    role: "Propriétaire",
  },
  {
    activities: ["Pension"],
    email: "claire@lescoteaux.fr",
    initials: "CD",
    job: "Responsable pension",
    lastSeen: "En ligne",
    name: "Claire Dumas",
    role: "Administrateur",
  },
  {
    activities: ["Toilettage"],
    email: "marc@lescoteaux.fr",
    initials: "ML",
    job: "Toiletteur",
    lastSeen: "Il y a 20 min",
    name: "Marc Lefèvre",
    role: "Membre",
  },
  {
    activities: ["Éducation"],
    email: "ines@lescoteaux.fr",
    initials: "IH",
    job: "Éducatrice canine",
    lastSeen: "Hier",
    name: "Inès Haddad",
    role: "Membre",
  },
  {
    activities: ["Pension"],
    email: "lucas@lescoteaux.fr",
    initials: "LB",
    job: "Agent animalier · week-ends",
    lastSeen: "Sam. 17 oct.",
    name: "Lucas Bernard",
    role: "Membre",
  },
]

export const invitations = [
  {
    activities: ["Pension", "Toilettage"] as Activity[],
    email: "emma.roux@gmail.com",
    role: "Membre" as Role,
    sent: "Il y a 2 jours",
  },
]

export type SettingsLink = {
  slug: string
  title: string
  description: string
  icon: IconSvgElement
  value?: string
  locked?: string
}

export type ActivitySlug = "pension" | "grooming" | "training"

export type ActivitySettings = {
  slug: ActivitySlug
  name: Activity
  appHref: string
  hours: { days: number[]; from: string; to: string; label: string }
  groups: { title?: string; links: SettingsLink[] }[]
}

const memberCount = (activity: Activity) =>
  members.filter((m) => m.activities.includes(activity)).length

const common = (
  activity: Activity,
  hoursLabel: string
): { links: SettingsLink[] } => ({
  links: [
    {
      description: "Nom, identifiant, couleur et description",
      icon: Settings01Icon,
      slug: "general",
      title: "Général",
    },
    {
      description: "Personnes ayant accès à l'activité et leur rôle",
      icon: UserGroupIcon,
      slug: "members",
      title: "Membres",
      value: `${memberCount(activity)} membres`,
    },
    {
      description: "Jours d'ouverture, horaires et fermetures exceptionnelles",
      icon: Clock01Icon,
      slug: "hours",
      title: "Horaires & fermetures",
      value: hoursLabel,
    },
    {
      description: "Alertes envoyées à l'équipe de l'activité",
      icon: Notification03Icon,
      slug: "notifications",
      title: "Notifications",
      value: "Activées",
    },
  ],
})

export const activitySettings: ActivitySettings[] = [
  {
    appHref: "/pension/today",
    groups: [
      common("Pension", "Tous les jours"),
      {
        links: [
          {
            description: "Types de place, emplacements et gabarits",
            icon: BedDoubleIcon,
            slug: "kennels",
            title: "Box & chatterie",
            value: "24 emplacements",
          },
          {
            description: "Prix par période, options du séjour et remises",
            icon: EuroCircleIcon,
            slug: "rates",
            title: "Tarifs",
            value: "Dès 25 € / nuit",
          },
          {
            description: "Contrôles à l'arrivée et règles de départ",
            icon: CalendarCheckIn01Icon,
            slug: "check-in",
            title: "Arrivées & départs",
            value: "Départ avant 11h",
          },
        ],
        title: "Hébergement",
      },
      {
        links: [
          {
            description: "Acompte, validation et annulation",
            icon: Agreement01Icon,
            slug: "booking",
            title: "Conditions de réservation",
            value: "Acompte 30 %",
          },
          {
            description: "Vaccins, identification et assurance",
            icon: DocumentValidationIcon,
            slug: "documents",
            title: "Documents exigés",
            value: "3 documents",
          },
        ],
        title: "Réservations",
      },
      {
        links: [
          {
            description: "Repas, sorties, traitements et ménage",
            icon: MedicineBottle01Icon,
            slug: "care",
            title: "Soins & routines",
            value: "4 routines",
          },
          {
            description: "Photos, comptes-rendus et fréquence d'envoi",
            icon: Camera01Icon,
            slug: "news",
            title: "Nouvelles aux propriétaires",
            value: "1 par jour",
          },
        ],
        title: "Suivi des pensionnaires",
      },
    ],
    hours: {
      days: [0, 1, 2, 3, 4, 5, 6],
      from: "08:00",
      label: "Tous les jours",
      to: "19:00",
    },
    name: "Pension",
    slug: "pension",
  },
  {
    appHref: "/grooming/today",
    groups: [
      common("Toilettage", "Mar. – sam."),
      {
        links: [
          {
            description: "Prestations et forfaits vendus au salon",
            icon: Scissor01Icon,
            slug: "services",
            title: "Prestations & tarifs",
            value: "5 prestations",
          },
          {
            description: "Durée des créneaux, battements et postes de travail",
            icon: Calendar03Icon,
            slug: "agenda",
            title: "Agenda",
            value: "Créneaux de 15 min",
          },
          {
            description: "Suivi de l'animal pendant son passage au salon",
            icon: CheckListIcon,
            slug: "steps",
            title: "Étapes du toilettage",
            value: "5 étapes",
          },
        ],
        title: "Salon",
      },
      {
        links: [
          {
            description: "Rappels SMS et rendez-vous manqués",
            icon: SmartPhone01Icon,
            slug: "reminders",
            title: "Rappels & absences",
            value: "24 h avant",
          },
          {
            description: "Proposer automatiquement les créneaux libérés",
            icon: HourglassIcon,
            slug: "waitlist",
            title: "Liste d'attente",
            value: "Activée",
          },
        ],
        title: "Clients",
      },
      {
        links: [
          {
            description: "Seuils d'alerte et ventes au comptoir",
            icon: PackageIcon,
            slug: "products",
            title: "Produits & stock",
            value: "5 produits",
          },
          {
            description: "Récompenser les clients réguliers",
            icon: Award01Icon,
            locked: "Disponible avec Pro",
            slug: "loyalty",
            title: "Programme de fidélité",
          },
        ],
        title: "Boutique",
      },
    ],
    hours: {
      days: [1, 2, 3, 4, 5],
      from: "09:00",
      label: "Mar. – sam.",
      to: "18:00",
    },
    name: "Toilettage",
    slug: "grooming",
  },
  {
    appHref: "/training/today",
    groups: [
      common("Éducation", "Mar. – dim."),
      {
        links: [
          {
            description: "Séances, bilans et cours vendus",
            icon: Coins01Icon,
            slug: "packages",
            title: "Prestations & tarifs",
            value: "4 prestations",
          },
          {
            description: "Groupes, capacités et créneaux récurrents",
            icon: UserMultipleIcon,
            slug: "groups",
            title: "Cours collectifs",
            value: "4 cours",
          },
          {
            description: "Terrains, séances à domicile et frais kilométriques",
            icon: Location01Icon,
            slug: "places",
            title: "Lieux & déplacements",
            value: "3 lieux",
          },
        ],
        title: "Offre",
      },
      {
        links: [
          {
            description: "Grille utilisée dans les programmes individuels",
            icon: Target02Icon,
            slug: "skills",
            title: "Compétences évaluées",
            value: "8 compétences",
          },
          {
            description: "Modèle et envoi automatique après chaque séance",
            icon: FileEditIcon,
            slug: "reports",
            title: "Comptes-rendus",
            value: "Envoi auto",
          },
          {
            description: "Séances de coaching à distance",
            icon: LaptopIcon,
            locked: "Disponible avec Pro",
            slug: "video",
            title: "Visio-coaching",
          },
        ],
        title: "Suivi pédagogique",
      },
    ],
    hours: {
      days: [1, 2, 3, 4, 5, 6],
      from: "10:00",
      label: "Mar. – dim.",
      to: "19:00",
    },
    name: "Éducation",
    slug: "training",
  },
]

export const findActivity = (slug: string) =>
  activitySettings.find((a) => a.slug === slug)

export const findLink = (activity: ActivitySettings, slug: string) =>
  activity.groups
    .flatMap((g) => g.links)
    .find((l) => l.slug === slug && !l.locked)
