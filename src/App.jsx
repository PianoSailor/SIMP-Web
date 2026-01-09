import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Events from './components/Events'
import Committee from './components/Committee'
import Explore from './components/Explore'
import Footer from './components/Footer'

const THEME_KEY = 'simp_theme'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'genshin')

  // Apply theme tokens to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // Section reveal animation
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('section'))
    nodes.forEach(n => n.classList.add('reveal'))

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add('in-view')
        })
      },
      { threshold: 0.12 }
    )

    nodes.forEach(n => io.observe(n))
    return () => io.disconnect()
  }, [])

  const themeLabel = useMemo(() => {
    if (theme === 'hsr') return 'HSR'
    if (theme === 'zzz') return 'ZZZ'
    return 'Genshin'
  }, [theme])

  return (
    <>
      <Header theme={theme} setTheme={setTheme} themeLabel={themeLabel} />
      <Hero />
      <Events />
      <Committee />
      <Explore />
      <Footer />
    </>
  )
}
