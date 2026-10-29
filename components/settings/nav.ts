import {
  ArrowDataTransferHorizontalIcon,
  Building03Icon,
  Calendar03Icon,
  CodeIcon,
  CreditCardIcon,
  Globe02Icon,
  LinkIcon,
  Message01Icon,
  Notification03Icon,
  PaintBoardIcon,
  PlugIcon,
  Shield01Icon,
  ShieldIcon,
  SlidersHorizontalIcon,
  Store01Icon,
  UserGroupIcon,
  UserIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

export type SettingsNavItem = {
  title: string
  description: string
  icon: IconSvgElement
  href: string
}

export const settingsNav: { label: string; items: SettingsNavItem[] }[] = [
  {
    items: [
      {
        description: "Nom, photo, coordonnées et signature",
        href: "/settings/profile",
        icon: UserIcon,
        title: "Profil",
      },
      {
        description: "Page d'accueil, thème, formats et affichage",
        href: "/settings/preferences",
        icon: SlidersHorizontalIcon,
        title: "Préférences",
      },
      {
        description: "Ce qui vous est envoyé, et comment",
        href: "/settings/notifications",
        icon: Notification03Icon,
        title: "Notifications",
      },
      {
        description: "Mot de passe, double authentification, appareils",
        href: "/settings/account-security",
        icon: ShieldIcon,
        title: "Sécurité & accès",
      },
      {
        description: "Google, Apple et autres connexions",
        href: "/settings/connected-accounts",
        icon: LinkIcon,
        title: "Comptes connectés",
      },
    ],
    label: "Votre compte",
  },
  {
    items: [
      {
        description: "Nom, adresse, horaires et informations légales",
        href: "/settings/organization",
        icon: Building03Icon,
        title: "Établissement",
      },
      {
        description: "Votre site, construit avec les blocs Kennelo",
        href: "/editor",
        icon: PaintBoardIcon,
        title: "Site web",
      },
      {
        description: "L'équipe, les rôles et les invitations",
        href: "/settings/members",
        icon: UserGroupIcon,
        title: "Membres",
      },
      {
        description: "Pension, toilettage, éducation et les autres",
        href: "/settings/activities",
        icon: Store01Icon,
        title: "Activités",
      },
      {
        description: "Haute saison, vacances et jours fériés",
        href: "/settings/periods",
        icon: Calendar03Icon,
        title: "Périodes tarifaires",
      },
      {
        description: "Ce que vos clients peuvent réserver eux-mêmes",
        href: "/settings/booking",
        icon: Globe02Icon,
        title: "Réservation en ligne",
      },
      {
        description: "Messages automatiques, rappels et modèles",
        href: "/settings/communication",
        icon: Message01Icon,
        title: "Communication",
      },
      {
        description: "Moyens de paiement, acomptes et factures",
        href: "/settings/payments",
        icon: Wallet01Icon,
        title: "Paiements & factures",
      },
    ],
    label: "Votre établissement",
  },
  {
    items: [
      {
        description: "Agenda, paiement, comptabilité, messagerie",
        href: "/settings/integrations",
        icon: PlugIcon,
        title: "Intégrations",
      },
      {
        description: "Clés et webhooks pour les développeurs",
        href: "/settings/api",
        icon: CodeIcon,
        title: "API",
      },
      {
        description: "Règles de connexion de toute l'équipe",
        href: "/settings/security",
        icon: Shield01Icon,
        title: "Sécurité",
      },
      {
        description: "Votre offre, l'utilisation et les factures Kennelo",
        href: "/settings/billing",
        icon: CreditCardIcon,
        title: "Abonnement",
      },
      {
        description: "Importer vos clients, exporter vos données",
        href: "/settings/import-export",
        icon: ArrowDataTransferHorizontalIcon,
        title: "Import & export",
      },
    ],
    label: "Avancé",
  },
]
