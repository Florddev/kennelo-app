"use client"

import {
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
import { invoiceTotal } from "@/components/invoices/data"
import {
  reservationDate,
  reservationStatus,
} from "@/components/reservations/reservations-view"
import { formatAmount, Kpi, PageShell } from "@/components/today/widgets"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardFrame } from "@/components/ui/card"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
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
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
                  <HugeiconsIcon
                    className="size-4 text-destructive-foreground"
                    icon={Alert02Icon}
                  />
                  Solde à régler :{" "}
                  <span className="font-medium">
                    {formatAmount(client.balance)}
                  </span>
                </div>
              )}

              <Section title={`Animaux · ${client.pets.length}`}>
                <ul className="space-y-2">
                  {client.pets.map((pet) => (
                    <li
                      className="flex items-center gap-3 rounded-lg border p-3"
                      key={pet.name}
                    >
                      <Avatar className="size-9">
                        <AvatarFallback className="text-xs">
                          {pet.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{pet.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
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
                  <ul className="divide-y rounded-lg border">
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
                          <p className="text-xs text-muted-foreground">
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
                  <ul className="divide-y rounded-lg border">
                    {client.invoices.map((invoice) => (
                      <li
                        className="flex items-center gap-3 px-3 py-2.5"
                        key={invoice.id}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{invoice.subject}</p>
                          <p className="text-xs text-muted-foreground">
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
              <Button render={<Link href="/reservations" />}>
                <HugeiconsIcon icon={Calendar03Icon} />
                Nouvelle réservation
              </Button>
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

  const q = query.trim().toLowerCase()
  const scoped = clients.filter(
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
          <Button className="max-sm:hidden" size="sm" variant="outline">
            <HugeiconsIcon icon={Upload04Icon} />
            Importer
          </Button>
          <Button size="sm">
            <HugeiconsIcon icon={UserAdd01Icon} />
            Nouveau client
          </Button>
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
        <CardFrame className="overflow-x-auto">
          <Table variant="card">
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Animaux</TableHead>
                <TableHead className="max-md:hidden">Activités</TableHead>
                <TableHead className="max-lg:hidden">Dernière visite</TableHead>
                <TableHead>Prochaine visite</TableHead>
                <TableHead className="text-end">Solde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow
                  className="cursor-pointer"
                  key={c.name}
                  onClick={() => open(c.name)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {c.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="flex items-center gap-1.5 font-medium">
                          {c.name}
                          {c.tags.slice(0, 1).map((tag) => (
                            <Badge
                              key={tag}
                              size="sm"
                              variant={tagVariant[tag]}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.city}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.pets.map((p) => (
                        <Badge key={p.name} variant="outline">
                          {p.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-md:hidden">
                    <div className="flex gap-1">
                      {c.activities.map((a) => (
                        <ActivityMark activity={a} key={a} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-lg:hidden">
                    {c.lastVisit !== undefined
                      ? relativeDate(c.lastVisit)
                      : "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      c.nextVisit === undefined && "text-muted-foreground"
                    )}
                  >
                    {c.nextVisit !== undefined
                      ? relativeDate(c.nextVisit)
                      : "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-end tabular-nums",
                      c.balance > 0
                        ? "font-medium text-destructive-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {c.balance > 0 ? formatAmount(c.balance) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardFrame>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <button
              className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-start transition-colors hover:bg-accent/40"
              key={`${pet.owner.name}-${pet.name}`}
              onClick={() => open(pet.owner.name)}
              type="button"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{pet.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{pet.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {pet.breed || pet.species}
                  </p>
                </div>
                <Badge variant="outline">{pet.species}</Badge>
              </div>
              {pet.care && (
                <p className="rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-800 dark:text-amber-300">
                  {pet.care}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
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
            </button>
          ))}
        </div>
      )}

      <ClientSheet
        client={clients.find((c) => c.name === openName) ?? null}
        onOpenChange={setSheetOpen}
        open={sheetOpen}
      />
    </PageShell>
  )
}
