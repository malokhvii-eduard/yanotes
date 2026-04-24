import { computed, ref } from 'vue'
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

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const accessToken = ref<AuthTokens['access'] | null>(null)
  const initializing = ref(true)

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
    accessToken.value = null
  }

  async function fetchCurrentUser () {
    const user = await getCurrentUser()
    setCurrentUser(user)
    return user
  }

  async function login (credentials: LoginCredentials) {
    const tokens = await loginApi(credentials)
    accessToken.value = tokens.access
    await fetchCurrentUser()
  }

  async function register (payload: RegisterPayload) {
    await registerUser(payload)
  }

  async function refreshAccessToken () {
    const nextAccessToken = await refreshAccessTokenApi()
    accessToken.value = nextAccessToken

    return nextAccessToken
  }

  async function revokeRefreshToken () {
    await logoutApi()
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
    revokeRefreshToken,
    register,
    setCurrentUser,
    setInitializing
  }
})
