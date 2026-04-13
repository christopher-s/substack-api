import * as t from 'io-ts'

/**
 * Reactor (user who liked/reacted) in a facepile response
 */
export const SubstackReactorCodec = t.type({
  id: t.number,
  name: t.string,
  photo_url: t.string
})

export type SubstackReactor = t.TypeOf<typeof SubstackReactorCodec>

/**
 * Facepile response from /api/v1/post/{id}/facepile
 */
export const SubstackFacepileCodec = t.type({
  reactors: t.array(SubstackReactorCodec)
})

export type SubstackFacepile = t.TypeOf<typeof SubstackFacepileCodec>
