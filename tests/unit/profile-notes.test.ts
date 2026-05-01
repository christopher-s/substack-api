import { Profile } from '@substack-api/domain/profile'
import { Note } from '@substack-api/domain'
import { createMockEntityDeps } from '@test/unit/helpers/mock-services'

// ---------------------------------------------------------------------------
// Shared mock factories
// ---------------------------------------------------------------------------

const baseTrackingParams = {
  item_primary_entity_key: 'c-default',
  item_entity_key: 'c-default',
  item_type: 'comment',
  item_content_user_id: 123,
  item_context_type: 'note',
  item_context_type_bucket: '',
  item_context_timestamp: '2023-01-01T00:00:00Z',
  item_context_user_id: 123,
  item_context_user_ids: [123],
  item_can_reply: true,
  item_is_fresh: false,
  item_last_impression_at: null,
  item_page: null,
  item_page_rank: 1,
  impression_id: 'test-impression',
  followed_user_count: 0,
  subscribed_publication_count: 0,
  is_following: false,
  is_explicitly_subscribed: false
}

function mockTrackingParameters(
  overrides: Partial<typeof baseTrackingParams> = {}
): typeof baseTrackingParams {
  return { ...baseTrackingParams, ...overrides }
}

const baseNoteUser = {
  id: 123,
  name: 'Test User',
  handle: 'testuser',
  photo_url: 'https://example.com/photo.jpg',
  profile_set_up_at: '2023-01-01T00:00:00Z',
  reader_installed_at: '2023-01-01T00:00:00Z'
}

interface CreateMockNoteOptions {
  id: number
  body: string
  date?: string
  pageRank?: number
  reactionCount?: number
  reactions?: Record<string, number>
  restacks?: number
}

function createMockNote(options: CreateMockNoteOptions) {
  const {
    id,
    body,
    date = '2023-01-01T00:00:00Z',
    pageRank = 1,
    reactionCount = 0,
    reactions = {},
    restacks = 0
  } = options

  return {
    entity_key: `c-${id}`,
    type: 'comment',
    context: {
      type: 'note',
      timestamp: date,
      users: [baseNoteUser],
      isFresh: false,
      page_rank: pageRank
    },
    comment: {
      name: 'Test User',
      handle: 'testuser',
      photo_url: 'https://example.com/photo.jpg',
      id,
      body,
      type: 'feed',
      user_id: 123,
      date,
      ancestor_path: '',
      reply_minimum_role: 'everyone',
      reaction_count: reactionCount,
      reactions,
      restacks,
      restacked: false,
      children_count: 0,
      attachments: []
    },
    parentComments: [],
    canReply: true,
    isMuted: false,
    trackingParameters: mockTrackingParameters({
      item_primary_entity_key: `c-${id}`,
      item_entity_key: `c-${id}`,
      item_context_timestamp: date,
      item_page_rank: pageRank
    })
  }
}

describe('Profile Entity - Notes', () => {
  let deps: ReturnType<typeof createMockEntityDeps>
  let profile: Profile
  let mockProfileData: Record<string, unknown>

  beforeEach(() => {
    deps = createMockEntityDeps()

    mockProfileData = {
      id: 123,
      handle: 'testuser',
      name: 'Test User',
      photo_url: 'https://example.com/photo.jpg',
      bio: 'Test bio',
      profile_set_up_at: '2023-01-01T00:00:00Z',
      reader_installed_at: '2023-01-01T00:00:00Z',
      profile_disabled: false,
      publicationUsers: [],
      userLinks: [],
      subscriptions: [],
      subscriptionsTruncated: false,
      hasGuestPost: false,
      max_pub_tier: 0,
      hasActivity: false,
      hasLikes: false,
      lists: [],
      rough_num_free_subscribers_int: 0,
      rough_num_free_subscribers: '0',
      bestseller_badge_disabled: false,
      subscriberCountString: '0',
      subscriberCount: '0',
      subscriberCountNumber: 0,
      hasHiddenPublicationUsers: false,
      visibleSubscriptionsCount: 0,
      slug: 'testuser',
      primaryPublicationIsPledged: false,
      primaryPublicationSubscriptionState: 'not_subscribed',
      isSubscribed: false,
      isFollowing: false,
      followsViewer: false,
      can_dm: false,
      dm_upgrade_options: []
    }

    profile = new Profile(
      mockProfileData as unknown as import('@substack-api/internal').SubstackFullProfile,
      deps
    )
  })

  describe('notes()', () => {
    it('When iterating profile notes, then returns Note instances', async () => {
      const mockResponse = [
        createMockNote({
          id: 123,
          body: 'Test note content',
          reactionCount: 5,
          reactions: { '❤️': 5 }
        }),
        createMockNote({
          id: 124,
          body: 'Another test note',
          date: '2023-01-02T00:00:00Z',
          pageRank: 2,
          reactionCount: 3,
          reactions: { '❤️': 3 },
          restacks: 1
        })
      ]
      deps.noteService.getNotesForProfile.mockResolvedValue({
        notes: mockResponse,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of profile.notes({ limit: 2 })) {
        notes.push(note)
      }

      expect(notes).toHaveLength(2)
      expect(notes[0]).toBeInstanceOf(Note)
      expect(notes[0].body).toBe('Test note content')
      expect(notes[1].body).toBe('Another test note')
      expect(deps.noteService.getNotesForProfile).toHaveBeenCalledWith(123, {
        cursor: undefined
      })
    })

    it('When limit is specified, then returns only that many notes', async () => {
      const mockResponse = [
        createMockNote({ id: 125, body: 'Limited note', reactionCount: 2, reactions: { '❤️': 2 } }),
        createMockNote({
          id: 126,
          body: 'Second note',
          date: '2023-01-02T00:00:00Z',
          pageRank: 2,
          reactionCount: 1,
          reactions: { '❤️': 1 }
        })
      ]
      deps.noteService.getNotesForProfile.mockResolvedValue({
        notes: mockResponse,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of profile.notes({ limit: 1 })) {
        notes.push(note)
      }

      expect(notes).toHaveLength(1)
      expect(notes[0].body).toBe('Limited note')
    })

    it('When response contains non-note items, then filters them out', async () => {
      const mockResponse = [createMockNote({ id: 128, body: 'Actual note' })]
      deps.noteService.getNotesForProfile.mockResolvedValue({
        notes: mockResponse,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(1)
      expect(notes[0].body).toBe('Actual note')
    })

    it('When notes response is empty, then returns empty array', async () => {
      deps.noteService.getNotesForProfile.mockResolvedValue({
        notes: [],
        nextCursor: undefined
      })

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
    })

    it('When notes property is missing, then returns empty array', async () => {
      deps.noteService.getNotesForProfile.mockResolvedValue(
        {} as unknown as import('@substack-api/internal/types').PaginatedSubstackNotes
      )

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
    })

    it('When notes() API call fails, then propagates the error', async () => {
      deps.noteService.getNotesForProfile.mockRejectedValue(new Error('API error'))

      const collectNotes = async () => {
        const notes = []
        for await (const note of profile.notes()) {
          notes.push(note)
        }
        return notes
      }

      await expect(collectNotes()).rejects.toThrow('API error')
    })

    it('When multiple pages of notes exist, then paginates through all pages', async () => {
      // Reset the mock to avoid interference from other tests
      deps.noteService.getNotesForProfile.mockReset()

      // Mock first page response (full page)
      const firstPageResponse = [
        createMockNote({ id: 130, body: 'Note 1' }),
        createMockNote({ id: 131, body: 'Note 2', date: '2023-01-02T00:00:00Z', pageRank: 2 })
      ]

      // Mock second page response (partial page - should trigger end of pagination)
      const secondPageResponse = [
        createMockNote({ id: 132, body: 'Note 3', date: '2023-01-03T00:00:00Z', pageRank: 3 })
      ]

      // Setup sequential responses for pagination
      deps.noteService.getNotesForProfile
        .mockResolvedValueOnce({
          notes: firstPageResponse,
          nextCursor: 'cursor1'
        })
        .mockResolvedValueOnce({
          notes: secondPageResponse,
          nextCursor: undefined
        })

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(3)
      expect(notes[0].body).toBe('Note 1')
      expect(notes[1].body).toBe('Note 2')
      expect(notes[2].body).toBe('Note 3')

      expect(deps.noteService.getNotesForProfile).toHaveBeenCalledTimes(2)
      expect(deps.noteService.getNotesForProfile).toHaveBeenNthCalledWith(1, 123, {
        cursor: undefined
      })
      expect(deps.noteService.getNotesForProfile).toHaveBeenNthCalledWith(2, 123, {
        cursor: 'cursor1'
      })
    })
  })
})
