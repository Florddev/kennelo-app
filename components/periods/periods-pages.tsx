"use client"

import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import {
  PeriodDialog,
  PeriodDot,
  PlaceDialog,
  RateDialog,
  Unit,
} from "@/components/periods/period-forms"
import {
  addDays,
  adjusted,
  type CatalogActivity,
  countedSeasons,
  currentPlan,
  deletePeriod,
  euros,
  groupNights,
  isOver,
  journeyOf,
  type Period,
  periodDates,
  type Place,
  quote,
  saveRate,
  seasonLimit,
  setExceptions,
  shortIso,
  todayIso,
  useCatalog,
  winner,
} from "@/components/services/data"
import { ActivityDot, ActivityTag } from "@/components/services/service-form"
import {
  LinkRow,
  SettingsPage,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-ui"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const unitOf = (activity?: CatalogActivity) =>
  activity?.metier === "garderie" ? "jour" : "nuit"

const NewSeason = ({ onSaved }: { onSaved?: (p: Period) => void }) => (
  <PeriodDialog
    onSaved={onSaved}
    trigger={
      <Button size="sm" variant="ghost">
        <HugeiconsIcon icon={PlusSignIcon} />
        Nouvelle saison
      </Button>
    }
  />
)

function PeriodTitle({ period }: { period: Period }) {
  const counted = countedSeasons(useCatalog().periods)
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {period.name}
      {period.base && (
        <Badge size="sm" variant="secondary">
          Par défaut
        </Badge>
      )}
      {period.priority && (
        <Badge size="sm" variant="outline">
          Priorité {period.priority}
        </Badge>
      )}
      {isOver(period) && (
        <Badge size="sm" variant="outline">
          Terminée
        </Badge>
      )}
      {!period.base && !counted.includes(period) && (
        <Badge size="sm" variant="warning">
          Hors offre
        </Badge>
      )}
    </span>
  )
}

/* ——— Côté activité ——— */

const placeMeta = (place: Place) =>
  `${place.count} places · ${place.animals} ${place.animals > 1 ? "animaux" : "animal"} max · ${place.species.join(", ")}`

/** Ce que le client réserve. Les prix se règlent dans la grille des tarifs. */
export function PlaceTypes({ activityId }: { activityId: string }) {
  const catalog = useCatalog()
  const activity = catalog.activities.find((a) => a.id === activityId)
  return (
    <SettingsSection
      action={
        <PlaceDialog
          activityId={activityId}
          trigger={
            <Button size="sm" variant="ghost">
              <HugeiconsIcon icon={PlusSignIcon} />
              Ajouter
            </Button>
          }
        />
      }
      description="Ce que le client réserve pour ses dates. Leurs prix se règlent dans les tarifs."
      title="Types de place"
    >
      {(catalog.places[activityId] ?? []).map((place) => (
        <SettingsRow
          description={placeMeta(place)}
          key={place.name}
          title={place.name}
        >
          <PlaceDialog
            activityId={activityId}
            place={place}
            trigger={
              <Button size="sm" variant="ghost">
                Modifier
              </Button>
            }
          />
        </SettingsRow>
      ))}
      {activity?.pricingHref && (
        <LinkRow
          description="Prix des places, période par période"
          href={activity.pricingHref}
          title="Tarifs"
        />
      )}
    </SettingsSection>
  )
}

const dayNames = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
]

const closedText = (closed: number[]) =>
  closed.length ? `Fermé le ${closed.map((d) => dayNames[d]).join(", ")}` : ""

const percentText = (percent: number) =>
  percent === 0
    ? "Mêmes prix que d'habitude"
    : `${Math.abs(percent)} % ${percent > 0 ? "plus cher" : "moins cher"} que d'habitude`

/** Prix des places : les prix habituels, puis une carte par saison. */
export function PlacePrices({ activityId }: { activityId: string }) {
  const catalog = useCatalog()
  const activity = catalog.activities.find((a) => a.id === activityId)
  const places = catalog.places[activityId] ?? []
  const rates = catalog.rates[activityId] ?? []
  const unit = unitOf(activity)
  const counted = countedSeasons(catalog.periods)
  const [editing, setEditing] = useState<Period | null>(null)
  const [creating, setCreating] = useState(false)
  const rateOf = (p: Period) => rates.find((r) => r.periodId === p.id)
  const base = catalog.periods.find((p) => p.base)!
  const baseRate = rateOf(base)
  const seasons = catalog.periods.filter((p) => !p.base && rateOf(p))
  const available = catalog.periods.filter((p) => !p.base && !rateOf(p))
  const minStay = (n: number) =>
    `Séjour minimum : ${n} ${unit}${n > 1 ? "s" : ""}`

  const addSeason = available.length ? (
    <Menu>
      <MenuTrigger
        render={
          <Button size="sm" variant="ghost">
            <HugeiconsIcon icon={PlusSignIcon} />
            Ajouter une saison
          </Button>
        }
      />
      <MenuPopup align="end">
        {available.map((p) => (
          <MenuItem key={p.id} onClick={() => setEditing(p)}>
            <PeriodDot period={p} />
            {p.name}
            <span className="ms-auto ps-4 text-xs text-muted-foreground">
              {periodDates(p)}
            </span>
          </MenuItem>
        ))}
        <MenuSeparator />
        <MenuItem onClick={() => setCreating(true)}>
          <HugeiconsIcon icon={PlusSignIcon} />
          Créer une nouvelle saison
        </MenuItem>
      </MenuPopup>
    </Menu>
  ) : (
    <Button onClick={() => setCreating(true)} size="sm" variant="ghost">
      <HugeiconsIcon icon={PlusSignIcon} />
      Ajouter une saison
    </Button>
  )

  return (
    <>
      <SettingsSection
        action={
          <Button onClick={() => setEditing(base)} size="sm" variant="ghost">
            Modifier
          </Button>
        }
        description="Toute l'année, quand aucune saison ne s'applique"
        title="Prix habituels"
      >
        {!baseRate?.active && (
          <div className="px-4 py-3">
            <Alert variant="warning">
              <AlertTitle>Aucun prix habituel</AlertTitle>
              <AlertDescription>
                {activity?.name} n&apos;est réservable que pendant ses saisons.
              </AlertDescription>
            </Alert>
          </div>
        )}
        {places.map((place) => {
          const rate = baseRate?.places[place.name]
          return (
            <SettingsRow
              description={
                rate &&
                [
                  ...Object.entries(rate.days).map(
                    ([d, price]) => `${euros(price)} le ${dayNames[Number(d)]}`
                  ),
                  rate.extra > 0 && `+${euros(rate.extra)} par animal en plus`,
                ]
                  .filter(Boolean)
                  .join(" · ")
              }
              key={place.name}
              title={place.name}
            >
              <span className="text-sm font-medium tabular-nums">
                {rate ? `${euros(rate.price)} / ${unit}` : "Pas de prix"}
              </span>
            </SettingsRow>
          )
        })}
        {baseRate && (
          <SettingsRow
            description={closedText(baseRate.closed)}
            title={minStay(baseRate.minStay)}
          />
        )}
      </SettingsSection>

      <SettingsSection
        action={addSeason}
        description="Sur leurs dates, elles remplacent vos prix habituels. Les options du séjour gardent leur prix toute l'année."
        title="Saisons"
      >
        {!seasons.length && (
          <p className="px-4 py-3.5 text-sm text-muted-foreground">
            Aucune saison : vos prix habituels s&apos;appliquent toute
            l&apos;année.
          </p>
        )}
        {seasons.map((p) => {
          const rate = rateOf(p)!
          const prices = places
            .map((place) => {
              const source =
                rate.percent !== undefined
                  ? baseRate?.places[place.name]
                  : rate.places[place.name]
              return source
                ? `${place.name} ${euros(adjusted(source.price, rate.percent ?? 0))}`
                : null
            })
            .filter(Boolean)
            .join(" · ")
          return (
            <div className="px-4 py-3.5" key={p.id}>
              <div className="flex items-start gap-3">
                <PeriodDot className="mt-1.5 size-3" period={p} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    {p.name}
                    {isOver(p) && (
                      <Badge size="sm" variant="outline">
                        Terminée
                      </Badge>
                    )}
                    {!counted.includes(p) && (
                      <Badge size="sm" variant="warning">
                        Hors offre
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {periodDates(p)}
                  </p>
                </div>
                <Button onClick={() => setEditing(p)} size="sm" variant="ghost">
                  Modifier
                </Button>
                <Switch
                  aria-label={`${p.name} active`}
                  checked={rate.active}
                  className="mt-1.5"
                  onCheckedChange={(active) =>
                    saveRate(activityId, { ...rate, active })
                  }
                />
              </div>
              <div className="mt-2 space-y-0.5 ps-6 text-sm">
                {rate.active ? (
                  <>
                    {rate.percent !== undefined && (
                      <p>{percentText(rate.percent)}</p>
                    )}
                    <p
                      className={cn(
                        rate.percent !== undefined && "text-muted-foreground"
                      )}
                    >
                      {prices || "Aucun prix saisi"}
                    </p>
                    <p className="text-muted-foreground">
                      {[minStay(rate.minStay), closedText(rate.closed)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Désactivée : vos prix habituels s&apos;appliquent sur ces
                    dates.
                  </p>
                )}
              </div>
            </div>
          )
        })}
        <LinkRow
          description="Communes à toutes vos activités"
          href="/settings/periods"
          title="Dates des saisons"
          value={`${catalog.periods.length - 1} saisons`}
        />
      </SettingsSection>

      <PeriodDialog
        onOpenChange={setCreating}
        onSaved={setEditing}
        open={creating}
      />
      {editing && (
        <RateDialog
          activityId={activityId}
          onOpenChange={(open) => !open && setEditing(null)}
          open
          period={editing}
        />
      )}
    </>
  )
}

const exceptionItems = [
  { label: "Fermé", value: "closed" },
  { label: "Ouvert", value: "open" },
]

export function Exceptions({ activityId }: { activityId: string }) {
  const list = useCatalog().exceptions[activityId] ?? []
  const [draft, setDraft] = useState({ date: "", label: "", open: false })
  return (
    <SettingsSection
      description="À la date près, elles passent avant les horaires, les périodes et leurs jours fermés"
      title="Ouvertures et fermetures exceptionnelles"
    >
      {list.map((e) => (
        <SettingsRow
          description={e.label}
          key={e.date}
          title={
            <span className="flex items-center gap-2">
              {shortIso(e.date)} {e.date.slice(0, 4)}
              <Badge size="sm" variant={e.open ? "success" : "outline"}>
                {e.open ? "Ouvert" : "Fermé"}
              </Badge>
            </span>
          }
        >
          <Button
            aria-label="Retirer"
            onClick={() =>
              setExceptions(
                activityId,
                list.filter((x) => x.date !== e.date)
              )
            }
            size="icon-sm"
            variant="ghost"
          >
            <HugeiconsIcon icon={Delete02Icon} />
          </Button>
        </SettingsRow>
      ))}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <Input
          aria-label="Date"
          className="w-40"
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          size="sm"
          type="date"
          value={draft.date}
        />
        <Select
          items={exceptionItems}
          onValueChange={(v) => setDraft({ ...draft, open: v === "open" })}
          value={draft.open ? "open" : "closed"}
        >
          <SelectTrigger aria-label="Statut" className="w-28" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {exceptionItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
        <Input
          aria-label="Motif"
          className="min-w-32 flex-1"
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          placeholder="Motif (travaux, jour férié…)"
          size="sm"
          value={draft.label}
        />
        <Button
          disabled={!draft.date}
          onClick={() => {
            setExceptions(activityId, [
              ...list.filter((x) => x.date !== draft.date),
              draft,
            ])
            setDraft({ date: "", label: "", open: false })
          }}
          size="sm"
          variant="outline"
        >
          Ajouter
        </Button>
      </div>
    </SettingsSection>
  )
}

export function Simulator({ activityId }: { activityId: string }) {
  const catalog = useCatalog()
  const activity = catalog.activities.find((a) => a.id === activityId)
  const places = catalog.places[activityId] ?? []
  const unit = unitOf(activity)
  const [arrival, setArrival] = useState(todayIso)
  const [nights, setNights] = useState(14)
  const [place, setPlace] = useState(places[0]?.name ?? "")
  const [animals, setAnimals] = useState(1)
  const max = places.find((p) => p.name === place)?.animals ?? 1
  const result = quote(
    catalog,
    activityId,
    place,
    arrival || todayIso,
    Math.min(nights, 60),
    Math.min(animals, max)
  )
  const items = places.map((p) => ({ label: p.name, value: p.name }))

  if (!places.length) return null
  return (
    <SettingsSection
      description={`Calculé ${unit} par ${unit}, comme une réservation. Le détail est figé à la réservation : modifier une période ensuite ne change pas les séjours existants.`}
      title="Simuler un séjour"
    >
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <Input
          aria-label="Arrivée"
          className="w-40"
          onChange={(e) => setArrival(e.target.value)}
          size="sm"
          type="date"
          value={arrival}
        />
        <Unit
          label="Durée"
          onChange={(v) => setNights(Math.max(1, v))}
          unit={`${unit}s`}
          value={nights}
        />
        <Select
          items={items}
          onValueChange={(v) => setPlace(v ?? "")}
          value={place}
        >
          <SelectTrigger aria-label="Place" className="w-40" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
        {max > 1 && (
          <Unit
            label="Animaux"
            onChange={(v) => setAnimals(Math.max(1, Math.min(max, v)))}
            unit="animaux"
            value={animals}
          />
        )}
      </div>
      <div className="px-4 py-3">
        <div className="flex h-6 overflow-hidden rounded-md">
          {result.nights.map((n) => (
            <span
              className={cn(
                "flex-1 border-e border-background last:border-e-0",
                n.closed ? "bg-muted" : n.period?.color
              )}
              key={n.date}
              title={`${shortIso(n.date)} · ${n.closed ?? `${n.period?.name} · ${euros(n.price)}`}`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{shortIso(arrival || todayIso)}</span>
          <span>{shortIso(addDays(arrival || todayIso, nights))}</span>
        </div>
      </div>
      <ul className="space-y-1 px-4 py-3 text-sm">
        {groupNights(result.nights.filter((n) => !n.closed)).map((line, i) => (
          <li className="flex justify-between gap-2" key={i}>
            <span className="text-muted-foreground">
              {line.nights} {unit}
              {line.nights > 1 && "s"} × {euros(line.price)} · {line.label}
            </span>
            <span className="tabular-nums">
              {euros(line.nights * line.price)}
            </span>
          </li>
        ))}
        {animals > 1 && result.total > 0 && (
          <li className="flex justify-between gap-2 text-muted-foreground">
            <span>Suppléments animaux inclus</span>
          </li>
        )}
        <li className="flex justify-between gap-2 border-t pt-2 font-medium">
          <span>Total de l&apos;hébergement</span>
          <span className="tabular-nums">{euros(result.total)}</span>
        </li>
      </ul>
      {(result.short || result.closed.length > 0) && (
        <div className="space-y-2 px-4 py-3">
          {result.short && (
            <Alert variant="warning">
              <AlertDescription>
                Séjour minimum de {result.minStay} {unit}s pour une arrivée ce
                jour-là ({result.nights[0]?.period?.name}).
              </AlertDescription>
            </Alert>
          )}
          {result.closed.length > 0 && (
            <Alert variant="error">
              <AlertDescription>
                Non réservable :{" "}
                {result.closed
                  .slice(0, 3)
                  .map((n) => `${shortIso(n.date)} (${n.closed})`)
                  .join(", ")}
                {result.closed.length > 3 &&
                  ` et ${result.closed.length - 3} autres`}
                .
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </SettingsSection>
  )
}

/* ——— Côté entreprise ——— */

const monthNames = [
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc.",
]

/** Douze prochains mois, chaque jour coloré par la saison qui l'emporte. */
function YearOverview() {
  const periods = useCatalog().periods
  const seasons = countedSeasons(periods)
  const base = periods.find((p) => p.base)
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = (9 + i) % 12
    const year = 2026 + Math.floor((9 + i) / 12)
    const length = new Date(Date.UTC(year, m + 1, 0)).getUTCDate()
    return { label: monthNames[m], length, m, year }
  })
  return (
    <div className="space-y-1 overflow-x-auto px-4 py-4">
      {months.map(({ label, length, m, year }) => (
        <div className="flex min-w-[32rem] items-center gap-2" key={label}>
          <span className="w-14 shrink-0 text-xs text-muted-foreground">
            {label} {m === 0 || m === 9 ? String(year).slice(2) : ""}
          </span>
          <div className="grid flex-1 grid-cols-31 gap-px">
            {Array.from({ length }, (_, d) => {
              const iso = `${year}-${String(m + 1).padStart(2, "0")}-${String(d + 1).padStart(2, "0")}`
              const period = winner(seasons, iso) ?? base
              return (
                <span
                  className={cn(
                    "h-4 rounded-[2px]",
                    period?.base ? "bg-muted" : period?.color,
                    iso === todayIso && "ring-2 ring-foreground"
                  )}
                  key={iso}
                  title={`${shortIso(iso)} · ${period?.name}`}
                />
              )
            })}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground">
        {[base, ...seasons].filter(Boolean).map((p) => (
          <span className="flex items-center gap-1.5" key={p!.id}>
            <PeriodDot
              className={p!.base ? "bg-muted" : undefined}
              period={p!}
            />
            {p!.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function PeriodsPage() {
  const catalog = useCatalog()
  const base = catalog.periods.find((p) => p.base)!
  const seasons = catalog.periods.filter((p) => !p.base)
  const stays = catalog.activities.filter((a) => journeyOf(a) === "stay")
  const appliedBy = (period: Period) =>
    stays.filter((a) =>
      catalog.rates[a.id]?.some((r) => r.periodId === period.id && r.active)
    )
  const limit = Number.isFinite(seasonLimit) ? seasonLimit : null

  return (
    <SettingsPage
      action={<NewSeason />}
      back={{ href: "/settings/activities", label: "Activités" }}
      description="Ici, seulement les dates. Chaque activité de séjour applique les périodes de son choix et règle ses prix dans ses tarifs."
      title="Périodes tarifaires"
    >
      {limit !== null && seasons.length >= limit && (
        <Alert variant="info">
          <AlertTitle>
            {seasons.length} saisons sur {limit} avec l&apos;offre {currentPlan}
          </AlertTitle>
          <AlertDescription>
            Les saisons en plus restent enregistrées mais ne s&apos;appliquent
            pas aux prix : les plus anciennes sont gardées.{" "}
            <Link className="font-medium underline" href="/settings/billing">
              Voir les offres
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <SettingsSection title="Calendrier">
        <YearOverview />
      </SettingsSection>

      <SettingsSection
        description="Les prix habituels de chaque activité, quand aucune saison ne couvre la date. Elle ne se supprime pas."
        title="Période de base"
      >
        <SettingsRow
          description={`Toute l'année · appliquée par ${
            appliedBy(base)
              .map((a) => a.name)
              .join(", ") || "aucune activité"
          }`}
          media={<PeriodDot className="size-3" period={base} />}
          title={<PeriodTitle period={base} />}
        >
          <PeriodDialog
            period={base}
            trigger={
              <Button size="sm" variant="ghost">
                Modifier
              </Button>
            }
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        action={<NewSeason />}
        description={`${seasons.length}${limit !== null ? ` sur ${limit}` : ""} saisons avec l'offre ${currentPlan}. En cas de chevauchement, la priorité la plus haute l'emporte, sinon la plus courte.`}
        title="Saisons"
      >
        {seasons.map((period) => {
          const by = appliedBy(period)
          return (
            <SettingsRow
              description={
                <>
                  {periodDates(period)}
                  <span className="mt-1.5 flex flex-wrap items-center gap-1">
                    {by.length ? (
                      <>
                        Appliquée par
                        {by.map((a) => (
                          <ActivityTag activity={a} key={a.id} />
                        ))}
                      </>
                    ) : (
                      "Appliquée par aucune activité"
                    )}
                  </span>
                </>
              }
              key={period.id}
              media={<PeriodDot className="size-3" period={period} />}
              title={<PeriodTitle period={period} />}
            >
              <PeriodDialog
                period={period}
                trigger={
                  <Button size="sm" variant="ghost">
                    Modifier
                  </Button>
                }
              />
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      aria-label={`Supprimer ${period.name}`}
                      size="icon-sm"
                      variant="ghost"
                    />
                  }
                >
                  <HugeiconsIcon icon={Delete02Icon} />
                </AlertDialogTrigger>
                <AlertDialogPopup>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Supprimer « {period.name} » ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {by.length
                        ? `Ses prix sont retirés de ${by.map((a) => a.name).join(", ")}. `
                        : ""}
                      Les réservations existantes gardent leur prix.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogClose render={<Button variant="ghost" />}>
                      Annuler
                    </AlertDialogClose>
                    <AlertDialogClose
                      onClick={() => deletePeriod(period.id)}
                      render={<Button variant="destructive" />}
                    >
                      Supprimer
                    </AlertDialogClose>
                  </AlertDialogFooter>
                </AlertDialogPopup>
              </AlertDialog>
            </SettingsRow>
          )
        })}
      </SettingsSection>

      <SettingsSection
        description="Les prix de chaque période se règlent dans les tarifs de l'activité"
        title="Par activité"
      >
        {stays.map((activity) => {
          const on = catalog.periods.filter((p) =>
            catalog.rates[activity.id]?.some(
              (r) => r.periodId === p.id && r.active
            )
          )
          return (
            <LinkRow
              description={
                on.map((p) => p.name).join(" · ") || "Aucune période"
              }
              href={
                activity.pricingHref ?? `/settings/activities/${activity.id}`
              }
              key={activity.id}
              media={<ActivityDot activity={activity} />}
              title={activity.name}
              value={`${on.length} période${on.length > 1 ? "s" : ""}`}
            />
          )
        })}
      </SettingsSection>
    </SettingsPage>
  )
}
