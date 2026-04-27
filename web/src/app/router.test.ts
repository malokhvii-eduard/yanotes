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

  test('test_given_anonymous_when_accessing_notes_then_redirects_to_login', async () => {
    const { authStore, router } = await createTestContext()
    authStore.initializing = false

    await navigateTo(router, '/')

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  test('test_given_authenticated_user_when_accessing_login_then_redirects_to_notes', async () => {
    const { authStore, router } = await createTestContext()
    authStore.initializing = false
    authenticate(authStore)

    await navigateTo(router, '/login')

    expect(router.currentRoute.value.name).toBe('notes')
    expect(router.currentRoute.value.path).toBe('/')
  })

  test('test_given_authenticated_user_when_accessing_register_then_redirects_to_notes', async () => {
    const { authStore, router } = await createTestContext()
    authStore.initializing = false
    authenticate(authStore)

    await navigateTo(router, '/register')

    expect(router.currentRoute.value.name).toBe('notes')
    expect(router.currentRoute.value.path).toBe('/')
  })

  test('test_given_initializing_session_when_navigating_then_cancels_navigation', async () => {
    const { authStore, router } = await createTestContext()
    authStore.initializing = true

    const failure = await router.push('/login')

    expect(isNavigationFailure(failure, NavigationFailureType.aborted)).toBe(true)
    expect(router.currentRoute.value.name).toBeUndefined()
    expect(router.currentRoute.value.path).toBe('/')
    expect(document.title).toBe('YaNotes')
  })

  test('test_given_unknown_route_when_accessing_then_redirects_to_notes', async () => {
    const { authStore, router } = await createTestContext()
    authStore.initializing = false
    authenticate(authStore)

    await navigateTo(router, '/missing-page')

    expect(router.currentRoute.value.name).toBe('notes')
    expect(router.currentRoute.value.path).toBe('/')
  })

  test('test_given_login_route_when_navigation_finishes_then_sets_document_title', async () => {
    const { authStore, router } = await createTestContext()
    authStore.initializing = false

    await navigateTo(router, '/login')

    expect(document.title).toBe('Sign in • YaNotes')
  })
})
