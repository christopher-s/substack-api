import { randomUUID } from 'node:crypto'
import type { HttpClient } from '@substack-api/internal/http-client'
import { decodeOrThrow } from '@substack-api/internal/validation'
import {
  UnreadCountCodec,
  InboxResponseCodec,
  DmResponseCodec,
  SendMessageResponseCodec,
  InvitesResponseCodec,
  ReactionsResponseCodec,
  RealtimeTokenResponseCodec
} from '@substack-api/internal/types/chat'
import type {
  UnreadCount,
  InboxResponse,
  DmResponse,
  SendMessageResponse,
  InvitesResponse,
  ReactionsResponse,
  RealtimeTokenResponse,
  ChatThread,
  ChatMessage
} from '@substack-api/internal/types/chat'

export class ChatService {
  constructor(private readonly substackClient: HttpClient) {}

  async getUnreadCount(): Promise<UnreadCount> {
    const raw = await this.substackClient.get<unknown>('/messages/unread-count')
    return decodeOrThrow(UnreadCountCodec, raw, 'Unread count')
  }

  async getInbox(options?: { tab?: 'all' | 'people' }): Promise<InboxResponse> {
    const params = new URLSearchParams()
    if (options?.tab) {
      params.set('tab', options.tab)
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    const raw = await this.substackClient.get<unknown>(`/messages/inbox${query}`)
    return decodeOrThrow(InboxResponseCodec, raw, 'Inbox')
  }

  async markInboxSeen(): Promise<{ ok: boolean }> {
    return await this.substackClient.post<{ ok: boolean }>('/messages/inbox/seen')
  }

  async getDm(uuid: string, options?: { cursor?: string }): Promise<DmResponse> {
    const params = new URLSearchParams()
    if (options?.cursor) {
      params.set('cursor', options.cursor)
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    const raw = await this.substackClient.get<unknown>(
      `/messages/dm/${encodeURIComponent(uuid)}${query}`
    )
    return decodeOrThrow(DmResponseCodec, raw, 'DM')
  }

  async sendMessage(
    uuid: string,
    body: string,
    options?: { clientId?: string }
  ): Promise<SendMessageResponse> {
    const clientId = options?.clientId ?? randomUUID()
    const raw = await this.substackClient.post<unknown>(
      `/messages/dm/${encodeURIComponent(uuid)}`,
      { body, client_id: clientId }
    )
    return decodeOrThrow(SendMessageResponseCodec, raw, 'Send message')
  }

  async markDmSeen(uuid: string): Promise<{ ok: boolean }> {
    return await this.substackClient.post<{ ok: boolean }>(
      `/messages/dm/${encodeURIComponent(uuid)}/seen`
    )
  }

  async getInvites(): Promise<InvitesResponse> {
    const raw = await this.substackClient.get<unknown>('/messages/dm/invites?paginate=true')
    return decodeOrThrow(InvitesResponseCodec, raw, 'Invites')
  }

  async markInvitesSeen(): Promise<{ ok: boolean }> {
    return await this.substackClient.post<{ ok: boolean }>('/messages/inbox/invites/seen')
  }

  async getReactions(): Promise<ReactionsResponse> {
    const raw = await this.substackClient.get<unknown>('/threads/reactions')
    return decodeOrThrow(ReactionsResponseCodec, raw, 'Reactions')
  }

  async getRealtimeToken(channel: string): Promise<RealtimeTokenResponse> {
    const raw = await this.substackClient.get<unknown>(
      `/realtime/token?channels=${encodeURIComponent(channel)}`
    )
    return decodeOrThrow(RealtimeTokenResponseCodec, raw, 'Realtime token')
  }

  async *inboxThreads(
    options: { tab?: 'all' | 'people'; limit?: number } = {}
  ): AsyncGenerator<ChatThread> {
    let totalYielded = 0
    const response = await this.getInbox({ tab: options.tab })
    for (const thread of response.threads) {
      if (options.limit && totalYielded >= options.limit) return
      yield thread
      totalYielded++
    }
  }

  async *dmMessages(uuid: string, options: { limit?: number } = {}): AsyncGenerator<ChatMessage> {
    let cursor: string | undefined
    let totalYielded = 0
    while (true) {
      const response = await this.getDm(uuid, { cursor })
      for (const message of response.messages) {
        if (options.limit && totalYielded >= options.limit) return
        yield message
        totalYielded++
      }
      if (!response.more) break
      cursor = response.cursor ?? undefined
    }
  }
}
