import { useContentJson } from '../utils/useContent'
import InstagramEmbed from './InstagramEmbed'

const FALLBACK_SITE = { explore: { title: 'Explore & Join', subtitle: 'Find us on social media. Join for events, updates, and meetups.' } }
const FALLBACK = {
  instagramEmbedUrl: '',

  links: [
    { title: 'Discord', desc: 'Events, LFG, announcements', hint: 'Join our server', url: '#' },
    { title: 'Instagram', desc: 'Photos + updates', hint: '@simp_unimelb', url: '#' },
    { title: 'Reddit', desc: 'Discussion threads', hint: 'Community hub', url: '#' },
    { title: 'Bilibili', desc: 'Clips and highlights', hint: 'Media archive', url: '#' },
  ],
}

export default function Explore({ lang = 'en', showInstagramEmbed = true }) {
  const site = useContentJson(`/content/site_${lang}.json`, FALLBACK_SITE)
  const data = useContentJson(`/content/explore_${lang}.json`, FALLBACK)

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

            {showInstagramEmbed && data?.instagramEmbedUrl ? (
        <InstagramEmbed url={data.instagramEmbedUrl} />
      ) : null}

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
