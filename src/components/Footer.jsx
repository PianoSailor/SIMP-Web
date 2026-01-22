import { useContentJson } from '../utils/useContent'

const FALLBACK = {
  footer: {
    line1: '© 2026 Student Institution of miHoYo Players – University of Melbourne',
    line2: 'Made with love for Hoyoverse games.',
  },
}

export default function Footer({ lang = 'en' }) {
  const site = useContentJson(`/content/site_${lang}.json`, FALLBACK)
  const f = site?.footer || FALLBACK.footer

  return (
    <footer className="footer">
      <div>{f.line1}</div>
      <div className="muted">{f.line2}</div>
    </footer>
  )
}
