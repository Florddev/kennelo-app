"use client"

import {
  ArrowRight01Icon,
  Alert02Icon,
  Call02Icon,
  Calendar03Icon,
  EuroCircleIcon,
  Location01Icon,
  Mail01Icon,
  Message01Icon,
  PawPrintIcon,
  Search01Icon,
  Upload04Icon,
  UserAdd01Icon,
  UsersIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { type ReactNode, useState } from "react"
import {
  type Activity,
  ActivityMark,
  activityNames,
} from "@/components/activity-mark"
import { relativeDate, shortDate } from "@/components/calendar"
import { type Client, clients } from "@/components/clients/data"
import { NewClientDialog } from "@/components/clients/new-client-dialog"
import { invoiceTotal } from "@/components/invoices/data"
import {
  reservationDate,
  reservationStatus,
} from "@/components/reservations/reservations-view"
import { formatAmount, Kpi, PageShell } from "@/components/today/widgets"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import { petHref } from "@/components/pets/data"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const tagVariant: Record<string, "success" | "error" | "info" | "secondary"> = {
  "En séjour": "success",
  Fidèle: "secondary",
  Impayé: "error",
  Nouveau: "info",
}

const invoiceStatus = {
  draft: { label: "Brouillon", variant: "secondary" },
  overdue: { label: "En retard", variant: "error" },
  paid: { label: "Payée", variant: "success" },
  pending: { label: "À encaisser", variant: "warning" },
} as const

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
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
                <Avatar className="size-11">
                  <AvatarFallback>{client.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle>{client.name}</SheetTitle>
                  <SheetDescription>
                    Client depuis {client.since} · {client.city}
                  </SheetDescription>
                </div>
              </div>
              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {client.tags.map((tag) => (
                    <Badge key={tag} variant={tagVariant[tag]}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </SheetHeader>
            <SheetPanel className="space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p className="flex items-center gap-2">
                  <HugeiconsIcon
                    className="size-4 text-muted-foreground"
                    icon={Call02Icon}
                  />
                  {client.phone}
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <HugeiconsIcon
                    className="size-4 shrink-0 text-muted-foreground"
                    icon={Mail01Icon}
                  />
                  <span className="truncate">{client.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <HugeiconsIcon
                    className="size-4 text-muted-foreground"
                    icon={Location01Icon}
                  />
                  {client.city}
                </p>
                <p className="flex items-center gap-2">
                  <HugeiconsIcon
                    className="size-4 text-muted-foreground"
                    icon={EuroCircleIcon}
                  />
                  {formatAmount(client.spent)} réglés
                </p>
              </div>

              {client.balance > 0 && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
                  <HugeiconsIcon
                    className="size-4 text-destructive-foreground"
                    icon={Alert02Icon}
                  />
                  Solde à régler :{" "}
                  <span className="font-semibold">
                    {formatAmount(client.balance)}
                  </span>
                </div>
              )}

              <Section title={`Animaux · ${client.pets.length}`}>
                <ul className="space-y-2">
                  {client.pets.map((pet) => (
                    <li key={pet.name}>
                      <Link
                        className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent/40"
                        href={petHref(pet.name, client.name)}
                      >
                        <Avatar className="size-9">
                          <AvatarFallback className="text-sm">
                            {pet.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{pet.name}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {pet.species}
                            {pet.breed && ` · ${pet.breed}`}
                            {pet.care && ` · ${pet.care}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {pet.activities.map((a) => (
                            <ActivityMark activity={a} key={a} />
                          ))}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Historique">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucune réservation récente.
                  </p>
                ) : (
                  <ul className="divide-y rounded-xl border">
                    {history.map((r) => (
                      <li
                        className="flex items-center gap-3 px-3 py-2.5"
                        key={r.id}
                      >
                        <ActivityMark activity={r.activity} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">
                            {r.pet} · {r.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reservationDate(r)}
                          </p>
                        </div>
                        <Badge variant={reservationStatus[r.status].variant}>
                          {reservationStatus[r.status].label}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {client.invoices.length > 0 && (
                <Section title="Factures">
                  <ul className="divide-y rounded-xl border">
                    {client.invoices.map((invoice) => (
                      <li
                        className="flex items-center gap-3 px-3 py-2.5"
                        key={invoice.id}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{invoice.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.number} · {shortDate(invoice.issued)}
                          </p>
                        </div>
                        <span className="text-sm tabular-nums">
                          {formatAmount(invoiceTotal(invoice))}
                        </span>
                        <Badge variant={invoiceStatus[invoice.status].variant}>
                          {invoiceStatus[invoice.status].label}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section title="Notes internes">
                <Textarea
                  aria-label="Notes internes"
                  placeholder="Préférences, comportement, consignes particulières…"
                />
              </Section>
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

export function ClientsView() {
  const [view, setView] = useState("clients")
  const [activity, setActivity] = useState<ActivityFilter>("all")
  const [query, setQuery] = useState("")
  const [openName, setOpenName] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [added, setAdded] = useState<Client[]>([])
  const list = [...added, ...clients]

  const q = query.trim().toLowerCase()
  const scoped = list.filter(
    (c) => activity === "all" || c.activities.includes(activity)
  )
  const rows = scoped.filter(
    (c) =>
      !q ||
      `${c.name} ${c.email} ${c.city} ${c.pets.map((p) => `${p.name} ${p.breed}`).join(" ")}`
        .toLowerCase()
        .includes(q)
  )
  const pets = rows.flatMap((c) =>
    c.pets
      .filter((p) => activity === "all" || p.activities.includes(activity))
      .map((p) => ({ ...p, owner: c }))
  )
  const allPets = scoped.flatMap((c) => c.pets)
  const balance = scoped.reduce((s, c) => s + c.balance, 0)
  const open = (name: string) => {
    setOpenName(name)
    setSheetOpen(true)
  }

  return (
    <PageShell
      actions={
        <>
          <Button className="max-sm:hidden" variant="outline">
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
      icon={UsersIcon}
      title="Clients & animaux"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={UsersIcon} label="Clients" value={scoped.length}>
          {scoped.filter((c) => c.nextVisit !== undefined).length} avec une
          visite à venir
        </Kpi>
        <Kpi icon={PawPrintIcon} label="Animaux" value={allPets.length}>
          {allPets.filter((p) => p.species === "Chien").length} chiens ·{" "}
          {allPets.filter((p) => p.species === "Chat").length} chats
        </Kpi>
        <Kpi
          icon={UserAdd01Icon}
          label="Nouveaux en 2026"
          value={scoped.filter((c) => c.since === 2026).length}
        >
          {scoped.filter((c) => c.activities.length > 1).length} clients
          multi-activités
        </Kpi>
        <Kpi
          icon={EuroCircleIcon}
          label="Soldes à régler"
          value={
            <span className={cn(balance > 0 && "text-destructive-foreground")}>
              {formatAmount(balance)}
            </span>
          }
        >
          {scoped.filter((c) => c.balance > 0).length} clients concernés
        </Kpi>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs onValueChange={(value) => setView(String(value))} value={view}>
          <TabsList size="sm">
            <TabsTab value="clients">Clients</TabsTab>
            <TabsTab value="pets">Animaux</TabsTab>
          </TabsList>
        </Tabs>
        <Tabs
          onValueChange={(value) => setActivity(value as ActivityFilter)}
          value={activity}
        >
          <TabsList size="sm">
            <TabsTab value="all">Toutes</TabsTab>
            {activityNames.map((name) => (
              <TabsTab className="gap-1.5" key={name} value={name}>
                <ActivityMark
                  activity={name}
                  className="size-4 text-[0.5rem]"
                />
                {name}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="ms-auto w-full sm:w-64">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Rechercher un client ou un animal"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, animal, race, ville…"
            value={query}
          />
        </InputGroup>
      </div>

      {rows.length === 0 ? (
        <Empty className="rounded-xl border">
          <EmptyHeader>
            <EmptyTitle>Aucun résultat</EmptyTitle>
            <EmptyDescription>
              Aucun client ne correspond à ces critères.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === "clients" ? (
        <ul className="-mx-3">
          {rows.map((c) => (
            <li key={c.name}>
              <button
                className="flex w-full items-center gap-4 rounded-2xl p-3 text-start transition-colors hover:bg-accent"
                onClick={() => open(c.name)}
                type="button"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {c.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="truncate">{c.name}</span>
                    {c.tags.slice(0, 1).map((tag) => (
                      <Badge key={tag} variant={tagVariant[tag]}>
                        {tag}
                      </Badge>
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
                    <ActivityMark activity={a} className="size-6" key={a} />
                  ))}
                </span>
                <span className="w-28 shrink-0 text-end">
                  {c.balance > 0 ? (
                    <span className="block font-semibold text-destructive-foreground tabular-nums">
                      {formatAmount(c.balance)} dus
                    </span>
                  ) : null}
                  <span className="block text-sm text-muted-foreground">
                    {c.nextVisit !== undefined
                      ? `Revient ${relativeDate(c.nextVisit).toLowerCase()}`
                      : c.lastVisit !== undefined
                        ? `Venu ${relativeDate(c.lastVisit).toLowerCase()}`
                        : "Jamais venu"}
                  </span>
                </span>
                <HugeiconsIcon
                  className="size-5 shrink-0 text-muted-foreground"
                  icon={ArrowRight01Icon}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Link
              className="flex flex-col gap-4 rounded-2xl border bg-card p-5 text-start transition-colors hover:bg-accent"
              href={petHref(pet.name, pet.owner.name)}
              key={`${pet.owner.name}-${pet.name}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {pet.name.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{pet.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {pet.breed || pet.species}
                  </p>
                </div>
                <Badge variant="outline">{pet.species}</Badge>
              </div>
              {pet.care && (
                <p className="rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning-foreground">
                  {pet.care}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <span className="truncate">{pet.owner.name}</span>
                <span className="flex gap-1">
                  {pet.activities.map((a) => (
                    <ActivityMark
                      activity={a}
                      className="size-4 text-[0.5rem]"
                      key={a}
                    />
                  ))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ClientSheet
        client={list.find((c) => c.name === openName) ?? null}
        onOpenChange={setSheetOpen}
        open={sheetOpen}
      />
    </PageShell>
  )
}
