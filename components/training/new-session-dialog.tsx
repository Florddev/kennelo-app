"use client"

import {
  Calendar03Icon,
  Location01Icon,
  SmsCodeIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { type ReactElement, useState } from "react"
import { longDate, TODAY } from "@/components/calendar"
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
import { durationLabel, SlotStep } from "@/components/flow/slot-step"
import { petByName } from "@/components/pets/data"
import {
  adjusted,
  rowFor,
  sizeOfWeight,
  useCatalog,
} from "@/components/services/data"
import { formatAmount, formatHour } from "@/components/today/widgets"
import {
  groups,
  type SessionKind,
  type WeekSession,
  weekSessions,
} from "@/components/training/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type StepId =
  | "kind"
  | "group"
  | "client"
  | "newClient"
  | "pet"
  | "service"
  | "slot"
  | "recap"

/** Wall clock, only read from event handlers. */
const clock = () => Date.now()

const kinds: {
  value: SessionKind
  title: string
  description: string
  icon: typeof UserIcon
}[] = [
  {
    description: "Un chien et son maître, sur le terrain",
    icon: UserIcon,
    title: "Séance individuelle",
    value: "Individuel",
  },
  {
    description: "Une séance pour l'un de vos groupes",
    icon: UserGroupIcon,
    title: "Cours collectif",
    value: "Collectif",
  },
  {
    description: "Vous vous déplacez chez le client",
    icon: Location01Icon,
    title: "À domicile",
    value: "À domicile",
  },
]

export function NewSessionDialog({
  trigger,
  onCreate,
  initial,
  defaultOpen,
  onOpenChange,
}: {
  trigger?: ReactElement
  /** Créneau déjà choisi, quand le parcours part de l'agenda. */
  initial?: { day: number; start: number }
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onCreate?: (session: WeekSession) => void
}) {
  const catalog = useCatalog()
  const steps = useSteps<StepId>("kind")
  const [open, setOpen] = useState(defaultOpen ?? false)
  const [kind, setKind] = useState<SessionKind>("Individuel")
  const [groupId, setGroupId] = useState<string>()
  const [clientName, setClientName] = useState<string>()
  const [draft, setDraft] = useState(emptyClientDraft)
  const [petName, setPetName] = useState<string>()
  const [serviceId, setServiceId] = useState<string>()
  const [day, setDay] = useState(initial?.day ?? TODAY)
  const [start, setStart] = useState<number | null>(initial?.start ?? null)
  const [sms, setSms] = useState(true)
  const [created, setCreated] = useState<WeekSession | null>(null)

  const collective = kind === "Collectif"
  const group = groups.find((g) => g.id === groupId)
  const client = clients.find((c) => c.name === clientName)
  const pet = client && petName ? petByName(petName, client.name) : undefined
  const animal = pet?.name ?? draft.pet
  const owner = client?.name ?? draft.name
  const phone = client?.phone ?? draft.phone
  const breed = pet?.breed ?? draft.breed

  // Prestations de l'éducation, au prix du catalogue
  const offers = (catalog.offers.training ?? []).flatMap((offer) => {
    const service = catalog.services.find((s) => s.id === offer.serviceId)
    if (!service?.active || !offer.active) return []
    const row = rowFor(service, {
      breed,
      size: sizeOfWeight(pet?.weight),
      species: pet?.species ?? draft.species,
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
  const length = collective ? 1 : (service?.duration ?? 60) / 60
  const place = collective
    ? (group?.place ?? "Terrain A")
    : kind === "À domicile"
      ? "Chez le client"
      : "Terrain B"
  const busy = (d: number, t: number) =>
    weekSessions.some(
      (s) => s.day === d && !s.cancelled && s.start < t + length && t < s.end
    )
  const when = start === null ? "" : `${longDate(day)} à ${formatHour(start)}`
  const who = collective ? (group?.name ?? "") : animal
  const ready = Boolean(
    start !== null && (collective ? group : service && animal && owner)
  )

  const reset = () => {
    setKind("Individuel")
    setGroupId(undefined)
    setClientName(undefined)
    setDraft(emptyClientDraft)
    setPetName(undefined)
    setServiceId(undefined)
    setDay(TODAY)
    setStart(null)
    setSms(true)
    setCreated(null)
    steps.reset("kind")
  }

  const selectClient = (c: Client) => {
    setClientName(c.name)
    setPetName(c.pets.length === 1 ? c.pets[0].name : undefined)
    if (c.pets.length === 1) steps.next("service")
    else steps.go("pet")
  }

  const create = () => {
    if (start === null) return
    const session: WeekSession = {
      day,
      end: start + length,
      id: `new-${clock()}`,
      kind,
      place,
      start,
      title: who,
      ...(collective
        ? {
            group: {
              capacity: group?.capacity ?? 8,
              enrolled: group?.members.length ?? 0,
            },
          }
        : { owner }),
    }
    onCreate?.(session)
    setCreated(session)
  }

  const order: StepId[] = collective
    ? ["kind", "group", "slot", "recap"]
    : ["kind", "client", "pet", "service", "slot", "recap"]
  const position = steps.step === "newClient" ? "pet" : steps.step
  const progress = Math.max(0, order.indexOf(position)) / (order.length - 1)

  return (
    <FlowDialog
      onOpenChange={(next) => {
        if (next) reset()
        setOpen(next)
        onOpenChange?.(next)
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
                Planifier une autre séance
              </Button>
            </>
          }
          description={`${created.title} · ${when} · ${created.place}`}
          title="Séance planifiée"
        >
          {sms && (
            <Badge size="lg" variant="info">
              <HugeiconsIcon icon={SmsCodeIcon} />
              {collective
                ? `${group?.members.length ?? 0} membres prévenus par SMS`
                : `Confirmation envoyée au ${phone}`}
            </Badge>
          )}
        </FlowDone>
      ) : steps.step === "kind" ? (
        <FlowScreen title="Quel type de séance ?">
          <div className="-mx-3 space-y-1">
            {kinds.map((k) => (
              <ChoiceRow
                description={k.description}
                key={k.value}
                media={
                  <FlowMedia className="bg-training text-training-foreground">
                    <HugeiconsIcon icon={k.icon} />
                  </FlowMedia>
                }
                onClick={() => {
                  setKind(k.value)
                  steps.go(k.value === "Collectif" ? "group" : "client")
                }}
                selected={kind === k.value}
                title={k.title}
              />
            ))}
          </div>
        </FlowScreen>
      ) : steps.step === "group" ? (
        <FlowScreen onBack={steps.back} title="Pour quel groupe ?">
          <div className="-mx-3 space-y-1">
            {groups.map((g) => (
              <ChoiceRow
                aside={
                  <Badge
                    variant={
                      g.members.length >= g.capacity ? "warning" : "secondary"
                    }
                  >
                    {g.members.length} / {g.capacity}
                  </Badge>
                }
                description={`${g.age} · ${g.place} · ${g.schedule}`}
                key={g.id}
                media={
                  <FlowMedia>
                    <HugeiconsIcon icon={UserGroupIcon} />
                  </FlowMedia>
                }
                onClick={() => {
                  setGroupId(g.id)
                  steps.next(start === null ? "slot" : "recap")
                }}
                selected={groupId === g.id}
                title={g.name}
              />
            ))}
          </div>
        </FlowScreen>
      ) : steps.step === "client" ? (
        <ClientStep
          onBack={steps.back}
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
          description="Pour lui confirmer la séance par SMS."
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
          title="Quel chien vient à la séance ?"
        />
      ) : steps.step === "service" || steps.step === "pet" ? (
        <FlowScreen
          onBack={steps.back}
          title={`Quelle séance pour ${animal || "le chien"} ?`}
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
                  <FlowMedia className="bg-training text-training-foreground">
                    {o.name.slice(0, 1)}
                  </FlowMedia>
                }
                onClick={() => {
                  setServiceId(o.id)
                  steps.next(start === null ? "slot" : "recap")
                }}
                selected={serviceId === o.id}
                title={o.name}
              />
            ))}
          </div>
        </FlowScreen>
      ) : steps.step === "slot" ? (
        <SlotStep
          busy={busy}
          closing={20}
          day={day}
          description={`${who} · ${place}`}
          length={length}
          onBack={steps.back}
          onDay={(d) => {
            setDay(d)
            setStart(null)
          }}
          onPick={(t) => {
            setStart(t)
            steps.next("recap")
          }}
          start={start}
        />
      ) : (
        <FlowScreen
          description="Touchez une ligne pour la modifier."
          footer={
            <Button disabled={!ready} onClick={create} size="lg">
              Planifier la séance
            </Button>
          }
          onBack={steps.back}
          title="Vérifiez la séance"
        >
          <div className="space-y-2">
            <SummaryRow
              label={
                collective
                  ? (group?.age ?? "")
                  : [breed, owner].filter(Boolean).join(" · ")
              }
              media={
                <FlowMedia>
                  {collective ? (
                    <HugeiconsIcon icon={UserGroupIcon} />
                  ) : (
                    animal.slice(0, 1)
                  )}
                </FlowMedia>
              }
              onEdit={() =>
                steps.edit(
                  collective ? "group" : client ? "client" : "newClient"
                )
              }
              value={who}
            />
            {!collective && service && (
              <SummaryRow
                label={durationLabel(service.duration)}
                media={
                  <FlowMedia className="bg-training text-training-foreground">
                    {service.name.slice(0, 1)}
                  </FlowMedia>
                }
                onEdit={() => steps.edit("service")}
                value={service.name}
              />
            )}
            <SummaryRow
              label={place}
              media={
                <FlowMedia>
                  <HugeiconsIcon icon={Calendar03Icon} />
                </FlowMedia>
              }
              onEdit={() => steps.edit("slot")}
              value={when || "À choisir"}
            />
          </div>
          {!collective && service && (
            <div className="flex justify-between rounded-2xl border p-5 text-lg font-semibold">
              <span>Prix de la séance</span>
              <span className="tabular-nums">
                {formatAmount(service.price)}
              </span>
            </div>
          )}
          <div className="space-y-3 rounded-2xl border p-4">
            <Label className="flex items-center justify-between gap-3 font-semibold">
              <span className="flex items-center gap-2">
                <HugeiconsIcon className="size-5" icon={SmsCodeIcon} />
                {collective
                  ? "Prévenir les membres par SMS"
                  : "Confirmer par SMS"}
              </span>
              <Switch checked={sms} onCheckedChange={setSms} />
            </Label>
            {sms && when && (
              <p className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
                {collective
                  ? `Bonjour, prochaine séance « ${who} » ${when.toLowerCase()} (${place}). À bientôt !`
                  : `Bonjour ${owner.split(" ")[0]}, séance d'éducation pour ${animal} ${when.toLowerCase()} (${place}). À bientôt !`}
              </p>
            )}
          </div>
        </FlowScreen>
      )}
    </FlowDialog>
  )
}
