import { ref } from 'vue'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { useInfiniteQuery } from '@pinia/colada'

import {
  flattenOffsetPages,
  getOffsetPaginationTotal,
  useOffsetInfiniteQuery
} from './pagination'
import type { PaginatedResponse } from './types'

vi.mock('@pinia/colada', () => ({
  useInfiniteQuery: vi.fn(options => options)
}))

type TestItem = {
  id: number
}

type InfiniteQueryOptions = {
  enabled?: unknown
  getNextPageParam: (
    lastPage: PaginatedResponse<TestItem>,
    pages: Array<PaginatedResponse<TestItem>>,
    lastPageParam: number
  ) => number | null
  initialPageParam: number
  key: () => readonly unknown[]
  query: (context: {
    pageParam: number
    signal?: AbortSignal
  }) => Promise<PaginatedResponse<TestItem>>
}

function createPage (
  results: TestItem[],
  options: {
    count?: number
    next?: string | null
  } = {}
): PaginatedResponse<TestItem> {
  return {
    count: options.count ?? results.length,
    next: options.next ?? null,
    previous: null,
    results
  }
}

function getInfiniteQueryOptions () {
  return vi.mocked(useInfiniteQuery).mock.calls[0]?.[0] as unknown as InfiniteQueryOptions
}

describe('useOffsetInfiniteQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when query options are created', () => {
    test('should pass enabled state, initial page, and resolved key', () => {
      const enabled = ref(true)
      const key = ref(['notes', '-updated_at'] as const)

      useOffsetInfiniteQuery({
        enabled,
        key,
        pageSize: 20,
        request: vi.fn()
      })

      const options = getInfiniteQueryOptions()

      expect(options?.enabled).toBe(enabled)
      expect(options?.initialPageParam).toBe(0)
      expect(options?.key()).toEqual(['notes', '-updated_at'])
    })
  })

  describe('when query runs with params', () => {
    test('should request current offset, page size, signal, and resolved params', async () => {
      const signal = new AbortController().signal
      const request = vi.fn(async () => createPage([{ id: 1 }]))

      useOffsetInfiniteQuery({
        key: ['notes'],
        pageSize: 10,
        params: ref({
          ordering: '-title',
          search: 'release'
        }),
        request
      })

      const options = getInfiniteQueryOptions()

      await options?.query({
        pageParam: 30,
        signal
      })

      expect(request).toHaveBeenCalledWith({
        limit: 10,
        offset: 30,
        ordering: '-title',
        search: 'release',
        signal
      })
    })
  })

  describe('when query runs without params', () => {
    test('should request current offset and page size only', async () => {
      const request = vi.fn(async () => createPage([{ id: 1 }]))

      useOffsetInfiniteQuery({
        key: ['notes'],
        pageSize: 5,
        request
      })

      const options = getInfiniteQueryOptions()

      await options?.query({
        pageParam: 15
      })

      expect(request).toHaveBeenCalledWith({
        limit: 5,
        offset: 15,
        signal: undefined
      })
    })
  })

  describe('when last page has next link', () => {
    test('should move offset by last page result count', () => {
      useOffsetInfiniteQuery({
        key: ['notes'],
        pageSize: 20,
        request: vi.fn()
      })

      const options = getInfiniteQueryOptions()
      const nextOffset = options?.getNextPageParam(
        createPage([{ id: 1 }, { id: 2 }], { next: '/notes?offset=2' }),
        [],
        20
      )

      expect(nextOffset).toBe(22)
    })
  })

  describe('when last page has no next link', () => {
    test('should stop pagination', () => {
      useOffsetInfiniteQuery({
        key: ['notes'],
        pageSize: 20,
        request: vi.fn()
      })

      const options = getInfiniteQueryOptions()
      const nextOffset = options?.getNextPageParam(
        createPage([{ id: 1 }]),
        [],
        20
      )

      expect(nextOffset).toBeNull()
    })
  })
})

describe('flattenOffsetPages', () => {
  describe('when pages are loaded', () => {
    test('should flatten page results', () => {
      const data = {
        pages: [
          createPage([{ id: 1 }]),
          createPage([{ id: 2 }, { id: 3 }])
        ]
      }

      expect(flattenOffsetPages(data)).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ])
    })
  })

  describe('when pages are missing', () => {
    test('should return empty list', () => {
      expect(flattenOffsetPages(null)).toEqual([])
      expect(flattenOffsetPages(undefined)).toEqual([])
    })
  })
})

describe('getOffsetPaginationTotal', () => {
  describe('when first page is loaded', () => {
    test('should return total count from first page', () => {
      const data = {
        pages: [
          createPage([{ id: 1 }], { count: 12 }),
          createPage([{ id: 2 }], { count: 99 })
        ]
      }

      expect(getOffsetPaginationTotal(data)).toBe(12)
    })
  })

  describe('when pages are missing', () => {
    test('should return zero', () => {
      expect(getOffsetPaginationTotal(null)).toBe(0)
      expect(getOffsetPaginationTotal(undefined)).toBe(0)
    })
  })
})
