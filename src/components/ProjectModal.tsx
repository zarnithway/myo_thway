import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MapPin,
  Share2,
  Shield,
  Wrench,
  X,
} from 'lucide-react';
import { useScrollableBar } from '../hooks/useScrollableBar';
import type { CivilProject, ProjectGalleryItem } from '../types/portfolio';

interface ProjectModalProps {
  project: CivilProject | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  // Keying by project.id resets active photo & lightbox cleanly without effect-driven state resets
  return (
    <ProjectModalSheet key={project.id} project={project} onClose={onClose} />
  );
}

interface ProjectModalSheetProps {
  project: CivilProject;
  onClose: () => void;
}

function ProjectModalSheet({ project, onClose }: ProjectModalSheetProps) {
  const galleryItems = useMemo<ProjectGalleryItem[]>(() => {
    if (project.gallery && project.gallery.length > 0) {
      return project.gallery
        .map((item) => (typeof item === 'string' ? { src: item } : item))
        .filter((item) => Boolean(item.src));
    }
    if (project.image) {
      return [{ src: project.image, caption: 'Primary Architectural Elevation' }];
    }
    return [];
  }, [project]);

  const totalImages = galleryItems.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const handleShareLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/?project=${encodeURIComponent(project.code)}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Fallback if clipboard API blocked
    }
  };

  const thumbRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const touchStartXRef = useRef<number | null>(null);

  const {
    wrapperRef: thumbWrapperRef,
    scrollRef: thumbStripRef,
    hasOverflow: thumbHasOverflow,
    canScrollLeft: thumbCanScrollLeft,
    canScrollRight: thumbCanScrollRight,
    scrollByStep: scrollThumbStrip,
    maskStyle: thumbMaskStyle,
  } = useScrollableBar({ extraWidthPx: 20 });

  const safeIndex = Math.max(0, Math.min(activeIndex, totalImages - 1));
  const currentMedia = galleryItems[safeIndex];

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  // Keep active thumbnail smoothly centered inside the filmstrip when stepping through 5+ photos
  useEffect(() => {
    const strip = thumbStripRef.current;
    const activeThumb = thumbRefs.current[safeIndex];
    if (!strip || !activeThumb) return;
    if (strip.scrollWidth > strip.clientWidth) {
      const targetLeft =
        activeThumb.offsetLeft -
        strip.clientWidth / 2 +
        activeThumb.offsetWidth / 2;
      strip.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth',
      });
    }
  }, [safeIndex, thumbStripRef]);

  // Keyboard navigation: Left/Right arrows step photos; Escape closes Lightbox first, then Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft' && totalImages > 1) {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight' && totalImages > 1) {
        e.preventDefault();
        goNext();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goNext, goPrev, isLightboxOpen, onClose, totalImages]);

  const handleTouchStart = (clientX: number) => {
    touchStartXRef.current = clientX;
  };

  const handleTouchEnd = (clientX: number) => {
    if (touchStartXRef.current === null || totalImages <= 1) return;
    const deltaX = clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) > 42) {
      if (deltaX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-project-title"
        className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      >
        {/* Frosted Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-md transition-opacity"
        />

        {/* Glass Case Study Sheet — Bottom sheet on phones, centered modal on sm+ */}
        <div className="glass-strong relative z-10 max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl sm:max-h-[90vh] sm:rounded-3xl">
          {/* Top Sticky Header */}
          <div
            className="glass-strong sticky top-0 z-20 flex items-center justify-between gap-2 border-b px-4 py-3.5 sm:px-6 sm:py-4"
            style={{ borderColor: 'var(--glass-border-outer)' }}
          >
            <div className="flex min-w-0 items-center gap-2 font-mono text-xs">
              <span
                className="shrink-0 font-medium"
                style={{ color: 'var(--gold)' }}
              >
                {project.code}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span
                className="truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                {project.category}
              </span>
              {totalImages > 1 && (
                <>
                  <span
                    className="hidden sm:inline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    •
                  </span>
                  <span
                    className="hidden shrink-0 sm:inline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {totalImages} Views
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleShareLink}
                aria-label={copiedLink ? 'Project link copied' : 'Share project link'}
                title={copiedLink ? 'Link copied to clipboard!' : 'Copy direct project link'}
                className="tech-chip inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-mono transition-opacity hover:opacity-85 sm:h-8"
                style={{
                  color: copiedLink ? '#10b981' : 'var(--text-primary)',
                }}
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="font-sans font-semibold text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                className="tech-chip flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-80 sm:h-8 sm:w-8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Primary Multi-Image Architectural Stage */}
          {currentMedia && (
            <div
              onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
              onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
              className="arch-photo-frame relative aspect-[16/10] w-full select-none overflow-hidden border-b sm:aspect-[16/9]"
              style={{ borderColor: 'var(--glass-border-outer)' }}
            >
              <img
                key={currentMedia.src}
                src={currentMedia.src}
                alt={
                  currentMedia.caption
                    ? `${project.title} — ${currentMedia.caption}`
                    : project.title
                }
                onClick={() => setIsLightboxOpen(true)}
                className="arch-photo-grade h-full w-full cursor-zoom-in object-cover"
              />
              <div className="arch-photo-tint" />

              {/* Top-Left Frame Counter & View Label */}
              <div className="glass-strong pointer-events-none absolute top-3 left-3 z-10 flex max-w-[calc(100%-5.5rem)] items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] sm:top-3.5 sm:left-4">
                <span className="shrink-0">
                  <span className="font-semibold" style={{ color: 'var(--gold)' }}>
                    {String(safeIndex + 1).padStart(2, '0')}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    /{String(totalImages).padStart(2, '0')}
                  </span>
                </span>
                {currentMedia.caption && (
                  <>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span
                      className="truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {currentMedia.caption}
                    </span>
                  </>
                )}
              </div>

              {/* Top-Right Fullscreen Lightbox Trigger */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                aria-label="Inspect full-screen image"
                title="Inspect full screen"
                className="glass-strong absolute top-3 right-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 sm:top-3.5 sm:right-4"
                style={{ color: 'var(--text-primary)' }}
              >
                <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.85} />
              </button>

              {/* Left & Right Stage Navigation Controls */}
              {totalImages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous project photo"
                    className="glass-strong absolute top-1/2 left-2.5 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 sm:left-3.5 sm:h-10 sm:w-10"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next project photo"
                    className="glass-strong absolute top-1/2 right-2.5 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 sm:right-3.5 sm:h-10 sm:w-10"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Scrollable Thumbnail Filmstrip (Scales cleanly to 5, 8, or 15+ photos with zero overflow) */}
          {totalImages > 1 && (
            <div
              ref={thumbWrapperRef}
              className="border-b px-4 py-3 sm:px-6"
              style={{
                borderColor: 'var(--glass-border-outer)',
                backgroundColor: 'var(--glass-bg)',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  ref={thumbStripRef}
                  style={thumbMaskStyle}
                  role="tablist"
                  aria-label="Project gallery thumbnails"
                  className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5"
                >
                  {galleryItems.map((item, idx) => {
                    const isSelected = idx === safeIndex;
                    return (
                      <button
                        key={`${item.src}-${idx}`}
                        ref={(el) => {
                          thumbRefs.current[idx] = el;
                        }}
                        role="tab"
                        aria-selected={isSelected}
                        aria-label={
                          item.caption
                            ? `Photo ${idx + 1}: ${item.caption}`
                            : `Photo ${idx + 1}`
                        }
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className="relative h-13 w-21 shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all duration-200 sm:h-14 sm:w-23"
                        style={{
                          border: isSelected
                            ? '2px solid var(--gold-dot)'
                            : '1px solid var(--glass-border-outer)',
                          opacity: isSelected ? 1 : 0.58,
                          transform: isSelected ? 'scale(1)' : 'scale(0.97)',
                        }}
                      >
                        <img
                          src={item.src}
                          alt=""
                          loading="lazy"
                          className="arch-photo-grade h-full w-full object-cover"
                        />
                        <span
                          className="absolute bottom-1 left-1 rounded px-1 py-0.5 font-mono text-[9px] leading-none font-medium"
                          style={{
                            backgroundColor: isSelected
                              ? 'var(--solid-bg)'
                              : 'rgba(8, 17, 33, 0.68)',
                            color: isSelected ? 'var(--solid-fg)' : '#f8fafc',
                          }}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right-Side Filmstrip Scroll Controls when 5+ Thumbnails Exceed Row Width */}
                {thumbHasOverflow && (
                  <div
                    className="flex shrink-0 items-center gap-1 border-l pl-2"
                    style={{ borderColor: 'var(--glass-border-outer)' }}
                  >
                    <button
                      type="button"
                      onClick={() => scrollThumbStrip(-1)}
                      disabled={!thumbCanScrollLeft}
                      aria-label="Scroll thumbnails left"
                      className="tech-chip flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollThumbStrip(1)}
                      disabled={!thumbCanScrollRight}
                      aria-label="Scroll thumbnails right"
                      className="tech-chip flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detailed Engineering Case Study Content */}
          <div className="p-5 pb-8 sm:p-8">
            <div
              className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] sm:text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {project.location}
              </span>
              <span>•</span>
              <span>Completed {project.year}</span>
              <span>•</span>
              <span>Area: {project.budget}</span>
              <span>•</span>
              <span className="font-medium" style={{ color: 'var(--gold)' }}>
                {project.role}
              </span>
            </div>

            <h3
              id="modal-project-title"
              className="mt-3 text-xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: 'var(--text-primary)' }}
            >
              {project.title}
            </h3>

            <p
              className="mt-2.5 text-sm leading-relaxed sm:mt-3 sm:text-base"
              style={{ color: 'var(--text-secondary)' }}
            >
              {project.summary}
            </p>

            {/* 4-Column Spec Banner */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-4 sm:gap-3">
              {project.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="tech-chip rounded-xl p-3 sm:p-3.5"
                >
                  <p
                    className="font-mono text-[10px] uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {spec.label}
                  </p>
                  <p
                    className="mt-1 font-mono text-xs font-medium sm:text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Challenge & Engineering Solution */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6">
              <div>
                <h4
                  className="font-mono text-xs tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Site & Structural Challenge
                </h4>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {project.challenge}
                </p>
              </div>

              <div>
                <h4
                  className="font-mono text-xs tracking-wider uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Engineered Solution
                </h4>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {project.solution}
                </p>
              </div>
            </div>

            {/* Quantitative Outcomes */}
            <div className="mt-6 sm:mt-8">
              <h4
                className="font-mono text-xs tracking-wider uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                Verified Engineering Outcomes
              </h4>
              <ul className="mt-3 space-y-2.5">
                {project.outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: 'var(--gold)' }}
                    />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Design Codes & Software Tags */}
            <div
              className="mt-6 grid grid-cols-1 gap-4 border-t pt-5 sm:mt-8 sm:grid-cols-2 sm:pt-6"
              style={{ borderColor: 'var(--glass-border-outer)' }}
            >
              <div>
                <p
                  className="flex items-center gap-1.5 font-mono text-[11px] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Shield
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: 'var(--gold)' }}
                  />
                  Governing Codes & Standards
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.standards.map((std) => (
                    <span
                      key={std}
                      className="tech-chip rounded-md px-2.5 py-1 font-mono text-xs"
                    >
                      {std}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p
                  className="flex items-center gap-1.5 font-mono text-[11px] uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Wrench
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: 'var(--gold)' }}
                  />
                  Analysis & BIM Software
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.software.map((sw) => (
                    <span
                      key={sw}
                      className="tech-chip rounded-md px-2.5 py-1 font-mono text-xs"
                    >
                      {sw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Architectural Lightbox Inspector */}
      {isLightboxOpen && currentMedia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} full-screen gallery`}
          onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
          className="fixed inset-0 z-60 flex flex-col items-center justify-between bg-slate-950/92 p-4 backdrop-blur-xl select-none sm:p-6"
        >
          {/* Lightbox Top Bar */}
          <div className="flex w-full max-w-5xl items-center justify-between gap-3">
            <div className="min-w-0 font-mono text-xs text-slate-200">
              <span className="font-semibold text-amber-400">
                {String(safeIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-slate-400">
                /{String(totalImages).padStart(2, '0')}
              </span>
              {currentMedia.caption && (
                <span className="ml-2.5 truncate text-slate-300">
                  — {currentMedia.caption}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Exit full-screen view"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Lightbox Main Image */}
          <div
            onClick={() => setIsLightboxOpen(false)}
            className="relative flex min-h-0 flex-1 w-full max-w-5xl items-center justify-center py-3"
          >
            <img
              src={currentMedia.src}
              alt={currentMedia.caption ?? project.title}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
            />

            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Previous photo"
                  className="absolute top-1/2 left-1 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-slate-900/75 text-white backdrop-blur-md transition-transform hover:scale-105 sm:left-2 sm:h-11 sm:w-11"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  aria-label="Next photo"
                  className="absolute top-1/2 right-1 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-slate-900/75 text-white backdrop-blur-md transition-transform hover:scale-105 sm:right-2 sm:h-11 sm:w-11"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Compact Dot / Index Strip */}
          {totalImages > 1 && (
            <div className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              {galleryItems.map((item, idx) => {
                const isSelected = idx === safeIndex;
                return (
                  <button
                    key={`lb-${item.src}-${idx}`}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Jump to photo ${idx + 1}`}
                    className="cursor-pointer rounded-full px-2 py-0.5 font-mono text-[11px] transition-colors"
                    style={
                      isSelected
                        ? {
                            backgroundColor: '#f5b316',
                            color: '#081121',
                            fontWeight: 600,
                          }
                        : {
                            color: '#cbd5e1',
                          }
                    }
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
