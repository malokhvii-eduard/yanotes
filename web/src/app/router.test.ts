import { createPinia, setActivePinia } from 'pinia'
import {
  isNavigationFailure,
  NavigationFailureType,
  type Router
} from 'vue-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('@/features/auth/api', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refreshAccessToken: vi.fn(),
  registerUser: vi.fn()
}))

vi.mock('@/features/notes/views/NotesView.vue', () => ({
  default: {
    name: 'NotesView',
    template: '<div />'
  }
}))

vi.mock('@/features/auth/views/LoginView.vue', () => ({
  default: {
    name: 'LoginView',
    template: '<div />'
  }
}))

vi.mock('@/features/auth/views/RegisterView.vue', () => ({
  default: {
    name: 'RegisterView',
    template: '<div />'
  }
}))

type AuthStore = ReturnType<typeof import('@/features/auth/store')['useAuthStore']>

async function createTestContext () {
  vi.resetModules()
  window.history.replaceState(null, '', '/')
  document.title = 'YaNotes'

  const pinia = createPinia()
  setActivePinia(pinia)

  const { useAuthStore } = await import('@/features/auth/store')
  const { default: router } = await import('./router')
  const authStore = useAuthStore(pinia)

  return {
    authStore,
    router
  }
}

function authenticate (authStore: AuthStore) {
  authStore.accessToken = 'access-token'
  authStore.setCurrentUser({
    email: 'user@example.com',
    first_name: 'Test',
    id: 1,
    is_staff: false,
    last_name: 'User',
    username: 'test-user'
  })
}

async function navigateTo (router: Router, path: string) {
  await router.push(path)
  await router.isReady()
}

describe('router', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('when anonymous user accesses notes', () => {
    test('should redirect to login', async () => {
      const { authStore, router } = await createTestContext()
      authStore.initializing = false

      await navigateTo(router, '/')

      expect(router.currentRoute.value.name).toBe('login')
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('when authenticated user accesses login', () => {
    test('should redirect to notes', async () => {
      const { authStore, router } = await createTestContext()
      authStore.initializing = false
      authenticate(authStore)

      await navigateTo(router, '/login')

      expect(router.currentRoute.value.name).toBe('notes')
      expect(router.currentRoute.value.path).toBe('/')
    })
  })

  describe('when authenticated user accesses register', () => {
    test('should redirect to notes', async () => {
      const { authStore, router } = await createTestContext()
      authStore.initializing = false
      authenticate(authStore)

      await navigateTo(router, '/register')

      expect(router.currentRoute.value.name).toBe('notes')
      expect(router.currentRoute.value.path).toBe('/')
    })
  })

  describe('when session is initializing', () => {
    test('should cancel navigation', async () => {
      const { authStore, router } = await createTestContext()
      authStore.initializing = true

      const failure = await router.push('/login')

      expect(isNavigationFailure(failure, NavigationFailureType.aborted)).toBe(true)
      expect(router.currentRoute.value.name).toBeUndefined()
      expect(router.currentRoute.value.path).toBe('/')
      expect(document.title).toBe('YaNotes')
    })
  })

  describe('when unknown route is accessed', () => {
    test('should redirect to notes', async () => {
      const { authStore, router } = await createTestContext()
      authStore.initializing = false
      authenticate(authStore)

      await navigateTo(router, '/missing-page')

      expect(router.currentRoute.value.name).toBe('notes')
      expect(router.currentRoute.value.path).toBe('/')
    })
  })

  describe('when navigation finishes on login route', () => {
    test('should set document title', async () => {
      const { authStore, router } = await createTestContext()
      authStore.initializing = false

      await navigateTo(router, '/login')

      expect(document.title).toBe('Sign in • YaNotes')
    })
  })
})
