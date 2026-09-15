<script setup>
import { ref } from 'vue'
import { useTrackerStore } from '../../stores/tracker'
import ProblemNote from './ProblemNote.vue'
import { Check, StickyNote, X } from 'lucide-vue-next'

const props = defineProps({
  problem: { type: Object, required: true },
})

const emit = defineEmits(['toggle'])

const store = useTrackerStore()
const editingNote = ref(false)

function toggle() {
  if (store.activeCourse) {
    const pset = store.activeCourse.psets.find(p =>
      p.problems.some(prob => prob.id === props.problem.id)
    )
    if (pset) {
      store.toggleProblem(store.activeCourse.id, pset.id, props.problem.id)
      emit('toggle')
    }
  }
}

function deleteProblem() {
  if (store.activeCourse) {
    const pset = store.activeCourse.psets.find(p =>
      p.problems.some(prob => prob.id === props.problem.id)
    )
    if (pset) {
      store.deleteProblem(store.activeCourse.id, pset.id, props.problem.id)
      emit('toggle')
    }
  }
}

function startEditNote() {
  editingNote.value = true
}

function stopEditNote() {
  editingNote.value = false
}
</script>

<template>
  <div class="group">
    <div
      class="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-surface-hover transition-colors"
      :class="problem.completed ? 'opacity-60' : ''"
    >
      <!-- Checkbox -->
      <button
        @click="toggle"
        class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
        :class="problem.completed
          ? 'bg-accent border-accent text-white'
          : 'border-border hover:border-border-hover'"
      >
        <Check v-if="problem.completed" class="w-3 h-3" />
      </button>

      <!-- Number -->
      <span
        class="text-sm tabular-nums min-w-[2rem]"
        :class="problem.completed ? 'line-through text-text-muted' : 'font-medium'"
      >
        {{ problem.number }}
      </span>

      <div class="flex-1" />

      <button
        v-if="problem.note && !editingNote"
        @click="startEditNote"
        class="p-1 rounded text-accent"
        title="View note"
      >
        <StickyNote class="w-3.5 h-3.5" />
      </button>

      <button
        v-else-if="!problem.note && !editingNote"
        @click="startEditNote"
        class="p-1 rounded hover:bg-surface-active transition-colors text-text-muted hover:text-text-secondary sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        title="Add note"
      >
        <StickyNote class="w-3.5 h-3.5" />
      </button>

      <button
        @click="deleteProblem"
        class="p-1 rounded hover:bg-danger-light transition-colors text-text-muted hover:text-danger sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        title="Remove"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Note preview — always shown if exists and not editing -->
    <div
      v-if="problem.note && !editingNote"
      class="px-2 pb-1 ml-7"
    >
      <div
        @click="startEditNote"
        class="w-full px-3 py-2 text-xs rounded-lg border border-border/50 bg-surface-hover text-text-secondary cursor-text break-words"
      >
        {{ problem.note }}
      </div>
    </div>

    <!-- Note editor — only when editing -->
    <div v-if="editingNote" class="px-2 pb-1 ml-7">
      <ProblemNote
        :problem="problem"
        @close="stopEditNote"
        @saved="stopEditNote"
      />
    </div>
  </div>
</template>
