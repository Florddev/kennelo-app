"use client"

import {
  ArrowDownRight01Icon,
  ArrowUpRight01Icon,
  BedDoubleIcon,
  ChartNoAxesColumnIcon,
  Download04Icon,
  EuroCircleIcon,
  Invoice01Icon,
  UsersIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { activityMeta, activityNames } from "@/components/activity-mark"
import { dateOf, TODAY, weekdayOf } from "@/components/calendar"
import { allInvoices, clients } from "@/components/clients/data"
import { RevenueChart } from "@/components/invoices/billing-view"
import { invoiceBooks, invoiceTotal } from "@/components/invoices/data"
import { stays } from "@/components/pension/data"
import { reservations } from "@/components/reservations/data"
import {
  Bar,
  formatAmount,
  Kpi,
  PageShell,
  Widget,
} from "@/components/today/widgets"
import { groups } from "@/components/training/data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const KENNELS = 24

const occupancy = (day: number) =>
  stays.filter(
    (s) => s.status !== "pending" && s.arrival <= day && day < s.departure
  ).length

const monthTotal = (i: number) =>
  activityNames.reduce((sum, a) => sum + invoiceBooks[a].months[i].amount, 0)

function Delta({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-semibold",
        up ? "text-pension-strong" : "text-destructive-foreground"
      )}
    >
      <HugeiconsIcon
        className="size-3.5"
        icon={up ? ArrowUpRight01Icon : ArrowDownRight01Icon}
      />
      {up && "+"}
      {value.toFixed(1).replace(".", ",")} %
    </span>
  )
}

export function StatsView() {
  const [period, setPeriod] = useState("month")
  const october = monthTotal(5)
  const september = monthTotal(4)
  const yearToDate = [0, 1, 2, 3, 4, 5].reduce((s, i) => s + monthTotal(i), 0)
  const issued = allInvoices.filter((i) => i.status !== "draft")
  const basket =
    issued.reduce((s, i) => s + invoiceTotal(i), 0) / Math.max(1, issued.length)
  const tonight = occupancy(TODAY)
  const days = Array.from({ length: 14 }, (_, i) => TODAY - 7 + i)
  const averageOccupancy =
    days.reduce((s, d) => s + occupancy(d), 0) / days.length / KENNELS

  const split = activityNames.map((activity) => ({
    activity,
    amount:
      period === "month"
        ? invoiceBooks[activity].months[5].amount
        : invoiceBooks[activity].months.reduce((s, m) => s + m.amount, 0),
  }))
  const splitTotal = split.reduce((s, x) => s + x.amount, 0)

  const services = Object.entries(
    reservations
      .filter((r) => r.activity === "Toilettage" && r.status !== "cancelled")
      .reduce<Record<string, { count: number; amount: number }>>((acc, r) => {
        const entry = acc[r.title] ?? { amount: 0, count: 0 }
        acc[r.title] = {
          amount: entry.amount + (r.amount ?? 0),
          count: entry.count + 1,
        }
        return acc
      }, {})
  ).sort((a, b) => b[1].count - a[1].count)
  const topService = services[0]?.[1].count ?? 1

  const groomingCancelled = reservations.filter(
    (r) => r.activity === "Toilettage" && r.status === "cancelled"
  ).length
  const groomingTotal = reservations.filter(
    (r) => r.activity === "Toilettage"
  ).length

  const topClients = [...clients]
    .map((c) => ({
      ...c,
      value:
        c.spent +
        c.reservations.reduce(
          (s, r) => s + (r.status !== "cancelled" ? (r.amount ?? 0) : 0),
          0
        ),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const multi = clients.filter((c) => c.activities.length > 1).length

  return (
    <PageShell
      actions={
        <Button className="max-sm:hidden" size="sm" variant="outline">
          <HugeiconsIcon icon={Download04Icon} />
          Exporter
        </Button>
      }
      icon={ChartNoAxesColumnIcon}
      title="Statistiques"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Octobre 2026</p>
          <h2 className="font-display text-4xl">Vue d&apos;ensemble</h2>
        </div>
        <Tabs
          onValueChange={(value) => setPeriod(String(value))}
          value={period}
        >
          <TabsList size="sm">
            <TabsTab value="month">Ce mois-ci</TabsTab>
            <TabsTab value="semester">6 derniers mois</TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={EuroCircleIcon}
          label={period === "month" ? "Chiffre d'affaires" : "CA sur 6 mois"}
          value={formatAmount(period === "month" ? october : yearToDate)}
        >
          {period === "month" ? (
            <>
              <Delta value={((october - september) / september) * 100} /> vs
              septembre
            </>
          ) : (
            `${formatAmount(Math.round(yearToDate / 6))} par mois en moyenne`
          )}
        </Kpi>
        <Kpi
          icon={BedDoubleIcon}
          label="Occupation pension"
          value={`${Math.round((tonight / KENNELS) * 100)} %`}
        >
          {tonight}/{KENNELS} box cette nuit · moyenne{" "}
          {Math.round(averageOccupancy * 100)} %
        </Kpi>
        <Kpi icon={UsersIcon} label="Clients actifs" value={clients.length}>
          {multi} utilisent plusieurs activités
        </Kpi>
        <Kpi
          icon={Invoice01Icon}
          label="Panier moyen"
          value={formatAmount(Math.round(basket))}
        >
          Sur {issued.length} factures émises
        </Kpi>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Widget
          className="lg:col-span-2"
          description="Chiffre d'affaires facturé par mois et par activité"
          title="Évolution du chiffre d'affaires"
        >
          <RevenueChart activities={activityNames} />
        </Widget>
        <Widget
          description={
            period === "month" ? "Octobre 2026" : "Mai à octobre 2026"
          }
          title="Répartition par activité"
        >
          <ul className="space-y-4">
            {split.map(({ activity, amount }) => (
              <li className="space-y-1.5" key={activity}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        activityMeta[activity].color
                      )}
                    />
                    {activity}
                  </span>
                  <span className="tabular-nums">
                    {formatAmount(amount)}
                    <span className="ms-1.5 text-muted-foreground">
                      {Math.round((amount / splitTotal) * 100)} %
                    </span>
                  </span>
                </div>
                <Bar
                  className={activityMeta[activity].color}
                  label={activity}
                  value={(amount / splitTotal) * 100}
                />
              </li>
            ))}
          </ul>
        </Widget>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Widget
          className="lg:col-span-2"
          description="Box occupés chaque nuit, de la semaine passée à la semaine prochaine"
          title="Occupation de la pension"
        >
          <div className="flex h-40 items-end gap-1.5">
            {days.map((day) => {
              const n = occupancy(day)
              return (
                <div
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  key={day}
                >
                  <span className="text-[0.625rem] text-muted-foreground tabular-nums">
                    {n}
                  </span>
                  <div
                    className={cn(
                      "w-full rounded-sm",
                      day === TODAY
                        ? "bg-pension-strong"
                        : day < TODAY
                          ? "bg-pension/60"
                          : "bg-pension/60"
                    )}
                    style={{ height: `${(n / KENNELS) * 100}%` }}
                    title={`${n} box sur ${KENNELS}`}
                  />
                  <span
                    className={cn(
                      "text-[0.625rem] text-muted-foreground",
                      day === TODAY && "font-semibold text-foreground"
                    )}
                  >
                    {weekdayOf(day).slice(0, 1)}
                    {dateOf(day).day}
                  </span>
                </div>
              )
            })}
          </div>
        </Widget>
        <Widget
          description="Inscrits par rapport aux places"
          title="Cours collectifs"
        >
          <ul className="space-y-3">
            {groups.map((group) => (
              <li className="space-y-1.5" key={group.id}>
                <div className="flex justify-between text-sm">
                  <span>{group.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {group.members.length}/{group.capacity}
                    {group.waitlist > 0 && ` · ${group.waitlist} en attente`}
                  </span>
                </div>
                <Bar
                  className="bg-training-strong"
                  label={group.name}
                  value={(group.members.length / group.capacity) * 100}
                />
              </li>
            ))}
          </ul>
        </Widget>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Widget
          description={`${groomingTotal} rendez-vous sur deux semaines · ${Math.round((groomingCancelled / Math.max(1, groomingTotal)) * 100)} % d'annulations`}
          title="Toilettage · prestations"
        >
          <ul className="space-y-3">
            {services.map(([label, { count, amount }]) => (
              <li className="space-y-1.5" key={label}>
                <div className="flex justify-between gap-2 text-sm">
                  <span className="truncate">{label}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {count} · {formatAmount(amount)}
                  </span>
                </div>
                <Bar
                  className="bg-grooming-strong"
                  label={label}
                  value={(count / topService) * 100}
                />
              </li>
            ))}
          </ul>
        </Widget>
        <Widget
          description="Montants réglés et réservés"
          title="Meilleurs clients"
        >
          <ol className="space-y-3">
            {topClients.map((client, index) => (
              <li className="flex items-center gap-3" key={client.name}>
                <span className="w-4 text-sm text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {client.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {client.pets.map((p) => p.name).join(", ")}
                  </p>
                </div>
                <span className="text-sm tabular-nums">
                  {formatAmount(client.value)}
                </span>
              </li>
            ))}
          </ol>
        </Widget>
        <Widget description="Part des clients par activité" title="Clientèle">
          <ul className="space-y-3">
            {activityNames.map((activity) => {
              const n = clients.filter((c) =>
                c.activities.includes(activity)
              ).length
              return (
                <li className="space-y-1.5" key={activity}>
                  <div className="flex justify-between text-sm">
                    <span>{activity}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {n} clients
                    </span>
                  </div>
                  <Bar
                    className={activityMeta[activity].color}
                    label={activity}
                    value={(n / clients.length) * 100}
                  />
                </li>
              )
            })}
          </ul>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
            <div>
              <dt className="text-sm text-muted-foreground">
                Nouveaux en 2026
              </dt>
              <dd className="font-semibold">
                {clients.filter((c) => c.since === 2026).length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Multi-activités</dt>
              <dd className="font-semibold">
                {Math.round((multi / clients.length) * 100)} %
              </dd>
            </div>
          </dl>
        </Widget>
      </div>
    </PageShell>
  )
}
