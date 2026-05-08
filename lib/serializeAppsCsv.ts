import type { AppEntry } from './parseAppsCsv'

function cell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

/** apps.csv 形式に書き出す（一覧とダッシュボードの保存用） */
export function serializeAppsCsv(entries: AppEntry[]): string {
  const sorted = [...entries].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ja'),
  )
  const lines = ['order,name,url,category']
  for (const e of sorted) {
    lines.push(
      `${e.order},${cell(e.name)},${cell(e.url)},${cell(e.category)}`,
    )
  }
  return `${lines.join('\r\n')}\r\n`
}
