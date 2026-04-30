import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

const NetworkAttributionRowCodec = t.intersection([
  t.type({
    publication_id: t.number,
    time_window: t.string,
    is_subscribed: t.boolean,
    criteria: t.string,
    label: t.string,
    subs_count: t.number,
    pct_time_window_total: t.number,
    data_updated_at: t.string
  }),
  t.partial({})
])

export const NetworkAttributionCodec = t.intersection([
  t.type({}),
  t.partial({
    rows: maybe(t.array(NetworkAttributionRowCodec)),
    total: maybe(t.number)
  })
])

export type NetworkAttribution = t.TypeOf<typeof NetworkAttributionCodec>

export const FollowerTimeseriesCodec = t.array(t.tuple([t.string, t.number]))

export type FollowerTimeseries = t.TypeOf<typeof FollowerTimeseriesCodec>

const LocationTotalEntryCodec = t.intersection([
  t.type({}),
  t.partial({
    locations: maybe(t.number),
    total: maybe(t.number)
  })
])

const AudienceLocationEntryCodec = t.intersection([
  t.type({}),
  t.partial({
    publication_id: maybe(t.number),
    granularity: maybe(t.string),
    location: maybe(t.string),
    metric: maybe(t.string),
    value: maybe(t.number),
    md5: maybe(t.string),
    data_updated_at: maybe(t.string)
  })
])

export const AudienceLocationCodec = t.array(AudienceLocationEntryCodec)

export type AudienceLocation = t.TypeOf<typeof AudienceLocationCodec>

export const AudienceLocationTotalCodec = t.intersection([
  t.type({}),
  t.partial({
    global: maybe(LocationTotalEntryCodec),
    usa: maybe(LocationTotalEntryCodec)
  })
])

export type AudienceLocationTotal = t.TypeOf<typeof AudienceLocationTotalCodec>

const OverlapPublicationCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string
  }),
  t.partial({})
])

const AudienceOverlapEntryCodec = t.intersection([
  t.type({}),
  t.partial({
    percentOverlap: maybe(t.string),
    pub: maybe(OverlapPublicationCodec)
  })
])

export const AudienceOverlapCodec = t.array(AudienceOverlapEntryCodec)

export type AudienceOverlap = t.TypeOf<typeof AudienceOverlapCodec>

export const Traffic30dViewsCodec = t.intersection([
  t.type({}),
  t.partial({
    views30d: maybe(t.number),
    viewsDelta30d: maybe(t.number),
    uniqueViews30d: maybe(t.number),
    uniqueViewsDelta30d: maybe(t.number)
  })
])

export type Traffic30dViews = t.TypeOf<typeof Traffic30dViewsCodec>

const VisitorSourceRowCodec = t.intersection([
  t.type({}),
  t.partial({
    source: maybe(t.string),
    source_category: maybe(t.string),
    views: maybe(t.number),
    users: maybe(t.number),
    free_signup: maybe(t.number),
    subscribed: maybe(t.number)
  })
])

export const VisitorSourcesCodec = t.intersection([
  t.type({}),
  t.partial({
    rows: maybe(t.array(VisitorSourceRowCodec)),
    total: maybe(t.number)
  })
])

export type VisitorSources = t.TypeOf<typeof VisitorSourcesCodec>

export const TrafficTimeseriesCodec = t.array(t.tuple([t.string, t.number]))

export type TrafficTimeseries = t.TypeOf<typeof TrafficTimeseriesCodec>

export const Email30dOpenRateCodec = t.intersection([
  t.type({}),
  t.partial({
    openRate: maybe(t.number),
    openRateDiff: maybe(t.number)
  })
])

export type Email30dOpenRate = t.TypeOf<typeof Email30dOpenRateCodec>

const EmailStatsEntryCodec = t.intersection([
  t.type({}),
  t.partial({
    post_id: maybe(t.number),
    post_title: maybe(t.string),
    post_url: maybe(t.string),
    sent: maybe(t.number),
    opened: maybe(t.number),
    clicked: maybe(t.number),
    open_rate: maybe(t.number),
    click_rate: maybe(t.number),
    unsubscribed: maybe(t.number)
  })
])

export const EmailStatsCodec = t.intersection([
  t.type({}),
  t.partial({
    emails: maybe(t.array(EmailStatsEntryCodec)),
    total: maybe(t.number)
  })
])

export type EmailStats = t.TypeOf<typeof EmailStatsCodec>

export const PledgeSummaryCodec = t.intersection([
  t.type({}),
  t.partial({
    totalPledges: maybe(t.number),
    totalPledgeAmount: maybe(t.number),
    currency: maybe(t.string)
  })
])

export type PledgeSummary = t.TypeOf<typeof PledgeSummaryCodec>

const PledgeUserCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    handle: t.string
  }),
  t.partial({
    photo_url: maybe(t.string),
    bio: maybe(t.string),
    profile_set_up_at: maybe(t.string)
  })
])

const PledgeCodec = t.intersection([
  t.type({
    publication_id: t.number,
    user_id: t.number,
    plan_interval: t.string,
    payment_currency: t.string,
    payment_amount: t.number,
    is_founding: t.boolean,
    created_at: t.string
  }),
  t.partial({
    note: maybe(t.string),
    can_share_note: maybe(t.boolean)
  })
])

const PledgeAndUserEntryCodec = t.intersection([
  t.type({
    pledge: PledgeCodec,
    user: PledgeUserCodec
  }),
  t.partial({})
])

export const PledgesCodec = t.intersection([
  t.type({}),
  t.partial({
    pledgeAndUserData: maybe(t.array(PledgeAndUserEntryCodec))
  })
])

export type Pledges = t.TypeOf<typeof PledgesCodec>

const ReaderReferralEntryCodec = t.intersection([
  t.type({}),
  t.partial({
    referrer_user_id: maybe(t.number),
    referrer_name: maybe(t.string),
    referrer_handle: maybe(t.string),
    referred_user_id: maybe(t.number),
    referred_name: maybe(t.string),
    referred_handle: maybe(t.string),
    referred_at: maybe(t.string),
    subscription_type: maybe(t.string),
    is_paid: maybe(t.boolean)
  })
])

export const ReaderReferralsCodec = t.intersection([
  t.type({}),
  t.partial({
    referrals: maybe(t.array(ReaderReferralEntryCodec)),
    total: maybe(t.number),
    cursor: maybe(t.string),
    hasMore: maybe(t.boolean)
  })
])

export type ReaderReferrals = t.TypeOf<typeof ReaderReferralsCodec>

const PledgePlanCodec = t.intersection([
  t.type({
    name: t.string,
    amount: t.number,
    interval: t.string,
    currency: t.string
  }),
  t.partial({
    is_founding: maybe(t.boolean)
  })
])

export const PledgePlansCodec = t.intersection([
  t.type({}),
  t.partial({
    enabled: maybe(t.boolean),
    payment_pledge_plans: maybe(t.array(PledgePlanCodec))
  })
])

export type PledgePlans = t.TypeOf<typeof PledgePlansCodec>

export const PledgePlansSummaryCodec = t.intersection([
  t.type({}),
  t.partial({
    plans: maybe(t.array(PledgePlanCodec)),
    pledgeSummary: maybe(t.record(t.string, t.unknown)),
    pledgeCount: maybe(t.number)
  })
])

export type PledgePlansSummary = t.TypeOf<typeof PledgePlansSummaryCodec>

export const PublicationSettingsCodec = t.intersection([
  t.type({}),
  t.partial({
    publication_id: maybe(t.number),
    name: maybe(t.string),
    homepage: maybe(t.string),
    language: maybe(t.string),
    created_at: maybe(t.string),
    hero_text: maybe(t.string),
    theme: maybe(t.string),
    email_from_name: maybe(t.string),
    about: maybe(t.string),
    author_id: maybe(t.number),
    author_name: maybe(t.string),
    author_handle: maybe(t.string),
    author_photo_url: maybe(t.string),
    author_bio: maybe(t.string),
    author_twitter_screen_name: maybe(t.string),
    payout_integration: maybe(t.string),
    paid: maybe(t.boolean),
    default_publisher_announcement: maybe(t.string),
    show_launch_survey: maybe(t.boolean)
  })
])

export type PublicationSettings = t.TypeOf<typeof PublicationSettingsCodec>

export const BestsellerTierCodec = t.intersection([
  t.type({}),
  t.partial({
    tier: maybe(t.union([t.number, t.string])),
    tier_name: maybe(t.string),
    rank: maybe(t.number),
    total: maybe(t.number),
    category: maybe(t.string),
    is_bestseller: maybe(t.boolean),
    tier_description: maybe(t.string)
  })
])

export type BestsellerTier = t.TypeOf<typeof BestsellerTierCodec>
