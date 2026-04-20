/** 七色（なないろ）— 表示順に循環して割り当て */
export const NANAIRO_COLORS = [
  { key: 'aka', hex: '#e11d48', label: '赤' },
  { key: 'dai', hex: '#ea580c', label: '橙' },
  { key: 'ki', hex: '#ca8a04', label: '黄' },
  { key: 'midori', hex: '#16a34a', label: '緑' },
  { key: 'ao', hex: '#0891b2', label: '青' },
  { key: 'ai', hex: '#2563eb', label: '藍' },
  { key: 'murasaki', hex: '#9333ea', label: '紫' },
] as const

export type NanairoSwatch = (typeof NANAIRO_COLORS)[number]

export function colorAtIndex(index: number): NanairoSwatch {
  const i = ((index % NANAIRO_COLORS.length) + NANAIRO_COLORS.length) % NANAIRO_COLORS.length
  return NANAIRO_COLORS[i]!
}

/** 背景色に合わせた前景（文字）色 */
export function textOnAccent(hex: string): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return '#ffffff'
  const r = Number.parseInt(h.slice(0, 2), 16)
  const g = Number.parseInt(h.slice(2, 4), 16)
  const b = Number.parseInt(h.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) return '#ffffff'
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? '#0f172a' : '#ffffff'
}

export function monogramFromName(name: string): string {
  const ch = [...name.trim()][0]
  return ch ?? '?'
}
