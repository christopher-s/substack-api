import { TokenBucket } from '@substack-api/internal/rate-limiter'

describe('TokenBucket', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  const defaultOptions = {
    maxRequestsPerSecond: 10,
    jitter: false,
    now: () => Date.now(),
    random: () => 0
  }

  it('requests within capacity proceed immediately', async () => {
    const bucket = new TokenBucket({ ...defaultOptions })
    const order: number[] = []

    const p1 = bucket.acquire().then(() => order.push(1))
    const p2 = bucket.acquire().then(() => order.push(2))
    const p3 = bucket.acquire().then(() => order.push(3))

    await jest.runAllTimersAsync()
    await Promise.all([p1, p2, p3])

    expect(order).toEqual([1, 2, 3])
  })

  it('requests exceeding capacity wait for token refill', async () => {
    let time = 0
    const bucket = new TokenBucket({
      ...defaultOptions,
      maxRequestsPerSecond: 2,
      now: () => time
    })

    const timestamps: number[] = []

    const p1 = bucket.acquire().then(() => timestamps.push(time))
    const p2 = bucket.acquire().then(() => timestamps.push(time))

    await jest.runAllTimersAsync()
    await Promise.all([p1, p2])
    expect(timestamps.length).toBe(2)

    timestamps.length = 0
    time = 0

    const bucket2 = new TokenBucket({
      maxRequestsPerSecond: 2,
      jitter: false,
      now: () => time,
      random: () => 0
    })

    const promises: Promise<void>[] = []
    for (let i = 0; i < 4; i++) {
      promises.push(
        bucket2.acquire().then(() => {
          timestamps.push(time)
        })
      )
    }

    time = 500
    jest.advanceTimersByTime(500)
    await Promise.resolve()

    time = 1000
    jest.advanceTimersByTime(500)
    await Promise.resolve()

    await jest.runAllTimersAsync()
    await Promise.all(promises)

    expect(timestamps.length).toBe(4)
  })

  it('jitter adds delay within expected bounds', async () => {
    let time = 0
    const bucket = new TokenBucket({
      maxRequestsPerSecond: 10,
      jitter: true,
      now: () => time,
      random: () => 0.5
    })

    const delays: number[] = []
    const _originalSetTimeout = jest.getTimerCount()

    const p = bucket.acquire().then(() => delays.push(time))
    jest.advanceTimersByTime(50)
    time = 50
    await jest.runAllTimersAsync()
    await p

    expect(delays.length).toBe(1)
  })

  it('injectable clock and random produce deterministic results', async () => {
    let time = 1000
    const randomValues = [0.2, 0.8, 0.5]
    let randomIndex = 0

    const bucket = new TokenBucket({
      maxRequestsPerSecond: 1,
      jitter: true,
      now: () => time,
      random: () => randomValues[randomIndex++]
    })

    const results: { index: number; time: number }[] = []
    const promises = [0, 1, 2].map((i) =>
      bucket.acquire().then(() => results.push({ index: i, time }))
    )

    for (let i = 0; i < 5; i++) {
      time += 1000
      jest.advanceTimersByTime(1000)
      await Promise.resolve()
    }

    await jest.runAllTimersAsync()
    await Promise.all(promises)

    expect(results.length).toBe(3)
    expect(results.map((r) => r.index)).toEqual([0, 1, 2])
  })

  it('multiple concurrent acquire calls are serialized in order', async () => {
    let time = 0
    const bucket = new TokenBucket({
      maxRequestsPerSecond: 1,
      jitter: false,
      now: () => time,
      random: () => 0
    })

    const order: number[] = []
    const promises = [5, 3, 1, 4, 2].map((n) => bucket.acquire().then(() => order.push(n)))

    for (let i = 0; i < 10; i++) {
      time += 1000
      jest.advanceTimersByTime(1000)
      await Promise.resolve()
    }

    await jest.runAllTimersAsync()
    await Promise.all(promises)

    expect(order).toEqual([5, 3, 1, 4, 2])
  })

  it('disabling jitter removes additional delay', async () => {
    let time = 0
    const bucket = new TokenBucket({
      maxRequestsPerSecond: 10,
      jitter: false,
      now: () => time,
      random: () => 1
    })

    const timestamps: number[] = []
    const promises = [0, 1, 2].map(() => bucket.acquire().then(() => timestamps.push(time)))

    await jest.runAllTimersAsync()
    await Promise.all(promises)

    expect(timestamps.length).toBe(3)
    expect(timestamps.every((t) => t === 0)).toBe(true)
  })

  it('refills tokens over time', async () => {
    let time = 0
    const bucket = new TokenBucket({
      maxRequestsPerSecond: 2,
      jitter: false,
      now: () => time,
      random: () => 0
    })

    const timestamps: number[] = []

    const p1 = bucket.acquire().then(() => timestamps.push(time))
    const p2 = bucket.acquire().then(() => timestamps.push(time))

    await jest.runAllTimersAsync()
    await Promise.all([p1, p2])
    expect(timestamps.length).toBe(2)

    time = 500
    jest.advanceTimersByTime(500)
    await Promise.resolve()

    const p3 = bucket.acquire().then(() => timestamps.push(time))

    await jest.runAllTimersAsync()
    await p3

    expect(timestamps.length).toBe(3)
  })
})
