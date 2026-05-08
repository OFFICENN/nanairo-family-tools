export type AppEntry = {
  order: number
  name: string
  url: string
  category: string
}

/** CSV 全体をパース（RFC 4180 風のダブルクォート対応） */
export function parseAppsCsv(raw: string): AppEntry[] {
  const text = raw.replace(/^\uFEFF/, '')
  const rows = parseCsvRows(text)
  if (rows.length < 2) return []

  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = (key: string) => header.indexOf(key)

  const orderCol = idx('order')
  const nameCol = idx('name')
  const urlCol = idx('url')
  const categoryCol = idx('category')

  if (nameCol < 0 || urlCol < 0) {
    throw new Error('apps.csv に name と url の列が必要です')
  }

  const out: AppEntry[] = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (row.every((c) => c.trim() === '')) continue

    const name = (row[nameCol] ?? '').trim()
    const url = (row[urlCol] ?? '').trim()
    if (!name || !url) continue

    const orderRaw = orderCol >= 0 ? (row[orderCol] ?? '').trim() : ''
    const order = orderRaw === '' ? r : Number.parseInt(orderRaw, 10)
    const category = categoryCol >= 0 ? (row[categoryCol] ?? '').trim() : ''

    out.push({
      order: Number.isFinite(order) ? order : r,
      name,
      url,
      category,
    })
  }

  out.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ja'))
  return out
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  const pushCell = () => {
    row.push(cell)
    cell = ''
  }

  const pushRow = () => {
    if (row.length === 1 && row[0] === '' && !inQuotes) {
      row = []
      return
    }
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const c = text[i]!
    const next = text[i + 1]

    if (inQuotes) {
      if (c === '"' && next === '"') {
        cell += '"'
        i++
        continue
      }
      if (c === '"') {
        inQuotes = false
        continue
      }
      cell += c
      continue
    }

    if (c === '"') {
      inQuotes = true
      continue
    }
    if (c === ',') {
      pushCell()
      continue
    }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && next === '\n') i++
      pushCell()
      pushRow()
      continue
    }
    cell += c
  }

  pushCell()
  if (row.some((x) => x !== '')) pushRow()

  return rows
}
