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

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.due !== b.due) return (a.due || '') < (b.due || '') ? -1 : 1
    return 0
  })
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
        setEntries(sortEntries(docs))
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

export function addEntry({ type, subject, title, due, postedBy }) {
  return addDoc(collection(db, COLLECTION), {
    type,
    subject,
    title,
    due,
    postedBy,
    done: false,
    createdAt: serverTimestamp(),
  })
}

export function toggleDone(entry) {
  return updateDoc(doc(db, COLLECTION, entry.id), { done: !entry.done })
}

export function deleteEntry(id) {
  return deleteDoc(doc(db, COLLECTION, id))
}
