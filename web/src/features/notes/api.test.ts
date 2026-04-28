import { beforeEach, describe, expect, test, vi } from 'vitest'

import { apiClient } from '@/shared/api'
import type { User } from '@/features/auth/types'
import type { PaginatedResponse } from '@/shared/api/types'

import {
  createNote,
  deleteNote,
  listNotes,
  listOwners,
  updateNote
} from './api'
import type { Note, NoteInput } from './types'

vi.mock('@/shared/api', () => ({
  apiClient: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn()
  }
}))

const note: Note = {
  content: 'Note content',
  created_at: '2026-04-28T08:00:00Z',
  id: 7,
  owner: 1,
  title: 'Note title',
  updated_at: '2026-04-28T09:00:00Z'
}

const payload: NoteInput = {
  content: note.content,
  owner: note.owner,
  title: note.title
}

const owner: User = {
  email: 'owner@example.com',
  first_name: 'Owner',
  id: 1,
  is_staff: false,
  last_name: 'User',
  username: 'owner-user'
}

function createPage<TItem> (results: TItem[]): PaginatedResponse<TItem> {
  return {
    count: results.length,
    next: null,
    previous: null,
    results
  }
}

describe('notesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when listing notes', () => {
    test('should get notes with pagination, filters, and signal', async () => {
      const signal = new AbortController().signal
      const page = createPage([note])
      vi.mocked(apiClient.get).mockResolvedValue({
        data: page
      })

      await expect(listNotes({
        limit: 20,
        offset: 40,
        ordering: '-updated_at',
        search: 'release',
        signal
      })).resolves.toEqual(page)

      expect(apiClient.get).toHaveBeenCalledWith('/notes', {
        params: {
          limit: 20,
          offset: 40,
          ordering: '-updated_at',
          search: 'release'
        },
        signal
      })
    })
  })

  describe('when creating note', () => {
    test('should post note payload and return created note', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: note
      })

      await expect(createNote(payload)).resolves.toEqual(note)

      expect(apiClient.post).toHaveBeenCalledWith('/notes', payload)
    })
  })

  describe('when updating note', () => {
    test('should patch note payload and return updated note', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: note
      })

      await expect(updateNote(note.id, payload)).resolves.toEqual(note)

      expect(apiClient.patch).toHaveBeenCalledWith('/notes/7', payload)
    })
  })

  describe('when deleting note', () => {
    test('should delete note without returning data', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: undefined
      })

      await expect(deleteNote(note.id)).resolves.toBeUndefined()

      expect(apiClient.delete).toHaveBeenCalledWith('/notes/7')
    })
  })

  describe('when listing owners', () => {
    test('should get users with pagination and signal', async () => {
      const signal = new AbortController().signal
      const page = createPage([owner])
      vi.mocked(apiClient.get).mockResolvedValue({
        data: page
      })

      await expect(listOwners({
        limit: 10,
        offset: 20,
        signal
      })).resolves.toEqual(page)

      expect(apiClient.get).toHaveBeenCalledWith('/users', {
        params: {
          limit: 10,
          offset: 20
        },
        signal
      })
    })
  })
})
