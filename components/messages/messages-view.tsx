"use client"

import {
  ArrowUpIcon,
  Attachment01Icon,
  Call02Icon,
  PlusSignIcon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useId, useState } from "react"
import {
  type Activity,
  ActivityMark,
  activityNames,
} from "@/components/activity-mark"
import { ChatConversation } from "@/components/chat/chat-conversation"
import { ChatDatePill } from "@/components/chat/chat-date-pill"
import { ChatDeliveryIndicator } from "@/components/chat/chat-delivery-indicator"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatMessageActionToolbar } from "@/components/chat/chat-message-actions"
import { ChatReactionChip } from "@/components/chat/chat-reaction-chip"
import { ChatReactionPicker } from "@/components/chat/chat-reaction-picker"
import { ChatStatusBar } from "@/components/chat/chat-states"
import { ChatTypingIndicator } from "@/components/chat/chat-typing-indicator"
import { ChatUnreadDivider } from "@/components/chat/chat-unread-divider"
import { useChatScroll } from "@/components/chat/hooks/use-chat-scroll"
import {
  activityMessaging,
  type Conversation,
  conversations as initialConversations,
  type Message,
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
import { MenuItem } from "@/components/ui/menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

type Filter = "all" | Activity

const statusLabels = {
  delivered: "Distribué",
  failed: "Échec de l'envoi",
  read: "Lu",
  sending: "Envoi en cours",
  sent: "Envoyé",
} as const

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
    <span className="relative inline-flex shrink-0">
      <Avatar aria-hidden="true" className={cn("size-7 text-xs", className)}>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {activity && (
        <ActivityMark
          activity={activity}
          className="absolute -end-1 -bottom-1 size-4 rounded text-[0.5rem] ring-2 ring-background"
        />
      )}
    </span>
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

function ConversationPane({
  conversation,
  onMessagesChange,
}: {
  conversation: Conversation
  onMessagesChange: (update: (messages: Message[]) => Message[]) => void
}) {
  const [draft, setDraft] = useState<ComposerValue>([])
  const hintId = useId()
  const touchInput = useMediaQuery({ pointer: "coarse" })
  const { messages, activity } = conversation
  const firstName = conversation.client.split(" ")[0]
  const petName = conversation.pet.split(" · ")[0]
  const { contextAction, quickReplies } = activityMessaging[activity]
  const scroll = useChatScroll({
    itemCount: messages.length,
    layoutKey: conversation.typing ? "typing" : "idle",
  })

  const react = (id: string, emoji: string) =>
    onMessagesChange((list) =>
      list.map((m) => (m.id === id ? toggleReaction(m, emoji) : m))
    )

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 px-4">
        <ClientAvatar className="size-8" initials={conversation.initials} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">
              {conversation.client}
            </p>
            <Badge variant="outline">
              <ActivityMark
                activity={activity}
                className="size-3.5 rounded-sm text-[0.5rem]"
              />
              {activity}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.pet}
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

      <ChatStatusBar
        action={
          <Button size="xs" variant="outline">
            {contextAction}
          </Button>
        }
        description={conversation.context.description}
        title={conversation.context.title}
      />

      <ChatConversation
        jumpLabel="Derniers messages"
        label={`Conversation avec ${conversation.client}`}
        scroll={scroll}
      >
        <div className="space-y-4 py-4">
          <ChatDatePill>Aujourd'hui</ChatDatePill>
          {messages.map((message, index) => {
            const incoming = message.side === "incoming"
            const selected = (message.reactions ?? [])
              .filter((r) => r.selected)
              .map((r) => r.emoji)
            return (
              <div className="space-y-4" key={message.id}>
                {message.id === conversation.unreadFromId && (
                  <ChatUnreadDivider>Nouveaux messages</ChatUnreadDivider>
                )}
                <ChatMessage
                  actions={
                    <ChatMessageActionToolbar
                      menuChildren={
                        <>
                          <MenuItem
                            onClick={() =>
                              navigator.clipboard?.writeText(message.text)
                            }
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
                          onSelect={(emoji) => react(message.id, emoji)}
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
                  author={incoming ? firstName : undefined}
                  avatar={
                    incoming ? (
                      <ClientAvatar initials={conversation.initials} />
                    ) : undefined
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
                  grouped={
                    index > 0 && messages[index - 1].side === message.side
                  }
                  reactions={
                    message.reactions?.length ? (
                      <>
                        {message.reactions.map((r) => (
                          <ChatReactionChip
                            count={r.count}
                            emoji={r.emoji}
                            key={r.emoji}
                            label={`${r.emoji} ${r.count} réaction${r.count > 1 ? "s" : ""}`}
                            onClick={() => react(message.id, r.emoji)}
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
              </div>
            )
          })}
          <ChatTypingIndicator
            label={`${firstName} est en train d'écrire…`}
            visible={!!conversation.typing}
          />
        </div>
      </ChatConversation>

      <div className="flex shrink-0 flex-col gap-2.5 px-4 pb-4">
        <div
          aria-label={`Réponses rapides · ${activity}`}
          className="flex gap-1.5 overflow-x-auto"
          role="group"
        >
          {quickReplies.map((reply) => (
            <Button
              className="rounded-full"
              key={reply.label}
              onClick={() =>
                setDraft([
                  {
                    text: reply.text.replaceAll("{pet}", petName),
                    type: "text",
                  },
                ])
              }
              size="xs"
              variant="outline"
            >
              {reply.label}
            </Button>
          ))}
        </div>
        <Composer
          onSubmit={(value: ComposerValue) => {
            const text = getComposerText(value).trim()
            if (!text) return
            const time = new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
            scroll.atBottomRef.current = true
            onMessagesChange((list) => [
              ...list,
              {
                id: `new-${Date.now()}`,
                side: "outgoing",
                status: "sent",
                text,
                time,
              },
            ])
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
    </section>
  )
}

export function MessagesView() {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState(initialConversations[0].id)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0]
  const filtered = conversations.filter(
    (c) =>
      (filter === "all" || c.activity === filter) &&
      `${c.client} ${c.pet}`.toLowerCase().includes(query.toLowerCase())
  )
  const hasUnread = (activity: Activity) =>
    conversations.some((c) => c.activity === activity && c.unread > 0)

  const select = (id: string) => {
    setActiveId(id)
    setConversations((list) =>
      list.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    )
  }

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-sm font-medium">Messages</h1>
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
                {activityNames.map((activity) => (
                  <TabsTab
                    className="flex-1 gap-1"
                    key={activity}
                    value={activity}
                  >
                    {activity}
                    {hasUnread(activity) && (
                      <span className="size-1.5 rounded-full bg-orange-500" />
                    )}
                  </TabsTab>
                ))}
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
              const last = c.messages[c.messages.length - 1]
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
                  <ClientAvatar
                    activity={c.activity}
                    className="size-9"
                    initials={c.initials}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {c.client}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {last.time}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.pet} · {c.activity}
                    </p>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-xs",
                          c.unread ? "font-medium" : "text-muted-foreground"
                        )}
                      >
                        {c.typing ? "En train d'écrire…" : last.text}
                      </span>
                      {c.unread > 0 && (
                        <span className="shrink-0 rounded-full bg-emerald-800 px-1.5 text-xs text-white">
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
          onMessagesChange={(update) =>
            setConversations((list) =>
              list.map((c) =>
                c.id === active.id ? { ...c, messages: update(c.messages) } : c
              )
            )
          }
        />
      </div>
    </>
  )
}
