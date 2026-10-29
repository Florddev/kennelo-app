import {
  Album02Icon,
  Calendar03Icon,
  Call02Icon,
  HelpCircleIcon,
  Image01Icon,
  LayoutBottomIcon,
  LayoutTopIcon,
  QuoteDownIcon,
  SparklesIcon,
  Tag01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import {
  type Kind,
  kit,
  type Node,
  type Props,
  venue,
} from "@/components/editor/kit"

/* ——— Blocs prêts à l'emploi : des compositions des éléments du registre ——— */

let seq = 0
export const uid = () => `n${++seq}`

/** Crée un élément avec ses valeurs par défaut. */
export const n = (type: Kind, props: Props = {}, children?: Node[]): Node => ({
  children: kit[type].slot ? (children ?? []) : undefined,
  id: uid(),
  props: { ...kit[type].defaults, ...props },
  type,
})

/** Copie avec de nouveaux identifiants. */
export const clone = (node: Node): Node => ({
  ...node,
  children: node.children?.map(clone),
  id: uid(),
})

const section = (props: Props, ...children: Node[]) =>
  n("section", props, children)
const grid = (props: Props, ...children: Node[]) => n("grid", props, children)
const column = (props: Props, ...children: Node[]) =>
  n("column", props, children)
const title = (text: string, props: Props = {}) =>
  n("heading", { text, ...props })
const para = (text: string, props: Props = {}) =>
  n("text", { muted: "true", size: "l", text, ...props })

export type Preset = {
  id: string
  label: string
  description: string
  build: () => Node
}

export type Category = {
  id: string
  label: string
  description: string
  icon: IconSvgElement
  tone: string
  presets: Preset[]
}

const faqs = [
  [
    "Acceptez-vous les chiots ?",
    "Oui, dès 3 mois et avec ses premiers vaccins.",
  ],
  [
    "Quels vaccins sont demandés ?",
    "CHPPiL et toux du chenil pour les chiens, typhus et coryza pour les chats.",
  ],
  [
    "Puis-je apporter ses croquettes ?",
    "Bien sûr, on garde ses habitudes pour éviter les soucis de digestion.",
  ],
  [
    "Recevrai-je des nouvelles ?",
    "Des photos et un petit mot chaque jour sur Kennelo.",
  ],
]

export const categories: Category[] = [
  {
    description: "Logo, menu et bouton de réservation",
    icon: LayoutTopIcon,
    id: "header",
    label: "En-tête",
    presets: [
      {
        build: () => n("navbar"),
        description: "Logo, liens et bouton Réserver",
        id: "header-cta",
        label: "Menu et réservation",
      },
      {
        build: () => n("navbar", { cta: "false" }),
        description: "Le menu seul",
        id: "header-simple",
        label: "Menu simple",
      },
      {
        build: () => n("navbar", { layout: "centered", tone: "accent" }),
        description: "Logo au centre, sur la couleur du site",
        id: "header-centered",
        label: "Centré en couleur",
      },
    ],
    tone: "bg-wise-blue text-wise-charcoal",
  },
  {
    description: "Le haut de la page d'accueil",
    icon: Image01Icon,
    id: "hero",
    label: "Bannière",
    presets: [
      {
        build: () =>
          section(
            { tone: "accent" },
            grid(
              { align: "center", columns: "2", gap: "l" },
              column(
                { gap: "l" },
                title("Des vacances heureuses au cœur des vignes"),
                para(venue.about),
                n("button"),
                n("rating", { style: "compact" })
              ),
              n("image", { ratio: "portrait" })
            )
          ),
        description: "Titre, texte et bouton, photo à droite",
        id: "hero-photo",
        label: "Photo à droite",
      },
      {
        build: () =>
          section(
            { padding: "l", tone: "cream", width: "narrow" },
            column(
              { align: "center", gap: "l" },
              title("Des vacances heureuses pour votre animal", {
                align: "center",
                size: "xl",
              }),
              para("Réservez en quelques clics, on s'occupe du reste.", {
                align: "center",
              }),
              n("booking", { style: "bar" })
            )
          ),
        description: "Grand titre et barre de réservation",
        id: "hero-booking",
        label: "Centré avec réservation",
      },
      {
        build: () =>
          section(
            {},
            grid(
              { align: "center", columns: "2", gap: "l" },
              column(
                { gap: "l" },
                title(venue.name, { size: "xl" }),
                para(venue.tagline),
                n("button")
              ),
              n("gallery", { count: "5" })
            )
          ),
        description: "Titre à gauche, mosaïque de photos",
        id: "hero-gallery",
        label: "Mosaïque",
      },
    ],
    tone: "bg-wise-orange text-wise-maroon",
  },
  {
    description: "Votre histoire et vos atouts",
    icon: SparklesIcon,
    id: "about",
    label: "Présentation",
    presets: [
      {
        build: () =>
          section(
            {},
            title(`Pourquoi ${venue.name} ?`),
            grid(
              { columns: "4" },
              ...venue.highlights.map((h, i) =>
                n("feature", {
                  icon: ["home", "shield", "camera", "heart"][i],
                  text: "On vous explique tout à l'arrivée.",
                  title: h,
                })
              )
            )
          ),
        description: "Quatre atouts avec une icône",
        id: "about-features",
        label: "Atouts en grille",
      },
      {
        build: () =>
          section(
            {},
            grid(
              { align: "center", columns: "2", gap: "l" },
              n("image", { ratio: "square", src: venue.photos[1] }),
              column(
                {},
                title("Notre histoire", { size: "m" }),
                para(venue.about),
                n("button", { label: "Nous écrire", style: "secondary" })
              )
            )
          ),
        description: "Une photo et votre histoire",
        id: "about-story",
        label: "Texte et photo",
      },
      {
        build: () =>
          section(
            { tone: "dark" },
            grid(
              { columns: "3" },
              n("stat", { label: "de parcs clôturés", value: "2 ha" }),
              n("stat", { label: "animaux accueillis", value: "1 200" }),
              n("stat", {
                label: "d'expérience",
                value: `${2026 - venue.since} ans`,
              })
            )
          ),
        description: "Trois chiffres sur fond foncé",
        id: "about-stats",
        label: "Chiffres clés",
      },
    ],
    tone: "bg-wise-yellow text-wise-gold",
  },
  {
    description: "Vos prix, repris du catalogue",
    icon: Tag01Icon,
    id: "prices",
    label: "Prestations et tarifs",
    presets: [
      {
        build: () =>
          section(
            { width: "narrow" },
            title("Prestations et prix", { size: "m" }),
            para(
              "Tarifs indicatifs, le prix exact est calculé à la réservation."
            ),
            n("prices")
          ),
        description: "La liste de vos prix, toujours à jour",
        id: "prices-list",
        label: "Grille tarifaire",
      },
      {
        build: () =>
          section(
            { tone: "cream" },
            title("Nos formules", { size: "m" }),
            grid(
              { columns: "3" },
              n("service", {
                description: "Box, 2 sorties par jour",
                price: "22",
                title: "Essentielle",
              }),
              n("service", {
                highlight: "true",
                price: "28",
                title: "Confort",
              }),
              n("service", {
                description: "Chambre, câlins et photos",
                price: "36",
                title: "Suite",
              })
            )
          ),
        description: "Trois formules, une mise en avant",
        id: "prices-cards",
        label: "Cartes de formules",
      },
      {
        build: () =>
          section(
            {},
            grid(
              { align: "center", columns: "2", gap: "l" },
              column(
                {},
                title("Le toilettage", { size: "m" }),
                para("Bain, coupe et griffes, avec des produits doux.")
              ),
              n("service", {
                activity: "Toilettage",
                description: "Bain, séchage, coupe",
                highlight: "true",
                price: "45",
                title: "Toilettage complet",
                unit: "",
              })
            )
          ),
        description: "Un texte et une prestation phare",
        id: "prices-single",
        label: "Prestation phare",
      },
    ],
    tone: "bg-wise-green text-wise-forest",
  },
  {
    description: "Réservation en ligne Kennelo",
    icon: Calendar03Icon,
    id: "booking",
    label: "Réservation",
    presets: [
      {
        build: () =>
          section(
            { tone: "cream" },
            grid(
              { align: "center", columns: "2-1", gap: "l" },
              column(
                {},
                title("Réservez en 2 minutes", { size: "m" }),
                para(
                  "Choisissez vos dates, payez en ligne, recevez la confirmation tout de suite."
                ),
                n("feature", {
                  icon: "clock",
                  text: "Gratuite jusqu'à 48 h avant l'arrivée.",
                  title: "Annulation flexible",
                })
              ),
              n("booking")
            )
          ),
        description: "Texte et carte de réservation",
        id: "booking-card",
        label: "Carte de réservation",
      },
      {
        build: () =>
          section(
            { tone: "accent" },
            title("Quand partez-vous ?", { size: "m" }),
            n("booking", { style: "bar" })
          ),
        description: "Dates et disponibilités sur une ligne",
        id: "booking-bar",
        label: "Barre de dates",
      },
      {
        build: () =>
          section(
            { tone: "dark", width: "narrow" },
            column(
              { align: "center", gap: "l" },
              title("On garde une place pour lui ?", { align: "center" }),
              para("Les vacances scolaires partent vite.", { align: "center" }),
              n("booking", { style: "button" })
            )
          ),
        description: "Un appel à réserver, centré",
        id: "booking-cta",
        label: "Appel à réserver",
      },
    ],
    tone: "bg-wise-pink text-wise-purple",
  },
  {
    description: "Vos avis vérifiés Kennelo",
    icon: QuoteDownIcon,
    id: "reviews",
    label: "Avis",
    presets: [
      {
        build: () =>
          section(
            { tone: "cream" },
            title("Ils nous font confiance", { size: "m" }),
            grid(
              { columns: "1-2" },
              n("rating"),
              grid(
                { columns: "2" },
                n("review", { surface: "white" }),
                n("review", { pick: "1", surface: "white" })
              )
            )
          ),
        description: "Votre note et deux avis",
        id: "reviews-summary",
        label: "Note et avis",
      },
      {
        build: () =>
          section(
            {},
            title("Ce qu'ils en disent", { size: "m" }),
            grid(
              { columns: "3" },
              n("review"),
              n("review", { pick: "1" }),
              n("review", { pick: "3" })
            )
          ),
        description: "Trois avis côte à côte",
        id: "reviews-grid",
        label: "Grille d'avis",
      },
      {
        build: () =>
          section(
            { padding: "l", tone: "accent" },
            n("review", { style: "quote" })
          ),
        description: "Un avis en grand",
        id: "reviews-quote",
        label: "Grande citation",
      },
    ],
    tone: "bg-wise-yellow text-wise-gold",
  },
  {
    description: "Vos photos Kennelo",
    icon: Album02Icon,
    id: "gallery",
    label: "Galerie",
    presets: [
      {
        build: () =>
          section({}, title("En images", { size: "m" }), n("gallery")),
        description: "Une grande photo et quatre petites",
        id: "gallery-mosaic",
        label: "Mosaïque",
      },
      {
        build: () => section({}, n("gallery", { count: "6", layout: "grid" })),
        description: "Photos carrées en grille",
        id: "gallery-grid",
        label: "Grille",
      },
      {
        build: () =>
          section(
            { tone: "cream", width: "full" },
            n("gallery", { count: "6", layout: "strip" })
          ),
        description: "Une rangée de portraits",
        id: "gallery-strip",
        label: "Bandeau",
      },
    ],
    tone: "bg-wise-blue text-wise-charcoal",
  },
  {
    description: "Les personnes qui s'en occupent",
    icon: UserGroupIcon,
    id: "team",
    label: "Équipe",
    presets: [
      {
        build: () =>
          section(
            {},
            title("L'équipe", { size: "m" }),
            grid(
              { columns: "3" },
              n("member"),
              n("member", {
                name: "Hugo Martin",
                role: "Soigneur",
                src: venue.photos[4],
              }),
              n("member", {
                name: "Léa Roux",
                role: "Toiletteuse",
                src: venue.photos[5],
              })
            )
          ),
        description: "Trois portraits",
        id: "team-grid",
        label: "Portraits",
      },
      {
        build: () =>
          section(
            { tone: "cream" },
            grid(
              { align: "center", columns: "2", gap: "l" },
              n("image", { ratio: "portrait", src: venue.photos[3] }),
              column(
                {},
                title(`Bonjour, moi c'est ${venue.owner.split(" ")[0]}`, {
                  size: "m",
                }),
                para(venue.about),
                n("button", {
                  action: "contact",
                  label: "M'écrire",
                  style: "secondary",
                })
              )
            )
          ),
        description: "Une photo et un mot du fondateur",
        id: "team-founder",
        label: "Le mot du fondateur",
      },
    ],
    tone: "bg-wise-orange text-wise-maroon",
  },
  {
    description: "Les questions qu'on vous pose",
    icon: HelpCircleIcon,
    id: "faq",
    label: "Questions fréquentes",
    presets: [
      {
        build: () =>
          section(
            { width: "narrow" },
            title("Questions fréquentes", { size: "m" }),
            column(
              { gap: "s" },
              ...faqs.map(([question, answer], i) =>
                n("faq", { answer, open: String(i === 0), question })
              )
            )
          ),
        description: "Questions les unes sous les autres",
        id: "faq-list",
        label: "Liste",
      },
      {
        build: () =>
          section(
            {},
            grid(
              { columns: "1-2", gap: "l" },
              column(
                {},
                title("Des questions ?", { size: "m" }),
                para("Écrivez-nous, on répond en moins d'une heure."),
                n("button", {
                  action: "contact",
                  label: "Nous écrire",
                  style: "secondary",
                })
              ),
              column(
                { gap: "s" },
                ...faqs.map(([question, answer]) =>
                  n("faq", { answer, question })
                )
              )
            )
          ),
        description: "Un texte à gauche, les questions à droite",
        id: "faq-split",
        label: "Deux colonnes",
      },
    ],
    tone: "bg-wise-pink text-wise-purple",
  },
  {
    description: "Adresse, horaires et plan",
    icon: Call02Icon,
    id: "contact",
    label: "Contact et accès",
    presets: [
      {
        build: () =>
          section(
            {},
            title("Nous trouver", { size: "m" }),
            grid(
              { columns: "2" },
              n("map"),
              column({}, n("contact"), n("hours"))
            )
          ),
        description: "Plan, coordonnées et horaires",
        id: "contact-map",
        label: "Plan et horaires",
      },
      {
        build: () =>
          section(
            { tone: "cream", width: "narrow" },
            title("Nous contacter", { size: "m" }),
            n("contact")
          ),
        description: "Vos coordonnées seules",
        id: "contact-simple",
        label: "Coordonnées",
      },
    ],
    tone: "bg-wise-green text-wise-forest",
  },
  {
    description: "Le bas de chaque page",
    icon: LayoutBottomIcon,
    id: "footer",
    label: "Pied de page",
    presets: [
      {
        build: () => n("footer"),
        description: "Coordonnées, horaires et mention",
        id: "footer-full",
        label: "Complet",
      },
      {
        build: () => n("footer", { layout: "simple" }),
        description: "Une seule ligne",
        id: "footer-simple",
        label: "Simple",
      },
    ],
    tone: "bg-wise-charcoal text-white",
  },
]

const presetsById = Object.fromEntries(
  categories.flatMap((c) => c.presets.map((p) => [p.id, p]))
)
const build = (...ids: string[]) => ids.map((id) => presetsById[id].build())

export type Page = { id: string; title: string; slug: string; nodes: Node[] }

export const initialPages = (): Page[] => [
  {
    id: "home",
    nodes: build(
      "header-cta",
      "hero-photo",
      "about-features",
      "prices-cards",
      "reviews-summary",
      "booking-cta",
      "contact-map",
      "footer-full"
    ),
    slug: "/",
    title: "Accueil",
  },
  {
    id: "prices",
    nodes: build(
      "header-cta",
      "prices-list",
      "prices-single",
      "faq-list",
      "footer-full"
    ),
    slug: "/tarifs",
    title: "Tarifs",
  },
  {
    id: "contact",
    nodes: build("header-cta", "contact-map", "faq-split", "footer-simple"),
    slug: "/contact",
    title: "Contact",
  },
]
