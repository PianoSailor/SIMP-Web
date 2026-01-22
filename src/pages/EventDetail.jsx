import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadEvents } from '../utils/loadEvents'
import Explore from '../components/Explore'
import Footer from '../components/Footer'

function isPast(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d.getTime() < today.getTime()
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

  // auto-advance
  useEffect(() => {
    if (gallery.length <= 1) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % gallery.length)
    }, 4500)
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

  const pastEvents = events.filter((e) => isPast(e.date)).sort((a, b) => (a.date < b.date ? 1 : -1))

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
          <div className="carouselBox" aria-label="Event gallery">
            <div className="carouselViewport">
              <div className="carouselTrack" style={{ transform: `translateX(-${active * 100}%)` }}>
                {gallery.map((src, i) => (
                  <div key={`${src}-${i}`} className="carouselSlide">
                    <img src={src} alt="" />
                  </div>
                ))}
              </div>
            </div>

            {gallery.length > 1 ? (
              <>
                <button className="carouselBtn left" onClick={() => setActive((i) => (i - 1 + gallery.length) % gallery.length)} aria-label="Previous image">
                  ‹
                </button>
                <button className="carouselBtn right" onClick={() => setActive((i) => (i + 1) % gallery.length)} aria-label="Next image">
                  ›
                </button>
                <div className="carouselDots" aria-label="Image selector">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      className={`dot ${i === active ? 'active' : ''}`}
                      onClick={() => setActive(i)}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {event.recap ? (
          <div className="recapBox">
            <div className="blockTitle">{lang === 'zh' ? '活动回顾' : lang === 'ja' ? '振り返り' : 'Recap'}</div>
            <div className="recapText">{event.recap}</div>
          </div>
        ) : null}

        <div className="section small">
          <div className="sectionTitle">{lang === 'zh' ? '往期活动' : lang === 'ja' ? '過去のイベント' : 'Past Events'}</div>
          <div className="eventCards compact">
            {pastEvents.slice(0, 8).map((e) => (
              <button key={e.id} className="eventCard" onClick={() => navigate(`/events/${e.slug}`)}>
                {e.image ? <img className="eventImg" src={e.image} alt="" /> : <div className="eventImg ph" />}
                <div className="eventBody">
                  <div className="eventTitle">{e.title}</div>
                  <div className="muted">{e.date}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Explore lang={lang} />
      <Footer lang={lang} />
    </main>
  )
}
