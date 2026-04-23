<script setup lang="ts">
import { computed } from 'vue'

import { formatDate } from '@/shared/format'
import type { Note } from '@/features/notes/types'

const props = defineProps<{
  note: Note
}>()

const emit = defineEmits<{
  delete: [note: Note]
  duplicate: [note: Note]
  edit: [note: Note]
}>()

const MAX_PREVIEW_LENGTH = 220

const hasContent = computed(() => Boolean(props.note.content?.trim()))
const previewContent = computed(() => {
  const text = props.note.content?.trim()

  if (!text) {
    return ''
  }

  const normalized = text.replace(/\s+/g, ' ').trim()

  if (normalized.length <= MAX_PREVIEW_LENGTH) {
    return normalized
  }

  return `${normalized
    .slice(0, MAX_PREVIEW_LENGTH)
    .trimEnd()
    .replace(/[.,;:!?-]*$/, '')
    .trimEnd()}...`
})
</script>

<template>
  <v-card
    class="note-card d-flex flex-column"
    elevation="0"
    border
  >
    <v-card-item class="note-card__header align-start">
      <template #append>
        <v-menu
          location="bottom end"
          :offset="12"
          content-class="note-card__menu-panel"
        >
          <template #activator="{ props: menuProps }">
            <button
              type="button"
              class="note-card__menu-trigger"
              aria-label="Open note actions"
              v-bind="menuProps"
            >
              <v-icon
                icon="$dotsVertical"
                size="16"
              />
            </button>
          </template>

          <v-list
            class="note-card__menu-list"
            density="compact"
            min-width="104"
          >
            <v-list-item
              class="note-card__menu-item"
              @click="emit('edit', note)"
            >
              <div class="note-card__menu-action">
                <v-icon
                  icon="$pencilOutline"
                  size="16"
                />
                <v-list-item-title>Edit</v-list-item-title>
              </div>
            </v-list-item>
            <v-list-item
              class="note-card__menu-item"
              @click="emit('duplicate', note)"
            >
              <div class="note-card__menu-action">
                <v-icon
                  icon="$contentCopy"
                  size="16"
                />
                <v-list-item-title>Copy</v-list-item-title>
              </div>
            </v-list-item>
            <v-list-item
              class="note-card__menu-item"
              @click="emit('delete', note)"
            >
              <div class="note-card__menu-action">
                <v-icon
                  icon="$deleteOutline"
                  size="16"
                />
                <v-list-item-title>Delete</v-list-item-title>
              </div>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <div class="w-100 px-0">
        <div class="note-card__meta mb-3">
          <span>{{ formatDate(note.updated_at) }}</span>
        </div>

        <v-card-title class="px-0 note-card__title">
          {{ note.title }}
        </v-card-title>
      </div>
    </v-card-item>

    <v-card-text
      v-if="hasContent"
      class="pt-1 note-card__content"
    >
      <span class="note-card__content-copy">{{ previewContent }}</span>
    </v-card-text>

    <div
      v-else
      class="note-card__content-gap"
      aria-hidden="true"
    />
  </v-card>
</template>
