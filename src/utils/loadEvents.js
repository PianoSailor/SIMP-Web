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
  // Base data lives in events_en.json; other languages can override only text fields.
  const getKey = (e, i) => e?.id || e?.slug || `idx-${i}`
  const slugify = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const bust = `v=${Date.now()}`
  const baseData = await fetchEventsFile(`/content/events_en.json?${bust}`)
  const baseEvents = Array.isArray(baseData?.events) ? baseData.events : []
  const baseSlugMap = new Map(
    baseEvents.map((base, i) => {
      let slug = typeof base?.slug === 'string' ? base.slug.trim() : ''
      if (!slug && base?.title) slug = slugify(base.title)
      if (!slug) slug = `event-${i}`
      return [getKey(base, i), slug]
    })
  )

  let mergedEvents = baseEvents
  if (lang && lang !== 'en') {
    const langData = await fetchEventsFile(`/content/events_${lang}.json?${bust}`)
    const langEvents = Array.isArray(langData?.events) ? langData.events : []

    const overrides = new Map(langEvents.map((e, i) => [getKey(e, i), e]))
    const usedOverrideKeys = new Set()

    mergedEvents = baseEvents.map((base, i) => {
      const key = getKey(base, i)
      const override = overrides.get(key)
      if (override) usedOverrideKeys.add(key)
      return override ? { ...base, ...override } : base
    })

    // Append any override-only events (if present)
    for (const [key, override] of overrides.entries()) {
      if (!usedOverrideKeys.has(key)) mergedEvents.push(override)
    }
  }

  return mergedEvents
    .filter(Boolean)
        .map((e, i) => {
      const rawGallery = Array.isArray(e.gallery) ? e.gallery : []
      const gallery = rawGallery
        .map((g) => {
          if (!g) return ''
          if (typeof g === 'string') return g
          if (typeof g === 'object') return g.image || g.url || ''
          return ''
        })
        .filter(Boolean)

      const rawLinks = Array.isArray(e.socialLinks) ? e.socialLinks : []
      const socialLinks = rawLinks
        .map((l) => {
          if (!l) return null
          if (typeof l === 'string') return { label: '', url: l }
          return { label: l.label || '', url: l.url || '' }
        })
        .filter((x) => x && x.url)

      return {
        id: e.id || `cms-${i}`,
        slug: (() => {
          const raw = typeof e.slug === 'string' ? e.slug.trim() : ''
          if (raw) return raw
          const key = getKey(e, i)
          const baseSlug = baseSlugMap.get(key)
          if (baseSlug) return baseSlug
          const byTitle = e.title ? slugify(e.title) : ''
          return byTitle || `event-${i}`
        })(),
        date: typeof e.date === 'string' ? e.date.slice(0, 10) : '',
        time: e.time || '',
        title: e.title || 'Untitled',
        tag: e.tag || 'Event',
        desc: e.desc || '',
        location: e.location || '',
        image: e.image || '',
        details: e.details || e.recap || '',
        featured: !!e.featured,
        socialLinks,
        gallery,
      }
    })
    .filter((e) => e.date && e.title)
}
