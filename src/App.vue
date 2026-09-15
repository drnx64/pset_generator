<script setup>
import { onMounted, ref, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useTrackerStore } from './stores/tracker'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import UndoToast from './components/shared/UndoToast.vue'
import CopyToast from './components/shared/CopyToast.vue'
import { getCourseColor } from './utils/colors'
import { Plus } from 'lucide-vue-next'

const store = useTrackerStore()
const route = useRoute()
const sidebarRef = ref(null)
const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

function openAddCourse() {
  sidebarRef.value?.openAdd()
}

// Copy toast
const showToast = ref(false)
const toastMessage = ref('')
let toastTimeout = null
function showCopyToast(msg) {
  toastMessage.value = msg || 'Copied'
  showToast.value = true
  clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { showToast.value = false }, 2000)
}
provide('showCopyToast', showCopyToast)

onMounted(() => {
  store.load()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <!-- Mobile course pills -->
    <div
      v-if="route.name !== 'share' && store.courses.length > 0"
      class="sm:hidden flex gap-2 px-3 py-2 overflow-x-auto border-b border-border bg-surface shrink-0 scrollbar-none"
    >
      <button
        v-for="course in store.courses"
        :key="course.id"
        @click="store.setActiveCourse(course.id)"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all border"
        :class="store.activeCourseId === course.id
          ? 'bg-accent text-white border-accent'
          : 'bg-surface text-text-secondary border-border hover:border-border-hover'"
      >
        <div
          class="w-2 h-2 rounded-full shrink-0"
          :style="{ backgroundColor: store.activeCourseId === course.id ? '#fff' : getCourseColor(course.color).hex }"
        />
        {{ course.code }}
      </button>
      <!-- + button to add course directly -->
      <button
        @click="openAddCourse"
        class="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all border border-dashed border-border hover:border-accent hover:text-accent text-text-muted"
      >
        <Plus class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <AppSidebar
        v-if="route.name !== 'share'"
        ref="sidebarRef"
        :open="sidebarOpen"
        @close="closeSidebar"
      />
      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>

    <UndoToast />
    <CopyToast :show="showToast" :message="toastMessage" />
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
