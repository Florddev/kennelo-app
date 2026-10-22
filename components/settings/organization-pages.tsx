"use client"

import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  CreditCardIcon,
  Database01Icon,
  Download04Icon,
  FileImportIcon,
  Globe02Icon,
  InstagramIcon,
  Invoice01Icon,
  Key01Icon,
  Mail01Icon,
  Message01Icon,
  PlusSignIcon,
  ShieldUserIcon,
  Tag01Icon,
  UserAdd01Icon,
  WebhookIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import { metierOf, useCatalog } from "@/components/services/data"
import { ActivityDot } from "@/components/services/service-form"
import { SizeLimits } from "@/components/services/size-limits"
import { ActivityMark, activityNames } from "@/components/activity-mark"
import {
  activitySettings,
  invitations,
  members,
  type Role,
} from "@/components/settings/data"
import {
  IconTile,
  LinkRow,
  options,
  SettingsGroups,
  SettingsPage,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-ui"
import { formatAmount } from "@/components/today/widgets"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@/components/ui/meter"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export function OrganizationPage() {
  return (
    <SettingsPage
      description="Informations affichées sur vos factures et votre portail client"
      title="Établissement"
    >
      <SettingsSection>
        <SettingsRow
          description="Utilisé sur les factures, e-mails et le portail client"
          media={
            <span className="flex size-10 items-center justify-center rounded-lg bg-pension text-pension-foreground text-sm font-semibold">
              LC
            </span>
          }
          title="Logo"
        >
          <Button size="sm" variant="outline">
            Changer
          </Button>
        </SettingsRow>
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultValue: "Les Coteaux",
                title: "Nom commercial",
                type: "input",
              },
              {
                defaultValue: "SARL Les Coteaux",
                title: "Raison sociale",
                type: "input",
              },
              {
                defaultValue:
                  "Pension, toilettage et éducation canine à deux pas des vignes.",
                description: "Présentation affichée sur le portail client",
                title: "Description",
                type: "textarea",
              },
            ],
            title: "Identité",
          },
          {
            settings: [
              {
                defaultValue: "12 chemin des Coteaux, 33500 Libourne",
                title: "Adresse",
                type: "input",
              },
              {
                defaultValue: "05 57 00 12 34",
                title: "Téléphone",
                type: "input",
              },
              {
                defaultValue: "bonjour@lescoteaux.fr",
                title: "E-mail de contact",
                type: "input",
              },
              {
                defaultValue: "lescoteaux.fr",
                title: "Site web",
                type: "input",
              },
            ],
            title: "Coordonnées",
          },
          {
            settings: [
              {
                defaultValue: "852 123 456 00018",
                title: "SIRET",
                type: "input",
              },
              {
                defaultValue: "FR 12 852123456",
                title: "N° de TVA intracommunautaire",
                type: "input",
              },
              {
                defaultValue: "ACACED n° 33-2019-0412",
                description:
                  "Attestation de connaissances pour les animaux de compagnie",
                title: "Certificat de capacité",
                type: "input",
              },
              {
                control: (
                  <div className="flex items-center gap-3">
                    <Badge variant="success">Valide jusqu&apos;au 31/12</Badge>
                    <Button size="sm" variant="outline">
                      Mettre à jour
                    </Button>
                  </div>
                ),
                description: "Responsabilité civile professionnelle",
                title: "Assurance",
                type: "custom",
              },
            ],
            title: "Informations légales",
          },
        ]}
      />
      <SettingsSection
        description="Chaque activité a ses horaires et ses fermetures, affichés aux clients"
        title="Horaires"
      >
        {activitySettings.map((activity) => (
          <LinkRow
            href={`/settings/activities/${activity.slug}/hours`}
            key={activity.slug}
            media={
              <ActivityMark
                activity={activity.name}
                className="size-8 text-xs"
              />
            }
            title={activity.name}
            value={`${activity.hours.label} · ${activity.hours.from.replace(":00", "h")} – ${activity.hours.to.replace(":00", "h")}`}
          />
        ))}
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultValue: "Europe/Paris",
                items: options(
                  "Europe/Paris",
                  "Europe/Bruxelles",
                  "Europe/Zurich"
                ),
                title: "Fuseau horaire",
                type: "select",
              },
              {
                defaultValue: "Euro (€)",
                items: options("Euro (€)", "Franc suisse (CHF)"),
                title: "Devise",
                type: "select",
              },
              {
                defaultValue: "Français",
                description: "Langue des messages envoyés aux clients",
                items: options("Français", "English"),
                title: "Langue",
                type: "select",
              },
            ],
            title: "Régional",
          },
          {
            settings: [
              {
                description:
                  "Supprime l'établissement, ses clients et son historique",
                label: "Supprimer",
                title: "Supprimer l'organisation",
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

const roles: { role: Role; description: string }[] = [
  {
    description: "Tous les droits, facturation et abonnement",
    role: "Propriétaire",
  },
  {
    description: "Paramètres, membres et toutes les activités",
    role: "Administrateur",
  },
  {
    description: "Accès aux activités qui lui sont attribuées",
    role: "Membre",
  },
]

const roleVariant = (role: Role) =>
  role === "Propriétaire"
    ? "info"
    : role === "Administrateur"
      ? "secondary"
      : "outline"

export function MembersPage() {
  const [filter, setFilter] = useState("all")
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const rows = members.filter(
    (m) =>
      (filter === "all" || m.activities.includes(filter as never)) &&
      (!q || `${m.name} ${m.email}`.toLowerCase().includes(q))
  )
  return (
    <SettingsPage
      action={
        <Button size="sm">
          <HugeiconsIcon icon={UserAdd01Icon} />
          Inviter
        </Button>
      }
      description={`${members.length} membres · ${invitations.length} invitation en attente`}
      title="Membres"
    >
      <div className="-mb-6 flex flex-wrap items-center gap-3">
        <Tabs
          onValueChange={(value) => setFilter(String(value))}
          value={filter}
        >
          <TabsList size="sm">
            <TabsTab value="all">Tous</TabsTab>
            {activityNames.map((name) => (
              <TabsTab key={name} value={name}>
                {name}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="ms-auto w-full sm:w-56">
          <InputGroupInput
            aria-label="Rechercher un membre"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom ou e-mail…"
            size="sm"
            value={query}
          />
        </InputGroup>
      </div>
      <SettingsSection>
        {rows.map((member) => (
          <SettingsRow
            description={`${member.job} · ${member.email}`}
            key={member.email}
            media={
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            }
            title={
              <span className="flex items-center gap-2">
                {member.name}
                {member.lastSeen === "En ligne" && (
                  <span className="size-1.5 rounded-full bg-success" />
                )}
              </span>
            }
          >
            <div className="flex items-center gap-1">
              {member.activities.map((activity) => (
                <ActivityMark activity={activity} key={activity} />
              ))}
            </div>
            <Badge
              className="w-28 justify-center"
              variant={roleVariant(member.role)}
            >
              {member.role}
            </Badge>
            <Menu>
              <MenuTrigger
                render={
                  <Button aria-label="Actions" size="icon-sm" variant="ghost" />
                }
              >
                ···
              </MenuTrigger>
              <MenuPopup align="end">
                <MenuItem>Modifier le rôle</MenuItem>
                <MenuItem>Gérer les activités</MenuItem>
                <MenuSeparator />
                <MenuItem
                  disabled={member.role === "Propriétaire"}
                  variant="destructive"
                >
                  Retirer de l&apos;organisation
                </MenuItem>
              </MenuPopup>
            </Menu>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsSection title="Invitations en attente">
        {invitations.map((invite) => (
          <SettingsRow
            description={`${invite.role} · ${invite.activities.join(", ")} · Envoyée ${invite.sent.toLowerCase()}`}
            key={invite.email}
            media={<IconTile icon={Mail01Icon} />}
            title={invite.email}
          >
            <div className="flex gap-2">
              <Button size="sm" variant="ghost">
                Annuler
              </Button>
              <Button size="sm" variant="outline">
                Renvoyer
              </Button>
            </div>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsSection title="Rôles">
        {roles.map(({ role, description }) => (
          <SettingsRow description={description} key={role} title={role}>
            <span className="text-xs text-muted-foreground">
              {members.filter((m) => m.role === role).length} membre(s)
            </span>
          </SettingsRow>
        ))}
      </SettingsSection>
    </SettingsPage>
  )
}

export function ActivitiesPage() {
  const catalog = useCatalog()
  return (
    <SettingsPage
      action={
        <Button render={<Link href="/settings/activities/new" />} size="sm">
          <HugeiconsIcon icon={PlusSignIcon} />
          Créer une activité
        </Button>
      }
      description="Chaque activité a ses membres, ses horaires et choisit ses prestations dans le catalogue commun"
      title="Activités"
    >
      <SettingsSection>
        {catalog.activities.map((activity) => {
          const settings = activitySettings.find((a) => a.slug === activity.id)
          const team = members.filter((m) =>
            m.activities.some((name) => name === activity.name)
          )
          const count = (catalog.offers[activity.id] ?? []).length
          const content = (
            <>
              <ActivityDot activity={activity} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {activity.name}
                  {!settings && (
                    <Badge size="sm" variant="success">
                      Nouvelle
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metierOf(activity.metier).label}
                  {activity.hours && ` · ${activity.hours}`}
                  {settings &&
                    !activity.hours &&
                    ` · ${settings.hours.label} · ${settings.hours.from.replace(":00", "h")} – ${settings.hours.to.replace(":00", "h")}`}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {count} prestations · {team.length} membres
              </span>
              <HugeiconsIcon
                className="size-4 text-muted-foreground"
                icon={ArrowRight01Icon}
              />
            </>
          )
          return (
            <Link
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
              href={`/settings/activities/${activity.id}`}
              key={activity.id}
            >
              {content}
            </Link>
          )
        })}
      </SettingsSection>
      <SettingsSection>
        <LinkRow
          description="Vue d'ensemble des prestations créées par vos activités et de leurs reprises"
          href="/settings/services"
          icon={Tag01Icon}
          title="Toutes les prestations"
          value={`${catalog.services.length} prestations`}
        />
        <LinkRow
          description="Haute saison, fêtes, ponts : le prix des places varie selon la date"
          href="/settings/periods"
          icon={Calendar03Icon}
          title="Périodes tarifaires"
          value={`${catalog.periods.length - 1} saisons`}
        />
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultValue: "Tous les membres",
                description: "Qui peut voir les plannings des autres activités",
                items: options(
                  "Tous les membres",
                  "Membres de l'activité",
                  "Administrateurs"
                ),
                title: "Visibilité des activités",
                type: "select",
              },
              {
                defaultChecked: true,
                description:
                  "Un client a une seule fiche pour toutes les activités",
                title: "Fiches clients partagées",
                type: "switch",
              },
            ],
            title: "Réglages communs",
          },
        ]}
      />
      <SizeLimits />
    </SettingsPage>
  )
}

export function BookingPage() {
  return (
    <SettingsPage
      description="Permettez à vos clients de réserver et payer en ligne"
      title="Réservation en ligne"
    >
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultChecked: true,
                description:
                  "Votre page de réservation est accessible publiquement",
                title: "Portail client",
                type: "switch",
              },
              {
                control: (
                  <InputGroup className="w-full sm:w-72">
                    <InputGroupAddon>
                      <InputGroupText>kennelo.app/</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-label="Adresse du portail"
                      defaultValue="les-coteaux"
                      size="sm"
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        aria-label="Copier le lien"
                        size="icon-xs"
                        variant="ghost"
                      >
                        <HugeiconsIcon icon={Copy01Icon} />
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                ),
                title: "Adresse du portail",
                type: "custom",
              },
              {
                defaultValue: "Vert des Coteaux",
                items: options("Vert des Coteaux", "Violet", "Bleu", "Noir"),
                title: "Couleur principale",
                type: "select",
              },
            ],
            title: "Portail",
          },
        ]}
      />
      <SettingsSection
        description="Activités réservables depuis le portail"
        title="Activités en ligne"
      >
        {activitySettings.map((activity) => (
          <SettingsRow
            description={
              activity.name === "Pension"
                ? "Demande validée par l'équipe"
                : "Confirmation immédiate selon les disponibilités"
            }
            key={activity.slug}
            media={
              <ActivityMark
                activity={activity.name}
                className="size-8 text-xs"
              />
            }
            title={activity.name}
          >
            <Button
              render={<Link href={`/settings/activities/${activity.slug}`} />}
              size="sm"
              variant="ghost"
            >
              Règles
            </Button>
            <SwitchCell defaultChecked label={`${activity.name} en ligne`} />
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
                  "Le client crée un compte avant sa première réservation",
                title: "Compte client obligatoire",
                type: "switch",
              },
              {
                defaultChecked: true,
                description: "Nom, race, âge, vaccins et particularités",
                title: "Fiche animal à compléter",
                type: "switch",
              },
              {
                defaultValue: "2 mois",
                description: "Délai maximum pour réserver à l'avance",
                items: options("1 mois", "2 mois", "6 mois", "1 an"),
                title: "Réservation jusqu'à",
                type: "select",
              },
              {
                label: "Modifier",
                description:
                  "Acceptées par le client lors de chaque réservation",
                title: "Conditions générales de vente",
                type: "button",
              },
            ],
            title: "Règles",
          },
        ]}
      />
    </SettingsPage>
  )
}

const templates: {
  channel: string
  title: string
  trigger: string
  /** Envoi réglé là où le message sert : on n'y modifie ici que le texte. */
  owner?: { href: string; label: string }
}[] = [
  {
    channel: "E-mail · SMS",
    title: "Confirmation de réservation",
    trigger: "À la validation",
  },
  {
    channel: "SMS",
    owner: {
      href: "/settings/activities/grooming/reminders",
      label: "Toilettage › Rappels & absences",
    },
    title: "Rappel de rendez-vous",
    trigger: "La veille à 18h",
  },
  {
    channel: "E-mail",
    owner: {
      href: "/settings/activities/pension/news",
      label: "Pension › Nouvelles aux propriétaires",
    },
    title: "Nouvelles du jour",
    trigger: "Chaque soir pendant un séjour",
  },
  { channel: "E-mail", title: "Facture disponible", trigger: "À l'émission" },
  {
    channel: "E-mail · SMS",
    owner: { href: "/settings/payments", label: "Paiements › Relances" },
    title: "Relance de paiement",
    trigger: "7 jours après l'échéance",
  },
  {
    channel: "E-mail",
    title: "Demande d'avis",
    trigger: "2 jours après la visite",
  },
]

export function CommunicationPage() {
  return (
    <SettingsPage
      description="E-mails et SMS envoyés à vos clients"
      title="Communication"
    >
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultValue: "Les Coteaux",
                description: "Nom affiché dans les e-mails",
                title: "Nom de l'expéditeur",
                type: "input",
              },
              {
                defaultValue: "bonjour@lescoteaux.fr",
                description: "Les réponses des clients arrivent dans Messages",
                title: "Adresse de réponse",
                type: "input",
              },
              {
                defaultValue: "LesCoteaux",
                description: "11 caractères maximum, sans espace",
                title: "Expéditeur SMS",
                type: "input",
              },
            ],
            title: "Expéditeur",
          },
        ]}
      />
      <SettingsSection
        action={
          <Button size="sm" variant="ghost">
            <HugeiconsIcon icon={PlusSignIcon} />
            Nouveau modèle
          </Button>
        }
        description="Messages envoyés automatiquement"
        title="Modèles"
      >
        {templates.map((template, index) => (
          <SettingsRow
            description={
              template.owner ? (
                <>
                  {template.channel} · envoi réglé dans{" "}
                  <Link
                    className="font-medium underline"
                    href={template.owner.href}
                  >
                    {template.owner.label}
                  </Link>
                </>
              ) : (
                `${template.trigger} · ${template.channel}`
              )
            }
            key={template.title}
            media={
              <IconTile
                icon={template.channel === "SMS" ? Message01Icon : Mail01Icon}
              />
            }
            title={template.title}
          >
            {!template.owner && (
              <SwitchCell defaultChecked={index !== 5} label={template.title} />
            )}
            <Button size="sm" variant="outline">
              Modifier le texte
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
                description: "Les clients écrivent depuis leur téléphone",
                title: "Réponses par SMS",
                type: "switch",
              },
              {
                defaultValue: "Aucun",
                description: "Message envoyé en dehors des horaires d'accueil",
                items: options("Aucun", "Réponse automatique"),
                title: "Absence",
                type: "select",
              },
            ],
            title: "Conversations",
          },
        ]}
      />
    </SettingsPage>
  )
}

function SwitchCell({
  label,
  defaultChecked,
}: {
  label: string
  defaultChecked?: boolean
}) {
  const [on, setOn] = useState(defaultChecked ?? false)
  return (
    <button
      aria-pressed={on}
      className="text-xs"
      onClick={() => setOn((value) => !value)}
      type="button"
    >
      <Badge variant={on ? "success" : "outline"}>
        {on ? "Actif" : "Inactif"}
      </Badge>
      <span className="sr-only">{label}</span>
    </button>
  )
}

export function PaymentsPage() {
  return (
    <SettingsPage
      description="Encaissement, factures et relances"
      title="Paiements & factures"
    >
      <SettingsSection title="Encaissement">
        <SettingsRow
          description="Paiement des acomptes et factures par carte"
          media={
            <IconTile
              className="bg-grooming text-grooming-foreground"
              icon={CreditCardIcon}
            />
          }
          title="Stripe"
        >
          <Badge variant="success">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} />
            Connecté
          </Badge>
          <Button size="sm" variant="outline">
            Tableau de bord
          </Button>
        </SettingsRow>
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              { defaultChecked: true, title: "Carte bancaire", type: "switch" },
              { defaultChecked: true, title: "Espèces", type: "switch" },
              { defaultChecked: true, title: "Chèque", type: "switch" },
              { defaultChecked: true, title: "Virement", type: "switch" },
              {
                description:
                  "En 3 fois sans frais au-delà de 300 €, pour les séjours comme pour les forfaits",
                title: "Paiement fractionné",
                type: "switch",
              },
            ],
            title: "Moyens de paiement acceptés",
          },
        ]}
      />
      <SettingsSection
        description="Chaque activité a sa propre série de numéros"
        title="Numérotation"
      >
        {activitySettings.map((activity, index) => (
          <SettingsRow
            key={activity.slug}
            media={
              <ActivityMark
                activity={activity.name}
                className="size-8 text-xs"
              />
            }
            title={activity.name}
          >
            <span className="font-mono text-sm text-muted-foreground">
              {["F", "T", "E"][index]}-2026-{["0156", "0148", "0096"][index]}
            </span>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultValue: "20 %",
                items: options("20 %", "10 %", "5,5 %", "Non assujetti"),
                title: "TVA par défaut",
                type: "select",
              },
              {
                defaultValue: "À réception",
                items: options("À réception", "15 jours", "30 jours"),
                title: "Échéance",
                type: "select",
              },
              {
                defaultValue:
                  "Pénalités de retard : 3 fois le taux d'intérêt légal. Indemnité forfaitaire pour frais de recouvrement : 40 €.",
                description: "Affichées en bas de chaque facture",
                title: "Mentions légales",
                type: "textarea",
              },
            ],
            title: "Factures",
          },
          {
            settings: [
              {
                defaultChecked: true,
                description: "E-mail puis SMS si la facture reste impayée",
                title: "Relances automatiques",
                type: "switch",
              },
              {
                defaultValue: 7,
                description: "Après la date d'échéance",
                title: "Première relance",
                type: "number",
                unit: "jours",
              },
              {
                defaultValue: 15,
                title: "Deuxième relance",
                type: "number",
                unit: "jours",
              },
            ],
            title: "Relances",
          },
        ]}
      />
    </SettingsPage>
  )
}

type Integration = {
  name: string
  description: string
  icon: IconSvgElement
  color: string
  connected?: boolean
}

const integrations: Integration[] = [
  {
    color: "bg-grooming-strong",
    connected: true,
    description: "Paiements en ligne et terminal",
    icon: CreditCardIcon,
    name: "Stripe",
  },
  {
    color: "bg-blue-600",
    connected: true,
    description: "Synchronisation des agendas",
    icon: Calendar03Icon,
    name: "Google Agenda",
  },
  {
    color: "bg-success",
    description: "Conversations avec vos clients",
    icon: WhatsappIcon,
    name: "WhatsApp Business",
  },
  {
    color: "bg-pink-600",
    description: "Publier les nouvelles des pensionnaires",
    icon: InstagramIcon,
    name: "Instagram",
  },
  {
    color: "bg-amber-600",
    description: "Export comptable automatique",
    icon: Invoice01Icon,
    name: "Pennylane",
  },
  {
    color: "bg-sky-700",
    description: "Vérification des numéros d'identification",
    icon: ShieldUserIcon,
    name: "I-CAD",
  },
  {
    color: "bg-zinc-700",
    description: "Campagnes e-mail et newsletters",
    icon: Mail01Icon,
    name: "Brevo",
  },
  {
    color: "bg-orange-600",
    description: "Automatisations avec 6 000 applications",
    icon: WebhookIcon,
    name: "Zapier",
  },
]

export function IntegrationsPage() {
  const [connected, setConnected] = useState(
    integrations.filter((i) => i.connected).map((i) => i.name)
  )
  return (
    <SettingsPage
      description="Connectez Kennelo aux outils que vous utilisez déjà"
      title="Intégrations"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {integrations.map((integration) => {
          const isOn = connected.includes(integration.name)
          return (
            <div
              className="flex flex-col gap-3 rounded-xl border bg-card p-4"
              key={integration.name}
            >
              <div className="flex items-start justify-between gap-2">
                <IconTile
                  className={cn("text-white", integration.color)}
                  icon={integration.icon}
                />
                {isOn && <Badge variant="success">Connecté</Badge>}
              </div>
              <div>
                <p className="text-sm font-medium">{integration.name}</p>
                <p className="text-xs text-muted-foreground">
                  {integration.description}
                </p>
              </div>
              <Button
                className="mt-auto self-start"
                onClick={() =>
                  setConnected((list) =>
                    isOn
                      ? list.filter((n) => n !== integration.name)
                      : [...list, integration.name]
                  )
                }
                size="sm"
                variant={isOn ? "ghost" : "outline"}
              >
                {isOn ? "Déconnecter" : "Connecter"}
              </Button>
            </div>
          )
        })}
      </div>
    </SettingsPage>
  )
}

const apiKeys = [
  {
    created: "12 mars 2026",
    key: "kn_live_••••4f2a",
    lastUsed: "Il y a 5 min",
    name: "Site lescoteaux.fr",
  },
  {
    created: "3 juin 2026",
    key: "kn_live_••••91bc",
    lastUsed: "Hier",
    name: "Zapier",
  },
]

const webhooks = [
  {
    events: "booking.created, booking.cancelled",
    status: "Actif",
    url: "https://lescoteaux.fr/api/kennelo",
  },
  {
    events: "invoice.paid",
    status: "Échecs (3)",
    url: "https://hooks.zapier.com/…/8812",
  },
]

export function ApiPage() {
  return (
    <SettingsPage
      action={
        <Button render={<a href="#" />} size="sm" variant="outline">
          Documentation
        </Button>
      }
      description="Accédez à vos données depuis vos propres outils"
      title="API"
    >
      <SettingsSection
        action={
          <Button size="sm" variant="ghost">
            <HugeiconsIcon icon={PlusSignIcon} />
            Nouvelle clé
          </Button>
        }
        description="Ne partagez jamais une clé : elle donne accès à toutes vos données"
        title="Clés d'API"
      >
        {apiKeys.map((apiKey) => (
          <SettingsRow
            description={`Créée le ${apiKey.created} · Utilisée ${apiKey.lastUsed.toLowerCase()}`}
            key={apiKey.key}
            media={<IconTile icon={Key01Icon} />}
            title={apiKey.name}
          >
            <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
              {apiKey.key}
            </code>
            <Button size="sm" variant="destructive-outline">
              Révoquer
            </Button>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsSection
        action={
          <Button size="sm" variant="ghost">
            <HugeiconsIcon icon={PlusSignIcon} />
            Nouveau webhook
          </Button>
        }
        description="Kennelo envoie une requête à chaque événement"
        title="Webhooks"
      >
        {webhooks.map((hook) => (
          <SettingsRow
            description={hook.events}
            key={hook.url}
            media={<IconTile icon={WebhookIcon} />}
            title={<span className="font-mono text-xs">{hook.url}</span>}
          >
            <Badge variant={hook.status === "Actif" ? "success" : "error"}>
              {hook.status}
            </Badge>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsSection title="Utilisation ce mois-ci">
        <div className="p-4">
          <Meter max={10000} value={3420}>
            <div className="flex items-center justify-between gap-2">
              <MeterLabel>Requêtes</MeterLabel>
              <MeterValue>{() => "3 420 / 10 000"}</MeterValue>
            </div>
            <MeterTrack>
              <MeterIndicator />
            </MeterTrack>
          </Meter>
        </div>
      </SettingsSection>
    </SettingsPage>
  )
}

const audit = [
  {
    action: "a modifié les tarifs de la pension",
    time: "Aujourd'hui, 9h12",
    who: "Claire Dumas",
  },
  {
    action: "a invité emma.roux@gmail.com",
    time: "Lun. 19 oct., 17h40",
    who: "Alex Martin",
  },
  {
    action: "a exporté les factures de septembre",
    time: "Jeu. 1 oct., 8h05",
    who: "Alex Martin",
  },
  {
    action: "s'est connecté depuis un nouvel appareil",
    time: "Mer. 30 sept., 10h21",
    who: "Lucas Bernard",
  },
]

export function OrganizationSecurityPage() {
  return (
    <SettingsPage title="Sécurité">
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                description: "Chaque membre doit activer un second facteur",
                title: "Double authentification obligatoire",
                type: "switch",
              },
              {
                defaultChecked: true,
                title: "Connexion avec Google",
                type: "switch",
              },
              {
                defaultChecked: true,
                description: "Lien de connexion envoyé par e-mail",
                title: "Connexion par lien magique",
                type: "switch",
              },
              {
                defaultValue: "lescoteaux.fr",
                description:
                  "Les adresses de ce domaine rejoignent l'organisation sur invitation",
                title: "Domaine autorisé",
                type: "input",
              },
              {
                defaultValue: "30 jours",
                description: "Déconnexion automatique après inactivité",
                items: options("24 heures", "7 jours", "30 jours"),
                title: "Durée des sessions",
                type: "select",
              },
            ],
            title: "Authentification",
          },
          {
            settings: [
              {
                defaultChecked: true,
                description:
                  "Les membres ne voient que les montants de leur activité",
                title: "Masquer le chiffre d'affaires",
                type: "switch",
              },
              {
                description:
                  "Téléphone et adresse visibles par les administrateurs uniquement",
                title: "Coordonnées clients restreintes",
                type: "switch",
              },
            ],
            title: "Données",
          },
        ]}
      />
      <SettingsSection
        action={
          <Button size="sm" variant="ghost">
            Tout voir
          </Button>
        }
        title="Journal d'activité"
      >
        {audit.map((entry) => (
          <SettingsRow
            description={entry.time}
            key={entry.time}
            title={
              <span className="font-normal">
                <span className="font-medium">{entry.who}</span> {entry.action}
              </span>
            }
          />
        ))}
      </SettingsSection>
    </SettingsPage>
  )
}

const plans = [
  {
    current: true,
    features: [
      "3 activités",
      "5 membres",
      "250 SMS / mois",
      "3 saisons tarifaires",
    ],
    name: "Gratuit",
    price: 0,
  },
  {
    features: [
      "Activités illimitées",
      "15 membres",
      "1 000 SMS / mois",
      "Saisons tarifaires illimitées",
    ],
    name: "Pro",
    price: 29,
  },
  {
    features: [
      "Membres illimités",
      "Multi-établissements",
      "API avancée",
      "Support prioritaire",
    ],
    name: "Business",
    price: 79,
  },
]

const usage = [
  { label: "Membres", max: 5, value: 5 },
  { label: "Activités", max: 3, value: 3 },
  { label: "SMS envoyés ce mois-ci", max: 250, value: 212 },
  { label: "Stockage photos", max: 5, unit: " Go", value: 3.2 },
]

const purchases = [
  { amount: 15, date: "2 oct. 2026", label: "Pack 200 SMS" },
  { amount: 15, date: "4 sept. 2026", label: "Pack 200 SMS" },
]

export function BillingPage() {
  return (
    <SettingsPage
      description="Offre, utilisation et paiements"
      title="Abonnement"
    >
      <SettingsSection title="Utilisation">
        <div className="grid gap-5 p-4 sm:grid-cols-2">
          {usage.map((item) => (
            <Meter key={item.label} max={item.max} value={item.value}>
              <div className="flex items-center justify-between gap-2">
                <MeterLabel>{item.label}</MeterLabel>
                <MeterValue>
                  {() =>
                    `${String(item.value).replace(".", ",")} / ${item.max}${item.unit ?? ""}`
                  }
                </MeterValue>
              </div>
              <MeterTrack>
                <MeterIndicator
                  className={cn(
                    item.value / item.max >= 0.8 && "bg-orange-500"
                  )}
                />
              </MeterTrack>
            </Meter>
          ))}
        </div>
      </SettingsSection>
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            className={cn(
              "flex flex-col gap-4 rounded-xl border bg-card p-4",
              plan.name === "Pro" &&
                "border-pension-strong/40 ring-1 ring-pension-strong/20"
            )}
            key={plan.name}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{plan.name}</p>
              {plan.current && (
                <Badge variant="secondary">Offre actuelle</Badge>
              )}
              {plan.name === "Pro" && (
                <Badge variant="success">Recommandé</Badge>
              )}
            </div>
            <p>
              <span className="text-2xl font-semibold">{plan.price} €</span>
              <span className="text-sm text-muted-foreground"> / mois</span>
            </p>
            <ul className="space-y-1.5 text-sm">
              {plan.features.map((feature) => (
                <li className="flex items-center gap-2" key={feature}>
                  <HugeiconsIcon
                    className="size-4 text-pension-strong"
                    icon={CheckmarkCircle02Icon}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-auto"
              disabled={plan.current}
              size="sm"
              variant={plan.name === "Pro" ? "default" : "outline"}
            >
              {plan.current ? "Offre actuelle" : `Passer à ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>
      <SettingsSection title="Facturation">
        <SettingsRow
          description="Expire le 09/2028"
          media={<IconTile icon={CreditCardIcon} />}
          title="Visa •••• 4242"
        >
          <Button size="sm" variant="outline">
            Modifier
          </Button>
        </SettingsRow>
        <SettingsRow
          description="Adresse de facturation"
          title="SARL Les Coteaux"
        >
          <Button size="sm" variant="ghost">
            Modifier
          </Button>
        </SettingsRow>
      </SettingsSection>
      <SettingsSection title="Historique">
        {purchases.map((purchase) => (
          <SettingsRow
            description={purchase.date}
            key={purchase.date}
            title={purchase.label}
          >
            <span className="text-sm tabular-nums">
              {formatAmount(purchase.amount)}
            </span>
            <Button
              aria-label="Télécharger la facture"
              size="icon-sm"
              variant="ghost"
            >
              <HugeiconsIcon icon={Download04Icon} />
            </Button>
          </SettingsRow>
        ))}
      </SettingsSection>
    </SettingsPage>
  )
}

const exportsList = [
  {
    description: "Coordonnées, animaux et historique",
    title: "Clients & animaux",
  },
  { description: "Séjours, rendez-vous et séances", title: "Réservations" },
  {
    description: "Format FEC pour votre comptable",
    title: "Factures & paiements",
  },
]

export function ImportExportPage() {
  return (
    <SettingsPage title="Import & export">
      <SettingsSection
        description="Reprenez vos données d'un autre outil"
        title="Importer"
      >
        <SettingsRow
          description="Fichier CSV ou Excel avec une ligne par animal"
          media={<IconTile icon={FileImportIcon} />}
          title="Clients & animaux"
        >
          <Button size="sm" variant="outline">
            Importer un fichier
          </Button>
        </SettingsRow>
        <SettingsRow
          description="Planning et réservations à venir"
          media={<IconTile icon={Globe02Icon} />}
          title="Depuis un autre logiciel"
        >
          <Button size="sm" variant="outline">
            Choisir
          </Button>
        </SettingsRow>
      </SettingsSection>
      <SettingsSection
        description="Téléchargez vos données au format CSV"
        title="Exporter"
      >
        {exportsList.map((item) => (
          <SettingsRow
            description={item.description}
            key={item.title}
            media={<IconTile icon={Database01Icon} />}
            title={item.title}
          >
            <Button size="sm" variant="outline">
              <HugeiconsIcon icon={Download04Icon} />
              Exporter
            </Button>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                description: "Archive complète envoyée par e-mail sous 24 h",
                label: "Demander",
                title: "Export RGPD",
                type: "button",
              },
              {
                defaultValue: "3 ans",
                description: "Après la dernière visite du client",
                items: options("1 an", "3 ans", "5 ans"),
                title: "Conservation des données",
                type: "select",
              },
            ],
            title: "Données personnelles",
          },
        ]}
      />
    </SettingsPage>
  )
}
