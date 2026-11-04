# Design Document: SEO, Direct Sharing & Admin Workflow Polish

- **Date**: 2026-11-04
- **Author**: Antigravity & User
- **Status**: Proposed
- **Topic**: Search Engine Optimization, Direct Project Sharing, Project Publishing Status, and WebP Media Optimization
- **Target Audience**: Civil Engineering Clients, Landowners in Mandalay, Myanmar, and UMT Construction Group Management

---

## 1. Intent & Context

The digital portfolio for Civil Engineer **Myo Thway, R.S.E.** (`B.E. (Civil)` YTU) and **UMT Construction Group** is deployed at `https://myothway.netlify.app`. 
While the architectural design, CMS studio, and Supabase database infrastructure are functional, four operational gaps remain:
1. **Search & Social Invisibility**: The site lacks Open Graph (`og:*`), Twitter Card tags, and Schema.org `LocalBusiness` / `ProfessionalService` structured data. Sharing the site on Viber, Facebook, or LinkedIn displays an unbranded snippet, and local search engines cannot parse the firm's physical location, engineering licensure, or turnkey services in Mandalay.
2. **Premature Exposure of Incomplete Works**: Clicking **+ New** creates a project shell (`UMT-09`), but until photos and copy are completed, any sync or preview would expose an empty card to prospective clients.
3. **Heavy Smartphone Photo Uploads**: Site photos captured on iPhones or modern Androids often range between 5 MB and 12 MB in size. Uploading uncompressed images directly to Supabase Storage exhausts bucket quotas and causes slow card rendering over mobile Myanmar cellular networks.
4. **Friction in Client Consultations**: In direct conversations over Viber, Telegram, or phone, an engineer cannot currently link directly to a specific project (e.g. *“Check out our Chanmyathazi villa project UMT-01 at this link”*).

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **G1 (Rich Social & Search Optimization)**: Add Open Graph, Twitter Cards, and Schema.org JSON-LD structured data for UMT Construction Group in Mandalay, plus valid `robots.txt` and `sitemap.xml`.
- **G2 (Direct Deep Linking & Share)**: Enable direct URL sharing via `/?project=<CODE>` (e.g., `/?project=UMT-01`), automatically open the matching project modal, sync the browser URL on modal open/close without full-page reloads, and add a “Copy Link” button in the modal and card.
- **G3 (Project Draft / Published Workflow)**: Add an optional `status: 'published' | 'draft'` property to projects. Newly created projects start as `draft`; public visitors only see `published` projects; admin users can toggle status anytime and see draft badges.
- **G4 (Automated Client-Side WebP Compression)**: Resize and convert uploaded photos (cover and gallery) to WebP (max dimension 1920px, ~84% quality) in the browser before transmission to Supabase Storage, reducing 8–10 MB uploads to ~200–350 KB.

### Non-Goals
- **NG1 (Server-Side Dynamic Crawler Pre-rendering)**: Approach B (Netlify Edge Functions parsing individual query parameters for social bot scrapers) is deferred. The global Open Graph card will represent the firm across all shared URLs.
- **NG2 (User Multi-Account Role Permissions)**: Role-based editorial permissions (e.g. Draft Reviewer vs Admin Approver) are unnecessary for this single-lead portfolio.

### Anti-Goals
- **AG1 (Breaking Legacy Project Data)**: Older projects in database or preview cache that lack a `status` field must never disappear or error; they must default safely to `'published'`.
- **AG2 (Exposing Secret Admin Route in Public SEO)**: `robots.txt` and `sitemap.xml` must never list or hint at `ADMIN_SECRET_SLUG`. `robots.txt` will disallow `/admin` and standard administrative endpoints only.
- **AG3 (Hard Upload Failure on Unsupported Browsers)**: If a browser or environment fails Canvas WebP export, the system must gracefully fall back to original file upload rather than failing.

---

## 3. Approaches Considered & Tradeoffs

### Approach A: Client-Centric Native Suite *(Selected)*
- **Architecture**: Pure client-side handling using React URL search params, standard HTML5 Canvas conversion, static metadata in `index.html`, and `robots.txt`/`sitemap.xml`.
- **Pros**: Zero additional external npm packages, identical behavior in local Vite dev and Netlify production, zero serverless cold-start latency, completely free of backend maintenance.
- **Cons**: Social scrapers that do not execute client-side JavaScript (e.g., Facebook crawler) read the site-level Open Graph card rather than individual modal photos.

### Approach B: Serverless Edge Dynamic Previews (Netlify Edge Functions) *(Rejected)*
- **Architecture**: A Deno/TypeScript Edge Function intercepts `/project/:code`, reads project data, and generates a dynamic HTML `<head>` for bots.
- **Pros**: Individual project photos appear in Facebook/Viber chat previews.
- **Cons**: Increased configuration complexity, cannot test in simple `vite dev` without `netlify dev` and Netlify CLI tooling, edge cold starts. Rejected by user in favor of Approach A.

---

## 4. Detailed Specification

### 4.1 Data Model
In `src/types/portfolio.ts`:
```ts
export type ProjectPublishStatus = 'published' | 'draft';

export interface CivilProject {
  id: string;
  code: string;
  title: string;
  category: string;
  status?: ProjectPublishStatus; // Defaults to 'published' if undefined
  // ... other existing fields
}
```

### 4.2 Public Filtering & Admin Management
- **Public Site (`ProjectsSection.tsx`)**:
  - Filter projects: `const publicProjects = useMemo(() => projects.filter((p) => p.status !== 'draft'), [projects]);`
  - All category counts, sheet pagination, and filter pills calculate based on `publicProjects`.
- **Admin Studio (`ProjectsEditor.tsx`)**:
  - Displays all projects.
  - Draft items show a prominent amber pill: `[DRAFT]`.
  - Next to the project title/code, add an interactive toggle button: `Published` (emerald) vs `Draft` (amber).
  - `handleAddProject` sets `status: 'draft'` so newly created projects remain private until the engineer flips them to `published`.

### 4.3 Deep Linking & Direct Share
- **URL Parameter Convention**: `?project=UMT-01` (case-insensitive comparison with `project.code` or `project.id`).
- **Initial Load (`App.tsx`)**:
  - On mount or content load, parse `new URLSearchParams(window.location.search).get('project')`.
  - If a matching project is found (case-insensitive) and is accessible (or in admin mode), set `selectedProject`.
- **History Synchronization**:
  - When a user opens a project modal: update URL to `?project=CODE` using `window.history.replaceState({}, '', newUrl)`.
  - When the modal is dismissed: remove the `project` param and restore clean `/`.
  - Preserves any other existing parameters.
- **Share / Copy Link Button**:
  - In `ProjectModal.tsx` top bar (next to the Close button): a "Share Link" button with `Copy` / `Check` icon.
  - Copies `https://myothway.netlify.app/?project=${project.code}` (or `window.location.origin + ...`) to clipboard and displays a 2-second confirmation toast.

### 4.4 Automated Client-Side WebP Compression
In `src/lib/cmsService.ts`:
- Introduce a helper function:
  ```ts
  export async function compressImageToWebpFile(
    file: File,
    maxDimension = 1920,
    quality = 0.84
  ): Promise<File>
  ```
- Steps:
  1. If `file.type === 'image/svg+xml'` or non-image (e.g. PDF), return original `file`.
  2. Decode image via `createImageBitmap` or `HTMLImageElement`.
  3. Compute aspect ratio constrained within `maxDimension × maxDimension`.
  4. Draw onto `OffscreenCanvas` or `HTMLCanvasElement`.
  5. Convert via `canvas.toBlob((blob) => ..., 'image/webp', quality)`.
  6. Return a new `File([blob], safeWebpFilename, { type: 'image/webp' })`.
  7. If compression throws or fails, catch and return the original `file` as fallback.
- In `uploadMediaFile(file, folder)`:
  - Run `compressImageToWebpFile(file)` before passing to `supabase.storage.from(...).upload(...)`.

### 4.5 SEO & Structured Data (`index.html`, `robots.txt`, `sitemap.xml`)
- **`index.html` Metadata**:
  - `og:site_name`: `Myo Thway, R.S.E. — UMT Construction Group`
  - `og:title`: `Myo Thway, R.S.E. | Lead Civil Engineer & Turnkey Construction Mandalay`
  - `og:description`: `Civil engineering, structural design (ETABS/ACI/MNBC), and high-end turnkey residential construction in Mandalay, Myanmar.`
  - `og:image`: `https://myothway.netlify.app/images/profile-myo-thway.png`
  - `og:type`: `website`
  - `og:url`: `https://myothway.netlify.app/`
  - `twitter:card`: `summary_large_image`
  - `twitter:title`, `twitter:description`, `twitter:image`
  - `theme-color`: `#081121`
- **Schema.org Structured Data**:
  ```json
  {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "name": "UMT Construction Group",
    "founder": {
      "@type": "Person",
      "name": "Myo Thway",
      "jobTitle": "Lead Civil Engineer & Registered Structural Engineer (R.S.E.)",
      "alumniOf": "Yangon Technological University (YTU)"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mandalay",
      "addressCountry": "MM"
    },
    "description": "Modern residential home construction, multi-story RC structural engineering, and turnkey project management in Mandalay, Myanmar.",
    "url": "https://myothway.netlify.app",
    "image": "https://myothway.netlify.app/images/profile-myo-thway.png",
    "areaServed": ["Mandalay", "Upper Myanmar"],
    "knowsAbout": ["Civil Engineering", "Structural Design", "BIM", "MNBC 2020", "ACI 318", "Residential Construction"]
  }
  ```
- **`public/robots.txt`**:
  ```text
  User-agent: *
  Allow: /
  Disallow: /admin
  Disallow: /admin/
  Sitemap: https://myothway.netlify.app/sitemap.xml
  ```
- **`public/sitemap.xml`**:
  Standard XML sitemap targeting `https://myothway.netlify.app/` with daily/weekly changefreq and priority `1.0`.

---

## 5. What's Left to the Builder
- Precise styling of the "Share" button and copied toast in `ProjectModal` using existing UMT design tokens (`var(--gold)`, `var(--solid-bg)`, `GlassCard`).
- Clean visual badge for Draft/Published toggle in `ProjectsEditor` sidebar item and detail header.
- Verification via `npm run lint` and `npm run build`.
