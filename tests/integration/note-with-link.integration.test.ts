import { SubstackClient } from '@substack-api/substack-client'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('note with link attachment integration tests', () => {
  let client: SubstackClient

  beforeEach(() => {
    global.INTEGRATION_SERVER.capturedRequests.length = 0

    client = new SubstackClient({
      publicationUrl: global.INTEGRATION_SERVER.url,
      token: 'test-key',
      substackUrl: global.INTEGRATION_SERVER.url,
      urlPrefix: ''
    })
  })

  test('should create attachment and publish note with correct request structure', async () => {
    const profile = await client.profiles.ownProfile()
    const testUrl = 'https://iam.slys.dev/p/understanding-locking-contention'

    await profile.publishNote('Check out this **interesting article** about system design!', {
      linkUrl: testUrl
    })

    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(2)

    const attachmentRequest = global.INTEGRATION_SERVER.capturedRequests[0]
    expect(attachmentRequest.method).toBe('POST')
    expect(attachmentRequest.url).toBe('/comment/attachment/')

    const expectedAttachmentRequestPath = join(
      process.cwd(),
      'samples',
      'api',
      'v1',
      'comment',
      'attachment'
    )
    const expectedAttachmentData = JSON.parse(readFileSync(expectedAttachmentRequestPath, 'utf8'))
    expect(attachmentRequest.body).toEqual(expectedAttachmentData)

    const noteRequest = global.INTEGRATION_SERVER.capturedRequests[1]
    expect(noteRequest.method).toBe('POST')
    expect(noteRequest.url).toBe('/comment/feed/')

    const capturedNoteBody = noteRequest.body as unknown as Record<string, unknown>

    expect(capturedNoteBody).toMatchObject({
      bodyJson: {
        type: 'doc',
        attrs: { schemaVersion: 'v1' }
      },
      attachmentIds: ['19b5d6f9-46db-47d6-b381-17cb5f443c00'],
      replyMinimumRole: 'everyone',
      tabId: 'for-you',
      surface: 'feed'
    })
  })

  test('should build note with attachment and formatting', async () => {
    const profile = await client.profiles.ownProfile()
    const testUrl = 'https://example.com/test-article'

    await profile.publishNote(
      'This is a **complex note** with multiple *formatting options*.\n\nIt includes [internal links](https://internal.example.com) and `code snippets`.',
      { linkUrl: testUrl }
    )

    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(2)

    const attachmentRequest = global.INTEGRATION_SERVER.capturedRequests[0]
    expect(attachmentRequest.body).toEqual({
      url: 'https://example.com/test-article',
      type: 'link'
    })

    const noteRequest = global.INTEGRATION_SERVER.capturedRequests[1]
    const noteBody = noteRequest.body as unknown as {
      bodyJson: { content: Array<{ type: string; content?: unknown[] }> }
      attachmentIds: string[]
    }

    expect(noteBody.bodyJson.content).toHaveLength(2)
    expect(noteBody.attachmentIds).toEqual(['19b5d6f9-46db-47d6-b381-17cb5f443c00'])
  })

  test('should handle different URL formats correctly', async () => {
    const profile = await client.profiles.ownProfile()
    const urls = [
      'https://blog.example.com/post/123',
      'http://example.com/article',
      'https://subdomain.domain.com/path?param=value'
    ]

    for (const testUrl of urls) {
      global.INTEGRATION_SERVER.capturedRequests.length = 0

      await profile.publishNote(`Testing with URL: ${testUrl}`, { linkUrl: testUrl })

      expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(2)

      const attachmentRequest = global.INTEGRATION_SERVER.capturedRequests[0]
      expect(attachmentRequest.body).toEqual({
        url: testUrl,
        type: 'link'
      })
    }
  })

  test('should work with lists and complex formatting', async () => {
    const profile = await client.profiles.ownProfile()

    await profile.publishNote(
      'Here are some key points from the article:\n\n- First **important** point\n- Second point with [a link](https://reference.com)\n- `Third point` with code',
      { linkUrl: 'https://example.com/list-article' }
    )

    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(2)

    const noteRequest = global.INTEGRATION_SERVER.capturedRequests[1]
    const noteBody = noteRequest.body as unknown as {
      bodyJson: { content: Array<{ type: string; content?: unknown[] }> }
      attachmentIds: string[]
    }

    expect(noteBody.bodyJson.content).toHaveLength(2)
    expect(noteBody.bodyJson.content[0].type).toBe('paragraph')
    expect(noteBody.bodyJson.content[1].type).toBe('bulletList')

    const bulletList = noteBody.bodyJson.content[1]
    expect(bulletList.content).toHaveLength(3)

    expect(noteBody.attachmentIds).toEqual(['19b5d6f9-46db-47d6-b381-17cb5f443c00'])
  })
})
