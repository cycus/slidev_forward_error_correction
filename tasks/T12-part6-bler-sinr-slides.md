# T12 — Part 6 slides: Redundancy, Quantified — BLER vs SINR

## Goal
The user's explicit request made flesh: **quantifiable, factual metrics on BLER vs SINR under different redundancies.** This part turns "redundancy matters" into curves, tables and dB numbers a 5G engineer can take to the lab.

## Slide outline (13 slides)
1. **Section cover.** "Redundancy is a dial: 30/1024 to 948/1024."
2. **The dial itself.** NR MCS tables (TS 38.214 5.1.3.1-1/2/3): code rate spans R=0.029 (MCS0, low-SE table) → 0.926 (948/1024); SE 0.0586 → 7.4063. Representative-rows table with click-highlighting; reserved retx-only indices (29–31 / 28–31). Callback: these R values ARE the LDPC rate-matching output of Part 3.
3. **CQI: the UE's vote.** CQI = highest index with expected BLER ≤ **0.1** (tables 1/2/4); the high-reliability table 3 targets **1e-5** (URLLC). CQI1 = QPSK 78/1024 … CQI15 = 256QAM 948/1024.
4. **What a BLER curve looks like.** Anatomy: waterfall, floor, the 10% operating point. Real data walk-through (NVIDIA pyAerial, MCS9 AWGN): BLER 1.0 @ 8.1 dB → 0.78 @ 8.3 → 0.066 @ 8.5 → 1e-4 @ 8.7 — **two orders of magnitude in 0.3 dB**. That steepness is WHY link adaptation works in 1-dB MCS steps.
5. **INTERACTIVE — `BlerExplorer`.** Curve family explorer: pick MCS/code rates → BLER-vs-SNR waterfalls (log-y); 10% target line; readouts of SNR@10%BLER; toggle block-length effect (n=128 vs 1000 vs 8000 — waterfall shifts left ~2+ dB and steepens, Sionna data); toggle LTE CQI thresholds overlay (CQI1 −9.5 dB … CQI15 +19.8 dB @ 10% BLER — ~29 dB span, ≈2 dB/CQI step). Data embedded from published sources (spec in T13).
6. **Redundancy ⇄ SINR, quantified.** The headline table: dropping code rate QPSK 602→78 (CQI6→CQI1) buys ≈ **11.9 dB** of SINR headroom (2.42 → −9.48 dB @ 10% BLER, IOSR/LTE table); every halving of rate ≈ 2.5–3 dB at QPSK. This is the "how important is redundancy" slide — `BigNumber` treatment.
7. **HARQ — redundancy over time.** Chase (repeat = energy, ≈ +3 dB per doubling) vs Incremental Redundancy (new parity = energy + coding gain); NR: 16 processes, RV sequence {0,2,3,1}, RV0/RV3 self-decodable (⚠ not RV2 — common misconception, CafeTele has it wrong).
8. **INTERACTIVE — `HarqIrDemo`.** Circular buffer ring; RV pointers at {0, 17/66, 33/66, 56/66}·Ncb (BG1); each click = one retransmission: E=1250 more bits stream out, effective rate readout 0.80 → 0.40 → 0.27, decoder SNR-needed marker slides left on an inset BLER curve. (Spec in T13.)
9. **Why target 10% BLER?!** The counterintuitive optimum: backing off to 1e-3 first-shot BLER costs ~1+ dB margin ≈ a whole MCS of rate; 10% failures cost ~10% airtime that HARQ recovers with combined gain — residual BLER after 2 Tx ≈ 1e-3–1e-4 anyway. OLLA: θ += Δup on NACK, −Δdown on ACK; converged BLER = 1/(1+Δup/Δdown) → Δup = 9·Δdown for 10% (eOLLA, EURASIP 2016). MathWorks sim proof point: at −5 dB SNR, first-Tx BLER 60% still yields 40% normalized throughput via HARQ.
10. **URLLC: the other regime.** Latency forbids retransmission → CQI table 3 (1e-5), MCS table 3 (R down to 30/1024); finite-blocklength tax from Part 1 slide 14 returns: short blocks pay a rate penalty by physics (PPV), so URLLC spends redundancy up front. Sample thresholds (Sādhanā 2023): BLER 1e-5 @ ~3–5.6 dB for low MCS, 32-byte payloads.
11. **How close to Shannon are we?** The attenuated-Shannon system model: Thr = α·log₂(1+SNR), α = 0.6 DL / 0.4 UL, SNIR range −10…+30 dB (TR 38.921 Table 4.2.7-1; lineage TR 36.942 A.1); literature fits α ≈ 0.6–0.75. Overlay: Shannon vs α-curve vs MCS staircase — the staircase hugs the α-curve; gap decomposition (implementation, quantized rates, 10% BLER margin, HARQ recovery).
12. **The full loop.** One diagram: SINR estimate → CQI → MCS/code rate → LDPC RM/RV → BLER realized → ACK/NACK → OLLA → (repeat). "FEC isn't a block — it's the control system's actuator." Mermaid sequence or animated SVG.
13. **Part 6 recap + gauge.** Redundancy quantified: rate dial 0.03–0.93 ⇒ ~30 dB of operating range; waterfalls ~decades/0.3 dB; HARQ turns 10% failure into throughput. Gauge: practical NR sits ~α=0.6–0.75 of capacity.

## Acceptance criteria
- [ ] 13 slides per outline; every number footnoted; presenter notes drafted.
- [ ] Slide 6's headline dB numbers traceable to the embedded dataset (same numbers the `BlerExplorer` shows).
- [ ] RV self-decodability stated as RV0/RV3 with the misconception flagged.
- [ ] OLLA formula + Δup=9·Δdown derivation stepped in KaTeX (2 clicks max).
- [ ] Slides 5 & 8 embed T13 components (placeholders until ready).
- [ ] URLLC slide links back to Part 1's PPV slide explicitly (same chart style).
- [ ] LTE-vs-NR provenance of each curve labeled (the CQI-threshold table is LTE/turbo data — say so on-slide; NR LDPC points from pyAerial/Sionna labeled likewise).

## Factual basis — key data (sources)
- MCS tables: TS 38.214 5.1.3.1-1/2/3 rows via ShareTechnote (MCS0 QPSK 120/1024 SE 0.2344; MCS28-T1 948/1024 SE 5.5547; T2 MCS27 256QAM 948 SE 7.4063; T3 MCS0 30/1024 SE 0.0586).
- CQI definition + 10% / 1e-5 targets: TS 38.214 §5.2.2.1 via iTecSpec; table rows (CQI1 78/1024 → CQI15 948/1024).
- pyAerial AWGN curve (MCS9): NVIDIA docs notebook — 8 points, 1.0@8.1 dB → 0@8.8 dB.
- Sionna block-length data (R=1/2): BLER≈1e-3 @ ~3.5 dB (n=128) → ~1.25 dB (n=16000); (k=64,n=128) 1.33e-3 @ 4.0 dB etc.
- LTE CQI→SINR @10% BLER table: IOSR-JECE (CQI1 −9.478 … CQI15 +19.809 dB); ≈2.1 dB/step derived.
- HARQ: RV k0 fractions (srsRAN-verified, Part 3); {0,2,3,1} sequence + RV0/RV3 self-decodable: Devopedia/Dahlman + patent WO2019032881A1; 16 processes: Devopedia; Chase +3 dB/doubling: theoretical bound (Chase 1985 concept).
- MathWorks HARQ proof points: PDSCH Throughput example (BLER 60% @ −5 dB → 40% tput; 16QAM R≈0.49 CDL-C 8×2) and HARQ getting-started (BLER 0.43 @ 7 dB, R 0.4815).
- OLLA: Blanquez-Casado et al., EURASIP JWCN 2016 (formula, converged-BLER expression).
- Attenuated Shannon: ETSI TR 138 921 V18 Table 4.2.7-1 (α=0.6/0.4, −10…30/22 dB); TR 36.942 A.1 lineage; α up to 0.75: Mogensen VTC'07 (flagged).
- URLLC thresholds: Khan & Jacob, Sādhanā 48:77 (2023) — non-monotonic rows flagged.
- ns-3 5G-LENA abstraction (CBS effect, EESM β 1.6→132.5): arXiv:2001.10309.

## Flagged for T15
- α=0.75 upper fit (Mogensen) — not verified this session.
- TR 36.942 LTE-specific SNIR_MIN/MAX values — annex not extracted; quote only TR 38.921 values until checked.
- Chase +3 dB/doubling — theoretical, label as such; Frenger 2001 exact IR-vs-CC deltas paywalled.
- "0.7 dB loss all-RV0 vs IR" (CafeTele) — unverified blog figure, do not use.
- pyAerial notebook's MCS table identity (looks like 256QAM-table MCS9=16QAM 616/1024) — confirm before labeling the curve.

## Dependencies
T01; components T13 (data contract shared — see T13 "dataset" section).
