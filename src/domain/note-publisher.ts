import { HttpClient } from '@substack-api/internal/http-client'
import { markdownToNoteBody } from '@substack-api/internal/markdown-to-prosemirror'
import { decodeOrThrow } from '@substack-api/internal/validation'
import {
  CreateAttachmentRequest,
  CreateAttachmentResponseCodec,
  PublishNoteRequest,
  PublishNoteResponseCodec
} from '@substack-api/internal'

/**
 * Publish a note from markdown content.
 * Supports bold, italic, code, links, strikethrough, underline, bullet lists,
 * and ordered lists via standard markdown syntax.
 *
 * @param httpClient - An authenticated HttpClient instance
 * @param markdown - Markdown content to convert and publish
 * @param options.linkUrl - Optional URL to attach as a link preview
 * @returns Object with success status and the server response
 */
export async function publishNote(
  httpClient: HttpClient,
  markdown: string,
  options?: { linkUrl?: string }
): Promise<{ success: boolean; note?: unknown }> {
  const bodyJson = markdownToNoteBody(markdown)

  let attachmentIds: string[] | undefined

  if (options?.linkUrl) {
    const attachmentRequest: CreateAttachmentRequest = {
      url: options.linkUrl,
      type: 'link'
    }
    const rawAttachmentResponse = await httpClient.post<unknown>(
      '/comment/attachment/',
      attachmentRequest
    )
    const attachmentResponse = decodeOrThrow(
      CreateAttachmentResponseCodec,
      rawAttachmentResponse,
      'Create attachment response'
    )
    attachmentIds = [attachmentResponse.id]
  }

  const request: PublishNoteRequest = {
    bodyJson,
    tabId: 'for-you',
    surface: 'feed',
    replyMinimumRole: 'everyone'
  }

  if (attachmentIds && attachmentIds.length > 0) {
    request.attachmentIds = attachmentIds
  }

  const rawResponse = await httpClient.post<unknown>('/comment/feed/', request)
  const response = decodeOrThrow(PublishNoteResponseCodec, rawResponse, 'Publish note response')

  return { success: true, note: response }
}
