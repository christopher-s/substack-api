import { markdownToHtml } from '@substack-api/internal/markdown-to-html'

describe('markdownToHtml', () => {
  it('should convert plain text paragraph', () => {
    const result = markdownToHtml('Hello world')
    expect(result).toContain('Hello world')
    expect(result).toContain('<p>')
  })

  it('should convert bold text', () => {
    const result = markdownToHtml('Hello **world**')
    expect(result).toContain('<strong>world</strong>')
  })

  it('should convert italic text', () => {
    const result = markdownToHtml('Hello *world*')
    expect(result).toContain('<em>world</em>')
  })

  it('should convert links', () => {
    const result = markdownToHtml('[click here](https://example.com)')
    expect(result).toContain('<a href="https://example.com">click here</a>')
  })

  it('should convert bullet lists', () => {
    const result = markdownToHtml('- one\n- two')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>one</li>')
    expect(result).toContain('<li>two</li>')
  })

  it('should convert inline code', () => {
    const result = markdownToHtml('Use `code` here')
    expect(result).toContain('<code>code</code>')
  })

  it('should throw on empty string', () => {
    expect(() => markdownToHtml('')).toThrow('must not be empty')
  })

  it('should throw on whitespace-only string', () => {
    expect(() => markdownToHtml('   \n  ')).toThrow('must not be empty')
  })

  it('should escape HTML in text', () => {
    const result = markdownToHtml('<script>alert(1)</script>')
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('should escape HTML in link URLs', () => {
    const result = markdownToHtml('[click](https://example.com?a=1&b=2)')
    expect(result).toContain('href="https://example.com?a=1&amp;b=2"')
  })

  it('should escape ampersands and quotes', () => {
    const result = markdownToHtml('A & B < C > "D"')
    expect(result).toContain('A &amp; B &lt; C &gt; &quot;D&quot;')
  })

  it('should escape single quotes', () => {
    const result = markdownToHtml("it's a test")
    expect(result).toContain('it&#39;s a test')
  })

  // Headings
  it('should convert H1 heading', () => {
    const result = markdownToHtml('# Heading 1')
    expect(result).toContain('<h1>Heading 1</h1>')
  })

  it('should convert H2 heading', () => {
    const result = markdownToHtml('## Heading 2')
    expect(result).toContain('<h2>Heading 2</h2>')
  })

  it('should convert H3 heading', () => {
    const result = markdownToHtml('### Heading 3')
    expect(result).toContain('<h3>Heading 3</h3>')
  })

  it('should convert H4 heading', () => {
    const result = markdownToHtml('#### Heading 4')
    expect(result).toContain('<h4>Heading 4</h4>')
  })

  it('should convert H5 heading', () => {
    const result = markdownToHtml('##### Heading 5')
    expect(result).toContain('<h5>Heading 5</h5>')
  })

  it('should convert H6 heading', () => {
    const result = markdownToHtml('###### Heading 6')
    expect(result).toContain('<h6>Heading 6</h6>')
  })

  it('should not wrap headings in p tags', () => {
    const result = markdownToHtml('# Heading')
    expect(result).not.toContain('<p>')
  })

  it('should process inline formatting in headings', () => {
    const result = markdownToHtml('# **Bold** heading')
    expect(result).toContain('<h1><strong>Bold</strong> heading</h1>')
  })

  // Blockquotes
  it('should convert single-line blockquote', () => {
    const result = markdownToHtml('> This is a quote')
    expect(result).toContain('<blockquote>')
    expect(result).toContain('<p>This is a quote</p>')
    expect(result).toContain('</blockquote>')
  })

  it('should convert multi-line blockquote', () => {
    const result = markdownToHtml('> Line one\n> Line two')
    expect(result).toContain('<blockquote>')
    expect(result).toContain('Line one')
    expect(result).toContain('Line two')
    expect(result).toContain('</blockquote>')
  })

  it('should support inline formatting in blockquotes', () => {
    const result = markdownToHtml('> **Bold** quote')
    expect(result).toContain('<strong>Bold</strong>')
  })

  // Horizontal rules
  it('should convert horizontal rule with dashes', () => {
    const result = markdownToHtml('---')
    expect(result).toContain('<div><hr></div>')
  })

  it('should convert horizontal rule with asterisks', () => {
    const result = markdownToHtml('***')
    expect(result).toContain('<div><hr></div>')
  })

  it('should convert horizontal rule with underscores', () => {
    const result = markdownToHtml('___')
    expect(result).toContain('<div><hr></div>')
  })

  // Fenced code blocks
  it('should convert code block without language', () => {
    const result = markdownToHtml('```\nsome code\n```')
    expect(result).toContain('<pre><code>some code</code></pre>')
  })

  it('should convert code block with language', () => {
    const result = markdownToHtml('```javascript\nconsole.log("hi")\n```')
    expect(result).toContain(
      '<pre><code class="language-javascript">console.log(&quot;hi&quot;)</code></pre>'
    )
  })

  it('should escape HTML in code blocks', () => {
    const result = markdownToHtml('```\n<div>test</div>\n```')
    expect(result).toContain('&lt;div&gt;test&lt;/div&gt;')
    expect(result).not.toContain('<div>test</div>')
  })

  it('should not process inline formatting in code blocks', () => {
    const result = markdownToHtml('```\n**not bold**\n```')
    expect(result).toContain('**not bold**')
    expect(result).not.toContain('<strong>')
  })

  // Strikethrough
  it('should convert strikethrough text', () => {
    const result = markdownToHtml('~~deleted~~')
    expect(result).toContain('<s>deleted</s>')
  })

  // Line breaks
  it('should convert trailing double space to line break', () => {
    const result = markdownToHtml('line one  \nline two')
    expect(result).toContain('<br>')
  })

  // Nested lists
  it('should convert nested bullet lists', () => {
    const result = markdownToHtml('- item one\n  - nested one\n  - nested two\n- item two')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>item one')
    expect(result).toContain('<li>nested one</li>')
    expect(result).toContain('<li>nested two</li>')
    expect(result).toContain('<li>item two</li>')
  })

  it('should convert nested ordered list inside bullet list', () => {
    const result = markdownToHtml('- item1\n  1. nested1\n  2. nested2')
    expect(result).toContain('<ul>')
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>nested1</li>')
    expect(result).toContain('<li>nested2</li>')
  })

  // URL sanitization
  it('should sanitize javascript: URLs in links', () => {
    const result = markdownToHtml('[click](javascript:alert(1))')
    expect(result).toContain('href="#"')
    expect(result).not.toContain('javascript:')
  })

  it('should sanitize data: URLs in links', () => {
    const result = markdownToHtml('[click](data:text/html,<script>alert(1)</script>)')
    expect(result).toContain('href="#"')
  })
})
