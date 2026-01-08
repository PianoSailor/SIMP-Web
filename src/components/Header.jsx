import { useEffect, useState } from 'react'

export default function Header({ theme, setTheme, themeLabel }) {
  const [open, setOpen] = useState(false)

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

  return (
    <header className="header">
      <div className="brand" onClick={() => go('#top')} role="button" tabIndex={0}>
        <div className="logoPack" aria-hidden="true">
          <div className="logoOrb" />
          <div className="logoOrb alt" />
        </div>
        <div className="brandText">
          <div className="brandTitle">Student Institution of miHoYo Players</div>
          <div className="brandSub">UniMelb · Genshin · HSR · ZZZ</div>
        </div>
      </div>

      <nav className="nav desktop">
        <button className="navLink" onClick={() => go('#events')}>Events</button>
        <button className="navLink" onClick={() => go('#committee')}>Committee</button>
        <button className="navLink" onClick={() => go('#explore')}>About & Contact</button>

        <div className="themeChip" title="Theme">
          <span className="themeLabel">{themeLabel}</span>
          <div className="themeBtns">
            <button className={`themeBtn ${theme === 'genshin' ? 'active' : ''}`} onClick={() => setTheme('genshin')}>GI</button>
            <button className={`themeBtn ${theme === 'hsr' ? 'active' : ''}`} onClick={() => setTheme('hsr')}>HSR</button>
            <button className={`themeBtn ${theme === 'zzz' ? 'active' : ''}`} onClick={() => setTheme('zzz')}>ZZZ</button>
          </div>
        </div>
      </nav>

      <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
        <span /><span /><span />
      </button>

      <div className={`sheetBackdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sheet ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="sheetHeader">
          <div className="sheetTitle">Navigation</div>
          <button className="iconBtn" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
        </div>

        <div className="sheetLinks">
          <button className="sheetLink" onClick={() => go('#events')}>Events</button>
          <button className="sheetLink" onClick={() => go('#committee')}>Committee</button>
          <button className="sheetLink" onClick={() => go('#explore')}>About & Contact</button>
        </div>

        <div className="sheetDivider" />

        <div className="sheetTheme">
          <div className="sheetTitleSmall">Theme</div>
          <div className="themeBtns big">
            <button className={`themeBtn ${theme === 'genshin' ? 'active' : ''}`} onClick={() => setTheme('genshin')}>Genshin</button>
            <button className={`themeBtn ${theme === 'hsr' ? 'active' : ''}`} onClick={() => setTheme('hsr')}>HSR</button>
            <button className={`themeBtn ${theme === 'zzz' ? 'active' : ''}`} onClick={() => setTheme('zzz')}>ZZZ</button>
          </div>
        </div>
      </aside>
    </header>
  )
}
