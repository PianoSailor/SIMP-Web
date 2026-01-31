import { useMemo } from 'react'
import { useInstagramEmbed } from '../utils/useInstagramEmbed'

/**
 * Renders an Instagram post embed for a PUBLIC post URL.
 * Note: the embed itself is served by Instagram and may keep a white background.
 * We style the surrounding shell so it fits the site theme.
 */
export default function InstagramEmbed({ url }) {
  const safeUrl = useMemo(() => {
    if (!url) return ''
    try {
      const u = new URL(url)
      const s = u.toString()
      return s.endsWith('/') ? s : s + '/'
    } catch {
      return ''
    }
  }, [url])

  // Re-process when the URL changes
  useInstagramEmbed([safeUrl])

  if (!safeUrl) return null

  return (
    <div className="igEmbedBox" aria-label="Instagram latest post">
      <div className="igEmbedShell">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={safeUrl}
          data-instgrm-version="14"
          style={{ width: 'min(540px, 100%)', margin: 0, background: 'transparent', border: 0 }}
        >
          <a href={safeUrl} target="_blank" rel="noreferrer">
            View on Instagram
          </a>
        </blockquote>
      </div>
    </div>
  )
}
