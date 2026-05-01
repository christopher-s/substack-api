/**
 * Test that validates public API exports work correctly
 */

describe('Public API Exports', () => {
  it('should export publishNote from main package', async () => {
    const { publishNote } = await import('@substack-api/index')
    expect(publishNote).toBeDefined()
    expect(typeof publishNote).toBe('function')
  })

  it('should export Note entity class from main package', async () => {
    const { Note } = await import('@substack-api/index')
    expect(Note).toBeDefined()
    expect(typeof Note).toBe('function')
  })

  it('should export Profile entity class from main package', async () => {
    const { Profile } = await import('@substack-api/index')
    expect(Profile).toBeDefined()
    expect(typeof Profile).toBe('function')
  })

  it('should export SubstackClient from main package', async () => {
    const { SubstackClient } = await import('@substack-api/index')
    expect(SubstackClient).toBeDefined()
    expect(typeof SubstackClient).toBe('function')
  })

  it('should allow type imports for content types', async () => {
    const module = await import('@substack-api/index')
    expect(module).toBeDefined()
    const textSegment: Record<string, string> = {
      text: 'Hello',
      type: 'bold'
    }
    expect(textSegment).toMatchObject({
      text: 'Hello',
      type: 'bold'
    })
  })
})
