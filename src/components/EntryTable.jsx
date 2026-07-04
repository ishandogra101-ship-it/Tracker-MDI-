import { useEffect, useRef, useState } from 'react'
import { deleteEntry } from '../hooks/useEntries.js'
import { cellText, dueLabel, urgencyOf, typeClass, statusClass } from '../utils/format.js'
import { IconSort, IconEdit, IconTrash } from './icons.jsx'

export const COLUMNS = [
  { key: 'no', label: '#', sortable: true, filterable: false, cls: 'col-no' },
  { key: 'type', label: 'Type', sortable: true, filterable: true, cls: 'col-type' },
  { key: 'task', label: 'Task', sortable: true, filterable: true, cls: 'col-task' },
  { key: 'due', label: 'Due', sortable: true, filterable: true, cls: 'col-due' },
  { key: 'assignees', label: 'Assignee(s)', sortable: true, filterable: true, cls: 'col-people' },
  { key: 'status', label: 'Status', sortable: true, filterable: true, cls: 'col-status' },
  { key: 'workType', label: 'Group / Ind.', sortable: true, filterable: true, cls: 'col-work' },
  { key: 'deliverables', label: 'Deliverables', sortable: true, filterable: true, cls: 'col-deliver' },
]

function Cell({ row, col }) {
  if (col.key === 'type') {
    return row.type ? <span className={`tag ${typeClass(row.type)}`}>{row.type}</span> : null
  }
  if (col.key === 'status') {
    return row.status ? <span className={`chip ${statusClass(row.status)}`}>{row.status}</span> : null
  }
  if (col.key === 'workType') {
    return row.workType ? <span className="chip chip-outline">{row.workType}</span> : null
  }
  if (col.key === 'due') {
    return <span className={`due due-${urgencyOf(row.due)}`}>{dueLabel(row.due)}</span>
  }
  if (col.key === 'no') return <span className="rownum">{row.no}</span>
  if (col.key === 'task') return <span className="tasktext">{row.task}</span>
  return cellText(row, col.key)
}

function DeleteButton({ id, label }) {
  const [confirming, setConfirming] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  function onClick() {
    if (!confirming) {
      setConfirming(true)
      timer.current = setTimeout(() => setConfirming(false), 4000)
      return
    }
    clearTimeout(timer.current)
    deleteEntry(id)
  }
  return (
    <button
      className={`icon-btn danger ${confirming ? 'confirming' : ''}`}
      onClick={onClick}
      aria-label={confirming ? `Confirm delete ${label}` : `Delete ${label}`}
      title={confirming ? 'Tap again to confirm' : 'Delete'}
    >
      {confirming ? 'Sure?' : <IconTrash />}
    </button>
  )
}

export default function EntryTable({ rows, sort, onSort, filters, onFilter, onEdit, animate }) {
  return (
    <div className="table-wrap">
      <table className="grid">
        <colgroup>
          {COLUMNS.map((c) => (
            <col key={c.key} className={c.cls} />
          ))}
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr className="head-row">
            {COLUMNS.map((c) => {
              const state = sort.key === c.key ? sort.dir : null
              return (
                <th
                  key={c.key}
                  className={c.sortable ? 'sortable' : ''}
                  onClick={c.sortable ? () => onSort(c.key) : undefined}
                  aria-sort={state ? (state === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="th-inner">
                    {c.label}
                    {c.sortable && <IconSort state={state} />}
                  </span>
                </th>
              )
            })}
            <th className="th-actions" aria-label="Actions" />
          </tr>
          <tr className="filter-row">
            {COLUMNS.map((c) => (
              <th key={c.key}>
                {c.filterable && (
                  <input
                    className="filter-input"
                    value={filters[c.key] || ''}
                    onChange={(e) => onFilter(c.key, e.target.value)}
                    placeholder="filter"
                    aria-label={`Filter ${c.label}`}
                  />
                )}
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className={animate ? 'enter' : ''}
              style={animate ? { animationDelay: `${Math.min(i, 20) * 28}ms` } : undefined}
            >
              {COLUMNS.map((c) => (
                <td key={c.key} className={c.cls}>
                  <Cell row={row} col={c} />
                </td>
              ))}
              <td className="col-actions">
                <div className="row-actions">
                  <button
                    className="icon-btn"
                    onClick={() => onEdit(row)}
                    aria-label={`Edit task ${row.no}`}
                    title="Edit"
                  >
                    <IconEdit />
                  </button>
                  <DeleteButton id={row.id} label={`task ${row.no}`} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
