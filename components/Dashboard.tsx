import { useMemo, useRef, useState } from 'react'
import type { AppEntry } from '../lib/parseAppsCsv'
import { parseAppsCsv } from '../lib/parseAppsCsv'
import { serializeAppsCsv } from '../lib/serializeAppsCsv'

type Props = {
  items: AppEntry[]
  onSave: (next: AppEntry[]) => void
  onResetBundled: () => void
}

export function Dashboard({ items, onSave, onResetBundled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('ツール')
  const [order, setOrder] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ja'),
      ),
    [items],
  )

  const maxOrder = useMemo(
    () => (items.length ? Math.max(...items.map((i) => i.order)) : 0),
    [items],
  )

  const addApp = () => {
    const n = name.trim()
    const u = url.trim()
    if (!n || !u) {
      setMessage('名前とURLを入力してください。')
      return
    }
    let parsedUrl: URL
    try {
      parsedUrl = new URL(u)
    } catch {
      setMessage('URLは https:// で始まる形式にしてください。')
      return
    }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      setMessage('http または https のURLのみです。')
      return
    }
    const nextOrder =
      order.trim() === ''
        ? maxOrder + 1
        : Number.parseInt(order, 10) || maxOrder + 1
    const cat = category.trim() || 'ツール'
    const entry: AppEntry = {
      order: nextOrder,
      name: n,
      url: parsedUrl.href,
      category: cat,
    }
    onSave([...items, entry])
    setName('')
    setUrl('')
    setOrder('')
    setMessage('追加しました。')
    window.setTimeout(() => setMessage(null), 2500)
  }

  const removeAt = (urlKey: string) => {
    onSave(items.filter((it) => it.url !== urlKey))
    setMessage('削除しました。')
    window.setTimeout(() => setMessage(null), 2000)
  }

  const downloadCsv = () => {
    const blob = new Blob([serializeAppsCsv(items)], {
      type: 'text/csv;charset=utf-8',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'apps.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      try {
        const parsed = parseAppsCsv(text)
        if (parsed.length === 0) {
          setMessage('CSVに有効な行がありません。')
          return
        }
        onSave(parsed)
        setMessage(`インポートしました（${parsed.length} 件）。`)
      } catch (err) {
        setMessage(
          err instanceof Error ? err.message : 'CSVの読み込みに失敗しました。',
        )
      }
      window.setTimeout(() => setMessage(null), 3000)
    }
    reader.readAsText(file, 'UTF-8')
    e.target.value = ''
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ツール一覧ダッシュボード</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            このブラウザにだけ保存されます（localStorage）。別のPC・家族の端末と同期したい場合は、CSVのエクスポート／インポートを使ってください。
          </p>
        </div>
        <a
          href="#"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-slate-800"
        >
          ← 一覧へ戻る
        </a>
      </div>

      {message ? (
        <p
          className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-100"
          role="status"
        >
          {message}
        </p>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold">登録済みツール</h2>
        {sorted.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">まだありません。</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {sorted.map((it) => (
              <li
                key={it.url}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {it.name}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      （表示順 {it.order}）
                    </span>
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">{it.url}</p>
                  {it.category ? (
                    <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {it.category}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(it.url)}
                  className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold">ツールを追加</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600 dark:text-slate-400">名前</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              placeholder="例: URL短縮ツール"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="text-slate-600 dark:text-slate-400">URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              placeholder="https://..."
              type="url"
              autoComplete="url"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600 dark:text-slate-400">カテゴリ</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              placeholder="ツール"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              表示順（空欄なら末尾）
            </span>
            <input
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              placeholder={`自動: ${maxOrder + 1}`}
              inputMode="numeric"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={addApp}
          className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500 sm:w-auto sm:px-8"
        >
          追加する
        </button>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold">バックアップ・初期化</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={downloadCsv}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            CSVをダウンロード
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            CSVを読み込み
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onPickFile}
          />
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'サイト同梱の apps.csv に戻します。このブラウザに保存した一覧は消えます。よろしいですか？',
                )
              ) {
                void onResetBundled()
                setMessage('同梱の一覧に戻しました。')
                window.setTimeout(() => setMessage(null), 2500)
              }
            }}
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60"
          >
            デフォルト（同梱CSV）に戻す
          </button>
        </div>
      </section>
    </div>
  )
}
