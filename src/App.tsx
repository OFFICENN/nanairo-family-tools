import { useEffect, useMemo, useState } from 'react'
import { ToolCardIcon } from './components/ToolCardIcon'
import { colorAtIndex } from './lib/nanairoPalette'
import { parseAppsCsv, type AppEntry } from './lib/parseAppsCsv'
import { useDarkMode } from './useDarkMode'

const PAGE_SIZE = 12

const owner = import.meta.env.VITE_OWNER_NAME?.trim()

export default function App() {
  const { mode, setMode } = useDarkMode()
  const [items, setItems] = useState<AppEntry[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/apps.csv', { cache: 'no-store' })
        if (!res.ok) throw new Error(`読み込みに失敗しました (${res.status})`)
        const text = await res.text()
        const parsed = parseAppsCsv(text)
        if (!cancelled) {
          setItems(parsed)
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

  const categories = useMemo(() => {
    const s = new Set<string>()
    for (const it of items) {
      if (it.category) s.add(it.category)
    }
    return ['all', ...[...s].sort((a, b) => a.localeCompare(b, 'ja'))]
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((it) => {
      if (category !== 'all' && it.category !== category) return false
      if (!q) return true
      const hay = `${it.name} ${it.url} ${it.category}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, query, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = useMemo(() => {
    const p = Math.min(Math.max(1, page), totalPages)
    const start = (p - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE).map((it, i) => ({
      it,
      /** 一覧の並びに対応した七色のインデックス（8件目からは再循環） */
      colorIndex: start + i,
    }))
  }, [filtered, page, totalPages])

  useEffect(() => {
    setPage(1)
  }, [query, category])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pb-10 pt-8 sm:px-6">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              OFFICENN
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              NANAIRO FAMILY TOOLS
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              公開中のツール一覧です。
            </p>
            {owner ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{owner}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className="text-xs text-slate-500 dark:text-slate-400">表示テーマ</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              {(
                [
                  ['system', '自動'],
                  ['light', 'ライト'],
                  ['dark', 'ダーク'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    mode === key
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:max-w-md">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400" htmlFor="q">
              検索
            </label>
            <input
              id="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="名前・URL・カテゴリで絞り込み"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="flex flex-col gap-2 sm:w-48">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400" htmlFor="cat">
              カテゴリ
            </label>
            <select
              id="cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-indigo-500/40 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'すべて' : c}
                </option>
              ))}
            </select>
          </div>
        </section>

        <main className="mt-8 flex-1">
          {loading ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">読み込み中…</p>
          ) : loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              {loadError}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              該当するツールがありません。
            </p>
          ) : (
            <>
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-500">
                {filtered.length} 件中 {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} 件を表示（1ページ {PAGE_SIZE} 件）
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pageRows.map(({ it, colorIndex }) => {
                  const swatch = colorAtIndex(colorIndex)
                  return (
                    <li key={it.url}>
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-full gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/60"
                        style={{ borderLeftWidth: 4, borderLeftColor: swatch.hex }}
                      >
                        <ToolCardIcon name={it.name} swatch={swatch} />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="text-base font-semibold leading-snug group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                              {it.name}
                            </h2>
                            <span
                              aria-hidden
                              className="shrink-0 text-slate-400 transition group-hover:text-indigo-500"
                            >
                              ↗
                            </span>
                          </div>
                          {it.category ? (
                            <span className="mt-2 inline-flex w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {it.category}
                            </span>
                          ) : null}
                          <p className="mt-3 line-clamp-2 break-all text-xs text-slate-500 dark:text-slate-400">
                            {it.url}
                          </p>
                        </div>
                      </a>
                    </li>
                  )
                })}
              </ul>

              {totalPages > 1 ? (
                <nav
                  className="mt-8 flex flex-wrap items-center justify-center gap-2"
                  aria-label="ページ送り"
                >
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900"
                  >
                    前へ
                  </button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900"
                  >
                    次へ
                  </button>
                </nav>
              ) : null}
            </>
          )}
        </main>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          <p>© OFFICENN</p>
        </footer>
      </div>
    </div>
  )
}
