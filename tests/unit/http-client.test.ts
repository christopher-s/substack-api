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
      expect(createCall.headers['User-Agent']).toContain('Chrome/136.')
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
})
