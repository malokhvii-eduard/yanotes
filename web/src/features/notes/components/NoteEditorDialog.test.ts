import { mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'

import type { User } from '@/features/auth/types'
import type { Note } from '@/features/notes/types'

import NoteEditorDialog from './NoteEditorDialog.vue'

vi.mock('vuetify/components', () => ({
  VBtn: {
    props: ['loading'],
    template: '<button type="button"><slot /></button>'
  },
  VCard: {
    template: '<section><slot /></section>'
  },
  VCardActions: {
    template: '<footer><slot /></footer>'
  },
  VCardText: {
    template: '<div><slot /></div>'
  },
  VCardTitle: {
    template: '<h2><slot /></h2>'
  },
  VDialog: {
    props: ['modelValue'],
    template: '<div v-if="modelValue"><slot /></div>'
  },
  VForm: {
    template: '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>'
  },
  VSelect: {
    emits: ['update:modelValue'],
    props: [
      'errorMessages',
      'itemTitle',
      'itemValue',
      'items',
      'label',
      'modelValue',
      'required'
    ],
    template: [
      '<label>',
      '<span>{{ label }}</span>',
      '<select',
      '  :required="required"',
      '  :value="modelValue"',
      '  @change="$emit(\'update:modelValue\', Number($event.target.value))"',
      '>',
      '<option',
      '  v-for="item in items"',
      '  :key="item[itemValue]"',
      '  :value="item[itemValue]"',
      '>',
      '  {{ item[itemTitle] }}',
      '</option>',
      '</select>',
      '<span',
      '  v-for="message in errorMessages || []"',
      '  :key="message"',
      '  class="field-error"',
      '>',
      '  {{ message }}',
      '</span>',
      '<slot name="append-item" />',
      '</label>'
    ].join('')
  },
  VSpacer: {
    template: '<span />'
  },
  VTextarea: {
    emits: ['update:modelValue'],
    props: ['errorMessages', 'label', 'modelValue'],
    template: [
      '<label>',
      '<span>{{ label }}</span>',
      '<textarea',
      '  :value="modelValue"',
      '  @input="$emit(\'update:modelValue\', $event.target.value)"',
      '/>',
      '</label>'
    ].join('')
  },
  VTextField: {
    emits: ['update:modelValue'],
    props: ['errorMessages', 'label', 'modelValue', 'required'],
    template: [
      '<label>',
      '<span>{{ label }}</span>',
      '<input',
      '  :required="required"',
      '  :value="modelValue"',
      '  @input="$emit(\'update:modelValue\', $event.target.value)"',
      '/>',
      '<span',
      '  v-for="message in errorMessages || []"',
      '  :key="message"',
      '  class="field-error"',
      '>',
      '  {{ message }}',
      '</span>',
      '</label>'
    ].join('')
  }
}))

vi.mock('vuetify/components/VBtn', () => ({
  VBtn: {
    props: ['loading'],
    template: '<button type="button"><slot /></button>'
  }
}))

vi.mock('vuetify/components/VCard', () => ({
  VCard: {
    template: '<section><slot /></section>'
  },
  VCardActions: {
    template: '<footer><slot /></footer>'
  },
  VCardText: {
    template: '<div><slot /></div>'
  },
  VCardTitle: {
    template: '<h2><slot /></h2>'
  }
}))

vi.mock('vuetify/components/VCardActions', () => ({
  VCardActions: {
    template: '<footer><slot /></footer>'
  }
}))

vi.mock('vuetify/components/VCardText', () => ({
  VCardText: {
    template: '<div><slot /></div>'
  }
}))

vi.mock('vuetify/components/VCardTitle', () => ({
  VCardTitle: {
    template: '<h2><slot /></h2>'
  }
}))

vi.mock('vuetify/components/VDialog', () => ({
  VDialog: {
    props: ['modelValue'],
    template: '<div v-if="modelValue"><slot /></div>'
  }
}))

vi.mock('vuetify/components/VForm', () => ({
  VForm: {
    template: '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>'
  }
}))

vi.mock('vuetify/components/VGrid', () => ({
  VSpacer: {
    template: '<span />'
  }
}))

vi.mock('vuetify/components/VSelect', () => ({
  VSelect: {
    emits: ['update:modelValue'],
    props: [
      'errorMessages',
      'itemTitle',
      'itemValue',
      'items',
      'label',
      'modelValue',
      'required'
    ],
    template: [
      '<label>',
      '<span>{{ label }}</span>',
      '<select',
      '  :required="required"',
      '  :value="modelValue"',
      '  @change="$emit(\'update:modelValue\', Number($event.target.value))"',
      '>',
      '<option',
      '  v-for="item in items"',
      '  :key="item[itemValue]"',
      '  :value="item[itemValue]"',
      '>',
      '  {{ item[itemTitle] }}',
      '</option>',
      '</select>',
      '<span',
      '  v-for="message in errorMessages || []"',
      '  :key="message"',
      '  class="field-error"',
      '>',
      '  {{ message }}',
      '</span>',
      '<slot name="append-item" />',
      '</label>'
    ].join('')
  }
}))

vi.mock('vuetify/components/VSpacer', () => ({
  VSpacer: {
    template: '<span />'
  }
}))

vi.mock('vuetify/components/VTextarea', () => ({
  VTextarea: {
    emits: ['update:modelValue'],
    props: ['errorMessages', 'label', 'modelValue'],
    template: [
      '<label>',
      '<span>{{ label }}</span>',
      '<textarea',
      '  :value="modelValue"',
      '  @input="$emit(\'update:modelValue\', $event.target.value)"',
      '/>',
      '</label>'
    ].join('')
  }
}))

vi.mock('vuetify/components/VTextField', () => ({
  VTextField: {
    emits: ['update:modelValue'],
    props: ['errorMessages', 'label', 'modelValue', 'required'],
    template: [
      '<label>',
      '<span>{{ label }}</span>',
      '<input',
      '  :required="required"',
      '  :value="modelValue"',
      '  @input="$emit(\'update:modelValue\', $event.target.value)"',
      '/>',
      '<span',
      '  v-for="message in errorMessages || []"',
      '  :key="message"',
      '  class="field-error"',
      '>',
      '  {{ message }}',
      '</span>',
      '</label>'
    ].join('')
  }
}))

const owners: User[] = [
  {
    email: 'owner-1@example.com',
    first_name: 'Owner',
    id: 1,
    is_staff: false,
    last_name: 'One',
    username: 'owner-one'
  },
  {
    email: 'owner-2@example.com',
    first_name: 'Owner',
    id: 2,
    is_staff: false,
    last_name: 'Two',
    username: 'owner-two'
  }
]

const note: Note = {
  content: 'Existing content',
  created_at: '2026-04-28T08:00:00Z',
  id: 7,
  owner: 2,
  title: 'Existing title',
  updated_at: '2026-04-28T09:00:00Z'
}

function mountNoteEditorDialog (
  props: Partial<InstanceType<typeof NoteEditorDialog>['$props']> = {}
) {
  return mount(NoteEditorDialog, {
    props: {
      currentUserId: 1,
      modelValue: true,
      ...props
    }
  })
}

describe('NoteEditorDialog', () => {
  describe('when owner select is hidden', () => {
    test('should not render owner select', () => {
      const wrapper = mountNoteEditorDialog({
        owners,
        showOwnerSelect: false
      })

      expect(wrapper.find('select').exists()).toBe(false)
    })
  })

  describe('when owner select is visible', () => {
    test('should submit selected owner with note payload', async () => {
      const wrapper = mountNoteEditorDialog({
        owners,
        showOwnerSelect: true
      })

      await wrapper.find('input').setValue('  Admin note  ')
      await wrapper.find('textarea').setValue('  Visible to owner  ')
      await wrapper.find('select').setValue('2')
      await wrapper.find('.note-editor-dialog__submit').trigger('click')

      await vi.waitFor(() => {
        expect(wrapper.emitted('save')?.[0]).toEqual([
          {
            content: 'Visible to owner',
            owner: 2,
            title: 'Admin note'
          }
        ])
      })
    })
  })

  describe('when title is blank', () => {
    test('should show validation error and skip save', async () => {
      const wrapper = mountNoteEditorDialog()

      await wrapper.find('input').setValue('   ')
      await wrapper.find('textarea').setValue('Content')
      await wrapper.find('.note-editor-dialog__submit').trigger('click')

      await vi.waitFor(() => {
        expect(wrapper.text()).toContain('Title is required')
      })
      expect(wrapper.emitted('save')).toBeUndefined()
    })
  })

  describe('when admin owner is missing', () => {
    test('should show validation error and skip save', async () => {
      const wrapper = mountNoteEditorDialog({
        currentUserId: undefined,
        owners,
        showOwnerSelect: true
      })

      await wrapper.find('input').setValue('Admin note')
      await wrapper.find('textarea').setValue('Content')
      await wrapper.find('.note-editor-dialog__submit').trigger('click')

      await vi.waitFor(() => {
        expect(wrapper.text()).toContain('Owner is required')
      })
      expect(wrapper.emitted('save')).toBeUndefined()
    })
  })

  describe('when more owners can be loaded', () => {
    test('should request the next owners page', async () => {
      const wrapper = mountNoteEditorDialog({
        hasMoreOwners: true,
        owners,
        showOwnerSelect: true
      })

      expect(wrapper.find('.note-editor-dialog__owner-more').text()).toBe('More')

      await wrapper.find('.note-editor-dialog__owner-more').trigger('click')

      expect(wrapper.emitted('fetch-more-owners')).toHaveLength(1)
    })
  })

  describe('when editing a note with owner', () => {
    test('should initialize owner select from active note', () => {
      const wrapper = mountNoteEditorDialog({
        mode: 'edit',
        note,
        owners,
        showOwnerSelect: true
      })

      expect(wrapper.find('select').element.value).toBe(String(note.owner))
    })
  })
})
