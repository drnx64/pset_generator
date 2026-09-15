<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTrackerStore } from '../stores/tracker'
import { useShareLink } from '../composables/useShareLink'
import { BookOpen, Check, AlertCircle, Loader2 } from 'lucide-vue-next'

const store = useTrackerStore()
const router = useRouter()
const { parseLink } = useShareLink()

const error = ref(false)
const importing = ref(false)
const success = ref(false)
const courseCount = ref(0)

onMounted(() => {
  const data = parseLink()
  if (!data) {
    error.value = true
    return
  }
  courseCount.value = data.length
  importing.value = true
  setTimeout(() => {
    store.importCourse(data)
    importing.value = false
    success.value = true
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }, 1500)
})
</script>

<template>
  <div class="min-h-full flex items-center justify-center p-4 sm:p-6">
    <!-- Error state -->
    <div v-if="error" class="text-center space-y-4">
      <AlertCircle class="w-12 h-12 text-text-muted mx-auto" />
      <h2 class="text-lg font-semibold">Invalid or missing link</h2>
      <p class="text-sm text-text-secondary">This share link is invalid or has expired.</p>
    </div>

    <!-- Importing loading modal -->
    <Transition name="fade">
      <div
        v-if="importing"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div class="bg-surface rounded-2xl shadow-xl border border-border p-8 flex flex-col items-center gap-4 max-w-xs w-full mx-4">
          <Loader2 class="w-10 h-10 text-accent animate-spin" />
          <div class="text-center">
            <h2 class="text-sm font-semibold mb-1">Importing problem sets</h2>
            <p class="text-xs text-text-secondary">
              Adding {{ courseCount }} course{{ courseCount !== 1 ? 's' : '' }} with all PSETs and numbers...
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Success state -->
    <Transition name="fade">
      <div
        v-if="success"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div class="bg-surface rounded-2xl shadow-xl border border-border p-8 flex flex-col items-center gap-4 max-w-xs w-full mx-4">
          <div class="w-14 h-14 rounded-full bg-success-light flex items-center justify-center">
            <Check class="w-7 h-7 text-success" />
          </div>
          <div class="text-center">
            <h2 class="text-sm font-semibold mb-1">Imported!</h2>
            <p class="text-xs text-text-secondary">
              {{ courseCount }} course{{ courseCount !== 1 ? 's' : '' }} added. Redirecting...
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
