import { mount } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'

import AuthShell from './AuthShell.vue'

vi.mock('vuetify/components', () => ({
  VApp: {
    template: '<div><slot /></div>'
  },
  VCard: {
    template: '<section><slot /></section>'
  },
  VCardText: {
    template: '<div><slot /></div>'
  },
  VCol: {
    props: ['cols', 'lg', 'md', 'sm', 'xl'],
    template: [
      '<div',
      '  :data-cols="cols"',
      '  :data-lg="lg"',
      '  :data-md="md"',
      '  :data-sm="sm"',
      '  :data-xl="xl"',
      '>',
      '<slot />',
      '</div>'
    ].join('')
  },
  VContainer: {
    template: '<main><slot /></main>'
  },
  VMain: {
    template: '<div><slot /></div>'
  },
  VRow: {
    template: '<div><slot /></div>'
  }
}))

vi.mock('vuetify/components/VApp', () => ({
  VApp: {
    template: '<div><slot /></div>'
  }
}))

vi.mock('vuetify/components/VCard', () => ({
  VCard: {
    template: '<section><slot /></section>'
  },
  VCardText: {
    template: '<div><slot /></div>'
  }
}))

vi.mock('vuetify/components/VCardText', () => ({
  VCardText: {
    template: '<div><slot /></div>'
  }
}))

vi.mock('vuetify/components/VGrid', () => ({
  VCol: {
    props: ['cols', 'lg', 'md', 'sm', 'xl'],
    template: [
      '<div',
      '  :data-cols="cols"',
      '  :data-lg="lg"',
      '  :data-md="md"',
      '  :data-sm="sm"',
      '  :data-xl="xl"',
      '>',
      '<slot />',
      '</div>'
    ].join('')
  },
  VContainer: {
    template: '<main><slot /></main>'
  },
  VRow: {
    template: '<div><slot /></div>'
  }
}))

vi.mock('vuetify/components/VMain', () => ({
  VMain: {
    template: '<div><slot /></div>'
  }
}))

function mountAuthShell (
  props: Partial<InstanceType<typeof AuthShell>['$props']> = {}
) {
  return mount(AuthShell, {
    props: {
      subtitle: 'Welcome back.',
      title: 'Login',
      ...props
    },
    slots: {
      default: '<form aria-label="Auth form">Form content</form>',
      footer: '<a href="/register">Create account</a>'
    }
  })
}

describe('AuthShell', () => {
  describe('when shell is rendered', () => {
    test('should render title, subtitle, default slot, and footer slot', () => {
      const wrapper = mountAuthShell()

      expect(wrapper.get('h1').text()).toBe('Login')
      expect(wrapper.get('.auth-subtitle').text()).toBe('Welcome back.')
      expect(wrapper.text()).toContain('Form content')
      expect(wrapper.text()).toContain('Create account')
    })
  })

  describe('when responsive columns are omitted', () => {
    test('should use default column sizes', () => {
      const wrapper = mountAuthShell()
      const column = wrapper.get('[data-cols="12"]')

      expect(column.attributes('data-sm')).toBe('10')
      expect(column.attributes('data-md')).toBe('8')
      expect(column.attributes('data-lg')).toBe('5')
      expect(column.attributes('data-xl')).toBe('4')
    })
  })

  describe('when responsive columns are provided', () => {
    test('should pass custom column sizes', () => {
      const wrapper = mountAuthShell({
        lg: 6,
        md: 9,
        sm: 11,
        xl: 5
      })
      const column = wrapper.get('[data-cols="12"]')

      expect(column.attributes('data-sm')).toBe('11')
      expect(column.attributes('data-md')).toBe('9')
      expect(column.attributes('data-lg')).toBe('6')
      expect(column.attributes('data-xl')).toBe('5')
    })
  })
})
