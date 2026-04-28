import { beforeEach, describe, expect, test, vi } from 'vitest'

import { apiClient, skipAuthRefresh } from '@/shared/api'

import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  registerUser
} from './api'
import type {
  AuthTokens,
  LoginCredentials,
  RegisterPayload,
  User
} from './types'

vi.mock('@/shared/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn()
  },
  skipAuthRefresh: vi.fn(() => ({
    skipAuthRefresh: true
  }))
}))

const tokens: AuthTokens = {
  access: 'access-token'
}

const user: User = {
  email: 'user@example.com',
  first_name: 'Test',
  id: 1,
  is_staff: false,
  last_name: 'User',
  username: 'test-user'
}

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when logging in', () => {
    test('should post credentials and return tokens', async () => {
      const credentials: LoginCredentials = {
        password: 'passphrase', // pragma: allowlist secret
        username: 'test-user'
      }
      vi.mocked(apiClient.post).mockResolvedValue({
        data: tokens
      })

      await expect(login(credentials)).resolves.toEqual(tokens)

      expect(skipAuthRefresh).toHaveBeenCalledOnce()
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/token',
        credentials,
        { skipAuthRefresh: true }
      )
    })
  })

  describe('when registering user', () => {
    test('should post registration payload and return user', async () => {
      const payload: RegisterPayload = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        password: 'passphrase', // pragma: allowlist secret
        username: user.username
      }
      vi.mocked(apiClient.post).mockResolvedValue({
        data: user
      })

      await expect(registerUser(payload)).resolves.toEqual(user)

      expect(skipAuthRefresh).toHaveBeenCalledOnce()
      expect(apiClient.post).toHaveBeenCalledWith(
        '/users',
        payload,
        { skipAuthRefresh: true }
      )
    })
  })

  describe('when fetching current user', () => {
    test('should get auth profile and return user', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: user
      })

      await expect(getCurrentUser()).resolves.toEqual(user)

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
      expect(skipAuthRefresh).not.toHaveBeenCalled()
    })
  })

  describe('when refreshing access token', () => {
    test('should post refresh request and return access token', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: tokens
      })

      await expect(refreshAccessToken()).resolves.toBe(tokens.access)

      expect(skipAuthRefresh).toHaveBeenCalledOnce()
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/token/refresh',
        undefined,
        { skipAuthRefresh: true }
      )
    })
  })

  describe('when logging out', () => {
    test('should blacklist refresh token without returning data', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: undefined
      })

      await expect(logout()).resolves.toBeUndefined()

      expect(skipAuthRefresh).toHaveBeenCalledOnce()
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/token/blacklist',
        undefined,
        { skipAuthRefresh: true }
      )
    })
  })
})
