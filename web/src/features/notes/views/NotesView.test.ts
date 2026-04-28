import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, expect, test, vi } from 'vitest'

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
    template: '<span />'
  },
  VMain: {
    template: '<section><slot /></section>'
  },
  VProgressCircular: {
    template: '<span />'
  },
  VProgressLinear: {
    template: '<span />'
  },
  VRow: {
    template: '<div><slot /></div>'
  },
  VSelect: {
    emits: ['update:modelValue'],
    props: ['items', 'label', 'modelValue'],
    template: '<select :aria-label="label" @change="$emit(\'update:modelValue\', $event.target.value)" />'
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
    template: '<span />'
  }
}))

vi.mock('vuetify/components/VMain', () => ({
  VMain: {
    template: '<section><slot /></section>'
  }
}))

vi.mock('vuetify/components/VProgressCircular', () => ({
  VProgressCircular: {
    template: '<span />'
  }
}))

vi.mock('vuetify/components/VProgressLinear', () => ({
  VProgressLinear: {
    template: '<span />'
  }
}))

vi.mock('vuetify/components/VSelect', () => ({
  VSelect: {
    emits: ['update:modelValue'],
    props: ['items', 'label', 'modelValue'],
    template: '<select :aria-label="label" @change="$emit(\'update:modelValue\', $event.target.value)" />'
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
    props: ['note'],
    template: '<article>{{ note.title }}</article>'
  }
}))

vi.mock('@/features/notes/components/NoteEditorDialog.vue', () => ({
  default: {
    template: '<div />'
  }
}))

vi.mock('@/shared/ui/ConfirmDialog.vue', () => ({
  default: {
    template: '<div />'
  }
}))

vi.mock('@/features/notes/composables/useActions', () => ({
  useActions: () => ({
    deleteCurrentNote: vi.fn(),
    error: ref(null),
    isLoading: ref(false),
    saveNote: vi.fn()
  })
}))

vi.mock('@/features/notes/composables/useEditor', () => ({
  useEditor: () => ({
    activeNote: ref(null),
    draftNote: ref(null),
    duplicate: vi.fn(),
    isDeleteConfirmOpen: ref(false),
    isEditorOpen: ref(false),
    mode: ref('create'),
    openCreate: vi.fn(),
    openDeleteConfirm: vi.fn(),
    openEdit: vi.fn()
  })
}))

vi.mock('@/features/notes/composables/useFilters', () => ({
  useFilters: () => ({
    isDescending: ref(true),
    query: ref(''),
    searchQuery: ref(''),
    setSortField: vi.fn(),
    sort: ref('-updated_at'),
    sortField: ref('updated_at'),
    toggleDirection: vi.fn()
  })
}))

vi.mock('@/features/notes/composables/useList', () => ({
  useList: () => ({
    fetchMoreOwners: vi.fn(),
    hasMoreOwners: ref(false),
    isLoading: ref(false),
    isLoadingMore: ref(false),
    isLoadingMoreOwners: ref(false),
    loadError: ref(null),
    notes: ref([]),
    owners: ref([]),
    refresh: vi.fn(),
    setLoadMoreAnchor: vi.fn(),
    showOwnerSelect: ref(false),
    total: ref(0)
  })
}))

function mountNotesView () {
  return mount(NotesView)
}

describe('NotesView', () => {
  describe('when logout button is clicked', () => {
    test('should logout current session', async () => {
      authSession.logout.mockResolvedValue(undefined)
      const wrapper = mountNotesView()

      await wrapper.find('.notes-bar__logout').trigger('click')

      expect(authSession.logout).toHaveBeenCalledOnce()
    })
  })
})
