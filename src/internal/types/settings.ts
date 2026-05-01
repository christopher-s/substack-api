import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

/**
 * Publisher settings from GET /settings (detailed)
 * This is a more detailed codec than SubstackPublisherSettings in substack-post-management.ts
 */
export const PublisherSettingsDetailCodec = t.intersection([
  t.type({}),
  t.partial({
    id: maybe(t.number),
    publication_name: maybe(t.string),
    author_name: maybe(t.string),
    publish_to_email: maybe(t.boolean),
    show_native_setup: maybe(t.boolean),
    email_from_name: maybe(t.string),
    author_id: maybe(t.number),
    publication_id: maybe(t.number),
    default_audience: maybe(t.string),
    default_comment_sort: maybe(t.string),
    write_comment_permissions: maybe(t.string),
    show_cover_image: maybe(t.boolean),
    show_signup_cta: maybe(t.boolean),
    signup_cta_text: maybe(t.string),
    welcome_email: maybe(t.unknown),
    podcast_enabled: maybe(t.boolean),
    community_enabled: maybe(t.boolean),
    bylines_enabled: maybe(t.boolean),
    dark_mode_night: maybe(t.boolean),
    hero_text: maybe(t.string),
    hero_photo_url: maybe(t.string),
    email_banner: maybe(t.string),
    footer_web_content: maybe(t.string),
    created_at: maybe(t.string),
    theme: maybe(t.unknown)
  })
])

export type PublisherSettingsDetail = t.TypeOf<typeof PublisherSettingsDetailCodec>

/**
 * Publication user with role from GET /publication_user
 */
export const SubstackPublicationUserRoleCodec = t.intersection([
  t.type({}),
  t.partial({
    id: maybe(t.number),
    user_id: maybe(t.number),
    publication_id: maybe(t.number),
    role: maybe(t.string),
    public: maybe(t.boolean),
    email: maybe(t.string),
    name: maybe(t.string),
    handle: maybe(t.string),
    photo_url: maybe(t.string),
    bio: maybe(t.string),
    created_at: maybe(t.string)
  })
])

export type SubstackPublicationUserRole = t.TypeOf<typeof SubstackPublicationUserRoleCodec>

/**
 * Publication section from GET /publication/sections
 */
export const SubstackPublicationSectionCodec = t.intersection([
  t.type({}),
  t.partial({
    id: maybe(t.number),
    name: maybe(t.string),
    slug: maybe(t.string),
    description: maybe(t.string),
    publication_id: maybe(t.number),
    is_default: maybe(t.boolean),
    created_at: maybe(t.string),
    updated_at: maybe(t.string)
  })
])

export type SubstackPublicationSection = t.TypeOf<typeof SubstackPublicationSectionCodec>

/**
 * Subscription settings from GET /subscription
 */
export const SubstackSubscriptionSettingsCodec = t.intersection([
  t.type({}),
  t.partial({
    id: maybe(t.number),
    user_id: maybe(t.number),
    publication_id: maybe(t.number),
    email_enabled: maybe(t.boolean),
    app_notifications: maybe(t.boolean),
    subscription_type: maybe(t.string),
    is_subscribed: maybe(t.boolean),
    email_settings: maybe(t.unknown),
    created_at: maybe(t.string),
    expiry: maybe(t.union([t.string, t.number]))
  })
])

export type SubstackSubscriptionSettings = t.TypeOf<typeof SubstackSubscriptionSettingsCodec>

/**
 * Boost settings from GET /boost
 */
export const SubstackBoostSettingsCodec = t.intersection([
  t.type({}),
  t.partial({
    enabled: maybe(t.boolean),
    boost_text: maybe(t.string),
    boost_url: maybe(t.string),
    show_boost: maybe(t.boolean),
    boost_amount: maybe(t.number),
    allow_one_time: maybe(t.boolean),
    allow_monthly: maybe(t.boolean),
    allow_yearly: maybe(t.boolean),
    boost_count: maybe(t.number),
    feature_flags: maybe(t.record(t.string, t.unknown))
  })
])

export type SubstackBoostSettings = t.TypeOf<typeof SubstackBoostSettingsCodec>
