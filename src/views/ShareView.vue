<script setup>
import { ref, onMounted } from 'vue'
import { useTrackerStore } from '../stores/tracker'
import { useShareLink } from '../composables/useShareLink'
import { getCourseColor } from '../utils/colors'
import { BookOpen, Check, Download, AlertCircle } from 'lucide-vue-next'

const store = useTrackerStore()
const { parseLink } = useShareLink()

const data = ref(null)
const error = ref(false)
const imported = ref(false)

onMounted(() => {
  const parsed = parseLink()
  if (parsed) {
    data.value = parsed
  } else {
    error.value = true
  }
})

function importCourse() {
  if (!data.value) return
  store.importCourse(data.value)
  imported.value = true
}
</script>

<template>
  <div class="min-h-full flex items-center justify-center p-4 sm:p-6">
    <!-- Error state -->
    <div v-if="error" class="text-center space-y-4">
      <AlertCircle class="w-12 h-12 text-text-muted mx-auto" />
      <h2 class="text-lg font-semibold">Invalid or missing link</h2>
      <p class="text-sm text-text-secondary">This share link is invalid or has expired.</p>
    </div>

    <!-- Success after import -->
    <div v-else-if="imported" class="text-center space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-success-light flex items-center justify-center mx-auto">
        <Check class="w-8 h-8 text-success" />
      </div>
      <h2 class="text-lg font-semibold">Course imported!</h2>
      <p class="text-sm text-text-secondary">The course has been added to your tracker.</p>
    </div>

    <!-- Shared course preview -->
    <div v-else-if="data" class="w-full max-w-lg">
      <div class="rounded-xl border border-border bg-surface overflow-hidden">
        <!-- Course header -->
        <div class="px-5 py-4 border-b border-border">
          <div class="flex items-center gap-2 mb-1">
            <BookOpen class="w-4 h-4 text-accent" />
            <span class="text-xs font-medium text-text-secondary">{{ data.code }}</span>
          </div>
          <h2 class="text-lg font-semibold">{{ data.title }}</h2>
          <p class="text-xs text-text-muted mt-1">
            {{ data.psets.length }} problem set{{ data.psets.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <!-- PSETs preview -->
        <div class="divide-y divide-border max-h-80 overflow-y-auto">
          <div
            v-for="(pset, i) in data.psets"
            :key="i"
            class="px-5 py-3"
          >
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-xs font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-md">
                #{{ i + 1 }}
              </span>
              <span class="text-sm font-medium">{{ pset.title }}</span>
            </div>
            <div class="ml-8 space-y-0.5">
              <div
                v-for="(prob, j) in pset.problems"
                :key="j"
                class="flex items-center gap-2 text-xs text-text-secondary"
              >
                <div class="w-3.5 h-3.5 rounded border border-border shrink-0" />
                <span class="tabular-nums">{{ prob.number }}</span>
                <span v-if="prob.note" class="text-text-muted italic truncate">{{ prob.note }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Import button -->
        <div class="px-4 py-3 border-t border-border">
          <button
            @click="importCourse"
            class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors font-medium"
          >
            <Download class="w-4 h-4" />
            Import to my tracker
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
