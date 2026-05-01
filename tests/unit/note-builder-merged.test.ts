import {
  NoteBuilder,
  ParagraphBuilder,
  NoteWithLinkBuilder
} from '@substack-api/domain/note-builder'
import type { HttpClient } from '@substack-api/internal/http-client'
import type { PublishNoteResponse } from '@substack-api/internal'

describe('NoteBuilder', () => {
  let mockClient: jest.Mocked<HttpClient>
  let mockPublishResponse: PublishNoteResponse

  beforeEach(() => {
    mockClient = {
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

    mockClient.post.mockResolvedValue(mockPublishResponse)
  })

  describe('Constructor', () => {
    it('When empty post builder', () => {
      const builder = new NoteBuilder(mockClient)
      expect(builder).toBeInstanceOf(NoteBuilder)
    })
  })

  describe('Simple text', () => {
    it('When note with simple text and publish', async () => {
      const builder = new NoteBuilder(mockClient)
      const result = await builder.paragraph().text('my test text').publish()

      expect(mockClient.post).toHaveBeenCalledWith('/comment/feed/', {
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

    it('When simple text segments', () => {
      const request = new NoteBuilder(mockClient).paragraph().text('Simple text').build()

      expect(request.bodyJson.content[0].content[0]).toEqual({
        type: 'text',
        text: 'Simple text'
      })
    })
  })

  describe('Multiple paragraphs', () => {
    it('When note with two simple paragraphs', async () => {
      const builder = new NoteBuilder(mockClient)
      const result = await builder
        .paragraph()
        .text('my test text1')
        .paragraph()
        .text('my test text2')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/comment/feed/', {
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

    it('When note with rich formatting', async () => {
      const builder = new NoteBuilder(mockClient)
      const result = await builder
        .paragraph()
        .text('adasd')
        .bold('this is bold')
        .text('regular again')
        .paragraph()
        .text('my test text2')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/comment/feed/', {
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

    it('When note with multiple rich paragraphs', async () => {
      const builder = new NoteBuilder(mockClient)
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

      expect(mockClient.post).toHaveBeenCalledWith('/comment/feed/', {
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
      const builder = new NoteBuilder(mockClient)
      const result = await builder
        .paragraph()
        .text('Here is some ')
        .code('code()')
        .text(' in the text')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/comment/feed/', {
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
      const builder = new NoteBuilder(mockClient)
      const result = await builder
        .paragraph()
        .text('Plain text, ')
        .bold('bold text, ')
        .italic('italic text, ')
        .code('code text')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/comment/feed/', {
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

    it('When all formatting types via build', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .bold('bold')
        .text(' ')
        .italic('italic')
        .text(' ')
        .code('code')
        .text(' ')
        .underline('underline')
        .text(' ')
        .link('link', 'https://example.com')
        .build()

      const content = request.bodyJson.content[0].content
      expect(content[0]).toEqual({ type: 'text', text: 'bold', marks: [{ type: 'bold' }] })
      expect(content[2]).toEqual({ type: 'text', text: 'italic', marks: [{ type: 'italic' }] })
      expect(content[4]).toEqual({ type: 'text', text: 'code', marks: [{ type: 'code' }] })
      expect(content[6]).toEqual({
        type: 'text',
        text: 'underline',
        marks: [{ type: 'underline' }]
      })
      expect(content[8]).toEqual({
        type: 'text',
        text: 'link',
        marks: [
          {
            type: 'link',
            attrs: {
              href: 'https://example.com',
              target: '_blank',
              class: 'note-link',
              rel: 'nofollow ugc noopener'
            }
          }
        ]
      })
    })
  })

  describe('Strikethrough formatting', () => {
    it('should support strikethrough via fluent API', async () => {
      const builder = new NoteBuilder(mockClient)
      const result = await builder
        .paragraph()
        .text('Hello ')
        .strikethrough('world')
        .text('!')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/comment/feed/', {
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
      const builder = new NoteBuilder(mockClient)
      const paragraphBuilder = builder.paragraph()
      expect(paragraphBuilder).toBeInstanceOf(ParagraphBuilder)
    })

    it('should allow chaining from paragraph builder to new node', async () => {
      const builder = new NoteBuilder(mockClient)
      const result = await builder
        .paragraph()
        .text('First paragraph')
        .paragraph()
        .text('Second paragraph')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/comment/feed/', {
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
      const builder = new NoteBuilder(mockClient)
      const result = await builder.paragraph().text('Only paragraph').publish()

      expect(mockClient.post).toHaveBeenCalledWith('/comment/feed/', {
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

    it('should support underline formatting in paragraphs', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .text('This is ')
        .underline('underlined text')
        .text('.')
        .build()

      expect(request.bodyJson.content[0].content).toEqual([
        { type: 'text', text: 'This is ' },
        { type: 'text', text: 'underlined text', marks: [{ type: 'underline' }] },
        { type: 'text', text: '.' }
      ])
    })

    it('should support links in paragraphs', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .text('Visit ')
        .link('our website', 'https://example.com')
        .text(' for more info.')
        .build()

      expect(request.bodyJson.content[0].content).toEqual([
        { type: 'text', text: 'Visit ' },
        {
          type: 'text',
          text: 'our website',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://example.com',
                target: '_blank',
                class: 'note-link',
                rel: 'nofollow ugc noopener'
              }
            }
          ]
        },
        { type: 'text', text: ' for more info.' }
      ])
    })
  })

  describe('Empty content and validation', () => {
    it('throws for empty notes', () => {
      const builder = new NoteBuilder(mockClient)
      expect(() => builder.build()).toThrow('Note must contain at least one paragraph')
    })

    it('throws for paragraphs with no content', () => {
      const builderWithEmptyParagraph = new NoteBuilder(mockClient, {
        paragraphs: [{ segments: [], lists: [] }]
      })

      expect(() => builderWithEmptyParagraph.build()).toThrow(
        'Each paragraph must contain at least one content block'
      )
    })

    it('throws for links without URL', () => {
      const testBuilder = new NoteBuilder(mockClient, {
        paragraphs: [
          {
            segments: [{ text: 'test', type: 'link' }],
            lists: []
          }
        ]
      })

      expect(() => testBuilder.build()).toThrow('Link segments must have a URL')
    })
  })

  describe('Attachment support', () => {
    it('When notes with attachment IDs', () => {
      const builderWithAttachment = new NoteBuilder(mockClient, {
        paragraphs: [{ segments: [{ text: 'test', type: 'simple' }], lists: [] }],
        attachmentIds: ['attachment-123']
      })

      const request = builderWithAttachment.build()
      expect(request.attachmentIds).toEqual(['attachment-123'])
    })
  })

  describe('Markdown input', () => {
    it('When building note from simple markdown', () => {
      const builder = new NoteBuilder(mockClient)
      const request = builder.markdown('Hello **world**!').build()

      expect(request.bodyJson.type).toBe('doc')
      expect(request.bodyJson.content).toHaveLength(1)
      const para = request.bodyJson.content[0]
      expect(para.type).toBe('paragraph')
    })

    it('When building note from markdown with lists', () => {
      const builder = new NoteBuilder(mockClient)
      const request = builder.markdown('- item1\n- item2').build()

      expect(request.bodyJson.content).toHaveLength(1)
      expect(request.bodyJson.content[0].type).toBe('bulletList')
    })

    it('When publishing note from markdown', async () => {
      const builder = new NoteBuilder(mockClient)
      const result = await builder.markdown('Hello world').publish()

      expect(mockClient.post).toHaveBeenCalledWith(
        '/comment/feed/',
        expect.objectContaining({
          bodyJson: expect.objectContaining({ type: 'doc' })
        })
      )
      expect(result).toEqual(mockPublishResponse)
    })

    it('When markdown produces valid ProseMirror for links', () => {
      const builder = new NoteBuilder(mockClient)
      const request = builder.markdown('[click here](https://example.com)').build()

      const para = request.bodyJson.content[0]
      expect(para.type).toBe('paragraph')
    })

    it('When markdown with strikethrough produces strike segments', () => {
      const builder = new NoteBuilder(mockClient)
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

  describe('List formatting', () => {
    it('should support code formatting in list items', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .bulletList()
        .item()
        .text('This is ')
        .code('console.log("test")')
        .text(' in a list')
        .finish()
        .build()

      const bulletList = request.bodyJson.content[0] as unknown as {
        content: { content: { content: unknown[] }[] }[]
      }
      const listItem = bulletList.content[0]
      const paragraph = listItem.content[0]
      expect(paragraph.content).toEqual([
        { type: 'text', text: 'This is ' },
        { type: 'text', text: 'console.log("test")', marks: [{ type: 'code' }] },
        { type: 'text', text: ' in a list' }
      ])
    })

    it('should support underline formatting in list items', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .bulletList()
        .item()
        .text('This is ')
        .underline('underlined')
        .text(' text')
        .finish()
        .build()

      const bulletList = request.bodyJson.content[0] as unknown as {
        content: { content: { content: unknown[] }[] }[]
      }
      const listItem = bulletList.content[0]
      const paragraph = listItem.content[0]
      expect(paragraph.content).toEqual([
        { type: 'text', text: 'This is ' },
        { type: 'text', text: 'underlined', marks: [{ type: 'underline' }] },
        { type: 'text', text: ' text' }
      ])
    })

    it('should support links in list items', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .bulletList()
        .item()
        .text('Check out ')
        .link('this link', 'https://example.com')
        .text('!')
        .finish()
        .build()

      const bulletList = request.bodyJson.content[0] as unknown as {
        content: { content: { content: unknown[] }[] }[]
      }
      const listItem = bulletList.content[0]
      const paragraph = listItem.content[0]
      expect(paragraph.content).toEqual([
        { type: 'text', text: 'Check out ' },
        {
          type: 'text',
          text: 'this link',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://example.com',
                target: '_blank',
                class: 'note-link',
                rel: 'nofollow ugc noopener'
              }
            }
          ]
        },
        { type: 'text', text: '!' }
      ])
    })

    it('should support chaining multiple list items', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .bulletList()
        .item()
        .text('First item')
        .item()
        .text('Second item')
        .item()
        .text('Third item')
        .finish()
        .build()

      const bulletList3 = request.bodyJson.content[0] as unknown as {
        content: { content: { content: { text: string }[] }[] }[]
      }
      expect(bulletList3.content).toHaveLength(3)
      expect(bulletList3.content[0].content[0].content[0].text).toBe('First item')
      expect(bulletList3.content[1].content[0].content[0].text).toBe('Second item')
      expect(bulletList3.content[2].content[0].content[0].text).toBe('Third item')
    })

    it('When complex formatting in chained list items', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .numberedList()
        .item()
        .bold('Bold')
        .text(' and ')
        .italic('italic')
        .item()
        .code('code')
        .text(' and ')
        .underline('underline')
        .item()
        .link('link', 'https://test.com')
        .finish()
        .build()

      const orderedList = request.bodyJson.content[0] as unknown as {
        content: { content: { content: unknown[] }[] }[]
      }
      expect(orderedList.content).toHaveLength(3)

      expect(orderedList.content[0].content[0].content).toEqual([
        { type: 'text', text: 'Bold', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' and ' },
        { type: 'text', text: 'italic', marks: [{ type: 'italic' }] }
      ])

      expect(orderedList.content[1].content[0].content).toEqual([
        { type: 'text', text: 'code', marks: [{ type: 'code' }] },
        { type: 'text', text: ' and ' },
        { type: 'text', text: 'underline', marks: [{ type: 'underline' }] }
      ])

      expect(orderedList.content[2].content[0].content).toEqual([
        {
          type: 'text',
          text: 'link',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://test.com',
                target: '_blank',
                class: 'note-link',
                rel: 'nofollow ugc noopener'
              }
            }
          ]
        }
      ])
    })

    it('should test getSegments method through ListBuilder.addItem', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .bulletList()
        .item()
        .text('First item')
        .item()
        .text('Second item')
        .finish()
        .build()

      const bulletList = request.bodyJson.content[0] as unknown as {
        content: { content: { content: { text: string }[] }[] }[]
      }
      expect(bulletList.content).toHaveLength(2)
      expect(bulletList.content[0].content[0].content[0].text).toBe('First item')
      expect(bulletList.content[1].content[0].content[0].text).toBe('Second item')
    })
  })

  describe('Mixed content scenarios', () => {
    it('When paragraphs with both text and lists', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .text('Introduction paragraph')
        .bulletList()
        .item()
        .text('Point 1')
        .item()
        .text('Point 2')
        .finish()
        .paragraph()
        .text('Conclusion paragraph')
        .build()

      expect(request.bodyJson.content).toHaveLength(3)
      expect(request.bodyJson.content[0].type).toBe('paragraph')
      expect(request.bodyJson.content[1].type).toBe('bulletList')
      expect(request.bodyJson.content[2].type).toBe('paragraph')
    })

    it('When numbered lists correctly', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .numberedList()
        .item()
        .text('First step')
        .item()
        .text('Second step')
        .item()
        .text('Third step')
        .finish()
        .build()

      expect(request.bodyJson.content[0].type).toBe('orderedList')
      expect(request.bodyJson.content[0].content).toHaveLength(3)
    })

    it('When empty list gracefully', () => {
      const request = new NoteBuilder(mockClient)
        .paragraph()
        .text('Text before list')
        .bulletList()
        .finish()
        .build()

      expect(request.bodyJson.content).toHaveLength(2)
      expect(request.bodyJson.content[1].type).toBe('bulletList')
      expect(request.bodyJson.content[1].content).toHaveLength(0)
    })
  })

  describe('Builder Immutability', () => {
    it('When requesting new instances instead of mutating existing ones', () => {
      const builder1 = new NoteBuilder(mockClient)
      const builder2 = builder1.paragraph()
      const builder3 = builder2.text('Hello')
      const builder4 = builder3.bold(' World')

      expect(builder1).not.toBe(builder2)
      expect(builder2).not.toBe(builder3)
      expect(builder3).not.toBe(builder4)

      expect(builder1).toBeInstanceOf(NoteBuilder)
      expect(builder2).toBeInstanceOf(ParagraphBuilder)
      expect(builder3).toBeInstanceOf(ParagraphBuilder)
      expect(builder4).toBeInstanceOf(ParagraphBuilder)
    })

    it('should allow branching without affecting original builders', async () => {
      const base = new NoteBuilder(mockClient).paragraph().text('Shared text ')

      const branchA = base.bold('Branch A')
      const branchB = base.italic('Branch B')

      const resultA = await branchA.publish()
      const resultB = await branchB.publish()

      expect(mockClient.post).toHaveBeenNthCalledWith(1, '/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Shared text ' },
                { type: 'text', text: 'Branch A', marks: [{ type: 'bold' }] }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })

      expect(mockClient.post).toHaveBeenNthCalledWith(2, '/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Shared text ' },
                { type: 'text', text: 'Branch B', marks: [{ type: 'italic' }] }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })

      expect(resultA).toBe(mockPublishResponse)
      expect(resultB).toBe(mockPublishResponse)
      expect(mockClient.post).toHaveBeenCalledTimes(2)
    })

    it('should allow complex branching with multiple paragraph builders', () => {
      const noteBuilder = new NoteBuilder(mockClient)
      const baseParagraph = noteBuilder.paragraph().text('Start: ')

      const branch1 = baseParagraph.bold('Bold').text(' ending')
      const branch2 = baseParagraph.italic('Italic').text(' ending')

      const result1 = branch1.build()
      const result2 = branch2.build()

      expect(result1.bodyJson.content[0].content).toEqual([
        { type: 'text', text: 'Start: ' },
        { type: 'text', text: 'Bold', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' ending' }
      ])

      expect(result2.bodyJson.content[0].content).toEqual([
        { type: 'text', text: 'Start: ' },
        { type: 'text', text: 'Italic', marks: [{ type: 'italic' }] },
        { type: 'text', text: ' ending' }
      ])
    })

    it('should maintain immutability with list builders', () => {
      const base = new NoteBuilder(mockClient)
        .paragraph()
        .text('Before list')
        .bulletList()
        .item()
        .text('Shared item: ')

      const branchA = base.bold('Bold item')
      const branchB = base.italic('Italic item')

      const resultA = branchA.finish().build()
      const resultB = branchB.finish().build()

      const listContentA = resultA.bodyJson.content[1] as unknown as {
        content: { content: { content: unknown[] }[] }[]
      }
      const listContentB = resultB.bodyJson.content[1] as unknown as {
        content: { content: { content: unknown[] }[] }[]
      }

      expect(listContentA.content[0].content[0].content).toEqual([
        { type: 'text', text: 'Shared item: ' },
        { type: 'text', text: 'Bold item', marks: [{ type: 'bold' }] }
      ])

      expect(listContentB.content[0].content[0].content).toEqual([
        { type: 'text', text: 'Shared item: ' },
        { type: 'text', text: 'Italic item', marks: [{ type: 'italic' }] }
      ])
    })

    it('should support method chaining on immutable builders', async () => {
      const result = await new NoteBuilder(mockClient)
        .paragraph()
        .text('Hello ')
        .bold('bold ')
        .text('and ')
        .italic('italic')
        .text(' text')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/comment/feed/', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Hello ' },
                { type: 'text', text: 'bold ', marks: [{ type: 'bold' }] },
                { type: 'text', text: 'and ' },
                { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
                { type: 'text', text: ' text' }
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

  describe('Regression Tests', () => {
    it('should not modify original builder when creating new paragraphs', () => {
      const originalBuilder = new NoteBuilder(mockClient)
      const withFirstParagraph = originalBuilder.paragraph().text('First paragraph')
      const withSecondParagraph = withFirstParagraph.paragraph().text('Second paragraph')

      expect(() => originalBuilder.build()).toThrow('Note must contain at least one paragraph')

      const firstResult = withFirstParagraph.build()
      expect(firstResult.bodyJson.content).toHaveLength(1)

      const secondResult = withSecondParagraph.build()
      expect(secondResult.bodyJson.content).toHaveLength(2)
    })

    it('should maintain state isolation between list builders', () => {
      const noteBuilder = new NoteBuilder(mockClient)
      const paragraph = noteBuilder.paragraph().text('Before list')

      const list1 = paragraph.bulletList().item().text('Item 1')
      const list2 = paragraph.bulletList().item().text('Item 2')

      const result1 = list1.finish().build()
      const result2 = list2.finish().build()

      const listContent1 = result1.bodyJson.content[1] as unknown as {
        content: { content: { content: { text: string }[] }[] }[]
      }
      const listContent2 = result2.bodyJson.content[1] as unknown as {
        content: { content: { content: { text: string }[] }[] }[]
      }

      expect(listContent1.content[0].content[0].content[0].text).toBe('Item 1')
      expect(listContent2.content[0].content[0].content[0].text).toBe('Item 2')
    })
  })

  describe('NoteWithLinkBuilder', () => {
    let noteWithLinkBuilder: NoteWithLinkBuilder

    beforeEach(() => {
      mockClient.post
        .mockResolvedValueOnce({
          id: 'attachment-123',
          type: 'link',
          publication: null,
          post: null
        })
        .mockResolvedValueOnce({
          user_id: 123,
          body: 'test',
          body_json: {},
          ancestor_path: '',
          type: 'feed' as const,
          status: 'published' as const,
          reply_minimum_role: 'everyone' as const,
          id: 456,
          deleted: false,
          date: '2023-01-01T00:00:00Z',
          name: 'Test User',
          photo_url: 'https://example.com/photo.jpg',
          reactions: {},
          children: [],
          isFirstFeedCommentByUser: false,
          reaction_count: 0,
          restacks: 0,
          restacked: false,
          children_count: 0,
          attachments: []
        })
      noteWithLinkBuilder = new NoteWithLinkBuilder(mockClient, 'https://example.com/test')
    })

    it('should override addParagraph to return NoteWithLinkBuilder', () => {
      const result = noteWithLinkBuilder.paragraph().text('Test paragraph')

      expect(result).toBeDefined()

      const request = result.build()
      expect(request.bodyJson.content).toHaveLength(1)
      expect(
        (request.bodyJson.content[0] as unknown as { content: { text: string }[] }).content[0].text
      ).toBe('Test paragraph')
    })

    it('When copyState method correctly', async () => {
      await noteWithLinkBuilder
        .paragraph()
        .text('First paragraph')
        .paragraph()
        .text('Second paragraph')
        .publish()

      const publishCall = mockClient.post.mock.calls[1]
      const noteRequest = publishCall[1] as unknown as {
        bodyJson: { content: { content: { text: string }[] }[] }
      }
      expect(noteRequest.bodyJson.content).toHaveLength(2)
      expect(noteRequest.bodyJson.content[0].content[0].text).toBe('First paragraph')
      expect(noteRequest.bodyJson.content[1].content[0].text).toBe('Second paragraph')
    })

    it('When toNoteRequestWithState method with custom state', async () => {
      await noteWithLinkBuilder
        .paragraph()
        .text('Complex note with ')
        .bold('formatting')
        .paragraph()
        .bulletList()
        .item()
        .text('List item 1')
        .item()
        .text('List item 2')
        .finish()
        .publish()

      const publishCall = mockClient.post.mock.calls[1]
      const noteRequest2 = publishCall[1] as unknown as {
        bodyJson: { content: { type: string }[] }
        attachmentIds: string[]
      }

      expect(noteRequest2.bodyJson.content).toHaveLength(2)
      expect(noteRequest2.bodyJson.content[0].type).toBe('paragraph')
      expect(noteRequest2.bodyJson.content[1].type).toBe('bulletList')
      expect(noteRequest2.attachmentIds).toEqual(['attachment-123'])
    })

    it('should test NoteWithLinkBuilder validation errors', () => {
      const noteWithLinkBuilder2 = new NoteWithLinkBuilder(mockClient, 'https://example.com')

      expect(() => {
        ;(
          noteWithLinkBuilder2 as unknown as { toNoteRequest: (state: unknown) => unknown }
        ).toNoteRequest({ paragraphs: [] })
      }).toThrow('Note must contain at least one paragraph')

      expect(() => {
        ;(
          noteWithLinkBuilder2 as unknown as { toNoteRequest: (state: unknown) => unknown }
        ).toNoteRequest({
          paragraphs: [{ segments: [], lists: [] }]
        })
      }).toThrow('Each paragraph must contain at least one content block')
    })
  })
})
