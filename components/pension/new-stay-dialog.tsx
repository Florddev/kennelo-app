"use client"

import {
  Alert02Icon,
  BedDoubleIcon,
  Calendar03Icon,
  ClipboardIcon,
  SmsCodeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactElement, useState } from "react"
import { dateOf, shortDate, TODAY, weekdayOf } from "@/components/calendar"
import { type Client, clients } from "@/components/clients/data"
import {
  type ClientDraft,
  ClientStep,
  draftFromQuery,
  emptyClientDraft,
  NewClientStep,
  PetStep,
  type Species,
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
import {
  kennels,
  type OptionPrices,
  type Stay,
  stayAmount,
  stayDeposit,
  stayLines,
  stays as initialStays,
} from "@/components/pension/data"
import {
  formatDate,
  isoOf,
  petByName,
  petHref,
  vaccineIssues,
} from "@/components/pets/data"
import {
  adjusted,
  groupNights,
  quote,
  rowFor,
  sizeOfWeight,
  useCatalog,
} from "@/components/services/data"
import { formatAmount } from "@/components/today/widgets"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type StepId =
  "client" | "newClient" | "pet" | "dates" | "kennel" | "options" | "recap"
/** Wall clock, only read from event handlers. */
const clock = () => Date.now()
const DAYS = Array.from({ length: 28 }, (_, i) => i)

export const kennelLabel = (id?: string) => {
  const kennel = kennels.find((k) => k.id === id)
  if (!kennel) return "À placer"
  return kennel.area === "Chenil"
    ? `Box ${kennel.label}`
    : `Chatterie ${kennel.label.replace("C", "")}`
}

const overlaps = (s: Stay, arrival: number, departure: number) =>
  s.kennelId &&
  s.status !== "done" &&
  s.arrival < departure &&
  arrival < s.departure

export function NewStayDialog({
  trigger,
  stays = initialStays,
  defaultClient,
  defaultPet,
  onCreate,
}: {
  trigger: ReactElement
  stays?: Stay[]
  defaultClient?: string
  defaultPet?: string
  onCreate?: (stay: Stay) => void
}) {
  const [open, setOpen] = useState(false)
  const [startedAt, setStartedAt] = useState(0)
  const catalog = useCatalog()
  const [clientName, setClientName] = useState<string | undefined>(
    defaultClient
  )
  const [draft, setDraft] = useState<ClientDraft>(emptyClientDraft)
  const [petName, setPetName] = useState<string | undefined>(defaultPet)
  const [arrival, setArrival] = useState<number | null>(null)
  const [departure, setDeparture] = useState<number | null>(null)
  const [kennelChoice, setKennelChoice] = useState<string | null>(null)
  const [options, setOptions] = useState<string[] | null>(null)
  const [sms, setSms] = useState(true)
  const [created, setCreated] = useState<{
    stay: Stay
    seconds: number
  } | null>(null)

  const steps = useSteps<StepId>("client")

  const reset = () => {
    const start = clients.find((c) => c.name === defaultClient)
    const single = start?.pets.length === 1 ? start.pets[0].name : undefined
    setClientName(defaultClient)
    setDraft(emptyClientDraft)
    setPetName(defaultPet ?? single)
    steps.reset(!start ? "client" : defaultPet || single ? "dates" : "pet")
    setArrival(null)
    setDeparture(null)
    setKennelChoice(null)
    setOptions(null)
    setSms(true)
    setCreated(null)
    setStartedAt(clock())
  }

  const client = clients.find((c) => c.name === clientName)
  const pet = client && petName ? petByName(petName, client.name) : undefined
  const species: Species = pet?.species ?? draft.species
  const owner = client?.name ?? draft.name
  const phone = client?.phone ?? draft.phone
  const animal = pet?.name ?? draft.pet
  const breed = pet?.breed ?? draft.breed
  const area = species === "Chat" ? "Chatterie" : "Chenil"
  const areaKennels = kennels.filter((k) => k.area === area)
  const freeOn = (day: number) =>
    areaKennels.length -
    stays.filter(
      (s) =>
        areaKennels.some((k) => k.id === s.kennelId) &&
        overlaps(s, day, day + 1)
    ).length

  const datesSet = arrival !== null && departure !== null
  const free = datesSet
    ? areaKennels.filter(
        (k) =>
          !stays.some(
            (s) => s.kennelId === k.id && overlaps(s, arrival, departure)
          )
      )
    : []
  const usual = stays.find(
    (s) =>
      s.pet === animal &&
      s.owner === owner &&
      free.some((k) => k.id === s.kennelId)
  )?.kennelId
  const suggested = usual ?? free[0]?.id
  const kennelId =
    kennelChoice && free.some((k) => k.id === kennelChoice)
      ? kennelChoice
      : suggested
  // Hébergement calculé nuit par nuit selon les périodes tarifaires
  const stayQuote = datesSet
    ? quote(
        catalog,
        "pension",
        kennelId?.startsWith("c") ? "Chatterie" : "Box",
        isoOf(arrival),
        departure - arrival
      )
    : null
  // Options de la pension, prises dans le catalogue commun
  const prices: OptionPrices = {}
  const included: string[] = []
  for (const offer of catalog.offers.pension ?? []) {
    const service = catalog.services.find((s) => s.id === offer.serviceId)
    if (!service?.active || !offer.active) continue
    const row = rowFor(service, {
      breed,
      size: sizeOfWeight(pet?.weight),
      species,
    })
    if (!row) continue
    prices[service.name] = {
      perNight: offer.perNight,
      price: offer.included ? 0 : adjusted(row.price, offer.adjust),
    }
    if (offer.included) included.push(service.name)
  }
  const defaultOptions = [
    ...included,
    ...(pet?.treatments.length ? ["Traitement"] : []),
    ...(pet?.food.treats === "Aucune" ? ["Régime"] : []),
  ].filter((o) => o in prices)
  const chosenOptions = options ?? defaultOptions

  const draftStay: Stay | null =
    datesSet && animal && owner
      ? {
          arrival,
          breed,
          departure,
          id: "draft",
          kennelId,
          options: chosenOptions,
          owner,
          payment: "due",
          pet: animal,
          rates: stayQuote
            ? groupNights(stayQuote.nights.filter((n) => !n.closed))
            : undefined,
          status: "upcoming",
        }
      : null
  const issues = pet && datesSet ? vaccineIssues(pet, isoOf(departure)) : []
  const whoDone = Boolean(animal && owner && (client || draft.phone))
  const ready = Boolean(draftStay && kennelId && whoDone)
  const deposit = draftStay ? stayDeposit(draftStay, prices) : 0
  const first = owner.split(" ")[0]
  const smsText = draftStay
    ? `Bonjour ${first}, le séjour de ${animal} aux Coteaux du ${dateOf(draftStay.arrival).day} ${dateOf(draftStay.arrival).month} au ${dateOf(draftStay.departure).day} ${dateOf(draftStay.departure).month} est réservé. Merci de régler l'acompte de ${formatAmount(deposit)} ici : kennelo.fr/p/8F2K. À bientôt !`
    : ""

  const pickDay = (day: number) => {
    if (arrival === null || departure !== null || day <= arrival) {
      setArrival(day)
      setDeparture(null)
    } else {
      setDeparture(day)
    }
  }

  const selectClient = (c: Client) => {
    setClientName(c.name)
    setPetName(c.pets.length === 1 ? c.pets[0].name : undefined)
    setOptions(null)
    if (c.pets.length === 1) steps.next("dates")
    else steps.go("pet")
  }

  const startCreate = (query: string) => {
    setDraft(draftFromQuery(query))
    setClientName(undefined)
    setPetName(undefined)
    steps.go("newClient")
  }

  const create = () => {
    if (!draftStay || !kennelId) return
    const stay = { ...draftStay, id: `new-${clock()}`, kennelId }
    onCreate?.(stay)
    setCreated({
      seconds: Math.max(1, Math.round((clock() - startedAt) / 1000)),
      stay,
    })
  }

  const hasOptions = Object.keys(prices).length > 0
  const order: StepId[] = [
    "client",
    "pet",
    "dates",
    "kennel",
    "options",
    "recap",
  ]
  const progress =
    order.indexOf(steps.step === "newClient" ? "pet" : steps.step) /
    (order.length - 1)
  const periodAlerts = stayQuote && (
    <>
      {stayQuote.short && (
        <Alert variant="warning">
          <HugeiconsIcon icon={Alert02Icon} />
          <AlertTitle>Séjour minimum de {stayQuote.minStay} nuits</AlertTitle>
          <AlertDescription>
            Pour une arrivée pendant « {stayQuote.nights[0]?.period?.name} ».
          </AlertDescription>
        </Alert>
      )}
      {stayQuote.closed.length > 0 && (
        <Alert variant="warning">
          <HugeiconsIcon icon={Alert02Icon} />
          <AlertTitle>Fermé sur une partie du séjour</AlertTitle>
          <AlertDescription>
            {stayQuote.closed
              .map((n) => `${formatDate(n.date)} : ${n.closed}`)
              .join(" · ")}
          </AlertDescription>
        </Alert>
      )}
    </>
  )

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
                Créer un autre séjour
              </Button>
              {client && (
                <Button
                  render={
                    <Link
                      href={petHref(created.stay.pet, created.stay.owner)}
                    />
                  }
                  size="lg"
                  variant="ghost"
                >
                  Voir la fiche de {created.stay.pet}
                </Button>
              )}
            </>
          }
          description={`${created.stay.pet} · ${shortDate(created.stay.arrival)} → ${shortDate(created.stay.departure)} · ${kennelLabel(created.stay.kennelId)} · ${formatAmount(stayAmount(created.stay, prices))}`}
          title="Séjour créé"
        >
          <Badge size="lg" variant="success">
            Créé en {created.seconds} s
          </Badge>
          {sms && (
            <Badge size="lg" variant="info">
              <HugeiconsIcon icon={SmsCodeIcon} />
              Acompte de {formatAmount(stayDeposit(created.stay, prices))}{" "}
              demandé au {phone}
            </Badge>
          )}
        </FlowDone>
      ) : steps.step === "client" ? (
        <ClientStep onCreate={startCreate} onSelect={selectClient} />
      ) : steps.step === "newClient" ? (
        <NewClientStep
          draft={draft}
          onBack={steps.back}
          onChange={setDraft}
          onContinue={() => steps.next("dates")}
        />
      ) : steps.step === "pet" && client ? (
        <PetStep
          client={client}
          onBack={steps.back}
          onSelect={(name) => {
            setPetName(name)
            setOptions(null)
            steps.next("dates")
          }}
          selected={petName}
          title="Quel animal vient en pension ?"
        />
      ) : steps.step === "dates" || steps.step === "pet" ? (
        <FlowScreen
          description="Touchez le jour d'arrivée, puis celui du départ."
          footer={
            <Button
              disabled={!datesSet}
              onClick={() => steps.next("kennel")}
              size="lg"
            >
              Continuer
            </Button>
          }
          onBack={steps.back}
          title={`Quand vient ${animal || "l'animal"} ?`}
        >
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAYS.slice(0, 7).map((d) => (
              <span
                className="pb-1 text-xs font-semibold text-muted-foreground"
                key={d}
              >
                {weekdayOf(d).slice(0, 3)}
              </span>
            ))}
            {DAYS.map((day) => {
              const past = day < TODAY
              const n = freeOn(day)
              const edge = day === arrival || day === departure
              const inside =
                arrival !== null &&
                departure !== null &&
                day > arrival &&
                day < departure
              return (
                <button
                  className={cn(
                    "flex h-14 flex-col items-center justify-center rounded-xl font-semibold transition-colors",
                    past ? "pointer-events-none opacity-35" : "hover:bg-accent",
                    inside && "rounded-none bg-primary/30",
                    edge &&
                      "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                  disabled={past}
                  key={day}
                  onClick={() => pickDay(day)}
                  type="button"
                >
                  {dateOf(day).day}
                  {!past && (
                    <span
                      className={cn(
                        "text-[0.625rem] leading-none font-normal",
                        edge
                          ? "text-primary-foreground/70"
                          : n === 0
                            ? "text-destructive-foreground"
                            : n <= 3
                              ? "text-warning-foreground"
                              : "text-muted-foreground"
                      )}
                    >
                      {n} libre{n > 1 && "s"}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {arrival !== null && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[1, 2, 3, 7, 14].map((n) => (
                <Button
                  key={n}
                  onClick={() => setDeparture(arrival + n)}
                  size="sm"
                  variant={departure === arrival + n ? "default" : "secondary"}
                >
                  {n} nuit{n > 1 && "s"}
                </Button>
              ))}
            </div>
          )}
          {datesSet && (
            <p className="text-center text-lg font-semibold">
              {shortDate(arrival)} → {shortDate(departure)} ·{" "}
              {departure - arrival} nuit{departure - arrival > 1 && "s"}
            </p>
          )}
          {periodAlerts}
        </FlowScreen>
      ) : steps.step === "kennel" ? (
        <FlowScreen
          description={
            datesSet
              ? `${shortDate(arrival)} → ${shortDate(departure)} · ${free.length} place${free.length > 1 ? "s" : ""} libre${free.length > 1 ? "s" : ""}`
              : undefined
          }
          onBack={steps.back}
          title={
            area === "Chenil" ? "Dans quel box ?" : "Dans quelle chatterie ?"
          }
        >
          {free.length === 0 ? (
            <Alert variant="error">
              <HugeiconsIcon icon={Alert02Icon} />
              <AlertTitle>Complet sur ces dates</AlertTitle>
              <AlertDescription>
                Proposez d&apos;autres dates ou la liste d&apos;attente.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="-mx-3 space-y-1">
              {[...free]
                .sort((a, b) =>
                  a.id === suggested ? -1 : b.id === suggested ? 1 : 0
                )
                .slice(0, 8)
                .map((k) => (
                  <ChoiceRow
                    aside={
                      k.id === suggested && (
                        <Badge variant="success">
                          {usual ? "Son box habituel" : "Suggéré"}
                        </Badge>
                      )
                    }
                    description={k.area === "Chenil" ? "Chenil" : "Chatterie"}
                    key={k.id}
                    media={<FlowMedia>{k.label}</FlowMedia>}
                    onClick={() => {
                      setKennelChoice(k.id)
                      steps.next(hasOptions ? "options" : "recap")
                    }}
                    selected={kennelId === k.id}
                    title={kennelLabel(k.id)}
                  />
                ))}
            </div>
          )}
        </FlowScreen>
      ) : steps.step === "options" ? (
        <FlowScreen
          description="Cochez ce qui s'applique. Les prix viennent de votre catalogue."
          footer={
            <Button onClick={() => steps.next("recap")} size="lg">
              Continuer
            </Button>
          }
          onBack={steps.back}
          title={`Des options pour ${animal} ?`}
        >
          <div className="space-y-2">
            {Object.entries(prices).map(([option, { price, perNight }]) => (
              <Label
                className="flex items-center gap-4 rounded-2xl border p-4 font-normal has-data-checked:border-control has-data-checked:bg-accent"
                key={option}
              >
                <Checkbox
                  checked={chosenOptions.includes(option)}
                  onCheckedChange={(checked) =>
                    setOptions(
                      checked
                        ? [...chosenOptions, option]
                        : chosenOptions.filter((o) => o !== option)
                    )
                  }
                />
                <span className="flex-1 font-semibold">{option}</span>
                <span className="text-muted-foreground">
                  {included.includes(option)
                    ? "Incluse"
                    : `${price} €${perNight ? " / nuit" : ""}`}
                </span>
              </Label>
            ))}
          </div>
        </FlowScreen>
      ) : (
        <FlowScreen
          description="Touchez une ligne pour la modifier."
          footer={
            <Button disabled={!ready} onClick={create} size="lg">
              {sms ? "Créer et envoyer le SMS" : "Créer le séjour"}
            </Button>
          }
          onBack={steps.back}
          title="Vérifiez le séjour"
        >
          <div className="space-y-2">
            <SummaryRow
              label={[breed, owner].filter(Boolean).join(" · ")}
              media={<FlowMedia>{animal.slice(0, 1)}</FlowMedia>}
              onEdit={() => steps.edit(client ? "client" : "newClient")}
              value={animal}
            />
            {datesSet && (
              <SummaryRow
                label={`${departure - arrival} nuit${departure - arrival > 1 ? "s" : ""}`}
                media={
                  <FlowMedia>
                    <HugeiconsIcon icon={Calendar03Icon} />
                  </FlowMedia>
                }
                onEdit={() => steps.edit("dates")}
                value={`${shortDate(arrival)} → ${shortDate(departure)}`}
              />
            )}
            <SummaryRow
              label="Emplacement"
              media={
                <FlowMedia>
                  <HugeiconsIcon icon={BedDoubleIcon} />
                </FlowMedia>
              }
              onEdit={() => steps.edit("kennel")}
              value={kennelLabel(kennelId)}
            />
            {hasOptions && (
              <SummaryRow
                label="Options"
                media={
                  <FlowMedia>
                    <HugeiconsIcon icon={ClipboardIcon} />
                  </FlowMedia>
                }
                onEdit={() => steps.edit("options")}
                value={chosenOptions.join(", ") || "Aucune option"}
              />
            )}
          </div>
          {draftStay && (
            <ul className="space-y-2 rounded-2xl border p-5">
              {stayLines({ ...draftStay, kennelId }, prices).map((line) => (
                <li className="flex justify-between gap-3" key={line.label}>
                  <span className="text-muted-foreground">{line.label}</span>
                  <span className="tabular-nums">
                    {formatAmount(line.amount)}
                  </span>
                </li>
              ))}
              <li className="flex justify-between border-t pt-3 text-lg font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatAmount(stayAmount({ ...draftStay, kennelId }, prices))}
                </span>
              </li>
              <li className="flex justify-between text-muted-foreground">
                <span>Acompte 30 %</span>
                <span className="tabular-nums">{formatAmount(deposit)}</span>
              </li>
            </ul>
          )}
          {periodAlerts}
          {issues.length > 0 && (
            <Alert variant="warning">
              <HugeiconsIcon icon={Alert02Icon} />
              <AlertTitle>Vaccin à renouveler</AlertTitle>
              <AlertDescription>
                {issues
                  .map((v) => `${v.name} expiré le ${formatDate(v.expires)}`)
                  .join(", ")}
                . Le rappeler au client, le SMS le mentionnera.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-3 rounded-2xl border p-4">
            <Label className="flex items-center justify-between gap-3 font-semibold">
              <span className="flex items-center gap-2">
                <HugeiconsIcon className="size-5" icon={SmsCodeIcon} />
                Demander l&apos;acompte par SMS
              </span>
              <Switch checked={sms} onCheckedChange={setSms} />
            </Label>
            {sms && smsText && (
              <div className="space-y-1">
                <p className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
                  {smsText}
                </p>
                <p className="text-xs text-muted-foreground">
                  Envoyé au {phone || "…"} avec un lien de paiement
                </p>
              </div>
            )}
          </div>
        </FlowScreen>
      )}
    </FlowDialog>
  )
}
