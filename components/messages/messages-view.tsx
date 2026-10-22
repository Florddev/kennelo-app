"use client"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpIcon,
  Attachment01Icon,
  Calendar03Icon,
  Call02Icon,
  PlusSignIcon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useId, useState } from "react"
import { type Activity, ActivityMark } from "@/components/activity-mark"
import { ChatConversation } from "@/components/chat/chat-conversation"
import { ChatDatePill } from "@/components/chat/chat-date-pill"
import { ChatDeliveryIndicator } from "@/components/chat/chat-delivery-indicator"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatMessageActionToolbar } from "@/components/chat/chat-message-actions"
import { ChatReactionChip } from "@/components/chat/chat-reaction-chip"
import { ChatReactionPicker } from "@/components/chat/chat-reaction-picker"
import { ChatTypingIndicator } from "@/components/chat/chat-typing-indicator"
import { ChatUnreadDivider } from "@/components/chat/chat-unread-divider"
import { useChatScroll } from "@/components/chat/hooks/use-chat-scroll"
import {
  type Booking,
  type BookingEntry,
  type BookingEvent,
  type BookingStatus,
  type ChatEntry,
  type Conversation,
  conversations as initialConversations,
  type Message,
  quickReplies,
  reactionOptions,
} from "@/components/messages/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Composer,
  ComposerActionGroup,
  ComposerActions,
  ComposerInput,
  ComposerSubmit,
  type ComposerValue,
  getComposerText,
} from "@/components/ui/composer"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu"
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

type Filter = "all" | "unread" | "ongoing"

const statusLabels = {
  delivered: "Distribué",
  failed: "Échec de l'envoi",
  read: "Lu",
  sending: "Envoi en cours",
  sent: "Envoyé",
} as const

const bookingStatus = {
  cancelled: { label: "Annulée", variant: "error" },
  done: { label: "Terminée", variant: "secondary" },
  ongoing: { label: "En cours", variant: "success" },
  pending: { label: "À confirmer", variant: "warning" },
  upcoming: { label: "À venir", variant: "info" },
} as const satisfies Record<BookingStatus, { label: string; variant: string }>

const statusOrder: BookingStatus[] = [
  "ongoing",
  "pending",
  "upcoming",
  "done",
  "cancelled",
]

const isActive = (booking: Booking) =>
  booking.status === "ongoing" ||
  booking.status === "pending" ||
  booking.status === "upcoming"

const sortBookings = (bookings: Booking[]) =>
  [...bookings].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  )

const activeActivities = (bookings: Booking[]) => [
  ...new Set(sortBookings(bookings.filter(isActive)).map((b) => b.activity)),
]

const formatEuro = (amount: number) => `${amount} €`

const nowTime = () =>
  new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

const newId = () => `new-${Date.now()}`

const bookingEntry = (
  bookingId: string,
  event: BookingEvent
): BookingEntry => ({
  bookingId,
  day: "Aujourd'hui",
  event,
  id: newId(),
  kind: "booking",
  time: nowTime(),
})

function eventLabel(event: BookingEvent, booking: Booking) {
  switch (event) {
    case "created":
      return "Nouvelle demande de réservation"
    case "confirmed":
      return "Réservation confirmée"
    case "started":
      return booking.activity === "Pension"
        ? "Arrivée enregistrée"
        : "Prestation commencée"
    case "shared":
      return "Réservation partagée"
  }
}

function groupByDay(entries: ChatEntry[]) {
  const days: { day: string; entries: ChatEntry[] }[] = []
  for (const entry of entries) {
    const last = days[days.length - 1]
    if (last?.day === entry.day) last.entries.push(entry)
    else days.push({ day: entry.day, entries: [entry] })
  }
  return days
}

function ClientAvatar({
  initials,
  className,
}: {
  initials: string
  className?: string
}) {
  return (
    <Avatar aria-hidden="true" className={cn("size-7 text-xs", className)}>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

function toggleReaction(message: Message, emoji: string): Message {
  const reactions = message.reactions ?? []
  const current = reactions.find((r) => r.emoji === emoji)
  if (!current) {
    return {
      ...message,
      reactions: [...reactions, { count: 1, emoji, selected: true }],
    }
  }
  const count = current.count + (current.selected ? -1 : 1)
  return {
    ...message,
    reactions: reactions
      .map((r) =>
        r.emoji === emoji ? { ...r, count, selected: !r.selected } : r
      )
      .filter((r) => r.count > 0),
  }
}

function BookingSummary({
  booking,
  onClick,
  footer,
}: {
  booking: Booking
  onClick: () => void
  footer?: boolean
}) {
  const status = bookingStatus[booking.status]
  return (
    <button
      className="w-full rounded-xl border bg-card p-3 text-start shadow-xs/5 transition-colors hover:bg-accent/50"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        <ActivityMark
          activity={booking.activity}
          className="size-8 rounded-lg text-xs"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{booking.title}</p>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {booking.pet} · {booking.dates}
          </p>
        </div>
      </div>
      {footer && (
        <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs">
          <span className="text-muted-foreground">
            {booking.activity} · {formatEuro(booking.amount)}
          </span>
          <span className="flex items-center gap-1 font-medium">
            Voir la réservation
            <HugeiconsIcon className="size-3.5" icon={ArrowRight01Icon} />
          </span>
        </div>
      )}
    </button>
  )
}

function BookingCard({
  booking,
  entry,
  onOpen,
}: {
  booking: Booking
  entry: BookingEntry
  onOpen: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-sm space-y-1.5">
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <HugeiconsIcon className="size-3.5" icon={Calendar03Icon} />
        {eventLabel(entry.event, booking)} · {entry.time}
      </p>
      <BookingSummary booking={booking} footer onClick={onOpen} />
    </div>
  )
}

function ActiveBookingsBar({
  bookings,
  onOpen,
  onShowAll,
}: {
  bookings: Booking[]
  onOpen: (id: string) => void
  onShowAll: () => void
}) {
  const active = sortBookings(bookings.filter(isActive))
  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-y bg-muted/40 px-4 py-2">
      {active.length === 0 && (
        <span className="text-xs text-muted-foreground">
          Aucune réservation en cours ou à venir
        </span>
      )}
      {active.map((booking) => (
        <button
          className="flex shrink-0 items-center gap-2 rounded-lg border bg-background py-1.5 ps-1.5 pe-2.5 text-start hover:bg-accent"
          key={booking.id}
          onClick={() => onOpen(booking.id)}
          type="button"
        >
          <ActivityMark activity={booking.activity} className="size-6" />
          <span className="leading-tight">
            <span className="flex items-center gap-1.5 text-xs font-medium">
              {booking.status === "ongoing" && (
                <span className="size-1.5 animate-pulse rounded-full bg-success" />
              )}
              {booking.title}
            </span>
            <span className="block text-[0.6875rem] text-muted-foreground">
              {bookingStatus[booking.status].label} · {booking.dates}
            </span>
          </span>
        </button>
      ))}
      <Button
        className="ms-auto shrink-0"
        onClick={onShowAll}
        size="xs"
        variant="ghost"
      >
        <HugeiconsIcon icon={Calendar03Icon} />
        Toutes ({bookings.length})
      </Button>
    </div>
  )
}

function BookingSheet({
  conversation,
  bookingId,
  open,
  onOpenChange,
  onSelect,
  onShare,
  onConfirm,
}: {
  conversation: Conversation
  bookingId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (id: string | null) => void
  onShare: (id: string) => void
  onConfirm: (id: string) => void
}) {
  const booking = conversation.bookings.find((b) => b.id === bookingId)
  const sorted = sortBookings(conversation.bookings)
  const sections = [
    { bookings: sorted.filter(isActive), label: "En cours et à venir" },
    { bookings: sorted.filter((b) => !isActive(b)), label: "Passées" },
  ]

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup variant="inset">
        {booking ? (
          <>
            <SheetHeader>
              <Button
                className="-ms-2 w-fit"
                onClick={() => onSelect(null)}
                size="xs"
                variant="ghost"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} />
                Toutes les réservations
              </Button>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <ActivityMark
                  activity={booking.activity}
                  className="size-4 rounded text-[0.5rem]"
                />
                {booking.activity} · {booking.reference}
              </span>
              <SheetTitle>{booking.title}</SheetTitle>
              <SheetDescription>
                {booking.pet} · {booking.dates}
              </SheetDescription>
            </SheetHeader>
            <SheetPanel className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Montant</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatEuro(booking.amount)}
                  </p>
                </div>
                <Badge
                  size="lg"
                  variant={bookingStatus[booking.status].variant}
                >
                  {bookingStatus[booking.status].label}
                </Badge>
              </div>
              <dl className="divide-y rounded-xl border text-sm">
                {[
                  ["Client", conversation.client],
                  ["Animal", booking.pet],
                  ["Dates", booking.dates],
                  ...booking.details.map((detail, i) => [
                    i === 0 ? "Détails" : "",
                    detail,
                  ]),
                ].map(([label, value]) => (
                  <div className="flex gap-4 px-4 py-2.5" key={value}>
                    <dt className="w-20 shrink-0 text-muted-foreground">
                      {label}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <section className="space-y-2">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Dans la conversation
                </h3>
                {conversation.entries.some(
                  (e) => e.kind === "booking" && e.bookingId === booking.id
                ) ? (
                  <ol className="ms-1 space-y-2 border-s ps-4">
                    {conversation.entries.map(
                      (entry) =>
                        entry.kind === "booking" &&
                        entry.bookingId === booking.id && (
                          <li className="relative text-sm" key={entry.id}>
                            <span className="absolute start-[calc(-1rem-4.5px)] top-1.5 size-2 rounded-full bg-muted-foreground/40" />
                            {eventLabel(entry.event, booking)}
                            <span className="text-muted-foreground">
                              {" "}
                              · {entry.day} à {entry.time}
                            </span>
                          </li>
                        )
                    )}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pas encore mentionnée dans la conversation.
                  </p>
                )}
              </section>
            </SheetPanel>
            <SheetFooter>
              <Button onClick={() => onShare(booking.id)} variant="outline">
                Partager dans la conversation
              </Button>
              {booking.status === "pending" && (
                <Button onClick={() => onConfirm(booking.id)}>
                  Confirmer la réservation
                </Button>
              )}
            </SheetFooter>
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Réservations de {conversation.client}</SheetTitle>
              <SheetDescription>
                {conversation.bookings.length} réservations · toutes activités
                confondues
              </SheetDescription>
            </SheetHeader>
            <SheetPanel className="space-y-6">
              {sections.map(
                (section) =>
                  section.bookings.length > 0 && (
                    <section className="space-y-2" key={section.label}>
                      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {section.label}
                      </h3>
                      {section.bookings.map((b) => (
                        <BookingSummary
                          booking={b}
                          key={b.id}
                          onClick={() => onSelect(b.id)}
                        />
                      ))}
                    </section>
                  )
              )}
            </SheetPanel>
          </>
        )}
      </SheetPopup>
    </Sheet>
  )
}

function ConversationPane({
  conversation,
  onChange,
}: {
  conversation: Conversation
  onChange: (update: (conversation: Conversation) => Conversation) => void
}) {
  const [draft, setDraft] = useState<ComposerValue>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetBookingId, setSheetBookingId] = useState<string | null>(null)
  const hintId = useId()
  const touchInput = useMediaQuery({ pointer: "coarse" })
  const { entries, bookings } = conversation
  const firstName = conversation.client.split(" ")[0]
  const scroll = useChatScroll({
    itemCount: entries.length,
    layoutKey: conversation.typing ? "typing" : "idle",
  })

  const replies = activeActivities(bookings).flatMap((activity) => {
    const pet = sortBookings(bookings).find((b) => b.activity === activity)?.pet
    return quickReplies[activity].map((reply) => ({
      ...reply,
      activity,
      text: reply.text.replaceAll("{pet}", pet ?? ""),
    }))
  })

  const { atBottomRef } = scroll

  const addEntry = (entry: ChatEntry) => {
    atBottomRef.current = true
    onChange((c) => ({ ...c, entries: [...c.entries, entry] }))
  }

  const openBooking = (id: string | null) => {
    setSheetBookingId(id)
    setSheetOpen(true)
  }

  const share = (id: string) => {
    addEntry(bookingEntry(id, "shared"))
    setSheetOpen(false)
  }

  const confirm = (id: string) => {
    atBottomRef.current = true
    onChange((c) => ({
      ...c,
      bookings: c.bookings.map((b) =>
        b.id === id ? { ...b, status: "upcoming" } : b
      ),
      entries: [...c.entries, bookingEntry(id, "confirmed")],
    }))
  }

  const react = (id: string, emoji: string) =>
    onChange((c) => ({
      ...c,
      entries: c.entries.map((e) =>
        e.kind === "message" && e.id === id ? toggleReaction(e, emoji) : e
      ),
    }))

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 px-4">
        <ClientAvatar className="size-8" initials={conversation.initials} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{conversation.client}</p>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.pets.join(" · ")}
          </p>
        </div>
        <Button aria-label="Appeler" size="icon-sm" variant="ghost">
          <HugeiconsIcon icon={Call02Icon} />
        </Button>
        <Button size="sm" variant="outline">
          <HugeiconsIcon icon={UserIcon} />
          Fiche client
        </Button>
      </div>

      <ActiveBookingsBar
        bookings={bookings}
        onOpen={openBooking}
        onShowAll={() => openBooking(null)}
      />

      <ChatConversation
        jumpLabel="Derniers messages"
        label={`Conversation avec ${conversation.client}`}
        scroll={scroll}
      >
        <div className="space-y-4 py-4">
          {groupByDay(entries).map((group) => (
            <section className="space-y-4" key={group.day}>
              <ChatDatePill>{group.day}</ChatDatePill>
              {group.entries.map((entry, index) => {
                const previous = group.entries[index - 1]
                return (
                  <div className="space-y-4" key={entry.id}>
                    {entry.id === conversation.unreadFromId && (
                      <ChatUnreadDivider>Nouveaux messages</ChatUnreadDivider>
                    )}
                    {entry.kind === "booking" ? (
                      <BookingCard
                        booking={
                          bookings.find((b) => b.id === entry.bookingId) ??
                          bookings[0]
                        }
                        entry={entry}
                        onOpen={() => openBooking(entry.bookingId)}
                      />
                    ) : (
                      <MessageBubble
                        conversation={conversation}
                        grouped={
                          previous?.kind === "message" &&
                          previous.side === entry.side
                        }
                        message={entry}
                        onReact={(emoji) => react(entry.id, emoji)}
                      />
                    )}
                  </div>
                )
              })}
            </section>
          ))}
          <ChatTypingIndicator
            label={`${firstName} est en train d'écrire…`}
            visible={!!conversation.typing}
          />
        </div>
      </ChatConversation>

      <div className="flex shrink-0 flex-col gap-2.5 px-4 pb-4">
        {replies.length > 0 && (
          <div
            aria-label="Réponses rapides"
            className="flex gap-1.5 overflow-x-auto"
            role="group"
          >
            {replies.map((reply) => (
              <Button
                className="shrink-0 rounded-full"
                key={reply.label}
                onClick={() => setDraft([{ text: reply.text, type: "text" }])}
                size="xs"
                variant="outline"
              >
                <ActivityMark
                  activity={reply.activity}
                  className="size-3.5 rounded-full text-[0.5rem]"
                />
                {reply.label}
              </Button>
            ))}
          </div>
        )}
        <Composer
          onSubmit={(value: ComposerValue) => {
            const text = getComposerText(value).trim()
            if (!text) return
            addEntry({
              day: "Aujourd'hui",
              id: newId(),
              kind: "message",
              side: "outgoing",
              status: "sent",
              text,
              time: nowTime(),
            })
            setDraft([])
          }}
          onValueChange={setDraft}
          submitOnEnter="desktop"
          value={draft}
        >
          <ComposerInput
            aria-describedby={touchInput ? undefined : hintId}
            aria-label={`Message à ${conversation.client}`}
            placeholder={`Écrire à ${firstName}…`}
            render={<textarea />}
          />
          <ComposerActions>
            <ComposerActionGroup>
              <Button
                aria-label="Joindre un fichier"
                size="icon"
                variant="ghost"
              >
                <HugeiconsIcon icon={Attachment01Icon} />
              </Button>
              <Menu>
                <MenuTrigger
                  render={
                    <Button
                      aria-label="Partager une réservation"
                      size="icon"
                      variant="ghost"
                    />
                  }
                >
                  <HugeiconsIcon icon={Calendar03Icon} />
                </MenuTrigger>
                <MenuPopup align="start" side="top">
                  {sortBookings(bookings).map((booking) => (
                    <MenuItem
                      key={booking.id}
                      onClick={() => share(booking.id)}
                    >
                      <ActivityMark
                        activity={booking.activity}
                        className="size-4 rounded text-[0.5rem]"
                      />
                      {booking.title}
                      <span className="ms-auto ps-4 text-xs text-muted-foreground">
                        {booking.dates}
                      </span>
                    </MenuItem>
                  ))}
                </MenuPopup>
              </Menu>
            </ComposerActionGroup>
            <ComposerActionGroup align="end">
              <ComposerSubmit
                render={
                  <Button aria-label="Envoyer" size="icon">
                    <HugeiconsIcon aria-hidden="true" icon={ArrowUpIcon} />
                  </Button>
                }
              />
            </ComposerActionGroup>
          </ComposerActions>
        </Composer>
        {!touchInput && (
          <p className="text-end text-xs text-muted-foreground" id={hintId}>
            Entrée pour envoyer · Maj + Entrée pour un saut de ligne
          </p>
        )}
      </div>

      <BookingSheet
        bookingId={sheetBookingId}
        conversation={conversation}
        onConfirm={confirm}
        onOpenChange={setSheetOpen}
        onSelect={setSheetBookingId}
        onShare={share}
        open={sheetOpen}
      />
    </section>
  )
}

function MessageBubble({
  conversation,
  message,
  grouped,
  onReact,
}: {
  conversation: Conversation
  message: Message
  grouped: boolean
  onReact: (emoji: string) => void
}) {
  const incoming = message.side === "incoming"
  const selected = (message.reactions ?? [])
    .filter((r) => r.selected)
    .map((r) => r.emoji)
  return (
    <ChatMessage
      actions={
        <ChatMessageActionToolbar
          menuChildren={
            <>
              <MenuItem
                onClick={() => navigator.clipboard?.writeText(message.text)}
              >
                Copier le texte
              </MenuItem>
              <MenuItem variant="destructive">Supprimer</MenuItem>
            </>
          }
          moreLabel="Plus d'actions"
          moreTooltip="Plus"
          reactionPicker={(toolbarRef) => (
            <ChatReactionPicker
              inToolbar
              onSelect={onReact}
              options={reactionOptions}
              popupAlign={incoming ? "end" : "start"}
              popupAnchor={toolbarRef}
              popupLabel="Réactions"
              selectedEmojis={selected}
              triggerLabel="Ajouter une réaction"
              triggerTooltip="Réagir"
            />
          )}
          side={message.side}
          toolbarLabel="Actions du message"
        />
      }
      animateEntrance={message.id.startsWith("new-")}
      author={incoming ? conversation.client.split(" ")[0] : undefined}
      avatar={
        incoming ? <ClientAvatar initials={conversation.initials} /> : undefined
      }
      footer={
        <span className="flex items-center gap-1">
          {message.time}
          {message.status && (
            <ChatDeliveryIndicator
              label={statusLabels[message.status]}
              status={message.status}
            />
          )}
        </span>
      }
      grouped={grouped}
      reactions={
        message.reactions?.length ? (
          <>
            {message.reactions.map((r) => (
              <ChatReactionChip
                count={r.count}
                emoji={r.emoji}
                key={r.emoji}
                label={`${r.emoji} ${r.count} réaction${r.count > 1 ? "s" : ""}`}
                onClick={() => onReact(r.emoji)}
                selected={r.selected}
              />
            ))}
          </>
        ) : undefined
      }
      side={message.side}
    >
      {message.text}
    </ChatMessage>
  )
}

function lastPreview(conversation: Conversation) {
  if (conversation.typing) return "En train d'écrire…"
  const last = conversation.entries[conversation.entries.length - 1]
  if (last.kind === "message") return last.text
  const booking = conversation.bookings.find((b) => b.id === last.bookingId)
  return booking
    ? `${eventLabel(last.event, booking)} · ${booking.title}`
    : "Réservation"
}

export function MessagesView() {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState(initialConversations[0].id)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0]
  const hasOngoing = (c: Conversation) =>
    c.bookings.some((b) => b.status === "ongoing")
  const counts = {
    ongoing: conversations.filter(hasOngoing).length,
    unread: conversations.filter((c) => c.unread > 0).length,
  }
  const filtered = conversations.filter(
    (c) =>
      (filter === "all" ||
        (filter === "unread" ? c.unread > 0 : hasOngoing(c))) &&
      `${c.client} ${c.pets.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase())
  )

  const select = (id: string) => {
    setActiveId(id)
    setConversations((list) =>
      list.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-heading text-xl font-semibold">Messages</h1>
        <Button className="ms-auto rounded-full" size="sm" variant="outline">
          <HugeiconsIcon icon={PlusSignIcon} />
          Nouveau message
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-80 shrink-0 flex-col border-e md:flex">
          <div className="space-y-2 p-3">
            <InputGroup>
              <InputGroupAddon>
                <HugeiconsIcon icon={Search01Icon} />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Rechercher une conversation"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Client ou animal…"
                value={query}
              />
            </InputGroup>
            <Tabs
              onValueChange={(value) => setFilter(value as Filter)}
              value={filter}
            >
              <TabsList className="w-full" size="sm">
                <TabsTab className="flex-1" value="all">
                  Toutes
                </TabsTab>
                <TabsTab className="flex-1 gap-1.5" value="unread">
                  Non lues
                  <span className="text-muted-foreground">{counts.unread}</span>
                </TabsTab>
                <TabsTab className="flex-1 gap-1.5" value="ongoing">
                  En cours
                  <span className="text-muted-foreground">
                    {counts.ongoing}
                  </span>
                </TabsTab>
              </TabsList>
            </Tabs>
          </div>
          <nav
            aria-label="Conversations"
            className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2"
          >
            {filtered.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Aucune conversation
              </p>
            )}
            {filtered.map((c) => {
              const last = c.entries[c.entries.length - 1]
              return (
                <button
                  aria-current={c.id === active.id ? "true" : undefined}
                  className={cn(
                    "flex w-full gap-3 rounded-lg p-2.5 text-start hover:bg-accent",
                    c.id === active.id && "bg-accent"
                  )}
                  key={c.id}
                  onClick={() => select(c.id)}
                  type="button"
                >
                  <ClientAvatar className="size-9" initials={c.initials} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {c.client}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {last.day === "Aujourd'hui" ? last.time : last.day}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                        {c.pets.map((pet) => pet.split(" · ")[0]).join(", ")}
                      </p>
                      <span className="flex shrink-0 gap-0.5">
                        {activeActivities(c.bookings).map(
                          (activity: Activity) => (
                            <ActivityMark
                              activity={activity}
                              className="size-3.5 rounded-sm text-[0.5rem]"
                              key={activity}
                            />
                          )
                        )}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-xs",
                          c.unread ? "font-medium" : "text-muted-foreground"
                        )}
                      >
                        {lastPreview(c)}
                      </span>
                      {c.unread > 0 && (
                        <span className="shrink-0 rounded-full bg-pension text-pension-foreground px-1.5 text-xs">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </aside>

        <ConversationPane
          conversation={active}
          key={active.id}
          onChange={(update) =>
            setConversations((list) =>
              list.map((c) => (c.id === active.id ? update(c) : c))
            )
          }
        />
      </div>
    </>
  )
}
