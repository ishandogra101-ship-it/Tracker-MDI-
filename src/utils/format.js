// ---- Due date parsing / display (stored as ISO datetime-local, e.g. 2026-07-06T12:00) ----

function parseDue(due) {
  if (!due) return null
  const d = new Date(due)
  return isNaN(d) ? null : d
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function daysUntil(due) {
  const d = parseDue(due)
  if (!d) return null
  return Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000)
}

// overdue | soon (today/tomorrow) | upcoming (2-3d) | later | none
export function urgencyOf(due) {
  const days = daysUntil(due)
  if (days === null) return 'none'
  if (days < 0) return 'overdue'
  if (days <= 1) return 'soon'
  if (days <= 3) return 'upcoming'
  return 'later'
}

export function dueLabel(due) {
  const d = parseDue(due)
  if (!d) return due || ''
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0
  const datePart = d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  if (!hasTime) return datePart
  const timePart = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return `${datePart}, ${timePart}`
}

export function dueSortKey(due) {
  const d = parseDue(due)
  return d ? d.getTime() : Number.MAX_SAFE_INTEGER
}

// ---- Categorical tinting (muted, editorial — no bright saturated defaults) ----

export function typeClass(type) {
  const t = (type || '').toLowerCase()
  if (t.includes('assign')) return 'tag-assignment'
  if (t.includes('quiz')) return 'tag-quiz'
  if (t.includes('case')) return 'tag-case'
  if (t.includes('project')) return 'tag-project'
  if (t.includes('exam')) return 'tag-exam'
  return 'tag-generic'
}

export function statusClass(status) {
  const s = (status || '').toLowerCase()
  if (!s) return 'st-none'
  if (s.includes('done') || s.includes('complete') || s.includes('submitted')) return 'st-done'
  if (s.includes('progress') || s.includes('doing') || s.includes('review')) return 'st-progress'
  if (s.includes('block') || s.includes('stuck')) return 'st-blocked'
  return 'st-open'
}

// The single string used for filtering, sorting text, and export — one source of truth.
export function cellText(row, key) {
  if (key === 'no') return String(row.no ?? '')
  if (key === 'due') return dueLabel(row.due)
  return row[key] ? String(row[key]) : ''
}
