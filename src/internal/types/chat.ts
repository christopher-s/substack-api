import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

export const ChatUserCodec = t.intersection([
  t.type({
    id: t.union([t.number, t.string]),
    name: t.string,
    handle: t.string
  }),
  t.partial({
    photo_url: maybe(t.string),
    bio: maybe(t.string),
    profile_id: maybe(t.number),
    primary_publication: maybe(t.unknown)
  })
])

export type ChatUser = t.TypeOf<typeof ChatUserCodec>

export const ChatMessageCodec = t.intersection([
  t.type({
    id: t.string,
    body: t.string
  }),
  t.partial({
    user_id: maybe(t.number),
    date: maybe(t.string),
    name: maybe(t.string),
    type: maybe(t.string),
    photo_url: maybe(t.string),
    handle: maybe(t.string),
    client_id: maybe(t.string),
    reaction_count: maybe(t.number),
    reactions: maybe(t.record(t.string, t.number)),
    attachments: maybe(t.array(t.unknown)),
    created_at: maybe(t.string),
    updated_at: maybe(t.string),
    conversation_id: maybe(t.string),
    status: maybe(t.string)
  })
])

export type ChatMessage = t.TypeOf<typeof ChatMessageCodec>

export const ChatThreadCodec = t.intersection([
  t.type({
    id: t.union([t.number, t.string])
  }),
  t.partial({
    uuid: maybe(t.string),
    user: maybe(ChatUserCodec),
    last_comment: maybe(ChatMessageCodec),
    unread_count: maybe(t.number),
    is_spam: maybe(t.boolean),
    is_subscriber: maybe(t.boolean),
    is_invitation: maybe(t.boolean),
    created_at: maybe(t.string),
    updated_at: maybe(t.string),
    type: maybe(t.string),
    timestamp: maybe(t.string)
  })
])

export type ChatThread = t.TypeOf<typeof ChatThreadCodec>

export const UnreadCountCodec = t.type({
  unreadCount: t.number,
  pendingInviteCount: t.number,
  pendingInviteUnreadCount: t.number,
  newPendingInviteUnreadCount: t.number,
  pubChatUnreadCount: t.number
})

export type UnreadCount = t.TypeOf<typeof UnreadCountCodec>

export const InboxResponseCodec = t.type({
  threads: t.array(ChatThreadCodec),
  more: t.boolean
})

export type InboxResponse = t.TypeOf<typeof InboxResponseCodec>

export const DmThreadDetailCodec = t.intersection([
  t.type({
    id: t.string
  }),
  t.partial({
    uuid: maybe(t.string),
    user: maybe(ChatUserCodec),
    unread_count: maybe(t.number),
    created_at: maybe(t.string),
    updated_at: maybe(t.string),
    members: maybe(t.array(ChatUserCodec))
  })
])

export type DmThreadDetail = t.TypeOf<typeof DmThreadDetailCodec>

export const DmResponseCodec = t.intersection([
  t.type({
    messages: t.array(ChatMessageCodec),
    more: t.boolean
  }),
  t.partial({
    user: maybe(ChatUserCodec),
    cursor: maybe(t.string)
  })
])

export type DmResponse = t.TypeOf<typeof DmResponseCodec>

export const SendMessageResponseCodec = t.type({
  thread: DmThreadDetailCodec,
  reply: t.intersection([
    t.type({
      comment: ChatMessageCodec,
      user: ChatUserCodec
    }),
    t.partial({
      client_id: maybe(t.string)
    })
  ])
})

export type SendMessageResponse = t.TypeOf<typeof SendMessageResponseCodec>

export const InvitesResponseCodec = t.type({
  threads: t.array(ChatThreadCodec),
  spamThreads: t.array(ChatThreadCodec),
  subscriberThreads: t.array(ChatThreadCodec),
  more: t.boolean
})

export type InvitesResponse = t.TypeOf<typeof InvitesResponseCodec>

export const ReactionsResponseCodec = t.type({
  suggestedReactionTypes: t.array(t.string),
  categories: t.array(t.unknown),
  reactionTypes: t.record(t.string, t.unknown)
})

export type ReactionsResponse = t.TypeOf<typeof ReactionsResponseCodec>

export const RealtimeTokenResponseCodec = t.type({
  token: t.string,
  expiry: t.string,
  permissions: t.array(t.string),
  endpoint: t.string
})

export type RealtimeTokenResponse = t.TypeOf<typeof RealtimeTokenResponseCodec>
