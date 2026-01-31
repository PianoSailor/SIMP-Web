import React, { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Direct port of the working logic from:
 * infinite-seamless-carousel-react-mouse-wheel-seamless-fixed.zip
 *
 * Key properties (kept the same):
 * - Track moves via transform (no native scrollbars).
 * - Wheel / trackpad adjusts the same offset, with preventDefault.
 * - Offset wraps modulo the exact width of ONE full set.
 * - Copies scale with viewport width to avoid gaps on ultra-wide screens.
 */
export default function InfiniteSeamlessCarousel({
  items,
  renderItem,
  secondsPerLoop = 16,
  pauseOnHover = true,
  ariaLabel = 'carousel',
}) {
  const rootRef = useRef(null)
  const trackRef = useRef(null)
  const firstSetRef = useRef(null)

  const [setWidth, setSetWidth] = useState(0)
  const [copies, setCopies] = useState(4)

  // Animation refs (avoid re-rendering every frame)
  const offsetRef = useRef(0)
  const rafRef = useRef(0)
  const lastTRef = useRef(0)
  const lastInteractionRef = useRef(0)
  const hoveringRef = useRef(false)

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items])

  // Measure widths and decide how many copies we need
  useEffect(() => {
    const root = rootRef.current
    const firstSet = firstSetRef.current
    if (!root || !firstSet) return

    const compute = () => {
      const w = Math.ceil(firstSet.scrollWidth)
      const vw = Math.ceil(root.clientWidth)

      if (w > 0) {
        setSetWidth(w)
        // Ensure enough copies to cover viewport + extra buffer
        const needed = Math.max(4, Math.ceil(vw / w) + 3)
        setCopies(needed)
      }
    }

    compute()

    const ro = new ResizeObserver(() => compute())
    ro.observe(root)
    ro.observe(firstSet)

    // Allow fonts/images to settle
    const t = window.setTimeout(compute, 200)

    return () => {
      window.clearTimeout(t)
      ro.disconnect()
    }
  }, [safeItems])

  const applyTransform = () => {
    const track = trackRef.current
    if (!track || !setWidth) return

    let x = offsetRef.current % setWidth
    if (x < 0) x += setWidth

    track.style.transform = `translateX(${-x}px)`
  }

  // Wheel / trackpad to "scroll" the carousel
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const onWheel = (e) => {
      e.preventDefault()
      lastInteractionRef.current = performance.now()

      // Trackpad can produce deltaX; mouse wheel usually deltaY.
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      offsetRef.current += delta
      applyTransform()
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWidth])

  // Keyboard support when focused
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const onKeyDown = (e) => {
      if (!setWidth) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        lastInteractionRef.current = performance.now()
        const step = 80
        offsetRef.current += e.key === 'ArrowRight' ? step : -step
        applyTransform()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => root.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWidth])

  // Auto-scroll loop
  useEffect(() => {
    const root = rootRef.current
    if (!root || !setWidth) return

    const pxPerSecond = setWidth / Math.max(1, secondsPerLoop)
    const pauseAfterInteractionMs = 1200

    const tick = (t) => {
      const lastT = lastTRef.current || t
      const dt = (t - lastT) / 1000
      lastTRef.current = t

      const sinceInteraction = t - (lastInteractionRef.current || 0)
      const shouldPause =
        (pauseOnHover && hoveringRef.current) ||
        root.matches(':focus-within') ||
        sinceInteraction < pauseAfterInteractionMs

      if (!shouldPause) {
        offsetRef.current += pxPerSecond * dt
        applyTransform()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWidth, secondsPerLoop, pauseOnHover])

  const onMouseEnter = () => {
    hoveringRef.current = true
    lastInteractionRef.current = performance.now()
  }
  const onMouseLeave = () => {
    hoveringRef.current = false
    lastInteractionRef.current = performance.now()
  }

  if (!safeItems.length) return null

  return (
    <section
      className="simpCarousel"
      aria-label={ariaLabel}
      ref={rootRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={0}
      role="group"
    >
      <div className="simpCarousel__track" ref={trackRef}>
        {/* First set for measurement */}
        <div className="simpCarousel__set" ref={firstSetRef} aria-hidden="true">
          {safeItems.map((it, idx) => (
            <div className="simpCarousel__item" key={`m-${idx}`}>
              {renderItem ? renderItem(it) : null}
            </div>
          ))}
        </div>

        {/* Remaining copies */}
        {Array.from({ length: Math.max(0, copies - 1) }).map((_, copyIdx) => (
          <div className="simpCarousel__set" key={`copy-${copyIdx}`} aria-hidden="true">
            {safeItems.map((it, idx) => (
              <div className="simpCarousel__item" key={`c-${copyIdx}-${idx}`}>
                {renderItem ? renderItem(it) : null}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Screen-reader list */}
      <ul className="sr-only">
        {safeItems.map((it, idx) => (
          <li key={`sr-${idx}`}>{String(it?.title || it?.name || 'Item')}</li>
        ))}
      </ul>
    </section>
  )
}
