import { useContentJson } from '../utils/useContent'

const FALLBACK = {
  header: { clubName: 'Student Institution of miHoYo Players' },
  hero: {
    kicker: 'Student Institution of miHoYo Players · UniMelb',
    title: 'Connecting Hoyoverse Gamers at UniMelb',
    subtitle: 'Genshin Impact · Honkai: Star Rail · Zenless Zone Zero',
    primaryCta: { label: 'See Events', href: '#events' },
    secondaryCta: { label: 'Join & Contact', href: '#explore' },
  },
}

export default function Hero({ lang = 'en' }) {
  const site = useContentJson(`/content/site_${lang}.json`, FALLBACK)
  const hero = site?.hero || FALLBACK.hero

  return (
    <section className="hero" id="top">
      <div className="heroPanel">
        <div className="kicker">{hero.kicker}</div>
        <h1 className="heroTitle">{hero.title}</h1>
        <p className="heroSub">{hero.subtitle}</p>

        <div className="heroCtas">
          <a className="btn primary" href={hero.primaryCta?.href || '#events'}>
            {hero.primaryCta?.label || 'See Events'}
          </a>
          <a className="btn secondary" href={hero.secondaryCta?.href || '#explore'}>
            {hero.secondaryCta?.label || 'Join & Contact'}
          </a>
        </div>
      </div>
    </section>
  )
}
