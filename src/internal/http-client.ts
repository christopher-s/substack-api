/**
 * HTTP client utility for Substack API requests
 */
import https from 'https'
import axios, { AxiosInstance } from 'axios'
import * as t from 'io-ts'
import { TokenBucket } from '@substack-api/internal/rate-limiter'
import { RetryPolicy } from '@substack-api/internal/retry'
import type { RetryInfo } from '@substack-api/internal/retry'
import { decodeOrThrow } from '@substack-api/internal/validation'

export type { RetryInfo }

export interface RateLimitInfo {
  retryAfter?: number
  attempt: number
  statusCode: number
}

export interface HttpClientProxyConfig {
  host: string
  port: number
  protocol?: 'http' | 'https'
  auth?: { username: string; password: string }
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
  onTokenExpired?: () => Promise<string>
  proxy?: HttpClientProxyConfig
}

/**
 * Browser UA strings with varied versions and browsers.
 * Rotating prevents fingerprinting on browser identity.
 */
const CHROME_UAS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7125.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.7100.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7110.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7130.0 Safari/537.36'
]

function pickRandomUA(): string {
  return CHROME_UAS[Math.floor(Math.random() * CHROME_UAS.length)]
}

export class HttpClient {
  private readonly httpClient: AxiosInstance
  private readonly retryPolicy: RetryPolicy
  private readonly onRateLimit?: (info: RateLimitInfo) => void
  private readonly onTokenExpired?: () => Promise<string>
  private cookies: Record<string, string> = {}
  private tokenExpiredRetried = false

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

    if (opts.token) {
      this.cookies['substack.sid'] = opts.token
    }

    const axiosConfig: Record<string, unknown> = {
      baseURL: opts.baseUrl,
      headers: buildHeaders(opts.headerMode ?? 'api', this.cookies),
      httpsAgent: new https.Agent({ rejectUnauthorized: true })
    }

    if (opts.proxy) {
      axiosConfig.proxy = opts.proxy
    }

    this.httpClient = axios.create(axiosConfig as Parameters<typeof axios.create>[0])

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
    this.onTokenExpired = opts.onTokenExpired

    // Rate-limit via token bucket before each request
    this.httpClient.interceptors.request.use(async (config) => {
      await bucket.acquire()

      // Rotate UA on each request to prevent fingerprinting
      config.headers['User-Agent'] = pickRandomUA()

      // Only set Content-Type on requests with a body (POST/PUT)
      if (!config.data) {
        delete config.headers['Content-Type']
      } else {
        config.headers['Content-Type'] = 'application/json'
      }

      // Forward stored cookies
      if (Object.keys(this.cookies).length > 0) {
        config.headers['Cookie'] = Object.entries(this.cookies)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ')
      }

      return config
    })

    // Capture Set-Cookie headers from responses and handle 401 token rotation
    this.httpClient.interceptors.response.use(
      (response) => {
        this.tokenExpiredRetried = false
        const setCookie = response.headers?.['set-cookie']
        if (setCookie) {
          const entries = Array.isArray(setCookie) ? setCookie : [setCookie]
          for (const entry of entries) {
            const match = entry.match(/^([^=]+)=([^;]+)/)
            if (match) {
              this.cookies[match[1]] = match[2]
            }
          }
        }
        return response
      },
      async (error) => {
        if (error.response?.status === 401 && this.onTokenExpired && !this.tokenExpiredRetried) {
          this.tokenExpiredRetried = true
          try {
            const newToken = await this.onTokenExpired()
            if (newToken) {
              this.cookies['substack.sid'] = newToken
              error.config.headers['Cookie'] = Object.entries(this.cookies)
                .map(([k, v]) => `${k}=${v}`)
                .join('; ')
              return await this.httpClient.request(error.config)
            }
          } catch {
            // Token refresh failed — fall through to original error
          }
        }
        this.tokenExpiredRetried = false
        return Promise.reject(error)
      }
    )
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

  async getValidated<T>(
    codec: t.Type<T, unknown, unknown>,
    path: string,
    errorContext?: string
  ): Promise<T> {
    const data = await this.get<unknown>(path)
    return decodeOrThrow(codec, data, errorContext ?? path)
  }

  async postValidated<T>(
    codec: t.Type<T, unknown, unknown>,
    path: string,
    data?: unknown,
    errorContext?: string
  ): Promise<T> {
    const response = await this.post<unknown>(path, data)
    return decodeOrThrow(codec, response, errorContext ?? path)
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
  cookies: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {}
  const ua = pickRandomUA()

  if (headerMode === 'browser') {
    headers['User-Agent'] = ua
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
  } else if (headerMode === 'api') {
    headers['User-Agent'] = ua
    headers['Accept'] = '*/*'
    headers['Accept-Language'] = 'en-US,en;q=0.9'
    headers['Accept-Encoding'] = 'gzip, deflate, br, zstd'
    headers['Sec-Ch-Ua'] = '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"'
    headers['Sec-Ch-Ua-Mobile'] = '?0'
    headers['Sec-Ch-Ua-Platform'] = '"macOS"'
    headers['Sec-Fetch-Dest'] = 'empty'
    headers['Sec-Fetch-Mode'] = 'cors'
    headers['Sec-Fetch-Site'] = 'same-origin'
  } else {
    headers['Accept'] = '*/*'
  }

  if (Object.keys(cookies).length > 0) {
    headers['Cookie'] = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')
  }

  return headers
}
