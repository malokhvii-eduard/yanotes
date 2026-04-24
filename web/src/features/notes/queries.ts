import { useMutation, useQueryCache } from '@pinia/colada'
import { toValue, type MaybeRefOrGetter } from 'vue'

import {
  createNote,
  deleteNote,
  listOwners,
  listNotes,
  updateNote
} from '@/features/notes/api'
import type { NoteInput, NoteSort } from '@/features/notes/types'
import { appEnv } from '@/shared/env'
import { useOffsetInfiniteQuery } from '@/shared/api'

type UpdateNotePayload = {
  noteId: number
  payload: NoteInput
}

type DeleteNotePayload = {
  noteId: number
}

async function invalidateNotesQueries (queryCache: ReturnType<typeof useQueryCache>) {
  await queryCache.invalidateQueries({ key: ['notes'] }, 'all')
}

export function useNotesInfiniteQuery (
  sort: MaybeRefOrGetter<NoteSort>,
  search: MaybeRefOrGetter<string>
) {
  return useOffsetInfiniteQuery({
    key: () => ['notes', toValue(sort), toValue(search)],
    pageSize: appEnv.notesPageSize,
    params: () => ({
      ordering: toValue(sort),
      search: toValue(search) || undefined
    }),
    request: listNotes
  })
}

export function useNoteOwnersInfiniteQuery (enabled: MaybeRefOrGetter<boolean>) {
  return useOffsetInfiniteQuery({
    enabled,
    key: ['note-owners'],
    pageSize: appEnv.noteOwnersPageSize,
    request: listOwners
  })
}

export function useCreateNoteMutation () {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: (payload: NoteInput) => createNote(payload),
    onSuccess: async () => {
      await invalidateNotesQueries(queryCache)
    }
  })
}

export function useUpdateNoteMutation () {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: ({ noteId, payload }: UpdateNotePayload) => updateNote(noteId, payload),
    onSuccess: async () => {
      await invalidateNotesQueries(queryCache)
    }
  })
}

export function useDeleteNoteMutation () {
  const queryCache = useQueryCache()

  return useMutation({
    mutation: ({ noteId }: DeleteNotePayload) => deleteNote(noteId),
    onSuccess: async () => {
      await invalidateNotesQueries(queryCache)
    }
  })
}

export type { DeleteNotePayload, UpdateNotePayload }
