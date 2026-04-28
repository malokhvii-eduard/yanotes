<script setup lang="ts">
import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import { createNoteSchema } from '@/features/notes/schemas'
import type { User } from '@/features/auth/types'
import type { Note, NoteInput } from '@/features/notes/types'
import { fieldErrorProps } from '@/shared/forms'

type NoteFormValues = {
  title: string
  content: string
  owner?: number
}

const model = defineModel<boolean>({ required: true })

const {
  currentUserId = undefined,
  draft = null,
  hasMoreOwners = false,
  isLoadingMoreOwners = false,
  isSaving = false,
  mode = 'create',
  note = null,
  owners = [],
  showOwnerSelect = false
} = defineProps<{
  currentUserId?: number
  draft?: NoteInput | null
  hasMoreOwners?: boolean
  isLoadingMoreOwners?: boolean
  isSaving?: boolean
  mode?: 'create' | 'edit'
  note?: Note | null
  owners?: User[]
  showOwnerSelect?: boolean
}>()

const emit = defineEmits<{
  'fetch-more-owners': []
  save: [payload: NoteInput]
}>()

function createInitialValues (): NoteFormValues {
  if (mode === 'edit' && note) {
    return {
      content: note.content,
      owner: note.owner,
      title: note.title
    }
  }

  return {
    content: draft?.content ?? '',
    owner: draft?.owner ?? currentUserId,
    title: draft?.title ?? ''
  }
}

const validationSchema = computed(() => toTypedSchema(createNoteSchema(showOwnerSelect)))

const { defineField, handleSubmit, resetForm } = useForm<NoteFormValues>({
  validationSchema,
  initialValues: createInitialValues()
})

const [title, titleProps] = defineField('title', fieldErrorProps)
const [content, contentProps] = defineField('content', fieldErrorProps)
const [owner, ownerProps] = defineField('owner', fieldErrorProps)

const isEditMode = computed(() => mode === 'edit')
const dialogTitle = computed(() => (isEditMode.value ? 'Edit note' : 'Create note'))
const actionLabel = computed(() => (isEditMode.value ? 'Save' : 'Create'))
const titleLength = computed(() => title.value.length)
const contentLength = computed(() => content.value.length)

watch(
  () => [model.value, note, draft, mode, currentUserId, showOwnerSelect] as const,
  ([isOpen]) => {
    if (!isOpen) {
      return
    }

    resetForm({
      values: createInitialValues()
    })
  },
  { immediate: true }
)

function closeDialog () {
  model.value = false
}

const submit = handleSubmit(values => {
  emit('save', {
    content: values.content.trim(),
    owner: values.owner,
    title: values.title.trim()
  })
})
</script>

<template>
  <v-dialog
    v-model="model"
    max-width="760"
    persistent
  >
    <v-card
      class="note-editor-dialog"
      elevation="0"
    >
      <v-card-title class="note-editor-dialog__title">
        {{ dialogTitle }}
      </v-card-title>

      <v-card-text class="note-editor-dialog__body">
        <v-form @submit.prevent="submit">
          <div class="d-flex flex-column ga-4">
            <div class="note-editor-dialog__field-wrap">
              <v-text-field
                v-model="title"
                v-bind="titleProps"
                class="note-editor-dialog__field"
                label="Title"
                maxlength="150"
                autofocus
                required
              />
              <div
                class="note-editor-dialog__counter"
                aria-live="polite"
              >
                {{ titleLength }}/150
              </div>
            </div>

            <div class="note-editor-dialog__field-wrap">
              <v-textarea
                v-model="content"
                v-bind="contentProps"
                class="note-editor-dialog__field note-editor-dialog__field--content note-editor-dialog__textarea"
                label="Content"
                rows="8"
                no-resize
              />
              <div
                class="note-editor-dialog__counter"
                aria-live="polite"
              >
                {{ contentLength }}
              </div>
            </div>

            <v-select
              v-if="showOwnerSelect"
              v-model="owner"
              v-bind="ownerProps"
              class="note-editor-dialog__field"
              label="Owner"
              :items="owners"
              item-title="username"
              item-value="id"
              required
            >
              <template
                v-if="hasMoreOwners"
                #append-item
              >
                <div class="note-editor-dialog__owner-actions">
                  <v-btn
                    class="note-editor-dialog__owner-more"
                    variant="text"
                    :loading="isLoadingMoreOwners"
                    @mousedown.prevent
                    @click.stop="emit('fetch-more-owners')"
                  >
                    More
                  </v-btn>
                </div>
              </template>
            </v-select>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="note-editor-dialog__actions">
        <v-spacer />
        <v-btn
          class="note-editor-dialog__cancel"
          variant="text"
          @click="closeDialog"
        >
          Close
        </v-btn>
        <v-btn
          class="note-editor-dialog__submit"
          color="primary"
          :loading="isSaving"
          @click="submit"
        >
          {{ actionLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
