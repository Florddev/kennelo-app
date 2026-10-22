"use client"

import { ArrowLeft01Icon, ArrowUp02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  markRead,
  sendMessage,
  useSite,
  type Venue,
  venueOf,
} from "@/components/site/data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const suggestions = [
  "Avez-vous de la place pour les vacances ?",
  "Peut-on visiter avant de réserver ?",
  "Que faut-il apporter ?",
]

function VenueDot({ venue, className }: { venue: Venue; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full font-display text-xl",
        venue.tone,
        className
      )}
    >
      {venue.name[0]}
    </span>
  )
}

export function ClientMessages({ initialVenue }: { initialVenue?: string }) {
  const { threads } = useSite()
  const [openSlug, setOpenSlug] = useState<string | null>(initialVenue ?? null)
  const [draft, setDraft] = useState("")
  const end = useRef<HTMLDivElement>(null)
  const venue = openSlug ? venueOf(openSlug) : undefined
  const thread = threads.find((t) => t.venue === openSlug)
  const list = [
    ...(openSlug && !thread
      ? [{ messages: [], unread: 0, venue: openSlug }]
      : []),
    ...threads,
  ]
  const desktopSlug = openSlug ?? threads[0]?.venue
  const shown = venue ?? (desktopSlug ? venueOf(desktopSlug) : undefined)
  const shownThread = threads.find((t) => t.venue === shown?.slug)

  useEffect(() => {
    if (shown && shownThread?.unread) markRead(shown.slug)
    end.current?.scrollIntoView({ block: "end" })
  }, [shown, shownThread?.unread, shownThread?.messages.length])

  const send = (text: string) => {
    if (!shown || !text.trim()) return
    sendMessage(shown.slug, text.trim())
    setDraft("")
  }

  return (
    <div className="mx-auto flex h-[calc(100svh-4rem-4.5rem)] w-full max-w-6xl md:h-[calc(100svh-5rem)] md:px-10 md:py-6">
      <aside
        className={cn(
          "flex w-full flex-col md:w-80 md:shrink-0 md:border-e md:pe-4",
          openSlug && "max-md:hidden"
        )}
      >
        <h1 className="px-4 pt-6 pb-4 font-heading text-3xl font-semibold md:px-0 md:pt-0">
          Messages
        </h1>
        <div className="flex-1 space-y-1 overflow-y-auto px-2 md:px-0">
          {list.map((t) => {
            const v = venueOf(t.venue)
            if (!v) return null
            const last = t.messages[t.messages.length - 1]
            return (
              <button
                aria-current={shown?.slug === v.slug ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl p-3 text-start transition-colors hover:bg-accent",
                  shown?.slug === v.slug && "md:bg-accent"
                )}
                key={t.venue}
                onClick={() => setOpenSlug(v.slug)}
                type="button"
              >
                <VenueDot venue={v} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold">{v.name}</span>
                    {last && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {last.time.split(" · ")[0]}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-sm",
                      t.unread
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {last
                      ? `${last.mine ? "Vous : " : ""}${last.text}`
                      : "Nouvelle conversation"}
                  </span>
                </span>
                {t.unread > 0 && (
                  <span className="size-2.5 shrink-0 rounded-full bg-destructive" />
                )}
              </button>
            )
          })}
        </div>
      </aside>

      <section
        className={cn(
          "flex min-w-0 flex-1 flex-col md:ps-6",
          !openSlug && "max-md:hidden"
        )}
      >
        {shown ? (
          <>
            <header className="flex items-center gap-3 border-b px-4 py-3 md:px-0 md:pt-0">
              <Button
                aria-label="Retour"
                className="md:hidden"
                onClick={() => setOpenSlug(null)}
                size="icon"
                variant="ghost"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} />
              </Button>
              <VenueDot className="size-10 text-lg" venue={shown} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{shown.name}</p>
                <p className="text-sm text-muted-foreground">
                  {shown.response}
                </p>
              </div>
              <Button
                render={<Link href={`/places/${shown.slug}`} />}
                variant="secondary"
              >
                Voir
              </Button>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-6 md:px-0">
              {!shownThread?.messages.length && (
                <div className="mx-auto max-w-sm space-y-4 py-10 text-center">
                  <p className="text-lg font-semibold">
                    Posez votre question à {shown.name}
                  </p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((s) => (
                      <Button
                        key={s}
                        onClick={() => setDraft(s)}
                        variant="secondary"
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {shownThread?.messages.map((m, i) => (
                <div
                  className={cn(
                    "flex flex-col gap-1",
                    m.mine ? "items-end" : "items-start"
                  )}
                  key={i}
                >
                  <p
                    className={cn(
                      "max-w-[80%] rounded-3xl px-4 py-2.5",
                      m.mine ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {m.text}
                  </p>
                  <span className="px-2 text-xs text-muted-foreground">
                    {m.time}
                  </span>
                </div>
              ))}
              <div ref={end} />
            </div>
            <form
              className="flex items-end gap-2 border-t px-4 py-3 md:px-0 md:pb-0"
              onSubmit={(e) => {
                e.preventDefault()
                send(draft)
              }}
            >
              <textarea
                aria-label="Votre message"
                className="max-h-32 min-h-12 flex-1 resize-none rounded-3xl bg-muted px-4 py-3 outline-none placeholder:text-placeholder focus-visible:ring-2 focus-visible:ring-ring"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send(draft)
                  }
                }}
                placeholder="Écrivez votre message"
                rows={1}
                value={draft}
              />
              <Button
                aria-label="Envoyer"
                disabled={!draft.trim()}
                size="icon-lg"
                type="submit"
              >
                <HugeiconsIcon icon={ArrowUp02Icon} />
              </Button>
            </form>
          </>
        ) : (
          <p className="m-auto text-muted-foreground">Aucune conversation.</p>
        )}
      </section>
    </div>
  )
}
