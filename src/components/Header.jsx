import { useEffect, useMemo, useState } from 'react'
import { useContentJson } from '../utils/useContent'

const FALLBACK = {
  header: {
    clubName: 'Student Institution of miHoYo Players',
    brandSub: 'UniMelb · Genshin · HSR · ZZZ',
    logoPrimary: '',
    logoSecondary: '',
    navLinks: [
      { label: 'Events', href: '#events' },
      { label: 'Committee', href: '#committee' },
      { label: 'About & Contact', href: '#explore' },
    ],
  },
}

export default function Header({ theme, setTheme, themeLabel }) {
  const [open, setOpen] = useState(false)
  const site = useContentJson('/content/site.json', FALLBACK)
  const header = site?.header || FALLBACK.header

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (hash) => {
    setOpen(false)
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const navLinks = useMemo(() => {
    const links = Array.isArray(header.navLinks) ? header.navLinks : FALLBACK.header.navLinks
    return links.filter((x) => x && x.href && x.label)
  }, [header.navLinks])

  const LogoPack = () => {
    const a = header.logoPrimary
    const b = header.logoSecondary
    if (a || b) {
      return (
        <div className="logoPack" aria-hidden="true">
          {a ? <img className="logoImg" src={a} alt="" /> : <div className="logoOrb" />}
          {b ? <img className="logoImg" src={b} alt="" /> : <div className="logoOrb alt" />}
        </div>
      )
    }
    return (
      <div className="logoPack" aria-hidden="true">
        <div className="logoOrb" />
        <div className="logoOrb alt" />
      </div>
    )
  }

  return (
    <header className="header">
      <div className="brand" onClick={() => go('#top')} role="button" tabIndex={0}>
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

        <div className="themeChip" title="Theme">
          <span className="themeLabel">{themeLabel}</span>
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

      <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>

      <div className={`sheetBackdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sheet ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="sheetHeader">
          <div className="sheetTitle">Navigation</div>
          <button className="iconBtn" onClick={() => setOpen(false)} aria-label="Close menu">
            ✕
          </button>
        </div>

        <div className="sheetLinks">
          {navLinks.map((l) => (
            <button key={`m-${l.href}`} className="sheetLink" onClick={() => go(l.href)}>
              {l.label}
            </button>
          ))}
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
      </aside>
    </header>
  )
}
