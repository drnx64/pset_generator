<script setup>
import { ref } from 'vue'
import { useTrackerStore } from '../../stores/tracker'
import { parseProblemInput } from '../../utils/helpers'
import ProblemItem from './ProblemItem.vue'
import { Plus } from 'lucide-vue-next'

const props = defineProps({
  pset: { type: Object, required: true },
})

const emit = defineEmits(['toggle'])

const store = useTrackerStore()
const newNumber = ref('')

function addProblems() {
  const raw = newNumber.value.trim()
  if (!raw) return
  const numbers = parseProblemInput(raw)
  if (numbers.length && store.activeCourse) {
    store.addProblems(store.activeCourse.id, props.pset.id, numbers)
    newNumber.value = ''
  }
}

function handleToggle() {
  emit('toggle')
}
</script>

<template>
  <div class="p-3 space-y-1">
    <ProblemItem
      v-for="problem in pset.problems"
      :key="problem.id"
      :problem="problem"
      @toggle="handleToggle"
    />

    <div v-if="pset.problems.length === 0" class="text-center py-8">
      <p class="text-xs text-text-muted">No problem numbers yet</p>
    </div>

    <!-- Add problems input -->
    <div class="flex items-center gap-2 pt-2 mt-2 border-t border-border">
      <input
        v-model="newNumber"
        placeholder="1, 2, 3, 5, 8 or 4.15-4.30"
        class="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        @keydown.enter="addProblems"
      />
      <button
        @click="addProblems"
        class="p-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors shrink-0"
      >
        <Plus class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
