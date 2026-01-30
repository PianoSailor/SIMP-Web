import { useContentJson } from '../utils/useContent'
import Footer from '../components/Footer'
import Explore from '../components/Explore'

const FALLBACK = {
  title: '2026 Performance — Sign Up',
  text: 'We are planning a 2026 performance project. Register your interest to be notified about auditions, rehearsals, roles and updates.',
  banner: '',
  formUrl: '#',
  ctaLabel: 'Open sign-up form',
}

export default function Performance2026({ lang = 'en' }) {
  const data = useContentJson(`/content/performance_${lang}.json`, FALLBACK)

  return (
    <main className="page">
      <section className="section pageHero">
        <h1 className="pageTitle">{data.title || FALLBACK.title}</h1>
        <div className="pageGrid">
          <div className="pageText">
            <p className="lead">{data.text || FALLBACK.text}</p>
            <a
              className="btn primary"
              href={data.formUrl || '#'}
              target={data.formUrl && data.formUrl !== '#' ? '_blank' : undefined}
              rel={data.formUrl && data.formUrl !== '#' ? 'noreferrer' : undefined}
              onClick={(e) => {
                if (!data.formUrl || data.formUrl === '#') e.preventDefault()
              }}
            >
              {data.ctaLabel || FALLBACK.ctaLabel}
            </a>
          </div>
          <div className="pageMedia">
            {data.banner ? <img className="pageImage" src={data.banner} alt="" /> : <div className="pageImage ph" />}
          </div>
        </div>
      </section>

      <Explore lang={lang} />
      <Footer lang={lang} />
    </main>
  )
}
