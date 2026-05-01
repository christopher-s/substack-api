import type { ChatService } from '@substack-api/internal/services'
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

/**
 * Sub-client for chat/DM operations.
 */
export class ChatClient {
  constructor(private readonly chatService: ChatService) {}

  async unreadCount(): Promise<UnreadCount> {
    return await this.chatService.getUnreadCount()
  }

  async inbox(options?: { tab?: 'all' | 'people' }): Promise<InboxResponse> {
    return await this.chatService.getInbox(options)
  }

  async markInboxSeen(): Promise<{ ok: boolean }> {
    return await this.chatService.markInboxSeen()
  }

  async dm(uuid: string, options?: { cursor?: string }): Promise<DmResponse> {
    return await this.chatService.getDm(uuid, options)
  }

  async sendMessage(
    uuid: string,
    body: string,
    options?: { clientId?: string }
  ): Promise<SendMessageResponse> {
    return await this.chatService.sendMessage(uuid, body, options)
  }

  async markDmSeen(uuid: string): Promise<{ ok: boolean }> {
    return await this.chatService.markDmSeen(uuid)
  }

  async invites(): Promise<InvitesResponse> {
    return await this.chatService.getInvites()
  }

  async markInvitesSeen(): Promise<{ ok: boolean }> {
    return await this.chatService.markInvitesSeen()
  }

  async reactions(): Promise<ReactionsResponse> {
    return await this.chatService.getReactions()
  }

  async realtimeToken(channel: string): Promise<RealtimeTokenResponse> {
    return await this.chatService.getRealtimeToken(channel)
  }

  async *inboxThreads(
    options: { tab?: 'all' | 'people'; limit?: number } = {}
  ): AsyncGenerator<ChatThread> {
    yield* this.chatService.inboxThreads(options)
  }

  async *dmMessages(uuid: string, options: { limit?: number } = {}): AsyncGenerator<ChatMessage> {
    yield* this.chatService.dmMessages(uuid, options)
  }
}
