import { monogramFromName, textOnAccent, type NanairoSwatch } from '../lib/nanairoPalette'

type Props = {
  name: string
  swatch: NanairoSwatch
}

export function ToolCardIcon({ name, swatch }: Props) {
  const letter = monogramFromName(name)
  const fg = textOnAccent(swatch.hex)

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-inner ring-1 ring-black/5 dark:ring-white/10"
      style={{ backgroundColor: swatch.hex, color: fg }}
      aria-hidden
      title={swatch.label}
    >
      {letter}
    </div>
  )
}
