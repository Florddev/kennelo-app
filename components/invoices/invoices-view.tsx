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
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { type Activity, activityMeta } from "@/components/activity-mark"
import { shortDate, TODAY } from "@/components/calendar"
import {
  type Invoice,
  type InvoiceStatus,
  invoiceBooks,
  invoiceTotal,
} from "@/components/invoices/data"
import {
  ActivityPage,
  formatAmount,
  Kpi,
  Widget,
} from "@/components/today/widgets"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  overdue: { dot: "bg-red-500", label: "En retard", variant: "error" },
  paid: { dot: "bg-emerald-500", label: "Payée", variant: "success" },
  pending: { dot: "bg-amber-500", label: "À encaisser", variant: "warning" },
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

const sumOf = (list: Invoice[]) =>
  list.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)

function MonthlyChart({
  activity,
  months,
}: {
  activity: Activity
  months: { label: string; amount: number }[]
}) {
  const max = Math.max(...months.map((m) => m.amount))
  return (
    <div className="flex h-44 items-end gap-3">
      {months.map((m, i) => {
        const current = i === months.length - 1
        return (
          <div
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            key={m.label}
          >
            <span className="text-[0.6875rem] text-muted-foreground tabular-nums">
              {(m.amount / 1000).toFixed(1).replace(".", ",")} k
            </span>
            <div
              className={cn(
                "w-full max-w-12 rounded-md",
                current
                  ? activityMeta[activity].color
                  : `${activityMeta[activity].color} opacity-30`
              )}
              style={{ height: `${(m.amount / max) * 100}%` }}
              title={formatAmount(m.amount)}
            />
            <span
              className={cn(
                "text-xs text-muted-foreground",
                current && "font-medium text-foreground"
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
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaid: (number: string) => void
  onRemind: (number: string) => void
}) {
  const total = invoice ? invoiceTotal(invoice) : 0
  const ht = Math.round((total / 1.2) * 100) / 100
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup variant="inset">
        {invoice && (
          <>
            <SheetHeader>
              <Badge
                className="w-fit"
                variant={statusMeta[invoice.status].variant}
              >
                {statusMeta[invoice.status].label}
              </Badge>
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
                    <span className="flex size-8 items-center justify-center rounded-md bg-emerald-800 text-xs font-semibold text-white">
                      LC
                    </span>
                    <div className="text-xs">
                      <p className="font-medium">Les Coteaux</p>
                      <p className="text-muted-foreground">
                        12 chemin des Vignes · 69130 Écully
                      </p>
                    </div>
                  </div>
                  <div className="text-end text-xs">
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-muted-foreground">
                      Émise le {shortDate(invoice.issued)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Facturé à</p>
                    <p className="font-medium">{invoice.client}</p>
                    <p className="text-muted-foreground">{invoice.detail}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-muted-foreground">Échéance</p>
                    <p className="font-medium">{shortDate(invoice.due)}</p>
                  </div>
                </div>
                <table className="w-full text-xs">
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
                <dl className="ms-auto w-48 space-y-1 text-xs">
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
                  <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
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
                <Button onClick={() => onRemind(invoice.number)}>
                  <HugeiconsIcon icon={MailSend01Icon} />
                  Émettre et envoyer
                </Button>
              )}
              {(invoice.status === "pending" ||
                invoice.status === "overdue") && (
                <>
                  <Button
                    onClick={() => onRemind(invoice.number)}
                    variant="outline"
                  >
                    <HugeiconsIcon icon={MailSend01Icon} />
                    Relancer
                  </Button>
                  <Button onClick={() => onPaid(invoice.number)}>
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

export function InvoicesView({ activity }: { activity: Activity }) {
  const book = invoiceBooks[activity]
  const [invoices, setInvoices] = useState(book.invoices)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [openNumber, setOpenNumber] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const of = (status: InvoiceStatus) =>
    invoices.filter((i) => i.status === status)
  const issued = invoices.filter((i) => i.status !== "draft")
  const q = query.trim().toLowerCase()
  const rows = invoices
    .filter((i) => filter === "all" || i.status === filter)
    .filter(
      (i) =>
        !q ||
        `${i.number} ${i.client} ${i.subject} ${i.detail}`
          .toLowerCase()
          .includes(q)
    )
  const openInvoice = invoices.find((i) => i.number === openNumber) ?? null

  const update = (number: string, patch: Partial<Invoice>) =>
    setInvoices((list) =>
      list.map((i) => (i.number === number ? { ...i, ...patch } : i))
    )
  const markPaid = (number: string) =>
    update(number, { method: "Carte bancaire", status: "paid" })
  const remind = (number: string) => {
    const invoice = invoices.find((i) => i.number === number)
    if (!invoice) return
    if (invoice.status === "draft") {
      update(number, {
        number: `${prefixes[activity]}-2026-0${170 + invoices.length}`,
        status: "pending",
      })
      setSheetOpen(false)
      return
    }
    update(number, { reminders: (invoice.reminders ?? 0) + 1 })
  }

  return (
    <ActivityPage
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
      activity={activity}
      title="Factures"
    >
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
          {Math.round((sumOf(of("paid")) / sumOf(issued)) * 100)} % du facturé
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
          <MonthlyChart activity={activity} months={book.months} />
        </Widget>
        <Widget description="Factures échues non réglées" title="À relancer">
          {of("overdue").length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune facture en retard 🎉
            </p>
          ) : (
            <ul className="space-y-3">
              {of("overdue").map((i) => (
                <li className="space-y-2 rounded-lg border p-3" key={i.number}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{i.client}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {i.number} · {TODAY - i.due} jours de retard
                      </p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {formatAmount(invoiceTotal(i))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {i.reminders
                        ? `${i.reminders} relance${i.reminders > 1 ? "s" : ""}`
                        : "Jamais relancée"}
                    </span>
                    <Button
                      onClick={() => remind(i.number)}
                      size="xs"
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
                  {f.value === "all" ? invoices.length : of(f.value).length}
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
            placeholder="N°, client, objet…"
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
        <CardFrame className="overflow-x-auto">
          <Table variant="card">
            <TableHeader>
              <TableRow>
                <TableHead>Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="max-md:hidden">
                  {book.extraLabel}
                </TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead className="text-end">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow
                  className="cursor-pointer"
                  key={i.number}
                  onClick={() => {
                    setOpenNumber(i.number)
                    setSheetOpen(true)
                  }}
                >
                  <TableCell>
                    <p className="font-medium">{i.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.number} · {shortDate(i.issued)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-[0.625rem]">
                          {initials(i.client)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{i.client}</p>
                        <p className="text-xs text-muted-foreground">
                          {i.detail}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-md:hidden">
                    {i.extra}
                  </TableCell>
                  <TableCell
                    className={cn(
                      i.status === "overdue"
                        ? "text-destructive-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {i.status === "paid" ? "—" : shortDate(i.due)}
                  </TableCell>
                  <TableCell className="text-end font-medium tabular-nums">
                    {formatAmount(invoiceTotal(i))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          statusMeta[i.status].dot
                        )}
                      />
                      {statusMeta[i.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                        <MenuItem>
                          <HugeiconsIcon icon={Download04Icon} />
                          Télécharger le PDF
                        </MenuItem>
                        {i.status !== "paid" && (
                          <MenuItem onClick={() => remind(i.number)}>
                            <HugeiconsIcon icon={MailSend01Icon} />
                            {i.status === "draft" ? "Émettre" : "Relancer"}
                          </MenuItem>
                        )}
                        {(i.status === "pending" || i.status === "overdue") && (
                          <>
                            <MenuSeparator />
                            <MenuItem onClick={() => markPaid(i.number)}>
                              <HugeiconsIcon icon={Tick02Icon} />
                              Marquer payée
                            </MenuItem>
                          </>
                        )}
                      </MenuPopup>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>
                  {rows.length} facture{rows.length > 1 && "s"}
                </TableCell>
                <TableCell className="text-end tabular-nums">
                  {formatAmount(sumOf(rows))}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          </Table>
        </CardFrame>
      )}

      <InvoiceSheet
        invoice={openInvoice}
        onOpenChange={setSheetOpen}
        onPaid={(number) => {
          markPaid(number)
          setSheetOpen(false)
        }}
        onRemind={remind}
        open={sheetOpen}
      />
    </ActivityPage>
  )
}
