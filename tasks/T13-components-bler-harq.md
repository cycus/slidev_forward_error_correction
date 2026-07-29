# T13 — `BlerExplorer` + `HarqIrDemo` components (centerpiece #2)

## Goal
The quantitative heart of the deck: real published BLER/SINR data made explorable, and incremental-redundancy HARQ animated on the actual NR circular buffer.

## Shared dataset (`snippets/blerData.ts`) — the data contract
Curated, source-annotated datasets (each point carries `{source, url, note}`); consumed by both components AND quoted on T12 slides so slide numbers always match component numbers:
1. **NR LDPC AWGN waterfall** (NVIDIA pyAerial, MCS9, TBS-scale): [8.1,1.0], [8.2,0.9921], [8.3,0.7812], [8.4,0.3281], [8.5,0.0657], [8.6,0.0071], [8.7,1e-4], [8.8,~0].
2. **Block-length family @ R=1/2** (Sionna): (k=64,n=128) 1.33e-3 @ 4.0 dB; (64,512) 2.15e-3 @ 2.5; (500,1000) 2.81e-3 @ 1.75; (4000,8000) 0.416 @ 1.0; envelope: BLER 1e-3 needs ~3.5 dB (n=128) → ~1.25 dB (n=16000). Points are sparse — render as anchored idealized waterfalls through the anchor points, visually honest (dashed "interpolated" styling + legend note).
3. **LTE CQI thresholds @ 10% BLER** (IOSR-JECE): CQI1..15 = [−9.478, −6.658, −4.098, −1.798, 0.399, 2.424, 4.489, 6.367, 8.456, 10.266, 12.218, 14.122, 15.849, 17.786, 19.809] dB with (mod, R×1024) labels. Label clearly LTE/turbo provenance.
4. **URLLC low-SE anchors** (Sādhanā 2023): MCS3 5.597 / MCS4 3.2 / MCS7 3.192 dB @ BLER 1e-5 (flag non-monotonicity in tooltip).
5. **MCS/CQI table rows** (TS 38.214 via ShareTechnote/iTecSpec) for pickers.

## `BlerExplorer` — interaction spec
- Log-y BLER (1 … 1e-5) vs SNR/SINR dB (−12 … +22) chart; shared chart util (T01).
- Curve sources selectable as layers: (a) LTE CQI staircase points, (b) pyAerial NR curve, (c) Sionna block-length family, (d) URLLC anchors. Legend always shows provenance; mixing layers allowed but axes labeled "AWGN link-level; sources differ — see tooltips".
- 10% BLER horizontal target line (toggle 1e-5 for URLLC mode); crosshair readout: "SNR @ 10% BLER = X dB".
- **Redundancy A/B mode** (the money interaction): pick two code rates (e.g. R=0.59 vs R=0.076) → shaded horizontal arrow between their 10%-BLER SNRs with the dB delta labeled (e.g. "−11.9 dB: redundancy bought this").
- Block-length toggle animates the n=128→16000 leftward shift + steepening.
- Guided (`$clicks`) script for slide 5: layer (b) walk → target line → steepness callout (2 decades / 0.3 dB) → A/B mode reveal.

## `HarqIrDemo` — interaction spec
- **Circular buffer ring** (SVG donut): N=66·Zc segments; systematic arc (blue, first 2Zc grayed = punctured state bits — callback to Part 3), parity arc (amber); RV0/1/2/3 pointer marks at k0 fractions {0, 17/66, 33/66, 56/66} (BG1 formulas ⌊x·Ncb/(66Zc)⌋·Zc rendered in tooltip).
- Scenario: K=1000, BG1, E=1250/Tx, RV order {0,2,3,1}. Each click = one transmission: arc segment of E bits sweeps out from the RV pointer (wrapping), transmitted bits accumulate (opacity stacking = LLR combining); readouts update: cumulative bits 1250/2500/3750/5000, **effective rate 0.80 → 0.40 → 0.27 → 0.20**, "self-decodable?" badge (RV0 ✓, RV2 ✗, RV3 ✓ wraps into systematic, RV1 ✗).
- Inset mini-BLER curve: "SNR needed @10% BLER" marker slides left as effective rate drops (mapping via dataset 3's rate→SNR anchors, clearly labeled illustrative).
- Chase-mode toggle: all Tx at RV0 → overlap total, only energy gain (+3 dB per doubling shown) vs IR's larger shift at high initial rate — the IR>CC lesson.
- Explore: Zc/E sliders (bounded), BG2 toggle swaps k0 set to {0,13,25,43}/50.

## Technical requirements
- All arithmetic in pure TS (`snippets/harq.ts`): `k0(bg, rv, Ncb, Zc)`, `effectiveRate(K, bitsSent)`; unit tests: k0 fractions match srsRAN shift factors; rate sequence 0.80/0.40/0.27/0.20 for the canonical scenario.
- `<RenderWhen context="main">`; guided modes `$clicks`-driven; PDF fallbacks (final frame with all four RV arcs).
- Every displayed number must come from the shared dataset or the pure functions — no magic literals in templates.

## Acceptance criteria
- [ ] Dataset module complete with per-point source annotations; datasets render with provenance legends.
- [ ] BlerExplorer: A/B redundancy delta reproduces ≈11.9 dB for CQI6→CQI1; steepness callout matches pyAerial data; 1e-5 URLLC mode works.
- [ ] HarqIrDemo: k0 pointer positions exact; effective-rate sequence exact; Chase/IR contrast visible; BG2 toggle correct.
- [ ] Guided scripts for T12 slides 5 & 8 work on presenter remote.
- [ ] Unit tests green; no rAF leaks on slide leave.

## Factual basis
All datasets sourced as listed above (pyAerial notebook, Sionna tutorial, IOSR-JECE table, Sādhanā paper, TS 38.214 tables via ShareTechnote/iTecSpec, srsRAN rate-matcher source for k0). Flags inherited from T12 (pyAerial MCS-table identity; Sādhanā non-monotonic rows; Chase +3 dB theoretical label).

## Dependencies
T01 (chart util), T12 (shared narrative + dataset contract). Feeds T12 slides 5, 8.
