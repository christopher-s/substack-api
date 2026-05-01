/**
 * Configuration interfaces for the Substack API client
 */

export interface SubstackConfig {
  publicationUrl?: string // Publication base URL (optional — omit for anonymous discovery/search, required for publication-scoped methods)
  token?: string // API authentication token (optional — omit for anonymous read-only access)
  substackUrl?: string // Base URL for global Substack endpoints (optional, defaults to 'https://substack.com')
  urlPrefix?: string // URL prefix for API endpoints (optional, defaults to 'api/v1/')
  perPage?: number // Default items per page for pagination (optional, defaults to 25)
  maxRequestsPerSecond?: number // Maximum API requests per second (optional, defaults to 25)
  jitter?: boolean // Enable jitter on rate limiting (optional, defaults to true)
  maxRetries?: number // Maximum retry attempts on 429/5xx (optional, defaults to 3)
  baseDelayMs?: number // Base delay in ms for exponential backoff (optional, defaults to 1000)
  maxDelayMs?: number // Maximum delay in ms for backoff (optional, defaults to 30000)
  headerMode?: 'browser' | 'api' | 'minimal' // Header set to use (optional, defaults to 'api')
  onRateLimit?: (info: import('../internal/http-client').RateLimitInfo) => void
  onTokenExpired?: () => Promise<string> // Callback to refresh token on 401 (optional)
  proxy?: import('../internal/http-client').HttpClientProxyConfig // Proxy configuration (optional)
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface SearchParams extends PaginationParams {
  query: string
  sort?: 'top' | 'new'
  author?: string
}
