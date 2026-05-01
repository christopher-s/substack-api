import * as t from 'io-ts'

/**
 * Notification item from the Substack /notifications endpoint
 */
export const SubstackNotificationCodec = t.intersection([
  t.type({
    id: t.number,
    type: t.string,
    created_at: t.string,
    read: t.boolean
  }),
  t.partial({
    actor_name: t.union([t.string, t.null]),
    actor_handle: t.union([t.string, t.null]),
    actor_photo_url: t.union([t.string, t.null]),
    post_id: t.union([t.number, t.null]),
    post_title: t.union([t.string, t.null]),
    comment_id: t.union([t.number, t.null]),
    comment_body: t.union([t.string, t.null]),
    note_id: t.union([t.number, t.null]),
    note_body: t.union([t.string, t.null]),
    publication_name: t.union([t.string, t.null])
  })
])

export type SubstackNotification = t.TypeOf<typeof SubstackNotificationCodec>

export const SubstackNotificationsResponseCodec = t.type({
  notifications: t.array(SubstackNotificationCodec),
  nextCursor: t.union([t.string, t.null, t.undefined])
})

export type SubstackNotificationsResponse = t.TypeOf<typeof SubstackNotificationsResponseCodec>
