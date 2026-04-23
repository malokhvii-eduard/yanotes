import { useQueryCache } from '@pinia/colada'

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
  queryCache: QueryCacheStore
) {
  function clear () {
    authStore.clearAuthState()
    clearCache(queryCache)
  }

  async function restore () {
    authStore.setInitializing(true)

    try {
      if (!authStore.accessToken) {
        authStore.setCurrentUser(null)
        return
      }

      await authStore.fetchCurrentUser()
    } catch {
      try {
        if (!authStore.refreshToken) {
          clear()
          return
        }

        await authStore.refreshAccessToken()
        await authStore.fetchCurrentUser()
      } catch {
        clear()
      }
    } finally {
      authStore.setInitializing(false)
    }
  }

  async function logout (options: LogoutOptions = {}) {
    const revokeToken = options.revokeToken ?? true

    try {
      if (revokeToken) {
        await authStore.revokeRefreshToken()
      }
    } finally {
      clear()
    }
  }

  function getAccessToken () {
    return authStore.accessToken
  }

  return {
    clear,
    getAccessToken,
    hasRefreshToken: () => Boolean(authStore.refreshToken),
    logout,
    refreshAccessToken: () => authStore.refreshAccessToken(),
    restore
  }
}
