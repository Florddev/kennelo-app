"use client"

import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  Search01Icon,
  SmsCodeIcon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactElement, type ReactNode, useState } from "react"
import { dateOf, shortDate, TODAY, weekdayOf } from "@/components/calendar"
import { clients } from "@/components/clients/data"
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
  rowFor,
  sizeOfWeight,
  useCatalog,
} from "@/components/services/data"
import { formatAmount } from "@/components/today/widgets"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type Species = "Chien" | "Chat"
type Draft = {
  name: string
  phone: string
  pet: string
  species: Species
  breed: string
}

const emptyDraft: Draft = {
  breed: "",
  name: "",
  pet: "",
  phone: "",
  species: "Chien",
}
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

function Step({
  n,
  title,
  done,
  children,
}: {
  n: number
  title: string
  done: boolean
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full border text-xs",
            done && "border-transparent bg-primary text-primary-foreground"
          )}
        >
          {done ? (
            <HugeiconsIcon className="size-3.5" icon={CheckmarkCircle02Icon} />
          ) : (
            n
          )}
        </span>
        {title}
      </h3>
      <div className="ps-8">{children}</div>
    </section>
  )
}

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
  const [query, setQuery] = useState("")
  const [clientName, setClientName] = useState<string | undefined>(
    defaultClient
  )
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
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

  const reset = () => {
    setQuery("")
    setClientName(defaultClient)
    setCreating(false)
    setDraft(emptyDraft)
    setPetName(defaultPet)
    setArrival(null)
    setDeparture(null)
    setKennelChoice(null)
    setOptions(null)
    setSms(true)
    setCreated(null)
    setStartedAt(clock())
  }

  const client = clients.find((c) => c.name === clientName)
  const q = query.trim().toLowerCase()
  const matches = q
    ? clients
        .filter((c) =>
          `${c.name} ${c.phone.replaceAll(" ", "")} ${c.phone} ${c.pets.map((p) => p.name).join(" ")}`
            .toLowerCase()
            .includes(q)
        )
        .slice(0, 5)
    : []

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

  const selectClient = (name: string) => {
    const c = clients.find((x) => x.name === name)
    setClientName(name)
    setCreating(false)
    setQuery("")
    setPetName(c?.pets.length === 1 ? c.pets[0].name : undefined)
    setOptions(null)
  }

  const startCreate = () => {
    const digits = /^[\d\s+]+$/.test(query)
    setDraft({
      ...emptyDraft,
      name: digits ? "" : query,
      phone: digits ? query : "",
    })
    setCreating(true)
    setClientName(undefined)
    setPetName(undefined)
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

  return (
    <Dialog
      onOpenChange={(next) => {
        if (next) reset()
        setOpen(next)
      }}
      open={open}
    >
      <DialogTrigger render={trigger} />
      <DialogPopup className="max-w-4xl">
        {created ? (
          <>
            <DialogPanel className="flex flex-col items-center gap-4 py-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HugeiconsIcon
                  className="size-7"
                  icon={CheckmarkCircle02Icon}
                />
              </span>
              <div className="space-y-1">
                <DialogTitle>Séjour de {created.stay.pet} créé</DialogTitle>
                <DialogDescription>
                  {shortDate(created.stay.arrival)} →{" "}
                  {shortDate(created.stay.departure)} ·{" "}
                  {kennelLabel(created.stay.kennelId)} ·{" "}
                  {formatAmount(stayAmount(created.stay, prices))}
                </DialogDescription>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="success">Créé en {created.seconds} s</Badge>
                {sms && (
                  <Badge variant="info">
                    <HugeiconsIcon icon={SmsCodeIcon} />
                    Acompte de {formatAmount(
                      stayDeposit(created.stay, prices)
                    )}{" "}
                    demandé au {phone}
                  </Badge>
                )}
              </div>
            </DialogPanel>
            <DialogFooter>
              {client && (
                <Button
                  render={
                    <Link
                      href={petHref(created.stay.pet, created.stay.owner)}
                    />
                  }
                  variant="outline"
                >
                  Fiche de {created.stay.pet}
                </Button>
              )}
              <Button onClick={reset} variant="outline">
                Autre séjour
              </Button>
              <Button onClick={() => setOpen(false)}>Terminé</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Nouveau séjour</DialogTitle>
              <DialogDescription>
                Client, animal, dates : le box et le prix se calculent tout
                seuls.
              </DialogDescription>
            </DialogHeader>
            <DialogPanel className="grid gap-8 md:grid-cols-[1fr_17rem]">
              <div className="min-w-0 space-y-7">
                <Step done={whoDone} n={1} title="Client et animal">
                  {client ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-xl border p-3">
                        <Avatar className="size-9">
                          <AvatarFallback>{client.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {client.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {client.phone} · {client.city}
                            {client.balance > 0 &&
                              ` · solde dû ${formatAmount(client.balance)}`}
                          </p>
                        </div>
                        <Button
                          onClick={() => setClientName(undefined)}
                          size="xs"
                          variant="ghost"
                        >
                          Changer
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {client.pets.map((p) => (
                          <Button
                            className={cn(
                              petName === p.name &&
                                "border-primary bg-primary/30"
                            )}
                            key={p.name}
                            onClick={() => {
                              setPetName(p.name)
                              setOptions(null)
                            }}
                            size="sm"
                            variant="outline"
                          >
                            {p.name}
                            <span className="text-muted-foreground">
                              {p.breed || p.species}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : creating ? (
                    <div className="grid gap-3 rounded-xl border p-3 sm:grid-cols-2">
                      {(
                        [
                          ["name", "Nom du client", "Prénom Nom"],
                          ["phone", "Téléphone", "06 12 34 56 78"],
                          ["pet", "Nom de l'animal", "Ex. Filou"],
                          ["breed", "Race", "Ex. Beagle"],
                        ] as const
                      ).map(([key, label, placeholder]) => (
                        <div className="space-y-1.5" key={key}>
                          <Label htmlFor={`new-${key}`}>{label}</Label>
                          <Input
                            autoFocus={key === "name" && !draft.name}
                            id={`new-${key}`}
                            onChange={(e) =>
                              setDraft({ ...draft, [key]: e.target.value })
                            }
                            placeholder={placeholder}
                            size="sm"
                            value={draft[key]}
                          />
                        </div>
                      ))}
                      <div className="flex items-center justify-between gap-2 sm:col-span-2">
                        <Tabs
                          onValueChange={(v) =>
                            setDraft({ ...draft, species: v as Species })
                          }
                          value={draft.species}
                        >
                          <TabsList size="sm">
                            <TabsTab value="Chien">Chien</TabsTab>
                            <TabsTab value="Chat">Chat</TabsTab>
                          </TabsList>
                        </Tabs>
                        <Button
                          onClick={() => setCreating(false)}
                          size="xs"
                          variant="ghost"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <InputGroup>
                        <InputGroupAddon>
                          <HugeiconsIcon icon={Search01Icon} />
                        </InputGroupAddon>
                        <InputGroupInput
                          aria-label="Rechercher un client"
                          autoFocus
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return
                            e.preventDefault()
                            if (matches[0]) selectClient(matches[0].name)
                            else if (q) startCreate()
                          }}
                          placeholder="Nom, téléphone ou nom de l'animal…"
                          value={query}
                        />
                      </InputGroup>
                      {matches.length > 0 && (
                        <ul className="divide-y rounded-xl border">
                          {matches.map((c, i) => (
                            <li key={c.name}>
                              <button
                                className="flex w-full items-center gap-3 px-3 py-2 text-start hover:bg-accent"
                                onClick={() => selectClient(c.name)}
                                type="button"
                              >
                                <Avatar className="size-7">
                                  <AvatarFallback className="text-[0.625rem]">
                                    {c.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium">
                                    {c.name}
                                  </span>
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {c.pets.map((p) => p.name).join(", ")} ·{" "}
                                    {c.phone}
                                  </span>
                                </span>
                                {i === 0 && (
                                  <Badge variant="outline">Entrée</Badge>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Button onClick={startCreate} size="sm" variant="ghost">
                        <HugeiconsIcon icon={UserAdd01Icon} />
                        {q && matches.length === 0
                          ? `Créer « ${query.trim()} »`
                          : "Nouveau client"}
                      </Button>
                    </div>
                  )}
                </Step>

                <Step done={datesSet} n={2} title="Dates">
                  <div className="space-y-3">
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {DAYS.slice(0, 7).map((d) => (
                        <span
                          className="text-[0.625rem] text-muted-foreground uppercase"
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
                              "flex h-11 flex-col items-center justify-center rounded-lg text-sm transition-colors",
                              past
                                ? "pointer-events-none opacity-35"
                                : "hover:bg-accent",
                              inside && "rounded-none bg-primary/30",
                              edge &&
                                "bg-primary font-semibold text-primary-foreground hover:bg-primary"
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
                                  "text-[0.5625rem] leading-none",
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
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {arrival === null ? (
                        "Touchez le jour d'arrivée puis celui du départ."
                      ) : (
                        <>
                          <span>Durée rapide :</span>
                          {[1, 2, 3, 7, 14].map((n) => (
                            <Button
                              className={cn(
                                departure === arrival + n &&
                                  "border-primary bg-primary/30"
                              )}
                              key={n}
                              onClick={() => setDeparture(arrival + n)}
                              size="xs"
                              variant="outline"
                            >
                              {n} nuit{n > 1 && "s"}
                            </Button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </Step>

                <Step
                  done={Boolean(datesSet && kennelId)}
                  n={3}
                  title="Box et options"
                >
                  {!datesSet ? (
                    <p className="text-sm text-muted-foreground">
                      Le box se propose dès que les dates sont choisies.
                    </p>
                  ) : free.length === 0 ? (
                    <Alert variant="error">
                      <HugeiconsIcon icon={Alert02Icon} />
                      <AlertTitle>Complet sur ces dates</AlertTitle>
                      <AlertDescription>
                        Aucun box {area === "Chenil" ? "chenil" : "chatterie"}{" "}
                        libre. Proposez d&apos;autres dates ou la liste
                        d&apos;attente.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {free.slice(0, 6).map((k) => (
                          <Button
                            className={cn(
                              kennelId === k.id &&
                                "border-primary bg-primary/30"
                            )}
                            key={k.id}
                            onClick={() => setKennelChoice(k.id)}
                            size="sm"
                            variant="outline"
                          >
                            {kennelLabel(k.id)}
                            {k.id === suggested && (
                              <Badge size="sm" variant="success">
                                {usual ? "Son box habituel" : "Suggéré"}
                              </Badge>
                            )}
                          </Button>
                        ))}
                        {free.length > 6 && (
                          <span className="self-center text-xs text-muted-foreground">
                            +{free.length - 6} autres libres
                          </span>
                        )}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Object.entries(prices).map(
                          ([option, { price, perNight }]) => (
                            <Label
                              className="flex items-center gap-2 rounded-lg border px-3 py-2 font-normal"
                              key={option}
                            >
                              <Checkbox
                                checked={chosenOptions.includes(option)}
                                onCheckedChange={(checked) =>
                                  setOptions(
                                    checked
                                      ? [...chosenOptions, option]
                                      : chosenOptions.filter(
                                          (o) => o !== option
                                        )
                                  )
                                }
                              />
                              <span className="flex-1">{option}</span>
                              <span className="text-xs text-muted-foreground">
                                {included.includes(option)
                                  ? "Incluse"
                                  : `${price} €${perNight ? "/nuit" : ""}`}
                              </span>
                            </Label>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </Step>
              </div>

              <aside className="space-y-4 md:sticky md:top-0 md:self-start">
                <div className="space-y-3 rounded-2xl bg-muted/60 p-4">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Récapitulatif
                  </p>
                  <div>
                    <p className="font-heading text-lg font-semibold">
                      {animal || "Animal ?"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {[breed, owner].filter(Boolean).join(" · ") ||
                        "Choisissez un client"}
                    </p>
                  </div>
                  {datesSet && (
                    <p className="text-sm">
                      {shortDate(arrival)} → {shortDate(departure)}
                      <span className="text-muted-foreground">
                        {" "}
                        · {departure - arrival} nuits
                      </span>
                      <br />
                      <span className="text-muted-foreground">
                        {kennelLabel(kennelId)}
                      </span>
                    </p>
                  )}
                  {draftStay && (
                    <ul className="space-y-1 border-t pt-3 text-sm">
                      {stayLines({ ...draftStay, kennelId }, prices).map(
                        (line) => (
                          <li
                            className="flex justify-between gap-2"
                            key={line.label}
                          >
                            <span className="text-muted-foreground">
                              {line.label}
                            </span>
                            <span className="tabular-nums">
                              {formatAmount(line.amount)}
                            </span>
                          </li>
                        )
                      )}
                      <li className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total</span>
                        <span className="tabular-nums">
                          {formatAmount(
                            stayAmount({ ...draftStay, kennelId }, prices)
                          )}
                        </span>
                      </li>
                      <li className="flex justify-between text-muted-foreground">
                        <span>Acompte 30 %</span>
                        <span className="tabular-nums">
                          {formatAmount(deposit)}
                        </span>
                      </li>
                    </ul>
                  )}
                </div>

                {issues.length > 0 && (
                  <Alert variant="warning">
                    <HugeiconsIcon icon={Alert02Icon} />
                    <AlertTitle>Vaccin à renouveler</AlertTitle>
                    <AlertDescription>
                      {issues
                        .map(
                          (v) => `${v.name} expiré le ${formatDate(v.expires)}`
                        )
                        .join(", ")}
                      . Le rappeler au client, le SMS le mentionnera.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3 rounded-2xl border p-4">
                  <Label className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <HugeiconsIcon className="size-4" icon={SmsCodeIcon} />
                      Acompte par SMS
                    </span>
                    <Switch checked={sms} onCheckedChange={setSms} />
                  </Label>
                  {sms && smsText && (
                    <div className="space-y-1">
                      <p className="rounded-2xl rounded-bl-sm bg-primary/30 px-3 py-2 text-xs leading-relaxed">
                        {smsText}
                      </p>
                      <p className="text-[0.6875rem] text-muted-foreground">
                        Envoyé au {phone || "…"} avec lien de paiement
                      </p>
                    </div>
                  )}
                </div>
              </aside>
            </DialogPanel>
            <DialogFooter>
              <Button onClick={() => setOpen(false)} variant="ghost">
                Annuler
              </Button>
              <Button disabled={!ready} onClick={create}>
                {sms ? "Créer et envoyer le SMS" : "Créer le séjour"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogPopup>
    </Dialog>
  )
}
