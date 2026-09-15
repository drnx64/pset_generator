<script setup>
import { useTrackerStore } from '../../stores/tracker'
import { getCourseColor } from '../../utils/colors'
import { Plus, Trash2, ChevronRight } from 'lucide-vue-next'
import ProgressBar from '../shared/ProgressBar.vue'

const props = defineProps({
  showAddButton: { type: Boolean, default: true },
})

const emit = defineEmits(['openAdd', 'openEdit', 'confirmDelete', 'selectCourse'])

const store = useTrackerStore()
</script>

<template>
  <div class="flex-1 overflow-y-auto p-2 space-y-0.5">
    <div v-if="store.courses.length === 0" class="text-center py-8">
      <p class="text-xs text-text-muted">No courses yet</p>
      <button @click="emit('openAdd')" class="text-xs text-accent hover:text-accent-hover mt-1">
        Add your first course
      </button>
    </div>

    <button
      v-for="course in store.courses"
      :key="course.id"
      @click="emit('selectCourse', course.id)"
      class="w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 group transition-colors"
      :class="store.activeCourseId === course.id ? 'bg-surface-active' : 'hover:bg-surface-hover'"
    >
      <div
        class="w-2.5 h-2.5 rounded-full shrink-0"
        :style="{ backgroundColor: getCourseColor(course.color).hex }"
      />
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate">{{ course.code }}</div>
        <div class="text-[11px] text-text-muted truncate">{{ course.title }}</div>
        <ProgressBar
          :percent="store.getCourseProgress(course).pct"
          class="mt-1"
        />
      </div>
      <div class="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          @click.stop="emit('openEdit', course)"
          class="p-1 rounded hover:bg-surface transition-colors text-text-muted hover:text-text-secondary"
        >
          <ChevronRight class="w-3 h-3" />
        </button>
        <button
          @click.stop="emit('confirmDelete', course)"
          class="p-1 rounded hover:bg-danger-light transition-colors text-text-muted hover:text-danger"
        >
          <Trash2 class="w-3 h-3" />
        </button>
      </div>
    </button>
  </div>
</template>
