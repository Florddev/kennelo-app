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
import { ActivityTag, ServiceDialog } from "@/components/services/service-form"
import { SettingsSection } from "@/components/settings/settings-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
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
          size="sm"
          type="number"
          value={offer.adjust}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText>%</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <span className="text-sm font-medium tabular-nums">
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
              size="sm"
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

/** Prestations d'une activité : les siennes (principales) et celles reprises. */
export function ActivityOffers({
  activityId,
  title = "Prestations principales",
}: {
  activityId: string
  title?: string
}) {
  const catalog = useCatalog()
  const activity = catalog.activities.find((a) => a.id === activityId)
  if (!activity) return null
  const stay = journeyOf(activity) === "stay"
  const entries = (catalog.offers[activityId] ?? []).flatMap((offer) => {
    const service = catalog.services.find((s) => s.id === offer.serviceId)
    return service ? [{ offer, service }] : []
  })
  const own = entries.filter((e) => e.service.owner === activityId)
  const borrowed = entries.filter((e) => e.service.owner !== activityId)

  return (
    <>
      <SettingsSection
        action={
          <ServiceDialog
            detailed={activity.metier === "toilettage"}
            onSaved={(service) => addOffers(activityId, [service.id])}
            owner={activityId}
            trigger={
              <Button size="sm" variant="outline">
                <HugeiconsIcon icon={PlusSignIcon} />
                Nouvelle
              </Button>
            }
          />
        }
        description={`Créées par ${activity.name} : leur grille et leur durée se gèrent ici`}
        title={title}
      >
        {own.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Aucune prestation créée par {activity.name}.
          </p>
        )}
        {own.map(({ offer, service }) => {
          const borrowers = sellersOf(catalog, service.id).filter(
            (a) => a.id !== activityId
          )
          return (
            <Link
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/60"
              href={serviceHref(service)}
              key={service.id}
            >
              <div
                className={cn(
                  "min-w-0 flex-1",
                  (!offer.active || !service.active) && "opacity-60"
                )}
              >
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {service.name}
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
                <p className="text-xs text-muted-foreground">
                  {serviceMeta(service)} ·{" "}
                  {offer.included
                    ? "0 € ici"
                    : gridSummary(service, offer.adjust)}
                  {stay && (offer.perNight ? " · par nuit" : " · par séjour")}
                </p>
                {borrowers.length > 0 && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    Reprise par
                    {borrowers.map((a) => (
                      <ActivityTag activity={a} key={a.id} />
                    ))}
                  </p>
                )}
              </div>
              <HugeiconsIcon
                className="size-4 text-muted-foreground"
                icon={ArrowRight01Icon}
              />
            </Link>
          )
        })}
      </SettingsSection>

      <SettingsSection
        action={<ReuseDialog activity={activity} />}
        description="Leur grille est gérée par leur activité principale, vous réglez ici votre prix"
        title="Reprises d'autres activités"
      >
        {borrowed.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Aucune prestation reprise.
          </p>
        )}
        {borrowed.map(({ offer, service }) => {
          const owner = catalog.activities.find((a) => a.id === service.owner)
          return (
            <div className="space-y-3 px-4 py-3.5" key={service.id}>
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "min-w-0 flex-1",
                    (!offer.active || !service.active) && "opacity-60"
                  )}
                >
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {service.name}
                    {owner && <ActivityTag activity={owner} />}
                    {!service.active && (
                      <Badge size="sm" variant="warning">
                        Désactivée par {owner?.name}
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {serviceMeta(service)} · grille {gridSummary(service)}
                  </p>
                </div>
                <Switch
                  aria-label={`${service.name} en vente`}
                  checked={offer.active}
                  onCheckedChange={(active) =>
                    updateOffer(activityId, service.id, { active })
                  }
                />
              </div>
              <OfferControls
                activityId={activityId}
                offer={offer}
                service={service}
                stay={stay}
              >
                <div className="ms-auto flex gap-1">
                  <Button
                    render={<Link href={serviceHref(service)} />}
                    size="xs"
                    variant="ghost"
                  >
                    Voir la grille
                  </Button>
                  <Button
                    onClick={() => removeOffer(activityId, service.id)}
                    size="xs"
                    variant="ghost"
                  >
                    Retirer
                  </Button>
                </div>
              </OfferControls>
            </div>
          )
        })}
      </SettingsSection>
    </>
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

function ReuseDialog({ activity }: { activity: CatalogActivity }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const groups = useReusable(activity.id, query)
  const stay = journeyOf(activity) === "stay"

  const close = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setQuery("")
      setSelected([])
    }
  }

  return (
    <Dialog onOpenChange={close} open={open}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <HugeiconsIcon icon={PlusSignIcon} />
            Reprendre
          </Button>
        }
      />
      <DialogPopup className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reprendre dans {activity.name}</DialogTitle>
          <DialogDescription>
            {stay
              ? "Proposées en option des séjours, avec votre propre prix."
              : "Vendues seules, avec votre propre prix. Une prestation par rendez-vous."}
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
              Rien à reprendre de vos autres activités.
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
            Reprendre {selected.length || ""}
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
        "rounded-xl border px-3 py-2.5",
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
          <span className="block text-sm font-medium">{service.name}</span>
          <span className="block text-xs text-muted-foreground">
            {serviceMeta(service)} · {gridSummary(service)}
          </span>
        </span>
      </Label>
      {checked && children}
    </div>
  )
}
