import * as t from 'io-ts'

/**
 * A profile search result from GET /api/v1/profile/search
 * Kept to fields most useful for consumers
 */
export const SubstackProfileSearchResultCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    handle: t.union([t.string, t.null])
  }),
  t.partial({
    bio: t.union([t.string, t.null]),
    photo_url: t.union([t.string, t.null]),
    followerCount: t.number,
    subscriberCount: t.union([t.number, t.string, t.null]),
    hasPosts: t.boolean,
    slug: t.string,
    previous_name: t.union([t.string, t.null]),
    profile_set_up_at: t.union([t.string, t.null]),
    reader_installed_at: t.union([t.string, t.null, t.undefined]),
    tos_accepted_at: t.union([t.string, t.null, t.undefined]),
    profile_disabled: t.boolean,
    userLinks: t.array(t.unknown),
    publicationUsers: t.array(t.unknown),
    theme: t.unknown,
    subscriptions: t.array(t.unknown),
    subscriptionsTruncated: t.boolean,
    hasGuestPost: t.boolean,
    primaryPublication: t.unknown,
    max_pub_tier: t.number,
    hasActivity: t.boolean,
    hasLikes: t.boolean,
    lists: t.array(t.unknown),
    rough_num_free_subscribers_int: t.number,
    rough_num_free_subscribers: t.string,
    bestseller_badge_disabled: t.boolean,
    bestseller_tier: t.union([t.number, t.null]),
    subscriberCountString: t.string,
    subscriberCountNumber: t.number,
    hasHiddenPublicationUsers: t.boolean,
    visibleSubscriptionsCount: t.number,
    previousSlug: t.string,
    primaryPublicationIsPledged: t.boolean,
    primaryPublicationSubscriptionState: t.string,
    isSubscribed: t.boolean,
    isFollowing: t.boolean,
    followsViewer: t.boolean,
    can_dm: t.boolean,
    status: t.unknown
  })
])

export type SubstackProfileSearchResult = t.TypeOf<typeof SubstackProfileSearchResultCodec>

/**
 * Response from GET /api/v1/profile/search
 */
export const SubstackProfileSearchResponseCodec = t.type({
  results: t.array(SubstackProfileSearchResultCodec),
  more: t.boolean
})

export type SubstackProfileSearchResponse = t.TypeOf<typeof SubstackProfileSearchResponseCodec>
