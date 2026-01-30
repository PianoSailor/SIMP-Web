import { useNavigate } from 'react-router-dom'
import { useContentJson } from '../utils/useContent'

const FALLBACK = {
  featured: true,
  title: '2026 Performance — Sign Up',
  subtitle: 'Join the cast & crew for our 2026 performance project.',
  ctaLabel: 'Sign up',
  pagePath: '/performance-2026',
  banner: '',
}

export default function PerformancePromo({ lang = 'en' }) {
  const navigate = useNavigate()
  const data = useContentJson(`/content/performance_${lang}.json`, FALLBACK)

  if (!data?.featured) return null

  return (
    <section className="section performancePromo" aria-label="Performance signup">
      <div className="perfCard">
        {data.banner ? <img className="perfBanner" src={data.banner} alt="" /> : null}
        <div className="perfBody">
          <div className="perfTitle">{data.title || FALLBACK.title}</div>
          {data.subtitle ? <div className="perfSub">{data.subtitle}</div> : null}
        </div>
        <div className="perfCta">
          <button className="btn primary" onClick={(e) => { e.stopPropagation(); navigate(data.pagePath || '/performance-2026') }}>
            {data.ctaLabel || FALLBACK.ctaLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
