import { HttpClient } from '@substack-api/internal/http-client'

export function createMockHttpClient(
  _baseUrl: string,
  overrides?: Partial<jest.Mocked<HttpClient>>
): jest.Mocked<HttpClient> {
  const mock = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    ...overrides
  } as unknown as jest.Mocked<HttpClient>

  return mock
}
