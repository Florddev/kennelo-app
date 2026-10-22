"use client"

import { SentIcon, Store01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useRef, useState } from "react"
import {
  RoundButton,
  Row,
  Rows,
  TabHeader,
  TopBar,
} from "@/components/mobile/mobile-ui"
import { markRead, sendMessage, useSite, venueOf } from "@/components/site/data"
import { VenueLogo } from "@/components/site/site-ui"
import { cn } from "@/lib/utils"

export function MobileInbox() {
  const { threads } = useSite()
  return (
    <div className="space-y-6">
      <TabHeader title="Messages" />
      {threads.length ? (
        <Rows>
          {threads.map((t) => {
            const venue = venueOf(t.venue)
            const last = t.messages[t.messages.length - 1]
            if (!venue) return null
            return (
              <Row
                aside={
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-sm text-muted-foreground">
                      {last?.time}
                    </span>
                    {t.unread > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-sm font-bold text-white">
                        {t.unread}
                        <span className="sr-only"> non lus</span>
                      </span>
                    )}
                  </span>
                }
                chevron={false}
                href={`/mobile/messages/${venue.slug}`}
                key={t.venue}
                media={<VenueLogo className="size-14 text-2xl" venue={venue} />}
                text={
                  <span
                    className={cn(
                      "line-clamp-2",
                      t.unread > 0 && "font-semibold text-foreground"
                    )}
                  >
                    {last ? `${last.mine ? "Vous : " : ""}${last.text}` : ""}
                  </span>
                }
                title={venue.name}
              />
            )
          })}
        </Rows>
      ) : (
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
