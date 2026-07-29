# T03 — `CapacityExplorer` component

## Goal
One component, two views, that makes Shannon's limit *tangible*: (1) the capacity formula as a playground, (2) the Eb/N0-vs-spectral-efficiency plane where every later code family gets plotted.

## Interaction spec
**View 1 — "The formula" (`mode="capacity"`):**
- Sliders: SNR (−10…+40 dB), bandwidth B (1…100 MHz). Output: C in Mbps, big readout.
- Overlay line chart C(SNR) with the current point; log-ceiling annotation appears when the user doubles SNR ("+3 dB ⇒ +1 bit/s/Hz, not ×2").
- Preset buttons that speak 5G: "cell edge (−5 dB)", "mid cell (13 dB)", "peak, 256QAM territory (30 dB)".

**View 2 — "The plane" (`mode="ebn0"`):**
- Axes: Eb/N0 (dB, −2…+16) vs spectral efficiency η (0.1…10, log scale). Draw:
  - Unconstrained capacity boundary Eb/N0 = (2^η−1)/η (shaded "impossible region" left of it).
  - BPSK-input capacity curve (table-driven; anchor: rate-1/2 → ≈0.19 dB).
  - Hard-decision BPSK curve (≈ +2 dB shift) — toggle.
- Click-stepped markers (driven by `$clicks` when embedded): uncoded BPSK (9.6 dB, η≈1) → Hamming → Voyager (≈2.3 dB) → Turbo (0.7 dB) → LDPC n=10⁷ (0.04 dB) → each with year label. This IS the "march to capacity" visual for slides 12–13.
- Hover on any marker: name, year, dB-to-limit, one-line note.

## Technical requirements
- Props: `mode`, `clicksDriven: boolean`, `markers?: Marker[]` (default = historical set above).
- SVG-rendered chart (shared chart util from T01); no heavy chart lib needed here.
- Reference-value table embedded as typed constant with source comments; unit-testable pure function `ebn0LimitDb(eta: number)`.
- Numeric correctness: `ebn0LimitDb(1) === 0` dB exactly; `ebn0LimitDb(η→0) → −1.59` dB; values for η ∈ {0.5, 2, 4, 8} match {−0.82, 1.76, 5.74, 15.03} ±0.01 dB.
- Behaves in static SPA build; wrapped `<RenderWhen context="main">`; slider state persists across navigation (module store from T01).
- PDF-export fallback: static PNG/SVG snapshot of view 2 with all markers visible.

## Acceptance criteria
- [ ] Both modes render and are usable with mouse only; view 2 also fully drivable by slide clicks.
- [ ] Unit checks for `ebn0LimitDb` pass (values above).
- [ ] Impossible region visually unmistakable; capacity boundary labeled "Shannon 1948".
- [ ] Historical markers carry correct (year, Eb/N0, η) with sources in tooltip.
- [ ] Dark mode legible; overview grid shows a lightweight placeholder, not the live chart.

## Factual basis (marker data, verified — sources in T02)
| Marker | Year | Eb/N0 @ BER≈1e-5 | η | Note |
|---|---|---|---|---|
| Uncoded BPSK | — | 9.6 dB | 1 | Forney Ch.4 |
| Voyager RS+conv | 1977 | ≈2.3 dB | ≈0.44·2 | 7.3 dB real gain, Costello-Forney; gap arithmetic flagged |
| Galileo iterative | 1992 | ≈0.8 dB (@2e-7) | ≈0.25 | Costello-Forney |
| Turbo | 1993 | 0.7 dB | 1 | ICC'93 |
| LDPC (n=10⁷) | 2001 | ≈0.23 dB (0.19+0.04) | 1 | Chung et al.; composition flagged — T15 |
| 5G LDPC (practical) | 2018 | ~1–2 dB region | varies | qualitative band, not a point |
| Limits | — | −1.59 / 0 / 0.19 dB | 0 / 1 / 1 | Forney; CCSDS |

## Dependencies
T01 (chart util, store, RenderWhen conventions).
