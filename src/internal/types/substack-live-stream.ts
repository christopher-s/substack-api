import * as t from 'io-ts'

/**
 * Active live stream data
 */
export const SubstackActiveLiveStreamCodec = t.type({
  id: t.number,
  title: t.string
})

export type SubstackActiveLiveStream = t.TypeOf<typeof SubstackActiveLiveStreamCodec>

/**
 * Response from /api/v1/live_streams/active/pub/{pub_id}
 */
export const SubstackLiveStreamResponseCodec = t.type({
  activeLiveStream: t.union([SubstackActiveLiveStreamCodec, t.null])
})

export type SubstackLiveStreamResponse = t.TypeOf<typeof SubstackLiveStreamResponseCodec>
