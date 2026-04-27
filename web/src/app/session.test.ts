import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { useAuthStore } from '@/features/auth/store'

import { createAuthSession } from './session'

type QueryCacheEntry = {
  key: string[]
}

function createTestContext (entries: QueryCacheEntry[] = []) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const authStore = useAuthStore(pinia)
  const queryCache = {
    getEntries: vi.fn(() => entries),
    remove: vi.fn()
  }
  const router = {
    currentRoute: ref({ name: 'notes' }),
    replace: vi.fn(async () => undefined)
  }
  const session = createAuthSession(
    authStore,
    queryCache as never,
    router as never
  )

  return {
    authStore,
    queryCache,
    router,
    session
  }
}

describe('createAuthSession', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  test('test_given_access_token_when_restoring_session_then_fetches_current_user', async () => {
    const { authStore, router, session } = createTestContext()
    authStore.accessToken = 'access-token'
    const refreshAccessToken = vi.spyOn(authStore, 'refreshAccessToken')
    const fetchCurrentUser = vi
      .spyOn(authStore, 'fetchCurrentUser')
      .mockResolvedValue({
        email: 'user@example.com',
        first_name: 'Test',
        id: 1,
        is_staff: false,
        last_name: 'User',
        username: 'test-user'
      })

    await session.restore()

    expect(refreshAccessToken).not.toHaveBeenCalled()
    expect(fetchCurrentUser).toHaveBeenCalledOnce()
    expect(authStore.initializing).toBe(false)
    expect(router.replace).not.toHaveBeenCalled()
  })

  test('test_given_missing_access_token_when_restoring_session_then_refreshes_token_and_fetches_current_user', async () => {
    const { authStore, router, session } = createTestContext()
    const refreshAccessToken = vi
      .spyOn(authStore, 'refreshAccessToken')
      .mockImplementation(async () => {
        authStore.accessToken = 'next-access-token'
        return 'next-access-token'
      })
    const fetchCurrentUser = vi
      .spyOn(authStore, 'fetchCurrentUser')
      .mockResolvedValue({
        email: 'user@example.com',
        first_name: 'Test',
        id: 1,
        is_staff: false,
        last_name: 'User',
        username: 'test-user'
      })

    await session.restore()

    expect(refreshAccessToken).toHaveBeenCalledOnce()
    expect(fetchCurrentUser).toHaveBeenCalledOnce()
    expect(authStore.accessToken).toBe('next-access-token')
    expect(authStore.initializing).toBe(false)
    expect(router.replace).not.toHaveBeenCalled()
  })

  test('test_given_restore_error_when_restoring_session_then_clears_cache_and_redirects_to_login', async () => {
    const entries = [
      { key: ['notes'] },
      { key: ['note-owners'] }
    ]
    const { authStore, queryCache, router, session } = createTestContext(entries)
    authStore.accessToken = 'expired-access-token'
    authStore.setCurrentUser({
      email: 'user@example.com',
      first_name: 'Test',
      id: 1,
      is_staff: false,
      last_name: 'User',
      username: 'test-user'
    })
    const clearAuthState = vi.spyOn(authStore, 'clearAuthState')
    vi
      .spyOn(authStore, 'fetchCurrentUser')
      .mockRejectedValue(new Error('unauthorized'))

    await session.restore()

    expect(clearAuthState).toHaveBeenCalledOnce()
    expect(queryCache.remove).toHaveBeenCalledTimes(entries.length)
    expect(queryCache.remove).toHaveBeenCalledWith(entries[0])
    expect(queryCache.remove).toHaveBeenCalledWith(entries[1])
    expect(router.replace).toHaveBeenCalledWith({ name: 'login' })
    expect(authStore.accessToken).toBeNull()
    expect(authStore.currentUser).toBeNull()
    expect(authStore.initializing).toBe(false)
  })

  test('test_given_logout_when_revoke_succeeds_then_clears_cache_and_redirects_to_login', async () => {
    const entries = [{ key: ['notes'] }]
    const { authStore, queryCache, router, session } = createTestContext(entries)
    authStore.accessToken = 'access-token'
    authStore.setCurrentUser({
      email: 'user@example.com',
      first_name: 'Test',
      id: 1,
      is_staff: false,
      last_name: 'User',
      username: 'test-user'
    })
    const revokeRefreshToken = vi
      .spyOn(authStore, 'revokeRefreshToken')
      .mockResolvedValue()

    await session.logout()

    expect(revokeRefreshToken).toHaveBeenCalledOnce()
    expect(authStore.accessToken).toBeNull()
    expect(authStore.currentUser).toBeNull()
    expect(queryCache.remove).toHaveBeenCalledWith(entries[0])
    expect(router.replace).toHaveBeenCalledWith({ name: 'login' })
  })

  test('test_given_logout_when_revoke_fails_then_clears_cache_and_rethrows_error', async () => {
    const entries = [{ key: ['notes'] }]
    const { authStore, queryCache, router, session } = createTestContext(entries)
    authStore.accessToken = 'access-token'
    authStore.setCurrentUser({
      email: 'user@example.com',
      first_name: 'Test',
      id: 1,
      is_staff: false,
      last_name: 'User',
      username: 'test-user'
    })
    vi
      .spyOn(authStore, 'revokeRefreshToken')
      .mockRejectedValue(new Error('network error'))

    await expect(session.logout()).rejects.toThrow('network error')

    expect(authStore.accessToken).toBeNull()
    expect(authStore.currentUser).toBeNull()
    expect(queryCache.remove).toHaveBeenCalledWith(entries[0])
    expect(router.replace).toHaveBeenCalledWith({ name: 'login' })
  })
})
