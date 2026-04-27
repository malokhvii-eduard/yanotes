import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse
} from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { afterEach, describe, expect, test, vi } from 'vitest'

vi.mock('axios-auth-refresh', () => ({
  default: vi.fn((
    client: AxiosInstance,
    refreshAuthCall: (error: AxiosError) => Promise<void>,
    options: {
      shouldRefresh: (error: AxiosError) => boolean
    }
  ) => {
    client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (!options.shouldRefresh(error)) {
          return Promise.reject(error)
        }

        await refreshAuthCall(error)

        return client.request(error.config!)
      }
    )
  })
}))

import {
  installAuthInterceptorsOnClient,
  skipAuthRefresh
} from './client'

function createTestContext () {
  const client = axios.create()
  const mock = new MockAdapter(client)
  const session = {
    clear: vi.fn(async () => undefined),
    getAccessToken: vi.fn(() => null as string | null),
    refreshAccessToken: vi.fn(async () => 'refreshed-token')
  }

  installAuthInterceptorsOnClient(client, session)

  return {
    client,
    mock,
    session
  }
}

describe('authInterceptors', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when request is sent with access token', () => {
    test('should add authorization header', async () => {
      const { client, mock, session } = createTestContext()
      session.getAccessToken.mockReturnValue('access-token')

      mock.onGet('/notes').reply(config => {
        return [
          200,
          {
            authorization: config.headers?.Authorization
          }
        ]
      })

      const { data } = await client.get('/notes')

      expect(data.authorization).toBe('Bearer access-token')
    })
  })

  describe('when request is sent without access token', () => {
    test('should leave authorization header unset', async () => {
      const { client, mock } = createTestContext()

      mock.onGet('/notes').reply(config => {
        return [
          200,
          {
            authorization: config.headers?.Authorization ?? null
          }
        ]
      })

      const { data } = await client.get('/notes')

      expect(data.authorization).toBeNull()
    })
  })

  describe('when protected request returns unauthorized', () => {
    test('should refresh token and retry request with refreshed authorization header', async () => {
      const { client, mock, session } = createTestContext()
      let accessToken = 'expired-token'
      session.getAccessToken.mockImplementation(() => accessToken)
      session.refreshAccessToken.mockImplementation(async () => {
        accessToken = 'refreshed-token'
        return accessToken
      })

      mock
        .onGet('/notes')
        .replyOnce(401, { detail: 'Token expired' })
        .onGet('/notes')
        .reply(config => [
          200,
          {
            authorization: config.headers?.Authorization
          }
        ])

      const { data } = await client.get('/notes')

      expect(session.refreshAccessToken).toHaveBeenCalledOnce()
      expect(data.authorization).toBe('Bearer refreshed-token')
      expect(session.clear).not.toHaveBeenCalled()
    })
  })

  describe('when token refresh fails after unauthorized response', () => {
    test('should clear session and rethrow refresh error', async () => {
      const { client, mock, session } = createTestContext()
      session.getAccessToken.mockReturnValue('expired-token')
      session.refreshAccessToken.mockRejectedValue(new Error('refresh failed'))
      mock.onGet('/notes').replyOnce(401, { detail: 'Token expired' })

      await expect(client.get('/notes')).rejects.toThrow('refresh failed')

      expect(session.refreshAccessToken).toHaveBeenCalledOnce()
      expect(session.clear).toHaveBeenCalledOnce()
    })
  })

  describe('when auth token endpoint returns unauthorized', () => {
    test('should not refresh token', async () => {
      const { client, mock, session } = createTestContext()
      session.getAccessToken.mockReturnValue('expired-token')
      mock.onPost('/auth/token').replyOnce(401, { detail: 'Invalid credentials' })

      await expect(client.post('/auth/token')).rejects.toMatchObject({
        response: {
          status: 401
        }
      })

      expect(session.refreshAccessToken).not.toHaveBeenCalled()
      expect(session.clear).not.toHaveBeenCalled()
    })
  })

  describe('when request skips auth refresh', () => {
    test('should keep skip flag on config', () => {
      const config = skipAuthRefresh({
        headers: {
          'X-Test': 'value'
        }
      })

      expect(config.skipAuthRefresh).toBe(true)
      expect(config.headers).toEqual({
        'X-Test': 'value'
      })
    })
  })

  describe('when auth interceptors are installed more than once', () => {
    test('should install them only once for the same client', async () => {
      const { client, mock, session } = createTestContext()
      session.getAccessToken.mockReturnValue('access-token')
      installAuthInterceptorsOnClient(client, session)

      mock.onGet('/notes').reply(200, {})

      await client.get('/notes')

      expect(session.getAccessToken).toHaveBeenCalledOnce()
    })
  })
})
