import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

export function useShareLink() {
  function generateLink(courses) {
    const data = courses.map(course => ({
      code: course.code,
      title: course.title,
      color: course.color,
      psets: course.psets.map(p => ({
        title: p.title,
        dueDate: p.dueDate,
        problems: p.problems.map(prob => ({
          number: prob.number,
          note: prob.note,
        })),
      })),
    }))
    const compressed = compressToEncodedURIComponent(JSON.stringify(data))
    const params = new URLSearchParams()
    params.set('v', '2')
    params.set('d', compressed)
    return `${window.location.origin}/share?${params.toString()}`
  }

  function parseLink() {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('d')) return null
    try {
      const raw = decompressFromEncodedURIComponent(params.get('d'))
      if (!raw) return null
      const data = JSON.parse(raw)
      if (!Array.isArray(data) || !data.length) return null
      if (!data[0].code) return null
      return data
    } catch {
      return null
    }
  }

  return { generateLink, parseLink }
}
