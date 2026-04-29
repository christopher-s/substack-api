import type { HttpClient } from '@substack-api/internal/http-client'

export class SettingsService {
  constructor(private readonly publicationClient: HttpClient) {}

  async getPublisherSettings(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/settings')
  }

  /** Get publication users with roles (admin, editor, etc.). */
  async getPublicationUser(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/publication_user')
  }

  /** Get publication sections. */
  async getSections(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/publication/sections')
  }

  /** Get current user's subscription/notification settings for this publication. */
  async getSubscription(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/subscription')
  }

  /** Get boost settings and feature flags. */
  async getBoostSettings(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/boost')
  }
}
