import { computed, ref } from 'vue'

import type { NoteSort, NoteSortField } from '@/features/notes/types'

export function useFilters () {
  const query = ref('')
  const isDescending = ref(true)
  const sortField = ref<NoteSortField>('updated_at')

  const sort = computed<NoteSort>(() =>
    `${isDescending.value ? '-' : ''}${sortField.value}` as NoteSort
  )

  function setSortField (value: NoteSortField) {
    if (sortField.value === value) {
      return
    }

    sortField.value = value
  }

  function toggleDirection () {
    isDescending.value = !isDescending.value
  }

  return {
    isDescending,
    query,
    setSortField,
    sort,
    sortField,
    toggleDirection
  }
}
