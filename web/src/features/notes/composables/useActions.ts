import { computed, ref } from 'vue'

import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useUpdateNoteMutation
} from '@/features/notes/queries'
import { getErrorMessage } from '@/shared/errors'
import type { NoteInput } from '@/features/notes/types'
import type { NotesEditorState } from '@/features/notes/composables/useEditor'

export function useActions (editor: Pick<
  NotesEditorState,
  'activeNote' | 'clearActiveNote' | 'closeDeleteConfirm' | 'mode' | 'reset'
>, refreshNotes: () => Promise<unknown>) {
  const error = ref<string | null>(null)
  const createNoteMutation = useCreateNoteMutation()
  const updateNoteMutation = useUpdateNoteMutation()
  const deleteNoteMutation = useDeleteNoteMutation()

  const isLoading = computed(() => {
    return createNoteMutation.isLoading.value ||
      updateNoteMutation.isLoading.value ||
      deleteNoteMutation.isLoading.value
  })

  async function saveNote (payload: NoteInput) {
    error.value = null

    try {
      if (editor.mode.value === 'edit' && editor.activeNote.value) {
        await updateNoteMutation.mutateAsync({
          noteId: editor.activeNote.value.id,
          payload
        })
      } else {
        await createNoteMutation.mutateAsync(payload)
      }

      await refreshNotes()
      editor.reset()
    } catch (caughtError) {
      error.value = getErrorMessage(caughtError, 'Unable to save the note.')
    }
  }

  async function deleteCurrentNote () {
    if (!editor.activeNote.value) {
      return
    }

    error.value = null

    try {
      await deleteNoteMutation.mutateAsync({
        noteId: editor.activeNote.value.id
      })

      await refreshNotes()
      editor.closeDeleteConfirm()
      editor.clearActiveNote()
    } catch (caughtError) {
      error.value = getErrorMessage(caughtError, 'Unable to delete the note.')
    }
  }

  return {
    error,
    deleteCurrentNote,
    isLoading,
    saveNote
  }
}
