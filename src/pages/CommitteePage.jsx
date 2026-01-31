import { useContentJson } from '../utils/useContent'
import Explore from '../components/Explore'
import Footer from '../components/Footer'

const FALLBACK_SITE = { committee: { title: 'Committee', subtitle: 'Meet the team behind SIMP UniMelb.' } }
const FALLBACK = {
  members: [],
  signup: {
    title: 'Join the committee',
    text: 'Interested in helping run events and build the community? Apply here.',
    formUrl: '#',
    ctaLabel: 'Apply',
  },
}

export default function CommitteePage({ lang = 'en' }) {
  const site = useContentJson(`/content/site_${lang}.json`, FALLBACK_SITE)
  const data = useContentJson(`/content/committee_${lang}.json`, FALLBACK)
  const section = site?.committee || FALLBACK_SITE.committee

  const members = Array.isArray(data?.members) ? data.members : []

  return (
    <main className="page">
      <section className="section">
        <h1 className="pageTitle">{section.title || 'Committee'}</h1>
        {section.subtitle ? <p className="lead">{section.subtitle}</p> : null}

        <div className="committeeGrid">
          {members.slice(0, 8).map((m, idx) => (
            <div key={m.name || idx} className="committeeCardLarge">
              <div className="committeeCardTop">
                {m.photo ? <img className="committeePhotoLarge" src={m.photo} alt={m.name || 'Committee'} /> : <div className="committeePhotoLarge ph" />}
                <div className="committeeMeta">
                  <div className="committeeName">{m.name || 'Member'}</div>
                  <div className="committeeRole">{m.role || ''}</div>
                  {m.slogan ? <div className="committeeSlogan">“{m.slogan}”</div> : null}
                  {m.favGame ? <div className="committeeFav">{m.favGame}</div> : null}
                </div>
              </div>
              {m.bio ? <div className="committeeBio">{m.bio}</div> : null}
            </div>
          ))}
        </div>

        <div className="applyBar">
          <div>
            <div className="blockTitle">{data?.signup?.title || FALLBACK.signup.title}</div>
            <div className="muted">{data?.signup?.text || FALLBACK.signup.text}</div>
          </div>
          <a
            className="btn primary"
            href={data?.signup?.formUrl || '#'}
            target={data?.signup?.formUrl && data.signup.formUrl !== '#' ? '_blank' : undefined}
            rel={data?.signup?.formUrl && data.signup.formUrl !== '#' ? 'noreferrer' : undefined}
            onClick={(e) => {
              if (!data?.signup?.formUrl || data.signup.formUrl === '#') e.preventDefault()
            }}
          >
            {data?.signup?.ctaLabel || FALLBACK.signup.ctaLabel}
          </a>
        </div>
      </section>

      <Explore lang={lang} />
      <Footer lang={lang} />
    </main>
  )
}
