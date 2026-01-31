import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadEvents } from '../utils/loadEvents'
import { useContentJson } from '../utils/useContent'

const FALLBACK = {
  events: {
    title: 'Events',
    subtitle: 'All upcoming and past events.',
    noEvents: 'No events',
  },
}

export default function EventsList({ lang = 'en' }) {
  const [events, setEvents] = useState([])
  const copy = useContentJson(`/content/events_${lang}.json`, FALLBACK)
  const labels = copy?.events || FALLBACK.events

  useEffect(() => {
    let cancelled = false
    loadEvents(lang).then((list) => {
      if (!cancelled) setEvents(Array.isArray(list) ? list : [])
    })
    return () => {
      cancelled = true
    }
  }, [lang])

  const sorted = useMemo(() => {
    return [...events].sort((a, b) => String(b.date).localeCompare(String(a.date)))
  }, [events])

  return (
    <main className="pageWrap">
      <section className="section pageSection">
        <h1 className="sectionTitle">{labels.title || 'Events'}</h1>
        {labels.subtitle ? <p className="sectionSubtitle">{labels.subtitle}</p> : null}

        {sorted.length === 0 ? (
          <div className="emptyState">{labels.noEvents || 'No events'}</div>
        ) : (
          <div className="eventsListGrid">
            {sorted.map((e) => (
              <Link key={e.id} to={`/events/${e.slug}`} className="eventListCard">
                <div className="eventListTop">
                  <span className="pill">{e.tag || 'Event'}</span>
                  <span className="eventListDate">{e.date}</span>
                </div>
                <div className="eventListBody">
                  <h3 className="eventListTitle">{e.title}</h3>
                  {e.location ? <div className="eventListMeta">{e.location}</div> : null}
                  {e.desc ? <p className="eventListDesc">{e.desc}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
