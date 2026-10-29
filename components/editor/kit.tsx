"use client"

import {
  Album02Icon,
  Calendar03Icon,
  Call02Icon,
  Camera01Icon,
  ChartIncreaseIcon,
  CheckmarkBadge01Icon,
  Clock01Icon,
  CursorPointer02Icon,
  DollarCircleIcon,
  FavouriteIcon,
  FlashIcon,
  GridViewIcon,
  Heading01Icon,
  HelpCircleIcon,
  Home01Icon,
  Image01Icon,
  LayoutBottomIcon,
  LayoutTopIcon,
  LayoutTwoColumnIcon,
  Location01Icon,
  Mail01Icon,
  Menu01Icon,
  Message01Icon,
  MinusSignIcon,
  PawPrintIcon,
  QuoteDownIcon,
  RectangularIcon,
  RulerIcon,
  SecurityCheckIcon,
  SquareIcon,
  StarIcon,
  Tag01Icon,
  TextIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import type { ReactNode } from "react"
import { type Activity, activityMeta } from "@/components/activity-mark"
import {
  activityIcons,
  Photo,
  Stars,
  VenueLogo,
} from "@/components/site/site-ui"
import { Offers } from "@/components/site/venue-view"
import { ratingText, reviewPool, venueOf } from "@/components/site/venues"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ——— Le registre des éléments de l'éditeur, au format de Puck : champs, valeurs par défaut, rendu ——— */

/** L'établissement dont on édite le site. */
export const venue = venueOf("les-coteaux")!

/** Toutes les valeurs sont des textes, comme dans un formulaire. */
export type Props = Record<string, string>

export type Kind =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "spacer"
  | "divider"
  | "section"
  | "grid"
  | "column"
  | "card"
  | "navbar"
  | "footer"
  | "review"
  | "rating"
  | "service"
  | "prices"
  | "booking"
  | "hours"
  | "map"
  | "gallery"
  | "feature"
  | "stat"
  | "member"
  | "faq"
  | "contact"

export type Node = {
  id: string
  type: Kind
  props: Props
  children?: Node[]
  hidden?: boolean
}

export const accents = {
  orange: { label: "Abricot", tone: "bg-wise-orange text-wise-maroon" },
  green: { label: "Citron", tone: "bg-wise-green text-wise-forest" },
  yellow: { label: "Soleil", tone: "bg-wise-yellow text-wise-gold" },
  blue: { label: "Lagon", tone: "bg-wise-blue text-wise-charcoal" },
  pink: { label: "Pétale", tone: "bg-wise-pink text-wise-purple" },
  forest: { label: "Forêt", tone: "bg-wise-forest text-wise-green" },
}

export type Theme = {
  accent: keyof typeof accents
  font: "display" | "sans"
  radius: "round" | "soft" | "square"
}

export const radii = { round: "2rem", soft: "1rem", square: "0.25rem" }

type Option = { label: string; value: string }

export type Field = {
  name: string
  label: string
  /** Le champ n'apparaît que si la condition est remplie. */
  when?: (p: Props) => boolean
} & (
  | { type: "text" | "textarea" | "image" | "tone" | "toggle" }
  | { type: "choice"; options: Option[] }
  | { type: "number"; min: number; max: number }
)

export type Group = "base" | "layout" | "kennelo"

export const groups: Record<Group, { label: string; description: string }> = {
  base: { description: "Texte, images, boutons", label: "Éléments de base" },
  kennelo: {
    description: "Reliés à vos avis, prix et réservations",
    label: "Kennelo",
  },
  layout: { description: "Pour organiser la page", label: "Mise en page" },
}

export type Def = {
  label: string
  icon: IconSvgElement
  group: Group
  /** Peut contenir d'autres éléments. */
  slot?: boolean
  /** Ce qui vient de Kennelo et se met à jour tout seul. */
  live?: string
  fields: Field[]
  defaults: Props
  render: (p: Props, ctx: { theme: Theme; children?: ReactNode }) => ReactNode
}

const opt = (...pairs: [string, string][]): Option[] =>
  pairs.map(([value, label]) => ({ label, value }))
const text = (name: string, label: string): Field => ({
  label,
  name,
  type: "text",
})
const area = (name: string, label: string): Field => ({
  label,
  name,
  type: "textarea",
})
const choice = (name: string, label: string, options: Option[]): Field => ({
  label,
  name,
  options,
  type: "choice",
})
const tone: Field = { label: "Fond", name: "tone", type: "tone" }
const size3 = opt(["s", "Petit"], ["m", "Moyen"], ["l", "Grand"])
const align = choice(
  "align",
  "Alignement",
  opt(["start", "Gauche"], ["center", "Centré"])
)
const surface = choice(
  "surface",
  "Carte",
  opt(["cream", "Crème"], ["white", "Blanche"])
)
const activity = choice(
  "activity",
  "Activité",
  venue.activities.map((a) => ({ label: a, value: a }))
)

export const tones = opt(
  ["none", "Aucun"],
  ["cream", "Crème"],
  ["accent", "Couleur du site"],
  ["dark", "Foncé"]
)
export const toneClass = (value: string, theme: Theme) =>
  ({
    accent: accents[theme.accent].tone,
    cream: "bg-muted",
    dark: "bg-wise-forest text-white",
    none: "",
  })[value] ?? ""
const surfaceClass = (value: string) =>
  value === "white" ? "bg-background text-foreground" : "bg-muted"
const display = (theme: Theme) =>
  theme.font === "display" ? "font-display" : "font-heading font-semibold"
const accentOf = (theme: Theme) => accents[theme.accent].tone

const featureIcons: Record<string, IconSvgElement> = {
  camera: Camera01Icon,
  clock: Clock01Icon,
  heart: FavouriteIcon,
  home: Home01Icon,
  paw: PawPrintIcon,
  shield: SecurityCheckIcon,
}

const hours = [
  { day: "Lundi – Vendredi", time: "8h – 19h" },
  { day: "Samedi", time: "9h – 18h" },
  { day: "Dimanche", time: "Sur rendez-vous" },
]

function Pill({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold [&_svg]:size-4",
        className
      )}
    >
      {children}
    </span>
  )
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted px-4 py-3 text-start">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}

export const kit: Record<Kind, Def> = {
  /* ——— Base ——— */
  heading: {
    defaults: { align: "start", size: "l", text: "Un titre" },
    fields: [
      area("text", "Texte"),
      choice(
        "size",
        "Taille",
        opt(["s", "S"], ["m", "M"], ["l", "L"], ["xl", "XL"])
      ),
      align,
    ],
    group: "base",
    icon: Heading01Icon,
    label: "Titre",
    render: (p, { theme }) => (
      <h2
        className={cn(
          display(theme),
          "text-balance",
          {
            l: "text-5xl @2xl:text-6xl",
            m: "text-4xl @2xl:text-5xl",
            s: "text-3xl",
            xl: "text-6xl @2xl:text-7xl @4xl:text-8xl",
          }[p.size],
          p.align === "center" && "text-center"
        )}
      >
        {p.text}
      </h2>
    ),
  },
  text: {
    defaults: {
      align: "start",
      muted: "false",
      size: "m",
      text: "Votre texte.",
    },
    fields: [
      area("text", "Texte"),
      choice("size", "Taille", size3),
      align,
      { label: "Plus discret", name: "muted", type: "toggle" },
    ],
    group: "base",
    icon: TextIcon,
    label: "Texte",
    render: (p) => (
      <p
        className={cn(
          "max-w-2xl text-pretty",
          { l: "text-xl", m: "text-base", s: "text-sm" }[p.size],
          p.muted === "true" && "opacity-75",
          p.align === "center" && "mx-auto text-center"
        )}
      >
        {p.text}
      </p>
    ),
  },
  image: {
    defaults: { ratio: "landscape", src: venue.photos[0] },
    fields: [
      { label: "Image", name: "src", type: "image" },
      choice(
        "ratio",
        "Format",
        opt(
          ["square", "Carré"],
          ["portrait", "Portrait"],
          ["landscape", "Paysage"],
          ["wide", "Bandeau"]
        )
      ),
    ],
    group: "base",
    icon: Image01Icon,
    label: "Image",
    render: (p) => (
      <Photo
        alt=""
        className={cn(
          "w-full rounded-(--r)",
          {
            landscape: "aspect-4/3",
            portrait: "aspect-4/5",
            square: "aspect-square",
            wide: "aspect-21/9",
          }[p.ratio]
        )}
        sizes="(min-width: 1024px) 50vw, 100vw"
        src={p.src}
      />
    ),
  },
  button: {
    defaults: {
      action: "booking",
      label: "Réserver",
      size: "l",
      style: "primary",
    },
    fields: [
      text("label", "Texte"),
      choice(
        "action",
        "Au clic",
        opt(
          ["booking", "Réserver"],
          ["contact", "Écrire"],
          ["page", "Ouvrir une page"]
        )
      ),
      choice(
        "style",
        "Style",
        opt(
          ["primary", "Principal"],
          ["secondary", "Discret"],
          ["outline", "Contour"]
        )
      ),
      choice("size", "Taille", opt(["m", "Normal"], ["l", "Grand"])),
    ],
    group: "base",
    icon: CursorPointer02Icon,
    label: "Bouton",
    render: (p) => (
      <Button
        size={p.size === "l" ? "lg" : "default"}
        variant={
          (
            {
              outline: "outline",
              primary: "default",
              secondary: "secondary",
            } as const
          )[p.style as "primary"]
        }
      >
        {p.label}
      </Button>
    ),
  },
  spacer: {
    defaults: { size: "m" },
    fields: [choice("size", "Hauteur", size3)],
    group: "base",
    icon: RulerIcon,
    label: "Espace",
    render: (p) => (
      <div className={{ l: "h-24", m: "h-12", s: "h-6" }[p.size]} />
    ),
  },
  divider: {
    defaults: {},
    fields: [],
    group: "base",
    icon: MinusSignIcon,
    label: "Séparateur",
    render: () => <hr className="border-current opacity-15" />,
  },

  /* ——— Mise en page ——— */
  section: {
    defaults: { padding: "m", tone: "none", width: "normal" },
    fields: [
      tone,
      choice(
        "width",
        "Largeur",
        opt(["narrow", "Étroite"], ["normal", "Normale"], ["full", "Pleine"])
      ),
      choice("padding", "Marges", size3),
    ],
    group: "layout",
    icon: RectangularIcon,
    label: "Section",
    render: (p, { theme, children }) => (
      <section
        className={cn(
          toneClass(p.tone, theme),
          { l: "py-20 @4xl:py-32", m: "py-14 @4xl:py-20", s: "py-8" }[p.padding]
        )}
      >
        <div
          className={cn(
            "mx-auto flex flex-col gap-8 px-6 @4xl:px-10",
            { full: "", narrow: "max-w-3xl", normal: "max-w-6xl" }[p.width]
          )}
        >
          {children}
        </div>
      </section>
    ),
    slot: true,
  },
  grid: {
    defaults: { align: "start", columns: "3", gap: "m" },
    fields: [
      choice(
        "columns",
        "Colonnes",
        opt(
          ["2", "2"],
          ["3", "3"],
          ["4", "4"],
          ["1-2", "1 + 2"],
          ["2-1", "2 + 1"]
        )
      ),
      choice("gap", "Espacement", size3),
      choice(
        "align",
        "Alignement vertical",
        opt(["start", "En haut"], ["center", "Centré"])
      ),
    ],
    group: "layout",
    icon: GridViewIcon,
    label: "Grille",
    render: (p, { children }) => (
      <div
        className={cn(
          "grid",
          {
            "1-2": "@2xl:grid-cols-[1fr_2fr]",
            "2": "@2xl:grid-cols-2",
            "2-1": "@2xl:grid-cols-[2fr_1fr]",
            "3": "@2xl:grid-cols-2 @4xl:grid-cols-3",
            "4": "@2xl:grid-cols-2 @4xl:grid-cols-4",
          }[p.columns],
          { l: "gap-10 @4xl:gap-16", m: "gap-6", s: "gap-3" }[p.gap],
          p.align === "center" && "items-center"
        )}
      >
        {children}
      </div>
    ),
    slot: true,
  },
  column: {
    defaults: { align: "start", gap: "m" },
    fields: [choice("gap", "Espacement", size3), align],
    group: "layout",
    icon: LayoutTwoColumnIcon,
    label: "Colonne",
    render: (p, { children }) => (
      <div
        className={cn(
          "flex flex-col",
          { l: "gap-8", m: "gap-5", s: "gap-2" }[p.gap],
          p.align === "center" && "text-center"
        )}
      >
        {children}
      </div>
    ),
    slot: true,
  },
  card: {
    defaults: { tone: "cream" },
    fields: [tone],
    group: "layout",
    icon: SquareIcon,
    label: "Carte",
    render: (p, { theme, children }) => (
      <div
        className={cn(
          "flex h-full flex-col gap-4 rounded-(--r) p-6 @2xl:p-8",
          toneClass(p.tone, theme)
        )}
      >
        {children}
      </div>
    ),
    slot: true,
  },

  /* ——— Kennelo ——— */
  navbar: {
    defaults: {
      cta: "true",
      ctaLabel: "Réserver",
      layout: "split",
      links: "Accueil, Prestations, Avis, Contact",
      tone: "none",
    },
    fields: [
      area("links", "Liens du menu (séparés par des virgules)"),
      choice(
        "layout",
        "Disposition",
        opt(["split", "Logo à gauche"], ["centered", "Centré"])
      ),
      { label: "Bouton de réservation", name: "cta", type: "toggle" },
      { ...text("ctaLabel", "Texte du bouton"), when: (p) => p.cta === "true" },
      tone,
    ],
    group: "kennelo",
    icon: LayoutTopIcon,
    label: "Menu du site",
    live: "Le logo et le nom viennent de votre établissement.",
    render: (p, { theme }) => {
      const centered = p.layout === "centered"
      return (
        <header
          className={cn(
            "flex items-center gap-6 px-6 py-4 @4xl:px-10",
            centered && "flex-col gap-3 py-6",
            toneClass(p.tone, theme)
          )}
        >
          <div className="flex items-center gap-3">
            <VenueLogo
              className={cn("size-10 text-lg", accentOf(theme))}
              venue={venue}
            />
            <span className={cn(display(theme), "text-2xl")}>{venue.name}</span>
          </div>
          <nav
            className={cn(
              "flex flex-1 gap-6 font-semibold @max-2xl:hidden",
              centered ? "justify-center" : "justify-end"
            )}
          >
            {p.links
              .split(",")
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => (
                <span key={l}>{l}</span>
              ))}
          </nav>
          <div
            className={cn(
              "flex items-center gap-2",
              !centered && "ms-auto @2xl:ms-0"
            )}
          >
            {p.cta === "true" && <Button>{p.ctaLabel}</Button>}
            <Button
              aria-label="Menu"
              className="@2xl:hidden"
              size="icon"
              variant="secondary"
            >
              <HugeiconsIcon icon={Menu01Icon} />
            </Button>
          </div>
        </header>
      )
    },
  },
  footer: {
    defaults: { layout: "full", note: `© 2026 ${venue.name}` },
    fields: [
      choice(
        "layout",
        "Disposition",
        opt(["full", "Complet"], ["simple", "Simple"])
      ),
      text("note", "Mention"),
    ],
    group: "kennelo",
    icon: LayoutBottomIcon,
    label: "Pied de page",
    live: "Coordonnées et horaires repris de votre établissement.",
    render: (p, { theme }) => {
      const badge = (
        <Pill className="bg-wise-green text-wise-forest">
          <HugeiconsIcon icon={PawPrintIcon} />
          Réservation en ligne avec Kennelo
        </Pill>
      )
      if (p.layout === "simple")
        return (
          <footer className="flex flex-wrap items-center gap-4 bg-wise-forest px-6 py-8 text-white @4xl:px-10">
            <span className={cn(display(theme), "text-2xl")}>{venue.name}</span>
            <span className="flex-1 opacity-70">{p.note}</span>
            {badge}
          </footer>
        )
      return (
        <footer className="space-y-10 bg-wise-forest px-6 py-14 text-white @4xl:px-10">
          <div className="mx-auto grid max-w-6xl gap-8 @2xl:grid-cols-[2fr_1fr_1fr]">
            <div className="space-y-3">
              <p className={cn(display(theme), "text-4xl")}>{venue.name}</p>
              <p className="max-w-sm opacity-70">{venue.tagline}</p>
            </div>
            <div className="space-y-1">
              <p className="mb-2 font-semibold text-wise-green">Contact</p>
              <p className="opacity-80">{venue.address}</p>
              <p className="opacity-80">05 57 00 12 34</p>
            </div>
            <div className="space-y-1">
              <p className="mb-2 font-semibold text-wise-green">Horaires</p>
              {hours.map((h) => (
                <p className="opacity-80" key={h.day}>
                  {h.day} · {h.time}
                </p>
              ))}
            </div>
          </div>
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
            <span className="opacity-70">{p.note}</span>
            {badge}
          </div>
        </footer>
      )
    },
  },
  review: {
    defaults: {
      author: "",
      pick: "0",
      style: "card",
      surface: "cream",
      text: "",
    },
    fields: [
      choice("pick", "Avis", [
        ...reviewPool.map((r, i) => ({ label: r.author, value: String(i) })),
        { label: "Écrire moi-même", value: "custom" },
      ]),
      { ...text("author", "Auteur"), when: (p) => p.pick === "custom" },
      { ...area("text", "Avis"), when: (p) => p.pick === "custom" },
      choice(
        "style",
        "Style",
        opt(["card", "Carte"], ["quote", "Grande citation"])
      ),
      { ...surface, when: (p) => p.style === "card" },
    ],
    group: "kennelo",
    icon: QuoteDownIcon,
    label: "Avis",
    live: "Choisi parmi vos avis vérifiés Kennelo.",
    render: (p, { theme }) => {
      const r =
        p.pick === "custom"
          ? {
              author: p.author || "Un client",
              pet: "",
              rating: 5,
              text: p.text || "Votre avis ici.",
            }
          : reviewPool[Number(p.pick)]
      if (p.style === "quote")
        return (
          <figure className="mx-auto max-w-4xl space-y-6 text-center">
            <HugeiconsIcon className="mx-auto size-12" icon={QuoteDownIcon} />
            <blockquote
              className={cn(
                display(theme),
                "text-4xl text-balance @2xl:text-5xl"
              )}
            >
              {r.text}
            </blockquote>
            <figcaption className="font-semibold">
              {r.author}
              {r.pet && <span className="opacity-70"> · {r.pet}</span>}
            </figcaption>
          </figure>
        )
      return (
        <figure
          className={cn(
            "flex h-full flex-col gap-4 rounded-(--r) p-6 text-start",
            surfaceClass(p.surface)
          )}
        >
          <Stars n={r.rating} />
          <blockquote className="flex-1 text-lg text-pretty">
            {r.text}
          </blockquote>
          <figcaption className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-full font-semibold",
                accentOf(theme)
              )}
            >
              {r.author[0]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{r.author}</span>
              {r.pet && (
                <span className="block text-sm opacity-70">{r.pet}</span>
              )}
            </span>
            {p.pick !== "custom" && (
              <HugeiconsIcon
                aria-label="Avis vérifié"
                className="size-5"
                icon={CheckmarkBadge01Icon}
              />
            )}
          </figcaption>
        </figure>
      )
    },
  },
  rating: {
    defaults: { style: "large", surface: "white" },
    fields: [
      choice(
        "style",
        "Style",
        opt(["large", "Détaillée"], ["compact", "Compacte"])
      ),
      { ...surface, when: (p) => p.style === "large" },
    ],
    group: "kennelo",
    icon: StarIcon,
    label: "Note globale",
    live: `Votre note Kennelo : ${ratingText(venue.rating)} sur ${venue.reviews} avis.`,
    render: (p, { theme }) => {
      if (p.style === "compact")
        return (
          <span className="inline-flex flex-wrap items-center gap-2 font-semibold">
            <Stars n={5} />
            {ratingText(venue.rating)} · {venue.reviews} avis vérifiés
          </span>
        )
      return (
        <div
          className={cn(
            "flex h-full flex-col gap-4 rounded-(--r) p-6 text-start",
            surfaceClass(p.surface)
          )}
        >
          <p className={cn(display(theme), "text-8xl")}>
            {ratingText(venue.rating)}
          </p>
          <Stars className="[&_svg]:size-6" n={5} />
          <p className="font-semibold">
            {venue.reviews} avis vérifiés sur Kennelo
          </p>
          <div className="mt-auto space-y-1.5">
            {[88, 9, 2, 1, 0].map((pct, i) => (
              <div className="flex items-center gap-3 text-sm" key={pct}>
                <span className="w-3 font-semibold">{5 - i}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-current"
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    },
  },
  service: {
    defaults: {
      activity: "Pension",
      description: "Box chauffé, 3 sorties par jour au parc",
      highlight: "false",
      price: "28",
      title: "Pension confort",
      unit: "/ nuit",
    },
    fields: [
      activity,
      text("title", "Nom"),
      area("description", "Description"),
      text("price", "Prix (€)"),
      text("unit", "Unité"),
      { label: "Mettre en avant", name: "highlight", type: "toggle" },
    ],
    group: "kennelo",
    icon: Tag01Icon,
    label: "Prestation",
    live: "Le bouton ouvre la réservation de cette prestation.",
    render: (p, { theme }) => {
      const a = p.activity as Activity
      const on = p.highlight === "true"
      return (
        <div
          className={cn(
            "flex h-full flex-col gap-4 rounded-(--r) p-6 text-start",
            on ? accentOf(theme) : "bg-muted"
          )}
        >
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              on ? "bg-white/60" : activityMeta[a].tint
            )}
          >
            <HugeiconsIcon icon={activityIcons[a]} />
          </span>
          <div className="space-y-1">
            <p className="text-xl font-semibold">{p.title}</p>
            <p className="opacity-75">{p.description}</p>
          </div>
          <p className="mt-auto">
            <span className={cn(display(theme), "text-5xl")}>{p.price} €</span>{" "}
            <span className="opacity-75">{p.unit}</span>
          </p>
          <Button className="w-full" variant={on ? "default" : "secondary"}>
            Réserver
          </Button>
        </div>
      )
    },
  },
  prices: {
    defaults: { activity: "Pension" },
    fields: [activity],
    group: "kennelo",
    icon: DollarCircleIcon,
    label: "Grille tarifaire",
    live: "Prix synchronisés avec votre catalogue de prestations.",
    render: (p) => (
      <div className="text-start text-foreground">
        <Offers activity={p.activity as Activity} venue={venue} />
      </div>
    ),
  },
  booking: {
    defaults: {
      activity: "Pension",
      style: "card",
      title: "Réserver un séjour",
    },
    fields: [
      choice(
        "style",
        "Style",
        opt(["card", "Carte"], ["bar", "Barre"], ["button", "Bouton"])
      ),
      text("title", "Titre"),
      activity,
    ],
    group: "kennelo",
    icon: Calendar03Icon,
    label: "Réservation",
    live: "Disponibilités, prix et paiement en temps réel.",
    render: (p) => {
      if (p.style === "button")
        return (
          <div className="inline-flex flex-wrap items-center gap-3">
            <Button size="lg">{p.title}</Button>
            <Pill className="bg-white/60 text-current">
              <HugeiconsIcon icon={FlashIcon} />
              Confirmation immédiate
            </Pill>
          </div>
        )
      if (p.style === "bar")
        return (
          <div className="grid gap-2 rounded-(--r) bg-background p-2 text-foreground shadow-lg/5 @2xl:grid-cols-[1fr_1fr_1fr_auto]">
            <Box label="Activité" value={p.activity} />
            <Box label="Arrivée" value="ven. 14 nov." />
            <Box label="Départ" value="dim. 16 nov." />
            <Button className="h-auto min-h-12" size="lg">
              Voir les disponibilités
            </Button>
          </div>
        )
      return (
        <div className="flex flex-col gap-4 rounded-(--r) bg-background p-6 text-start text-foreground shadow-lg/5">
          <p className="text-xl font-semibold">{p.title}</p>
          <div className="flex flex-wrap gap-2">
            {venue.activities.map((a) => (
              <Pill
                className={
                  a === p.activity
                    ? "bg-control text-control-foreground"
                    : "bg-muted"
                }
                key={a}
              >
                <HugeiconsIcon icon={activityIcons[a]} />
                {a}
              </Pill>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Box label="Arrivée" value="ven. 14 nov." />
            <Box label="Départ" value="dim. 16 nov." />
          </div>
          <Box label="Animal" value="1 chien" />
          <p className="flex justify-between font-semibold">
            <span>2 nuits</span>
            <span>56 €</span>
          </p>
          <Button className="w-full" size="lg">
            Réserver
          </Button>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <HugeiconsIcon className="size-4" icon={FlashIcon} />
            Confirmée tout de suite · Annulation gratuite 48 h avant
          </p>
        </div>
      )
    },
  },
  hours: {
    defaults: {},
    fields: [],
    group: "kennelo",
    icon: Clock01Icon,
    label: "Horaires",
    live: "Repris de vos horaires d'ouverture.",
    render: () => (
      <div className="divide-y-2 divide-background overflow-hidden rounded-(--r) bg-muted text-start">
        {hours.map((h, i) => (
          <div className="flex items-center gap-3 px-5 py-3" key={h.day}>
            <span className="flex-1 font-semibold">{h.day}</span>
            {i === 0 && (
              <Pill className="h-6 bg-success-soft text-xs text-foreground">
                Ouvert
              </Pill>
            )}
            <span>{h.time}</span>
          </div>
        ))}
      </div>
    ),
  },
  map: {
    defaults: {},
    fields: [],
    group: "kennelo",
    icon: Location01Icon,
    label: "Plan d'accès",
    live: "Adresse reprise de votre établissement.",
    render: (_, { theme }) => (
      <div className="relative h-full min-h-72 overflow-hidden rounded-(--r) bg-wise-blue/40 text-foreground">
        <span className="absolute inset-x-0 top-1/3 h-3 -rotate-6 bg-background/80" />
        <span className="absolute inset-y-0 left-2/3 w-3 rotate-12 bg-background/80" />
        <span className="absolute inset-x-0 top-3/4 h-2 rotate-3 bg-background/60" />
        <span
          className={cn(
            "absolute top-1/3 left-2/3 flex size-12 -translate-1/2 items-center justify-center rounded-full shadow-lg",
            accentOf(theme)
          )}
        >
          <HugeiconsIcon icon={Location01Icon} />
        </span>
        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-background p-4 text-start @2xl:right-auto">
          <p className="font-semibold">{venue.name}</p>
          <p className="text-sm text-muted-foreground">{venue.address}</p>
        </div>
      </div>
    ),
  },
  gallery: {
    defaults: { count: "5", layout: "mosaic" },
    fields: [
      choice(
        "layout",
        "Disposition",
        opt(["mosaic", "Mosaïque"], ["grid", "Grille"], ["strip", "Bandeau"])
      ),
      {
        label: "Nombre de photos",
        max: 6,
        min: 2,
        name: "count",
        type: "number",
      },
    ],
    group: "kennelo",
    icon: Album02Icon,
    label: "Galerie",
    live: "Vos photos Kennelo, celles que voient les clients.",
    render: (p) => {
      const list = venue.photos.slice(0, Number(p.count))
      if (p.layout === "strip")
        return (
          <div className="flex gap-4 overflow-hidden">
            {list.map((src) => (
              <Photo
                alt=""
                className="aspect-3/4 w-56 shrink-0 rounded-(--r)"
                key={src}
                sizes="224px"
                src={src}
              />
            ))}
          </div>
        )
      return (
        <div
          className={cn(
            "grid gap-3",
            p.layout === "mosaic"
              ? "grid-cols-2 @2xl:grid-cols-4 @2xl:grid-rows-2"
              : "grid-cols-2 @2xl:grid-cols-3"
          )}
        >
          {list.map((src, i) => (
            <Photo
              alt=""
              className={cn(
                "aspect-square rounded-(--r)",
                p.layout === "mosaic" &&
                  i === 0 &&
                  "col-span-2 @2xl:row-span-2 @2xl:aspect-auto"
              )}
              key={src}
              sizes="(min-width: 768px) 33vw, 50vw"
              src={src}
            />
          ))}
        </div>
      )
    },
  },
  feature: {
    defaults: {
      icon: "paw",
      text: "Une phrase pour l'expliquer.",
      title: "Un atout",
    },
    fields: [
      choice(
        "icon",
        "Icône",
        opt(
          ["paw", "Patte"],
          ["shield", "Sécurité"],
          ["camera", "Photo"],
          ["home", "Maison"],
          ["heart", "Cœur"],
          ["clock", "Horloge"]
        )
      ),
      text("title", "Titre"),
      area("text", "Texte"),
    ],
    group: "kennelo",
    icon: CheckmarkBadge01Icon,
    label: "Atout",
    render: (p, { theme }) => (
      <div className="flex flex-col gap-3">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            accentOf(theme)
          )}
        >
          <HugeiconsIcon icon={featureIcons[p.icon]} />
        </span>
        <p className="text-xl font-semibold">{p.title}</p>
        <p className="opacity-75">{p.text}</p>
      </div>
    ),
  },
  stat: {
    defaults: { label: "de parcs clôturés", value: "2 ha" },
    fields: [text("value", "Chiffre"), text("label", "Légende")],
    group: "kennelo",
    icon: ChartIncreaseIcon,
    label: "Chiffre clé",
    render: (p, { theme }) => (
      <div>
        <p className={cn(display(theme), "text-6xl @2xl:text-7xl")}>
          {p.value}
        </p>
        <p className="mt-2 font-semibold opacity-75">{p.label}</p>
      </div>
    ),
  },
  member: {
    defaults: { name: venue.owner, role: "Fondatrice", src: venue.photos[3] },
    fields: [
      text("name", "Nom"),
      text("role", "Rôle"),
      { label: "Photo", name: "src", type: "image" },
    ],
    group: "kennelo",
    icon: UserIcon,
    label: "Membre de l'équipe",
    live: "Choisi parmi les membres de votre équipe.",
    render: (p) => (
      <div className="flex flex-col gap-3 text-start">
        <Photo
          alt=""
          className="aspect-square w-full rounded-(--r)"
          sizes="320px"
          src={p.src}
        />
        <div>
          <p className="text-xl font-semibold">{p.name}</p>
          <p className="opacity-75">{p.role}</p>
        </div>
      </div>
    ),
  },
  faq: {
    defaults: {
      answer: "Oui, dès 3 mois et avec ses premiers vaccins.",
      open: "false",
      question: "Acceptez-vous les chiots ?",
    },
    fields: [
      text("question", "Question"),
      area("answer", "Réponse"),
      { label: "Ouverte par défaut", name: "open", type: "toggle" },
    ],
    group: "kennelo",
    icon: HelpCircleIcon,
    label: "Question fréquente",
    render: (p) => (
      <div className="rounded-(--r) bg-muted p-5 text-start">
        <p className="flex items-center gap-3 text-lg font-semibold">
          <span className="flex-1">{p.question}</span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-xl">
            {p.open === "true" ? "−" : "+"}
          </span>
        </p>
        {p.open === "true" && <p className="mt-2 opacity-75">{p.answer}</p>}
      </div>
    ),
  },
  contact: {
    defaults: {},
    fields: [],
    group: "kennelo",
    icon: Call02Icon,
    label: "Coordonnées",
    live: "Repris de votre établissement, avec la messagerie Kennelo.",
    render: () => (
      <div className="divide-y-2 divide-background overflow-hidden rounded-(--r) bg-muted text-start">
        {[
          { icon: Location01Icon, text: venue.address },
          { icon: Call02Icon, text: "05 57 00 12 34" },
          { icon: Mail01Icon, text: "bonjour@lescoteaux.fr" },
          {
            icon: Message01Icon,
            text: `Écrire sur Kennelo · ${venue.response}`,
          },
        ].map((row) => (
          <div className="flex items-center gap-3 px-5 py-3" key={row.text}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background">
              <HugeiconsIcon className="size-5" icon={row.icon} />
            </span>
            <span className="font-semibold">{row.text}</span>
          </div>
        ))}
      </div>
    ),
  },
}
