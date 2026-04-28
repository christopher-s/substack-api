import { Profile } from '@substack-api/domain/profile'
import { Note } from '@substack-api/domain'
import { createMockEntityDeps } from '@test/unit/helpers/mock-services'

describe('Profile Entity - Notes', () => {
  let deps: ReturnType<typeof createMockEntityDeps>
  let profile: Profile
  let mockProfileData: any

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

    profile = new Profile(mockProfileData, deps)
  })

  describe('notes()', () => {
    it('When iterating profile notes, then returns Note instances', async () => {
      const mockResponse = [
        {
          entity_key: 'c-123',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 123,
            body: 'Test note content',
            type: 'feed',
            user_id: 123,
            date: '2023-01-01T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 5,
            reactions: { '❤️': 5 },
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-123',
            item_entity_key: 'c-123',
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
        },
        {
          entity_key: 'c-124',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-02T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 2
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 124,
            body: 'Another test note',
            type: 'feed',
            user_id: 123,
            date: '2023-01-02T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 3,
            reactions: { '❤️': 3 },
            restacks: 1,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-124',
            item_entity_key: 'c-124',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-02T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 2,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
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
        {
          entity_key: 'c-125',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 125,
            body: 'Limited note',
            type: 'feed',
            user_id: 123,
            date: '2023-01-01T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 2,
            reactions: { '❤️': 2 },
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-125',
            item_entity_key: 'c-125',
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
        },
        {
          entity_key: 'c-126',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-02T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 2
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 126,
            body: 'Second note',
            type: 'feed',
            user_id: 123,
            date: '2023-01-02T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 1,
            reactions: { '❤️': 1 },
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-126',
            item_entity_key: 'c-126',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-02T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 2,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
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
      const mockResponse = [
        {
          entity_key: 'c-128',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 128,
            body: 'Actual note',
            type: 'feed', // This is a note
            user_id: 123,
            date: '2023-01-01T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-128',
            item_entity_key: 'c-128',
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
        }
      ]
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
      deps.noteService.getNotesForProfile.mockResolvedValue({} as any)

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
        {
          entity_key: 'c-130',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 130,
            body: 'Note 1',
            type: 'feed',
            user_id: 123,
            date: '2023-01-01T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-130',
            item_entity_key: 'c-130',
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
        },
        {
          entity_key: 'c-131',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-02T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 2
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 131,
            body: 'Note 2',
            type: 'feed',
            user_id: 123,
            date: '2023-01-02T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-131',
            item_entity_key: 'c-131',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-02T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 2,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]

      // Mock second page response (partial page - should trigger end of pagination)
      const secondPageResponse = [
        {
          entity_key: 'c-132',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-03T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 3
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 132,
            body: 'Note 3',
            type: 'feed',
            user_id: 123,
            date: '2023-01-03T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-132',
            item_entity_key: 'c-132',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-03T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 3,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]

      // Setup sequential responses for pagination
      deps.noteService.getNotesForProfile
        .mockResolvedValueOnce({
          notes: firstPageResponse,
          nextCursor: 'cursor1'
        }) // offset=0, returns 2 notes (full page)
        .mockResolvedValueOnce({
          notes: secondPageResponse,
          nextCursor: undefined
        }) // offset=2, returns 1 note (partial page - end)

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(3)
      expect(notes[0].body).toBe('Note 1')
      expect(notes[1].body).toBe('Note 2')
      expect(notes[2].body).toBe('Note 3')

      // Verify both service calls were made with correct offsets
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
