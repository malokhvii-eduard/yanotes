import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  refreshAccessToken as refreshAccessTokenApi,
  registerUser
} from '@/features/auth/api'
import type {
  AuthTokens,
  LoginCredentials,
  RegisterPayload,
  User
} from '@/features/auth/types'

const TOKEN_STORAGE_KEY = 'yanotes.tokens'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const tokens = useStorage<AuthTokens | null>(TOKEN_STORAGE_KEY, null)
  const initializing = ref(true)

  const accessToken = computed(() => tokens.value?.access ?? null)
  const refreshToken = computed(() => tokens.value?.refresh ?? null)
  const isAdmin = computed(() => currentUser.value?.is_staff === true)
  const isAuthenticated = computed(() => Boolean(accessToken.value && currentUser.value))

  function setCurrentUser (user: User | null) {
    currentUser.value = user
  }

  function setInitializing (value: boolean) {
    initializing.value = value
  }

  function clearAuthState () {
    currentUser.value = null
    tokens.value = null
  }

  async function fetchCurrentUser () {
    const user = await getCurrentUser()
    setCurrentUser(user)
    return user
  }

  async function login (credentials: LoginCredentials) {
    tokens.value = await loginApi(credentials)
    await fetchCurrentUser()
  }

  async function register (payload: RegisterPayload) {
    await registerUser(payload)
  }

  async function refreshAccessToken () {
    if (!refreshToken.value) {
      throw new Error('Missing refresh token.')
    }

    const nextAccessToken = await refreshAccessTokenApi(refreshToken.value)

    tokens.value = {
      access: nextAccessToken,
      refresh: refreshToken.value
    }

    return nextAccessToken
  }

  async function revokeRefreshToken () {
    if (!refreshToken.value) {
      return
    }

    await logoutApi(refreshToken.value)
  }

  return {
    accessToken,
    clearAuthState,
    currentUser,
    fetchCurrentUser,
    isAdmin,
    initializing,
    isAuthenticated,
    login,
    refreshAccessToken,
    refreshToken,
    revokeRefreshToken,
    register,
    setCurrentUser,
    setInitializing
  }
})
