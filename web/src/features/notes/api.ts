import { apiClient } from '@/shared/api'
import type { User } from '@/features/auth/types'
import type { Note, NoteInput, NoteSort } from '@/features/notes/types'
import type { PaginatedResponse } from '@/shared/api/types'

type ListNotesParams = {
  limit: number
  offset: number
  ordering: NoteSort
  search?: string
  signal?: AbortSignal
}

type ListOwnersParams = {
  limit: number
  offset: number
  signal?: AbortSignal
}

export async function listNotes (params: ListNotesParams) {
  const { signal, ...query } = params

  const { data } = await apiClient.get<PaginatedResponse<Note>>('/notes', {
    params: query,
    signal
  })

  return data
}

export async function createNote (payload: NoteInput) {
  const { data } = await apiClient.post<Note>('/notes', payload)
  return data
}

export async function updateNote (noteId: number, payload: NoteInput) {
  const { data } = await apiClient.patch<Note>(`/notes/${noteId}`, payload)
  return data
}

export async function deleteNote (noteId: number) {
  await apiClient.delete(`/notes/${noteId}`)
}

export async function listOwners (params: ListOwnersParams) {
  const { signal, ...query } = params

  const { data } = await apiClient.get<PaginatedResponse<User>>('/users', {
    params: query,
    signal
  })

  return data
}
