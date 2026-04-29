export function markdownToHtml(md: string): string {
  if (!md.trim()) {
    throw new Error('Markdown content must not be empty')
  }

  const lines = md.split('\n')
  const htmlParts: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip blank lines
    if (!line.trim()) {
      i++
      continue
    }

    // Fenced code blocks
    const codeMatch = line.match(/^```(\w*)$/)
    if (codeMatch) {
      const lang = codeMatch[1]
      const codeLines: string[] = []
      i++
      while (i < lines.length && !/^```$/.test(lines[i])) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      const escaped = escapeHtml(codeLines.join('\n'))
      if (lang) {
        htmlParts.push(`<pre><code class="language-${lang}">${escaped}</code></pre>`)
      } else {
        htmlParts.push(`<pre><code>${escaped}</code></pre>`)
      }
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      htmlParts.push(`<h${level}>${inlineToHtml(headingMatch[2])}</h${level}>`)
      i++
      continue
    }

    // Horizontal rules
    if (/^(---|\*\*\*|___)$/.test(line.trim())) {
      htmlParts.push('<div><hr></div>')
      i++
      continue
    }

    // Blockquotes
    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      const content = inlineToHtml(quoteLines.join('\n'))
      // Join blockquote lines into paragraphs separated by newlines
      const paragraphs = content
        .split('\n')
        .filter((p) => p.trim())
        .map((p) => `<p>${p}</p>`)
        .join('\n')
      htmlParts.push(`<blockquote>\n${paragraphs}\n</blockquote>`)
      continue
    }

    // Bullet list
    if (/^[-*]\s/.test(line)) {
      const { html, newIndex } = parseList(lines, i, /^[-*]\s/, 'ul', (l) =>
        l.replace(/^[-*]\s/, '')
      )
      htmlParts.push(html)
      i = newIndex
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const { html, newIndex } = parseList(lines, i, /^\d+\.\s/, 'ol', (l) =>
        l.replace(/^\d+\.\s/, '')
      )
      htmlParts.push(html)
      i = newIndex
      continue
    }

    // Paragraph
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^(---|\*\*\*|___)$/.test(lines[i].trim()) &&
      !/^```/.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    // Handle line breaks (trailing double space) - use placeholder to survive escapeHtml
    const LINE_BREAK_PLACEHOLDER = '\x00BR\x00'
    const joined = paraLines
      .map((l) => (l.endsWith('  ') ? l.slice(0, -2) + LINE_BREAK_PLACEHOLDER : l))
      .join(' ')
    const html = inlineToHtml(joined).replace(new RegExp(LINE_BREAK_PLACEHOLDER, 'g'), '<br>')
    htmlParts.push(`<p>${html}</p>`)
  }

  return htmlParts.join('\n')
}

function parseList(
  lines: string[],
  startIndex: number,
  itemRegex: RegExp,
  tag: 'ul' | 'ol',
  stripPrefix: (line: string) => string
): { html: string; newIndex: number } {
  const items: string[] = []
  let i = startIndex

  while (i < lines.length) {
    const line = lines[i]
    // Check if this line belongs to the current list level
    const itemMatch = line.match(itemRegex)
    if (itemMatch) {
      const text = stripPrefix(line)
      // Peek ahead for nested content (indented lines)
      const nestedLines: string[] = []
      i++
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !itemRegex.test(lines[i]) &&
        /^(?: {2,4}|\t)/.test(lines[i])
      ) {
        nestedLines.push(lines[i].replace(/^(?: {2,4}|\t)/, ''))
        i++
      }
      if (nestedLines.length > 0) {
        // Recursively parse nested lines as a list
        // Detect nested list type
        let nestedHtml: string
        if (/^[-*]\s/.test(nestedLines[0])) {
          const result = parseList(nestedLines, 0, /^[-*]\s/, 'ul', (l) => l.replace(/^[-*]\s/, ''))
          nestedHtml = result.html
        } else if (/^\d+\.\s/.test(nestedLines[0])) {
          const result = parseList(nestedLines, 0, /^\d+\.\s/, 'ol', (l) =>
            l.replace(/^\d+\.\s/, '')
          )
          nestedHtml = result.html
        } else {
          nestedHtml = `<p>${inlineToHtml(nestedLines.join(' '))}</p>`
        }
        items.push(`<li>${inlineToHtml(text)}\n${nestedHtml}\n</li>`)
      } else {
        items.push(`<li>${inlineToHtml(text)}</li>`)
      }
    } else {
      break
    }
  }

  return {
    html: `<${tag}>\n${items.join('\n')}\n</${tag}>`,
    newIndex: i
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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

function applyInlineFormatting(text: string): string {
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/\*([^*]+?)\*/g, '<em>$1</em>')
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')
  text = text.replace(/~~(.+?)~~/g, '<s>$1</s>')
  return text
}

function inlineToHtml(text: string): string {
  // Extract links before escaping to avoid breaking markdown syntax
  const links: Array<{ full: string; inner: string; url: string }> = []
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, inner, url) => {
    links.push({ full: `__LINK${links.length}__`, inner, url })
    return `__LINK${links.length - 1}__`
  })
  // Escape HTML in remaining text
  text = escapeHtml(text)
  text = applyInlineFormatting(text)
  // Restore links with properly escaped content
  for (let i = links.length - 1; i >= 0; i--) {
    const link = links[i]
    const escapedInner = applyInlineFormatting(escapeHtml(link.inner))
    const escapedUrl = escapeHtml(sanitizeUrl(link.url))
    text = text.replace(link.full, `<a href="${escapedUrl}">${escapedInner}</a>`)
  }
  return text
}
