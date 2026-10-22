"use client"

import { type ReactElement, type ReactNode, useState } from "react"
import {
  adjusted,
  covers,
  euros,
  newId,
  type Period,
  type PeriodRate,
  periodDates,
  periodRate,
  type Place,
  placeRate,
  removeRate,
  saveRate,
  deletePlace,
  savePeriod,
  savePlace,
  type Species,
  speciesList,
  useCatalog,
  weekdays,
} from "@/components/services/data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export const periodColors = [
  "bg-zinc-400",
  "bg-wise-yellow",
  "bg-wise-pink",
  "bg-wise-blue",
  "bg-wise-green",
  "bg-wise-orange",
  "bg-wise-purple",
  "bg-wise-gold",
]

export const PeriodDot = ({
  period,
  className,
}: {
  period: Period
  className?: string
}) => (
  <span
    className={cn("size-2.5 shrink-0 rounded-full", period.color, className)}
  />
)

export function Unit({
  value,
  unit,
  label,
  onChange,
  className = "w-28",
}: {
  value: string | number
  unit: string
  label: string
  onChange: (value: number) => void
  className?: string
}) {
  return (
    <InputGroup className={className}>
      <InputGroupInput
        aria-label={label}
        className="tabular-nums"
        onChange={(e) => onChange(Number(e.target.value))}
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

export function DayToggles({
  value,
  onChange,
  label,
}: {
  value: number[]
  onChange: (days: number[]) => void
  label: string
}) {
  return (
    <div aria-label={label} className="flex flex-wrap gap-1" role="group">
      {weekdays.map((day, i) => {
        const on = value.includes(i)
        return (
          <Button
            aria-pressed={on}
            key={day}
            onClick={() =>
              onChange(on ? value.filter((d) => d !== i) : [...value, i].sort())
            }
            size="xs"
            variant={on ? "secondary" : "outline"}
          >
            {day}
          </Button>
        )
      })}
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactElement | ReactElement[]
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold">{label}</p>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/* ——— Période de l'entreprise ——— */

export function PeriodDialog({
  trigger,
  period,
  onSaved,
  open: controlled,
  onOpenChange,
}: {
  trigger?: ReactElement
  period?: Period
  onSaved?: (period: Period) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [local, setLocal] = useState(false)
  const open = controlled ?? local
  const setOpen = onOpenChange ?? setLocal
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogPopup className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{period ? period.name : "Nouvelle saison"}</DialogTitle>
          <DialogDescription>
            {period?.base
              ? "Couvre toute l'année et sert de prix par défaut. Seuls son nom et sa couleur se modifient."
              : "Commune à toutes vos activités de séjour. Chacune l'applique ensuite avec ses propres prix."}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <PeriodForm
            initial={period}
            onSaved={(saved) => {
              onSaved?.(saved)
              setOpen(false)
            }}
          />
        )}
      </DialogPopup>
    </Dialog>
  )
}

function PeriodForm({
  initial,
  onSaved,
}: {
  initial?: Period
  onSaved: (period: Period) => void
}) {
  const catalog = useCatalog()
  const [draft, setDraft] = useState<Period>(
    initial ?? {
      color: periodColors[4],
      end: "",
      id: "",
      name: "",
      repeat: true,
      start: "",
    }
  )
  const set = (patch: Partial<Period>) => setDraft((d) => ({ ...d, ...patch }))
  const dated = !draft.base && draft.start && draft.end
  const valid =
    draft.name.trim() &&
    (draft.base || (dated && (draft.repeat || draft.start! <= draft.end!)))
  const overlaps = dated
    ? catalog.periods.filter(
        (p) =>
          p.id !== draft.id &&
          !p.base &&
          (covers(p, draft.start!) ||
            covers(p, draft.end!) ||
            covers(draft, p.start ?? ""))
      )
    : []

  const submit = () => {
    const saved = {
      ...draft,
      id: draft.id || newId(draft.name),
      name: draft.name.trim(),
    }
    savePeriod(saved)
    onSaved(saved)
  }

  return (
    <>
      <DialogPanel className="space-y-4">
        <Field label="Nom">
          <Input
            aria-label="Nom"
            autoFocus
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Été, Fêtes, Pont de mai…"
            value={draft.name}
          />
        </Field>
        <Field hint="Pour la distinguer dans le calendrier" label="Couleur">
          <div className="flex flex-wrap gap-2">
            {periodColors.map((color) => (
              <button
                aria-label={color}
                aria-pressed={draft.color === color}
                className={cn(
                  "size-7 rounded-full ring-offset-2 ring-offset-background",
                  color,
                  draft.color === color && "ring-2 ring-ring"
                )}
                key={color}
                onClick={() => set({ color })}
                type="button"
              />
            ))}
          </div>
        </Field>
        {!draft.base && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Du">
                <Input
                  aria-label="Début"
                  onChange={(e) => set({ start: e.target.value })}
                  type="date"
                  value={draft.start}
                />
              </Field>
              <Field label="Au">
                <Input
                  aria-label="Fin"
                  onChange={(e) => set({ end: e.target.value })}
                  type="date"
                  value={draft.end}
                />
              </Field>
            </div>
            <Label className="flex items-start gap-3 font-normal">
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  Répéter chaque année
                </span>
                <span className="text-xs text-muted-foreground">
                  Seuls le jour et le mois comptent, elle peut passer le 31
                  décembre. Sinon, elle cesse après sa date de fin.
                </span>
              </span>
              <Switch
                checked={draft.repeat}
                onCheckedChange={(repeat) => set({ repeat })}
              />
            </Label>
            <Field
              hint="En cas de chevauchement, la plus haute l'emporte. Vide : la saison la plus courte gagne."
              label="Priorité"
            >
              <Input
                aria-label="Priorité"
                className="w-28"
                min={1}
                onChange={(e) =>
                  set({
                    priority: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Auto"
                type="number"
                value={draft.priority ?? ""}
              />
            </Field>
            {overlaps.length > 0 && (
              <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                Chevauche {overlaps.map((p) => p.name).join(", ")}.{" "}
                {draft.priority
                  ? "Votre priorité départage les dates communes."
                  : "Sans priorité, la plus courte l'emporte sur les dates communes."}
              </p>
            )}
          </>
        )}
      </DialogPanel>
      <DialogFooter>
        <DialogClose render={<Button variant="ghost" />}>Annuler</DialogClose>
        <Button disabled={!valid} onClick={submit}>
          {initial ? "Enregistrer" : "Créer la saison"}
        </Button>
      </DialogFooter>
    </>
  )
}

/* ——— Réglage d'une activité sur une période ——— */

export function RateDialog({
  activityId,
  period,
  trigger,
  open: controlled,
  onOpenChange,
}: {
  activityId: string
  period: Period
  trigger?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [local, setLocal] = useState(false)
  const open = controlled ?? local
  const setOpen = onOpenChange ?? setLocal
  const activity = useCatalog().activities.find((a) => a.id === activityId)
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogPopup className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {!period.base && <PeriodDot className="size-3" period={period} />}
            {period.base ? "Prix habituels" : period.name}
          </DialogTitle>
          <DialogDescription>
            {period.base
              ? "Appliqués toute l'année, quand aucune saison ne s'applique."
              : `${periodDates(period)}.`}{" "}
            Pour {activity?.name} uniquement.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <RateForm
            activityId={activityId}
            onSaved={() => setOpen(false)}
            period={period}
          />
        )}
      </DialogPopup>
    </Dialog>
  )
}

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs">
          {n}
        </span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function Choice({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean
  onClick: () => void
  title: string
  description: string
}) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "rounded-lg border p-3 text-start transition-colors",
        selected
          ? "border-primary bg-primary/4 ring-1 ring-primary"
          : "hover:bg-muted/50"
      )}
      onClick={onClick}
      type="button"
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  )
}

function RateForm({
  activityId,
  period,
  onSaved,
}: {
  activityId: string
  period: Period
  onSaved: () => void
}) {
  const catalog = useCatalog()
  const activity = catalog.activities.find((a) => a.id === activityId)
  const places = catalog.places[activityId] ?? []
  const unit = activity?.metier === "garderie" ? "jour" : "nuit"
  const rates = catalog.rates[activityId] ?? []
  const baseId = catalog.periods.find((p) => p.base)?.id
  const baseRate = rates.find((r) => r.periodId === baseId)
  const fallback = (name: string) => baseRate?.places[name] ?? placeRate(0)
  const existing = rates.find((r) => r.periodId === period.id)
  const [draft, setDraft] = useState<PeriodRate>(
    existing ??
      periodRate(period.id, {
        percent: period.base ? undefined : 20,
        places: Object.fromEntries(
          places.map((p) => [p.name, fallback(p.name)])
        ),
      })
  )
  const [special, setSpecial] = useState(
    places
      .filter((p) => Object.keys(draft.places[p.name]?.days ?? {}).length)
      .map((p) => p.name)
  )
  const set = (patch: Partial<PeriodRate>) =>
    setDraft((d) => ({ ...d, ...patch }))
  const setPlace = (
    name: string,
    patch: Partial<PeriodRate["places"][string]>
  ) =>
    setDraft((d) => ({
      ...d,
      places: {
        ...d.places,
        [name]: { ...(d.places[name] ?? fallback(name)), ...patch },
      },
    }))
  const percent = draft.percent !== undefined
  const step = period.base ? 0 : 1

  return (
    <>
      <DialogPanel className="space-y-6">
        {!period.base && (
          <Step n={1} title="Comment fixer les prix ?">
            <div className="grid gap-2 sm:grid-cols-2">
              <Choice
                description="Ex. +20 % : un prix de 25 € passe à 30 €"
                onClick={() => set({ percent: draft.percent ?? 20 })}
                selected={percent}
                title="Un pourcentage de mes prix habituels"
              />
              <Choice
                description="Un prix pour chaque type de place"
                onClick={() => set({ percent: undefined })}
                selected={!percent}
                title="Je saisis mes prix"
              />
            </div>
          </Step>
        )}

        <Step
          n={step + 1}
          title={period.base ? "Vos prix" : "Vos prix sur ces dates"}
        >
          {percent ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Unit
                  className="w-28"
                  label="Pourcentage"
                  onChange={(v) => set({ percent: Math.max(-100, v) })}
                  unit="%"
                  value={draft.percent ?? 0}
                />
                {(draft.percent ?? 0) >= 0 ? "plus cher" : "moins cher"} que
                d&apos;habitude
              </div>
              <div className="divide-y rounded-lg border">
                {places.map((place) => {
                  const base = baseRate?.places[place.name]
                  return (
                    <div
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                      key={place.name}
                    >
                      <span>{place.name}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {base
                          ? `${euros(base.price)} → ${euros(adjusted(base.price, draft.percent ?? 0))} / ${unit}`
                          : "Pas de prix habituel"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {places.map((place) => {
                const rate = draft.places[place.name] ?? fallback(place.name)
                const days = Object.keys(rate.days).map(Number)
                const on = special.includes(place.name)
                return (
                  <div className="space-y-3 p-3" key={place.name}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="me-auto text-sm font-semibold">
                        {place.name}
                      </span>
                      <Unit
                        className="w-32"
                        label={`Prix ${place.name}`}
                        onChange={(price) => setPlace(place.name, { price })}
                        unit={`€ / ${unit}`}
                        value={rate.price}
                      />
                    </div>
                    {place.animals > 1 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="me-auto text-sm text-muted-foreground">
                          Par animal en plus dans la même place
                        </span>
                        <Unit
                          className="w-32"
                          label={`Supplément ${place.name}`}
                          onChange={(extra) => setPlace(place.name, { extra })}
                          unit="€"
                          value={rate.extra}
                        />
                      </div>
                    )}
                    <Label className="flex items-center gap-2 font-normal text-muted-foreground">
                      <Switch
                        checked={on}
                        onCheckedChange={(checked) => {
                          setSpecial((list) =>
                            checked
                              ? [...list, place.name]
                              : list.filter((n) => n !== place.name)
                          )
                          if (!checked) setPlace(place.name, { days: {} })
                        }}
                      />
                      Prix différent certains jours
                    </Label>
                    {on && (
                      <div className="space-y-2">
                        <DayToggles
                          label={`Jours au prix différent, ${place.name}`}
                          onChange={(list) =>
                            setPlace(place.name, {
                              days: Object.fromEntries(
                                list.map((d) => [d, rate.days[d] ?? rate.price])
                              ),
                            })
                          }
                          value={days}
                        />
                        {days.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {days.map((d) => (
                              <Unit
                                className="w-36"
                                key={d}
                                label={`Prix du ${weekdays[d]}`}
                                onChange={(price) =>
                                  setPlace(place.name, {
                                    days: { ...rate.days, [d]: price },
                                  })
                                }
                                unit={`€ le ${weekdays[d].toLowerCase()}.`}
                                value={rate.days[d]}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Step>

        <Step n={step + 2} title="Séjour minimum et fermeture">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field hint="Pour une arrivée sur ces dates" label="Séjour minimum">
              <Unit
                label="Séjour minimum"
                onChange={(minStay) => set({ minStay: Math.max(1, minStay) })}
                unit={`${unit}s`}
                value={draft.minStay}
              />
            </Field>
            <Field hint="Aucune nuit vendue ces jours-là" label="Fermé le">
              <DayToggles
                label="Jours fermés"
                onChange={(closed) => set({ closed })}
                value={draft.closed}
              />
            </Field>
          </div>
        </Step>
      </DialogPanel>
      <DialogFooter>
        {existing && !period.base && (
          <Button
            className="sm:me-auto"
            onClick={() => {
              removeRate(activityId, period.id)
              onSaved()
            }}
            variant="destructive-outline"
          >
            Ne plus appliquer
          </Button>
        )}
        <DialogClose render={<Button variant="ghost" />}>Annuler</DialogClose>
        <Button
          onClick={() => {
            saveRate(activityId, {
              ...draft,
              active: period.base || !existing ? true : draft.active,
            })
            onSaved()
          }}
        >
          {existing ? "Enregistrer" : "Appliquer"}
        </Button>
      </DialogFooter>
    </>
  )
}

/* ——— Type de place d'une activité de séjour ——— */

export function PlaceDialog({
  activityId,
  place,
  trigger,
}: {
  activityId: string
  place?: Place
  trigger: ReactElement
}) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={trigger} />
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {place ? place.name : "Nouveau type de place"}
          </DialogTitle>
          <DialogDescription>
            Ce que le client réserve pour ses dates. Son prix se règle dans les
            tarifs, période par période.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <PlaceForm
            activityId={activityId}
            initial={place}
            onDone={() => setOpen(false)}
          />
        )}
      </DialogPopup>
    </Dialog>
  )
}

function PlaceForm({
  activityId,
  initial,
  onDone,
}: {
  activityId: string
  initial?: Place
  onDone: () => void
}) {
  const catalog = useCatalog()
  const others = (catalog.places[activityId] ?? []).filter(
    (p) => p.name !== initial?.name
  )
  const [draft, setDraft] = useState<Place>(
    initial ?? { animals: 1, count: 1, name: "", species: ["Chien"] }
  )
  const name = draft.name.trim()
  const taken = others.some((p) => p.name.toLowerCase() === name.toLowerCase())
  const valid = name && !taken && draft.count > 0 && draft.species.length > 0
  const toggle = (sp: Species) =>
    setDraft((d) => ({
      ...d,
      species: d.species.includes(sp)
        ? d.species.filter((x) => x !== sp)
        : [...d.species, sp],
    }))

  return (
    <>
      <DialogPanel className="space-y-4">
        <Field hint={taken ? "Ce nom existe déjà" : undefined} label="Nom">
          <Input
            aria-label="Nom"
            autoFocus
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Box, Box famille, Chatterie…"
            value={draft.name}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre">
            <Unit
              className="w-full"
              label="Nombre"
              onChange={(count) => setDraft({ ...draft, count })}
              unit="places"
              value={draft.count}
            />
          </Field>
          <Field hint="Au-delà d'un, supplément par animal" label="Animaux">
            <Unit
              className="w-full"
              label="Animaux par place"
              onChange={(animals) =>
                setDraft({ ...draft, animals: Math.max(1, animals) })
              }
              unit="max"
              value={draft.animals}
            />
          </Field>
        </div>
        <Field label="Espèces accueillies">
          <div className="flex flex-wrap gap-1">
            {speciesList.map((sp) => (
              <Button
                aria-pressed={draft.species.includes(sp)}
                key={sp}
                onClick={() => toggle(sp)}
                size="xs"
                variant={draft.species.includes(sp) ? "secondary" : "outline"}
              >
                {sp}
              </Button>
            ))}
          </div>
        </Field>
      </DialogPanel>
      <DialogFooter>
        {initial && others.length > 0 && (
          <Button
            className="sm:me-auto"
            onClick={() => {
              deletePlace(activityId, initial.name)
              onDone()
            }}
            variant="destructive-outline"
          >
            Supprimer
          </Button>
        )}
        <DialogClose render={<Button variant="ghost" />}>Annuler</DialogClose>
        <Button
          disabled={!valid}
          onClick={() => {
            savePlace(activityId, { ...draft, name }, initial?.name)
            onDone()
          }}
        >
          {initial ? "Enregistrer" : "Ajouter"}
        </Button>
      </DialogFooter>
    </>
  )
}
