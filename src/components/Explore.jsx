import { useEffect, useMemo, useState } from 'react'
import { useContentJson } from '../utils/useContent'
import { useSiteContent } from '../utils/useSiteContent'
import { fetchLatestPermalink } from '../utils/instagramLatest'
import InstagramEmbed from './InstagramEmbed'

const FALLBACK_SITE = { explore: { title: 'Explore & Join', subtitle: 'Find us on social media. Join for events, updates, and meetups.' }, instagramEmbed: { embedUrl: '', username: 'unimelb.simp' } }
const FALLBACK = {
  links: [
    { title: 'Discord', desc: 'Events, LFG, announcements', hint: 'Join our server', url: '#' },
    { title: 'Instagram', desc: 'Photos + updates', hint: '@simp_unimelb', url: '#' },
    { title: 'Reddit', desc: 'Discussion threads', hint: 'Community hub', url: '#' },
    { title: 'Bilibili', desc: 'Clips and highlights', hint: 'Media archive', url: '#' },
  ],
}

export default function Explore({ lang = 'en', showInstagramEmbed = false }) {
  const site = useSiteContent(lang, FALLBACK_SITE)
  const data = useContentJson(`/content/explore_${lang}.json`, FALLBACK)

  // Instagram embed settings are controlled from Site settings (default) and inherited by all languages.
  const manualEmbedUrl = (site?.instagramEmbed?.embedUrl || '').trim()
  const instagramUsername = (site?.instagramEmbed?.username || 'unimelb.simp').trim()

  const [resolvedEmbedUrl, setResolvedEmbedUrl] = useState('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      // If a manual post URL is provided, use it.
      if (manualEmbedUrl) {
        setResolvedEmbedUrl(manualEmbedUrl)
        return
      }
      // Otherwise try to fetch the latest permalink via Netlify Function (/api/latest).
      try {
        const permalink = await fetchLatestPermalink({ username: instagramUsername })
        if (!cancelled) setResolvedEmbedUrl(permalink)
      } catch {
        if (!cancelled) setResolvedEmbedUrl('')
      }
    }

    if (showInstagramEmbed) run()
    return () => {
      cancelled = true
    }
  }, [showInstagramEmbed, manualEmbedUrl, instagramUsername])

  const title = site?.explore?.title || FALLBACK_SITE.explore.title
  const subtitle = site?.explore?.subtitle || FALLBACK_SITE.explore.subtitle

  // Fixed 4-slot layout (no seamless looping) — still CMS-driven.
  const links = (data?.links?.length ? data.links : FALLBACK.links).filter(Boolean).slice(0, 4)

  return (
    <section id="explore" className="section">
      <div className="sectionHead">
        <div>
          <h2 className="h2">{title}</h2>
          <p className="muted">{subtitle}</p>
        </div>
      </div>

      {showInstagramEmbed && resolvedEmbedUrl ? <InstagramEmbed url={resolvedEmbedUrl} /> : null}

      <div className="carousel socialCarousel" aria-label="Social media links">
        {links.map((x, i) => (
          <a
            key={`${x.title}-${i}`}
            className="linkSlide"
            href={x.url || '#'}
            target={x.url && x.url !== '#' ? '_blank' : undefined}
            rel={x.url && x.url !== '#' ? 'noreferrer' : undefined}
            onClick={(e) => {
              if (!x.url || x.url === '#') e.preventDefault()
            }}
          >
            <div className="linkTitle">{x.title}</div>
            <div className="muted">{x.desc}</div>
            <div className="linkHint">{x.hint}</div>
          </a>
        ))}
      </div>
    </section>
  )
}
