import { useRef } from 'react'
import { useSeamlessCarousel } from '../utils/useSeamlessCarousel'
import { useContentJson } from '../utils/useContent'

const FALLBACK_SITE = { explore: { title: 'Explore & Join', subtitle: 'Find us on social media. Join for events, updates, and meetups.' } }
const FALLBACK = {
  links: [
    { title: 'Discord', desc: 'Events, LFG, announcements', hint: 'Join our server', url: '#' },
    { title: 'Instagram', desc: 'Photos + updates', hint: '@simp_unimelb', url: '#' },
    { title: 'Reddit', desc: 'Discussion threads', hint: 'Community hub', url: '#' },
    { title: 'Bilibili', desc: 'Clips and highlights', hint: 'Media archive', url: '#' },
  ],
}

export default function Explore() {
  const site = useContentJson('/content/site.json', FALLBACK_SITE)
  const data = useContentJson('/content/explore.json', FALLBACK)

  const title = site?.explore?.title || FALLBACK_SITE.explore.title
  const subtitle = site?.explore?.subtitle || FALLBACK_SITE.explore.subtitle
  const links = (data?.links?.length ? data.links : FALLBACK.links).filter(Boolean)

  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const firstSetRef = useRef(null)
  const { copies } = useSeamlessCarousel({
    viewportRef,
    trackRef,
    firstSetRef,
    secondsPerLoop: 14,
    pauseOnHover: true,
    enableWheel: true,
    enableKeyboard: true,
  })

  return (
    <section id="explore" className="section">
      <div className="sectionHead">
        <div>
          <h2 className="h2">{title}</h2>
          <p className="muted">{subtitle}</p>
        </div>
      </div>

      <div className="carouselShell">
        <div className="carouselViewport" ref={viewportRef} tabIndex={0} aria-label="Social media carousel">
          <div className="carouselTrack" ref={trackRef}>
            {[...Array(copies)].map((_, copyIndex) => (
              <div className="carouselSet" key={copyIndex} ref={copyIndex === 0 ? firstSetRef : null}>
                {links.map((x, i) => (
                  <a
                    key={`${copyIndex}-${x.title}-${i}`}
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
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
