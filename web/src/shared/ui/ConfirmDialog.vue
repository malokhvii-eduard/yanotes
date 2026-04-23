<script setup lang="ts">
const model = defineModel<boolean>({ required: true })

const {
  confirmLabel = 'Confirm',
  loading = false,
  text,
  title
} = defineProps<{
  confirmLabel?: string
  loading?: boolean
  text: string
  title: string
}>()

const emit = defineEmits<{
  confirm: []
}>()
</script>

<template>
  <v-dialog
    v-model="model"
    max-width="460"
  >
    <v-card
      class="confirm-dialog"
      elevation="0"
    >
      <v-card-title class="confirm-dialog__title">
        {{ title }}
      </v-card-title>

      <v-card-text class="confirm-dialog__text">
        {{ text }}
      </v-card-text>

      <v-card-actions class="confirm-dialog__actions">
        <v-spacer />
        <v-btn
          class="confirm-dialog__cancel"
          variant="text"
          @click="model = false"
        >
          Keep
        </v-btn>
        <v-btn
          class="confirm-dialog__confirm"
          color="error"
          variant="text"
          :loading="loading"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
