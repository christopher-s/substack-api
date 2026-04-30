import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

const SubscriberEntryCodec = t.intersection([
  t.type({}),
  t.partial({
    total_count: maybe(t.number),
    user_email_address: maybe(t.string),
    user_photo_url: maybe(t.string),
    user_name: maybe(t.string),
    user_id: maybe(t.number),
    subscription_type: maybe(t.string),
    activity_rating: maybe(t.number),
    subscription_created_at: maybe(t.string),
    total_revenue_generated: maybe(t.number),
    subscription_id: maybe(t.number),
    subscription_interval: maybe(t.string),
    is_subscribed: maybe(t.boolean),
    is_founding: maybe(t.boolean),
    is_gift: maybe(t.boolean),
    is_comp: maybe(t.boolean),
    is_free_trial: maybe(t.boolean),
    is_bitcoin: maybe(t.boolean)
  })
])

export const SubscriberStatsCodec = t.intersection([
  t.type({}),
  t.partial({
    subscribers: maybe(t.array(SubscriberEntryCodec))
  })
])

export type SubscriberStats = t.TypeOf<typeof SubscriberStatsCodec>

const SubscriptionsPageEntryCodec = t.intersection([
  t.type({}),
  t.partial({
    id: maybe(t.number),
    user_id: maybe(t.number),
    user_name: maybe(t.string),
    user_email_address: maybe(t.string),
    user_photo_url: maybe(t.string),
    publication_id: maybe(t.number),
    publication_name: maybe(t.string),
    subscription_type: maybe(t.string),
    subscription_status: maybe(t.string),
    subscription_created_at: maybe(t.string),
    subscription_interval: maybe(t.string),
    is_gift: maybe(t.boolean),
    is_comp: maybe(t.boolean),
    is_founding: maybe(t.boolean),
    is_free_trial: maybe(t.boolean),
    value: maybe(t.number),
    email_disabled: maybe(t.boolean)
  })
])

export const SubscriptionsPageCodec = t.intersection([
  t.type({}),
  t.partial({
    subscriptions: maybe(t.array(SubscriptionsPageEntryCodec)),
    cursor: maybe(t.string),
    hasMore: maybe(t.boolean),
    total_count: maybe(t.number)
  })
])

export type SubscriptionsPage = t.TypeOf<typeof SubscriptionsPageCodec>
