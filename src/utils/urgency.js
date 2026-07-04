// Local YYYY-MM-DD for "today" (avoids UTC off-by-one from toISOString)
export function todayString() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function daysUntil(due) {
  const [y, m, d] = due.split('-').map(Number)
  const [ty, tm, td] = todayString().split('-').map(Number)
  const dueDate = new Date(y, m - 1, d)
  const today = new Date(ty, tm - 1, td)
  return Math.round((dueDate - today) / 86400000)
}

// Buckets: overdue | soon (today-tomorrow) | upcoming (2-3 days) | later | done
export function urgencyOf(entry) {
  if (entry.done) return 'done'
  if (!entry.due) return 'later'
  const days = daysUntil(entry.due)
  if (days < 0) return 'overdue'
  if (days <= 1) return 'soon'
  if (days <= 3) return 'upcoming'
  return 'later'
}

export function dueLabel(due) {
  if (!due) return 'No date'
  const days = daysUntil(due)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days < 0) return `${-days} days ago`
  const [y, m, d] = due.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
