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
                <div class="auth-copy mb-7">
                  <h1 class="auth-title mb-2">
                    {{ title }}
                  </h1>
                  <p class="auth-subtitle">
                    {{ subtitle }}
                  </p>
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
