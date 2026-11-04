import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Images,
  MapPin,
} from 'lucide-react';
import { useScrollableBar } from '../hooks/useScrollableBar';
import type { CivilProject, ProjectCategory } from '../types/portfolio';
import { GlassCard } from './ui/GlassCard';

interface ProjectsSectionProps {
  projects: CivilProject[];
  onSelectProject: (project: CivilProject) => void;
}

const ITEMS_PER_PAGE = 4;

const categories: ProjectCategory[] = [
  'All',
  'Modern Villas',
  'Multi-Story RC',
  'Turnkey Homes',
  'Structural & BIM',
];

interface PillRect {
  left: number;
  top: number;
  width: number;
  height: number;
  ready: boolean;
}

export function ProjectsSection({
  projects,
  onSelectProject,
}: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPill, setFilterPill] = useState<PillRect>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  const {
    wrapperRef: filterWrapperRef,
    scrollRef: tablistRef,
    hasOverflow: filterHasOverflow,
    canScrollLeft: filterCanScrollLeft,
    canScrollRight: filterCanScrollRight,
    scrollByStep: scrollFilterBar,
    maskStyle: filterMaskStyle,
  } = useScrollableBar({ extraWidthPx: 14 });

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const updateFilterPill = useCallback(() => {
    const el = tabRefs.current[activeCategory];
    if (el) {
      setFilterPill({
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
        ready: true,
      });

      // Keep active tab centered inside horizontal strip when scrollable
      const container = tablistRef.current;
      if (container && container.scrollWidth > container.clientWidth) {
        const targetScroll =
          el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2;
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      }
    }
  }, [activeCategory, tablistRef]);

  useLayoutEffect(() => {
    updateFilterPill();
  }, [updateFilterPill]);

  useEffect(() => {
    const container = tablistRef.current;
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateFilterPill())
        : null;

    if (container && ro) {
      ro.observe(container);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => updateFilterPill());
    }

    window.addEventListener('resize', updateFilterPill);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateFilterPill);
    };
  }, [tablistRef, updateFilterPill]);

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSelectCategory = (category: ProjectCategory) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, nextPage));
    if (clamped === safePage) return;
    setCurrentPage(clamped);
  };

  const rangeStart = filteredProjects.length === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredProjects.length
  );

  return (
    <section
      id="projects"
      className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
    >
      {/* Section Header + Gliding Filter Bar with Right-Side Arrow Controls */}
      <div
        className="flex flex-col gap-5 border-b pb-6 sm:pb-8"
        style={{ borderColor: 'var(--glass-border-outer)' }}
      >
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p
              className="font-mono text-xs font-medium tracking-widest uppercase"
              style={{ color: 'var(--gold)' }}
            >
              01 // UMT Construction Group Portfolio
            </p>
            <h2
              className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: 'var(--text-primary)' }}
            >
              Selected Residential & Structural Works
            </h2>
          </div>

          <span
            className="font-mono text-[11px] sm:text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Showing {rangeStart}–{rangeEnd} of {filteredProjects.length} works •{' '}
            Sheet {String(safePage).padStart(2, '0')}/
            {String(totalPages).padStart(2, '0')}
          </span>
        </div>

        {/* Category Filter Bar: Single-row pill with right-side < / > arrows whenever needed */}
        <div ref={filterWrapperRef} className="w-full">
          <div className="glass-panel flex w-fit max-w-full items-center gap-1.5 rounded-full p-1.5">
            <div
              ref={tablistRef}
              role="tablist"
              aria-label="Filter projects by category"
              style={filterMaskStyle}
              className="no-scrollbar relative flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-x-auto rounded-full"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 rounded-full shadow-xs"
                style={{
                  width: `${filterPill.width}px`,
                  height: `${filterPill.height}px`,
                  transform: `translate3d(${filterPill.left}px, ${filterPill.top}px, 0)`,
                  opacity: filterPill.ready ? 1 : 0,
                  backgroundColor: 'var(--solid-bg)',
                  transition:
                    'transform 360ms cubic-bezier(0.22, 1, 0.36, 1), width 360ms cubic-bezier(0.22, 1, 0.36, 1), height 360ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease',
                }}
              />

              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    ref={(el) => {
                      tabRefs.current[category] = el;
                    }}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className="relative z-10 shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 font-mono text-xs font-medium whitespace-nowrap transition-colors duration-250"
                    style={{
                      color: isActive
                        ? 'var(--solid-fg)'
                        : 'var(--text-secondary)',
                      backgroundColor:
                        isActive && !filterPill.ready
                          ? 'var(--solid-bg)'
                          : 'transparent',
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {filterHasOverflow && (
              <div
                className="flex shrink-0 items-center gap-1 border-l pl-1.5"
                style={{ borderColor: 'var(--glass-border-outer)' }}
              >
                <button
                  type="button"
                  onClick={() => scrollFilterBar(-1)}
                  disabled={!filterCanScrollLeft}
                  aria-label="Previous categories"
                  className="tech-chip flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.9} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollFilterBar(1)}
                  disabled={!filterCanScrollRight}
                  aria-label="More categories"
                  className="tech-chip flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.9} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Project Grid (1 col mobile -> 2 col tablet/desktop) */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-6 md:grid-cols-2">
        {paginatedProjects.map((project) => (
          <GlassCard
            key={project.id}
            interactive
            onClick={() => onSelectProject(project)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectProject(project);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Open engineering case study for ${project.title}`}
            className="group flex cursor-pointer flex-col overflow-hidden"
          >
            {/* Color-Corrected Architectural Visual Frame */}
            <div
              className="arch-photo-frame aspect-[16/10] w-full overflow-hidden border-b"
              style={{ borderColor: 'var(--glass-border-outer)' }}
            >
              <img
                src={project.image}
                alt={project.title}
                loading="lazy"
                className="arch-photo-grade h-full w-full object-cover"
              />
              <div className="arch-photo-tint" />

              {/* Top Floating CAD Tag — Truncate-safe on 320px screens */}
              <div className="glass-strong absolute top-3 left-3 z-10 flex max-w-[calc(100%-3.5rem)] items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] sm:top-3.5 sm:left-3.5 sm:gap-2 sm:px-3 sm:text-[11px]">
                <span
                  className="shrink-0 font-medium"
                  style={{ color: 'var(--gold)' }}
                >
                  {project.code}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span
                  className="truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {project.category}
                </span>
              </div>

              <div className="glass-strong absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:top-3.5 sm:right-3.5">
                <ArrowUpRight
                  className="h-4 w-4"
                  strokeWidth={1.75}
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              {(project.gallery?.length ?? 0) > 1 && (
                <div
                  className="glass-strong absolute right-3 bottom-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] sm:right-3.5 sm:bottom-3.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Images
                    className="h-3 w-3 shrink-0"
                    strokeWidth={1.8}
                    style={{ color: 'var(--gold)' }}
                  />
                  <span>
                    {String(project.gallery?.length).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
              <div>
                <div
                  className="flex flex-wrap items-center justify-between gap-1 font-mono text-[11px] sm:text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {project.location}
                  </span>
                  <span>
                    {project.year} • {project.budget}
                  </span>
                </div>

                <h3
                  className="mt-2.5 text-lg font-semibold tracking-tight sm:text-xl"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {project.title}
                </h3>

                <p
                  className="mt-2 line-clamp-2 text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {project.summary}
                </p>
              </div>

              {/* Technical Spec Strip: 2x2 on phones & narrow tablet cards, 4 cols on lg+ */}
              <div
                className="mt-5 border-t pt-4 sm:mt-6"
                style={{ borderColor: 'var(--glass-border-outer)' }}
              >
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {project.specs.slice(0, 4).map((spec) => (
                    <div key={spec.label} className="min-w-0">
                      <p
                        className="truncate font-mono text-[10px] uppercase"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {spec.label}
                      </p>
                      <p
                        className="mt-0.5 truncate font-mono text-xs font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Minimalist Glassmorphic Pagination Bar */}
      <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 sm:mt-10 sm:flex-row">
        <p
          className="text-center font-mono text-[11px] sm:text-left sm:text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {activeCategory === 'All' ? (
            <>Drawing Set • {projects.length} Completed & Ongoing Residences</>
          ) : (
            <>
              Filtered by{' '}
              <span style={{ color: 'var(--text-primary)' }}>
                {activeCategory}
              </span>{' '}
              •{' '}
              <button
                type="button"
                onClick={() => handleSelectCategory('All')}
                className="cursor-pointer underline transition-opacity hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                Show all {projects.length} works
              </button>
            </>
          )}
        </p>

        {totalPages > 1 && (
          <nav
            aria-label="Project works pagination"
            className="glass-panel inline-flex max-w-full items-center gap-1 rounded-full p-1.5"
          >
            <button
              type="button"
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage <= 1}
              aria-label="Previous project page"
              className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-3 font-mono text-xs transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35 sm:h-8"
              style={{ color: 'var(--text-primary)' }}
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1 px-0.5 sm:px-1">
              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === safePage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    aria-current={isCurrent ? 'page' : undefined}
                    aria-label={`Page ${pageNum}`}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full font-mono text-xs font-medium transition-all duration-250 sm:h-8 sm:w-8"
                    style={
                      isCurrent
                        ? {
                            backgroundColor: 'var(--solid-bg)',
                            color: 'var(--solid-fg)',
                          }
                        : {
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                          }
                    }
                  >
                    {String(pageNum).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage >= totalPages}
              aria-label="Next project page"
              className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-3 font-mono text-xs transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35 sm:h-8"
              style={{ color: 'var(--text-primary)' }}
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
