<script setup>
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: '' },
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
        @click.self="$emit('cancel')"
      >
        <div class="bg-surface rounded-xl shadow-lg border border-border w-full max-w-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold">{{ title }}</h3>
          <p class="text-sm text-text-secondary">{{ message }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button
              @click="$emit('cancel')"
              class="px-3 py-1.5 text-sm rounded-lg hover:bg-surface-active transition-colors"
            >
              Cancel
            </button>
            <button
              @click="$emit('confirm')"
              class="px-3 py-1.5 text-sm rounded-lg bg-danger text-white hover:bg-danger-hover transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
