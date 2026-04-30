import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

/**
 * A single recommendation entry from the recommendations API
 */
export const SubstackRecommendationCodec = t.intersection([
  t.type({
    id: t.number
  }),
  t.partial({
    publication_id: maybe(t.number),
    name: maybe(t.string),
    subdomain: maybe(t.string),
    custom_domain: maybe(t.string),
    logo_url: maybe(t.string),
    description: maybe(t.string),
    author_id: maybe(t.number),
    author_name: maybe(t.string),
    author_handle: maybe(t.string),
    is_recommended: maybe(t.boolean),
    recommended_by: maybe(t.string),
    clicks: maybe(t.number),
    subscribers_driven: maybe(t.number),
    created_at: maybe(t.string),
    updated_at: maybe(t.string)
  })
])

export type SubstackRecommendation = t.TypeOf<typeof SubstackRecommendationCodec>

/**
 * Statistics for outgoing or incoming recommendations
 */
export const SubstackRecommendationStatsCodec = t.intersection([
  t.type({}),
  t.partial({
    id: maybe(t.number),
    publication_id: maybe(t.number),
    name: maybe(t.string),
    subdomain: maybe(t.string),
    custom_domain: maybe(t.string),
    logo_url: maybe(t.string),
    description: maybe(t.string),
    clicks: maybe(t.number),
    subscribers_driven: maybe(t.number),
    total_recommendations: maybe(t.number),
    recommendation_id: maybe(t.number),
    added_at: maybe(t.string)
  })
])

export type SubstackRecommendationStats = t.TypeOf<typeof SubstackRecommendationStatsCodec>

/**
 * Response from recommendationsExist endpoint
 */
export const SubstackRecommendationsExistCodec = t.intersection([
  t.type({}),
  t.partial({
    exist: maybe(t.boolean),
    has_recommendations: maybe(t.boolean)
  })
])

export type SubstackRecommendationsExist = t.TypeOf<typeof SubstackRecommendationsExistCodec>

/**
 * A suggested recommendation from Substack's AI
 */
export const SubstackSuggestedRecommendationCodec = t.intersection([
  t.type({
    id: t.number
  }),
  t.partial({
    publication_id: maybe(t.number),
    name: maybe(t.string),
    subdomain: maybe(t.string),
    custom_domain: maybe(t.string),
    logo_url: maybe(t.string),
    description: maybe(t.string),
    author_name: maybe(t.string),
    author_handle: maybe(t.string),
    reason: maybe(t.string)
  })
])

export type SubstackSuggestedRecommendation = t.TypeOf<typeof SubstackSuggestedRecommendationCodec>
