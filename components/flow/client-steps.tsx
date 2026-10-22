"use client"

import { Search01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { type Client, clients } from "@/components/clients/data"
import {
  ChoiceCards,
  ChoiceRow,
  FlowField,
  FlowMedia,
  FlowScreen,
} from "@/components/flow/flow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export type Species = "Chien" | "Chat"

export type ClientDraft = {
  name: string
  phone: string
  pet: string
  species: Species
  breed: string
}

export const emptyClientDraft: ClientDraft = {
  breed: "",
  name: "",
  pet: "",
  phone: "",
  species: "Chien",
}

/** Brouillon de client prérempli avec ce qui a été tapé dans la recherche. */
export const draftFromQuery = (query: string): ClientDraft => {
  const digits = /^[\d\s+]+$/.test(query)
  return {
    ...emptyClientDraft,
    name: digits ? "" : query.trim(),
    phone: digits ? query.trim() : "",
  }
}

/** « À qui appartient l'animal ? » : recherche et clients récents. */
export function ClientStep({
  title = "À qui appartient l'animal ?",
  onBack,
  onSelect,
  onCreate,
}: {
  title?: string
  onBack?: () => void
  onSelect: (client: Client) => void
  onCreate: (query: string) => void
}) {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()
  const matches = q
    ? clients
        .filter((c) =>
          `${c.name} ${c.phone.replaceAll(" ", "")} ${c.phone} ${c.pets.map((p) => p.name).join(" ")}`
            .toLowerCase()
            .includes(q)
        )
        .slice(0, 5)
    : clients.slice(0, 5)
  return (
    <FlowScreen
      description="Cherchez par nom, téléphone ou nom de l'animal."
      onBack={onBack}
      title={title}
    >
      <InputGroup className="rounded-full">
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
            if (matches[0]) onSelect(matches[0])
            else if (q) onCreate(query)
          }}
          placeholder="Rechercher"
          size="lg"
          value={query}
        />
      </InputGroup>
      <div className="-mx-3 space-y-1">
        {matches.map((c) => (
          <ChoiceRow
            description={`${c.pets.map((p) => p.name).join(", ")} · ${c.phone}`}
            key={c.name}
            media={<FlowMedia>{c.initials}</FlowMedia>}
            onClick={() => onSelect(c)}
            title={c.name}
          />
        ))}
        {q && matches.length === 0 && (
          <p className="px-3 py-2 text-muted-foreground">
            Aucun client ne correspond.
          </p>
        )}
        <ChoiceRow
          description={
            q && matches.length === 0
              ? `Créer « ${query.trim()} »`
              : "Il vient pour la première fois"
          }
          media={
            <FlowMedia className="bg-primary text-primary-foreground">
              <HugeiconsIcon icon={UserAdd01Icon} />
            </FlowMedia>
          }
          onClick={() => onCreate(query)}
          title="Nouveau client"
        />
      </div>
    </FlowScreen>
  )
}

/** Le nouveau client et son animal, sur un seul écran. */
export function NewClientStep({
  draft,
  onChange,
  onBack,
  onContinue,
  description = "Pour le prévenir et lui envoyer l'acompte.",
}: {
  draft: ClientDraft
  onChange: (draft: ClientDraft) => void
  onBack?: () => void
  onContinue: () => void
  description?: string
}) {
  const field = (
    key: Exclude<keyof ClientDraft, "species">,
    label: string,
    placeholder: string,
    type = "text"
  ) => (
    <FlowField id={`new-${key}`} key={key} label={label}>
      <Input
        id={`new-${key}`}
        onChange={(e) => onChange({ ...draft, [key]: e.target.value })}
        placeholder={placeholder}
        size="lg"
        type={type}
        value={draft[key]}
      />
    </FlowField>
  )
  return (
    <FlowScreen
      description={description}
      footer={
        <Button
          disabled={!draft.name || !draft.phone || !draft.pet}
          onClick={onContinue}
          size="lg"
        >
          Continuer
        </Button>
      }
      onBack={onBack}
      title="Qui est le nouveau client ?"
    >
      {field("name", "Nom du client", "Prénom Nom")}
      {field("phone", "Téléphone", "06 12 34 56 78", "tel")}
      <div className="space-y-6 border-t pt-6">
        <FlowField label="Son animal">
          <ChoiceCards
            onChange={(species) => onChange({ ...draft, species })}
            options={[
              { label: "Chien", value: "Chien" },
              { label: "Chat", value: "Chat" },
            ]}
            value={draft.species}
          />
        </FlowField>
        {field("pet", "Nom de l'animal", "Ex. Filou")}
        {field("breed", "Race", "Ex. Beagle")}
      </div>
    </FlowScreen>
  )
}

/** Choix de l'animal quand le client en a plusieurs. */
export function PetStep({
  client,
  title,
  selected,
  onBack,
  onSelect,
}: {
  client: Client
  title: string
  selected?: string
  onBack?: () => void
  onSelect: (pet: string) => void
}) {
  return (
    <FlowScreen description={client.name} onBack={onBack} title={title}>
      <div className="-mx-3 space-y-1">
        {client.pets.map((p) => (
          <ChoiceRow
            description={[p.breed, p.species].filter(Boolean).join(" · ")}
            key={p.name}
            media={<FlowMedia>{p.name.slice(0, 1)}</FlowMedia>}
            onClick={() => onSelect(p.name)}
            selected={selected === p.name}
            title={p.name}
          />
        ))}
      </div>
    </FlowScreen>
  )
}
