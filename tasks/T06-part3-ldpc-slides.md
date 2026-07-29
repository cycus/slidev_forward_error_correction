# T06 — Part 3 slides: LDPC — the workhorse of 5G data

## Goal
The deepest section of the deck: from sparse matrices to why every 5G data bit rides an LDPC codeword. Encoding AND decoding, with 5G NR (TS 38.212) specifics an L1 engineer can map to their stack.

## Slide outline (17 slides)
1. **Section cover.** "LDPC: invented 1962, deployed 2003, everywhere by 2018."
2. **The Gallager story.** 1960 MIT thesis / 1962 IRE paper; shelved ~35 years — iterative decoding "prohibitively expensive" for 1960s hardware; rediscovered by MacKay & Neal 1996 (Electronics Letters 32(18)). `TriviaCard`: by 2001 LDPC was within **0.0045 dB** of capacity (Chung et al.) — the man was 40 years early. Second hook for later: Arıkan (polar) was Gallager's PhD student — "5G data runs the professor's code; 5G control runs the student's" (tease Part 5).
3. **H matrix → Tanner graph.** Small H (use Johnson's (2,3)-regular 4×6 example, same one the simulator uses); columns=variable nodes, rows=check nodes; edges = 1s. Click-morph from matrix to graph (color-coded per T01).
4. **Sparse is the point.** Regular vs irregular (degree distributions); short cycles hurt (girth; length-4 cycles break BP's independence assumption); PEG-style constructions maximize girth. Keep at intuition level.
5. **Decoding I — the idea.** Message passing: each check node is a tiny parity referee, each variable node a juror updating belief. BEC warm-up example (Wikipedia (6,3) example: receive ?01?11 → checks resolve both erasures in 2 steps) as click sequence.
6. **INTERACTIVE — `TannerBpSimulator`, guided run.** The centerpiece. Step through sum-product on the 4×6 example with real LLRs: received word with 1 flipped bit (channel LLRs ±1.386, BSC p=0.2); watch CN→VN messages (±0.7538) correct bit 1 to +0.1213 in ONE iteration; syndrome check → stop. Exact numbers in T07 spec.
7. **Decoding II — the math.** Tanh rule CN update; VN sum update; posterior = channel + Σ extrinsic. KaTeX stepped. Then min-sum approximation (sign·min), and why it overestimates → normalized min-sum α≈0.75 (MATLAB default) / offset β=0.5.
8. **INTERACTIVE — `TannerBpSimulator`, algorithm toggle.** Same received word, switch sum-product ↔ min-sum ↔ normalized min-sum; message values change (0.7538 vs 1.3863 vs 1.0397), convergence compared.
9. **Decoding III — schedules & iterations.** Flooding vs layered (layered ≈ 2× faster convergence — MathWorks/arXiv:2502.11053); real modems: ~8–25 iterations, early termination on parity satisfaction or CRC (NVIDIA cuPHY default 10; ASIC survey: 25 typical for min-sum). LLR quantization: 6-bit sweet spot (Intel FPGA IP docs).
10. **Encoding — from H to bits.** Generic G-from-H is dense/O(n²) → structured H saves us: 5G's raptor-like QC-LDPC with double-diagonal core → back-substitution, O(n), 28nm encoder hits 62–258 Gbps (MDPI Sensors 21:6266). Brief; the visual is the H structure zoning (A|B|0 / C1|C2|I).
11. **5G NR base graphs.** BG1 46×68 (Kb=22, K≤8448, mother R=1/3→8/9) vs BG2 42×52 (Kb=10, K≤3840, R=1/5→2/3); lifting sizes Zc ∈ 51 values {2…384} = a·2^j, a∈{2,3,5,7,9,11,13,15}; circulant permutation blow-up animation (base cell → Zc×Zc shifted identity). BG selection map: BG2 iff A≤292, or (A≤3824 ∧ R≤0.67), or R≤0.25 — render as a 2D region chart (A vs R), instantly readable for an L2 engineer.
12. **The hidden trick: punctured state bits.** First 2·Zc systematic columns are never transmitted (highest-degree VNs, decoder inits them LLR=0) — "the code transmits less than it knows," waterfall improves (DSPRelated QC-LDPC article; arXiv:2502.11053).
13. **From TB to codeword (the L2 view).** TB → CRC24A (A>3824, else CRC16) → segmentation at Kcb=8448/3840 → per-CB CRC24B (when C>1) → LDPC → rate matching. Worked real-world example: SIB1, A=640 → CRC16 → B=656 → BG2, Zc=72 → (3600,720) code (Estévez PDSCH walkthrough). Mermaid pipeline diagram.
14. **Rate matching & the circular buffer.** N=66Zc/50Zc buffer; RV0/1/2/3 start at {0,17,33,56}/66 (BG1) and {0,13,25,43}/50 (BG2) fractions (Table 5.4.2.1-2, verified vs srsRAN source); bit interleaver = Qm rows written row-wise, read column-wise → systematic bits land on strong QAM positions (calls back to Part 2 slide 7!). Full HARQ story deferred to Part 6 — one teaser sentence.
15. **Performance.** Waterfall + error floor anatomy (trapping sets); 5G LDPC floors ≤ BLER 1e-5 across rates (arXiv:2502.11053); sample points (Southampton 3D-EXIT, BG2 K′=1000): R=1/3 → BLER 1e-4 near −1 dB SNR; R=1/2 ≈ 1 dB; R=2/3 ≈ 3 dB.
16. **Why LDPC won 5G data.** The 2016 decision (RAN1#86bis Lisbon → #87 Reno): parallelism (node updates vs turbo's serial trellis), no meaningful floor, native rate flexibility; numbers: 5G needs 20 Gbps / ~0.665 µs decoder budget; record LDPC ASIC 52 Gbps; LDPC ~an order of magnitude better Gbps/mm² than turbo at multi-Gbps (Shao et al. survey, IEEE CS&T 2019). `TriviaCard`: DVB-S2 (2003) — LDPC's first mass deployment — beat six turbo proposals; selection constraint included max 14 mm² of 0.13 µm silicon (EBU Tech Review 300).
17. **Part 3 recap + gauge.** LDPC plants its flag: threshold 0.0045 dB (lab), ~1–2 dB (practical 5G). Where LDPC lives: 5G data, Wi-Fi 6, DVB-S2/x, 10GBASE-T, SSDs, G.hn.

## Acceptance criteria
- [ ] 17 slides per outline; presenter notes on all.
- [ ] Matrix→graph morph (3) and circulant lifting animation (11) implemented with clicks (v-click/v-motion or magic-move on a matrix code block).
- [ ] BG-selection region chart (11) correct against the three-condition rule.
- [ ] All spec numbers footnoted with TS 38.212 section + secondary source (per research: spec PDFs were proxy-blocked; T15 re-verifies).
- [ ] Simulator embeds (6, 8) degrade to static frames in export.
- [ ] Cross-references land: slide 12→Part 6 HARQ teaser; slide 14→Part 2 QAM bit reliability; slide 2→Part 5 tease.

## Factual basis — key verified numbers (sources)
- History: Gallager 1962 (IRE Trans. IT 8(1):21–28); MacKay-Neal 1996 (Electron. Lett. 32(18):1645–1646); Chung et al. 2001 (IEEE Comm. Lett. 5(2)).
- BG1/BG2 dims, Kb, Zc set (51 values), BG selection rule, 2Zc puncturing, CRC polynomials/attachment: TS 38.212 §5.1–5.3.2 — triangulated via ShareTechnote, CafeTele, Estévez, DSPRelated + srsRAN code.
- BG2 Kb reduction (9 if 560<B≤640, 8 if 192<B≤560, 6 if B≤192): ShareTechnote/spec.
- Decoding math + worked numbers: S. Johnson, "Introducing LDPC Codes" (examples 1.12/2.3/2.5).
- α=0.75 / β=0.5 defaults, layered ≈ half iterations: MathWorks nrLDPCDecode.
- Iterations: NVIDIA pyAerial default 10; Shao survey I=25 typical; 6 sometimes enough (JOCM 19(11)).
- RV k0 factors {0,17,33,56}·Ncb/(66Zc), {0,13,25,43}·Ncb/(50Zc): srsRAN `ldpc_rate_matcher_impl.cpp` (production code!) + CafeTele.
- Throughput: Shao et al. survey (20 Gbps target, 0.665 µs, 52 Gbps record, 987 bit/nJ); MDPI Sensors 21(18):6266 encoder.
- DVB-S2: EBU Tech Review 300 (Morello & Mignone): 0.7–1.2 dB from Shannon, 11 rates, 64800/16200 frames, BCH outer kills floor.
- Timeline RAN1: Southampton COMST survey Table III.

## Flagged for T15
- Edge counts (≈316/197 circulants in BG1/BG2) — read off TS 38.212 Tables 5.3.2-2/-3; do not quote until checked.
- "8–15 iterations typical" (CafeTele) — blog-grade; prefer Shao/NVIDIA numbers.
- α up to 0.8 — folklore beyond the 0.75 tool default.
- Southampton BLER sample points read off plots (±0.2 dB).

## Dependencies
T01; T07 simulator (parallel; embed placeholder until ready).
