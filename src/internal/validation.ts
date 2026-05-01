/**
 * Utility functions for runtime validation using io-ts and fp-ts
 */

/**
 * Safely extract an error message from an unknown value.
 * Handles Error instances, objects with a message property,
 * and falls back to String conversion for everything else.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}

import { pipe } from 'fp-ts/function'
import { fold } from 'fp-ts/Either'
import * as t from 'io-ts'

/**
 * Decode and validate data using an io-ts codec
 * @param codec - The io-ts codec to use for validation
 * @param data - The raw data to validate
 * @param errorContext - Context information for error messages
 * @returns The validated data
 * @throws {Error} If validation fails
 */
export function decodeOrThrow<A>(
  codec: t.Type<A, unknown, unknown>,
  data: unknown,
  errorContext: string
): A {
  const result = codec.decode(data)

  return pipe(
    result,
    fold(
      (_errors) => {
        throw new Error(`Invalid response from ${errorContext}`)
      },
      (parsed) => parsed
    )
  )
}
