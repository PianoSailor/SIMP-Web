import { useEffect, useRef, useState } from "react";

/**
 * Seamless infinite carousel logic (ported directly from the
 * `infinite-seamless-carousel-react-mouse-wheel-seamless-fixed` reference zip).
 *
 * This hook intentionally mirrors the reference implementation:
 * - Measures ONE full set via `scrollWidth`.
 * - Computes `copies >= ceil(viewport/setWidth) + 3` (min 4) to avoid gaps.
 * - Wraps offset modulo setWidth for a truly seamless loop.
 * - Wheel/trackpad adjusts offset; keyboard arrows supported when focused.
 * - Auto-scrolls unless hovered/focused or shortly after user interaction.
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
  const [copies, setCopies] = useState(4);

  // Animation refs (avoid re-rendering every frame)
  const offsetRef = useRef(0);
  const rafRef = useRef(0);
  const lastTRef = useRef(0);
  const lastInteractionRef = useRef(0);
  const hoveringRef = useRef(false);

  // Measure widths and decide how many copies we need
  useEffect(() => {
    const root = viewportRef.current;
    const firstSet = firstSetRef.current;
    if (!root || !firstSet) return;

    const compute = () => {
      // IMPORTANT: Use scrollWidth (reference implementation), NOT boundingClientRect.
      const w = Math.ceil(firstSet.scrollWidth);
      const vw = Math.ceil(root.clientWidth);

      if (w > 0) {
        setSetWidth(w);
        const needed = Math.max(4, Math.ceil(vw / w) + 3);
        setCopies(needed);
      }
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(root);
    ro.observe(firstSet);

    const t = window.setTimeout(compute, 200);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
    };
  }, [viewportRef, firstSetRef]);

  // Apply transform whenever offset changes
  const applyTransform = () => {
    const track = trackRef.current;
    if (!track || !setWidth) return;

    // Wrap offset into [0, setWidth)
    let x = offsetRef.current % setWidth;
    if (x < 0) x += setWidth;

    track.style.transform = `translateX(${-x}px)`;
  };

  // Hover pause (match reference behavior)
  useEffect(() => {
    const root = viewportRef.current;
    if (!root || !pauseOnHover) return;

    const onEnter = () => {
      hoveringRef.current = true;
      lastInteractionRef.current = performance.now();
    };
    const onLeave = () => {
      hoveringRef.current = false;
      lastInteractionRef.current = performance.now();
    };

    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, [viewportRef, pauseOnHover]);

  // Wheel/trackpad scrolling (ported directly)
  useEffect(() => {
    const root = viewportRef.current;
    if (!root || !enableWheel) return;

    const onWheel = (e) => {
      if (!setWidth) return;
      e.preventDefault();

      lastInteractionRef.current = performance.now();

      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      offsetRef.current += delta;
      applyTransform();
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWidth, enableWheel]);

  // Keyboard arrows (when focused)
  useEffect(() => {
    const root = viewportRef.current;
    if (!root || !enableKeyboard) return;

    const onKeyDown = (e) => {
      if (!setWidth) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();

      lastInteractionRef.current = performance.now();
      const step = 80;
      offsetRef.current += e.key === "ArrowRight" ? step : -step;
      applyTransform();
    };

    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWidth, enableKeyboard]);

  // Auto-scroll loop (ported directly)
  useEffect(() => {
    const root = viewportRef.current;
    if (!root || !setWidth) return;

    const pxPerSecond = setWidth / Math.max(1, secondsPerLoop);
    const pauseAfterInteractionMs = 1200;

    const tick = (t) => {
      const lastT = lastTRef.current || t;
      const dt = (t - lastT) / 1000;
      lastTRef.current = t;

      const sinceInteraction = t - (lastInteractionRef.current || 0);
      const shouldPause =
        (pauseOnHover && hoveringRef.current) ||
        root.matches(":focus-within") ||
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
