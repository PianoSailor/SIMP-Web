import { useEffect, useMemo, useState } from 'react'
import { deepMerge } from './deepMerge'

/**
 * Loads /content/site.json (base) and /content/site_{lang}.json (language overrides),
 * then deep-merges them so language fields override base without losing nested fields.
 */
export function useSiteContent(lang = 'en', fallback = {}) {
  const [data, setData] = useState(fallback)

  const urls = useMemo(() => {
    const l = (lang || 'en').toLowerCase()
    return [`/content/site.json`, `/content/site_${l}.json`]
  }, [lang])

  useEffect(() => {
    let cancelled = false
    const bust = `v=${Date.now()}`

    Promise.all(
      urls.map((u) =>
        fetch(`${u}?${bust}`, { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    )
      .then(([base, langObj]) => {
        const merged = deepMerge(base || {}, langObj || {})
        if (!cancelled) setData(deepMerge(fallback || {}, merged))
      })
      .catch(() => {
        // keep fallback
      })

    return () => {
      cancelled = true
    }
  }, [urls.join('|')])

  return data
}
