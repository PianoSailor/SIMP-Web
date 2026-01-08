export async function loadEvents() {
  // Decap CMS writes to /public/content/events.json
  // This works in dev (Vite) and in production (Netlify).
  try {
    const res = await fetch('/content/events.json', { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    const events = Array.isArray(data?.events) ? data.events : []
    // Normalize: ensure required fields and date string YYYY-MM-DD
    return events
      .filter(Boolean)
      .map((e, i) => ({
        id: e.id || `cms-${i}`,
        date: typeof e.date === 'string' ? e.date.slice(0, 10) : '',
        title: e.title || 'Untitled',
        tag: e.tag || 'Event',
        desc: e.desc || '',
        location: e.location || '',
        image: e.image || '',
      }))
      .filter((e) => e.date && e.title)
  } catch {
    return []
  }
}
