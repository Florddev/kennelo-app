"use client"

import {
  Alert02Icon,
  CalendarAdd01Icon,
  Call02Icon,
  Camera01Icon,
  Message01Icon,
  PawPrintIcon,
  Restaurant01Icon,
  ShieldCheckIcon,
  SmileIcon,
  StethoscopeIcon,
  VaccineIcon,
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
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import {
  ageOf,
  type Compat,
  findPet,
  formatDate,
  type PetNote,
  TODAY_ISO,
  vaccineStatus,
} from "@/components/pets/data"
import {
  reservationDate,
  reservationStatus,
} from "@/components/reservations/reservations-view"
import {
  formatAmount,
  Kpi,
  PageShell,
  Widget,
} from "@/components/today/widgets"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const statusMeta = {
  expired: { label: "Expiré", variant: "error" },
  soon: { label: "Bientôt", variant: "warning" },
  valid: { label: "À jour", variant: "success" },
} as const

const compatMeta: Record<Compat, { label: string; dot: string }> = {
  careful: { dot: "bg-amber-500", label: "Avec précaution" },
  no: { dot: "bg-red-500", label: "Non" },
  yes: { dot: "bg-success", label: "Oui" },
}

function Facts({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="divide-y text-sm">
      {items.map(([label, value]) => (
        <div
          className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0"
          key={label}
        >
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="text-end font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Chips({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0)
    return <span className="text-muted-foreground">{empty}</span>
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

export function PetView({ slug }: { slug: string }) {
  const pet = findPet(slug)!
  const [notes, setNotes] = useState<PetNote[]>(pet.notes)
  const [noteFilter, setNoteFilter] = useState<Activity | "all">("all")
  const [draft, setDraft] = useState("")
  const [draftActivity, setDraftActivity] = useState<Activity>(
    pet.activities[0] ?? "Pension"
  )

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
  const shownNotes = [...notes]
    .filter((n) => noteFilter === "all" || n.activity === noteFilter)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const alerts = [
    pet.behavior.warning,
    ...pet.allergies.map((a) => `Allergie : ${a}`),
    ...pet.treatments.map((t) => `Traitement : ${t.dose}`),
  ].filter(Boolean) as string[]

  return (
    <PageShell
      actions={
        <>
          <Button
            className="max-sm:hidden"
            render={<Link href="/messages" />}
            size="sm"
            variant="outline"
          >
            <HugeiconsIcon icon={Message01Icon} />
            Écrire
          </Button>
          <NewStayDialog
            defaultClient={pet.owner.name}
            defaultPet={pet.name}
            trigger={
              <Button>
                <HugeiconsIcon icon={CalendarAdd01Icon} />
                Nouveau séjour
              </Button>
            }
          />
        </>
      }
      icon={PawPrintIcon}
      title={`Animaux / ${pet.name}`}
    >
      <section className="flex flex-wrap items-start gap-5">
        <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-wise-green text-wise-forest">
          <HugeiconsIcon className="size-10" icon={PawPrintIcon} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-3xl font-semibold">{pet.name}</h2>
            {current && (
              <Badge variant="success">En séjour · {current.title}</Badge>
            )}
            {expired.length > 0 ? (
              <Badge variant="error">
                <HugeiconsIcon icon={Alert02Icon} />
                {expired.map((v) => v.name).join(", ")} expiré
              </Badge>
            ) : (
              <Badge variant="outline">
                <HugeiconsIcon icon={ShieldCheckIcon} />
                Vaccins à jour
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {pet.breed} · {pet.sex === "Mâle" ? "Mâle" : "Femelle"}
            {pet.neutered &&
              (pet.sex === "Mâle" ? " castré" : " stérilisée")} ·{" "}
            {ageOf(pet.birth)} · {String(pet.weight).replace(".", ",")} kg
          </p>
          <div className="flex flex-wrap gap-1.5">
            {pet.activities.map((a) => (
              <Badge className="gap-1.5" key={a} variant="outline">
                <ActivityMark activity={a} className="size-3.5 text-[0.5rem]" />
                {a}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3 sm:w-auto">
          <Avatar className="size-10">
            <AvatarFallback>{pet.owner.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{pet.owner.name}</p>
            <p className="text-xs text-muted-foreground">{pet.owner.phone}</p>
          </div>
          <Button aria-label="Appeler" size="icon-sm" variant="outline">
            <HugeiconsIcon icon={Call02Icon} />
          </Button>
        </div>
      </section>

      {alerts.length > 0 && (
        <Alert variant="warning">
          <HugeiconsIcon icon={Alert02Icon} />
          <AlertTitle>À savoir avant de s&apos;en occuper</AlertTitle>
          <AlertDescription>
            <ul className="list-inside list-disc">
              {alerts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTab value="profile">Fiche</TabsTab>
          <TabsTab value="notes">
            Notes{" "}
            <span className="ms-1 text-muted-foreground">{notes.length}</span>
          </TabsTab>
          <TabsTab value="photos">
            Photos{" "}
            <span className="ms-1 text-muted-foreground">
              {pet.photos.length}
            </span>
          </TabsTab>
          <TabsTab value="history">
            Historique{" "}
            <span className="ms-1 text-muted-foreground">
              {pet.history.length}
            </span>
          </TabsTab>
        </TabsList>

        <TabsPanel className="mt-6 grid gap-4 lg:grid-cols-3" value="profile">
          <div className="space-y-4 lg:col-span-2">
            <Widget description="Contrôlés à chaque arrivée" title="Vaccins">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vaccin</TableHead>
                    <TableHead>Fait le</TableHead>
                    <TableHead>Valable jusqu&apos;au</TableHead>
                    <TableHead className="text-end">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pet.vaccines.map((v) => {
                    const status = vaccineStatus(v)
                    return (
                      <TableRow key={v.name}>
                        <TableCell>
                          <span className="flex items-center gap-2 font-medium">
                            <HugeiconsIcon
                              className="size-4 text-muted-foreground"
                              icon={VaccineIcon}
                            />
                            {v.name}
                            {v.required && (
                              <Badge size="sm" variant="outline">
                                Obligatoire
                              </Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(v.done)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            status === "expired" &&
                              "text-destructive-foreground"
                          )}
                        >
                          {formatDate(v.expires)}
                        </TableCell>
                        <TableCell className="text-end">
                          <Badge variant={statusMeta[status].variant}>
                            {statusMeta[status].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Widget>

            <Widget title="Santé">
              <div className="grid gap-6 sm:grid-cols-2">
                <Facts
                  items={[
                    [
                      "Allergies",
                      <Chips empty="Aucune" items={pet.allergies} key="a" />,
                    ],
                    [
                      "Pathologies",
                      <Chips empty="Aucune" items={pet.conditions} key="c" />,
                    ],
                    [
                      "Traitements",
                      pet.treatments.length
                        ? pet.treatments.map((t) => t.dose).join(", ")
                        : "Aucun",
                    ],
                    ["Dernière visite", formatDate(pet.lastVetVisit)],
                  ]}
                />
                <div className="space-y-2 rounded-xl bg-muted/60 p-3 text-sm">
                  <p className="flex items-center gap-2 font-medium">
                    <HugeiconsIcon className="size-4" icon={StethoscopeIcon} />
                    {pet.vet.name}
                  </p>
                  <p className="text-muted-foreground">
                    {pet.vet.city} · {pet.vet.phone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Autorisation de soins d&apos;urgence signée par{" "}
                    {pet.owner.name.split(" ")[0]}.
                  </p>
                </div>
              </div>
            </Widget>

            <div className="grid gap-4 md:grid-cols-2">
              <Widget title="Alimentation">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <HugeiconsIcon
                    className="size-4 text-muted-foreground"
                    icon={Restaurant01Icon}
                  />
                  {pet.food.brand}
                </div>
                <Facts
                  items={[
                    ["Ration", pet.food.ration],
                    ["Repas", pet.food.meals.join(" · ")],
                    [
                      "Fourni par",
                      pet.food.providedByOwner
                        ? "Le propriétaire"
                        : "La pension",
                    ],
                    ["Friandises", pet.food.treats],
                  ]}
                />
              </Widget>
              <Widget title="Comportement">
                <div className="mb-3 flex flex-wrap gap-1">
                  <HugeiconsIcon
                    className="me-1 size-4 text-muted-foreground"
                    icon={SmileIcon}
                  />
                  {pet.behavior.traits.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
                <Facts
                  items={[
                    ...(
                      [
                        ["Avec les chiens", pet.behavior.dogs],
                        ["Avec les chats", pet.behavior.cats],
                        ["Avec les humains", pet.behavior.people],
                      ] as const
                    ).map(
                      ([label, value]) =>
                        [
                          label,
                          <span
                            className="inline-flex items-center gap-1.5"
                            key={label}
                          >
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                compatMeta[value].dot
                              )}
                            />
                            {compatMeta[value].label}
                          </span>,
                        ] as [string, ReactNode]
                    ),
                    [
                      "Peurs",
                      <Chips
                        empty="Aucune connue"
                        items={pet.behavior.fears}
                        key="f"
                      />,
                    ],
                  ]}
                />
              </Widget>
            </div>
          </div>

          <div className="space-y-4">
            <Widget title="Identité">
              <Facts
                items={[
                  ["Espèce", pet.species],
                  ["Race", pet.breed],
                  ["Robe", pet.color],
                  ["Né le", formatDate(pet.birth)],
                  ["Poids", `${String(pet.weight).replace(".", ",")} kg`],
                  [
                    "Puce",
                    <span className="font-mono text-xs" key="p">
                      {pet.chip}
                    </span>,
                  ],
                ]}
              />
            </Widget>
            <Widget description="Ce qu'il apporte d'habitude" title="Affaires">
              <ul className="flex flex-wrap gap-1.5">
                {pet.belongings.map((b) => (
                  <li key={b}>
                    <Badge variant="outline">{b}</Badge>
                  </li>
                ))}
              </ul>
            </Widget>
            <Widget title="Documents">
              <Facts
                items={[
                  [
                    "Contrat de pension",
                    pet.contractSigned ? (
                      "Signé"
                    ) : (
                      <Badge key="c" variant="warning">
                        À signer
                      </Badge>
                    ),
                  ],
                  ["Carnet de santé", "Scanné"],
                  ["Autorisation de soins", "Signée"],
                ]}
              />
            </Widget>
          </div>
        </TabsPanel>

        <TabsPanel className="mt-6 space-y-4" value="notes">
          <div className="space-y-2 rounded-2xl border bg-card p-4">
            <Textarea
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Une observation sur ${pet.name} ? Elle sera visible par toute l'équipe.`}
              value={draft}
            />
            <div className="flex items-center justify-end gap-2">
              <Select
                items={activityNames.map((a) => ({ label: a, value: a }))}
                onValueChange={(v) => setDraftActivity(v as Activity)}
                value={draftActivity}
              >
                <SelectTrigger className="w-40" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {activityNames.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              <Button
                disabled={!draft.trim()}
                onClick={() => {
                  setNotes([
                    {
                      activity: draftActivity,
                      author: "Alex Martin",
                      date: TODAY_ISO,
                      text: draft.trim(),
                    },
                    ...notes,
                  ])
                  setDraft("")
                }}
                size="sm"
              >
                Ajouter la note
              </Button>
            </div>
          </div>
          <Tabs
            onValueChange={(v) => setNoteFilter(v as Activity | "all")}
            value={noteFilter}
          >
            <TabsList size="sm">
              <TabsTab value="all">Toutes</TabsTab>
              {activityNames.map((a) => (
                <TabsTab key={a} value={a}>
                  {a}
                </TabsTab>
              ))}
            </TabsList>
          </Tabs>
          <ul className="space-y-3">
            {shownNotes.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Aucune note pour cette activité.
              </li>
            )}
            {shownNotes.map((n, i) => (
              <li
                className="flex gap-3 rounded-2xl border bg-card p-4"
                key={`${n.date}-${i}`}
              >
                <ActivityMark activity={n.activity} className="mt-0.5" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {n.author}
                    </span>{" "}
                    · {n.activity} · {formatDate(n.date)}
                  </p>
                  <p className="text-sm">{n.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </TabsPanel>

        <TabsPanel
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          value="photos"
        >
          <button
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-sm text-muted-foreground hover:bg-accent"
            type="button"
          >
            <HugeiconsIcon className="size-6" icon={Camera01Icon} />
            Ajouter des photos
          </button>
          {pet.photos.map((photo, i) => (
            <figure
              className={cn(
                "relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br",
                photo.tone
              )}
              key={i}
            >
              <HugeiconsIcon
                className="size-10 text-black/15"
                icon={PawPrintIcon}
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 to-transparent p-3 text-white">
                <p className="text-sm font-medium">{photo.caption}</p>
                <p className="text-xs opacity-80">{formatDate(photo.date)}</p>
              </figcaption>
            </figure>
          ))}
        </TabsPanel>

        <TabsPanel className="mt-6 space-y-4" value="history">
          <div className="grid grid-cols-3 gap-3">
            <Kpi icon={PawPrintIcon} label="Séjours" value={stays.length}>
              {nights} nuits au total
            </Kpi>
            <Kpi
              icon={CalendarAdd01Icon}
              label="Prestations"
              value={pet.history.length}
            >
              Toutes activités
            </Kpi>
            <Kpi
              icon={ShieldCheckIcon}
              label="Montant"
              value={formatAmount(spent)}
            >
              Réservé ou réglé
            </Kpi>
          </div>
          <ol className="relative space-y-3 before:absolute before:inset-y-2 before:start-[1.1rem] before:w-px before:bg-border">
            {pet.history.map((r) => (
              <li className="relative flex gap-3" key={r.id}>
                <span className="z-10 mt-3 flex size-9 shrink-0 items-center justify-center rounded-full border bg-background">
                  <ActivityMark activity={r.activity} />
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border bg-card p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {reservationDate(r)} {r.detail && `· ${r.detail}`}
                    </p>
                  </div>
                  {r.amount !== undefined && (
                    <span className="text-sm tabular-nums">
                      {formatAmount(r.amount)}
                    </span>
                  )}
                  <Badge variant={reservationStatus[r.status].variant}>
                    {reservationStatus[r.status].label}
                  </Badge>
                </div>
              </li>
            ))}
          </ol>
        </TabsPanel>
      </Tabs>
    </PageShell>
  )
}
