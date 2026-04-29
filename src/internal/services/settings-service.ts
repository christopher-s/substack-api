import type { HttpClient } from '@substack-api/internal/http-client'

export class SettingsService {
  constructor(private readonly publicationClient: HttpClient) {}

  async getPublisherSettings(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/settings')
  }

  async getPublicationUser(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/publication_user')
  }

  async getSections(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/publication/sections')
  }

  async getSubscription(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/subscription')
  }
}
