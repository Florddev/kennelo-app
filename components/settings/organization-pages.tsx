"use client"

import {
  ArrowRight01Icon,
  Calendar03Icon,
  Cancel01Icon,
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
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
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
import { Photo, PhotoButton } from "@/components/site/site-ui"
import { venueOf } from "@/components/site/venues"
import {
  activitySettings,
  invitations,
  members,
  type Role,
} from "@/components/settings/data"
import {
  IconTile,
  LinkRow,
  notify,
  options,
  SettingsGroups,
  SettingsHero,
  SettingsPage,
  SettingsRow,
  SettingsSection,
  SwitchRow,
  ValueRow,
} from "@/components/settings/settings-ui"
import { formatAmount } from "@/components/today/widgets"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/** Photos de la page publique : la première sert de couverture. */
function PagePhotos() {
  const [photos, setPhotos] = useState(
    () => venueOf("les-coteaux")?.photos ?? []
  )
  return (
    <div className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-3">
      {photos.map((p, i) => (
        <div className="relative" key={p}>
          <Photo
            alt={`Photo ${i + 1}`}
            className="aspect-square rounded-2xl"
            sizes="200px"
            src={p}
          />
          {i === 0 && (
            <span className="absolute bottom-2 left-2 rounded-full bg-background px-2.5 py-0.5 text-sm font-semibold">
              Couverture
            </span>
          )}
          <Button
            aria-label="Retirer la photo"
            className="absolute top-2 right-2 bg-background/90"
            onClick={() => setPhotos((list) => list.filter((x) => x !== p))}
            size="icon-sm"
            variant="outline"
          >
            <HugeiconsIcon icon={Cancel01Icon} />
          </Button>
        </div>
      ))}
      <PhotoButton
        className="aspect-square h-auto flex-col rounded-2xl border-2 border-dashed"
        onPick={(url) => {
          setPhotos((list) => [...list, url])
          notify("Photo ajoutée")
        }}
        variant="ghost"
      >
        <HugeiconsIcon className="size-6" icon={PlusSignIcon} />
        Ajouter
      </PhotoButton>
    </div>
  )
}

export function OrganizationPage() {
  return (
    <SettingsPage
      description="Informations affichées sur vos factures et votre portail client"
      title="Établissement"
    >
      <SettingsHero
        actions={<Button>Changer le logo</Button>}
        description="12 chemin des Coteaux, Libourne · 3 activités"
        eyebrow="Votre établissement"
        media={
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-pension text-xl font-semibold text-pension-foreground">
            LC
          </span>
        }
        title="Les Coteaux"
      />
      <SettingsSection
        action={
          <Button
            render={<Link href="/places/les-coteaux" />}
            variant="secondary"
          >
            Voir ma page
          </Button>
        }
        description="Les clients les voient sur votre page Kennelo. La première sert de couverture."
        title="Photos de votre page"
      >
        <PagePhotos />
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
                    <Button variant="secondary">Mettre à jour</Button>
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
                className="size-10 text-sm"
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

export function MembersPage() {
  const [filter, setFilter] = useState("all")
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const rows = members.filter(
    (m) =>
      (filter === "all" || m.activities.includes(filter as never)) &&
      (!q || `${m.name} ${m.email}`.toLowerCase().includes(q))
  )
  const chips = [
    { label: "Tous", value: "all" },
    ...activityNames.map((name) => ({ label: name, value: name })),
  ]
  return (
    <SettingsPage
      action={
        <Button>
          <HugeiconsIcon icon={UserAdd01Icon} />
          Inviter
        </Button>
      }
      description={`${members.length} membres · ${invitations.length} invitation en attente`}
      title="Membres"
    >
      <div className="space-y-4">
        <InputGroup className="rounded-full">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Rechercher un membre"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom ou e-mail"
            value={query}
          />
        </InputGroup>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
          {chips.map((chip) => (
            <button
              aria-pressed={filter === chip.value}
              className={cn(
                "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
                filter === chip.value
                  ? "bg-control text-control-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-neutral-hover"
              )}
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              type="button"
            >
              {chip.label}
            </button>
          ))}
        </div>
        <SettingsSection>
          {rows.length === 0 && (
            <p className="px-5 py-8 text-center text-muted-foreground">
              Aucun membre ne correspond.
            </p>
          )}
          {rows.map((member) => (
            <SettingsRow
              description={`${member.role} · ${member.job}`}
              key={member.email}
              media={
                <span className="relative shrink-0">
                  <Avatar className="size-12">
                    <AvatarFallback className="font-semibold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  {member.lastSeen === "En ligne" && (
                    <span className="absolute inset-e-0 bottom-0 size-3.5 rounded-full border-2 border-card bg-success" />
                  )}
                </span>
              }
              title={member.name}
            >
              <div className="flex items-center gap-1 max-sm:hidden">
                {member.activities.map((activity) => (
                  <ActivityMark
                    activity={activity}
                    className="size-7 text-xs"
                    key={activity}
                  />
                ))}
              </div>
              <Menu>
                <MenuTrigger
                  render={
                    <Button
                      aria-label={`Actions pour ${member.name}`}
                      size="icon"
                      variant="ghost"
                    />
                  }
                >
                  <HugeiconsIcon icon={MoreHorizontalIcon} />
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
      </div>
      <SettingsSection title="Invitations en attente">
        {invitations.map((invite) => (
          <SettingsRow
            description={`${invite.role} · ${invite.activities.join(", ")} · envoyée ${invite.sent.toLowerCase()}`}
            key={invite.email}
            media={<IconTile icon={Mail01Icon} />}
            title={invite.email}
          >
            <div className="flex gap-2">
              <Button variant="ghost">Annuler</Button>
              <Button
                onClick={() => notify("Invitation renvoyée")}
                variant="secondary"
              >
                Renvoyer
              </Button>
            </div>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsSection
        description="Ce que chacun peut faire dans Kennelo"
        title="Rôles"
      >
        {roles.map(({ role, description }) => (
          <SettingsRow description={description} key={role} title={role}>
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
              {members.filter((m) => m.role === role).length}
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
              <ActivityDot activity={activity} className="size-10 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold">
                  {activity.name}
                  {!settings && (
                    <Badge size="sm" variant="success">
                      Nouvelle
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {metierOf(activity.metier).label}
                  {activity.hours && ` · ${activity.hours}`}
                  {settings &&
                    !activity.hours &&
                    ` · ${settings.hours.label} · ${settings.hours.from.replace(":00", "h")} – ${settings.hours.to.replace(":00", "h")}`}
                </p>
              </div>
              <span className="text-sm text-muted-foreground max-sm:hidden">
                {count} prestations · {team.length} membres
              </span>
              <HugeiconsIcon
                className="size-5 text-muted-foreground"
                icon={ArrowRight01Icon}
              />
            </>
          )
          return (
            <Link
              className="flex min-h-16 items-center gap-4 px-5 py-4 transition-colors hover:bg-accent"
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
  const [online, setOnline] = useState(true)
  return (
    <SettingsPage
      description="Ce que vos clients peuvent réserver eux-mêmes, à toute heure"
      title="Réservation en ligne"
    >
      <SettingsHero
        actions={
          <>
            <Button
              onClick={() => {
                navigator.clipboard?.writeText(
                  "https://kennelo.app/les-coteaux"
                )
                notify("Lien copié")
              }}
            >
              <HugeiconsIcon icon={Copy01Icon} />
              Copier le lien
            </Button>
            <Button render={<a href="#" />} variant="secondary">
              Voir le portail
            </Button>
          </>
        }
        description={
          online
            ? "Vos clients réservent 24 h/24 depuis ce lien"
            : "Portail fermé : personne ne peut réserver en ligne"
        }
        eyebrow={online ? "Votre portail est en ligne" : "Portail hors ligne"}
        media={
          <span
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-full",
              online
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground"
            )}
          >
            <HugeiconsIcon className="size-7" icon={Globe02Icon} />
          </span>
        }
        title="kennelo.app/les-coteaux"
      />
      <SettingsSection title="Portail">
        <SwitchRow
          checked={online}
          description="Éteignez-le pour fermer les réservations quelques jours"
          onCheckedChange={(on) => {
            setOnline(on)
            notify(on ? "Portail ouvert" : "Portail fermé")
          }}
          title="Portail ouvert"
        />
        <ValueRow
          setting={{
            defaultValue: "les-coteaux",
            description: "La fin du lien : kennelo.app/…",
            title: "Adresse du portail",
            type: "input",
          }}
        />
        <ValueRow
          setting={{
            defaultValue: "Vert des Coteaux",
            items: options("Vert des Coteaux", "Violet", "Bleu", "Noir"),
            title: "Couleur principale",
            type: "select",
          }}
        />
      </SettingsSection>
      <SettingsSection
        description="Les activités que vos clients voient sur le portail"
        title="Activités en ligne"
      >
        {activitySettings.map((activity) => (
          <SwitchRow
            defaultChecked
            description={
              activity.name === "Pension"
                ? "Chaque demande est validée par l'équipe"
                : "Confirmé tout de suite si le créneau est libre"
            }
            key={activity.slug}
            media={
              <ActivityMark
                activity={activity.name}
                className="size-10 text-sm"
              />
            }
            title={activity.name}
          />
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
          <Button variant="ghost">
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
                    className="font-semibold underline"
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
            <Button variant="secondary">Modifier</Button>
            {!template.owner && (
              <Switch
                aria-label={`${template.title} envoyé automatiquement`}
                defaultChecked={index !== 5}
              />
            )}
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

export function PaymentsPage() {
  return (
    <SettingsPage
      description="Encaissement, factures et relances"
      title="Paiements & factures"
    >
      <SettingsHero
        actions={<Button variant="secondary">Ouvrir Stripe</Button>}
        description="Acomptes et factures payés par carte, versés sous 2 jours"
        eyebrow="Encaissement en ligne"
        media={
          <IconTile
            className="size-14 bg-wise-purple text-wise-pink [&_svg]:size-7"
            icon={CreditCardIcon}
          />
        }
        title="Stripe est connecté"
      />
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
                className="size-10 text-sm"
              />
            }
            title={activity.name}
          >
            <span className="rounded-full bg-muted px-3 py-1 font-mono text-sm font-semibold">
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
    color: "bg-wise-purple text-wise-pink",
    connected: true,
    description: "Paiements en ligne et terminal",
    icon: CreditCardIcon,
    name: "Stripe",
  },
  {
    color: "bg-wise-blue text-wise-charcoal",
    connected: true,
    description: "Synchronisation des agendas",
    icon: Calendar03Icon,
    name: "Google Agenda",
  },
  {
    color: "bg-wise-green text-wise-forest",
    description: "Conversations avec vos clients",
    icon: WhatsappIcon,
    name: "WhatsApp Business",
  },
  {
    color: "bg-wise-pink text-wise-purple",
    description: "Publier les nouvelles des pensionnaires",
    icon: InstagramIcon,
    name: "Instagram",
  },
  {
    color: "bg-wise-yellow text-wise-gold",
    description: "Export comptable automatique",
    icon: Invoice01Icon,
    name: "Pennylane",
  },
  {
    color: "bg-wise-charcoal text-wise-blue",
    description: "Vérification des numéros d'identification",
    icon: ShieldUserIcon,
    name: "I-CAD",
  },
  {
    color: "bg-muted text-foreground",
    description: "Campagnes e-mail et newsletters",
    icon: Mail01Icon,
    name: "Brevo",
  },
  {
    color: "bg-wise-orange text-wise-maroon",
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
              className="flex flex-col gap-4 rounded-2xl border bg-card p-5"
              key={integration.name}
            >
              <div className="flex items-start justify-between gap-2">
                <IconTile
                  className={cn("size-12", integration.color)}
                  icon={integration.icon}
                />
                {isOn && <Badge variant="success">Connecté</Badge>}
              </div>
              <div>
                <p className="font-semibold">{integration.name}</p>
                <p className="text-sm text-muted-foreground">
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
                variant={isOn ? "secondary" : "default"}
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
        <Button render={<a href="#" />} variant="secondary">
          Documentation
        </Button>
      }
      description="Accédez à vos données depuis vos propres outils"
      title="API"
    >
      <SettingsSection
        action={
          <Button variant="ghost">
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
            <code className="rounded-full bg-muted px-3 py-1 font-mono text-sm">
              {apiKey.key}
            </code>
            <Button variant="destructive-outline">Révoquer</Button>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsSection
        action={
          <Button variant="ghost">
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
            title={<span className="font-mono text-sm">{hook.url}</span>}
          >
            <Badge variant={hook.status === "Actif" ? "success" : "error"}>
              {hook.status}
            </Badge>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsSection title="Utilisation ce mois-ci">
        <div className="p-5">
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
        action={<Button variant="ghost">Tout voir</Button>}
        title="Journal d'activité"
      >
        {audit.map((entry) => (
          <SettingsRow
            description={entry.time}
            key={entry.time}
            media={
              <Avatar className="size-10">
                <AvatarFallback className="font-semibold">
                  {entry.who
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            }
            title={
              <span className="font-normal">
                <span className="font-semibold">{entry.who}</span>{" "}
                {entry.action}
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
  const current = plans.find((plan) => plan.current)!
  const upgrades = plans.filter((plan) => !plan.current)
  return (
    <SettingsPage
      description="Votre offre, ce que vous utilisez et vos paiements"
      title="Abonnement"
    >
      <SettingsHero
        description={`${current.price} € par mois · ${current.features.join(" · ")}`}
        eyebrow="Votre offre"
        title={<span className="font-display text-5xl">{current.name}</span>}
      >
        <div className="grid gap-5 rounded-2xl bg-card p-5 sm:grid-cols-2">
          {usage.map((item) => (
            <Meter key={item.label} max={item.max} value={item.value}>
              <div className="flex items-center justify-between gap-2">
                <MeterLabel>{item.label}</MeterLabel>
                <MeterValue className="font-semibold">
                  {() =>
                    `${String(item.value).replace(".", ",")} / ${item.max}${item.unit ?? ""}`
                  }
                </MeterValue>
              </div>
              <MeterTrack>
                <MeterIndicator
                  className={cn(item.value / item.max >= 0.8 && "bg-warning")}
                />
              </MeterTrack>
            </Meter>
          ))}
        </div>
      </SettingsHero>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Passer à l&apos;offre supérieure
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {upgrades.map((plan) => {
            const pro = plan.name === "Pro"
            return (
              <div
                className={cn(
                  "flex flex-col gap-5 rounded-3xl p-6",
                  pro ? "bg-primary text-primary-foreground" : "border bg-card"
                )}
                key={plan.name}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-4xl">{plan.name}</p>
                  {pro && (
                    <span className="rounded-full bg-wise-forest px-3 py-1 text-sm font-semibold text-wise-green">
                      Recommandé
                    </span>
                  )}
                </div>
                <p>
                  <span className="text-3xl font-semibold">{plan.price} €</span>
                  <span
                    className={pro ? "opacity-80" : "text-muted-foreground"}
                  >
                    {" "}
                    / mois
                  </span>
                </p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li className="flex items-center gap-2" key={feature}>
                      <HugeiconsIcon
                        className="size-5 shrink-0"
                        icon={CheckmarkCircle02Icon}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "mt-auto",
                    pro &&
                      "bg-wise-forest text-wise-green hover:bg-wise-forest/90"
                  )}
                  size="lg"
                  variant={pro ? "default" : "secondary"}
                >
                  Passer à {plan.name}
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      <SettingsSection title="Paiement de l'abonnement">
        <SettingsRow
          description="Expire le 09/2028"
          media={<IconTile icon={CreditCardIcon} />}
          title="Visa •••• 4242"
        >
          <Button variant="secondary">Modifier</Button>
        </SettingsRow>
        <SettingsRow
          description="12 chemin des Coteaux, 33500 Libourne"
          media={<IconTile icon={Invoice01Icon} />}
          title="SARL Les Coteaux"
        >
          <Button variant="secondary">Modifier</Button>
        </SettingsRow>
      </SettingsSection>
      <SettingsSection title="Vos achats">
        {purchases.map((purchase) => (
          <SettingsRow
            description={purchase.date}
            key={purchase.date}
            media={<IconTile icon={Message01Icon} />}
            title={purchase.label}
          >
            <span className="font-semibold tabular-nums">
              {formatAmount(purchase.amount)}
            </span>
            <Button
              aria-label="Télécharger la facture"
              size="icon"
              variant="secondary"
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
          <Button variant="secondary">Importer un fichier</Button>
        </SettingsRow>
        <SettingsRow
          description="Planning et réservations à venir"
          media={<IconTile icon={Globe02Icon} />}
          title="Depuis un autre logiciel"
        >
          <Button variant="secondary">Choisir</Button>
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
            <Button variant="secondary">
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
