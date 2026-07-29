# T00 — Scaffold Slidev project

## Goal
A running Slidev v52+ project in this folder, with the structure and configuration that every later item builds on.

## Requirements
- Init with `npm init slidev@latest` (Node ≥ 20.12.0 required by Slidev v52.x). Keep `slides.md` as the entry file but split content per part: `slides.md` holds headmatter + Part 0, and imports `pages/part1-shannon.md` … `pages/part7-epilogue.md` via `src:` frontmatter so parts can be built independently.
- Headmatter baseline:
  ```yaml
  theme: seriph            # formal serif look; fallback: default
  title: "Approaching Shannon: FEC for 5G Engineers"
  colorSchema: auto
  aspectRatio: 16/9
  canvasWidth: 1080        # denser than default 980 for math-heavy slides
  monaco: dev              # editors only in dev; slim production build
  transition: slide-left
  comark: true             # NOTE: renamed from mdc; comark is the v52 flag
  lineNumbers: false
  fonts: { sans: Inter, mono: "JetBrains Mono" }
  drawings: { persist: false }
  export: { format: pdf, withClicks: false }
  ```
- Directory conventions created up front: `components/`, `snippets/`, `styles/`, `public/`, `setup/` (KaTeX config stub `setup/katex.ts`), `pages/`.
- Add `@iconify-json/carbon` and `@iconify-json/mdi` for icons.
- Git: init repo, `.gitignore` (node_modules, dist, .slidev), first commit.
- Scripts: `dev`, `build`, `export`; verify `slidev build` produces a working SPA in `dist/` (static hosting ready; interactivity survives SPA build but NOT PDF export — that is expected).
- Optional but recommended: GitHub Actions workflow for Pages deploy (checkout → setup-node LTS → `npm run build -- --base /<repo>/` → upload-pages-artifact → deploy-pages). Can be deferred to T16.

## Acceptance criteria
- [ ] `npm run dev` opens the deck; theme renders; dark-mode toggle (`d`) works.
- [ ] A KaTeX smoke-test slide renders `$$C = B\log_2(1+\mathrm{SNR})$$`.
- [ ] A Mermaid smoke-test block renders.
- [ ] A dummy component in `components/` auto-imports and renders on a slide.
- [ ] `npm run build` completes; `dist/` opens via `vite preview` with working click animations.
- [ ] Parts skeleton: 8 page files exist with section-cover placeholder slides, imported via `src:`.
- [ ] Repo committed.

## Factual basis / references
- Slidev current major: **v52.18.0**, Vue ^3.5, Vite ^8; `comark: true` replaces `mdc: true`; Node ≥ 20.12.0. (Verified July 2026 against sli.dev docs + slidevjs/slidev repo.)
- Themes: `seriph` (official, formal serif) or `default`; community `slidev-theme-academic` exists but may lag Slidev majors — test before adopting.
- Docs: https://sli.dev/custom/#headmatter · https://sli.dev/custom/directory-structure · https://sli.dev/guide/hosting
- Slidev ships an AI-assist skill: `npx skills add slidevjs/slidev` — worth installing for the implementation sessions.

## Out of scope
Theme fine-tuning, shared components (T01), any real content (T02+).
