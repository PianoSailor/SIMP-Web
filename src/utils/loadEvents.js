async function fetchEventsFile(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function loadEvents(lang = 'en') {
  // Decap CMS writes to /public/content/events_<lang>.json
  // Fallback order: requested lang -> en -> empty list
  const bust = `v=${Date.now()}`
  const primary = await fetchEventsFile(`/content/events_${lang}.json?${bust}`)
  const fallback = lang !== 'en' ? await fetchEventsFile(`/content/events_en.json?${bust}`) : null
  const data = primary || fallback
  const events = Array.isArray(data?.events) ? data.events : []

  return events
    .filter(Boolean)
    .map((e, i) => ({
      id: e.id || `cms-${i}`,
      slug: e.slug || (e.title ? String(e.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `event-${i}`),
      date: typeof e.date === 'string' ? e.date.slice(0, 10) : '',
      title: e.title || 'Untitled',
      tag: e.tag || 'Event',
      desc: e.desc || '',
      location: e.location || '',
      image: e.image || '',
      recap: e.recap || '',
      gallery: Array.isArray(e.gallery) ? e.gallery.filter(Boolean) : [],
    }))
    .filter((e) => e.date && e.title)
}
