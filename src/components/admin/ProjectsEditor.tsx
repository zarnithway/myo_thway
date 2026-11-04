import { useState, type ChangeEvent } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  ImagePlus,
  Images,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { uploadMediaFile } from '../../lib/cmsService';
import type {
  CivilProject,
  PresetProjectCategory,
  ProjectGalleryItem,
} from '../../types/portfolio';
import { GlassCard } from '../ui/GlassCard';
import { DelimitedListField } from './DelimitedListField';

interface ProjectsEditorProps {
  projects: CivilProject[];
  onChangeProjects: (next: CivilProject[]) => void;
  onNotify: (message: string, tone?: 'success' | 'error') => void;
}

const PRESET_CATEGORIES: PresetProjectCategory[] = [
  'Modern Villas',
  'Multi-Story RC',
  'Turnkey Homes',
  'Structural & BIM',
];

function normalizeGalleryList(
  project: CivilProject
): ProjectGalleryItem[] {
  const raw = project.gallery && project.gallery.length > 0
    ? project.gallery
    : project.image
      ? [{ src: project.image, caption: `${project.title} — Exterior View` }]
      : [];

  return raw.map((entry) =>
    typeof entry === 'string'
      ? { src: entry, caption: '' }
      : { src: entry.src, caption: entry.caption ?? '' }
  );
}

function getNextProjectCode(projects: CivilProject[]): string {
  let maxNum = 0;
  for (const p of projects) {
    const match = p.code.match(/(\d+)/);
    if (match) {
      const parsed = Number.parseInt(match[1], 10);
      if (!Number.isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }
  const next = Math.max(projects.length + 1, maxNum + 1);
  return `UMT-${String(next).padStart(2, '0')}`;
}

export function ProjectsEditor({
  projects,
  onChangeProjects,
  onNotify,
}: ProjectsEditorProps) {
  const [selectedId, setSelectedId] = useState<string>(
    projects[0]?.id ?? ''
  );
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const selectedIndex = projects.findIndex((p) => p.id === selectedId);
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const activeProject: CivilProject | undefined = projects[activeIndex];

  const updateProject = (patch: Partial<CivilProject>) => {
    if (!activeProject) return;
    const next = projects.map((p, idx) =>
      idx === activeIndex ? { ...p, ...patch } : p
    );
    onChangeProjects(next);
  };

  const handleAddProject = () => {
    const nextCode = getNextProjectCode(projects);
    const newId = `umt-project-${Date.now()}`;
    const created: CivilProject = {
      id: newId,
      code: nextCode,
      title: '',
      category: '',
      location: '',
      year: '',
      role: '',
      budget: '',
      image: '',
      gallery: [],
      summary: '',
      challenge: '',
      solution: '',
      outcomes: [],
      standards: [],
      software: [],
      specs: [],
    };

    onChangeProjects([created, ...projects]);
    setSelectedId(newId);
    onNotify(`Created ${nextCode}. Fill in your project details.`);
  };

  const handleDuplicateProject = (idx: number) => {
    const source = projects[idx];
    if (!source) return;
    const copyId = `${source.id}-copy-${Date.now()}`;
    const clone: CivilProject = {
      ...JSON.parse(JSON.stringify(source)),
      id: copyId,
      code: `${source.code}-B`,
      title: `${source.title} (Copy)`,
    };
    const next = [...projects];
    next.splice(idx + 1, 0, clone);
    onChangeProjects(next);
    setSelectedId(copyId);
    onNotify(`Duplicated "${source.title}".`);
  };

  const handleDeleteProject = (idx: number) => {
    const target = projects[idx];
    if (!target) return;
    if (!window.confirm(`Delete project "${target.title}"?`)) return;
    const next = projects.filter((_, i) => i !== idx);
    onChangeProjects(next);
    if (next[0]) {
      setSelectedId(next[Math.min(idx, next.length - 1)].id);
    }
    onNotify(`Removed "${target.title}".`);
  };

  const moveProject = (idx: number, dir: -1 | 1) => {
    const dest = idx + dir;
    if (dest < 0 || dest >= projects.length) return;
    const next = [...projects];
    const [moved] = next.splice(idx, 1);
    next.splice(dest, 0, moved);
    onChangeProjects(next);
  };

  // Cover upload
  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeProject) return;

    setUploadingCover(true);
    try {
      const url = await uploadMediaFile(file, 'projects');
      const currentGallery = normalizeGalleryList(activeProject);
      const alreadyInGallery = currentGallery.some((g) => g.src === url);
      updateProject({
        image: url,
        gallery: alreadyInGallery
          ? currentGallery
          : [{ src: url, caption: '' }, ...currentGallery],
      });
      onNotify('Cover photo uploaded.');
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : 'Cover upload failed.',
        'error'
      );
    } finally {
      setUploadingCover(false);
    }
  };

  // Multi-photo gallery batch upload
  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0 || !activeProject) return;

    setUploadingGallery(true);
    try {
      const uploadedItems: ProjectGalleryItem[] = [];
      for (const file of files) {
        const url = await uploadMediaFile(file, 'projects');
        uploadedItems.push({
          src: url,
          caption: '',
        });
      }

      const existing = normalizeGalleryList(activeProject);
      const merged = [...existing, ...uploadedItems];
      updateProject({
        image: activeProject.image || merged[0]?.src || '',
        gallery: merged,
      });
      onNotify(`Added ${uploadedItems.length} photo(s) to project gallery.`);
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : 'Gallery upload failed.',
        'error'
      );
    } finally {
      setUploadingGallery(false);
    }
  };

  const galleryItems = activeProject ? normalizeGalleryList(activeProject) : [];

  const updateGalleryCaption = (gIdx: number, caption: string) => {
    const next = galleryItems.map((item, i) =>
      i === gIdx ? { ...item, caption } : item
    );
    updateProject({ gallery: next });
  };

  const moveGalleryItem = (gIdx: number, dir: -1 | 1) => {
    const dest = gIdx + dir;
    if (dest < 0 || dest >= galleryItems.length) return;
    const next = [...galleryItems];
    const [moved] = next.splice(gIdx, 1);
    next.splice(dest, 0, moved);
    updateProject({ gallery: next });
  };

  const removeGalleryItem = (gIdx: number) => {
    const next = galleryItems.filter((_, i) => i !== gIdx);
    const removedSrc = galleryItems[gIdx]?.src;
    const nextCover =
      activeProject?.image === removedSrc
        ? (next[0]?.src ?? '')
        : (activeProject?.image ?? '');
    updateProject({ image: nextCover, gallery: next });
  };

  const promoteToCover = (src: string) => {
    updateProject({ image: src });
    onNotify('Updated primary card cover photo.');
  };

  const handleAddGalleryByUrl = () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed || !activeProject) return;
    const next = [...galleryItems, { src: trimmed, caption: '' }];
    updateProject({
      image: activeProject.image || trimmed,
      gallery: next,
    });
    setNewGalleryUrl('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Column: Project Selector & Ordering */}
      <div className="lg:col-span-4">
        <GlassCard className="p-4 sm:p-5 !transition-none">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[10px] uppercase" style={{ color: 'var(--gold)' }}>
                PORTFOLIO WORKS ({projects.length})
              </p>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Residential Projects
              </h2>
            </div>

            <button
              type="button"
              onClick={handleAddProject}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: 'var(--solid-bg)',
                color: 'var(--solid-fg)',
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {projects.map((proj, idx) => {
              const isSelected = idx === activeIndex;
              const photoCount = normalizeGalleryList(proj).length;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedId(proj.id)}
                  className="cursor-pointer rounded-xl border p-2.5 transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--accent-soft)'
                      : 'var(--chip-bg)',
                    borderColor: isSelected
                      ? 'var(--accent-border)'
                      : 'var(--glass-border-outer)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    {proj.image ? (
                      <img
                        src={proj.image}
                        alt={proj.title || proj.code}
                        className="h-12 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg border"
                        style={{
                          borderColor: 'var(--glass-border-outer)',
                          backgroundColor: 'var(--glass-bg)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Images className="h-4 w-4 opacity-50" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="font-mono text-[10px] font-semibold"
                          style={{ color: 'var(--gold)' }}
                        >
                          {proj.code}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 font-mono text-[10px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Images className="h-3 w-3" />
                          {photoCount}
                        </span>
                      </div>
                      <p
                        className="truncate text-xs font-semibold"
                        style={{
                          color: proj.title
                            ? 'var(--text-primary)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {proj.title || 'Untitled Project'}
                      </p>
                      <p
                        className="truncate font-mono text-[10px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {proj.category || 'No category yet'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-1 border-t pt-1.5" style={{ borderColor: 'var(--glass-border-outer)' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveProject(idx, -1);
                      }}
                      disabled={idx === 0}
                      title="Move up"
                      className="tech-chip flex h-6 w-6 cursor-pointer items-center justify-center rounded-md disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveProject(idx, 1);
                      }}
                      disabled={idx === projects.length - 1}
                      title="Move down"
                      className="tech-chip flex h-6 w-6 cursor-pointer items-center justify-center rounded-md disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateProject(idx);
                      }}
                      title="Duplicate project"
                      className="tech-chip flex h-6 w-6 cursor-pointer items-center justify-center rounded-md"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(idx);
                      }}
                      title="Delete project"
                      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Right Column: Active Project Full Editor */}
      <div className="lg:col-span-8">
        {activeProject ? (
          <div className="space-y-6">
            {/* Core Metadata */}
            <GlassCard className="p-5 sm:p-6 !transition-none">
              <div className="mb-4 border-b pb-3" style={{ borderColor: 'var(--glass-border-outer)' }}>
                <p className="font-mono text-[10px] uppercase" style={{ color: 'var(--gold)' }}>
                  EDITING {activeProject.code}
                </p>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {activeProject.title || activeProject.code}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Project Code
                  </label>
                  <input
                    type="text"
                    value={activeProject.code}
                    onChange={(e) => updateProject({ code: e.target.value })}
                    placeholder="UMT-09"
                    className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3 py-2 font-mono text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Completion Year
                  </label>
                  <input
                    type="text"
                    value={activeProject.year}
                    onChange={(e) => updateProject({ year: e.target.value })}
                    placeholder="2026"
                    className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3 py-2 font-mono text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={activeProject.title}
                    onChange={(e) => updateProject({ title: e.target.value })}
                    placeholder="Enter project title..."
                    className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm font-medium outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Category (Select Preset or Type Custom Category)
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {PRESET_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => updateProject({ category: cat })}
                        className="cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] transition-colors"
                        style={{
                          backgroundColor:
                            activeProject.category === cat
                              ? 'var(--solid-bg)'
                              : 'var(--chip-bg)',
                          color:
                            activeProject.category === cat
                              ? 'var(--solid-fg)'
                              : 'var(--text-secondary)',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={activeProject.category}
                    onChange={(e) => updateProject({ category: e.target.value })}
                    placeholder="Or enter a custom category name..."
                    className="tech-chip input-focus mt-2 w-full rounded-xl px-3.5 py-2 text-xs outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Township / Location
                  </label>
                  <input
                    type="text"
                    value={activeProject.location}
                    onChange={(e) => updateProject({ location: e.target.value })}
                    placeholder="e.g. Chanmyathazi, Mandalay"
                    className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Contract Scope / Scale
                  </label>
                  <input
                    type="text"
                    value={activeProject.budget}
                    onChange={(e) => updateProject({ budget: e.target.value })}
                    placeholder="e.g. 3.5-Story RC Residence • 6,400 sq.ft"
                    className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Engineering Role
                  </label>
                  <input
                    type="text"
                    value={activeProject.role}
                    onChange={(e) => updateProject({ role: e.target.value })}
                    placeholder="e.g. Lead Structural Engineer & Turnkey Director (R.S.E.)"
                    className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Cover & 5+ Multi-Image Gallery Manager */}
            <GlassCard className="p-5 sm:p-6 !transition-none">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--glass-border-outer)' }}>
                <div>
                  <p className="font-mono text-[10px] uppercase" style={{ color: 'var(--gold)' }}>
                    PHOTOGRAPHY & CASE STUDY GALLERY ({galleryItems.length} PHOTOS)
                  </p>
                  <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Cover Photo & Multi-Angle Gallery (Supports 5+ Photos)
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    className="tech-chip inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <ImagePlus className="h-3.5 w-3.5" />
                    <span>
                      {uploadingCover ? 'Uploading...' : 'Replace Cover'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingCover || uploadingGallery}
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>

                  <label
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--solid-bg)',
                      color: 'var(--solid-fg)',
                    }}
                  >
                    <Images className="h-3.5 w-3.5" />
                    <span>
                      {uploadingGallery ? 'Uploading...' : '+ Upload Gallery Photos'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingCover || uploadingGallery}
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Add by URL */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="Or paste an image URL (/images/... or https://...) and click Add"
                  className="tech-chip input-focus flex-1 rounded-xl px-3.5 py-2 font-mono text-xs outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={handleAddGalleryByUrl}
                  className="tech-chip cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold"
                  style={{ color: 'var(--accent)' }}
                >
                  Add URL
                </button>
              </div>

              {/* Gallery Grid */}
              {galleryItems.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed px-4 py-8 text-center font-mono text-xs"
                  style={{
                    borderColor: 'var(--glass-border-outer)',
                    color: 'var(--text-muted)',
                  }}
                >
                  No photos uploaded yet. Upload a cover photo or gallery photos above.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {galleryItems.map((item, gIdx) => {
                    const isCover = activeProject.image === item.src;
                    return (
                      <div
                        key={`${item.src}-${gIdx}`}
                        className="rounded-xl border p-3"
                        style={{
                          borderColor: isCover
                            ? 'var(--gold-border)'
                            : 'var(--glass-border-outer)',
                          backgroundColor: 'var(--chip-bg)',
                        }}
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-200">
                          <img
                            src={item.src}
                            alt={item.caption || `Slide ${gIdx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <span className="glass-strong absolute top-2 left-2 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold">
                            #{String(gIdx + 1).padStart(2, '0')}
                          </span>
                          {isCover && (
                            <span
                              className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold"
                              style={{
                                backgroundColor: 'var(--solid-bg)',
                                color: 'var(--solid-fg)',
                              }}
                            >
                              <Star className="h-2.5 w-2.5 fill-current" />
                              COVER
                            </span>
                          )}
                        </div>

                        <input
                          type="text"
                          value={item.caption ?? ''}
                          onChange={(e) =>
                            updateGalleryCaption(gIdx, e.target.value)
                          }
                          placeholder="Photo caption (exterior, living room, rebar QA...)"
                          className="tech-chip input-focus mt-2.5 w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          style={{ color: 'var(--text-primary)' }}
                        />

                        <div className="mt-2 flex items-center justify-between gap-2">
                          {!isCover ? (
                            <button
                              type="button"
                              onClick={() => promoteToCover(item.src)}
                              className="cursor-pointer font-mono text-[10px] font-medium underline"
                              style={{ color: 'var(--gold)' }}
                            >
                              Set as Cover
                            </button>
                          ) : (
                            <span
                              className="font-mono text-[10px]"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Primary card image
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveGalleryItem(gIdx, -1)}
                              disabled={gIdx === 0}
                              className="tech-chip flex h-6 w-6 cursor-pointer items-center justify-center rounded-md disabled:opacity-30"
                              title="Move earlier"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveGalleryItem(gIdx, 1)}
                              disabled={gIdx === galleryItems.length - 1}
                              className="tech-chip flex h-6 w-6 cursor-pointer items-center justify-center rounded-md disabled:opacity-30"
                              title="Move later"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeGalleryItem(gIdx)}
                              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-red-500 hover:bg-red-500/10"
                              title="Remove photo"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>

            {/* Engineering Case Study Copy & Technical Specs */}
            <GlassCard className="p-5 sm:p-6 !transition-none">
              <div className="mb-4 border-b pb-3" style={{ borderColor: 'var(--glass-border-outer)' }}>
                <p className="font-mono text-[10px] uppercase" style={{ color: 'var(--gold)' }}>
                  STRUCTURAL BRIEF & SPECIFICATIONS
                </p>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Case Study Narrative, Outcomes & Specs
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Card & Modal Summary
                  </label>
                  <textarea
                    rows={2}
                    value={activeProject.summary}
                    onChange={(e) => updateProject({ summary: e.target.value })}
                    placeholder="Brief overview of the residence and engineering scope..."
                    className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                      Site / Structural Challenge
                    </label>
                    <textarea
                      rows={3}
                      value={activeProject.challenge}
                      onChange={(e) =>
                        updateProject({ challenge: e.target.value })
                      }
                      placeholder="Describe site, geotechnical, or seismic design challenges..."
                      className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                      Engineering Solution
                    </label>
                    <textarea
                      rows={3}
                      value={activeProject.solution}
                      onChange={(e) =>
                        updateProject({ solution: e.target.value })
                      }
                      placeholder="Describe structural framing, foundation, and execution solution..."
                      className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                    Key Outcomes & QA Highlights (One per line)
                  </label>
                  <DelimitedListField
                    key={`outcomes-${activeProject.id}`}
                    items={activeProject.outcomes}
                    mode="newline"
                    rows={3}
                    placeholder="Enter one engineering outcome per line..."
                    onChange={(outcomes) => updateProject({ outcomes })}
                    className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                      Design Codes & Standards (Comma separated)
                    </label>
                    <DelimitedListField
                      key={`standards-${activeProject.id}`}
                      items={activeProject.standards}
                      mode="comma"
                      rows={1}
                      placeholder="MNBC 2020, ACI 318-19..."
                      onChange={(standards) => updateProject({ standards })}
                      className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 font-mono text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                      BIM & Analysis Software (Comma separated)
                    </label>
                    <DelimitedListField
                      key={`software-${activeProject.id}`}
                      items={activeProject.software}
                      mode="comma"
                      rows={1}
                      placeholder="ETABS, SAFE, AutoCAD..."
                      onChange={(software) => updateProject({ software })}
                      className="tech-chip input-focus mt-1.5 w-full rounded-xl px-3.5 py-2 font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Technical Specs Key/Value Rows */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="font-mono text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                      Technical Specifications ({activeProject.specs.length})
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateProject({
                          specs: [
                            ...activeProject.specs,
                            { label: '', value: '' },
                          ],
                        })
                      }
                      className="tech-chip inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px]"
                      style={{ color: 'var(--accent)' }}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Spec</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {activeProject.specs.map((spec, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={spec.label}
                          onChange={(e) => {
                            const next = activeProject.specs.map((sp, i) =>
                              i === sIdx ? { ...sp, label: e.target.value } : sp
                            );
                            updateProject({ specs: next });
                          }}
                          placeholder="Label (e.g. Foundation)"
                          className="tech-chip input-focus w-2/5 rounded-lg px-3 py-1.5 font-mono text-xs outline-none"
                          style={{ color: 'var(--text-primary)' }}
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => {
                            const next = activeProject.specs.map((sp, i) =>
                              i === sIdx ? { ...sp, value: e.target.value } : sp
                            );
                            updateProject({ specs: next });
                          }}
                          placeholder="Value (e.g. Isolated RC Footings + Tie Beams)"
                          className="tech-chip input-focus flex-1 rounded-lg px-3 py-1.5 text-xs outline-none"
                          style={{ color: 'var(--text-primary)' }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateProject({
                              specs: activeProject.specs.filter(
                                (_, i) => i !== sIdx
                              ),
                            })
                          }
                          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        ) : (
          <GlassCard className="p-8 text-center !transition-none">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No projects yet. Click <strong>+ New</strong> to create your first
              residential case study.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
