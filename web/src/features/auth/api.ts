import { apiClient, skipAuthRefresh } from '@/shared/api'
import type {
  AuthTokens,
  LoginCredentials,
  RegisterPayload,
  User
} from '@/features/auth/types'

export async function login (credentials: LoginCredentials) {
  const { data } = await apiClient.post<AuthTokens>(
    '/auth/token',
    credentials,
    skipAuthRefresh()
  )
  return data
}

export async function registerUser (payload: RegisterPayload) {
  const { data } = await apiClient.post<User>(
    '/users',
    payload,
    skipAuthRefresh()
  )
  return data
}

export async function getCurrentUser () {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}

export async function refreshAccessToken () {
  const { data } = await apiClient.post<Pick<AuthTokens, 'access'>>(
    '/auth/token/refresh',
    undefined,
    skipAuthRefresh()
  )

  return data.access
}

export async function logout () {
  await apiClient.post(
    '/auth/token/blacklist',
    undefined,
    skipAuthRefresh()
  )
}
