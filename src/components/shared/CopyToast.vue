<script setup>
import { ref, watch } from 'vue'
import { Check } from 'lucide-vue-next'

const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: 'Copied' },
})
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="show"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border shadow-lg"
    >
      <div class="w-5 h-5 rounded-full bg-success flex items-center justify-center">
        <Check class="w-3 h-3 text-white" />
      </div>
      <span class="text-sm font-medium">{{ message }}</span>
    </div>
  </Transition>
</template>
