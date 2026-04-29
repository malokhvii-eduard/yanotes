import { nextTick, ref } from 'vue'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  useNoteOwnerQuery,
  useNoteOwnersInfiniteQuery,
  useNotesInfiniteQuery
} from '@/features/notes/queries'
import type { User } from '@/features/auth/types'
import type { Note, NoteSort } from '@/features/notes/types'

import { useList } from './useList'

const observer = vi.hoisted(() => ({
  callback: null as ((entries: IntersectionObserverEntry[]) => void) | null
}))

vi.mock('@vueuse/core', () => ({
  useIntersectionObserver: vi.fn((_target, callback) => {
    observer.callback = callback

    return {
      stop: vi.fn()
    }
  })
}))

vi.mock('@/features/notes/queries', () => ({
  useNoteOwnerQuery: vi.fn(),
  useNoteOwnersInfiniteQuery: vi.fn(),
  useNotesInfiniteQuery: vi.fn()
}))

vi.mock('@/shared/api', () => ({
  flattenOffsetPages: vi.fn((data?: {
    pages: Array<{
      results: unknown[]
    }>
  }) => data?.pages.flatMap(page => page.results) ?? []),
  getOffsetPaginationTotal: vi.fn(data => data?.pages[0]?.count ?? 0)
}))

type OffsetPages<TItem> = {
  pages: Array<{
    count: number
    next: string | null
    previous: string | null
    results: TItem[]
  }>
}

function createNote (id: number): Note {
  return {
    content: `Content ${id}`,
    created_at: '2026-04-28T08:00:00Z',
    id,
    owner: 1,
    title: `Note ${id}`,
    updated_at: '2026-04-28T09:00:00Z'
  }
}

function createOwner (id: number): User {
  return {
    email: `user-${id}@example.com`,
    first_name: 'Test',
    id,
    is_staff: false,
    last_name: 'User',
    username: `user-${id}`
  }
}

function createPages<TItem> (
  results: TItem[],
  options: {
    count?: number
    next?: string | null
  } = {}
): OffsetPages<TItem> {
  return {
    pages: [
      {
        count: options.count ?? results.length,
        next: options.next ?? null,
        previous: null,
        results
      }
    ]
  }
}

function createInfiniteQueryMock<TItem> (
  options: {
    data?: OffsetPages<TItem> | null
    error?: unknown
    hasNextPage?: boolean
    isLoading?: boolean
    isPending?: boolean
    status?: string
  } = {}
) {
  return {
    data: ref(options.data ?? null),
    error: ref(options.error ?? null),
    hasNextPage: ref(options.hasNextPage ?? false),
    isLoading: ref(options.isLoading ?? false),
    isPending: ref(options.isPending ?? false),
    loadNextPage: vi.fn(async () => undefined),
    refresh: vi.fn(async () => undefined),
    state: ref({
      status: options.status ?? 'pending'
    })
  }
}

function createQueryMock<TItem> (
  options: {
    data?: TItem
  } = {}
) {
  return {
    data: ref(options.data)
  }
}

function asNotesQuery (
  query: ReturnType<typeof createInfiniteQueryMock<Note>>
) {
  return query as unknown as ReturnType<typeof useNotesInfiniteQuery>
}

function asOwnersQuery (
  query: ReturnType<typeof createInfiniteQueryMock<User>>
) {
  return query as unknown as ReturnType<typeof useNoteOwnersInfiniteQuery>
}

function asOwnerQuery (
  query: ReturnType<typeof createQueryMock<User>>
) {
  return query as unknown as ReturnType<typeof useNoteOwnerQuery>
}

function createTestContext (
  options: {
    canManageOwners?: boolean
    isEditorOpen?: boolean
    notesQuery?: ReturnType<typeof createInfiniteQueryMock<Note>>
    ownerId?: number
    ownerQuery?: ReturnType<typeof createInfiniteQueryMock<User>>
    selectedOwnerQuery?: ReturnType<typeof createQueryMock<User>>
    search?: string
    sort?: NoteSort
  } = {}
) {
  observer.callback = null

  const notesQuery = options.notesQuery ?? createInfiniteQueryMock<Note>()
  const ownerQuery = options.ownerQuery ?? createInfiniteQueryMock<User>()
  const selectedOwnerQuery = options.selectedOwnerQuery ?? createQueryMock<User>()

  vi.mocked(useNotesInfiniteQuery).mockReturnValue(asNotesQuery(notesQuery))
  vi.mocked(useNoteOwnersInfiniteQuery).mockReturnValue(asOwnersQuery(ownerQuery))
  vi.mocked(useNoteOwnerQuery).mockReturnValue(asOwnerQuery(selectedOwnerQuery))

  const canManageOwners = ref(options.canManageOwners ?? false)
  const isEditorOpen = ref(options.isEditorOpen ?? false)
  const ownerId = ref(options.ownerId)
  const list = useList({
    canManageOwners,
    isEditorOpen,
    ownerId,
    userId: ref(1),
    search: ref(options.search ?? ''),
    sort: ref(options.sort ?? '-updated_at')
  })

  return {
    canManageOwners,
    isEditorOpen,
    list,
    notesQuery,
    ownerId,
    ownerQuery
  }
}

function triggerNotesIntersection (isIntersecting: boolean) {
  observer.callback?.([
    {
      isIntersecting
    } as IntersectionObserverEntry
  ])
}

describe('useList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when first notes load is needed', () => {
    test('should refresh notes immediately', async () => {
      const { notesQuery } = createTestContext({
        notesQuery: createInfiniteQueryMock<Note>({
          isLoading: false,
          isPending: true
        })
      })

      await nextTick()

      expect(notesQuery.refresh).toHaveBeenCalledOnce()
    })
  })

  describe('when notes are loaded', () => {
    test('should expose flattened notes and total count', () => {
      const notes = [
        createNote(1),
        createNote(2)
      ]
      const { list } = createTestContext({
        notesQuery: createInfiniteQueryMock<Note>({
          data: createPages(notes, { count: 7 }),
          status: 'success'
        })
      })

      expect(list.notes.value).toEqual(notes)
      expect(list.total.value).toBe(7)
      expect(list.isLoading.value).toBe(false)
    })
  })

  describe('when notes query is pending without loaded pages', () => {
    test('should expose initial loading state', () => {
      const { list } = createTestContext({
        notesQuery: createInfiniteQueryMock<Note>({
          isLoading: true,
          isPending: true
        })
      })

      expect(list.isLoading.value).toBe(true)
      expect(list.isLoadingMore.value).toBe(false)
    })
  })

  describe('when notes query is loading after first page', () => {
    test('should expose loading more state', () => {
      const { list } = createTestContext({
        notesQuery: createInfiniteQueryMock<Note>({
          data: createPages([createNote(1)]),
          isLoading: true,
          isPending: false
        })
      })

      expect(list.isLoading.value).toBe(false)
      expect(list.isLoadingMore.value).toBe(true)
    })
  })

  describe('when load more anchor intersects with more notes available', () => {
    test('should load next notes page', () => {
      const { list, notesQuery } = createTestContext({
        notesQuery: createInfiniteQueryMock<Note>({
          data: createPages([createNote(1)], { next: '/notes?offset=1' }),
          hasNextPage: true
        })
      })

      list.setLoadMoreAnchor(document.createElement('div'))
      triggerNotesIntersection(true)

      expect(notesQuery.loadNextPage).toHaveBeenCalledWith({
        cancelRefetch: false
      })
    })
  })

  describe('when load more anchor does not intersect', () => {
    test('should skip loading next notes page', () => {
      const { list, notesQuery } = createTestContext({
        notesQuery: createInfiniteQueryMock<Note>({
          data: createPages([createNote(1)], { next: '/notes?offset=1' }),
          hasNextPage: true
        })
      })

      list.setLoadMoreAnchor(document.createElement('div'))
      triggerNotesIntersection(false)

      expect(notesQuery.loadNextPage).not.toHaveBeenCalled()
    })
  })

  describe('when next notes page cannot be loaded', () => {
    test('should skip loading next notes page', () => {
      const { list, notesQuery } = createTestContext({
        notesQuery: createInfiniteQueryMock<Note>({
          data: createPages([createNote(1)]),
          hasNextPage: false
        })
      })

      list.setLoadMoreAnchor(document.createElement('div'))
      triggerNotesIntersection(true)

      expect(notesQuery.loadNextPage).not.toHaveBeenCalled()
    })
  })

  describe('when notes are already loading more', () => {
    test('should skip loading next notes page', () => {
      const { list, notesQuery } = createTestContext({
        notesQuery: createInfiniteQueryMock<Note>({
          data: createPages([createNote(1)], { next: '/notes?offset=1' }),
          hasNextPage: true,
          isLoading: true
        })
      })

      list.setLoadMoreAnchor(document.createElement('div'))
      triggerNotesIntersection(true)

      expect(notesQuery.loadNextPage).not.toHaveBeenCalled()
    })
  })

  describe('when notes query fails', () => {
    test('should expose readable load error', () => {
      const { list } = createTestContext({
        notesQuery: createInfiniteQueryMock<Note>({
          error: new Error('Unable to reach API')
        })
      })

      expect(list.loadError.value).toBe('Unable to reach API')
    })
  })

  describe('when owners are loaded for admin editor', () => {
    test('should expose owners and owner select state', () => {
      const owners = [
        createOwner(1),
        createOwner(2)
      ]
      const { list } = createTestContext({
        canManageOwners: true,
        isEditorOpen: true,
        ownerQuery: createInfiniteQueryMock<User>({
          data: createPages(owners, { count: 3, next: '/users?offset=2' }),
          hasNextPage: true,
          status: 'success'
        })
      })

      expect(list.owners.value).toEqual(owners)
      expect(list.showOwnerSelect.value).toBe(true)
      expect(list.hasMoreOwners.value).toBe(true)
    })
  })

  describe('when selected note owner is not in the owner page yet', () => {
    test('should include loaded selected owner before paginated owners', () => {
      const selectedOwner = createOwner(7)
      const owners = [
        createOwner(1),
        createOwner(2)
      ]
      const { list } = createTestContext({
        canManageOwners: true,
        isEditorOpen: true,
        ownerId: selectedOwner.id,
        ownerQuery: createInfiniteQueryMock<User>({
          data: createPages(owners),
          status: 'success'
        }),
        selectedOwnerQuery: createQueryMock({
          data: selectedOwner
        })
      })

      expect(list.owners.value).toEqual([
        selectedOwner,
        ...owners
      ])
    })
  })

  describe('when selected note owner is loading', () => {
    test('should include pending selected owner instead of exposing owner id', () => {
      const owners = [
        createOwner(1),
        createOwner(2)
      ]
      const { list } = createTestContext({
        canManageOwners: true,
        isEditorOpen: true,
        ownerId: 7,
        ownerQuery: createInfiniteQueryMock<User>({
          data: createPages(owners),
          status: 'success'
        })
      })

      expect(list.owners.value[0]).toMatchObject({
        id: 7,
        username: 'Loading owner...'
      })
    })
  })

  describe('when selected note owner is already loaded in owner page', () => {
    test('should not duplicate selected owner', () => {
      const owners = [
        createOwner(1),
        createOwner(7)
      ]
      const { list } = createTestContext({
        canManageOwners: true,
        isEditorOpen: true,
        ownerId: 7,
        ownerQuery: createInfiniteQueryMock<User>({
          data: createPages(owners),
          status: 'success'
        }),
        selectedOwnerQuery: createQueryMock({
          data: createOwner(7)
        })
      })

      expect(list.owners.value).toEqual(owners)
    })
  })

  describe('when fetching more owners is allowed', () => {
    test('should load next owners page', async () => {
      const { list, ownerQuery } = createTestContext({
        canManageOwners: true,
        isEditorOpen: true,
        ownerQuery: createInfiniteQueryMock<User>({
          hasNextPage: true,
          status: 'success'
        })
      })

      await list.fetchMoreOwners()

      expect(ownerQuery.loadNextPage).toHaveBeenCalledWith({
        cancelRefetch: false
      })
    })
  })

  describe('when fetching more owners is not allowed', () => {
    test('should skip loading next owners page', async () => {
      const { list, ownerQuery } = createTestContext({
        canManageOwners: false,
        ownerQuery: createInfiniteQueryMock<User>({
          hasNextPage: true,
          status: 'success'
        })
      })

      await list.fetchMoreOwners()

      expect(ownerQuery.loadNextPage).not.toHaveBeenCalled()
    })
  })

  describe('when load more anchor receives component instance', () => {
    test('should ignore non-element refs', () => {
      const { list } = createTestContext()

      list.setLoadMoreAnchor({} as never)

      expect(observer.callback).not.toBeNull()
    })
  })
})
