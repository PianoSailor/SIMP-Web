import { useRef } from 'react'
import { useEffect } from 'react'

function useAutoScroll(ref, speed = 0.35) {
  const paused = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.classList.add('autoscroll')

    const onEnter = () => (paused.current = true)
    const onLeave = () => (paused.current = false)

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('touchstart', onEnter, { passive: true })
    el.addEventListener('touchend', onLeave, { passive: true })

    let raf = 0
    const tick = () => {
      const node = ref.current
      if (node && !paused.current) {
        node.scrollLeft += speed
        const max = node.scrollWidth - node.clientWidth
        if (max > 0 && node.scrollLeft >= max - 1) node.scrollLeft = 0
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      el.classList.remove('autoscroll')
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('touchstart', onEnter)
      el.removeEventListener('touchend', onLeave)
    }
  }, [ref, speed])
}

export default function Explore() {
  const links = [
    { title: 'Discord', desc: 'Events, LFG, announcements', hint: 'Join our server' },
    { title: 'Instagram', desc: 'Photos + updates', hint: '@simp_unimelb' },
    { title: 'Reddit', desc: 'Discussion threads', hint: 'Community hub' },
    { title: 'Bilibili', desc: 'Clips and highlights', hint: 'Media archive' },
  ]

  const ref = useRef(null)
  useAutoScroll(ref, 0.28)

  return (
    <section id="explore" className="section">
      <div className="sectionHead">
        <div>
          <h2 className="h2">Explore More</h2>
          <p className="muted">Links carousel (auto-scrolls; hover/touch to pause). Replace with real URLs later.</p>
        </div>
      </div>

      <div className="carousel compact" ref={ref}>
        {links.map((x) => (
          <a key={x.title} className="linkSlide" href="#" onClick={(e) => e.preventDefault()}>
            <div className="linkTitle">{x.title}</div>
            <div className="muted">{x.desc}</div>
            <div className="linkHint">{x.hint}</div>
          </a>
        ))}
      </div>
    </section>
  )
}
