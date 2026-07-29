# T10 — Part 5 slides: Polar — the theorist's triumph

## Goal
Channel polarization from intuition to 5G control channels: the only code family born with a capacity proof, and why it owns PDCCH/PBCH/UCI but not data.

## Slide outline (12 slides)
1. **Section cover.** "2008: the last great coding theorem gets a constructive proof."
2. **The Arıkan story.** PhD at MIT 1986 **under Gallager himself**; ~25-year quest rooted in the sequential-decoding cutoff-rate paradox; polarization emerged as an 'inner code' so effective no outer code was needed ("On the Origin of Polar Coding"). Single-author paper: arXiv July 2008, IEEE Trans. IT July 2009 — first explicit construction *provably* achieving capacity. `TriviaCard`: the lineage — Gallager invented LDPC; his student invented polar. **5G data runs the professor's code; 5G control runs the student's.** (Callback to Part 3 slide 2.)
3. **The 2×2 kernel.** G₂ = [[1,0],[1,1]]: combine two channel uses (u1⊕u2, u2) → split into a worse channel (W⁻) and a better one (W⁺). One butterfly, animated. Intuition: "rob the first bit to pay the second."
4. **INTERACTIVE — `PolarizationExplorer` view 1.** BEC(0.5) recursion, exact numbers: N=2 → {0.75, 0.25}; N=4 → {0.9375, 0.5625, 0.4375, 0.0625}; N=8 → {0.996, 0.879, 0.809, 0.316, 0.684, 0.191, 0.121, 0.0039}. Watch channels split toward 0/1 extremes; fraction of good channels → capacity I(W)=0.5. Teaching beat: polarization is *slow* — at N=8 only 3/8 channels have Z<0.2.
5. **Frozen bits = the code.** Put data on good synthetic channels, freeze bad ones to 0. Rate-1/2 at N=8: info {u3,u5,u6,u7}, frozen {u0,u1,u2,u4}. The 5G twist: one universal nested reliability sequence of length 1024 (TS 38.212 Table 5.3.1.2-1) — no per-SNR construction, both ends just agree. `TriviaCard`: 3GPP picked the Huawei-proposed sequence at RAN1#90 (Aug 2017).
6. **Encoding.** x = u·G_N, G_N = G₂^⊗n (NR drops Arıkan's bit-reversal); FFT-like butterfly, (N/2)·log₂N XORs (N=512 → 2304 XORs). Butterfly diagram animated per stage (reuse `PolarizationExplorer` view 2 or magic-move code block).
7. **SC decoding.** Sequential bit-by-bit: decide u_i using y + all previous decisions; frozen positions auto-known. Capacity-achieving as N→∞ but fragile at finite N — one early wrong decision kills the block. Animated decode walk on the N=8 tree.
8. **SCL + CRC = the fix.** Tal-Vardy 2011/2015: keep L candidate paths (L=8 the 5G working assumption); CRC picks the winner (CA-SCL). Complexity O(L·N·logN). At n≈1–2k, CA-SCL matches state-of-the-art LDPC; L=32 ≈ ML.
9. **5G NR deployment table.** Where polar lives (TS 38.212): PDCCH DCI (CRC24C, RNTI-masked, N≤512), PBCH (fixed A=32, E=864), UCI ≥12 bits (CRC6/11, N≤1024, PC bits for 12≤A≤19); tiny UCI uses RM/simplex/repetition. Rate matching: puncture (low rate) / shorten (high rate, K/E>7/16) / repeat. Distributed-CRC interleaver → early termination during blind decoding, FAR ≈ 2^−21 with L=8.
10. **Polar vs LDPC at short blocks.** Numbers: (n=128,k=64) @ BLER 1e-3: CA-SCL-8 ≈ 2.8 dB vs LDPC BP-20 ≈ 3.5 dB Eb/N0 (Sionna, read-off ±0.2 dB); PBCH config: polar beats LDPC BG2 by ≈1 dB with ~9× fewer ACS ops (Maunder); polar shows no error floor in URLLC studies where LDPC/turbo floor near 1e-5 at short K. LDPC catches up and wins by n≈1000–2000.
11. **Why not data?** SCL is serial: throughput doesn't scale to 20 Gbps eMBB; decoder comparisons across tdocs mixed process nodes (90nm vs 14nm — hedge!); Nov 2016 Reno compromise: LDPC data / polar control. Brief, fair, sourced.
12. **Part 5 recap + gauge.** Polar plants its flag (provably AT capacity asymptotically; practically best-in-class short-block). `TriviaCard`: Huawei ceremony, 26 July 2018, Shenzhen — Ren Zhengfei presented Arıkan a Monnaie-de-Paris medal (Goddess of Victory, Baccarat crystal); 100+ Huawei researchers honored alongside. Frame carefully: "under a decade from theory to standard" (2008→2016) — NOT "fastest ever" (turbo did ICC'93→UMTS in ~6 years).

## Acceptance criteria
- [ ] 12 slides per outline; presenter notes drafted.
- [ ] All BEC(0.5) numbers on slides 4–5 match the exact recursion values (unit-tested in T11).
- [ ] Deployment table (9) column-accurate per the T11/T15-verified spec facts; CafeTele's inverted puncturing/shortening claim explicitly avoided (it's wrong — spec direction: puncture when K/E ≤ 7/16, shorten when > 7/16).
- [ ] Comparative numbers (10) presented with error bars/hedges as specified.
- [ ] Lineage trivia (2) references back to Part 3; gauge updated (12).

## Factual basis — key verified numbers (sources)
- Arıkan bio/advisor (MIT 1986, Gallager): Wikipedia Erdal Arıkan; origin story: arXiv:1511.04838.
- Kernel, polarization theorem, O(N logN), Pe bounds (N^−1/4 → 2^−√N Arıkan-Telatar): arXiv:0807.3917, arXiv:0807.3806.
- BEC recursion Z⁺=Z², Z⁻=2Z−Z² and all N=2/4/8 values: Arıkan 2009 Prop. 5 (values computed exactly — safe).
- NR: no bit-reversal, G_N = G₂^⊗n; universal nested length-1024 sequence: TS 38.212 §5.3.1.2 via ShareTechnote + Maunder COMST.
- SCL: Tal-Vardy IEEE Trans. IT May 2015; L=8 working assumption: MathWorks 5G Toolbox, Atlantis URLLC study.
- Channel table (CRC24C init-ones + RNTI mask, PBCH E=864, UCI CRC6/11, PC-polar 3 bits for 12≤A≤19, n_max 9 DL / 10 UL, RM staircase for A<12): Maunder COMST + MathWorks + destevez.net PDCCH walkthrough (triangulated).
- Rate-matching direction (puncture K/E≤7/16, shorten >7/16): destevez.net + spec §5.4.1.2. ⚠ CafeTele has it inverted.
- Distributed CRC / early termination, FAR ≈ 2^−(24−log₂L): Maunder.
- Performance: Sionna polar-vs-LDPC tutorial; Maunder PBCH comparison; Atlantis Press URLLC study (single-source claims flagged there).
- RAN1 timeline (#87 Reno Nov 2016 control decision; sequence at #90): Southampton COMST Table III.
- Huawei ceremony: Huawei press release 26 Jul 2018.

## Flagged for T15
- N=8 five-G-sequence-prefix tie-in (restricted sequence picks same top-4 set) — derived; check against Table 5.3.1.2-1.
- Sionna dB values — plot read-offs ±0.1–0.2 dB; label as approximate on slide.
- "20× lower terminal power vs turbo" (Atlantis) — single-source; omit or heavily hedge.
- (N/2)log₂N XOR count — derivation; sanity-check.

## Dependencies
T01; `PolarizationExplorer` = T11 (parallel, placeholder OK).
