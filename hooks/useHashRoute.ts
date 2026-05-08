import { useEffect, useState } from 'react'

/** ハッシュのみの簡易ルート（例: #dashboard） */
export function useHashRoute(): string {
  const [hash, setHash] = useState(() =>
    window.location.hash.replace(/^#\/?/, ''),
  )

  useEffect(() => {
    const onHash = () =>
      setHash(window.location.hash.replace(/^#\/?/, ''))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return hash
}
