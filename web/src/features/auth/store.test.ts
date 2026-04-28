import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  refreshAccessToken,
  registerUser
} from './api'
import { useAuthStore } from './store'
import type { LoginCredentials, RegisterPayload, User } from './types'

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

const registerPayload: RegisterPayload = {
  email: 'new-user@example.com',
  first_name: 'New',
  last_name: 'User',
  password: 'passphrase', // pragma: allowlist secret
  username: 'new-user'
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

  describe('when current user is fetched directly', () => {
    test('should store and return current user', async () => {
      const { authStore } = createTestContext()
      vi.mocked(getCurrentUser).mockResolvedValue(user)

      await expect(authStore.fetchCurrentUser()).resolves.toEqual(user)

      expect(authStore.currentUser).toEqual(user)
    })
  })

  describe('when admin user is stored', () => {
    test('should expose admin state', () => {
      const { authStore } = createTestContext()

      authStore.setCurrentUser({
        ...user,
        is_staff: true
      })

      expect(authStore.isAdmin).toBe(true)
    })
  })

  describe('when initializing state changes', () => {
    test('should update initializing flag', () => {
      const { authStore } = createTestContext()

      authStore.setInitializing(false)

      expect(authStore.initializing).toBe(false)
    })
  })

  describe('when auth state is cleared', () => {
    test('should clear user and access token', () => {
      const { authStore } = createTestContext()
      authStore.accessToken = 'access-token'
      authStore.setCurrentUser(user)

      authStore.clearAuthState()

      expect(authStore.accessToken).toBeNull()
      expect(authStore.currentUser).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('when user registers', () => {
    test('should register user without changing auth state', async () => {
      const { authStore } = createTestContext()
      vi.mocked(registerUser).mockResolvedValue(user)

      await authStore.register(registerPayload)

      expect(registerUser).toHaveBeenCalledWith(registerPayload)
      expect(authStore.accessToken).toBeNull()
      expect(authStore.currentUser).toBeNull()
    })
  })

  describe('when access token is refreshed', () => {
    test('should store and return refreshed access token', async () => {
      const { authStore } = createTestContext()
      vi.mocked(refreshAccessToken).mockResolvedValue('refreshed-token')

      await expect(authStore.refreshAccessToken()).resolves.toBe('refreshed-token')

      expect(authStore.accessToken).toBe('refreshed-token')
    })
  })

  describe('when refresh token is revoked', () => {
    test('should logout through api', async () => {
      const { authStore } = createTestContext()
      vi.mocked(logoutApi).mockResolvedValue()

      await authStore.revokeRefreshToken()

      expect(logoutApi).toHaveBeenCalledOnce()
    })
  })
})
