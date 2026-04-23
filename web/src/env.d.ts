/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_NOTES_PAGE_SIZE?: string
  readonly VITE_NOTE_OWNERS_PAGE_SIZE?: string
}

declare module 'vuetify/styles'
