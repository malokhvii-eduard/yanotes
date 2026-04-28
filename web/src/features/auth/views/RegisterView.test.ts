import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import RegisterView from './RegisterView.vue'

const authStore = vi.hoisted(() => ({
  register: vi.fn()
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
  VCol: {
    template: '<div><slot /></div>'
  },
  VForm: {
    template: '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>'
  },
  VRow: {
    template: '<div><slot /></div>'
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

vi.mock('vuetify/components/VGrid', () => ({
  VCol: {
    template: '<div><slot /></div>'
  },
  VRow: {
    template: '<div><slot /></div>'
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

function mountRegisterView () {
  return mount(RegisterView, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>'
        }
      }
    }
  })
}

async function fillRegisterForm (wrapper: ReturnType<typeof mountRegisterView>) {
  await wrapper
    .find('input[autocomplete="given-name"]')
    .setValue('Test')
  await wrapper
    .find('input[autocomplete="family-name"]')
    .setValue('User')
  await wrapper
    .find('input[autocomplete="username"]')
    .setValue('test-user')
  await wrapper
    .find('input[autocomplete="email"]')
    .setValue('test-user@example.com')
  await wrapper
    .find('input[autocomplete="new-password"]')
    .setValue('passphrase')
}

describe('RegisterView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when valid registration details are submitted', () => {
    test('should register and redirect to login', async () => {
      const wrapper = mountRegisterView()
      authStore.register.mockResolvedValue(undefined)

      await fillRegisterForm(wrapper)
      await wrapper.find('form').trigger('submit')

      await vi.waitFor(() => {
        expect(authStore.register).toHaveBeenCalledWith({
          email: 'test-user@example.com',
          first_name: 'Test',
          last_name: 'User',
          password: 'passphrase', // pragma: allowlist secret
          username: 'test-user'
        })
        expect(router.push).toHaveBeenCalledWith({ name: 'login' })
      })
    })
  })

  describe('when registration request fails', () => {
    test('should show submit error and stay on register page', async () => {
      const wrapper = mountRegisterView()
      authStore.register.mockRejectedValue(new Error('Username already exists'))

      await fillRegisterForm(wrapper)
      await wrapper.find('form').trigger('submit')

      await vi.waitFor(() => {
        expect(wrapper.get('[role="alert"]').text()).toContain('Username already exists')
        expect(router.push).not.toHaveBeenCalled()
      })
    })
  })

  describe('when password visibility is toggled', () => {
    test('should switch password input type', async () => {
      const wrapper = mountRegisterView()
      const passwordInput = wrapper.get('input[autocomplete="new-password"]')

      expect(passwordInput.attributes('type')).toBe('password')

      await wrapper.get('.append-icon').trigger('click')

      expect(passwordInput.attributes('type')).toBe('text')
    })
  })
})
