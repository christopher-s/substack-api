import { NoteService } from '@substack-api/internal/services/note-service'
import { createMockHttpClient } from '@test/unit/helpers/mock-http-client'
import type { SubstackCommentResponse } from '@substack-api/internal'

describe('NoteService', () => {
  let noteService: NoteService
  let mockPublicationClient: ReturnType<typeof createMockHttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockPublicationClient = createMockHttpClient('https://test.com')

    noteService = new NoteService(mockPublicationClient)
  })

  describe('getNoteById', () => {
    it('When requesting transformed note data from the HTTP client', async () => {
      const mockCommentResponse: SubstackCommentResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Test note content',
            user_id: 456,
            name: 'Test User',
            date: '2023-01-01T00:00:00Z',
            post_id: 789
          }
        }
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockCommentResponse)

      const result = await noteService.getNoteById(123)

      // Verify the minimal SubstackNote structure
      expect(result).toEqual({
        entity_key: '123',
        type: 'comment',
        context: {
          type: 'comment',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 456,
              name: 'Test User',
              handle: '',
              photo_url: '',
              bestseller_tier: ''
            }
          ],
          isFresh: false,
          source: 'comment'
        },
        comment: {
          id: 123,
          body: 'Test note content',
          user_id: 456,
          type: undefined,
          date: '2023-01-01T00:00:00Z',
          name: 'Test User',
          photo_url: undefined,
          reaction_count: undefined,
          reactions: undefined,
          restacks: undefined,
          restacked: undefined,
          children_count: undefined,
          language: undefined,
          body_json: undefined,
          publication_id: undefined,
          post_id: 789,
          edited_at: undefined,
          ancestor_path: undefined,
          reply_minimum_role: undefined,
          media_clip_id: undefined,
          bio: undefined,
          handle: undefined,
          user_bestseller_tier: undefined,
          attachments: undefined,
          userStatus: undefined,
          user_primary_publication: undefined,
          autotranslate_to: undefined,
          tracking_parameters: undefined
        },
        parentComments: []
      })

      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/comment/123')
    })

    it('When when HTTP request fails', async () => {
      const error = new Error('API Error')
      mockPublicationClient.get.mockRejectedValueOnce(error)

      await expect(noteService.getNoteById(123)).rejects.toThrow('API Error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/comment/123')
    })
  })

  describe('getNotesForLoggedUser', () => {
    it('When requesting paginated notes without cursor', async () => {
      const mockResponse = {
        items: [
          {
            entity_key: 'note-1',
            type: 'comment',
            context: {
              type: 'feed',
              timestamp: '2023-01-01T00:00:00Z',
              users: [],
              isFresh: false,
              page_rank: 1
            }
          }
        ],
        nextCursor: 'next-cursor-123'
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await noteService.getNotesForLoggedUser()

      expect(result).toEqual({
        notes: mockResponse.items,
        nextCursor: 'next-cursor-123'
      })
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/notes')
    })

    it('When requesting paginated notes with cursor', async () => {
      const mockResponse = {
        items: [],
        next_cursor: undefined
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await noteService.getNotesForLoggedUser({ cursor: 'test-cursor' })

      expect(result).toEqual({
        notes: [],
        nextCursor: undefined
      })
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/notes?cursor=test-cursor')
    })

    it('When missing items in response', async () => {
      const mockResponse = {
        nextCursor: 'next-cursor'
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await noteService.getNotesForLoggedUser()

      expect(result).toEqual({
        notes: [],
        nextCursor: 'next-cursor'
      })
    })
  })

  describe('getNotesForProfile', () => {
    it('When requesting paginated notes for profile without cursor', async () => {
      const mockResponse = {
        items: [
          {
            entity_key: 'note-1',
            type: 'comment',
            context: {
              type: 'feed',
              timestamp: '2023-01-01T00:00:00Z',
              users: [],
              isFresh: false,
              page_rank: 1
            }
          }
        ],
        nextCursor: 'next-cursor-456'
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await noteService.getNotesForProfile(123)

      expect(result).toEqual({
        notes: mockResponse.items,
        nextCursor: 'next-cursor-456'
      })
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/feed/profile/123?types=note')
    })

    it('When requesting paginated notes for profile with cursor', async () => {
      const mockResponse = {
        items: [],
        next_cursor: undefined
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await noteService.getNotesForProfile(456, { cursor: 'profile-cursor' })

      expect(result).toEqual({
        notes: [],
        nextCursor: undefined
      })
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/reader/feed/profile/456?types=note&cursor=profile-cursor'
      )
    })

    it('When URL encoding of cursor', async () => {
      const mockResponse = {
        items: [],
        next_cursor: undefined
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const cursorWithSpecialChars = 'cursor+with special=chars&more'
      await noteService.getNotesForProfile(789, { cursor: cursorWithSpecialChars })

      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        `/reader/feed/profile/789?types=note&cursor=${encodeURIComponent(cursorWithSpecialChars)}`
      )
    })
  })

  describe('getNoteStats', () => {
    it('When fetching stats for a note', async () => {
      const mockStats = { cards: [{ title: 'Impressions', value: 42 }] }
      mockPublicationClient.get.mockResolvedValueOnce(mockStats)

      const result = await noteService.getNoteStats('c-251155220')

      expect(result).toEqual(mockStats)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/note_stats/c-251155220')
    })

    it('When note stats request fails', async () => {
      mockPublicationClient.get.mockRejectedValueOnce(new Error('Stats API Error'))

      await expect(noteService.getNoteStats('c-123')).rejects.toThrow('Stats API Error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/note_stats/c-123')
    })
  })
})
