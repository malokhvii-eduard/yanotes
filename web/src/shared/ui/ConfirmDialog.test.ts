import { mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'

import ConfirmDialog from './ConfirmDialog.vue'

vi.mock('vuetify/components', () => ({
  VBtn: {
    emits: ['click'],
    props: ['loading'],
    template: [
      '<button',
      '  :data-loading="loading ? \'true\' : \'false\'"',
      '  type="button"',
      '  @click="$emit(\'click\', $event)"',
      '>',
      '<slot />',
      '</button>'
    ].join('')
  },
  VCard: {
    template: '<section><slot /></section>'
  },
  VCardActions: {
    template: '<footer><slot /></footer>'
  },
  VCardText: {
    template: '<p><slot /></p>'
  },
  VCardTitle: {
    template: '<h2><slot /></h2>'
  },
  VDialog: {
    emits: ['update:modelValue'],
    props: ['modelValue'],
    template: '<div v-if="modelValue"><slot /></div>'
  },
  VSpacer: {
    template: '<span />'
  }
}))

vi.mock('vuetify/components/VBtn', () => ({
  VBtn: {
    emits: ['click'],
    props: ['loading'],
    template: [
      '<button',
      '  :data-loading="loading ? \'true\' : \'false\'"',
      '  type="button"',
      '  @click="$emit(\'click\', $event)"',
      '>',
      '<slot />',
      '</button>'
    ].join('')
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
    template: '<p><slot /></p>'
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
    template: '<p><slot /></p>'
  }
}))

vi.mock('vuetify/components/VCardTitle', () => ({
  VCardTitle: {
    template: '<h2><slot /></h2>'
  }
}))

vi.mock('vuetify/components/VDialog', () => ({
  VDialog: {
    emits: ['update:modelValue'],
    props: ['modelValue'],
    template: '<div v-if="modelValue"><slot /></div>'
  }
}))

vi.mock('vuetify/components/VGrid', () => ({
  VSpacer: {
    template: '<span />'
  }
}))

vi.mock('vuetify/components/VSpacer', () => ({
  VSpacer: {
    template: '<span />'
  }
}))

function mountConfirmDialog (
  props: Partial<InstanceType<typeof ConfirmDialog>['$props']> = {}
) {
  return mount(ConfirmDialog, {
    props: {
      modelValue: true,
      text: 'This cannot be undone.',
      title: 'Delete note',
      ...props
    }
  })
}

describe('ConfirmDialog', () => {
  describe('when dialog is open', () => {
    test('should render title, text, and default actions', () => {
      const wrapper = mountConfirmDialog()

      expect(wrapper.text()).toContain('Delete note')
      expect(wrapper.text()).toContain('This cannot be undone.')
      expect(wrapper.text()).toContain('Keep')
      expect(wrapper.text()).toContain('Confirm')
    })
  })

  describe('when custom confirm label is provided', () => {
    test('should render custom confirm action', () => {
      const wrapper = mountConfirmDialog({
        confirmLabel: 'Delete'
      })

      expect(wrapper.text()).toContain('Delete')
    })
  })

  describe('when cancel action is clicked', () => {
    test('should close dialog through model update', async () => {
      const wrapper = mountConfirmDialog()

      await wrapper.find('.confirm-dialog__cancel').trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
      expect(wrapper.emitted('confirm')).toBeUndefined()
    })
  })

  describe('when confirm action is clicked', () => {
    test('should emit confirm without closing dialog', async () => {
      const wrapper = mountConfirmDialog()

      await wrapper.find('.confirm-dialog__confirm').trigger('click')

      expect(wrapper.emitted('confirm')).toHaveLength(1)
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
  })

  describe('when confirm action is loading', () => {
    test('should pass loading state to confirm button', () => {
      const wrapper = mountConfirmDialog({
        loading: true
      })

      expect(wrapper.find('.confirm-dialog__confirm').attributes('data-loading')).toBe('true')
    })
  })

  describe('when dialog is closed', () => {
    test('should not render dialog content', () => {
      const wrapper = mountConfirmDialog({
        modelValue: false
      })

      expect(wrapper.text()).not.toContain('Delete note')
    })
  })
})
