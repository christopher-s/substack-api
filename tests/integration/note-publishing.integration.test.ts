import { SubstackClient } from '@substack-api/substack-client'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('note publishing tests', () => {
  let client: SubstackClient

  beforeEach(() => {
    // Clear captured requests before each test
    global.INTEGRATION_SERVER.capturedRequests.length = 0

    // Create client configured to use our local test server
    client = new SubstackClient({
      publicationUrl: global.INTEGRATION_SERVER.url,
      token: 'test-key',
      substackUrl: global.INTEGRATION_SERVER.url, // Configure global client to use mock server too
      urlPrefix: '' // Integration server doesn't use API prefix
    })
  })

  test('should publish note with correct request structure from markdown', async () => {
    const profile = await client.profiles.ownProfile()
    await profile.publishNote('**test**\n\n*test1*\n\n`another test` \n\njust a test')

    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(1)
    const capturedRequest = global.INTEGRATION_SERVER.capturedRequests[0]

    expect(capturedRequest.method).toBe('POST')
    expect(capturedRequest.url).toBe('/comment/feed/')

    const expectedRequestPath = join(process.cwd(), 'samples', 'api', 'v1', 'comment', 'feed')
    const expectedRequestData = JSON.parse(readFileSync(expectedRequestPath, 'utf8'))

    const capturedRequestBody = capturedRequest.body as Record<string, unknown>
    console.log('Captured request body:', capturedRequestBody)
    console.log('Expected request body:', expectedRequestData)
    expect(capturedRequestBody).toEqual(expectedRequestData)
  })
})
