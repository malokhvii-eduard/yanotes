import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { useFilters } from './useFilters'

describe('useFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('when filters are created', () => {
    test('should expose default search and sort values', () => {
      const filters = useFilters()

      expect(filters.query.value).toBe('')
      expect(filters.searchQuery.value).toBe('')
      expect(filters.sortField.value).toBe('updated_at')
      expect(filters.isDescending.value).toBe(true)
      expect(filters.sort.value).toBe('-updated_at')
    })
  })

  describe('when search query changes', () => {
    test('should debounce search value before exposing it', async () => {
      const filters = useFilters()

      filters.query.value = 'release notes'
      await nextTick()

      expect(filters.searchQuery.value).toBe('')

      await vi.advanceTimersByTimeAsync(250)

      expect(filters.searchQuery.value).toBe('release notes')
    })
  })

  describe('when sort field changes', () => {
    test('should update sort while keeping current direction', () => {
      const filters = useFilters()

      filters.setSortField('title')

      expect(filters.sortField.value).toBe('title')
      expect(filters.sort.value).toBe('-title')
    })
  })

  describe('when sort direction is toggled', () => {
    test('should switch sort between descending and ascending', () => {
      const filters = useFilters()

      filters.toggleDirection()

      expect(filters.isDescending.value).toBe(false)
      expect(filters.sort.value).toBe('updated_at')

      filters.toggleDirection()

      expect(filters.isDescending.value).toBe(true)
      expect(filters.sort.value).toBe('-updated_at')
    })
  })

  describe('when selected sort field is selected again', () => {
    test('should keep current sort value', () => {
      const filters = useFilters()

      filters.setSortField('updated_at')

      expect(filters.sortField.value).toBe('updated_at')
      expect(filters.sort.value).toBe('-updated_at')
    })
  })
})
