---
layout: default
---

<SectionCover
  :part="5"
  :year="2008"
  title="Polar — the theorist's triumph"
  thesis="Channel polarization; provably capacity-achieving; owns 5G control."
>
<div class="mt-5 text-fec-muted">
<b class="text-fec-fg">2008</b> · the last great coding theorem finally gets a <b>constructive</b> proof.
</div>
</SectionCover>

<!--
Part 5 opener. The arc: the Arıkan story (a 25-year quest, one single-author
paper) → the 2×2 kernel that "robs one bit to pay the next" → polarization
watched live on BEC(0.5) → frozen bits = the code, and 5G's one universal
sequence → encoding as an FFT-like butterfly → SC decoding and its fragility →
SCL+CRC the fix → the 5G NR deployment table → polar-vs-LDPC at short blocks →
why polar didn't get data → recap + plant polar's flag. Frame: this is the only
code family born WITH a capacity proof — and it runs every 5G control message.
Three interactive views (PolarizationExplorer views 1/2/3) are embedded.
-->

---
layout: default
class: px-10
---

# The theorist's 25-year quest

<div class="grid grid-cols-2 gap-8 mt-3">

<div class="space-y-3">

**Erdal Arıkan** did his PhD at **MIT, 1986 — under Robert Gallager himself**. The
problem that would define his career came out of a paradox in **sequential
decoding**: the *cutoff rate*, not capacity, seemed to be the practical wall.

<div v-click>

His answer, ~25 years later: **channel polarization**. Combine and split channel
uses recursively and they drift to two extremes — perfect or useless. The
polarizing transform was such a good **inner code** that **no outer code was
needed at all** ("On the Origin of Polar Coding").

</div>

<div v-click class="fec-card border-l-4 !border-l-fec-info">
A <b>single-author</b> paper: arXiv <b>July 2008</b>, IEEE Trans. IT <b>July
2009</b> — the first explicit construction <em>provably</em> achieving symmetric
capacity with <b>O(N log N)</b> encode and decode.
</div>

</div>

<div class="flex flex-col gap-4 justify-center">

<BigNumber value="2008" label="First code family born WITH a capacity proof, not reverse-engineered toward one" color="frozen" />

<TriviaCard title="The lineage">
<b>Gallager</b> invented <b>LDPC</b> (1960). His student <b>Arıkan</b> invented
<b>polar</b> (2008). 5G runs <em>both</em>: <b>data rides the professor's code,
control rides the student's.</b>
<template #icon><div class="i-carbon-generate-pdf" /></template>
<template #source>Wikipedia, "Erdal Arıkan"; "On the Origin of Polar Coding" (arXiv:1511.04838).</template>
</TriviaCard>

</div>

</div>

<SourceFoot :refs="[['Bio, MIT 1986, advisor Gallager: Wikipedia, \'Erdal Arıkan\'', ''], ['Origin story &amp; cutoff-rate paradox: E. Arıkan, \'On the Origin of Polar Coding\', arXiv:1511.04838', '']]" />

<!--
Slide 2. The origin. Anchor number 2008 (BigNumber, FROZEN colour = polar's flag
colour on the running gauge — chosen so polar reads distinct from turbo/amber).
Two reveals build the thesis: polarization as an inner code so good no outer code
is needed, then the single-author 2008/2009 papers with O(N log N). Exactly ONE
TriviaCard — the Gallager→Arıkan lineage, an explicit callback to Part 3 slide 2
(Gallager/LDPC): "data runs the professor's code, control runs the student's."
-->

---
layout: default
class: px-10
---

# The 2×2 kernel

<div class="text-fec-muted mt-1 mb-2">
Take two uses of the same channel <b>W</b>. Combine, then split — one use gets
<b>worse</b>, the other gets <b>better</b>. That asymmetry is the whole idea.
</div>

<div class="grid grid-cols-3 gap-4 items-center">

<div class="col-span-2">
<svg viewBox="0 0 470 210" class="w-full h-auto max-h-56" role="img" aria-label="2x2 polar kernel butterfly">
  <!-- inputs -->
  <text x="24" y="60" text-anchor="middle" style="font-size:13px;font-weight:700" :style="{ fill: 'var(--fec-info)' }">u₁</text>
  <text x="24" y="160" text-anchor="middle" style="font-size:13px;font-weight:700" :style="{ fill: 'var(--fec-info)' }">u₂</text>

  <!-- u2 branch node -->
  <circle cx="120" cy="155" r="3.5" :style="{ fill: 'var(--fec-fg)' }" />
  <!-- u1 -> XOR -->
  <line x1="38" y1="55" x2="188" y2="55" :style="{ stroke: 'var(--fec-line)' }" stroke-width="2" />
  <!-- u2 -> branch, up into XOR -->
  <line x1="38" y1="155" x2="120" y2="155" :style="{ stroke: 'var(--fec-line)' }" stroke-width="2" />
  <line x1="120" y1="155" x2="120" y2="55" :style="{ stroke: 'var(--fec-line)' }" stroke-width="2" />

  <!-- XOR node -->
  <circle cx="200" cy="55" r="12" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-fg)' }" stroke-width="1.8" />
  <text x="200" y="60" text-anchor="middle" style="font-size:14px;font-weight:700" :style="{ fill: 'var(--fec-fg)' }">⊕</text>

  <!-- outputs into channels -->
  <line x1="212" y1="55" x2="300" y2="55" :style="{ stroke: 'var(--fec-fg)' }" stroke-width="2" />
  <line x1="120" y1="155" x2="300" y2="155" :style="{ stroke: 'var(--fec-fg)' }" stroke-width="2" />
  <text x="256" y="45" text-anchor="middle" style="font-size:11px" :style="{ fill: 'var(--fec-fg)' }">x₁ = u₁⊕u₂</text>
  <text x="256" y="148" text-anchor="middle" style="font-size:11px" :style="{ fill: 'var(--fec-fg)' }">x₂ = u₂</text>

  <!-- channel boxes -->
  <rect x="300" y="40" width="40" height="30" rx="5" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-fg)' }" stroke-width="1.6" />
  <text x="320" y="60" text-anchor="middle" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-fg)' }">W</text>
  <rect x="300" y="140" width="40" height="30" rx="5" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-fg)' }" stroke-width="1.6" />
  <text x="320" y="160" text-anchor="middle" style="font-size:12px;font-weight:700" :style="{ fill: 'var(--fec-fg)' }">W</text>

  <!-- synthesized channels -->
  <g v-click>
    <line x1="340" y1="55" x2="400" y2="55" :style="{ stroke: 'var(--fec-error)' }" stroke-width="2.6" />
    <text x="432" y="59" text-anchor="middle" style="font-size:13px;font-weight:700" :style="{ fill: 'var(--fec-error)' }">W⁻</text>
    <text x="432" y="74" text-anchor="middle" style="font-size:9px" :style="{ fill: 'var(--fec-error)' }">worse</text>
  </g>
  <g v-click>
    <line x1="340" y1="155" x2="400" y2="155" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2.6" />
    <text x="432" y="159" text-anchor="middle" style="font-size:13px;font-weight:700" :style="{ fill: 'var(--fec-corrected)' }">W⁺</text>
    <text x="432" y="174" text-anchor="middle" style="font-size:9px" :style="{ fill: 'var(--fec-corrected)' }">better</text>
  </g>
</svg>
</div>

<div class="space-y-3">

$$ G_2 = \begin{bmatrix} 1 & 0 \\ 1 & 1 \end{bmatrix} $$

<div v-click class="fec-card text-sm">
Decode <b>u₂ first</b> using <em>both</em> channel outputs (that's the good
channel <b>W⁺</b>); then decode <b>u₁</b> knowing u₂ (the starved channel
<b>W⁻</b>).
</div>

<div v-click class="text-sm text-fec-muted">
"<b>Rob the first bit to pay the second.</b>" Capacity is <b>conserved</b>:
$I(W⁻)+I(W⁺)=2\,I(W)$.
</div>

</div>

</div>

<SourceFoot :refs="[['Kernel G₂, channel combining/splitting: E. Arıkan, IEEE Trans. IT 55(7):3051–3073, 2009 (arXiv:0807.3917)', '']]" />

<!--
Slide 3. The atom of polar coding, one butterfly. Colour contract: the two
synthesized channels are error-red (W⁻, worse) and corrected-green (W⁺, better)
— the same good/bad polarity used in the tree on slide 4. Two reveals: the split
appears, then the decode order (u₂ from both outputs = strong; u₁ conditioned =
weak). Payoff line: capacity is conserved, I(W⁻)+I(W⁺)=2I(W). G₂ in KaTeX.
-->

---
layout: default
class: px-10
---

# Watch the channels polarize

<div class="grid grid-cols-5 gap-5 mt-1">

<div class="col-span-3">
<PolarizationExplorer mode="tree" height="19rem" />
</div>

<div class="col-span-2 space-y-2 text-sm">

Exact erasure probability **Z** under BEC(0.5), $Z^+ = Z^2,\; Z^- = 2Z - Z^2$:

<table class="fec-tnum text-xs" style="border-collapse:collapse">
<thead><tr class="text-fec-muted"><th class="px-2 text-left">N</th><th class="px-2 text-left">Z values (best → worst)</th></tr></thead>
<tbody>
<tr><td class="px-2 align-top">2</td><td class="px-2">0.25 · 0.75</td></tr>
<tr><td class="px-2 align-top">4</td><td class="px-2">1/16, 7/16, 9/16, 15/16<br><span class="text-fec-muted">0.0625, 0.4375, 0.5625, 0.9375</span></td></tr>
<tr><td class="px-2 align-top">8</td><td class="px-2">1/256, 31/256, 49/256, 81/256,<br>175/256, 207/256, 225/256, 255/256<br><span class="text-fec-muted">0.004, 0.121, 0.191, 0.316, 0.684, 0.809, 0.879, 0.996</span></td></tr>
</tbody>
</table>

<div v-click class="fec-card border-l-4 !border-l-fec-error text-xs">
Polarization is <b>slow</b>. At <b>N=8</b> only <b>3 of 8</b> channels have
<b>Z&lt;0.2</b> — you need thousands of uses before the split is sharp.
</div>

</div>

</div>

<SourceFoot :refs="[['BEC recursion Z⁺=Z², Z⁻=2Z−Z² and all N=2/4/8 values: E. Arıkan, IEEE Trans. IT 55(7), 2009, Prop. 5 (computed exactly)', '']]" />

<!--
Slide 4. First interactive (PolarizationExplorer view 1). The
exact BEC(0.5) Z values are printed beside it as a fec-tnum table: N=2 {0.75,0.25}; N=4
{15/16,9/16,7/16,1/16}; N=8 {255,225,207,81,175,49,31,1}/256. The reveal is the
teaching beat — polarization is SLOW: only 3/8 have Z<0.2 at N=8 (u5,u6,u7). The
good/bad colour polarity (green low-Z / red high-Z) matches slide 3. T15: N=8
info-set prefix vs the 5G sequence restriction is a DERIVED claim — verify vs
Table 5.3.1.2-1 (component math stands independent per T11).
-->

---
layout: default
class: px-10
---

# Frozen bits ARE the code

<div class="grid grid-cols-2 gap-8 mt-1">

<div class="space-y-3">

Put **data on the good** synthetic channels; **freeze the bad** ones to a value
both ends know (0). The frozen set *is* the code definition.

**Rate 1/2 at N=8** — pick the 4 lowest-Z channels:

<div class="flex gap-1.5 fec-tnum mt-1">
  <div v-for="(c, i) in [['u₀','0',0],['u₁','0',0],['u₂','0',0],['u₃','d',1],['u₄','0',0],['u₅','d',1],['u₆','d',1],['u₇','d',1]]" :key="i"
       class="flex-1 rounded px-1 py-2 text-center border text-sm font-bold"
       :class="c[2] ? 'text-fec-info bg-fec-info-soft border-fec-info' : 'text-fec-frozen bg-fec-frozen-soft border-fec-frozen'">
    <div>{{ c[0] }}</div>
    <div class="text-xs font-normal">{{ c[1] }}</div>
  </div>
</div>

<div class="flex gap-4 text-xs mt-1">
<span class="fec-chip-info">info {u3,u5,u6,u7}</span>
<span class="fec-chip-frozen">frozen {u0,u1,u2,u4}</span>
</div>

</div>

<div class="space-y-3">

<div class="fec-card">
The 5G twist: <b>no per-SNR construction</b>. TS 38.212 ships <b>one universal
nested reliability sequence</b> of length <b>1024</b> (Table 5.3.1.2-1). For any
(K, N) both ends just take the <b>K most-reliable</b> positions from the same
ordered list.
</div>

<TriviaCard title="One sequence to rule them all">
3GPP adopted the <b>Huawei-proposed</b> nested sequence at <b>RAN1&nbsp;#90</b>
(Aug 2017). Nested = the length-N order is a prefix of the length-2N order, so a
single table covers every block size.
<template #icon><div class="i-carbon-list-numbered" /></template>
<template #source>TS 38.212 §5.3.1.2 via ShareTechnote; R. Maunder et al., IEEE COMST survey.</template>
</TriviaCard>

</div>

</div>

<SourceFoot :refs="[['N=8, R=½ info {3,5,6,7} / frozen {0,1,2,4}: from the Z ordering (Arıkan 2009)', ''], ['Universal nested length-1024 sequence: 3GPP TS 38.212 §5.3.1.2 (ShareTechnote); Maunder et al., IEEE COMST', '']]" />

<!--
Slide 5. The construction. COLOUR IS LOAD-BEARING: frozen bits use the `frozen`
token (bg-fec-frozen-soft / text-fec-frozen), info/data bits use info-blue — per
CONVENTIONS. The 8-cell strip shows info {u3,u5,u6,u7} vs frozen {u0,u1,u2,u4}
(the four lowest-Z from slide 4). Right column's punchline: 5G freezes ONE
universal length-1024 nested sequence instead of per-SNR construction — the
bridge from theory to a shipping spec. ONE TriviaCard: Huawei sequence at
RAN1#90, Aug 2017. T15: confirm the info-set prefix tie-in against Table
5.3.1.2-1 (flagged derived).
-->

---
layout: default
class: px-10
---

# Encoding — an FFT-like butterfly

<div class="grid grid-cols-5 gap-5 mt-1">

<div class="col-span-2 space-y-3">

The encoder is a linear transform:

$$ x = u\,G_N, \qquad G_N = G_2^{\otimes n},\; N = 2^n $$

<div class="text-sm text-fec-muted">
5G NR uses the <b>plain</b> Kronecker power — it <b>drops Arıkan's bit-reversal
permutation</b>, folding that reordering into the sub-block interleaver instead.
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-corrected text-sm">
Like an FFT, it's <b>butterflies in place</b>: <b>(N/2)·log₂N XORs</b>, no
multiplies.
<div class="mt-1 fec-tnum">N=8 → <b>12</b> XORs · N=512 → <b>2304</b> XORs</div>
</div>

</div>

<div class="col-span-3">
<PolarizationExplorer mode="butterfly" height="17rem" />
</div>

</div>

<SourceFoot :refs="[['x = u·G_N, G_N = G₂^⊗n, NR drops bit-reversal: 3GPP TS 38.212 §5.3.1; ShareTechnote', ''], ['Butterfly / (N/2)·log₂N XOR count: standard G₂^⊗n factor graph', '']]" />

<!--
Slide 6. Encoding as an FFT-in-GF(2). Second interactive
(PolarizationExplorer view 2). Reference numbers printed alongside:
G_N = G₂^⊗n; NR drops Arıkan's bit-reversal (folded into rate matching); XOR
count (N/2)·log₂N = 12 at N=8, 2304 at N=512. corrected-green card = the
"cheap, no multiplies" payoff. T15: sanity-check the (N/2)log₂N derivation
(= 2304 at N=512) — flagged in the spec.
-->

---
layout: default
class: px-10
---

# SC decoding — and why it's fragile

<div class="grid grid-cols-5 gap-5 mt-1">

<div class="col-span-2 space-y-3 text-sm">

**Successive Cancellation** decodes **bit by bit, left to right**. To decide
$\hat u_i$ it uses the channel output **y** *and all previous decisions*
$\hat u_0 \dots \hat u_{i-1}$. **Frozen positions are known for free** and just
feed forward.

<div v-click class="fec-card">
As $N\to\infty$ SC is <b>capacity-achieving</b> — the polarization theorem's
whole point.
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-error">
But at <b>finite N it's fragile</b>: SC never looks back, so <b>one early wrong
bit</b> corrupts every decision that depends on it — <b>one wrong turn kills the
block.</b>
</div>

</div>

<div class="col-span-3">
<PolarizationExplorer mode="sc" height="17rem" />
</div>

</div>

<SourceFoot :refs="[['SC decoding, capacity-achieving as N→∞, O(N log N): E. Arıkan, IEEE Trans. IT 55(7), 2009', '']]" />

<!--
Slide 7. The decoder and its Achilles heel. Third interactive
(PolarizationExplorer view 3). Two reveals: SC is capacity-achieving
asymptotically (the theorem), THEN the finite-N fragility (error-red card) — one
early wrong decision propagates because SC never revisits. This sets up slide 8's
fix (SCL keeps alternatives so an early mistake isn't fatal). The note fully
specifies the u3-flip cascade the interactive walks through.
-->

---
layout: default
class: px-10
---

# SCL + CRC — the fix that shipped

<div class="grid grid-cols-2 gap-8 mt-2">

<div class="space-y-3">

**Tal & Vardy (2011 / IEEE Trans. IT 2015):** instead of committing to one bit,
keep a **list of L candidate paths**. At each step, both choices survive; prune
back to the **L** most likely.

<div v-click>

The genius pairing: append a **CRC** to the message. After decoding, **the CRC
picks the winner** among the L survivors — **CA-SCL** (CRC-Aided SCL). The list
saves the near-misses; the CRC breaks the tie.

</div>

<div v-click class="text-sm text-fec-muted">
Complexity $O(L\,N\log N)$ — a constant factor $L$ over SC.
</div>

</div>

<div class="space-y-3">

<div class="fec-card">
<div class="text-fec-info font-semibold">L = 8</div>
<div class="text-sm mt-1">The 5G working assumption — the sweet spot for the decode
effort vs. performance trade.</div>
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-corrected">
<div class="text-fec-corrected font-semibold">Good enough to win control</div>
<div class="text-sm mt-1">At <b>n ≈ 1–2k</b>, CA-SCL matches state-of-the-art
LDPC; at <b>L=32</b> it sits essentially at the <b>maximum-likelihood</b> bound.</div>
</div>

</div>

</div>

<SourceFoot :refs="[['List decoding, CA-SCL, ML at large L: I. Tal &amp; A. Vardy, IEEE Trans. IT 61(5), May 2015', ''], ['L=8 working assumption: MathWorks 5G Toolbox; Atlantis Press URLLC study', '']]" />

<!--
Slide 8. The engineering fix that made polar practical. Argument in two reveals:
keep L paths (list), then CRC-as-selector (CA-SCL) — the two ideas are useless
apart, decisive together. Right column: L=8 (5G working assumption, info-blue)
and the payoff (corrected-green) — matches LDPC at n≈1–2k, ≈ML at L=32. Sets up
slide 9 (where CA-SCL actually ships) and slide 10 (the short-block numbers).
-->

---
layout: default
class: px-10
---

# Where polar lives in 5G NR

<div class="text-fec-muted text-sm mt-1 mb-2">
Polar carries the <b>control</b> plane (TS 38.212). Three homes, each with its own
CRC, size cap, and rate-matching rules.
</div>

<table class="fec-tnum text-sm w-full" style="border-collapse:collapse">
<thead><tr class="text-fec-muted text-left border-b border-fec-line">
<th class="px-3 py-1">Channel</th><th class="px-3 py-1">CRC</th><th class="px-3 py-1">Size</th><th class="px-3 py-1">Notes</th>
</tr></thead>
<tbody>
<tr class="border-b border-fec-line">
<td class="px-3 py-1 font-semibold text-fec-info">PDCCH (DCI)</td>
<td class="px-3 py-1">CRC24C</td>
<td class="px-3 py-1">N ≤ 512</td>
<td class="px-3 py-1">RNTI-masked CRC; distributed-CRC interleaver for early termination</td>
</tr>
<tr class="border-b border-fec-line">
<td class="px-3 py-1 font-semibold text-fec-info">PBCH</td>
<td class="px-3 py-1">CRC24C</td>
<td class="px-3 py-1">A = 32, E = 864</td>
<td class="px-3 py-1">Fixed payload; broadcast master information block</td>
</tr>
<tr>
<td class="px-3 py-1 font-semibold text-fec-info">UCI (A ≥ 12)</td>
<td class="px-3 py-1">CRC6 / CRC11</td>
<td class="px-3 py-1">N ≤ 1024</td>
<td class="px-3 py-1">PC (parity-check) bits for 12 ≤ A ≤ 19; tiny UCI (A&lt;12) uses RM / simplex / repetition</td>
</tr>
</tbody>
</table>

<div class="grid grid-cols-2 gap-6 mt-3">

<div v-click class="fec-card border-l-4 !border-l-fec-corrected text-sm">
<div class="text-fec-corrected font-semibold mb-1">Rate matching (direction matters!)</div>
<b>Puncture</b> when K/E ≤ 7/16 (low rate) · <b>shorten</b> when K/E &gt; 7/16
(high rate) · <b>repeat</b> when E &gt; N. Puncture drops parity from the front;
shorten fixes known-zero tail positions.
</div>

<div v-click class="fec-card text-sm">
<b>Distributed CRC</b> spreads CRC bits through the block, so a blind PDCCH
decode can <b>early-terminate</b> the moment a partial check fails. False-alarm
rate <b>≈ 2⁻²¹</b> with L=8.
</div>

</div>

<SourceFoot :refs="[['Channels, CRCs, sizes, PC bits, rate matching: 3GPP TS 38.212 §5.3.1 / §5.4.1; R. Maunder et al., IEEE COMST; MathWorks 5G Toolbox; destevez.net PDCCH walkthrough', ''], ['Rate-match direction (puncture K/E≤7/16, shorten &gt;7/16): destevez.net + TS 38.212 §5.4.1.2', '']]" />

<!--
Slide 9. The deployment table — the "map it onto your stack" slide. Columns are
spec-accurate (TS 38.212): PDCCH DCI CRC24C RNTI-masked N≤512; PBCH A=32/E=864;
UCI≥12 CRC6/11 N≤1024 with PC bits for 12≤A≤19; tiny UCI → RM/simplex/rep.
CRITICAL colour of the first reveal (corrected-green card): rate-match direction
is PUNCTURE when K/E≤7/16, SHORTEN when K/E>7/16 — the SPEC direction. CafeTele
inverts this; do NOT follow it. Second card: distributed CRC → early termination,
FAR≈2⁻²¹ at L=8. T15: re-triangulate PBCH E=864, CRC types, and FAR exponent
(2⁻(24−log₂L)) against Maunder + MathWorks.
-->

---
layout: default
class: px-10
---

# Polar vs LDPC at short blocks

<div class="grid grid-cols-2 gap-8 mt-2">

<div class="space-y-3">

At the **short block lengths of control signalling**, polar's list decoder is
hard to beat:

<div class="fec-card text-sm">
<b>(n=128, k=64)</b> @ BLER 10⁻³:<br>
CA-SCL-8 ≈ <b>2.8 dB</b> vs LDPC BP-20 ≈ <b>3.5 dB</b> $\EbNo$
<span class="text-fec-muted">(Sionna read-off, <b>±0.2 dB</b>)</span>
</div>

<div v-click class="fec-card text-sm">
<b>PBCH config:</b> polar beats LDPC BG2 by <b>≈ 1 dB</b> with <b>~9× fewer</b>
add-compare-select ops (Maunder).
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-corrected text-sm">
No <b>error floor</b> down to the BLER regions where LDPC/turbo floor near 10⁻⁵
at short K (URLLC studies).
</div>

</div>

<div class="flex flex-col justify-center space-y-3">

<div class="fec-card border-l-4 !border-l-fec-error text-sm">
<div class="text-fec-error font-semibold mb-1">The honest caveat</div>
The advantage is a <b>short-block</b> story. <b>LDPC catches up and wins by
n ≈ 1000–2000</b> — which is exactly why data went the other way.
</div>

<div class="text-xs text-fec-muted">
All dB figures are plot read-offs — treat as <b>approximate (±0.2 dB)</b>, not
spec-guaranteed operating points.
</div>

</div>

</div>

<SourceFoot :refs="[['(128,64) CA-SCL vs LDPC, ±0.2 dB read-off: Sionna polar-vs-LDPC tutorial', ''], ['PBCH ≈1 dB / ~9× ACS: R. Maunder et al., IEEE COMST', ''], ['No error floor / short-K URLLC: Atlantis Press URLLC study (single-source — hedge)', '']]" />

<!--
Slide 10. The comparative numbers — ALL HEDGED per spec. Anchor: (128,64) BLER
1e-3 CA-SCL-8 ≈2.8 dB vs LDPC BP-20 ≈3.5 dB, explicitly ±0.2 dB (Sionna
read-off). Reveals: PBCH ≈1 dB / ~9× ACS (Maunder); no error floor (URLLC,
single-source → flagged). Error-red caveat card is the load-bearing honesty:
this is a SHORT-BLOCK win; LDPC wins by n≈1000–2000 (the setup for slide 11).
T15: re-read the Sionna curves (±0.1–0.2 dB); the "no floor" and any "20× lower
terminal power" claims are single-source Atlantis — keep hedged or drop.
-->

---
layout: default
class: px-10
---

# Why polar didn't get data

<div class="grid grid-cols-2 gap-6 mt-2">

<div class="space-y-3">

Polar owns control — but eMBB **data** went to LDPC. Two honest reasons:

- **SC/SCL is serial.** Decoding walks the bits in order, so throughput doesn't
  scale to eMBB's **20 Gb/s** target the way LDPC's parallel checks do.
- **The silicon comparisons were murky.** Decoder area/throughput numbers across
  tdocs mixed **process nodes** (90 nm vs 14 nm) — apples to oranges, *hedge
  hard*.

<div v-click class="fec-card border-l-4 !border-l-fec-corrected text-sm">
<b>The Reno compromise (RAN1 #87, Nov 2016):</b> <b>LDPC for data, polar for
control.</b> Every camp got a channel; the standard got the best of both.
</div>

</div>

<div class="flex items-center">
<div class="fec-card text-sm">
It was a <b>split decision, not a knockout.</b> Polar's serial decoder is a real
throughput ceiling at data scale, and the head-to-head chip numbers were never
clean enough to overturn LDPC's parallelism advantage for high-rate, long-block
traffic.
</div>
</div>

</div>

<SourceFoot :refs="[['RAN1 #86bis/#87 (Reno, Nov 2016) control/data split: Southampton IEEE COMST survey, Table III', ''], ['Serial-decoder throughput &amp; mixed-node caveat: Maunder, \'5G Channel Code Contenders\' (hedged)', '']]" />

<!--
Slide 11. The counter-verdict — brief, fair, sourced. Two reasons, both hedged:
SC/SCL serial → throughput ceiling vs 20 Gb/s eMBB; and the silicon comparisons
mixed process nodes (90nm vs 14nm — the spec's explicit hedge). Reveal: the Nov
2016 Reno compromise (RAN1 #87) — LDPC data / polar control (corrected-green =
resolution). Tone: split decision, not a knockout — mirror of Part 4 slide 13's
turbo verdict. T15: confirm the #86bis vs #87 attribution for the control
decision (Southampton Table III).
-->

---
layout: default
class: px-10
---

# Polar plants its flag

<div class="grid grid-cols-2 gap-8 mt-2">

<div class="space-y-3">

Polar is the theorist's triumph: **provably at capacity** as $N\to\infty$, and in
practice **best-in-class at the short blocks** that control channels live on.

<div v-click>

Its journey, kept in perspective:

- **Theory → standard in under a decade** (2008 → 2016). Fast — but **not** the
  fastest ever: turbo went ICC'93 → UMTS in ~6 years.
- It rides **every 5G control message** — PDCCH, PBCH, UCI — in every 5G device.

</div>

<TriviaCard title="A medal for a theorem">
<b>26 July 2018, Shenzhen:</b> Huawei's Ren Zhengfei presented Arıkan a
<b>Monnaie-de-Paris medal</b> (Goddess of Victory, Baccarat crystal); 100+ Huawei
researchers were honoured alongside him.
<template #icon><div class="i-carbon-trophy" /></template>
<template #source>Huawei press release, 26 Jul 2018.</template>
</TriviaCard>

</div>

<div class="flex flex-col justify-center">
<!--
DbGauge flag choice: polar plotted at 2.8 dB with the `frozen` colour — polar's
identity token in this deck (turbo used `parity`). 2.8 dB is the slide-10
CA-SCL-8 (128,64) BLER 1e-3 SHORT-BLOCK operating point, NOT an asymptotic
limit; labelled as such. Chosen because there is no single defensible
"asymptotic" dB for a finite-length flag. T15: re-check this 2.8 dB read-off
(±0.2 dB, Sionna) and the label wording before final.
-->
<DbGauge
  caption="Polar plants its flag on control: provably AT capacity asymptotically; a short-block operating point in practice."
  :flags="[
    { label: 'Polar (128,64) CA-SCL — short-block op. point', db: 2.8, color: 'frozen' },
  ]"
/>
</div>

</div>

<SourceFoot :refs="[['Timeline (2008 paper → 2016 RAN1 decision): Southampton IEEE COMST survey', ''], ['Short-block operating point (128,64) CA-SCL ≈2.8 dB, ±0.2 dB: Sionna', ''], ['Award ceremony 26 Jul 2018, Shenzhen: Huawei press release', '']]" />

<!--
Slide 12. Recap + plant polar's flag on the running DbGauge. FRAMING IS
DELIBERATE: "under a decade, theory→standard (2008→2016)" — explicitly NOT
"fastest ever" (turbo did ICC'93→UMTS in ~6 yrs). Gauge flag = FROZEN colour
(polar's identity, distinct from turbo's parity flag on slide-14 of Part 4),
placed at 2.8 dB and LABELLED as a short-block (128,64) operating point, not an
asymptotic limit (there is no honest single asymptotic dB for a finite flag) —
see the code comment above the DbGauge; flagged for T15. ONE TriviaCard: the
Shenzhen medal ceremony, 26 Jul 2018. Hands off to Part 6.
-->
