import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isConfigured } from '../firebase.js'

const COLLECTION = 'entries'

// Stable insertion order so the Task No. column never shifts under sorting/filtering.
function byCreated(a, b) {
  const ta = a.createdAt?.seconds ?? Number.MAX_SAFE_INTEGER
  const tb = b.createdAt?.seconds ?? Number.MAX_SAFE_INTEGER
  return ta - tb
}

export function useEntries() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(isConfigured)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isConfigured) return
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        docs.sort(byCreated)
        // Assign a permanent-feeling Task No. from insertion order.
        setEntries(docs.map((d, i) => ({ ...d, no: i + 1 })))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  return { entries, loading, error }
}

const FIELDS = ['type', 'task', 'due', 'assignees', 'status', 'workType', 'deliverables']

function pick(data) {
  const out = {}
  for (const f of FIELDS) out[f] = data[f] ?? ''
  return out
}

export function addEntry(data) {
  return addDoc(collection(db, COLLECTION), {
    ...pick(data),
    createdAt: serverTimestamp(),
  })
}

export function updateEntry(id, data) {
  return updateDoc(doc(db, COLLECTION, id), pick(data))
}

export function deleteEntry(id) {
  return deleteDoc(doc(db, COLLECTION, id))
}
