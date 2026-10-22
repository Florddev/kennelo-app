"use client"

import {
  Alert02Icon,
  ArrowLeft01Icon,
  Calendar03Icon,
  Call02Icon,
  Location01Icon,
  Mail01Icon,
  Message01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import Link from "next/link"
import type { ReactNode } from "react"
import { ActivityMark } from "@/components/activity-mark"
import { relativeDate, shortDate } from "@/components/calendar"
import { findClient } from "@/components/clients/data"
import { invoiceTotal } from "@/components/invoices/data"
import { NewStayDialog } from "@/components/pension/new-stay-dialog"
import { petByName, petHref } from "@/components/pets/data"
import { petPhoto, petTone } from "@/components/pets/photos"
import {
  reservationDate,
  reservationStatus,
} from "@/components/reservations/reservations-view"
import { Photo } from "@/components/site/site-ui"
import { formatAmount, PageBody } from "@/components/today/widgets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toastManager } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const invoiceStatus = {
  draft: { label: "Brouillon", variant: "secondary" },
  overdue: { label: "En retard", variant: "error" },
  paid: { label: "Payée", variant: "success" },
  pending: { label: "À encaisser", variant: "warning" },
} as const

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-3xl bg-muted p-5">
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-muted-foreground">{label}</p>
    </div>
  )
}

function Contact({
  icon,
  label,
  value,
  href,
}: {
  icon: IconSvgElement
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon className="size-5" icon={icon} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="truncate font-semibold">{value}</p>
      </div>
      {href && (
        <Button
          aria-label={label}
          render={<a href={href} />}
          size="icon"
          variant="secondary"
        >
          <HugeiconsIcon icon={icon} />
        </Button>
      )}
    </div>
  )
}

export function ClientProfile({ slug }: { slug: string }) {
  const client = findClient(slug)!
  const first = client.name.split(" ")[0]
  const history = [...client.reservations].sort((a, b) => b.start - a.start)
  const phone = client.phone.replace(/\s/g, "")
  const ghost = "border-transparent bg-white/15 text-white hover:bg-white/25"

  return (
    <PageBody>
      <Link
        className="inline-flex items-center gap-2 font-semibold"
        href="/clients"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-secondary">
          <HugeiconsIcon className="size-5" icon={ArrowLeft01Icon} />
        </span>
        Clients et animaux
      </Link>

      <section className="grid overflow-hidden rounded-3xl bg-wise-forest text-white lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6 p-6 md:p-10">
          {client.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {client.tags.map((tag) => (
                <span
                  className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-wise-green font-display text-4xl text-wise-forest md:size-28">
              {client.initials}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-white/70">
                Client depuis {client.since} · {client.city}
              </p>
              <h1 className="font-display text-5xl text-wise-green md:text-7xl">
                {client.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {client.pets.map((p) => {
                const profile = petByName(p.name, client.name)
                const key = profile?.slug ?? p.name
                return (
                  <span
                    className={cn(
                      "block size-12 rounded-full p-0.5",
                      petTone(key)
                    )}
                    key={p.name}
                  >
                    <Photo
                      alt={p.name}
                      className="size-full rounded-full"
                      sizes="48px"
                      src={petPhoto(key, p.species)}
                    />
                  </span>
                )
              })}
            </div>
            <p className="font-semibold">
              {client.pets.map((p) => p.name).join(", ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button render={<a href={`tel:${phone}`} />} size="lg">
              <HugeiconsIcon icon={Call02Icon} />
              Appeler
            </Button>
            <Button
              className={ghost}
              render={<Link href="/messages" />}
              size="lg"
              variant="outline"
            >
              <HugeiconsIcon icon={Message01Icon} />
              Écrire
            </Button>
            <NewStayDialog
              defaultClient={client.name}
              trigger={
                <Button className={ghost} size="lg" variant="outline">
                  <HugeiconsIcon icon={Calendar03Icon} />
                  Nouveau séjour
                </Button>
              }
            />
          </div>
        </div>

        <aside className="flex flex-col gap-3 bg-white/10 p-6 md:p-8">
          {client.balance > 0 ? (
            <>
              <p className="flex items-center gap-2 font-semibold text-white/70">
                <HugeiconsIcon className="size-5" icon={Alert02Icon} />
                Solde à régler
              </p>
              <p className="text-5xl font-semibold text-wise-orange tabular-nums">
                {formatAmount(client.balance)}
              </p>
              <Button
                className="mt-2 self-start"
                onClick={() =>
                  toastManager.add({
                    title: `Lien de paiement envoyé à ${first}`,
                    type: "success",
                  })
                }
              >
                Envoyer un lien de paiement
              </Button>
            </>
          ) : (
            <>
              <span className="flex size-12 items-center justify-center rounded-full bg-wise-green text-wise-forest">
                <HugeiconsIcon
                  className="size-6"
                  icon={Tick02Icon}
                  strokeWidth={2.5}
                />
              </span>
              <p className="text-2xl font-semibold">Tout est réglé</p>
            </>
          )}
          {client.spent > 0 && (
            <p className="mt-auto text-white/70">
              {formatAmount(client.spent)} réglés depuis {client.since}
            </p>
          )}
        </aside>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="réservations" value={client.reservations.length} />
        <Stat
          label={client.pets.length > 1 ? "animaux" : "animal"}
          value={client.pets.length}
        />
        <Stat label="réglés" value={formatAmount(client.spent)} />
        <Stat
          label={
            client.nextVisit !== undefined
              ? "prochaine visite"
              : "dernière visite"
          }
          value={
            client.nextVisit !== undefined
              ? relativeDate(client.nextVisit)
              : client.lastVisit !== undefined
                ? relativeDate(client.lastVisit)
                : "—"
          }
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-10">
          <Section
            title={client.pets.length > 1 ? "Ses animaux" : "Son animal"}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {client.pets.map((p) => {
                const profile = petByName(p.name, client.name)
                const key = profile?.slug ?? p.name
                return (
                  <Link
                    className={cn(
                      "flex flex-col overflow-hidden rounded-3xl p-3 transition-transform hover:scale-[0.98]",
                      petTone(key)
                    )}
                    href={petHref(p.name, client.name)}
                    key={p.name}
                  >
                    <Photo
                      alt={p.name}
                      className="aspect-4/3 rounded-2xl"
                      sizes="(min-width: 640px) 360px, 100vw"
                      src={petPhoto(key, p.species)}
                    />
                    <div className="flex items-end justify-between gap-3 px-2 pt-4 pb-1">
                      <div className="min-w-0">
                        <p className="truncate font-display text-4xl">
                          {p.name}
                        </p>
                        <p className="truncate font-semibold opacity-80">
                          {p.breed || p.species}
                        </p>
                      </div>
                      <span className="flex shrink-0 gap-1">
                        {p.activities.map((a) => (
                          <ActivityMark
                            activity={a}
                            className="size-6 ring-2 ring-white/80"
                            key={a}
                          />
                        ))}
                      </span>
                    </div>
                    {p.care && (
                      <p className="mx-2 mt-3 mb-1 rounded-2xl bg-white/60 px-3 py-2 text-sm font-semibold">
                        {p.care}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          </Section>

          <Section title="Historique">
            {history.length ? (
              <div className="divide-y overflow-hidden rounded-3xl border bg-card">
                {history.map((r) => (
                  <div className="flex items-center gap-4 px-5 py-4" key={r.id}>
                    <ActivityMark
                      activity={r.activity}
                      className="size-10 text-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {r.pet} · {r.title}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {reservationDate(r)}
                      </p>
                    </div>
                    <Badge variant={reservationStatus[r.status].variant}>
                      {reservationStatus[r.status].label}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-3xl bg-muted p-6 text-muted-foreground">
                Aucune réservation récente.
              </p>
            )}
          </Section>

          {client.invoices.length > 0 && (
            <Section title="Factures">
              <div className="divide-y overflow-hidden rounded-3xl border bg-card">
                {client.invoices.map((invoice) => (
                  <div
                    className="flex items-center gap-4 px-5 py-4"
                    key={invoice.id}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {invoice.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.number} · {shortDate(invoice.issued)}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="font-semibold tabular-nums">
                        {formatAmount(invoiceTotal(invoice))}
                      </p>
                      <Badge variant={invoiceStatus[invoice.status].variant}>
                        {invoiceStatus[invoice.status].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold">Coordonnées</h2>
            <div className="divide-y overflow-hidden rounded-3xl border bg-card">
              <Contact
                href={`tel:${phone}`}
                icon={Call02Icon}
                label="Téléphone"
                value={client.phone}
              />
              <Contact
                href={`mailto:${client.email}`}
                icon={Mail01Icon}
                label="E-mail"
                value={client.email}
              />
              <Contact
                icon={Location01Icon}
                label="Ville"
                value={client.city}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold">Activités</h2>
            <div className="flex flex-wrap gap-2">
              {client.activities.map((a) => (
                <span
                  className="flex h-9 items-center gap-2 rounded-full bg-muted px-3 font-semibold"
                  key={a}
                >
                  <ActivityMark activity={a} />
                  {a}
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold">
              Notes internes
            </h2>
            <Textarea
              aria-label="Notes internes"
              placeholder={`Préférences de ${first}, consignes particulières…`}
              rows={5}
            />
            <p className="text-sm text-muted-foreground">
              Visibles seulement par votre équipe.
            </p>
          </section>
        </div>
      </div>
    </PageBody>
  )
}
