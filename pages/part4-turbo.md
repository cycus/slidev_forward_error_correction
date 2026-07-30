---
layout: default
---

<SectionCover
  :part="4"
  year="1993"
  title="Turbo — the 1993 revolution"
  thesis="Two gossiping decoders exchanging extrinsic beliefs."
>
<div class="mt-5 text-fec-muted">
Geneva, <b class="text-fec-fg">May 1993</b> · two outsiders break coding theory.
</div>
</SectionCover>

<!--
Part 4 opener. The arc: the ICC'93 shock (a claimed 0.7 dB nobody believed) →
architecture (parallel RSC + interleaver) → why recursion is the whole trick →
the LTE encoder an engineer actually ships → the gossip-loop decoder and the
precise meaning of "extrinsic" → BCJR / Log-MAP practicalities → EXIT-chart
intuition → why 5G still dropped turbo → its enormous living legacy. Two
interactive components (RscEncoderStepper, TurboIterationDemo) are embedded here.
Frame: this is the code in every 4G phone.
-->

---
layout: default
class: px-10
---

# The claim nobody believed

<div class="grid grid-cols-2 gap-8 mt-3">

<div class="space-y-3">

At **ICC'93** in Geneva, **Berrou, Glavieux & Thitimajshima** reported **BER 10⁻⁵
at 0.7 dB** — rate ½, a 65 536-bit interleaver, 18 decoding iterations. The best
codes of the day sat roughly **3.5 dB** further from the limit.

<div v-click>

The result was "so preposterous many experts didn't bother reading the paper."
Berrou himself: *"Every day I asked myself about the possible errors in the
program."*

</div>

<div v-click class="fec-card border-l-4 !border-l-fec-info">
They were <b>electronics professors</b> at ENST Bretagne — <b>not</b> coding
theorists. The outsiders' iterative feedback trick was invisible to the people
who "knew" it couldn't work.
</div>

</div>

<div class="flex flex-col gap-4 justify-center">

<BigNumber value="0.7 dB" label="Eb/N0 for BER 10⁻⁵ — rate ½, N=65536, 18 iterations" source="Proc. ICC'93, pp. 1064–1070" color="parity" />

<TriviaCard title="Why 'turbo'?">
Berrou picked the name watching a <b>car race</b> — the decoder feeds its output
belief back like a <b>turbocharger's exhaust</b>. Hagenauer's standing joke: it's
a misnomer, because the <em>encoder</em> has no feedback at all.
<template #icon><div class="i-carbon-car" /></template>
<template #source>IEEE Spectrum, "Turbo Codes Explained".</template>
</TriviaCard>

</div>

</div>

<SourceFoot :refs="[['Berrou, Glavieux &amp; Thitimajshima, Proc. ICC\'93, pp. 1064–1070', ''], ['Skepticism &amp; quotes: IEEE Spectrum, \'Turbo Codes Explained\'', '']]" />

<!--
Slide 2. The origin shock. Anchor number is 0.7 dB (BigNumber, parity color =
turbo's flag colour on the running gauge). The two reveals build the "outsiders"
thesis: the disbelief quote, then the fact that they were electronics — not
coding — people. Exactly ONE TriviaCard (the name). Keep the 3.5 dB gap loose
("roughly") — it's a triangulated secondary figure, flag for T15.
-->

---
layout: default
class: px-10
---

# Architecture — two encoders, one interleaver

<div class="text-fec-muted mt-1 mb-2">
Same bits, encoded twice in <b>different orders</b>. Systematic stream plus two parity streams ⇒ a mother code of rate <b>1/3</b>.
</div>

<div class="grid grid-cols-3 gap-4 items-center">

<div class="col-span-2">
<svg viewBox="0 0 470 240" class="w-full h-auto" role="img" aria-label="Parallel concatenated turbo encoder">
  <!-- input + branch bus -->
  <text x="18" y="128" text-anchor="middle" style="font-size:13px;font-weight:700" :style="{ fill: 'var(--fec-fg)' }">uₖ</text>
  <line x1="30" y1="123" x2="55" y2="123" :style="{ stroke: 'var(--fec-fg)' }" stroke-width="2" />
  <line x1="55" y1="45" x2="55" y2="200" :style="{ stroke: 'var(--fec-fg)' }" stroke-width="2" />

  <!-- systematic row (info) -->
  <g v-click>
    <line x1="55" y1="45" x2="440" y2="45" :style="{ stroke: 'var(--fec-info)' }" stroke-width="2.4" />
    <text x="452" y="49" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-info)' }">xₖˢ</text>
    <text x="240" y="36" text-anchor="middle" style="font-size:11px" :style="{ fill: 'var(--fec-info)' }">systematic (sent as-is)</text>
  </g>

  <!-- RSC1 row (parity) -->
  <g v-click>
    <line x1="55" y1="123" x2="150" y2="123" :style="{ stroke: 'var(--fec-line)' }" stroke-width="2" />
    <rect x="150" y="103" width="96" height="40" rx="5" :style="{ fill: 'var(--fec-parity-soft)', stroke: 'var(--fec-parity)' }" stroke-width="2" />
    <text x="198" y="127" text-anchor="middle" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-parity)' }">RSC 1</text>
    <line x1="246" y1="123" x2="440" y2="123" :style="{ stroke: 'var(--fec-parity)' }" stroke-width="2.4" />
    <text x="452" y="127" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-parity)' }">xₖ¹ᵖ</text>
  </g>

  <!-- interleaver + RSC2 row (parity) -->
  <g v-click>
    <line x1="55" y1="200" x2="98" y2="200" :style="{ stroke: 'var(--fec-line)' }" stroke-width="2" />
    <rect x="98" y="180" width="52" height="40" rx="5" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-fg)' }" stroke-width="1.6" />
    <text x="124" y="204" text-anchor="middle" style="font-size:15px;font-weight:700" :style="{ fill: 'var(--fec-fg)' }">Π</text>
    <line x1="150" y1="200" x2="188" y2="200" :style="{ stroke: 'var(--fec-line)' }" stroke-width="2" />
    <rect x="188" y="180" width="96" height="40" rx="5" :style="{ fill: 'var(--fec-parity-soft)', stroke: 'var(--fec-parity)' }" stroke-width="2" />
    <text x="236" y="204" text-anchor="middle" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-parity)' }">RSC 2</text>
    <line x1="284" y1="200" x2="440" y2="200" :style="{ stroke: 'var(--fec-parity)' }" stroke-width="2.4" />
    <text x="452" y="204" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-parity)' }">xₖ²ᵖ</text>
  </g>
</svg>
</div>

<div class="space-y-3">
<div v-click class="fec-card">
The interleaver <b>Π</b> is the magic: encoder 2 sees the <em>same</em> bits in a
scrambled order, so a pattern that is bad for one is almost never bad for both.
</div>
<div v-click>
$$ \Rcode = \frac{k}{n} = \frac{1}{3} $$
<div class="text-sm text-fec-muted text-center">one info bit ⇒ three transmitted bits</div>
</div>
</div>

</div>

<SourceFoot :refs="[['PCCC structure: Berrou &amp; Glavieux, IEEE Trans. Commun. 44(10), 1996', ''], ['3GPP turbo (rate 1/3): ETSI TS 136 212 §5.1.3.2', '']]" />

<!--
Slide 3. The block diagram, built up in three reveals (systematic → RSC1/parity1
→ interleaver+RSC2/parity2) then two argument cards (interleaver = the magic;
rate 1/3). Colour discipline is load-bearing: systematic stream is info-blue, the
two parity streams are parity-amber, exactly as the semantic table demands. The
interleaver claim (bad-for-both is improbable) is the setup for slide 4.
-->

---
layout: default
class: px-10
---

# Why RECURSIVE matters

<div class="grid grid-cols-2 gap-8 mt-2">

<div class="space-y-3">

Replace the RSC with a plain (non-recursive) convolutional encoder and turbo
collapses. A **weight-1 input** (a single 1) produces a **low-weight codeword**
for *any* interleaver — the same bad event hits both encoders. Low-weight
codewords are exactly what wreck BER.

<div v-click>

**Recursive = IIR.** With feedback, a single 1 makes the register **ring
forever**; only **weight-2 (and higher)** inputs ever drive it back to zero.

</div>

<div v-click class="fec-card border-l-4 !border-l-fec-corrected">
So a low-weight event must be a rare pattern that is bad <em>after</em> Π too. The
interleaver makes that doubly-bad coincidence scale like <b>~1/N</b> —
Divsalar &amp; Pollara's <b>interleaver gain</b>.
</div>

</div>

<div>
<RscEncoderStepper mode="recursion" height="17rem" />
</div>

</div>

<SourceFoot :refs="[['Interleaver gain ~1/N: Divsalar &amp; Pollara, JPL TDA PR 42-121/42-123', ''], ['Weight-1 argument: Benedetto &amp; Montorsi, IEEE Trans. IT 42(2), 1996', '']]" />

<!--
Slide 4. The single most important idea in Part 4: recursion, not concatenation,
is what buys the coding gain. Argument in two reveals — IIR rings forever, so
only weight-2+ terminates → the doubly-bad coincidence is ~1/N (interleaver
gain). The interactive runs the "feed a lone 1, watch parity never die" demo.
Corrected-green card = the payoff line.
-->

---
layout: default
class: px-10
---

# The LTE encoder, step by step

<div class="grid grid-cols-2 gap-6 mt-1">

<div class="space-y-2">

LTE's constituent RSC (8-state, 3GPP TS 36.212):

$$ g_0(D) = 1 + D^2 + D^3 \;(13_8), \quad g_1(D) = 1 + D + D^3 \;(15_8) $$
$$ G(D) = \Big[\, 1,\; \tfrac{g_1(D)}{g_0(D)} \,\Big] $$

Feed input **1, 1, 0, 1**. Watch the 3-bit state and the parity bit:

<table class="fec-tnum text-sm mt-1" style="border-collapse:collapse">
<thead><tr class="text-fec-muted">
<th class="px-2 text-left">k</th><th class="px-2">uₖ</th><th class="px-2">state</th><th class="px-2">→ next</th><th class="px-2">pₖ</th>
</tr></thead>
<tbody>
<tr><td class="px-2">1</td><td class="px-2 text-center">1</td><td class="px-2 text-center">000</td><td class="px-2 text-center">100</td><td class="px-2 text-center text-fec-parity font-bold">1</td></tr>
<tr><td class="px-2">2</td><td class="px-2 text-center">1</td><td class="px-2 text-center">100</td><td class="px-2 text-center">110</td><td class="px-2 text-center text-fec-parity font-bold">0</td></tr>
<tr><td class="px-2">3</td><td class="px-2 text-center">0</td><td class="px-2 text-center">110</td><td class="px-2 text-center">111</td><td class="px-2 text-center text-fec-parity font-bold">0</td></tr>
<tr><td class="px-2">4</td><td class="px-2 text-center">1</td><td class="px-2 text-center">111</td><td class="px-2 text-center">111</td><td class="px-2 text-center text-fec-parity font-bold">1</td></tr>
</tbody>
</table>

<div v-click class="text-sm text-fec-muted mt-1">
Then <b>trellis termination</b>: 3 tail inputs taken <em>from the feedback</em>
drive the state back to <b>000</b>. Across both encoders that is <b>12 tail bits</b>
(<b>4 per stream</b>), so each output stream has length <b>D = K + 4</b>.
</div>

</div>

<div>
<RscEncoderStepper mode="lte" height="18rem" />
</div>

</div>

<SourceFoot :refs="[['Polynomials, tail bits, D=K+4: ETSI TS 136 212 §5.1.3.2', ''], ['Reference trace derived — flag T15', '']]" />

<!--
Slide 5. The primary interactive slide. The reference trace (000→100→110→111→111,
parity 1,0,0,1) is printed as a fec-tnum table beside the stepper so the
stepper is anchored to a hand-derived ground-truth trace. Parity column is
parity-amber. The reveal is the termination beat: 12 tail bits, 4/stream, D=K+4 —
the three numbers an engineer needs. Trace is hand-derived; flag for fact-check.
-->

---
layout: default
class: px-10
---

# LTE specifics an engineer actually ships

<div class="grid grid-cols-2 gap-6 mt-2">

<div class="space-y-3">

**188 block sizes**, K = 40 … 6144 (TS 36.212). Larger transport blocks are
**segmented**, each carrying its own **CRC24B**.

<div v-click>

The interleaver is a **QPP** (quadratic permutation polynomial):

$$ \Pi(i) = \big(f_1\, i + f_2\, i^2\big) \bmod K $$

<div class="text-sm text-fec-muted">
K=40: f₁=3, f₂=10 · K=6144: f₁=263, f₂=480 (from the standard's table)
</div>

</div>

</div>

<div class="space-y-3">

<div v-click class="fec-card">
QPP is <b>contention-free</b>: any decomposition into windows accesses distinct
memory banks, so you can run <b>8–32 MAP cores in parallel</b> with no memory
conflicts.
</div>

<div v-click class="fec-card">
Rate matching after encoding: <b>sub-block interleaver</b> → <b>circular
buffer</b> → puncture/repeat to the granted rate, with redundancy versions
<b>RV0–RV3</b> as HARQ retransmission start points.
</div>

</div>

</div>

<SourceFoot :refs="[['QPP, 188 sizes, CRC24B, rate matching: ETSI TS 136 212 Table 5.1.3-3', ''], ['Contention-free QPP: Takeshita, IEEE Trans. IT 52(3), 2006', '']]" />

<!--
Slide 6. The "map it onto your stack" slide. Four concrete facts an L1 engineer
meets in the spec: 188 sizes + segmentation + CRC24B, the QPP formula with its
two endpoint coefficient pairs, the contention-free → parallel-cores payoff, and
the circular-buffer/RV rate-matching chain. QPP formula uses KaTeX. All numbers
are TS 36.212; the contention-free property is Takeshita's result.
-->

---
layout: default
class: px-10
---

# Decoding — the gossip loop

<div class="grid grid-cols-3 gap-4 items-center mt-2">

<div class="col-span-2">
<svg viewBox="0 0 470 210" class="w-full h-auto" role="img" aria-label="Iterative turbo decoder loop">
  <!-- channel inputs -->
  <text x="14" y="70" style="font-size:11px" :style="{ fill: 'var(--fec-info)' }">y ˢ, y¹ᵖ</text>
  <text x="14" y="168" style="font-size:11px" :style="{ fill: 'var(--fec-parity)' }">y²ᵖ</text>
  <line x1="60" y1="72" x2="95" y2="72" :style="{ stroke: 'var(--fec-line)' }" stroke-width="2" />
  <line x1="60" y1="150" x2="315" y2="150" :style="{ stroke: 'var(--fec-line)' }" stroke-width="2" />
  <line x1="315" y1="150" x2="315" y2="128" :style="{ stroke: 'var(--fec-line)' }" stroke-width="2" />

  <!-- DEC1 -->
  <rect x="95" y="48" width="96" height="48" rx="6" :style="{ fill: 'var(--fec-info-soft)', stroke: 'var(--fec-info)' }" stroke-width="2" />
  <text x="143" y="70" text-anchor="middle" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-info)' }">SISO 1</text>
  <text x="143" y="86" text-anchor="middle" style="font-size:10px" :style="{ fill: 'var(--fec-info)' }">(BCJR)</text>

  <!-- DEC2 -->
  <rect x="315" y="80" width="96" height="48" rx="6" :style="{ fill: 'var(--fec-parity-soft)', stroke: 'var(--fec-parity)' }" stroke-width="2" />
  <text x="363" y="102" text-anchor="middle" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-parity)' }">SISO 2</text>
  <text x="363" y="118" text-anchor="middle" style="font-size:10px" :style="{ fill: 'var(--fec-parity)' }">(BCJR)</text>

  <!-- forward: DEC1 -> Pi -> DEC2 -->
  <g v-click>
    <line x1="191" y1="72" x2="232" y2="72" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2.6" />
    <rect x="232" y="52" width="46" height="40" rx="5" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-corrected)' }" stroke-width="1.8" />
    <text x="255" y="77" text-anchor="middle" style="font-size:14px;font-weight:700" :style="{ fill: 'var(--fec-corrected)' }">Π</text>
    <line x1="278" y1="72" x2="345" y2="72" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2.6" />
    <line x1="345" y1="72" x2="345" y2="80" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2.6" />
    <polygon points="341,78 349,78 345,86" :style="{ fill: 'var(--fec-corrected)' }" />
    <text x="255" y="42" text-anchor="middle" style="font-size:10px" :style="{ fill: 'var(--fec-corrected)' }">extrinsic Lₑ</text>
  </g>

  <!-- feedback: DEC2 -> Pi^-1 -> DEC1 -->
  <g v-click>
    <line x1="315" y1="104" x2="185" y2="104" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2.6" stroke-dasharray="6 4" />
    <rect x="150" y="150" width="52" height="40" rx="5" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-corrected)' }" stroke-width="1.8" />
    <text x="176" y="175" text-anchor="middle" style="font-size:13px;font-weight:700" :style="{ fill: 'var(--fec-corrected)' }">Π⁻¹</text>
    <line x1="185" y1="104" x2="185" y2="150" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2.6" stroke-dasharray="6 4" />
    <line x1="150" y1="170" x2="120" y2="170" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2.6" stroke-dasharray="6 4" />
    <line x1="120" y1="170" x2="120" y2="96" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2.6" stroke-dasharray="6 4" />
    <polygon points="116,100 124,100 120,92" :style="{ fill: 'var(--fec-corrected)' }" />
    <text x="250" y="120" text-anchor="middle" style="font-size:10px" :style="{ fill: 'var(--fec-corrected)' }">deinterleaved feedback</text>
  </g>
</svg>
</div>

<div class="space-y-3">
<div v-click class="fec-card">
Each decoder is <b>soft-in, soft-out</b>: it takes LLRs and emits LLRs.
</div>
<div v-click class="fec-card border-l-4 !border-l-fec-corrected">
The rule of the game: each decoder tells the other <b>only what it <em>learned</em></b>
— never what it was already told. That distilled belief is the <b>extrinsic</b>.
</div>
</div>

</div>

<SourceFoot :refs="[['Iterative turbo decoding: Berrou &amp; Glavieux, IEEE Trans. Commun. 44(10), 1996', ''], ['SISO / BCJR: Bahl, Cocke, Jelinek &amp; Raviv, IEEE Trans. IT 20(2), 1974', '']]" />

<!--
Slide 7. The decoder as two gossips passing notes through the interleaver. Built
in two reveals: forward pass (SISO1 → Π → SISO2, solid) then the deinterleaved
feedback (SISO2 → Π⁻¹ → SISO1, dashed). Extrinsic messages are corrected-green —
the same colour used for Lₑ on slides 8 and 9, so the audience tracks "the thing
that flows around the loop." The learned-not-told line sets up slide 8.
-->

---
layout: default
class: px-10
---

# Extrinsic information, precisely

<div class="grid grid-cols-2 gap-8 mt-3">

<div class="space-y-4">

A SISO decoder's output LLR decomposes into three additive pieces:

<div class="text-lg">

$$ L_{\text{APP}} = \color{gray} L_c\, y^s \color{black} + L_a + L_e $$

</div>

The extrinsic is what remains after you **subtract off** what the decoder was
*given*:

<div class="fec-card">

$$ L_e = L_{\text{APP}} - L_c\, y^s - L_a $$

</div>

<div class="flex flex-wrap gap-3 text-sm mt-1">
<span class="text-fec-info font-semibold">$L_c\, y^s$ — channel / systematic</span>
<span class="text-fec-muted font-semibold">$L_a$ — a priori (from the other decoder)</span>
<span class="text-fec-corrected font-semibold">$L_e$ — extrinsic (passed on)</span>
</div>

</div>

<div class="flex items-center">
<div v-click class="fec-card border-l-4 !border-l-fec-error">
<div class="text-fec-error font-semibold mb-1">Why subtract?</div>
If a decoder fed back its <b>own</b> prior beliefs, that's <b>positive
feedback</b> — a self-confirming loop that grows overconfident and stops
correcting. Passing <em>only</em> the extrinsic keeps the two decoders'
information (approximately) independent.
</div>
</div>

</div>

<SourceFoot :refs="[['Decomposition (Sklar form): Sklar, \'Fundamentals of Turbo Codes\'', ''], ['Extrinsic principle: Hagenauer, Offer &amp; Papke, IEEE Trans. IT 42(2), 1996', '']]" />

<!--
Slide 8. The definition that makes turbo work. Color code is BINDING and must
match slide 9's demo: channel/systematic term = info-blue, a-priori L_a = muted,
extrinsic L_e = corrected-green. (The master equation greys the channel term via
KaTeX \color{gray} just to foreground the L_a + L_e split; the term legend below
carries the semantic colours.) The error-red card is the punchline: feeding back
your own belief = positive feedback = overconfidence (Hagenauer-Offer-Papke).
-->

---
layout: default
class: px-10
---

# Watch belief flow — a 2×2 toy code

<div class="grid grid-cols-3 gap-4 mt-1">

<div class="col-span-2">
<TurboIterationDemo height="19rem" />
</div>

<div class="space-y-3 text-sm">

<div class="fec-card">
Start: only <b>d1</b> is confident (LLR 1.5). d2, d3, d4 are near-zero — a coin
flip each.
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-corrected">
Confidence <b>flows through the parities</b>. A strong bit, seen across a parity
check, lends its certainty to a weak neighbour — that borrowed certainty is the
extrinsic.
</div>

</div>

</div>

<div v-click class="mt-3 text-center text-fec-muted text-sm">
Now scale this 4-bit game to <b>6144 bits × 8 iterations</b> through a QPP interleaver — that's <b>LTE</b>.
</div>

<SourceFoot :refs="[['Worked 2×2 example: Sklar, \'Fundamentals of Turbo Codes\'', ''], ['Product-code turbo: Pyndiah, IEEE Trans. Commun. 46(8), 1998', '']]" />

<!--
Slide 9. Second interactive slide (TurboIterationDemo). The
note fully specifies the demo: Sklar's numbers, which
bits get rescued when, and the colour contract (Lₑ green / Lₐ muted / channel
blue) that ties back to slide 8. The two cards narrate before-and-after; the
final reveal is the punchline caption scaling the toy up to a real LTE block.
-->

---
layout: default
class: px-10
---

# BCJR at block level

<div class="grid grid-cols-2 gap-8 mt-2">

<div class="space-y-3">

Each SISO is a **BCJR** (MAP) decoder running on the code's trellis. It needs
three metrics per section:

- **γ** — branch metric (how well a transition fits the received symbol)
- **α** — forward recursion, swept **left → right**
- **β** — backward recursion, swept **right → left**

<div v-click>

The per-bit posterior combines all three: **MAP gives the best decision for each
bit**, where Viterbi gives the best decision for the whole **sequence**.

</div>

<div v-click class="fec-card border-l-4 !border-l-fec-error">
The catch: α and β are <b>serial recursions</b> — each step waits for the last.
That data dependency is turbo's throughput bottleneck (return to it on the "why
5G dropped turbo" slide).
</div>

</div>

<div class="flex flex-col items-center justify-center">
<svg viewBox="0 0 300 190" class="w-full h-auto max-h-52" role="img" aria-label="Trellis section with alpha, beta, gamma">
  <!-- two columns of 3 states -->
  <g>
    <template v-for="(y, i) in [40,95,150]" :key="`l${i}`">
      <circle cx="70" :cy="y" r="9" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-fg)' }" stroke-width="1.6" />
    </template>
    <template v-for="(y, i) in [40,95,150]" :key="`r${i}`">
      <circle cx="230" :cy="y" r="9" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-fg)' }" stroke-width="1.6" />
    </template>
  </g>
  <!-- branches (gamma) -->
  <g :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.6">
    <line x1="79" y1="40" x2="221" y2="40" /><line x1="79" y1="40" x2="221" y2="95" />
    <line x1="79" y1="95" x2="221" y2="95" /><line x1="79" y1="95" x2="221" y2="150" />
    <line x1="79" y1="150" x2="221" y2="150" />
  </g>
  <text x="150" y="30" text-anchor="middle" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-fg)' }">γ</text>
  <!-- alpha arrow -->
  <line x1="30" y1="95" x2="60" y2="95" :style="{ stroke: 'var(--fec-info)' }" stroke-width="2.4" />
  <polygon points="60,90 68,95 60,100" :style="{ fill: 'var(--fec-info)' }" />
  <text x="40" y="85" text-anchor="middle" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-info)' }">α →</text>
  <!-- beta arrow -->
  <line x1="270" y1="150" x2="240" y2="150" :style="{ stroke: 'var(--fec-parity)' }" stroke-width="2.4" />
  <polygon points="240,145 232,150 240,155" :style="{ fill: 'var(--fec-parity)' }" />
  <text x="258" y="140" text-anchor="middle" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-parity)' }">← β</text>
  <text x="70" y="180" text-anchor="middle" style="font-size:10px" :style="{ fill: 'var(--fec-muted)' }">step k</text>
  <text x="230" y="180" text-anchor="middle" style="font-size:10px" :style="{ fill: 'var(--fec-muted)' }">step k+1</text>
</svg>
</div>

</div>

<SourceFoot :refs="[['BCJR / MAP: Bahl, Cocke, Jelinek &amp; Raviv, IEEE Trans. IT 20(2), 1974', ''], ['MAP vs Viterbi (per-bit vs per-sequence)', '']]" />

<!--
Slide 10. Engineer's depth on BCJR: no derivation, just the data flow (γ branch,
α forward, β backward) and the one conceptual contrast that matters — MAP is
per-bit, Viterbi per-sequence. The trellis SVG shows α sweeping right and β
sweeping left across one section. The error-red card plants the serial-recursion
bottleneck seed that pays off on slide 13.
-->

---
layout: default
class: px-10
---

# Log-MAP vs Max-Log-MAP

<div class="grid grid-cols-2 gap-8 mt-2">

<div class="space-y-3">

In the log domain the recursions need a "soft max":

$$ \max{}^*(x,y) = \max(x,y) + \ln\!\big(1 + e^{-|x-y|}\big) $$

<div v-click>

Drop the correction term (**Max-Log-MAP**) and the math becomes just `max()` —
cheap, but it costs about **0.3–0.4 dB**.

</div>

<div v-click>

**Extrinsic scaling** claws most of it back: multiply the extrinsic by **~0.7**
(**0.6875** as a hardware-friendly value) to curb Max-Log's overconfidence.

</div>

</div>

<div class="space-y-3">

<div v-click class="fec-card">
<div class="text-fec-info font-semibold">Iterations in practice</div>
<div class="text-sm mt-1">Not 18 — real modems run <b>4–8</b>. A production LTE ASIC is rated at an
average of <b>5.5</b>.</div>
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-corrected">
<div class="text-fec-corrected font-semibold">CRC24B = free early stop</div>
<div class="text-sm mt-1">The segment CRC already present (slide 6) doubles as a convergence test: once it
checks, stop iterating. No extra hardware.</div>
</div>

</div>

</div>

<SourceFoot :refs="[['max* / Log-MAP: Robertson, Villebrun &amp; Hoeher, ICC\'95', ''], ['Max-Log penalty &amp; ~0.7 scaling: Valenti &amp; Sun; Studer et al., IEEE JSSC 2011', '']]" />

<!--
Slide 11. The practical decoder knobs. max* in KaTeX, then two reveals: the
Max-Log penalty (~0.3–0.4 dB) and the ~0.7 / 0.6875 extrinsic-scaling fix. Right
column: two cards — real iteration counts (4–8, ASIC 5.5) and CRC24B as a free
early-stop (callback to slide 6). 0.6875 is the hardware value from Studer et al.
-->

---
layout: default
class: px-10
---

# EXIT charts — does the tunnel stay open?

<div class="grid grid-cols-3 gap-4 items-center mt-1">

<div class="col-span-2">
<svg viewBox="0 0 340 300" class="w-full h-auto max-h-64" role="img" aria-label="EXIT chart with staircase trajectory">
  <!-- axes -->
  <line x1="60" y1="280" x2="320" y2="280" :style="{ stroke: 'var(--fec-fg)' }" stroke-width="1.6" />
  <line x1="60" y1="280" x2="60" y2="20" :style="{ stroke: 'var(--fec-fg)' }" stroke-width="1.6" />
  <text x="190" y="298" text-anchor="middle" style="font-size:12px" :style="{ fill: 'var(--fec-fg)' }">I_A  (0 → 1)</text>
  <text x="18" y="150" text-anchor="middle" style="font-size:12px" :style="{ fill: 'var(--fec-fg)' }" transform="rotate(-90 18 150)">I_E  (0 → 1)</text>
  <text x="56" y="292" text-anchor="end" style="font-size:9px" :style="{ fill: 'var(--fec-muted)' }">0</text>
  <text x="320" y="292" text-anchor="middle" style="font-size:9px" :style="{ fill: 'var(--fec-muted)' }">1</text>
  <text x="52" y="24" text-anchor="end" style="font-size:9px" :style="{ fill: 'var(--fec-muted)' }">1</text>

  <!-- decoder A transfer curve (info) -->
  <path d="M60,202 C110,150 180,120 320,72" fill="none" :style="{ stroke: 'var(--fec-info)' }" stroke-width="2.4" />
  <text x="300" y="64" text-anchor="middle" style="font-size:10px;font-weight:700" :style="{ fill: 'var(--fec-info)' }">DEC 1</text>
  <!-- decoder B transfer curve, mirrored (parity) -->
  <path d="M138,280 C190,230 220,160 268,20" fill="none" :style="{ stroke: 'var(--fec-parity)' }" stroke-width="2.4" />
  <text x="250" y="40" text-anchor="start" style="font-size:10px;font-weight:700" :style="{ fill: 'var(--fec-parity)' }">DEC 2 (mirror)</text>

  <!-- staircase trajectory in the tunnel, click-stepped -->
  <g :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2.6" fill="none">
    <polyline v-click points="73,280 73,205 112,205" />
    <polyline v-click points="112,205 112,168 168,168" />
    <polyline v-click points="168,168 168,135 220,135" />
    <polyline v-click points="220,135 220,100 268,100" />
    <polyline v-click points="268,100 268,72 300,72" />
  </g>
</svg>
</div>

<div class="space-y-3 text-sm">

**ten Brink, 2001.** Plot each decoder's **extrinsic** output info $I_E$ against
its **a priori** input info $I_A$. Mirror the second decoder's curve.

<div class="fec-card border-l-4 !border-l-fec-corrected">
Decoding is a <b>staircase in the tunnel</b> between the two curves. Each click =
one half-iteration climbing toward $(1,1)$ = the code converges.
</div>

<div class="text-fec-muted">
If the curves <b>touch</b>, the tunnel closes and iteration <b>stalls</b>. For a
rate-½ PCCC the tunnel opens at ≈ <b>0.5 dB</b>.
</div>

</div>

</div>

<SourceFoot :refs="[['EXIT charts: S. ten Brink, IEEE Trans. Commun. 49(10):1727–1737, 2001', '']]" />

<!--
Slide 12. The convergence-prediction tool. One annotated SVG: axes I_A (x) and
I_E (y) both on [0,1], DEC1 curve info-blue, mirrored DEC2 curve parity-amber,
and a corrected-green staircase revealed over 5 clicks (vertical then horizontal
each step) climbing the tunnel toward (1,1). The narrative: tunnel open → climb →
converge; tunnel closes → stall; opens at ≈0.5 dB for rate-1/2 PCCC.
-->

---
layout: default
class: px-10
---

# Why 5G dropped turbo

<div class="grid grid-cols-2 gap-6 mt-2">

<div class="space-y-3">

Three engineering strikes against turbo at 5G scale:

- **Serial α/β recursion** vs LDPC's embarrassingly parallel checks — the best
  turbo silicon of the decision era topped out near **2.15 Gb/s** against 5G's
  **20 Gb/s** target.
- An **error floor** at high code rates (BLER ~10⁻⁴–10⁻⁵ territory).
- **Complexity/bit** up to **~4300 ops** vs LDPC's **~600–840** — numbers
  conceded even in a *pro-turbo* white paper.

<div v-click class="fec-card text-sm">
The <b>2016 coding wars</b>, <em>as reported in the press</em>: an LDPC camp
(Qualcomm / Samsung / Nokia) vs a turbo camp (Ericsson / Orange / AccelerComm) vs
a polar camp (Huawei+). Resolved across <b>RAN1 #86bis / #87</b>: LDPC for data,
polar for control.
</div>

</div>

<div class="flex items-center">
<TriviaCard title="Defending an expired patent">
Orange reportedly backed turbo partly as a <b>patent holder</b> — but the original
turbo patent (filed <b>April 1991</b>) had <b>already expired in 2013</b>, three
years before the fight.
<template #icon><div class="i-carbon-scales" /></template>
<template #source>Camps as reported: Computerworld (press). Patent term: 20 yr from 1991 filing.</template>
</TriviaCard>
</div>

</div>

<SourceFoot :refs="[['Throughput / ops / floor: Maunder, \'5G Channel Code Contenders\' white paper', ''], ['RAN1 timeline: Southampton COMST survey', ''], ['Coding-war camps (reported): Computerworld', '']]" />

<!--
Slide 13. The counter-verdict. Three strikes (serial recursion → ~2.15 Gb/s vs
20 Gb/s; high-rate floor, hedged to a BLER range; ~4300 vs 600–840 ops, sourced
to a PRO-turbo paper so it's an honest concession). The coding-wars paragraph is
explicitly HEDGED ("as reported in the press") and press-cited. Exactly ONE
TriviaCard: Orange's expired-patent irony (filed 1991, expired 2013). The
2.15 Gb/s figure and the ops counts are press/paper-sourced and hedged on-slide.
-->

---
layout: default
class: px-10
---

# Turbo's living legacy

<div class="grid grid-cols-2 gap-8 mt-2">

<div class="space-y-3">

Turbo didn't win 5G — but it still carries an enormous share of the world's
traffic. As of late 2025, **5G was only ~1/3 of mobile subscriptions**
(~**3.1 B** of ~**8.9 B** by Q1 2026). **Every remaining 4G bit ends in a turbo
decoder.**

<div v-click>

And it lives well beyond LTE:

- **UMTS / HSPA** — the original 3G data workhorse.
- **CCSDS deep-space turbo** — 16-state, rates 1/2 … 1/6; flown on **MRO** and
  **SMART-1** (the first probe with turbo, 2003).
- **DVB-RCS** — duo-binary turbo on the satellite return link.

</div>

</div>

<div class="flex flex-col justify-center">
<DbGauge
  caption="Turbo plants its 1993 flag — 0.7 dB in the lab — and still rides every 4G link on Earth."
  :flags="[
    { label: 'Turbo (1993 lab)', db: 0.7, color: 'parity' },
  ]"
/>
</div>

</div>

<SourceFoot :refs="[['Subscription split: Ericsson Mobility Report, Nov 2025 / Q1 2026', ''], ['CCSDS deep-space turbo: CCSDS 131.0-B', ''], ['DVB-RCS duo-binary: Valenti &amp; Sun', '']]" />

<!--
Slide 14. Legacy + plant the flag on the running DbGauge (turbo at 0.7 dB, parity
colour — matches the BigNumber on slide 2 and the timeline flag in Part 1). The
subscription framing (5G ~1/3, so 4G's turbo still carries the majority) is the
emotional close: "the code in your pocket." Reveal lists the other homes — 3G,
CCSDS deep space (SMART-1 first, 2003), DVB-RCS. Subscription numbers = Ericsson
Mobility Report; re-check exact B figures in T15. Hands off to Part 5 (polar).
-->
