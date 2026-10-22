"use client"

import {
  Mail01Icon,
  PawPrintIcon,
  SmsCodeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { type ReactElement, useState } from "react"
import {
  type Activity,
  ActivityMark,
  activityNames,
} from "@/components/activity-mark"
import type { Client } from "@/components/clients/data"
import { emptyClientDraft } from "@/components/flow/client-steps"
import {
  ChoiceCards,
  FlowDialog,
  FlowDone,
  FlowField,
  FlowMedia,
  FlowScreen,
  SummaryRow,
  useSteps,
} from "@/components/flow/flow"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type StepId = "who" | "pet" | "activities" | "recap"

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("")

export function NewClientDialog({
  trigger,
  onCreate,
}: {
  trigger: ReactElement
  onCreate?: (client: Client) => void
}) {
  const steps = useSteps<StepId>("who")
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(emptyClientDraft)
  const [email, setEmail] = useState("")
  const [city, setCity] = useState("")
  const [activities, setActivities] = useState<Activity[]>(["Pension"])
  const [welcome, setWelcome] = useState(true)
  const [created, setCreated] = useState<Client | null>(null)

  const reset = () => {
    setDraft(emptyClientDraft)
    setEmail("")
    setCity("")
    setActivities(["Pension"])
    setWelcome(true)
    setCreated(null)
    steps.reset("who")
  }

  const create = () => {
    const client: Client = {
      activities,
      balance: 0,
      city,
      email,
      initials: initialsOf(draft.name),
      invoices: [],
      name: draft.name.trim(),
      pets: [
        {
          activities,
          breed: draft.breed,
          name: draft.pet.trim(),
          species: draft.species,
        },
      ],
      phone: draft.phone,
      reservations: [],
      since: 2026,
      spent: 0,
      tags: ["Nouveau"],
    }
    onCreate?.(client)
    setCreated(client)
  }

  const order: StepId[] = ["who", "pet", "activities", "recap"]
  const input = (
    id: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    type = "text",
    hint?: string
  ) => (
    <FlowField hint={hint} id={id} label={label}>
      <Input
        id={id}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        size="lg"
        type={type}
        value={value}
      />
    </FlowField>
  )

  return (
    <FlowDialog
      onOpenChange={(next) => {
        if (next) reset()
        setOpen(next)
      }}
      open={open}
      progress={
        created ? undefined : order.indexOf(steps.step) / (order.length - 1)
      }
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
                Ajouter un autre client
              </Button>
            </>
          }
          description={`${created.name} et ${created.pets[0].name} sont enregistrés.${welcome ? ` Un SMS de bienvenue part au ${created.phone}.` : ""}`}
          title="Client ajouté"
        />
      ) : steps.step === "who" ? (
        <FlowScreen
          description="Le téléphone sert aux rappels et aux demandes d'acompte."
          footer={
            <Button
              disabled={!draft.name.trim() || !draft.phone.trim()}
              onClick={() => steps.next("pet")}
              size="lg"
            >
              Continuer
            </Button>
          }
          title="Qui est votre nouveau client ?"
        >
          {input(
            "client-name",
            "Nom et prénom",
            draft.name,
            (name) => setDraft({ ...draft, name }),
            "Prénom Nom"
          )}
          {input(
            "client-phone",
            "Téléphone",
            draft.phone,
            (phone) => setDraft({ ...draft, phone }),
            "06 12 34 56 78",
            "tel"
          )}
          {input(
            "client-email",
            "Adresse e-mail",
            email,
            setEmail,
            "nom@exemple.fr",
            "email",
            "Facultatif, pour les factures"
          )}
          {input("client-city", "Ville", city, setCity, "Ex. Annecy")}
        </FlowScreen>
      ) : steps.step === "pet" ? (
        <FlowScreen
          footer={
            <Button
              disabled={!draft.pet.trim()}
              onClick={() => steps.next("activities")}
              size="lg"
            >
              Continuer
            </Button>
          }
          onBack={steps.back}
          title={`Et son animal ?`}
        >
          <ChoiceCards
            onChange={(species) => setDraft({ ...draft, species })}
            options={[
              { label: "Chien", value: "Chien" },
              { label: "Chat", value: "Chat" },
            ]}
            value={draft.species}
          />
          {input(
            "pet-name",
            "Nom de l'animal",
            draft.pet,
            (pet) => setDraft({ ...draft, pet }),
            "Ex. Filou"
          )}
          {input(
            "pet-breed",
            "Race",
            draft.breed,
            (breed) => setDraft({ ...draft, breed }),
            draft.species === "Chat" ? "Ex. Européen" : "Ex. Beagle",
            "text",
            "Sert à calculer le prix du toilettage"
          )}
        </FlowScreen>
      ) : steps.step === "activities" ? (
        <FlowScreen
          description="Vous pourrez en ajouter d'autres plus tard."
          footer={
            <Button
              disabled={activities.length === 0}
              onClick={() => steps.next("recap")}
              size="lg"
            >
              Continuer
            </Button>
          }
          onBack={steps.back}
          title={`Pour quoi vient ${draft.pet || "l'animal"} ?`}
        >
          <div className="space-y-2">
            {activityNames.map((activity) => (
              <Label
                className="flex items-center gap-4 rounded-2xl border p-4 font-normal has-data-checked:border-control has-data-checked:bg-accent"
                key={activity}
              >
                <ActivityMark activity={activity} className="size-10 text-sm" />
                <span className="flex-1 font-semibold">{activity}</span>
                <Checkbox
                  checked={activities.includes(activity)}
                  onCheckedChange={(checked) =>
                    setActivities((list) =>
                      checked
                        ? [...list, activity]
                        : list.filter((a) => a !== activity)
                    )
                  }
                />
              </Label>
            ))}
          </div>
        </FlowScreen>
      ) : (
        <FlowScreen
          description="Touchez une ligne pour la modifier."
          footer={
            <Button onClick={create} size="lg">
              Ajouter le client
            </Button>
          }
          onBack={steps.back}
          title="Tout est correct ?"
        >
          <div className="space-y-2">
            <SummaryRow
              label={[draft.phone, city].filter(Boolean).join(" · ")}
              media={<FlowMedia>{initialsOf(draft.name)}</FlowMedia>}
              onEdit={() => steps.edit("who")}
              value={draft.name}
            />
            {email && (
              <SummaryRow
                label="E-mail"
                media={
                  <FlowMedia>
                    <HugeiconsIcon icon={Mail01Icon} />
                  </FlowMedia>
                }
                onEdit={() => steps.edit("who")}
                value={email}
              />
            )}
            <SummaryRow
              label={[draft.species, draft.breed].filter(Boolean).join(" · ")}
              media={
                <FlowMedia>
                  <HugeiconsIcon icon={PawPrintIcon} />
                </FlowMedia>
              }
              onEdit={() => steps.edit("pet")}
              value={draft.pet}
            />
            <SummaryRow
              label="Activités"
              media={
                <FlowMedia>
                  <ActivityMark
                    activity={activities[0]}
                    className="size-6 text-[0.6875rem]"
                  />
                </FlowMedia>
              }
              onEdit={() => steps.edit("activities")}
              value={activities.join(", ")}
            />
          </div>
          <div className="space-y-3 rounded-2xl border p-4">
            <Label className="flex items-center justify-between gap-3 font-semibold">
              <span className="flex items-center gap-2">
                <HugeiconsIcon className="size-5" icon={SmsCodeIcon} />
                Envoyer un SMS de bienvenue
              </span>
              <Switch checked={welcome} onCheckedChange={setWelcome} />
            </Label>
            {welcome && (
              <p className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
                Bonjour {draft.name.split(" ")[0]}, bienvenue aux Coteaux !
                Retrouvez les séjours et rendez-vous de {draft.pet} sur
                kennelo.fr/c/4XQ9.
              </p>
            )}
          </div>
        </FlowScreen>
      )}
    </FlowDialog>
  )
}
