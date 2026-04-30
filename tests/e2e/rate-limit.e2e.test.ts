/**
 * @smoke E2E smoke tests for rate limiting and retry behavior
 *
 * Uses nock to simulate server responses without hitting the real API.
 */
import nock from 'nock'
import { HttpClient } from '@substack-api/internal/http-client'

describe('HttpClient rate limiting and retry [smoke]', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('should retry on 429 and eventually succeed', async () => {
    nock('https://test.substack.com')
      .get('/api/v1/test')
      .times(2)
      .reply(429)
      .get('/api/v1/test')
      .reply(200, { success: true })

    const client = new HttpClient({
      baseUrl: 'https://test.substack.com',
      token: 'test-token',
      maxRequestsPerSecond: 1000,
      jitter: false,
      maxRetries: 3,
      baseDelayMs: 10
    })

    const result = await client.get<{ success: boolean }>('/api/v1/test')
    expect(result.success).toBe(true)
  })

  it('should fire onRateLimit callback on retryable errors', async () => {
    const onRateLimit = jest.fn()

    nock('https://test.substack.com')
      .get('/api/v1/test')
      .reply(429) // attempt 0 → retry
      .get('/api/v1/test')
      .reply(503) // attempt 1 → retry
      .get('/api/v1/test')
      .reply(200, { ok: true }) // attempt 2 → success

    const client = new HttpClient({
      baseUrl: 'https://test.substack.com',
      token: 'test-token',
      maxRequestsPerSecond: 1000,
      jitter: false,
      maxRetries: 3,
      baseDelayMs: 1,
      onRateLimit
    })

    const result = await client.get<{ ok: boolean }>('/api/v1/test')
    expect(result.ok).toBe(true)
    expect(onRateLimit).toHaveBeenCalledTimes(2)
    expect(onRateLimit).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ statusCode: 429, attempt: 1 })
    )
    expect(onRateLimit).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ statusCode: 503, attempt: 2 })
    )
  })

  it('should throw after exhausting retries on persistent 429', async () => {
    nock('https://test.substack.com').get('/api/v1/test').times(10).reply(429)

    const client = new HttpClient({
      baseUrl: 'https://test.substack.com',
      token: 'test-token',
      maxRequestsPerSecond: 1000,
      jitter: false,
      maxRetries: 2,
      baseDelayMs: 1
    })

    await expect(client.get('/api/v1/test')).rejects.toThrow()
  })

  it('should retry on 503 and succeed', async () => {
    nock('https://test.substack.com')
      .get('/api/v1/test')
      .reply(503)
      .get('/api/v1/test')
      .reply(200, { recovered: true })

    const client = new HttpClient({
      baseUrl: 'https://test.substack.com',
      token: 'test-token',
      maxRequestsPerSecond: 1000,
      jitter: false,
      maxRetries: 3,
      baseDelayMs: 10
    })

    const result = await client.get<{ recovered: boolean }>('/api/v1/test')
    expect(result.recovered).toBe(true)
  })

  it('should not retry on 4xx errors other than 429', async () => {
    nock('https://test.substack.com').get('/api/v1/test').reply(403, { error: 'forbidden' })

    const client = new HttpClient({
      baseUrl: 'https://test.substack.com',
      token: 'test-token',
      maxRequestsPerSecond: 1000,
      jitter: false,
      maxRetries: 3,
      baseDelayMs: 10
    })

    await expect(client.get('/api/v1/test')).rejects.toThrow()
  })
})
