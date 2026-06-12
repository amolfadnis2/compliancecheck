import { useState, useEffect, useCallback, useRef } from 'react'

interface SavedState<T> {
  data: T
  savedAt: string
}

interface UseAssessmentProgressReturn<T> {
  savedState: T | null
  hasSaved: boolean
  clearSaved: () => void
}

export function useAssessmentProgress<T>(
  storageKey: string,
  currentData: T,
  shouldSave: boolean
): UseAssessmentProgressReturn<T> {
  const [savedState, setSavedState] = useState<T | null>(null)
  const [hasSaved, setHasSaved] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Restore on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return
      const parsed: SavedState<T> = JSON.parse(raw)
      const age = Date.now() - new Date(parsed.savedAt).getTime()
      if (age < 24 * 60 * 60 * 1000) {
        setSavedState(parsed.data)
        setHasSaved(true)
      } else {
        localStorage.removeItem(storageKey)
      }
    } catch {
      // ignore corrupt storage
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save with 500ms debounce
  useEffect(() => {
    if (!shouldSave) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      try {
        const payload: SavedState<T> = { data: currentData, savedAt: new Date().toISOString() }
        localStorage.setItem(storageKey, JSON.stringify(payload))
      } catch {
        // quota exceeded or private browsing — silently skip
      }
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [storageKey, currentData, shouldSave])

  const clearSaved = useCallback(() => {
    localStorage.removeItem(storageKey)
    setSavedState(null)
    setHasSaved(false)
  }, [storageKey])

  return { savedState, hasSaved, clearSaved }
}
