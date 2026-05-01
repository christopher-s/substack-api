export interface TokenBucketOptions {
  maxRequestsPerSecond: number
  jitter?: boolean
  now?: () => number
  random?: () => number
}

/**
 * Token bucket rate limiter with Poisson-distributed inter-arrival times.
 *
 * When jitter is enabled (the default), requests use exponential inter-arrival
 * spacing that produces natural-looking bursty patterns: requests sometimes
 * cluster together and sometimes space apart, mimicking human network behavior.
 * This avoids the clockwork timing that server-side rate limiters detect.
 *
 * When jitter is disabled, requests dispatch instantly when tokens are available.
 */
export class TokenBucket {
  private readonly capacity: number
  private readonly refillRate: number
  private readonly jitterEnabled: boolean
  private readonly meanInterval: number
  private readonly now: () => number
  private readonly random: () => number

  private tokens: number
  private lastRefill: number
  private readonly queue: Array<() => void> = []
  private processing = false

  constructor(options: TokenBucketOptions) {
    this.capacity = options.maxRequestsPerSecond
    this.refillRate = options.maxRequestsPerSecond / 1000
    this.jitterEnabled = options.jitter ?? true
    this.meanInterval = 1000 / options.maxRequestsPerSecond
    this.now = options.now ?? (() => Date.now())
    this.random = options.random ?? (() => Math.random())
    this.tokens = this.capacity
    this.lastRefill = this.now()
  }

  async acquire(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.queue.push(resolve)
      this.processQueue()
    })
  }

  private processQueue(): void {
    if (this.processing || this.queue.length === 0) return
    this.processing = true

    const next = (): void => {
      if (this.queue.length === 0) {
        this.processing = false
        return
      }

      this.refill()

      if (this.tokens >= 1) {
        this.tokens -= 1
        const resolve = this.queue.shift()!

        if (this.jitterEnabled) {
          // Poisson/exponential inter-arrival: -ln(1 - random) * meanInterval
          // Produces bursty traffic that mimics human browsing patterns
          // Clamp random to [0, 0.999999] to avoid Infinity from -ln(0)
          const waitMs = -Math.log(1 - Math.min(this.random(), 0.999999)) * this.meanInterval
          setTimeout(() => {
            resolve()
            next()
          }, waitMs)
        } else {
          resolve()
          next()
        }
      } else {
        const deficit = 1 - this.tokens
        const waitMs = deficit / this.refillRate

        setTimeout(() => {
          this.refill()
          this.tokens -= 1
          const resolve = this.queue.shift()!
          resolve()
          next()
        }, waitMs)
      }
    }

    next()
  }

  private refill(): void {
    const now = this.now()
    const elapsed = now - this.lastRefill
    if (elapsed > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate)
      this.lastRefill = now
    }
  }
}
