"use client"

import {
  Alert02Icon,
  BedIcon,
  PlusSignIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import { type Activity, activityMeta } from "@/components/activity-mark"
import { TODAY } from "@/components/calendar"
import {
  ChoiceCards,
  ChoiceRow,
  FlowDone,
  FlowField,
  FlowMedia,
  FlowPage,
  FlowScreen,
  SummaryRow,
  useFlowMobile,
  useSteps,
} from "@/components/flow/flow"
import { routesFor } from "@/components/site/routes"
import { durationLabel, SlotStep } from "@/components/flow/slot-step"
import { isoOf } from "@/components/pets/data"
import { BookingTicket } from "@/components/site/booking-detail"
import {
  addBooking,
  catalogIds,
  me,
  type MyBooking,
  type MyPet,
  scale,
  useSite,
  venueOf,
} from "@/components/site/data"
import {
  activityIcons,
  bookingDates,
  PetAvatar,
} from "@/components/site/site-ui"
import {
  addDays,
  adjusted,
  euros,
  fromPrice,
  groupNights,
  nightFor,
  quote,
  rowFor,
  type Service,
  shortIso,
  todayIso,
  useCatalog,
  weekdays,
} from "@/components/services/data"
import { formatHour } from "@/components/today/widgets"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Step =
  | "activity"
  | "pets"
  | "dates"
  | "place"
  | "service"
  | "slot"
  | "options"
  | "note"
  | "recap"
  | "done"

const monday = addDays(
  todayIso,
  -((new Date(`${todayIso}T00:00:00Z`).getUTCDay() + 6) % 7)
)
const calendarDays = Array.from({ length: 42 }, (_, i) => addDays(monday, i))
const nightsBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`

/** Ligne à cocher (plusieurs choix possibles). */
function PickRow({
  media,
  title,
  description,
  aside,
  checked,
  disabled,
  onClick,
}: {
  media?: ReactNode
  title: ReactNode
  description?: ReactNode
  aside?: ReactNode
  checked: boolean
  disabled?: boolean
  onClick: () => void
}) {
  const mobile = useFlowMobile()
  return (
    <button
      aria-pressed={checked}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl p-3 text-start transition-colors hover:bg-accent disabled:pointer-events-none",
        checked && "bg-accent",
        mobile &&
          (checked
            ? "min-h-20 rounded-3xl border-2 border-control p-4"
            : "min-h-20 rounded-3xl border-2 border-border p-4")
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {media}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        {description && (
          <span className="block text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {aside && <span className="shrink-0 text-end">{aside}</span>}
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md border-2",
          checked
            ? "border-control bg-control text-control-foreground"
            : "border-input"
        )}
      >
        {checked && (
          <HugeiconsIcon className="size-4" icon={Tick02Icon} strokeWidth={3} />
        )}
      </span>
    </button>
  )
}

export function BookingFlow({
  slug,
  initialActivity,
  mobile,
}: {
  slug: string
  initialActivity?: Activity
  /** Liens vers l'app mobile plutôt que le site. */
  mobile?: boolean
}) {
  const routes = routesFor(mobile)
  const venue = venueOf(slug)!
  const catalog = useCatalog()
  const site = useSite()
  const preset =
    initialActivity && venue.activities.includes(initialActivity)
      ? initialActivity
      : venue.activities.length === 1
        ? venue.activities[0]
        : undefined
  const steps = useSteps<Step>(preset ? "pets" : "activity")
  const [activity, setActivity] = useState<Activity>(
    preset ?? venue.activities[0]
  )
  const [petIds, setPetIds] = useState<string[]>([])
  const [arrival, setArrival] = useState<string | null>(null)
  const [departure, setDeparture] = useState<string | null>(null)
  const [place, setPlace] = useState<string | null>(null)
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [day, setDay] = useState(TODAY + 1)
  const [time, setTime] = useState<number | null>(null)
  const [extras, setExtras] = useState<string[]>([])
  const [note, setNote] = useState("")
  const [payment, setPayment] = useState<"online" | "onsite">("online")
  const [created, setCreated] = useState<MyBooking | null>(null)

  const stay = activity === "Pension"
  const id = catalogIds[activity]
  const pets = petIds.flatMap((p) => site.pets.find((x) => x.id === p) ?? [])
  const first = pets[0]
  const names = pets.map((p) => p.name).join(" et ") || "votre animal"
  const eligible = site.pets.filter((p) => venue.species.includes(p.species))

  /* Hébergements possibles pour les animaux choisis */
  const places = (catalog.places.pension ?? []).filter(
    (p) =>
      (!venue.places || venue.places.includes(p.name)) &&
      pets.every((pet) => p.species.includes(pet.species)) &&
      p.animals >= Math.max(1, pets.length)
  )
  const nights = arrival && departure ? nightsBetween(arrival, departure) : 0
  const quoteFor = (name: string) =>
    quote(catalog, "pension", name, arrival ?? todayIso, nights, pets.length)
  const probe = places[0]?.name ?? "Box"
  const probeQuote = arrival && departure ? quoteFor(probe) : null

  /* Prestations de l'activité */
  const offers = (catalog.offers[id] ?? []).flatMap((offer) => {
    const service = catalog.services.find((s) => s.id === offer.serviceId)
    return offer.active && service?.active ? [{ offer, service }] : []
  })
  const priceFor = (service: Service, adjust = 0, pet?: MyPet) => {
    const row = pet ? rowFor(service, pet) : undefined
    return scale(venue, adjusted(row?.price ?? fromPrice(service), adjust))
  }
  const mains = offers.filter((e) => e.service.owner === id)
  const main = mains.find((e) => e.service.id === serviceId)
  const durationOf = (service: Service) =>
    (first && rowFor(service, first)?.duration) ||
    Math.min(...service.grid.map((r) => r.duration))
  const optionList = stay
    ? offers
    : offers.filter((e) => e.service.id !== serviceId)

  /* Détail du prix */
  const lines: MyBooking["lines"] = []
  if (stay && place && arrival && nights > 0) {
    const q = quoteFor(place)
    for (const g of groupNights(q.nights.filter((n) => !n.closed)))
      lines.push({
        amount: scale(venue, g.nights * g.price),
        label: `${plural(g.nights, "nuit")} · ${place}${g.label !== "Base" ? ` · ${g.label}` : ""}`,
      })
    const extra = q.nights.reduce((s, n) => s + n.extra, 0) * (pets.length - 1)
    if (extra > 0)
      lines.push({ amount: scale(venue, extra), label: "Animal en plus" })
  }
  if (!stay && main)
    lines.push({
      amount: priceFor(main.service, main.offer.adjust, first),
      label: main.service.name,
    })
  for (const e of optionList) {
    if (!e.offer.included && !extras.includes(e.service.id)) continue
    const unit = e.offer.included
      ? 0
      : priceFor(e.service, e.offer.adjust, first)
    const times = stay && e.offer.perNight ? nights : 1
    lines.push({
      amount: unit * times,
      label: times > 1 ? `${e.service.name} × ${times}` : e.service.name,
    })
  }
  const total = lines.reduce((s, l) => s + l.amount, 0)

  const order: Step[] = [
    ...(preset ? [] : (["activity"] as Step[])),
    "pets",
    ...((stay ? ["dates", "place"] : ["service", "slot"]) as Step[]),
    "options",
    "note",
    "recap",
  ]
  const progress =
    steps.step === "done"
      ? undefined
      : (order.indexOf(steps.step) + 1) / (order.length + 1)

  const pickDay = (iso: string) => {
    if (!arrival || departure || iso <= arrival) {
      setArrival(iso)
      setDeparture(null)
    } else setDeparture(iso)
  }

  const togglePet = (pet: MyPet) =>
    setPetIds((list) =>
      list.includes(pet.id)
        ? list.filter((x) => x !== pet.id)
        : first && first.species !== pet.species
          ? [pet.id]
          : [...list, pet.id]
    )

  const confirm = () => {
    const booking: MyBooking = {
      activity,
      end: stay ? (departure ?? undefined) : undefined,
      id: `KN-${5000 + site.bookings.length}`,
      item: stay ? (place ?? "") : (main?.service.name ?? ""),
      lines,
      note: note || undefined,
      payment,
      pets: petIds,
      start: stay ? (arrival ?? todayIso) : isoOf(day),
      status: venue.instant ? "confirmed" : "pending",
      time: stay || time === null ? undefined : formatHour(time),
      venue: venue.slug,
    }
    addBooking(booking)
    setCreated(booking)
    steps.go("done")
  }

  const newPetHref = `${routes.newPet}?next=${encodeURIComponent(routes.book(slug, activity))}`

  return (
    <FlowPage
      closeHref={routes.place(slug)}
      mobile={mobile}
      progress={progress}
    >
      {steps.step === "activity" && (
        <FlowScreen
          description={venue.name}
          title="Que souhaitez-vous réserver ?"
        >
          <div className="-mx-3 space-y-1">
            {venue.activities.map((a) => (
              <ChoiceRow
                description={
                  a === "Pension"
                    ? "Un séjour de une ou plusieurs nuits"
                    : "Un rendez-vous"
                }
                key={a}
                media={
                  <FlowMedia className={activityMeta[a].tint}>
                    <HugeiconsIcon icon={activityIcons[a]} />
                  </FlowMedia>
                }
                onClick={() => {
                  setActivity(a)
                  setExtras([])
                  steps.next("pets")
                }}
                selected={a === activity}
                title={a}
              />
            ))}
          </div>
        </FlowScreen>
      )}

      {steps.step === "pets" && (
        <FlowScreen
          description={
            stay
              ? "Les chiens et les chats séjournent séparément."
              : "Une prestation par animal."
          }
          eyebrow={`${activity} · ${venue.name}`}
          footer={
            stay && (
              <Button
                disabled={!pets.length}
                onClick={() => steps.next("dates")}
                size="lg"
              >
                Continuer
              </Button>
            )
          }
          onBack={steps.back}
          title="Pour qui ?"
        >
          <div className="-mx-3 space-y-1">
            {eligible.map((pet) =>
              stay ? (
                <PickRow
                  checked={petIds.includes(pet.id)}
                  description={`${pet.species} · ${pet.breed}`}
                  key={pet.id}
                  media={<PetAvatar pet={pet} />}
                  onClick={() => togglePet(pet)}
                  title={pet.name}
                />
              ) : (
                <ChoiceRow
                  description={`${pet.species} · ${pet.breed}`}
                  key={pet.id}
                  media={<PetAvatar pet={pet} />}
                  onClick={() => {
                    setPetIds([pet.id])
                    steps.next("service")
                  }}
                  selected={petIds.includes(pet.id)}
                  title={pet.name}
                />
              )
            )}
            <Link
              className="flex w-full items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-accent"
              href={newPetHref}
            >
              <FlowMedia className="bg-primary text-primary-foreground">
                <HugeiconsIcon icon={PlusSignIcon} />
              </FlowMedia>
              <span className="font-semibold">Ajouter un animal</span>
            </Link>
          </div>
          {site.pets.length > eligible.length && (
            <p className="text-center text-sm text-muted-foreground">
              {venue.name} n&apos;accueille que les{" "}
              {venue.species.map((s) => s.toLowerCase() + "s").join(" et ")}.
            </p>
          )}
        </FlowScreen>
      )}

      {steps.step === "dates" && (
        <FlowScreen
          footer={
            <Button
              disabled={
                !nights || !!probeQuote?.short || !!probeQuote?.closed.length
              }
              onClick={() => steps.next("place")}
              size="lg"
            >
              Continuer
            </Button>
          }
          onBack={steps.back}
          title={`Quand vient ${names} ?`}
          description="Touchez le jour d'arrivée, puis le jour de départ."
        >
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((d) => (
              <span
                className="pb-1 text-xs font-semibold text-muted-foreground"
                key={d}
              >
                {d}
              </span>
            ))}
            {calendarDays.map((iso) => {
              const past = iso < todayIso
              const night = nightFor(catalog, "pension", probe, iso)
              const closed = !!night.closed
              const edge = iso === arrival || iso === departure
              const inside =
                !!arrival && !!departure && iso > arrival && iso < departure
              const monthStart = iso.endsWith("-01")
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
                  key={iso}
                  onClick={() => pickDay(iso)}
                  type="button"
                >
                  <span
                    className={cn(monthStart && "underline underline-offset-4")}
                  >
                    {Number(iso.slice(8))}
                  </span>
                  {!past && (
                    <span
                      className={cn(
                        "text-[0.625rem] leading-none font-normal",
                        edge
                          ? "text-primary-foreground/70"
                          : closed
                            ? "text-destructive-foreground"
                            : "text-muted-foreground"
                      )}
                    >
                      {closed ? "Fermé" : euros(scale(venue, night.price))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {arrival && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[1, 2, 3, 7, 14].map((n) => (
                <Button
                  key={n}
                  onClick={() => setDeparture(addDays(arrival, n))}
                  size="sm"
                  variant={
                    departure === addDays(arrival, n) ? "default" : "secondary"
                  }
                >
                  {plural(n, "nuit")}
                </Button>
              ))}
            </div>
          )}
          {arrival && departure && (
            <p className="text-center text-lg font-semibold">
              {shortIso(arrival)} → {shortIso(departure)} ·{" "}
              {plural(nights, "nuit")}
            </p>
          )}
          {probeQuote?.short && (
            <Alert variant="warning">
              <HugeiconsIcon icon={Alert02Icon} />
              <AlertDescription>
                {plural(probeQuote.minStay, "nuit")} minimum pour une arrivée
                pendant « {probeQuote.nights[0]?.period?.name} ».
              </AlertDescription>
            </Alert>
          )}
          {!!probeQuote?.closed.length && (
            <Alert variant="error">
              <HugeiconsIcon icon={Alert02Icon} />
              <AlertDescription>
                {venue.name} est fermé le{" "}
                {probeQuote.closed.map((n) => shortIso(n.date)).join(", ")}.
              </AlertDescription>
            </Alert>
          )}
          <p className="text-center text-sm text-muted-foreground">
            Prix par nuit pour « {probe} ». Ils changent selon la saison.
          </p>
        </FlowScreen>
      )}

      {steps.step === "place" && arrival && departure && (
        <FlowScreen
          description={`${shortIso(arrival)} → ${shortIso(departure)} · ${plural(nights, "nuit")}`}
          onBack={steps.back}
          title={`Où va dormir ${names} ?`}
        >
          <div className="-mx-3 space-y-1">
            {places.map((p) => {
              const q = quoteFor(p.name)
              return (
                <ChoiceRow
                  aside={
                    <span className="text-end">
                      <span className="block font-semibold">
                        {euros(scale(venue, q.total))}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        au total
                      </span>
                    </span>
                  }
                  description={`${p.animals > 1 ? `Jusqu'à ${p.animals} animaux` : "1 animal"} · environ ${euros(scale(venue, q.total / Math.max(nights, 1)))} / nuit`}
                  key={p.name}
                  media={
                    <FlowMedia>
                      <HugeiconsIcon icon={BedIcon} />
                    </FlowMedia>
                  }
                  onClick={() => {
                    setPlace(p.name)
                    steps.next("options")
                  }}
                  selected={place === p.name}
                  title={p.name}
                />
              )
            })}
          </div>
          {!places.length && (
            <p className="text-center text-muted-foreground">
              Aucun hébergement ne peut accueillir {names} ensemble. Revenez en
              arrière pour choisir moins d&apos;animaux.
            </p>
          )}
        </FlowScreen>
      )}

      {steps.step === "service" && (
        <FlowScreen
          eyebrow={`${activity} · ${venue.name}`}
          onBack={steps.back}
          title={`Quelle prestation pour ${names} ?`}
        >
          <div className="-mx-3 space-y-1">
            {mains.map(({ offer, service }) => (
              <ChoiceRow
                aside={
                  <span className="font-semibold">
                    {euros(priceFor(service, offer.adjust, first))}
                  </span>
                }
                description={`${durationLabel(durationOf(service))}${service.description ? ` · ${service.description}` : ""}`}
                key={service.id}
                onClick={() => {
                  setServiceId(service.id)
                  setExtras((x) => x.filter((s) => s !== service.id))
                  steps.next("slot")
                }}
                selected={serviceId === service.id}
                title={service.name}
              />
            ))}
          </div>
        </FlowScreen>
      )}

      {steps.step === "slot" && main && (
        <SlotStep
          busy={(d, t) => (d * 7 + t * 4) % 5 === 0}
          day={day}
          description={`${main.service.name} · ${durationLabel(durationOf(main.service))}`}
          length={durationOf(main.service) / 60}
          onBack={steps.back}
          onDay={(d) => {
            setDay(d)
            setTime(null)
          }}
          onPick={(t) => {
            setTime(t)
            steps.next("options")
          }}
          start={time}
        />
      )}

      {steps.step === "options" && (
        <FlowScreen
          description={
            stay
              ? "Facultatif. Les options incluses sont offertes."
              : "Facultatif. Elles se font pendant le même rendez-vous."
          }
          footer={
            <Button onClick={() => steps.next("note")} size="lg">
              {extras.length ? "Continuer" : "Continuer sans option"}
            </Button>
          }
          onBack={steps.back}
          title={`Un petit plus pour ${names} ?`}
        >
          <div className="-mx-3 space-y-1">
            {optionList.map(({ offer, service }) => {
              const unit = priceFor(service, offer.adjust, first)
              const perNight = stay && offer.perNight
              return (
                <PickRow
                  aside={
                    offer.included ? (
                      <span className="font-semibold text-success-foreground">
                        Inclus
                      </span>
                    ) : (
                      <>
                        <span className="block font-semibold">
                          {euros(perNight ? unit * nights : unit)}
                        </span>
                        {perNight && (
                          <span className="block text-sm text-muted-foreground">
                            {euros(unit)} × {plural(nights, "nuit")}
                          </span>
                        )}
                      </>
                    )
                  }
                  checked={offer.included || extras.includes(service.id)}
                  description={service.description}
                  disabled={offer.included}
                  key={service.id}
                  onClick={() =>
                    setExtras((x) =>
                      x.includes(service.id)
                        ? x.filter((s) => s !== service.id)
                        : [...x, service.id]
                    )
                  }
                  title={service.name}
                />
              )
            })}
          </div>
          {!optionList.length && (
            <p className="text-center text-muted-foreground">
              Pas d&apos;option pour cette prestation.
            </p>
          )}
        </FlowScreen>
      )}

      {steps.step === "note" && (
        <FlowScreen
          description={`${venue.name} reçoit aussi la fiche de ${names} : alimentation, santé, vétérinaire.`}
          footer={
            <Button onClick={() => steps.next("recap")} size="lg">
              {note ? "Continuer" : "Passer"}
            </Button>
          }
          onBack={steps.back}
          title={`Un mot pour ${venue.name} ?`}
        >
          <FlowField
            hint="Heure d'arrivée, habitudes, inquiétudes…"
            id="note"
            label="Votre message (facultatif)"
          >
            <Textarea
              id="note"
              onChange={(e) => setNote(e.target.value)}
              placeholder={`Par exemple : ${first?.behaviour ?? "je dépose vers 10 h"}`}
              rows={4}
              value={note}
            />
          </FlowField>
        </FlowScreen>
      )}

      {steps.step === "recap" && (
        <FlowScreen
          footer={
            <>
              <Button onClick={confirm} size="xl">
                {venue.instant
                  ? payment === "online"
                    ? `Payer ${euros(total)} et réserver`
                    : "Réserver"
                  : "Envoyer la demande"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Annulation gratuite jusqu&apos;à 48 h avant.
                {!venue.instant &&
                  ` Vous n'êtes débité qu'une fois la demande acceptée par ${venue.name}.`}
              </p>
            </>
          }
          onBack={steps.back}
          title="Tout est bon ?"
          description={venue.name}
        >
          <div className="space-y-2">
            <SummaryRow
              label={pets.length > 1 ? `${pets.length} animaux` : "1 animal"}
              media={first && <PetAvatar pet={first} />}
              onEdit={() => steps.edit("pets")}
              value={names}
            />
            {stay ? (
              <>
                <SummaryRow
                  label={plural(nights, "nuit")}
                  onEdit={() => steps.edit("dates")}
                  value={
                    arrival && departure
                      ? bookingDates({ end: departure, start: arrival })
                      : ""
                  }
                />
                <SummaryRow
                  label="Hébergement"
                  onEdit={() => steps.edit("place")}
                  value={place}
                />
              </>
            ) : (
              <>
                <SummaryRow
                  label={main ? durationLabel(durationOf(main.service)) : ""}
                  onEdit={() => steps.edit("service")}
                  value={main?.service.name}
                />
                <SummaryRow
                  label="Rendez-vous"
                  onEdit={() => steps.edit("slot")}
                  value={
                    time !== null
                      ? `${shortIso(isoOf(day))} à ${formatHour(time)}`
                      : ""
                  }
                />
              </>
            )}
            <SummaryRow
              label="Options"
              onEdit={() => steps.edit("options")}
              value={
                optionList
                  .filter(
                    (e) => e.offer.included || extras.includes(e.service.id)
                  )
                  .map((e) => e.service.name)
                  .join(", ") || "Aucune"
              }
            />
            {note && (
              <SummaryRow
                label="Votre message"
                onEdit={() => steps.edit("note")}
                value={<span className="line-clamp-2">{note}</span>}
              />
            )}
          </div>

          <div className="space-y-3 rounded-2xl border p-5">
            {lines.map((l, i) => (
              <div className="flex justify-between gap-4" key={i}>
                <span className="text-muted-foreground">{l.label}</span>
                <span className="font-semibold tabular-nums">
                  {l.amount ? euros(l.amount) : "Inclus"}
                </span>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 border-t pt-3">
              <span className="font-semibold">Total</span>
              <span className="text-3xl font-semibold tabular-nums">
                {euros(total)}
              </span>
            </div>
          </div>

          <FlowField label="Paiement">
            <ChoiceCards
              onChange={setPayment}
              options={[
                {
                  description: me.card,
                  label: "En ligne",
                  value: "online",
                },
                {
                  description: "Le jour même",
                  label: "Sur place",
                  value: "onsite",
                },
              ]}
              value={payment}
            />
          </FlowField>
        </FlowScreen>
      )}

      {steps.step === "done" && created && (
        <FlowDone
          actions={
            <>
              <Button
                render={<Link href={routes.booking(created.id)} />}
                size="lg"
              >
                Voir ma réservation
              </Button>
              <Button
                render={<Link href={routes.home} />}
                size="lg"
                variant="secondary"
              >
                Retour à l&apos;accueil
              </Button>
            </>
          }
          description={
            venue.instant
              ? `${venue.name} attend ${names} le ${shortIso(created.start).toLowerCase()}${created.time ? ` à ${created.time}` : ""}.`
              : `${venue.name} vous répond en général en moins de ${venue.response.replace("Répond en ", "")}. Vous recevrez une notification.`
          }
          title={venue.instant ? "C'est réservé !" : "Demande envoyée"}
        >
          <BookingTicket booking={created} />
        </FlowDone>
      )}
    </FlowPage>
  )
}
