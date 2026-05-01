/* eslint-disable @typescript-eslint/no-explicit-any */
import { PublicationClient } from '@substack-api/sub-clients/publication-client'

// Mock markdownToHtml and getErrorMessage for createDraftFromMarkdown tests
jest.mock('@substack-api/internal/markdown-to-html', () => ({
  markdownToHtml: jest.fn()
}))

jest.mock('@substack-api/internal/validation', () => ({
  getErrorMessage: jest.fn()
}))

import { markdownToHtml } from '@substack-api/internal/markdown-to-html'
import { getErrorMessage } from '@substack-api/internal/validation'

const mockMarkdownToHtml = markdownToHtml as jest.MockedFunction<typeof markdownToHtml>
const mockGetErrorMessage = getErrorMessage as jest.MockedFunction<typeof getErrorMessage>

describe('PublicationClient', () => {
  let client: PublicationClient
  let publicationService: {
    getArchive: jest.Mock
    getPosts: jest.Mock
    getHomepageData: jest.Mock
    getPostFacepile: jest.Mock
    getActiveLiveStream: jest.Mock
    markPostSeen: jest.Mock
    getPublicationExport: jest.Mock
    searchPublications: jest.Mock
    getPublicationDetails: jest.Mock
    getPostTags: jest.Mock
    getLiveStreams: jest.Mock
    getEligibleHosts: jest.Mock
    getCurrentSubscription: jest.Mock
    getAllSubscriptions: jest.Mock
  }
  let categoryService: {
    getPublicationFeed: jest.Mock
    getCategories: jest.Mock
    getCategoryPublications: jest.Mock
  }
  let postManagementService: {
    getPublishedPosts: jest.Mock
    getDrafts: jest.Mock
    getScheduledPosts: jest.Mock
    getPostCounts: jest.Mock
    getDraft: jest.Mock
    createDraft: jest.Mock
    updateDraft: jest.Mock
    publishDraft: jest.Mock
    deleteDraft: jest.Mock
  }
  let noteService: {
    getNotes: jest.Mock
    getNoteStats: jest.Mock
    restackNote: jest.Mock
    unrestackNote: jest.Mock
    likeNote: jest.Mock
    unlikeNote: jest.Mock
  }
  let settingsService: {
    getPublisherSettings: jest.Mock
    getPublicationUser: jest.Mock
    getSections: jest.Mock
    getSubscription: jest.Mock
    getBoostSettings: jest.Mock
  }

  function createClient(withSettings = false): PublicationClient {
    return new PublicationClient(
      publicationService as any,
      categoryService as any,
      postManagementService as any,
      noteService as any,
      20,
      withSettings ? (settingsService as any) : undefined
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
    publicationService = {
      getArchive: jest.fn(),
      getPosts: jest.fn(),
      getHomepageData: jest.fn(),
      getPostFacepile: jest.fn(),
      getActiveLiveStream: jest.fn(),
      markPostSeen: jest.fn(),
      getPublicationExport: jest.fn(),
      searchPublications: jest.fn(),
      getPublicationDetails: jest.fn(),
      getPostTags: jest.fn(),
      getLiveStreams: jest.fn(),
      getEligibleHosts: jest.fn(),
      getCurrentSubscription: jest.fn(),
      getAllSubscriptions: jest.fn()
    }
    categoryService = {
      getPublicationFeed: jest.fn(),
      getCategories: jest.fn(),
      getCategoryPublications: jest.fn()
    }
    postManagementService = {
      getPublishedPosts: jest.fn(),
      getDrafts: jest.fn(),
      getScheduledPosts: jest.fn(),
      getPostCounts: jest.fn(),
      getDraft: jest.fn(),
      createDraft: jest.fn(),
      updateDraft: jest.fn(),
      publishDraft: jest.fn(),
      deleteDraft: jest.fn()
    }
    noteService = {
      getNotes: jest.fn(),
      getNoteStats: jest.fn(),
      restackNote: jest.fn(),
      unrestackNote: jest.fn(),
      likeNote: jest.fn(),
      unlikeNote: jest.fn()
    }
    settingsService = {
      getPublisherSettings: jest.fn(),
      getPublicationUser: jest.fn(),
      getSections: jest.fn(),
      getSubscription: jest.fn(),
      getBoostSettings: jest.fn()
    }
    client = createClient()
  })

  describe('publicationArchive', () => {
    it('When iterating publication archive, then calls service and yields PublicationPost entities', async () => {
      publicationService.getArchive.mockResolvedValueOnce([
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ])

      const results: any[] = []
      for await (const item of client.publicationArchive()) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
      expect(publicationService.getArchive).toHaveBeenCalledWith({
        sort: undefined,
        offset: 0,
        limit: 20
      })
    })

    it('When publication archive called with sort and limit, then passes options', async () => {
      publicationService.getArchive.mockResolvedValueOnce([{ id: 1, title: 'Post' }])

      const results: any[] = []
      for await (const item of client.publicationArchive({ sort: 'top', limit: 1 })) {
        results.push(item)
      }

      expect(publicationService.getArchive).toHaveBeenCalledWith({
        sort: 'top',
        offset: 0,
        limit: 20
      })
    })
  })

  describe('publicationPosts', () => {
    it('When iterating publication posts, then calls service and yields entities', async () => {
      publicationService.getPosts.mockResolvedValueOnce([
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ])

      const results: any[] = []
      for await (const item of client.publicationPosts()) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
      expect(publicationService.getPosts).toHaveBeenCalledWith({ offset: 0, limit: 20 })
    })

    it('When publication posts called with limit, then stops at limit', async () => {
      publicationService.getPosts.mockResolvedValueOnce([
        { id: 1, title: 'A' },
        { id: 2, title: 'B' }
      ])

      const results: any[] = []
      for await (const item of client.publicationPosts({ limit: 1 })) {
        results.push(item)
      }

      expect(results).toHaveLength(1)
    })
  })

  describe('publicationHomepage', () => {
    it('When fetching homepage data, then maps posts to PublicationPost entities', async () => {
      publicationService.getHomepageData.mockResolvedValueOnce({
        newPosts: [
          { id: 1, title: 'Homepage Post' },
          { id: 2, title: 'Another Post' }
        ]
      })

      const result = await client.publicationHomepage()

      expect(result).toHaveLength(2)
      expect(publicationService.getHomepageData).toHaveBeenCalled()
    })

    it('When homepage returns empty newPosts, then returns empty array', async () => {
      publicationService.getHomepageData.mockResolvedValueOnce({ newPosts: [] })

      const result = await client.publicationHomepage()

      expect(result).toEqual([])
    })
  })

  describe('postReactors', () => {
    it('When fetching post reactors, then delegates to publication service', async () => {
      const mockFacepile = { users: [{ id: 1, name: 'User' }] }
      publicationService.getPostFacepile.mockResolvedValueOnce(mockFacepile)

      const result = await client.postReactors(123)

      expect(result).toEqual(mockFacepile)
      expect(publicationService.getPostFacepile).toHaveBeenCalledWith(123)
    })
  })

  describe('activeLiveStream', () => {
    it('When fetching active live stream, then delegates to service', async () => {
      const mockStream = { id: 'stream1', status: 'live' }
      publicationService.getActiveLiveStream.mockResolvedValueOnce(mockStream)

      const result = await client.activeLiveStream(42)

      expect(result).toEqual(mockStream)
      expect(publicationService.getActiveLiveStream).toHaveBeenCalledWith(42)
    })
  })

  describe('markPostSeen', () => {
    it('When marking post as seen, then delegates to service', async () => {
      publicationService.markPostSeen.mockResolvedValueOnce(undefined)

      await client.markPostSeen(123)

      expect(publicationService.markPostSeen).toHaveBeenCalledWith(123)
    })
  })

  describe('publicationExport', () => {
    it('When exporting publication, then returns export data', async () => {
      const mockExport = [{ id: 1, url: 'https://export.zip' }]
      publicationService.getPublicationExport.mockResolvedValueOnce(mockExport)

      const result = await client.publicationExport()

      expect(result).toEqual(mockExport)
      expect(publicationService.getPublicationExport).toHaveBeenCalled()
    })
  })

  describe('publicationSearch', () => {
    it('When searching publications with query, then delegates to service', async () => {
      const mockResponse = { results: [{ id: 1, name: 'Found Pub' }], more: false }
      publicationService.searchPublications.mockResolvedValueOnce(mockResponse)

      const result = await client.publicationSearch('test')

      expect(result).toEqual(mockResponse)
      expect(publicationService.searchPublications).toHaveBeenCalledWith('test', undefined)
    })

    it('When searching publications with limit, then passes options', async () => {
      publicationService.searchPublications.mockResolvedValueOnce({ results: [], more: false })

      await client.publicationSearch('test', { limit: 10 })

      expect(publicationService.searchPublications).toHaveBeenCalledWith('test', { limit: 10 })
    })
  })

  describe('publicationFeed', () => {
    it('When iterating publication feed, then calls categoryService and yields items', async () => {
      const mockItem = { id: 'feed1', type: 'post', entity_key: 'ek1' }
      categoryService.getPublicationFeed.mockResolvedValueOnce({
        items: [mockItem],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of client.publicationFeed(42)) {
        results.push(item)
      }

      expect(results).toEqual([mockItem])
      expect(categoryService.getPublicationFeed).toHaveBeenCalledWith(42, {
        tab: undefined,
        cursor: undefined
      })
    })

    it('When publication feed called with tab and limit, then passes options', async () => {
      categoryService.getPublicationFeed.mockResolvedValueOnce({
        items: [{ id: 'item1', type: 'post', entity_key: 'ek1' }],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of client.publicationFeed(42, { tab: 'all', limit: 1 })) {
        results.push(item)
      }

      expect(categoryService.getPublicationFeed).toHaveBeenCalledWith(42, {
        tab: 'all',
        cursor: undefined
      })
    })
  })

  describe('publicationDetails', () => {
    it('When fetching publication details, then delegates to service', async () => {
      const mockDetails = { id: 1, name: 'My Publication' }
      publicationService.getPublicationDetails.mockResolvedValueOnce(mockDetails)

      const result = await client.publicationDetails()

      expect(result).toEqual(mockDetails)
      expect(publicationService.getPublicationDetails).toHaveBeenCalled()
    })
  })

  describe('publicationTags', () => {
    it('When fetching publication tags, then returns tags', async () => {
      const mockTags = [
        { id: 1, name: 'tech' },
        { id: 2, name: 'science' }
      ]
      publicationService.getPostTags.mockResolvedValueOnce(mockTags)

      const result = await client.publicationTags()

      expect(result).toEqual(mockTags)
      expect(publicationService.getPostTags).toHaveBeenCalled()
    })
  })

  describe('liveStreams', () => {
    it('When fetching live streams without status, then delegates to service', async () => {
      const mockStreams = { streams: [] }
      publicationService.getLiveStreams.mockResolvedValueOnce(mockStreams)

      const result = await client.liveStreams()

      expect(result).toEqual(mockStreams)
      expect(publicationService.getLiveStreams).toHaveBeenCalledWith(undefined)
    })

    it('When fetching live streams with status, then passes status', async () => {
      publicationService.getLiveStreams.mockResolvedValueOnce({ streams: [] })

      await client.liveStreams('live')

      expect(publicationService.getLiveStreams).toHaveBeenCalledWith('live')
    })
  })

  describe('eligibleHosts', () => {
    it('When fetching eligible hosts, then delegates to service', async () => {
      const mockHosts = { hosts: [{ id: 1, name: 'Host' }] }
      publicationService.getEligibleHosts.mockResolvedValueOnce(mockHosts)

      const result = await client.eligibleHosts(42)

      expect(result).toEqual(mockHosts)
      expect(publicationService.getEligibleHosts).toHaveBeenCalledWith(42)
    })
  })

  describe('publishedPosts', () => {
    it('When fetching published posts without options, then delegates to service', async () => {
      const mockResponse = { posts: [{ id: 1 }] }
      postManagementService.getPublishedPosts.mockResolvedValueOnce(mockResponse)

      const result = await client.publishedPosts()

      expect(result).toEqual(mockResponse)
      expect(postManagementService.getPublishedPosts).toHaveBeenCalledWith(undefined)
    })

    it('When fetching published posts with options, then passes options', async () => {
      postManagementService.getPublishedPosts.mockResolvedValueOnce({ posts: [] })

      await client.publishedPosts({ offset: 10, limit: 5 })

      expect(postManagementService.getPublishedPosts).toHaveBeenCalledWith({ offset: 10, limit: 5 })
    })
  })

  describe('drafts', () => {
    it('When fetching drafts, then delegates to post management service', async () => {
      const mockResponse = { drafts: [{ id: 1, title: 'Draft' }] }
      postManagementService.getDrafts.mockResolvedValueOnce(mockResponse)

      const result = await client.drafts()

      expect(result).toEqual(mockResponse)
      expect(postManagementService.getDrafts).toHaveBeenCalledWith(undefined)
    })

    it('When fetching drafts with options, then passes options', async () => {
      postManagementService.getDrafts.mockResolvedValueOnce({ drafts: [] })

      await client.drafts({ offset: 5, limit: 10 })

      expect(postManagementService.getDrafts).toHaveBeenCalledWith({ offset: 5, limit: 10 })
    })
  })

  describe('scheduledPosts', () => {
    it('When fetching scheduled posts, then delegates to service', async () => {
      const mockResponse = { posts: [{ id: 1, post_date: '2025-01-01' }] }
      postManagementService.getScheduledPosts.mockResolvedValueOnce(mockResponse)

      const result = await client.scheduledPosts()

      expect(result).toEqual(mockResponse)
      expect(postManagementService.getScheduledPosts).toHaveBeenCalledWith(undefined)
    })

    it('When fetching scheduled posts with options, then passes options', async () => {
      postManagementService.getScheduledPosts.mockResolvedValueOnce({ posts: [] })

      await client.scheduledPosts({ offset: 0, limit: 20 })

      expect(postManagementService.getScheduledPosts).toHaveBeenCalledWith({ offset: 0, limit: 20 })
    })
  })

  describe('postCounts', () => {
    it('When fetching post counts without query, then delegates to service', async () => {
      const mockCounts = { published: 10, drafts: 3 }
      postManagementService.getPostCounts.mockResolvedValueOnce(mockCounts)

      const result = await client.postCounts()

      expect(result).toEqual(mockCounts)
      expect(postManagementService.getPostCounts).toHaveBeenCalledWith(undefined)
    })

    it('When fetching post counts with query, then passes query', async () => {
      postManagementService.getPostCounts.mockResolvedValueOnce({ published: 5 })

      await client.postCounts('search term')

      expect(postManagementService.getPostCounts).toHaveBeenCalledWith('search term')
    })
  })

  describe('draft', () => {
    it('When fetching single draft by id, then delegates to service', async () => {
      const mockDraft = { id: 42, title: 'My Draft', body: '<p>Content</p>' }
      postManagementService.getDraft.mockResolvedValueOnce(mockDraft)

      const result = await client.draft(42)

      expect(result).toEqual(mockDraft)
      expect(postManagementService.getDraft).toHaveBeenCalledWith(42)
    })
  })

  describe('createDraft', () => {
    it('When creating a draft with all fields, then delegates to service', async () => {
      const mockDraft = { id: 1, title: 'New Draft', body: '<p>Content</p>' }
      const data = {
        title: 'New Draft',
        body: '<p>Content</p>',
        type: 'newsletter',
        audience: 'everyone',
        bylineUserId: 1
      }
      postManagementService.createDraft.mockResolvedValueOnce(mockDraft)

      const result = await client.createDraft(data)

      expect(result).toEqual(mockDraft)
      expect(postManagementService.createDraft).toHaveBeenCalledWith(data)
    })

    it('When creating a draft with only required fields, then delegates to service', async () => {
      postManagementService.createDraft.mockResolvedValueOnce({ id: 1, title: 'Simple' })

      await client.createDraft({ title: 'Simple' })

      expect(postManagementService.createDraft).toHaveBeenCalledWith({ title: 'Simple' })
    })
  })

  describe('updateDraft', () => {
    it('When updating a draft, then delegates to service with id and data', async () => {
      const mockUpdated = { id: 42, title: 'Updated' }
      const data = { title: 'Updated', body: '<p>New body</p>' }
      postManagementService.updateDraft.mockResolvedValueOnce(mockUpdated)

      const result = await client.updateDraft(42, data)

      expect(result).toEqual(mockUpdated)
      expect(postManagementService.updateDraft).toHaveBeenCalledWith(42, data)
    })
  })

  describe('publishDraft', () => {
    it('When publishing a draft, then delegates to service', async () => {
      const mockPublished = { id: 42, title: 'Published', status: 'published' }
      postManagementService.publishDraft.mockResolvedValueOnce(mockPublished)

      const result = await client.publishDraft(42)

      expect(result).toEqual(mockPublished)
      expect(postManagementService.publishDraft).toHaveBeenCalledWith(42)
    })
  })

  describe('deleteDraft', () => {
    it('When deleting a draft, then delegates to service', async () => {
      const mockResponse = { success: true }
      postManagementService.deleteDraft.mockResolvedValueOnce(mockResponse)

      const result = await client.deleteDraft(42)

      expect(result).toEqual(mockResponse)
      expect(postManagementService.deleteDraft).toHaveBeenCalledWith(42)
    })
  })

  describe('subscription', () => {
    it('When fetching current subscription, then delegates to service', async () => {
      const mockSub = { id: 1, publication_id: 100, type: 'premium' }
      publicationService.getCurrentSubscription.mockResolvedValueOnce(mockSub)

      const result = await client.subscription()

      expect(result).toEqual(mockSub)
      expect(publicationService.getCurrentSubscription).toHaveBeenCalled()
    })
  })

  describe('subscriptions', () => {
    it('When fetching all subscriptions without options, then delegates to service', async () => {
      const mockSubs = { subscriptions: [{ id: 1 }] }
      publicationService.getAllSubscriptions.mockResolvedValueOnce(mockSubs)

      const result = await client.subscriptions()

      expect(result).toEqual(mockSubs)
      expect(publicationService.getAllSubscriptions).toHaveBeenCalledWith(undefined)
    })

    it('When fetching subscriptions with options, then passes options', async () => {
      publicationService.getAllSubscriptions.mockResolvedValueOnce({ subscriptions: [] })

      await client.subscriptions({ offset: 5, limit: 10 })

      expect(publicationService.getAllSubscriptions).toHaveBeenCalledWith({ offset: 5, limit: 10 })
    })
  })

  describe('notesFeed', () => {
    it('When iterating notes feed with single page, then yields all items', async () => {
      noteService.getNotes.mockResolvedValueOnce({
        items: [{ id: 'note1' }, { id: 'note2' }],
        nextCursor: null
      })

      const results: any[] = []
      for await (const item of client.notesFeed()) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
      expect(noteService.getNotes).toHaveBeenCalledWith({ cursor: undefined })
    })

    it('When iterating notes feed across pages, then paginates with cursor', async () => {
      noteService.getNotes
        .mockResolvedValueOnce({
          items: [{ id: 'note1' }],
          nextCursor: 'cursor123'
        })
        .mockResolvedValueOnce({
          items: [{ id: 'note2' }],
          nextCursor: null
        })

      const results: any[] = []
      for await (const item of client.notesFeed()) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
      expect(noteService.getNotes).toHaveBeenCalledTimes(2)
      expect(noteService.getNotes).toHaveBeenNthCalledWith(1, { cursor: undefined })
      expect(noteService.getNotes).toHaveBeenNthCalledWith(2, { cursor: 'cursor123' })
    })

    it('When notes feed has limit, then stops after reaching limit', async () => {
      noteService.getNotes.mockResolvedValue({
        items: [{ id: 'note1' }, { id: 'note2' }, { id: 'note3' }],
        nextCursor: 'cursor'
      })

      const results: any[] = []
      for await (const item of client.notesFeed({ limit: 2 })) {
        results.push(item)
      }

      expect(results).toHaveLength(2)
    })

    it('When notes feed returns empty items, then yields nothing', async () => {
      noteService.getNotes.mockResolvedValueOnce({ items: [], nextCursor: null })

      const results: any[] = []
      for await (const item of client.notesFeed()) {
        results.push(item)
      }

      expect(results).toHaveLength(0)
    })
  })

  describe('noteStats', () => {
    it('When fetching note stats, then delegates to note service', async () => {
      const mockStats = { likes: 10, comments: 5, restacks: 2 }
      noteService.getNoteStats.mockResolvedValueOnce(mockStats)

      const result = await client.noteStats('note:123')

      expect(result).toEqual(mockStats)
      expect(noteService.getNoteStats).toHaveBeenCalledWith('note:123')
    })
  })

  describe('restackNote', () => {
    it('When restacking a note, then delegates to note service', async () => {
      noteService.restackNote.mockResolvedValueOnce(undefined)

      await client.restackNote(42)

      expect(noteService.restackNote).toHaveBeenCalledWith(42)
    })
  })

  describe('unrestackNote', () => {
    it('When unrestacking a note, then delegates to note service', async () => {
      noteService.unrestackNote.mockResolvedValueOnce(undefined)

      await client.unrestackNote(42)

      expect(noteService.unrestackNote).toHaveBeenCalledWith(42)
    })
  })

  describe('likeNote', () => {
    it('When liking a note, then delegates to note service', async () => {
      noteService.likeNote.mockResolvedValueOnce(undefined)

      await client.likeNote(42)

      expect(noteService.likeNote).toHaveBeenCalledWith(42)
    })
  })

  describe('unlikeNote', () => {
    it('When unliking a note, then delegates to note service', async () => {
      noteService.unlikeNote.mockResolvedValueOnce(undefined)

      await client.unlikeNote(42)

      expect(noteService.unlikeNote).toHaveBeenCalledWith(42)
    })
  })

  describe('createDraftFromMarkdown', () => {
    it('When creating draft from markdown, then converts to HTML and creates draft', async () => {
      mockMarkdownToHtml.mockReturnValueOnce('<h1>Hello</h1>')
      const mockDraft = { id: 1, title: 'MD Draft', body: '<h1>Hello</h1>' }
      postManagementService.createDraft.mockResolvedValueOnce(mockDraft)

      const result = await client.createDraftFromMarkdown('# Hello', { title: 'MD Draft' })

      expect(mockMarkdownToHtml).toHaveBeenCalledWith('# Hello')
      expect(postManagementService.createDraft).toHaveBeenCalledWith({
        title: 'MD Draft',
        body: '<h1>Hello</h1>',
        type: undefined,
        audience: undefined,
        bylineUserId: undefined
      })
      expect(result).toEqual(mockDraft)
    })

    it('When creating draft from markdown with all options, then passes all fields', async () => {
      mockMarkdownToHtml.mockReturnValueOnce('<p>Content</p>')
      postManagementService.createDraft.mockResolvedValueOnce({ id: 1 })

      await client.createDraftFromMarkdown('Content', {
        title: 'Title',
        type: 'newsletter',
        audience: 'paid',
        bylineUserId: 5
      })

      expect(postManagementService.createDraft).toHaveBeenCalledWith({
        title: 'Title',
        body: '<p>Content</p>',
        type: 'newsletter',
        audience: 'paid',
        bylineUserId: 5
      })
    })

    it('When creating draft from markdown without title, then uses empty string', async () => {
      mockMarkdownToHtml.mockReturnValueOnce('<p>Text</p>')
      postManagementService.createDraft.mockResolvedValueOnce({ id: 1 })

      await client.createDraftFromMarkdown('Text')

      expect(postManagementService.createDraft).toHaveBeenCalledWith(
        expect.objectContaining({ title: '' })
      )
    })

    it('When markdown conversion fails, then throws descriptive error', async () => {
      const error = new Error('Parse error')
      mockMarkdownToHtml.mockImplementationOnce(() => {
        throw error
      })
      mockGetErrorMessage.mockReturnValueOnce('Parse error')

      await expect(client.createDraftFromMarkdown('bad markdown')).rejects.toThrow(
        'Failed to create draft from markdown: Parse error'
      )
      expect(mockGetErrorMessage).toHaveBeenCalledWith(error)
    })
  })

  describe('categories', () => {
    it('When fetching categories, then maps to Category entities', async () => {
      const mockRawCategories = [
        { id: 1, name: 'Technology' },
        { id: 2, name: 'Science' }
      ]
      categoryService.getCategories.mockResolvedValueOnce(mockRawCategories)

      const result = await client.categories()

      expect(result).toHaveLength(2)
      expect(categoryService.getCategories).toHaveBeenCalled()
    })

    it('When categories returns empty array, then returns empty array', async () => {
      categoryService.getCategories.mockResolvedValueOnce([])

      const result = await client.categories()

      expect(result).toEqual([])
    })
  })

  describe('categoryPublications', () => {
    it('When fetching category publications, then delegates to category service', async () => {
      const mockResponse = {
        publications: [{ id: 1, name: 'Pub 1' }],
        more: true
      }
      categoryService.getCategoryPublications.mockResolvedValueOnce(mockResponse)

      const result = await client.categoryPublications(5)

      expect(result).toEqual(mockResponse)
      expect(categoryService.getCategoryPublications).toHaveBeenCalledWith(5, undefined)
    })

    it('When fetching category publications with options, then passes options', async () => {
      categoryService.getCategoryPublications.mockResolvedValueOnce({
        publications: [],
        more: false
      })

      await client.categoryPublications('tech', { limit: 10, offset: 5 })

      expect(categoryService.getCategoryPublications).toHaveBeenCalledWith('tech', {
        limit: 10,
        offset: 5
      })
    })
  })

  describe('settingsService methods', () => {
    describe('publisherSettings', () => {
      it('When settings service is available, then delegates to service', async () => {
        const mockSettings = { id: 1, name: 'Settings' }
        settingsService.getPublisherSettings.mockResolvedValueOnce(mockSettings)
        const settingsClient = createClient(true)

        const result = await settingsClient.publisherSettings()

        expect(result).toEqual(mockSettings)
        expect(settingsService.getPublisherSettings).toHaveBeenCalled()
      })

      it('When settings service is not available, then throws error', async () => {
        await expect(client.publisherSettings()).rejects.toThrow('Settings service not available')
      })
    })

    describe('publicationUser', () => {
      it('When settings service is available, then delegates to service', async () => {
        const mockUser = { id: 1, role: 'admin' }
        settingsService.getPublicationUser.mockResolvedValueOnce(mockUser)
        const settingsClient = createClient(true)

        const result = await settingsClient.publicationUser()

        expect(result).toEqual(mockUser)
        expect(settingsService.getPublicationUser).toHaveBeenCalled()
      })

      it('When settings service is not available, then throws error', async () => {
        await expect(client.publicationUser()).rejects.toThrow('Settings service not available')
      })
    })

    describe('sections', () => {
      it('When settings service is available, then delegates to service', async () => {
        const mockSections = [{ id: 1, name: 'Section 1' }]
        settingsService.getSections.mockResolvedValueOnce(mockSections)
        const settingsClient = createClient(true)

        const result = await settingsClient.sections()

        expect(result).toEqual(mockSections)
        expect(settingsService.getSections).toHaveBeenCalled()
      })

      it('When settings service is not available, then throws error', async () => {
        await expect(client.sections()).rejects.toThrow('Settings service not available')
      })
    })

    describe('subscriptionSettings', () => {
      it('When settings service is available, then delegates to service', async () => {
        const mockSubSettings = { id: 1, type: 'premium' }
        settingsService.getSubscription.mockResolvedValueOnce(mockSubSettings)
        const settingsClient = createClient(true)

        const result = await settingsClient.subscriptionSettings()

        expect(result).toEqual(mockSubSettings)
        expect(settingsService.getSubscription).toHaveBeenCalled()
      })

      it('When settings service is not available, then throws error', async () => {
        await expect(client.subscriptionSettings()).rejects.toThrow(
          'Settings service not available'
        )
      })
    })

    describe('boostSettings', () => {
      it('When settings service is available, then delegates to service', async () => {
        const mockBoost = { enabled: true }
        settingsService.getBoostSettings.mockResolvedValueOnce(mockBoost)
        const settingsClient = createClient(true)

        const result = await settingsClient.boostSettings()

        expect(result).toEqual(mockBoost)
        expect(settingsService.getBoostSettings).toHaveBeenCalled()
      })

      it('When settings service is not available, then throws error', async () => {
        await expect(client.boostSettings()).rejects.toThrow('Settings service not available')
      })
    })
  })
})
