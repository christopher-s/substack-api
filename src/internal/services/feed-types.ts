/**
 * Supported tabs for the discovery feed endpoint.
 */
export type FeedTab = 'for-you' | 'top' | 'popular' | 'catchup' | 'notes' | 'explore'

/**
 * Supported tabs for the profile activity feed endpoint.
 */
export type ProfileFeedTab = 'posts' | 'notes' | 'comments' | 'likes'

/**
 * A tab descriptor from the activity feed response.
 */
export interface ActivityFeedTab {
  id: string
  name: string
  type: string
  layout?: string
  slug?: string
}
