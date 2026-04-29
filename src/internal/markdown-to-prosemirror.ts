import type { NoteBodyJson } from '@substack-api/internal/types/note-body-json'

function sanitizeUrl(url: string): string {
  const normalized = url.trim().toLowerCase()
  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('file:')
  ) {
    return '#'
  }
  return url
}

type MarkType = 'bold' | 'italic' | 'code' | 'link' | 'strike'

interface InlineNode {
  text: string
  marks: Array<{ type: MarkType; href?: string }>
}

type BlockNode =
  | { type: 'paragraph'; content: InlineNode[] }
  | { type: 'bulletList'; items: InlineNode[][] }
  | { type: 'orderedList'; items: InlineNode[][]; start?: number }

export function markdownToNoteBody(md: string): NoteBodyJson {
  if (!md.trim()) {
    throw new Error('Markdown content must not be empty')
  }

  const blocks = parseBlocks(md)
  if (blocks.length === 0) {
    throw new Error('Markdown produced no valid content')
  }

  const content = blocks.map((block) => {
    if (block.type === 'paragraph') {
      return {
        type: 'paragraph' as const,
        content: block.content.map(inlineToProseMirror)
      }
    }
    if (block.type === 'orderedList') {
      return {
        type: 'orderedList' as const,
        attrs: { start: block.start ?? 1 },
        content: block.items.map((itemInlines) => ({
          type: 'listItem' as const,
          content: [
            {
              type: 'paragraph' as const,
              content: itemInlines.map(inlineToProseMirror)
            }
          ]
        }))
      }
    }
    return {
      type: 'bulletList' as const,
      content: block.items.map((itemInlines) => ({
        type: 'listItem' as const,
        content: [
          {
            type: 'paragraph' as const,
            content: itemInlines.map(inlineToProseMirror)
          }
        ]
      }))
    }
  })

  return {
    type: 'doc',
    attrs: { schemaVersion: 'v1' },
    content
  }
}

function inlineToProseMirror(node: InlineNode) {
  const result: {
    type: 'text'
    text: string
    marks?: Array<{
      type: 'bold' | 'italic' | 'code' | 'underline' | 'link' | 'strike'
      attrs?: { href: string; target: string; class: string; rel: string }
    }>
  } = { type: 'text', text: node.text }

  if (node.marks.length > 0) {
    result.marks = node.marks.map((m) => {
      if (m.type === 'link' && m.href) {
        return {
          type: 'link' as const,
          attrs: {
            href: sanitizeUrl(m.href),
            target: '_blank',
            class: 'note-link',
            rel: 'nofollow ugc noopener'
          }
        }
      }
      return { type: m.type as 'bold' | 'italic' | 'code' | 'strike' }
    })
  }
  return result
}

// --- Block parsing ---

function parseBlocks(md: string): BlockNode[] {
  const lines = md.split('\n')
  const blocks: BlockNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip blank lines
    if (!line.trim()) {
      i++
      continue
    }

    // Bullet list
    if (/^[-*]\s/.test(line)) {
      const items: InlineNode[][] = []
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^[-*]\s/, '')))
        i++
      }
      blocks.push({ type: 'bulletList', items })
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: InlineNode[][] = []
      const startMatch = line.match(/^(\d+)\.\s/)
      const start = startMatch ? parseInt(startMatch[1], 10) : 1
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\d+\.\s/, '')))
        i++
      }
      blocks.push({ type: 'orderedList', items, start })
      continue
    }

    // Paragraph — collect lines until blank line or list start
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i])
    ) {
      paraLines.push(lines[i].replace(/^#{1,6}\s+/, ''))
      i++
    }
    const text = paraLines.join(' ')
    if (text.trim()) {
      blocks.push({ type: 'paragraph', content: parseInline(text) })
    }
  }

  return blocks
}

// --- Inline parsing ---
// Walks the string, extracting formatted segments.
// Handles: **bold**, *italic*, `code`, [text](url), ~~strikethrough~~
// Supports nesting (e.g., **bold *italic*** and [**link**](url)).

function parseInline(text: string): InlineNode[] {
  return parseInlineWithMarks(text, [])
}

function parseInlineWithMarks(text: string, inheritedMarks: InlineNode['marks']): InlineNode[] {
  const nodes: InlineNode[] = []
  let remaining = text

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      nodes.push({ text: codeMatch[1], marks: [...inheritedMarks, { type: 'code' }] })
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      const innerNodes = parseInlineWithMarks(linkMatch[1], [])
      for (const node of innerNodes) {
        nodes.push({
          text: node.text,
          marks: [...inheritedMarks, ...node.marks, { type: 'link', href: sanitizeUrl(linkMatch[2]) }]
        })
      }
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    const boldItalicMatch = remaining.match(/^\*\*\*(.+?)\*\*\*/)
    if (boldItalicMatch) {
      const innerNodes = parseInlineWithMarks(boldItalicMatch[1], [
        ...inheritedMarks,
        { type: 'bold' as const },
        { type: 'italic' as const }
      ])
      nodes.push(...innerNodes)
      remaining = remaining.slice(boldItalicMatch[0].length)
      continue
    }

    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch) {
      const innerNodes = parseInlineWithMarks(boldMatch[1], [
        ...inheritedMarks,
        { type: 'bold' as const }
      ])
      nodes.push(...innerNodes)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    const strikeMatch = remaining.match(/^~~(.+?)~~/)
    if (strikeMatch) {
      const innerNodes = parseInlineWithMarks(strikeMatch[1], [
        ...inheritedMarks,
        { type: 'strike' as const }
      ])
      nodes.push(...innerNodes)
      remaining = remaining.slice(strikeMatch[0].length)
      continue
    }

    const italicMatch = remaining.match(/^\*([^*]+?)\*/)
    if (italicMatch) {
      const innerNodes = parseInlineWithMarks(italicMatch[1], [
        ...inheritedMarks,
        { type: 'italic' as const }
      ])
      nodes.push(...innerNodes)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    const nextFormat = remaining.search(/[`[*~]/)
    if (nextFormat === -1) {
      nodes.push({ text: remaining, marks: inheritedMarks })
      break
    }
    if (nextFormat === 0) {
      nodes.push({ text: remaining[0], marks: inheritedMarks })
      remaining = remaining.slice(1)
      continue
    }
    nodes.push({ text: remaining.slice(0, nextFormat), marks: inheritedMarks })
    remaining = remaining.slice(nextFormat)
  }

  return nodes
}
