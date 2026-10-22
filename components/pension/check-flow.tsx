"use client"

import {
  Alert02Icon,
  Camera01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useRef, useState } from "react"
import { shortDate } from "@/components/calendar"
import {
  type StayMovement,
  stayAmount,
  stayDeposit,
  stayLines,
  stays,
} from "@/components/pension/data"
import {
  formatDate,
  isoOf,
  petByName,
  petHref,
  type PetProfile,
  vaccineStatus,
} from "@/components/pets/data"
import { Bar, formatAmount } from "@/components/today/widgets"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const methods = ["Carte", "Espèces", "Chèque", "Virement"]

function Section({
  n,
  title,
  done,
  optional,
  children,
}: {
  n: number
  title: string
  done: boolean
  optional?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        "space-y-3 rounded-2xl border bg-card p-4 transition-colors",
        done && "border-primary/60 bg-primary/8"
      )}
    >
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
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">
            Facultatif
          </span>
        )}
      </h3>
      {children}
    </section>
  )
}

function CheckRow({
  checked,
  onChange,
  children,
  onRemove,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  onRemove?: () => void
}) {
  return (
    <li className="flex items-center gap-2">
      <Label className="flex flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 font-normal hover:bg-accent">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => onChange(Boolean(v))}
        />
        <span
          className={cn(
            "flex-1",
            checked && "text-muted-foreground line-through"
          )}
        >
          {children}
        </span>
      </Label>
      {onRemove && (
        <Button
          aria-label="Retirer"
          onClick={onRemove}
          size="icon-sm"
          variant="ghost"
        >
          <HugeiconsIcon icon={Cancel01Icon} />
        </Button>
      )}
    </li>
  )
}

function SignaturePad({
  onSigned,
  name,
}: {
  onSigned: (signed: boolean) => void
  name: string
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return [
      ((e.clientX - rect.left) / rect.width) * e.currentTarget.width,
      ((e.clientY - rect.top) / rect.height) * e.currentTarget.height,
    ] as const
  }
  return (
    <div className="space-y-1.5">
      <canvas
        className="h-28 w-full cursor-crosshair touch-none rounded-xl border-2 border-dashed bg-background"
        height={224}
        onPointerDown={(e) => {
          const ctx = e.currentTarget.getContext("2d")
          if (!ctx) return
          drawing.current = true
          ctx.lineWidth = 4
          ctx.lineCap = "round"
          ctx.strokeStyle = getComputedStyle(e.currentTarget).color
          ctx.beginPath()
          ctx.moveTo(...point(e))
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return
          const ctx = e.currentTarget.getContext("2d")
          ctx?.lineTo(...point(e))
          ctx?.stroke()
        }}
        onPointerUp={() => {
          drawing.current = false
          onSigned(true)
        }}
        ref={canvas}
        width={800}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Signature de {name} · contrat et autorisation de soins</span>
        <Button
          onClick={() => {
            const c = canvas.current
            c?.getContext("2d")?.clearRect(0, 0, c.width, c.height)
            onSigned(false)
          }}
          size="sm"
          variant="ghost"
        >
          Effacer
        </Button>
      </div>
    </div>
  )
}

function ArrivalSteps({
  pet,
  departure,
  footer,
}: {
  pet: PetProfile
  departure: number
  footer: (done: boolean[]) => ReactNode
}) {
  const [verified, setVerified] = useState(false)
  const [waiver, setWaiver] = useState(false)
  const [signed, setSigned] = useState(pet.contractSigned)
  const [items, setItems] = useState(
    pet.belongings.map((name) => ({ checked: false, name }))
  )
  const [newItem, setNewItem] = useState("")
  const instructions = [
    `Ration : ${pet.food.ration} (${pet.food.brand})`,
    ...pet.treatments.map((t) => `Traitement : ${t.dose}`),
    ...(pet.behavior.warning ? [pet.behavior.warning] : []),
    `Joignable pendant le séjour au ${pet.owner.phone}`,
  ]
  const [confirmed, setConfirmed] = useState<string[]>([])
  const until = isoOf(departure)
  const blocking = pet.vaccines.filter(
    (v) => v.required && vaccineStatus(v, until) === "expired"
  )

  const done = [
    verified && (blocking.length === 0 || waiver),
    signed,
    items.length > 0 && items.every((i) => i.checked),
    instructions.every((i) => confirmed.includes(i)),
  ]

  return (
    <>
      <DialogPanel className="space-y-3">
        <Section done={done[0]} n={1} title="Carnet de santé">
          <ul className="space-y-1.5 text-sm">
            {pet.vaccines.map((v) => {
              const status = vaccineStatus(v, until)
              return (
                <li
                  className="flex items-center justify-between gap-2"
                  key={v.name}
                >
                  <span>
                    {v.name}
                    {v.required && (
                      <span className="text-muted-foreground">
                        {" "}
                        · obligatoire
                      </span>
                    )}
                  </span>
                  <Badge
                    variant={
                      status === "expired"
                        ? "error"
                        : status === "soon"
                          ? "warning"
                          : "success"
                    }
                  >
                    {status === "expired" ? "Expiré le " : "Valable jusqu'au "}
                    {formatDate(v.expires)}
                  </Badge>
                </li>
              )
            })}
          </ul>
          {blocking.length > 0 && (
            <Alert variant="error">
              <HugeiconsIcon icon={Alert02Icon} />
              <AlertTitle>
                {blocking.map((v) => v.name).join(", ")} non valable pendant le
                séjour
              </AlertTitle>
              <AlertDescription>
                <p>
                  Sans rappel, {pet.name} ne peut pas être accueilli avec les
                  autres pensionnaires.
                </p>
                <Label className="mt-2 flex items-center gap-2 font-normal text-foreground">
                  <Checkbox
                    checked={waiver}
                    onCheckedChange={(v) => {
                      setWaiver(Boolean(v))
                    }}
                  />
                  Rappel fait, certificat du vétérinaire présenté
                </Label>
              </AlertDescription>
            </Alert>
          )}
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              checked={verified}
              onCheckedChange={(v) => {
                setVerified(Boolean(v))
              }}
            />
            Carnet présenté et vérifié
            <Button className="ms-auto" size="sm" variant="outline">
              <HugeiconsIcon icon={Camera01Icon} />
              Scanner
            </Button>
          </Label>
        </Section>

        <Section done={done[1]} n={2} title="Contrat de pension">
          {pet.contractSigned ? (
            <p className="text-sm text-muted-foreground">
              Signé en ligne lors de la réservation, avec l&apos;autorisation de
              soins d&apos;urgence.
            </p>
          ) : (
            <SignaturePad
              name={pet.owner.name}
              onSigned={(s) => {
                setSigned(s)
              }}
            />
          )}
        </Section>

        <Section done={done[2]} n={3} title="Affaires déposées">
          <ul className="space-y-0.5 text-sm">
            {items.map((item, i) => (
              <CheckRow
                checked={item.checked}
                key={item.name}
                onChange={(checked) => {
                  const next = items.map((x, j) =>
                    j === i ? { ...x, checked } : x
                  )
                  setItems(next)
                }}
                onRemove={() => {
                  const next = items.filter((_, j) => j !== i)
                  setItems(next)
                }}
              >
                {item.name}
              </CheckRow>
            ))}
          </ul>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!newItem.trim()) return
              const next = [...items, { checked: true, name: newItem.trim() }]
              setItems(next)
              setNewItem("")
            }}
          >
            <Input
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Autre objet (gamelle, manteau…)"
              size="sm"
              value={newItem}
            />
            <Button size="sm" type="submit" variant="outline">
              <HugeiconsIcon icon={PlusSignIcon} />
              Ajouter
            </Button>
          </form>
        </Section>

        <Section
          done={done[3]}
          n={4}
          title="Consignes confirmées avec le propriétaire"
        >
          <ul className="space-y-0.5 text-sm">
            {instructions.map((text) => (
              <CheckRow
                checked={confirmed.includes(text)}
                key={text}
                onChange={(checked) => {
                  const next = checked
                    ? [...confirmed, text]
                    : confirmed.filter((c) => c !== text)
                  setConfirmed(next)
                }}
              >
                {text}
              </CheckRow>
            ))}
          </ul>
        </Section>
      </DialogPanel>
      {footer(done)}
    </>
  )
}

function DepartureSteps({
  pet,
  movement,
  footer,
}: {
  pet: PetProfile
  movement: StayMovement
  footer: (done: boolean[]) => ReactNode
}) {
  const stay = stays.find(
    (s) => s.pet === movement.pet && s.owner === movement.owner
  )
  const [returned, setReturned] = useState<string[]>([])
  const [method, setMethod] = useState("Carte")
  const [collected, setCollected] = useState(false)
  const [sendReport, setSendReport] = useState(true)
  const [pickup, setPickup] = useState(movement.owner)
  const total = stay ? stayAmount(stay) : 0
  const paid = stay?.payment === "paid" ? total : stay ? stayDeposit(stay) : 0
  const balance = total - paid

  const done = [
    pet.belongings.every((b) => returned.includes(b)),
    true,
    collected || balance === 0,
    pickup.trim().length > 0,
  ]

  return (
    <>
      <DialogPanel className="space-y-3">
        <Section done={done[0]} n={1} title="Affaires rendues">
          <ul className="space-y-0.5 text-sm">
            {pet.belongings.map((item) => (
              <CheckRow
                checked={returned.includes(item)}
                key={item}
                onChange={(checked) => {
                  const next = checked
                    ? [...returned, item]
                    : returned.filter((r) => r !== item)
                  setReturned(next)
                }}
              >
                {item}
              </CheckRow>
            ))}
          </ul>
        </Section>

        <Section done={done[1]} n={2} optional title="Bilan du séjour">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="success">Appétit : très bon</Badge>
            <Badge variant="success">Humeur : joueur</Badge>
            <Badge variant="outline">
              Poids : {String(pet.weight).replace(".", ",")} kg (stable)
            </Badge>
          </div>
          <Textarea
            defaultValue={`${pet.name} a passé un super séjour : il a bien mangé, beaucoup joué au parc avec les copains et dormi comme un loir. À très vite !`}
          />
          <Label className="flex items-center justify-between gap-2 font-normal">
            Envoyer le bilan et les photos au propriétaire
            <Switch checked={sendReport} onCheckedChange={setSendReport} />
          </Label>
        </Section>

        <Section done={done[2]} n={3} title="Encaissement du solde">
          {stay && (
            <ul className="space-y-1 text-sm">
              {stayLines(stay).map((line) => (
                <li className="flex justify-between gap-2" key={line.label}>
                  <span className="text-muted-foreground">{line.label}</span>
                  <span className="tabular-nums">
                    {formatAmount(line.amount)}
                  </span>
                </li>
              ))}
              <li className="flex justify-between gap-2 text-muted-foreground">
                <span>
                  {stay.payment === "paid" ? "Déjà réglé" : "Acompte versé"}
                </span>
                <span className="tabular-nums">−{formatAmount(paid)}</span>
              </li>
              <li className="flex justify-between gap-2 border-t pt-2 text-base font-semibold">
                <span>Solde à régler</span>
                <span className="tabular-nums">{formatAmount(balance)}</span>
              </li>
            </ul>
          )}
          {collected ? (
            <Alert variant="success">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} />
              <AlertTitle>
                {formatAmount(balance)} encaissés · {method}
              </AlertTitle>
              <AlertDescription>
                Facture acquittée envoyée à {pet.owner.email}.
              </AlertDescription>
            </Alert>
          ) : balance > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {methods.map((m) => (
                <Button
                  className={cn(method === m && "border-primary bg-primary/30")}
                  key={m}
                  onClick={() => setMethod(m)}
                  size="sm"
                  variant="outline"
                >
                  {m}
                </Button>
              ))}
              <Button
                className="ms-auto"
                onClick={() => {
                  setCollected(true)
                }}
                size="sm"
              >
                Encaisser {formatAmount(balance)}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Rien à encaisser, tout est réglé.
            </p>
          )}
        </Section>

        <Section done={done[3]} n={4} title="Remise de l'animal">
          <div className="space-y-1.5">
            <Label htmlFor="pickup">Récupéré par</Label>
            <Input
              id="pickup"
              onChange={(e) => {
                setPickup(e.target.value)
              }}
              size="sm"
              value={pickup}
            />
            {pickup.trim() !== movement.owner && pickup.trim() && (
              <p className="text-xs text-warning-foreground">
                Personne différente du propriétaire : vérifier sa pièce
                d&apos;identité.
              </p>
            )}
          </div>
        </Section>
      </DialogPanel>
      {footer(done)}
    </>
  )
}

export function CheckFlow({
  movement,
  open,
  onOpenChange,
  onComplete,
}: {
  movement: StayMovement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (movement: StayMovement) => void
}) {
  const pet = movement ? petByName(movement.pet, movement.owner) : undefined
  const stay = movement
    ? stays.find((s) => s.pet === movement.pet && s.owner === movement.owner)
    : undefined
  const arrival = movement?.type === "arrival"

  const footer = (done: boolean[]) => {
    const required = arrival ? [0, 1, 2, 3] : [0, 2, 3]
    const count = required.filter((i) => done[i]).length
    const left = required.length - count
    return (
      <DialogFooter>
        <div className="flex flex-1 items-center gap-3 self-center">
          <Bar
            className="bg-primary"
            label="Étapes validées"
            value={(count / required.length) * 100}
          />
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {left === 0
              ? "Tout est en ordre"
              : `${left} étape${left > 1 ? "s" : ""} restante${left > 1 ? "s" : ""}`}
          </span>
        </div>
        <Button onClick={() => onOpenChange(false)} variant="ghost">
          Plus tard
        </Button>
        <Button
          disabled={left > 0 || !movement}
          onClick={() => {
            if (movement) onComplete(movement)
            onOpenChange(false)
          }}
        >
          {arrival ? "Valider l'arrivée" : "Valider le départ"}
        </Button>
      </DialogFooter>
    )
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-2xl">
        {movement && pet && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={arrival ? "info" : "warning"}>
                  {arrival ? "Arrivée" : "Départ"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {movement.time} · {movement.kennel}
                  {stay &&
                    ` · ${shortDate(stay.arrival)} → ${shortDate(stay.departure)}`}
                </span>
              </div>
              <DialogTitle>
                {arrival ? "Arrivée" : "Départ"} de {pet.name}
              </DialogTitle>
              <DialogDescription>
                {pet.breed} · {movement.owner} ·{" "}
                <Link
                  className="underline underline-offset-2"
                  href={petHref(pet.name, pet.owner.name)}
                >
                  Voir la fiche
                </Link>
              </DialogDescription>
            </DialogHeader>
            {arrival ? (
              <ArrivalSteps
                departure={stay?.departure ?? 0}
                footer={footer}
                key={movement.id}
                pet={pet}
              />
            ) : (
              <DepartureSteps
                footer={footer}
                key={movement.id}
                movement={movement}
                pet={pet}
              />
            )}
          </>
        )}
      </DialogPopup>
    </Dialog>
  )
}
