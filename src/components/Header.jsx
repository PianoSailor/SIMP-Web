import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSiteContent } from '../utils/useSiteContent'

const FALLBACK = {
  header: {
    clubName: 'Student Institution of miHoYo Players',
    brandSub: 'UniMelb · Genshin · HSR · ZZZ',
    logoPrimary: '',
    logoSecondary: '',
    navLinks: [
      { label: 'Home', href: '/' },
      { label: 'Events', href: '#events' },
      { label: 'Committee', href: '/committee' },
      { label: 'About & Contact', href: '/about' },
    ],
  },
  language: {
    label: 'Language',
    options: { en: 'EN', zh: '简体中文', ja: '日本語' },
  },
}

export default function Header({ theme, setTheme, themeLabel, lang = 'en', setLang }) {
  const navigate = useNavigate()
  const location = useLocation()
  const site = useSiteContent(lang, FALLBACK)
  const header = site?.header || FALLBACK.header
  const language = site?.language || FALLBACK.language

  const navLinks = Array.isArray(header.navLinks) ? header.navLinks : FALLBACK.header.navLinks

  const [open, setOpen] = useState(false)

  // Close sheet on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  function go(href) {
    if (href === '#events') {
      navigate('/events')
      return
    }

    if (!href) return
    if (href.startsWith('#')) {
      // ensure we're on home first
      if (location.pathname !== '/') {
        navigate('/')
        // give router a tick to render home
        setTimeout(() => {
          const el = document.querySelector(href)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 50)
      } else {
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }
    navigate(href)
  }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      go('#top')
    }
  }

  function LogoPack() {
    if (!header.logoPrimary && !header.logoSecondary) return null
    return (
      <div className="logos">
        {header.logoPrimary ? <img className="logo" src={header.logoPrimary} alt="Logo" /> : null}
        {header.logoSecondary ? <img className="logo" src={header.logoSecondary} alt="Logo" /> : null}
      </div>
    )
  }

  const langOptions = useMemo(() => {
    const opts = language?.options || FALLBACK.language.options
    return [
      { value: 'en', label: opts.en || 'EN' },
      { value: 'zh', label: opts.zh || '简体中文' },
      { value: 'ja', label: opts.ja || '日本語' },
    ]
  }, [language])

  return (
    <header className="header">
      <div className="brand" onClick={() => go('#top')} onKeyDown={onKey} role="button" tabIndex={0}>
        <LogoPack />
        <div className="brandText">
          <div className="brandTitle">{header.clubName}</div>
          <div className="brandSub">{header.brandSub}</div>
        </div>
      </div>

      <nav className="nav desktop">
        {navLinks.map((l) => (
          <button key={l.href} className="navLink" onClick={() => go(l.href)}>
            {l.label}
          </button>
        ))}

        <div className="langChip" title={language?.label || 'Language'}>
          <select
            className="langSelect"
            value={lang}
            onChange={(e) => setLang?.(e.target.value)}
            aria-label={language?.label || 'Language'}
          >
            {langOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="themeChip" title="Theme">
          <span className="themeLabel">Theme</span>
          <div className="themeBtns">
            <button className={`themeBtn ${theme === 'genshin' ? 'active' : ''}`} onClick={() => setTheme('genshin')}>
              GI
            </button>
            <button className={`themeBtn ${theme === 'hsr' ? 'active' : ''}`} onClick={() => setTheme('hsr')}>
              HSR
            </button>
            <button className={`themeBtn ${theme === 'zzz' ? 'active' : ''}`} onClick={() => setTheme('zzz')}>
              ZZZ
            </button>
          </div>
        </div>
      </nav>

      <button className="hamburger" aria-label="Menu" onClick={() => setOpen((s) => !s)}>
        <span />
        <span />
        <span />
      </button>

      <div className={`sheet ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <div className="sheetPanel" onClick={(e) => e.stopPropagation()}>
          <div className="sheetTitle">{header.clubName}</div>

          <div className="sheetLinks">
            {navLinks.map((l) => (
              <button key={`m-${l.href}`} className="sheetLink" onClick={() => go(l.href)}>
                {l.label}
              </button>
            ))}
          </div>

          <div className="sheetDivider" />

          <div className="sheetLang">
            <div className="sheetTitleSmall">{language?.label || 'Language'}</div>
            <select className="langSelect big" value={lang} onChange={(e) => setLang?.(e.target.value)}>
              {langOptions.map((o) => (
                <option key={`m-${o.value}`} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sheetDivider" />

          <div className="sheetTheme">
            <div className="sheetTitleSmall">Theme</div>
            <div className="themeBtns big">
              <button className={`themeBtn ${theme === 'genshin' ? 'active' : ''}`} onClick={() => setTheme('genshin')}>
                Genshin
              </button>
              <button className={`themeBtn ${theme === 'hsr' ? 'active' : ''}`} onClick={() => setTheme('hsr')}>
                HSR
              </button>
              <button className={`themeBtn ${theme === 'zzz' ? 'active' : ''}`} onClick={() => setTheme('zzz')}>
                ZZZ
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
