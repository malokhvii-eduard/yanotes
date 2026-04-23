<script setup lang="ts">
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'

import AuthShell from '@/features/auth/components/AuthShell.vue'
import { registerSchema } from '@/features/auth/schemas'
import { useAuthStore } from '@/features/auth/store'
import type { RegisterPayload } from '@/features/auth/types'
import { getErrorMessage } from '@/shared/errors'
import { fieldErrorProps } from '@/shared/forms'

const authStore = useAuthStore()
const router = useRouter()

const showPassword = ref(false)
const submitError = ref<string | null>(null)

const { defineField, handleSubmit, isSubmitting } = useForm<RegisterPayload>({
  validationSchema: toTypedSchema(registerSchema),
  initialValues: {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    username: ''
  }
})

const [firstName, firstNameProps] = defineField('first_name', fieldErrorProps)
const [lastName, lastNameProps] = defineField('last_name', fieldErrorProps)
const [username, usernameProps] = defineField('username', fieldErrorProps)
const [email, emailProps] = defineField('email', fieldErrorProps)
const [password, passwordProps] = defineField('password', fieldErrorProps)

const handleRegister = handleSubmit(async values => {
  submitError.value = null

  try {
    await authStore.register(values)
    await router.push({ name: 'login' })
  } catch (error) {
    submitError.value = getErrorMessage(error, 'Unable to register.')
  }
})
</script>

<template>
  <AuthShell
    title="Register"
    subtitle="Start with a clean slate."
    :sm="11"
    :md="9"
    :lg="6"
    :xl="5"
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

    <v-form @submit.prevent="handleRegister">
      <v-row class="ma-0">
        <v-col
          cols="12"
          sm="6"
          class="pa-0 pe-sm-2 pb-3"
        >
          <v-text-field
            v-model="firstName"
            v-bind="firstNameProps"
            class="auth-field"
            label="First name"
            autocomplete="given-name"
          />
        </v-col>
        <v-col
          cols="12"
          sm="6"
          class="pa-0 ps-sm-2 pb-3"
        >
          <v-text-field
            v-model="lastName"
            v-bind="lastNameProps"
            class="auth-field"
            label="Last name"
            autocomplete="family-name"
          />
        </v-col>
        <v-col
          cols="12"
          class="pa-0 pb-3"
        >
          <v-text-field
            v-model="username"
            v-bind="usernameProps"
            class="auth-field"
            label="Username"
            autocomplete="username"
            prepend-inner-icon="$accountCircleOutline"
            required
          />
        </v-col>
        <v-col
          cols="12"
          class="pa-0 pb-3"
        >
          <v-text-field
            v-model="email"
            v-bind="emailProps"
            class="auth-field"
            label="Email"
            type="email"
            autocomplete="email"
            prepend-inner-icon="$emailOutline"
            required
          />
        </v-col>
        <v-col
          cols="12"
          class="pa-0"
        >
          <v-text-field
            v-model="password"
            v-bind="passwordProps"
            class="auth-field"
            :append-inner-icon="showPassword ? '$eyeOffOutline' : '$eyeOutline'"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            autocomplete="new-password"
            prepend-inner-icon="$lockOutline"
            required
            @click:append-inner="showPassword = !showPassword"
          />
        </v-col>
      </v-row>

      <v-btn
        color="primary"
        size="large"
        type="submit"
        :loading="isSubmitting"
        class="auth-submit mt-6"
        block
      >
        Register
      </v-btn>
    </v-form>

    <template #footer>
      Have an account?
      <router-link
        class="auth-link"
        :to="{ name: 'login' }"
      >
        Sign in
      </router-link>
    </template>
  </AuthShell>
</template>
