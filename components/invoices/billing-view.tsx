"use client"

import {
  Alert02Icon,
  Clock01Icon,
  Download04Icon,
  EuroCircleIcon,
  Invoice01Icon,
  MailSend01Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  ReceiptIcon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import {
  type Activity,
  ActivityMark,
  activityMeta,
  activityNames,
} from "@/components/activity-mark"
import { shortDate, TODAY } from "@/components/calendar"
import { type ActivityInvoice, allInvoices } from "@/components/clients/data"
import {
  type InvoiceStatus,
  invoiceBooks,
  invoiceTotal,
} from "@/components/invoices/data"
import {
  formatAmount,
  Kpi,
  PageShell,
  Widget,
} from "@/components/today/widgets"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import {
  Sheet,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const statusMeta: Record<
  InvoiceStatus,
  {
    label: string
    dot: string
    variant: "success" | "warning" | "error" | "secondary"
  }
> = {
  draft: {
    dot: "bg-muted-foreground/60",
    label: "Brouillon",
    variant: "secondary",
  },
  overdue: { dot: "bg-destructive", label: "En retard", variant: "error" },
  paid: { dot: "bg-success", label: "Payée", variant: "success" },
  pending: { dot: "bg-warning", label: "À encaisser", variant: "warning" },
}

const prefixes: Record<Activity, string> = {
  Pension: "F",
  Toilettage: "T",
  Éducation: "E",
}

type Filter = InvoiceStatus | "all"
const filters: { value: Filter; label: string }[] = [
  { label: "Toutes", value: "all" },
  { label: "À encaisser", value: "pending" },
  { label: "En retard", value: "overdue" },
  { label: "Payées", value: "paid" },
  { label: "Brouillons", value: "draft" },
]

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)

const sumOf = (list: ActivityInvoice[]) =>
  list.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)

/** Monthly revenue over 6 months, stacked by activity. */
export function RevenueChart({ activities }: { activities: Activity[] }) {
  const months = invoiceBooks.Pension.months.map((m, i) => ({
    label: m.label,
    parts: activities.map((activity) => ({
      activity,
      amount: invoiceBooks[activity].months[i].amount,
    })),
  }))
  const totalOf = (parts: { amount: number }[]) =>
    parts.reduce((sum, p) => sum + p.amount, 0)
  const max = Math.max(...months.map((m) => totalOf(m.parts)))
  return (
    <div className="flex h-48 items-end gap-3">
      {months.map((m, i) => {
        const current = i === months.length - 1
        const total = totalOf(m.parts)
        return (
          <div
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            key={m.label}
          >
            <span className="text-[0.6875rem] text-muted-foreground tabular-nums">
              {(total / 1000).toFixed(1).replace(".", ",")} k
            </span>
            <div
              className={cn(
                "flex w-full max-w-12 flex-col-reverse overflow-hidden rounded-md",
                !current && "opacity-40"
              )}
              style={{ height: `${(total / max) * 100}%` }}
              title={formatAmount(total)}
            >
              {m.parts.map((p) => (
                <div
                  className={activityMeta[p.activity].color}
                  key={p.activity}
                  style={{ height: `${(p.amount / total) * 100}%` }}
                />
              ))}
            </div>
            <span
              className={cn(
                "text-sm text-muted-foreground",
                current && "font-semibold text-foreground"
              )}
            >
              {m.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function InvoiceSheet({
  invoice,
  open,
  onOpenChange,
  onPaid,
  onRemind,
}: {
  invoice: ActivityInvoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaid: (id: string) => void
  onRemind: (id: string) => void
}) {
  const total = invoice ? invoiceTotal(invoice) : 0
  const ht = Math.round((total / 1.2) * 100) / 100
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup variant="inset">
        {invoice && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Badge variant={statusMeta[invoice.status].variant}>
                  {statusMeta[invoice.status].label}
                </Badge>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ActivityMark
                    activity={invoice.activity}
                    className="size-4 text-[0.5rem]"
                  />
                  {invoice.activity}
                </span>
              </div>
              <SheetTitle>
                {invoice.status === "draft"
                  ? "Facture brouillon"
                  : `Facture ${invoice.number}`}
              </SheetTitle>
            </SheetHeader>
            <SheetPanel className="space-y-5">
              {invoice.status === "overdue" && (
                <Alert variant="error">
                  <HugeiconsIcon icon={Alert02Icon} />
                  <AlertDescription>
                    Échéance dépassée de {TODAY - invoice.due} jours
                    {invoice.reminders
                      ? ` · ${invoice.reminders} relance${invoice.reminders > 1 ? "s" : ""} envoyée${invoice.reminders > 1 ? "s" : ""}`
                      : ""}
                    .
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-5 rounded-xl border bg-card p-5 shadow-xs/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-md bg-pension text-sm font-semibold text-pension-foreground">
                      LC
                    </span>
                    <div className="text-sm">
                      <p className="font-semibold">Les Coteaux</p>
                      <p className="text-muted-foreground">
                        12 chemin des Coteaux · 33500 Libourne
                      </p>
                    </div>
                  </div>
                  <div className="text-end text-sm">
                    <p className="font-semibold">{invoice.number}</p>
                    <p className="text-muted-foreground">
                      Émise le {shortDate(invoice.issued)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Facturé à</p>
                    <p className="font-semibold">{invoice.client}</p>
                    <p className="text-muted-foreground">{invoice.detail}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-muted-foreground">Échéance</p>
                    <p className="font-semibold">{shortDate(invoice.due)}</p>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr className="border-b">
                      <th className="pb-2 text-start font-normal">
                        Désignation
                      </th>
                      <th className="pb-2 text-end font-normal">Qté</th>
                      <th className="pb-2 text-end font-normal">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lines.map((line) => (
                      <tr className="border-b border-dashed" key={line.label}>
                        <td className="py-2">{line.label}</td>
                        <td className="py-2 text-end tabular-nums">
                          {line.quantity}
                        </td>
                        <td className="py-2 text-end tabular-nums">
                          {formatAmount(line.quantity * line.unit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <dl className="ms-auto w-48 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total HT</dt>
                    <dd className="tabular-nums">
                      {ht.toFixed(2).replace(".", ",")} €
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">TVA 20 %</dt>
                    <dd className="tabular-nums">
                      {(total - ht).toFixed(2).replace(".", ",")} €
                    </dd>
                  </div>
                  <div className="flex justify-between border-t pt-1 text-sm font-semibold">
                    <dt>Total TTC</dt>
                    <dd className="tabular-nums">{formatAmount(total)}</dd>
                  </div>
                </dl>
                {invoice.status === "paid" && (
                  <p className="flex items-center gap-1.5 text-sm text-pension-strong">
                    <HugeiconsIcon className="size-3.5" icon={Tick02Icon} />
                    Réglée par{" "}
                    {invoice.method?.toLowerCase() ?? "carte bancaire"}
                  </p>
                )}
              </div>
            </SheetPanel>
            <SheetFooter>
              <Button variant="outline">
                <HugeiconsIcon icon={Download04Icon} />
                PDF
              </Button>
              {invoice.status === "draft" && (
                <Button onClick={() => onRemind(invoice.id)}>
                  <HugeiconsIcon icon={MailSend01Icon} />
                  Émettre et envoyer
                </Button>
              )}
              {(invoice.status === "pending" ||
                invoice.status === "overdue") && (
                <>
                  <Button
                    onClick={() => onRemind(invoice.id)}
                    variant="outline"
                  >
                    <HugeiconsIcon icon={MailSend01Icon} />
                    Relancer
                  </Button>
                  <Button onClick={() => onPaid(invoice.id)}>
                    Marquer payée
                  </Button>
                </>
              )}
            </SheetFooter>
          </>
        )}
      </SheetPopup>
    </Sheet>
  )
}

type ActivityFilter = Activity | "all"

export function BillingView() {
  const [invoices, setInvoices] = useState(allInvoices)
  const [activity, setActivity] = useState<ActivityFilter>("all")
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const scoped = invoices.filter(
    (i) => activity === "all" || i.activity === activity
  )
  const of = (status: InvoiceStatus) =>
    scoped.filter((i) => i.status === status)
  const issued = scoped.filter((i) => i.status !== "draft")
  const q = query.trim().toLowerCase()
  const rows = scoped
    .filter((i) => filter === "all" || i.status === filter)
    .filter(
      (i) =>
        !q ||
        `${i.number} ${i.client} ${i.subject} ${i.detail}`
          .toLowerCase()
          .includes(q)
    )
  const openInvoice = invoices.find((i) => i.id === openId) ?? null
  const chartActivities = activity === "all" ? activityNames : [activity]

  const update = (id: string, patch: Partial<ActivityInvoice>) =>
    setInvoices((list) =>
      list.map((i) => (i.id === id ? { ...i, ...patch } : i))
    )
  const markPaid = (id: string) =>
    update(id, { method: "Carte bancaire", status: "paid" })
  const remind = (id: string) => {
    const invoice = invoices.find((i) => i.id === id)
    if (!invoice) return
    if (invoice.status === "draft") {
      update(id, {
        number: `${prefixes[invoice.activity]}-2026-0${170 + invoices.length}`,
        status: "pending",
      })
      setSheetOpen(false)
      return
    }
    update(id, { reminders: (invoice.reminders ?? 0) + 1 })
  }

  return (
    <PageShell
      actions={
        <>
          <Button className="max-sm:hidden" size="sm" variant="outline">
            <HugeiconsIcon icon={Download04Icon} />
            Exporter
          </Button>
          <Button size="sm">
            <HugeiconsIcon icon={PlusSignIcon} />
            Nouvelle facture
          </Button>
        </>
      }
      icon={ReceiptIcon}
      title="Facturation"
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
        <Kpi
          icon={Invoice01Icon}
          label="Facturé ce mois"
          value={formatAmount(sumOf(issued))}
        >
          {issued.length} factures émises
        </Kpi>
        <Kpi
          icon={EuroCircleIcon}
          label="Encaissé"
          value={formatAmount(sumOf(of("paid")))}
        >
          {Math.round((sumOf(of("paid")) / Math.max(1, sumOf(issued))) * 100)} %
          du facturé
        </Kpi>
        <Kpi
          icon={Clock01Icon}
          label="À encaisser"
          value={formatAmount(sumOf(of("pending")))}
        >
          {of("pending").length} factures en attente
        </Kpi>
        <Kpi
          icon={Alert02Icon}
          label="En retard"
          value={
            <span
              className={cn(
                of("overdue").length > 0 && "text-destructive-foreground"
              )}
            >
              {formatAmount(sumOf(of("overdue")))}
            </span>
          }
        >
          {of("overdue").length} facture{of("overdue").length > 1 && "s"} à
          relancer
        </Kpi>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Widget
          className="lg:col-span-2"
          description="Chiffre d'affaires facturé sur 6 mois"
          title="Évolution"
        >
          <RevenueChart activities={chartActivities} />
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-3">
            {chartActivities.map((name) => (
              <span className="flex items-center gap-2 text-sm" key={name}>
                <span
                  className={cn(
                    "size-2 rounded-full",
                    activityMeta[name].color
                  )}
                />
                <span className="text-muted-foreground">{name}</span>
                <span className="font-semibold tabular-nums">
                  {formatAmount(invoiceBooks[name].months[5].amount)}
                </span>
              </span>
            ))}
          </div>
        </Widget>
        <Widget description="Factures échues non réglées" title="À relancer">
          {of("overdue").length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune facture en retard 🎉
            </p>
          ) : (
            <ul className="space-y-3">
              {of("overdue").map((i) => (
                <li className="space-y-2 rounded-xl border p-3" key={i.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                        <ActivityMark
                          activity={i.activity}
                          className="size-4 text-[0.5rem]"
                        />
                        {i.client}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {i.number} · {TODAY - i.due} jours de retard
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatAmount(invoiceTotal(i))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">
                      {i.reminders
                        ? `${i.reminders} relance${i.reminders > 1 ? "s" : ""}`
                        : "Jamais relancée"}
                    </span>
                    <Button
                      onClick={() => remind(i.id)}
                      size="sm"
                      variant="outline"
                    >
                      <HugeiconsIcon icon={MailSend01Icon} />
                      Relancer
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Widget>
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
                  {f.value === "all" ? scoped.length : of(f.value).length}
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
            aria-label="Rechercher une facture"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="N°, client, animal…"
            value={query}
          />
        </InputGroup>
      </div>

      {rows.length === 0 ? (
        <Empty className="rounded-xl border">
          <EmptyHeader>
            <EmptyTitle>Aucune facture</EmptyTitle>
            <EmptyDescription>
              Aucune facture ne correspond à ces critères.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          <ul className="-mx-3">
            {rows.map((i) => (
              <li
                className="flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-accent"
                key={i.id}
              >
                <button
                  className="flex min-w-0 flex-1 items-center gap-4 text-start"
                  onClick={() => {
                    setOpenId(i.id)
                    setSheetOpen(true)
                  }}
                  type="button"
                >
                  <span className="relative shrink-0">
                    <span className="flex size-12 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {initials(i.client)}
                    </span>
                    <ActivityMark
                      activity={i.activity}
                      className="absolute -end-1 -bottom-1 size-5 text-[0.625rem] ring-2 ring-background"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {i.client}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {i.subject} · {i.number}
                    </span>
                  </span>
                  <span className="shrink-0 text-end">
                    <span className="block font-semibold tabular-nums">
                      {formatAmount(invoiceTotal(i))}
                    </span>
                    <span
                      className={cn(
                        "flex items-center justify-end gap-1.5 text-sm",
                        i.status === "overdue"
                          ? "font-semibold text-destructive-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          statusMeta[i.status].dot
                        )}
                      />
                      {statusMeta[i.status].label}
                      {i.status !== "paid" && ` · ${shortDate(i.due)}`}
                    </span>
                  </span>
                </button>
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
                    <MenuItem>
                      <HugeiconsIcon icon={Download04Icon} />
                      Télécharger le PDF
                    </MenuItem>
                    {i.status !== "paid" && (
                      <MenuItem onClick={() => remind(i.id)}>
                        <HugeiconsIcon icon={MailSend01Icon} />
                        {i.status === "draft" ? "Émettre" : "Relancer"}
                      </MenuItem>
                    )}
                    {(i.status === "pending" || i.status === "overdue") && (
                      <>
                        <MenuSeparator />
                        <MenuItem onClick={() => markPaid(i.id)}>
                          <HugeiconsIcon icon={Tick02Icon} />
                          Marquer payée
                        </MenuItem>
                      </>
                    )}
                  </MenuPopup>
                </Menu>
              </li>
            ))}
          </ul>
          <p className="flex justify-between border-t pt-4 font-semibold">
            <span>
              {rows.length} facture{rows.length > 1 && "s"}
            </span>
            <span className="tabular-nums">{formatAmount(sumOf(rows))}</span>
          </p>
        </div>
      )}

      <InvoiceSheet
        invoice={openInvoice}
        onOpenChange={setSheetOpen}
        onPaid={(id) => {
          markPaid(id)
          setSheetOpen(false)
        }}
        onRemind={remind}
        open={sheetOpen}
      />
    </PageShell>
  )
}
