import { useState } from 'react'
import { addEntry, updateEntry } from '../hooks/useEntries.js'
import { IconClose } from './icons.jsx'

const BLANK = {
  type: 'Assignment',
  task: '',
  due: '',
  assignees: '',
  status: 'Not started',
  workType: 'Group',
  deliverables: '',
}

export default function EntryModal({ entry, onClose }) {
  const editing = Boolean(entry)
  const [form, setForm] = useState(
    editing ? { ...BLANK, ...entry } : BLANK
  )
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      if (editing) await updateEntry(entry.id, form)
      else await addEntry(form)
      onClose()
    } catch (err) {
      alert(`Couldn't save: ${err.message}`)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-label={editing ? 'Edit task' : 'New task'} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{editing ? `Edit task ${entry.no ?? ''}`.trim() : 'New task'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Type</span>
            <input value={form.type} onChange={set('type')} list="type-options" placeholder="Assignment, Quiz, Case-study…" />
          </label>
          <datalist id="type-options">
            <option value="Assignment" />
            <option value="Quiz" />
            <option value="Case-study" />
            <option value="Project" />
            <option value="Exam" />
          </datalist>

          <label className="field">
            <span>Task</span>
            <textarea value={form.task} onChange={set('task')} rows={3} placeholder="What needs doing?" required />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Due</span>
              <input type="datetime-local" value={form.due} onChange={set('due')} />
            </label>
            <label className="field">
              <span>Group / Individual</span>
              <div className="seg">
                {['Group', 'Individual'].map((w) => (
                  <button type="button" key={w} className={form.workType === w ? 'active' : ''} onClick={() => setForm((f) => ({ ...f, workType: w }))}>
                    {w}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <label className="field">
            <span>Assignee(s)</span>
            <input value={form.assignees} onChange={set('assignees')} placeholder="Comma-separated names" />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Status</span>
              <input value={form.status} onChange={set('status')} list="status-options" placeholder="In progress…" />
            </label>
            <label className="field">
              <span>Deliverables</span>
              <input value={form.deliverables} onChange={set('deliverables')} placeholder="Report, slides…" />
            </label>
          </div>
          <datalist id="status-options">
            <option value="Not started" />
            <option value="In progress" />
            <option value="Blocked" />
            <option value="Done" />
          </datalist>

          <button type="submit" className="btn btn-accent submit" disabled={saving}>
            <span>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add task'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
