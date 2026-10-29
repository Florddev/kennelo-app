"use client"

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Bookmark01Icon,
  Cancel01Icon,
  ComputerIcon,
  Copy01Icon,
  Delete02Icon,
  File01Icon,
  Files01Icon,
  Home01Icon,
  Layers01Icon,
  PaintBoardIcon,
  PawPrintIcon,
  PlusSignIcon,
  RedoIcon,
  SmartPhone01Icon,
  Tablet01Icon,
  UndoIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import {
  type CSSProperties,
  createContext,
  Fragment,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react"
import {
  type Category,
  categories,
  clone,
  initialPages,
  n,
  type Page,
  type Preset,
} from "@/components/editor/blocks"
import {
  accents,
  type Field,
  type Group,
  groups,
  type Kind,
  kit,
  type Node,
  radii,
  type Theme,
  toneClass,
  tones,
  venue,
} from "@/components/editor/kit"
import { notify } from "@/components/settings/settings-ui"
import { Photo, VenueLogo } from "@/components/site/site-ui"
import {
  FilterChips,
  listCard,
  listRow,
  SearchField,
} from "@/components/today/widgets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/* ——— Opérations sur l'arbre de la page ——— */

/** Applique `fn` à chaque liste de frères, de la page jusqu'au plus profond. */
const walk = (nodes: Node[], fn: (list: Node[]) => Node[]): Node[] =>
  fn(nodes).map((x) =>
    x.children ? { ...x, children: walk(x.children, fn) } : x
  )

/** L'élément et tous ses parents, de la page jusqu'à lui. */
const pathTo = (nodes: Node[], id: string): Node[] => {
  for (const x of nodes) {
    if (x.id === id) return [x]
    const sub = x.children ? pathTo(x.children, id) : []
    if (sub.length) return [x, ...sub]
  }
  return []
}

type Target = { parent: string | null; index: number }

const insert = (nodes: Node[], t: Target, node: Node) => {
  const put = (list: Node[]) => [
    ...list.slice(0, t.index),
    node,
    ...list.slice(t.index),
  ]
  return t.parent === null
    ? put(nodes)
    : walk(nodes, (list) =>
        list.map((x) =>
          x.id === t.parent ? { ...x, children: put(x.children ?? []) } : x
        )
      )
}

const move = (list: Node[], id: string, by: number) => {
  const i = list.findIndex((x) => x.id === id)
  const j = i + by
  if (i < 0 || j < 0 || j >= list.length) return list
  const next = [...list]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

/** Ce qui peut être posé directement sur la page ; le reste est rangé dans une section. */
const topLevel: Kind[] = ["section", "navbar", "footer"]

const renderStatic = (node: Node, theme: Theme): ReactNode =>
  node.hidden ? null : (
    <Fragment key={node.id}>
      {kit[node.type].render(node.props, {
        children: node.children?.map((c) => renderStatic(c, theme)),
        theme,
      })}
    </Fragment>
  )

const groupTone: Record<Group, string> = {
  base: "bg-background",
  kennelo: "bg-wise-green text-wise-forest",
  layout: "bg-wise-blue text-wise-charcoal",
}

const radiusStyle = (theme: Theme) =>
  ({ "--r": radii[theme.radius] }) as CSSProperties

/* ——— Canevas ——— */

type Action = "up" | "down" | "copy" | "hide" | "save" | "remove"

type Editor = {
  selected: string | null
  select: (id: string | null) => void
  theme: Theme
  openAdd: (t: Target) => void
  act: (action: Action, id: string) => void
}

const EditorContext = createContext<Editor | null>(null)
const useEditor = () => useContext(EditorContext)!

const hoverRing =
  "outline-offset-[-2px] [&:hover:not(:has([data-node]:hover))]:outline-2 [&:hover:not(:has([data-node]:hover))]:outline-control/50 [&:hover:not(:has([data-node]:hover))]:outline-dashed"

const barActions: { id: Action; icon: IconSvgElement; label: string }[] = [
  { icon: ArrowUp01Icon, id: "up", label: "Monter" },
  { icon: ArrowDown01Icon, id: "down", label: "Descendre" },
  { icon: Copy01Icon, id: "copy", label: "Dupliquer" },
  { icon: Delete02Icon, id: "remove", label: "Supprimer" },
]

function NodeBar({ node, inside }: { node: Node; inside: boolean }) {
  const ed = useEditor()
  const def = kit[node.type]
  return (
    <div
      className={cn(
        "absolute z-20 flex items-center gap-0.5 rounded-full bg-control p-1 text-control-foreground shadow-lg",
        inside ? "top-3 left-3" : "bottom-full left-0 mb-1.5"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="flex items-center gap-1.5 ps-2 pe-1.5 text-sm font-semibold whitespace-nowrap">
        <HugeiconsIcon className="size-4" icon={def.icon} />
        {def.label}
      </span>
      {barActions.map((a) => (
        <button
          aria-label={a.label}
          className="flex size-7 items-center justify-center rounded-full hover:bg-white/15"
          key={a.id}
          onClick={() => ed.act(a.id, node.id)}
          title={a.label}
          type="button"
        >
          <HugeiconsIcon className="size-4" icon={a.icon} />
        </button>
      ))}
    </div>
  )
}

function EmptySlot({ parent }: { parent: string }) {
  const ed = useEditor()
  return (
    <button
      className="flex min-h-24 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-current/25 font-semibold opacity-70 transition-opacity hover:opacity-100"
      onClick={(e) => {
        e.stopPropagation()
        ed.openAdd({ index: 0, parent })
      }}
      type="button"
    >
      <HugeiconsIcon className="size-5" icon={PlusSignIcon} />
      Ajouter un élément
    </button>
  )
}

function CanvasNode({ node, depth }: { node: Node; depth: number }) {
  const ed = useEditor()
  const def = kit[node.type]
  const children = node.children?.length
    ? node.children.map((c) => (
        <CanvasNode depth={depth + 1} key={c.id} node={c} />
      ))
    : def.slot && <EmptySlot parent={node.id} />
  const on = ed.selected === node.id
  return (
    <div
      className={cn(
        "relative",
        hoverRing,
        on && "z-10 outline-2 outline-control outline-solid",
        node.hidden && "opacity-40"
      )}
      data-id={node.id}
      data-node
      onClick={(e) => {
        e.stopPropagation()
        ed.select(node.id)
      }}
    >
      {def.render(node.props, { children, theme: ed.theme })}
      {on && <NodeBar inside={depth === 0} node={node} />}
    </div>
  )
}

/** Entre deux blocs : une ligne qui apparaît au survol pour en insérer un. */
function Gap({ index }: { index: number }) {
  const ed = useEditor()
  return (
    <div className="relative z-30 h-0">
      <button
        aria-label="Ajouter un bloc ici"
        className="absolute inset-x-0 -top-3 flex h-6 items-center opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          ed.openAdd({ index, parent: null })
        }}
        type="button"
      >
        <span className="h-0.5 flex-1 bg-control" />
        <span className="flex h-6 items-center gap-1 rounded-full bg-control px-3 text-xs font-semibold text-control-foreground">
          <HugeiconsIcon className="size-3.5" icon={PlusSignIcon} />
          Ajouter un bloc
        </span>
        <span className="h-0.5 flex-1 bg-control" />
      </button>
    </div>
  )
}

/* ——— Bibliothèque ——— */

/** Le bloc en vrai, réduit, pour choisir d'un coup d'œil. */
function Thumb({ node, theme }: { node: Node; theme: Theme }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative h-40 overflow-hidden rounded-2xl bg-background"
    >
      <div
        className="@container absolute top-0 left-0 w-[1120px] origin-top-left scale-[0.3]"
        style={radiusStyle(theme)}
      >
        {renderStatic(node, theme)}
      </div>
    </div>
  )
}

function Tile({ kind, onAdd }: { kind: Kind; onAdd: () => void }) {
  const def = kit[kind]
  return (
    <button
      className="flex flex-col items-center gap-2 rounded-2xl bg-muted px-2 py-3 text-center text-sm font-semibold transition-colors hover:bg-neutral-hover"
      onClick={onAdd}
      type="button"
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-full",
          groupTone[def.group]
        )}
      >
        <HugeiconsIcon className="size-5" icon={def.icon} />
      </span>
      {def.label}
    </button>
  )
}

function PresetCards({
  presets,
  theme,
  onAdd,
}: {
  presets: Preset[]
  theme: Theme
  onAdd: (node: Node) => void
}) {
  const built = useMemo(
    () => presets.map((p) => ({ ...p, node: p.build() })),
    [presets]
  )
  return (
    <div className="space-y-3">
      {built.map((p) => (
        <button
          className="w-full space-y-2 rounded-3xl bg-muted p-2 pb-3 text-start transition-colors hover:bg-neutral-hover"
          key={p.id}
          onClick={() => onAdd(clone(p.node))}
          type="button"
        >
          <Thumb node={p.node} theme={theme} />
          <span className="block px-2">
            <span className="block font-semibold">{p.label}</span>
            <span className="block text-sm text-muted-foreground">
              {p.description}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

function CategoryRow({
  category,
  onOpen,
}: {
  category: Category
  onOpen: () => void
}) {
  return (
    <button
      className={cn(listRow, "w-full text-start hover:bg-neutral-hover")}
      onClick={onOpen}
      type="button"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          category.tone
        )}
      >
        <HugeiconsIcon className="size-5" icon={category.icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{category.label}</span>
        <span className="block truncate text-sm text-muted-foreground">
          {category.presets.length} modèle{category.presets.length > 1 && "s"} ·{" "}
          {category.description}
        </span>
      </span>
      <HugeiconsIcon
        className="size-5 text-muted-foreground"
        icon={ArrowRight01Icon}
      />
    </button>
  )
}

function AddPanel({
  theme,
  saved,
  targetLabel,
  onClearTarget,
  onAdd,
  tab,
  onTab,
  category,
  onCategory,
}: {
  theme: Theme
  saved: Category | null
  targetLabel: string
  onClearTarget?: () => void
  onAdd: (node: Node) => void
  tab: "blocks" | "elements"
  onTab: (tab: "blocks" | "elements") => void
  category: string | null
  onCategory: (id: string | null) => void
}) {
  const [query, setQuery] = useState("")
  const all = saved ? [saved, ...categories] : categories
  const open = all.find((c) => c.id === category)
  const q = query.trim().toLowerCase()
  const kinds = Object.keys(kit) as Kind[]
  const elementsOf = (g: Group) => kinds.filter((k) => kit[k].group === g)

  let body: ReactNode
  if (q) {
    const presets = all.flatMap((c) =>
      c.presets.filter((p) =>
        `${c.label} ${p.label} ${p.description}`.toLowerCase().includes(q)
      )
    )
    const found = kinds.filter((k) => kit[k].label.toLowerCase().includes(q))
    body = (
      <>
        {found.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {found.map((k) => (
              <Tile key={k} kind={k} onAdd={() => onAdd(n(k))} />
            ))}
          </div>
        )}
        {presets.length > 0 && (
          <PresetCards onAdd={onAdd} presets={presets} theme={theme} />
        )}
        {!found.length && !presets.length && (
          <p className="py-8 text-center text-muted-foreground">
            Rien ne correspond à « {query} ».
          </p>
        )}
      </>
    )
  } else if (tab === "elements")
    body = (Object.keys(groups) as Group[]).map((g) => (
      <section className="space-y-3" key={g}>
        <div>
          <h3 className="font-display text-2xl">{groups[g].label}</h3>
          <p className="text-sm text-muted-foreground">
            {groups[g].description}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {elementsOf(g).map((k) => (
            <Tile key={k} kind={k} onAdd={() => onAdd(n(k))} />
          ))}
        </div>
      </section>
    ))
  else if (open)
    body = (
      <>
        <div className="flex items-center gap-3">
          <Button
            aria-label="Toutes les catégories"
            onClick={() => onCategory(null)}
            size="icon"
            variant="secondary"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <div className="min-w-0">
            <h3 className="font-display text-2xl">{open.label}</h3>
            <p className="text-sm text-muted-foreground">{open.description}</p>
          </div>
        </div>
        <PresetCards onAdd={onAdd} presets={open.presets} theme={theme} />
      </>
    )
  else
    body = (
      <div className={listCard}>
        {all.map((c) => (
          <CategoryRow
            category={c}
            key={c.id}
            onOpen={() => onCategory(c.id)}
          />
        ))}
      </div>
    )

  return (
    <div className="space-y-4">
      <h2 className="font-display text-4xl">Ajouter</h2>
      <SearchField
        label="Rechercher"
        onChange={setQuery}
        placeholder="Avis, bannière, horaires…"
        value={query}
      />
      {!q && (
        <FilterChips
          label="Type"
          onChange={onTab}
          options={[
            { label: "Blocs", value: "blocks" },
            { label: "Éléments", value: "elements" },
          ]}
          value={tab}
        />
      )}
      <p className="flex items-center gap-2 rounded-full bg-muted py-1 ps-4 pe-1 text-sm">
        <span className="min-w-0 flex-1 truncate">
          <span className="text-muted-foreground">Ajout :</span>{" "}
          <span className="font-semibold">{targetLabel}</span>
        </span>
        {onClearTarget ? (
          <Button
            aria-label="Annuler l'emplacement"
            className="size-7"
            onClick={onClearTarget}
            size="icon-sm"
            variant="ghost"
          >
            <HugeiconsIcon icon={Cancel01Icon} />
          </Button>
        ) : (
          <span className="size-7" />
        )}
      </p>
      {body}
    </div>
  )
}

/* ——— Structure, pages, thème ——— */

function Tree({ nodes, depth = 0 }: { nodes: Node[]; depth?: number }) {
  const ed = useEditor()
  return nodes.map((x) => {
    const def = kit[x.type]
    const on = ed.selected === x.id
    return (
      <Fragment key={x.id}>
        <div
          className={cn(
            "flex h-10 items-center rounded-full pe-1 text-sm font-semibold transition-colors",
            on ? "bg-control text-control-foreground" : "hover:bg-muted",
            x.hidden && "opacity-50"
          )}
          style={{ paddingInlineStart: 12 + depth * 18 }}
        >
          <button
            className="flex min-w-0 flex-1 items-center gap-2 text-start"
            onClick={() => ed.select(x.id)}
            type="button"
          >
            <HugeiconsIcon className="size-4 shrink-0" icon={def.icon} />
            <span className="truncate">{def.label}</span>
            {def.live && (
              <HugeiconsIcon
                className="size-3.5 shrink-0 opacity-60"
                icon={PawPrintIcon}
              />
            )}
          </button>
          <button
            aria-label={x.hidden ? "Afficher" : "Masquer"}
            className="flex size-8 items-center justify-center rounded-full hover:bg-neutral-hover"
            onClick={() => ed.act("hide", x.id)}
            type="button"
          >
            <HugeiconsIcon
              className="size-4"
              icon={x.hidden ? ViewOffIcon : ViewIcon}
            />
          </button>
        </div>
        {x.children && <Tree depth={depth + 1} nodes={x.children} />}
      </Fragment>
    )
  })
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          aria-pressed={o.value === value}
          className={cn(
            "h-9 rounded-full px-3.5 text-sm font-semibold transition-colors",
            o.value === value
              ? "bg-control text-control-foreground"
              : "bg-muted hover:bg-neutral-hover"
          )}
          key={o.value}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      {children}
    </div>
  )
}

function ThemePanel({
  theme,
  onChange,
}: {
  theme: Theme
  onChange: (t: Theme) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-4xl">Thème</h2>
      <Labeled label="Couleur du site">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(accents) as Theme["accent"][]).map((a) => (
            <button
              aria-pressed={theme.accent === a}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl bg-muted p-3 text-sm font-semibold ring-control transition-colors hover:bg-neutral-hover",
                theme.accent === a && "ring-2"
              )}
              key={a}
              onClick={() => onChange({ ...theme, accent: a })}
              type="button"
            >
              <span className={cn("size-9 rounded-full", accents[a].tone)} />
              {accents[a].label}
            </button>
          ))}
        </div>
      </Labeled>
      <Labeled label="Titres">
        <Chips
          onChange={(font) => onChange({ ...theme, font })}
          options={[
            { label: "Affirmés", value: "display" },
            { label: "Sobres", value: "sans" },
          ]}
          value={theme.font}
        />
      </Labeled>
      <Labeled label="Coins">
        <Chips
          onChange={(radius) => onChange({ ...theme, radius })}
          options={[
            { label: "Arrondis", value: "round" },
            { label: "Doux", value: "soft" },
            { label: "Droits", value: "square" },
          ]}
          value={theme.radius}
        />
      </Labeled>
      <Labeled label="Adresse du site">
        <div className="space-y-3 rounded-3xl bg-muted p-4">
          <p className="font-semibold">lescoteaux.kennelo.fr</p>
          <p className="text-sm text-muted-foreground">
            Gratuite et prête tout de suite. Vous pouvez aussi utiliser votre
            propre nom de domaine.
          </p>
          <Button
            className="w-full"
            onClick={() => notify("On vous guide par e-mail")}
            variant="secondary"
          >
            Relier mon nom de domaine
          </Button>
        </div>
      </Labeled>
    </div>
  )
}

/* ——— Inspecteur ——— */

function FieldControl({
  field,
  value,
  theme,
  onChange,
}: {
  field: Field
  value: string
  theme: Theme
  onChange: (v: string) => void
}) {
  switch (field.type) {
    case "toggle":
      return (
        <label className="flex items-center justify-between gap-3 text-sm font-semibold">
          {field.label}
          <Switch
            checked={value === "true"}
            onCheckedChange={(c) => onChange(String(c))}
          />
        </label>
      )
    case "text":
      return (
        <Labeled label={field.label}>
          <Input onChange={(e) => onChange(e.target.value)} value={value} />
        </Labeled>
      )
    case "textarea":
      return (
        <Labeled label={field.label}>
          <Textarea onChange={(e) => onChange(e.target.value)} value={value} />
        </Labeled>
      )
    case "choice":
      return (
        <Labeled label={field.label}>
          <Chips onChange={onChange} options={field.options} value={value} />
        </Labeled>
      )
    case "number": {
      const v = Number(value)
      const step = (by: number) =>
        onChange(String(Math.min(field.max, Math.max(field.min, v + by))))
      return (
        <Labeled label={field.label}>
          <div className="flex w-fit items-center gap-1 rounded-full bg-muted p-1">
            <Button
              aria-label="Moins"
              disabled={v <= field.min}
              onClick={() => step(-1)}
              size="icon-sm"
              variant="ghost"
            >
              −
            </Button>
            <span className="w-8 text-center font-semibold tabular-nums">
              {v}
            </span>
            <Button
              aria-label="Plus"
              disabled={v >= field.max}
              onClick={() => step(1)}
              size="icon-sm"
              variant="ghost"
            >
              +
            </Button>
          </div>
        </Labeled>
      )
    }
    case "tone":
      return (
        <Labeled label={field.label}>
          <div className="flex gap-2">
            {tones.map((t) => (
              <button
                aria-label={t.label}
                aria-pressed={value === t.value}
                className={cn(
                  "size-10 rounded-full border ring-control ring-offset-2 ring-offset-background",
                  toneClass(t.value, theme) || "bg-background",
                  value === t.value && "ring-2"
                )}
                key={t.value}
                onClick={() => onChange(t.value)}
                title={t.label}
                type="button"
              />
            ))}
          </div>
        </Labeled>
      )
    case "image":
      return (
        <Labeled label={field.label}>
          <div className="grid grid-cols-3 gap-2">
            {venue.photos.map((src) => (
              <button
                aria-pressed={value === src}
                className={cn(
                  "rounded-2xl ring-control ring-offset-2 ring-offset-background",
                  value === src && "ring-2"
                )}
                key={src}
                onClick={() => onChange(src)}
                type="button"
              >
                <Photo
                  alt=""
                  className="aspect-square rounded-2xl"
                  sizes="96px"
                  src={src}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Vos photos Kennelo. Ajoutez-en depuis Établissement.
          </p>
        </Labeled>
      )
  }
}

function Inspector({
  page,
  path,
  theme,
  onProp,
  onPage,
}: {
  page: Page
  path: Node[]
  theme: Theme
  onProp: (id: string, name: string, value: string) => void
  onPage: (patch: Partial<Page>) => void
}) {
  const ed = useEditor()
  const node = path.at(-1)

  if (!node)
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Page</p>
          <h2 className="font-display text-4xl">{page.title}</h2>
        </div>
        <Labeled label="Titre">
          <Input
            onChange={(e) => onPage({ title: e.target.value })}
            value={page.title}
          />
        </Labeled>
        <Labeled label="Adresse">
          <Input
            onChange={(e) => onPage({ slug: e.target.value })}
            value={page.slug}
          />
        </Labeled>
        <Labeled label="Description pour Google">
          <Textarea
            defaultValue={`${venue.name} : ${venue.tagline.toLowerCase()}. Réservation en ligne.`}
          />
        </Labeled>
        <div className="space-y-1 rounded-3xl bg-muted p-4">
          <p className="font-semibold">
            Cliquez sur un élément pour le modifier
          </p>
          <p className="text-sm text-muted-foreground">
            Survolez l&apos;espace entre deux blocs pour en ajouter un, ou
            ouvrez Ajouter.
          </p>
        </div>
      </div>
    )

  const def = kit[node.type]
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full",
            groupTone[def.group] === "bg-background"
              ? "bg-muted"
              : groupTone[def.group]
          )}
        >
          <HugeiconsIcon icon={def.icon} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-muted-foreground">
            {groups[def.group].label}
          </p>
          <h2 className="font-display text-3xl">{def.label}</h2>
        </div>
        <Button
          aria-label="Fermer"
          onClick={() => ed.select(null)}
          size="icon"
          variant="secondary"
        >
          <HugeiconsIcon icon={Cancel01Icon} />
        </Button>
      </div>

      {path.length > 1 && (
        <nav
          aria-label="Emplacement"
          className="flex flex-wrap items-center gap-1 text-sm"
        >
          {path.map((x, i) => (
            <Fragment key={x.id}>
              {i > 0 && <span className="text-muted-foreground">›</span>}
              <button
                className={cn(
                  "rounded-full px-2.5 py-1 font-semibold",
                  x.id === node.id
                    ? "bg-control text-control-foreground"
                    : "bg-muted hover:bg-neutral-hover"
                )}
                onClick={() => ed.select(x.id)}
                type="button"
              >
                {kit[x.type].label}
              </button>
            </Fragment>
          ))}
        </nav>
      )}

      {def.live && (
        <p className="flex gap-3 rounded-3xl bg-wise-green p-4 text-sm text-wise-forest">
          <HugeiconsIcon className="size-5 shrink-0" icon={PawPrintIcon} />
          <span>
            <span className="block font-semibold">Relié à Kennelo</span>
            {def.live}
          </span>
        </p>
      )}

      {def.fields.filter((f) => !f.when || f.when(node.props)).length > 0 && (
        <div className="space-y-5">
          {def.fields
            .filter((f) => !f.when || f.when(node.props))
            .map((f) => (
              <FieldControl
                field={f}
                key={f.name}
                onChange={(v) => onProp(node.id, f.name, v)}
                theme={theme}
                value={node.props[f.name] ?? ""}
              />
            ))}
        </div>
      )}

      {node.children && (
        <Labeled label={`Contenu · ${node.children.length}`}>
          <div className={listCard}>
            {node.children.map((c) => (
              <button
                className={cn(
                  listRow,
                  "w-full py-2.5 text-start font-semibold hover:bg-neutral-hover"
                )}
                key={c.id}
                onClick={() => ed.select(c.id)}
                type="button"
              >
                <HugeiconsIcon className="size-5" icon={kit[c.type].icon} />
                <span className="flex-1">{kit[c.type].label}</span>
                <HugeiconsIcon
                  className="size-4 text-muted-foreground"
                  icon={ArrowRight01Icon}
                />
              </button>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={() =>
              ed.openAdd({ index: node.children!.length, parent: node.id })
            }
            variant="secondary"
          >
            <HugeiconsIcon icon={PlusSignIcon} />
            Ajouter dans « {def.label} »
          </Button>
        </Labeled>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => ed.act("copy", node.id)} variant="secondary">
          <HugeiconsIcon icon={Copy01Icon} />
          Dupliquer
        </Button>
        <Button onClick={() => ed.act("hide", node.id)} variant="secondary">
          <HugeiconsIcon icon={node.hidden ? ViewIcon : ViewOffIcon} />
          {node.hidden ? "Afficher" : "Masquer"}
        </Button>
        <Button onClick={() => ed.act("save", node.id)} variant="secondary">
          <HugeiconsIcon icon={Bookmark01Icon} />
          Garder
        </Button>
        <Button
          onClick={() => ed.act("remove", node.id)}
          variant="destructive-outline"
        >
          <HugeiconsIcon icon={Delete02Icon} />
          Supprimer
        </Button>
      </div>
    </div>
  )
}

/* ——— L'éditeur ——— */

type Panel = "add" | "layers" | "pages" | "theme"
type Device = "desktop" | "tablet" | "mobile"

const rail: { id: Panel; icon: IconSvgElement; label: string }[] = [
  { icon: PlusSignIcon, id: "add", label: "Ajouter" },
  { icon: Layers01Icon, id: "layers", label: "Structure" },
  { icon: Files01Icon, id: "pages", label: "Pages" },
  { icon: PaintBoardIcon, id: "theme", label: "Thème" },
]

const devices: {
  id: Device
  icon: IconSvgElement
  label: string
  width: string
}[] = [
  {
    icon: ComputerIcon,
    id: "desktop",
    label: "Ordinateur",
    width: "max-w-6xl",
  },
  {
    icon: Tablet01Icon,
    id: "tablet",
    label: "Tablette",
    width: "max-w-[48rem]",
  },
  {
    icon: SmartPhone01Icon,
    id: "mobile",
    label: "Mobile",
    width: "max-w-[24.5rem]",
  },
]

export function SiteEditor() {
  const [doc, setDoc] = useState(() => ({
    future: [] as Page[][],
    pages: initialPages(),
    past: [] as Page[][],
  }))
  const [pageId, setPageId] = useState("home")
  const [selected, setSelected] = useState<string | null>(null)
  const [panel, setPanel] = useState<Panel | null>("add")
  const [tab, setTab] = useState<"blocks" | "elements">("blocks")
  const [category, setCategory] = useState<string | null>(null)
  const [pending, setPending] = useState<Target | null>(null)
  const [device, setDevice] = useState<Device>("desktop")
  const [preview, setPreview] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [theme, setTheme] = useState<Theme>({
    accent: "orange",
    font: "display",
    radius: "round",
  })
  const [saved, setSaved] = useState<Preset[]>([])

  const page = doc.pages.find((p) => p.id === pageId) ?? doc.pages[0]
  const path = selected ? pathTo(page.nodes, selected) : []
  const node = path.at(-1)

  const commit = (fn: (pages: Page[]) => Page[]) => {
    setDoc((d) => ({
      future: [],
      pages: fn(d.pages),
      past: [...d.past, d.pages].slice(-50),
    }))
    setDirty(true)
  }
  const change = (fn: (nodes: Node[]) => Node[]) =>
    commit((pages) =>
      pages.map((p) => (p.id === page.id ? { ...p, nodes: fn(p.nodes) } : p))
    )
  const history = (back: boolean) =>
    setDoc((d) => {
      const from = back ? d.past : d.future
      if (!from.length) return d
      const prev = from.at(-1)!
      return back
        ? {
            future: [d.pages, ...d.future],
            pages: prev,
            past: d.past.slice(0, -1),
          }
        : {
            future: d.future.slice(1),
            pages: d.future[0],
            past: [...d.past, d.pages],
          }
    })

  /** Où va le prochain ajout : l'emplacement choisi, sinon près de l'élément sélectionné. */
  const target: Target = (() => {
    if (pending) return pending
    if (node && kit[node.type].slot)
      return { index: node.children!.length, parent: node.id }
    if (node) {
      const parent = path.at(-2)
      const siblings = parent?.children ?? page.nodes
      return { index: siblings.indexOf(node) + 1, parent: parent?.id ?? null }
    }
    const footer = page.nodes.findIndex((x) => x.type === "footer")
    return { index: footer < 0 ? page.nodes.length : footer, parent: null }
  })()
  const targetLabel = target.parent
    ? `dans « ${kit[pathTo(page.nodes, target.parent).at(-1)!.type].label} »`
    : target.index >= page.nodes.length
      ? "en bas de la page"
      : `avant « ${kit[page.nodes[target.index].type].label} »`

  const add = (item: Node) => {
    const wrapped =
      target.parent === null && !topLevel.includes(item.type)
        ? n("section", {}, [item])
        : item
    change((nodes) => insert(nodes, target, wrapped))
    setSelected(item.id)
    setPending(null)
    setTimeout(
      () =>
        document
          .querySelector(`[data-id="${item.id}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      50
    )
  }

  const act = (action: Action, id: string) => {
    if (action === "save") {
      const found = pathTo(page.nodes, id).at(-1)!
      setSaved((s) => [
        ...s,
        {
          build: () => clone(found),
          description: "Enregistré par vous",
          id: `saved-${id}-${s.length}`,
          label: `${kit[found.type].label} ${s.length + 1}`,
        },
      ])
      notify("Ajouté à « Mes blocs »")
      return
    }
    change((nodes) =>
      walk(nodes, (list) => {
        if (action === "up" || action === "down")
          return move(list, id, action === "up" ? -1 : 1)
        if (action === "remove") return list.filter((x) => x.id !== id)
        if (action === "copy")
          return list.flatMap((x) => (x.id === id ? [x, clone(x)] : [x]))
        return list.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x))
      })
    )
    if (action === "remove") setSelected(null)
  }

  const editor: Editor = {
    act,
    openAdd: (t) => {
      setPending(t)
      setPanel("add")
      setTab(t.parent ? "elements" : "blocks")
      setCategory(null)
    },
    select: setSelected,
    selected,
    theme,
  }

  const savedCategory: Category | null = saved.length
    ? {
        description: "Les blocs que vous avez gardés",
        icon: Bookmark01Icon,
        id: "saved",
        label: "Mes blocs",
        presets: saved,
        tone: "bg-control text-control-foreground",
      }
    : null

  const frame = (
    <div
      className={cn(
        "@container mx-auto overflow-hidden rounded-3xl bg-background shadow-xl/5 transition-[max-width] duration-300",
        devices.find((d) => d.id === device)!.width
      )}
      style={radiusStyle(theme)}
    >
      {preview
        ? page.nodes.map((x) => renderStatic(x, theme))
        : page.nodes.map((x, i) => (
            <Fragment key={x.id}>
              <Gap index={i} />
              <CanvasNode depth={0} node={x} />
            </Fragment>
          ))}
      {!preview && <Gap index={page.nodes.length} />}
    </div>
  )

  return (
    <EditorContext value={editor}>
      <div className="flex h-dvh flex-col bg-background">
        <header className="grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b px-3 md:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              aria-label="Retour"
              render={<Link href="/settings/organization" />}
              size="icon"
              variant="secondary"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} />
            </Button>
            <VenueLogo
              className={cn(
                "size-10 text-lg max-md:hidden",
                accents[theme.accent].tone
              )}
              venue={venue}
            />
            <div className="min-w-0 max-xl:hidden">
              <p className="truncate font-semibold">{venue.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                lescoteaux.kennelo.fr{page.slug === "/" ? "" : page.slug}
              </p>
            </div>
            <button
              className="flex h-10 items-center gap-2 rounded-full bg-muted px-4 font-semibold hover:bg-neutral-hover"
              onClick={() => setPanel("pages")}
              type="button"
            >
              <HugeiconsIcon className="size-5" icon={File01Icon} />
              {page.title}
              <HugeiconsIcon className="size-4" icon={ArrowDown01Icon} />
            </button>
          </div>

          <div
            className="flex rounded-full bg-muted p-1"
            role="group"
            aria-label="Taille d'écran"
          >
            {devices.map((d) => (
              <button
                aria-label={d.label}
                aria-pressed={device === d.id}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-colors",
                  device === d.id
                    ? "bg-control text-control-foreground"
                    : "hover:bg-neutral-hover"
                )}
                key={d.id}
                onClick={() => setDevice(d.id)}
                title={d.label}
                type="button"
              >
                <HugeiconsIcon className="size-5" icon={d.icon} />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground max-2xl:hidden">
              <span
                className={cn(
                  "size-2 rounded-full",
                  dirty ? "bg-warning" : "bg-primary-active"
                )}
              />
              {dirty ? "Modifications non publiées" : "Tout est publié"}
            </span>
            <Button
              aria-label="Annuler"
              disabled={!doc.past.length}
              onClick={() => history(true)}
              size="icon"
              variant="ghost"
            >
              <HugeiconsIcon icon={UndoIcon} />
            </Button>
            <Button
              aria-label="Rétablir"
              disabled={!doc.future.length}
              onClick={() => history(false)}
              size="icon"
              variant="ghost"
            >
              <HugeiconsIcon icon={RedoIcon} />
            </Button>
            <Button onClick={() => setPreview(!preview)} variant="secondary">
              <HugeiconsIcon icon={preview ? ViewOffIcon : ViewIcon} />
              <span className="max-lg:hidden">
                {preview ? "Modifier" : "Aperçu"}
              </span>
            </Button>
            <Button
              onClick={() => {
                setDirty(false)
                notify("Site publié sur lescoteaux.kennelo.fr")
              }}
            >
              Publier
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {!preview && (
            <>
              <nav
                aria-label="Outils"
                className="flex w-20 shrink-0 flex-col items-center gap-1 border-e py-3"
              >
                {rail.map((r) => (
                  <button
                    aria-pressed={panel === r.id}
                    className="group flex w-full flex-col items-center gap-1 py-1 text-xs font-semibold"
                    key={r.id}
                    onClick={() => setPanel(panel === r.id ? null : r.id)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-full transition-colors",
                        panel === r.id
                          ? "bg-control text-control-foreground"
                          : "group-hover:bg-muted"
                      )}
                    >
                      <HugeiconsIcon className="size-5" icon={r.icon} />
                    </span>
                    {r.label}
                  </button>
                ))}
              </nav>
              {panel && (
                <aside className="w-96 shrink-0 overflow-y-auto border-e p-4">
                  {panel === "add" && (
                    <AddPanel
                      category={category}
                      onAdd={add}
                      onCategory={setCategory}
                      onClearTarget={
                        pending ? () => setPending(null) : undefined
                      }
                      onTab={setTab}
                      saved={savedCategory}
                      tab={tab}
                      targetLabel={targetLabel}
                      theme={theme}
                    />
                  )}
                  {panel === "layers" && (
                    <div className="space-y-4">
                      <h2 className="font-display text-4xl">Structure</h2>
                      <p className="text-sm text-muted-foreground">
                        Chaque bloc est fait d&apos;éléments : cliquez pour le
                        modifier, l&apos;œil le masque.
                      </p>
                      <div className="space-y-0.5">
                        <Tree nodes={page.nodes} />
                      </div>
                    </div>
                  )}
                  {panel === "pages" && (
                    <div className="space-y-4">
                      <h2 className="font-display text-4xl">Pages</h2>
                      <div className={listCard}>
                        {doc.pages.map((p) => (
                          <button
                            className={cn(
                              listRow,
                              "w-full text-start",
                              p.id === page.id
                                ? "bg-control text-control-foreground"
                                : "hover:bg-neutral-hover"
                            )}
                            key={p.id}
                            onClick={() => {
                              setPageId(p.id)
                              setSelected(null)
                            }}
                            type="button"
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground">
                              <HugeiconsIcon
                                className="size-5"
                                icon={p.slug === "/" ? Home01Icon : File01Icon}
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold">
                                {p.title}
                              </span>
                              <span className="block truncate text-sm opacity-70">
                                {p.slug}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          const id = `page-${doc.pages.length + 1}`
                          commit((pages) => [
                            ...pages,
                            {
                              id,
                              nodes: [
                                n("navbar"),
                                n("section", {}, [
                                  n("heading", { text: "Nouvelle page" }),
                                ]),
                                n("footer", { layout: "simple" }),
                              ],
                              slug: "/nouvelle-page",
                              title: "Nouvelle page",
                            },
                          ])
                          setPageId(id)
                          setSelected(null)
                        }}
                        variant="secondary"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} />
                        Nouvelle page
                      </Button>
                    </div>
                  )}
                  {panel === "theme" && (
                    <ThemePanel onChange={setTheme} theme={theme} />
                  )}
                </aside>
              )}
            </>
          )}

          <main
            className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-muted p-4 md:p-8"
            onClick={() => setSelected(null)}
          >
            {frame}
          </main>

          {!preview && (
            <aside className="w-80 shrink-0 overflow-y-auto border-s p-4 xl:w-96">
              <Inspector
                onPage={(patch) =>
                  commit((pages) =>
                    pages.map((p) =>
                      p.id === page.id ? { ...p, ...patch } : p
                    )
                  )
                }
                onProp={(id, name, value) =>
                  change((nodes) =>
                    walk(nodes, (list) =>
                      list.map((x) =>
                        x.id === id
                          ? { ...x, props: { ...x.props, [name]: value } }
                          : x
                      )
                    )
                  )
                }
                page={page}
                path={path}
                theme={theme}
              />
            </aside>
          )}
        </div>
      </div>
    </EditorContext>
  )
}
