"use client"

import { NewSessionDialog } from "@/components/training/new-session-dialog"
import { NewAppointmentDialog } from "@/components/grooming/new-appointment-dialog"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import {
  Calendar03Icon,
  CalendarAdd01Icon,
  Cancel01Icon,
  MoreHorizontalIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useState } from "react"
import {
  type Activity,
  ActivityMark,
  activityMeta,
} from "@/components/activity-mark"
import { relativeDate, shortDate } from "@/components/calendar"
import {
  type Reservation,
  type ReservationStatus,
  reservations as initialReservations,
} from "@/components/reservations/data"
import { activityIcons } from "@/components/site/site-ui"
import {
  activityChips,
  AttentionList,
  FilterChips,
  formatAmount,
  formatHour,
  listCard,
  listRow,
  Monogram,
  PageShell,
  SearchField,
  Section,
  StatusPill,
} from "@/components/today/widgets"
import { Button } from "@/components/ui/button"
import {
  Menu,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"

export const reservationStatus: Record<
  ReservationStatus,
  {
    label: string
    variant: "warning" | "info" | "success" | "secondary" | "error"
    tone: string
  }
> = {
  cancelled: {
    label: "Annulée",
    tone: "bg-destructive-soft",
    variant: "error",
  },
  confirmed: { label: "Confirmée", tone: "bg-info-soft", variant: "info" },
  done: {
    label: "Terminée",
    tone: "bg-background text-muted-foreground",
    variant: "secondary",
  },
  ongoing: { label: "En cours", tone: "bg-success-soft", variant: "success" },
  pending: {
    label: "À confirmer",
    tone: "bg-warning-soft",
    variant: "warning",
  },
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

/** Réservations groupées par jour, comme les transactions de Wise. */
const byDay = (list: Reservation[], latestFirst: boolean) => {
  const days = new Map<number, Reservation[]>()
  for (const r of [...list].sort((a, b) =>
    latestFirst ? b.start - a.start : a.start - b.start
  )) {
    days.set(r.start, [...(days.get(r.start) ?? []), r])
  }
  return [...days]
}

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
  const q = query.trim().toLowerCase()
  const rows = scoped
    .filter((r) => status === "all" || r.status === status)
    .filter(
      (r) =>
        !q ||
        `${r.pet} ${r.owner} ${r.title} ${r.breed}`.toLowerCase().includes(q)
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
          <NewSessionDialog
            trigger={
              <Button className="max-sm:hidden" variant="secondary">
                <ActivityMark
                  activity="Éducation"
                  className="size-5 text-[0.625rem]"
                />
                Séance
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
      title="Réservations"
    >
      <FilterChips
        label="Activité"
        onChange={setActivity}
        options={activityChips}
        value={activity}
      />

      <Section count={pending.length || undefined} title="À traiter">
        <AttentionList
          empty="Toutes les demandes sont traitées"
          items={pending.map((r) => ({
            actions: (
              <>
                <Button
                  className="bg-background"
                  onClick={() => setStatusOf(r.id, "cancelled")}
                  variant="outline"
                >
                  Refuser
                </Button>
                <Button onClick={() => setStatusOf(r.id, "confirmed")}>
                  Accepter
                </Button>
              </>
            ),
            detail: [
              r.title,
              reservationDate(r),
              r.amount !== undefined ? formatAmount(r.amount) : undefined,
            ]
              .filter(Boolean)
              .join(" · "),
            icon: activityIcons[r.activity],
            id: r.id,
            title: (
              <>
                {r.pet}{" "}
                <span className="font-normal text-muted-foreground">
                  · {r.owner}
                </span>
              </>
            ),
            tone: activityMeta[r.activity].tint,
          }))}
          limit={3}
        />
      </Section>

      <Section
        action={
          <SearchField
            className="w-full sm:w-72"
            label="Rechercher une réservation"
            onChange={setQuery}
            placeholder="Animal, client, prestation…"
            value={query}
          />
        }
        title="Toutes les réservations"
      >
        <FilterChips
          label="Statut"
          onChange={setStatus}
          options={statusFilters.map((f) => ({ ...f, count: count(f.value) }))}
          value={status}
        />
        {rows.length === 0 ? (
          <p className="rounded-3xl bg-muted p-6 text-center font-semibold text-muted-foreground">
            Aucune réservation ne correspond à ces critères.
          </p>
        ) : (
          <div className="space-y-6">
            {byDay(rows, status === "done" || status === "cancelled").map(
              ([day, items]) => (
                <section className="space-y-2" key={day}>
                  <h3 className="px-1 font-semibold text-muted-foreground">
                    {relativeDate(day)}
                  </h3>
                  <ul className={listCard}>
                    {items.map((r) => (
                      <li className={listRow} key={r.id}>
                        <Monogram
                          text={r.pet.slice(0, 2)}
                          tone={activityMeta[r.activity].tint}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">
                            {r.pet}
                            <span className="font-normal text-muted-foreground">
                              {" "}
                              · {r.owner}
                            </span>
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {[
                              r.title,
                              r.detail,
                              r.end !== undefined
                                ? `${shortDate(r.start)} → ${shortDate(r.end)}`
                                : r.hour !== undefined
                                  ? formatHour(r.hour)
                                  : undefined,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <div className="shrink-0 space-y-1 text-end">
                          <p className="font-semibold tabular-nums">
                            {r.amount !== undefined
                              ? formatAmount(r.amount)
                              : "Forfait"}
                          </p>
                          <StatusPill tone={reservationStatus[r.status].tone}>
                            {reservationStatus[r.status].label}
                          </StatusPill>
                        </div>
                        {r.status === "pending" && (
                          <Button
                            className="max-sm:hidden"
                            onClick={() => setStatusOf(r.id, "confirmed")}
                            size="sm"
                          >
                            Confirmer
                          </Button>
                        )}
                        <Menu>
                          <MenuTrigger
                            render={
                              <Button
                                aria-label="Actions"
                                size="icon-sm"
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
                                  {r.status === "pending"
                                    ? "Refuser"
                                    : "Annuler"}
                                </MenuItem>
                              </>
                            )}
                          </MenuPopup>
                        </Menu>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            )}
          </div>
        )}
      </Section>
    </PageShell>
  )
}
