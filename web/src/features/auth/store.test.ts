import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  getCurrentUser,
  login as loginApi
} from './api'
import { useAuthStore } from './store'
import type { LoginCredentials, User } from './types'

vi.mock('./api', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refreshAccessToken: vi.fn(),
  registerUser: vi.fn()
}))

const user: User = {
  email: 'user@example.com',
  first_name: 'Test',
  id: 1,
  is_staff: false,
  last_name: 'User',
  username: 'test-user'
}

const credentials: LoginCredentials = {
  password: 'passphrase', // pragma: allowlist secret
  username: 'test-user'
}

function createTestContext () {
  const pinia = createPinia()
  setActivePinia(pinia)

  return {
    authStore: useAuthStore(pinia)
  }
}

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when login succeeds', () => {
    test('should store access token and current user', async () => {
      const { authStore } = createTestContext()
      vi.mocked(loginApi).mockResolvedValue({
        access: 'access-token'
      })
      vi.mocked(getCurrentUser).mockResolvedValue(user)

      await authStore.login(credentials)

      expect(loginApi).toHaveBeenCalledWith(credentials)
      expect(getCurrentUser).toHaveBeenCalledOnce()
      expect(authStore.accessToken).toBe('access-token')
      expect(authStore.currentUser).toEqual(user)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isAdmin).toBe(false)
    })
  })

  describe('when login fails', () => {
    test('should leave auth state empty and rethrow error', async () => {
      const { authStore } = createTestContext()
      vi.mocked(loginApi).mockRejectedValue(new Error('invalid credentials'))

      await expect(authStore.login(credentials)).rejects.toThrow('invalid credentials')

      expect(getCurrentUser).not.toHaveBeenCalled()
      expect(authStore.accessToken).toBeNull()
      expect(authStore.currentUser).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('when current user request fails after login', () => {
    test('should keep access token and rethrow error', async () => {
      const { authStore } = createTestContext()
      vi.mocked(loginApi).mockResolvedValue({
        access: 'access-token'
      })
      vi.mocked(getCurrentUser).mockRejectedValue(new Error('profile failed'))

      await expect(authStore.login(credentials)).rejects.toThrow('profile failed')

      expect(authStore.accessToken).toBe('access-token')
      expect(authStore.currentUser).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })
})
