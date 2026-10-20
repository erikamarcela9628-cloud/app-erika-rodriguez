'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseAutoSaveDraftOptions<T> {
  key: string
  initialData?: T
  debounceMs?: number
  enabled?: boolean
}

export function useAutoSaveDraft<T extends Record<string, any>>({
  key,
  initialData,
  debounceMs = 600,
  enabled = true,
}: UseAutoSaveDraftOptions<T>) {
  const [data, setData] = useState<T>(initialData || ({} as T))
  const [hasDraft, setHasDraft] = useState(false)
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null)
  const [isSavedLocally, setIsSavedLocally] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const isDirtyRef = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Monitoreo de estado de conexión online/offline
  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 2. Verificar existencia de borrador local al cargar
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(`draft_${key}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.data && Object.keys(parsed.data).length > 0) {
          const hasContent = Object.values(parsed.data).some(
            (v) => v !== null && v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
          )
          if (hasContent) {
            setHasDraft(true)
            if (parsed.savedAt) {
              const d = new Date(parsed.savedAt)
              setDraftTimestamp(
                d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + d.toLocaleDateString() + ')'
              )
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error al verificar borrador local:', e)
    }
  }, [key, enabled])

  // 3. Guardado con debounce a localStorage
  const saveDraft = useCallback(
    (newData: T) => {
      if (!enabled || typeof window === 'undefined') return
      isDirtyRef.current = true
      setIsSavedLocally(false)

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        try {
          const now = new Date()
          localStorage.setItem(
            `draft_${key}`,
            JSON.stringify({
              data: newData,
              savedAt: now.toISOString(),
            })
          )
          setIsSavedLocally(true)
          setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        } catch (e) {
          console.warn('Error al guardar borrador local:', e)
        }
      }, debounceMs)
    },
    [key, enabled, debounceMs]
  )

  // 4. Protección contra cierre o recarga accidental (beforeunload)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [enabled])

  // 5. Restaurar borrador
  const restoreDraft = useCallback(() => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem(`draft_${key}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.data) {
          setData(parsed.data)
          setHasDraft(false)
          isDirtyRef.current = true
          return parsed.data as T
        }
      }
    } catch (e) {
      console.warn('Error al restaurar borrador:', e)
    }
    return null
  }, [key])

  // 6. Descartar borrador
  const discardDraft = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(`draft_${key}`)
      setHasDraft(false)
    } catch (e) {
      console.warn('Error al descartar borrador:', e)
    }
  }, [key])

  // 7. Limpiar borrador tras envío exitoso
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(`draft_${key}`)
      setHasDraft(false)
      isDirtyRef.current = false
      setIsSavedLocally(false)
      setLastSavedTime(null)
    } catch (e) {
      console.warn('Error al limpiar borrador:', e)
    }
  }, [key])

  return {
    data,
    setData,
    saveDraft,
    hasDraft,
    draftTimestamp,
    restoreDraft,
    discardDraft,
    clearDraft,
    isSavedLocally,
    lastSavedTime,
    isOnline,
    markDirty: () => {
      isDirtyRef.current = true
    },
    markClean: () => {
      isDirtyRef.current = false
    },
  }
}
