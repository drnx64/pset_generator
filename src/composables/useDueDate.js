import { computed } from 'vue'
import { getDaysUntil } from '../utils/helpers'

export function useDueDate(dateStr) {
  const daysLeft = computed(() => getDaysUntil(dateStr))

  const status = computed(() => {
    if (daysLeft.value === null) return 'none'
    if (daysLeft.value < 0) return 'overdue'
    if (daysLeft.value === 0) return 'today'
    if (daysLeft.value <= 3) return 'soon'
    return 'ok'
  })

  const label = computed(() => {
    if (daysLeft.value === null) return ''
    if (daysLeft.value < 0) return `${Math.abs(daysLeft.value)}d overdue`
    if (daysLeft.value === 0) return 'Due today'
    if (daysLeft.value === 1) return '1 day left'
    return `${daysLeft.value} days left`
  })

  return { daysLeft, status, label }
}
