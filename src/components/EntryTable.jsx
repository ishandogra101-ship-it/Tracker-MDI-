import { useEffect, useRef, useState } from 'react'
import { deleteEntry } from '../hooks/useEntries.js'
import { cellText, dueLabel, urgencyOf, typeClass, statusClass } from '../utils/format.js'
import { IconSort, IconTrash, IconPlus } from './icons.jsx'

// edit: how a cell turns into an input when clicked
export const COLUMNS = [
  { key: 'no', label: '#', sortable: true, filterable: false, cls: 'col-no', edit: null },
  { key: 'type', label: 'Type', sortable: true, filterable: true, cls: 'col-type', edit: 'type' },
  { key: 'subject', label: 'Subject', sortable: true, filterable: true, cls: 'col-subject', edit: 'text' },
  { key: 'task', label: 'Task', sortable: true, filterable: true, cls: 'col-task', edit: 'textarea' },
  { key: 'due', label: 'Due', sortable: true, filterable: true, cls: 'col-due', edit: 'date' },
  { key: 'assignees', label: 'Assignee(s)', sortable: true, filterable: true, cls: 'col-people', edit: 'text' },
  { key: 'status', label: 'Status', sortable: true, filterable: true, cls: 'col-status', edit: 'status' },
  { key: 'workType', label: 'Group / Ind.', sortable: true, filterable: true, cls: 'col-work', edit: 'work' },
  { key: 'deliverables', label: 'Deliverables', sortable: true, filterable: true, cls: 'col-deliver', edit: 'text' },
]

function Display({ row, col }) {
  const v = row[col.key]
  if (col.key === 'type') return v ? <span className={`tag ${typeClass(v)}`}>{v}</span> : <Empty />
  if (col.key === 'status') return v ? <span className={`chip ${statusClass(v)}`}>{v}</span> : <Empty />
  if (col.key === 'workType') return v ? <span className="chip chip-outline">{v}</span> : <Empty />
  if (col.key === 'due') return v ? <span className={`due due-${urgencyOf(v)}`}>{dueLabel(v)}</span> : <Empty />
  if (col.key === 'no') return <span className="rownum">{row.no}</span>
  if (col.key === 'task') return v ? <span className="tasktext">{v}</span> : <Empty />
  return v ? <span>{v}</span> : <Empty />
}

function Empty() {
  return <span className="cell-empty">＋</span>
}

function EditableCell({ row, col, onCommit, canEdit }) {
  const value = row[col.key] ?? ''
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const ref = useRef(null)

  useEffect(() => {
    if (!editing) setVal(value)
  }, [value, editing])
  useEffect(() => {
    if (editing && ref.current) ref.current.focus()
  }, [editing])

  if (col.key === 'no') return <div className="cell-display"><span className="rownum">{row.no}</span></div>

  function close(commit) {
    setEditing(false)
    if (commit && val !== value) onCommit(row.id, col.key, val)
    else setVal(value)
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(false) }
    else if (e.key === 'Enter' && col.edit !== 'textarea') { e.preventDefault(); close(true) }
  }

  if (editing) {
    const common = {
      ref,
      value: val,
      onChange: (e) => setVal(e.target.value),
      onBlur: () => close(true),
      onKeyDown: onKey,
      className: 'cell-input',
    }
    if (col.edit === 'textarea') return <textarea rows={3} {...common} />
    if (col.edit === 'work')
      return (
        <select {...common}>
          <option value="">—</option>
          <option value="Group">Group</option>
          <option value="Individual">Individual</option>
        </select>
      )
    if (col.edit === 'date') return <input type="datetime-local" {...common} />
    const list = col.edit === 'type' ? 'type-options' : col.edit === 'status' ? 'status-options' : undefined
    return <input type="text" list={list} {...common} />
  }

  return (
    <div
      className={`cell-display${canEdit ? ' editable' : ''}`}
      onClick={canEdit ? () => setEditing(true) : undefined}
      role={canEdit ? 'button' : undefined}
      tabIndex={canEdit ? 0 : undefined}
      onKeyDown={canEdit ? (e) => { if (e.key === 'Enter') { e.preventDefault(); setEditing(true) } } : undefined}
      title={canEdit ? 'Click to edit' : undefined}
    >
      <Display row={row} col={col} />
    </div>
  )
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

export default function EntryTable({ rows, sort, onSort, filters, onFilter, onCommit, onAddRow, canEdit, animate }) {
  return (
    <div className="table-wrap">
      <datalist id="type-options">
        <option value="Assignment" /><option value="Quiz" /><option value="Case-study" />
        <option value="Project" /><option value="Exam" />
      </datalist>
      <datalist id="status-options">
        <option value="Not started" /><option value="In progress" /><option value="Blocked" /><option value="Done" />
      </datalist>

      <table className="grid">
        <colgroup>
          {COLUMNS.map((c) => <col key={c.key} className={c.cls} />)}
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
                  <EditableCell row={row} col={c} onCommit={onCommit} canEdit={canEdit} />
                </td>
              ))}
              <td className="col-actions">
                <div className="row-actions">
                  <DeleteButton id={row.id} label={`task ${row.no}`} />
                </div>
              </td>
            </tr>
          ))}
          {canEdit && (
            <tr className="add-row">
              <td colSpan={COLUMNS.length + 1}>
                <button onClick={onAddRow}>
                  <IconPlus size={14} /> Add task
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
