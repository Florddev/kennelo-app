"use client"

import {
  Alert02Icon,
  ArrowLeft01Icon,
  Call02Icon,
  Camera01Icon,
  CatIcon,
  Edit02Icon,
  Idea01Icon,
  PawPrintIcon,
  QuoteDownIcon,
  Restaurant01Icon,
  StethoscopeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import type { ReactNode } from "react"
import { daysBetween, formatDate } from "@/components/pets/data"
import {
  ageOf,
  compatMeta,
  isUpcoming,
  type MyPet,
  nightsOf,
  type PetNote,
  petAlerts,
  savePet,
  useSite,
  venueOf,
  vaxStatus,
} from "@/components/site/data"
import {
  ActivityPill,
  BookingRow,
  bookingDates,
  RowsCard,
  SectionHead,
  PetAvatar,
  Photo,
  PhotoButton,
  PhotoStrip,
  SitePage,
} from "@/components/site/site-ui"
import { dayMonth, todayIso } from "@/components/services/data"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const speciesIcon = (pet: Pick<MyPet, "species">) =>
  pet.species === "Chat" ? CatIcon : PawPrintIcon

const moodWords = ["Moyen", "Bon", "Excellent"]

export const vaxStyle = {
  expired: { bar: "bg-destructive", label: "Expiré", variant: "error" },
  soon: { bar: "bg-warning", label: "Bientôt", variant: "warning" },
  valid: { bar: "bg-primary", label: "À jour", variant: "success" },
} as const

/** Sa carte d'identité, dessinée comme une carte Wise. */
export function IdCard({ pet }: { pet: MyPet }) {
  const [y, m, d] = pet.birth.split("-")
  return (
    <div className="mx-auto w-full max-w-80 -rotate-3 transition-transform hover:rotate-0 md:w-80">
      <div className="flex aspect-[1.586] flex-col justify-between rounded-3xl bg-wise-forest p-5 text-wise-green shadow-2xl">
        <div className="flex items-start justify-between">
          <span className="font-display text-2xl">Kennelo</span>
          <HugeiconsIcon className="size-7" icon={speciesIcon(pet)} />
        </div>
        {pet.photo ? (
          <Photo
            alt=""
            className="size-14 rounded-full ring-2 ring-wise-green"
            sizes="56px"
            src={pet.photo}
          />
        ) : (
          <span className="h-7 w-10 rounded-md bg-wise-green/80" />
        )}
        <div>
          <p className="truncate font-display text-4xl">{pet.name}</p>
          <div className="mt-3 flex justify-between gap-4 text-xs">
            <div className="min-w-0">
              <p className="opacity-70">N° de puce</p>
              <p className="truncate font-mono text-[0.8125rem]">
                {pet.chip || "À compléter"}
              </p>
            </div>
            <div className="shrink-0 text-end">
              <p className="opacity-70">
                {pet.sex === "Femelle" ? "Née" : "Né"} le
              </p>
              <p className="font-mono text-sm">
                {d}/{m}/{y}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileCard({
  title,
  edit,
  children,
}: {
  title: string
  edit?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-4xl">{title}</h2>
        {edit && (
          <Link
            className="text-sm font-semibold text-link underline underline-offset-4"
            href={edit}
          >
            Modifier
          </Link>
        )}
      </div>
      <RowsCard className="rounded-3xl">{children}</RowsCard>
    </section>
  )
}

/** Bulletin, étiquettes, conseil et photos d'un mot laissé par un pro. */
export function NoteExtras({
  author,
  title,
  mood: values,
  tags = [],
  tip,
  photos = [],
}: {
  author: string
  title: string
  mood?: { appetite: number; sleep: number; play: number }
  tags?: string[]
  tip?: string
  photos?: string[]
}) {
  const mood = values && [
    { label: "Appétit", value: values.appetite },
    { label: "Sommeil", value: values.sleep },
    { label: "Moral", value: values.play },
  ]
  const note = { author, photos, tags, tip }
  return (
    <>
      {mood && (
        <div className="grid grid-cols-3 gap-2">
          {mood.map((m) => (
            <div className="space-y-2 rounded-2xl bg-muted p-3" key={m.label}>
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="font-semibold">{moodWords[m.value - 1]}</p>
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <span
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      i <= m.value ? "bg-primary" : "bg-border"
                    )}
                    key={i}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((t) => (
            <span
              className="flex h-8 items-center rounded-full bg-muted px-3 text-sm font-semibold"
              key={t}
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {note.tip && (
        <div className="flex gap-3 rounded-2xl bg-success-soft p-4">
          <HugeiconsIcon className="size-6 shrink-0" icon={Idea01Icon} />
          <div>
            <p className="font-semibold">Le conseil de {note.author}</p>
            <p>{note.tip}</p>
          </div>
        </div>
      )}
      {!!note.photos.length && (
        <PhotoStrip photos={note.photos} title={title} />
      )}
    </>
  )
}

/** Le mot laissé par un établissement après une visite. */
export function ReportCard({
  note,
  hideHeader,
}: {
  note: PetNote
  hideHeader?: boolean
}) {
  const site = useSite()
  const booking = site.bookings.find((b) => b.id === note.booking)
  const venue = booking && venueOf(booking.venue)
  if (!booking || !venue) return null
  return (
    <article className="space-y-5 rounded-3xl border bg-card p-5 md:p-6">
      {!hideHeader && (
        <Link
          className="group flex items-center gap-3"
          href={`/me/bookings/${booking.id}`}
        >
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full font-display text-xl",
              venue.tone
            )}
          >
            {venue.name[0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold group-hover:underline">
              {venue.name}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {bookingDates(booking)}
            </p>
          </div>
          <ActivityPill activity={booking.activity} className="max-sm:hidden" />
        </Link>
      )}
      <div className="space-y-3">
        <HugeiconsIcon
          className="size-8 text-muted-foreground/50"
          icon={QuoteDownIcon}
        />
        <p className="text-lg text-pretty">{note.text}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{note.author}</span> ·{" "}
          {note.role} · {formatDate(note.date)}
        </p>
      </div>
      <NoteExtras
        author={note.author}
        mood={note.mood}
        photos={note.photos}
        tags={note.tags}
        tip={note.tip}
        title={`${venue.name} · ${formatDate(note.date)}`}
      />
    </article>
  )
}

function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-3xl bg-muted p-5">
      <p className="text-4xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-muted-foreground">{label}</p>
    </div>
  )
}

export function WeightChart({ pet }: { pet: MyPet }) {
  const list = pet.weights.length
    ? pet.weights
    : [{ date: todayIso, kg: pet.weight }]
  const kgs = list.map((w) => w.kg)
  const lo = Math.min(...kgs)
  const hi = Math.max(...kgs)
  const first = list[0]
  const delta = list[list.length - 1].kg - first.kg
  const kg = (n: number) =>
    `${String(Math.round(n * 10) / 10).replace(".", ",")} kg`
  return (
    <div className="space-y-5 p-5">
      <div>
        <p className="text-3xl font-semibold">{kg(pet.weight)}</p>
        <p className="text-sm text-muted-foreground">
          {list.length > 1
            ? `${delta >= 0 ? "+" : "−"}${kg(Math.abs(delta))} depuis ${dayMonth(first.date)}`
            : "Pesé par les établissements à chaque visite"}
        </p>
      </div>
      <div className="flex h-24 items-end gap-2">
        {list.map((w, i) => (
          <div
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            key={w.date}
          >
            <span
              className={cn(
                "w-full rounded-t-lg",
                i === list.length - 1 ? "bg-primary" : "bg-primary/35"
              )}
              style={{
                height: `${hi === lo ? 70 : 30 + ((w.kg - lo) / (hi - lo)) * 70}%`,
              }}
              title={`${kg(w.kg)} · ${dayMonth(w.date)}`}
            />
            <span className="text-xs text-muted-foreground">
              {dayMonth(w.date).split(" ")[1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PetProfile({ id }: { id: string }) {
  const site = useSite()
  const pet = site.pets.find((p) => p.id === id)
  if (!pet)
    return (
      <SitePage>
        <p className="text-muted-foreground">Cet animal n&apos;existe plus.</p>
        <Button render={<Link href="/me/pets" />}>Mes animaux</Button>
      </SitePage>
    )

  const edit = `/me/pets/${pet.id}/edit`
  const visits = site.bookings
    .filter((b) => b.pets.includes(pet.id) && b.status !== "cancelled")
    .sort((a, b) => b.start.localeCompare(a.start))
  const upcoming = visits.filter(isUpcoming).reverse()
  const past = visits.filter((b) => b.status === "done")
  const nights = past.reduce((n, b) => n + nightsOf(b), 0)
  const places = new Set(past.map((b) => b.venue)).size
  const notes = site.notes
    .filter((n) => n.pet === pet.id)
    .sort((a, b) => b.date.localeCompare(a.date))
  const alerts = petAlerts(pet)
  const [vetName, vetPhone] = pet.vet.split(" · ")
  const female = pet.sex === "Femelle"
  const photos = [...pet.gallery, ...notes.flatMap((n) => n.photos ?? [])]

  return (
    <>
      <section className={pet.tone}>
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-10 md:py-12">
          <div className="min-w-0 space-y-6">
            <Link
              className="inline-flex items-center gap-2 font-semibold"
              href="/me/pets"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-white/60">
                <HugeiconsIcon className="size-5" icon={ArrowLeft01Icon} />
              </span>
              Mes animaux
            </Link>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              {pet.photo ? (
                <PetAvatar
                  className="size-28 bg-white/60 p-1.5 md:size-40 md:p-2"
                  pet={pet}
                />
              ) : (
                <PhotoButton
                  className="size-28 shrink-0 flex-col gap-1 rounded-full border-2 border-dashed border-current bg-white/40 text-sm text-inherit hover:bg-white/60 md:size-40"
                  onPick={(url) => savePet({ ...pet, photo: url })}
                  variant="outline"
                >
                  <HugeiconsIcon className="size-7" icon={Camera01Icon} />
                  Ajouter une photo
                </PhotoButton>
              )}
              <div className="min-w-0">
                <p className="font-semibold opacity-80">
                  {pet.species} · {pet.sex}
                  {pet.neutered && (female ? " stérilisée" : " stérilisé")}
                </p>
                <h1 className="truncate font-display text-7xl md:text-9xl">
                  {pet.name}
                </h1>
                <p className="mt-3 text-lg font-semibold md:text-xl">
                  {pet.breed} · {ageOf(pet.birth)} · {pet.weight} kg
                </p>
              </div>
            </div>
            {pet.traits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pet.traits.map((t) => (
                  <span
                    className="flex h-8 items-center rounded-full bg-white/60 px-3 text-sm font-semibold"
                    key={t}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href="/search" />} size="lg">
                Réserver pour {pet.name}
              </Button>
              <Button
                className="border-transparent bg-white/60 text-inherit hover:bg-white/80"
                render={<Link href={edit} />}
                size="lg"
                variant="outline"
              >
                <HugeiconsIcon icon={Edit02Icon} />
                Modifier
              </Button>
            </div>
          </div>
          <IdCard pet={pet} />
        </div>
      </section>

      <SitePage>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label={past.filter((b) => b.end).length > 1 ? "séjours" : "séjour"}
            value={past.filter((b) => b.end).length}
          />
          <Stat label="nuits en pension" value={nights} />
          <Stat label="rendez-vous" value={past.filter((b) => !b.end).length} />
          <Stat
            label={places > 1 ? "établissements" : "établissement"}
            value={places}
          />
        </div>

        {alerts.map((v) => (
          <Alert
            key={v.name}
            variant={vaxStatus(v.expires) === "expired" ? "error" : "warning"}
          >
            <HugeiconsIcon icon={Alert02Icon} />
            <AlertTitle>
              Vaccin « {v.name} »{" "}
              {vaxStatus(v.expires) === "expired" ? "expiré" : "à renouveler"}
            </AlertTitle>
            <AlertDescription>
              Valable jusqu&apos;au {formatDate(v.expires)}. Les pensions le
              demandent à l&apos;arrivée.
            </AlertDescription>
          </Alert>
        ))}

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-12">
            {upcoming.length > 0 && (
              <section className="space-y-4">
                <SectionHead title="Bientôt" />
                <RowsCard className="rounded-3xl">
                  {upcoming.map((b) => (
                    <BookingRow booking={b} key={b.id} />
                  ))}
                </RowsCard>
              </section>
            )}

            <section className="space-y-4">
              <SectionHead
                action={
                  <PhotoButton
                    onPick={(url) =>
                      savePet({ ...pet, gallery: [url, ...pet.gallery] })
                    }
                    variant="secondary"
                  >
                    <HugeiconsIcon icon={Camera01Icon} />
                    Ajouter
                  </PhotoButton>
                }
                description="Les vôtres et celles envoyées par les établissements"
                title="Ses photos"
              />
              {photos.length ? (
                <PhotoStrip
                  className="grid-cols-3 md:grid-cols-4"
                  max={8}
                  photos={photos}
                  title={`Photos de ${pet.name}`}
                />
              ) : (
                <div className="rounded-3xl bg-muted p-6 text-muted-foreground">
                  Ajoutez ses plus belles photos : les établissements les
                  verront aussi.
                </div>
              )}
            </section>

            <section className="space-y-4">
              <SectionHead
                description="Ce que les établissements ont noté après chaque visite"
                title="Le mot des pros"
              />
              {notes.length ? (
                notes.map((n) => <ReportCard key={n.id} note={n} />)
              ) : (
                <div className="rounded-3xl bg-muted p-6 text-muted-foreground">
                  Après sa première visite, l&apos;établissement pourra laisser
                  un mot ici : comment {pet.name} a mangé, dormi, joué…
                </div>
              )}
            </section>

            {past.length > 0 && (
              <section className="space-y-4">
                <SectionHead title="Toutes ses visites" />
                <RowsCard className="rounded-3xl">
                  {past.map((b) => (
                    <BookingRow booking={b} key={b.id} />
                  ))}
                </RowsCard>
              </section>
            )}
          </div>

          <div className="space-y-10">
            <ProfileCard edit={edit} title="Santé">
              {pet.vaccines.map((v) => {
                const status = vaxStatus(v.expires)
                const left = Math.max(
                  0,
                  Math.min(100, (daysBetween(todayIso, v.expires) / 365) * 100)
                )
                return (
                  <div className="space-y-2 px-5 py-4" key={v.name}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{v.name}</p>
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
              {!pet.vaccines.length && (
                <p className="px-5 py-4 text-muted-foreground">
                  Aucun vaccin renseigné.
                </p>
              )}
              <div className="flex items-center gap-4 px-5 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <HugeiconsIcon className="size-5" icon={StethoscopeIcon} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">Traitement</p>
                  <p className="text-sm text-muted-foreground">
                    {pet.health || "Aucun"}
                  </p>
                </div>
              </div>
              {vetName && (
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{vetName}</p>
                    <p className="text-sm text-muted-foreground">
                      Vétérinaire{vetPhone && ` · ${vetPhone}`}
                    </p>
                  </div>
                  {vetPhone && (
                    <Button
                      aria-label={`Appeler ${vetName}`}
                      render={<a href={`tel:${vetPhone.replace(/\s/g, "")}`} />}
                      size="icon"
                      variant="secondary"
                    >
                      <HugeiconsIcon icon={Call02Icon} />
                    </Button>
                  )}
                </div>
              )}
            </ProfileCard>

            <ProfileCard edit={edit} title="Au quotidien">
              <div className="flex items-center gap-4 px-5 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <HugeiconsIcon className="size-5" icon={Restaurant01Icon} />
                </span>
                <p className="min-w-0">
                  {pet.food || "Alimentation à préciser"}
                </p>
              </div>
              {pet.routine.length > 0 && (
                <ol className="space-y-3 px-5 py-4">
                  {pet.routine.map((r) => (
                    <li className="flex gap-4" key={r.time}>
                      <span className="w-12 shrink-0 font-semibold tabular-nums">
                        {r.time}
                      </span>
                      <span className="text-muted-foreground">{r.text}</span>
                    </li>
                  ))}
                </ol>
              )}
            </ProfileCard>

            <ProfileCard edit={edit} title="Caractère">
              {pet.behaviour && <p className="px-5 py-4">{pet.behaviour}</p>}
              {(
                [
                  ["Avec les chiens", pet.compat.dogs],
                  ["Avec les chats", pet.compat.cats],
                  ["Avec les enfants", pet.compat.kids],
                ] as const
              ).map(([label, value]) => (
                <div
                  className="flex min-h-14 items-center justify-between gap-4 px-5 py-3"
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
            </ProfileCard>

            <ProfileCard edit={edit} title="Poids">
              <WeightChart pet={pet} />
            </ProfileCard>
          </div>
        </div>
      </SitePage>
    </>
  )
}
