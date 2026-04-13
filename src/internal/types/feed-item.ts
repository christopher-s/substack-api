/**
 * A feed item from the reader feed, search, or profile activity endpoints.
 * These endpoints return heterogeneous items (posts, comments/notes) mixed together.
 * The `type` field discriminates the item kind.
 */
export interface FeedItem {
  type: string
  entity_key: string
  [key: string]: unknown
}
