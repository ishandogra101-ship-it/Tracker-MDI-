import { useState } from 'react'
import { isConfigured } from './firebase.js'
import { useEntries } from './hooks/useEntries.js'
import EntryList from './components/EntryList.jsx'
import AddEntryModal from './components/AddEntryModal.jsx'

export default function App() {
  const [showForm, setShowForm] = useState(false)
  const { entries, loading, error } = useEntries()

  return (
    <div className="app">
      <header className="header">
        <h1>Class Tracker</h1>
      </header>

      {!isConfigured && (
        <div className="notice">
          Firebase is not configured — copy <code>.env.example</code> to <code>.env</code> and
          fill in your Firestore project values. See the README for setup steps.
        </div>
      )}

      {error && <div className="notice">Couldn&rsquo;t load entries: {error}</div>}

      {isConfigured && loading && <p className="empty">Loading…</p>}

      {isConfigured && !loading && entries.length === 0 && !error && (
        <p className="empty">Nothing tracked yet. Tap + to add the first one.</p>
      )}

      <EntryList entries={entries} />

      <button
        className="fab"
        aria-label="Add entry"
        onClick={() => setShowForm(true)}
        disabled={!isConfigured}
      >
        +
      </button>

      {showForm && <AddEntryModal onClose={() => setShowForm(false)} />}
    </div>
  )
}
