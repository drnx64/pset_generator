<script setup>
import { ref } from 'vue'
import { useTrackerStore } from '../../stores/tracker'
import { useDueDate } from '../../composables/useDueDate'
import DueDateBadge from './DueDateBadge.vue'
import ProblemList from '../problem/ProblemList.vue'
import ConfirmDialog from '../shared/ConfirmDialog.vue'
import ProgressBar from '../shared/ProgressBar.vue'
import { ChevronDown, ChevronRight, Pencil, Trash2, GripVertical, Check } from 'lucide-vue-next'

const props = defineProps({
  pset: { type: Object, required: true },
  index: { type: Number, required: true },
})

const emit = defineEmits(['edit', 'dragstart', 'dragend', 'dragover', 'drop'])

const store = useTrackerStore()
const { status, label } = useDueDate(props.pset.dueDate)

const expanded = ref(props.pset.problems && props.pset.problems.length > 0)
const showDeleteConfirm = ref(false)

const progress = ref({ total: 0, done: 0, pct: 0 })

function updateProgress() {
  if (store.activeCourse) {
    const result = store.getPsetProgress(props.pset)
    progress.value = result
  }
}

function handleToggle() {
  updateProgress()
}

function handleDelete() {
  if (store.activeCourse) {
    store.deletePset(store.activeCourse.id, props.pset.id)
  }
  showDeleteConfirm.value = false
}

function handlePsetCheck() {
  if (store.activeCourse) {
    store.togglePset(store.activeCourse.id, props.pset.id)
    updateProgress()
  }
}

function isPsetCompleted() {
  return store.isPsetCompleted(props.pset)
}

// Drag — only start from grip handle
let canDrag = false

function onGripMouseDown() {
  canDrag = true
}

function onDragStart(e) {
  if (!canDrag) {
    e.preventDefault()
    return
  }
  e.dataTransfer.effectAllowed = 'move'
  emit('dragstart', e, props.index)
}

function onDragEnd(e) {
  canDrag = false
  emit('dragend', e)
}

function onDragOver(e) {
  emit('dragover', e, props.index)
}

function onDrop(e) {
  canDrag = false
  emit('drop', e, props.index)
}

updateProgress()

defineExpose({ updateProgress })
</script>

<template>
  <div
    class="rounded-xl border border-border bg-surface overflow-hidden"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <!-- Header -->
    <div
      class="px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 cursor-pointer select-none hover:bg-surface-hover transition-colors"
      @click="expanded = !expanded"
    >
      <!-- Drag handle — ONLY draggable element -->
      <div
        class="text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing shrink-0 touch-none"
        draggable="true"
        @mousedown="onGripMouseDown"
        @dragstart="onDragStart"
        @dragend="onDragEnd"
        @click.stop
      >
        <GripVertical class="w-4 h-4" />
      </div>

      <!-- PSET checkbox -->
      <button
        @click.stop="handlePsetCheck"
        class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
        :class="isPsetCompleted()
          ? 'bg-success border-success text-white'
          : 'border-border hover:border-accent'"
      >
        <Check v-if="isPsetCompleted()" class="w-3 h-3" />
      </button>

      <button class="text-text-muted shrink-0">
        <ChevronDown v-if="expanded" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>

      <span class="text-xs font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-md shrink-0">
        #{{ pset.number }}
      </span>

      <h3 class="text-sm font-medium flex-1 min-w-0 truncate">{{ pset.title }}</h3>

      <DueDateBadge v-if="pset.dueDate" :date="pset.dueDate" class="hidden sm:inline-flex" />

      <span class="text-[11px] text-text-muted tabular-nums shrink-0">
        {{ progress.done }}/{{ progress.total }}
      </span>

      <!-- Actions -->
      <div class="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <button
          @click.stop="emit('edit', pset)"
          class="p-1.5 rounded-md hover:bg-surface-active transition-colors text-text-muted hover:text-text-secondary hidden sm:flex"
          title="Edit PSET"
        >
          <Pencil class="w-3.5 h-3.5" />
        </button>
        <button
          @click.stop="showDeleteConfirm = true"
          class="p-1.5 rounded-md hover:bg-danger-light transition-colors text-text-muted hover:text-danger"
          title="Delete PSET"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="px-4 pb-2">
      <ProgressBar :percent="progress.pct" />
    </div>

    <!-- Problems -->
    <Transition name="slide">
      <div v-if="expanded" class="border-t border-border">
        <ProblemList :pset="pset" @toggle="handleToggle" />
      </div>
    </Transition>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Delete PSET"
      :message="`Delete PSET #${pset.number} - ${pset.title}? This cannot be undone.`"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
