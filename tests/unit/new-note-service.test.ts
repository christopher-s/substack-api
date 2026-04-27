import { NoteBuilderFactory } from '@substack-api/internal/services/new-note-service'
import { HttpClient } from '@substack-api/internal/http-client'
import { NoteBuilder, NoteWithLinkBuilder } from '@substack-api/domain/note-builder'

jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/domain/note-builder')

describe('NoteBuilderFactory', () => {
  let service: NoteBuilderFactory
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = new HttpClient('https://test.substack.com') as jest.Mocked<HttpClient>
    service = new NoteBuilderFactory(mockClient)
  })

  describe('newNote', () => {
    it('should return a NoteBuilder instance', () => {
      const mockBuilder = {} as NoteBuilder
      jest.mocked(NoteBuilder).mockImplementation(() => mockBuilder)

      const result = service.newNote()

      expect(NoteBuilder).toHaveBeenCalledWith(mockClient)
      expect(result).toBe(mockBuilder)
    })
  })

  describe('newNoteWithLink', () => {
    it('should return a NoteWithLinkBuilder instance', () => {
      const mockBuilder = {} as NoteWithLinkBuilder
      jest.mocked(NoteWithLinkBuilder).mockImplementation(() => mockBuilder)

      const result = service.newNoteWithLink('https://example.com')

      expect(NoteWithLinkBuilder).toHaveBeenCalledWith(mockClient, 'https://example.com')
      expect(result).toBe(mockBuilder)
    })
  })
})
