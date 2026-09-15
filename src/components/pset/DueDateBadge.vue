<script setup>
import { useDueDate } from '../../composables/useDueDate'
import { formatDate } from '../../utils/helpers'
import { CalendarClock } from 'lucide-vue-next'

const props = defineProps({
  date: { type: String, required: true },
})

const { status, label } = useDueDate(props.date)

const badgeClasses = {
  overdue: 'bg-danger-light text-danger',
  today: 'bg-warning-light text-warning',
  soon: 'bg-warning-light text-amber-600',
  ok: 'bg-surface-active text-text-secondary',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
    :class="badgeClasses[status]"
  >
    <CalendarClock class="w-3 h-3" />
    {{ label }}
  </span>
</template>
