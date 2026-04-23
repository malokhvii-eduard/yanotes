import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig
} from 'axios'
import createAuthRefresh, {
  type AxiosAuthRefreshRequestConfig
} from 'axios-auth-refresh'

import { appEnv } from '@/shared/env'

type AuthSession = {
  clear: () => void | Promise<void>
  getAccessToken: () => string | null
  hasRefreshToken: () => boolean
  refreshAccessToken: () => Promise<string>
}

type HeaderCarrier = {
  headers?: InternalAxiosRequestConfig['headers']
}

let authInterceptorsInstalled = false

export const apiClient = axios.create({
  baseURL: appEnv.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

function setAuthorizationHeader (
  config: HeaderCarrier,
  accessToken: string
) {
  const headers = AxiosHeaders.from(
    config.headers as AxiosHeaders | Record<string, string> | undefined
  )
  headers.set('Authorization', `Bearer ${accessToken}`)
  config.headers = headers
}

export function skipAuthRefresh (
  config: AxiosAuthRefreshRequestConfig = {}
) {
  return {
    ...config,
    skipAuthRefresh: true
  } as AxiosAuthRefreshRequestConfig
}

export function installAuthInterceptors (session: AuthSession) {
  if (authInterceptorsInstalled) {
    return
  }

  authInterceptorsInstalled = true

  apiClient.interceptors.request.use(config => {
    const accessToken = session.getAccessToken()

    if (accessToken) {
      setAuthorizationHeader(config, accessToken)
    }

    return config
  })

  createAuthRefresh(
    apiClient,
    async failedRequest => {
      try {
        const accessToken = await session.refreshAccessToken()

        setAuthorizationHeader(
          failedRequest.response.config as HeaderCarrier,
          accessToken
        )
      } catch (refreshError) {
        await session.clear()
        throw refreshError
      }
    },
    {
      shouldRefresh: error => {
        if (!axios.isAxiosError(error)) {
          return false
        }

        return error.response?.status === 401 &&
          session.hasRefreshToken() &&
          !String(error.response.config.url ?? '').includes('/auth/token')
      }
    }
  )
}
