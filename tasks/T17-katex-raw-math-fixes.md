# T17 — Fix raw (unrendered) KaTeX inside HTML blocks, Parts 4–5

## Goal
Seven spots in Parts 4–5 print literal `$...$` / `$$...$$` source text instead of rendered math, because the math sits inside an HTML block whose content is not blank-line-delimited (comark only processes markdown/KaTeX inside an HTML element when the content is separated from the tags by blank lines). Violates the DoD "KaTeX renders". All seven were confirmed visually in the 2026-07-31 export (`npm run export` → pdftoppm → page inspection).

## Confirmed locations (file : approx lines : slide : broken text)

| # | Location | Slide | Renders as |
|---|---|---|---|
| 1 | `pages/part4-turbo.md` ~138–141 | Part 4 s3 "Architecture" | `$$ \Rcode = \frac{k}{n} = \frac{1}{3} $$` literal (PDF p45) |
| 2 | `pages/part4-turbo.md` ~416–420 | Part 4 s8 "Extrinsic information" | `$L_c\, y^s$`, `$L_a$`, `$L_e$` literal in the 3-span legend (p50) |
| 3 | `pages/part4-turbo.md` ~668–671 | Part 4 s12 "EXIT charts" | `$(1,1)$` literal in the corrected-green card (p54) |
| 4 | `pages/part5-polar.md` ~154–157 | Part 5 s3 "The 2×2 kernel" | `$I(W⁻)+I(W⁺)=2\,I(W)$` literal (p59) |
| 5 | `pages/part5-polar.md` ~348–351 | Part 5 s7 "SC decoding" | `$N\to\infty$` literal (p63) |
| 6 | `pages/part5-polar.md` ~400–402 | Part 5 s8 "SCL + CRC" | `$O(L\,N\log N)$`, `$L$` literal (p64) |
| 7 | `pages/part5-polar.md` ~518–522 | Part 5 s10 "Polar vs LDPC" | `$\EbNo$` literal (p66) |

## Fix patterns

- **Block content (items 1, 3, 4, 5, 6, 7):** insert a blank line after the opening `<div ...>` and before the closing `</div>` so comark processes the content. Watch item 1: it has a *nested* caption `<div>` — blank-line-delimit both levels or move the caption out.
- **Inline spans (item 2):** blank-line-delimiting would wrap all three `<span>`s in one `<p>`, breaking the `flex gap-3` layout (the `<p>` becomes the single flex child). Either restructure each span into its own `<div>` with blank-lined content, or replace the math with plain HTML (`<i>L<sub>c</sub>·y<sup>s</sup></i>`, `<i>L<sub>a</sub></i>`, `<i>L<sub>e</sub></i>`). Colour classes must survive — the legend's blue/muted/green is the binding colour contract with slides 7 and 9.
- Item 7 uses the deck macro `\EbNo` — confirm the macro still resolves after the change (it is defined deck-wide; it renders fine elsewhere, e.g. Part 1).

## Acceptance criteria
- [ ] `npm run export` → the seven pages show rendered math; zero literal `$` glyphs anywhere in the exported deck (spot-grep the PDF text layer or re-inspect pages 45, 50, 54, 59, 63, 64, 66).
- [ ] No layout regression on the touched slides (side-by-side compare against the 2026-07-31 export).
- [ ] Extrinsic-legend colour semantics unchanged (info-blue / muted / corrected-green).
- [ ] `@slidev/parser` still loads 87 slides (hidden styleguide excluded); `npm test` still green (no snippets touched).

## Factual basis
Rendered-output evidence from local export, 2026-07-31 (Windows dev machine — full `slidev export` works here, unlike the earlier automation sandbox). Root cause matches the known comark inline-math-in-HTML gotcha already noted in project memory and BACKLOG standing risks (Slidev v52 `comark: true`).

## Dependencies
None. Highest-priority review fix — pure content edits.
