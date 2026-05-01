import { SubstackClient } from '@substack-api/substack-client'
import { HttpClient } from '@substack-api/internal/http-client'
import { PostManagementService } from '@substack-api/internal/services'

jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

describe('PublicationClient createDraftFromMarkdown', () => {
  let client: SubstackClient
  let mockPostManagementService: jest.Mocked<PostManagementService>

  beforeEach(() => {
    jest.clearAllMocks()

    const mockHttpClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.put = jest.fn()

    mockPostManagementService = new PostManagementService(
      mockHttpClient
    ) as jest.Mocked<PostManagementService>
    mockPostManagementService.createDraft = jest.fn()

    client = new SubstackClient({
      token: 'test-api-key',
      publicationUrl: 'https://test.substack.com'
    })

    // Inject mock into the publications sub-client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pubClient = (client as any).publications as any
    pubClient.postManagementService = mockPostManagementService
  })

  it('should convert markdown to HTML and create a draft', async () => {
    const mockResponse = { id: 100, draft_title: '' }
    mockPostManagementService.createDraft.mockResolvedValue(mockResponse)

    const result = await client.publications.createDraftFromMarkdown('# Hello\n\nWorld')
    expect(result).toEqual(mockResponse)
    expect(mockPostManagementService.createDraft).toHaveBeenCalledWith({
      title: '',
      body: '<h1>Hello</h1>\n<p>World</p>',
      type: undefined,
      audience: undefined,
      bylineUserId: undefined
    })
  })

  it('should pass options through to createDraft', async () => {
    mockPostManagementService.createDraft.mockResolvedValue({ id: 200 })

    await client.publications.createDraftFromMarkdown('Some **bold** text', {
      title: 'My Title',
      type: 'podcast',
      audience: 'only_paid',
      bylineUserId: 42
    })

    expect(mockPostManagementService.createDraft).toHaveBeenCalledWith({
      title: 'My Title',
      body: '<p>Some <strong>bold</strong> text</p>',
      type: 'podcast',
      audience: 'only_paid',
      bylineUserId: 42
    })
  })

  it('should use empty string as default title', async () => {
    mockPostManagementService.createDraft.mockResolvedValue({ id: 300 })

    await client.publications.createDraftFromMarkdown('Just content')

    expect(mockPostManagementService.createDraft).toHaveBeenCalledWith(
      expect.objectContaining({ title: '' })
    )
  })

  it('should throw when markdown is empty', async () => {
    await expect(client.publications.createDraftFromMarkdown('')).rejects.toThrow()
    await expect(client.publications.createDraftFromMarkdown('')).rejects.toThrow(
      'Markdown content must not be empty'
    )
  })

  it('should throw when markdown is only whitespace', async () => {
    await expect(client.publications.createDraftFromMarkdown('   \n  \t  ')).rejects.toThrow(
      'Markdown content must not be empty'
    )
  })

  it('should convert inline formatting correctly', async () => {
    mockPostManagementService.createDraft.mockResolvedValue({ id: 400 })

    await client.publications.createDraftFromMarkdown('A [link](https://example.com) and `code`')

    expect(mockPostManagementService.createDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        body: '<p>A <a href="https://example.com">link</a> and <code>code</code></p>'
      })
    )
  })

  it('should convert strikethrough markdown to HTML', async () => {
    mockPostManagementService.createDraft.mockResolvedValue({ id: 500 })

    await client.publications.createDraftFromMarkdown('Some ~~deleted~~ text')

    expect(mockPostManagementService.createDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        body: '<p>Some <s>deleted</s> text</p>'
      })
    )
  })
})
