import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import LoginView from './LoginView.vue'

const authStore = vi.hoisted(() => ({
  login: vi.fn()
}))

const router = vi.hoisted(() => ({
  push: vi.fn()
}))

vi.mock('vuetify/components', () => ({
  VAlert: {
    template: '<div role="alert"><slot /></div>'
  },
  VBtn: {
    props: ['loading'],
    template: '<button type="submit"><slot /></button>'
  },
  VForm: {
    template: '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>'
  },
  VTextField: {
    emits: ['update:modelValue', 'click:appendInner'],
    props: [
      'appendInnerIcon',
      'autocomplete',
      'label',
      'modelValue',
      'prependInnerIcon',
      'required',
      'type'
    ],
    template: [
      '<label>',
      '<span>{{ label }}</span>',
      '<input',
      '  :autocomplete="autocomplete"',
      '  :required="required"',
      '  :type="type || \'text\'"',
      '  :value="modelValue"',
      '  @input="$emit(\'update:modelValue\', $event.target.value)"',
      '/>',
      '<button',
      '  v-if="appendInnerIcon"',
      '  class="append-icon"',
      '  type="button"',
      '  @click="$emit(\'click:appendInner\')"',
      '>',
      '  Toggle',
      '</button>',
      '</label>'
    ].join('')
  }
}))

vi.mock('vuetify/components/VAlert', () => ({
  VAlert: {
    template: '<div role="alert"><slot /></div>'
  }
}))

vi.mock('vuetify/components/VBtn', () => ({
  VBtn: {
    props: ['loading'],
    template: '<button type="submit"><slot /></button>'
  }
}))

vi.mock('vuetify/components/VForm', () => ({
  VForm: {
    template: '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>'
  }
}))

vi.mock('vuetify/components/VTextField', () => ({
  VTextField: {
    emits: ['update:modelValue', 'click:appendInner'],
    props: [
      'appendInnerIcon',
      'autocomplete',
      'label',
      'modelValue',
      'prependInnerIcon',
      'required',
      'type'
    ],
    template: [
      '<label>',
      '<span>{{ label }}</span>',
      '<input',
      '  :autocomplete="autocomplete"',
      '  :required="required"',
      '  :type="type || \'text\'"',
      '  :value="modelValue"',
      '  @input="$emit(\'update:modelValue\', $event.target.value)"',
      '/>',
      '<button',
      '  v-if="appendInnerIcon"',
      '  class="append-icon"',
      '  type="button"',
      '  @click="$emit(\'click:appendInner\')"',
      '>',
      '  Toggle',
      '</button>',
      '</label>'
    ].join('')
  }
}))

vi.mock('@/features/auth/components/AuthShell.vue', () => ({
  default: {
    props: ['title', 'subtitle'],
    template: [
      '<section>',
      '<h1>{{ title }}</h1>',
      '<p>{{ subtitle }}</p>',
      '<slot />',
      '<footer><slot name="footer" /></footer>',
      '</section>'
    ].join('')
  }
}))

vi.mock('@/features/auth/store', () => ({
  useAuthStore: () => authStore
}))

vi.mock('vue-router', () => ({
  RouterLink: {
    props: ['to'],
    template: '<a><slot /></a>'
  },
  useRouter: () => router
}))

function mountLoginView () {
  return mount(LoginView, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>'
        },
        VAlert: {
          template: '<div role="alert"><slot /></div>'
        },
        VBtn: {
          props: ['loading'],
          template: '<button type="submit"><slot /></button>'
        },
        VForm: {
          template: '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>'
        },
        VTextField: {
          emits: ['update:modelValue', 'click:appendInner'],
          props: [
            'appendInnerIcon',
            'autocomplete',
            'label',
            'modelValue',
            'prependInnerIcon',
            'required',
            'type'
          ],
          template: [
            '<label>',
            '<span>{{ label }}</span>',
            '<input',
            '  :autocomplete="autocomplete"',
            '  :required="required"',
            '  :type="type || \'text\'"',
            '  :value="modelValue"',
            '  @input="$emit(\'update:modelValue\', $event.target.value)"',
            '/>',
            '<button',
            '  v-if="appendInnerIcon"',
            '  class="append-icon"',
            '  type="button"',
            '  @click="$emit(\'click:appendInner\')"',
            '>',
            '  Toggle',
            '</button>',
            '</label>'
          ].join('')
        }
      }
    }
  })
}

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when valid credentials are submitted', () => {
    test('should login and redirect to notes', async () => {
      const wrapper = mountLoginView()
      authStore.login.mockResolvedValue(undefined)

      await wrapper
        .find('input[autocomplete="username"]')
        .setValue('test-user')
      await wrapper
        .find('input[autocomplete="current-password"]')
        .setValue('passphrase')
      await wrapper.find('form').trigger('submit')

      await vi.waitFor(() => {
        expect(authStore.login).toHaveBeenCalledWith({
          password: 'passphrase', // pragma: allowlist secret
          username: 'test-user'
        })
        expect(router.push).toHaveBeenCalledWith({ name: 'notes' })
      })
    })
  })

  describe('when login request fails', () => {
    test('should show submit error and stay on login page', async () => {
      const wrapper = mountLoginView()
      authStore.login.mockRejectedValue(new Error('Invalid credentials'))

      await wrapper
        .find('input[autocomplete="username"]')
        .setValue('test-user')
      await wrapper
        .find('input[autocomplete="current-password"]')
        .setValue('wrong-password')
      await wrapper.find('form').trigger('submit')

      await vi.waitFor(() => {
        expect(wrapper.get('[role="alert"]').text()).toContain('Invalid credentials')
        expect(router.push).not.toHaveBeenCalled()
      })
    })
  })

  describe('when password visibility is toggled', () => {
    test('should switch password input type', async () => {
      const wrapper = mountLoginView()
      const passwordInput = wrapper.get('input[autocomplete="current-password"]')

      expect(passwordInput.attributes('type')).toBe('password')

      await wrapper.get('.append-icon').trigger('click')

      expect(passwordInput.attributes('type')).toBe('text')
    })
  })
})
