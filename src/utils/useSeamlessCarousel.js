import { useEffect, useRef, useState } from "react";

/**
 * Seamless infinite transform-based carousel:
 * - Moves track using translateX (not scrollLeft), so it animates smoothly on all widths.
 * - Wraps offset modulo the exact width of ONE full set, so the loop is truly seamless.
 * - Dynamically renders enough copies to prevent gaps on ultra-wide screens.
 * - Supports mouse wheel / trackpad horizontal-feel scrolling and keyboard arrows.
 */
export function useSeamlessCarousel({
  viewportRef,
  trackRef,
  firstSetRef,
  secondsPerLoop = 16,
  pauseOnHover = true,
  enableWheel = true,
  enableKeyboard = true
}) {
  const [setWidth, setSetWidth] = useState(0);
  const [copies, setCopies] = useState(2);

  const offsetRef = useRef(0);
  const rafRef = useRef(0);
  const lastTRef = useRef(0);
  const lastInteractionRef = useRef(0);
  const hoveringRef = useRef(false);

  const applyTransform = () => {
    const track = trackRef.current;
    if (!track || !setWidth) return;

    let x = offsetRef.current % setWidth;
    if (x < 0) x += setWidth;

    track.style.transform = `translate3d(${-x}px, 0, 0)`;
  };

  // Measure one full set + compute how many copies we need to avoid gaps
  useEffect(() => {
    const viewport = viewportRef.current;
    const firstSet = firstSetRef.current;
    if (!viewport || !firstSet) return;

    const compute = () => {
      const w = firstSet.getBoundingClientRect().width;
      const vw = viewport.getBoundingClientRect().width;

      const nextW = Number.isFinite(w) ? Math.max(0, w) : 0;
      setSetWidth(nextW);

      if (!nextW || !vw) {
        setCopies(2);
        return;
      }

      // Render more than we strictly need so there is always content while wrapping
      const needed = Math.ceil((vw * 2) / nextW) + 1;
      setCopies(Math.max(2, needed));
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(viewport);
    ro.observe(firstSet);

    const t = window.setTimeout(compute, 200);

    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, [viewportRef, firstSetRef]);

  // Hover pause
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !pauseOnHover) return;

    const onEnter = () => (hoveringRef.current = true);
    const onLeave = () => (hoveringRef.current = false);

    viewport.addEventListener("mouseenter", onEnter);
    viewport.addEventListener("mouseleave", onLeave);
    viewport.addEventListener("touchstart", onEnter, { passive: true });
    viewport.addEventListener("touchend", onLeave, { passive: true });

    return () => {
      viewport.removeEventListener("mouseenter", onEnter);
      viewport.removeEventListener("mouseleave", onLeave);
      viewport.removeEventListener("touchstart", onEnter);
      viewport.removeEventListener("touchend", onLeave);
    };
  }, [viewportRef, pauseOnHover]);

  // Mouse/trackpad wheel to "scroll" the carousel
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !setWidth || !enableWheel) return;

    const onWheel = (e) => {
      // Prevent the page from scrolling when user interacts with carousel
      e.preventDefault();

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      offsetRef.current += delta;
      lastInteractionRef.current = performance.now();
      applyTransform();
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWidth, enableWheel]);

  // Keyboard arrows when focused
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !setWidth || !enableKeyboard) return;

    const onKeyDown = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();

      const step = Math.max(40, Math.min(140, setWidth / 12));
      offsetRef.current += e.key === "ArrowRight" ? step : -step;
      lastInteractionRef.current = performance.now();
      applyTransform();
    };

    viewport.addEventListener("keydown", onKeyDown);
    return () => viewport.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWidth, enableKeyboard]);

  // Auto-scroll loop
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !setWidth) return;

    // If secondsPerLoop is 0 or negative, stop auto-scroll.
    const seconds = Math.max(0, secondsPerLoop);
    if (!seconds) {
      applyTransform();
      return;
    }

    const pxPerSecond = setWidth / seconds;
    const pauseAfterInteractionMs = 1200;

    const tick = (t) => {
      const lastT = lastTRef.current || t;
      const dt = (t - lastT) / 1000;
      lastTRef.current = t;

      const sinceInteraction = t - (lastInteractionRef.current || 0);
      const shouldPause =
        (pauseOnHover && hoveringRef.current) ||
        viewport.matches(":focus-within") ||
        sinceInteraction < pauseAfterInteractionMs;

      if (!shouldPause) {
        offsetRef.current += pxPerSecond * dt;
        applyTransform();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWidth, secondsPerLoop, pauseOnHover]);

  // Keep transform in sync when setWidth changes
  useEffect(() => {
    applyTransform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWidth]);

  return { copies };
}
