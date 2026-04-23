import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/features/auth/store'

declare module 'vue-router' {
  interface RouteMeta {
    guestOnly?: boolean
    requiresAuth?: boolean
    title?: string
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'notes',
      component: () => import('@/features/notes/views/NotesView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Notes'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/views/LoginView.vue'),
      meta: {
        guestOnly: true,
        title: 'Sign in'
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/features/auth/views/RegisterView.vue'),
      meta: {
        guestOnly: true,
        title: 'Register'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach(to => {
  const authStore = useAuthStore()

  if (authStore.initializing) {
    return false
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'notes' }
  }

  return true
})

router.afterEach(to => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'YaNotes'
  document.title = pageTitle === 'YaNotes' ? pageTitle : `${pageTitle} • YaNotes`
})

export default router
