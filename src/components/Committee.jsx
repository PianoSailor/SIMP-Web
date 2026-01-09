import { useContentJson } from '../utils/useContent'

const FALLBACK = {
  title: 'Our Committee',
  subtitle: 'Run by passionate Hoyoverse players. Hover to learn more.',
  members: [
    { name: 'President', role: 'Leadership · Partnerships', fav: 'Genshin', msg: 'Keeping the club welcoming & active.' },
    { name: 'Vice President', role: 'Operations · Events', fav: 'HSR', msg: 'Turning ideas into real meetups.' },
    { name: 'Secretary', role: 'Admin · Comms', fav: 'ZZZ', msg: 'Keeping everything organised & clear.' },
    { name: 'Treasurer', role: 'Budget · Sponsorship', fav: 'Genshin', msg: 'Funding the fun responsibly.' },
    { name: 'Events Lead', role: 'Runs activities', fav: 'HSR', msg: 'Game nights, collabs, and more.' },
    { name: 'Media Lead', role: 'Design · Socials', fav: 'ZZZ', msg: 'Making the club look as cool as it feels.' },
  ],
}

export default function Committee() {
  const site = useContentJson('/content/site.json', { committee: { title: FALLBACK.title, subtitle: FALLBACK.subtitle } })
  const cms = useContentJson('/content/committee.json', { members: [] })

  const title = site?.committee?.title || FALLBACK.title
  const subtitle = site?.committee?.subtitle || FALLBACK.subtitle
  const members = (cms?.members?.length ? cms.members : FALLBACK.members)
    .map((m) => {
      if (!m) return null
      const contactUrl = m.contactUrl || (m.email ? `mailto:${m.email}` : '') || ''
      const msg = m.msg || m.bio || ''
      return { ...m, contactUrl, msg }
    })
    .filter(Boolean)

  return (
    <section id="committee" className="section">
      <div className="sectionHead">
        <div>
          <h2 className="h2">{title}</h2>
          <p className="muted">{subtitle}</p>
        </div>
      </div>

      <div className="gridCards">
        {members.map((m, idx) => (
          <div key={`${m.name || 'member'}-${idx}`} className="card hoverCard">
            <div className="cardTop">
              <div className="pill">{m.fav || 'Hoyoverse'}</div>
              {m.photo ? (
                <img className="avatar" src={m.photo} alt={m.name || 'Committee member'} loading="lazy" />
              ) : (
                <div className="avatar ph" aria-hidden="true" />
              )}
            </div>

            <div className="cardBody">
              <div className="cardTitle">{m.name}</div>
              <div className="muted">{m.role}</div>
            </div>

            <div className="hoverPanel">
              <div className="hoverTitle">{m.name}</div>
              <div className="muted">{m.role}</div>
              <div className="hoverMsg">{m.msg}</div>
              <div className="hoverActions">
                {m.contactUrl ? (
                  <a className="btn secondary small" href={m.contactUrl} target="_blank" rel="noreferrer">
                    Contact
                  </a>
                ) : (
                  <button className="btn secondary small" type="button" disabled>
                    Contact
                  </button>
                )}
                {m.applyUrl ? (
                  <a className="btn primary small" href={m.applyUrl} target="_blank" rel="noreferrer">
                    Apply
                  </a>
                ) : (
                  <button className="btn primary small" type="button" disabled>
                    Apply
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
