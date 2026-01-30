import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadEvents } from '../utils/loadEvents'
import Explore from '../components/Explore'
import Footer from '../components/Footer'

function toParagraphs(text) {
  if (!text) return []
  return String(text)
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default function EventDetail({ lang = 'en' }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const cms = await loadEvents(lang)
      if (alive) setEvents(cms)
    })()
    return () => {
      alive = false
    }
  }, [lang])

  const event = useMemo(() => events.find((e) => e.slug === slug), [events, slug])

  const gallery = useMemo(() => {
    const arr = event?.gallery?.length ? event.gallery : event?.image ? [event.image] : []
    return arr.filter(Boolean)
  }, [event])

  const prevIndex = useMemo(() => (gallery.length ? (active - 1 + gallery.length) % gallery.length : 0), [active, gallery.length])
  const nextIndex = useMemo(() => (gallery.length ? (active + 1) % gallery.length : 0), [active, gallery.length])

  // slow auto-advance
  useEffect(() => {
    if (gallery.length <= 1) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % gallery.length)
    }, 6500)
    return () => clearInterval(id)
  }, [gallery.length])

  useEffect(() => {
    setActive(0)
  }, [slug])

  if (!event) {
    return (
      <main className="page">
        <section className="section">
          <h1 className="pageTitle">Event not found</h1>
          <button className="btn primary" onClick={() => navigate('/')}>
            Back to home
          </button>
        </section>
        <Footer lang={lang} />
      </main>
    )
  }

  const paragraphs = toParagraphs(event.details || event.desc)

  return (
    <main className="page">
      <section className="section">
        <div className="eventTop">
          <button className="btn secondary" onClick={() => navigate('/')}>
            ← Home
          </button>

          <div className="eventMeta">
            <div className="eventTitleLarge">{event.title}</div>
            <div className="muted">
              {event.date}
              {event.location ? ` · ${event.location}` : ''}
              {event.tag ? ` · ${event.tag}` : ''}
            </div>
          </div>
        </div>

        {gallery.length ? (
          <div className="galleryHero" aria-label="Event image gallery">
            {gallery.length > 1 ? (
              <button className="galleryArrow left" onClick={() => setActive(prevIndex)} aria-label="Previous image">
                ‹
              </button>
            ) : null}

            <div className="galleryStage">
              {gallery.length > 1 ? (
                <button className="gallerySide" onClick={() => setActive(prevIndex)} aria-label="Previous image preview">
                  <img src={gallery[prevIndex]} alt="" />
                </button>
              ) : null}

              <div className="galleryMain">
                <img src={gallery[active]} alt="" />
              </div>

              {gallery.length > 1 ? (
                <button className="gallerySide" onClick={() => setActive(nextIndex)} aria-label="Next image preview">
                  <img src={gallery[nextIndex]} alt="" />
                </button>
              ) : null}
            </div>

            {gallery.length > 1 ? (
              <button className="galleryArrow right" onClick={() => setActive(nextIndex)} aria-label="Next image">
                ›
              </button>
            ) : null}
          </div>
        ) : null}

        {paragraphs.length ? (
          <div className="eventDetailBox">
            <div className="blockTitle">{lang === 'zh' ? '活动详情' : lang === 'ja' ? 'イベント詳細' : 'Event Details'}</div>
            <div className="eventDetailText">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        ) : null}

        {event.socialLinks?.length ? (
          <div className="eventLinksBox">
            <div className="blockTitle">{lang === 'zh' ? '相关社交链接' : lang === 'ja' ? '関連リンク' : 'Social Posts'}</div>
            <div className="eventLinks">
              {event.socialLinks.map((l, i) => (
                <a key={i} className="btn secondary" href={l.url} target="_blank" rel="noreferrer">
                  {l.label || l.url.replace(/^https?:\/\//, '').slice(0, 36)}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Explore section WITHOUT Instagram embed (boxes only) */}
      <Explore lang={lang} showInstagramEmbed={false} />

      <Footer lang={lang} />
    </main>
  )
}
