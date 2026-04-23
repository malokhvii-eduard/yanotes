const DEFAULT_API_BASE_URL = '/api'
const DEFAULT_NOTES_PAGE_SIZE = 12
const DEFAULT_NOTE_OWNERS_PAGE_SIZE = 20

function readStringEnv (value: string | undefined, fallback: string) {
  const normalized = value?.trim()
  return normalized ? normalized : fallback
}

function readPositiveIntegerEnv (value: string | undefined, fallback: number) {
  const nextValue = Number.parseInt(value ?? '', 10)

  if (!Number.isInteger(nextValue) || nextValue <= 0) {
    return fallback
  }

  return nextValue
}

export const appEnv = Object.freeze({
  apiBaseUrl: readStringEnv(
    import.meta.env.VITE_API_BASE_URL,
    DEFAULT_API_BASE_URL
  ),
  noteOwnersPageSize: readPositiveIntegerEnv(
    import.meta.env.VITE_NOTE_OWNERS_PAGE_SIZE,
    DEFAULT_NOTE_OWNERS_PAGE_SIZE
  ),
  notesPageSize: readPositiveIntegerEnv(
    import.meta.env.VITE_NOTES_PAGE_SIZE,
    DEFAULT_NOTES_PAGE_SIZE
  )
})
