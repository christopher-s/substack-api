import type { HttpClient } from '@substack-api/internal/http-client'

export class SettingsService {
  constructor(private readonly publicationClient: HttpClient) {}

  async getPublisherSettings(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/settings')
  }
}
