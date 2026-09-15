import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { uuid, toTitleCase } from '../utils/helpers'
import { getRandomPsetColor } from '../utils/colors'

const STORAGE_KEY = 'pset-tracker-v2'

export const useTrackerStore = defineStore('tracker', () => {
  const courses = ref([])
  const activeCourseId = ref(null)
  const undoStack = ref([])
  const undoTimeout = ref(null)

  const activeCourse = computed(() =>
    courses.value.find(c => c.id === activeCourseId.value) || null
  )

  function getCourseProgress(course) {
    if (!course || !course.psets.length) return { total: 0, done: 0, pct: 0 }
    let total = 0
    let done = 0
    course.psets.forEach(p => {
      if (p.problems.length === 0) {
        total++
        if (p.completed) done++
      } else {
        p.problems.forEach(prob => {
          total++
          if (prob.completed) done++
        })
      }
    })
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    return { total, done, pct }
  }

  function getPsetProgress(pset) {
    if (pset.problems.length === 0) {
      return { total: 0, done: 0, pct: pset.completed ? 100 : 0 }
    }
    const total = pset.problems.length
    const done = pset.problems.filter(p => p.completed).length
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    return { total, done, pct }
  }

  function isPsetCompleted(pset) {
    if (pset.problems.length === 0) return !!pset.completed
    return pset.problems.every(p => p.completed)
  }

  function renumberPsets(courseId) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return
    course.psets.forEach((p, i) => {
      p.number = i + 1
    })
  }

  // Course CRUD — auto-random color
  function addCourse(code, title, color) {
    const course = { id: uuid(), code, title: toTitleCase(title || code), color: color || getRandomPsetColor(), psets: [] }
    courses.value.push(course)
    activeCourseId.value = course.id
    save()
    return course
  }

  function updateCourse(id, updates) {
    const course = courses.value.find(c => c.id === id)
    if (course) {
      if (updates.title) updates.title = toTitleCase(updates.title)
      Object.assign(course, updates)
      save()
    }
  }

  function deleteCourse(id) {
    const idx = courses.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      const removed = courses.value.splice(idx, 1)[0]
      if (activeCourseId.value === id) {
        activeCourseId.value = courses.value.length ? courses.value[0].id : null
      }
      save()
      pushUndo({ type: 'course', data: removed, index: idx })
    }
  }

  function setActiveCourse(id) {
    activeCourseId.value = id
    save()
  }

  // PSET CRUD — no color field, optional number
  function addPset(courseId, title, dueDate, number) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return null
    const pset = {
      id: uuid(),
      number: number || course.psets.length + 1,
      title: toTitleCase(title),
      dueDate: dueDate || null,
      completed: false,
      problems: [],
    }
    course.psets.push(pset)
    if (number) {
      course.psets.sort((a, b) => a.number - b.number)
    }
    save()
    return pset
  }

  function updatePset(courseId, psetId, updates) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return
    const pset = course.psets.find(p => p.id === psetId)
    if (pset) {
      if (updates.title) updates.title = toTitleCase(updates.title)
      Object.assign(pset, updates)
      save()
    }
  }

  function deletePset(courseId, psetId) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return
    const idx = course.psets.findIndex(p => p.id === psetId)
    if (idx !== -1) {
      const removed = course.psets.splice(idx, 1)[0]
      renumberPsets(courseId)
      save()
      pushUndo({ type: 'pset', data: removed, courseId, index: idx })
    }
  }

  function reorderPset(courseId, fromIdx, toIdx) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return
    const [moved] = course.psets.splice(fromIdx, 1)
    course.psets.splice(toIdx, 0, moved)
    renumberPsets(courseId)
    save()
  }

  // Toggle entire PSET
  function togglePset(courseId, psetId) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return
    const pset = course.psets.find(p => p.id === psetId)
    if (!pset) return
    if (pset.problems.length === 0) {
      pset.completed = !pset.completed
    } else {
      const allDone = pset.problems.every(p => p.completed)
      pset.problems.forEach(p => { p.completed = !allDone })
    }
    save()
  }

  // Problem CRUD
  function addProblem(courseId, psetId, number) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return null
    const pset = course.psets.find(p => p.id === psetId)
    if (!pset) return null
    const problem = { id: uuid(), number, completed: false, note: null }
    pset.problems.push(problem)
    save()
    return problem
  }

  function addProblems(courseId, psetId, numbers) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return
    const pset = course.psets.find(p => p.id === psetId)
    if (!pset) return
    numbers.forEach(num => {
      if (!pset.problems.find(p => p.number === num)) {
        pset.problems.push({ id: uuid(), number: num, completed: false, note: null })
      }
    })
    save()
  }

  function toggleProblem(courseId, psetId, problemId) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return
    const pset = course.psets.find(p => p.id === psetId)
    if (!pset) return
    const problem = pset.problems.find(p => p.id === problemId)
    if (problem) {
      problem.completed = !problem.completed
      save()
    }
  }

  function updateProblemNote(courseId, psetId, problemId, note) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return
    const pset = course.psets.find(p => p.id === psetId)
    if (!pset) return
    const problem = pset.problems.find(p => p.id === problemId)
    if (problem) {
      problem.note = note || null
      save()
    }
  }

  function deleteProblem(courseId, psetId, problemId) {
    const course = courses.value.find(c => c.id === courseId)
    if (!course) return
    const pset = course.psets.find(p => p.id === psetId)
    if (!pset) return
    const idx = pset.problems.findIndex(p => p.id === problemId)
    if (idx !== -1) {
      const removed = pset.problems.splice(idx, 1)[0]
      save()
      pushUndo({ type: 'problem', data: removed, courseId, psetId, index: idx })
    }
  }

  // Import course(s) from share link — single object or array
  function importCourse(courseData) {
    const items = Array.isArray(courseData) ? courseData : [courseData]
    items.forEach(c => {
      if (!c.code) return
      const existing = courses.value.find(e => e.code === c.code)
      if (existing) {
        existing.title = toTitleCase(c.title || existing.title)
        if (c.color) existing.color = c.color
        c.psets.forEach(psetData => {
          const alreadyExists = existing.psets.find(p => p.title === toTitleCase(psetData.title))
          if (!alreadyExists) {
            existing.psets.push({
              id: uuid(),
              number: existing.psets.length + 1,
              title: toTitleCase(psetData.title),
              dueDate: psetData.dueDate || null,
              completed: false,
              problems: (psetData.problems || []).map(p => ({
                id: uuid(),
                number: p.number,
                completed: false,
                note: p.note || null,
              })),
            })
          }
        })
        renumberPsets(existing.id)
      } else {
        const course = {
          id: uuid(),
          code: c.code,
          title: toTitleCase(c.title || c.code),
          color: c.color || getRandomPsetColor(),
          psets: (c.psets || []).map((p, i) => ({
            id: uuid(),
            number: i + 1,
            title: toTitleCase(p.title),
            dueDate: p.dueDate || null,
            completed: false,
            problems: (p.problems || []).map(prob => ({
              id: uuid(),
              number: prob.number,
              completed: false,
              note: prob.note || null,
            })),
          })),
        }
        courses.value.push(course)
        activeCourseId.value = course.id
      }
    })
    save()
  }

  // Undo support
  function pushUndo(entry) {
    undoStack.value = [entry]
    clearTimeout(undoTimeout.value)
    undoTimeout.value = setTimeout(() => {
      undoStack.value = []
    }, 5000)
  }

  function undoDelete() {
    if (!undoStack.value.length) return
    const entry = undoStack.value.pop()
    clearTimeout(undoTimeout.value)

    if (entry.type === 'course') {
      courses.value.splice(entry.index, 0, entry.data)
    } else if (entry.type === 'pset') {
      const course = courses.value.find(c => c.id === entry.courseId)
      if (course) {
        course.psets.splice(entry.index, 0, entry.data)
        renumberPsets(entry.courseId)
      }
    } else if (entry.type === 'problem') {
      const course = courses.value.find(c => c.id === entry.courseId)
      if (course) {
        const pset = course.psets.find(p => p.id === entry.psetId)
        if (pset) pset.problems.splice(entry.index, 0, entry.data)
      }
    }
    save()
  }

  const showUndoToast = computed(() => undoStack.value.length > 0)

  // ASCII tree copy
  function copyAsTree(course) {
    let text = `${course.code} — ${course.title}\n`
    course.psets.forEach((pset, i) => {
      const isLast = i === course.psets.length - 1
      const prefix = isLast ? '└── ' : '├── '
      const childPrefix = isLast ? '    ' : '│   '
      text += `${prefix}PSET #${pset.number} — ${pset.title}\n`
      pset.problems.forEach((prob, j) => {
        const isLastProb = j === pset.problems.length - 1
        const probPrefix = isLastProb ? '└── ' : '├── '
        const check = prob.completed ? 'x' : ' '
        text += `${childPrefix}${probPrefix}[${check}] ${prob.number}`
        if (prob.note) text += ` — ${prob.note}`
        text += '\n'
      })
    })
    return text
  }

  // Persistence
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      courses: courses.value,
      activeCourseId: activeCourseId.value,
    }))
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        courses.value = data.courses || []
        activeCourseId.value = data.activeCourseId || null
      } catch {
        courses.value = []
        activeCourseId.value = null
      }
    }
    migrateLegacy()
  }

  function migrateLegacy() {
    if (courses.value.length > 0) return
    const raw = localStorage.getItem('pset-tracker-v9')
    if (!raw) return
    try {
      const old = JSON.parse(raw)
      if (!old.courses) return
      Object.entries(old.courses).forEach(([code, course]) => {
        const newCourse = {
          id: uuid(),
          code,
          title: toTitleCase(course.title || code),
          color: course.color || getRandomPsetColor(),
          psets: (course.psets || []).map((p, i) => ({
            id: uuid(),
            number: i + 1,
            title: toTitleCase(p.title || ''),
            dueDate: null,
            completed: false,
            problems: (p.subtopics || []).map(s => ({
              id: uuid(),
              number: typeof s === 'string' ? s : s.title || '',
              completed: typeof s === 'boolean' ? s : s.completed || false,
              note: null,
            })),
          })),
        }
        courses.value.push(newCourse)
      })
      if (courses.value.length > 0) {
        activeCourseId.value = courses.value[0].id
      }
      save()
    } catch {
      // ignore migration errors
    }
  }

  return {
    courses,
    activeCourseId,
    activeCourse,
    showUndoToast,
    getCourseProgress,
    getPsetProgress,
    isPsetCompleted,
    addCourse,
    updateCourse,
    deleteCourse,
    setActiveCourse,
    addPset,
    updatePset,
    deletePset,
    reorderPset,
    togglePset,
    addProblem,
    addProblems,
    toggleProblem,
    updateProblemNote,
    deleteProblem,
    importCourse,
    undoDelete,
    copyAsTree,
    load,
  }
})
