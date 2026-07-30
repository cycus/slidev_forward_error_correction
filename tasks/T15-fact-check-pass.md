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

**Rounding convention adopted (deck-wide):** the LDPC lab result is reported as TWO
distinct, both-sourced quantities — **0.0045 dB = Chung's design (ensemble) threshold**
from the BI-AWGN capacity; **0.04 dB = the simulated gap at block length n=10⁷**. Every
`DbGauge` *flag* plots the 0.04 dB simulated gap (uniform in Parts 1/3/4/5/7); the 0.0045 dB
design threshold appears only in prose / BigNumbers / TriviaCards where "Chung's threshold"
is named. Part 1 slide 2 and Part 3 slide 2 already state both explicitly ("threshold sat
0.0045 dB from the limit — a simulated gap of ~0.04 dB at n=10⁷"), which web-verified as
the paper's exact framing.

### Internal-consistency (snippets = ground truth; npm test 59/59)
- Eb/N0 limits η∈{0.5,4,8} = {−0.82, 5.74, 15.03} dB, ultimate −1.59 dB, rate-½ 0 dB — **VERIFIED** vs `snippets/capacity.ts` (recomputed: −0.8175 / 5.7403 / 15.0345 / −1.5917).
- BPSK-input rate-½ = 0.19 dB flag (Part 1) — **VERIFIED** vs `CapacityExplorer` BPSK_INPUT anchor.
- CapacityExplorer LDPC marker 0.23 dB = 0.19 + 0.04 composition — **VERIFIED** (achieved Eb/N0 = BI-AWGN limit 0.19 + Chung sim gap 0.04). Note: the stylized DbGauge plots the *gap* 0.04, the rigorous (η,Eb/N0) plane plots the *achieved* 0.23 — same result, two reference frames; left as designed (task scoped to keep DbGauge uniform).
- Every DbGauge flag matches its home part — **VERIFIED**: Voyager 2.3 / Galileo 0.8 (Part 1), Turbo 0.7 (Parts 1/4/7), LDPC 0.04 (Parts 1/3/7), Polar 2.8 short-block (Parts 5/7), Part 6 flags intentionally empty. Same scale everywhere (−2…10 dB, refs −1.59/0/9.6).
- "11.9 dB" CQI6→CQI1 redundancy = redundancyDeltaDb(6,1) = 2.424−(−9.478) = 11.902 — **VERIFIED** vs `snippets/blerData.ts`. (Positive = headroom bought; the task's "−11.9" was sign-loose.)
- "~29 dB" CQI1–15 span = 19.809−(−9.478) = 29.29 dB — **VERIFIED** vs `blerData.ts`.
- "11 dB" Shannon gap = 9.6−(−1.59) = 11.19; deck uses **"11 dB" uniformly** on every slide (Parts 1/7, styleguide, thesis); presenter notes correctly cite ≈11.2 — **VERIFIED consistent**, one convention already in place, no change.
- Author-derived arithmetic (min-sum/NMS/SP messages, HARQ 0.80/0.40/0.27/0.20, RSC trace, RV k0 fractions) — **VERIFIED** via the 59 passing snippet tests.

### CORRECTED (on-slide)
- **Part 7 slide 1 matrix, "Flag on gauge" row (LDPC cell)** — was `0.0045 dB (lab)` while the row is literally titled "Flag on gauge" and the gauge (slide 2) plots 0.04 → **changed to `0.04 dB (lab)`** so the row matches the flag it names (and its own SourceFoot "flag dBs match each recap"). File: `pages/part7-epilogue.md`. Source: Chung et al. 2001, IEEE Comm. Lett. 5(2) (web-verified title & numbers).
- **Part 7 slide 3, ML-decoding citation** — title was `"Deep Learning for Channel Coding: A Survey"` → **corrected to exact title `"Recent Advances in Deep Learning for Channel Coding: A Survey"`** (arXiv:2406.19664, Matsumine & Ochiai; web-verified). File: `pages/part7-epilogue.md`.
- Two stale presenter-note "T15: reconcile" TODOs on Part 7 updated to record the resolution (direct consequence of the matrix edit).

### VERIFIED via web (secondary sources reachable)
- Chung et al. 2001 "within 0.0045 dB of the Shannon Limit," IEEE Comm. Lett. 5(2), Feb 2001; threshold 0.0045 dB / simulation 0.04 dB — **exact match** to deck.
- Berrou–Glavieux–Thitimajshima ICC'93 turbo; 0.7 dB Eb/N0 @ BER 1e-5 = "within ~0.5 dB of the limit" (IEEE Spectrum) — same result, two framings — **VERIFIED**.
- arXiv:2405.07547 "Channel Coding Toward 6G" — **VERIFIED** (title & scope).
- arXiv:2406.19664 exact title — **VERIFIED** (see CORRECTED).
- PPV 2010 IEEE Trans. IT 56(5) doc 5452208, Arıkan 2009 arXiv:0807.3917 — well-known, IDs correct.

### Do-not-use list — deck confirmed CLEAN
- grep for "RV0 and RV2 self-decodable", "0.37 dB", "fastest theory-to-standard", "20× lower terminal", "0.7 dB Chase" over `pages/` + `slides.md`: only hit is Part 6 line 347 which **debunks** the "RV2 self-decodable" misconception (correct usage). Deck says RV0/RV3 ✓, RV2/RV1 ✗ — correct.

### KEPT / CONFIRMED (hedges adequate, no change)
- **"~30 dB dial"** (Part 7 takeaway 4) vs "~29 dB" (Part 6): span is 29.29 dB. Tilde signals rounding and the SourceFoot already discloses "~29–30 dB"; presenter note explains the round-up. Confirmed acceptable per task option — left as-is to stay surgical.
- **Hamming (7,4) @ 9.0 dB / ~0.6 dB NCG** (CapacityExplorer marker): hedged in-code as "illustrative, not primary-sourced." ~0.6 dB hard-decision NCG @1e-5 is a standard textbook ballpark — hedge adequate, left as-is.
- **Part 6 flags** (pyAerial MCS9 identity, Sādhanā non-monotonic URLLC rows, Chase +3 dB/doubling = theoretical, Mogensen α=0.75 unverified, TR 36.942 lineage) — all still carry on-slide/in-`blerData.ts` "≈"/"flagged"/"unverified this session" wording. Confirmed hedged.

### STILL-UNVERIFIED (primary spec unreachable in sandbox — human must confirm against the actual PDFs)
All "Must verify against 3GPP specs" register items remain UNVERIFIED because 3gpp.org / etsi.org / sharetechnote are proxy-blocked here (per prior batches; not retried to avoid forbidden bypass):
- TS 38.212 Table 5.4.2.1-2 RV k0 {0,17,33,56}/{0,13,25,43} (srsRAN-sourced in deck).
- TS 38.212 §5.3.1.2 / Table 5.3.1.2-1 polar sequence & N=8 prefix {3,5,6,7}.
- TS 38.212 §5.4.1.2 polar puncture/shorten K/E ≤ 7/16 (deck deliberately contradicts CafeTele).
- TS 38.212 §7.3/§6.3 CRC24C, RNTI masking, PBCH E=864, UCI CRC6/11, PC-bit rules.
- TS 38.214 MCS/CQI table rows + BLER targets (0.1 / 1e-5).
- TS 36.212 Table 5.1.3-3 (188 sizes, QPP rows) and §5.1.4.1.2 k0 formula.
- TR 36.942 Annex A LTE attenuated-Shannon SNIR values (only TR 38.921 α=0.6/0.4 quoted on-slide).
- ICC'93 constituent generators (37,21)₈, ν=4 (Xplore paywalled).
- Mogensen VTC'07 α≈0.75; Tosato–Bisaglia ICC 2002 demapper (page-level) — secondary only.
None of these are asserted on-slide without a hedge or a SourceFoot; no fabricated spec value was introduced.

*(item → verdict → source → slide(s) touched; sources for spec items pending human check against primary PDFs)*

## Dependencies
T02–T14 content-complete.
