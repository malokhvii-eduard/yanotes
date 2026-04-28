import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import NotesView from './NotesView.vue'

const authSession = vi.hoisted(() => ({
  logout: vi.fn()
}))

const authStore = vi.hoisted(() => ({
  currentUser: {
    email: 'user@example.com',
    first_name: 'Test',
    id: 1,
    is_staff: false,
    last_name: 'User',
    username: 'test-user'
  },
  isAdmin: false
}))

const note = vi.hoisted(() => ({
  content: 'Note content',
  created_at: '2026-04-28T08:00:00Z',
  id: 7,
  owner: 1,
  title: 'Note title',
  updated_at: '2026-04-28T09:00:00Z'
}))

const actionsState = vi.hoisted(() => ({
  deleteCurrentNote: vi.fn(),
  saveNote: vi.fn()
}))

const editorState = vi.hoisted(() => ({
  duplicate: vi.fn(),
  openCreate: vi.fn(),
  openDeleteConfirm: vi.fn(),
  openEdit: vi.fn()
}))

const filtersState = vi.hoisted(() => ({
  isDescending: true,
  query: '',
  searchQuery: '',
  setSortField: vi.fn(),
  sort: '-updated_at',
  sortField: 'updated_at',
  toggleDirection: vi.fn()
}))

const listState = vi.hoisted(() => ({
  fetchMoreOwners: vi.fn(),
  hasMoreOwners: false,
  isLoading: false,
  isLoadingMore: false,
  isLoadingMoreOwners: false,
  loadError: null as string | null,
  notes: [] as typeof note[],
  owners: [],
  refresh: vi.fn(),
  showOwnerSelect: false,
  total: 0
}))

const actionsError = vi.hoisted(() => ({
  value: null as string | null
}))

vi.mock('vuetify/components', () => ({
  VAlert: {
    template: '<div role="alert"><slot /></div>'
  },
  VApp: {
    template: '<div><slot /></div>'
  },
  VAppBar: {
    template: '<header><slot /></header>'
  },
  VBtn: {
    emits: ['click'],
    props: ['ariaLabel', 'icon', 'loading'],
    template: [
      '<button',
      '  :aria-label="ariaLabel"',
      '  type="button"',
      '  @click="$emit(\'click\', $event)"',
      '>',
      '<slot />',
      '</button>'
    ].join('')
  },
  VCol: {
    template: '<div><slot /></div>'
  },
  VContainer: {
    template: '<main><slot /></main>'
  },
  VIcon: {
    props: ['icon'],
    template: '<span class="v-icon">{{ icon }}</span>'
  },
  VMain: {
    template: '<section><slot /></section>'
  },
  VProgressCircular: {
    template: '<span class="progress-circular" />'
  },
  VProgressLinear: {
    template: '<span class="progress-linear" />'
  },
  VRow: {
    template: '<div><slot /></div>'
  },
  VSelect: {
    emits: ['update:modelValue'],
    props: ['items', 'label', 'modelValue'],
    template: [
      '<select :aria-label="label" @change="$emit(\'update:modelValue\', $event.target.value)">',
      '<option v-for="item in items" :key="item.value" :value="item.value">{{ item.title }}</option>',
      '</select>'
    ].join('')
  },
  VSpacer: {
    template: '<span />'
  },
  VTextField: {
    emits: ['update:modelValue'],
    props: ['label', 'modelValue'],
    template: '<input :aria-label="label" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">'
  }
}))

vi.mock('vuetify/components/VAlert', () => ({
  VAlert: {
    template: '<div role="alert"><slot /></div>'
  }
}))

vi.mock('vuetify/components/VApp', () => ({
  VApp: {
    template: '<div><slot /></div>'
  }
}))

vi.mock('vuetify/components/VAppBar', () => ({
  VAppBar: {
    template: '<header><slot /></header>'
  }
}))

vi.mock('vuetify/components/VBtn', () => ({
  VBtn: {
    emits: ['click'],
    props: ['ariaLabel', 'icon', 'loading'],
    template: [
      '<button',
      '  :aria-label="ariaLabel"',
      '  type="button"',
      '  @click="$emit(\'click\', $event)"',
      '>',
      '<slot />',
      '</button>'
    ].join('')
  }
}))

vi.mock('vuetify/components/VGrid', () => ({
  VCol: {
    template: '<div><slot /></div>'
  },
  VContainer: {
    template: '<main><slot /></main>'
  },
  VRow: {
    template: '<div><slot /></div>'
  },
  VSpacer: {
    template: '<span />'
  }
}))

vi.mock('vuetify/components/VIcon', () => ({
  VIcon: {
    props: ['icon'],
    template: '<span class="v-icon">{{ icon }}</span>'
  }
}))

vi.mock('vuetify/components/VMain', () => ({
  VMain: {
    template: '<section><slot /></section>'
  }
}))

vi.mock('vuetify/components/VProgressCircular', () => ({
  VProgressCircular: {
    template: '<span class="progress-circular" />'
  }
}))

vi.mock('vuetify/components/VProgressLinear', () => ({
  VProgressLinear: {
    template: '<span class="progress-linear" />'
  }
}))

vi.mock('vuetify/components/VSelect', () => ({
  VSelect: {
    emits: ['update:modelValue'],
    props: ['items', 'label', 'modelValue'],
    template: [
      '<select :aria-label="label" @change="$emit(\'update:modelValue\', $event.target.value)">',
      '<option v-for="item in items" :key="item.value" :value="item.value">{{ item.title }}</option>',
      '</select>'
    ].join('')
  }
}))

vi.mock('vuetify/components/VTextField', () => ({
  VTextField: {
    emits: ['update:modelValue'],
    props: ['label', 'modelValue'],
    template: '<input :aria-label="label" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)">'
  }
}))

vi.mock('@pinia/colada', () => ({
  useQueryCache: () => ({})
}))

vi.mock('pinia', () => ({
  storeToRefs: () => ({
    currentUser: ref(authStore.currentUser),
    isAdmin: ref(authStore.isAdmin)
  })
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({})
}))

vi.mock('@/app/session', () => ({
  createAuthSession: () => authSession
}))

vi.mock('@/features/auth/store', () => ({
  useAuthStore: () => authStore
}))

vi.mock('@/features/notes/components/NoteCard.vue', () => ({
  default: {
    emits: ['delete', 'duplicate', 'edit'],
    props: ['note'],
    template: [
      '<article>',
      '<h2>{{ note.title }}</h2>',
      '<button class="note-card-edit" type="button" @click="$emit(\'edit\', note)">Edit</button>',
      '<button class="note-card-duplicate" type="button" @click="$emit(\'duplicate\', note)">Copy</button>',
      '<button class="note-card-delete" type="button" @click="$emit(\'delete\', note)">Delete</button>',
      '</article>'
    ].join('')
  }
}))

vi.mock('@/features/notes/components/NoteEditorDialog.vue', () => ({
  default: {
    emits: ['fetch-more-owners', 'save'],
    template: [
      '<div>',
      '<button',
      '  class="note-editor-save"',
      '  type="button"',
      '  @click="$emit(\'save\', { title: \'Saved note\', content: \'Saved content\', owner: 1 })"',
      '>',
      'Save',
      '</button>',
      '<button',
      '  class="note-editor-fetch-more-owners"',
      '  type="button"',
      '  @click="$emit(\'fetch-more-owners\')"',
      '>',
      'Fetch more owners',
      '</button>',
      '</div>'
    ].join('')
  }
}))

vi.mock('@/shared/ui/ConfirmDialog.vue', () => ({
  default: {
    emits: ['confirm'],
    template: '<button class="confirm-dialog-confirm" type="button" @click="$emit(\'confirm\')">Confirm</button>'
  }
}))

vi.mock('@/features/notes/composables/useActions', () => ({
  useActions: () => ({
    deleteCurrentNote: actionsState.deleteCurrentNote,
    error: ref(actionsError.value),
    isLoading: ref(false),
    saveNote: actionsState.saveNote
  })
}))

vi.mock('@/features/notes/composables/useEditor', () => ({
  useEditor: () => ({
    activeNote: ref(null),
    draftNote: ref(null),
    duplicate: editorState.duplicate,
    isDeleteConfirmOpen: ref(false),
    isEditorOpen: ref(false),
    mode: ref('create'),
    openCreate: editorState.openCreate,
    openDeleteConfirm: editorState.openDeleteConfirm,
    openEdit: editorState.openEdit
  })
}))

vi.mock('@/features/notes/composables/useFilters', () => ({
  useFilters: () => ({
    isDescending: ref(filtersState.isDescending),
    query: ref(filtersState.query),
    searchQuery: ref(filtersState.searchQuery),
    setSortField: filtersState.setSortField,
    sort: ref(filtersState.sort),
    sortField: ref(filtersState.sortField),
    toggleDirection: filtersState.toggleDirection
  })
}))

vi.mock('@/features/notes/composables/useList', () => ({
  useList: () => ({
    fetchMoreOwners: listState.fetchMoreOwners,
    hasMoreOwners: ref(listState.hasMoreOwners),
    isLoading: ref(listState.isLoading),
    isLoadingMore: ref(listState.isLoadingMore),
    isLoadingMoreOwners: ref(listState.isLoadingMoreOwners),
    loadError: ref(listState.loadError),
    notes: ref(listState.notes),
    owners: ref(listState.owners),
    refresh: listState.refresh,
    setLoadMoreAnchor: vi.fn(),
    showOwnerSelect: ref(listState.showOwnerSelect),
    total: ref(listState.total)
  })
}))

function mountNotesView () {
  return mount(NotesView)
}

describe('NotesView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    actionsError.value = null
    filtersState.isDescending = true
    filtersState.query = ''
    filtersState.searchQuery = ''
    filtersState.sort = '-updated_at'
    filtersState.sortField = 'updated_at'
    listState.hasMoreOwners = false
    listState.isLoading = false
    listState.isLoadingMore = false
    listState.isLoadingMoreOwners = false
    listState.loadError = null
    listState.notes = []
    listState.owners = []
    listState.showOwnerSelect = false
    listState.total = 0
  })

  describe('when logout button is clicked', () => {
    test('should logout current session', async () => {
      authSession.logout.mockResolvedValue(undefined)
      const wrapper = mountNotesView()

      await wrapper.find('.notes-bar__logout').trigger('click')

      expect(authSession.logout).toHaveBeenCalledOnce()
    })
  })

  describe('when note card actions are clicked', () => {
    test('should forward note actions to editor state', async () => {
      listState.notes = [note]
      const wrapper = mountNotesView()

      await wrapper.find('.note-card-edit').trigger('click')
      await wrapper.find('.note-card-duplicate').trigger('click')
      await wrapper.find('.note-card-delete').trigger('click')

      expect(editorState.openEdit).toHaveBeenCalledWith(note)
      expect(editorState.duplicate).toHaveBeenCalledWith(note)
      expect(editorState.openDeleteConfirm).toHaveBeenCalledWith(note)
    })
  })

  describe('when dialog and create actions are triggered', () => {
    test('should forward events to list, action, and editor state', async () => {
      const wrapper = mountNotesView()
      const payload = {
        content: 'Saved content',
        owner: 1,
        title: 'Saved note'
      }

      await wrapper.find('.note-editor-save').trigger('click')
      await wrapper.find('.note-editor-fetch-more-owners').trigger('click')
      await wrapper.find('.confirm-dialog-confirm').trigger('click')
      await wrapper.find('.notes-fab').trigger('click')

      expect(actionsState.saveNote).toHaveBeenCalledWith(payload)
      expect(listState.fetchMoreOwners).toHaveBeenCalledOnce()
      expect(actionsState.deleteCurrentNote).toHaveBeenCalledOnce()
      expect(editorState.openCreate).toHaveBeenCalledOnce()
    })
  })

  describe('when sort controls are used', () => {
    test('should forward sort field and direction changes', async () => {
      filtersState.isDescending = false
      const wrapper = mountNotesView()

      await wrapper.find('select').setValue('title')
      await wrapper.find('.notes-controls__direction').trigger('click')

      expect(filtersState.setSortField).toHaveBeenCalledWith('title')
      expect(filtersState.toggleDirection).toHaveBeenCalledOnce()
      expect(wrapper.find('.notes-controls__direction').attributes('aria-label')).toBe('Ascending order')
      expect(wrapper.find('.v-icon').text()).toBe('$sortAscending')
    })
  })

  describe('when notes are loading', () => {
    test('should show loading progress without empty state', () => {
      listState.isLoading = true
      const wrapper = mountNotesView()

      expect(wrapper.find('.progress-linear').exists()).toBe(true)
      expect(wrapper.find('.notes-empty').exists()).toBe(false)
    })
  })

  describe('when loading more notes', () => {
    test('should show incremental loading progress', () => {
      listState.isLoadingMore = true
      const wrapper = mountNotesView()

      expect(wrapper.find('.progress-circular').exists()).toBe(true)
    })
  })

  describe('when loading notes fails', () => {
    test('should show list error message', () => {
      listState.loadError = 'Could not load notes'
      const wrapper = mountNotesView()

      expect(wrapper.get('[role="alert"]').text()).toContain('Could not load notes')
    })
  })

  describe('when note action fails', () => {
    test('should prefer action error message', () => {
      actionsError.value = 'Could not save note'
      listState.loadError = 'Could not load notes'
      const wrapper = mountNotesView()

      expect(wrapper.get('[role="alert"]').text()).toContain('Could not save note')
    })
  })
})
