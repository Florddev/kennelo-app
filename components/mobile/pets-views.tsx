"use client"

import {
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Call02Icon,
  Camera01Icon,
  Calendar03Icon,
  Edit02Icon,
  PawPrintIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import {
  BookingItem,
  Carousel,
  IconDot,
  NoteCard,
  QuickAction,
  RoundButton,
  Row,
  Rows,
  Section,
  Segmented,
  TabHeader,
} from "@/components/mobile/mobile-ui"
import {
  ageOf,
  compatMeta,
  isUpcoming,
  type MyPet,
  petAlerts,
  savePet,
  useSite,
  vaxStatus,
} from "@/components/site/data"
import { countdown } from "@/components/site/booking-detail"
import { IdCard, vaxStyle, WeightChart } from "@/components/site/pet-profile"
import {
  PetAvatar,
  Photo,
  PhotoButton,
  PhotoStrip,
} from "@/components/site/site-ui"
import { dayMonth } from "@/components/services/data"
import { notify } from "@/components/settings/settings-ui"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const kg = (n: number) => `${String(n).replace(".", ",")} kg`

function AlertRows({ pets }: { pets: MyPet[] }) {
  const alerts = pets.flatMap((pet) => petAlerts(pet).map((v) => ({ pet, v })))
  if (!alerts.length) return null
  return (
    <Rows className="border-warning/40 bg-warning-soft">
      {alerts.map(({ pet, v }) => (
        <Row
          href={`/mobile/pets/${pet.id}`}
          key={pet.id + v.name}
          media={<IconDot className="bg-background" icon={Alert02Icon} />}
          text={
            vaxStatus(v.expires) === "expired"
              ? "Expiré : à refaire chez le vétérinaire"
              : `À renouveler avant le ${dayMonth(v.expires)}`
          }
          title={`Vaccin « ${v.name} » de ${pet.name}`}
        />
      ))}
    </Rows>
  )
}

/* ——— L'onglet Animaux : le fil et la liste ——— */

export function MobilePets() {
  const site = useSite()
  const [view, setView] = useState<"feed" | "pets">("feed")
  const [only, setOnly] = useState<string | null>(null)
  const shown = only ? site.pets.filter((p) => p.id === only) : site.pets
  const notes = site.notes
    .filter((n) => !only || n.pet === only)
    .sort((a, b) => b.date.localeCompare(a.date))
  const soon = site.bookings
    .filter((b) => isUpcoming(b) && (!only || b.pets.includes(only)))
    .sort((a, b) => a.start.localeCompare(b.start))

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
          <Carousel className="gap-4">
            {[{ id: null, name: "Tous" }, ...site.pets].map((p) => {
              const on = only === p.id
              return (
                <button
                  aria-pressed={on}
                  className="flex w-18 shrink-0 flex-col items-center gap-2 pt-1"
                  key={p.id ?? "all"}
                  onClick={() => setOnly(p.id)}
                  type="button"
                >
                  <span
                    className={cn(
                      "rounded-full p-1 ring-2 transition-colors",
                      on ? "ring-control" : "ring-transparent"
                    )}
                  >
                    {"tone" in p ? (
                      <PetAvatar className="size-16" pet={p} />
                    ) : (
                      <span className="flex size-16 items-center justify-center rounded-full bg-secondary">
                        <HugeiconsIcon className="size-7" icon={PawPrintIcon} />
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "max-w-full truncate text-sm",
                      on ? "font-bold" : "font-medium text-muted-foreground"
                    )}
                  >
                    {p.name}
                  </span>
                </button>
              )
            })}
          </Carousel>

          <AlertRows pets={shown} />

          {soon.length > 0 && (
            <Section title="Bientôt">
              <Rows>
                {soon.map((b) => (
                  <BookingItem booking={b} key={b.id} />
                ))}
              </Rows>
            </Section>
          )}

          <Section title="Le mot des pros">
            {notes.length ? (
              <div className="space-y-4">
                {notes.map((n) => (
                  <NoteCard key={n.id} note={n} />
                ))}
              </div>
            ) : (
              <p className="px-4 text-muted-foreground">
                Après chaque visite, l&apos;établissement laisse un mot ici :
                comment ça s&apos;est passé, des photos, un conseil.
              </p>
            )}
          </Section>
        </>
      )}

      {view === "pets" && (
        <div className="space-y-4 px-4">
          {site.pets.map((pet) => {
            const alerts = petAlerts(pet).length
            const next = site.bookings
              .filter((b) => isUpcoming(b) && b.pets.includes(pet.id))
              .sort((a, b) => a.start.localeCompare(b.start))[0]
            return (
              <Link
                className={cn(
                  "flex items-center gap-4 rounded-3xl p-3 pe-4 transition-transform active:scale-[0.98]",
                  pet.tone
                )}
                href={`/mobile/pets/${pet.id}`}
                key={pet.id}
              >
                {pet.photo ? (
                  <Photo
                    alt={pet.name}
                    className="size-28 shrink-0 rounded-2xl"
                    sizes="112px"
                    src={pet.photo}
                  />
                ) : (
                  <span className="flex size-28 shrink-0 items-center justify-center rounded-2xl bg-white/40 font-display text-6xl">
                    {pet.name[0]}
                  </span>
                )}
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block truncate font-display text-4xl">
                    {pet.name}
                  </span>
                  <span className="block truncate font-semibold opacity-80">
                    {pet.breed} · {ageOf(pet.birth)}
                  </span>
                  <span className="block text-sm font-semibold">
                    {alerts
                      ? `${alerts} vaccin${alerts > 1 ? "s" : ""} à renouveler`
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

function Info({ label, children }: { label: string; children: string }) {
  return (
    <div className="space-y-1 px-5 py-4">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="text-pretty">{children || "Rien à signaler"}</p>
    </div>
  )
}

export function MobilePetProfile({ id }: { id: string }) {
  const site = useSite()
  const [tab, setTab] = useState<"news" | "health" | "sheet">("news")
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
  const bookings = site.bookings
    .filter((b) => b.pets.includes(pet.id))
    .sort((a, b) => b.start.localeCompare(a.start))
  const soon = bookings.filter(isUpcoming).reverse()
  const past = bookings.filter((b) => !isUpcoming(b))
  const alerts = petAlerts(pet)
  const addPhoto = (url: string) =>
    savePet(
      pet.photo
        ? { ...pet, gallery: [url, ...pet.gallery] }
        : { ...pet, photo: url }
    )
  const female = pet.sex === "Femelle"

  return (
    <div className="space-y-6 pb-6">
      <div className={cn("pb-8", pet.tone)}>
        <div className="flex justify-between p-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
          <RoundButton
            className="bg-white/60 text-current"
            href="/mobile/pets"
            icon={ArrowLeft01Icon}
            label="Retour"
          />
          <RoundButton
            className="bg-white/60 text-current"
            href={`/mobile/pets/${pet.id}/edit`}
            icon={Edit02Icon}
            label="Modifier la fiche"
          />
        </div>
        <div className="flex flex-col items-center px-4 text-center">
          {pet.photo ? (
            <Photo
              alt={pet.name}
              className="size-40 rounded-full ring-8 ring-white/50"
              sizes="160px"
              src={pet.photo}
            />
          ) : (
            <PhotoButton
              className="size-40 flex-col gap-2 rounded-full bg-white/50 text-current hover:bg-white/70"
              onPick={addPhoto}
              variant="ghost"
            >
              <HugeiconsIcon className="size-8" icon={Camera01Icon} />
              Ajouter une photo
            </PhotoButton>
          )}
          <h1 className="mt-5 font-display text-7xl">{pet.name}</h1>
          <p className="mt-2 text-lg font-semibold opacity-80">
            {pet.breed} · {ageOf(pet.birth)} · {pet.sex}
          </p>
          {pet.traits.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
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
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4">
        <QuickAction
          href="/mobile/explore/find"
          icon={Calendar03Icon}
          label="Réserver"
          primary
        />
        <PhotoButton
          className="h-auto flex-col justify-start gap-2 bg-transparent p-0 text-sm leading-tight font-semibold hover:bg-transparent [&_svg]:size-6"
          onPick={(url) => {
            addPhoto(url)
            notify("Photo ajoutée")
          }}
          variant="ghost"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
            <HugeiconsIcon icon={Camera01Icon} />
          </span>
          Ajouter une photo
        </PhotoButton>
        <QuickAction
          href={`/mobile/pets/${pet.id}/edit`}
          icon={Edit02Icon}
          label="Modifier"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 px-4">
        {[
          { label: "Poids", value: kg(pet.weight) },
          { label: "Visites", value: String(past.length) },
          {
            label: "Vaccins",
            value: alerts.length ? `${alerts.length} à faire` : "À jour",
          },
        ].map((s) => (
          <div className="rounded-3xl bg-muted p-4" key={s.label}>
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <AlertRows pets={[pet]} />

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
          {soon.length > 0 && (
            <Section title="Bientôt">
              <Rows>
                {soon.map((b) => (
                  <BookingItem booking={b} key={b.id} />
                ))}
              </Rows>
            </Section>
          )}
          <Section title="Le mot des pros">
            {notes.length ? (
              <div className="space-y-4">
                {notes.map((n) => (
                  <NoteCard key={n.id} note={n} />
                ))}
              </div>
            ) : (
              <p className="px-4 text-muted-foreground">
                Après sa prochaine visite, l&apos;établissement vous laissera un
                mot ici.
              </p>
            )}
          </Section>
          {(pet.photo || pet.gallery.length > 0) && (
            <Section title="Ses photos">
              <div className="px-4">
                <PhotoStrip
                  photos={[...(pet.photo ? [pet.photo] : []), ...pet.gallery]}
                  title={pet.name}
                />
              </div>
            </Section>
          )}
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
            <Rows>
              {pet.vaccines.map((v) => {
                const style = vaxStyle[vaxStatus(v.expires)]
                return (
                  <Row
                    aside={<Badge variant={style.variant}>{style.label}</Badge>}
                    key={v.name}
                    text={`Valable jusqu'au ${dayMonth(v.expires)}`}
                    title={v.name}
                  />
                )
              })}
            </Rows>
          </Section>
          <Section title="Vétérinaire">
            <Rows>
              <Row
                aside={
                  <RoundButton
                    className="bg-primary text-primary-foreground"
                    icon={Call02Icon}
                    label="Appeler le vétérinaire"
                    onClick={() => notify("Appel en cours…")}
                  />
                }
                title={pet.vet || "À renseigner"}
              />
              <Info label="Santé et traitements">{pet.health}</Info>
            </Rows>
          </Section>
          <Section title="Poids">
            <Rows>
              <WeightChart pet={pet} />
            </Rows>
          </Section>
        </>
      )}

      {tab === "sheet" && (
        <>
          <div className="px-4 py-2">
            <IdCard pet={pet} />
          </div>
          <Section title="Au quotidien">
            <Rows>
              <Info label="Repas">{pet.food}</Info>
              {pet.routine.map((r) => (
                <Row
                  aside={<span className="font-semibold">{r.time}</span>}
                  key={r.time + r.text}
                  title={r.text}
                />
              ))}
            </Rows>
          </Section>
          <Section title="Caractère">
            <Rows>
              <Info label="Comportement">{pet.behaviour}</Info>
              {(
                [
                  ["dogs", "Avec les chiens"],
                  ["cats", "Avec les chats"],
                  ["kids", "Avec les enfants"],
                ] as const
              ).map(([key, label]) => (
                <Row
                  aside={
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-sm font-semibold",
                        compatMeta[pet.compat[key]].tone
                      )}
                    >
                      {compatMeta[pet.compat[key]].label}
                    </span>
                  }
                  key={key}
                  title={label}
                />
              ))}
            </Rows>
          </Section>
          <Section title="Identité">
            <Rows>
              <Info label="Espèce et race">{`${pet.species} · ${pet.breed}`}</Info>
              <Info label={female ? "Stérilisée" : "Stérilisé"}>
                {pet.neutered ? "Oui" : "Non"}
              </Info>
              <Info label="N° de puce">{pet.chip}</Info>
            </Rows>
          </Section>
        </>
      )}
    </div>
  )
}
