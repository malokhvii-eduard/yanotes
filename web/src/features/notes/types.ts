export interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  owner: number
}

export interface NoteInput {
  title: string
  content: string
  owner?: number
}

export type NoteSortField = 'updated_at' | 'title'
export type NoteSort = 'updated_at' | '-updated_at' | 'title' | '-title'
