import { SubstackClient } from '@substack-api/substack-client'
import { HttpClient } from '@substack-api/internal/http-client'
import { PublicationService } from '@substack-api/internal/services'

jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

describe('SubstackClient publicationPosts', () => {
  let client: SubstackClient
  let mockPublicationService: jest.Mocked<PublicationService>

  beforeEach(() => {
    jest.clearAllMocks()

    const mockHttpClient = new HttpClient('https://test.com') as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.put = jest.fn()

    mockPublicationService = new PublicationService(
      mockHttpClient
    ) as jest.Mocked<PublicationService>
    mockPublicationService.getPosts = jest.fn()
    mockPublicationService.getHomepageData = jest.fn()
    mockPublicationService.getArchive = jest.fn()
    mockPublicationService.getPostFacepile = jest.fn()

    client = new SubstackClient({ publicationUrl: 'https://test.substack.com' })

    // Inject mock into the publications sub-client's publicationService
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pubClient = (client as any).publications as any
    pubClient.publicationService = mockPublicationService
  })

  it('should yield PublicationPost instances from full posts', async () => {
    mockPublicationService.getPosts.mockResolvedValueOnce([
      {
        id: 1,
        title: 'Full Post',
        slug: 'full-post',
        post_date: '2026-01-01T00:00:00Z',
        canonical_url: 'https://test.substack.com/p/full-post',
        body_html: '<p>Hello world</p>',
        description: 'A test post',
        wordcount: 42
      }
    ])

    const results = []
    for await (const post of client.publications.publicationPosts()) {
      results.push(post)
    }

    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('Full Post')
    expect(results[0].bodyHtml).toBe('<p>Hello world</p>')
  })

  it('should paginate with offset', async () => {
    // First batch: full page (25 items default)
    const firstBatch = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      title: `Post ${i + 1}`,
      slug: `post-${i + 1}`,
      post_date: '2026-01-01T00:00:00Z',
      canonical_url: `https://test.substack.com/p/post-${i + 1}`
    }))
    // Second batch: partial page (signals end)
    const secondBatch = [
      {
        id: 26,
        title: 'Post 26',
        slug: 'post-26',
        post_date: '2026-01-01T00:00:00Z',
        canonical_url: 'https://test.substack.com/p/post-26'
      }
    ]

    mockPublicationService.getPosts
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce(secondBatch)

    const results = []
    for await (const post of client.publications.publicationPosts()) {
      results.push(post)
    }

    expect(results).toHaveLength(26)
    expect(mockPublicationService.getPosts).toHaveBeenCalledTimes(2)
    expect(mockPublicationService.getPosts).toHaveBeenNthCalledWith(1, {
      offset: 0,
      limit: 25
    })
    expect(mockPublicationService.getPosts).toHaveBeenNthCalledWith(2, {
      offset: 25,
      limit: 25
    })
  })

  it('should respect limit option', async () => {
    mockPublicationService.getPosts.mockResolvedValueOnce([
      {
        id: 1,
        title: 'A',
        slug: 'a',
        post_date: '2026-01-01T00:00:00Z',
        canonical_url: 'https://test.substack.com/p/a'
      },
      {
        id: 2,
        title: 'B',
        slug: 'b',
        post_date: '2026-01-02T00:00:00Z',
        canonical_url: 'https://test.substack.com/p/b'
      }
    ])

    const results = []
    for await (const post of client.publications.publicationPosts({ limit: 1 })) {
      results.push(post)
    }

    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('A')
  })

  it('When empty response', async () => {
    mockPublicationService.getPosts.mockResolvedValueOnce([])

    const results = []
    for await (const post of client.publications.publicationPosts()) {
      results.push(post)
    }

    expect(results).toHaveLength(0)
  })
})
