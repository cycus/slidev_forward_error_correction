# Deck conventions (binding for T02–T16)

The rules that keep ~85 slides feeling like one deck. Tokens live in
`styles/index.css`; UnoCSS colors/shortcuts in `uno.config.ts`; shared
components in `components/`.

## 1. Color semantics

Used **consistently everywhere** — a color always means the same thing.

| Meaning | Token | CSS var | UnoCSS |
|---|---|---|---|
| systematic / information bits | info | `--fec-info` | `text-fec-info`, `bg-fec-info-soft` |
| parity / redundancy | parity | `--fec-parity` | `text-fec-parity` |
| erroneous / flipped bit | error | `--fec-error` | `text-fec-error` |
| corrected / converged | corrected | `--fec-corrected` | `text-fec-corrected` |
| frozen bit (polar) | frozen | `--fec-frozen` | `text-fec-frozen` |
| trivia accent (non-semantic) | trivia | `--fec-trivia` | `text-fec-trivia` |

Every token has a light and a dark value (dark values lifted for contrast on
dark backgrounds) plus a `-soft` tint for fills. **Never hard-code hex** in a
slide or component — reference the var/utility so both schemes track. `trivia`
is deliberately outside the semantic set so "did you know" cards never read as
parity/amber.

Semantic chips: `<span class="fec-chip-info">systematic</span>` (also
`-parity`, `-error`, `-corrected`, `-frozen`).

## 2. Math notation (define once, never redefine)

- **LLR sign:** positive LLR ⇒ bit **0** more likely (3GPP / MATLAB polarity).
- **Eb/N0** always in **dB**.
- **Code rate** `R = k/n`.
- **Block length** `n` or `N`, per each family's own literature convention
  (LDPC/Turbo use `n`; polar uses `N = 2^m`).
- Notation is introduced on a single slide in **Part 2** and never re-defined.
- Shared KaTeX macros in `setup/katex.ts`: `\SNR \SINR \EbNo \dB \LLR \Rcode
  \Prob` (control-word names are letters-only — KaTeX can't parse a digit in a
  macro name, so it's `\EbNo`, not `\EbN0`). Add new shared macros there, not
  inline.

## 3. Click choreography

- Reveals advance an **argument**, not decoration. Max ~6 clicks/slide.
- Component-internal stepping is driven by `$clicks` (via `useSlideContext()`)
  so the presenter remote works — **unless** free exploration is the point,
  then use explicit in-component UI buttons.
- Slide-sequenced components read clicks; free-exploration components own their
  own state and reset it in `onSlideLeave`.

## 4. Charts (decided here, reused everywhere)

- **Pedagogical animations** (Tanner graph, polarization tree, RSC register,
  HARQ buffer): **hand-rolled inline SVG**. Full control, theme-aware via
  `var(--fec-*)`, no dependency.
- **Curve plots** (`CapacityExplorer`, `BlerExplorer`): **one shared hand-rolled
  SVG plotting util** (built in T03, then reused) rather than Chart.js — keeps
  the bundle lean, exports cleanly to PDF, and themes via CSS vars. One look for
  all BER/BLER-style plots: **log-y grid, dB x-axis**, integer dB ticks.
- Heavy canvases: lazy-init in `onSlideEnter`, dispose in `onSlideLeave`, wrap
  in `<RenderWhen context="main">` so they stay out of thumbnails/overview.
- `DbGauge` is the running motif: every code family "plants its flag" on the
  same fixed scale (**−2 … +10 dB**) so progress toward the limit is comparable
  across parts.

## 5. Citations

- Every slide with a quantitative claim carries `<SourceFoot>`.
- `<SourceFoot :refs="[['Shannon 1948','https://…'], ['3GPP TS 38.212','']]" />`
  — array of `[label, url]` tuples (url optional). Also accepts `{label, url}`
  objects or a single string.
- Hero figures use `<BigNumber value="−1.59 dB" label="…" source="Forney Ch.4" />`.
- Style figures: dB values to 2 dp when the precision matters (−1.59 dB), else
  1 dp. Use tabular numerals (`class="fec-tnum"`) in aligned tables.

## 6. Slide components (Slidev specifics)

- Slide component instances **persist while hidden** — `onMounted/onUnmounted`
  do **not** fire on navigation. Use `onSlideEnter` / `onSlideLeave` from
  `@slidev/client` for setup/teardown.
- `useSlideContext()` → `$clicks`; `$renderContext` is `slide | overview |
  presenter | previewNext` — gate heavy work on it.
- Cross-slide state: a plain reactive module store (`state.ts`) persists across
  navigation — use that, not component-local refs, for shared state.
