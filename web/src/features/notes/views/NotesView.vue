<script setup lang="ts">
import { useQueryCache } from '@pinia/colada'
import { storeToRefs } from 'pinia'
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

import { createAuthSession } from '@/app/session'
import { useAuthStore } from '@/features/auth/store'
import NoteCard from '@/features/notes/components/NoteCard.vue'
import NoteEditorDialog from '@/features/notes/components/NoteEditorDialog.vue'
import { useActions } from '@/features/notes/composables/useActions'
import { useEditor } from '@/features/notes/composables/useEditor'
import { useFilters } from '@/features/notes/composables/useFilters'
import { useList } from '@/features/notes/composables/useList'
import {
  formatNoteCount,
  matchesNoteQuery,
  NOTE_SORT_OPTIONS
} from '@/features/notes/helpers'
import ConfirmDialog from '@/shared/ui/ConfirmDialog.vue'

const authStore = useAuthStore()
const queryCache = useQueryCache()
const router = useRouter()
const authSession = createAuthSession(authStore, queryCache)

const { currentUser, isAdmin } = storeToRefs(authStore)
const filtersState = useFilters()
const editorState = useEditor()
const listState = useList({
  canManageOwners: isAdmin,
  isEditorOpen: editorState.isEditorOpen,
  sort: filtersState.sort
})
const actionsState = useActions(editorState, () => listState.refresh())

const filters = reactive({
  ...filtersState,
  sortOptions: NOTE_SORT_OPTIONS,
  totalLabel: computed(() => formatNoteCount(listState.total.value))
})

const editor = reactive(editorState)
const actions = reactive(actionsState)

const list = reactive({
  ...listState,
  error: computed(() => actionsState.error.value ?? listState.loadError.value),
  filteredNotes: computed(() => {
    return listState.notes.value.filter(note => matchesNoteQuery(note, filtersState.query.value))
  }),
  isEmpty: computed(() => !listState.isLoading.value && listState.notes.value.length === 0)
})

async function logout () {
  await authSession.logout()
  await router.push({ name: 'login' })
}

const session = reactive({
  currentUser,
  logout
})
</script>

<template>
  <v-app>
    <v-app-bar
      color="surface"
      elevation="0"
      height="72"
      border="b"
    >
      <div class="w-100 px-4 px-sm-6 d-flex align-center ga-3">
        <div
          class="notes-bar__brand notes-brand"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 32 32"
            role="presentation"
          >
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="3"
            />
            <path d="M11 22V10.5h2.1l5.2 6.6v-6.6H21V22h-2l-5.3-6.8V22z" />
          </svg>
        </div>

        <v-spacer />

        <v-btn
          variant="text"
          prepend-icon="$logout"
          class="notes-bar__logout"
          @click="session.logout"
        >
          Logout
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <v-container class="py-5 py-sm-8 notes-shell">
        <div class="notes-header mb-5">
          <div class="notes-header__copy">
            <h1 class="notes-header__title">
              Notes
            </h1>
            <p class="notes-header__count">
              {{ filters.totalLabel }}
            </p>
          </div>
        </div>

        <div class="notes-controls mb-6">
          <v-text-field
            v-model="filters.query"
            label="Search notes"
            prepend-inner-icon="$magnify"
            class="notes-controls__search notes-controls__field"
          />

          <div class="notes-controls__sort-group">
            <v-select
              class="notes-toolbar__sort notes-controls__field"
              label="Sort"
              :items="filters.sortOptions"
              item-title="title"
              item-value="value"
              :model-value="filters.sortField"
              aria-label="Sort field"
              @update:model-value="filters.setSortField"
            />

            <v-btn
              class="notes-controls__direction"
              variant="text"
              :aria-label="filters.isDescending ? 'Descending order' : 'Ascending order'"
              @click="filters.toggleDirection"
            >
              <v-icon
                :icon="filters.isDescending ? '$sortDescending' : '$sortAscending'"
                size="20"
              />
            </v-btn>
          </div>
        </div>

        <v-alert
          v-if="list.error"
          type="error"
          :icon="false"
          variant="tonal"
          class="mb-6"
        >
          {{ list.error }}
        </v-alert>

        <v-progress-linear
          v-if="list.isLoading"
          color="primary"
          indeterminate
          rounded
          class="mb-6"
        />

        <v-row v-if="!list.isLoading && !list.isEmpty">
          <v-col
            v-for="note in list.filteredNotes"
            :key="note.id"
            cols="12"
            md="6"
            xl="4"
          >
            <NoteCard
              :note="note"
              @delete="editor.openDeleteConfirm"
              @duplicate="editor.duplicate"
              @edit="editor.openEdit"
            />
          </v-col>
        </v-row>

        <div
          v-else-if="!list.isLoading"
          class="notes-empty"
        >
          <h2 class="notes-empty__title">
            No notes
          </h2>
          <p class="notes-empty__copy">
            Create one.
          </p>
        </div>

        <div
          :ref="list.setLoadMoreAnchor"
          class="load-more-anchor"
          aria-hidden="true"
        />

        <div
          v-if="list.isLoadingMore"
          class="d-flex justify-center mt-6"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>
      </v-container>

      <NoteEditorDialog
        v-model="editor.isEditorOpen"
        :mode="editor.mode"
        :draft="editor.draftNote"
        :note="editor.activeNote"
        :is-saving="actions.isLoading"
        :owners="list.owners"
        :is-loading-more-owners="list.isLoadingMoreOwners"
        :has-more-owners="list.hasMoreOwners"
        :show-owner-select="list.showOwnerSelect"
        :current-user-id="session.currentUser?.id"
        @fetch-more-owners="list.fetchMoreOwners"
        @save="actions.saveNote"
      />

      <ConfirmDialog
        v-model="editor.isDeleteConfirmOpen"
        title="Delete note"
        text="This can’t be undone."
        confirm-label="Delete"
        :loading="actions.isLoading"
        @confirm="actions.deleteCurrentNote"
      />

      <v-btn
        class="notes-fab"
        color="primary"
        icon="$plus"
        aria-label="Create note"
        @click="editor.openCreate"
      />
    </v-main>
  </v-app>
</template>
