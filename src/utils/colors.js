export const COLORS = [
  { id: 'green', hex: '#22c55e', label: 'Green' },
  { id: 'blue', hex: '#3b82f6', label: 'Blue' },
  { id: 'purple', hex: '#a855f7', label: 'Purple' },
  { id: 'orange', hex: '#f97316', label: 'Orange' },
  { id: 'pink', hex: '#ec4899', label: 'Pink' },
  { id: 'cyan', hex: '#06b6d4', label: 'Cyan' },
  { id: 'yellow', hex: '#eab308', label: 'Yellow' },
  { id: 'red', hex: '#ef4444', label: 'Red' },
]

export const PSET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
]

export function getCourseColor(colorId) {
  return COLORS.find(c => c.id === colorId) || COLORS[0]
}

export function getRandomPsetColor() {
  return PSET_COLORS[Math.floor(Math.random() * PSET_COLORS.length)]
}
