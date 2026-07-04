import { useEffect, useMemo, useState } from 'react'
import { isConfigured } from './firebase.js'
import { useEntries, addEntry, updateEntry } from './hooks/useEntries.js'
import EntryTable, { COLUMNS } from './components/EntryTable.jsx'
import { cellText, dueSortKey } from './utils/format.js'
import { exportToExcel } from './utils/exportExcel.js'
import { IconPlus, IconExport, IconSearch } from './components/icons.jsx'

export default function App() {
  const { entries, loading, error } = useEntries()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState({ key: 'no', dir: 'asc' })
  const [animate, setAnimate] = useState(true)

  // Staggered entry animation on first paint only, not on every snapshot.
  useEffect(() => {
    if (!loading && entries.length) {
      const t = setTimeout(() => setAnimate(false), 900)
      return () => clearTimeout(t)
    }
  }, [loading, entries.length])

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }
  function setFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }))
  }
  function commitCell(id, key, value) {
    updateEntry(id, { [key]: value })
  }
  function addRow() {
    // Clear filters/search + sort by insertion order so the new blank row is visible at the bottom.
    setSearch('')
    setFilters({})
    setSort({ key: 'no', dir: 'asc' })
    addEntry({ workType: 'Group', status: 'Not started' })
  }

  const displayRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = entries.filter((row) => {
      if (q) {
        const hay = COLUMNS.map((c) => cellText(row, c.key)).join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      for (const [key, val] of Object.entries(filters)) {
        if (val && !cellText(row, key).toLowerCase().includes(val.toLowerCase())) return false
      }
      return true
    })
    const dir = sort.dir === 'asc' ? 1 : -1
    rows = [...rows].sort((a, b) => {
      if (sort.key === 'no') return (a.no - b.no) * dir
      if (sort.key === 'due') return (dueSortKey(a.due) - dueSortKey(b.due)) * dir
      return cellText(a, sort.key).localeCompare(cellText(b, sort.key), undefined, { sensitivity: 'base' }) * dir
    })
    return rows
  }, [entries, search, filters, sort])

  const activeFilters = search.trim() || Object.values(filters).some(Boolean)
  const showTable = isConfigured && !loading && !error

  return (
    <div className="app">
      <header className="masthead">
        <div className="mast-left">
          <h1>Class&nbsp;Tracker</h1>
          <p>Shared assignment and quiz log for the group. Click any cell to edit; everyone sees it live.</p>
        </div>
        <div className="mast-right">
          <span className="count">{displayRows.length}</span>
          <span className="count-label">
            {activeFilters ? `of ${entries.length} shown` : entries.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </header>

      {!isConfigured && (
        <div className="notice">
          Firebase isn&rsquo;t configured. Copy <code>.env.example</code> to <code>.env</code> and add your
          Firestore values (see the README). The table stays empty until then.
        </div>
      )}
      {error && <div className="notice">Couldn&rsquo;t load tasks: {error}</div>}

      <div className="toolbar">
        <div className="search-box">
          <IconSearch />
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search everything"
            aria-label="Search all tasks"
          />
        </div>
        <div className="toolbar-actions">
          <button className="btn" onClick={() => exportToExcel(displayRows)} disabled={displayRows.length === 0}>
            <span><IconExport /> Export .xlsx</span>
          </button>
          <button className="btn btn-accent" onClick={addRow} disabled={!isConfigured}>
            <span><IconPlus /> Add task</span>
          </button>
        </div>
      </div>

      {isConfigured && loading ? (
        <p className="empty">Loading…</p>
      ) : showTable ? (
        <EntryTable
          rows={displayRows}
          sort={sort}
          onSort={toggleSort}
          filters={filters}
          onFilter={setFilter}
          onCommit={commitCell}
          onAddRow={addRow}
          canEdit={isConfigured}
          animate={animate}
        />
      ) : null}

      {showTable && entries.length > 0 && displayRows.length === 0 && (
        <p className="empty">Nothing matches the current filters.</p>
      )}
    </div>
  )
}
