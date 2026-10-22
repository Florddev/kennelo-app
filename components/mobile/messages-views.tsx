"use client"

import {
  ArrowRight01Icon,
  PlusSignIcon,
  SentIcon,
  Store01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  RoundButton,
  Section,
  TabHeader,
  TopBar,
  VenueAvatar,
} from "@/components/mobile/mobile-ui"
import {
  isUpcoming,
  markRead,
  type MyBooking,
  sendMessage,
  useSite,
  venueOf,
} from "@/components/site/data"
import {
  activityIcons,
  bookingDates,
  VenueLogo,
} from "@/components/site/site-ui"
import { cn } from "@/lib/utils"

/** La réservation dont parle sans doute la conversation : la prochaine, sinon la dernière. */
function bookingWith(bookings: MyBooking[], venue: string) {
  const list = bookings
    .filter((b) => b.venue === venue && b.status !== "cancelled")
    .sort((a, b) => a.start.localeCompare(b.start))
  return list.find(isUpcoming) ?? list[list.length - 1]
}

function Context({ booking }: { booking?: MyBooking }) {
  if (!booking) return null
  return (
    <span className="flex items-center gap-1.5 text-sm font-semibold">
      <HugeiconsIcon
        className="size-4"
        icon={activityIcons[booking.activity]}
      />
      {booking.activity} · {bookingDates(booking)}
    </span>
  )
}

export function MobileInbox() {
  const { threads, bookings } = useSite()
  const unread = threads.filter((t) => t.unread > 0)
  const others = threads.filter((t) => !t.unread)
  const count = unread.reduce((n, t) => n + t.unread, 0)

  return (
    <div className="space-y-8">
      <TabHeader
        eyebrow={
          count
            ? `${count} message${count > 1 ? "s" : ""} à lire`
            : "Vous êtes à jour"
        }
        title="Messages"
      />

      {unread.map((t) => {
        const venue = venueOf(t.venue)
        const last = t.messages[t.messages.length - 1]
        if (!venue || !last) return null
        return (
          <Link
            className={cn(
              "mx-4 block space-y-4 rounded-3xl p-5 transition-transform active:scale-[0.98]",
              venue.tone
            )}
            href={`/mobile/messages/${venue.slug}`}
            key={t.venue}
          >
            <div className="flex items-center gap-3">
              <VenueAvatar className="bg-white/60" venue={venue} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold">{venue.name}</p>
                <Context booking={bookingWith(bookings, venue.slug)} />
              </div>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-destructive px-2 text-sm font-bold text-white">
                {t.unread}
                <span className="sr-only"> non lus</span>
              </span>
            </div>
            <p className="rounded-3xl rounded-tl-md bg-white/75 px-4 py-3 text-lg text-wise-forest">
              {last.text}
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold opacity-80">
                {last.time}
              </span>
              <span className="flex min-h-11 items-center gap-2 rounded-full bg-wise-forest px-5 font-semibold text-wise-green">
                Répondre
                <HugeiconsIcon className="size-5" icon={ArrowRight01Icon} />
              </span>
            </div>
          </Link>
        )
      })}

      {others.length > 0 && (
        <Section title={unread.length ? "Les autres" : "Vos conversations"}>
          <ul className="divide-y px-4">
            {others.map((t) => {
              const venue = venueOf(t.venue)
              const last = t.messages[t.messages.length - 1]
              if (!venue) return null
              return (
                <li key={t.venue}>
                  <Link
                    className="flex items-center gap-4 py-4 transition-opacity active:opacity-70"
                    href={`/mobile/messages/${venue.slug}`}
                  >
                    <VenueAvatar className="size-16" venue={venue} />
                    <span className="min-w-0 flex-1 space-y-0.5">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-lg font-semibold">
                          {venue.name}
                        </span>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {last?.time}
                        </span>
                      </span>
                      <span className="block truncate text-muted-foreground">
                        {last
                          ? `${last.mine ? "Vous : " : ""}${last.text}`
                          : ""}
                      </span>
                      <span className="block text-muted-foreground">
                        <Context booking={bookingWith(bookings, venue.slug)} />
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      <Link
        className="mx-4 flex items-center gap-4 rounded-3xl border-2 border-dashed p-4 transition-colors active:bg-accent"
        href="/mobile/explore"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <HugeiconsIcon className="size-6" icon={PlusSignIcon} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">
            Écrire à un autre établissement
          </span>
          <span className="block text-muted-foreground">
            Depuis sa page, touchez « Écrire »
          </span>
        </span>
      </Link>

      {threads.length === 0 && (
        <p className="px-4 text-muted-foreground">
          Écrivez à un établissement depuis sa page : sa réponse arrivera ici.
        </p>
      )}
    </div>
  )
}

const suggestions = [
  "Bonjour, avez-vous de la place ?",
  "Comment va mon animal ?",
  "Merci beaucoup !",
]

export function MobileThread({ slug }: { slug: string }) {
  const { threads } = useSite()
  const venue = venueOf(slug)!
  const thread = threads.find((t) => t.venue === slug)
  const messages = thread?.messages ?? []
  const [draft, setDraft] = useState("")
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (thread?.unread) markRead(slug)
    end.current?.scrollIntoView({ block: "end" })
  }, [slug, thread?.unread, messages.length])

  const send = (text: string) => {
    if (!text.trim()) return
    sendMessage(slug, text.trim())
    setDraft("")
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        action={
          <RoundButton
            href={`/mobile/places/${slug}`}
            icon={Store01Icon}
            label={`Voir la page de ${venue.name}`}
          />
        }
        back="/mobile/messages"
        className="border-b"
        title={
          <span className="flex items-center gap-3">
            <VenueLogo className="size-10 text-base" venue={venue} />
            <span className="min-w-0">
              <span className="block truncate">{venue.name}</span>
              <span className="block truncate text-sm font-normal text-muted-foreground">
                {venue.response}
              </span>
            </span>
          </span>
        }
      />

      <div className="flex-1 space-y-3 px-4 py-6">
        {messages.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">
            Posez votre question : {venue.name} vous répond ici.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            className={cn(
              "flex flex-col",
              m.mine ? "items-end" : "items-start"
            )}
            key={i}
          >
            <p
              className={cn(
                "max-w-[85%] rounded-3xl px-4 py-3 text-pretty",
                m.mine
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md bg-muted"
              )}
            >
              {m.text}
            </p>
            <span className="mt-1 px-2 text-sm text-muted-foreground">
              {m.time}
            </span>
          </div>
        ))}
        <div ref={end} />
      </div>

      <div className="sticky bottom-0 space-y-3 border-t bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4">
          {suggestions.map((s) => (
            <button
              className="min-h-11 shrink-0 rounded-full border px-4 font-semibold"
              key={s}
              onClick={() => send(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            send(draft)
          }}
        >
          <label className="sr-only" htmlFor="draft">
            Votre message
          </label>
          <textarea
            className="max-h-32 min-h-12 flex-1 resize-none rounded-3xl bg-secondary px-4 py-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            id="draft"
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écrire un message…"
            rows={1}
            value={draft}
          />
          <button
            aria-label="Envoyer"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
            disabled={!draft.trim()}
            type="submit"
          >
            <HugeiconsIcon className="size-6" icon={SentIcon} />
          </button>
        </form>
      </div>
    </div>
  )
}
