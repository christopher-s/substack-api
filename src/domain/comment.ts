import type { SubstackComment } from '@substack-api/internal'
import type { EntityDeps } from '@substack-api/domain/entity-deps'

/**
 * Comment entity representing a comment on a post or note
 */
export class Comment {
  public readonly id: number
  public readonly body: string
  public readonly userId?: number
  public readonly name?: string
  public readonly photoUrl?: string
  public readonly date?: string
  public readonly reactionCount?: number
  public readonly reactions?: Record<string, number>
  public readonly restacks?: number
  public readonly childrenCount?: number
  public readonly isAdmin?: boolean
  public readonly likesCount?: number

  constructor(
    private readonly rawData: SubstackComment,
    private readonly deps: EntityDeps
  ) {
    this.id = rawData.id
    this.body = rawData.body
    this.userId = rawData.user_id ?? undefined
    this.name = rawData.name ?? undefined
    this.photoUrl = rawData.photo_url ?? undefined
    this.date = rawData.date ?? undefined
    this.reactionCount = rawData.reaction_count ?? undefined
    this.reactions = rawData.reactions ?? undefined
    this.restacks = rawData.restacks ?? undefined
    this.childrenCount = rawData.children_count ?? undefined
    this.isAdmin = rawData.author_is_admin ?? undefined
    this.likesCount = rawData.reaction_count ?? rawData.reactions?.['❤'] ?? 0
  }
}
