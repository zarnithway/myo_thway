# SEO, Direct Sharing, Project Draft Status & WebP Media Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Equip the civil engineering portfolio with Open Graph, Twitter Cards, Schema.org JSON-LD local SEO, `robots.txt`, and `sitemap.xml`; direct shareable URL query linking (`/?project=UMT-01`); project draft vs. published filtering; and automatic in-browser WebP image compression before Supabase Storage uploads.

**Architecture:** Pure client-side enhancement without serverless edge dependencies: HTML metadata and structured data in `index.html`; static crawler directives in `public/`; URL query param synchronization with React modal state in `App.tsx` via `history.replaceState`; project publish status filtering in `ProjectsSection.tsx` and editing in `ProjectsEditor.tsx`; and an HTML5 Canvas WebP compression pipeline in `cmsService.ts`.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Supabase Storage (`@supabase/supabase-js`), Node v24 test runner (`node:test`).

**Spec:** `docs/superpowers/specs/2026-11-04-seo-sharing-admin-workflow-design.md`

## Global Constraints

- Never expose, mention, or index `ADMIN_SECRET_SLUG` or secret admin routes in public files (`robots.txt`, `sitemap.xml`, `index.html`).
- Legacy project records lacking `status` must always default safely to `'published'` so existing projects never vanish.
- If canvas WebP compression fails or is unsupported in an environment, fall back gracefully to uploading the original file rather than throwing an unhandled exception.
- All code changes must pass `npm run lint` (`oxlint`) and `npm run build` (`tsc -b && vite build`) with 0 errors and 0 warnings.

## Review Focus

- Sharing URL with lowercase code (e.g. `/?project=umt-01`): case-insensitive matching must correctly locate `UMT-01`.
- Project with `status: 'draft'` requested via public direct URL: must not be opened for unauthenticated public visitors; only published projects can be deep-linked publicly.
- Non-image files (e.g. PDF documents) or SVGs uploaded to `uploadMediaFile`: must bypass canvas rasterization and preserve original MIME and format.
- `robots.txt` disallow list: must disallow `/admin` and `/admin/` while keeping general portfolio pages indexable.
- URL query synchronization: closing the project modal must cleanly remove `?project=...` without forcing a browser refresh or dirtying browser forward history.

---

### Task 1: SEO, Social Media Cards & Crawler Directives

**Files:**
- Modify: `index.html`
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`
- Test: `tests/seo-metadata.test.mjs`

**Interfaces:**
- Produces: Open Graph, Twitter Card tags, and Schema.org JSON-LD in `index.html`; valid crawler directives in `public/robots.txt` and `public/sitemap.xml`.

- [ ] **Step 1: Write the failing test**

Create `tests/seo-metadata.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('index.html contains Open Graph, Twitter Cards, and Schema.org JSON-LD', () => {
  const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert.match(html, /<meta property="og:title"/i);
  assert.match(html, /<meta property="og:description"/i);
  assert.match(html, /<meta property="og:image"/i);
  assert.match(html, /<meta property="og:url"/i);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/i);
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /UMT Construction Group/i);
  assert.match(html, /Mandalay/i);
});

test('public/robots.txt and public/sitemap.xml exist and follow crawler rules', () => {
  const robots = fs.readFileSync(path.resolve('public/robots.txt'), 'utf8');
  assert.match(robots, /User-agent:\s*\*/i);
  assert.match(robots, /Disallow:\s*\/admin/i);
  assert.match(robots, /Sitemap:\s*https:\/\/myothway\.netlify\.app\/sitemap\.xml/i);
  assert.doesNotMatch(robots, /umt-portal/i, 'Must not leak secret admin slug');

  const sitemap = fs.readFileSync(path.resolve('public/sitemap.xml'), 'utf8');
  assert.match(sitemap, /<loc>https:\/\/myothway\.netlify\.app\/<\/loc>/i);
  assert.doesNotMatch(sitemap, /admin/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/seo-metadata.test.mjs`
Expected: FAIL (files missing or missing tags)

- [ ] **Step 3: Implement metadata and crawler files**

1. In `index.html`: Add Open Graph (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:image`, `og:url`), Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`), theme color `#081121`, and Schema.org `LocalBusiness` / `ProfessionalService` JSON-LD block specified in design document.
2. Create `public/robots.txt`:
```text
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Sitemap: https://myothway.netlify.app/sitemap.xml
```
3. Create `public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://myothway.netlify.app/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/seo-metadata.test.mjs`
Expected: PASS

- [ ] **Step 5: Run linter and build check**

Run: `npm run lint; npm run build`
Expected: 0 errors and 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add index.html public/robots.txt public/sitemap.xml tests/seo-metadata.test.mjs
git commit -m "feat(seo): add Open Graph, Twitter cards, Schema.org JSON-LD, and crawler directives"
```

---

### Task 2: Automated In-Browser WebP Image Compression

**Files:**
- Modify: `src/lib/cmsService.ts`
- Test: `tests/image-compression.test.mjs`

**Interfaces:**
- Produces:
  ```ts
  export async function compressImageToWebpFile(
    file: File,
    maxDimension?: number,
    quality?: number
  ): Promise<File>
  ```
- Consumes: Used inside `uploadMediaFile(file, folder)` before Supabase Storage upload or local preview data URL generation.

- [ ] **Step 1: Write the failing test**

Create `tests/image-compression.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('cmsService exports compressImageToWebpFile and connects it to uploadMediaFile', () => {
  const code = fs.readFileSync(path.resolve('src/lib/cmsService.ts'), 'utf8');
  assert.match(code, /export async function compressImageToWebpFile/i);
  assert.match(code, /image\/webp/i);
  assert.match(code, /maxDimension\s*=\s*1920/i);
  assert.match(code, /compressImageToWebpFile\(file\)/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/image-compression.test.mjs`
Expected: FAIL (`compressImageToWebpFile` not found in `cmsService.ts`)

- [ ] **Step 3: Implement `compressImageToWebpFile` in `src/lib/cmsService.ts`**

1. Implement `compressImageToWebpFile(file: File, maxDimension = 1920, quality = 0.84): Promise<File>`:
   - Check if `!file.type.startsWith('image/') || file.type === 'image/svg+xml'`. If true, return `file` immediately.
   - Guard for browser environment: `if (typeof window === 'undefined' || typeof document === 'undefined') return file;`
   - Use `Image` and `HTMLCanvasElement` to scale to `maxDimension` preserving aspect ratio.
   - Export via `canvas.toBlob((blob) => ..., 'image/webp', quality)`.
   - Reconstruct a `new File([blob], webpFilename, { type: 'image/webp', lastModified: Date.now() })`.
   - Wrap in `try/catch` and return original `file` on any decoding or canvas error.
2. In `uploadMediaFile(file: File, folder)`:
   - Call `const fileToUpload = await compressImageToWebpFile(file);`
   - Pass `fileToUpload` to `supabase.storage.from(SUPABASE_MEDIA_BUCKET).upload(path, fileToUpload)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/image-compression.test.mjs`
Expected: PASS

- [ ] **Step 5: Run linter and build check**

Run: `npm run lint; npm run build`
Expected: 0 errors and 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add src/lib/cmsService.ts tests/image-compression.test.mjs
git commit -m "feat(media): auto-compress uploaded images to WebP before Supabase storage"
```

---

### Task 3: Project Publishing Status (Draft vs. Published)

**Files:**
- Modify: `src/types/portfolio.ts`
- Modify: `src/components/ProjectsSection.tsx`
- Modify: `src/components/admin/ProjectsEditor.tsx`
- Test: `tests/project-status.test.mjs`

**Interfaces:**
- Produces: `ProjectPublishStatus = 'published' | 'draft'` and `status?: ProjectPublishStatus` on `CivilProject`.
- Consumes: Public site filters out `p.status === 'draft'`. Admin studio permits toggling status and defaults new projects to `draft`.

- [ ] **Step 1: Write the failing test**

Create `tests/project-status.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('CivilProject includes optional status property with ProjectPublishStatus type', () => {
  const types = fs.readFileSync(path.resolve('src/types/portfolio.ts'), 'utf8');
  assert.match(types, /export type ProjectPublishStatus\s*=\s*'published'\s*\|\s*'draft'/i);
  assert.match(types, /status\?:\s*ProjectPublishStatus/i);
});

test('ProjectsSection filters out drafts on public portfolio view', () => {
  const section = fs.readFileSync(path.resolve('src/components/ProjectsSection.tsx'), 'utf8');
  assert.match(section, /status\s*!==\s*'draft'/i);
});

test('ProjectsEditor provides draft toggle and defaults new projects to draft', () => {
  const editor = fs.readFileSync(path.resolve('src/components/admin/ProjectsEditor.tsx'), 'utf8');
  assert.match(editor, /status:\s*'draft'/i);
  assert.match(editor, /updateProject\(\s*{\s*status:/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/project-status.test.mjs`
Expected: FAIL

- [ ] **Step 3: Implement project status in types and components**

1. In `src/types/portfolio.ts`:
   - Export `type ProjectPublishStatus = 'published' | 'draft';`
   - Add `status?: ProjectPublishStatus;` to `CivilProject`.
2. In `src/components/ProjectsSection.tsx`:
   - Filter `const publicProjects = useMemo(() => projects.filter((p) => p.status !== 'draft'), [projects]);`
   - Replace direct references to `projects` in category extraction, filtering, and pagination with `publicProjects`.
3. In `src/components/admin/ProjectsEditor.tsx`:
   - In `handleAddProject`, set `status: 'draft'`.
   - In project sidebar item: render a small amber badge `[DRAFT]` if `p.status === 'draft'`.
   - In project detail header (next to project code): add an interactive toggle button between `Published` (emerald) and `Draft` (amber), with tooltip explaining that drafts are hidden on the public site.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/project-status.test.mjs`
Expected: PASS

- [ ] **Step 5: Run linter and build check**

Run: `npm run lint; npm run build`
Expected: 0 errors and 0 warnings.

- [ ] **Step 6: Commit**

```bash
git add src/types/portfolio.ts src/components/ProjectsSection.tsx src/components/admin/ProjectsEditor.tsx tests/project-status.test.mjs
git commit -m "feat(projects): add draft vs published workflow and public filtering"
```

---

### Task 4: Direct Deep Linking & Project Share Action

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/ProjectModal.tsx`
- Test: `tests/deep-linking.test.mjs`

**Interfaces:**
- Produces: URL parameter parsing (`?project=CODE`), URL sync via `window.history.replaceState`, and a "Share Link" button with clipboard write and toast feedback in `ProjectModal`.

- [ ] **Step 1: Write the failing test**

Create `tests/deep-linking.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('App.tsx parses ?project query parameter and syncs modal state with browser URL', () => {
  const app = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
  assert.match(app, /URLSearchParams/i);
  assert.match(app, /history\.replaceState/i);
  assert.match(app, /project/i);
});

test('ProjectModal includes Share Link button with clipboard copy', () => {
  const modal = fs.readFileSync(path.resolve('src/components/ProjectModal.tsx'), 'utf8');
  assert.match(modal, /navigator\.clipboard\.writeText/i);
  assert.match(modal, /Share/i);
  assert.match(modal, /copied/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/deep-linking.test.mjs`
Expected: FAIL

- [ ] **Step 3: Implement deep linking and share action**

1. In `src/App.tsx`:
   - When portfolio data is loaded or changes, check `new URLSearchParams(window.location.search).get('project')`.
   - If present, match case-insensitively against `p.code` or `p.id` among viewable projects (only published for public visitors; all for admin mode).
   - When `selectedProject` changes:
     - If non-null: `const url = new URL(window.location.href); url.searchParams.set('project', selectedProject.code); window.history.replaceState({}, '', url.toString());`
     - If null: `const url = new URL(window.location.href); url.searchParams.delete('project'); window.history.replaceState({}, '', url.toString());`
2. In `src/components/ProjectModal.tsx`:
   - Add state `const [copiedLink, setCopiedLink] = useState(false);`
   - In sticky header next to Close button, add a "Share Link" button:
     - On click: construct `const shareUrl = `${window.location.origin}/?project=${encodeURIComponent(project.code)}`;`
     - Write to `navigator.clipboard.writeText(shareUrl)`
     - Set `copiedLink = true` for 2.2s.
     - Accessible title & label: `"Copy shareable project link"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/deep-linking.test.mjs`
Expected: PASS

- [ ] **Step 5: Run complete test suite, linter, and build check**

Run: `node --test tests/*.test.mjs; npm run lint; npm run build`
Expected: All tests pass, 0 lint errors, clean Vite production build.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/ProjectModal.tsx tests/deep-linking.test.mjs
git commit -m "feat(share): direct project deep-linking and copy share link button"
```

---

## Plan Review Checklist

1. **Spec coverage**:
   - G1 (SEO & Crawler files) -> Task 1
   - G2 (Deep Linking & Share) -> Task 4
   - G3 (Draft vs. Published) -> Task 3
   - G4 (Automated WebP Compression) -> Task 2
2. **Review Focus addressed**:
   - Case-insensitive `?project=umt-01` -> Addressed in Task 4 Step 3
   - Draft project access on public link -> Addressed in Task 4 Step 3 (only published matched)
   - Non-image upload bypass -> Addressed in Task 2 Step 3
   - `robots.txt` secret slug protection -> Addressed in Task 1 Step 1 & 3
   - Query sync without reload -> Addressed in Task 4 Step 3
3. **All steps checkable**: Each task contains a failing test, implementation, passing test, lint/build check, and commit step.
