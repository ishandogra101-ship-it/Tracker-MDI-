import { useEffect, useRef, useState } from 'react'
import { toggleDone, deleteEntry } from '../hooks/useEntries.js'
import { urgencyOf, dueLabel } from '../utils/urgency.js'

export default function EntryItem({ entry }) {
  const [confirming, setConfirming] = useState(false)
  const timerRef = useRef(null)
  const urgency = urgencyOf(entry)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      timerRef.current = setTimeout(() => setConfirming(false), 4000)
      return
    }
    clearTimeout(timerRef.current)
    deleteEntry(entry.id)
  }

  return (
    <li className={`entry urgency-${urgency}`}>
      <label className="entry-check">
        <input
          type="checkbox"
          checked={!!entry.done}
          onChange={() => toggleDone(entry)}
          aria-label={`Mark ${entry.title} ${entry.done ? 'not done' : 'done'}`}
        />
      </label>

      <div className="entry-body">
        <div className="entry-top">
          <span className="entry-type">{entry.type}</span>
          <span className="entry-subject">{entry.subject}</span>
        </div>
        <div className="entry-title">{entry.title}</div>
        <div className="entry-meta">
          <span className="entry-due">{dueLabel(entry.due)}</span>
          {entry.postedBy && <span className="entry-by">· {entry.postedBy}</span>}
        </div>
      </div>

      <button
        className={`entry-delete ${confirming ? 'confirming' : ''}`}
        onClick={handleDelete}
        aria-label={confirming ? `Confirm delete ${entry.title}` : `Delete ${entry.title}`}
      >
        {confirming ? 'Sure?' : '×'}
      </button>
    </li>
  )
}
