import { ref, type Ref } from 'vue'

import { createNoteDraft } from '@/features/notes/helpers'
import type { Note, NoteInput } from '@/features/notes/types'

export type NoteEditorMode = 'create' | 'edit'
export type NotesEditorState = {
  activeNote: Ref<Note | null>
  clearActiveNote: () => void
  closeDeleteConfirm: () => void
  draftNote: Ref<NoteInput | null>
  duplicate: (note: Note) => void
  isDeleteConfirmOpen: Ref<boolean>
  isEditorOpen: Ref<boolean>
  mode: Ref<NoteEditorMode>
  openCreate: () => void
  openDeleteConfirm: (note: Note) => void
  openEdit: (note: Note) => void
  reset: () => void
}

export function useEditor (): NotesEditorState {
  const isDeleteConfirmOpen = ref(false)
  const draftNote = ref<NoteInput | null>(null)
  const mode = ref<NoteEditorMode>('create')
  const isEditorOpen = ref(false)
  const activeNote = ref<Note | null>(null)

  function openEditor (nextMode: NoteEditorMode, options: {
    draft?: NoteInput | null
    note?: Note | null
  } = {}) {
    draftNote.value = options.draft ?? null
    mode.value = nextMode
    isEditorOpen.value = true
    activeNote.value = options.note ?? null
  }

  function clearActiveNote () {
    activeNote.value = null
  }

  function closeDeleteConfirm () {
    isDeleteConfirmOpen.value = false
  }

  function reset () {
    draftNote.value = null
    mode.value = 'create'
    isEditorOpen.value = false
    clearActiveNote()
  }

  function openCreate () {
    reset()
    isEditorOpen.value = true
  }

  function openEdit (note: Note) {
    openEditor('edit', { note })
  }

  function duplicate (note: Note) {
    openEditor('create', {
      draft: createNoteDraft(note)
    })
  }

  function openDeleteConfirm (note: Note) {
    isDeleteConfirmOpen.value = true
    activeNote.value = note
  }

  return {
    activeNote,
    clearActiveNote,
    closeDeleteConfirm,
    draftNote,
    duplicate,
    isDeleteConfirmOpen,
    isEditorOpen,
    mode,
    openCreate,
    openDeleteConfirm,
    openEdit,
    reset
  }
}
