<script setup>
import { ref, computed } from 'vue'
import { useTrackerStore } from '../../stores/tracker'
import { Plus, Hash } from 'lucide-vue-next'

const emit = defineEmits(['saved'])

const store = useTrackerStore()
const title = ref('')
const dueDate = ref('')
const customNumber = ref('')
const showNumberInput = ref(false)

const nextNumber = computed(() => {
  if (!store.activeCourse) return 1
  if (customNumber.value) return parseInt(customNumber.value) || store.activeCourse.psets.length + 1
  return store.activeCourse.psets.length + 1
})

function save() {
  if (!title.value.trim()) return
  if (!store.activeCourse) return
  const num = customNumber.value ? parseInt(customNumber.value) || undefined : undefined
  store.addPset(store.activeCourse.id, title.value.trim(), dueDate.value || null, num)
  title.value = ''
  dueDate.value = ''
  customNumber.value = ''
  emit('saved')
}
</script>

<template>
  <div class="rounded-xl border border-border bg-surface p-3 space-y-2.5">
    <div class="flex items-center gap-2">
      <button
        @click="showNumberInput = !showNumberInput"
        class="shrink-0 px-2 py-2 text-xs font-semibold rounded-lg transition-colors"
        :class="showNumberInput ? 'bg-accent text-white' : 'bg-accent-light text-accent hover:bg-accent/20'"
        title="Set custom PSET number"
      >
        <div class="flex items-center gap-1">
          <Hash class="w-3.5 h-3.5" />
          <span>{{ nextNumber }}</span>
        </div>
      </button>
      <input
        v-model="title"
        placeholder="PSET title..."
        class="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        @keydown.enter="save"
      />
    </div>
    <div v-if="showNumberInput" class="flex items-center gap-2">
      <input
        v-model="customNumber"
        type="number"
        min="1"
        placeholder="Custom number"
        class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
      />
    </div>
    <div class="flex items-center gap-2">
      <input
        v-model="dueDate"
        type="date"
        class="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
      />
      <button
        @click="save"
        :disabled="!title.trim()"
        class="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors font-medium flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        <Plus class="w-4 h-4" />
        Add
      </button>
    </div>
  </div>
</template>
