# T15 — Fact-check pass

## Goal
Every quantitative claim in the deck verified against a primary or spec-grade source, or reworded/removed. The research phase (July 2026) triangulated 3GPP facts through secondary sources because spec PDFs were proxy-blocked; this task closes that gap.

## Method
1. Obtain primary sources: 3GPP TS 38.212, TS 38.214, TS 36.212 (any recent release; the cited clauses are Rel-15-stable), TR 38.921; ICC'93 turbo paper (IEEE Xplore); Table 5.3.1.2-1 (polar sequence).
2. Walk the deck slide-by-slide against each part's "Factual basis" + "Flagged" lists (T02–T13 files).
3. For each flagged item: confirm → keep; contradict → fix slide + task file; unverifiable → hedge or delete. Log every disposition in this file under "Resolution log".

## Consolidated flagged-item register (from all task files)

### Must verify against 3GPP specs
- [ ] TS 38.212 Table 5.4.2.1-2: RV k0 factors BG1 {0,17,33,56}, BG2 {0,13,25,43} (currently srsRAN-verified — confirm table directly).
- [ ] TS 38.212 Tables 5.3.2-2/-3: BG1/BG2 edge counts (≈316/197 circulants) — currently UNQUOTED in deck; only add if verified.
- [ ] TS 38.212 §5.3.1.2 + Table 5.3.1.2-1: no bit-reversal; nested sequence; N=8-restricted prefix picks {3,5,6,7} (derived claim on Part 5 slides 4–5).
- [ ] TS 38.212 §5.4.1.2: polar puncture/shorten condition (K/E ≤ 7/16 vs >) — deck contradicts CafeTele deliberately; confirm.
- [ ] TS 38.212 §7.3/§6.3: CRC24C init-ones, RNTI masking of last 16 CRC bits, PBCH E=864, UCI CRC6/11, PC-bit rules (12≤A≤19, n_PC=3).
- [ ] TS 38.214 tables 5.1.3.1-1/2/3 and 5.2.2.1-2/3/4: spot-check 10 quoted rows + BLER targets (0.1 / 1e-5).
- [ ] TS 36.212 Table 5.1.3-3: 188 sizes; step pattern 40..512/8, 528..1024/16, 1056..2048/32, 2112..6144/64; QPP rows (40:3,10) (6144:263,480).
- [ ] TS 36.212 §5.1.4.1.2: k0 = R·(2·⌈Ncb/(8R)⌉·rv + 2) formula (extracted garbled during research).
- [ ] TR 36.942 Annex A: LTE attenuated-Shannon SNIR_MIN/MAX values (currently only TR 38.921's α=0.6/0.4, −10…+30/22 dB are quotable).
- [ ] RV cycling default {0,2,3,1} — locate in TS 38.214 / 38.331 or vendor docs.

### Must verify against papers
- [ ] ICC'93: constituent generators (37,21)₈, ν=4, and puncturing scheme (secondary sources didn't reproduce).
- [ ] Chung 2001 + BPSK limit composition: "0.19 + 0.04 ≈ 0.23 dB @ 1e-6" marker math in `CapacityExplorer`.
- [ ] Arıkan-Telatar 2^(−√N) exponent phrasing.
- [ ] PPV example values used on Part 1 slide 14 (n=128 backoff plot is author-computed from the normal approximation — re-derive once, independently).
- [ ] Mogensen VTC'07 α≈0.75 fit.
- [ ] Tosato-Bisaglia ICC 2002 as max-log demapper citation (page-level).

### Known-wrong / do-not-use list (confirm deck avoids them)
- [ ] "RV0 and RV2 self-decodable" (CafeTele error) — deck must say RV0/RV3.
- [ ] CafeTele's inverted polar puncture/shorten rule.
- [ ] "0.37 dB rate-1/2 BPSK limit" — unsourced.
- [ ] "Fastest theory-to-standard in coding history" for polar — use "under a decade" framing.
- [ ] "20× lower terminal power vs turbo" (single-source) — omit.
- [ ] CafeTele "0.7 dB Chase-vs-IR loss" — unverified.
- [ ] Nokia's camp in the coding wars (Computerworld self-contradicts) — keep hedged press framing.

### Author-derived arithmetic to re-check independently
- [ ] Eb/N0 limits for η ∈ {0.5, 4, 8}: {−0.82, 5.74, 15.03} dB.
- [ ] Voyager ≈2.3 dB operating point / ≈2.5 dB gap.
- [ ] Min-sum 1.3863 / NMS 1.0397 vs SP 0.7538 message values (T07 fixtures).
- [ ] RSC trace table (T09) vs TS 36.212 Fig 5.1.3-2 conventions.
- [ ] HARQ effective-rate sequence 0.80/0.40/0.27/0.20 (T13).
- [ ] (N/2)·log₂N XOR count; CQI-table ≈2.1 dB/step derivation; "≈11.9 dB CQI6→CQI1" delta.
- [ ] Sionna/Southampton plot read-offs (±0.2 dB) — ensure on-slide "≈" styling.

## Acceptance criteria
- [ ] Every checkbox above dispositioned in the Resolution log (kept / fixed / removed), with source citation per item.
- [ ] Zero on-slide numbers without a `SourceFoot` reference.
- [ ] Deck-wide grep for the do-not-use phrases returns nothing.
- [ ] Task files T02–T13 updated where facts changed.

## Resolution log
*(append during execution: item → verdict → source → slide(s) touched)*

## Dependencies
T02–T14 content-complete.
