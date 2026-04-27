/**
 * Unit tests for io-ts validation codecs
 */

import {
  SubstackPreviewPostCodec,
  SubstackFullPostCodec,
  SubstackCommentCodec,
  SubstackCommentResponseCodec,
  SubstackNoteCodec,
  SubstackCommentRepliesResponseCodec,
  SubstackPublicationFullPostCodec
} from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'
import { isLeft, isRight } from 'fp-ts/Either'

describe('io-ts validation codecs', () => {
  describe('SubstackPostCodec', () => {
    it('should validate valid post data', () => {
      const validPost = {
        id: 123,
        title: 'Test Post',
        post_date: '2023-01-01T00:00:00Z',
        subtitle: 'A test post',
        truncated_body_text: 'This is a test...'
      }

      const result = SubstackPreviewPostCodec.decode(validPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackPreviewPostCodec, validPost, 'test post')
      expect(decoded.id).toBe(123)
      expect(decoded.title).toBe('Test Post')
      expect(decoded.subtitle).toBe('A test post')
    })

    it('should reject invalid post data', () => {
      const invalidPost = {
        id: 'not-a-number', // Invalid - should be number
        title: 'Test Post',
        post_date: '2023-01-01T00:00:00Z'
      }

      const result = SubstackPreviewPostCodec.decode(invalidPost)
      expect(isLeft(result)).toBe(true)

      expect(() => {
        decodeOrThrow(SubstackPreviewPostCodec, invalidPost, 'test post')
      }).toThrow('Invalid test post')
    })

    it('should handle minimal valid post data', () => {
      const minimalPost = {
        id: 456,
        title: 'Minimal Post',
        post_date: '2023-01-01T00:00:00Z'
      }

      const result = SubstackPreviewPostCodec.decode(minimalPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackPreviewPostCodec, minimalPost, 'minimal post')
      expect(decoded.id).toBe(456)
      expect(decoded.subtitle).toBeUndefined()
      expect(decoded.truncated_body_text).toBeUndefined()
    })
  })

  describe('SubstackFullPostCodec', () => {
    it('should validate valid full post data', () => {
      const validFullPost = {
        id: 123,
        title: 'Test Full Post',
        slug: 'test-full-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/test-full-post',
        body_html: '<p>This is the full HTML body content</p>',
        subtitle: 'A test full post',
        cover_image: 'https://example.com/image.jpg',
        truncated_body_text: 'This is a test...',
        htmlBody: '<p>Legacy HTML body</p>',
        postTags: ['tech', 'newsletter'],
        reactions: { '❤️': 10, '👍': 5, '👎': 1 },
        restacks: 3
      }

      const result = SubstackFullPostCodec.decode(validFullPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackFullPostCodec, validFullPost, 'test full post')
      expect(decoded.id).toBe(123)
      expect(decoded.title).toBe('Test Full Post')
      expect(decoded.slug).toBe('test-full-post')
      expect(decoded.body_html).toBe('<p>This is the full HTML body content</p>')
      expect(decoded.postTags).toEqual(['tech', 'newsletter'])
      expect(decoded.reactions).toEqual({ '❤️': 10, '👍': 5, '👎': 1 })
      expect(decoded.restacks).toBe(3)
    })

    it('should validate minimal full post data with only required fields', () => {
      const minimalFullPost = {
        id: 456,
        title: 'Minimal Full Post',
        slug: 'minimal-full-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/minimal-full-post'
      }

      const result = SubstackFullPostCodec.decode(minimalFullPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackFullPostCodec, minimalFullPost, 'minimal full post')
      expect(decoded.id).toBe(456)
      expect(decoded.body_html).toBeUndefined()
      expect(decoded.subtitle).toBeUndefined()
      expect(decoded.postTags).toBeUndefined()
      expect(decoded.reactions).toBeUndefined()
    })

    it('should reject full post with invalid postTags type', () => {
      const invalidFullPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        postTags: 'invalid-tags' // Should be array of strings
      }

      const result = SubstackFullPostCodec.decode(invalidFullPost)
      expect(isLeft(result)).toBe(true)
    })

    it('should reject full post with invalid reactions type', () => {
      const invalidFullPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        reactions: ['invalid'] // Should be record of string to number
      }

      const result = SubstackFullPostCodec.decode(invalidFullPost)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('SubstackCommentCodec', () => {
    it('should validate valid comment data', () => {
      const validComment = {
        id: 789,
        body: 'This is a comment',
        author_is_admin: false
      }

      const result = SubstackCommentCodec.decode(validComment)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackCommentCodec, validComment, 'test comment')
      expect(decoded.id).toBe(789)
      expect(decoded.body).toBe('This is a comment')
      expect(decoded.author_is_admin).toBe(false)
    })

    it('should handle optional author_is_admin field', () => {
      const commentWithoutAdmin = {
        id: 789,
        body: 'This is a comment'
      }

      const result = SubstackCommentCodec.decode(commentWithoutAdmin)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackCommentCodec, commentWithoutAdmin, 'test comment')
      expect(decoded.author_is_admin).toBeUndefined()
    })

    it('should reject invalid comment data', () => {
      const invalidComment = {
        id: 'not-a-number',
        body: 'This is a comment'
      }

      const result = SubstackCommentCodec.decode(invalidComment)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('SubstackCommentResponseCodec', () => {
    it('should validate valid comment response data', () => {
      const validResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Response comment',
            user_id: 456,
            name: 'Jane Doe',
            date: '2023-01-01T00:00:00Z',
            post_id: 789
          }
        }
      }

      const result = SubstackCommentResponseCodec.decode(validResponse)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackCommentResponseCodec, validResponse, 'test response')
      expect(decoded.item.comment.id).toBe(123)
      expect(decoded.item.comment.body).toBe('Response comment')
      expect(decoded.item.comment.post_id).toBe(789)
    })

    it('should handle null post_id', () => {
      const responseWithNullPostId = {
        item: {
          comment: {
            id: 123,
            body: 'Response comment',
            user_id: 456,
            name: 'Jane Doe',
            date: '2023-01-01T00:00:00Z',
            post_id: null
          }
        }
      }

      const result = SubstackCommentResponseCodec.decode(responseWithNullPostId)
      expect(isRight(result)).toBe(true)
    })

    it('should reject invalid comment response structure', () => {
      const invalidResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Response comment',
            user_id: 'not-a-number', // Invalid - should be number
            name: 'Jane Doe',
            date: '2023-01-01T00:00:00Z'
          }
        }
      }

      const result = SubstackCommentResponseCodec.decode(invalidResponse)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('SubstackNoteCodec', () => {
    it('should validate full note data with nested structures', () => {
      const validNote = {
        entity_key: 'note-123',
        type: 'note',
        context: {
          type: 'note',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 1,
              name: 'Test User',
              handle: 'testuser',
              photo_url: 'https://example.com/photo.jpg',
              bio: 'A test user',
              bestseller_tier: '1'
            }
          ]
        },
        comment: {
          id: 456,
          body: 'Note body content',
          user_id: 1,
          type: 'feed',
          date: '2023-01-01T00:00:00Z',
          name: 'Test User',
          reaction_count: 5,
          reactions: { '❤️': 5 },
          restacks: 2,
          restacked: false,
          children_count: 0,
          attachments: []
        },
        parentComments: [],
        isMuted: false,
        canReply: true
      }

      const result = SubstackNoteCodec.decode(validNote)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackNoteCodec, validNote, 'test note')
      expect(decoded.entity_key).toBe('note-123')
      expect(decoded.comment?.body).toBe('Note body content')
      expect(decoded.comment?.reaction_count).toBe(5)
      expect(decoded.context?.users[0].name).toBe('Test User')
    })

    it('should handle minimal note with only required fields', () => {
      const minimalNote = {
        entity_key: 'note-456',
        type: 'note'
      }

      const result = SubstackNoteCodec.decode(minimalNote)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackNoteCodec, minimalNote, 'minimal note')
      expect(decoded.entity_key).toBe('note-456')
      expect(decoded.comment).toBeUndefined()
      expect(decoded.context).toBeUndefined()
    })

    it('should handle note with null optional fields', () => {
      const noteWithNulls = {
        entity_key: 'note-789',
        type: 'note',
        comment: null,
        context: null,
        parentComments: null,
        publication: null
      }

      const result = SubstackNoteCodec.decode(noteWithNulls)
      expect(isRight(result)).toBe(true)
    })

    it('should reject note missing required fields', () => {
      const invalidNote = {
        type: 'note'
        // Missing entity_key
      }

      const result = SubstackNoteCodec.decode(invalidNote)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('SubstackCommentRepliesResponseCodec', () => {
    it('should validate comment replies with wrapped descendant comments', () => {
      const validResponse = {
        commentBranches: [
          {
            comment: {
              id: 1,
              body: 'Top-level reply',
              name: 'Reply Author',
              user_id: 123,
              date: '2023-01-01T00:00:00Z',
              reaction_count: 3
            },
            descendantComments: [
              {
                type: 'comment',
                comment: {
                  id: 2,
                  body: 'Nested reply',
                  name: 'Nested Author',
                  user_id: 456
                }
              }
            ]
          }
        ],
        moreBranches: 1,
        nextCursor: 'cursor123'
      }

      const result = SubstackCommentRepliesResponseCodec.decode(validResponse)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(
        SubstackCommentRepliesResponseCodec,
        validResponse,
        'test replies'
      )
      expect(decoded.commentBranches).toHaveLength(1)
      expect(decoded.commentBranches[0].descendantComments).toHaveLength(1)
      expect(decoded.commentBranches[0].descendantComments[0].type).toBe('comment')
      expect(decoded.commentBranches[0].descendantComments[0].comment.body).toBe('Nested reply')
      expect(decoded.moreBranches).toBe(1)
      expect(decoded.nextCursor).toBe('cursor123')
    })

    it('should handle empty comment branches', () => {
      const emptyResponse = {
        commentBranches: [],
        moreBranches: 0,
        nextCursor: null
      }

      const result = SubstackCommentRepliesResponseCodec.decode(emptyResponse)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(
        SubstackCommentRepliesResponseCodec,
        emptyResponse,
        'empty replies'
      )
      expect(decoded.commentBranches).toHaveLength(0)
      expect(decoded.nextCursor).toBeNull()
    })

    it('should reject invalid wrapped descendant comment', () => {
      const invalidResponse = {
        commentBranches: [
          {
            comment: { id: 1, body: 'Reply' },
            descendantComments: [
              {
                type: 'comment',
                comment: { id: 'invalid', body: 'Bad' } // id should be number
              }
            ]
          }
        ],
        moreBranches: 0,
        nextCursor: null
      }

      const result = SubstackCommentRepliesResponseCodec.decode(invalidResponse)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('SubstackPublicationFullPostCodec', () => {
    it('should validate publication full post with expanded fields', () => {
      const validPost = {
        id: 123,
        title: 'Publication Post',
        post_date: '2023-01-01T00:00:00Z',
        slug: 'pub-post',
        canonical_url: 'https://test.substack.com/p/pub-post',
        body_html: '<p>HTML body</p>',
        description: 'A description',
        wordcount: 500,
        comment_count: 10,
        child_comment_count: 3,
        postTags: [
          { id: 1, publication_id: 1, name: 'tech', slug: 'tech', hidden: false }
        ],
        reactions: { '❤️': 5 },
        restacks: 2,
        type: 'newsletter',
        audience: 'everyone'
      }

      const result = SubstackPublicationFullPostCodec.decode(validPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(
        SubstackPublicationFullPostCodec,
        validPost,
        'test pub post'
      )
      expect(decoded.id).toBe(123)
      expect(decoded.wordcount).toBe(500)
      expect(decoded.comment_count).toBe(10)
      expect(decoded.postTags?.[0].name).toBe('tech')
    })

    it('should handle minimal publication full post', () => {
      const minimalPost = {
        id: 456,
        title: 'Minimal Pub Post',
        slug: 'minimal-pub-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://test.substack.com/p/minimal-pub-post'
      }

      const result = SubstackPublicationFullPostCodec.decode(minimalPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(
        SubstackPublicationFullPostCodec,
        minimalPost,
        'minimal pub post'
      )
      expect(decoded.id).toBe(456)
      expect(decoded.wordcount).toBeUndefined()
      expect(decoded.postTags).toBeUndefined()
    })

    it('should handle null optional fields', () => {
      const postWithNulls = {
        id: 789,
        title: 'Post with nulls',
        slug: 'post-with-nulls',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://test.substack.com/p/post-with-nulls',
        body_html: null,
        description: null,
        wordcount: null,
        postTags: null
      }

      const result = SubstackPublicationFullPostCodec.decode(postWithNulls)
      expect(isRight(result)).toBe(true)
    })
  })

  describe('SubstackPreviewPostCodec expanded fields', () => {
    it('should validate post with all expanded fields and nulls', () => {
      const expandedPost = {
        id: 123,
        title: 'Expanded Post',
        post_date: '2023-01-01T00:00:00Z',
        slug: 'expanded-post',
        canonical_url: 'https://example.com/p/expanded-post',
        cover_image: null,
        comment_count: 15,
        restacks: 3,
        type: 'newsletter',
        audience: 'everyone',
        wordcount: 1200,
        description: 'A detailed description',
        publishedBylines: [{ id: 1, name: 'Author Name', handle: 'author', photo_url: 'https://example.com/photo.jpg' }],
        postTags: [{ id: '1', publication_id: 1, name: 'tech', slug: 'tech', hidden: false }],
        reactions: { '❤️': 10, '👍': 5 }
      }

      const result = SubstackPreviewPostCodec.decode(expandedPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackPreviewPostCodec, expandedPost, 'expanded post')
      expect(decoded.slug).toBe('expanded-post')
      expect(decoded.comment_count).toBe(15)
      expect(decoded.reactions).toEqual({ '❤️': 10, '👍': 5 })
      expect(decoded.cover_image).toBeNull()
    })
  })

  describe('SubstackCommentCodec expanded fields', () => {
    it('should validate comment with all expanded fields', () => {
      const expandedComment = {
        id: 123,
        body: 'Test comment body',
        user_id: 456,
        name: 'Test Author',
        date: '2023-01-01T00:00:00Z',
        reaction_count: 5,
        reactions: { '❤️': 3 },
        restacks: 1,
        children_count: 2,
        photo_url: 'https://example.com/photo.jpg',
        bio: 'Author bio',
        handle: 'testauthor',
        author_is_admin: false
      }

      const result = SubstackCommentCodec.decode(expandedComment)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackCommentCodec, expandedComment, 'expanded comment')
      expect(decoded.name).toBe('Test Author')
      expect(decoded.reaction_count).toBe(5)
      expect(decoded.reactions).toEqual({ '❤️': 3 })
      expect(decoded.restacks).toBe(1)
      expect(decoded.children_count).toBe(2)
      expect(decoded.photo_url).toBe('https://example.com/photo.jpg')
    })

    it('should handle comment with null optional fields', () => {
      const commentWithNulls = {
        id: 789,
        body: 'Minimal comment',
        user_id: null,
        name: null,
        reaction_count: null,
        reactions: null,
        restacks: null,
        children_count: null
      }

      const result = SubstackCommentCodec.decode(commentWithNulls)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackCommentCodec, commentWithNulls, 'null comment')
      expect(decoded.user_id).toBeNull()
      expect(decoded.name).toBeNull()
      expect(decoded.reaction_count).toBeNull()
    })
  })
})
