"use client"

import {
  BedDoubleIcon,
  CalendarAdd01Icon,
  Clock01Icon,
  EuroCircleIcon,
  Moon02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { shortDate, TODAY } from "@/components/calendar"
import {
  type Stay,
  type StayStatus,
  stayAmount,
  stayProgress,
  stays as initialStays,
} from "@/components/pension/data"
import {
  kennelLabel,
  paymentMeta,
  StaySheet,
  stayStatusMeta,
} from "@/components/pension/stay-sheet"
import {
  ActivityPage,
  Bar,
  formatAmount,
  Kpi,
} from "@/components/today/widgets"
import { Badge } from "@/components/ui/badge"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
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
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type Filter = StayStatus | "all"

const filters: { value: Filter; label: string }[] = [
  { label: "En cours", value: "ongoing" },
  { label: "À venir", value: "upcoming" },
  { label: "À confirmer", value: "pending" },
  { label: "Terminés", value: "done" },
  { label: "Tous", value: "all" },
]

// October runs from offset -18 (1 Oct.) to offset 12 (31 Oct.).
const octoberNights = (s: Stay) =>
  Math.max(0, Math.min(s.departure, 13) - Math.max(s.arrival, -18))

const sortKey = (s: Stay) =>
  s.status === "done"
    ? -s.departure
    : s.status === "ongoing"
      ? s.departure
      : s.arrival

export function StaysView() {
  const [stays, setStays] = useState(initialStays)
  const [filter, setFilter] = useState<Filter>("ongoing")
  const [query, setQuery] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const count = (value: Filter) =>
    value === "all"
      ? stays.length
      : stays.filter((s) => s.status === value).length
  const q = query.trim().toLowerCase()
  const rows = stays
    .filter((s) => filter === "all" || s.status === filter)
    .filter(
      (s) => !q || `${s.pet} ${s.owner} ${s.breed}`.toLowerCase().includes(q)
    )
    .sort((a, b) => sortKey(a) - sortKey(b))

  const booked = stays.filter((s) => s.status !== "pending")
  const nights = booked.reduce((sum, s) => sum + octoberNights(s), 0)
  const upcomingRevenue = booked
    .filter((s) => s.status !== "done")
    .reduce((sum, s) => sum + stayAmount(s), 0)
  const averageNights =
    booked.reduce((sum, s) => sum + s.departure - s.arrival, 0) / booked.length
  const openStay = stays.find((s) => s.id === openId) ?? null

  return (
    <ActivityPage
      actions={
        <NewStayDialog
          onCreate={(stay) => setStays((list) => [...list, stay])}
          trigger={
            <Button>
              <HugeiconsIcon icon={CalendarAdd01Icon} />
              Nouveau séjour
            </Button>
          }
        />
      }
      activity="Pension"
      title="Séjours"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={BedDoubleIcon} label="En cours" value={count("ongoing")}>
          {
            stays.filter((s) => s.departure === TODAY && s.status === "ongoing")
              .length
          }{" "}
          départs aujourd&apos;hui
        </Kpi>
        <Kpi icon={Clock01Icon} label="À confirmer" value={count("pending")}>
          Demandes en attente de réponse
        </Kpi>
        <Kpi icon={Moon02Icon} label="Nuitées en octobre" value={nights}>
          Durée moyenne {averageNights.toFixed(1).replace(".", ",")} nuits
        </Kpi>
        <Kpi
          icon={EuroCircleIcon}
          label="À facturer"
          value={formatAmount(upcomingRevenue)}
        >
          Séjours en cours et à venir
        </Kpi>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          onValueChange={(value) => setFilter(value as Filter)}
          value={filter}
        >
          <TabsList>
            {filters.map((f) => (
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
            aria-label="Rechercher un séjour"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Animal, propriétaire, race…"
            value={query}
          />
        </InputGroup>
      </div>

      {rows.length === 0 ? (
        <Empty className="rounded-xl border">
          <EmptyHeader>
            <EmptyTitle>Aucun séjour</EmptyTitle>
            <EmptyDescription>
              Aucun séjour ne correspond à ces critères.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="-mx-3">
          {rows.map((s) => {
            const progress = stayProgress(s)
            return (
              <li key={s.id}>
                <button
                  className="flex w-full items-center gap-4 rounded-2xl p-3 text-start transition-colors hover:bg-accent"
                  onClick={() => {
                    setOpenId(s.id)
                    setSheetOpen(true)
                  }}
                  type="button"
                >
                  <span
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold",
                      s.status === "ongoing" &&
                        "bg-pension text-pension-foreground"
                    )}
                  >
                    {s.pet.slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block truncate font-semibold">
                      {s.pet}
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {s.owner}
                      </span>
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {shortDate(s.arrival)} → {shortDate(s.departure)} ·{" "}
                      {progress.nights} nuits ·{" "}
                      {s.kennelId ? kennelLabel(s.kennelId) : "À placer"}
                    </span>
                    {s.status === "ongoing" && (
                      <span className="block max-w-56">
                        <Bar
                          className="bg-pension-strong"
                          label={`Séjour de ${s.pet}`}
                          value={(progress.elapsed / progress.nights) * 100}
                        />
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 space-y-1 text-end">
                    <span className="block font-semibold tabular-nums">
                      {formatAmount(stayAmount(s))}
                    </span>
                    <span className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          paymentMeta[s.payment].dot
                        )}
                      />
                      {paymentMeta[s.payment].label}
                    </span>
                  </span>
                  <Badge
                    className="max-sm:hidden"
                    variant={
                      s.kennelId ? stayStatusMeta[s.status].variant : "warning"
                    }
                  >
                    {!s.kennelId
                      ? "À placer"
                      : s.status === "upcoming" || s.status === "ongoing"
                        ? progress.label
                        : stayStatusMeta[s.status].label}
                  </Badge>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <StaySheet
        onConfirm={(id) => {
          setStays((list) =>
            list.map((s) => (s.id === id ? { ...s, status: "upcoming" } : s))
          )
          setSheetOpen(false)
        }}
        onDecline={(id) => {
          setStays((list) => list.filter((s) => s.id !== id))
          setSheetOpen(false)
        }}
        onOpenChange={setSheetOpen}
        open={sheetOpen}
        stay={openStay}
      />
    </ActivityPage>
  )
}
