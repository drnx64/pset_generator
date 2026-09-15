<script setup>
import { computed } from 'vue'

const props = defineProps({
  percent: { type: Number, default: 0 },
  showLabel: { type: Boolean, default: false },
})

const colorClass = computed(() => {
  if (props.percent >= 70) return 'bg-success'
  if (props.percent >= 30) return 'bg-warning'
  return 'bg-danger'
})
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex-1 h-1 rounded-full bg-border overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="colorClass"
        :style="{ width: percent + '%' }"
      />
    </div>
    <span v-if="showLabel" class="text-[11px] text-text-muted tabular-nums">{{ percent }}%</span>
  </div>
</template>
