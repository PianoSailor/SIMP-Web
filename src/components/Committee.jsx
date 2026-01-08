const COMMITTEE = [
  { name: 'President', role: 'Leadership · Partnerships', fav: 'Genshin', msg: 'Keeping the club welcoming & active.' },
  { name: 'Vice President', role: 'Operations · Events', fav: 'HSR', msg: 'Turning ideas into real meetups.' },
  { name: 'Secretary', role: 'Admin · Comms', fav: 'ZZZ', msg: 'Keeping everything organised & clear.' },
  { name: 'Treasurer', role: 'Budget · Sponsorship', fav: 'Genshin', msg: 'Funding the fun responsibly.' },
  { name: 'Events Lead', role: 'Runs activities', fav: 'HSR', msg: 'Game nights, collabs, and more.' },
  { name: 'Media Lead', role: 'Design · Socials', fav: 'ZZZ', msg: 'Making the club look as cool as it feels.' },
]

export default function Committee() {
  return (
    <section id="committee" className="section">
      <div className="sectionHead">
        <div>
          <h2 className="h2">Our Committee</h2>
          <p className="muted">Run by passionate Hoyoverse players. Hover to learn more.</p>
        </div>

        <div className="actions">
          <button className="btn secondary">Meet the Committee</button>
          <button className="btn primary">We Are Recruiting</button>
        </div>
      </div>

      <div className="committeeGrid">
        {COMMITTEE.map((m, idx) => (
          <div key={idx} className="memberCard">
            <div className="memberTop">
              <div className="avatar" aria-hidden="true" />
              <div>
                <div className="memberName">{m.name}</div>
                <div className="muted">{m.role}</div>
              </div>
            </div>

            <div className="memberBottom">
              <span className="pill">Fav: {m.fav}</span>
              <span className="muted">Hover for profile</span>
            </div>

            <div className="hoverPanel">
              <div className="hoverTitle">{m.name}</div>
              <div className="muted">{m.role}</div>
              <div className="hoverMsg">{m.msg}</div>
              <div className="hoverActions">
                <button className="btn secondary small">Contact</button>
                <button className="btn primary small">Apply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
