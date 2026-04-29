import type { HttpClient } from '@substack-api/internal/http-client'

export class PublicationDetailService {
  constructor(private readonly publicationClient: HttpClient) {}

  async getPublicationDetails(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/publication')
  }

  async getPostTags(): Promise<unknown> {
    return await this.publicationClient.get<unknown>('/publication/post-tag')
  }
}
