"use client"

import {
  Alert02Icon,
  Camera01Icon,
  CatIcon,
  PawPrintIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import {
  ChoiceRow,
  FlowDone,
  FlowField,
  FlowMedia,
  FlowPage,
  FlowScreen,
  SummaryRow,
  useSteps,
} from "@/components/flow/flow"
import { formatDate } from "@/components/pets/data"
import {
  ageOf,
  type Compat,
  compatMeta,
  type MyPet,
  petAlerts,
  petTones,
  savePet,
  useSite,
  type VaxStatus,
  vaxStatus,
} from "@/components/site/data"
import { PetAvatar, Photo, PhotoButton } from "@/components/site/site-ui"
import {
  type Coat,
  newId,
  sizeOfWeight,
  todayIso,
} from "@/components/services/data"
import {
  notify,
  options,
  SettingsGroups,
  SettingsPage,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const vaxMeta: Record<
  VaxStatus,
  { label: string; variant: "success" | "warning" | "error" }
> = {
  expired: { label: "Expiré", variant: "error" },
  soon: { label: "Bientôt", variant: "warning" },
  valid: { label: "À jour", variant: "success" },
}

const speciesIcon = (species: MyPet["species"]) =>
  species === "Chat" ? CatIcon : PawPrintIcon

/* ——— Liste ——— */

export function PetsView() {
  const { pets } = useSite()
  return (
    <SettingsPage
      action={
        <Button render={<Link href="/me/pets/new" />}>
          <HugeiconsIcon icon={PlusSignIcon} />
          Ajouter
        </Button>
      }
      description="Leur fiche est envoyée à chaque réservation : plus besoin de tout réexpliquer."
      title="Mes animaux"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {pets.map((pet) => {
          const alerts = petAlerts(pet)
          return (
            <Link
              className={cn(
                "relative flex flex-col overflow-hidden rounded-3xl p-3 transition-transform hover:scale-[0.98]",
                pet.tone
              )}
              href={`/me/pets/${pet.id}`}
              key={pet.id}
            >
              {pet.photo ? (
                <Photo
                  alt={pet.name}
                  className="aspect-4/3 rounded-2xl"
                  sizes="(min-width: 640px) 320px, 100vw"
                  src={pet.photo}
                />
              ) : (
                <span className="flex aspect-4/3 items-center justify-center rounded-2xl bg-white/40">
                  <HugeiconsIcon
                    className="size-20 opacity-40"
                    icon={speciesIcon(pet.species)}
                  />
                </span>
              )}
              {alerts.length > 0 && (
                <span className="absolute top-6 left-6 flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-sm font-semibold text-foreground">
                  <HugeiconsIcon className="size-4" icon={Alert02Icon} />
                  {alerts.length} vaccin{alerts.length > 1 && "s"} à renouveler
                </span>
              )}
              <div className="px-3 pt-4 pb-2">
                <p className="truncate font-display text-5xl">{pet.name}</p>
                <p className="mt-1 font-semibold opacity-80">
                  {pet.breed} · {ageOf(pet.birth)}
                </p>
              </div>
            </Link>
          )
        })}
        <Link
          className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          href="/me/pets/new"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <HugeiconsIcon className="size-6" icon={PlusSignIcon} />
          </span>
          Ajouter un animal
        </Link>
      </div>
    </SettingsPage>
  )
}

/* ——— Modification de la fiche ——— */

export function PetEdit({ id }: { id: string }) {
  const site = useSite()
  const pet = site.pets.find((p) => p.id === id)
  if (!pet)
    return (
      <SettingsPage
        back={{ href: "/me/pets", label: "Mes animaux" }}
        title="Animal introuvable"
      >
        <p className="text-muted-foreground">Cette fiche n&apos;existe plus.</p>
      </SettingsPage>
    )
  const dog = pet.species === "Chien"
  const compat = options("Oui", "Avec précaution", "Non")
  const compatLabel = (c: Compat) => compatMeta[c].label

  return (
    <SettingsPage
      back={{ href: `/me/pets/${pet.id}`, label: `Profil de ${pet.name}` }}
      description="Ces informations sont transmises à l'établissement à chaque réservation."
      title="Modifier la fiche"
    >
      <SettingsSection title="Photo de profil">
        <SettingsRow
          description="Elle aide les établissements à reconnaître votre animal"
          media={<PetAvatar className="size-16" pet={pet} />}
          title={pet.photo ? "Votre photo" : "Pas encore de photo"}
        >
          <PhotoButton
            onPick={(url) => {
              savePet({ ...pet, photo: url })
              notify("Photo mise à jour")
            }}
            variant="secondary"
          >
            {pet.photo ? "Changer" : "Ajouter"}
          </PhotoButton>
        </SettingsRow>
      </SettingsSection>
      <SettingsSection
        action={
          <Button onClick={() => notify("Vaccin ajouté")} variant="secondary">
            <HugeiconsIcon icon={PlusSignIcon} />
            Ajouter
          </Button>
        }
        description="Gardez-les à jour pour réserver en pension"
        title="Vaccins"
      >
        {pet.vaccines.map((v) => {
          const meta = vaxMeta[vaxStatus(v.expires)]
          return (
            <div
              className="flex min-h-16 items-center gap-4 px-5 py-4"
              key={v.name}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{v.name}</p>
                <p className="text-sm text-muted-foreground">
                  Valable jusqu&apos;au {formatDate(v.expires)}
                </p>
              </div>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>
          )
        })}
      </SettingsSection>

      <SettingsGroups
        groups={[
          {
            settings: [
              { defaultValue: pet.name, title: "Nom", type: "input" },
              { defaultValue: pet.breed, title: "Race", type: "input" },
              {
                defaultValue: pet.sex,
                items: options("Mâle", "Femelle"),
                title: "Sexe",
                type: "select",
              },
              {
                defaultValue: formatDate(pet.birth),
                title: "Date de naissance",
                type: "input",
              },
              {
                defaultValue: pet.weight,
                title: "Poids",
                type: "number",
                unit: "kg",
              },
              {
                defaultChecked: pet.neutered,
                title: pet.sex === "Mâle" ? "Stérilisé" : "Stérilisée",
                type: "switch",
              },
              { defaultValue: pet.chip, title: "N° de puce", type: "input" },
            ],
            title: "Identité",
          },
          {
            description: "Pour calculer le bon prix",
            settings: [
              ...(dog
                ? [
                    {
                      defaultValue: pet.size ?? "Moyen",
                      items: options("Petit", "Moyen", "Grand"),
                      title: "Taille",
                      type: "select" as const,
                    },
                  ]
                : []),
              {
                defaultValue: pet.coat,
                items: options("Court", "Long"),
                title: "Poil",
                type: "select",
              },
            ],
            title: "Pour le toilettage",
          },
          {
            settings: [
              {
                defaultValue: pet.food,
                title: "Alimentation",
                type: "textarea",
              },
              {
                defaultValue: pet.health,
                title: "Santé et traitements",
                type: "textarea",
              },
              {
                defaultValue: pet.routine
                  .map((r) => `${r.time} ${r.text}`)
                  .join(" · "),
                title: "Repas et sorties",
                type: "textarea",
              },
              { defaultValue: pet.vet, title: "Vétérinaire", type: "input" },
            ],
            title: "Au quotidien",
          },
          {
            settings: [
              {
                defaultValue: pet.traits.join(", "),
                title: "En quelques mots",
                type: "input",
              },
              {
                defaultValue: pet.behaviour,
                title: "À savoir",
                type: "textarea",
              },
              {
                defaultValue: compatLabel(pet.compat.dogs),
                items: compat,
                title: "S'entend avec les chiens",
                type: "select",
              },
              {
                defaultValue: compatLabel(pet.compat.cats),
                items: compat,
                title: "S'entend avec les chats",
                type: "select",
              },
              {
                defaultValue: compatLabel(pet.compat.kids),
                items: compat,
                title: "S'entend avec les enfants",
                type: "select",
              },
            ],
            title: "Caractère",
          },
        ]}
      />

      <Button className="self-start" variant="destructive-outline">
        Supprimer la fiche de {pet.name}
      </Button>
    </SettingsPage>
  )
}

/* ——— Ajout ——— */

type Step =
  | "species"
  | "name"
  | "sex"
  | "breed"
  | "age"
  | "coat"
  | "photo"
  | "recap"
  | "done"

const breeds = {
  Chat: ["Européen", "Maine coon", "Siamois", "Persan", "Croisé"],
  Chien: [
    "Labrador",
    "Berger australien",
    "Golden retriever",
    "Jack Russell",
    "Croisé",
  ],
}

export function NewPetFlow({ next }: { next?: string }) {
  const site = useSite()
  const steps = useSteps<Step>("species")
  const [species, setSpecies] = useState<MyPet["species"]>("Chien")
  const [name, setName] = useState("")
  const [sex, setSex] = useState<MyPet["sex"]>("Mâle")
  const [breed, setBreed] = useState("")
  const [birth, setBirth] = useState("")
  const [weight, setWeight] = useState("")
  const [coat, setCoat] = useState<Coat>("Court")
  const [picture, setPicture] = useState<string>()
  const [created, setCreated] = useState<MyPet | null>(null)
  const order: Step[] = [
    "species",
    "name",
    "sex",
    "breed",
    "age",
    "coat",
    "photo",
    "recap",
  ]
  const progress =
    steps.step === "done"
      ? undefined
      : (order.indexOf(steps.step) + 1) / (order.length + 1)
  const label = name || (species === "Chat" ? "votre chat" : "votre chien")
  const female = sex === "Femelle"
  const kg = Number(weight.replace(",", ".")) || 0
  const tone = petTones[site.pets.length % petTones.length]

  const create = () => {
    const pet: MyPet = {
      behaviour: "",
      birth: birth || todayIso,
      breed: breed || "Croisé",
      chip: "",
      coat,
      food: "",
      health: "",
      id: `${newId(name)}-${site.pets.length}`,
      name: name.trim(),
      neutered: false,
      sex,
      size: species === "Chien" ? sizeOfWeight(kg) : undefined,
      species,
      tone,
      vaccines: [],
      vet: "",
      weight: kg,
      photo: picture,
      gallery: [],
      traits: [],
      compat: { cats: "careful", dogs: "careful", kids: "careful" },
      routine: [],
      weights: kg ? [{ date: todayIso, kg }] : [],
    }
    savePet(pet)
    setCreated(pet)
    steps.go("done")
  }

  return (
    <FlowPage closeHref={next ?? "/me/pets"} progress={progress}>
      {steps.step === "species" && (
        <FlowScreen title="Quel animal ajoutez-vous ?">
          <div className="-mx-3 space-y-1">
            {(["Chien", "Chat"] as const).map((s) => (
              <ChoiceRow
                key={s}
                media={
                  <FlowMedia
                    className={s === "Chat" ? petTones[1] : petTones[0]}
                  >
                    <HugeiconsIcon icon={speciesIcon(s)} />
                  </FlowMedia>
                }
                onClick={() => {
                  setSpecies(s)
                  setBreed("")
                  steps.next("name")
                }}
                selected={species === s}
                title={s}
              />
            ))}
          </div>
        </FlowScreen>
      )}

      {steps.step === "name" && (
        <FlowScreen
          footer={
            <Button
              disabled={!name.trim()}
              onClick={() => steps.next("sex")}
              size="lg"
            >
              Continuer
            </Button>
          }
          onBack={steps.back}
          title={`Comment s'appelle ${label} ?`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (name.trim()) steps.next("sex")
            }}
          >
            <FlowField id="pet-name" label="Son nom">
              <Input
                autoFocus
                id="pet-name"
                onChange={(e) => setName(e.target.value)}
                size="lg"
                value={name}
              />
            </FlowField>
          </form>
        </FlowScreen>
      )}

      {steps.step === "sex" && (
        <FlowScreen onBack={steps.back} title={`${name}, c'est…`}>
          <div className="-mx-3 space-y-1">
            {(["Mâle", "Femelle"] as const).map((s) => (
              <ChoiceRow
                key={s}
                onClick={() => {
                  setSex(s)
                  steps.next("breed")
                }}
                selected={sex === s}
                title={s === "Mâle" ? "Un mâle" : "Une femelle"}
              />
            ))}
          </div>
        </FlowScreen>
      )}

      {steps.step === "breed" && (
        <FlowScreen
          footer={
            <Button onClick={() => steps.next("age")} size="lg">
              {breed ? "Continuer" : "Je ne sais pas"}
            </Button>
          }
          onBack={steps.back}
          title={`Quelle est la race de ${name} ?`}
        >
          <FlowField id="pet-breed" label="Race">
            <Input
              id="pet-breed"
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Par exemple : Croisé"
              size="lg"
              value={breed}
            />
          </FlowField>
          <div className="flex flex-wrap gap-2">
            {breeds[species].map((b) => (
              <Button
                key={b}
                onClick={() => setBreed(b)}
                size="sm"
                variant={breed === b ? "default" : "secondary"}
              >
                {b}
              </Button>
            ))}
          </div>
        </FlowScreen>
      )}

      {steps.step === "age" && (
        <FlowScreen
          description="Le poids sert à choisir le bon tarif."
          footer={
            <Button
              disabled={!birth || !kg}
              onClick={() => steps.next("coat")}
              size="lg"
            >
              Continuer
            </Button>
          }
          onBack={steps.back}
          title={`Quel âge a ${name} ?`}
        >
          <FlowField id="pet-birth" label="Date de naissance">
            <Input
              id="pet-birth"
              max={todayIso}
              onChange={(e) => setBirth(e.target.value)}
              size="lg"
              type="date"
              value={birth}
            />
          </FlowField>
          <FlowField
            hint={
              species === "Chien" && kg
                ? `Taille ${sizeOfWeight(kg)?.toLowerCase()} pour les établissements`
                : undefined
            }
            id="pet-weight"
            label="Poids (kg)"
          >
            <Input
              id="pet-weight"
              inputMode="decimal"
              onChange={(e) => setWeight(e.target.value)}
              size="lg"
              value={weight}
            />
          </FlowField>
        </FlowScreen>
      )}

      {steps.step === "coat" && (
        <FlowScreen
          description="Pour estimer le prix du toilettage."
          onBack={steps.back}
          title={`Le poil de ${name} est plutôt…`}
        >
          <div className="-mx-3 space-y-1">
            {(["Court", "Long"] as const).map((c) => (
              <ChoiceRow
                key={c}
                onClick={() => {
                  setCoat(c)
                  steps.next("photo")
                }}
                selected={coat === c}
                title={c}
              />
            ))}
          </div>
        </FlowScreen>
      )}

      {steps.step === "photo" && (
        <FlowScreen
          description="Elle aide les établissements à le reconnaître. Vous pourrez la changer plus tard."
          footer={
            <>
              <PhotoButton
                onPick={setPicture}
                size="lg"
                variant={picture ? "secondary" : "default"}
              >
                <HugeiconsIcon icon={Camera01Icon} />
                {picture ? "Choisir une autre photo" : "Choisir une photo"}
              </PhotoButton>
              <Button
                onClick={() => steps.next("recap")}
                size="lg"
                variant={picture ? "default" : "ghost"}
              >
                {picture ? "Continuer" : "Plus tard"}
              </Button>
            </>
          }
          onBack={steps.back}
          title={`Une photo de ${name} ?`}
        >
          <div className="flex justify-center">
            {picture ? (
              <PetAvatar
                className="size-48 p-2"
                pet={{ name, photo: picture, tone }}
              />
            ) : (
              <span
                className={cn(
                  "flex size-48 items-center justify-center rounded-full",
                  tone
                )}
              >
                <HugeiconsIcon
                  className="size-20 opacity-60"
                  icon={speciesIcon(species)}
                />
              </span>
            )}
          </div>
        </FlowScreen>
      )}

      {steps.step === "recap" && (
        <FlowScreen
          footer={
            <Button onClick={create} size="lg">
              Ajouter {name}
            </Button>
          }
          onBack={steps.back}
          title="Tout est bon ?"
        >
          <div className="space-y-2">
            <SummaryRow
              label="Animal"
              media={
                <PetAvatar pet={{ name: name || "?", photo: picture, tone }} />
              }
              onEdit={() => steps.edit("name")}
              value={`${name} · ${species}`}
            />
            <SummaryRow
              label="Sexe"
              onEdit={() => steps.edit("sex")}
              value={sex}
            />
            <SummaryRow
              label="Race"
              onEdit={() => steps.edit("breed")}
              value={breed || "Croisé"}
            />
            <SummaryRow
              label="Naissance et poids"
              onEdit={() => steps.edit("age")}
              value={`${birth ? formatDate(birth) : ""} · ${kg} kg`}
            />
            <SummaryRow
              label="Poil"
              onEdit={() => steps.edit("coat")}
              value={coat}
            />
          </div>
        </FlowScreen>
      )}

      {steps.step === "done" && created && (
        <FlowDone
          actions={
            <>
              {next ? (
                <Button render={<Link href={next} />} size="lg">
                  Continuer la réservation
                </Button>
              ) : (
                <Button
                  render={<Link href={`/me/pets/${created.id}`} />}
                  size="lg"
                >
                  Compléter sa fiche
                </Button>
              )}
              <Button
                render={<Link href="/me/pets" />}
                size="lg"
                variant="secondary"
              >
                Voir mes animaux
              </Button>
            </>
          }
          description="Ajoutez ses vaccins pour pouvoir réserver en pension."
          title={`${created.name} est ${female ? "inscrite" : "inscrit"} !`}
        />
      )}
    </FlowPage>
  )
}
