import { useState } from 'react'
import { addEntry } from '../hooks/useEntries.js'
import { todayString } from '../utils/urgency.js'

export default function AddEntryModal({ onClose }) {
  const [type, setType] = useState('Assignment')
  const [subject, setSubject] = useState('')
  const [title, setTitle] = useState('')
  const [due, setDue] = useState(todayString())
  const [postedBy, setPostedBy] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      await addEntry({ type, subject, title, due, postedBy })
      onClose()
    } catch (err) {
      alert(`Couldn't save: ${err.message}`)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-label="Add entry" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>New entry</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="seg" role="group" aria-label="Type">
            {['Assignment', 'Quiz'].map((t) => (
              <button
                type="button"
                key={t}
                className={type === t ? 'active' : ''}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <label>
            Subject
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Physics" />
          </label>

          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is it?" required />
          </label>

          <label>
            Due date
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} required />
          </label>

          <label>
            Posted by
            <input value={postedBy} onChange={(e) => setPostedBy(e.target.value)} placeholder="Your name" />
          </label>

          <button type="submit" className="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add to list'}
          </button>
        </form>
      </div>
    </div>
  )
}
