import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { Download, Moon, Sun } from 'lucide-react';
import type { PortfolioData } from '../types/portfolio';

interface NavbarProps {
  profile: PortfolioData['profile'];
  theme: 'architectural' | 'blueprint';
  onToggleTheme: () => void;
  onDownloadResume: () => void;
}

const navLinks = [
  { id: 'top', code: '00', label: 'Overview', href: '#top' },
  { id: 'projects', code: '01', label: 'Projects', href: '#projects' },
  { id: 'expertise', code: '02', label: 'Expertise', href: '#expertise' },
  { id: 'experience', code: '03', label: 'Experience', href: '#experience' },
  { id: 'contact', code: '04', label: 'Contact', href: '#contact' },
] as const;

type SectionId = (typeof navLinks)[number]['id'];
type PillTransitionMode = 'initial' | 'glide' | 'direct';

const SECTION_INDEX: Record<SectionId, number> = {
  top: 0,
  projects: 1,
  expertise: 2,
  experience: 3,
  contact: 4,
};

interface HorizontalPill {
  left: number;
  width: number;
  ready: boolean;
  mode: PillTransitionMode;
  directKey: number;
}

interface DepartingHorizontalPill {
  left: number;
  width: number;
  key: number;
}

interface VerticalPill {
  top: number;
  height: number;
  ready: boolean;
  mode: PillTransitionMode;
  directKey: number;
}

interface DepartingVerticalPill {
  top: number;
  height: number;
  key: number;
}

export function Navbar({
  profile,
  theme,
  onToggleTheme,
  onDownloadResume,
}: NavbarProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('top');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [desktopPill, setDesktopPill] = useState<HorizontalPill>({
    left: 0,
    width: 0,
    ready: false,
    mode: 'initial',
    directKey: 0,
  });
  const [departingDesktopPill, setDepartingDesktopPill] =
    useState<DepartingHorizontalPill | null>(null);
  const [mobilePill, setMobilePill] = useState<VerticalPill>({
    top: 0,
    height: 0,
    ready: false,
    mode: 'initial',
    directKey: 0,
  });
  const [departingMobilePill, setDepartingMobilePill] =
    useState<DepartingVerticalPill | null>(null);

  const activeSectionRef = useRef<SectionId>('top');
  const prevRenderedSectionRef = useRef<SectionId>('top');
  const directSeqRef = useRef(0);
  const desktopGeoRef = useRef({ left: 0, width: 0, ready: false });
  const mobileGeoRef = useRef({ top: 0, height: 0, ready: false });

  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const mobileListRef = useRef<HTMLDivElement | null>(null);
  const desktopLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const mobileLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const isAnimatingScrollRef = useRef(false);
  const animEndTimeRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);
  const releaseLockTimerRef = useRef<number | null>(null);
  const closeMenuTimerRef = useRef<number | null>(null);
  const settledClickRef = useRef<{ id: SectionId; scrollY: number } | null>(
    null
  );

  const applyPillForSection = useCallback(
    (section: SectionId, mode: PillTransitionMode, directKey: number) => {
      const dEl = desktopLinkRefs.current[section];
      if (dEl && dEl.offsetWidth > 0) {
        const nextLeft = dEl.offsetLeft;
        const nextWidth = dEl.offsetWidth;
        desktopGeoRef.current = {
          left: nextLeft,
          width: nextWidth,
          ready: true,
        };
        setDesktopPill((prev) => {
          if (
            prev.ready &&
            prev.left === nextLeft &&
            prev.width === nextWidth &&
            prev.mode === mode &&
            prev.directKey === directKey
          ) {
            return prev;
          }
          return {
            left: nextLeft,
            width: nextWidth,
            ready: true,
            mode,
            directKey,
          };
        });
      }

      const mEl = mobileLinkRefs.current[section];
      if (mEl && mEl.offsetHeight > 0) {
        const nextTop = mEl.offsetTop;
        const nextHeight = mEl.offsetHeight;
        mobileGeoRef.current = {
          top: nextTop,
          height: nextHeight,
          ready: true,
        };
        setMobilePill((prev) => {
          if (
            prev.ready &&
            prev.top === nextTop &&
            prev.height === nextHeight &&
            prev.mode === mode &&
            prev.directKey === directKey
          ) {
            return prev;
          }
          return {
            top: nextTop,
            height: nextHeight,
            ready: true,
            mode,
            directKey,
          };
        });
      }
    },
    []
  );

  const syncPillGeometry = useCallback((section: SectionId) => {
    const dEl = desktopLinkRefs.current[section];
    if (dEl && dEl.offsetWidth > 0) {
      const nextLeft = dEl.offsetLeft;
      const nextWidth = dEl.offsetWidth;
      desktopGeoRef.current = { left: nextLeft, width: nextWidth, ready: true };
      setDesktopPill((prev) => {
        if (prev.ready && prev.left === nextLeft && prev.width === nextWidth) {
          return prev;
        }
        return {
          ...prev,
          left: nextLeft,
          width: nextWidth,
          ready: true,
          mode: 'initial',
        };
      });
    }

    const mEl = mobileLinkRefs.current[section];
    if (mEl && mEl.offsetHeight > 0) {
      const nextTop = mEl.offsetTop;
      const nextHeight = mEl.offsetHeight;
      mobileGeoRef.current = { top: nextTop, height: nextHeight, ready: true };
      setMobilePill((prev) => {
        if (prev.ready && prev.top === nextTop && prev.height === nextHeight) {
          return prev;
        }
        return {
          ...prev,
          top: nextTop,
          height: nextHeight,
          ready: true,
          mode: 'initial',
        };
      });
    }
  }, []);

  useLayoutEffect(() => {
    const prevSection = prevRenderedSectionRef.current;
    const stepDistance = Math.abs(
      SECTION_INDEX[activeSection] - SECTION_INDEX[prevSection]
    );

    prevRenderedSectionRef.current = activeSection;
    activeSectionRef.current = activeSection;

    if (stepDistance > 1) {
      // Non-adjacent jump (e.g. Experience -> Overview with 2 buttons in between):
      // Cross-dissolve directly to target without sweeping across intermediate buttons
      directSeqRef.current += 1;
      const key = directSeqRef.current;
      if (desktopGeoRef.current.ready) {
        setDepartingDesktopPill({
          left: desktopGeoRef.current.left,
          width: desktopGeoRef.current.width,
          key,
        });
      }
      if (mobileGeoRef.current.ready) {
        setDepartingMobilePill({
          top: mobileGeoRef.current.top,
          height: mobileGeoRef.current.height,
          key,
        });
      }
      applyPillForSection(activeSection, 'direct', key);
    } else if (stepDistance === 1) {
      setDepartingDesktopPill(null);
      setDepartingMobilePill(null);
      applyPillForSection(activeSection, 'glide', directSeqRef.current);
    } else {
      applyPillForSection(activeSection, 'initial', directSeqRef.current);
    }
  }, [activeSection, applyPillForSection]);

  useEffect(() => {
    const syncCurrent = () => syncPillGeometry(activeSectionRef.current);

    if (document.fonts?.ready) {
      document.fonts.ready.then(syncCurrent);
    }

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(syncCurrent)
        : null;

    if (desktopNavRef.current && ro) {
      ro.observe(desktopNavRef.current);
    }
    if (mobileListRef.current && ro) {
      ro.observe(mobileListRef.current);
    }

    const handleResize = () => {
      syncCurrent();
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [syncPillGeometry]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleNavClick = (
    e: MouseEvent<HTMLAnchorElement>,
    sectionId: SectionId,
    href: string,
    fromMobileMenu = false
  ) => {
    e.preventDefault();
    const wasSameSection = activeSectionRef.current === sectionId;

    activeSectionRef.current = sectionId;
    setActiveSection(sectionId);

    if (closeMenuTimerRef.current !== null) {
      window.clearTimeout(closeMenuTimerRef.current);
      closeMenuTimerRef.current = null;
    }

    if (fromMobileMenu) {
      const delayMs = wasSameSection ? 40 : 200;
      closeMenuTimerRef.current = window.setTimeout(() => {
        setIsMobileMenuOpen(false);
        closeMenuTimerRef.current = null;
      }, delayMs);
    } else {
      setIsMobileMenuOpen(false);
    }

    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
    if (releaseLockTimerRef.current !== null) {
      window.clearTimeout(releaseLockTimerRef.current);
      releaseLockTimerRef.current = null;
    }

    const targetEl = document.getElementById(sectionId);
    const isMobileViewport = window.innerWidth < 768;
    const headerOffset = isMobileViewport ? 76 : 88;
    const rawTargetY =
      sectionId === 'top' || !targetEl
        ? 0
        : Math.max(
            0,
            targetEl.getBoundingClientRect().top + window.scrollY - headerOffset
          );
    const maxScrollY =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetY = Math.min(rawTargetY, Math.max(0, maxScrollY));
    const startY = window.scrollY;
    const distance = targetY - startY;

    settledClickRef.current = { id: sectionId, scrollY: targetY };

    if (Math.abs(distance) < 4) {
      isAnimatingScrollRef.current = false;
      animEndTimeRef.current = performance.now();
      window.history.replaceState(null, '', href);
      return;
    }

    isAnimatingScrollRef.current = true;
    const duration = Math.min(440, Math.max(260, Math.abs(distance) * 0.16));
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Immediate cubic ease-out so clicking any button responds on frame 1 without hesitation
      const eased = 1 - Math.pow(1 - progress, 3);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        scrollFrameRef.current = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY);
        scrollFrameRef.current = null;
        animEndTimeRef.current = performance.now();
        settledClickRef.current = { id: sectionId, scrollY: window.scrollY };
        window.history.replaceState(null, '', href);

        // Hold scroll-spy lock until all trailing scroll events from final frame settle
        releaseLockTimerRef.current = window.setTimeout(() => {
          isAnimatingScrollRef.current = false;
          releaseLockTimerRef.current = null;
        }, 160);
      }
    };

    scrollFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const clearSettledIntentOnUserInput = () => {
      // Never cancel an active click-scroll or react to residual trackpad inertia right after clicking
      if (
        isAnimatingScrollRef.current ||
        performance.now() - animEndTimeRef.current < 260
      ) {
        return;
      }
      settledClickRef.current = null;
    };

    const commitActiveSection = (next: SectionId) => {
      if (activeSectionRef.current === next) return;
      activeSectionRef.current = next;
      setActiveSection(next);
    };

    const updateActiveSection = () => {
      if (isAnimatingScrollRef.current) return;

      const scrollY = window.scrollY;

      // Preserve the explicitly clicked tab while resting at its target scroll position
      if (settledClickRef.current !== null) {
        if (Math.abs(scrollY - settledClickRef.current.scrollY) <= 14) {
          commitActiveSection(settledClickRef.current.id);
          return;
        }
        settledClickRef.current = null;
      }

      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY < 140) {
        commitActiveSection('top');
        return;
      }

      if (scrollY + viewportHeight >= docHeight - 60) {
        commitActiveSection('contact');
        return;
      }

      const triggerLine = scrollY + Math.max(110, viewportHeight * 0.34);
      let current: SectionId = 'top';

      for (const link of navLinks) {
        const el = document.getElementById(link.id);
        if (el) {
          const elTop = el.getBoundingClientRect().top + scrollY;
          if (elTop <= triggerLine) {
            current = link.id;
          }
        }
      }

      commitActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('wheel', clearSettledIntentOnUserInput, {
      passive: true,
    });
    window.addEventListener('touchmove', clearSettledIntentOnUserInput, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('wheel', clearSettledIntentOnUserInput);
      window.removeEventListener('touchmove', clearSettledIntentOnUserInput);
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
      if (releaseLockTimerRef.current !== null) {
        window.clearTimeout(releaseLockTimerRef.current);
      }
      if (closeMenuTimerRef.current !== null) {
        window.clearTimeout(closeMenuTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Always-mounted smooth-fading backdrop when Mobile Hamburger Menu opens */}
      <div
        aria-hidden="true"
        onClick={() => setIsMobileMenuOpen(false)}
        className="fixed inset-0 z-30 bg-slate-950/25 backdrop-blur-[2px] md:hidden"
        style={{
          opacity: isMobileMenuOpen ? 1 : 0,
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
          transition: isMobileMenuOpen
            ? 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0ms linear 0ms'
            : 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0ms linear 250ms',
        }}
      />

      <header className="pointer-events-none fixed top-3 right-0 left-0 z-40 px-3 sm:top-4 sm:px-6">
        <nav
          aria-label="Primary Navigation"
          className="glass-strong pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full px-3 py-1.5 sm:px-5 sm:py-2"
        >
          {/* Minimalist Engineering Brand */}
          <a
            href="#top"
            onClick={(e) => handleNavClick(e, 'top', '#top')}
            className="flex min-w-0 items-center gap-2 text-xs font-semibold tracking-tight transition-opacity duration-200 hover:opacity-80 sm:gap-2.5 sm:text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/95 p-1 shadow-xs ring-1 ring-slate-900/10 sm:h-8 sm:w-8">
              <img
                src={profile.companyLogo}
                alt={profile.company}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="font-display truncate">{profile.shortName}</span>
            <span
              className="hidden font-mono text-[11px] font-normal xl:inline"
              style={{ color: 'var(--text-muted)' }}
            >
              {profile.credentials}
            </span>
          </a>

          {/* Tablet & Desktop Navigation Links: Glides on neighbor scroll, cross-dissolves directly across non-adjacent clicks */}
          <div
            ref={desktopNavRef}
            className="relative hidden items-center gap-0.5 rounded-full p-0.5 md:flex lg:gap-1"
          >
            {departingDesktopPill && (
              <span
                key={`depart-desktop-${departingDesktopPill.key}`}
                aria-hidden="true"
                className="pointer-events-none absolute top-0.5 bottom-0.5 left-0"
                style={{
                  width: `${departingDesktopPill.width}px`,
                  transform: `translate3d(${departingDesktopPill.left}px, 0, 0)`,
                }}
              >
                <span
                  className="block h-full w-full rounded-full"
                  style={{
                    backgroundColor: 'var(--accent-soft)',
                    border: '1px solid var(--accent-border)',
                    boxShadow: 'inset 0 1px 0 0 var(--glass-specular)',
                    animation:
                      'pill-direct-exit 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
                  }}
                />
              </span>
            )}

            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0.5 bottom-0.5 left-0 will-change-[transform,width]"
              style={{
                width: `${desktopPill.width}px`,
                transform: `translate3d(${desktopPill.left}px, 0, 0)`,
                opacity: desktopPill.ready ? 1 : 0,
                transition:
                  desktopPill.mode === 'glide'
                    ? 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), width 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease'
                    : 'opacity 180ms ease',
              }}
            >
              <span
                key={desktopPill.directKey}
                className="block h-full w-full rounded-full"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  border: '1px solid var(--accent-border)',
                  boxShadow: 'inset 0 1px 0 0 var(--glass-specular)',
                  transition:
                    'background-color 300ms ease, border-color 300ms ease',
                  animation:
                    desktopPill.mode === 'direct'
                      ? 'pill-direct-enter 240ms cubic-bezier(0.22, 1, 0.36, 1) both'
                      : 'none',
                }}
              />
            </span>

            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  ref={(el) => {
                    desktopLinkRefs.current[link.id] = el;
                  }}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.id, link.href)}
                  aria-current={isActive ? 'location' : undefined}
                  className="relative z-10 inline-flex items-center rounded-full px-2.5 py-1.5 text-xs font-medium tracking-wide whitespace-nowrap transition-colors duration-250 hover:opacity-100 lg:px-3.5"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Actions: Blueprint Mode Toggle + Desktop CV + Morphing Hamburger */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={
                theme === 'architectural'
                  ? 'Switch to Blueprint night mode'
                  : 'Switch to Architectural daylight mode'
              }
              title={
                theme === 'architectural'
                  ? 'Blueprint Mode'
                  : 'Architectural Daylight Mode'
              }
              className="tech-chip flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2.5 font-mono text-[11px] transition-all duration-300 hover:opacity-85"
            >
              {theme === 'architectural' ? (
                <>
                  <Moon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="hidden lg:inline">BLUEPRINT</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="hidden lg:inline">DAYLIGHT</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onDownloadResume}
              className="hidden h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] md:flex"
              style={{
                backgroundColor: 'var(--solid-bg)',
                color: 'var(--solid-fg)',
              }}
            >
              <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span>Profile / CV</span>
            </button>

            {/* Modern 2-Stroke Asymmetric Architectural Menu Toggle (< md) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={
                isMobileMenuOpen
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
              }
              className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-full active:scale-95 md:hidden"
              style={{
                backgroundColor: isMobileMenuOpen
                  ? 'var(--accent-soft)'
                  : 'var(--chip-bg)',
                border: isMobileMenuOpen
                  ? '1px solid var(--accent-border)'
                  : '1px solid var(--glass-border-outer)',
                boxShadow: 'inset 0 1px 0 0 var(--glass-specular)',
                color: isMobileMenuOpen
                  ? 'var(--accent)'
                  : 'var(--text-primary)',
                transition:
                  'background-color 280ms ease, border-color 280ms ease, color 280ms ease, transform 180ms ease',
              }}
            >
              <span aria-hidden="true" className="relative h-4 w-[15px]">
                {/* Top Full-Width Architectural Stroke */}
                <span
                  className="absolute top-1/2 right-0 -mt-[0.75px] h-[1.5px] w-[15px] origin-center rounded-full bg-current"
                  style={{
                    transform: isMobileMenuOpen
                      ? 'translate3d(0, 0, 0) rotate(45deg)'
                      : 'translate3d(0, -3.25px, 0) rotate(0deg)',
                    transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />

                {/* Subtle UMT Precision Gold Datum Dot (Left of Bottom Row) */}
                <span
                  className="absolute top-1/2 left-0 -mt-[1px] h-[2px] w-[2px] rounded-full"
                  style={{
                    backgroundColor: 'var(--gold-dot)',
                    opacity: isMobileMenuOpen ? 0 : 1,
                    transform: isMobileMenuOpen
                      ? 'translate3d(4px, 0, 0) scale(0)'
                      : 'translate3d(0, 3.25px, 0) scale(1)',
                    transition:
                      'transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease',
                  }}
                />

                {/* Bottom Staggered Asymmetric Stroke (Expands to Full X) */}
                <span
                  className="absolute top-1/2 right-0 -mt-[0.75px] h-[1.5px] origin-center rounded-full bg-current"
                  style={{
                    width: isMobileMenuOpen ? '15px' : '10.5px',
                    transform: isMobileMenuOpen
                      ? 'translate3d(0, 0, 0) rotate(-45deg)'
                      : 'translate3d(0, 3.25px, 0) rotate(0deg)',
                    transition:
                      'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), width 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </span>
            </button>
          </div>
        </nav>

        {/* Smooth GPU-Animated Glassmorphic Mobile Dropdown (< md) */}
        <div
          id="mobile-nav-menu"
          aria-hidden={!isMobileMenuOpen}
          className="mx-auto mt-2 max-w-5xl md:hidden"
          style={{
            opacity: isMobileMenuOpen ? 1 : 0,
            visibility: isMobileMenuOpen ? 'visible' : 'hidden',
            pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
            transform: isMobileMenuOpen
              ? 'translate3d(0, 0, 0) scale(1)'
              : 'translate3d(0, -10px, 0) scale(0.97)',
            transformOrigin: 'top center',
            transition: isMobileMenuOpen
              ? 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), transform 360ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0ms linear 0ms'
              : 'opacity 240ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0ms linear 280ms',
          }}
        >
          <div className="glass-strong rounded-2xl p-2">
            {/* Vertical Indicator List: Glides between neighbors, cross-dissolves directly across non-adjacent items */}
            <div ref={mobileListRef} className="relative flex flex-col gap-1">
              {departingMobilePill && (
                <span
                  key={`depart-mobile-${departingMobilePill.key}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 left-0"
                  style={{
                    height: `${departingMobilePill.height}px`,
                    transform: `translate3d(0, ${departingMobilePill.top}px, 0)`,
                  }}
                >
                  <span
                    className="block h-full w-full rounded-xl"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      border: '1px solid var(--accent-border)',
                      boxShadow: 'inset 0 1px 0 0 var(--glass-specular)',
                      animation:
                        'pill-direct-exit 180ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
                    }}
                  />
                </span>
              )}

              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-0 left-0 will-change-[transform,height]"
                style={{
                  height: `${mobilePill.height}px`,
                  transform: `translate3d(0, ${mobilePill.top}px, 0)`,
                  opacity: mobilePill.ready ? 1 : 0,
                  transition:
                    mobilePill.mode === 'glide'
                      ? 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1), height 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease'
                      : 'opacity 180ms ease',
                }}
              >
                <span
                  key={mobilePill.directKey}
                  className="block h-full w-full rounded-xl"
                  style={{
                    backgroundColor: 'var(--accent-soft)',
                    border: '1px solid var(--accent-border)',
                    boxShadow: 'inset 0 1px 0 0 var(--glass-specular)',
                    animation:
                      mobilePill.mode === 'direct'
                        ? 'pill-direct-enter 220ms cubic-bezier(0.22, 1, 0.36, 1) both'
                        : 'none',
                  }}
                />
              </span>

              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    ref={(el) => {
                      mobileLinkRefs.current[link.id] = el;
                    }}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.id, link.href, true)}
                    aria-current={isActive ? 'location' : undefined}
                    className="relative z-10 flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200"
                    style={{
                      color: isActive
                        ? 'var(--accent)'
                        : 'var(--text-secondary)',
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="font-mono text-[11px] transition-colors duration-200"
                        style={{
                          color: isActive
                            ? 'var(--gold)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {link.code}
                      </span>
                      <span>{link.label}</span>
                    </span>

                    <span
                      className="h-1.5 w-1.5 rounded-full transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--gold-dot)',
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'scale(1)' : 'scale(0.4)',
                      }}
                    />
                  </a>
                );
              })}
            </div>

            <div
              className="mt-2 border-t pt-2.5"
              style={{ borderColor: 'var(--glass-border-outer)' }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onDownloadResume();
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-transform active:scale-[0.99]"
                style={{
                  backgroundColor: 'var(--solid-bg)',
                  color: 'var(--solid-fg)',
                }}
              >
                <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={1.85} />
                <span>Download Profile / CV</span>
              </button>

              <div
                className="mt-2.5 flex items-center justify-between px-2 pb-0.5 font-mono text-[10px]"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>{profile.company}</span>
                <span>{profile.shortLocation}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
