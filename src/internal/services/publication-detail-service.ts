import type { HttpClient } from '@substack-api/internal/http-client'
import type { SubstackPublicationDetail, SubstackPostTag } from '@substack-api/internal/types'
import { SubstackPublicationDetailCodec, SubstackPostTagCodec } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export class PublicationDetailService {
  constructor(private readonly publicationClient: HttpClient) {}

  async getPublicationDetails(): Promise<SubstackPublicationDetail> {
    const response = await this.publicationClient.get<unknown>('/publication')
    return decodeOrThrow(SubstackPublicationDetailCodec, response, 'Publication details')
  }

  async getPostTags(): Promise<SubstackPostTag[]> {
    const response = await this.publicationClient.get<unknown>('/publication/post-tag')
    if (!Array.isArray(response)) {
      return [decodeOrThrow(SubstackPostTagCodec, response, 'Post tag')]
    }
    return response.map((tag, i) => decodeOrThrow(SubstackPostTagCodec, tag, `Post tag ${i}`))
  }
}
