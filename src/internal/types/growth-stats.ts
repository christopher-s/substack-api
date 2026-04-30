import * as t from 'io-ts'
import { maybe } from '@substack-api/internal/types/helpers'

const GrowthMetricTimeseriesPointCodec = t.intersection([
  t.type({
    date: t.string,
    value: t.number
  }),
  t.partial({})
])

const GrowthMetricCodec = t.intersection([
  t.type({
    name: t.string
  }),
  t.partial({
    timeseries: maybe(t.array(GrowthMetricTimeseriesPointCodec)),
    total: maybe(t.number)
  })
])

const GrowthSourceCodec = t.recursion<GrowthSourceType>(
  'GrowthSource',
  (): t.Type<GrowthSourceType> =>
    t.intersection([
      t.type({
        source: t.string,
        sourceName: t.string,
        originalSourceName: t.string,
        category: t.string
      }),
      t.partial({
        logoUrl: maybe(t.union([t.string, t.null])),
        metrics: maybe(t.array(GrowthMetricCodec)),
        children: maybe(t.array(GrowthSourceCodec))
      })
    ]) as unknown as t.Type<GrowthSourceType>
)

interface GrowthSourceType {
  source: string
  sourceName: string
  originalSourceName: string
  category: string
  logoUrl?: string | null | undefined
  metrics?: unknown[] | null | undefined
  children?: GrowthSourceType[] | null | undefined
}

export const GrowthSourcesCodec = t.intersection([
  t.type({}),
  t.partial({
    sourceMetrics: maybe(t.array(GrowthSourceCodec))
  })
])

export type GrowthSources = t.TypeOf<typeof GrowthSourcesCodec>

const TimeseriesSourceMetricCodec = t.intersection([
  t.type({
    name: t.string
  }),
  t.partial({
    timeseries: maybe(t.array(GrowthMetricTimeseriesPointCodec)),
    total: maybe(t.number)
  })
])

const TimeseriesSourceCodec = t.intersection([
  t.type({
    source: t.string,
    sourceName: t.string,
    originalSourceName: t.string,
    category: t.string
  }),
  t.partial({
    metrics: maybe(t.array(TimeseriesSourceMetricCodec))
  })
])

export const GrowthTimeseriesCodec = t.intersection([
  t.type({}),
  t.partial({
    sources: maybe(t.array(TimeseriesSourceCodec))
  })
])

export type GrowthTimeseries = t.TypeOf<typeof GrowthTimeseriesCodec>

const GrowthEventCodec = t.intersection([
  t.type({
    id: t.number,
    date: t.string,
    title: t.string,
    slug: t.string,
    type: t.string
  }),
  t.partial({
    url: maybe(t.string)
  })
])

export const GrowthEventsCodec = t.intersection([
  t.type({}),
  t.partial({
    pubEvents: maybe(t.array(GrowthEventCodec))
  })
])

export type GrowthEvents = t.TypeOf<typeof GrowthEventsCodec>
