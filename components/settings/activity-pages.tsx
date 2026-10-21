"use client"

import {
  ArrowRight01Icon,
  Location01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ComponentType, useState } from "react"
import { ActivityMark, activityMeta } from "@/components/activity-mark"
import { groomingSteps, stock, waitlist } from "@/components/grooming/data"
import { kennels } from "@/components/pension/data"
import {
  Exceptions,
  PlaceTypes,
  PlacePrices,
  Simulator,
} from "@/components/periods/periods-pages"
import { ActivityOffers } from "@/components/services/activity-offers"
import { journeyOf, metierOf, useCatalog } from "@/components/services/data"
import { ActivityDot } from "@/components/services/service-form"
import { kennelLabel } from "@/components/pension/stay-sheet"
import {
  type ActivitySettings,
  findActivity,
  findLink,
  members,
} from "@/components/settings/data"
import {
  IconTile,
  LinkRow,
  options,
  type SettingsGroup,
  SettingsGroups,
  SettingsPage,
  SettingsRow,
  SettingsSection,
  WeeklyHours,
  weekHours,
} from "@/components/settings/settings-ui"
import { groups as trainingGroups } from "@/components/training/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type SectionProps = { activity: ActivitySettings }

const teamOf = (activity: ActivitySettings) =>
  members.filter((m) => m.activities.includes(activity.name))

const hoursText = ({ hours }: ActivitySettings) =>
  `${hours.label} · ${hours.from.replace(":00", "h")} – ${hours.to.replace(":00", "h")}`

const AddButton = ({ label }: { label: string }) => (
  <Button size="sm" variant="ghost">
    <HugeiconsIcon icon={PlusSignIcon} />
    {label}
  </Button>
)

/** Activité créée avec le formulaire : ses places et ses prestations. */
function CreatedActivityOverview({ id }: { id: string }) {
  const activity = useCatalog().activities.find((a) => a.id === id)
  const stay = journeyOf(activity) === "stay"
  if (!activity)
    return (
      <SettingsPage
        back={{ href: "/settings/activities", label: "Activités" }}
        description="Les activités créées pendant la démonstration disparaissent au rechargement."
        title="Activité introuvable"
      >
        {null}
      </SettingsPage>
    )
  return (
    <SettingsPage
      back={{ href: "/settings/activities", label: "Activités" }}
      description={[metierOf(activity.metier).label, activity.hours]
        .filter(Boolean)
        .join(" · ")}
      title={
        <>
          <ActivityDot activity={activity} className="size-7 rounded-md" />
          {activity.name}
        </>
      }
    >
      {stay && <PlaceTypes activityId={id} />}
      {stay && <PlacePrices activityId={id} />}
      <ActivityOffers
        activityId={id}
        title={stay ? "Options du séjour" : "Prestations principales"}
      />
      {stay && <Simulator activityId={id} />}
      <Exceptions activityId={id} />
    </SettingsPage>
  )
}

export function ActivityOverview({ slug }: { slug: string }) {
  const activity = findActivity(slug)
  if (!activity) return <CreatedActivityOverview id={slug} />
  return (
    <SettingsPage
      action={
        <Link
          className="flex items-center gap-1 text-sm font-medium hover:underline"
          href={activity.appHref}
        >
          Voir l&apos;activité
          <HugeiconsIcon className="size-4" icon={ArrowRight01Icon} />
        </Link>
      }
      back={{ href: "/settings/activities", label: "Activités" }}
      description={`Accessible à ${teamOf(activity).length} membres · ${hoursText(activity)}`}
      title={
        <>
          <ActivityMark activity={activity.name} className="size-7 text-xs" />
          {activity.name}
        </>
      }
    >
      {activity.groups.map((group, index) => (
        <SettingsSection key={group.title ?? index} title={group.title}>
          {group.links.map((link) => (
            <LinkRow
              {...link}
              href={`/settings/activities/${slug}/${link.slug}`}
              key={link.slug}
            />
          ))}
        </SettingsSection>
      ))}
    </SettingsPage>
  )
}

export function ActivitySection({
  slug,
  section,
}: {
  slug: string
  section: string
}) {
  const activity = findActivity(slug)
  const link = activity && findLink(activity, section)
  const Content = sectionContent[section]
  if (!activity || !link || !Content) return null
  return (
    <SettingsPage
      back={{ href: `/settings/activities/${slug}`, label: activity.name }}
      description={link.description}
      title={link.title}
    >
      <Content activity={activity} />
    </SettingsPage>
  )
}

/* ——— Sections communes ——— */

const colors = [
  "bg-emerald-800",
  "bg-violet-600",
  "bg-blue-700",
  "bg-orange-600",
  "bg-pink-600",
  "bg-zinc-700",
]

function ColorPicker({ initial }: { initial: string }) {
  const [color, setColor] = useState(initial)
  return (
    <div className="flex gap-1.5">
      {colors.map((c) => (
        <button
          aria-label={`Couleur ${c.replace("bg-", "")}`}
          aria-pressed={c === color}
          className={cn(
            "size-6 rounded-full ring-offset-2 ring-offset-background transition-shadow",
            c,
            c === color && "ring-2 ring-ring"
          )}
          key={c}
          onClick={() => setColor(c)}
          type="button"
        />
      ))}
    </div>
  )
}

const descriptions: Record<string, string> = {
  Éducation: "Cours collectifs, coaching individuel et balades éducatives.",
  Pension:
    "Pension pour chiens et chats, box avec courette et chatterie au calme.",
  Toilettage: "Salon de toilettage tous gabarits, bain, coupe et soins.",
}

function GeneralSection({ activity }: SectionProps) {
  const team = teamOf(activity)
  return (
    <SettingsGroups
      groups={[
        {
          settings: [
            { defaultValue: activity.name, title: "Nom", type: "input" },
            {
              defaultValue: activityMeta[activity.name].letter.replace(
                "É",
                "E"
              ),
              description: "Préfixe utilisé pour les numéros de facture",
              title: "Identifiant",
              type: "input",
            },
            {
              control: (
                <ColorPicker initial={activityMeta[activity.name].color} />
              ),
              title: "Couleur",
              type: "custom",
            },
            {
              defaultValue: team[team.length > 1 ? 1 : 0].name,
              description: "Reçoit les demandes et valide les réservations",
              items: options(...team.map((m) => m.name)),
              title: "Responsable",
              type: "select",
            },
            {
              defaultValue: descriptions[activity.name],
              description: "Affichée sur le portail client",
              title: "Description",
              type: "textarea",
            },
          ],
        },
        {
          settings: [
            {
              defaultValue: "Tous les membres",
              items: options("Tous les membres", "Membres de l'activité"),
              title: "Visible par",
              type: "select",
            },
            {
              defaultChecked: true,
              description: "Les clients peuvent réserver depuis le portail",
              title: "Réservation en ligne",
              type: "switch",
            },
          ],
          title: "Accès",
        },
        {
          settings: [
            {
              description: "Masque l'activité sans supprimer son historique",
              label: "Archiver",
              title: "Archiver l'activité",
              type: "button",
              variant: "destructive-outline",
            },
          ],
          title: "Zone de danger",
        },
      ]}
    />
  )
}

const activityRoles = ["Responsable", "Membre", "Lecture seule"]

function MembersSection({ activity }: SectionProps) {
  const team = teamOf(activity)
  const others = members.filter((m) => !team.includes(m))
  return (
    <>
      <SettingsSection
        action={<AddButton label="Ajouter" />}
        title={`${team.length} membres`}
      >
        {team.map((member, index) => (
          <SettingsRow
            description={member.job}
            key={member.email}
            media={
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            }
            title={member.name}
          >
            <Select
              defaultValue={
                member.role === "Propriétaire" || index === 1
                  ? "Responsable"
                  : "Membre"
              }
              items={options(...activityRoles)}
            >
              <SelectTrigger
                aria-label={`Rôle de ${member.name}`}
                className="w-fit min-w-0"
                size="sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {activityRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsSection title="Autres membres de l'organisation">
        {others.map((member) => (
          <SettingsRow
            description={member.job}
            key={member.email}
            media={
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            }
            title={member.name}
          >
            <Button size="sm" variant="outline">
              Ajouter
            </Button>
          </SettingsRow>
        ))}
      </SettingsSection>
    </>
  )
}

function HoursSection({ activity }: SectionProps) {
  const { days, from, to } = activity.hours
  const pension = activity.name === "Pension"
  return (
    <>
      <SettingsSection
        description={
          pension
            ? "Horaires d'accueil pour les arrivées et départs"
            : undefined
        }
        title="Semaine type"
      >
        <WeeklyHours initial={weekHours(days, from, to)} />
      </SettingsSection>
      <Exceptions activityId={activity.slug} />
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultChecked: pension,
                title: "Ouvert les jours fériés",
                type: "switch",
              },
              {
                defaultChecked: true,
                description:
                  "Les créneaux fermés n'apparaissent plus sur le portail",
                title: "Bloquer les réservations pendant les fermetures",
                type: "switch",
              },
            ],
            title: "Règles",
          },
        ]}
      />
    </>
  )
}

const notificationEvents: Record<string, string[]> = {
  Éducation: [
    "Inscription à un cours collectif",
    "Cours complet",
    "Forfait bientôt terminé",
    "Compte-rendu non envoyé le soir",
  ],
  Pension: [
    "Nouvelle demande de séjour",
    "Arrivée en retard de plus de 30 min",
    "Traitement non validé",
    "Départ avec un solde impayé",
  ],
  Toilettage: [
    "Nouveau rendez-vous en ligne",
    "Annulation de dernière minute",
    "Client absent",
    "Produit sous le seuil d'alerte",
  ],
}

function NotificationsSection({ activity }: SectionProps) {
  return (
    <SettingsGroups
      groups={[
        {
          settings: notificationEvents[activity.name].map((title) => ({
            defaultChecked: true,
            title,
            type: "switch" as const,
          })),
          title: "Événements",
        },
        {
          settings: [
            {
              defaultValue: "Membres de l'activité",
              items: options(
                "Membres de l'activité",
                "Responsable uniquement",
                "Tous les membres"
              ),
              title: "Destinataires",
              type: "select",
            },
            {
              defaultValue: "Messages",
              description: "Canal partagé où les alertes sont publiées",
              items: options("Messages", "Aucun"),
              title: "Fil d'équipe",
              type: "select",
            },
          ],
          title: "Diffusion",
        },
      ]}
    />
  )
}

/* ——— Pension ——— */

const kennelSize = (id: string) => {
  if (id.startsWith("c")) return "Chat"
  const n = Number(id.slice(1))
  return n <= 8 ? "Petit gabarit" : n <= 16 ? "Moyen gabarit" : "Grand gabarit"
}

const kennelFeature = (id: string) =>
  id.startsWith("c")
    ? "Arbre à chat · fenêtre"
    : Number(id.slice(1)) <= 10
      ? "Courette privée"
      : "Intérieur chauffé"

function KennelsSection() {
  const [area, setArea] = useState("Chenil")
  const list = kennels.filter((k) => k.area === area)
  return (
    <>
      <PlaceTypes activityId="pension" />
      <SettingsSection
        action={
          <div className="flex items-center gap-2">
            <Tabs
              onValueChange={(value) => setArea(String(value))}
              value={area}
            >
              <TabsList size="sm">
                <TabsTab value="Chenil">Chenil · 20</TabsTab>
                <TabsTab value="Chatterie">Chatterie · 4</TabsTab>
              </TabsList>
            </Tabs>
            <AddButton label="Ajouter" />
          </div>
        }
        title="Emplacements"
      >
        {list.map((kennel) => (
          <SettingsRow
            description={`${kennelSize(kennel.id)} · ${kennelFeature(kennel.id)}`}
            key={kennel.id}
            title={kennelLabel(kennel.id)}
          >
            {kennel.status === "cleaning" && (
              <Badge variant="warning">Nettoyage</Badge>
            )}
            {kennel.pet && (
              <span className="text-xs text-muted-foreground">
                Occupé · {kennel.pet}
              </span>
            )}
            <Switch
              aria-label={`${kennelLabel(kennel.id)} réservable`}
              defaultChecked
            />
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            description: "Poids maximum pour chaque taille de box",
            settings: [
              {
                defaultValue: 10,
                title: "Petit gabarit",
                type: "number",
                unit: "kg",
              },
              {
                defaultValue: 25,
                title: "Moyen gabarit",
                type: "number",
                unit: "kg",
              },
              {
                defaultChecked: true,
                description:
                  "Un animal de la même famille peut partager un grand box",
                title: "Box partagé",
                type: "switch",
              },
            ],
            title: "Gabarits",
          },
        ]}
      />
    </>
  )
}

const pensionGroups: Record<string, SettingsGroup[]> = {
  booking: [
    {
      settings: [
        {
          defaultValue: 30,
          description: "Payé en ligne à la confirmation",
          title: "Acompte",
          type: "number",
          unit: "%",
        },
        {
          defaultChecked: true,
          description:
            "Chaque demande est validée par l'équipe avant confirmation",
          title: "Validation manuelle",
          type: "switch",
        },
      ],
      title: "Réservation",
    },
    {
      settings: [
        {
          defaultValue: 7,
          description: "Avant la date d'arrivée",
          title: "Annulation gratuite jusqu'à",
          type: "number",
          unit: "jours",
        },
        {
          defaultValue: "Avoir sur le prochain séjour",
          items: options(
            "Avoir sur le prochain séjour",
            "Remboursement",
            "Conservé"
          ),
          title: "Acompte en cas d'annulation tardive",
          type: "select",
        },
        {
          defaultValue: "Facturé",
          items: options("Facturé", "Remboursé"),
          title: "Départ anticipé",
          type: "select",
        },
      ],
      title: "Annulation",
    },
  ],
  care: [
    {
      settings: [
        {
          defaultValue: "8h00 · 18h00",
          title: "Heures des repas",
          type: "input",
        },
        {
          defaultChecked: true,
          description:
            "Croquettes de la pension si le propriétaire n'en fournit pas",
          title: "Alimentation fournie",
          type: "switch",
        },
        {
          defaultChecked: true,
          description: "Pour les séjours de plus de 7 nuits",
          title: "Pesée hebdomadaire",
          type: "switch",
        },
      ],
      title: "Repas",
    },
    {
      settings: [
        {
          defaultValue: "4",
          items: options("2", "3", "4", "5"),
          title: "Sorties par jour",
          type: "select",
        },
        {
          defaultValue: 20,
          title: "Durée d'une sortie",
          type: "number",
          unit: "min",
        },
        {
          defaultChecked: true,
          description: "Les chiens sociables sortent en petits groupes",
          title: "Sorties en groupe",
          type: "switch",
        },
      ],
      title: "Sorties",
    },
    {
      settings: [
        {
          defaultChecked: true,
          description: "Un second membre confirme chaque prise de médicament",
          title: "Double validation",
          type: "switch",
        },
        {
          defaultValue: 30,
          description: "Après l'heure prévue",
          title: "Alerte si non validé",
          type: "number",
          unit: "min",
        },
      ],
      title: "Traitements",
    },
    {
      settings: [
        {
          defaultChecked: true,
          title: "Nettoyage quotidien des box",
          type: "switch",
        },
        {
          defaultChecked: true,
          description: "Le box passe en « Nettoyage » après chaque départ",
          title: "Désinfection au départ",
          type: "switch",
        },
        {
          defaultValue: "Virucide écologique",
          items: options("Virucide écologique", "Javel diluée", "Vapeur"),
          title: "Produit",
          type: "select",
        },
      ],
      title: "Ménage",
    },
  ],
  "check-in": [
    {
      settings: [
        {
          defaultValue: "8h – 12h · 14h – 19h",
          title: "Créneaux d'arrivée",
          type: "input",
        },
        {
          defaultValue: "11h00",
          items: options("10h00", "11h00", "12h00"),
          title: "Départ avant",
          type: "select",
        },
        {
          defaultValue: 12,
          description: "Facturé après l'heure de départ",
          title: "Supplément départ tardif",
          type: "number",
          unit: "€",
        },
        {
          defaultValue: "Matin uniquement",
          items: options("Fermé", "Matin uniquement", "Toute la journée"),
          title: "Dimanche",
          type: "select",
        },
      ],
      title: "Horaires",
    },
    {
      settings: [
        {
          defaultChecked: true,
          title: "Vérifier le carnet de vaccination",
          type: "switch",
        },
        { defaultChecked: true, title: "Peser l'animal", type: "switch" },
        {
          defaultChecked: true,
          description: "Envoyée au propriétaire avec la confirmation d'arrivée",
          title: "Photo d'arrivée",
          type: "switch",
        },
        {
          defaultChecked: true,
          description: "Le solde est encaissé au moment du départ",
          title: "Encaisser le solde au départ",
          type: "switch",
        },
      ],
      title: "Accueil",
    },
  ],
  documents: [
    {
      description: "Demandés au client lors de la réservation",
      settings: [
        {
          defaultChecked: true,
          description: "CHPPiL, rage et toux du chenil à jour",
          title: "Carnet de vaccination",
          type: "switch",
        },
        {
          defaultChecked: true,
          description: "Puce électronique ou tatouage",
          title: "Identification I-CAD",
          type: "switch",
        },
        {
          defaultChecked: true,
          description: "Traitement de moins d'un mois",
          title: "Antiparasitaire",
          type: "switch",
        },
        {
          description: "Responsabilité civile du propriétaire",
          title: "Attestation d'assurance",
          type: "switch",
        },
      ],
      title: "Documents",
    },
    {
      settings: [
        {
          defaultChecked: true,
          description: "La demande reste en attente tant qu'un document manque",
          title: "Bloquer la confirmation",
          type: "switch",
        },
        {
          defaultValue: 7,
          description: "Rappel envoyé si un document manque",
          title: "Rappel avant l'arrivée",
          type: "number",
          unit: "jours",
        },
      ],
      title: "Contrôle",
    },
  ],
  news: [
    {
      settings: [
        {
          defaultChecked: true,
          title: "Nouvelles quotidiennes",
          type: "switch",
        },
        {
          defaultValue: "18h00",
          items: options("12h00", "18h00", "20h00"),
          title: "Heure d'envoi",
          type: "select",
        },
        {
          defaultValue: "E-mail",
          items: options("E-mail", "SMS", "E-mail et SMS"),
          title: "Canal",
          type: "select",
        },
        {
          defaultValue: 2,
          title: "Photos par jour",
          type: "number",
          unit: "photos",
        },
      ],
      title: "Envoi",
    },
    {
      settings: [
        { defaultChecked: true, title: "Repas", type: "switch" },
        { defaultChecked: true, title: "Sorties et jeux", type: "switch" },
        { defaultChecked: true, title: "Humeur", type: "switch" },
        { defaultChecked: true, title: "Soins et traitements", type: "switch" },
      ],
      title: "Contenu",
    },
  ],
  rates: [
    {
      settings: [
        {
          defaultValue: 10,
          description: "À partir de 14 nuits",
          title: "Long séjour",
          type: "number",
          unit: "%",
        },
        {
          defaultValue: 15,
          description: "Sur le deuxième animal du même foyer",
          title: "Deuxième animal",
          type: "number",
          unit: "%",
        },
      ],
      title: "Remises",
    },
  ],
}

function RatesSection() {
  return (
    <>
      <PlacePrices activityId="pension" />
      <ActivityOffers activityId="pension" title="Options du séjour" />
      <SettingsGroups groups={pensionGroups.rates} />
      <Simulator activityId="pension" />
    </>
  )
}

/* ——— Toilettage ——— */

function ServicesSection() {
  return (
    <>
      <ActivityOffers activityId="grooming" />
      <SettingsGroups
        groups={[
          {
            description: "Utilisés par la grille de prix du catalogue",
            settings: [
              {
                defaultValue: 10,
                title: "Petit gabarit jusqu'à",
                type: "number",
                unit: "kg",
              },
              {
                defaultValue: 25,
                title: "Moyen gabarit jusqu'à",
                type: "number",
                unit: "kg",
              },
            ],
            title: "Gabarits",
          },
        ]}
      />
    </>
  )
}

const stepDetails: Record<string, string> = {
  Accueil: "Pesée, état du pelage et consignes du propriétaire",
  Bain: "Shampoing adapté au pelage",
  Coupe: "Tonte, ciseaux ou épilation",
  Finitions: "Griffes, oreilles et parfum",
  Séchage: "Soufflerie puis brossage",
}

function StepsSection() {
  return (
    <>
      <SettingsSection
        action={<AddButton label="Ajouter une étape" />}
        title="Étapes"
      >
        {groomingSteps.map((step, i) => (
          <SettingsRow
            description={stepDetails[step]}
            key={step}
            media={
              <span className="flex size-8 items-center justify-center rounded-lg bg-violet-600/10 text-sm font-semibold text-violet-700 dark:text-violet-300">
                {i + 1}
              </span>
            }
            title={step}
          >
            {step === "Finitions" && <Badge variant="info">SMS « prêt »</Badge>}
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultChecked: true,
                description: "Envoyé à la fin des finitions",
                title: "SMS « prêt à récupérer »",
                type: "switch",
              },
              {
                defaultChecked: true,
                description: "Ajoutées à la fiche de l'animal",
                title: "Photos avant / après",
                type: "switch",
              },
              {
                description: "Le client suit les étapes en direct",
                title: "Suivi en temps réel",
                type: "switch",
              },
            ],
            title: "Client",
          },
        ]}
      />
    </>
  )
}

function WaitlistSection() {
  return (
    <>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultChecked: true,
                title: "Liste d'attente",
                type: "switch",
              },
              {
                defaultChecked: true,
                description: "Un SMS est envoyé dès qu'un créneau se libère",
                title: "Proposer automatiquement",
                type: "switch",
              },
              {
                defaultValue: "2 h",
                items: options("30 min", "1 h", "2 h", "24 h"),
                title: "Délai de réponse",
                type: "select",
              },
              {
                defaultValue: "Ancienneté",
                items: options("Ancienneté", "Clients fidèles d'abord"),
                title: "Priorité",
                type: "select",
              },
            ],
            title: "Fonctionnement",
          },
        ]}
      />
      <SettingsSection title="En attente aujourd'hui">
        {waitlist.map((entry) => (
          <SettingsRow
            description={`${entry.owner} · ${entry.request}`}
            key={entry.id}
            media={
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">
                  {entry.initials}
                </AvatarFallback>
              </Avatar>
            }
            title={entry.pet}
          >
            <Badge variant="outline">Souhaite {entry.slot}</Badge>
          </SettingsRow>
        ))}
      </SettingsSection>
    </>
  )
}

function ProductsSection() {
  return (
    <>
      <SettingsSection
        action={<AddButton label="Ajouter" />}
        description="Une alerte est envoyée sous le seuil"
        title="Stock"
      >
        {stock.map((item) => (
          <SettingsRow
            description={`Niveau actuel ${item.level} %`}
            key={item.label}
            title={item.label}
          >
            {item.level < 25 && <Badge variant="warning">À commander</Badge>}
            <Input
              aria-label={`Seuil d'alerte ${item.label}`}
              className="w-20"
              defaultValue="25 %"
              size="sm"
            />
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultChecked: true,
                description: "Shampoings, accessoires et friandises",
                title: "Vente au comptoir",
                type: "switch",
              },
              {
                defaultValue: 40,
                title: "Marge par défaut",
                type: "number",
                unit: "%",
              },
            ],
            title: "Ventes",
          },
        ]}
      />
    </>
  )
}

const groomingGroups: Record<string, SettingsGroup[]> = {
  agenda: [
    {
      settings: [
        {
          defaultValue: "15 min",
          items: options("10 min", "15 min", "30 min"),
          title: "Durée d'un créneau",
          type: "select",
        },
        {
          defaultValue: 10,
          description: "Nettoyage du poste entre deux animaux",
          title: "Battement",
          type: "number",
          unit: "min",
        },
        {
          defaultValue: 2,
          description: "Rendez-vous simultanés possibles",
          title: "Postes de toilettage",
          type: "number",
          unit: "postes",
        },
        {
          defaultValue: 8,
          title: "Rendez-vous par jour",
          type: "number",
          unit: "max",
        },
        {
          defaultValue: "12h30 – 13h30",
          title: "Pause déjeuner",
          type: "input",
        },
      ],
      title: "Créneaux",
    },
    {
      settings: [
        {
          defaultValue: "24 h",
          items: options("2 h", "24 h", "48 h"),
          title: "Réservation au plus tard",
          type: "select",
        },
        {
          defaultChecked: true,
          description: "Les nouveaux clients passent par une demande",
          title: "Valider les nouveaux clients",
          type: "switch",
        },
      ],
      title: "En ligne",
    },
  ],
  reminders: [
    {
      settings: [
        { defaultChecked: true, title: "Rappel par SMS", type: "switch" },
        {
          defaultValue: "24 h avant",
          items: options("2 h avant", "24 h avant", "48 h avant"),
          title: "Envoi",
          type: "select",
        },
        {
          defaultChecked: true,
          description: "Le client répond OUI pour confirmer",
          title: "Demander une confirmation",
          type: "switch",
        },
      ],
      title: "Rappels",
    },
    {
      settings: [
        {
          defaultValue: 24,
          title: "Annulation gratuite jusqu'à",
          type: "number",
          unit: "h avant",
        },
        {
          defaultValue: "50 % de la prestation",
          items: options(
            "Rien",
            "50 % de la prestation",
            "Prestation complète"
          ),
          title: "Absence facturée",
          type: "select",
        },
        {
          defaultValue: 2,
          description: "La réservation en ligne est alors bloquée",
          title: "Absences avant blocage",
          type: "number",
          unit: "absences",
        },
      ],
      title: "Annulations & absences",
    },
  ],
}

/* ——— Éducation ——— */

function PackagesSection() {
  return (
    <>
      <ActivityOffers activityId="training" />
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultValue: "6 mois",
                items: options("3 mois", "6 mois", "1 an"),
                title: "Validité d'un forfait",
                type: "select",
              },
              {
                defaultChecked: true,
                description: "Échéancier en 3 versements",
                title: "Paiement en plusieurs fois",
                type: "switch",
              },
              {
                defaultValue: 24,
                description: "Au-delà, la séance est décomptée",
                title: "Report gratuit jusqu'à",
                type: "number",
                unit: "h avant",
              },
              {
                defaultValue: 2,
                description: "Propose le renouvellement au propriétaire",
                title: "Alerte de fin de forfait",
                type: "number",
                unit: "séances",
              },
            ],
            title: "Règles",
          },
        ]}
      />
    </>
  )
}

function GroupsSection() {
  return (
    <>
      <SettingsSection
        action={<AddButton label="Nouveau cours" />}
        title="Cours"
      >
        {trainingGroups.map((group) => (
          <SettingsRow
            description={`${group.age} · ${group.schedule} · ${group.place}`}
            key={group.id}
            title={group.name}
          >
            <span className="text-xs text-muted-foreground">{group.price}</span>
            <Badge
              variant={
                group.members.length >= group.capacity - 1
                  ? "warning"
                  : "outline"
              }
            >
              {group.members.length}/{group.capacity}
            </Badge>
          </SettingsRow>
        ))}
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultValue: 8,
                title: "Capacité par défaut",
                type: "number",
                unit: "chiens",
              },
              {
                defaultValue: 3,
                description: "Le cours est annulé et les inscrits prévenus",
                title: "Minimum d'inscrits",
                type: "number",
                unit: "chiens",
              },
              {
                defaultChecked: true,
                description: "La première séance est offerte",
                title: "Séance d'essai",
                type: "switch",
              },
              {
                defaultChecked: true,
                description: "Une place libérée est proposée au suivant",
                title: "Liste d'attente automatique",
                type: "switch",
              },
            ],
            title: "Règles",
          },
        ]}
      />
    </>
  )
}

const places = [
  { detail: "Clôturé · 1 500 m² · abri", name: "Terrain A" },
  { detail: "Parcours d'agility complet", name: "Terrain B · agility" },
  { detail: "Balades éducatives en groupe", name: "Bois des Coteaux" },
]

function PlacesSection() {
  return (
    <>
      <SettingsSection action={<AddButton label="Ajouter" />} title="Lieux">
        {places.map((place) => (
          <SettingsRow
            description={place.detail}
            key={place.name}
            media={<IconTile icon={Location01Icon} />}
            title={place.name}
          />
        ))}
      </SettingsSection>
      <SettingsGroups
        groups={[
          {
            settings: [
              {
                defaultChecked: true,
                title: "Séances à domicile",
                type: "switch",
              },
              {
                defaultValue: 20,
                description: "Autour de Libourne",
                title: "Zone d'intervention",
                type: "number",
                unit: "km",
              },
              {
                defaultValue: 0.5,
                description: "Au-delà de 5 km",
                title: "Frais de déplacement",
                type: "number",
                unit: "€ / km",
              },
            ],
            title: "À domicile",
          },
        ]}
      />
    </>
  )
}

const skills = [
  "Rappel",
  "Marche en laisse",
  "Assis · couché",
  "Pas bouger",
  "Sociabilité avec les chiens",
  "Sociabilité avec les humains",
  "Gestion de la frustration",
  "Propreté",
]

const trainingGroupsSettings: Record<string, SettingsGroup[]> = {
  reports: [
    {
      settings: [
        { defaultChecked: true, title: "Envoi automatique", type: "switch" },
        {
          defaultValue: "Le soir à 20h",
          items: options("Juste après la séance", "Le soir à 20h"),
          title: "Moment d'envoi",
          type: "select",
        },
        {
          defaultValue: "E-mail",
          items: options("E-mail", "SMS avec lien"),
          title: "Canal",
          type: "select",
        },
      ],
      title: "Envoi",
    },
    {
      settings: [
        { defaultChecked: true, title: "Exercices travaillés", type: "switch" },
        {
          defaultChecked: true,
          title: "Progression par compétence",
          type: "switch",
        },
        { defaultChecked: true, title: "Devoirs à la maison", type: "switch" },
        { title: "Vidéos de la séance", type: "switch" },
        {
          defaultValue:
            "Bonjour {propriétaire},\n\nVoici le compte-rendu de la séance de {chien} :\n\n{exercices}\n\nÀ travailler d'ici la prochaine fois : {devoirs}",
          title: "Modèle",
          type: "textarea",
        },
      ],
      title: "Contenu",
    },
  ],
  skills: [
    {
      settings: skills.map((title) => ({
        defaultChecked: true,
        title,
        type: "switch" as const,
      })),
      title: "Compétences",
    },
    {
      settings: [
        {
          defaultValue: "1 à 5",
          items: options("1 à 5", "1 à 10", "Acquis / en cours"),
          title: "Échelle",
          type: "select",
        },
        {
          defaultChecked: true,
          description: "Visible dans les comptes-rendus",
          title: "Partager la progression",
          type: "switch",
        },
      ],
      title: "Évaluation",
    },
  ],
}

const fromGroups = (groups: SettingsGroup[]) =>
  function GroupsContent() {
    return <SettingsGroups groups={groups} />
  }

const sectionContent: Record<string, ComponentType<SectionProps>> = {
  agenda: fromGroups(groomingGroups.agenda),
  booking: fromGroups(pensionGroups.booking),
  care: fromGroups(pensionGroups.care),
  "check-in": fromGroups(pensionGroups["check-in"]),
  documents: fromGroups(pensionGroups.documents),
  general: GeneralSection,
  groups: GroupsSection,
  hours: HoursSection,
  kennels: KennelsSection,
  members: MembersSection,
  news: fromGroups(pensionGroups.news),
  notifications: NotificationsSection,
  packages: PackagesSection,
  places: PlacesSection,
  products: ProductsSection,
  rates: RatesSection,
  reminders: fromGroups(groomingGroups.reminders),
  reports: fromGroups(trainingGroupsSettings.reports),
  services: ServicesSection,
  skills: fromGroups(trainingGroupsSettings.skills),
  steps: StepsSection,
  waitlist: WaitlistSection,
}
