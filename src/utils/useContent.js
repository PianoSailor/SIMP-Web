import { useEffect, useState } from 'react'

/**
 * Small helper for loading CMS-managed JSON from /content/*.json.
 * - Uses a cache-busting query so Netlify deploy updates show immediately.
 * - Falls back to the provided default value if fetch fails.
 */
export function useContentJson(url, fallback) {
  const [data, setData] = useState(fallback)

  useEffect(() => {
    let cancelled = false
    const bust = `v=${Date.now()}`
    fetch(`${url}?${bust}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((j) => {
        if (!cancelled) setData(j)
      })
      .catch(() => {
        // keep fallback
      })
    return () => {
      cancelled = true
    }
  }, [url])

  return data
}
