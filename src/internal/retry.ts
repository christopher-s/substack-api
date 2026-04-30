import type { AxiosError } from 'axios'

export interface RetryInfo {
  retryAfter?: number
  attempt: number
  statusCode: number
}

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504])

export class RetryPolicy {
  private readonly maxRetries: number
  private readonly baseDelayMs: number
  private readonly maxDelayMs: number
  private readonly sleep: (ms: number) => Promise<void>

  constructor(options?: {
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
    sleep?: (ms: number) => Promise<void>
  }) {
    this.maxRetries = options?.maxRetries ?? 3
    this.baseDelayMs = options?.baseDelayMs ?? 1000
    this.maxDelayMs = options?.maxDelayMs ?? 30000
    this.sleep =
      options?.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)))
  }

  async execute<T>(
    fn: () => Promise<T>,
    getRetryAfter?: () => string | undefined,
    onResponse?: (info: RetryInfo) => void
  ): Promise<T> {
    let lastError: unknown

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error

        const statusCode = this.getStatusCode(error)
        if (statusCode === undefined || !RETRYABLE_STATUS_CODES.has(statusCode)) {
          throw error
        }

        if (attempt >= this.maxRetries) {
          throw error
        }

        let retryAfter: number | undefined

        if (statusCode === 429 && getRetryAfter) {
          const headerValue = getRetryAfter()
          if (headerValue !== undefined) {
            retryAfter = this.parseRetryAfter(headerValue)
          }
        }

        if (retryAfter === undefined) {
          retryAfter = this.calculateJitter(attempt)
        }

        onResponse?.({
          retryAfter,
          attempt: attempt + 1,
          statusCode
        })

        await this.sleep(retryAfter)
      }
    }

    throw lastError
  }

  private getStatusCode(error: unknown): number | undefined {
    const axiosErr = error as AxiosError
    return axiosErr?.response?.status
  }

  private parseRetryAfter(value: string): number {
    const asNumber = Number(value)
    if (!isNaN(asNumber) && asNumber > 0) {
      return asNumber * 1000
    }

    const parsedDate = Date.parse(value)
    if (!isNaN(parsedDate)) {
      return Math.max(0, parsedDate - Date.now())
    }

    return this.baseDelayMs
  }

  private calculateJitter(attempt: number): number {
    const exponentialDelay = this.baseDelayMs * Math.pow(2, attempt)
    const cappedDelay = Math.min(exponentialDelay, this.maxDelayMs)
    return Math.floor(Math.random() * cappedDelay)
  }
}
