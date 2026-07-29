# T08 — Part 4 slides: Turbo — the 1993 revolution

## Goal
The best *story* in coding history, told with LTE-grade technical depth: parallel concatenation, extrinsic information, iterative decoding — and why 5G retired it.

## Slide outline (14 slides)
1. **Section cover.** "Geneva, May 1993: two outsiders break coding theory."
2. **The ICC'93 story.** Berrou, Glavieux, Thitimajshima: BER 1e-5 at **0.7 dB** (rate 1/2, 65536-bit interleaver, 18 iterations) when state of the art was ~3.5 dB away. "So preposterous many experts didn't bother reading the paper" (IEEE Spectrum); Berrou: "Every day I asked myself about the possible errors in the program." They were electronics professors at ENST Bretagne — not coding theorists. `TriviaCard`: the name — Berrou picked "turbo" watching a car race (feedback like a turbocharger's exhaust); Hagenauer's joke that it's a misnomer: the encoder has no feedback at all.
3. **Architecture.** Two RSC encoders in parallel + interleaver; systematic + 2 parity streams → mother rate 1/3. Animated block diagram (clicks).
4. **Why RECURSIVE matters.** Non-recursive: weight-1 input → low-weight codeword *for any interleaver* (same bad event hits both encoders). Recursive = IIR: a single 1 rings forever; only weight-2+ patterns terminate; interleaver makes "bad for both" improbable → interleaver gain ~1/N (Divsalar-Pollara JPL). Show with `RscEncoderStepper`: feed 1000…0 → parity never dies.
5. **INTERACTIVE — `RscEncoderStepper`.** LTE's actual encoder: G(D)=[1, g1/g0], g0=1+D²+D³ (13₈), g1=1+D+D³ (15₈). Step input 1,1,0,1 through the shift register: states 000→100→110→111→111, parity 1,0,0,1 (reference trace in T09). Then trellis-termination step: 3 tail inputs from feedback return state to 000. Numbers: **12 transmitted tail bits, 4 per stream, D=K+4**.
6. **LTE specifics.** TS 36.212: 188 block sizes K=40…6144; QPP interleaver Π(i)=(f1·i+f2·i²) mod K (K=40: f1=3,f2=10; K=6144: f1=263,f2=480); contention-free property → 8–32 parallel MAP cores; segmentation + CRC24B; sub-block interleaver + circular buffer + RV0-3.
7. **Decoding — the gossip loop.** Two SISO decoders exchange beliefs through the interleaver; block diagram animated over 2 clicks; "each decoder tells the other only what it *learned*, not what it was told."
8. **Extrinsic information, precisely.** L_APP = L_c·y_sys + L_a + L_e ⇒ **L_e = L_APP − L_c·y_sys − L_a** (Sklar Eq. 11 form). Why subtract: feeding back own beliefs = positive feedback = self-confirming overconfidence (Hagenauer/Offer/Papke 1996). KaTeX stepped, color-coded terms.
9. **INTERACTIVE — `TurboIterationDemo`.** Sklar's 2×2 product-code example: data LLRs {1.5, 0.1, 0.2, 0.3}, parity {2.5, 2.0, 6.0, 1.0} — three bits start near-worthless; watch horizontal pass rescue d2 (extrinsic −1.5 via strong d1), vertical pass fix d3/d4; after 2 full iterations all |LLR| ≥ 2.5. Confidence *flows* through parities. (Full reference numbers in T09.)
10. **BCJR at block level.** α forward / β backward / γ branch metrics on the trellis picture; MAP = per-bit posterior (vs Viterbi's per-sequence). Engineer's depth: no derivation, just data flow + the serial-recursion bottleneck highlighted (foreshadows slide 13).
11. **Log-MAP vs Max-Log-MAP.** max*(x,y)=max+ln(1+e^−|Δ|); dropping the correction costs ~0.3–0.4 dB; extrinsic scaling (~0.7, or 0.6875 in hardware) claws back most of it (Valenti/WVU; ETH JSSC 2011). Iterations in practice: 4–8 (LTE ASIC rated at 5.5); CRC24B doubles as free early-stop.
12. **EXIT charts.** ten Brink 2001: I_A vs I_E transfer curves of both decoders, mirrored; decoding = staircase in the tunnel; tunnel closes → stuck; opens at ≈0.5 dB for rate-1/2 PCCC. One annotated chart, click-stepped staircase. (Static SVG acceptable; animate only if cheap.)
13. **Why 5G dropped turbo.** Serial α/β recursion vs LDPC parallelism: best turbo silicon of the decision era ~2.15 Gb/s vs 5G's 20 Gb/s target; error floor at high rates (BLER ~1e-4–1e-5 territory); complexity/bit up to ~4300 ops vs LDPC's ~600–840 (Maunder white paper — a *pro-turbo* source conceding the numbers). The 2016 coding wars: LDPC camp (Qualcomm/Samsung/Nokia) vs turbo camp (Ericsson/Orange/AccelerComm) vs polar camp (Huawei+) → RAN1#86bis/#87 verdicts. `TriviaCard`: Orange defended turbo partly as patent holder; the original turbo patent (filed Apr 1991) had already expired in 2013.
14. **Turbo's legacy + gauge.** Still carrying a huge share of world traffic: 5G was ~1/3 of mobile subscriptions as of late 2025 (~3.1B of ~8.9B by Q1 2026, Ericsson Mobility Report) — every 4G bit still ends in a turbo decoder. Also: UMTS/HSPA, CCSDS deep-space turbo (16-state, rates 1/2…1/6, flown on MRO, SMART-1 — first probe with turbo, 2003), DVB-RCS duo-binary. Gauge flag: 0.7 dB (1993 lab).

## Acceptance criteria
- [ ] 14 slides per outline, presenter notes drafted.
- [ ] Extrinsic equation slide (8) color-codes the three terms consistently with the demo (9).
- [ ] EXIT chart (12) staircase steps on clicks; axes labeled I_A/I_E ∈ [0,1].
- [ ] Coding-wars slide (13) presents camps as *reported* (press-sourced) — phrasing hedged, citations shown.
- [ ] All dB/throughput claims footnoted; components embed with placeholders until T09.
- [ ] Story slides (2, 13, 14) land trivia without derailing technical flow (max 1 TriviaCard each).

## Factual basis — key verified numbers (sources)
- ICC'93: Proc. ICC'93 pp. 1064–1070; 0.7 dB @ 1e-5 corroborated by JPL TDA 42-123 + Costello-Forney; skepticism quotes: IEEE Spectrum "Turbo Codes Explained"; Wikipedia Turbo code.
- Recursion argument: Divsalar & Pollara, JPL TDA PR 42-121/42-123.
- LTE encoder polys (13,15)₈, tail-bit multiplexing d(0)/d(1)/d(2), D=K+4: ETSI TS 136 212 V8.8.0/V10.0.0 §5.1.3.2 (fetched verbatim).
- QPP table rows (40:3,10; 6144:263,480), 188 sizes: ETSI PDF + IJFCC paper.
- Extrinsic decomposition: Sklar, "Fundamentals of Turbo Codes"; Hagenauer-Offer-Papke IEEE IT 1996.
- Max-Log penalty 0.3–0.4 dB, scaling 0.7/+0.4 dB, 0.6875/+0.2 dB: Valenti & Sun DVB chapter; Westminster chapter; Studer et al. JSSC 2011 (390 Mb/s @ 5.5 iter, 0.13 µm).
- EXIT: ten Brink, IEEE Trans. Commun. 49(10):1727–1737, Oct 2001.
- 5G decision: Southampton COMST survey (RAN1 timeline, #86bis Lisbon Oct 2016 / #87 Reno Nov 2016); Maunder "5G Channel Code Contenders" white paper (2.15 Gb/s Ilnseher; ops/bit); camps: Computerworld (press-grade — hedge).
- Subscriptions: Ericsson Mobility Report Nov 2025 / Q1 2026 via ComSoc blog & StockTitan.
- CCSDS turbo: CCSDS 131.0-B (16-state, rates to 1/6, blocks to 8920 bits); DVB-RCS duo-binary: Valenti & Sun.

## Flagged for T15
- 1993 constituent generators (37,21)₈ ν=4 — pull ICC'93 PDF to confirm before quoting.
- Turbo error-floor "BER 1e-6–1e-8" — folklore; sourced version is "BLER 1e-4–1e-5 at high rates" (blog-grade). Use hedged phrasing or find 3GPP-era sim curve.
- RAN1#86 location "Gothenburg"; "~50 companies behind polar at Reno"; Nokia camp assignment (Computerworld self-contradicts) — verify against 3GPP registry/chairman notes.
- 188-size step pattern arithmetic (60+32+32+64) — eyeball Table 5.1.3-3.

## Dependencies
T01; components T09 (parallel, placeholders OK).
