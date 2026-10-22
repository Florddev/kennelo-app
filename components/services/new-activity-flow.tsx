"use client"

import { activityColors, colorName } from "@/components/activity-mark"
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  PlusSignIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import { PeriodDialog, PeriodDot } from "@/components/periods/period-forms"
import { ReuseRow, useReusable } from "@/components/services/activity-offers"
import {
  createActivity,
  type GridRow,
  type MetierId,
  metierOf,
  metiers,
  newId,
  type Offer,
  offer,
  type Place,
  periodDates,
  periodRate,
  placeRate,
  type Service,
  type Species,
  speciesList,
  useCatalog,
} from "@/components/services/data"
import { ActivityDot, ActivityTag } from "@/components/services/service-form"
import { members } from "@/components/settings/data"
import { SettingsPage } from "@/components/settings/settings-ui"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Frame, FramePanel } from "@/components/ui/frame"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/* ——— Modèles proposés selon le métier ——— */

type ServiceDraft = {
  id: string
  name: string
  duration: number
  prices: string[]
  bundle?: string[]
}

type OptionDraft = {
  id: string
  name: string
  price: string
  perNight: boolean
  included: boolean
}

type Reuse = Record<string, Pick<Offer, "adjust" | "included" | "perNight">>

const t = (name: string, duration: number, prices: (number | "")[]) => ({
  duration,
  name,
  prices: prices.map(String),
})

const serviceTemplates: Partial<Record<MetierId, ReturnType<typeof t>[]>> = {
  comportement: [
    t("Bilan comportemental", 90, [60, 60]),
    t("Suivi", 60, [40, 40]),
  ],
  education: [
    t("Séance individuelle", 60, [45, ""]),
    t("Bilan comportemental", 90, [60, 60]),
    t("Cours collectif", 60, [18, ""]),
  ],
  osteo: [
    t("Séance d'ostéopathie", 60, [55, 50]),
    t("Séance de suivi", 45, [45, 40]),
  ],
  promenade: [
    t("Promenade 30 min", 30, [12, ""]),
    t("Promenade 1 h", 60, [20, ""]),
    t("Balade en groupe", 90, [15, ""]),
  ],
  taxi: [
    t("Trajet local", 45, [25, 25]),
    t("Trajet longue distance", 90, [45, 45]),
  ],
  toilettage: [
    t("Bain & brossage", 45, [30, 35, 45, 35]),
    t("Coupe", 60, [30, 38, 48, ""]),
    t("Griffes", 15, [10, 10, 10, 10]),
    t("Toilettage complet", 120, [55, 65, 80, ""]),
  ],
  visites: [t("Visite 30 min", 30, [14, 14]), t("Visite 1 h", 60, [22, 22])],
}

const optionTemplates = [
  { name: "Promenade", price: "6" },
  { name: "Traitement", price: "3" },
  { name: "Régime", price: "2" },
  { name: "Nouvelles en photo", price: "2" },
]

const columnsOf = (metier: MetierId | null) =>
  metier === "toilettage"
    ? ["Petit", "Moyen", "Grand", "Chat"]
    : ["Chien", "Chat"]

const gridOf = (metier: MetierId, draft: ServiceDraft): GridRow[] =>
  columnsOf(metier).flatMap((column, i) => {
    const price = Number(draft.prices[i])
    if (draft.prices[i] === "" || Number.isNaN(price)) return []
    const row: GridRow =
      column === "Chat" || column === "Chien"
        ? { duration: draft.duration, price, species: column }
        : {
            duration: draft.duration,
            price,
            size: column as GridRow["size"],
            species: "Chien",
          }
    return [row]
  })

/** Place en cours de création : son prix devient celui de la période de base. */
type PlaceDraft = Place & { price: number; extra: number }

const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const daysLabel = (days: number[]) => {
  const sorted = [...days].sort()
  if (sorted.length === 7) return "Tous les jours"
  const contiguous = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1)
  return contiguous && sorted.length > 2
    ? `${dayNames[sorted[0]]} – ${dayNames[sorted.at(-1)!]}`
    : sorted.map((d) => dayNames[d]).join(", ")
}
const hour = (value: string) => value.replace(":00", "h").replace(":", "h")

const colors = activityColors
const steps = [
  "Métier",
  "Infos pratiques",
  "Tarifs",
  "Suppléments",
  "Récapitulatif",
]

/* ——— Petits blocs ——— */

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="-mt-1 text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  )
}

function Unit({
  value,
  unit,
  label,
  onChange,
  className = "w-28",
  disabled,
}: {
  value: string | number
  unit: string
  label: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}) {
  return (
    <InputGroup className={className}>
      <InputGroupInput
        aria-label={label}
        className="tabular-nums"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        size="sm"
        type="number"
        value={value}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>{unit}</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}

function Card({
  children,
  onRemove,
  className,
}: {
  children: ReactNode
  onRemove?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative space-y-3 rounded-2xl border bg-card p-4",
        className
      )}
    >
      {onRemove && (
        <Button
          aria-label="Retirer"
          className="absolute end-2 top-2"
          onClick={onRemove}
          size="icon-xs"
          variant="ghost"
        >
          <HugeiconsIcon icon={Cancel01Icon} />
        </Button>
      )}
      {children}
    </div>
  )
}

function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      aria-pressed={pressed}
      onClick={onClick}
      size="xs"
      variant={pressed ? "secondary" : "outline"}
    >
      {children}
    </Button>
  )
}

function Stepper({
  step,
  reached,
  onStep,
}: {
  step: number
  reached: number
  onStep: (step: number) => void
}) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, i) => (
        <li
          className="flex flex-1 items-center gap-2 last:flex-none"
          key={label}
        >
          <button
            className="flex items-center gap-2 disabled:cursor-default"
            disabled={i > reached}
            onClick={() => onStep(i)}
            type="button"
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-muted-foreground transition-colors",
                i < step &&
                  "border-transparent bg-primary text-primary-foreground",
                i === step && "border-ring text-foreground ring-3 ring-ring/25"
              )}
            >
              {i < step ? (
                <HugeiconsIcon className="size-3.5" icon={Tick02Icon} />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                "hidden text-sm whitespace-nowrap lg:inline",
                i === step ? "font-medium" : "text-muted-foreground",
                i === step && "inline"
              )}
            >
              {label}
            </span>
          </button>
          {i < steps.length - 1 && (
            <span className="h-px min-w-3 flex-1 bg-border" />
          )}
        </li>
      ))}
    </ol>
  )
}

/* ——— Parcours ——— */

export function NewActivityFlow() {
  const catalog = useCatalog()
  const [step, setStep] = useState(0)
  const [reached, setReached] = useState(0)
  const [metier, setMetier] = useState<MetierId | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState(colors[0])
  const [days, setDays] = useState([0, 1, 2, 3, 4, 5])
  const [hours, setHours] = useState({ from: "09:00", to: "18:00" })
  const [team, setTeam] = useState<string[]>([members[0].name])
  const [where, setWhere] = useState({
    fee: 0.5,
    home: false,
    onSite: true,
    radius: 15,
    remote: false,
  })
  const [places, setPlaces] = useState<PlaceDraft[]>([])
  const [seasons, setSeasons] = useState<Record<string, number>>({})
  const [minStay, setMinStay] = useState(1)
  const [services, setServices] = useState<ServiceDraft[]>([])
  const [options, setOptions] = useState<OptionDraft[]>([])
  const [reuse, setReuse] = useState<Reuse>({})
  const [created, setCreated] = useState<string | null>(null)
  const reusable = useReusable(null)

  const info = metier ? metierOf(metier) : null
  const stay = info?.journey === "stay"
  const unit = metier === "garderie" ? "jour" : "nuit"
  const label = name.trim() || info?.label || "Nouvelle activité"
  const columns = columnsOf(metier)
  const exists = (n: string) =>
    catalog.services.some((s) => s.name.toLowerCase() === n.toLowerCase())
  const accepted = [...new Set(places.flatMap((p) => p.species))]
  const reused = Object.keys(reuse)
    .map((id) => catalog.services.find((s) => s.id === id))
    .filter((s): s is Service => !!s)

  const chooseMetier = (id: MetierId) => {
    setMetier(id)
    const journey = metierOf(id).journey
    setPlaces(
      journey === "stay"
        ? [
            {
              animals: 1,
              count: 10,
              extra: 0,
              name: id === "garderie" ? "Place" : "Box",
              price: id === "garderie" ? 18 : 25,
              species: ["Chien"],
            },
          ]
        : []
    )
    setServices(
      (serviceTemplates[id] ?? [])
        .filter((tpl) => !exists(tpl.name))
        .map((tpl) => ({ ...tpl, id: newId(tpl.name) }))
    )
    setOptions(
      journey === "stay"
        ? optionTemplates
            .filter((tpl) => !exists(tpl.name))
            .map((tpl) => ({
              ...tpl,
              id: newId(tpl.name),
              included: false,
              perNight: true,
            }))
        : []
    )
    setDays(journey === "stay" ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5])
  }

  const toggleSeason = (id: string, on: boolean) =>
    setSeasons((current) => {
      const next = { ...current }
      if (on) next[id] = 20
      else delete next[id]
      return next
    })
  const setPlace = (i: number, patch: Partial<PlaceDraft>) =>
    setPlaces((list) => list.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  const setService = (i: number, patch: Partial<ServiceDraft>) =>
    setServices((list) =>
      list.map((s, j) => (j === i ? { ...s, ...patch } : s))
    )
  const setOption = (i: number, patch: Partial<OptionDraft>) =>
    setOptions((list) => list.map((o, j) => (j === i ? { ...o, ...patch } : o)))

  const validServices = services.every(
    (s) => s.name.trim() && gridOf(metier ?? "education", s).length
  )
  const valid = [
    metier !== null,
    days.length > 0,
    stay
      ? places.length > 0 &&
        places.every((p) => p.name.trim() && p.price > 0 && p.species.length)
      : validServices,
    options.every((o) => o.name.trim() && o.price !== ""),
    stay || services.length + reused.length > 0,
  ]

  const go = (next: number) => {
    setStep(next)
    setReached((r) => Math.max(r, next))
  }

  const submit = () => {
    if (!metier) return
    const id = newId(label)
    const own: Service[] = stay
      ? options.map((o) => ({
          active: true,
          description: "",
          detailed: false,
          grid: (accepted.length ? accepted : (["Chien"] as Species[])).map(
            (species) => ({ duration: 0, price: Number(o.price), species })
          ),
          id: o.id,
          name: o.name.trim(),
          owner: id,
          scheduled: false,
        }))
      : services.map((s) => ({
          active: true,
          bundle: s.bundle?.length ? s.bundle : undefined,
          description: "",
          detailed: metier === "toilettage",
          grid: gridOf(metier, s),
          id: s.id,
          name: s.name.trim(),
          owner: id,
          scheduled: true,
        }))
    createActivity({
      activity: {
        color,
        hours: `${daysLabel(days)} · ${hour(hours.from)} – ${hour(hours.to)}`,
        id,
        metier,
        name: label,
      },
      offers: [
        ...own.map((s) =>
          offer(
            s.id,
            stay
              ? {
                  included: options.find((o) => o.id === s.id)?.included,
                  perNight: options.find((o) => o.id === s.id)?.perNight,
                }
              : {}
          )
        ),
        ...Object.entries(reuse).map(([serviceId, r]) => offer(serviceId, r)),
      ],
      places: stay
        ? places.map((p) => ({
            animals: p.animals,
            count: p.count,
            name: p.name,
            species: p.species,
          }))
        : [],
      rates: stay
        ? [
            periodRate(catalog.periods.find((p) => p.base)!.id, {
              closed: [0, 1, 2, 3, 4, 5, 6].filter((d) => !days.includes(d)),
              minStay,
              places: Object.fromEntries(
                places.map((p) => [p.name, placeRate(p.price, p.extra)])
              ),
            }),
            ...Object.entries(seasons).map(([periodId, percent]) =>
              periodRate(periodId, { percent })
            ),
          ]
        : [],
      services: own,
    })
    setCreated(label)
  }

  if (created) {
    const count = (stay ? options.length : services.length) + reused.length
    return (
      <SettingsPage
        back={{ href: "/settings/activities", label: "Activités" }}
        title="Activité créée"
      >
        <Frame>
          <FramePanel className="space-y-4 py-10 text-center">
            <HugeiconsIcon
              className="mx-auto size-10 text-success"
              icon={CheckmarkCircle02Icon}
            />
            <div className="space-y-1">
              <p className="font-heading text-xl font-semibold">
                {created} est prête
              </p>
              <p className="text-sm text-muted-foreground">
                {stay && `${places.reduce((n, p) => n + p.count, 0)} places · `}
                {count} prestations en vente
                {reused.length > 0 &&
                  `, dont ${reused.length} reprises de vos autres activités`}
              </p>
            </div>
            <Button render={<Link href="/settings/activities" />}>
              Voir mes activités
            </Button>
          </FramePanel>
        </Frame>
      </SettingsPage>
    )
  }

  return (
    <SettingsPage
      back={{ href: "/settings/activities", label: "Activités" }}
      description="Décrivez votre activité et ses prix : tout le reste se configure automatiquement."
      title="Nouvelle activité"
    >
      <Stepper onStep={go} reached={reached} step={step} />

      <div className="space-y-6">
        {step === 0 && (
          <>
            {(["stay", "appointment"] as const).map((journey) => (
              <Field
                hint={
                  journey === "stay"
                    ? "Le client réserve des dates et une place, puis ajoute des options."
                    : "Le client réserve une prestation et un créneau dans votre agenda."
                }
                key={journey}
                label={journey === "stay" ? "Séjour" : "Rendez-vous"}
              >
                <div className="grid gap-2 sm:grid-cols-3">
                  {metiers
                    .filter((m) => m.journey === journey)
                    .map((m) => (
                      <button
                        aria-pressed={metier === m.id}
                        className={cn(
                          "rounded-2xl border bg-card px-3.5 py-3 text-start transition-colors hover:bg-accent",
                          metier === m.id &&
                            "border-ring/60 bg-accent ring-2 ring-ring/30"
                        )}
                        key={m.id}
                        onClick={() => chooseMetier(m.id)}
                        type="button"
                      >
                        <span className="block text-sm font-medium">
                          {m.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {m.hint}
                        </span>
                      </button>
                    ))}
                </div>
              </Field>
            ))}
            {info && (
              <Field label="Nom et couleur">
                <div className="flex flex-wrap items-center gap-3">
                  <ActivityDot
                    activity={{
                      color,
                      id: "preview",
                      metier: info.id,
                      name: label,
                    }}
                  />
                  <Input
                    aria-label="Nom de l'activité"
                    className="w-full sm:w-64"
                    onChange={(e) => setName(e.target.value)}
                    placeholder={info.label}
                    value={name}
                  />
                  <div className="flex gap-1.5">
                    {colors.map((c) => (
                      <button
                        aria-label={`Couleur ${colorName(c)}`}
                        aria-pressed={c === color}
                        className={cn(
                          "size-6 rounded-full ring-offset-2 ring-offset-background",
                          c,
                          c === color && "ring-2 ring-ring"
                        )}
                        key={c}
                        onClick={() => setColor(c)}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
              </Field>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Jours d'ouverture">
              <div className="flex flex-wrap gap-1.5">
                {dayNames.map((day, i) => (
                  <Toggle
                    key={day}
                    onClick={() =>
                      setDays((list) =>
                        list.includes(i)
                          ? list.filter((d) => d !== i)
                          : [...list, i]
                      )
                    }
                    pressed={days.includes(i)}
                  >
                    {day}
                  </Toggle>
                ))}
              </div>
            </Field>
            <Field label={stay ? "Arrivées et départs" : "Horaires"}>
              <div className="flex items-center gap-2">
                <Input
                  aria-label="Ouverture"
                  className="w-32"
                  onChange={(e) => setHours({ ...hours, from: e.target.value })}
                  size="sm"
                  type="time"
                  value={hours.from}
                />
                <span className="text-sm text-muted-foreground">à</span>
                <Input
                  aria-label="Fermeture"
                  className="w-32"
                  onChange={(e) => setHours({ ...hours, to: e.target.value })}
                  size="sm"
                  type="time"
                  value={hours.to}
                />
              </div>
            </Field>
            {!stay && (
              <Field hint="Où se déroulent les rendez-vous" label="Lieu">
                <Frame>
                  <FramePanel className="divide-y p-0">
                    <Label className="flex items-center gap-3 px-4 py-3 font-normal">
                      <span className="flex-1 text-sm font-medium">
                        Chez vous
                      </span>
                      <Switch
                        checked={where.onSite}
                        onCheckedChange={(onSite) =>
                          setWhere({ ...where, onSite })
                        }
                      />
                    </Label>
                    <div className="space-y-3 px-4 py-3">
                      <Label className="flex items-center gap-3 font-normal">
                        <span className="flex-1 text-sm font-medium">
                          Chez le client
                        </span>
                        <Switch
                          checked={where.home}
                          onCheckedChange={(home) =>
                            setWhere({ ...where, home })
                          }
                        />
                      </Label>
                      {where.home && (
                        <div className="flex flex-wrap gap-2">
                          <Unit
                            label="Rayon"
                            onChange={(v) =>
                              setWhere({ ...where, radius: Number(v) })
                            }
                            unit="km"
                            value={where.radius}
                          />
                          <Unit
                            className="w-36"
                            label="Frais de déplacement"
                            onChange={(v) =>
                              setWhere({ ...where, fee: Number(v) })
                            }
                            unit="€ / km"
                            value={where.fee}
                          />
                        </div>
                      )}
                    </div>
                    {(metier === "education" || metier === "comportement") && (
                      <Label className="flex items-center gap-3 px-4 py-3 font-normal">
                        <span className="flex-1 text-sm font-medium">
                          À distance
                        </span>
                        <Switch
                          checked={where.remote}
                          onCheckedChange={(remote) =>
                            setWhere({ ...where, remote })
                          }
                        />
                      </Label>
                    )}
                  </FramePanel>
                </Frame>
              </Field>
            )}
            <Field
              hint="Une personne n'est jamais réservée deux fois, même sur plusieurs activités"
              label="Équipe"
            >
              <div className="grid gap-1.5 sm:grid-cols-2">
                {members.map((m) => (
                  <Label
                    className="flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2 font-normal"
                    key={m.name}
                  >
                    <Checkbox
                      checked={team.includes(m.name)}
                      onCheckedChange={(on) =>
                        setTeam((list) =>
                          on
                            ? [...list, m.name]
                            : list.filter((n) => n !== m.name)
                        )
                      }
                    />
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[0.625rem]">
                        {m.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{m.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {m.job}
                      </span>
                    </span>
                  </Label>
                ))}
              </div>
            </Field>
          </>
        )}

        {step === 2 && stay && (
          <>
            <Field
              hint="Le client réserve une place pour ses dates"
              label="Places"
            >
              <div className="space-y-2">
                {places.map((place, i) => (
                  <Card
                    key={i}
                    onRemove={
                      places.length > 1
                        ? () => setPlaces((l) => l.filter((_, j) => j !== i))
                        : undefined
                    }
                  >
                    <div className="flex flex-wrap items-center gap-2 pe-8">
                      <Input
                        aria-label="Type de place"
                        className="w-40"
                        onChange={(e) => setPlace(i, { name: e.target.value })}
                        size="sm"
                        value={place.name}
                      />
                      <Unit
                        label="Nombre"
                        onChange={(v) => setPlace(i, { count: Number(v) })}
                        unit="places"
                        value={place.count}
                      />
                      <Unit
                        className="w-32"
                        label="Animaux par place"
                        onChange={(v) => setPlace(i, { animals: Number(v) })}
                        unit="max"
                        value={place.animals}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {speciesList.map((sp) => (
                        <Toggle
                          key={sp}
                          onClick={() =>
                            setPlace(i, {
                              species: place.species.includes(sp)
                                ? place.species.filter((x) => x !== sp)
                                : [...place.species, sp],
                            })
                          }
                          pressed={place.species.includes(sp)}
                        >
                          {sp}
                        </Toggle>
                      ))}
                      <div className="ms-auto flex flex-wrap gap-2">
                        <Unit
                          className="w-32"
                          label="Prix"
                          onChange={(v) => setPlace(i, { price: Number(v) })}
                          unit={`€ / ${unit}`}
                          value={place.price}
                        />
                        {place.animals > 1 && (
                          <Unit
                            className="w-36"
                            label="Supplément par animal"
                            onChange={(v) => setPlace(i, { extra: Number(v) })}
                            unit="€ / animal +"
                            value={place.extra}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  onClick={() =>
                    setPlaces((l) => [
                      ...l,
                      {
                        animals: 2,
                        count: 4,
                        extra: 8,
                        name: "Chatterie",
                        price: 16,
                        species: ["Chat"],
                      },
                    ])
                  }
                  size="sm"
                  variant="ghost"
                >
                  <HugeiconsIcon icon={PlusSignIcon} />
                  Ajouter un type de place
                </Button>
              </div>
            </Field>
            <Frame>
              <FramePanel className="divide-y p-0">
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      Périodes tarifaires
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Communes à vos activités. Appliquez-les avec un
                      pourcentage de vos prix habituels, les prix précis se
                      règlent ensuite.
                    </span>
                  </span>
                  <PeriodDialog
                    onSaved={(p) => toggleSeason(p.id, true)}
                    trigger={
                      <Button size="xs" variant="ghost">
                        <HugeiconsIcon icon={PlusSignIcon} />
                        Nouvelle saison
                      </Button>
                    }
                  />
                </div>
                {catalog.periods
                  .filter((p) => !p.base)
                  .map((period) => (
                    <div
                      className="flex items-center gap-3 px-4 py-3"
                      key={period.id}
                    >
                      <PeriodDot period={period} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">
                          {period.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {periodDates(period)}
                        </span>
                      </span>
                      {period.id in seasons && (
                        <Unit
                          className="w-36"
                          label={`Majoration ${period.name}`}
                          onChange={(v) =>
                            setSeasons((s) => ({
                              ...s,
                              [period.id]: Number(v),
                            }))
                          }
                          unit="% de plus"
                          value={seasons[period.id]}
                        />
                      )}
                      <Switch
                        aria-label={`Appliquer ${period.name}`}
                        checked={period.id in seasons}
                        onCheckedChange={(on) => toggleSeason(period.id, on)}
                      />
                    </div>
                  ))}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="flex-1 text-sm font-medium">
                    Séjour minimum
                  </span>
                  <Unit
                    label="Séjour minimum"
                    onChange={(v) => setMinStay(Number(v))}
                    unit={`${unit}s`}
                    value={minStay}
                  />
                </div>
              </FramePanel>
            </Frame>
          </>
        )}

        {step === 2 && !stay && (
          <Field
            hint={
              metier === "toilettage"
                ? "Prix par taille de chien et pour les chats. Laissez vide si non proposé. Les prix par poil ou race s'ajoutent ensuite."
                : "Laissez un prix vide si l'espèce n'est pas acceptée."
            }
            label="Prestations et prix"
          >
            <div className="space-y-2">
              {services.map((service, i) => (
                <Card
                  key={service.id}
                  onRemove={() =>
                    setServices((l) => l.filter((_, j) => j !== i))
                  }
                >
                  <div className="flex flex-wrap items-center gap-2 pe-8">
                    <Input
                      aria-label="Nom de la prestation"
                      className="min-w-40 flex-1"
                      onChange={(e) => setService(i, { name: e.target.value })}
                      placeholder="Nom de la prestation"
                      size="sm"
                      value={service.name}
                    />
                    <Unit
                      label="Durée"
                      onChange={(v) => setService(i, { duration: Number(v) })}
                      unit="min"
                      value={service.duration}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {columns.map((column, c) => (
                      <label className="space-y-1" key={column}>
                        <span className="text-xs text-muted-foreground">
                          {column}
                        </span>
                        <Unit
                          className="w-full"
                          label={`Prix ${column}`}
                          onChange={(v) =>
                            setService(i, {
                              prices: columns.map((_, k) =>
                                k === c ? v : (service.prices[k] ?? "")
                              ),
                            })
                          }
                          unit="€"
                          value={service.prices[c] ?? ""}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Label className="me-2 gap-2 text-xs font-normal">
                      <Switch
                        checked={service.bundle !== undefined}
                        onCheckedChange={(on) =>
                          setService(i, { bundle: on ? [] : undefined })
                        }
                      />
                      Forfait
                    </Label>
                    {service.bundle !== undefined &&
                      [
                        ...services.filter(
                          (s) => s.id !== service.id && !s.bundle
                        ),
                        ...reusable.flatMap((g) => g.services),
                      ].map((s) => (
                        <Toggle
                          key={s.id}
                          onClick={() =>
                            setService(i, {
                              bundle: service.bundle!.includes(s.id)
                                ? service.bundle!.filter((x) => x !== s.id)
                                : [...service.bundle!, s.id],
                            })
                          }
                          pressed={service.bundle!.includes(s.id)}
                        >
                          {s.name || "Sans nom"}
                        </Toggle>
                      ))}
                  </div>
                </Card>
              ))}
              <Button
                onClick={() =>
                  setServices((l) => [
                    ...l,
                    {
                      duration: 60,
                      id: newId("prestation"),
                      name: "",
                      prices: columns.map(() => ""),
                    },
                  ])
                }
                size="sm"
                variant="ghost"
              >
                <HugeiconsIcon icon={PlusSignIcon} />
                Ajouter une prestation
              </Button>
            </div>
          </Field>
        )}

        {step === 3 && (
          <>
            {reusable.length > 0 && (
              <Field
                hint={
                  stay
                    ? "Proposez-les en option des séjours, avec votre propre prix."
                    : "Vendez-les aussi ici, avec votre propre prix."
                }
                label="Reprendre de vos activités"
              >
                <div className="space-y-4">
                  {reusable.map(({ activity, services: list }) => (
                    <div className="space-y-1.5" key={activity.id}>
                      <ActivityTag activity={activity} />
                      {list.map((service) => {
                        const r = reuse[service.id]
                        const patch = (p: Partial<Reuse[string]>) =>
                          setReuse((all) => ({
                            ...all,
                            [service.id]: { ...all[service.id], ...p },
                          }))
                        return (
                          <ReuseRow
                            checked={!!r}
                            key={service.id}
                            onChange={(on) =>
                              setReuse((all) => {
                                const next = { ...all }
                                if (on)
                                  next[service.id] = {
                                    adjust: 0,
                                    included: false,
                                    perNight: stay && !service.scheduled,
                                  }
                                else delete next[service.id]
                                return next
                              })
                            }
                            service={service}
                          >
                            {r && (
                              <div className="mt-2.5 flex flex-wrap items-center gap-2 ps-7">
                                <Unit
                                  disabled={r.included}
                                  label="Ajustement"
                                  onChange={(v) => patch({ adjust: Number(v) })}
                                  unit="%"
                                  value={r.adjust}
                                />
                                {stay && (
                                  <>
                                    <Toggle
                                      onClick={() =>
                                        patch({ perNight: !r.perNight })
                                      }
                                      pressed={r.perNight}
                                    >
                                      Par {unit}
                                    </Toggle>
                                    <Toggle
                                      onClick={() =>
                                        patch({ included: !r.included })
                                      }
                                      pressed={r.included}
                                    >
                                      Incluse
                                    </Toggle>
                                  </>
                                )}
                              </div>
                            )}
                          </ReuseRow>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </Field>
            )}
            {stay && (
              <Field
                hint="Ce que vous seul proposez, en plus de la place"
                label="Vos options"
              >
                <div className="space-y-2">
                  {options.map((o, i) => (
                    <Card
                      className="flex flex-wrap items-center gap-2 space-y-0 py-3 pe-10"
                      key={o.id}
                      onRemove={() =>
                        setOptions((l) => l.filter((_, j) => j !== i))
                      }
                    >
                      <Input
                        aria-label="Nom de l'option"
                        className="min-w-36 flex-1"
                        onChange={(e) => setOption(i, { name: e.target.value })}
                        placeholder="Nom de l'option"
                        size="sm"
                        value={o.name}
                      />
                      <Unit
                        label="Prix"
                        onChange={(v) => setOption(i, { price: v })}
                        unit="€"
                        value={o.price}
                        className="w-24"
                      />
                      <Toggle
                        onClick={() => setOption(i, { perNight: !o.perNight })}
                        pressed={o.perNight}
                      >
                        Par {unit}
                      </Toggle>
                      <Toggle
                        onClick={() => setOption(i, { included: !o.included })}
                        pressed={o.included}
                      >
                        Incluse
                      </Toggle>
                    </Card>
                  ))}
                  <Button
                    onClick={() =>
                      setOptions((l) => [
                        ...l,
                        {
                          id: newId("option"),
                          included: false,
                          name: "",
                          perNight: true,
                          price: "",
                        },
                      ])
                    }
                    size="sm"
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} />
                    Ajouter une option
                  </Button>
                </div>
              </Field>
            )}
            {!stay && reusable.length === 0 && (
              <p className="rounded-2xl bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
                Pas encore d&apos;autres activités à reprendre. Vous pouvez
                passer cette étape.
              </p>
            )}
          </>
        )}

        {step === 4 && info && (
          <Frame>
            <FramePanel className="divide-y p-0">
              <div className="flex items-center gap-3 px-4 py-4">
                <ActivityDot
                  activity={{
                    color,
                    id: "preview",
                    metier: info.id,
                    name: label,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-lg font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {info.label} · {stay ? "séjour" : "rendez-vous"}
                  </p>
                </div>
              </div>
              <Summary title="Infos pratiques" onEdit={() => go(1)}>
                {daysLabel(days)} · {hour(hours.from)} – {hour(hours.to)} ·{" "}
                {team.length} membres
                {!stay &&
                  ` · ${[where.onSite && "chez vous", where.home && `chez le client (${where.radius} km)`, where.remote && "à distance"].filter(Boolean).join(", ")}`}
              </Summary>
              <Summary
                title={stay ? "Places" : "Prestations"}
                onEdit={() => go(2)}
              >
                {stay
                  ? places
                      .map(
                        (p) => `${p.count} × ${p.name} · ${p.price} € / ${unit}`
                      )
                      .concat(
                        catalog.periods
                          .filter((p) => p.id in seasons)
                          .map((p) => `${p.name} +${seasons[p.id]} %`)
                      )
                      .join(" · ")
                  : services
                      .map(
                        (s) =>
                          `${s.name} · dès ${Math.min(...gridOf(info.id, s).map((r) => r.price))} €`
                      )
                      .join(" · ") || "Aucune"}
              </Summary>
              <Summary
                title={stay ? "Options" : "Reprises"}
                onEdit={() => go(3)}
              >
                <span className="flex flex-wrap gap-1.5">
                  {stay &&
                    options.map((o) => (
                      <Badge key={o.id} variant="secondary">
                        {o.name} · {o.included ? "incluse" : `${o.price} €`}
                      </Badge>
                    ))}
                  {reused.map((s) => (
                    <Badge key={s.id} variant="outline">
                      {s.name} · de{" "}
                      {catalog.activities.find((a) => a.id === s.owner)?.name}
                    </Badge>
                  ))}
                  {!reused.length && !(stay && options.length) && "Aucune"}
                </span>
              </Summary>
            </FramePanel>
          </Frame>
        )}

        <div className="flex items-center justify-between gap-3 border-t pt-5">
          <Button
            disabled={step === 0}
            onClick={() => go(step - 1)}
            variant="ghost"
          >
            Retour
          </Button>
          {step < steps.length - 1 ? (
            <Button disabled={!valid[step]} onClick={() => go(step + 1)}>
              Continuer
            </Button>
          ) : (
            <Button disabled={!valid.every(Boolean)} onClick={submit}>
              Créer l&apos;activité
            </Button>
          )}
        </div>
      </div>
    </SettingsPage>
  )
}

function Summary({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <div className="text-sm">{children}</div>
      </div>
      <Button onClick={onEdit} size="xs" variant="ghost">
        Modifier
      </Button>
    </div>
  )
}
