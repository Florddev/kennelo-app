"use client"

import { NewAppointmentDialog } from "@/components/grooming/new-appointment-dialog"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import {
  Calendar03Icon,
  CalendarAdd01Icon,
  Cancel01Icon,
  ClipboardListIcon,
  Clock01Icon,
  EuroCircleIcon,
  MoreHorizontalIcon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import {
  type Activity,
  ActivityMark,
  activityNames,
} from "@/components/activity-mark"
import { relativeDate, shortDate, TODAY } from "@/components/calendar"
import {
  type Reservation,
  type ReservationStatus,
  reservations as initialReservations,
} from "@/components/reservations/data"
import {
  Bar,
  formatAmount,
  formatHour,
  Kpi,
  PageShell,
  Widget,
} from "@/components/today/widgets"
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
  Menu,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export const reservationStatus: Record<
  ReservationStatus,
  {
    label: string
    variant: "warning" | "info" | "success" | "secondary" | "error"
  }
> = {
  cancelled: { label: "Annulée", variant: "error" },
  confirmed: { label: "Confirmée", variant: "info" },
  done: { label: "Terminée", variant: "secondary" },
  ongoing: { label: "En cours", variant: "success" },
  pending: { label: "À confirmer", variant: "warning" },
}

export const activityHref: Record<Activity, string> = {
  Pension: "/pension/stays",
  Toilettage: "/grooming/appointments",
  Éducation: "/training/sessions",
}

export const reservationDate = (r: Reservation) =>
  r.end !== undefined
    ? `${shortDate(r.start)} → ${shortDate(r.end)}`
    : `${relativeDate(r.start)}${r.hour !== undefined ? ` · ${formatHour(r.hour)}` : ""}`

type ActivityFilter = Activity | "all"
type StatusFilter = ReservationStatus | "all"

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: "À venir", value: "confirmed" },
  { label: "À confirmer", value: "pending" },
  { label: "En cours", value: "ongoing" },
  { label: "Passées", value: "done" },
  { label: "Annulées", value: "cancelled" },
  { label: "Toutes", value: "all" },
]

const sum = (list: Reservation[]) =>
  list.reduce((total, r) => total + (r.amount ?? 0), 0)

export function ReservationsView() {
  const [list, setList] = useState(initialReservations)
  const [activity, setActivity] = useState<ActivityFilter>("all")
  const [status, setStatus] = useState<StatusFilter>("confirmed")
  const [query, setQuery] = useState("")

  const scoped = list.filter(
    (r) => activity === "all" || r.activity === activity
  )
  const count = (value: StatusFilter) =>
    value === "all"
      ? scoped.length
      : scoped.filter((r) => r.status === value).length
  const pending = scoped.filter((r) => r.status === "pending")
  const today = scoped.filter(
    (r) => r.status !== "cancelled" && (r.start === TODAY || r.end === TODAY)
  )
  const week = scoped.filter(
    (r) => r.status !== "cancelled" && r.start >= 0 && r.start <= 6
  )
  const booked = scoped.filter(
    (r) => r.status === "confirmed" || r.status === "ongoing"
  )
  const cancelled = scoped.filter((r) => r.status === "cancelled")
  const q = query.trim().toLowerCase()
  const rows = scoped
    .filter((r) => status === "all" || r.status === status)
    .filter(
      (r) =>
        !q ||
        `${r.pet} ${r.owner} ${r.title} ${r.breed}`.toLowerCase().includes(q)
    )
  const sources = ["En ligne", "Téléphone", "Messages", "Sur place"].map(
    (source) => ({
      count: scoped.filter((r) => r.source === source).length,
      source,
    })
  )

  const setStatusOf = (id: string, next: ReservationStatus) =>
    setList((items) =>
      items.map((r) => (r.id === id ? { ...r, status: next } : r))
    )

  return (
    <PageShell
      actions={
        <>
          <NewAppointmentDialog
            trigger={
              <Button variant="secondary">
                <ActivityMark
                  activity="Toilettage"
                  className="size-5 text-[0.625rem]"
                />
                Rendez-vous
              </Button>
            }
          />
          <NewStayDialog
            trigger={
              <Button>
                <HugeiconsIcon icon={CalendarAdd01Icon} />
                Nouveau séjour
              </Button>
            }
          />
        </>
      }
      icon={ClipboardListIcon}
      title="Réservations"
    >
      <Tabs
        onValueChange={(value) => setActivity(value as ActivityFilter)}
        value={activity}
      >
        <TabsList>
          <TabsTab value="all">Toutes les activités</TabsTab>
          {activityNames.map((name) => (
            <TabsTab className="gap-1.5" key={name} value={name}>
              <ActivityMark activity={name} className="size-4 text-[0.5rem]" />
              {name}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Clock01Icon} label="À confirmer" value={pending.length}>
          Demandes en attente de réponse
        </Kpi>
        <Kpi icon={Calendar03Icon} label="Aujourd'hui" value={today.length}>
          Arrivées, départs et rendez-vous
        </Kpi>
        <Kpi icon={ClipboardListIcon} label="Cette semaine" value={week.length}>
          Du lundi 19 au dimanche 25 oct.
        </Kpi>
        <Kpi
          icon={EuroCircleIcon}
          label="Montant réservé"
          value={formatAmount(sum(booked))}
        >
          {cancelled.length} annulation{cancelled.length > 1 && "s"} ·{" "}
          {Math.round((cancelled.length / Math.max(1, scoped.length)) * 100)} %
        </Kpi>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Widget
          className="lg:col-span-2"
          description="Demandes reçues en ligne, par téléphone ou par message"
          title="À confirmer"
        >
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Toutes les demandes sont traitées 🎉
            </p>
          ) : (
            <ul className="divide-y">
              {pending.map((r) => (
                <li
                  className="flex flex-wrap items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                  key={r.id}
                >
                  <ActivityMark activity={r.activity} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {r.pet}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {r.owner}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.title} · {reservationDate(r)}
                    </p>
                  </div>
                  {r.amount !== undefined && (
                    <span className="text-sm tabular-nums">
                      {formatAmount(r.amount)}
                    </span>
                  )}
                  <div className="flex gap-1.5">
                    <Button
                      onClick={() => setStatusOf(r.id, "cancelled")}
                      size="xs"
                      variant="ghost"
                    >
                      Refuser
                    </Button>
                    <Button
                      onClick={() => setStatusOf(r.id, "confirmed")}
                      size="xs"
                    >
                      <HugeiconsIcon icon={Tick02Icon} />
                      Accepter
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Widget>
        <Widget description="Origine des réservations" title="Canaux">
          <ul className="space-y-3">
            {sources.map(({ source, count: n }) => (
              <li className="space-y-1.5" key={source}>
                <div className="flex justify-between text-sm">
                  <span>{source}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {n} · {Math.round((n / Math.max(1, scoped.length)) * 100)} %
                  </span>
                </div>
                <Bar
                  className="bg-foreground/70"
                  label={source}
                  value={(n / Math.max(1, scoped.length)) * 100}
                />
              </li>
            ))}
          </ul>
        </Widget>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          onValueChange={(value) => setStatus(value as StatusFilter)}
          value={status}
        >
          <TabsList size="sm">
            {statusFilters.map((f) => (
              <TabsTab className="gap-1.5" key={f.value} value={f.value}>
                {f.label}
                <span className="text-muted-foreground tabular-nums">
                  {count(f.value)}
                </span>
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
        <InputGroup className="ms-auto w-full sm:w-64">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Rechercher une réservation"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Animal, client, prestation…"
            value={query}
          />
        </InputGroup>
      </div>

      {rows.length === 0 ? (
        <Empty className="rounded-xl border">
          <EmptyHeader>
            <EmptyTitle>Aucune réservation</EmptyTitle>
            <EmptyDescription>
              Aucune réservation ne correspond à ces critères.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <CardFrame className="overflow-x-auto">
          <Table variant="card">
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Activité</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="max-lg:hidden">Canal</TableHead>
                <TableHead className="text-end">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {r.pet.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{r.pet}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.owner}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ActivityMark activity={r.activity} />
                      <div>
                        <p>{r.title}</p>
                        {r.detail && (
                          <p className="text-xs text-muted-foreground">
                            {r.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={cn(r.start === TODAY && "font-medium")}>
                    {reservationDate(r)}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-lg:hidden">
                    {r.source}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {r.amount !== undefined ? (
                      formatAmount(r.amount)
                    ) : (
                      <span className="text-muted-foreground">Forfait</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={reservationStatus[r.status].variant}>
                      {reservationStatus[r.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Menu>
                      <MenuTrigger
                        render={
                          <Button
                            aria-label="Actions"
                            size="icon-xs"
                            variant="ghost"
                          />
                        }
                      >
                        <HugeiconsIcon icon={MoreHorizontalIcon} />
                      </MenuTrigger>
                      <MenuPopup align="end">
                        <MenuLinkItem
                          render={<Link href={activityHref[r.activity]} />}
                        >
                          <HugeiconsIcon icon={Calendar03Icon} />
                          Ouvrir dans {r.activity}
                        </MenuLinkItem>
                        {r.status === "pending" && (
                          <MenuItem
                            onClick={() => setStatusOf(r.id, "confirmed")}
                          >
                            <HugeiconsIcon icon={Tick02Icon} />
                            Confirmer
                          </MenuItem>
                        )}
                        {(r.status === "pending" ||
                          r.status === "confirmed") && (
                          <>
                            <MenuSeparator />
                            <MenuItem
                              onClick={() => setStatusOf(r.id, "cancelled")}
                              variant="destructive"
                            >
                              <HugeiconsIcon icon={Cancel01Icon} />
                              {r.status === "pending" ? "Refuser" : "Annuler"}
                            </MenuItem>
                          </>
                        )}
                      </MenuPopup>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardFrame>
      )}
    </PageShell>
  )
}
