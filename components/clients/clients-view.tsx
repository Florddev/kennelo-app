"use client"

import {
  Alert02Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Call02Icon,
  EuroCircleIcon,
  Location01Icon,
  Mail01Icon,
  MailSend01Icon,
  Message01Icon,
  Tick02Icon,
  Upload04Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import {
  type Activity,
  ActivityMark,
  activityMeta,
} from "@/components/activity-mark"
import { relativeDate, shortDate } from "@/components/calendar"
import { type Client, clientHref, clients } from "@/components/clients/data"
import { NewClientDialog } from "@/components/clients/new-client-dialog"
import { invoiceTotal } from "@/components/invoices/data"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import { petHref } from "@/components/pets/data"
import {
  reservationDate,
  reservationStatus,
} from "@/components/reservations/reservations-view"
import {
  activityChips,
  AttentionList,
  FilterChips,
  formatAmount,
  listCard,
  listRow,
  Monogram,
  PageShell,
  SearchField,
  Section,
  StatusPill,
} from "@/components/today/widgets"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export const tagTone: Record<string, string> = {
  "En séjour": "bg-success-soft",
  Fidèle: "bg-background",
  Impayé: "bg-destructive-soft",
  Nouveau: "bg-info-soft",
}

const invoiceStatus = {
  draft: { label: "Brouillon", tone: "bg-background text-muted-foreground" },
  overdue: { label: "En retard", tone: "bg-destructive-soft" },
  paid: { label: "Payée", tone: "bg-success-soft" },
  pending: { label: "À encaisser", tone: "bg-warning-soft" },
} as const

const toneOf = (activities: Activity[]) =>
  activities[0] ? activityMeta[activities[0]].tint : "bg-background"

const visitOf = (c: Client) =>
  c.nextVisit !== undefined
    ? `Revient ${relativeDate(c.nextVisit).toLowerCase()}`
    : c.lastVisit !== undefined
      ? `Venu ${relativeDate(c.lastVisit).toLowerCase()}`
      : "Jamais venu"

/** Première lettre sans accent, pour ranger les clients comme un répertoire. */
const letterOf = (c: Client) => c.name.normalize("NFD")[0].toUpperCase()

function SheetSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="font-display text-xl">{title}</h3>
      {children}
    </section>
  )
}

function ClientSheet({
  client,
  open,
  onOpenChange,
}: {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const history = client
    ? [...client.reservations].sort((a, b) => b.start - a.start)
    : []
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup variant="inset">
        {client && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback
                    className={cn("font-semibold", toneOf(client.activities))}
                  >
                    {client.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="font-display text-3xl">
                    {client.name}
                  </SheetTitle>
                  <SheetDescription>
                    Client depuis {client.since} · {client.city}
                  </SheetDescription>
                </div>
              </div>
              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {client.tags.map((tag) => (
                    <StatusPill key={tag} tone={tagTone[tag] ?? "bg-muted"}>
                      {tag}
                    </StatusPill>
                  ))}
                </div>
              )}
            </SheetHeader>
            <SheetPanel className="space-y-6">
              <dl className="grid grid-cols-2 gap-2">
                {[
                  { icon: Call02Icon, value: client.phone },
                  { icon: Mail01Icon, value: client.email },
                  { icon: Location01Icon, value: client.city },
                  {
                    icon: EuroCircleIcon,
                    value: `${formatAmount(client.spent)} réglés`,
                  },
                ].map((item) => (
                  <div
                    className="flex min-w-0 items-center gap-2 rounded-2xl bg-muted px-3 py-2.5 text-sm font-semibold"
                    key={item.value}
                  >
                    <HugeiconsIcon
                      className="size-4 shrink-0"
                      icon={item.icon}
                    />
                    <span className="truncate">{item.value}</span>
                  </div>
                ))}
              </dl>

              {client.balance > 0 && (
                <p className="flex items-center gap-3 rounded-3xl bg-destructive-soft p-4 font-semibold">
                  <HugeiconsIcon className="size-5" icon={Alert02Icon} />
                  {formatAmount(client.balance)} à régler
                </p>
              )}

              <SheetSection title={`Animaux · ${client.pets.length}`}>
                <ul className={listCard}>
                  {client.pets.map((pet) => (
                    <li key={pet.name}>
                      <Link
                        className={cn(
                          listRow,
                          "transition-colors hover:bg-background/50 md:px-4"
                        )}
                        href={petHref(pet.name, client.name)}
                      >
                        <Monogram
                          text={pet.name.slice(0, 2)}
                          tone={toneOf(pet.activities)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{pet.name}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {[pet.species, pet.breed, pet.care]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <HugeiconsIcon
                          className="size-5 shrink-0 text-muted-foreground"
                          icon={ArrowRight01Icon}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </SheetSection>

              <SheetSection title="Historique">
                {history.length === 0 ? (
                  <p className="rounded-3xl bg-muted p-4 text-muted-foreground">
                    Aucune réservation récente.
                  </p>
                ) : (
                  <ul className={listCard}>
                    {history.map((r) => (
                      <li className={cn(listRow, "md:px-4")} key={r.id}>
                        <ActivityMark activity={r.activity} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">
                            {r.pet} · {r.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reservationDate(r)}
                          </p>
                        </div>
                        <StatusPill tone={reservationStatus[r.status].tone}>
                          {reservationStatus[r.status].label}
                        </StatusPill>
                      </li>
                    ))}
                  </ul>
                )}
              </SheetSection>

              {client.invoices.length > 0 && (
                <SheetSection title="Factures">
                  <ul className={listCard}>
                    {client.invoices.map((invoice) => (
                      <li className={cn(listRow, "md:px-4")} key={invoice.id}>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">
                            {invoice.subject}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.number} · {shortDate(invoice.issued)}
                          </p>
                        </div>
                        <div className="shrink-0 space-y-1 text-end">
                          <p className="font-semibold tabular-nums">
                            {formatAmount(invoiceTotal(invoice))}
                          </p>
                          <StatusPill tone={invoiceStatus[invoice.status].tone}>
                            {invoiceStatus[invoice.status].label}
                          </StatusPill>
                        </div>
                      </li>
                    ))}
                  </ul>
                </SheetSection>
              )}

              <SheetSection title="Notes internes">
                <Textarea
                  aria-label="Notes internes"
                  placeholder="Préférences, comportement, consignes particulières…"
                />
              </SheetSection>
            </SheetPanel>
            <SheetFooter>
              <Button render={<Link href="/messages" />} variant="outline">
                <HugeiconsIcon icon={Message01Icon} />
                Écrire
              </Button>
              <NewStayDialog
                defaultClient={client.name}
                trigger={
                  <Button>
                    <HugeiconsIcon icon={Calendar03Icon} />
                    Nouveau séjour
                  </Button>
                }
              />
            </SheetFooter>
          </>
        )}
      </SheetPopup>
    </Sheet>
  )
}

type ActivityFilter = Activity | "all"
type View = "clients" | "pets"

export function ClientsView() {
  const [view, setView] = useState<View>("clients")
  const [activity, setActivity] = useState<ActivityFilter>("all")
  const [query, setQuery] = useState("")
  const [openName, setOpenName] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [added, setAdded] = useState<Client[]>([])
  const [reminded, setReminded] = useState<string[]>([])
  const list = [...added, ...clients]

  const q = query.trim().toLowerCase()
  const scoped = list.filter(
    (c) => activity === "all" || c.activities.includes(activity)
  )
  const rows = scoped
    .filter(
      (c) =>
        !q ||
        `${c.name} ${c.email} ${c.city} ${c.pets.map((p) => `${p.name} ${p.breed}`).join(" ")}`
          .toLowerCase()
          .includes(q)
    )
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
  const pets = rows.flatMap((c) =>
    c.pets
      .filter((p) => activity === "all" || p.activities.includes(activity))
      .map((p) => ({ ...p, owner: c }))
  )
  const letters = [...new Set(rows.map(letterOf))]
  const debtors = scoped
    .filter((c) => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
  const open = (name: string) => {
    setOpenName(name)
    setSheetOpen(true)
  }

  return (
    <PageShell
      actions={
        <>
          <Button className="max-sm:hidden" variant="secondary">
            <HugeiconsIcon icon={Upload04Icon} />
            Importer
          </Button>
          <NewClientDialog
            onCreate={(client) => setAdded((l) => [client, ...l])}
            trigger={
              <Button>
                <HugeiconsIcon icon={UserAdd01Icon} />
                Nouveau client
              </Button>
            }
          />
        </>
      }
      title="Clients & animaux"
    >
      <FilterChips
        label="Activité"
        onChange={setActivity}
        options={activityChips}
        value={activity}
      />

      <Section count={debtors.length || undefined} title="À traiter">
        <AttentionList
          empty="Aucun solde à régler"
          items={debtors.map((c) => ({
            actions: reminded.includes(c.name) ? (
              <span className="flex h-10 items-center gap-2 px-2 font-semibold text-muted-foreground">
                <HugeiconsIcon className="size-5" icon={Tick02Icon} />
                Relance envoyée
              </span>
            ) : (
              <>
                <Button
                  className="bg-background"
                  render={<Link href={clientHref(c.name)} />}
                  variant="outline"
                >
                  Voir la fiche
                </Button>
                <Button onClick={() => setReminded((l) => [...l, c.name])}>
                  <HugeiconsIcon icon={MailSend01Icon} />
                  Relancer
                </Button>
              </>
            ),
            detail: `${c.pets.map((p) => p.name).join(", ")} · ${visitOf(c)}`,
            icon: EuroCircleIcon,
            id: c.name,
            title: `${c.name} · ${formatAmount(c.balance)} à régler`,
            tone: "bg-destructive-soft",
          }))}
          limit={3}
        />
      </Section>

      <Section
        action={
          <SearchField
            className="w-full sm:w-72"
            label="Rechercher un client ou un animal"
            onChange={setQuery}
            placeholder="Nom, animal, race, ville…"
            value={query}
          />
        }
        count={view === "clients" ? rows.length : pets.length}
        title={view === "clients" ? "Vos clients" : "Leurs animaux"}
      >
        <FilterChips
          label="Afficher"
          onChange={setView}
          options={[
            { label: "Clients", value: "clients" },
            { label: "Animaux", value: "pets" },
          ]}
          value={view}
        />

        {rows.length === 0 ? (
          <p className="rounded-3xl bg-muted p-6 text-center font-semibold text-muted-foreground">
            Aucun client ne correspond à ces critères.
          </p>
        ) : view === "clients" ? (
          <div className="space-y-6">
            {letters.map((letter) => (
              <section className="space-y-2" key={letter}>
                <h3 className="px-1 font-display text-2xl text-muted-foreground">
                  {letter}
                </h3>
                <ul className={listCard}>
                  {rows
                    .filter((c) => letterOf(c) === letter)
                    .map((c) => (
                      <li key={c.name}>
                        <Link
                          className={cn(
                            listRow,
                            "transition-colors hover:bg-background/50"
                          )}
                          href={clientHref(c.name)}
                          onClick={(e) => {
                            /* Un client créé à l'instant n'a pas encore de fiche : on ouvre le panneau */
                            if (clientHref(c.name) !== "/clients") return
                            e.preventDefault()
                            open(c.name)
                          }}
                        >
                          <Monogram
                            text={c.initials}
                            tone={toneOf(c.activities)}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 font-semibold">
                              <span className="truncate">{c.name}</span>
                              {c.tags.slice(0, 1).map((tag) => (
                                <StatusPill
                                  key={tag}
                                  tone={tagTone[tag] ?? "bg-background"}
                                >
                                  {tag}
                                </StatusPill>
                              ))}
                            </span>
                            <span className="block truncate text-sm text-muted-foreground">
                              {[c.pets.map((p) => p.name).join(", "), c.city]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          <span className="flex shrink-0 gap-1 max-sm:hidden">
                            {c.activities.map((a) => (
                              <ActivityMark
                                activity={a}
                                className="size-6"
                                key={a}
                              />
                            ))}
                          </span>
                          <span className="w-40 shrink-0 text-end">
                            {c.balance > 0 && (
                              <span className="block font-semibold text-destructive-foreground tabular-nums">
                                {formatAmount(c.balance)} dus
                              </span>
                            )}
                            <span className="block text-sm text-muted-foreground">
                              {visitOf(c)}
                            </span>
                          </span>
                          <HugeiconsIcon
                            className="size-5 shrink-0 text-muted-foreground"
                            icon={ArrowRight01Icon}
                          />
                        </Link>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <Link
                className="flex flex-col gap-4 rounded-3xl bg-muted p-5 transition-colors hover:bg-neutral-hover"
                href={petHref(pet.name, pet.owner.name)}
                key={`${pet.owner.name}-${pet.name}`}
              >
                <div className="flex items-center gap-3">
                  <Monogram
                    className="size-12"
                    text={pet.name.slice(0, 2)}
                    tone={toneOf(pet.activities)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold">{pet.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {pet.breed || pet.species}
                    </p>
                  </div>
                  <StatusPill tone="bg-background">{pet.species}</StatusPill>
                </div>
                {pet.care && (
                  <p className="rounded-2xl bg-warning-soft px-3 py-2 text-sm font-semibold">
                    {pet.care}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span className="truncate">{pet.owner.name}</span>
                  <span className="flex gap-1">
                    {pet.activities.map((a) => (
                      <ActivityMark
                        activity={a}
                        className="size-5 text-[0.625rem]"
                        key={a}
                      />
                    ))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <ClientSheet
        client={list.find((c) => c.name === openName) ?? null}
        onOpenChange={setSheetOpen}
        open={sheetOpen}
      />
    </PageShell>
  )
}
