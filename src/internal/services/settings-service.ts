import type { HttpClient } from '@substack-api/internal/http-client'
import type {
  PublisherSettingsDetail,
  SubstackSubscriptionSettings,
  SubstackBoostSettings,
  SubstackPublicationUserRole,
  SubstackPublicationSection
} from '@substack-api/internal/types'
import {
  PublisherSettingsDetailCodec,
  SubstackSubscriptionSettingsCodec,
  SubstackBoostSettingsCodec,
  SubstackPublicationUserRoleCodec,
  SubstackPublicationSectionCodec
} from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export class SettingsService {
  constructor(private readonly publicationClient: HttpClient) {}

  async getPublisherSettings(): Promise<PublisherSettingsDetail> {
    const response = await this.publicationClient.get<unknown>('/settings')
    return decodeOrThrow(PublisherSettingsDetailCodec, response, 'Publisher settings')
  }

  /** Get publication users with roles (admin, editor, etc.). */
  async getPublicationUser(): Promise<SubstackPublicationUserRole> {
    const response = await this.publicationClient.get<unknown>('/publication_user')
    return decodeOrThrow(SubstackPublicationUserRoleCodec, response, 'Publication user')
  }

  /** Get publication sections. */
  async getSections(): Promise<SubstackPublicationSection[]> {
    const response = await this.publicationClient.get<unknown>('/publication/sections')
    if (!Array.isArray(response)) {
      return [decodeOrThrow(SubstackPublicationSectionCodec, response, 'Section')]
    }
    return response.map((section, i) =>
      decodeOrThrow(SubstackPublicationSectionCodec, section, `Section ${i}`)
    )
  }

  /** Get current user's subscription/notification settings for this publication. */
  async getSubscription(): Promise<SubstackSubscriptionSettings> {
    const response = await this.publicationClient.get<unknown>('/subscription')
    return decodeOrThrow(SubstackSubscriptionSettingsCodec, response, 'Subscription settings')
  }

  /** Get boost settings and feature flags. */
  async getBoostSettings(): Promise<SubstackBoostSettings> {
    const response = await this.publicationClient.get<unknown>('/boost')
    return decodeOrThrow(SubstackBoostSettingsCodec, response, 'Boost settings')
  }
}
