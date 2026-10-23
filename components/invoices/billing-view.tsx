"use client"

import {
  Alert02Icon,
  Download04Icon,
  Invoice01Icon,
  MailSend01Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import {
  type Activity,
  ActivityMark,
  activityMeta,
} from "@/components/activity-mark"
import { shortDate, TODAY } from "@/components/calendar"
import { type ActivityInvoice, allInvoices } from "@/components/clients/data"
import {
  type InvoiceStatus,
  invoiceBooks,
  invoiceTotal,
} from "@/components/invoices/data"
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
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

const statusMeta: Record<InvoiceStatus, { label: string; tone: string }> = {
  draft: { label: "Brouillon", tone: "bg-background text-muted-foreground" },
  overdue: { label: "En retard", tone: "bg-destructive-soft" },
  paid: { label: "Payée", tone: "bg-success-soft" },
  pending: { label: "À encaisser", tone: "bg-warning-soft" },
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
                <StatusPill tone={statusMeta[invoice.status].tone}>
                  {statusMeta[invoice.status].label}
                </StatusPill>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                  <ActivityMark
                    activity={invoice.activity}
                    className="size-4 text-[0.5rem]"
                  />
                  {invoice.activity}
                </span>
              </div>
              <SheetTitle className="font-display text-3xl">
                {invoice.status === "draft"
                  ? "Facture brouillon"
                  : `Facture ${invoice.number}`}
              </SheetTitle>
            </SheetHeader>
            <SheetPanel className="space-y-4">
              {invoice.status === "overdue" && (
                <p className="flex gap-3 rounded-3xl bg-destructive-soft p-4 font-semibold">
                  <HugeiconsIcon
                    className="mt-0.5 size-5 shrink-0"
                    icon={Alert02Icon}
                  />
                  Échéance dépassée de {TODAY - invoice.due} jours
                  {invoice.reminders
                    ? ` · ${invoice.reminders} relance${invoice.reminders > 1 ? "s" : ""} envoyée${invoice.reminders > 1 ? "s" : ""}`
                    : ""}
                </p>
              )}
              <div className="space-y-2 rounded-3xl bg-muted p-3">
                <div className="flex items-start justify-between gap-4 rounded-2xl bg-background p-4">
                  <div className="flex items-center gap-3">
                    <Monogram
                      className="size-10"
                      text="LC"
                      tone="bg-wise-orange text-wise-maroon"
                    />
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
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-2xl bg-background p-4">
                    <p className="text-muted-foreground">Facturé à</p>
                    <p className="font-semibold">{invoice.client}</p>
                    <p className="text-muted-foreground">{invoice.detail}</p>
                  </div>
                  <div className="rounded-2xl bg-background p-4 text-end">
                    <p className="text-muted-foreground">Échéance</p>
                    <p className="font-semibold">{shortDate(invoice.due)}</p>
                  </div>
                </div>
                <ul className="divide-y-2 divide-muted overflow-hidden rounded-2xl bg-background">
                  {invoice.lines.map((line) => (
                    <li
                      className="flex items-center justify-between gap-3 px-4 py-3"
                      key={line.label}
                    >
                      <span className="min-w-0 flex-1">{line.label}</span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        × {line.quantity}
                      </span>
                      <span className="w-20 text-end tabular-nums">
                        {formatAmount(line.quantity * line.unit)}
                      </span>
                    </li>
                  ))}
                  <li className="space-y-1 px-4 py-3 text-sm">
                    <p className="flex justify-between text-muted-foreground">
                      <span>Total HT</span>
                      <span className="tabular-nums">
                        {ht.toFixed(2).replace(".", ",")} €
                      </span>
                    </p>
                    <p className="flex justify-between text-muted-foreground">
                      <span>TVA 20 %</span>
                      <span className="tabular-nums">
                        {(total - ht).toFixed(2).replace(".", ",")} €
                      </span>
                    </p>
                  </li>
                  <li className="flex items-baseline justify-between px-4 py-3">
                    <span className="font-semibold">Total TTC</span>
                    <span className="font-display text-3xl tabular-nums">
                      {formatAmount(total)}
                    </span>
                  </li>
                </ul>
                {invoice.status === "paid" && (
                  <p className="flex items-center gap-2 rounded-2xl bg-success-soft px-4 py-3 font-semibold">
                    <HugeiconsIcon className="size-5" icon={Tick02Icon} />
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

/** Le mois en un coup d'œil : facturé, encaissé, ce qu'il reste à rentrer. */
function MonthHero({ invoices }: { invoices: ActivityInvoice[] }) {
  const of = (status: InvoiceStatus) =>
    invoices.filter((i) => i.status === status)
  const issued = sumOf(invoices.filter((i) => i.status !== "draft"))
  const paid = sumOf(of("paid"))
  const ratio = Math.round((paid / Math.max(1, issued)) * 100)
  return (
    <section className="grid gap-6 rounded-4xl bg-wise-forest p-6 text-white md:grid-cols-[1fr_auto] md:items-end md:p-8">
      <div className="space-y-4">
        <p className="font-semibold text-white/70">Facturé en octobre</p>
        <p className="font-display text-6xl text-wise-green md:text-7xl">
          {formatAmount(issued)}
        </p>
        <div className="max-w-md space-y-2">
          <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-wise-green"
              style={{ width: `${ratio}%` }}
            />
          </div>
          <p className="text-sm text-white/70">
            {formatAmount(paid)} encaissés · {ratio} %
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 md:w-md">
        {[
          { label: "À encaisser", list: of("pending") },
          { label: "En retard", list: of("overdue") },
        ].map(({ label, list }) => (
          <div className="rounded-3xl bg-white/10 p-4" key={label}>
            <dt className="text-sm font-semibold text-white/70">{label}</dt>
            <dd className="font-display text-3xl">
              {formatAmount(sumOf(list))}
            </dd>
            <dd className="text-sm text-white/70">
              {list.length} facture{list.length > 1 && "s"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

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
  const openSheet = (id: string) => {
    setOpenId(id)
    setSheetOpen(true)
  }

  return (
    <PageShell
      actions={
        <>
          <Button className="max-sm:hidden" variant="secondary">
            <HugeiconsIcon icon={Download04Icon} />
            Exporter
          </Button>
          <Button>
            <HugeiconsIcon icon={PlusSignIcon} />
            Nouvelle facture
          </Button>
        </>
      }
      title="Facturation"
    >
      <FilterChips
        label="Activité"
        onChange={setActivity}
        options={activityChips}
        value={activity}
      />

      <MonthHero invoices={scoped} />

      <Section
        count={of("overdue").length + of("draft").length || undefined}
        title="À traiter"
      >
        <AttentionList
          empty="Aucune facture en retard ni brouillon"
          items={[
            ...of("overdue").map((i) => ({
              actions: (
                <>
                  <Button
                    className="bg-background"
                    onClick={() => markPaid(i.id)}
                    variant="outline"
                  >
                    Marquer payée
                  </Button>
                  <Button onClick={() => remind(i.id)}>
                    <HugeiconsIcon icon={MailSend01Icon} />
                    Relancer
                  </Button>
                </>
              ),
              detail: `${i.number} · ${TODAY - i.due} jours de retard · ${
                i.reminders
                  ? `${i.reminders} relance${i.reminders > 1 ? "s" : ""}`
                  : "jamais relancée"
              }`,
              icon: Alert02Icon,
              id: i.id,
              onOpen: () => openSheet(i.id),
              title: `${i.client} · ${formatAmount(invoiceTotal(i))}`,
              tone: "bg-destructive-soft",
            })),
            ...of("draft").map((i) => ({
              actions: (
                <Button onClick={() => remind(i.id)}>
                  <HugeiconsIcon icon={MailSend01Icon} />
                  Émettre
                </Button>
              ),
              detail: `Brouillon · ${i.subject}`,
              icon: Invoice01Icon,
              id: i.id,
              onOpen: () => openSheet(i.id),
              title: `${i.client} · ${formatAmount(invoiceTotal(i))}`,
              tone: "bg-background",
            })),
          ]}
          limit={3}
        />
      </Section>

      <Section
        action={
          <SearchField
            className="w-full sm:w-72"
            label="Rechercher une facture"
            onChange={setQuery}
            placeholder="N°, client, animal…"
            value={query}
          />
        }
        title="Factures"
      >
        <FilterChips
          label="Statut"
          onChange={setFilter}
          options={filters.map((f) => ({
            ...f,
            count: f.value === "all" ? scoped.length : of(f.value).length,
          }))}
          value={filter}
        />
        {rows.length === 0 ? (
          <p className="rounded-3xl bg-muted p-6 text-center font-semibold text-muted-foreground">
            Aucune facture ne correspond à ces critères.
          </p>
        ) : (
          <ul className={listCard}>
            {rows.map((i) => (
              <li className={listRow} key={i.id}>
                <button
                  className="flex min-w-0 flex-1 items-center gap-3 text-start md:gap-4"
                  onClick={() => openSheet(i.id)}
                  type="button"
                >
                  <Monogram
                    text={initials(i.client)}
                    tone={activityMeta[i.activity].tint}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {i.client}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {i.subject} · {i.number}
                    </span>
                  </span>
                  <span className="shrink-0 space-y-1 text-end">
                    <span className="block font-semibold tabular-nums">
                      {formatAmount(invoiceTotal(i))}
                    </span>
                    <span className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                      {i.status !== "paid" && (
                        <span className="max-sm:hidden">
                          {shortDate(i.due)}
                        </span>
                      )}
                      <StatusPill tone={statusMeta[i.status].tone}>
                        {statusMeta[i.status].label}
                      </StatusPill>
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
            <li className="flex items-baseline justify-between px-4 py-4 md:px-5">
              <span className="font-semibold">
                {rows.length} facture{rows.length > 1 && "s"}
              </span>
              <span className="font-display text-3xl tabular-nums">
                {formatAmount(sumOf(rows))}
              </span>
            </li>
          </ul>
        )}
      </Section>

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
