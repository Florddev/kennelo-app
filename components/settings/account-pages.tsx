"use client"

import {
  AppleIcon,
  CheckmarkCircle02Icon,
  GoogleIcon,
  LaptopIcon,
  MicrosoftIcon,
  Notification03Icon,
  Mail01Icon,
  Shield01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTheme } from "next-themes"
import { useState, useSyncExternalStore } from "react"
import {
  ChoiceTiles,
  IconTile,
  notify,
  options,
  type SettingsGroup,
  SettingsGroups,
  SettingsHero,
  SettingsPage,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-ui"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Mini fenêtre qui montre le thème, quel que soit le thème actuel. */
function ThemePreview({ dark, half }: { dark?: boolean; half?: boolean }) {
  const pane = (isDark: boolean) => (
    <div
      className={cn(
        "flex h-full flex-1 flex-col gap-1.5 p-2.5",
        isDark ? "bg-[#121511]" : "bg-white"
      )}
    >
      <span className="h-2 w-8 rounded-full bg-wise-green" />
      <span
        className={cn(
          "h-1.5 w-full rounded-full",
          isDark ? "bg-[#2A2E28]" : "bg-[#E8EBE6]"
        )}
      />
      <span
        className={cn(
          "h-1.5 w-2/3 rounded-full",
          isDark ? "bg-[#2A2E28]" : "bg-[#E8EBE6]"
        )}
      />
    </div>
  )
  return (
    <div className="flex aspect-4/3 overflow-hidden rounded-xl border">
      {half ? (
        <>
          {pane(false)}
          {pane(true)}
        </>
      ) : (
        pane(!!dark)
      )}
    </div>
  )
}

const textSizes = [
  { className: "text-lg", label: "Petite", value: "small" },
  { className: "text-2xl", label: "Normale", value: "normal" },
  { className: "text-4xl", label: "Grande", value: "large" },
]

function Appearance() {
  const { theme, setTheme } = useTheme()
  // Le thème n'est connu qu'au navigateur : on attend pour éviter un décalage.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [size, setSize] = useState("normal")
  return (
    <>
      <SettingsSection
        description="Clair, sombre, ou comme votre appareil"
        title="Thème"
      >
        <ChoiceTiles
          items={[
            { label: "Clair", preview: <ThemePreview />, value: "light" },
            { label: "Sombre", preview: <ThemePreview dark />, value: "dark" },
            { label: "Auto", preview: <ThemePreview half />, value: "system" },
          ]}
          label="Thème"
          onChange={setTheme}
          value={mounted ? (theme ?? "system") : "system"}
        />
      </SettingsSection>
      <SettingsSection
        description="Agrandissez le texte s'il est difficile à lire"
        title="Taille du texte"
      >
        <ChoiceTiles
          items={textSizes.map((t) => ({
            label: t.label,
            preview: (
              <span
                className={cn(
                  "flex aspect-4/3 items-center justify-center rounded-xl bg-muted font-semibold",
                  t.className
                )}
              >
                Aa
              </span>
            ),
            value: t.value,
          }))}
          label="Taille du texte"
          onChange={(value) => {
            setSize(value)
            notify()
          }}
          value={size}
        />
      </SettingsSection>
    </>
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
      ],
      title: "Général",
    },
    {
      settings: [
        {
          defaultChecked: true,
          description: "Afficher les photos des animaux dans les plannings",
          title: "Photos des animaux",
          type: "switch",
        },
        {
          description: "Afficher une main au survol des éléments cliquables",
          title: "Curseur pointeur",
          type: "switch",
        },
        {
          description: "Choisir et ordonner les éléments de la barre latérale",
          label: "Personnaliser",
          title: "Barre latérale",
          type: "button",
        },
      ],
      title: "Affichage",
    },
    {
      settings: [
        {
          defaultValue: "Entrée",
          description: "Touche utilisée pour envoyer un message",
          items: options("Entrée", "Ctrl + Entrée"),
          title: "Envoyer avec",
          type: "select",
        },
        {
          defaultChecked: true,
          description: "Les textes comme :) deviennent 🙂",
          title: "Convertir les émoticônes",
          type: "switch",
        },
      ],
      title: "Messages",
    },
  ]
  return (
    <SettingsPage
      description="Comment Kennelo s'affiche et se comporte pour vous"
      title="Préférences"
    >
      <Appearance />
      <SettingsGroups groups={groups} />
    </SettingsPage>
  )
}

export function ProfilePage() {
  return (
    <SettingsPage title="Profil">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-muted p-8 text-center">
        <Avatar className="size-24">
          <AvatarFallback className="bg-pension text-3xl font-semibold text-pension-foreground">
            AM
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-2xl font-semibold">Alex Martin</p>
          <p className="text-muted-foreground">Propriétaire · Les Coteaux</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost">Retirer</Button>
          <Button>Changer la photo</Button>
        </div>
      </div>
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
                defaultValue: "alex@lescoteaux.fr",
                description:
                  "Un lien de confirmation est envoyé à la nouvelle adresse",
                title: "Adresse e-mail",
                type: "input",
              },
              {
                defaultValue: "06 12 34 56 78",
                title: "Téléphone",
                type: "input",
              },
              { defaultValue: "Direction", title: "Poste", type: "input" },
            ],
            title: "Vos informations",
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

/** Une pilule qu'on allume ou éteint, avec une coche quand elle est active. */
function ChannelToggle({
  label,
  icon,
  event,
  initial,
}: {
  label: string
  icon: typeof Mail01Icon
  event: string
  initial: boolean
}) {
  const [on, setOn] = useState(initial)
  return (
    <button
      aria-label={`${event} : ${label}`}
      aria-pressed={on}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
        on
          ? "bg-control text-control-foreground"
          : "bg-secondary text-muted-foreground hover:bg-neutral-hover"
      )}
      onClick={() => setOn((value) => !value)}
      type="button"
    >
      <HugeiconsIcon
        className="size-4"
        icon={on ? CheckmarkCircle02Icon : icon}
      />
      {label}
    </button>
  )
}

export function NotificationsPage() {
  return (
    <SettingsPage
      description="Choisissez ce qui vous est envoyé, et où"
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
            title: "Où vous prévenir",
          },
        ]}
      />
      <SettingsSection
        description="Touchez une pastille pour l'allumer ou l'éteindre"
        title="Pour quoi vous prévenir"
      >
        {events.map((event) => (
          <SettingsRow key={event.title} title={event.title}>
            <div className="flex gap-2">
              <ChannelToggle
                event={event.title}
                icon={Notification03Icon}
                initial={event.push}
                label="Appli"
              />
              <ChannelToggle
                event={event.title}
                icon={Mail01Icon}
                initial={event.email}
                label="E-mail"
              />
            </div>
          </SettingsRow>
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
  const [others, setOthers] = useState(sessions.filter((s) => !s.current))
  return (
    <SettingsPage title="Sécurité & accès">
      <SettingsHero
        description="Double authentification activée · mot de passe changé il y a 3 mois"
        media={
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <HugeiconsIcon className="size-7" icon={Shield01Icon} />
          </span>
        }
        title="Votre compte est bien protégé"
        tone="success"
      />
      <SettingsSection title="Connexion">
        <SettingsRow description="Modifié il y a 3 mois" title="Mot de passe">
          <Button variant="secondary">Modifier</Button>
        </SettingsRow>
        <SettingsRow
          description="Un code à usage unique depuis une application"
          title="Double authentification"
        >
          <span className="flex items-center gap-1.5 text-sm font-semibold text-success-foreground">
            <HugeiconsIcon className="size-4" icon={CheckmarkCircle02Icon} />
            Activée
          </span>
          <Button variant="secondary">Gérer</Button>
        </SettingsRow>
        <SettingsRow
          description="Connexion avec Face ID, Touch ID ou Windows Hello"
          title="Clés d'accès"
        >
          <Button variant="secondary">Ajouter</Button>
        </SettingsRow>
      </SettingsSection>
      <SettingsSection
        action={
          others.length > 0 && (
            <Button
              onClick={() => {
                setOthers([])
                notify("Autres appareils déconnectés")
              }}
              variant="ghost"
            >
              Tout déconnecter
            </Button>
          )
        }
        description="Les appareils où votre compte est ouvert"
        title="Appareils connectés"
      >
        {[...sessions.filter((s) => s.current), ...others].map((session) => (
          <SettingsRow
            description={session.seen}
            key={session.device}
            media={
              <IconTile
                className={
                  session.current
                    ? "bg-primary text-primary-foreground"
                    : undefined
                }
                icon={session.icon}
              />
            }
            title={session.device}
          >
            {session.current ? (
              <span className="text-sm font-semibold text-success-foreground">
                Cet appareil
              </span>
            ) : (
              <Button
                onClick={() => {
                  setOthers((list) =>
                    list.filter((s) => s.device !== session.device)
                  )
                  notify("Appareil déconnecté")
                }}
                variant="secondary"
              >
                Déconnecter
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
  const [linked, setLinked] = useState(
    providers.filter((p) => p.account).map((p) => p.name)
  )
  return (
    <SettingsPage
      description="Pour vous connecter en un clic, sans mot de passe"
      title="Comptes connectés"
    >
      <SettingsSection title="Se connecter avec">
        {providers.map((provider) => {
          const on = linked.includes(provider.name)
          return (
            <SettingsRow
              description={
                on ? (provider.account ?? "Connecté") : "Non connecté"
              }
              key={provider.name}
              media={
                <IconTile
                  className={on ? "bg-primary text-primary-foreground" : ""}
                  icon={provider.icon}
                />
              }
              title={provider.name}
            >
              <Button
                onClick={() => {
                  setLinked((list) =>
                    on
                      ? list.filter((n) => n !== provider.name)
                      : [...list, provider.name]
                  )
                  notify(
                    on
                      ? `${provider.name} déconnecté`
                      : `${provider.name} connecté`
                  )
                }}
                variant={on ? "secondary" : "default"}
              >
                {on ? "Déconnecter" : "Connecter"}
              </Button>
            </SettingsRow>
          )
        })}
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
