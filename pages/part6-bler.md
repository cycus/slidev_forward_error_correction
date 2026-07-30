---
layout: default
---

<SectionCover
  :part="6"
  title="Redundancy, Quantified"
  thesis="Code rate is a dial. ~29 dB of SINR span, and 10% BLER is the optimum."
>
<div class="mt-5 text-fec-muted">
The theory parts are done. Now the <b class="text-fec-fg">engineering</b>: turn
"redundancy matters" into <b>curves, tables and dB numbers</b> you can take to
the lab.
</div>
</SectionCover>

<!--
Part 6 opener — the user's explicit ask made flesh: quantifiable, factual BLER-vs-SINR
metrics under different redundancies. Arc: the rate dial (MCS tables) → CQI = the UE's
vote → the anatomy of a waterfall → BlerExplorer (interactive #1) → redundancy⇄SINR
headline (11.9 dB) → HARQ as redundancy-over-time → HarqIrDemo (interactive #2) →
why 10% BLER is optimal (OLLA) → URLLC's other regime → how close to Shannon (α-curve)
→ the full link-adaptation loop → recap + gauge. Two SimStubs (BlerExplorer,
HarqIrDemo) land in T13; their ground-truth data lives in snippets/blerData.ts +
snippets/harq.ts and is printed on-slide so the placeholders still teach.
-->

---
layout: default
class: px-10
---

# The dial itself — NR MCS tables

<div class="text-fec-muted mt-1 mb-2">
A modulation-and-coding scheme is one row: a modulation order and a code rate.
TS 38.214 ships three tables; together they span a <b>32×</b> range of spectral
efficiency.
</div>

<table class="fec-tnum text-sm w-full" style="border-collapse:collapse">
<thead><tr class="text-fec-muted text-left border-b border-fec-line">
<th class="px-3 py-1">Table</th><th class="px-3 py-1">MCS</th><th class="px-3 py-1">Modulation</th><th class="px-3 py-1">R × 1024</th><th class="px-3 py-1">Spec. eff.</th>
</tr></thead>
<tbody>
<tr class="border-b border-fec-line"><td class="px-3 py-1">5.1.3.1-3 (low-SE)</td><td class="px-3 py-1">0</td><td class="px-3 py-1 text-fec-info">QPSK</td><td class="px-3 py-1">30</td><td class="px-3 py-1">0.0586</td></tr>
<tr class="border-b border-fec-line"><td class="px-3 py-1">5.1.3.1-1 (64QAM)</td><td class="px-3 py-1">0</td><td class="px-3 py-1 text-fec-info">QPSK</td><td class="px-3 py-1">120</td><td class="px-3 py-1">0.2344</td></tr>
<tr class="border-b border-fec-line"><td class="px-3 py-1">5.1.3.1-1 (64QAM)</td><td class="px-3 py-1">28</td><td class="px-3 py-1 text-fec-info">64QAM</td><td class="px-3 py-1">948</td><td class="px-3 py-1">5.5547</td></tr>
<tr><td class="px-3 py-1">5.1.3.1-2 (256QAM)</td><td class="px-3 py-1">27</td><td class="px-3 py-1 text-fec-info">256QAM</td><td class="px-3 py-1">948</td><td class="px-3 py-1">7.4063</td></tr>
</tbody>
</table>

<div class="grid grid-cols-2 gap-6 mt-3">

<div v-click class="fec-card border-l-4 !border-l-fec-info text-sm">
The rate dial runs <b class="fec-tnum">R = 0.029</b> (30/1024) to <b class="fec-tnum">0.926</b>
(948/1024): spectral efficiency <b class="fec-tnum">0.0586 → 7.4063</b> bit/s/Hz.
Indices <b>29–31</b> (64QAM) / <b>28–31</b> (256QAM) are <b>reserved</b> — they
carry no rate, only a modulation order for retransmissions.
</div>

<div v-click class="fec-card text-sm">
<b>Callback to Part 3:</b> these R values <em>are</em> the LDPC rate-matcher's
output. The MCS index picks how much of the mother code's parity survives
circular-buffer selection — the dial and the encoder are the same mechanism.
</div>

</div>

<SourceFoot :refs="[['NR MCS tables, reserved indices, SE values: 3GPP TS 38.214 §5.1.3.1-1/2/3 via ShareTechnote', 'https://www.sharetechnote.com/']]" />

<!--
Slide 2. The dial. Representative endpoints of all three MCS tables (numbers match
snippets/blerData.ts nrMcsRows exactly): low-SE MCS0 30/1024 SE 0.0586; 64QAM MCS0
120/1024 0.2344 and MCS28 948/1024 5.5547; 256QAM MCS27 948/1024 7.4063. Info-blue on
the modulation column = the systematic/information contract. Two reveals: the 0.029→0.926
rate span + reserved indices 29–31 / 28–31 (retx-only), then the Part-3 callback — the
MCS index IS the LDPC rate-matcher setting, not a separate knob.
-->

---
layout: default
class: px-10
---

# CQI — the UE's vote

<div class="grid grid-cols-2 gap-8 mt-1">

<div class="space-y-3">

The UE measures its channel and reports a **Channel Quality Indicator**: the
**highest** CQI index whose expected first-transmission BLER stays **≤ 10%**.

<div class="fec-card text-sm">
<b>CQI 1</b> = QPSK <b class="fec-tnum">78/1024</b> (the floor) …
<b>CQI 15</b> = 256QAM <b class="fec-tnum">948/1024</b> (the ceiling).
Fifteen rungs, each ~2 dB of SINR apart.
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-error text-sm">
<b>Two targets, by table.</b> CQI tables 1/2 (and the LTE table) aim at
<b>10% BLER</b>. The high-reliability <b>table 3</b> re-anchors every rung to
<b class="fec-tnum">10⁻⁵</b> — the URLLC target (slide 10).
</div>

</div>

<div class="space-y-3">

<div v-click>

The vote is only as good as its **age**: CQI is a *past* measurement steering a
*future* grant. On a fading channel the report is stale by the time it is used —
which is exactly why an outer correction loop (OLLA, slide 9) is needed on top.

</div>

<TriviaCard title="A report, not a command">
The gNB is free to **ignore** the CQI. It is an advisory measurement; the
scheduler picks the actual MCS, trading the UE's vote against buffer state,
latency budget and its own OLLA offset.
<template #icon><div class="i-carbon-thumbs-up" /></template>
<template #source>3GPP TS 38.214 §5.2.2.1 (CQI definition) via iTecSpec.</template>
</TriviaCard>

</div>

</div>

<SourceFoot :refs="[['CQI definition, 10% / 1e-5 BLER targets, table rows: 3GPP TS 38.214 §5.2.2.1 via iTecSpec', '']]" />

<!--
Slide 3. CQI = highest index with expected BLER ≤ 10% (tables 1/2/LTE); table 3 targets
1e-5 for URLLC. Endpoints CQI1 QPSK 78/1024 → CQI15 256QAM 948/1024 match blerData.ts
nrCqiRows. Error-red card flags the dual target (10% vs 1e-5) which slide 10 pays off.
Reveal on the right sets up OLLA: CQI is a stale past measurement steering a future grant,
so an outer loop is mandatory. ONE TriviaCard: CQI is advisory — the scheduler can override.
-->

---
layout: default
class: px-10
---

# What a BLER curve looks like

<div class="grid grid-cols-5 gap-5 mt-1">

<div class="col-span-3">
<svg viewBox="0 0 460 240" class="w-full h-auto" role="img" aria-label="NR LDPC BLER waterfall, pyAerial MCS9 AWGN">
  <!-- y grid + decade labels (BLER 1 … 1e-4, log) -->
  <g v-for="(g, i) in [['1',20],['10⁻¹',65],['10⁻²',110],['10⁻³',155],['10⁻⁴',200]]" :key="i">
    <line x1="60" :y1="g[1]" x2="440" :y2="g[1]" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1" stroke-dasharray="3 4" />
    <text x="54" :y="Number(g[1]) + 4" text-anchor="end" style="font-size:10px" class="fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ g[0] }}</text>
  </g>
  <!-- axes -->
  <line x1="60" y1="20" x2="60" y2="200" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.5" />
  <line x1="60" y1="200" x2="440" y2="200" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.5" />
  <g v-for="(t, i) in [['8.2',144],['8.4',229],['8.6',313],['8.8',398]]" :key="`x${i}`">
    <line :x1="t[1]" y1="200" :x2="t[1]" y2="205" :style="{ stroke: 'var(--fec-line)' }" />
    <text :x="t[1]" y="217" text-anchor="middle" style="font-size:10px" class="fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ t[0] }}</text>
  </g>
  <text x="440" y="235" text-anchor="end" style="font-size:11px;font-style:italic" :style="{ fill: 'var(--fec-muted)' }">SINR (dB)</text>
  <text x="60" y="14" text-anchor="start" style="font-size:11px;font-style:italic" :style="{ fill: 'var(--fec-muted)' }">BLER</text>
  <!-- 10% target line -->
  <g v-click>
    <line x1="60" y1="65" x2="440" y2="65" :style="{ stroke: 'var(--fec-error)' }" stroke-width="1.6" stroke-dasharray="6 3" />
    <text x="436" y="60" text-anchor="end" style="font-size:10px;font-weight:700" :style="{ fill: 'var(--fec-error)' }">10% operating point</text>
    <circle cx="260" cy="65" r="4.5" :style="{ fill: 'var(--fec-error)' }" />
  </g>
  <!-- the waterfall (pyAerial MCS9) -->
  <path d="M 102,20 L 144,20 L 187,25 L 229,42 L 271,73 L 313,117 L 356,200" fill="none" :style="{ stroke: 'var(--fec-info)' }" stroke-width="2.6" />
  <g v-for="(p, i) in [[102,20],[144,20],[187,25],[229,42],[271,73],[313,117],[356,200]]" :key="`p${i}`">
    <circle :cx="p[0]" :cy="p[1]" r="3" :style="{ fill: 'var(--fec-info)' }" />
  </g>
  <text x="360" y="196" text-anchor="start" style="font-size:9px" :style="{ fill: 'var(--fec-muted)' }">→ 8.8 dB: below floor</text>
</svg>
</div>

<div class="col-span-2 space-y-3 text-sm">

Every coded link has the same shape: a flat **pre-waterfall**, a near-vertical
**waterfall**, then (for LDPC/turbo at short blocks) an **error floor**.

<div class="fec-card">
<b>NVIDIA pyAerial, MCS9 (AWGN):</b><br>
BLER <b class="fec-tnum">1.0</b> @ 8.1 dB → <b class="fec-tnum">0.78</b> @ 8.3
→ <b class="fec-tnum">0.066</b> @ 8.5 → <b class="fec-tnum">10⁻⁴</b> @ 8.7 dB.
<div class="text-xs text-fec-muted mt-1">NR LDPC — MCS/modulation identity as published, unconfirmed.</div>
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-error">
<b>~2 orders of magnitude in ~0.3 dB.</b> That steepness is <em>why</em> link
adaptation works in <b>1-dB MCS steps</b>: nudge the SINR estimate and BLER
swings across the whole target range.
</div>

</div>

</div>

<SourceFoot :refs="[['NR LDPC AWGN waterfall (MCS9, 8 points): NVIDIA pyAerial docs notebook', 'https://docs.nvidia.com/aerial/']]" />

<!--
Slide 4. Anatomy of a waterfall, plotted from the real pyAerial MCS9 points (identical
to snippets/blerData.ts pyAerialWaterfall). Inline SVG, log-y BLER vs dB SINR, deck house
style. Reveal 1: the 10% target line + operating-point marker (error-red). Reveal 2: the
steepness callout — ~2 decades of BLER inside ~0.3 dB, the physical reason 1-dB MCS
stepping is viable. NR/pyAerial provenance labelled; MCS identity hedged (T15 flag).
Sets up BlerExplorer (slide 5) and the 11.9 dB headline (slide 6).
-->

---
layout: default
class: px-10
---

# Explore the curve family

<div class="grid grid-cols-5 gap-5 mt-1">

<div class="col-span-3">
<BlerExplorer guided height="17rem" />
</div>

<div class="col-span-2 space-y-2 text-sm">

Reference data the explorer draws (all in `snippets/blerData.ts`):

<table class="fec-tnum text-xs" style="border-collapse:collapse">
<thead><tr class="text-fec-muted"><th class="px-2 text-left">Layer</th><th class="px-2 text-left">Ground truth</th></tr></thead>
<tbody>
<tr><td class="px-2 align-top">LTE CQI</td><td class="px-2">CQI1 <b>−9.5</b> dB … CQI15 <b>+19.8</b> dB @ 10% BLER (≈29 dB span)</td></tr>
<tr><td class="px-2 align-top">pyAerial NR</td><td class="px-2">MCS9 waterfall 1.0 → 10⁻⁴ over 8.1–8.7 dB</td></tr>
<tr><td class="px-2 align-top">Sionna n</td><td class="px-2">BLER 10⁻³ @ ~3.5 dB (n=128) → ~1.25 dB (n=16000)</td></tr>
</tbody>
</table>

<div v-click class="fec-card border-l-4 !border-l-fec-corrected text-xs">
<b>Longer blocks slide the curve left.</b> Same rate R=½, more coded bits: the
waterfall shifts <b>~2+ dB</b> toward Shannon and steepens — the finite-blocklength
tax shrinking as n grows (Sionna; anchors idealized, dashed in the plot).
</div>

</div>

</div>

<SourceFoot :refs="[['LTE CQI thresholds: IOSR-JECE (turbo); NR curves: NVIDIA pyAerial + Sionna LDPC tutorials', ''], ['All datapoints source-annotated in snippets/blerData.ts', '']]" />

<!--
Slide 5. Interactive #1 (SimStub → BlerExplorer, T13). Reference data printed beside the
stub so the placeholder teaches and T13 has on-slide ground truth: LTE CQI span −9.5…+19.8
dB (≈29 dB), pyAerial MCS9 waterfall, Sionna block-length 1e-3 crossings 3.5→1.25 dB — all
from snippets/blerData.ts. LTE-vs-NR provenance explicit in the table + SourceFoot. Reveal:
the block-length leftward shift (~2+ dB), corrected-green, tagged as idealized/dashed anchors.
Guided $clicks script for this slide is authored in T13.
-->

---
layout: default
class: px-10
---

# Redundancy ⇄ SINR, quantified

<div class="grid grid-cols-2 gap-8 mt-2">

<div class="space-y-3">

Here is the whole part in one number. Stay on **QPSK**; drop the code rate from
**602/1024** (CQI 6) to **78/1024** (CQI 1):

<div class="fec-card text-sm fec-tnum">
CQI 6: 10% BLER @ <b>+2.42 dB</b><br>
CQI 1: 10% BLER @ <b>−9.48 dB</b>
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-corrected text-sm">
Every halving of the code rate at QPSK buys roughly <b>2.5–3 dB</b> of SINR
headroom. Redundancy is spendable margin — priced in dB.
</div>

<div v-click class="text-xs text-fec-muted">
LTE/turbo measurements (IOSR-JECE). NR LDPC numbers differ in detail but the
<em>slope</em> — dB bought per bit of rate given up — is the same physics.
</div>

</div>

<div class="flex flex-col justify-center items-center">
<BigNumber value="11.9 dB" label="SINR headroom bought by dropping QPSK 602→78 (CQI6→CQI1)" color="corrected" source="IOSR-JECE LTE CQI table (2.42 → −9.48 dB @ 10% BLER)" />
</div>

</div>

<SourceFoot :refs="[['CQI→SINR thresholds @ 10% BLER (CQI6 2.424 dB, CQI1 −9.478 dB): IOSR-JECE LTE table', '']]" />

<!--
Slide 6. The headline. BigNumber 11.9 dB = redundancyDeltaDb(6,1) computed in
snippets/blerData.ts (2.424 − (−9.478) = 11.902), NOT a magic literal — same figure the
BlerExplorer A/B arrow reproduces. corrected-green (headroom = good). Reveal 1: ~2.5–3 dB
per rate-halving. Reveal 2: explicit LTE/turbo provenance hedge — the slope generalises to
NR, the exact dB do not. This is the "how important is redundancy" payoff slide.
-->

---
layout: default
class: px-10
---

# HARQ — redundancy over time

<div class="grid grid-cols-2 gap-8 mt-1">

<div class="space-y-3">

The first transmission need not carry all the redundancy. **HARQ** adds more on
demand, retransmission by retransmission.

<div class="fec-card text-sm">
<b class="text-fec-parity">Chase combining</b> — resend the <em>same</em> coded
bits. The receiver combines energy: a doubling buys ≈ <b>+3 dB</b>
<span class="text-fec-muted">(theoretical bound — Chase 1985)</span>. No new
coding gain.
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-corrected text-sm">
<b class="text-fec-corrected">Incremental Redundancy</b> — send <em>new</em>
parity from the circular buffer. Energy <b>and</b> coding gain: the effective
code rate drops with every transmission. This is NR's default.
</div>

</div>

<div class="space-y-3">

<div v-click class="fec-card text-sm">
NR: up to <b>16 HARQ processes</b>, RV transmission order <b class="fec-tnum">{0, 2, 3, 1}</b>.
Not every RV can be decoded alone — a retransmission may need its predecessors.
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-error text-sm">
<b>Self-decodable: RV0 ✓ and RV3 ✓</b> (they start in / wrap into the
systematic bits). <b>RV2 ✗</b> and RV1 ✗ start in parity.
<div class="mt-1 text-xs text-fec-muted">⚠ The "RV2 is self-decodable" claim (e.g. CafeTele) is a common misconception.</div>
</div>

</div>

</div>

<SourceFoot :refs="[['16 processes, RV order {0,2,3,1}, self-decodability: Devopedia; Dahlman et al.; patent WO2019032881A1', ''], ['Chase +3 dB/doubling: theoretical bound (Chase 1985 concept)', '']]" />

<!--
Slide 7. HARQ as redundancy-over-time. Three reveals inside budget. Chase (parity-token,
+3 dB/doubling, LABELLED theoretical per T15 flag) vs IR (corrected-green, new parity =
energy + coding gain, NR default). Then RV order {0,2,3,1} + 16 processes. Then the
self-decodability card (error-red): RV0/RV3 ✓, RV2/RV1 ✗ — with the RV2 misconception
flagged explicitly (CafeTele has it wrong). Facts mirror snippets/harq.ts RV_SELF_DECODABLE.
Sets up HarqIrDemo (slide 8).
-->

---
layout: default
class: px-10
---

# Watch redundancy accumulate

<div class="grid grid-cols-5 gap-5 mt-1">

<div class="col-span-3">
<HarqIrDemo guided height="17rem" />
</div>

<div class="col-span-2 space-y-2 text-sm">

Canonical scenario (K=1000, BG1, E=1250/Tx) — from `snippets/harq.ts`:

<table class="fec-tnum text-xs" style="border-collapse:collapse">
<thead><tr class="text-fec-muted"><th class="px-2 text-left">Tx (RV)</th><th class="px-2 text-left">Bits</th><th class="px-2 text-left">Eff. rate</th></tr></thead>
<tbody>
<tr><td class="px-2">1 (RV0)</td><td class="px-2">1250</td><td class="px-2"><b>0.80</b></td></tr>
<tr><td class="px-2">2 (RV2)</td><td class="px-2">2500</td><td class="px-2"><b>0.40</b></td></tr>
<tr><td class="px-2">3 (RV3)</td><td class="px-2">3750</td><td class="px-2"><b>0.27</b></td></tr>
<tr><td class="px-2">4 (RV1)</td><td class="px-2">5000</td><td class="px-2"><b>0.20</b></td></tr>
</tbody>
</table>

<div v-click class="fec-card text-xs">
RV start offsets <b>k₀</b> at buffer fractions <b class="fec-tnum">{0, 17/66, 33/66, 56/66}·N<sub>cb</sub></b>
(BG1); BG2 uses <b class="fec-tnum">{0, 13, 25, 43}/50</b>. Quantised to the
lifting size Z<sub>c</sub>: k₀ = ⌊x·N<sub>cb</sub>/(66·Z<sub>c</sub>)⌋·Z<sub>c</sub>.
</div>

</div>

</div>

<SourceFoot :refs="[['RV k0 fractions {0,17/66,33/66,56/66} (BG1) / {0,13,25,43}/50 (BG2): 3GPP TS 38.212 §5.4.2.1, srsRAN', ''], ['Effective-rate sequence 0.80/0.40/0.27/0.20: computed in snippets/harq.ts', '']]" />

<!--
Slide 8. Interactive #2 (SimStub → HarqIrDemo, T13). Reference data printed beside the stub:
the canonical K=1000/BG1/E=1250 scenario with cumulative bits 1250/2500/3750/5000 and
effective rates 0.80/0.40/0.27/0.20 (canonicalEffectiveRates() in snippets/harq.ts, 0.27 =
round(1000/3750,2)); RV k0 fractions {0,17/66,33/66,56/66}·Ncb (BG1) and {0,13,25,43}/50
(BG2) via k0() with the ⌊x·Ncb/(66·Zc)⌋·Zc formula. Every number here is a function output,
not a literal. Guided $clicks script authored in T13.
-->

---
layout: default
class: px-10
---

# Why target 10% BLER?!

<div class="grid grid-cols-2 gap-8 mt-1">

<div class="space-y-3 text-sm">

It looks reckless to <em>plan</em> for one in ten transmissions to fail. It is
optimal — because HARQ recovers the failures cheaply.

- Chasing **10⁻³** first-shot BLER costs **~1+ dB** of margin — nearly a whole
  MCS of rate, given away on every transmission.
- A **10%** failure costs ~10% of airtime, which HARQ buys back with combining
  gain: residual BLER after 2 Tx is **~10⁻³–10⁻⁴** anyway.

<div v-click class="fec-card text-sm">
<b>MathWorks proof point:</b> at <b class="fec-tnum">−5 dB</b> SINR a first-Tx
BLER of <b class="fec-tnum">60%</b> still delivers <b class="fec-tnum">~40%</b>
normalized throughput once HARQ is in the loop.
</div>

</div>

<div class="space-y-3">

**Outer-loop link adaptation (OLLA)** holds the operating point there:

$$ \theta \mathrel{+}= \Delta_{\text{up}}\ \text{on NACK}, \qquad \theta \mathrel{-}= \Delta_{\text{down}}\ \text{on ACK} $$

<div v-click>

At equilibrium the offset neither drifts up nor down:

$$ \text{BLER}^\star = \frac{1}{1 + \Delta_{\text{up}}/\Delta_{\text{down}}} $$

</div>

<div v-click class="fec-card border-l-4 !border-l-fec-corrected text-sm">
Want <b>10%</b>? Set $\text{BLER}^\star = 0.1 \Rightarrow \Delta_{\text{up}} = 9\,\Delta_{\text{down}}$
— one big step up per NACK, nine small steps down per ACK.
</div>

</div>

</div>

<SourceFoot :refs="[['OLLA formula + converged-BLER 1/(1+Δup/Δdown): Blanquez-Casado et al., EURASIP JWCN 2016', ''], ['HARQ throughput @ −5 dB / 60% BLER: MathWorks 5G PDSCH Throughput example', '']]" />

<!--
Slide 9. The counterintuitive optimum. Prose sets the trade: chasing 1e-3 wastes ~1 dB (a
whole MCS); 10% failures are recovered by HARQ (residual ~1e-3–1e-4 after 2 Tx). MathWorks
proof point: 60% BLER @ −5 dB → ~40% throughput. Then OLLA in KaTeX within the ≤2-click
budget: reveal 1 = converged BLER = 1/(1+Δup/Δdown); reveal 2 = solve BLER*=0.1 ⇒ Δup=9·Δdown
(corrected-green). Uses the shared \dB is not needed; plain KaTeX. T15: MathWorks second
proof point (0.43 @ 7 dB) held in reserve if a re-check wants a second anchor.
-->

---
layout: default
class: px-10
---

# URLLC — the other regime

<div class="grid grid-cols-2 gap-8 mt-1">

<div class="space-y-3 text-sm">

Ultra-reliable low-latency flips the trade. **Latency forbids retransmission**,
so HARQ can no longer rescue a 10% failure — the redundancy must all be spent
**up front**.

- Target BLER drops to **10⁻⁵** (CQI table 3).
- Code rate drops to **30/1024** (MCS table 3) — deep redundancy per block.

<div v-click class="fec-card border-l-4 !border-l-fec-info text-sm">
<b>Callback to Part 1 (finite-blocklength / PPV).</b> URLLC packets are
<b>short</b> (~32 bytes), and short blocks pay a rate penalty by physics — the
Polyanskiy–Poor–Verdú bound from Part 1 slide 14. URLLC cannot out-code that
tax; it pays it in SINR.
</div>

</div>

<div class="space-y-3">

Measured NR anchors @ **BLER 10⁻⁵** (Sādhanā 2023, 32-byte payloads):

<svg viewBox="0 0 360 90" class="w-full h-auto max-h-28" role="img" aria-label="URLLC MCS anchors at 1e-5 BLER">
  <line x1="30" y1="55" x2="340" y2="55" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.5" />
  <g v-for="(t, i) in [[0,30],[2,134],[4,237],[6,340]]" :key="`u${i}`">
    <line :x1="t[1]" y1="55" :x2="t[1]" y2="59" :style="{ stroke: 'var(--fec-line)' }" />
    <text :x="t[1]" y="72" text-anchor="middle" style="font-size:10px" class="fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ t[0] }}</text>
  </g>
  <text x="340" y="86" text-anchor="end" style="font-size:10px;font-style:italic" :style="{ fill: 'var(--fec-muted)' }">SINR (dB) @ 10⁻⁵</text>
  <g v-for="(m, i) in [['MCS4',3.2,'info'],['MCS7',3.192,'info'],['MCS3',5.597,'error']]" :key="`m${i}`">
    <circle :cx="30 + Number(m[1]) / 8 * 310" cy="55" r="5" :style="{ fill: `var(--fec-${m[2]})` }" />
    <text :x="30 + Number(m[1]) / 8 * 310" y="42" text-anchor="middle" style="font-size:10px;font-weight:700" :style="{ fill: `var(--fec-${m[2]})` }">{{ m[0] }}</text>
  </g>
</svg>

<div class="fec-card border-l-4 !border-l-fec-error text-xs">
Rows are <b>non-monotonic</b>: MCS3 needs <b class="fec-tnum">5.60 dB</b> while
MCS4/MCS7 sit near <b class="fec-tnum">3.2 dB</b>. Real measurement noise — kept
as published, flagged not fixed.
</div>

</div>

</div>

<SourceFoot :refs="[['URLLC low-SE thresholds @ 1e-5 (MCS3 5.597 / MCS4 3.2 / MCS7 3.192 dB): Khan &amp; Jacob, Sādhanā 48:77 (2023)', ''], ['Finite-blocklength / PPV tax: Polyanskiy, Poor &amp; Verdú (Part 1)', '']]" />

<!--
Slide 10. The other regime. Latency forbids HARQ → all redundancy up front: BLER 1e-5 (CQI
table 3), R down to 30/1024 (MCS table 3). Explicit callback to Part 1 slide 14 (PPV /
finite-blocklength), info-blue — short URLLC blocks pay the PPV rate tax in SINR. The three
Sādhanā anchors (blerData.ts urllcAnchors) plotted on a dB strip echoing the deck's chart
style; non-monotonicity (MCS3 > MCS4/7) shown in error-red and flagged, not smoothed.
-->

---
layout: default
class: px-10
---

# How close to Shannon are we?

<div class="grid grid-cols-5 gap-5 mt-1">

<div class="col-span-3">
<svg viewBox="0 0 480 260" class="w-full h-auto" role="img" aria-label="Shannon vs attenuated capacity vs MCS staircase">
  <!-- axes -->
  <line x1="50" y1="20" x2="50" y2="220" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.5" />
  <line x1="50" y1="220" x2="460" y2="220" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.5" />
  <g v-for="(t, i) in [['−10',50],['0',152],['10',255],['20',358],['30',460]]" :key="`sx${i}`">
    <line :x1="t[1]" y1="220" :x2="t[1]" y2="225" :style="{ stroke: 'var(--fec-line)' }" />
    <text :x="t[1]" y="237" text-anchor="middle" style="font-size:10px" class="fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ t[0] }}</text>
  </g>
  <g v-for="(t, i) in [['0',220],['2',180],['4',140],['6',100],['8',60],['10',20]]" :key="`sy${i}`">
    <text x="44" :y="Number(t[1]) + 4" text-anchor="end" style="font-size:10px" class="fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ t[0] }}</text>
  </g>
  <text x="460" y="253" text-anchor="end" style="font-size:11px;font-style:italic" :style="{ fill: 'var(--fec-muted)' }">SINR (dB)</text>
  <text x="50" y="14" text-anchor="start" style="font-size:11px;font-style:italic" :style="{ fill: 'var(--fec-muted)' }">bit/s/Hz</text>
  <!-- Shannon -->
  <path d="M 50,217.3 L 101.3,212.1 L 152.5,200 L 203.8,178.9 L 255,150.8 L 306.3,119.4 L 357.5,86.8 L 408.8,53.8 L 460,20.7" fill="none" :style="{ stroke: 'var(--fec-error)' }" stroke-width="2.4" />
  <text x="410" y="46" text-anchor="end" style="font-size:10px;font-weight:700" :style="{ fill: 'var(--fec-error)' }">Shannon</text>
  <!-- alpha = 0.6 curve -->
  <g v-click>
    <path d="M 50,218.4 L 101.3,215.3 L 152.5,208 L 203.8,195.3 L 255,178.5 L 306.3,159.7 L 357.5,140.1 L 408.8,120.3 L 460,100.4" fill="none" :style="{ stroke: 'var(--fec-info)' }" stroke-width="2.2" stroke-dasharray="6 4" />
    <text x="462" y="106" text-anchor="end" style="font-size:10px;font-weight:700" :style="{ fill: 'var(--fec-info)' }">α·log₂(1+SINR), α=0.6</text>
  </g>
  <!-- MCS staircase -->
  <g v-click>
    <path d="M 50,215.4 L 152.5,215.4 L 152.5,208 L 214,208 L 214,190 L 255,190 L 255,172 L 316.5,172 L 316.5,142 L 378,142 L 378,110 L 439.5,110 L 439.5,72 L 460,72" fill="none" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2" />
    <text x="330" y="132" text-anchor="start" style="font-size:10px;font-weight:700" :style="{ fill: 'var(--fec-corrected)' }">MCS staircase</text>
  </g>
</svg>
</div>

<div class="col-span-2 space-y-3 text-sm">

The system model 3GPP itself uses: throughput = **α · log₂(1 + SINR)**, an
**attenuated** Shannon curve.

<div class="fec-card text-sm fec-tnum">
α = <b>0.6</b> downlink · <b>0.4</b> uplink<br>
<span class="text-fec-muted text-xs">SINR −10 … +30 dB · TR 38.921 Table 4.2.7-1</span>
</div>

<div v-click class="fec-card text-sm">
The quantized <b>MCS staircase hugs the α-curve</b>. The gap to raw Shannon
decomposes into: implementation loss, rate quantization, the 10% BLER margin,
and what HARQ later recovers.
</div>

<div v-click class="text-xs text-fec-muted">
Fits in the literature run <b>α ≈ 0.6–0.75</b>; the 0.75 upper end (Mogensen
VTC'07) is <b>unverified here</b> — quote 0.6/0.4 as the anchored values.
</div>

</div>

</div>

<SourceFoot :refs="[['Attenuated-Shannon model, α=0.6/0.4, SINR −10…30 dB: ETSI TR 138 921 V18 Table 4.2.7-1; lineage TR 36.942 A.1', ''], ['α up to 0.75: Mogensen et al., VTC 2007 (flagged, unverified this session)', '']]" />

<!--
Slide 11. The attenuated-Shannon answer. Inline themed SVG overlays three curves: raw
Shannon (error-red), α=0.6 attenuated capacity (info, dashed), and the quantized NR MCS
staircase (corrected-green) which hugs the α-curve. Coordinates precomputed from
log₂(1+10^(dB/10)). Two reveals keep the argument staged (α-curve, then staircase + gap
decomposition). α=0.6/0.4 anchored to TR 38.921 Table 4.2.7-1; the 0.75 upper fit
(Mogensen) is LABELLED unverified per the T15 flag. TR 36.942 A.1 lineage cited but its
LTE SNIR_MIN/MAX values NOT quoted (T15 flag).
-->

---
layout: default
class: px-10
---

# The full loop

<div class="text-fec-muted text-sm mt-1 mb-1">
Everything in this part is one control loop. FEC is not a block in the chain —
it is the loop's <b>actuator</b>.
</div>

<svg viewBox="0 0 780 300" class="w-full h-auto max-h-72" role="img" aria-label="NR link-adaptation control loop">
  <defs>
    <marker id="la-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" :style="{ fill: 'var(--fec-muted)' }" />
    </marker>
    <marker id="la-arrow-fb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" :style="{ fill: 'var(--fec-corrected)' }" />
    </marker>
  </defs>

  <!-- forward chain boxes -->
  <g v-for="(b, i) in [[20,'SINR estimate','info'],[215,'CQI report','info'],[410,'MCS / code rate','info'],[605,'LDPC RM + RV','info']]" :key="`f${i}`">
    <rect :x="b[0]" y="32" width="150" height="46" rx="8" :style="{ fill: 'var(--fec-info-soft)', stroke: `var(--fec-${b[2]})` }" stroke-width="1.6" />
    <text :x="Number(b[0]) + 75" y="60" text-anchor="middle" style="font-size:13px;font-weight:600" :style="{ fill: 'var(--fec-fg)' }">{{ b[1] }}</text>
  </g>
  <!-- bottom boxes -->
  <rect x="605" y="192" width="150" height="46" rx="8" :style="{ fill: 'var(--fec-error-soft)', stroke: 'var(--fec-error)' }" stroke-width="1.6" />
  <text x="680" y="220" text-anchor="middle" style="font-size:13px;font-weight:600" :style="{ fill: 'var(--fec-fg)' }">BLER realized</text>
  <rect x="315" y="192" width="150" height="46" rx="8" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-line)' }" stroke-width="1.6" />
  <text x="390" y="220" text-anchor="middle" style="font-size:13px;font-weight:600" :style="{ fill: 'var(--fec-fg)' }">ACK / NACK</text>
  <rect x="20" y="192" width="150" height="46" rx="8" :style="{ fill: 'var(--fec-corrected-soft)', stroke: 'var(--fec-corrected)' }" stroke-width="1.6" />
  <text x="95" y="216" text-anchor="middle" style="font-size:13px;font-weight:600" :style="{ fill: 'var(--fec-fg)' }">OLLA</text>
  <text x="95" y="230" text-anchor="middle" style="font-size:10px" :style="{ fill: 'var(--fec-muted)' }">θ offset</text>

  <!-- forward arrows -->
  <line x1="170" y1="55" x2="213" y2="55" :style="{ stroke: 'var(--fec-muted)' }" stroke-width="1.8" marker-end="url(#la-arrow)" />
  <line x1="365" y1="55" x2="408" y2="55" :style="{ stroke: 'var(--fec-muted)' }" stroke-width="1.8" marker-end="url(#la-arrow)" />
  <line x1="560" y1="55" x2="603" y2="55" :style="{ stroke: 'var(--fec-muted)' }" stroke-width="1.8" marker-end="url(#la-arrow)" />
  <line x1="680" y1="78" x2="680" y2="190" :style="{ stroke: 'var(--fec-muted)' }" stroke-width="1.8" marker-end="url(#la-arrow)" />
  <line x1="605" y1="215" x2="467" y2="215" :style="{ stroke: 'var(--fec-muted)' }" stroke-width="1.8" marker-end="url(#la-arrow)" />
  <line x1="315" y1="215" x2="172" y2="215" :style="{ stroke: 'var(--fec-muted)' }" stroke-width="1.8" marker-end="url(#la-arrow)" />

  <!-- feedback: OLLA θ offset back into MCS selection (the loop closes) -->
  <g v-click>
    <path d="M 95,190 L 95,120 L 485,120 L 485,80" fill="none" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#la-arrow-fb)" />
    <text x="300" y="113" text-anchor="middle" style="font-size:11px;font-weight:700" :style="{ fill: 'var(--fec-corrected)' }">outer-loop offset closes the loop</text>
  </g>
</svg>

<SourceFoot :refs="[['Link-adaptation loop (SINR→CQI→MCS→LDPC→ACK/NACK→OLLA): 3GPP TS 38.214; Blanquez-Casado et al., EURASIP JWCN 2016', '']]" />

<!--
Slide 12. The synthesis diagram — a single themed inline SVG (NOT mermaid, per house style)
of the closed control loop: SINR estimate → CQI → MCS/code rate → LDPC RM+RV → (down) BLER
realized → ACK/NACK → OLLA → (up, revealed on click) back into MCS selection. Forward boxes
info-blue, BLER error-red, OLLA corrected-green. One v-click reveals the feedback path so the
"it's a loop" beat lands last. Tagline: FEC is the control system's actuator. Arrowheads via
shared <marker> defs, all colours var(--fec-*).
-->

---
layout: default
class: px-10
---

# Part 6 — redundancy, quantified

<div class="grid grid-cols-2 gap-8 mt-2">

<div class="space-y-3">

What the numbers said:

- **The rate dial spans R = 0.03 → 0.93** — SE 0.0586 → 7.4063 — giving
  **~29 dB** of SINR operating range across CQI 1–15.
- **Waterfalls are near-vertical:** ~2 decades of BLER in ~0.3 dB, which is why
  1-dB MCS steps track the channel.
- **HARQ turns a 10% failure into throughput,** and OLLA (Δup = 9·Δdown) holds
  the link right at that optimum.

<div v-click class="fec-card border-l-4 !border-l-fec-corrected text-sm">
Real NR runs at <b>α ≈ 0.6–0.75</b> of Shannon capacity — close, by design, once
the 10% BLER margin and HARQ recovery are accounted for.
</div>

</div>

<div class="flex flex-col justify-center gap-4">

<BigNumber value="α ≈ 0.6–0.75" label="Fraction of Shannon capacity practical NR link adaptation realizes" color="corrected" source="TR 38.921 Table 4.2.7-1 (α=0.6/0.4); upper 0.75 flagged" />

<!--
DbGauge here recaps the deck-wide "distance from Shannon" motif rather than planting a new
code-family flag: Part 6 is a systems part, and α (a rate FRACTION) does not map to a single
honest Eb/N0 offset — so the gauge shows the running reference scale and the α headline is
carried by the BigNumber above. Flags intentionally empty.
-->
<DbGauge caption="The reference scale this deck has been chasing — redundancy is how every code family moved left along it." />

</div>

</div>

<SourceFoot :refs="[['Rate span / SE / ~29 dB CQI span: TS 38.214 + IOSR-JECE LTE CQI table', ''], ['α ≈ 0.6–0.75 of capacity: ETSI TR 138 921 Table 4.2.7-1 (0.6/0.4); Mogensen VTC 2007 (0.75, flagged)', '']]" />

<!--
Slide 13. Recap + gauge. Three bullets recap the part's quantified spine: rate dial
0.03–0.93 ⇒ ~29 dB span; waterfalls ~2 decades / 0.3 dB; HARQ + OLLA (Δup=9Δdown) hold the
10% optimum. Reveal: α ≈ 0.6–0.75 of capacity (corrected-green). BigNumber carries the α
headline; DbGauge recaps the running Eb/N0 motif with default reference points and empty
flags (rationale in the code comment — α is a fraction, not a dB flag). Hands off to Part 7.
-->
