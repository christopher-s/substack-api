import { markdownToNoteBody } from '@substack-api/internal/markdown-to-prosemirror'

describe('markdownToNoteBody', () => {
  describe('plain text', () => {
    it('should convert a simple paragraph', () => {
      const result = markdownToNoteBody('Hello world')
      expect(result).toEqual({
        type: 'doc',
        attrs: { schemaVersion: 'v1' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello world' }]
          }
        ]
      })
    })

    it('should convert multiple paragraphs', () => {
      const result = markdownToNoteBody('First paragraph\n\nSecond paragraph')
      expect(result.content).toHaveLength(2)
      expect(result.content[0]).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'First paragraph' }]
      })
      expect(result.content[1]).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'Second paragraph' }]
      })
    })
  })

  describe('inline formatting', () => {
    it('should convert bold text', () => {
      const result = markdownToNoteBody('Hello **world**')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hello ' },
          { type: 'text', text: 'world', marks: [{ type: 'bold' }] }
        ]
      })
    })

    it('should convert italic text', () => {
      const result = markdownToNoteBody('Hello *world*')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hello ' },
          { type: 'text', text: 'world', marks: [{ type: 'italic' }] }
        ]
      })
    })

    it('should convert inline code', () => {
      const result = markdownToNoteBody('Use `console.log` here')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Use ' },
          { type: 'text', text: 'console.log', marks: [{ type: 'code' }] },
          { type: 'text', text: ' here' }
        ]
      })
    })

    it('should convert links', () => {
      const result = markdownToNoteBody('Check [this](https://example.com) out')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Check ' },
          {
            type: 'text',
            text: 'this',
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
          { type: 'text', text: ' out' }
        ]
      })
    })

    it('should convert strikethrough text', () => {
      const result = markdownToNoteBody('Hello ~~world~~')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hello ' },
          { type: 'text', text: 'world', marks: [{ type: 'strike' }] }
        ]
      })
    })
  })

  describe('nested formatting', () => {
    it('should convert bold+italic', () => {
      const result = markdownToNoteBody('***bold and italic***')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'bold and italic',
            marks: [{ type: 'bold' }, { type: 'italic' }]
          }
        ]
      })
    })

    it('should convert bold link', () => {
      const result = markdownToNoteBody('**[link](https://example.com)**')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'link',
            marks: [
              { type: 'bold' },
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
          }
        ]
      })
    })

    it('should convert bold+strikethrough combo', () => {
      const result = markdownToNoteBody('**~~text~~**')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'text',
            marks: [{ type: 'bold' }, { type: 'strike' }]
          }
        ]
      })
    })
  })

  describe('lists', () => {
    it('should convert bullet lists', () => {
      const result = markdownToNoteBody('- item1\n- item2\n- item3')
      expect(result.content).toHaveLength(1)
      expect(result.content[0]).toEqual({
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'item1' }]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'item2' }]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'item3' }]
              }
            ]
          }
        ]
      })
    })

    it('should convert list items with formatting', () => {
      const result = markdownToNoteBody('- **bold item**\n- *italic item*')
      const list = result.content[0]
      expect(list.content[0]).toEqual({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'bold item', marks: [{ type: 'bold' }] }]
          }
        ]
      })
    })
  })

  describe('mixed content', () => {
    it('should convert paragraph followed by list', () => {
      const result = markdownToNoteBody('Here are items:\n\n- one\n- two')
      expect(result.content).toHaveLength(2)
      expect(result.content[0].type).toBe('paragraph')
      expect(result.content[1].type).toBe('bulletList')
    })

    it('should convert complex note with all formatting', () => {
      const md =
        'Hello **world**!\n\nCheck [this](https://example.com) and *this*\n\n- item1\n- item2'
      const result = markdownToNoteBody(md)
      expect(result.content).toHaveLength(3)
      expect(result.type).toBe('doc')
      expect(result.attrs.schemaVersion).toBe('v1')
    })
  })

  describe('security', () => {
    it('should sanitize javascript: URLs in links', () => {
      const result = markdownToNoteBody('[click](javascript:alert)')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'click',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: '#',
                  target: '_blank',
                  class: 'note-link',
                  rel: 'nofollow ugc noopener'
                }
              }
            ]
          }
        ]
      })
    })

    it('should sanitize data: URLs in links', () => {
      const result = markdownToNoteBody('[x](data:text/html,payload)')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'x',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: '#',
                  target: '_blank',
                  class: 'note-link',
                  rel: 'nofollow ugc noopener'
                }
              }
            ]
          }
        ]
      })
    })

    it('should allow normal https URLs', () => {
      const result = markdownToNoteBody('[safe](https://example.com)')
      const para = result.content[0]
      expect(para).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'safe',
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
          }
        ]
      })
    })
  })

  describe('ordered list start value', () => {
    it('should use start value from markdown for ordered list', () => {
      const result = markdownToNoteBody('5. first\n6. second')
      expect(result.content).toHaveLength(1)
      expect(result.content[0]).toEqual({
        type: 'orderedList',
        attrs: { start: 5 },
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'first' }]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'second' }]
              }
            ]
          }
        ]
      })
    })

    it('should default to start: 1 for ordered list starting with 1', () => {
      const result = markdownToNoteBody('1. first\n2. second')
      expect(result.content[0]).toEqual({
        type: 'orderedList',
        attrs: { start: 1 },
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'first' }]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'second' }]
              }
            ]
          }
        ]
      })
    })
  })

  describe('heading stripping', () => {
    it('should strip heading markers and treat as paragraph', () => {
      const result = markdownToNoteBody('# Heading')
      expect(result.content[0]).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'Heading' }]
      })
    })

    it('should strip h2 markers', () => {
      const result = markdownToNoteBody('## Subheading')
      expect(result.content[0]).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'Subheading' }]
      })
    })

    it('should strip h3 markers with formatting', () => {
      const result = markdownToNoteBody('### **Bold heading**')
      const para = result.content[0]
      expect(para.type).toBe('paragraph')
      expect(para.content[0]).toEqual({
        type: 'text',
        text: 'Bold heading',
        marks: [{ type: 'bold' }]
      })
    })
  })

  describe('edge cases', () => {
    it('should throw on empty string', () => {
      expect(() => markdownToNoteBody('')).toThrow('must not be empty')
    })

    it('should throw on whitespace-only string', () => {
      expect(() => markdownToNoteBody('   \n\n  ')).toThrow('must not be empty')
    })
  })
})
