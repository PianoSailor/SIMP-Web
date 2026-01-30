import { useMemo } from 'react'
import { useInstagramEmbed } from '../utils/useInstagramEmbed'

/**
 * Renders an Instagram post embed for a PUBLIC post URL.
 * Note: Instagram does not provide a stable "latest post" embed without API access.
 * In this site, the post URL is CMS-controlled (Explore Links -> Instagram Embed URL).
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
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={safeUrl}
        data-instgrm-version="14"
        style={{ width: 'min(540px, 100%)', margin: 0 }}
      >
        <a href={safeUrl} target="_blank" rel="noreferrer">
          View on Instagram
        </a>
      </blockquote>
    </div>
  )
}
