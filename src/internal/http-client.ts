/**
 * HTTP client utility for Substack API requests
 */
import axios, { AxiosInstance } from 'axios'
import { TokenBucket } from '@substack-api/internal/rate-limiter'
import { RetryPolicy } from '@substack-api/internal/retry'
import type { RetryInfo } from '@substack-api/internal/retry'

export type { RetryInfo }

export interface RateLimitInfo {
  retryAfter?: number
  attempt: number
  statusCode: number
}

export interface HttpClientOptions {
  baseUrl: string
  token?: string
  maxRequestsPerSecond?: number
  jitter?: boolean
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  headerMode?: 'browser' | 'api' | 'minimal'
  onRateLimit?: (info: RateLimitInfo) => void
}

export class HttpClient {
  private readonly httpClient: AxiosInstance
  private readonly retryPolicy: RetryPolicy
  private readonly onRateLimit?: (info: RateLimitInfo) => void

  constructor(options: HttpClientOptions)
  /** @deprecated Use HttpClientOptions object form */
  constructor(baseUrl: string, token?: string, maxRequestsPerSecond?: number)
  constructor(
    optionsOrBaseUrl: HttpClientOptions | string,
    token?: string,
    maxRequestsPerSecond?: number
  ) {
    const opts: HttpClientOptions =
      typeof optionsOrBaseUrl === 'string'
        ? { baseUrl: optionsOrBaseUrl, token, maxRequestsPerSecond }
        : optionsOrBaseUrl

    const headers = buildHeaders(opts.headerMode ?? 'api', opts.token)
    this.httpClient = axios.create({ baseURL: opts.baseUrl, headers })

    const bucket = new TokenBucket({
      maxRequestsPerSecond: opts.maxRequestsPerSecond ?? 25,
      jitter: opts.jitter ?? true
    })

    this.retryPolicy = new RetryPolicy({
      maxRetries: opts.maxRetries ?? 3,
      baseDelayMs: opts.baseDelayMs ?? 1000,
      maxDelayMs: opts.maxDelayMs ?? 30000
    })

    this.onRateLimit = opts.onRateLimit

    // Rate-limit via token bucket before each request
    this.httpClient.interceptors.request.use(async (config) => {
      await bucket.acquire()
      return config
    })
  }

  async get<T>(path: string): Promise<T> {
    return this.requestWithRetry(() => this.httpClient.get(path))
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    return this.requestWithRetry(() => this.httpClient.post(path, data))
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    return this.requestWithRetry(() => this.httpClient.put(path, data))
  }

  async delete<T>(path: string): Promise<T> {
    return this.requestWithRetry(() => this.httpClient.delete(path))
  }

  private async requestWithRetry<T>(fn: () => Promise<{ data: T }>): Promise<T> {
    return this.retryPolicy.execute(
      async () => (await fn()).data,
      undefined,
      (info: RetryInfo) =>
        this.onRateLimit?.({
          retryAfter: info.retryAfter,
          attempt: info.attempt,
          statusCode: info.statusCode
        })
    )
  }
}

function buildHeaders(
  headerMode: 'browser' | 'api' | 'minimal',
  token?: string
): Record<string, string> {
  const headers: Record<string, string> = {}

  if (headerMode === 'browser') {
    headers['User-Agent'] =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
    headers['Accept'] =
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    headers['Accept-Language'] = 'en-US,en;q=0.9'
    headers['Accept-Encoding'] = 'gzip, deflate, br, zstd'
    headers['Cache-Control'] = 'max-age=0'
    headers['Sec-Ch-Ua'] = '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"'
    headers['Sec-Ch-Ua-Mobile'] = '?0'
    headers['Sec-Ch-Ua-Platform'] = '"macOS"'
    headers['Sec-Fetch-Dest'] = 'document'
    headers['Sec-Fetch-Mode'] = 'navigate'
    headers['Sec-Fetch-Site'] = 'none'
    headers['Sec-Fetch-User'] = '?1'
    headers['Upgrade-Insecure-Requests'] = '1'
    headers['Content-Type'] = 'application/json'
  } else if (headerMode === 'api') {
    headers['User-Agent'] =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15'
    headers['Accept'] = 'application/json'
    headers['Accept-Language'] = 'en-US,en;q=0.9'
    headers['Accept-Encoding'] = 'gzip, deflate, br'
    headers['Content-Type'] = 'application/json'
  } else {
    headers['Accept'] = 'application/json'
  }

  if (token) {
    headers['Cookie'] = `substack.sid=${token}`
  }

  return headers
}
