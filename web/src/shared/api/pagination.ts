import { useInfiniteQuery, type EntryKey } from '@pinia/colada'
import { toValue, type MaybeRefOrGetter } from 'vue'

import type { PaginatedResponse } from './types'

type OffsetQueryRequestParams = {
  limit: number
  offset: number
  signal?: AbortSignal
}

type OffsetInfiniteQueryOptions<
  TItem,
  TParams extends object = Record<string, never>,
  TKey extends EntryKey = EntryKey
> = {
  enabled?: MaybeRefOrGetter<boolean>
  key: MaybeRefOrGetter<TKey>
  pageSize: number
  params?: MaybeRefOrGetter<TParams | undefined>
  request: (
    params: TParams & OffsetQueryRequestParams
  ) => Promise<PaginatedResponse<TItem>>
}

export function useOffsetInfiniteQuery<
  TItem,
  TParams extends object = Record<string, never>,
  TKey extends EntryKey = EntryKey
> (options: OffsetInfiniteQueryOptions<TItem, TParams, TKey>) {
  return useInfiniteQuery({
    enabled: options.enabled,
    initialPageParam: 0,
    key: () => toValue(options.key),
    query: ({ pageParam, signal }) => {
      const params = toValue(options.params)

      return options.request({
        ...(params ?? {} as TParams),
        limit: options.pageSize,
        offset: pageParam,
        signal
      })
    },
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (!lastPage.next) {
        return null
      }

      return lastPageParam + lastPage.results.length
    }
  })
}

export function flattenOffsetPages<TItem> (
  data: {
    pages: Array<{
      results: TItem[]
    }>
  } | null | undefined
) {
  return data?.pages.flatMap(page => page.results) ?? []
}

export function getOffsetPaginationTotal (
  data: {
    pages: Array<{
      count: number
    }>
  } | null | undefined
) {
  return data?.pages[0]?.count ?? 0
}
