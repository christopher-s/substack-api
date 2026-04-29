import { NoteBuilder, ParagraphBuilder } from '@substack-api/domain/note-builder'
import type { HttpClient } from '@substack-api/internal/http-client'
import type { PublishNoteResponse } from '@substack-api/internal'

describe('NoteBuilder (Legacy Test Suite)', () => {
  let mockPublicationClient: jest.Mocked<HttpClient>
  let mockPublishResponse: PublishNoteResponse

  beforeEach(() => {
    mockPublicationClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    mockPublishResponse = {
      id: 789,
      date: '2023-01-01T00:00:00Z',
      body: 'Test note content',
      attachments: []
    }

    mockPublicationClient.post.mockResolvedValue(mockPublishResponse)
  })

  describe('Constructor', () => {
    it('When empty post builder', () => {
      const builder = new NoteBuilder(mockPublicationClient)
      expect(builder).toBeInstanceOf(NoteBuilder)
    })
  })

  describe('Simple use case', () => {
    it('When note with simple text and publish', async () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const result = await builder.paragraph().text('my test text').publish()

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'my test text'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Two paragraphs', () => {
    it('When note with two simple paragraphs', async () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const result = await builder
        .paragraph()
        .text('my test text1')
        .paragraph()
        .text('my test text2')
        .publish()

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'my test text1'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'my test text2'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Rich formatting within a paragraph', () => {
    it('When note with rich formatting', async () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const result = await builder
        .paragraph()
        .text('adasd')
        .bold('this is bold')
        .text('regular again')
        .paragraph()
        .text('my test text2')
        .publish()

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'adasd'
                },
                {
                  type: 'text',
                  text: 'this is bold',
                  marks: [{ type: 'bold' }]
                },
                {
                  type: 'text',
                  text: 'regular again'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'my test text2'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Multiple paragraphs with different formatting', () => {
    it('When note with multiple rich paragraphs', async () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const result = await builder
        .paragraph()
        .text('adasd')
        .bold('this is bold')
        .text('regular again')
        .paragraph()
        .text('adasd')
        .italic('this is italic')
        .text('regular again')
        .publish()

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'adasd'
                },
                {
                  type: 'text',
                  text: 'this is bold',
                  marks: [{ type: 'bold' }]
                },
                {
                  type: 'text',
                  text: 'regular again'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'adasd'
                },
                {
                  type: 'text',
                  text: 'this is italic',
                  marks: [{ type: 'italic' }]
                },
                {
                  type: 'text',
                  text: 'regular again'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Code formatting', () => {
    it('should support code formatting in paragraphs', async () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const result = await builder
        .paragraph()
        .text('Here is some ')
        .code('code()')
        .text(' in the text')
        .publish()

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Here is some '
                },
                {
                  type: 'text',
                  text: 'code()',
                  marks: [{ type: 'code' }]
                },
                {
                  type: 'text',
                  text: ' in the text'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Mixed formatting types', () => {
    it('should support all formatting types in one paragraph', async () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const result = await builder
        .paragraph()
        .text('Plain text, ')
        .bold('bold text, ')
        .italic('italic text, ')
        .code('code text')
        .publish()

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Plain text, '
                },
                {
                  type: 'text',
                  text: 'bold text, ',
                  marks: [{ type: 'bold' }]
                },
                {
                  type: 'text',
                  text: 'italic text, ',
                  marks: [{ type: 'italic' }]
                },
                {
                  type: 'text',
                  text: 'code text',
                  marks: [{ type: 'code' }]
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Strikethrough formatting', () => {
    it('should support strikethrough via fluent API', async () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const result = await builder
        .paragraph()
        .text('Hello ')
        .strikethrough('world')
        .text('!')
        .publish()

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Hello '
                },
                {
                  type: 'text',
                  text: 'world',
                  marks: [{ type: 'strike' }]
                },
                {
                  type: 'text',
                  text: '!'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('ParagraphBuilder', () => {
    it('When requesting ParagraphBuilder instance for rich formatting', () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const paragraphBuilder = builder.paragraph()
      expect(paragraphBuilder).toBeInstanceOf(ParagraphBuilder)
    })

    it('should allow chaining from paragraph builder to new node', async () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const result = await builder
        .paragraph()
        .text('First paragraph')
        .paragraph()
        .text('Second paragraph')
        .publish()

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'First paragraph'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Second paragraph'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })

    it('should publish directly from paragraph builder', async () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const result = await builder.paragraph().text('Only paragraph').publish()

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Only paragraph'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Empty content handling', () => {
    it('When when trying to publish empty note', () => {
      const builder = new NoteBuilder(mockPublicationClient)
      expect(() => builder.build()).toThrow('Note must contain at least one paragraph')
    })
  })

  describe('Markdown input', () => {
    it('When building note from simple markdown', () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const request = builder.markdown('Hello **world**!').build()

      expect(request.bodyJson.type).toBe('doc')
      expect(request.bodyJson.content).toHaveLength(1)
      const para = request.bodyJson.content[0]
      expect(para.type).toBe('paragraph')
    })

    it('When building note from markdown with lists', () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const request = builder.markdown('- item1\n- item2').build()

      expect(request.bodyJson.content).toHaveLength(1)
      expect(request.bodyJson.content[0].type).toBe('bulletList')
    })

    it('When publishing note from markdown', async () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const result = await builder.markdown('Hello world').publish()

      expect(mockPublicationClient.post).toHaveBeenCalledWith('/comment/feed/', expect.objectContaining({
        bodyJson: expect.objectContaining({ type: 'doc' })
      }))
      expect(result).toEqual(mockPublishResponse)
    })

    it('When markdown produces valid ProseMirror for links', () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const request = builder.markdown('[click here](https://example.com)').build()

      const para = request.bodyJson.content[0]
      expect(para.type).toBe('paragraph')
    })

    it('When markdown with strikethrough produces strike segments', () => {
      const builder = new NoteBuilder(mockPublicationClient)
      const request = builder.markdown('Hello ~~world~~').build()

      const para = request.bodyJson.content[0]
      expect(para.type).toBe('paragraph')
      const textNodes = para.content
      expect(textNodes).toHaveLength(2)
      expect(textNodes[0]).toEqual({ type: 'text', text: 'Hello ' })
      expect(textNodes[1]).toEqual({
        type: 'text',
        text: 'world',
        marks: [{ type: 'strike' }]
      })
    })
  })
})
