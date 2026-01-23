import { useState, useEffect, useCallback, useRef } from 'react'

interface UseDraftOptions<T> {
  key: string
  initialData: T
  debounceMs?: number
}

export function useDraft<T>({ key, initialData, debounceMs = 1000 }: UseDraftOptions<T>) {
  const [data, setData] = useState<T>(initialData)
  const [hasDraft, setHasDraft] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const initialDataRef = useRef(initialData)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Check for existing draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(key)

    if (saved) {
      setHasDraft(true)
    }
  }, [key])

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    if (isDirty) {
      localStorage.setItem(key, JSON.stringify(data))
    }
  }, [key, data, isDirty])

  // Auto-save with debounce when data changes
  useEffect(() => {
    if (!isDirty) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft()
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, isDirty, saveDraft, debounceMs])

  // Save on beforeunload (browser close/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        saveDraft()
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, saveDraft])

  // Save on unmount (in-app navigation)
  useEffect(() => {
    return () => {
      if (isDirty) {
        localStorage.setItem(key, JSON.stringify(data))
      }
    }
  }, [])

  // Update the ref so cleanup has access to latest data
  useEffect(() => {
    initialDataRef.current = data
  }, [data])

  const updateData = useCallback((newData: T | ((prev: T) => T)) => {
    setData(newData)
    setIsDirty(true)
  }, [])

  const loadDraft = useCallback((): T | null => {
    const saved = localStorage.getItem(key)

    if (saved) {
      const parsed = JSON.parse(saved) as T
      setData(parsed)
      setHasDraft(false)
      setIsDirty(true) // Mark as dirty since it's restored draft
      return parsed
    }

    return null
  }, [key])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key)
    setHasDraft(false)
    setIsDirty(false)
  }, [key])

  const discardDraft = useCallback(() => {
    localStorage.removeItem(key)
    setHasDraft(false)
    setData(initialData)
    setIsDirty(false)
  }, [key, initialData])

  return {
    data,
    setData: updateData,
    hasDraft,
    isDirty,
    loadDraft,
    clearDraft,
    discardDraft,
    saveDraft,
  }
}
