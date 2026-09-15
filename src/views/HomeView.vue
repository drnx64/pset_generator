<script setup>
import { ref, inject } from 'vue'
import { useTrackerStore } from '../stores/tracker'
import { useClipboard } from '../composables/useClipboard'
import { useShareLink } from '../composables/useShareLink'
import { getCourseColor } from '../utils/colors'
import PsetCard from '../components/pset/PsetCard.vue'
import PsetForm from '../components/pset/PsetForm.vue'
import { BookOpen, Copy, Link2 } from 'lucide-vue-next'

const store = useTrackerStore()
const { copyText } = useClipboard()
const { generateLink } = useShareLink()
const showCopyToast = inject('showCopyToast')
const editingPset = ref(null)
const showEditForm = ref(false)
const dragIndex = ref(null)

function copyTree() {
  if (!store.activeCourse) return
  copyText(store.copyAsTree(store.activeCourse))
  showCopyToast('Tree copied')
}

function copyLink() {
  if (!store.activeCourse) return
  copyText(generateLink(store.activeCourse))
  showCopyToast('Link copied')
}

function startEditPset(pset) {
  editingPset.value = pset
  showEditForm.value = true
}

function closeEditForm() {
  showEditForm.value = false
  editingPset.value = null
}

function handlePsetSaved() {
  setTimeout(() => {
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }, 50)
}

// Drag and drop
function onDragstart(e, index) {
  dragIndex.value = index
  e.dataTransfer.effectAllowed = 'move'
  e.target.closest('.rounded-xl')?.classList.add('dragging')
}

function onDragend(e) {
  dragIndex.value = null
  e.target.closest('.rounded-xl')?.classList.remove('dragging')
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
}

function onDragover(e, index) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
  const card = e.target.closest('.rounded-xl')
  if (card) card.classList.add('drag-over')
}

function onDrop(e, toIndex) {
  e.preventDefault()
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
  if (dragIndex.value === null || dragIndex.value === toIndex) return
  if (!store.activeCourse) return
  store.reorderPset(store.activeCourse.id, dragIndex.value, toIndex)
  dragIndex.value = null
}
</script>

<template>
  <!-- Empty state -->
  <div v-if="!store.activeCourse" class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8">
    <div class="w-16 h-16 rounded-2xl bg-surface-active flex items-center justify-center mb-4">
      <BookOpen class="w-8 h-8 text-text-muted" />
    </div>
    <h2 class="text-lg font-semibold mb-1">PSET Tracker</h2>
    <p class="text-sm text-text-secondary max-w-xs mb-6">
      Track your problem sets across courses. Select a course from the top or add a new one.
    </p>
  </div>

  <!-- Course selected -->
  <div v-else class="p-4 sm:p-6 max-w-3xl mx-auto">
    <!-- Course Header with copy buttons -->
    <div class="mb-4 sm:mb-6">
      <div class="flex items-center gap-2.5 mb-1">
        <div
          class="w-3 h-3 rounded-full shrink-0"
          :style="{ backgroundColor: getCourseColor(store.activeCourse.color).hex }"
        />
        <h2 class="text-base sm:text-lg font-semibold">{{ store.activeCourse.code }}</h2>
        <!-- Copy buttons -->
        <div class="flex items-center gap-1 ml-auto">
          <button
            @click="copyTree"
            class="p-1.5 rounded-md hover:bg-surface-active transition-colors text-text-muted hover:text-text-secondary"
            title="Copy course as ASCII tree"
          >
            <Copy class="w-4 h-4" />
          </button>
          <button
            @click="copyLink"
            class="p-1.5 rounded-md hover:bg-surface-active transition-colors text-text-muted hover:text-text-secondary"
            title="Copy share link"
          >
            <Link2 class="w-4 h-4" />
          </button>
        </div>
      </div>
      <p class="text-xs sm:text-sm text-text-secondary ml-5.5">{{ store.activeCourse.title }}</p>
    </div>

    <!-- PSET form at top -->
    <div class="mb-4">
      <PsetForm @saved="handlePsetSaved" />
    </div>

    <!-- PSET List -->
    <div class="space-y-3">
      <PsetCard
        v-for="(pset, index) in store.activeCourse.psets"
        :key="pset.id"
        :pset="pset"
        :index="index"
        @edit="startEditPset"
        @dragstart="onDragstart"
        @dragend="onDragend"
        @dragover="onDragover"
        @drop="onDrop"
      />

      <div v-if="store.activeCourse.psets.length === 0" class="text-center py-12">
        <p class="text-sm text-text-muted mb-2">No problem sets yet</p>
        <p class="text-xs text-text-muted">Add your first PSET above</p>
      </div>
    </div>

    <!-- Edit modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showEditForm"
          class="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          @click.self="closeEditForm"
        >
          <div class="bg-surface rounded-t-2xl sm:rounded-xl shadow-lg border border-border w-full sm:max-w-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold">Edit PSET</h3>
            <div class="space-y-3">
              <div>
                <label class="text-xs font-medium text-text-secondary block mb-1">Title</label>
                <input
                  v-model="editingPset.title"
                  class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  @keydown.enter="store.updatePset(store.activeCourse.id, editingPset.id, { title: editingPset.title }); closeEditForm()"
                />
              </div>
              <div>
                <label class="text-xs font-medium text-text-secondary block mb-1">Due Date</label>
                <input
                  v-model="editingPset.dueDate"
                  type="date"
                  class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                @click="closeEditForm"
                class="px-3 py-1.5 text-sm rounded-lg hover:bg-surface-active transition-colors"
              >
                Cancel
              </button>
              <button
                @click="store.updatePset(store.activeCourse.id, editingPset.id, { title: editingPset.title, dueDate: editingPset.dueDate }); closeEditForm()"
                class="px-3 py-1.5 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
