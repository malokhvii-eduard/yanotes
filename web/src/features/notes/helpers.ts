import type { Note, NoteInput, NoteSortField } from '@/features/notes/types'

export const NOTE_SORT_OPTIONS = [
  { title: 'Last updated', value: 'updated_at' },
  { title: 'Title', value: 'title' }
] as const satisfies ReadonlyArray<{ title: string; value: NoteSortField }>

function normalizeQuery (value: string) {
  return value.trim().toLowerCase()
}

export function matchesNoteQuery (note: Note, query: string) {
  const normalizedQuery = normalizeQuery(query)

  if (!normalizedQuery) {
    return true
  }

  const searchText = `${note.title} ${note.content}`.toLowerCase()

  return searchText.includes(normalizedQuery)
}

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
