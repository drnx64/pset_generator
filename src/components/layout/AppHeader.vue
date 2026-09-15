<script setup>
import { inject } from 'vue'
import { useTrackerStore } from '../../stores/tracker'
import { useClipboard } from '../../composables/useClipboard'
import { useShareLink } from '../../composables/useShareLink'
import { BookOpen, Menu, Copy, Link2 } from 'lucide-vue-next'

defineEmits(['toggleSidebar'])

const store = useTrackerStore()
const { copyText } = useClipboard()
const { generateLink } = useShareLink()
const showCopyToast = inject('showCopyToast')

function copyAllTree() {
  if (!store.courses.length) return
  copyText(store.copyAllAsTree())
  showCopyToast('All courses tree copied')
}

function copyAllLink() {
  if (!store.courses.length) return
  copyText(generateLink(store.courses))
  showCopyToast('All courses link copied')
}
</script>

<template>
  <header class="h-12 sm:h-14 border-b border-border flex items-center justify-between px-3 sm:px-4 shrink-0 bg-surface">
    <div class="flex items-center gap-2.5">
      <button
        @click="$emit('toggleSidebar')"
        class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-active transition-colors text-text-secondary sm:hidden"
      >
        <Menu class="w-5 h-5" />
      </button>
      <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
        <BookOpen class="w-4 h-4 text-white" />
      </div>
      <h1 class="text-sm font-semibold tracking-tight">PSET Tracker</h1>
    </div>
    <div v-if="store.courses.length" class="flex items-center gap-1">
      <button
        @click="copyAllTree"
        class="p-2 rounded-lg hover:bg-surface-active transition-colors text-text-muted hover:text-text-secondary"
        title="Copy all courses as ASCII tree"
      >
        <Copy class="w-4 h-4" />
      </button>
      <button
        @click="copyAllLink"
        class="p-2 rounded-lg hover:bg-surface-active transition-colors text-text-muted hover:text-text-secondary"
        title="Copy share link for all courses"
      >
        <Link2 class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>
