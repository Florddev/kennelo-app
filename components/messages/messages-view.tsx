"use client"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpIcon,
  Attachment01Icon,
  Calendar03Icon,
  Call02Icon,
  InformationCircleIcon,
  Mail01Icon,
  PencilEdit02Icon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
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
import { type Client, clientHref, clients } from "@/components/clients/data"
import { ClientStep } from "@/components/flow/client-steps"
import { FlowDialog } from "@/components/flow/flow"
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
import { petHref } from "@/components/pets/data"
import { formatAmount } from "@/components/today/widgets"
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
import { cn } from "@/lib/utils"

type Filter = "all" | "reply" | "unread" | "ongoing"

const deliveryLabels = {
  delivered: "Distribué",
  failed: "Échec de l'envoi",
  read: "Lu",
  sending: "Envoi en cours",
  sent: "Envoyé",
} as const

const bookingStatus = {
  cancelled: {
    label: "Annulée",
    text: "text-destructive-foreground",
    variant: "error",
  },
  done: {
    label: "Terminée",
    text: "text-muted-foreground",
    variant: "secondary",
  },
  ongoing: {
    label: "En cours",
    text: "text-success-foreground",
    variant: "success",
  },
  pending: {
    label: "À confirmer",
    text: "text-warning-foreground",
    variant: "warning",
  },
  upcoming: {
    label: "À venir",
    text: "text-muted-foreground",
    variant: "info",
  },
} as const satisfies Record<
  BookingStatus,
  { label: string; text: string; variant: string }
>

const statusOrder: BookingStatus[] = [
  "pending",
  "ongoing",
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

const lastEntry = (c: Conversation) => c.entries[c.entries.length - 1]

/** Le client attend une réponse : dernier message de sa part ou demande en attente. */
const needsReply = (c: Conversation) => {
  const last = lastEntry(c)
  return (
    c.bookings.some((b) => b.status === "pending") ||
    (last?.kind === "message" && last.side === "incoming")
  )
}

const hasOngoing = (c: Conversation) =>
  c.bookings.some((b) => b.status === "ongoing")

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
      return "Nouvelle demande"
    case "confirmed":
      return "Réservation confirmée"
    case "declined":
      return "Demande refusée"
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

function lastPreview(c: Conversation) {
  if (c.typing) return "En train d'écrire…"
  const last = lastEntry(c)
  if (!last) return "Nouvelle conversation"
  if (last.kind === "message")
    return last.side === "outgoing" ? `Vous : ${last.text}` : last.text
  const booking = c.bookings.find((b) => b.id === last.bookingId)
  return booking
    ? `${eventLabel(last.event, booking)} · ${booking.title}`
    : "Réservation"
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

function ClientAvatar({
  initials,
  activity,
  className,
}: {
  initials: string
  activity?: Activity
  className?: string
}) {
  return (
    <span aria-hidden="true" className="relative shrink-0">
      <Avatar className={cn("size-12", className)}>
        <AvatarFallback className="font-semibold">{initials}</AvatarFallback>
      </Avatar>
      {activity && (
        <ActivityMark
          activity={activity}
          className="absolute -inset-e-0.5 -bottom-0.5 size-5 ring-2 ring-background"
        />
      )}
    </span>
  )
}

/** Une réservation, présentée comme une ligne de transaction Wise. */
function BookingRow({
  booking,
  eyebrow,
  onClick,
}: {
  booking: Booking
  eyebrow?: string
  onClick: () => void
}) {
  const status = bookingStatus[booking.status]
  return (
    <button
      className="flex w-full items-center gap-3 rounded-2xl p-3 text-start transition-colors hover:bg-accent"
      onClick={onClick}
      type="button"
    >
      <ActivityMark activity={booking.activity} className="size-10 text-sm" />
      <span className="min-w-0 flex-1">
        {eyebrow && (
          <span className="block truncate text-sm text-muted-foreground">
            {eyebrow}
          </span>
        )}
        <span className="block truncate font-semibold">{booking.title}</span>
        <span className="block truncate text-sm text-muted-foreground">
          {booking.pet} · {booking.dates}
        </span>
      </span>
      <span className="shrink-0 text-end">
        <span className="block font-semibold tabular-nums">
          {formatAmount(booking.amount)}
        </span>
        <span className={cn("block text-sm font-semibold", status.text)}>
          {status.label}
        </span>
      </span>
    </button>
  )
}

function ConversationRow({
  conversation: c,
  active,
  onClick,
}: {
  conversation: Conversation
  active: boolean
  onClick: () => void
}) {
  const last = lastEntry(c)
  const strong = c.unread > 0
  return (
    <button
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl p-3 text-start transition-colors hover:bg-accent",
        active && "bg-accent"
      )}
      onClick={onClick}
      type="button"
    >
      <ClientAvatar
        activity={activeActivities(c.bookings)[0]}
        initials={c.initials}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate font-semibold">
            {c.client}
            <span className="font-normal text-muted-foreground">
              {" "}
              · {c.pets.map((pet) => pet.split(" · ")[0]).join(", ")}
            </span>
          </span>
          {last && (
            <span
              className={cn(
                "shrink-0 text-sm",
                strong ? "font-semibold" : "text-muted-foreground"
              )}
            >
              {last.day === "Aujourd'hui" ? last.time : last.day}
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              c.typing
                ? "font-semibold text-link"
                : strong
                  ? "font-semibold"
                  : "text-muted-foreground"
            )}
          >
            {lastPreview(c)}
          </span>
          {strong && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums">
              {c.unread}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

function NewMessageDialog({
  onSelect,
}: {
  onSelect: (client: Client) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <FlowDialog
      onOpenChange={setOpen}
      open={open}
      trigger={
        <Button>
          <HugeiconsIcon icon={PencilEdit02Icon} />
          Nouveau
        </Button>
      }
    >
      <ClientStep
        onSelect={(client) => {
          onSelect(client)
          setOpen(false)
        }}
        title="À qui voulez-vous écrire ?"
      />
    </FlowDialog>
  )
}

/** Bandeau au-dessus de la conversation : la demande à traiter, sinon la prestation en cours. */
function ContextBanner({
  bookings,
  onOpen,
  onConfirm,
  onDecline,
}: {
  bookings: Booking[]
  onOpen: (id: string) => void
  onConfirm: (id: string) => void
  onDecline: (id: string) => void
}) {
  const pending = bookings.find((b) => b.status === "pending")
  const ongoing = bookings.find((b) => b.status === "ongoing")
  if (pending)
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-warning-soft p-3 ps-4">
        <button
          className="flex min-w-0 flex-1 items-center gap-3 text-start"
          onClick={() => onOpen(pending.id)}
          type="button"
        >
          <ActivityMark
            activity={pending.activity}
            className="size-10 text-sm"
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-warning-foreground">
              Demande à confirmer
            </span>
            <span className="block truncate font-semibold">
              {pending.title} · {pending.pet}
            </span>
            <span className="block truncate text-sm text-muted-foreground">
              {pending.dates} · {formatAmount(pending.amount)}
            </span>
          </span>
        </button>
        <div className="flex gap-2 max-sm:w-full">
          <Button
            className="max-sm:flex-1"
            onClick={() => onDecline(pending.id)}
            variant="secondary"
          >
            Refuser
          </Button>
          <Button
            className="max-sm:flex-1"
            onClick={() => onConfirm(pending.id)}
          >
            Confirmer
          </Button>
        </div>
      </div>
    )
  if (ongoing)
    return (
      <button
        className="flex w-full items-center gap-3 rounded-2xl bg-muted p-3 ps-4 text-start transition-colors hover:bg-neutral-hover"
        onClick={() => onOpen(ongoing.id)}
        type="button"
      >
        <ActivityMark activity={ongoing.activity} className="size-10 text-sm" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-success-foreground">
            En cours · {ongoing.activity}
          </span>
          <span className="block truncate font-semibold">
            {ongoing.title} · {ongoing.pet}
          </span>
        </span>
        <span className="shrink-0 text-sm text-muted-foreground max-sm:hidden">
          {ongoing.dates}
        </span>
        <HugeiconsIcon
          className="size-5 shrink-0 text-muted-foreground"
          icon={ArrowRight01Icon}
        />
      </button>
    )
  return null
}

function RoundAction({
  icon,
  label,
  href,
}: {
  icon: typeof UserIcon
  label: string
  href: string
}) {
  return (
    <Link
      className="flex flex-col items-center gap-2 text-sm font-semibold"
      href={href}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/88">
        <HugeiconsIcon className="size-5" icon={icon} />
      </span>
      {label}
    </Link>
  )
}

/** Le client, ses animaux et toutes ses réservations, à côté de la conversation. */
function ClientPanel({
  conversation,
  client,
  onOpenBooking,
}: {
  conversation: Conversation
  client?: Client
  onOpenBooking: (id: string) => void
}) {
  const sorted = sortBookings(conversation.bookings)
  const sections = [
    { bookings: sorted.filter(isActive), label: "En cours et à venir" },
    { bookings: sorted.filter((b) => !isActive(b)), label: "Passées" },
  ]
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center">
        <Avatar className="size-20">
          <AvatarFallback className="text-2xl font-semibold">
            {conversation.initials}
          </AvatarFallback>
        </Avatar>
        <p className="mt-3 text-xl font-semibold">{conversation.client}</p>
        {client && (
          <p className="text-sm text-muted-foreground">
            {client.city} · client depuis {client.since}
          </p>
        )}
      </div>

      <div className="flex justify-center gap-6">
        {client && (
          <>
            <RoundAction
              href={`tel:${client.phone.replaceAll(" ", "")}`}
              icon={Call02Icon}
              label="Appeler"
            />
            <RoundAction
              href={`mailto:${client.email}`}
              icon={Mail01Icon}
              label="E-mail"
            />
          </>
        )}
        <RoundAction
          href={client ? clientHref(client.name) : "/clients"}
          icon={UserIcon}
          label="Fiche"
        />
      </div>

      <section className="space-y-1">
        <h3 className="px-3 text-sm font-semibold text-muted-foreground">
          Animaux
        </h3>
        {conversation.pets.map((pet) => {
          const [name, breed] = pet.split(" · ")
          return (
            <Link
              className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-accent"
              href={petHref(name, conversation.client)}
              key={pet}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                {name[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{name}</span>
                <span className="block truncate text-sm text-muted-foreground">
                  {breed}
                </span>
              </span>
              <HugeiconsIcon
                className="size-5 text-muted-foreground"
                icon={ArrowRight01Icon}
              />
            </Link>
          )
        })}
      </section>

      {sections.map(
        (section) =>
          section.bookings.length > 0 && (
            <section className="space-y-1" key={section.label}>
              <h3 className="px-3 text-sm font-semibold text-muted-foreground">
                {section.label}
              </h3>
              {section.bookings.map((booking) => (
                <BookingRow
                  booking={booking}
                  key={booking.id}
                  onClick={() => onOpenBooking(booking.id)}
                />
              ))}
            </section>
          )
      )}
    </div>
  )
}

function BookingSheet({
  conversation,
  booking,
  open,
  onOpenChange,
  onShare,
  onConfirm,
  onDecline,
}: {
  conversation: Conversation
  booking?: Booking
  open: boolean
  onOpenChange: (open: boolean) => void
  onShare: (id: string) => void
  onConfirm: (id: string) => void
  onDecline: (id: string) => void
}) {
  const history = conversation.entries.filter(
    (e): e is BookingEntry =>
      e.kind === "booking" && e.bookingId === booking?.id
  )
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup variant="inset">
        {booking && (
          <>
            <SheetHeader>
              <ActivityMark
                activity={booking.activity}
                className="mb-2 size-12 text-base"
              />
              <SheetTitle>{booking.title}</SheetTitle>
              <SheetDescription>
                {booking.activity} · {booking.reference}
              </SheetDescription>
            </SheetHeader>
            <SheetPanel className="space-y-6">
              <div className="rounded-2xl bg-muted p-5">
                <p className="text-sm text-muted-foreground">Montant</p>
                <p className="text-3xl font-semibold tabular-nums">
                  {formatAmount(booking.amount)}
                </p>
                <Badge
                  className="mt-3"
                  size="lg"
                  variant={bookingStatus[booking.status].variant}
                >
                  {bookingStatus[booking.status].label}
                </Badge>
              </div>
              <dl className="divide-y">
                {[
                  ["Client", conversation.client],
                  ["Animal", booking.pet],
                  ["Dates", booking.dates],
                  ...booking.details.map((detail, i) => [
                    i === 0 ? "Détails" : "",
                    detail,
                  ]),
                ].map(([label, value]) => (
                  <div className="flex gap-4 py-3" key={value}>
                    <dt className="w-24 shrink-0 text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              {history.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Historique
                  </h3>
                  <ol className="ms-1.5 space-y-3 border-s-2 ps-5">
                    {history.map((entry) => (
                      <li className="relative" key={entry.id}>
                        <span className="absolute -inset-s-6.75 top-1.5 size-3 rounded-full border-2 border-background bg-control" />
                        <span className="font-semibold">
                          {eventLabel(entry.event, booking)}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {entry.day} à {entry.time}
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </SheetPanel>
            <SheetFooter>
              <Button onClick={() => onShare(booking.id)} variant="secondary">
                Partager dans la conversation
              </Button>
              {booking.status === "pending" && (
                <>
                  <Button
                    onClick={() => onDecline(booking.id)}
                    variant="secondary"
                  >
                    Refuser
                  </Button>
                  <Button onClick={() => onConfirm(booking.id)}>
                    Confirmer
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
      avatar={
        incoming ? (
          <ClientAvatar className="size-8" initials={conversation.initials} />
        ) : undefined
      }
      bubbleProps={{
        className: cn(
          "rounded-3xl px-4 py-2.5 text-[0.9375rem]",
          !grouped && (incoming ? "rounded-ss-md" : "rounded-se-md"),
          incoming ? "bg-muted" : "bg-primary text-primary-foreground"
        ),
      }}
      footer={
        <span className="flex items-center gap-1">
          {message.time}
          {message.status && (
            <ChatDeliveryIndicator
              label={deliveryLabels[message.status]}
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

function ConversationPane({
  conversation,
  className,
  panelOpen,
  onTogglePanel,
  onBack,
  onChange,
}: {
  conversation: Conversation
  className?: string
  panelOpen: boolean
  onTogglePanel: () => void
  onBack: () => void
  onChange: (update: (conversation: Conversation) => Conversation) => void
}) {
  const [draft, setDraft] = useState<ComposerValue>([])
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const hintId = useId()
  const { entries, bookings } = conversation
  const client = clients.find((c) => c.name === conversation.client)
  const firstName = conversation.client.split(" ")[0]
  const scroll = useChatScroll({
    itemCount: entries.length,
    layoutKey: conversation.typing ? "typing" : "idle",
  })
  const { atBottomRef } = scroll

  const replies = activeActivities(bookings).flatMap((activity) => {
    const pet = sortBookings(bookings).find((b) => b.activity === activity)?.pet
    return quickReplies[activity].map((reply) => ({
      ...reply,
      activity,
      text: reply.text.replaceAll("{pet}", pet ?? ""),
    }))
  })

  const addEntry = (entry: ChatEntry) => {
    atBottomRef.current = true
    onChange((c) => ({ ...c, entries: [...c.entries, entry] }))
  }

  const openBooking = (id: string) => {
    setInfoOpen(false)
    setBookingId(id)
    setBookingOpen(true)
  }

  const share = (id: string) => {
    addEntry(bookingEntry(id, "shared"))
    setBookingOpen(false)
  }

  const answer = (id: string, confirmed: boolean) => {
    atBottomRef.current = true
    setBookingOpen(false)
    onChange((c) => ({
      ...c,
      bookings: c.bookings.map((b) =>
        b.id === id ? { ...b, status: confirmed ? "upcoming" : "cancelled" } : b
      ),
      entries: [
        ...c.entries,
        bookingEntry(id, confirmed ? "confirmed" : "declined"),
      ],
    }))
  }

  const react = (id: string, emoji: string) =>
    onChange((c) => ({
      ...c,
      entries: c.entries.map((e) =>
        e.kind === "message" && e.id === id ? toggleReaction(e, emoji) : e
      ),
    }))

  const panel = (
    <ClientPanel
      client={client}
      conversation={conversation}
      onOpenBooking={openBooking}
    />
  )

  return (
    <div className={cn("flex min-w-0 flex-1", className)}>
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-18 shrink-0 items-center gap-3 border-b px-3 md:px-5">
          <Button
            aria-label="Retour aux conversations"
            className="md:hidden"
            onClick={onBack}
            size="icon"
            variant="ghost"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <ClientAvatar className="size-10" initials={conversation.initials} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{conversation.client}</p>
            <p
              className={cn(
                "truncate text-sm",
                conversation.typing
                  ? "font-semibold text-link"
                  : "text-muted-foreground"
              )}
            >
              {conversation.typing
                ? "En train d'écrire…"
                : conversation.pets.join(" · ")}
            </p>
          </div>
          {client && (
            <Button
              aria-label={`Appeler ${firstName}`}
              render={<a href={`tel:${client.phone.replaceAll(" ", "")}`} />}
              size="icon"
              variant="secondary"
            >
              <HugeiconsIcon icon={Call02Icon} />
            </Button>
          )}
          <Button
            aria-label="Infos du client"
            className="xl:hidden"
            onClick={() => setInfoOpen(true)}
            size="icon"
            variant="secondary"
          >
            <HugeiconsIcon icon={InformationCircleIcon} />
          </Button>
          <Button
            aria-label={panelOpen ? "Masquer les infos" : "Afficher les infos"}
            aria-pressed={panelOpen}
            className="max-xl:hidden"
            onClick={onTogglePanel}
            size="icon"
            variant={panelOpen ? "secondary" : "ghost"}
          >
            <HugeiconsIcon icon={InformationCircleIcon} />
          </Button>
        </header>

        {bookings.some(
          (b) => b.status === "pending" || b.status === "ongoing"
        ) && (
          <div className="shrink-0 px-3 pt-3 md:px-5">
            <div className="mx-auto max-w-3xl">
              <ContextBanner
                bookings={bookings}
                onConfirm={(id) => answer(id, true)}
                onDecline={(id) => answer(id, false)}
                onOpen={openBooking}
              />
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <ClientAvatar
              className="size-20"
              initials={conversation.initials}
            />
            <p className="text-xl font-semibold">Écrivez à {firstName}</p>
            <p className="max-w-xs text-muted-foreground">
              Vos messages et ses réservations s&apos;afficheront ici, dans
              l&apos;ordre.
            </p>
          </div>
        ) : (
          <ChatConversation
            contentClassName="px-3 md:px-5"
            jumpLabel="Derniers messages"
            label={`Conversation avec ${conversation.client}`}
            scroll={scroll}
          >
            <div className="mx-auto max-w-3xl space-y-4 py-5">
              {groupByDay(entries).map((group) => (
                <section className="space-y-3" key={group.day}>
                  <ChatDatePill className="h-7 border-0 bg-muted px-3 text-sm font-semibold">
                    {group.day}
                  </ChatDatePill>
                  {group.entries.map((entry, index) => {
                    const previous = group.entries[index - 1]
                    const booking =
                      entry.kind === "booking"
                        ? bookings.find((b) => b.id === entry.bookingId)
                        : undefined
                    return (
                      <div className="space-y-3" key={entry.id}>
                        {entry.id === conversation.unreadFromId && (
                          <ChatUnreadDivider className="font-semibold text-link">
                            Nouveaux messages
                          </ChatUnreadDivider>
                        )}
                        {entry.kind === "booking" ? (
                          booking && (
                            <div className="mx-auto w-full max-w-md rounded-2xl border bg-card">
                              <BookingRow
                                booking={booking}
                                eyebrow={`${eventLabel(entry.event, booking)} · ${entry.time}`}
                                onClick={() => openBooking(booking.id)}
                              />
                            </div>
                          )
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
        )}

        <div className="shrink-0 px-3 pb-3 md:px-5 md:pb-5">
          <div className="mx-auto max-w-3xl space-y-3">
            {replies.length > 0 && (
              <div
                aria-label="Réponses rapides"
                className="-mx-3 flex gap-2 overflow-x-auto px-3 md:mx-0 md:px-0"
                role="group"
              >
                {replies.map((reply) => (
                  <button
                    className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-secondary ps-1.5 pe-4 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-neutral-hover"
                    key={reply.label}
                    onClick={() =>
                      setDraft([{ text: reply.text, type: "text" }])
                    }
                    type="button"
                  >
                    <ActivityMark
                      activity={reply.activity}
                      className="size-6"
                    />
                    {reply.label}
                  </button>
                ))}
              </div>
            )}
            <Composer
              className="[--composer-radius:var(--radius-2xl)]"
              layout="adaptive"
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
                aria-describedby={hintId}
                aria-label={`Message à ${conversation.client}`}
                placeholder={`Écrire à ${firstName}…`}
                render={<textarea />}
              />
              <ComposerActions>
                <ComposerActionGroup>
                  <Button
                    aria-label="Joindre une photo ou un fichier"
                    size="icon"
                    variant="ghost"
                  >
                    <HugeiconsIcon icon={Attachment01Icon} />
                  </Button>
                  {bookings.length > 0 && (
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
                            <ActivityMark activity={booking.activity} />
                            {booking.title}
                            <span className="ms-auto ps-4 text-sm text-muted-foreground">
                              {booking.dates}
                            </span>
                          </MenuItem>
                        ))}
                      </MenuPopup>
                    </Menu>
                  )}
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
            <p className="sr-only" id={hintId}>
              Entrée pour envoyer, Maj + Entrée pour un saut de ligne
            </p>
          </div>
        </div>
      </section>

      {panelOpen && (
        <aside
          aria-label={`Infos sur ${conversation.client}`}
          className="w-80 shrink-0 overflow-y-auto border-s px-3 py-8 max-xl:hidden"
        >
          {panel}
        </aside>
      )}

      <Sheet onOpenChange={setInfoOpen} open={infoOpen}>
        <SheetPopup variant="inset">
          <SheetTitle className="sr-only">
            Infos sur {conversation.client}
          </SheetTitle>
          <SheetPanel className="px-3 py-8">{panel}</SheetPanel>
        </SheetPopup>
      </Sheet>

      <BookingSheet
        booking={bookings.find((b) => b.id === bookingId)}
        conversation={conversation}
        onConfirm={(id) => answer(id, true)}
        onDecline={(id) => answer(id, false)}
        onOpenChange={setBookingOpen}
        onShare={share}
        open={bookingOpen}
      />
    </div>
  )
}

export function MessagesView() {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState(initialConversations[0].id)
  const [view, setView] = useState<"list" | "chat">("list")
  const [panelOpen, setPanelOpen] = useState(true)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0]

  const tests: Record<Filter, (c: Conversation) => boolean> = {
    all: () => true,
    ongoing: hasOngoing,
    reply: needsReply,
    unread: (c) => c.unread > 0,
  }
  const filters: { label: string; value: Filter }[] = [
    { label: "Toutes", value: "all" },
    { label: "À répondre", value: "reply" },
    { label: "Non lues", value: "unread" },
    { label: "En cours", value: "ongoing" },
  ]
  const q = query.trim().toLowerCase()
  const shown = conversations.filter(
    (c) =>
      tests[filter](c) &&
      `${c.client} ${c.pets.join(" ")}`.toLowerCase().includes(q)
  )
  // Sans filtre, ce qui attend une réponse passe en premier.
  const sections =
    filter === "all"
      ? [
          { items: shown.filter(needsReply), label: "À répondre" },
          { items: shown.filter((c) => !needsReply(c)), label: "Récentes" },
        ]
      : [{ items: shown, label: "" }]

  const select = (id: string) => {
    setActiveId(id)
    setView("chat")
    setConversations((list) =>
      list.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    )
  }

  const startWith = (client: Client) => {
    const existing = conversations.find((c) => c.client === client.name)
    if (existing) return select(existing.id)
    const id = `new-${client.name}`
    setConversations((list) => [
      {
        bookings: [],
        client: client.name,
        entries: [],
        id,
        initials: client.initials,
        pets: client.pets.map((p) => `${p.name} · ${p.breed}`),
        unread: 0,
      },
      ...list,
    ])
    setActiveId(id)
    setView("chat")
  }

  return (
    <div className="flex min-h-0 flex-1">
      <aside
        className={cn(
          "flex w-full flex-col md:w-96 md:shrink-0 md:border-e",
          view === "chat" && "max-md:hidden"
        )}
      >
        <div className="space-y-4 px-4 pt-6 pb-2 md:px-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-heading text-3xl font-semibold">Messages</h1>
            <NewMessageDialog onSelect={startWith} />
          </div>
          <InputGroup className="rounded-full">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Rechercher une conversation"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Client ou animal"
              value={query}
            />
          </InputGroup>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 md:-mx-5 md:px-5">
            {filters.map((f) => (
              <button
                aria-pressed={filter === f.value}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors",
                  filter === f.value
                    ? "bg-control text-control-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-neutral-hover"
                )}
                key={f.value}
                onClick={() => setFilter(f.value)}
                type="button"
              >
                {f.label}
                {f.value !== "all" && (
                  <span className="tabular-nums opacity-70">
                    {conversations.filter(tests[f.value]).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <nav
          aria-label="Conversations"
          className="flex-1 overflow-y-auto px-1 pb-4 md:px-2"
        >
          {shown.length === 0 && (
            <p className="p-6 text-center text-muted-foreground">
              {filter === "reply"
                ? "Vous avez répondu à tout le monde 🎉"
                : "Aucune conversation"}
            </p>
          )}
          {sections.map(
            (section) =>
              section.items.length > 0 && (
                <section key={section.label}>
                  {section.label && (
                    <h2 className="px-3 pt-4 pb-1 text-sm font-semibold text-muted-foreground">
                      {section.label}
                    </h2>
                  )}
                  {section.items.map((c) => (
                    <ConversationRow
                      active={c.id === active.id}
                      conversation={c}
                      key={c.id}
                      onClick={() => select(c.id)}
                    />
                  ))}
                </section>
              )
          )}
        </nav>
      </aside>

      <ConversationPane
        className={cn(view === "list" && "max-md:hidden")}
        conversation={active}
        key={active.id}
        onBack={() => setView("list")}
        onChange={(update) =>
          setConversations((list) =>
            list.map((c) => (c.id === active.id ? update(c) : c))
          )
        }
        onTogglePanel={() => setPanelOpen((open) => !open)}
        panelOpen={panelOpen}
      />
    </div>
  )
}
