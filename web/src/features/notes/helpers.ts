import type { Note, NoteInput, NoteSortField } from '@/features/notes/types'

export const NOTE_SORT_OPTIONS = [
  { title: 'Last updated', value: 'updated_at' },
  { title: 'Title', value: 'title' }
] as const satisfies ReadonlyArray<{ title: string; value: NoteSortField }>

export function createNoteDraft (note: Note): NoteInput {
  return {
    content: note.content,
    owner: note.owner,
    title: note.title
  }
}

export function formatNoteCount (count: number) {
  return `${count} ${count === 1 ? 'note' : 'notes'}`
}
