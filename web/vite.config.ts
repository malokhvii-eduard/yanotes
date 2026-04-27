import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL?.trim() || '/api'
  const apiProxyTarget = env.VITE_API_PROXY_TARGET?.trim() || 'http://localhost'

  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    test: {
      coverage: {
        exclude: [
          'src/**/*.d.ts',
          'src/**/*.test.ts',
          'src/main.ts'
        ],
        include: [
          'src/**/*.{ts,vue}'
        ],
        provider: 'v8',
        reporter: [
          'text',
          'text-summary',
          'html',
          'lcov',
          'json-summary'
        ],
        reportOnFailure: true,
        reportsDirectory: './coverage',
        skipFull: true
      }
    },
    server: apiBaseUrl.startsWith('/') ?
      {
        proxy: {
          [apiBaseUrl]: {
            target: apiProxyTarget,
            changeOrigin: true
          }
        }
      } :
      undefined
  }
})
