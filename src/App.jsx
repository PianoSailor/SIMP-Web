import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import CommitteePage from './pages/CommitteePage'
import About from './pages/About'
import Performance2026 from './pages/Performance2026'
import EventDetail from './pages/EventDetail'
import EventsList from './pages/EventsList'

const THEME_KEY = 'simp_theme'
const LANG_KEY = 'simp_lang'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'genshin')
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'en')
  const location = useLocation()

  // Apply theme tokens to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang)
  }, [lang])

  // Always start each page at the top on navigation (including via nav links)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  // If we navigate to home with a hash, scroll to it.
  useEffect(() => {
    if (location.pathname !== '/') return
    if (!location.hash) return
    const el = document.querySelector(location.hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.pathname, location.hash])

  const themeLabel = useMemo(() => {
    if (theme === 'hsr') return 'HSR'
    if (theme === 'zzz') return 'ZZZ'
    return 'Genshin'
  }, [theme])

  return (
    <>
      <Header theme={theme} setTheme={setTheme} themeLabel={themeLabel} lang={lang} setLang={setLang} />
      <Routes>
        <Route path="/" element={<Home lang={lang} />} />
        <Route path="/events" element={<EventsList lang={lang} />} />
        <Route path="/events/:slug" element={<EventDetail lang={lang} />} />
        <Route path="/performance-2026" element={<Performance2026 lang={lang} />} />
        <Route path="/committee" element={<CommitteePage lang={lang} />} />
        <Route path="/about" element={<About lang={lang} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
