import { describe, expect, test } from 'vitest'

import type { Note } from '@/features/notes/types'

import { useEditor } from './useEditor'

const note: Note = {
  content: 'Existing content',
  created_at: '2026-04-28T08:00:00Z',
  id: 7,
  owner: 1,
  title: 'Existing title',
  updated_at: '2026-04-28T09:00:00Z'
}

describe('useEditor', () => {
  describe('when editor is created', () => {
    test('should expose closed create-mode state', () => {
      const editor = useEditor()

      expect(editor.activeNote.value).toBeNull()
      expect(editor.draftNote.value).toBeNull()
      expect(editor.isDeleteConfirmOpen.value).toBe(false)
      expect(editor.isEditorOpen.value).toBe(false)
      expect(editor.mode.value).toBe('create')
    })
  })

  describe('when creating a note', () => {
    test('should open editor in create mode without active note or draft', () => {
      const editor = useEditor()
      editor.openEdit(note)

      editor.openCreate()

      expect(editor.activeNote.value).toBeNull()
      expect(editor.draftNote.value).toBeNull()
      expect(editor.isEditorOpen.value).toBe(true)
      expect(editor.mode.value).toBe('create')
    })
  })

  describe('when editing a note', () => {
    test('should open editor in edit mode with active note', () => {
      const editor = useEditor()

      editor.openEdit(note)

      expect(editor.activeNote.value).toEqual(note)
      expect(editor.draftNote.value).toBeNull()
      expect(editor.isEditorOpen.value).toBe(true)
      expect(editor.mode.value).toBe('edit')
    })
  })

  describe('when duplicating a note', () => {
    test('should open create editor with note draft', () => {
      const editor = useEditor()

      editor.duplicate(note)

      expect(editor.activeNote.value).toBeNull()
      expect(editor.draftNote.value).toEqual({
        content: note.content,
        owner: note.owner,
        title: note.title
      })
      expect(editor.isEditorOpen.value).toBe(true)
      expect(editor.mode.value).toBe('create')
    })
  })

  describe('when delete confirmation is opened', () => {
    test('should keep note as active delete target', () => {
      const editor = useEditor()

      editor.openDeleteConfirm(note)

      expect(editor.activeNote.value).toEqual(note)
      expect(editor.isDeleteConfirmOpen.value).toBe(true)
    })
  })

  describe('when active note is cleared', () => {
    test('should clear active note only', () => {
      const editor = useEditor()
      editor.openEdit(note)

      editor.clearActiveNote()

      expect(editor.activeNote.value).toBeNull()
      expect(editor.isEditorOpen.value).toBe(true)
      expect(editor.mode.value).toBe('edit')
    })
  })

  describe('when delete confirmation is closed', () => {
    test('should close delete confirmation without clearing active note', () => {
      const editor = useEditor()
      editor.openDeleteConfirm(note)

      editor.closeDeleteConfirm()

      expect(editor.activeNote.value).toEqual(note)
      expect(editor.isDeleteConfirmOpen.value).toBe(false)
    })
  })

  describe('when editor is reset', () => {
    test('should close editor and clear transient state', () => {
      const editor = useEditor()
      editor.duplicate(note)
      editor.openDeleteConfirm(note)

      editor.reset()

      expect(editor.activeNote.value).toBeNull()
      expect(editor.draftNote.value).toBeNull()
      expect(editor.isDeleteConfirmOpen.value).toBe(true)
      expect(editor.isEditorOpen.value).toBe(false)
      expect(editor.mode.value).toBe('create')
    })
  })
})
