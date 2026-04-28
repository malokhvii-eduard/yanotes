import { ref } from 'vue'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useUpdateNoteMutation
} from '@/features/notes/queries'
import type { Note, NoteInput } from '@/features/notes/types'

import { useActions } from './useActions'
import type { NoteEditorMode } from './useEditor'

vi.mock('@/features/notes/queries', () => ({
  useCreateNoteMutation: vi.fn(),
  useDeleteNoteMutation: vi.fn(),
  useUpdateNoteMutation: vi.fn()
}))

const note: Note = {
  content: 'Original content',
  created_at: '2026-04-28T08:00:00Z',
  id: 7,
  owner: 1,
  title: 'Original title',
  updated_at: '2026-04-28T09:00:00Z'
}

const payload: NoteInput = {
  content: 'Updated content',
  owner: 1,
  title: 'Updated title'
}

function createMutationMock () {
  return {
    isLoading: ref(false),
    mutateAsync: vi.fn(async () => undefined)
  }
}

function asMutationReturn<TMutation extends () => unknown> (
  mutation: ReturnType<typeof createMutationMock>
) {
  return mutation as unknown as ReturnType<TMutation>
}

function createTestContext (
  options: {
    activeNote?: Note | null
    mode?: NoteEditorMode
  } = {}
) {
  const createNoteMutation = createMutationMock()
  const updateNoteMutation = createMutationMock()
  const deleteNoteMutation = createMutationMock()

  vi
    .mocked(useCreateNoteMutation)
    .mockReturnValue(asMutationReturn<typeof useCreateNoteMutation>(createNoteMutation))
  vi
    .mocked(useUpdateNoteMutation)
    .mockReturnValue(asMutationReturn<typeof useUpdateNoteMutation>(updateNoteMutation))
  vi
    .mocked(useDeleteNoteMutation)
    .mockReturnValue(asMutationReturn<typeof useDeleteNoteMutation>(deleteNoteMutation))

  const editor = {
    activeNote: ref(options.activeNote ?? null),
    clearActiveNote: vi.fn(),
    closeDeleteConfirm: vi.fn(),
    mode: ref(options.mode ?? 'create'),
    reset: vi.fn()
  }
  const refreshNotes = vi.fn(async () => undefined)
  const actions = useActions(editor, refreshNotes)

  return {
    actions,
    createNoteMutation,
    deleteNoteMutation,
    editor,
    refreshNotes,
    updateNoteMutation
  }
}

describe('useActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when saving note in create mode', () => {
    test('should create note and reset editor after refresh', async () => {
      const {
        actions,
        createNoteMutation,
        editor,
        refreshNotes,
        updateNoteMutation
      } = createTestContext()

      await actions.saveNote(payload)

      expect(createNoteMutation.mutateAsync).toHaveBeenCalledWith(payload)
      expect(updateNoteMutation.mutateAsync).not.toHaveBeenCalled()
      expect(refreshNotes).toHaveBeenCalledOnce()
      expect(editor.reset).toHaveBeenCalledOnce()
      expect(actions.error.value).toBeNull()
    })
  })

  describe('when saving note in edit mode', () => {
    test('should update active note and reset editor after refresh', async () => {
      const {
        actions,
        createNoteMutation,
        editor,
        refreshNotes,
        updateNoteMutation
      } = createTestContext({
        activeNote: note,
        mode: 'edit'
      })

      await actions.saveNote(payload)

      expect(updateNoteMutation.mutateAsync).toHaveBeenCalledWith({
        noteId: note.id,
        payload
      })
      expect(createNoteMutation.mutateAsync).not.toHaveBeenCalled()
      expect(refreshNotes).toHaveBeenCalledOnce()
      expect(editor.reset).toHaveBeenCalledOnce()
      expect(actions.error.value).toBeNull()
    })
  })

  describe('when saving note fails', () => {
    test('should expose save error and keep editor open', async () => {
      const {
        actions,
        createNoteMutation,
        editor,
        refreshNotes
      } = createTestContext()
      createNoteMutation.mutateAsync.mockRejectedValue(new Error('Save failed'))

      await actions.saveNote(payload)

      expect(actions.error.value).toBe('Save failed')
      expect(refreshNotes).not.toHaveBeenCalled()
      expect(editor.reset).not.toHaveBeenCalled()
    })
  })

  describe('when deleting active note', () => {
    test('should delete note and clear editor state after refresh', async () => {
      const {
        actions,
        deleteNoteMutation,
        editor,
        refreshNotes
      } = createTestContext({
        activeNote: note,
        mode: 'edit'
      })

      await actions.deleteCurrentNote()

      expect(deleteNoteMutation.mutateAsync).toHaveBeenCalledWith({
        noteId: note.id
      })
      expect(refreshNotes).toHaveBeenCalledOnce()
      expect(editor.closeDeleteConfirm).toHaveBeenCalledOnce()
      expect(editor.clearActiveNote).toHaveBeenCalledOnce()
      expect(actions.error.value).toBeNull()
    })
  })

  describe('when deleting without active note', () => {
    test('should skip delete mutation', async () => {
      const {
        actions,
        deleteNoteMutation,
        refreshNotes
      } = createTestContext()

      await actions.deleteCurrentNote()

      expect(deleteNoteMutation.mutateAsync).not.toHaveBeenCalled()
      expect(refreshNotes).not.toHaveBeenCalled()
    })
  })

  describe('when deleting active note fails', () => {
    test('should expose delete error and keep editor state', async () => {
      const {
        actions,
        deleteNoteMutation,
        editor,
        refreshNotes
      } = createTestContext({
        activeNote: note,
        mode: 'edit'
      })
      deleteNoteMutation.mutateAsync.mockRejectedValue(new Error('Delete failed'))

      await actions.deleteCurrentNote()

      expect(actions.error.value).toBe('Delete failed')
      expect(refreshNotes).not.toHaveBeenCalled()
      expect(editor.closeDeleteConfirm).not.toHaveBeenCalled()
      expect(editor.clearActiveNote).not.toHaveBeenCalled()
    })
  })

  describe('when any note mutation is loading', () => {
    test('should expose loading state', () => {
      const {
        actions,
        updateNoteMutation
      } = createTestContext()

      updateNoteMutation.isLoading.value = true

      expect(actions.isLoading.value).toBe(true)
    })
  })
})
