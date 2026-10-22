"use client"

import {
  ArrowRight01Icon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import {
  addOffers,
  type CatalogActivity,
  euros,
  gridSummary,
  journeyOf,
  minutes,
  type Offer,
  removeOffer,
  sellersOf,
  type Service,
  updateOffer,
  useCatalog,
} from "@/components/services/data"
import { ChoiceRow, FlowMedia } from "@/components/flow/flow"
import {
  ActivityDot,
  ActivityTag,
  ServiceDialog,
} from "@/components/services/service-form"
import { notify, SettingsSection } from "@/components/settings/settings-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const durationRange = (service: Service) => {
  const values = service.grid.map((r) => r.duration)
  const min = Math.min(...values)
  const max = Math.max(...values)
  return min === max ? minutes(min) : `${minutes(min)} – ${minutes(max)}`
}

export const serviceMeta = (service: Service) =>
  [
    service.bundle && "Forfait",
    service.scheduled ? durationRange(service) : "Hors agenda",
  ]
    .filter(Boolean)
    .join(" · ")

export const serviceHref = (service: Service) =>
  `/settings/activities/${service.owner}/prestations/${service.id}`

const perNightItems = [
  { label: "Par nuit", value: "night" },
  { label: "Par séjour", value: "stay" },
]

/** Réglages de vente d'une prestation dans une activité. */
export function OfferControls({
  activityId,
  offer,
  service,
  stay,
  children,
}: {
  activityId: string
  offer: Offer
  service: Service
  stay: boolean
  children?: ReactNode
}) {
  const set = (patch: Partial<Offer>) =>
    updateOffer(activityId, service.id, patch)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-28">
        <InputGroupInput
          aria-label="Ajustement de prix"
          className="tabular-nums"
          disabled={offer.included}
          max={100}
          min={-100}
          onChange={(e) =>
            set({
              adjust: Math.max(-100, Math.min(100, Number(e.target.value))),
            })
          }
          type="number"
          value={offer.adjust}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText>%</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <span className="text-sm font-semibold tabular-nums">
        {offer.included
          ? `Incluse · ${euros(0)}`
          : gridSummary(service, offer.adjust)}
      </span>
      {stay && (
        <>
          <Label className="ms-1 gap-2 font-normal">
            <Switch
              checked={offer.included}
              onCheckedChange={(included) => set({ included })}
            />
            Incluse
          </Label>
          <Select
            items={perNightItems}
            onValueChange={(v) => set({ perNight: v === "night" })}
            value={offer.perNight ? "night" : "stay"}
          >
            <SelectTrigger
              aria-label="Quantité proposée"
              className="w-fit min-w-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {perNightItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
        </>
      )}
      {children}
    </div>
  )
}

/** Nom, état et prix d'une prestation dans une activité. */
function OfferText({
  offer,
  service,
  stay,
  from,
  children,
}: {
  offer: Offer
  service: Service
  stay: boolean
  /** Activité qui fait la prestation, quand ce n'est pas celle-ci. */
  from?: CatalogActivity
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "min-w-0 flex-1",
        (!offer.active || !service.active) && "opacity-60"
      )}
    >
      <p className="flex flex-wrap items-center gap-2 font-semibold">
        {service.name}
        {from && <ActivityTag activity={from} />}
        {service.bundle && (
          <Badge size="sm" variant="outline">
            Forfait
          </Badge>
        )}
        {offer.included && (
          <Badge size="sm" variant="success">
            Incluse
          </Badge>
        )}
        {!service.active && (
          <Badge size="sm" variant="warning">
            Désactivée
          </Badge>
        )}
        {service.active && !offer.active && (
          <Badge size="sm" variant="secondary">
            Hors vente
          </Badge>
        )}
      </p>
      <p className="text-sm text-muted-foreground">
        {from && `Faite par ${from.name} · `}
        {offer.included ? "Incluse, 0 €" : gridSummary(service, offer.adjust)}
        {stay && (offer.perNight ? " · par nuit" : " · par séjour")}
        {!from && ` · ${serviceMeta(service)}`}
      </p>
      {children}
    </div>
  )
}

/** Réglages d'une prestation d'une autre activité : en vente, prix, retrait. */
function OfferDialog({
  activity,
  offer,
  service,
  stay,
  onOpenChange,
}: {
  activity: CatalogActivity
  offer: Offer
  service: Service
  stay: boolean
  onOpenChange: (open: boolean) => void
}) {
  const owner = useCatalog().activities.find((a) => a.id === service.owner)
  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogPopup className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>
            Faite par {owner?.name}, à son prix de {gridSummary(service)}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="space-y-6">
          <Label className="flex items-center justify-between gap-4 rounded-2xl bg-muted p-4 font-semibold">
            Proposée dans {activity.name}
            <Switch
              checked={offer.active}
              onCheckedChange={(active) =>
                updateOffer(activity.id, service.id, { active })
              }
            />
          </Label>
          <div className="space-y-3">
            <div>
              <p className="font-semibold">Votre prix</p>
              <p className="text-sm text-muted-foreground">
                En plus ou en moins du prix de {owner?.name}
              </p>
            </div>
            <OfferControls
              activityId={activity.id}
              offer={offer}
              service={service}
              stay={stay}
            />
          </div>
        </DialogPanel>
        <DialogFooter variant="bare">
          <Button
            onClick={() => {
              removeOffer(activity.id, service.id)
              onOpenChange(false)
            }}
            variant="destructive-outline"
          >
            Retirer
          </Button>
          <DialogClose render={<Button />}>Terminé</DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

/** Prestations d'une activité, les siennes puis celles des autres, dans une seule liste. */
export function ActivityOffers({
  activityId,
  title = "Prestations principales",
}: {
  activityId: string
  title?: string
}) {
  const catalog = useCatalog()
  const [openId, setOpenId] = useState<string | null>(null)
  const [adding, setAdding] = useState<"choose" | "new" | "reuse" | null>(null)
  const reusable = useReusable(activityId).flatMap((group) =>
    group.services.map((service) => ({ from: group.activity, service }))
  )
  const activity = catalog.activities.find((a) => a.id === activityId)
  if (!activity) return null
  const stay = journeyOf(activity) === "stay"
  const noun = stay ? "option" : "prestation"
  const entries = (catalog.offers[activityId] ?? []).flatMap((offer) => {
    const service = catalog.services.find((s) => s.id === offer.serviceId)
    return service ? [{ offer, service }] : []
  })
  const own = entries.filter((e) => e.service.owner === activityId)
  const borrowed = entries.filter((e) => e.service.owner !== activityId)
  const opened = borrowed.find((e) => e.service.id === openId)
  const example = reusable[0]
  const close = (open: boolean) => !open && setAdding(null)
  const row =
    "flex min-h-16 w-full items-center gap-4 px-5 py-4 text-start transition-colors hover:bg-accent"
  const chevron = (
    <HugeiconsIcon
      className="size-5 shrink-0 text-muted-foreground"
      icon={ArrowRight01Icon}
    />
  )

  return (
    <SettingsSection
      action={
        <Button onClick={() => setAdding("choose")}>
          <HugeiconsIcon icon={PlusSignIcon} />
          Ajouter
        </Button>
      }
      description={
        stay
          ? "Ce que le client peut ajouter à son séjour"
          : `Ce que vous vendez dans ${activity.name}`
      }
      title={title}
    >
      {entries.length === 0 && (
        <p className="px-5 py-8 text-center text-muted-foreground">
          Aucune {noun} pour l&apos;instant.
        </p>
      )}
      {own.map(({ offer, service }) => {
        const borrowers = sellersOf(catalog, service.id).filter(
          (a) => a.id !== activityId
        )
        return (
          <Link className={row} href={serviceHref(service)} key={service.id}>
            <OfferText offer={offer} service={service} stay={stay}>
              {borrowers.length > 0 && (
                <p className="mt-1.5 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                  Proposée aussi par
                  {borrowers.map((a) => (
                    <ActivityTag activity={a} key={a.id} />
                  ))}
                </p>
              )}
            </OfferText>
            {chevron}
          </Link>
        )
      })}
      {borrowed.map(({ offer, service }) => {
        const from = catalog.activities.find((a) => a.id === service.owner)
        return (
          <button
            className={row}
            key={service.id}
            onClick={() => setOpenId(service.id)}
            type="button"
          >
            <OfferText
              from={from}
              offer={offer}
              service={service}
              stay={stay}
            />
            {chevron}
          </button>
        )
      })}

      {reusable.length > 0 && (
        <div className="space-y-4 bg-muted px-5 py-5">
          <div>
            <p className="font-semibold">
              Vos autres activités peuvent aussi servir ici
            </p>
            <p className="text-sm text-muted-foreground">
              {stay
                ? "Proposez-les en option des séjours : l'autre activité s'en occupe, vous choisissez votre prix."
                : "Vendez-les aussi ici, avec votre propre prix."}
            </p>
          </div>
          <div className="space-y-2">
            {reusable.slice(0, 3).map(({ from, service }) => (
              <div
                className="flex items-center gap-3 rounded-2xl bg-card p-3"
                key={service.id}
              >
                <ActivityDot activity={from} className="size-10 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{service.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    Faite par {from.name} · {gridSummary(service)}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    addOffers(activityId, [service.id])
                    notify(`« ${service.name} » ajoutée`)
                  }}
                  variant="secondary"
                >
                  <HugeiconsIcon icon={PlusSignIcon} />
                  Ajouter
                </Button>
              </div>
            ))}
          </div>
          {reusable.length > 3 && (
            <Button onClick={() => setAdding("reuse")} variant="ghost">
              Voir les {reusable.length} prestations disponibles
            </Button>
          )}
        </div>
      )}

      <Dialog onOpenChange={close} open={adding === "choose"}>
        <DialogPopup className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter une {noun}</DialogTitle>
            <DialogDescription>Que voulez-vous proposer ?</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div className="-mx-3 space-y-1">
              <ChoiceRow
                description={
                  stay
                    ? "Une promenade en plus, une nourriture spéciale, des photos…"
                    : `Une prestation faite par ${activity.name}`
                }
                media={
                  <FlowMedia className="bg-primary text-primary-foreground">
                    <HugeiconsIcon icon={PlusSignIcon} />
                  </FlowMedia>
                }
                onClick={() => setAdding("new")}
                title={`Une nouvelle ${noun}`}
              />
              {example && (
                <ChoiceRow
                  description={`Par exemple « ${example.service.name} », faite par ${example.from.name}. Vous choisissez votre prix.`}
                  media={
                    <ActivityDot
                      activity={example.from}
                      className="size-12 text-base"
                    />
                  }
                  onClick={() => setAdding("reuse")}
                  title="Une prestation de vos autres activités"
                />
              )}
            </div>
          </DialogPanel>
        </DialogPopup>
      </Dialog>
      <ServiceDialog
        detailed={activity.metier === "toilettage"}
        onOpenChange={close}
        onSaved={(service) => addOffers(activityId, [service.id])}
        open={adding === "new"}
        owner={activityId}
      />
      <ReuseDialog
        activity={activity}
        onOpenChange={close}
        open={adding === "reuse"}
      />
      {opened && (
        <OfferDialog
          activity={activity}
          offer={opened.offer}
          onOpenChange={(open) => !open && setOpenId(null)}
          service={opened.service}
          stay={stay}
        />
      )}
    </SettingsSection>
  )
}

/** Prestations des autres activités, regroupées par activité principale. */
export function useReusable(activityId: string | null, query = "") {
  const catalog = useCatalog()
  const taken = activityId
    ? (catalog.offers[activityId] ?? []).map((o) => o.serviceId)
    : []
  const q = query.trim().toLowerCase()
  return catalog.activities
    .filter((a) => a.id !== activityId)
    .map((activity) => ({
      activity,
      services: catalog.services.filter(
        (s) =>
          s.owner === activity.id &&
          s.active &&
          !taken.includes(s.id) &&
          (!q || s.name.toLowerCase().includes(q))
      ),
    }))
    .filter((g) => g.services.length)
}

function ReuseDialog({
  activity,
  open,
  onOpenChange,
}: {
  activity: CatalogActivity
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const groups = useReusable(activity.id, query)
  const stay = journeyOf(activity) === "stay"

  const close = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setQuery("")
      setSelected([])
    }
  }

  return (
    <Dialog onOpenChange={close} open={open}>
      <DialogPopup className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prestations de vos autres activités</DialogTitle>
          <DialogDescription>
            {stay
              ? `Proposez-les en option des séjours de ${activity.name}. L'autre activité s'en occupe, vous choisissez votre prix.`
              : `Vendez-les aussi dans ${activity.name}, avec votre propre prix.`}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="space-y-4">
          <InputGroup>
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Rechercher une prestation"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher"
              value={query}
            />
          </InputGroup>
          {groups.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucune autre prestation disponible.
            </p>
          )}
          {groups.map(({ activity: from, services }) => (
            <div className="space-y-1.5" key={from.id}>
              <ActivityTag activity={from} />
              {services.map((service) => (
                <ReuseRow
                  checked={selected.includes(service.id)}
                  key={service.id}
                  onChange={(on) =>
                    setSelected((list) =>
                      on
                        ? [...list, service.id]
                        : list.filter((id) => id !== service.id)
                    )
                  }
                  service={service}
                />
              ))}
            </div>
          ))}
        </DialogPanel>
        <DialogFooter>
          <Button onClick={() => close(false)} variant="ghost">
            Annuler
          </Button>
          <Button
            disabled={!selected.length}
            onClick={() => {
              addOffers(activity.id, selected)
              close(false)
            }}
          >
            Ajouter {selected.length || ""}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}

export function ReuseRow({
  service,
  checked,
  onChange,
  children,
}: {
  service: Service
  checked: boolean
  onChange: (checked: boolean) => void
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3",
        checked && "border-ring/60 bg-accent"
      )}
    >
      <Label className="flex items-start gap-3 font-normal">
        <Checkbox
          checked={checked}
          className="mt-0.5"
          onCheckedChange={onChange}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{service.name}</span>
          <span className="block text-sm text-muted-foreground">
            {serviceMeta(service)} · {gridSummary(service)}
          </span>
        </span>
      </Label>
      {checked && children}
    </div>
  )
}
