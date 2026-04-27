import * as t from 'io-ts'

/**
 * Helper for API fields that may be `null`, `undefined`, or omitted.
 */
export const maybe = <C extends t.Mixed>(codec: C) => t.union([codec, t.null, t.undefined])
