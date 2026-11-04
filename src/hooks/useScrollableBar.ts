import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

interface UseScrollableBarOptions {
  /** Extra horizontal pixels outside the scroll track (padding, fixed icons, gaps) */
  extraWidthPx?: number;
}

interface ScrollBarState {
  hasOverflow: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

export function useScrollableBar({
  extraWidthPx = 12,
}: UseScrollableBarOptions = {}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState<ScrollBarState>({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  });

  const updateScrollState = useCallback(() => {
    const wrapperEl = wrapperRef.current;
    const scrollEl = scrollRef.current;
    if (!wrapperEl || !scrollEl) return;

    const neededWidth = scrollEl.scrollWidth + extraWidthPx;
    const availableWidth = wrapperEl.clientWidth;
    const hasOverflow = neededWidth > availableWidth + 1;

    const canScrollLeft = hasOverflow && scrollEl.scrollLeft > 2;
    const canScrollRight =
      hasOverflow &&
      scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 2;

    setState((prev) => {
      if (
        prev.hasOverflow === hasOverflow &&
        prev.canScrollLeft === canScrollLeft &&
        prev.canScrollRight === canScrollRight
      ) {
        return prev;
      }
      return { hasOverflow, canScrollLeft, canScrollRight };
    });
  }, [extraWidthPx]);

  useLayoutEffect(() => {
    updateScrollState();
  }, [updateScrollState]);

  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    const scrollEl = scrollRef.current;
    if (!wrapperEl || !scrollEl) return;

    // Re-measure on the next frame as well in case layout settles after mount
    const rafId = requestAnimationFrame(() => updateScrollState());

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateScrollState())
        : null;

    ro?.observe(wrapperEl);
    ro?.observe(scrollEl);

    scrollEl.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => updateScrollState());
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      scrollEl.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const step = Math.max(130, Math.round(scrollEl.clientWidth * 0.68));
    scrollEl.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    });
  }, []);

  const maskStyle: CSSProperties | undefined = (() => {
    if (!state.hasOverflow) return undefined;
    let gradient: string | undefined;
    if (state.canScrollLeft && state.canScrollRight) {
      gradient =
        'linear-gradient(to right, transparent 0px, #000 18px, #000 calc(100% - 18px), transparent 100%)';
    } else if (state.canScrollRight) {
      gradient =
        'linear-gradient(to right, #000 0px, #000 calc(100% - 20px), transparent 100%)';
    } else if (state.canScrollLeft) {
      gradient =
        'linear-gradient(to right, transparent 0px, #000 20px, #000 100%)';
    }
    if (!gradient) return undefined;
    return {
      maskImage: gradient,
      WebkitMaskImage: gradient,
    };
  })();

  return {
    wrapperRef,
    scrollRef,
    hasOverflow: state.hasOverflow,
    canScrollLeft: state.canScrollLeft,
    canScrollRight: state.canScrollRight,
    scrollByStep,
    maskStyle,
    updateScrollState,
  };
}
