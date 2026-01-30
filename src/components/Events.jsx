import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminHighlightsManager from './AdminHighlightsManager'
import { loadEvents } from '../utils/loadEvents'
import InfiniteSeamlessCarousel from './InfiniteSeamlessCarousel'
import { useContentJson } from '../utils/useContent'

/**
 * Fallback events (used if CMS events.json is empty / missing)
 */
const FALLBACK_EVENTS = [
  {
    id: 'e1',
    date: '2026-03-05',
    title: 'Semester Kickoff Meet & Greet',
    tag: 'Social',
    desc: 'Meet new members, swap UIDs, and form co-op teams.',
    location: 'Union House (TBC)',
  },
]

const FALLBACK = {
  events: {
    eventCalendar: 'Event Calendar',
    monthGridHint: 'Click on highlighted days to view events.',
    previousMonth: 'Previous Month',
    nextMonth: 'Next Month',
    today: 'Today',
    weekLabelsHint: 'UniMelb semester week labels are shown where applicable.',
    selectedDate: 'Selected Date',
    noEvents: 'No events scheduled for this date.',
    clickHighlightedDay: 'Click on a highlighted day in the calendar to see events here.',
    viewFullCalendar: 'View Full Calendar',
    suggestEvent: 'Suggest an Event',
    pastHighlights: 'Past Highlights',
    carouselHint: 'Browse through our past event highlights.',
  }
}

/**
 * Fallback highlights (CMS can later populate /content/highlights.json)
 */
const FALLBACK_HIGHLIGHTS = [
  { key: 'h1', media: 'a', week: 'Week 0', month: 'Nov', title: 'Lantern Rite Hangout', sub: 'Cosy social + photos' },
  { key: 'h2', media: 'b', week: 'Week 2', month: 'Nov', title: 'HSR Theorycraft Night', sub: 'Builds + team comps' },
  { key: 'h3', media: 'c', week: 'Week 4', month: 'Dec', title: 'ZZZ Clips Showcase', sub: 'Best moments compilation' },
  { key: 'h4', media: 'a', week: 'Week 6', month: 'Dec', title: 'Collab Night', sub: 'Cross-game mini events' },
]

const LS_HL_KEY = 'simp_highlight_images_v1'

function loadHighlightMapping() {
  try {
    const raw = localStorage.getItem(LS_HL_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/* -----------------------
   Date helpers
----------------------- */
function pad2(n) { return String(n).padStart(2, '0') }
function toISODate(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }
function sameMonth(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() }
function monthStart(d) { return new Date(d.getFullYear(), d.getMonth(), 1) }

function clampMonth(d, min, max) {
  const x = monthStart(d)
  if (x < min) return new Date(min)
  if (x > max) return new Date(max)
  return x
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function inRange(d, a, b) {
  const x = startOfDay(d).getTime()
  return x >= startOfDay(a).getTime() && x <= startOfDay(b).getTime()
}

/* -----------------------
   UniMelb week labels (2026)
   - NO "S1/S2" strings shown
   - S1 teaching: Mar 2 → May 29, 2026
   - S2 teaching: Jul 27 → Oct 23, 2026
----------------------- */
const S1 = {
  oweek: { start: new Date(2026, 1, 23), end: new Date(2026, 1, 27) }, // Feb 23–27
  break: { start: new Date(2026, 3, 3), end: new Date(2026, 3, 12) },  // Apr 3–12
  swot: { start: new Date(2026, 5, 1), end: new Date(2026, 5, 5) },   // Jun 1–5
  // 12 teaching weeks start Mondays
  weekStarts: [
    new Date(2026, 2, 2),
    new Date(2026, 2, 9),
    new Date(2026, 2, 16),
    new Date(2026, 2, 23),
    new Date(2026, 2, 30),
    new Date(2026, 3, 13), // after break
    new Date(2026, 3, 20),
    new Date(2026, 3, 27),
    new Date(2026, 4, 4),
    new Date(2026, 4, 11),
    new Date(2026, 4, 18),
    new Date(2026, 4, 25),
  ],
  teachingEnd: new Date(2026, 4, 29), // May 29
}

const S2 = {
  oweek: { start: new Date(2026, 6, 20), end: new Date(2026, 6, 24) }, // Jul 20–24
  break: { start: new Date(2026, 8, 28), end: new Date(2026, 9, 4) },  // Sep 28–Oct 4
  swot: { start: new Date(2026, 9, 26), end: new Date(2026, 9, 30) }, // Oct 26–30
  weekStarts: [
    new Date(2026, 6, 27),
    new Date(2026, 7, 3),
    new Date(2026, 7, 10),
    new Date(2026, 7, 17),
    new Date(2026, 7, 24),
    new Date(2026, 7, 31),
    new Date(2026, 8, 7),
    new Date(2026, 8, 14),
    new Date(2026, 8, 21),
    new Date(2026, 9, 5),  // after break
    new Date(2026, 9, 12),
    new Date(2026, 9, 19),
  ],
  teachingEnd: new Date(2026, 9, 23), // Oct 23
}

function weekOf(date, sem) {
  const d = startOfDay(date)

  if (inRange(d, sem.break.start, sem.break.end)) return null
  if (inRange(d, sem.swot.start, sem.swot.end)) return null
  if (inRange(d, sem.oweek.start, sem.oweek.end)) return null
  if (d.getTime() > startOfDay(sem.teachingEnd).getTime()) return null

  let idx = -1
  for (let i = 0; i < sem.weekStarts.length; i++) {
    if (startOfDay(sem.weekStarts[i]).getTime() <= d.getTime()) idx = i
  }
  return idx === -1 ? null : idx + 1
}

function getUniMelbLabel(date) {
  const d = startOfDay(date)

  if (inRange(d, S1.oweek.start, S1.oweek.end)) return { kind: 'oweek', text: 'O-Week' }
  if (inRange(d, S2.oweek.start, S2.oweek.end)) return { kind: 'oweek', text: 'O-Week' }

  if (inRange(d, S1.break.start, S1.break.end)) return { kind: 'break', text: 'Mid-sem Break' }
  if (inRange(d, S2.break.start, S2.break.end)) return { kind: 'break', text: 'Mid-sem Break' }

  if (inRange(d, S1.swot.start, S1.swot.end)) return { kind: 'swot', text: 'SWOTVAC' }
  if (inRange(d, S2.swot.start, S2.swot.end)) return { kind: 'swot', text: 'SWOTVAC' }

  const w1 = weekOf(d, S1)
  if (w1) return { kind: 'week', text: `Week ${w1}` }

  const w2 = weekOf(d, S2)
  if (w2) return { kind: 'week', text: `Week ${w2}` }

  return null
}



/* -----------------------
   Admin mode: URL-bound and auto-closes when ?admin=1 is removed
----------------------- */
function isAdminFromUrl() {
  try {
    const url = new URL(window.location.href)
    return url.searchParams.get('admin') === '1'
  } catch {
    return false
  }
}

function installLocationChangeEventsOnce() {
  if (typeof window === 'undefined') return
  if (window.__simp_locationchange_installed) return
  window.__simp_locationchange_installed = true

  const wrap = (type) => {
    const orig = history[type]
    return function wrapped(...args) {
      const ret = orig.apply(this, args)
      window.dispatchEvent(new Event('locationchange'))
      return ret
    }
  }
  history.pushState = wrap('pushState')
  history.replaceState = wrap('replaceState')
  window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')))
}

/* -----------------------
   CMS Highlights (optional)
----------------------- */
async function loadHighlights() {
  try {
    const res = await fetch('/content/highlights.json', { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    const list = Array.isArray(data?.highlights) ? data.highlights : []
    return list.filter(Boolean).map((h, i) => ({
      key: h.key || `h-${i}`,
      media: h.media || 'a',
      week: h.week || 'Week ?',
      month: h.month || '',
      title: h.title || 'Highlight',
      sub: h.sub || '',
      image: h.image || '',
    }))
  } catch {
    return []
  }
}

export default function Events({ lang = 'en' }) {
  const site = useContentJson(`/content/site_${lang}.json`, FALLBACK)

  const navigate = useNavigate()
  // URL-bound admin mode
  const [adminMode, setAdminMode] = useState(() => (typeof window !== 'undefined' ? isAdminFromUrl() : false))

  useEffect(() => {
    if (typeof window === 'undefined') return
    installLocationChangeEventsOnce()
    const sync = () => setAdminMode(isAdminFromUrl())
    sync()
    window.addEventListener('locationchange', sync)
    return () => window.removeEventListener('locationchange', sync)
  }, [])

  // Ctrl+Shift+A toggles ?admin=1
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        const url = new URL(window.location.href)
        if (url.searchParams.get('admin') === '1') url.searchParams.delete('admin')
        else url.searchParams.set('admin', '1')
        history.pushState({}, '', url.toString())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Highlight images mapping (local override)
  const [highlightMap, setHighlightMap] = useState(() => (typeof window !== 'undefined' ? loadHighlightMapping() : {}))

  // Highlights (CMS -> fallback, and CMS image path as default)
  const [highlights, setHighlights] = useState(FALLBACK_HIGHLIGHTS)

  useEffect(() => {
    ;(async () => {
      const cms = await loadHighlights()
      if (cms.length > 0) setHighlights(cms)
    })()
  }, [])

  // Events: CMS -> fallback
  const [events, setEvents] = useState(FALLBACK_EVENTS)

  useEffect(() => {
    ;(async () => {
      const cms = await loadEvents(lang)
      if (cms.length > 0) setEvents(cms)
    })()
  }, [lang])

  /* -----------------------
     Calendar month range: current month .. Dec 2026
  ----------------------- */
  const minMonth = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }, [])
  const maxMonth = useMemo(() => new Date(2026, 11, 1), []) // Dec 2026

  const [monthCursor, setMonthCursor] = useState(() => clampMonth(new Date(), minMonth, maxMonth))
  const [selectedISO, setSelectedISO] = useState(() => toISODate(new Date()))

  const monthLabel = useMemo(
    () => monthCursor.toLocaleString(undefined, { month: 'long', year: 'numeric' }),
    [monthCursor]
  )

  const monthMatrix = useMemo(() => {
    const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - first.getDay()) // Sunday grid start
    const cells = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      cells.push(d)
    }
    return cells
  }, [monthCursor])

  const eventsByDate = useMemo(() => {
    const map = new Map()
    for (const e of events) {
      if (!e?.date) continue
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date).push(e)
    }
    return map
  }, [events])

  const eventsInMonth = useMemo(() => {
    const y = monthCursor.getFullYear()
    const m = monthCursor.getMonth() + 1
    const prefix = `${y}-${pad2(m)}-`
    return events.filter((e) => e?.date?.startsWith(prefix)).sort((a, b) => a.date.localeCompare(b.date))
  }, [events, monthCursor])

  useEffect(() => {
    const sel = selectedISO ? new Date(`${selectedISO}T00:00:00`) : null
    const inThisMonth = sel ? sameMonth(sel, monthCursor) : false
    if (inThisMonth) return

    if (eventsInMonth.length > 0) setSelectedISO(eventsInMonth[0].date)
    else setSelectedISO(toISODate(monthStart(monthCursor)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthCursor, eventsInMonth])

  const selectedEvents = useMemo(
    () => (selectedISO ? (eventsByDate.get(selectedISO) || []) : []),
    [selectedISO, eventsByDate]
  )

  const selectedPretty = useMemo(() => {
    if (!selectedISO) return '—'
    const d = new Date(`${selectedISO}T00:00:00`)
    return d.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  }, [selectedISO])

  const selectedUniLabel = useMemo(() => {
    if (!selectedISO) return null
    return getUniMelbLabel(new Date(`${selectedISO}T00:00:00`))
  }, [selectedISO])

  const canPrev = useMemo(() => monthCursor > minMonth, [monthCursor, minMonth])
  const canNext = useMemo(() => monthCursor < maxMonth, [monthCursor, maxMonth])

  const prevMonth = () => {
    if (!canPrev) return
    const d = new Date(monthCursor)
    d.setMonth(d.getMonth() - 1)
    setMonthCursor(clampMonth(d, minMonth, maxMonth))
  }
  const goToday = () => {
    const now = new Date()
    setMonthCursor(clampMonth(now, minMonth, maxMonth))
    setSelectedISO(toISODate(now))
  }

  const nextMonth = () => {
    if (!canNext) return
    const d = new Date(monthCursor)
    d.setMonth(d.getMonth() + 1)
    setMonthCursor(clampMonth(d, minMonth, maxMonth))
  }

  // Carousel: use the proven reference component (transform-based + wheel)
  // This avoids native scroll friction and prevents wrap "jump back to start".

  return (
      <section id="events" className="section">
        <div className="sectionHead">
          <div>
            <h2 className="h2">{site?.events?.eventCalendar}</h2>
            <p className="muted">{site?.events?.monthGridHint}</p>
          </div>

          <div className="monthControls">
            <button className="iconBtn" onClick={prevMonth} aria-label={site?.events?.previousMonth} disabled={!canPrev}>‹</button>
            <button className="todayBtn" onClick={goToday} type="button">{site?.events?.today}</button>
            <div className="monthLabel">{monthLabel}</div>
            <button className="iconBtn" onClick={nextMonth} aria-label={site?.events?.nextMonth} disabled={!canNext}>›</button>
          </div>
        </div>

        <div className="eventsLayout">
          <div className="panel calendar">
            <div className="calendarTop">
              <div className="calendarMonth">{monthLabel}</div>
              <div className="muted calendarHint">{site?.events?.weekLabelsHint}</div>
            </div>

            <div className="dow">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <div className="grid">
              {monthMatrix.map((d) => {
                const iso = toISODate(d)
                const inMonth = sameMonth(d, monthCursor)
                const hasEvents = eventsByDate.has(iso)
                const isSelected = iso === selectedISO

                const uni = getUniMelbLabel(d)
                const showWeekOnMonday = uni?.kind === 'week' && d.getDay() === 1 // Monday
                const showSpecial = uni && uni.kind !== 'week'

                return (
                    <button
                        key={iso}
                        className={[
                          'day',
                          inMonth ? 'inMonth' : 'outMonth',
                          hasEvents ? 'has' : '',
                          isSelected ? 'selected' : '',
                          showSpecial ? `special ${uni.kind}` : '',
                        ].join(' ')}
                        onClick={() => setSelectedISO(iso)}
                        type="button"
                    >
                      {(showWeekOnMonday || showSpecial) && (
                          <span className={['weekTag', showSpecial ? 'special' : ''].join(' ')}>
                      {uni.text}
                    </span>
                      )}

                      <span className="num">{d.getDate()}</span>
                      {hasEvents && <span className="dot" aria-hidden="true" />}
                    </button>
                )
              })}
            </div>

            <div className="legend">
              <span className="legendItem"><span className="legendSwatch oweek" /> O-Week</span>
              <span className="legendItem"><span className="legendSwatch break" /> Mid-sem Break</span>
              <span className="legendItem"><span className="legendSwatch swot" /> SWOTVAC</span>
              <span className="legendItem"><span className="legendSwatch week" /> Teaching Weeks (label shown on Mondays)</span>
            </div>
          </div>

          <div className="panel cards">
            <div className="cardsTop">
              <div className="cardsTitle">{site?.events?.selectedDate}</div>
              <div className="cardsDate">
                {selectedPretty}
                {selectedUniLabel && <span className={`uniPill ${selectedUniLabel.kind}`}>{selectedUniLabel.text}</span>}
              </div>
            </div>

            {selectedEvents.length === 0 ? (
                <div className="empty">
                  <div className="emptyTitle">{site?.events?.noEvents}</div>
                  <div className="muted">{site?.events?.clickHighlightedDay}</div>
                </div>
            ) : (
              <>
                <div className="eventsCarousel">
                                <InfiniteSeamlessCarousel
                                  ariaLabel="Events carousel"
                                  secondsPerLoop={18}
                                  pauseOnHover
                                  items={selectedEvents}
                                  renderItem={(e) => (
                                    <button key={e.id} className="eventCarouselCard" onClick={() => navigate(`/events/${e.slug}`)} type="button">
                                      <div className="eventMeta">
                                        <span className="pill">{e.tag || 'Event'}</span>
                                        <span className="eventDate">{e.date}</span>
                                      </div>
                                      <div className="eventTitle">{e.title}</div>
                                      {e.location ? <div className="eventLocation">{e.location}</div> : null}
                                    </button>
                                  )}
                                />
                              </div>

                <div className="eventCards">
                                  {selectedEvents.map((e) => (
                                      <button key={e.id} className="eventCard" onClick={() => navigate(`/events/${e.slug}`)} type="button">
                                        <div className="eventMeta">
                                          <span className="pill">{e.tag || 'Event'}</span>
                                          <span className="muted">{e.location}</span>
                                        </div>
                                        <h3 className="h3">{e.title}</h3>
                                        <p className="muted">{e.desc}</p>
                                      </button>
                                  ))}
                                </div>
              </>
            )}


            <div className="cardActions">
              <button className="btn primary" type="button">{site?.events?.viewFullCalendar}</button>
              <button className="btn secondary" type="button">{site?.events?.suggestEvent}</button>
            </div>
          </div>
        </div>

        <div className="carouselWrap">
          <div className="sectionHead mini">
            <h3 className="h3">{site?.events?.pastHighlights}</h3>
            <p className="muted">{site?.events?.carouselHint}</p>
          </div>

          <InfiniteSeamlessCarousel
              ariaLabel="Highlights carousel"
              secondsPerLoop={16}
              pauseOnHover
              items={highlights}
              renderItem={(h) => {
                const mapped = highlightMap?.[h.key]
                const src = mapped || h.image || ''
                return (
                    <div className="slide" key={h.key}>
                      <div className={`slideMedia ${h.media} ${src ? 'hasImage' : ''}`}>
                        {src ? <img className="mediaImg" src={src} alt={`${h.title} highlight`} loading="lazy" /> : null}
                      </div>
                      <div className="slideText">
                        <div className="slideMeta muted">{h.week}{h.month ? ` · ${h.month}` : ''}</div>
                        <div className="slideTitle">{h.title}</div>
                      </div>
                    </div>
                )
              }}
          />

          {adminMode && (
              <AdminHighlightsManager
                  highlights={highlights}
                  onMappingChange={(m) => setHighlightMap(m)}
              />
          )}
        </div>
      </section>
  )
}
