<script setup>
import { ref } from 'vue'
import { useTrackerStore } from '../../stores/tracker'
import { getCourseColor, COLORS } from '../../utils/colors'
import { CURRICULUM } from '../../utils/curriculum'
import { toTitleCase } from '../../utils/helpers'
import SidebarContent from './SidebarContent.vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const store = useTrackerStore()
const showAddModal = ref(false)
const newCode = ref('')
const newTitle = ref('')
const newColor = ref('green')
const editId = ref(null)

function handleCodeInput() {
  const code = newCode.value.trim().toUpperCase()
  if (CURRICULUM[code]) {
    newTitle.value = CURRICULUM[code]
  }
}

function openAdd() {
  editId.value = null
  newCode.value = ''
  newTitle.value = ''
  newColor.value = 'green'
  showAddModal.value = true
}

function openEdit(course) {
  editId.value = course.id
  newCode.value = course.code
  newTitle.value = course.title
  newColor.value = course.color
  showAddModal.value = true
}

function saveCourse() {
  const code = newCode.value.trim().toUpperCase()
  const title = newTitle.value.trim() || toTitleCase(code)
  if (!code) return
  if (editId.value) {
    store.updateCourse(editId.value, { code, title, color: newColor.value })
  } else {
    store.addCourse(code, title, newColor.value)
  }
  showAddModal.value = false
}

function confirmDelete(course) {
  if (confirm(`Delete "${course.code} - ${course.title}"?`)) {
    store.deleteCourse(course.id)
  }
}

function selectCourse(id) {
  store.setActiveCourse(id)
  emit('close')
}

defineExpose({ openAdd })
</script>

<template>
  <!-- Desktop sidebar -->
  <aside class="hidden sm:flex w-64 border-r border-border bg-surface flex-col shrink-0 overflow-hidden">
    <div class="p-3 border-b border-border flex items-center justify-between">
      <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">Courses</span>
      <button
        @click="openAdd"
        class="w-6 h-6 rounded-md flex items-center justify-center hover:bg-surface-active transition-colors text-text-muted hover:text-text-primary"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
    <SidebarContent
      @open-add="openAdd"
      @open-edit="openEdit"
      @confirm-delete="confirmDelete"
      @select-course="selectCourse"
    />
  </aside>

  <!-- Mobile drawer overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/30 z-40 sm:hidden"
        @click="emit('close')"
      />
    </Transition>
    <Transition name="slide-right">
      <div
        v-if="open"
        class="fixed inset-y-0 left-0 w-72 bg-surface border-r border-border z-50 sm:hidden flex flex-col overflow-hidden"
      >
        <div class="p-3 border-b border-border flex items-center justify-between">
          <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">Courses</span>
          <div class="flex items-center gap-1">
            <button
              @click="openAdd"
              class="w-6 h-6 rounded-md flex items-center justify-center hover:bg-surface-active transition-colors text-text-muted"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <button
              @click="emit('close')"
              class="w-6 h-6 rounded-md flex items-center justify-center hover:bg-surface-active transition-colors text-text-muted"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
        <SidebarContent
          @open-add="openAdd"
          @open-edit="openEdit"
          @confirm-delete="confirmDelete"
          @select-course="selectCourse"
        />
      </div>
    </Transition>
  </Teleport>

  <!-- Add/Edit Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showAddModal"
        class="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4"
        @click.self="showAddModal = false"
      >
        <div class="bg-surface rounded-t-2xl sm:rounded-xl shadow-lg border border-border w-full sm:max-w-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold">{{ editId ? 'Edit Course' : 'Add Course' }}</h3>

          <div class="space-y-3">
            <div>
              <label class="text-xs font-medium text-text-secondary block mb-1">Course Code</label>
              <input
                v-model="newCode"
                @input="handleCodeInput"
                list="curriculum-codes"
                placeholder="e.g. CE 221"
                class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
              <datalist id="curriculum-codes">
                <option v-for="(title, code) in CURRICULUM" :key="code" :value="code">{{ title }}</option>
              </datalist>
            </div>

            <div>
              <label class="text-xs font-medium text-text-secondary block mb-1">Title</label>
              <input
                v-model="newTitle"
                placeholder="e.g. Mechanics of Deformable Bodies"
                class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            <div>
              <label class="text-xs font-medium text-text-secondary block mb-1">Color</label>
              <div class="flex gap-2">
                <button
                  v-for="color in COLORS"
                  :key="color.id"
                  @click="newColor = color.id"
                  class="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center"
                  :class="newColor === color.id ? 'border-text-primary scale-110' : 'border-transparent'"
                  :style="{ backgroundColor: color.hex }"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              @click="showAddModal = false"
              class="px-3 py-1.5 text-sm rounded-lg hover:bg-surface-active transition-colors"
            >
              Cancel
            </button>
            <button
              @click="saveCourse"
              class="px-3 py-1.5 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors font-medium"
            >
              {{ editId ? 'Save' : 'Add' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
