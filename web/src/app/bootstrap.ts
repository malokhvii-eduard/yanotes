import { createApp } from 'vue'
import { PiniaColada } from '@pinia/colada'
import { useQueryCache } from '@pinia/colada'
import { createPinia } from 'pinia'

import { createAuthSession } from '@/app/session'
import { useAuthStore } from '@/features/auth/store'
import { installAuthInterceptors } from '@/shared/api'

import App from './App.vue'
import { createVuetifyInstance } from './plugins/vuetify'
import router from './router'

export async function bootstrapApp () {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(PiniaColada, { pinia })

  const authStore = useAuthStore(pinia)
  const queryCache = useQueryCache(pinia)
  const session = createAuthSession(authStore, queryCache)

  installAuthInterceptors(session)

  await session.restore()

  app.use(router)
  app.use(createVuetifyInstance())
  app.mount('#app')
}
