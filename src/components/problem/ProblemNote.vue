<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useTrackerStore } from '../../stores/tracker'

const props = defineProps({
  problem: { type: Object, required: true },
})

const emit = defineEmits(['close', 'saved'])

const store = useTrackerStore()
const noteText = ref(props.problem.note || '')
const textarea = ref(null)

onMounted(async () => {
  await nextTick()
  textarea.value?.focus()
})

function save() {
  const trimmed = noteText.value.trim()
  if (store.activeCourse) {
    const pset = store.activeCourse.psets.find(p =>
      p.problems.some(prob => prob.id === props.problem.id)
    )
    if (pset) {
      store.updateProblemNote(store.activeCourse.id, pset.id, props.problem.id, trimmed || null)
    }
  }
  emit('saved', !!trimmed)
  emit('close')
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    save()
  }
}
</script>

<template>
  <textarea
    ref="textarea"
    v-model="noteText"
    placeholder="Add a note..."
    rows="2"
    class="w-full px-3 py-2 text-xs rounded-lg border border-accent/30 bg-accent-light/30 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
    @blur="save"
    @keydown="handleKeydown"
  />
</template>
