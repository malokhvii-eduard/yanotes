<script setup lang="ts">
const {
  title,
  subtitle,
  sm = 10,
  md = 8,
  lg = 5,
  xl = 4
} = defineProps<{
  title: string
  subtitle: string
  sm?: string | number
  md?: string | number
  lg?: string | number
  xl?: string | number
}>()
</script>

<template>
  <v-app>
    <v-main class="auth-page">
      <v-container class="fill-height py-6 py-sm-10 auth-shell">
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="12"
            :sm="sm"
            :md="md"
            :lg="lg"
            :xl="xl"
          >
            <v-card
              class="auth-card"
              elevation="0"
            >
              <v-card-text class="pa-6 pa-sm-8 auth-card__body">
                <div class="auth-header mb-7">
                  <div class="auth-copy">
                    <div class="auth-title-row mb-2">
                      <h1 class="auth-title">
                        {{ title }}
                      </h1>

                      <div
                        class="auth-brand notes-brand"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 32 32"
                          role="presentation"
                        >
                          <rect
                            x="4"
                            y="4"
                            width="24"
                            height="24"
                            rx="3"
                          />
                          <path d="M11 22V10.5h2.1l5.2 6.6v-6.6H21V22h-2l-5.3-6.8V22z" />
                        </svg>
                      </div>
                    </div>

                    <p class="auth-subtitle">
                      {{ subtitle }}
                    </p>
                  </div>
                </div>

                <slot />

                <div class="auth-footer mt-6">
                  <slot name="footer" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
