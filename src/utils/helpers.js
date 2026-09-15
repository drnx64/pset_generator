let counter = 0

export function uuid() {
  counter++
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${ts}-${rand}-${counter}`
}

export function toTitleCase(str) {
  if (!str) return ''
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i
  return str
    .split(' ')
    .map((word, index, array) => {
      if (index > 0 && index < array.length - 1 && smallWords.test(word)) return word.toLowerCase()
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dateStr + 'T00:00:00')
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
  return diff
}

export function parseProblemInput(raw) {
  if (!raw) return []
  const results = []
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean)
  for (const part of parts) {
    const rangeMatch = part.match(/^(.+?)\s*-\s*(.+)$/)
    if (rangeMatch) {
      const start = rangeMatch[1].trim()
      const end = rangeMatch[2].trim()
      const expanded = expandRange(start, end)
      for (const num of expanded) {
        if (!results.includes(num)) results.push(num)
      }
    } else {
      if (!results.includes(part)) results.push(part)
    }
  }
  return results
}

function expandRange(start, end) {
  const results = []
  if (start.includes('.') || end.includes('.')) {
    const sParts = start.split('.')
    const eParts = end.split('.')
    const sMajor = parseInt(sParts[0]) || 0
    const sMinor = parseInt(sParts[1]) || 0
    const eMajor = parseInt(eParts[0]) || 0
    const eMinor = parseInt(eParts[1]) || 0
    if (sMajor === eMajor) {
      for (let i = sMinor; i <= eMinor; i++) {
        results.push(`${sMajor}.${i}`)
      }
    } else {
      for (let major = sMajor; major <= eMajor; major++) {
        const startMin = major === sMajor ? sMinor : 0
        const endMin = major === eMajor ? eMinor : 99
        for (let minor = startMin; minor <= endMin; minor++) {
          results.push(`${major}.${minor}`)
        }
      }
    }
  } else {
    const s = parseInt(start) || 0
    const e = parseInt(end) || 0
    const step = s <= e ? 1 : -1
    for (let i = s; step > 0 ? i <= e : i >= e; i += step) {
      results.push(String(i))
    }
  }
  return results
}
