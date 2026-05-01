import { HttpClient } from '@substack-api/internal/http-client'
import axios from 'axios'
import type { AxiosInstance } from 'axios'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('HttpClient', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>

  beforeEach(() => {
    jest.clearAllMocks()

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    } as unknown as jest.Mocked<AxiosInstance>

    mockedAxios.create.mockReturnValue(mockAxiosInstance)
  })

  describe('constructor', () => {
    it('When client without token (anonymous mode)', () => {
      expect(() => new HttpClient({ baseUrl: 'https://test.com' })).not.toThrow()
    })

    it('When client with empty string token (anonymous mode)', () => {
      expect(() => new HttpClient({ baseUrl: 'https://test.com', token: '' })).not.toThrow()
    })

    it('When client with whitespace-only token (anonymous mode)', () => {
      expect(
        () => new HttpClient({ baseUrl: 'https://test.substack.com', token: '   ' })
      ).not.toThrow()
    })

    it('When axios instance with correct base URL and headers', () => {
      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      const createCall = mockedAxios.create.mock.calls[0][0] as {
        baseURL: string
        headers: Record<string, string>
      }
      expect(createCall.baseURL).toBe('https://test.substack.com')
      expect(createCall.headers).toMatchObject({
        Cookie: 'substack.sid=test-api-key',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      })
      expect(createCall.headers['User-Agent']).toMatch(/Chrome\/1[3-9]\d\./)
      expect(createCall.headers).not.toHaveProperty('Content-Type')
      expect(client).toBeDefined()
    })

    it('should not set Cookie header when no token provided (anonymous)', () => {
      new HttpClient({ baseUrl: 'https://test.substack.com' })

      const createCall = mockedAxios.create.mock.calls[0][0] as { headers: Record<string, string> }
      expect(createCall.headers).not.toHaveProperty('Cookie')
      expect(createCall.headers).toHaveProperty('Accept')
    })

    it('should support deprecated positional constructor [smoke]', () => {
      expect(() => new HttpClient('https://test.com')).not.toThrow()
      expect(() => new HttpClient('https://test.com', 'token')).not.toThrow()
      expect(() => new HttpClient('https://test.com', 'token', 10)).not.toThrow()
    })
  })

  describe('get', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' }
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      const result = await client.get('/test')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test')
      expect(result).toEqual(mockResponse)
    })

    it('When axios errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network Error'))

      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      await expect(client.get('/test')).rejects.toThrow('Network Error')
    })
  })

  describe('post', () => {
    it('should make successful POST request with data', async () => {
      const mockResponse = { success: true }
      const postData = { title: 'Test Post' }

      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      const result = await client.post('/test', postData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData)
      expect(result).toEqual(mockResponse)
    })

    it('should make POST request without data', async () => {
      const mockResponse = { success: true }

      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      const result = await client.post('/test')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('When axios errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Server Error'))

      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      await expect(client.post('/test', {})).rejects.toThrow('Server Error')
    })
  })

  describe('put', () => {
    it('should make successful PUT request with data', async () => {
      const mockResponse = { success: true }
      const putData = { title: 'Updated Post' }

      mockAxiosInstance.put.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      const result = await client.put('/test', putData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', putData)
      expect(result).toEqual(mockResponse)
    })

    it('should make PUT request without data', async () => {
      const mockResponse = { success: true }

      mockAxiosInstance.put.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      const result = await client.put('/test')

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('When axios errors', async () => {
      mockAxiosInstance.put.mockRejectedValue(new Error('Forbidden'))

      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      await expect(client.put('/test', {})).rejects.toThrow('Forbidden')
    })
  })

  describe('delete', () => {
    it('should make successful DELETE request', async () => {
      const mockResponse = { deleted: true }

      mockAxiosInstance.delete.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      const result = await client.delete('/test/42')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/42')
      expect(result).toEqual(mockResponse)
    })

    it('When axios errors', async () => {
      mockAxiosInstance.delete.mockRejectedValue(new Error('Not Found'))

      const client = new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      await expect(client.delete('/test/999')).rejects.toThrow('Not Found')
    })
  })

  describe('header modes', () => {
    function extractHeaders(opts: Record<string, unknown>): Record<string, string> {
      new HttpClient(opts as unknown as ConstructorParameters<typeof HttpClient>[0])
      const createCall = mockedAxios.create.mock.calls[
        mockedAxios.create.mock.calls.length - 1
      ][0] as { headers: Record<string, string> }
      return createCall.headers
    }

    it('should set browser-style headers when headerMode=browser', () => {
      const headers = extractHeaders({
        baseUrl: 'https://test.substack.com',
        headerMode: 'browser'
      })

      expect(headers['Accept']).toContain('text/html')
      expect(headers['Accept-Language']).toBe('en-US,en;q=0.9')
      expect(headers['Sec-Fetch-Dest']).toBe('document')
      expect(headers['Sec-Fetch-Mode']).toBe('navigate')
      expect(headers['Upgrade-Insecure-Requests']).toBe('1')
      expect(headers['Content-Type']).toBeUndefined()
    })

    it('should set minimal headers when headerMode=minimal', () => {
      const headers = extractHeaders({
        baseUrl: 'https://test.substack.com',
        headerMode: 'minimal'
      })

      expect(headers['Accept']).toBe('*/*')
      expect(headers['User-Agent']).toBeUndefined()
      expect(headers['Accept-Language']).toBeUndefined()
    })
  })

  describe('cookie interceptor', () => {
    it('should capture single Set-Cookie from response', async () => {
      new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      // The constructor registered interceptors. Extract the response handler
      // from the mock calls: response.use(onFulfilled, onRejected)
      const responseHandler = (mockAxiosInstance.interceptors.response.use as jest.Mock).mock
        .calls[0][0] as (response: {
        headers?: Record<string, string | string[]>
        status: number
        data: unknown
      }) => unknown

      // Invoke the response handler to trigger Set-Cookie capture
      await responseHandler({
        headers: {
          'set-cookie': 'session_id=abc123; Path=/; HttpOnly'
        },
        status: 200,
        data: { ok: true }
      })

      // Now that the cookie store has session_id, create a request config
      // and invoke the request interceptor
      const requestHandler = (mockAxiosInstance.interceptors.request.use as jest.Mock).mock
        .calls[0][0] as (config: { headers: Record<string, string>; data?: unknown }) => unknown

      const config = { headers: {} as Record<string, string> }
      await requestHandler(config)
      expect(config.headers['Cookie']).toContain('session_id=abc123')
    })

    it('should capture multiple Set-Cookie headers from response', async () => {
      new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'test-api-key'
      })

      const responseHandler = (mockAxiosInstance.interceptors.response.use as jest.Mock).mock
        .calls[0][0] as (response: {
        headers?: Record<string, string | string[]>
        status: number
        data: unknown
      }) => unknown

      await responseHandler({
        headers: {
          'set-cookie': ['session_id=abc123; Path=/', 'csrf_token=xyz789; Path=/']
        },
        status: 200,
        data: { ok: true }
      })

      const requestHandler = (mockAxiosInstance.interceptors.request.use as jest.Mock).mock
        .calls[0][0] as (config: { headers: Record<string, string>; data?: unknown }) => unknown

      const config = { headers: {} as Record<string, string> }
      await requestHandler(config)
      expect(config.headers['Cookie']).toContain('session_id=abc123')
      expect(config.headers['Cookie']).toContain('csrf_token=xyz789')
    })

    it('should preserve initial token cookie after Set-Cookie capture', async () => {
      new HttpClient({
        baseUrl: 'https://test.substack.com',
        token: 'original-sid'
      })

      const responseHandler = (mockAxiosInstance.interceptors.response.use as jest.Mock).mock
        .calls[0][0] as (response: {
        headers?: Record<string, string | string[]>
        status: number
        data: unknown
      }) => unknown

      await responseHandler({
        headers: {
          'set-cookie': 'session_id=new123; Path=/'
        },
        status: 200,
        data: { ok: true }
      })

      const requestHandler = (mockAxiosInstance.interceptors.request.use as jest.Mock).mock
        .calls[0][0] as (config: { headers: Record<string, string>; data?: unknown }) => unknown

      const config = { headers: {} as Record<string, string> }
      await requestHandler(config)
      expect(config.headers['Cookie']).toContain('substack.sid=original-sid')
      expect(config.headers['Cookie']).toContain('session_id=new123')
    })
  })
})
