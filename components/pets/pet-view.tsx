"use client"

import {
  Alert02Icon,
  ArrowLeft01Icon,
  CalendarAdd01Icon,
  Call02Icon,
  Camera01Icon,
  Edit02Icon,
  Message01Icon,
  StethoscopeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import {
  type Activity,
  ActivityMark,
  activityNames,
} from "@/components/activity-mark"
import { TODAY } from "@/components/calendar"
import { clientHref } from "@/components/clients/data"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import {
  ageOf,
  type Compat,
  daysBetween,
  findPet,
  formatDate,
  type PetNote,
  TODAY_ISO,
  vaccineStatus,
} from "@/components/pets/data"
import { NoteDialog } from "@/components/pets/note-dialog"
import { petGalleryPhoto, petPhoto, petTone } from "@/components/pets/photos"
import {
  reservationDate,
  reservationStatus,
} from "@/components/reservations/reservations-view"
import { NoteExtras } from "@/components/site/pet-profile"
import { Photo, PhotoButton, PhotoStrip } from "@/components/site/site-ui"
import { formatAmount, PageBody } from "@/components/today/widgets"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toastManager } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const vaxStyle = {
  expired: { bar: "bg-destructive", label: "Expiré", variant: "error" },
  soon: { bar: "bg-warning", label: "Bientôt", variant: "warning" },
  valid: { bar: "bg-primary", label: "À jour", variant: "success" },
} as const

const compatMeta: Record<Compat, { label: string; tone: string }> = {
  careful: { label: "Avec précaution", tone: "bg-warning-soft" },
  no: { label: "Non", tone: "bg-destructive-soft" },
  yes: { label: "Oui", tone: "bg-success-soft" },
}

const chip =
  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors"

/** Une carte de la colonne de droite : titre au-dessus, lignes dedans. */
function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <div className="divide-y overflow-hidden rounded-3xl border bg-card">
        {children}
      </div>
    </section>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 px-5 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-semibold">{children}</span>
    </div>
  )
}

function Tags({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length)
    return <span className="font-normal text-muted-foreground">{empty}</span>
  return (
    <span className="flex flex-wrap justify-end gap-1">
      {items.map((item) => (
        <Badge key={item} variant="secondary">
          {item}
        </Badge>
      ))}
    </span>
  )
}

function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-3xl bg-muted p-5">
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-muted-foreground">{label}</p>
    </div>
  )
}

/** Un mot ou une note de l'équipe. */
function NoteCard({ note, owner }: { note: PetNote; owner: string }) {
  const initials = note.author
    .split(" ")
    .map((w) => w[0])
    .join("")
  return (
    <article className="space-y-4 rounded-3xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarFallback className="font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{note.author}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ActivityMark
              activity={note.activity}
              className="size-4 text-[0.5rem]"
            />
            {note.activity} · {formatDate(note.date)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-sm font-semibold",
            note.shared ? "bg-success-soft" : "bg-muted"
          )}
        >
          {note.shared ? `Envoyé à ${owner}` : "Note interne"}
        </span>
      </div>
      <p className="text-pretty">{note.text}</p>
      <NoteExtras
        author={note.author.split(" ")[0]}
        mood={note.mood}
        photos={note.photos}
        tags={note.tags}
        tip={note.tip}
        title={`${note.activity} · ${formatDate(note.date)}`}
      />
    </article>
  )
}

export function PetView({ slug }: { slug: string }) {
  const pet = findPet(slug)!
  const owner = pet.owner.name.split(" ")[0]
  const [notes, setNotes] = useState<PetNote[]>(pet.notes)
  const [filter, setFilter] = useState<Activity | "all">("all")
  const [showAll, setShowAll] = useState(false)
  const [writing, setWriting] = useState(false)
  const [added, setAdded] = useState<string[]>([])

  const current = pet.history.find(
    (r) =>
      r.activity === "Pension" && r.start <= TODAY && TODAY < (r.end ?? r.start)
  )
  const expired = pet.vaccines.filter(
    (v) => v.required && vaccineStatus(v) === "expired"
  )
  const stays = pet.history.filter(
    (r) => r.activity === "Pension" && r.status !== "cancelled"
  )
  const nights = stays.reduce((s, r) => s + ((r.end ?? r.start) - r.start), 0)
  const spent = pet.history.reduce(
    (s, r) => s + (r.status !== "cancelled" ? (r.amount ?? 0) : 0),
    0
  )
  const sorted = [...notes]
    .filter((n) => filter === "all" || n.activity === filter)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const shown = showAll ? sorted : sorted.slice(0, 3)
  const photos = [
    ...added,
    ...pet.photos.map((_, i) => petGalleryPhoto(slug, pet.species, i)),
  ]
  const alerts = [
    pet.behavior.warning,
    ...pet.allergies.map((a) => `Allergie : ${a}`),
    ...pet.treatments.map((t) => `Traitement : ${t.dose}`),
  ].filter(Boolean) as string[]
  const soft = "border-transparent bg-white/60 text-inherit hover:bg-white/80"

  return (
    <PageBody>
      <Link
        className="inline-flex items-center gap-2 font-semibold"
        href="/clients"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-secondary">
          <HugeiconsIcon className="size-5" icon={ArrowLeft01Icon} />
        </span>
        Clients et animaux
      </Link>

      <section
        className={cn(
          "grid overflow-hidden rounded-3xl lg:grid-cols-[minmax(0,1fr)_20rem]",
          petTone(slug)
        )}
      >
        <div className="min-w-0 space-y-6 p-6 md:p-10">
          <div className="flex flex-wrap gap-2">
            {current && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-wise-forest">
                En séjour · {current.title}
              </span>
            )}
            {expired.length > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-white">
                <HugeiconsIcon className="size-4" icon={Alert02Icon} />
                {expired.map((v) => v.name).join(", ")} expiré
              </span>
            ) : (
              <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-wise-forest">
                Vaccins à jour
              </span>
            )}
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <span className="block size-28 shrink-0 rounded-full bg-white/60 p-1.5 md:size-36">
              <Photo
                alt={pet.name}
                className="size-full rounded-full"
                sizes="144px"
                src={petPhoto(slug, pet.species)}
              />
            </span>
            <div className="min-w-0">
              <p className="font-semibold opacity-80">
                {pet.species} · {pet.sex}
                {pet.neutered &&
                  (pet.sex === "Mâle" ? " castré" : " stérilisée")}
              </p>
              <h1 className="truncate font-display text-6xl md:text-8xl">
                {pet.name}
              </h1>
              <p className="mt-2 text-lg font-semibold">
                {pet.breed} · {ageOf(pet.birth)} ·{" "}
                {String(pet.weight).replace(".", ",")} kg
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {pet.behavior.traits.map((t) => (
              <span
                className="flex h-8 items-center rounded-full bg-white/60 px-3 text-sm font-semibold"
                key={t}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setWriting(true)} size="lg">
              <HugeiconsIcon icon={Edit02Icon} />
              Laisser un mot
            </Button>
            <NewStayDialog
              defaultClient={pet.owner.name}
              defaultPet={pet.name}
              trigger={
                <Button className={soft} size="lg" variant="outline">
                  <HugeiconsIcon icon={CalendarAdd01Icon} />
                  Nouveau séjour
                </Button>
              }
            />
          </div>
        </div>

        <aside className="flex flex-col gap-5 bg-white/30 p-6 md:p-8">
          <p className="font-semibold opacity-80">Propriétaire</p>
          <Link
            className="flex items-center gap-3"
            href={clientHref(pet.owner.name)}
          >
            <Avatar className="size-14">
              <AvatarFallback className="bg-white/70 text-lg font-semibold">
                {pet.owner.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{pet.owner.name}</p>
              <p className="opacity-80">{pet.owner.phone}</p>
            </div>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Button
              className={soft}
              render={<a href={`tel:${pet.owner.phone.replace(/\s/g, "")}`} />}
              variant="outline"
            >
              <HugeiconsIcon icon={Call02Icon} />
              Appeler
            </Button>
            <Button
              className={soft}
              render={<Link href="/messages" />}
              variant="outline"
            >
              <HugeiconsIcon icon={Message01Icon} />
              Écrire
            </Button>
          </div>
          <Link
            className="mt-auto font-semibold underline underline-offset-4"
            href={clientHref(pet.owner.name)}
          >
            Voir la fiche de {owner}
          </Link>
        </aside>
      </section>

      {alerts.length > 0 && (
        <div className="flex gap-4 rounded-3xl bg-warning-soft p-5">
          <HugeiconsIcon className="size-6 shrink-0" icon={Alert02Icon} />
          <div>
            <p className="font-semibold">À savoir avant de s&apos;en occuper</p>
            <ul className="mt-1 list-inside list-disc">
              {alerts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label={stays.length > 1 ? "séjours" : "séjour"}
          value={stays.length}
        />
        <Stat label="nuits en pension" value={nights} />
        <Stat label="prestations" value={pet.history.length} />
        <Stat label="réservé ou réglé" value={formatAmount(spent)} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-10">
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-semibold">
                  Mots et notes
                </h2>
                <p className="text-muted-foreground">
                  Les mots envoyés à {owner} et les notes de l&apos;équipe
                </p>
              </div>
              <Button onClick={() => setWriting(true)} variant="secondary">
                <HugeiconsIcon icon={Edit02Icon} />
                Laisser un mot
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", ...activityNames] as const).map((a) => (
                <button
                  aria-pressed={filter === a}
                  className={cn(
                    chip,
                    filter === a
                      ? "bg-control text-control-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-neutral-hover"
                  )}
                  key={a}
                  onClick={() => setFilter(a)}
                  type="button"
                >
                  {a === "all" ? "Tout" : a}
                </button>
              ))}
            </div>
            {shown.length ? (
              shown.map((n, i) => (
                <NoteCard key={`${n.date}-${i}`} note={n} owner={owner} />
              ))
            ) : (
              <p className="rounded-3xl bg-muted p-6 text-muted-foreground">
                Aucun mot pour cette activité.
              </p>
            )}
            {sorted.length > 3 && (
              <Button onClick={() => setShowAll((s) => !s)} variant="ghost">
                {showAll
                  ? "Voir moins"
                  : `Voir les ${sorted.length - 3} autres`}
              </Button>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-heading text-2xl font-semibold">Photos</h2>
              <PhotoButton
                onPick={(url) => setAdded((list) => [url, ...list])}
                variant="secondary"
              >
                <HugeiconsIcon icon={Camera01Icon} />
                Ajouter
              </PhotoButton>
            </div>
            {photos.length ? (
              <PhotoStrip
                className="grid-cols-3 md:grid-cols-4"
                max={8}
                photos={photos}
                title={`Photos de ${pet.name}`}
              />
            ) : (
              <p className="rounded-3xl bg-muted p-6 text-muted-foreground">
                Pas encore de photo. Elles rassurent beaucoup {owner} pendant un
                séjour.
              </p>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Historique</h2>
            <div className="divide-y overflow-hidden rounded-3xl border bg-card">
              {pet.history.map((r) => (
                <div className="flex items-center gap-4 px-5 py-4" key={r.id}>
                  <ActivityMark
                    activity={r.activity}
                    className="size-10 text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {reservationDate(r)}
                      {r.detail && ` · ${r.detail}`}
                    </p>
                  </div>
                  <div className="shrink-0 text-end">
                    {r.amount !== undefined && (
                      <p className="font-semibold tabular-nums">
                        {formatAmount(r.amount)}
                      </p>
                    )}
                    <Badge variant={reservationStatus[r.status].variant}>
                      {reservationStatus[r.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Box title="Vaccins">
            {pet.vaccines.map((v) => {
              const status = vaccineStatus(v)
              const left = Math.max(
                0,
                Math.min(100, (daysBetween(TODAY_ISO, v.expires) / 365) * 100)
              )
              return (
                <div className="space-y-2 px-5 py-4" key={v.name}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">
                      {v.name}
                      {v.required && (
                        <span className="ms-2 text-sm font-normal text-muted-foreground">
                          obligatoire
                        </span>
                      )}
                    </p>
                    <Badge variant={vaxStyle[status].variant}>
                      {vaxStyle[status].label}
                    </Badge>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        vaxStyle[status].bar
                      )}
                      style={{ width: `${Math.max(left, 3)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Jusqu&apos;au {formatDate(v.expires)}
                  </p>
                </div>
              )
            })}
          </Box>

          <Box title="Santé">
            <Fact label="Allergies">
              <Tags empty="Aucune" items={pet.allergies} />
            </Fact>
            <Fact label="Pathologies">
              <Tags empty="Aucune" items={pet.conditions} />
            </Fact>
            <Fact label="Traitements">
              {pet.treatments.length
                ? pet.treatments.map((t) => t.dose).join(", ")
                : "Aucun"}
            </Fact>
            <div className="flex items-center gap-4 px-5 py-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon className="size-5" icon={StethoscopeIcon} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{pet.vet.name}</p>
                <p className="text-sm text-muted-foreground">
                  {pet.vet.city} · vu le {formatDate(pet.lastVetVisit)}
                </p>
              </div>
              <Button
                aria-label={`Appeler ${pet.vet.name}`}
                render={<a href={`tel:${pet.vet.phone.replace(/\s/g, "")}`} />}
                size="icon"
                variant="secondary"
              >
                <HugeiconsIcon icon={Call02Icon} />
              </Button>
            </div>
          </Box>

          <Box title="Alimentation">
            <div className="px-5 py-4">
              <p className="font-semibold">{pet.food.brand}</p>
              <p className="text-sm text-muted-foreground">
                {pet.food.ration} · fourni par{" "}
                {pet.food.providedByOwner ? "le propriétaire" : "la pension"}
              </p>
            </div>
            <ol className="space-y-2 px-5 py-4">
              {pet.food.meals.map((m) => (
                <li className="flex gap-3" key={m}>
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                  {m}
                </li>
              ))}
            </ol>
            <Fact label="Friandises">{pet.food.treats}</Fact>
          </Box>

          <Box title="Comportement">
            {(
              [
                ["Avec les chiens", pet.behavior.dogs],
                ["Avec les chats", pet.behavior.cats],
                ["Avec les humains", pet.behavior.people],
              ] as const
            ).map(([label, value]) => (
              <div
                className="flex min-h-12 items-center justify-between gap-4 px-5 py-3"
                key={label}
              >
                <span>{label}</span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-semibold",
                    compatMeta[value].tone
                  )}
                >
                  {compatMeta[value].label}
                </span>
              </div>
            ))}
            <Fact label="Peurs">
              <Tags empty="Aucune connue" items={pet.behavior.fears} />
            </Fact>
          </Box>

          <Box title="Identité">
            <Fact label="Robe">{pet.color}</Fact>
            <Fact label="Né le">{formatDate(pet.birth)}</Fact>
            <Fact label="Puce">
              <span className="font-mono text-sm">{pet.chip}</span>
            </Fact>
            <Fact label="Affaires">
              <Tags empty="Aucune" items={pet.belongings} />
            </Fact>
          </Box>

          <Box title="Documents">
            <Fact label="Contrat de pension">
              {pet.contractSigned ? (
                "Signé"
              ) : (
                <Badge variant="warning">À signer</Badge>
              )}
            </Fact>
            <Fact label="Carnet de santé">Scanné</Fact>
            <Fact label="Autorisation de soins">Signée</Fact>
          </Box>
        </div>
      </div>

      <NoteDialog
        onOpenChange={setWriting}
        onSave={(note) => {
          setNotes((list) => [note, ...list])
          setFilter("all")
          toastManager.add({
            title: note.shared ? `Mot envoyé à ${owner}` : "Note enregistrée",
            type: "success",
          })
        }}
        open={writing}
        pet={pet}
      />
    </PageBody>
  )
}
