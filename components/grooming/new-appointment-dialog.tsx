"use client"

import {
  Calendar03Icon,
  ScissorIcon,
  SmsCodeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { type ReactElement, useState } from "react"
import { dateOf, longDate, TODAY, weekdayOf } from "@/components/calendar"
import { type Client, clients } from "@/components/clients/data"
import {
  ClientStep,
  draftFromQuery,
  emptyClientDraft,
  NewClientStep,
  PetStep,
} from "@/components/flow/client-steps"
import {
  ChoiceRow,
  FlowDialog,
  FlowDone,
  FlowMedia,
  FlowScreen,
  SummaryRow,
  useSteps,
} from "@/components/flow/flow"
import { type SalonBooking, salonBookings } from "@/components/grooming/data"
import { petByName } from "@/components/pets/data"
import {
  adjusted,
  rowFor,
  sizeOfWeight,
  useCatalog,
} from "@/components/services/data"
import { NOW } from "@/components/today/data"
import { formatAmount, formatHour } from "@/components/today/widgets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type StepId = "client" | "newClient" | "pet" | "service" | "slot" | "recap"

/** Wall clock, only read from event handlers. */
const clock = () => Date.now()
const DAYS = Array.from({ length: 7 }, (_, i) => TODAY + i)
/** Créneaux de 9h à 17h30, toutes les demi-heures. */
const TIMES = Array.from({ length: 18 }, (_, i) => 9 + i / 2)
const CLOSING = 18.5

const durationLabel = (minutes: number) =>
  minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}`

export function NewAppointmentDialog({
  trigger,
  onCreate,
}: {
  trigger: ReactElement
  onCreate?: (booking: SalonBooking) => void
}) {
  const catalog = useCatalog()
  const steps = useSteps<StepId>("client")
  const [open, setOpen] = useState(false)
  const [clientName, setClientName] = useState<string>()
  const [draft, setDraft] = useState(emptyClientDraft)
  const [petName, setPetName] = useState<string>()
  const [serviceId, setServiceId] = useState<string>()
  const [day, setDay] = useState(TODAY)
  const [start, setStart] = useState<number | null>(null)
  const [sms, setSms] = useState(true)
  const [created, setCreated] = useState<SalonBooking | null>(null)

  const client = clients.find((c) => c.name === clientName)
  const pet = client && petName ? petByName(petName, client.name) : undefined
  const animal = pet?.name ?? draft.pet
  const owner = client?.name ?? draft.name
  const phone = client?.phone ?? draft.phone
  const breed = pet?.breed ?? draft.breed
  const species = pet?.species ?? draft.species

  // Prestations du toilettage, au prix de la grille du catalogue
  const offers = (catalog.offers.grooming ?? []).flatMap((offer) => {
    const service = catalog.services.find((s) => s.id === offer.serviceId)
    if (!service?.active || !offer.active) return []
    const row = rowFor(service, {
      breed,
      size: sizeOfWeight(pet?.weight),
      species,
    })
    return row
      ? [
          {
            duration: row.duration,
            id: service.id,
            name: service.name,
            price: adjusted(row.price, offer.adjust),
          },
        ]
      : []
  })
  const service = offers.find((o) => o.id === serviceId)
  const length = (service?.duration ?? 60) / 60
  const taken = (t: number) =>
    salonBookings.some(
      (b) =>
        b.day === day &&
        b.status !== "cancelled" &&
        b.start < t + length &&
        t < b.end
    )
  const times = TIMES.filter(
    (t) => t + length <= CLOSING && !(day === TODAY && t <= NOW)
  )
  const when = start === null ? "" : `${longDate(day)} à ${formatHour(start)}`
  const ready = Boolean(service && start !== null && animal && owner)

  const reset = () => {
    setClientName(undefined)
    setDraft(emptyClientDraft)
    setPetName(undefined)
    setServiceId(undefined)
    setDay(TODAY)
    setStart(null)
    setSms(true)
    setCreated(null)
    steps.reset("client")
  }

  const selectClient = (c: Client) => {
    setClientName(c.name)
    setPetName(c.pets.length === 1 ? c.pets[0].name : undefined)
    if (c.pets.length === 1) steps.next("service")
    else steps.go("pet")
  }

  const create = () => {
    if (!service || start === null) return
    const booking: SalonBooking = {
      breed,
      day,
      end: start + length,
      id: `new-${clock()}`,
      owner,
      pet: animal,
      price: service.price,
      service: service.name,
      start,
      status: "confirmed",
    }
    onCreate?.(booking)
    setCreated(booking)
  }

  const order: StepId[] = ["client", "pet", "service", "slot", "recap"]
  const progress =
    order.indexOf(steps.step === "newClient" ? "pet" : steps.step) /
    (order.length - 1)

  return (
    <FlowDialog
      onOpenChange={(next) => {
        if (next) reset()
        setOpen(next)
      }}
      open={open}
      progress={created ? undefined : progress}
      trigger={trigger}
    >
      {created ? (
        <FlowDone
          actions={
            <>
              <Button onClick={() => setOpen(false)} size="lg">
                Terminé
              </Button>
              <Button onClick={reset} size="lg" variant="secondary">
                Prendre un autre rendez-vous
              </Button>
            </>
          }
          description={`${created.pet} · ${created.service} · ${when}`}
          title="Rendez-vous réservé"
        >
          {sms && (
            <Badge size="lg" variant="info">
              <HugeiconsIcon icon={SmsCodeIcon} />
              Confirmation envoyée au {phone}
            </Badge>
          )}
        </FlowDone>
      ) : steps.step === "client" ? (
        <ClientStep
          onCreate={(query) => {
            setDraft(draftFromQuery(query))
            setClientName(undefined)
            setPetName(undefined)
            steps.go("newClient")
          }}
          onSelect={selectClient}
          title="Pour quel client ?"
        />
      ) : steps.step === "newClient" ? (
        <NewClientStep
          description="Pour lui confirmer le rendez-vous par SMS."
          draft={draft}
          onBack={steps.back}
          onChange={setDraft}
          onContinue={() => steps.next("service")}
        />
      ) : steps.step === "pet" && client ? (
        <PetStep
          client={client}
          onBack={steps.back}
          onSelect={(name) => {
            setPetName(name)
            steps.next("service")
          }}
          selected={petName}
          title="Quel animal vient au toilettage ?"
        />
      ) : steps.step === "service" || steps.step === "pet" ? (
        <FlowScreen
          description="Prix et durée selon sa race et sa taille."
          onBack={steps.back}
          title={`Quelle prestation pour ${animal || "l'animal"} ?`}
        >
          <div className="-mx-3 space-y-1">
            {offers.map((o) => (
              <ChoiceRow
                aside={
                  <span className="font-semibold tabular-nums">
                    {formatAmount(o.price)}
                  </span>
                }
                description={durationLabel(o.duration)}
                key={o.id}
                media={
                  <FlowMedia className="bg-grooming text-grooming-foreground">
                    <HugeiconsIcon icon={ScissorIcon} />
                  </FlowMedia>
                }
                onClick={() => {
                  setServiceId(o.id)
                  setStart(null)
                  steps.next("slot")
                }}
                selected={serviceId === o.id}
                title={o.name}
              />
            ))}
          </div>
        </FlowScreen>
      ) : steps.step === "slot" ? (
        <FlowScreen
          description={
            service && `${service.name} · ${durationLabel(service.duration)}`
          }
          onBack={steps.back}
          title="Quel jour, à quelle heure ?"
        >
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {DAYS.map((d) => (
              <button
                aria-pressed={d === day}
                className={cn(
                  "flex w-16 shrink-0 flex-col items-center rounded-2xl border py-2 transition-colors",
                  d === day
                    ? "border-control bg-control text-control-foreground"
                    : "hover:bg-accent"
                )}
                key={d}
                onClick={() => {
                  setDay(d)
                  setStart(null)
                }}
                type="button"
              >
                <span className="text-xs font-semibold">{weekdayOf(d)}</span>
                <span className="text-xl font-semibold">{dateOf(d).day}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {times.map((t) => (
              <Button
                disabled={taken(t)}
                key={t}
                onClick={() => {
                  setStart(t)
                  steps.next("recap")
                }}
                size="lg"
                variant={start === t ? "default" : "outline"}
              >
                {formatHour(t)}
              </Button>
            ))}
          </div>
          {times.every(taken) && (
            <p className="text-center text-muted-foreground">
              Plus de créneau libre ce jour-là : essayez un autre jour.
            </p>
          )}
        </FlowScreen>
      ) : (
        <FlowScreen
          description="Touchez une ligne pour la modifier."
          footer={
            <Button disabled={!ready} onClick={create} size="lg">
              Réserver le rendez-vous
            </Button>
          }
          onBack={steps.back}
          title="Vérifiez le rendez-vous"
        >
          <div className="space-y-2">
            <SummaryRow
              label={[breed, owner].filter(Boolean).join(" · ")}
              media={<FlowMedia>{animal.slice(0, 1)}</FlowMedia>}
              onEdit={() => steps.edit(client ? "client" : "newClient")}
              value={animal}
            />
            {service && (
              <SummaryRow
                label={durationLabel(service.duration)}
                media={
                  <FlowMedia>
                    <HugeiconsIcon icon={ScissorIcon} />
                  </FlowMedia>
                }
                onEdit={() => steps.edit("service")}
                value={service.name}
              />
            )}
            <SummaryRow
              label="Rendez-vous"
              media={
                <FlowMedia>
                  <HugeiconsIcon icon={Calendar03Icon} />
                </FlowMedia>
              }
              onEdit={() => steps.edit("slot")}
              value={when || "À choisir"}
            />
          </div>
          {service && (
            <div className="flex justify-between rounded-2xl border p-5 text-lg font-semibold">
              <span>À régler sur place</span>
              <span className="tabular-nums">
                {formatAmount(service.price)}
              </span>
            </div>
          )}
          <div className="space-y-3 rounded-2xl border p-4">
            <Label className="flex items-center justify-between gap-3 font-semibold">
              <span className="flex items-center gap-2">
                <HugeiconsIcon className="size-5" icon={SmsCodeIcon} />
                Confirmer par SMS
              </span>
              <Switch checked={sms} onCheckedChange={setSms} />
            </Label>
            {sms && when && (
              <p className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
                Bonjour {owner.split(" ")[0]}, {animal} a rendez-vous au
                toilettage des Coteaux {when.toLowerCase()}. Répondez STOP pour
                annuler. À bientôt !
              </p>
            )}
          </div>
        </FlowScreen>
      )}
    </FlowDialog>
  )
}
