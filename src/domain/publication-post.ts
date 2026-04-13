import type {
  SubstackPublicationPost,
  SubstackPublicationFullPost
} from '@substack-api/internal/types'

type PublicationPostData = SubstackPublicationPost | SubstackPublicationFullPost

/**
 * Post from a publication archive, homepage, or full posts endpoint
 */
export class PublicationPost {
  public readonly id: number
  public readonly title: string
  public readonly subtitle: string
  public readonly slug: string
  public readonly url: string
  public readonly publishedAt: Date
  public readonly coverImage?: string
  public readonly audience: string
  public readonly reactions?: Record<string, number>
  public readonly restacks?: number
  public readonly sectionName?: string
  public readonly bodyHtml?: string

  constructor(rawData: PublicationPostData) {
    this.id = rawData.id
    this.title = rawData.title
    this.subtitle = rawData.subtitle || ''
    this.slug = rawData.slug
    this.url = rawData.canonical_url
    this.publishedAt = new Date(rawData.post_date)
    this.coverImage = rawData.cover_image || undefined
    this.audience = rawData.audience || 'everyone'
    this.reactions = rawData.reactions
    this.restacks = rawData.restacks
    this.sectionName = rawData.section_name || undefined
    if ('body_html' in rawData && rawData.body_html) {
      this.bodyHtml = rawData.body_html
    }
  }
}
