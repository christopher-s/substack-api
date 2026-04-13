/**
 * HTTP client utility for Substack API requests
 */
import axios, { AxiosInstance } from 'axios'
import rateLimit from 'axios-rate-limit'

export class HttpClient {
  private readonly httpClient: AxiosInstance

  constructor(baseUrl: string, token?: string, maxRequestsPerSecond: number = 25) {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',
      'Accept-Encoding': 'gzip, deflate, br'
    }
    if (token) {
      headers.Cookie = `substack.sid=${token}`
    }
    const instance = axios.create({
      baseURL: baseUrl,
      headers
    })
    this.httpClient = rateLimit(instance, {
      maxRequests: maxRequestsPerSecond,
      perMilliseconds: 1000
    })
  }

  async get<T>(path: string): Promise<T> {
    return (await this.httpClient.get(path)).data
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    return (await this.httpClient.post(path, data)).data
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    return (await this.httpClient.put(path, data)).data
  }
}
