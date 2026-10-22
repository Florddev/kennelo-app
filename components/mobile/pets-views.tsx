"use client"

import {
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BirthdayCakeIcon,
  Baby01Icon,
  Calendar03Icon,
  Call02Icon,
  Camera01Icon,
  CatIcon,
  CheckmarkBadge01Icon,
  Edit02Icon,
  ImageAdd01Icon,
  PawPrintIcon,
  PlusSignIcon,
  Restaurant01Icon,
  StethoscopeIcon,
  Tick02Icon,
  WeightScaleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import { activityMeta } from "@/components/activity-mark"
import {
  BookingItem,
  Carousel,
  NotePost,
  QuickAction,
  RoundButton,
  Row,
  Rows,
  Section,
  Segmented,
  TabHeader,
} from "@/components/mobile/mobile-ui"
import { daysBetween } from "@/components/pets/data"
import { countdown } from "@/components/site/booking-detail"
import {
  ageOf,
  compatMeta,
  isUpcoming,
  type MyBooking,
  type MyPet,
  petAlerts,
  savePet,
  useSite,
  vaxStatus,
  venueOf,
} from "@/components/site/data"
import { IdCard, vaxStyle, WeightChart } from "@/components/site/pet-profile"
import {
  activityIcons,
  bookingDates,
  Photo,
  PhotoButton,
  PhotoDialog,
} from "@/components/site/site-ui"
import { dayMonth, todayIso } from "@/components/services/data"
import { notify } from "@/components/settings/settings-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const kg = (n: number) => `${String(n).replace(".", ",")} kg`

const monthOf = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  })

const sortedByStart = (list: MyBooking[]) =>
  [...list].sort((a, b) => a.start.localeCompare(b.start))

/** Photo de l'animal, ou son initiale sur sa couleur. */
function PetPicture({
  pet,
  className,
  sizes = "160px",
}: {
  pet: MyPet
  className?: string
  sizes?: string
}) {
  return pet.photo ? (
    <Photo alt={pet.name} className={className} sizes={sizes} src={pet.photo} />
  ) : (
    <span
      className={cn(
        "flex items-center justify-center bg-white/40 font-display text-5xl",
        className
      )}
    >
      {pet.name[0]}
    </span>
  )
}

/** Une réservation à venir, en carte colorée. */
function SoonCard({
  booking,
  className,
}: {
  booking: MyBooking
  className?: string
}) {
  const site = useSite()
  const venue = venueOf(booking.venue)
  const pets = booking.pets.flatMap(
    (p) => site.pets.find((x) => x.id === p) ?? []
  )
  return (
    <Link
      className={cn(
        "flex flex-col justify-between gap-6 rounded-3xl p-5 transition-transform active:scale-[0.98]",
        activityMeta[booking.activity].tint,
        className
      )}
      href={`/mobile/bookings/${booking.id}`}
    >
      <div className="flex items-center justify-between">
        <HugeiconsIcon
          className="size-7"
          icon={activityIcons[booking.activity]}
        />
        <span className="flex -space-x-2">
          {pets.map((p) => (
            <PetPicture
              className="size-9 rounded-full border-2 border-white/80"
              key={p.id}
              pet={p}
              sizes="36px"
            />
          ))}
        </span>
      </div>
      <div>
        <p className="font-display text-4xl">{countdown(booking)}</p>
        <p className="mt-1 font-semibold">
          {booking.activity} chez {venue?.name}
        </p>
        <p className="text-sm opacity-80">{bookingDates(booking)}</p>
      </div>
    </Link>
  )
}

/** Un vaccin à refaire, en carte jaune. */
function VaxCard({
  pet,
  name,
  expires,
  className,
}: {
  pet: MyPet
  name: string
  expires: string
  className?: string
}) {
  const expired = vaxStatus(expires) === "expired"
  return (
    <Link
      className={cn(
        "flex flex-col justify-between gap-6 rounded-3xl bg-warning-soft p-5 transition-transform active:scale-[0.98]",
        className
      )}
      href={`/mobile/pets/${pet.id}`}
    >
      <div className="flex items-center justify-between">
        <HugeiconsIcon className="size-7" icon={Alert02Icon} />
        <PetPicture
          className="size-9 rounded-full border-2 border-white/80"
          pet={pet}
          sizes="36px"
        />
      </div>
      <div>
        <p className="font-display text-4xl">
          {expired ? "Vaccin expiré" : "Vaccin à refaire"}
        </p>
        <p className="mt-1 font-semibold">
          {name} de {pet.name}
        </p>
        <p className="text-sm opacity-80">
          {expired
            ? "À refaire chez le vétérinaire"
            : `Avant le ${dayMonth(expires)}`}
        </p>
      </div>
    </Link>
  )
}

/* ——— L'onglet Animaux : leurs nouvelles et la liste ——— */

export function MobilePets() {
  const site = useSite()
  const [view, setView] = useState<"feed" | "pets">("feed")
  const [only, setOnly] = useState<string | null>(null)
  const shown = only ? site.pets.filter((p) => p.id === only) : site.pets
  const alerts = shown.flatMap((pet) => petAlerts(pet).map((v) => ({ pet, v })))
  const soon = sortedByStart(
    site.bookings.filter(
      (b) => isUpcoming(b) && (!only || b.pets.includes(only))
    )
  )
  const notes = site.notes
    .filter((n) => !only || n.pet === only)
    .sort((a, b) => b.date.localeCompare(a.date))
  const months: { label: string; list: typeof notes }[] = []
  for (const n of notes) {
    const label = monthOf(n.date)
    const group = months.find((m) => m.label === label)
    if (group) group.list.push(n)
    else months.push({ label, list: [n] })
  }

  return (
    <div className="space-y-6">
      <TabHeader title="Animaux">
        <RoundButton
          className="bg-primary text-primary-foreground"
          href="/mobile/pets/new"
          icon={PlusSignIcon}
          label="Ajouter un animal"
        />
      </TabHeader>

      <Segmented
        onChange={setView}
        options={[
          { label: "Leurs nouvelles", value: "feed" },
          { label: "Mes animaux", value: "pets" },
        ]}
        value={view}
      />

      {view === "feed" && (
        <>
          <Carousel className="gap-3">
            {[null, ...site.pets].map((p) => {
              const id = p?.id ?? null
              const on = only === id
              return (
                <button
                  aria-pressed={on}
                  className="flex w-20 shrink-0 flex-col items-center gap-2 pt-1"
                  key={id ?? "all"}
                  onClick={() => setOnly(id)}
                  type="button"
                >
                  <span
                    className={cn(
                      "relative rounded-full p-1 transition-opacity",
                      p ? p.tone : "bg-secondary",
                      only && !on && "opacity-40"
                    )}
                  >
                    <span className="block rounded-full bg-background p-0.5">
                      {p ? (
                        <PetPicture
                          className="size-16 rounded-full"
                          pet={p}
                          sizes="64px"
                        />
                      ) : (
                        <span className="flex size-16 items-center justify-center rounded-full bg-secondary">
                          <HugeiconsIcon
                            className="size-7"
                            icon={PawPrintIcon}
                          />
                        </span>
                      )}
                    </span>
                    {on && (
                      <span className="absolute -right-0.5 -bottom-0.5 flex size-7 items-center justify-center rounded-full border-2 border-background bg-control text-control-foreground">
                        <HugeiconsIcon
                          className="size-3.5"
                          icon={Tick02Icon}
                          strokeWidth={3}
                        />
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "max-w-full truncate",
                      on ? "font-bold" : "font-medium text-muted-foreground"
                    )}
                  >
                    {p?.name ?? "Tous"}
                  </span>
                </button>
              )
            })}
          </Carousel>

          {(soon.length > 0 || alerts.length > 0) && (
            <Section title="Bientôt">
              <Carousel>
                {soon.map((b) => (
                  <SoonCard
                    booking={b}
                    className="w-64 shrink-0 snap-start"
                    key={b.id}
                  />
                ))}
                {alerts.map(({ pet, v }) => (
                  <VaxCard
                    className="w-64 shrink-0 snap-start"
                    expires={v.expires}
                    key={pet.id + v.name}
                    name={v.name}
                    pet={pet}
                  />
                ))}
              </Carousel>
            </Section>
          )}

          {months.length ? (
            months.map((m) => (
              <section className="space-y-4" key={m.label}>
                <h2 className="px-4 font-heading text-xl font-semibold first-letter:uppercase">
                  {m.label}
                </h2>
                {m.list.map((n) => (
                  <NotePost key={n.id} note={n} showPet={!only} />
                ))}
              </section>
            ))
          ) : (
            <div className="mx-4 space-y-3 rounded-3xl bg-muted p-6 text-center">
              <HugeiconsIcon className="mx-auto size-10" icon={PawPrintIcon} />
              <p className="text-lg font-semibold">Pas encore de nouvelles</p>
              <p className="text-muted-foreground">
                Après chaque visite, l&apos;établissement laisse un mot ici :
                comment ça s&apos;est passé, des photos, un conseil.
              </p>
            </div>
          )}
        </>
      )}

      {view === "pets" && (
        <div className="space-y-4 px-4">
          {site.pets.map((pet) => {
            const count = petAlerts(pet).length
            const next = sortedByStart(
              site.bookings.filter(
                (b) => isUpcoming(b) && b.pets.includes(pet.id)
              )
            )[0]
            return (
              <Link
                className={cn(
                  "flex items-center gap-4 rounded-3xl p-3 pe-4 transition-transform active:scale-[0.98]",
                  pet.tone
                )}
                href={`/mobile/pets/${pet.id}`}
                key={pet.id}
              >
                <PetPicture
                  className="size-28 shrink-0 rounded-2xl"
                  pet={pet}
                  sizes="112px"
                />
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block truncate font-display text-4xl">
                    {pet.name}
                  </span>
                  <span className="block truncate font-semibold opacity-80">
                    {pet.breed} · {ageOf(pet.birth)}
                  </span>
                  <span className="block text-sm font-semibold">
                    {count
                      ? `${count} vaccin${count > 1 ? "s" : ""} à renouveler`
                      : next
                        ? `${next.activity} · ${countdown(next).toLowerCase()}`
                        : "Tout est à jour"}
                  </span>
                </span>
                <HugeiconsIcon
                  className="size-6 shrink-0"
                  icon={ArrowRight01Icon}
                />
              </Link>
            )
          })}
          <Link
            className="flex min-h-24 items-center justify-center gap-3 rounded-3xl border-2 border-dashed text-lg font-semibold text-muted-foreground"
            href="/mobile/pets/new"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HugeiconsIcon className="size-6" icon={PlusSignIcon} />
            </span>
            Ajouter un animal
          </Link>
        </div>
      )}
    </div>
  )
}

/* ——— Le profil d'un animal ——— */

function TextCard({
  icon,
  title,
  children,
}: {
  icon: typeof PawPrintIcon
  title: string
  children: string
}) {
  return (
    <div className="mx-4 flex gap-4 rounded-3xl bg-muted p-5">
      <HugeiconsIcon className="mt-0.5 size-6 shrink-0" icon={icon} />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-lg text-pretty">{children || "Rien à signaler"}</p>
      </div>
    </div>
  )
}

export function MobilePetProfile({ id }: { id: string }) {
  const site = useSite()
  const [tab, setTab] = useState<"news" | "health" | "sheet">("news")
  const [gallery, setGallery] = useState(false)
  const pet = site.pets.find((p) => p.id === id)
  if (!pet)
    return (
      <div className="space-y-4 p-4">
        <p className="text-muted-foreground">Cet animal n&apos;existe plus.</p>
        <Link className="font-semibold text-link underline" href="/mobile/pets">
          Mes animaux
        </Link>
      </div>
    )

  const notes = site.notes
    .filter((n) => n.pet === pet.id)
    .sort((a, b) => b.date.localeCompare(a.date))
  const bookings = site.bookings.filter((b) => b.pets.includes(pet.id))
  const next = sortedByStart(bookings.filter(isUpcoming))[0]
  const past = bookings
    .filter((b) => !isUpcoming(b))
    .sort((a, b) => b.start.localeCompare(a.start))
  const alerts = petAlerts(pet)
  const photos = [...(pet.photo ? [pet.photo] : []), ...pet.gallery]
  const female = pet.sex === "Femelle"
  const addPhoto = (url: string) => {
    savePet(
      pet.photo
        ? { ...pet, gallery: [url, ...pet.gallery] }
        : { ...pet, photo: url }
    )
    notify("Photo ajoutée")
  }
  const onTone = "bg-white/60 text-current"
  const facts = [
    { icon: BirthdayCakeIcon, label: "Âge", value: ageOf(pet.birth) },
    { icon: WeightScaleIcon, label: "Poids", value: kg(pet.weight) },
    { icon: Calendar03Icon, label: "Visites", value: String(past.length) },
    {
      icon: CheckmarkBadge01Icon,
      label: female ? "Stérilisée" : "Stérilisé",
      value: pet.neutered ? "Oui" : "Non",
    },
  ]

  return (
    <div className="space-y-8 pb-6">
      {/* Sa couleur en cadre, sa photo dedans, son nom en très grand */}
      <div
        className={cn(
          "px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-7",
          pet.tone
        )}
      >
        <div className="flex justify-between pb-3">
          <RoundButton
            className={onTone}
            href="/mobile/pets"
            icon={ArrowLeft01Icon}
            label="Retour"
          />
          <RoundButton
            className={onTone}
            href={`/mobile/pets/${pet.id}/edit`}
            icon={Edit02Icon}
            label="Modifier la fiche"
          />
        </div>
        {pet.photo ? (
          <button
            aria-label={`Voir les ${photos.length} photos de ${pet.name}`}
            className="relative block w-full"
            onClick={() => setGallery(true)}
            type="button"
          >
            <Photo
              alt={pet.name}
              className="aspect-4/3 w-full rounded-4xl"
              sizes="448px"
              src={pet.photo}
            />
            {photos.length > 1 && (
              <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white">
                {photos.length} photos
              </span>
            )}
          </button>
        ) : (
          <PhotoButton
            className="aspect-4/3 h-auto w-full flex-col gap-3 rounded-4xl border-2 border-dashed border-current/30 bg-white/30 text-lg text-current hover:bg-white/50"
            onPick={addPhoto}
            variant="ghost"
          >
            <HugeiconsIcon className="size-10" icon={Camera01Icon} />
            Ajouter sa photo
          </PhotoButton>
        )}
        <h1 className="mt-5 font-display text-8xl">{pet.name}</h1>
        <p className="mt-1 text-lg font-semibold opacity-80">
          {pet.breed} · {pet.sex}
        </p>
        {pet.traits.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {pet.traits.map((t) => (
              <span
                className="rounded-full bg-white/50 px-3 py-1 font-semibold"
                key={t}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <QuickAction
            circleClassName="bg-wise-forest text-wise-green"
            href="/mobile/explore/find"
            icon={Calendar03Icon}
            label="Réserver"
          />
          <PhotoButton
            className="h-auto flex-col justify-start gap-2 bg-transparent p-0 text-sm leading-tight font-semibold text-current hover:bg-transparent [&_svg]:size-6"
            onPick={addPhoto}
            variant="ghost"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-white/60">
              <HugeiconsIcon icon={ImageAdd01Icon} />
            </span>
            Ajouter une photo
          </PhotoButton>
          <QuickAction
            circleClassName={onTone}
            href={`/mobile/pets/${pet.id}/edit`}
            icon={Edit02Icon}
            label="Modifier"
          />
        </div>
      </div>

      <Carousel>
        {facts.map((f) => (
          <div
            className="w-32 shrink-0 snap-start rounded-3xl bg-muted p-4"
            key={f.label}
          >
            <HugeiconsIcon className="size-6" icon={f.icon} />
            <p className="mt-3 text-xl font-semibold">{f.value}</p>
            <p className="text-sm text-muted-foreground">{f.label}</p>
          </div>
        ))}
      </Carousel>

      {alerts.map((v) => (
        <div
          className="mx-4 space-y-4 rounded-3xl bg-warning-soft p-5"
          key={v.name}
        >
          <div className="flex gap-3">
            <HugeiconsIcon className="size-6 shrink-0" icon={Alert02Icon} />
            <div>
              <p className="text-lg font-semibold">
                Vaccin « {v.name} »{" "}
                {vaxStatus(v.expires) === "expired" ? "expiré" : "à refaire"}
              </p>
              <p>
                {vaxStatus(v.expires) === "expired"
                  ? "Sans lui, les pensions ne pourront pas l'accueillir."
                  : `À faire avant le ${dayMonth(v.expires)}`}
              </p>
            </div>
          </div>
          <Button
            className="w-full rounded-full"
            render={<Link href={`/mobile/pets/${pet.id}/edit`} />}
            size="xl"
            variant="outline"
          >
            C&apos;est fait, je mets à jour
          </Button>
        </div>
      ))}

      <Segmented
        onChange={setTab}
        options={[
          { label: "Nouvelles", value: "news" },
          { label: "Santé", value: "health" },
          { label: "Sa fiche", value: "sheet" },
        ]}
        value={tab}
      />

      {tab === "news" && (
        <>
          {next && (
            <Section title="Prochaine visite">
              <SoonCard booking={next} className="mx-4" />
            </Section>
          )}
          <Section title="Le mot des pros">
            {notes.length ? (
              <div className="space-y-4">
                {notes.map((n) => (
                  <NotePost key={n.id} note={n} showPet={false} />
                ))}
              </div>
            ) : (
              <p className="px-4 text-muted-foreground">
                Après sa prochaine visite, l&apos;établissement vous laissera un
                mot ici.
              </p>
            )}
          </Section>
          <Section title="Ses photos">
            <div className="grid grid-cols-3 gap-1.5 px-4">
              {photos.map((p, i) => (
                <button
                  aria-label={`Photo ${i + 1}`}
                  key={p}
                  onClick={() => setGallery(true)}
                  type="button"
                >
                  <Photo
                    alt=""
                    className="aspect-square rounded-2xl"
                    sizes="140px"
                    src={p}
                  />
                </button>
              ))}
              <PhotoButton
                className="aspect-square h-auto flex-col gap-1 rounded-2xl border-2 border-dashed text-sm"
                onPick={addPhoto}
                variant="ghost"
              >
                <HugeiconsIcon className="size-6" icon={PlusSignIcon} />
                Ajouter
              </PhotoButton>
            </div>
          </Section>
          {past.length > 0 && (
            <Section title="Toutes ses visites">
              <Rows>
                {past.map((b) => (
                  <BookingItem booking={b} key={b.id} />
                ))}
              </Rows>
            </Section>
          )}
        </>
      )}

      {tab === "health" && (
        <>
          <Section title="Vaccins">
            <div className="space-y-2 px-4">
              {pet.vaccines.map((v) => {
                const style = vaxStyle[vaxStatus(v.expires)]
                const left = Math.max(
                  0,
                  Math.min(1, daysBetween(todayIso, v.expires) / 365)
                )
                return (
                  <div
                    className="space-y-3 rounded-3xl border p-4"
                    key={v.name}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{v.name}</p>
                        <p className="text-muted-foreground">
                          Valable jusqu&apos;au {dayMonth(v.expires)}
                        </p>
                      </div>
                      <Badge size="lg" variant={style.variant}>
                        {style.label}
                      </Badge>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn("h-full rounded-full", style.bar)}
                        style={{ width: `${Math.max(4, left * 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {pet.vaccines.length === 0 && (
                <p className="text-muted-foreground">
                  Aucun vaccin enregistré pour l&apos;instant.
                </p>
              )}
            </div>
          </Section>
          <Section title="Vétérinaire">
            <div className="mx-4 space-y-4 rounded-3xl bg-muted p-5">
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background">
                  <HugeiconsIcon className="size-6" icon={StethoscopeIcon} />
                </span>
                <p className="min-w-0 flex-1 text-lg font-semibold">
                  {pet.vet || "À renseigner"}
                </p>
              </div>
              {pet.vet && (
                <Button
                  className="w-full rounded-full"
                  onClick={() => notify("Appel en cours…")}
                  size="xl"
                >
                  <HugeiconsIcon icon={Call02Icon} />
                  Appeler
                </Button>
              )}
            </div>
          </Section>
          <TextCard icon={Alert02Icon} title="Santé et traitements">
            {pet.health}
          </TextCard>
          <Section title="Poids">
            <div className="mx-4 rounded-3xl border">
              <WeightChart pet={pet} />
            </div>
          </Section>
        </>
      )}

      {tab === "sheet" && (
        <>
          <div className="px-4 py-2">
            <IdCard pet={pet} />
          </div>
          {pet.routine.length > 0 && (
            <Section title="Sa journée">
              <ol className="mx-4">
                {pet.routine.map((r, i) => (
                  <li className="relative flex gap-4 pb-5 last:pb-0" key={i}>
                    {i < pet.routine.length - 1 && (
                      <span className="absolute top-8 bottom-0 left-7 w-0.5 bg-border" />
                    )}
                    <span
                      className={cn(
                        "relative flex h-8 w-14 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                        pet.tone
                      )}
                    >
                      {r.time}
                    </span>
                    <p className="pt-1 text-lg">{r.text}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}
          <TextCard icon={Restaurant01Icon} title="Repas">
            {pet.food}
          </TextCard>
          <Section title="Caractère">
            <div className="grid grid-cols-3 gap-2 px-4">
              {(
                [
                  ["dogs", "les chiens", PawPrintIcon],
                  ["cats", "les chats", CatIcon],
                  ["kids", "les enfants", Baby01Icon],
                ] as const
              ).map(([key, label, icon]) => (
                <div
                  className={cn(
                    "space-y-3 rounded-3xl p-4",
                    compatMeta[pet.compat[key]].tone
                  )}
                  key={key}
                >
                  <HugeiconsIcon className="size-6" icon={icon} />
                  <div>
                    <p className="text-sm">Avec {label}</p>
                    <p className="font-semibold">
                      {compatMeta[pet.compat[key]].label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {pet.behaviour && (
              <p className="px-4 text-lg text-pretty">{pet.behaviour}</p>
            )}
          </Section>
          <Section title="Identité">
            <Rows>
              <Row text={pet.species} title={pet.breed} />
              <Row
                text={`${female ? "Née" : "Né"} le ${dayMonth(pet.birth)} ${pet.birth.slice(0, 4)}`}
                title={ageOf(pet.birth)}
              />
              <Row text="N° de puce" title={pet.chip || "À compléter"} />
            </Rows>
          </Section>
        </>
      )}

      <PhotoDialog
        onOpenChange={setGallery}
        open={gallery}
        photos={photos}
        title={pet.name}
      />
    </div>
  )
}
