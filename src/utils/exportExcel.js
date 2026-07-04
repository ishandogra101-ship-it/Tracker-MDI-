import * as XLSX from 'xlsx'
import { dueLabel } from './format.js'

const COLUMNS = [
  ['Task No.', (r) => r.no],
  ['Type', (r) => r.type],
  ['Subject', (r) => r.subject],
  ['Task', (r) => r.task],
  ['Due', (r) => dueLabel(r.due)],
  ['Assignee(s)', (r) => r.assignees],
  ['Status', (r) => r.status],
  ['Group / Individual', (r) => r.workType],
  ['Deliverables', (r) => r.deliverables],
]

// Exports exactly what's on screen (current filter + sort order).
export function exportToExcel(rows) {
  const data = rows.map((r) => {
    const o = {}
    for (const [label, get] of COLUMNS) o[label] = get(r) ?? ''
    return o
  })
  const ws = XLSX.utils.json_to_sheet(data, { header: COLUMNS.map((c) => c[0]) })
  ws['!cols'] = [
    { wch: 8 },
    { wch: 14 },
    { wch: 18 },
    { wch: 48 },
    { wch: 22 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 28 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Tasks')
  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `class-tracker-${stamp}.xlsx`)
}
