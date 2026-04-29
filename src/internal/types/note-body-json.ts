export type MarkType = 'bold' | 'italic' | 'code' | 'underline' | 'strike' | 'link'

export interface LinkMarkAttrs {
  href: string
  target?: string
  class?: string
  rel?: string
}

export interface Mark {
  type: MarkType
  attrs?: LinkMarkAttrs
}

export interface TextNode {
  type: 'text'
  text: string
  marks?: Mark[]
}

export interface ParagraphNode {
  type: 'paragraph'
  content: TextNode[]
}

export interface BulletListNode {
  type: 'bulletList'
  content: ListNode[]
}

export interface OrderedListNode {
  type: 'orderedList'
  attrs: { start: number }
  content: ListNode[]
}

export interface ListNode {
  type: 'listItem'
  content: ParagraphNode[]
}

export type ContentNode = ParagraphNode | BulletListNode | OrderedListNode

export interface NoteBodyJson {
  type: 'doc'
  attrs: {
    schemaVersion: 'v1'
  }
  content: ContentNode[]
}
