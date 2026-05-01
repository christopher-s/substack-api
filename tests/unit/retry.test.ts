import { RetryPolicy } from '@substack-api/internal/retry'
import type { RetryInfo } from '@substack-api/internal/retry'
import type { AxiosError } from 'axios'

function createAxiosError(status: number): AxiosError {
  const error = new Error(`HTTP ${status}`) as unknown as AxiosError
  Object.assign(error, {
    response: { status, headers: {}, data: {}, config: {}, statusText: '' },
    isAxiosError: true
  })
  return error
}

describe('RetryPolicy', () => {
  let sleeps: number[]
  let sleepFn: (ms: number) => Promise<void>

  beforeEach(() => {
    sleeps = []
    sleepFn = (ms: number) => {
      sleeps.push(ms)
      return Promise.resolve()
    }
  })

  describe('constructor', () => {
    it('When using default options', () => {
      const policy = new RetryPolicy()
      expect(policy).toBeDefined()
    })

    it('When using custom options', () => {
      const policy = new RetryPolicy({ maxRetries: 5, baseDelayMs: 500, maxDelayMs: 10000 })
      expect(policy).toBeDefined()
    })
  })

  describe('execute', () => {
    it('When request succeeds on first attempt', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const fn = jest.fn().mockResolvedValue('ok')

      const result = await policy.execute(fn)

      expect(result).toBe('ok')
      expect(fn).toHaveBeenCalledTimes(1)
      expect(sleeps).toHaveLength(0)
    })

    it('When request succeeds on retry', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const axiosError = createAxiosError(503)
      const fn = jest.fn().mockRejectedValueOnce(axiosError).mockResolvedValueOnce('ok')

      const result = await policy.execute(fn)

      expect(result).toBe('ok')
      expect(fn).toHaveBeenCalledTimes(2)
      expect(sleeps).toHaveLength(1)
    })

    it('When 429 with Retry-After header waits exact duration', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn, baseDelayMs: 5000 })
      const axiosError = createAxiosError(429)
      const fn = jest.fn().mockRejectedValueOnce(axiosError).mockResolvedValueOnce('ok')
      const getRetryAfter = () => '5'

      await policy.execute(fn, getRetryAfter)

      expect(sleeps).toEqual([5000])
    })

    it('When 429 without Retry-After header uses jitter backoff', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn, baseDelayMs: 1000, maxDelayMs: 30000 })
      const axiosError = createAxiosError(429)
      const fn = jest.fn().mockRejectedValueOnce(axiosError).mockResolvedValueOnce('ok')
      const getRetryAfter = () => undefined

      await policy.execute(fn, getRetryAfter)

      expect(sleeps).toHaveLength(1)
      expect(sleeps[0]).toBeGreaterThanOrEqual(0)
      expect(sleeps[0]).toBeLessThan(1000)
    })

    it('When 429 without getRetryAfter callback uses jitter backoff', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn, baseDelayMs: 1000 })
      const axiosError = createAxiosError(429)
      const fn = jest.fn().mockRejectedValueOnce(axiosError).mockResolvedValueOnce('ok')

      await policy.execute(fn)

      expect(sleeps).toHaveLength(1)
      expect(sleeps[0]).toBeGreaterThanOrEqual(0)
      expect(sleeps[0]).toBeLessThan(1000)
    })

    it('When Retry-After is RFC 7231 date string', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const axiosError = createAxiosError(429)
      const fn = jest.fn().mockRejectedValueOnce(axiosError).mockResolvedValueOnce('ok')
      const futureDate = new Date(Date.now() + 5000).toUTCString()
      const getRetryAfter = () => futureDate

      await policy.execute(fn, getRetryAfter)

      expect(sleeps).toHaveLength(1)
      expect(sleeps[0]).toBeGreaterThanOrEqual(4000)
      expect(sleeps[0]).toBeLessThanOrEqual(5500)
    })

    it('When non-retryable 400 error throws immediately', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const axiosError = createAxiosError(400)
      const fn = jest.fn().mockRejectedValue(axiosError)

      await expect(policy.execute(fn)).rejects.toThrow('HTTP 400')
      expect(fn).toHaveBeenCalledTimes(1)
      expect(sleeps).toHaveLength(0)
    })

    it('When non-retryable 401 error throws immediately', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const axiosError = createAxiosError(401)
      const fn = jest.fn().mockRejectedValue(axiosError)

      await expect(policy.execute(fn)).rejects.toThrow('HTTP 401')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('When non-retryable 403 error throws immediately', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const axiosError = createAxiosError(403)
      const fn = jest.fn().mockRejectedValue(axiosError)

      await expect(policy.execute(fn)).rejects.toThrow('HTTP 403')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('When non-retryable 404 error throws immediately', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const axiosError = createAxiosError(404)
      const fn = jest.fn().mockRejectedValue(axiosError)

      await expect(policy.execute(fn)).rejects.toThrow('HTTP 404')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('When retryable 502 error is retried', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const axiosError = createAxiosError(502)
      const fn = jest.fn().mockRejectedValueOnce(axiosError).mockResolvedValueOnce('ok')

      const result = await policy.execute(fn)

      expect(result).toBe('ok')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('When retryable 503 error is retried', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const axiosError = createAxiosError(503)
      const fn = jest.fn().mockRejectedValueOnce(axiosError).mockResolvedValueOnce('ok')

      const result = await policy.execute(fn)

      expect(result).toBe('ok')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('When retryable 504 error is retried', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const axiosError = createAxiosError(504)
      const fn = jest.fn().mockRejectedValueOnce(axiosError).mockResolvedValueOnce('ok')

      const result = await policy.execute(fn)

      expect(result).toBe('ok')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('When max retries exceeded throws last error', async () => {
      const policy = new RetryPolicy({ maxRetries: 2, sleep: sleepFn })
      const axiosError = createAxiosError(503)
      const fn = jest.fn().mockRejectedValue(axiosError)

      await expect(policy.execute(fn)).rejects.toThrow('HTTP 503')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('When onResponse callback fires with correct info', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn, baseDelayMs: 1000 })
      const axiosError = createAxiosError(503)
      const fn = jest
        .fn()
        .mockRejectedValueOnce(axiosError)
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce('ok')
      const infos: RetryInfo[] = []
      const onResponse = (info: RetryInfo) => infos.push(info)

      await policy.execute(fn, undefined, onResponse)

      expect(infos).toHaveLength(2)
      expect(infos[0]).toEqual({
        retryAfter: expect.any(Number),
        attempt: 1,
        statusCode: 503
      })
      expect(infos[1]).toEqual({
        retryAfter: expect.any(Number),
        attempt: 2,
        statusCode: 503
      })
      expect(infos[0].retryAfter).toBeGreaterThanOrEqual(0)
      expect(infos[0].retryAfter).toBeLessThan(1000)
      expect(infos[1].retryAfter).toBeGreaterThanOrEqual(0)
      expect(infos[1].retryAfter).toBeLessThan(2000)
    })

    it('When onResponse receives retryAfter from header on 429', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const axiosError = createAxiosError(429)
      const fn = jest.fn().mockRejectedValueOnce(axiosError).mockResolvedValueOnce('ok')
      const infos: RetryInfo[] = []
      const onResponse = (info: RetryInfo) => infos.push(info)
      const getRetryAfter = () => '3'

      await policy.execute(fn, getRetryAfter, onResponse)

      expect(infos).toEqual([{ retryAfter: 3000, attempt: 1, statusCode: 429 }])
    })

    it('When injectable sleep produces deterministic results', async () => {
      const recordedSleeps: number[] = []
      const deterministicSleep = (ms: number) => {
        recordedSleeps.push(ms)
        return Promise.resolve()
      }

      const policy = new RetryPolicy({
        maxRetries: 2,
        baseDelayMs: 100,
        maxDelayMs: 400,
        sleep: deterministicSleep
      })
      const axiosError = createAxiosError(503)
      const fn = jest.fn().mockRejectedValue(axiosError)

      await expect(policy.execute(fn)).rejects.toThrow('HTTP 503')
      expect(recordedSleeps).toHaveLength(2)
      expect(recordedSleeps[0]).toBeGreaterThanOrEqual(0)
      expect(recordedSleeps[0]).toBeLessThan(100)
      expect(recordedSleeps[1]).toBeGreaterThanOrEqual(0)
      expect(recordedSleeps[1]).toBeLessThan(200)
    })

    it('When non-axios error throws immediately without retry', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn })
      const fn = jest.fn().mockRejectedValue(new Error('network failure'))

      await expect(policy.execute(fn)).rejects.toThrow('network failure')
      expect(fn).toHaveBeenCalledTimes(1)
      expect(sleeps).toHaveLength(0)
    })

    it('When Retry-After header has invalid value falls back to base delay', async () => {
      const policy = new RetryPolicy({ sleep: sleepFn, baseDelayMs: 2000 })
      const axiosError = createAxiosError(429)
      const fn = jest.fn().mockRejectedValueOnce(axiosError).mockResolvedValueOnce('ok')
      const getRetryAfter = () => 'not-a-number-or-date'

      await policy.execute(fn, getRetryAfter)

      expect(sleeps).toEqual([2000])
    })

    it('When exponential backoff respects maxDelayMs', async () => {
      const recordedSleeps: number[] = []
      const deterministicSleep = (ms: number) => {
        recordedSleeps.push(ms)
        return Promise.resolve()
      }

      const policy = new RetryPolicy({
        maxRetries: 5,
        baseDelayMs: 1000,
        maxDelayMs: 3000,
        sleep: deterministicSleep
      })
      const axiosError = createAxiosError(503)
      const fn = jest.fn().mockRejectedValue(axiosError)

      await expect(policy.execute(fn)).rejects.toThrow('HTTP 503')
      for (const delay of recordedSleeps) {
        expect(delay).toBeGreaterThanOrEqual(0)
        expect(delay).toBeLessThan(3000)
      }
    })
  })
})
