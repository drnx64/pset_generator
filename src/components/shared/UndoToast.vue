<script setup>
import { useTrackerStore } from '../../stores/tracker'
import { RotateCcw } from 'lucide-vue-next'

const store = useTrackerStore()
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="store.showUndoToast"
      class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-text-primary text-white rounded-full px-4 py-2.5 flex items-center gap-3 shadow-lg text-sm font-medium"
    >
      <span>Action completed</span>
      <button
        @click="store.undoDelete()"
        class="flex items-center gap-1.5 text-accent-light hover:text-white transition-colors font-semibold"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        Undo
      </button>
    </div>
  </Transition>
</template>
