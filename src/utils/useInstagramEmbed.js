import { useEffect } from 'react'

/**
 * Loads Instagram's embed.js once and calls instgrm.Embeds.process().
 * Instagram requires the post to be PUBLIC and embeddable.
 */
export function useInstagramEmbed(deps = []) {
  useEffect(() => {
    const existing = document.querySelector('script[data-ig-embed="true"]')
    const process = () => window.instgrm?.Embeds?.process?.()

    if (existing) {
      process()
      return
    }

    const s = document.createElement('script')
    s.async = true
    s.defer = true
    s.src = 'https://www.instagram.com/embed.js'
    s.dataset.igEmbed = 'true'
    s.onload = () => process()
    document.body.appendChild(s)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
