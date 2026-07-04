import EntryItem from './EntryItem.jsx'

export default function EntryList({ entries }) {
  if (entries.length === 0) return null
  return (
    <ul className="entry-list">
      {entries.map((entry) => (
        <EntryItem key={entry.id} entry={entry} />
      ))}
    </ul>
  )
}
