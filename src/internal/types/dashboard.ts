import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

export const DashboardSummaryCodec = t.intersection([
  t.type({}),
  t.partial({
    totalSubscribersEnd: maybe(t.number),
    totalSubscribersStart: maybe(t.number),
    paidSubscribersEnd: maybe(t.number),
    paidSubscribersStart: maybe(t.number),
    arrEnd: maybe(t.number),
    arrStart: maybe(t.number),
    totalViewsEnd: maybe(t.number),
    totalViewsStart: maybe(t.number),
    pledgedArrEnd: maybe(t.number),
    pledgedArrStart: maybe(t.number)
  })
])

export type DashboardSummary = t.TypeOf<typeof DashboardSummaryCodec>

export const EmailsTimeseriesCodec = t.array(t.tuple([t.string, t.number]))

export type EmailsTimeseries = t.TypeOf<typeof EmailsTimeseriesCodec>

export const UnreadActivityCodec = t.intersection([
  t.type({}),
  t.partial({
    count: maybe(t.number),
    max: maybe(t.boolean),
    lastViewedAt: maybe(t.string)
  })
])

export type UnreadActivity = t.TypeOf<typeof UnreadActivityCodec>

export const UnreadMessageCountCodec = t.intersection([
  t.type({}),
  t.partial({
    unreadCount: maybe(t.number),
    pendingInviteCount: maybe(t.number),
    pendingInviteUnreadCount: maybe(t.number),
    newPendingInviteUnreadCount: maybe(t.number),
    pubChatUnreadCount: maybe(t.number)
  })
])

export type UnreadMessageCount = t.TypeOf<typeof UnreadMessageCountCodec>
