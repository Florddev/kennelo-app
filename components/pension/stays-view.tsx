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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)

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
            <Button size="sm">
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
          <TabsList size="sm">
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
        <CardFrame className="overflow-x-auto">
          <Table variant="card">
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Hébergement</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="max-lg:hidden">Avancement</TableHead>
                <TableHead className="text-end">Montant</TableHead>
                <TableHead>Paiement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                const progress = stayProgress(s)
                return (
                  <TableRow
                    className="cursor-pointer"
                    key={s.id}
                    onClick={() => {
                      setOpenId(s.id)
                      setSheetOpen(true)
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarFallback
                            className={cn(
                              "text-xs",
                              s.status === "ongoing" &&
                                "bg-pension text-pension-foreground"
                            )}
                          >
                            {s.pet.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{s.pet}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.breed}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[0.625rem]">
                            {initials(s.owner)}
                          </AvatarFallback>
                        </Avatar>
                        {s.owner}
                      </div>
                    </TableCell>
                    <TableCell>
                      {s.kennelId ? (
                        kennelLabel(s.kennelId)
                      ) : (
                        <Badge variant="warning">À placer</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p>
                        {shortDate(s.arrival)} → {shortDate(s.departure)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {progress.nights} nuits
                        {s.options.length > 0 && ` · ${s.options.join(", ")}`}
                      </p>
                    </TableCell>
                    <TableCell className="w-40 max-lg:hidden">
                      {s.status === "ongoing" ? (
                        <div className="space-y-1">
                          <Bar
                            className="bg-pension-strong"
                            label={`Séjour de ${s.pet}`}
                            value={(progress.elapsed / progress.nights) * 100}
                          />
                          <p className="text-xs text-muted-foreground">
                            {progress.label}
                          </p>
                        </div>
                      ) : (
                        <Badge variant={stayStatusMeta[s.status].variant}>
                          {s.status === "upcoming"
                            ? progress.label
                            : stayStatusMeta[s.status].label}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-end font-medium tabular-nums">
                      {formatAmount(stayAmount(s))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            paymentMeta[s.payment].dot
                          )}
                        />
                        {paymentMeta[s.payment].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardFrame>
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
