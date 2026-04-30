export interface TokenBucketOptions {
  maxRequestsPerSecond: number
  jitter?: boolean
  now?: () => number
  random?: () => number
}

export class TokenBucket {
  private readonly capacity: number
  private readonly refillRate: number
  private readonly jitterEnabled: boolean
  private readonly jitterMs: number
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
    this.jitterMs = (1000 / options.maxRequestsPerSecond) * 0.5
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
        const jitterDelay = this.jitterEnabled ? this.random() * this.jitterMs : 0

        if (jitterDelay > 0) {
          setTimeout(() => {
            resolve()
            next()
          }, jitterDelay)
        } else {
          resolve()
          next()
        }
      } else {
        const deficit = 1 - this.tokens
        const waitMs = deficit / this.refillRate
        const jitterDelay = this.jitterEnabled ? this.random() * this.jitterMs : 0

        setTimeout(() => {
          this.refill()
          this.tokens -= 1
          const resolve = this.queue.shift()!
          resolve()
          next()
        }, waitMs + jitterDelay)
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
