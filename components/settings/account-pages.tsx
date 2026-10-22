"use client"

import {
  AppleIcon,
  GoogleIcon,
  LaptopIcon,
  MicrosoftIcon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"
import { useTheme } from "next-themes"
import {
  IconTile,
  options,
  type SettingsGroup,
  SettingsGroups,
  SettingsPage,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-ui"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const themes = [
  { label: "Système", value: "system" },
  { label: "Clair", value: "light" },
  { label: "Sombre", value: "dark" },
]

function ThemeSelect() {
  const { theme, setTheme } = useTheme()
  return (
    <Select
      items={themes}
      onValueChange={(value) => setTheme(String(value))}
      value={theme ?? "system"}
    >
      <SelectTrigger aria-label="Thème" className="w-fit min-w-0" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectPopup>
        {themes.map(({ label, value }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}

export function PreferencesPage() {
  const groups: SettingsGroup[] = [
    {
      settings: [
        {
          defaultValue: "Ma journée",
          description: "Page affichée à l'ouverture de Kennelo",
          items: options(
            "Ma journée",
            "Boîte de réception",
            "Pension · Aujourd'hui",
            "Toilettage · Aujourd'hui",
            "Éducation · Aujourd'hui"
          ),
          title: "Page d'accueil",
          type: "select",
        },
        {
          defaultValue: "Prénom",
          description: "Façon dont les clients apparaissent dans les listes",
          items: options("Prénom", "Prénom et nom", "Nom de l'animal"),
          title: "Affichage des clients",
          type: "select",
        },
        {
          defaultValue: "Lundi",
          description: "Utilisé par les plannings et les calendriers",
          items: options("Lundi", "Dimanche"),
          title: "Premier jour de la semaine",
          type: "select",
        },
        {
          defaultValue: "14h30",
          description: "Format des heures dans l'application",
          items: options("14h30", "14:30", "2:30 PM"),
          title: "Format de l'heure",
          type: "select",
        },
        {
          defaultChecked: true,
          description: "Les textes comme :) deviennent 🙂",
          title: "Convertir les émoticônes en emojis",
          type: "switch",
        },
        {
          defaultValue: "Entrée",
          description: "Touche utilisée pour envoyer un message",
          items: options("Entrée", "Ctrl + Entrée"),
          title: "Envoyer les messages avec…",
          type: "select",
        },
      ],
      title: "Général",
    },
    {
      settings: [
        {
          control: <ThemeSelect />,
          description: "Clair, sombre ou selon votre système",
          title: "Thème",
          type: "custom",
        },
        {
          description: "Choisir et ordonner les éléments de la barre latérale",
          label: "Personnaliser",
          title: "Barre latérale",
          type: "button",
          variant: "ghost",
        },
        {
          defaultValue: "Normale",
          description: "Taille du texte dans toute l'application",
          items: options("Petite", "Normale", "Grande"),
          title: "Taille du texte",
          type: "select",
        },
        {
          description: "Afficher une main au survol des éléments cliquables",
          title: "Curseur pointeur",
          type: "switch",
        },
        {
          defaultChecked: true,
          description: "Afficher les photos des animaux dans les plannings",
          title: "Photos des animaux",
          type: "switch",
        },
      ],
      title: "Interface et thème",
    },
  ]
  return (
    <SettingsPage title="Préférences">
      <SettingsGroups groups={groups} />
    </SettingsPage>
  )
}

export function ProfilePage() {
  return (
    <SettingsPage title="Profil">
      <SettingsSection>
        <SettingsRow
          description="JPG ou PNG, 1 Mo maximum"
          media={
            <Avatar className="size-10">
              <AvatarFallback className="bg-pension text-pension-foreground">
                AM
              </AvatarFallback>
            </Avatar>
          }
          title="Photo de profil"
        >
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">
              Retirer
            </Button>
            <Button size="sm" variant="outline">
              Changer
            </Button>
          </div>
        </SettingsRow>
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultValue: "Alex Martin",
                title: "Nom complet",
                type: "input",
              },
              {
                defaultValue: "Alex",
                description: "Affiché aux clients dans les messages",
                title: "Nom d'affichage",
                type: "input",
              },
              {
                control: (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      alex@lescoteaux.fr
                    </span>
                    <Button size="sm" variant="outline">
                      Modifier
                    </Button>
                  </div>
                ),
                title: "Adresse e-mail",
                type: "custom",
              },
              {
                defaultValue: "06 12 34 56 78",
                title: "Téléphone",
                type: "input",
              },
              { defaultValue: "Direction", title: "Poste", type: "input" },
            ],
            title: "Informations",
          },
          {
            settings: [
              {
                defaultValue:
                  "Alex · Les Coteaux\nPension, toilettage & éducation canine",
                description: "Ajoutée à la fin des e-mails envoyés aux clients",
                title: "Signature",
                type: "textarea",
              },
            ],
            title: "Messages",
          },
          {
            settings: [
              {
                description:
                  "Vous êtes propriétaire : transférez la propriété avant de partir",
                label: "Quitter",
                title: "Quitter l'organisation",
                type: "button",
                variant: "destructive-outline",
              },
              {
                description:
                  "Supprime définitivement votre compte et vos données",
                label: "Supprimer",
                title: "Supprimer le compte",
                type: "button",
                variant: "destructive-outline",
              },
            ],
            title: "Zone de danger",
          },
        ]}
      />
    </SettingsPage>
  )
}

const events = [
  { email: true, push: true, title: "Nouvelle demande de réservation" },
  { email: false, push: true, title: "Message d'un client" },
  { email: false, push: true, title: "Arrivée ou départ d'un pensionnaire" },
  { email: true, push: true, title: "Alerte de soins (traitement non validé)" },
  { email: true, push: true, title: "Annulation ou absence" },
  { email: true, push: false, title: "Paiement reçu" },
  { email: true, push: true, title: "Facture en retard" },
  { email: false, push: true, title: "Mention par un collègue" },
]

export function NotificationsPage() {
  return (
    <SettingsPage
      description="Choisissez comment Kennelo vous prévient"
      title="Notifications"
    >
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultChecked: true,
                description: "Notifications du navigateur sur ordinateur",
                title: "Bureau",
                type: "switch",
              },
              {
                defaultChecked: true,
                description: "Via l'application Kennelo sur iOS et Android",
                title: "Mobile",
                type: "switch",
              },
              {
                defaultChecked: true,
                description: "Envoyées à alex@lescoteaux.fr",
                title: "E-mail",
                type: "switch",
              },
              {
                description: "Uniquement pour les alertes urgentes",
                title: "SMS",
                type: "switch",
              },
            ],
            title: "Canaux",
          },
        ]}
      />
      <SettingsSection title="Événements">
        <div className="flex items-center gap-4 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
          <span className="flex-1">Événement</span>
          <span className="w-16 text-center">Appli</span>
          <span className="w-16 text-center">E-mail</span>
        </div>
        {events.map((event) => (
          <div className="flex items-center gap-4 px-4 py-3" key={event.title}>
            <span className="flex-1 text-sm">{event.title}</span>
            <span className="flex w-16 justify-center">
              <Checkbox
                aria-label={`${event.title} dans l'application`}
                defaultChecked={event.push}
              />
            </span>
            <span className="flex w-16 justify-center">
              <Checkbox
                aria-label={`${event.title} par e-mail`}
                defaultChecked={event.email}
              />
            </span>
          </div>
        ))}
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultValue: "7h00",
                description: "Arrivées, rendez-vous et séances de la journée",
                items: options("Désactivé", "6h30", "7h00", "8h00"),
                title: "Récapitulatif du matin",
                type: "select",
              },
              {
                defaultValue: "Lundi matin",
                description:
                  "Chiffre d'affaires, occupation et factures en attente",
                items: options("Désactivé", "Lundi matin", "Vendredi soir"),
                title: "Rapport hebdomadaire",
                type: "select",
              },
              {
                defaultValue: "20h – 7h",
                description: "Seules les alertes urgentes sont envoyées",
                items: options("Désactivé", "19h – 7h", "20h – 7h", "22h – 7h"),
                title: "Ne pas déranger",
                type: "select",
              },
            ],
            title: "Résumés",
          },
        ]}
      />
    </SettingsPage>
  )
}

const sessions = [
  {
    current: true,
    device: "Chrome · Windows",
    icon: LaptopIcon,
    seen: "Libourne · Cette session",
  },
  {
    device: "Application iOS · iPhone",
    icon: SmartPhone01Icon,
    seen: "Libourne · Il y a 2 h",
  },
  {
    device: "Safari · iPad de l'accueil",
    icon: LaptopIcon,
    seen: "Libourne · Hier",
  },
]

export function AccountSecurityPage() {
  return (
    <SettingsPage title="Sécurité & accès">
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                description: "Modifié il y a 3 mois",
                label: "Modifier",
                title: "Mot de passe",
                type: "button",
              },
              {
                control: (
                  <div className="flex items-center gap-3">
                    <Badge variant="success">Activée</Badge>
                    <Button size="sm" variant="outline">
                      Gérer
                    </Button>
                  </div>
                ),
                description: "Code à usage unique via une application",
                title: "Double authentification",
                type: "custom",
              },
              {
                description:
                  "Connexion avec Face ID, Touch ID ou Windows Hello",
                label: "Ajouter",
                title: "Clés d'accès",
                type: "button",
              },
            ],
            title: "Connexion",
          },
        ]}
      />
      <SettingsSection
        action={
          <Button size="sm" variant="ghost">
            Déconnecter les autres
          </Button>
        }
        description="Appareils connectés à votre compte"
        title="Sessions actives"
      >
        {sessions.map((session) => (
          <SettingsRow
            description={session.seen}
            key={session.device}
            media={<IconTile icon={session.icon} />}
            title={session.device}
          >
            {session.current ? (
              <Badge variant="success">Actuelle</Badge>
            ) : (
              <Button size="sm" variant="outline">
                Révoquer
              </Button>
            )}
          </SettingsRow>
        ))}
      </SettingsSection>
    </SettingsPage>
  )
}

const providers = [
  { account: "alex.martin@gmail.com", icon: GoogleIcon, name: "Google" },
  { icon: AppleIcon, name: "Apple" },
  { icon: MicrosoftIcon, name: "Microsoft" },
]

export function ConnectedAccountsPage() {
  return (
    <SettingsPage title="Comptes connectés">
      <SettingsSection
        description="Services utilisables pour vous connecter"
        title="Connexion"
      >
        {providers.map((provider) => (
          <SettingsRow
            description={provider.account ?? "Non connecté"}
            key={provider.name}
            media={<IconTile icon={provider.icon} />}
            title={provider.name}
          >
            <Button size="sm" variant="outline">
              {provider.account ? "Déconnecter" : "Connecter"}
            </Button>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultChecked: true,
                description:
                  "Vos arrivées, rendez-vous et séances apparaissent dans Google Agenda",
                title: "Synchroniser mon agenda",
                type: "switch",
              },
              {
                defaultValue: "Les Coteaux · Travail",
                items: options("Les Coteaux · Travail", "Personnel"),
                title: "Agenda de destination",
                type: "select",
              },
              {
                description:
                  "Vos événements personnels bloquent les créneaux dans Kennelo",
                title: "Marquer comme occupé",
                type: "switch",
              },
            ],
            title: "Agenda",
          },
        ]}
      />
    </SettingsPage>
  )
}
