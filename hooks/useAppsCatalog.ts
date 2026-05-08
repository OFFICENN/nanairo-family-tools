import { useCallback, useEffect, useState } from 'react'
import { parseAppsCsv, type AppEntry } from '../lib/parseAppsCsv'
import { serializeAppsCsv } from '../lib/serializeAppsCsv'

export const APPS_CATALOG_STORAGE_KEY = 'nanairo-family-tools-apps-csv-v1'

export function useAppsCatalog() {
  const [items, setItems] = useState<AppEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [usingLocalOverride, setUsingLocalOverride] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const saved = localStorage.getItem(APPS_CATALOG_STORAGE_KEY)
        if (saved?.trim()) {
          try {
            const parsed = parseAppsCsv(saved)
            if (!cancelled && parsed.length > 0) {
              setItems(parsed)
              setUsingLocalOverride(true)
              setLoadError(null)
              return
            }
          } catch {
            /* fall through to fetch default */
          }
        }

        const res = await fetch('/apps.csv', { cache: 'no-store' })
        if (!res.ok) throw new Error(`読み込みに失敗しました (${res.status})`)
        const text = await res.text()
        const parsed = parseAppsCsv(text)
        if (!cancelled) {
          setItems(parsed)
          setUsingLocalOverride(false)
          setLoadError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : '不明なエラー')
          setItems([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const persistItems = useCallback((next: AppEntry[]) => {
    setItems(next)
    localStorage.setItem(APPS_CATALOG_STORAGE_KEY, serializeAppsCsv(next))
    setUsingLocalOverride(true)
  }, [])

  const resetToBundledCsv = useCallback(async () => {
    localStorage.removeItem(APPS_CATALOG_STORAGE_KEY)
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch('/apps.csv', { cache: 'no-store' })
      if (!res.ok) throw new Error(`読み込みに失敗しました (${res.status})`)
      const text = await res.text()
      const parsed = parseAppsCsv(text)
      setItems(parsed)
      setUsingLocalOverride(false)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '不明なエラー')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    items,
    setItems,
    loading,
    loadError,
    usingLocalOverride,
    persistItems,
    resetToBundledCsv,
  }
}
