<script setup lang="ts">
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'

import AuthShell from '@/features/auth/components/AuthShell.vue'
import { loginSchema } from '@/features/auth/schemas'
import { useAuthStore } from '@/features/auth/store'
import type { LoginCredentials } from '@/features/auth/types'
import { getErrorMessage } from '@/shared/errors'
import { fieldErrorProps } from '@/shared/forms'

const authStore = useAuthStore()
const router = useRouter()

const showPassword = ref(false)
const submitError = ref<string | null>(null)

const { defineField, handleSubmit, isSubmitting } = useForm<LoginCredentials>({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    password: '',
    username: ''
  }
})

const [username, usernameProps] = defineField('username', fieldErrorProps)
const [password, passwordProps] = defineField('password', fieldErrorProps)

const handleLogin = handleSubmit(async values => {
  submitError.value = null

  try {
    await authStore.login(values)
    await router.push({ name: 'notes' })
  } catch (error) {
    submitError.value = getErrorMessage(error, 'Unable to sign in.')
  }
})
</script>

<template>
  <AuthShell
    title="Sign in"
    subtitle="Notes, simply."
  >
    <v-alert
      v-if="submitError"
      type="error"
      :icon="false"
      variant="tonal"
      class="mb-5"
    >
      {{ submitError }}
    </v-alert>

    <v-form @submit.prevent="handleLogin">
      <div class="d-flex flex-column ga-3">
        <v-text-field
          v-model="username"
          v-bind="usernameProps"
          class="auth-field"
          label="Username"
          autocomplete="username"
          prepend-inner-icon="$accountCircleOutline"
          required
        />

        <v-text-field
          v-model="password"
          v-bind="passwordProps"
          class="auth-field"
          :append-inner-icon="showPassword ? '$eyeOffOutline' : '$eyeOutline'"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          autocomplete="current-password"
          prepend-inner-icon="$lockOutline"
          required
          @click:append-inner="showPassword = !showPassword"
        />

        <v-btn
          color="primary"
          size="large"
          type="submit"
          :loading="isSubmitting"
          class="auth-submit mt-3"
          block
        >
          Sign in
        </v-btn>
      </div>
    </v-form>

    <template #footer>
      No account?
      <router-link
        class="auth-link"
        :to="{ name: 'register' }"
      >
        Register
      </router-link>
    </template>
  </AuthShell>
</template>
