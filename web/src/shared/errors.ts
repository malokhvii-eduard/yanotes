import axios from 'axios'

import type { ApiError } from '@/shared/api/types'

export function getErrorMessage (error: unknown, fallback = 'Something went wrong.') {
  if (axios.isAxiosError<ApiError>(error)) {
    const data = error.response?.data

    if (typeof data?.detail === 'string' && data.detail) {
      return data.detail
    }

    if (data) {
      const firstEntry = Object.values(data).find(value => {
        return (Array.isArray(value) && value.length > 0) || typeof value === 'string'
      })

      if (Array.isArray(firstEntry)) {
        return firstEntry[0] ?? fallback
      }

      if (typeof firstEntry === 'string') {
        return firstEntry
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
