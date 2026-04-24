import { storeToRefs } from 'pinia'
import { useQueryCache } from '@pinia/colada'
import type { Router } from 'vue-router'

import { useAuthStore } from '@/features/auth/store'

type AuthStore = ReturnType<typeof useAuthStore>
type QueryCacheStore = ReturnType<typeof useQueryCache>

type LogoutOptions = {
  revokeToken?: boolean
}

function clearCache (queryCache: QueryCacheStore) {
  for (const entry of queryCache.getEntries()) {
    queryCache.remove(entry)
  }
}

export function createAuthSession (
  authStore: AuthStore,
  queryCache: QueryCacheStore,
  router: Router
) {
  const {
    accessToken,
    initializing
  } = storeToRefs(authStore)

  async function clear () {
    authStore.clearAuthState()
    clearCache(queryCache)

    if (router.currentRoute.value.name !== 'login') {
      await router.replace({ name: 'login' })
    }
  }

  async function restore () {
    initializing.value = true

    try {
      if (!accessToken.value) {
        await authStore.refreshAccessToken()
      }

      await authStore.fetchCurrentUser()
    } catch {
      await clear()
    } finally {
      initializing.value = false
    }
  }

  async function logout (options: LogoutOptions = {}) {
    const revokeToken = options.revokeToken ?? true

    try {
      if (revokeToken) {
        await authStore.revokeRefreshToken()
      }
    } finally {
      await clear()
    }
  }

  function getAccessToken () {
    return accessToken.value
  }

  return {
    clear,
    getAccessToken,
    logout,
    refreshAccessToken: () => authStore.refreshAccessToken(),
    restore
  }
}
