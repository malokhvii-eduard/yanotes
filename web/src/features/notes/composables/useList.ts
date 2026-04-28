import { computed, ref, toValue, watch, type ComponentPublicInstance, type MaybeRefOrGetter } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

import {
  useNoteOwnerQuery,
  useNoteOwnersInfiniteQuery,
  useNotesInfiniteQuery
} from '@/features/notes/queries'
import { getErrorMessage } from '@/shared/errors'
import {
  flattenOffsetPages,
  getOffsetPaginationTotal
} from '@/shared/api'
import type { User } from '@/features/auth/types'
import type { NoteSort } from '@/features/notes/types'

type UseListOptions = {
  canManageOwners: MaybeRefOrGetter<boolean>
  isEditorOpen: MaybeRefOrGetter<boolean>
  ownerId: MaybeRefOrGetter<number | undefined>
  search: MaybeRefOrGetter<string>
  sort: MaybeRefOrGetter<NoteSort>
}

function createPendingOwner (ownerId: number): User {
  return {
    email: '',
    first_name: '',
    id: ownerId,
    is_staff: false,
    last_name: '',
    username: 'Loading owner...'
  }
}

export function useList (options: UseListOptions) {
  const loadMoreAnchor = ref<HTMLElement | null>(null)
  const canManageOwners = computed(() => toValue(options.canManageOwners))
  const isEditorOpen = computed(() => toValue(options.isEditorOpen))
  const ownerId = computed(() => toValue(options.ownerId))
  const canLoadOwners = computed(() => isEditorOpen.value && canManageOwners.value)

  const notesQuery = useNotesInfiniteQuery(options.sort, options.search)
  const ownerQuery = useNoteOwnersInfiniteQuery(canLoadOwners)
  const selectedOwnerQuery = useNoteOwnerQuery(ownerId, computed(() => (
    canLoadOwners.value &&
    typeof ownerId.value === 'number'
  )))

  const hasLoadedNotes = computed(() => Boolean(notesQuery.data.value?.pages.length))
  const hasMoreNotes = computed(() => notesQuery.hasNextPage.value)
  const notes = computed(() => flattenOffsetPages(notesQuery.data.value))
  const total = computed(() => getOffsetPaginationTotal(notesQuery.data.value))
  const owners = computed(() => {
    const paginatedOwners = flattenOffsetPages(ownerQuery.data.value)
    const selectedOwner = selectedOwnerQuery.data.value

    if (!ownerId.value || paginatedOwners.some(owner => owner.id === ownerId.value)) {
      return paginatedOwners
    }

    return [
      selectedOwner ?? createPendingOwner(ownerId.value),
      ...paginatedOwners
    ]
  })
  const isLoading = computed(() => notesQuery.isPending.value && !hasLoadedNotes.value)
  const isLoadingMore = computed(() => notesQuery.isLoading.value && !notesQuery.isPending.value)
  const isLoadingMoreOwners = computed(() => ownerQuery.isLoading.value && !ownerQuery.isPending.value)
  const showOwnerSelect = computed(() => canManageOwners.value && ownerQuery.state.value.status === 'success')
  const hasMoreOwners = computed(() => showOwnerSelect.value && ownerQuery.hasNextPage.value)
  const needsFirstLoad = computed(() => (
    notesQuery.isPending.value &&
    !notesQuery.isLoading.value &&
    !hasLoadedNotes.value
  ))
  const loadError = computed(() => (
    notesQuery.error.value ?
      getErrorMessage(notesQuery.error.value, 'Unable to load notes.') :
      null
  ))

  watch(
    needsFirstLoad,
    shouldLoad => {
      if (!shouldLoad) {
        return
      }

      void notesQuery.refresh()
    },
    { immediate: true }
  )

  function setLoadMoreAnchor (element: Element | ComponentPublicInstance | null) {
    loadMoreAnchor.value = element instanceof HTMLElement ? element : null
  }

  async function fetchMoreOwners () {
    if (!canManageOwners.value || !ownerQuery.hasNextPage.value || ownerQuery.isLoading.value) {
      return
    }

    try {
      await ownerQuery.loadNextPage({
        cancelRefetch: false
      })
    } catch {
      // The dialog can still operate without loading more owners.
    }
  }

  useIntersectionObserver(
    loadMoreAnchor,
    ([entry]) => {
      if (!entry?.isIntersecting || !hasMoreNotes.value || notesQuery.isLoading.value) {
        return
      }

      void notesQuery.loadNextPage({
        cancelRefetch: false
      })
    },
    {
      rootMargin: '160px'
    }
  )

  return {
    fetchMoreOwners,
    hasMoreOwners,
    isLoading,
    isLoadingMore,
    isLoadingMoreOwners,
    loadError,
    notes,
    owners,
    refresh: () => notesQuery.refresh(),
    setLoadMoreAnchor,
    showOwnerSelect,
    total
  }
}
