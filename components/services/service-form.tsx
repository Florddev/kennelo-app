"use client"

import { Cancel01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { type ReactElement, useState } from "react"
import {
  type CatalogActivity,
  coats,
  type GridRow,
  newId,
  type Service,
  saveService,
  sellersOf,
  sizes,
  speciesList,
  useCatalog,
} from "@/components/services/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function ActivityTag({
  activity,
  className,
}: {
  activity: CatalogActivity
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground",
        className
      )}
    >
      <span className={cn("size-2 rounded-full", activity.color)} />
      {activity.name}
    </span>
  )
}

export function ActivityDot({
  activity,
  className,
}: {
  activity: CatalogActivity
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
        activity.color,
        className
      )}
    >
      {activity.name.charAt(0)}
    </span>
  )
}

const ALL = "*"

function MiniSelect({
  label,
  value,
  items,
  onChange,
  className,
}: {
  label: string
  value: string
  items: { label: string; value: string }[]
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <Select
      items={items}
      onValueChange={(v) => onChange(String(v))}
      value={value}
    >
      <SelectTrigger aria-label={label} className={className} size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectPopup>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}

const list = (all: string, values: readonly string[]) => [
  { label: all, value: ALL },
  ...values.map((v) => ({ label: v, value: v })),
]

export function GridEditor({
  rows,
  detailed,
  scheduled,
  onChange,
}: {
  rows: GridRow[]
  detailed: boolean
  scheduled: boolean
  onChange: (rows: GridRow[]) => void
}) {
  const set = (i: number, patch: Partial<GridRow>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div
          className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 p-2"
          key={i}
        >
          <MiniSelect
            className="w-24"
            items={speciesList.map((s) => ({ label: s, value: s }))}
            label="Espèce"
            onChange={(v) => set(i, { species: v as GridRow["species"] })}
            value={row.species}
          />
          {detailed && row.species === "Chien" && (
            <>
              <MiniSelect
                className="w-32"
                items={list("Toutes tailles", sizes)}
                label="Taille"
                onChange={(v) =>
                  set(i, {
                    size: v === ALL ? undefined : (v as GridRow["size"]),
                  })
                }
                value={row.size ?? ALL}
              />
              <MiniSelect
                className="w-28"
                items={list("Tous poils", coats)}
                label="Poil"
                onChange={(v) =>
                  set(i, {
                    coat: v === ALL ? undefined : (v as GridRow["coat"]),
                  })
                }
                value={row.coat ?? ALL}
              />
              <Input
                aria-label="Race"
                className="w-28"
                onChange={(e) => set(i, { breed: e.target.value || undefined })}
                placeholder="Race"
                size="sm"
                value={row.breed ?? ""}
              />
            </>
          )}
          <div className="ms-auto flex items-center gap-2">
            {scheduled && (
              <InputGroup className="w-24">
                <InputGroupInput
                  aria-label="Durée"
                  className="tabular-nums"
                  onChange={(e) => set(i, { duration: Number(e.target.value) })}
                  size="sm"
                  type="number"
                  value={row.duration}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>min</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            )}
            <InputGroup className="w-24">
              <InputGroupInput
                aria-label="Prix"
                className="tabular-nums"
                onChange={(e) => set(i, { price: Number(e.target.value) })}
                size="sm"
                type="number"
                value={row.price}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>€</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <Button
              aria-label="Retirer la ligne"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              size="icon-xs"
              variant="ghost"
            >
              <HugeiconsIcon icon={Cancel01Icon} />
            </Button>
          </div>
        </div>
      ))}
      <Button
        onClick={() =>
          onChange([
            ...rows,
            { duration: 30, price: rows.at(-1)?.price ?? 20, species: "Chien" },
          ])
        }
        size="xs"
        variant="ghost"
      >
        <HugeiconsIcon icon={PlusSignIcon} />
        Ajouter une ligne
      </Button>
    </div>
  )
}

/** Création ou modification d'une prestation, rattachée à son activité principale. */
export function ServiceForm({
  initial,
  owner,
  detailed: forced,
  onSave,
  onCancel,
  submitLabel = "Enregistrer",
}: {
  initial?: Service
  owner?: string
  detailed?: boolean
  onSave: (service: Service) => void
  onCancel: () => void
  submitLabel?: string
}) {
  const catalog = useCatalog()
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [scheduled, setScheduled] = useState(initial?.scheduled ?? true)
  const [detailed, setDetailed] = useState(initial?.detailed ?? forced ?? false)
  const [bundle, setBundle] = useState<string[] | undefined>(initial?.bundle)
  const [grid, setGrid] = useState<GridRow[]>(
    initial?.grid ?? [{ duration: 30, price: 20, species: "Chien" }]
  )
  const borrowers = initial
    ? sellersOf(catalog, initial.id).filter((a) => a.id !== initial.owner)
    : []
  const valid = name.trim() !== "" && grid.length > 0

  const submit = () => {
    const service: Service = {
      active: initial?.active ?? true,
      bundle: bundle?.length ? bundle : undefined,
      description: description.trim(),
      detailed,
      grid: detailed
        ? grid
        : grid.map(({ species, price, duration }) => ({
            duration,
            price,
            species,
          })),
      id: initial?.id ?? newId(name),
      owner: initial?.owner ?? owner ?? "",
      name: name.trim(),
      scheduled,
    }
    saveService(service)
    onSave(service)
  }

  return (
    <>
      <DialogPanel className="space-y-5">
        {borrowers.length > 0 && (
          <p className="rounded-xl bg-secondary px-3 py-2 text-sm">
            Reprise par {borrowers.map((a) => a.name).join(", ")} : la grille
            s&apos;applique aussi chez elles, avec leur propre ajustement.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="service-name">Nom</Label>
            <Input
              autoFocus
              id="service-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Bain, promenade, séance…"
              value={name}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              className="min-h-9"
              id="service-description"
              onChange={(e) => setDescription(e.target.value)}
              rows={1}
              value={description}
            />
          </div>
        </div>
        <div className="divide-y rounded-xl border">
          <Label className="flex items-center gap-3 px-3 py-2.5 font-normal">
            <span className="flex-1">
              <span className="block text-sm font-medium">
                Se place dans l&apos;agenda
              </span>
              <span className="text-xs text-muted-foreground">
                A une durée et occupe un membre de l&apos;équipe
              </span>
            </span>
            <Switch checked={scheduled} onCheckedChange={setScheduled} />
          </Label>
          {forced === undefined && (
            <Label className="flex items-center gap-3 px-3 py-2.5 font-normal">
              <span className="flex-1">
                <span className="block text-sm font-medium">
                  Prix selon taille, poil et race
                </span>
                <span className="text-xs text-muted-foreground">
                  Réservé au toilettage. Sinon, un prix par espèce.
                </span>
              </span>
              <Switch checked={detailed} onCheckedChange={setDetailed} />
            </Label>
          )}
          <Label className="flex items-center gap-3 px-3 py-2.5 font-normal">
            <span className="flex-1">
              <span className="block text-sm font-medium">Forfait</span>
              <span className="text-xs text-muted-foreground">
                Regroupe plusieurs prestations, avec son propre prix
              </span>
            </span>
            <Switch
              checked={bundle !== undefined}
              onCheckedChange={(on) => setBundle(on ? [] : undefined)}
            />
          </Label>
          {bundle !== undefined && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2.5">
              {catalog.services
                .filter((s) => s.id !== initial?.id && !s.bundle)
                .map((s) => {
                  const on = bundle.includes(s.id)
                  return (
                    <Button
                      aria-pressed={on}
                      key={s.id}
                      onClick={() =>
                        setBundle(
                          on
                            ? bundle.filter((id) => id !== s.id)
                            : [...bundle, s.id]
                        )
                      }
                      size="xs"
                      variant={on ? "secondary" : "outline"}
                    >
                      {s.name}
                    </Button>
                  )
                })}
              <p className="w-full pt-1 text-xs text-muted-foreground">
                Composition indicative, affichée au client.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">Grille de prix par animal</p>
            <p className="text-xs text-muted-foreground">
              La ligne la plus précise l&apos;emporte. Sans ligne pour un
              animal, la prestation ne lui est pas proposée.
            </p>
          </div>
          <GridEditor
            detailed={detailed}
            onChange={setGrid}
            rows={grid}
            scheduled={scheduled}
          />
        </div>
      </DialogPanel>
      <DialogFooter>
        <Button onClick={onCancel} variant="ghost">
          Annuler
        </Button>
        <Button disabled={!valid} onClick={submit}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  )
}

export function ServiceDialog({
  trigger,
  service,
  owner,
  detailed,
  onSaved,
}: {
  trigger: ReactElement
  service?: Service
  owner?: string
  detailed?: boolean
  onSaved?: (service: Service) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={trigger} />
      <DialogPopup className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {service ? service.name : "Nouvelle prestation"}
            {service?.bundle && <Badge variant="outline">Forfait</Badge>}
          </DialogTitle>
          <DialogDescription>
            Durée, forfait et grille de prix par animal.
          </DialogDescription>
        </DialogHeader>
        <ServiceForm
          detailed={detailed}
          initial={service}
          key={String(open)}
          owner={owner}
          onCancel={() => setOpen(false)}
          onSave={(saved) => {
            onSaved?.(saved)
            setOpen(false)
          }}
          submitLabel={service ? "Enregistrer" : "Créer la prestation"}
        />
      </DialogPopup>
    </Dialog>
  )
}
