import { beforeEach, describe, expect, test, vi } from 'vitest'
import { toValue } from 'vue'

import {
  createNote,
  deleteNote,
  listNotes,
  updateNote
} from './api'
import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useNotesInfiniteQuery,
  useUpdateNoteMutation
} from './queries'
import type { Note, NoteInput } from './types'
import { useOffsetInfiniteQuery } from '@/shared/api'

const queryCache = vi.hoisted(() => ({
  invalidateQueries: vi.fn()
}))

vi.mock('@pinia/colada', () => ({
  useMutation: vi.fn(options => options),
  useQueryCache: () => queryCache
}))

vi.mock('@/shared/api', () => ({
  useOffsetInfiniteQuery: vi.fn()
}))

vi.mock('./api', () => ({
  createNote: vi.fn(),
  deleteNote: vi.fn(),
  listNotes: vi.fn(),
  listOwners: vi.fn(),
  updateNote: vi.fn()
}))

const payload: NoteInput = {
  content: 'Note content',
  owner: 1,
  title: 'Note title'
}

const note: Note = {
  ...payload,
  created_at: '2026-04-28T08:00:00Z',
  id: 7,
  owner: 1,
  updated_at: '2026-04-28T09:00:00Z'
}

async function expectNotesInvalidation (
  onSuccess: () => Promise<void>
) {
  await onSuccess()

  expect(queryCache.invalidateQueries).toHaveBeenCalledWith(
    { key: ['notes'] },
    'all'
  )
}

function asMutationOptions<TVars, TData> (
  mutation: unknown
) {
  return mutation as {
    mutation: (vars: TVars) => Promise<TData>
    onSuccess: () => Promise<void>
  }
}

describe('noteMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when create note succeeds', () => {
    test('should create note and invalidate notes queries', async () => {
      vi.mocked(createNote).mockResolvedValue(note)
      const mutation = asMutationOptions<NoteInput, Note>(useCreateNoteMutation())

      await expect(mutation.mutation(payload)).resolves.toEqual(note)
      await expectNotesInvalidation(mutation.onSuccess)

      expect(createNote).toHaveBeenCalledWith(payload)
    })
  })

  describe('when update note succeeds', () => {
    test('should update note and invalidate notes queries', async () => {
      vi.mocked(updateNote).mockResolvedValue(note)
      const mutation = asMutationOptions<{
        noteId: number
        payload: NoteInput
      }, Note>(useUpdateNoteMutation())

      await expect(mutation.mutation({
        noteId: note.id,
        payload
      })).resolves.toEqual(note)
      await expectNotesInvalidation(mutation.onSuccess)

      expect(updateNote).toHaveBeenCalledWith(note.id, payload)
    })
  })

  describe('when delete note succeeds', () => {
    test('should delete note and invalidate notes queries', async () => {
      vi.mocked(deleteNote).mockResolvedValue(undefined)
      const mutation = asMutationOptions<{
        noteId: number
      }, void>(useDeleteNoteMutation())

      await expect(mutation.mutation({
        noteId: note.id
      })).resolves.toBeUndefined()
      await expectNotesInvalidation(mutation.onSuccess)

      expect(deleteNote).toHaveBeenCalledWith(note.id)
    })
  })
})

describe('notesInfiniteQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when sort and search filters are set', () => {
    test('should pass filters to query key and request params', () => {
      useNotesInfiniteQuery('-title', 'release')

      const options = vi.mocked(useOffsetInfiniteQuery).mock.calls[0]?.[0]

      expect(toValue(options?.key)).toEqual(['notes', '-title', 'release'])
      expect(toValue(options?.params)).toEqual({
        ordering: '-title',
        search: 'release'
      })
      expect(options?.request).toBe(listNotes)
    })
  })

  describe('when search filter is empty', () => {
    test('should omit search from request params', () => {
      useNotesInfiniteQuery('-updated_at', '')

      const options = vi.mocked(useOffsetInfiniteQuery).mock.calls[0]?.[0]

      expect(toValue(options?.key)).toEqual(['notes', '-updated_at', ''])
      expect(toValue(options?.params)).toEqual({
        ordering: '-updated_at',
        search: undefined
      })
    })
  })
})
