import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

/**
 * Publication user relationship codec
 */
const PublicationUserCodec = t.intersection([
  t.type({
    id: maybe(t.number),
    user_id: maybe(t.number),
    publication_id: maybe(t.number),
    role: maybe(t.string),
    public: maybe(t.boolean),
    is_primary: maybe(t.boolean),
    publication: t.unknown
  }),
  t.partial({
    // additional fields may be present
  })
])

/**
 * User link codec
 */
const UserLinkCodec = t.type({
  id: maybe(t.number),
  user_id: maybe(t.number),
  url: maybe(t.string),
  title: maybe(t.string)
})

/**
 * Profile subscription codec
 */
const ProfileSubscriptionCodec = t.type({
  publication_id: maybe(t.number),
  user_id: maybe(t.number),
  created_at: maybe(t.string),
  type: maybe(t.string)
})

/**
 * Publication base codec for primary publication
 */
const PrimaryPublicationCodec = t.intersection([
  t.type({
    id: maybe(t.number),
    name: maybe(t.string),
    subdomain: maybe(t.string)
  }),
  t.partial({
    custom_domain: maybe(t.string),
    logo_url: maybe(t.string),
    author_id: maybe(t.number),
    handles_enabled: maybe(t.boolean)
  })
])

/**
 * Full profile codec for /user/{slug}/public_profile endpoint
 * Aligned with SubstackPublicProfile interface for complete data capture.
 * All fields accept `null` and `undefined` since the live API is permissive.
 */
export const SubstackFullProfileCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    handle: t.string
  }),
  t.partial({
    photo_url: maybe(t.string)
  }),
  t.partial({
    bio: maybe(t.string),
    tos_accepted_at: maybe(t.string),
    profile_disabled: maybe(t.boolean),
    publicationUsers: maybe(t.array(PublicationUserCodec)),
    userLinks: maybe(t.array(UserLinkCodec)),
    subscriptions: maybe(t.array(ProfileSubscriptionCodec)),
    subscriptionsTruncated: maybe(t.boolean),
    hasGuestPost: maybe(t.boolean),
    primaryPublication: maybe(PrimaryPublicationCodec),
    max_pub_tier: maybe(t.number),
    hasActivity: maybe(t.boolean),
    hasLikes: maybe(t.boolean),
    lists: maybe(t.array(t.unknown)),
    rough_num_free_subscribers_int: maybe(t.number),
    rough_num_free_subscribers: maybe(t.string),
    bestseller_badge_disabled: maybe(t.boolean),
    subscriberCountString: maybe(t.string),
    subscriberCount: maybe(t.string),
    subscriberCountNumber: maybe(t.number),
    hasHiddenPublicationUsers: maybe(t.boolean),
    visibleSubscriptionsCount: maybe(t.number),
    slug: maybe(t.string),
    previousSlug: maybe(t.string),
    primaryPublicationIsPledged: maybe(t.boolean),
    primaryPublicationSubscriptionState: maybe(t.string),
    isSubscribed: maybe(t.boolean),
    isFollowing: maybe(t.boolean),
    followsViewer: maybe(t.boolean),
    can_dm: maybe(t.boolean),
    dm_upgrade_options: maybe(t.array(t.string))
  })
])

export type SubstackFullProfile = t.TypeOf<typeof SubstackFullProfileCodec>
