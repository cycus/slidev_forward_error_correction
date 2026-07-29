---
layout: default
---

<SectionCover
  :part="1"
  year="1948"
  title="Shannon's Promise"
  thesis="Capacity is a provable limit; the 60-year march closed an 11 dB gap."
/>

<!--
Part 1 — Shannon's Promise. This part sets the yardstick every later part is
measured against: channel capacity and the Eb/N0 limit. Interactive centerpiece
is CapacityExplorer (T03) — embedded as a placeholder here until it lands.
-->

---
layout: default
class: px-10
---

# 1948 — one paper, a new science

<div class="grid grid-cols-2 gap-8 mt-4">

<div class="space-y-3">

Claude Shannon, **"A Mathematical Theory of Communication,"** *Bell System
Technical Journal*, vol. 27 — published in **two parts**, July and October 1948.

<div v-click>

It is the founding document of information theory. It also contains the **first
printed use of the word "bit"** — which Shannon credits to his colleague
**J. W. Tukey**.

</div>

<div v-click>

Before this paper, "how much can this channel carry, reliably?" had no answer.
After it, the answer was a **number** — and a promise that the number is
*achievable*.

</div>

</div>

<TriviaCard title="The unicycling juggler">
Shannon rode a unicycle through the Bell Labs halls — while juggling. At <b>ISIT
1985</b> he made an unannounced appearance; the room froze. As Robert McEliece put
it, <em>"it was as if Newton had shown up at a physics conference."</em>
<template #source>IEEE Spectrum, "Claude Shannon: Tinkerer, Prankster, and Father of Information Theory."</template>
</TriviaCard>

</div>

<SourceFoot :refs="[['Shannon 1948, BSTJ 27', 'https://ieeexplore.ieee.org/document/6773024'], ['IEEE Spectrum profile', '']]" />

<!--
Slide 5. Anchor the date and the stakes. The "bit / Tukey" detail is verified.
Presenter: the emotional beat is that ONE paper turned communication from craft
into science with provable limits. TriviaCard humanises Shannon before the math.
-->

---
layout: default
class: px-10
---

# The two theorems, plainly

<div class="mt-8 max-w-4xl mx-auto space-y-7">

<div v-click="1">
<div class="text-fec-muted text-sm font-semibold uppercase tracking-wider">Theorem 17 — capacity</div>

$$ C = B\log_2\!\left(1+\SNR\right) \quad\text{[bits/s]} $$

The most you can push through a band-limited AWGN channel. Note the **log**:
doubling power does *not* double the rate.
</div>

<div v-click="2">
<div class="text-fec-muted text-sm font-semibold uppercase tracking-wider">Theorem 11 — the noisy-channel coding theorem</div>

<div class="text-lg mt-1">

For any rate $\Rcode \lt C$, codes exist that make the error probability <span class="text-fec-corrected font-semibold">arbitrarily small</span>. For $\Rcode \gt C$, they <span class="text-fec-error font-semibold">do not</span>.

</div>
</div>

<div v-click="3" class="fec-card text-center text-lg">
Capacity is not a soft target you approach with diminishing returns. It is a
<b>wall</b>: reliable on one side, impossible on the other.
</div>

</div>

<SourceFoot :refs="[['Shannon 1948, Theorems 11 &amp; 17', 'https://ieeexplore.ieee.org/document/6773024']]" />

<!--
Slide 6. KaTeX stepping (3 clicks). The single most important idea in the deck:
capacity is a THRESHOLD, not an asymptote. Emphasise "arbitrarily small, not
zero" — that nuance is myth-busted on the next slide. Keep the log point; it
returns in CapacityExplorer view 1.
-->

---
layout: default
class: px-10
---

# What Shannon did *not* give us

<div class="text-fec-muted mt-1">His proof was an <b>existence</b> proof — random coding. It named the prize without a map to it.</div>

<div class="grid grid-cols-2 gap-x-8 gap-y-4 mt-6">

<div v-click class="fec-card">
<span class="fec-chip-error">myth</span> "Capacity is the max rate you can ever send."
<div class="mt-2 text-sm text-fec-corrected">↳ It's the max rate you can send <b>reliably</b>. You can transmit faster — you just can't decode it.</div>
</div>

<div v-click class="fec-card">
<span class="fec-chip-error">myth</span> "At capacity, errors are zero."
<div class="mt-2 text-sm text-fec-corrected">↳ Arbitrarily <b>small</b>, not zero — and only as block length → ∞.</div>
</div>

<div v-click class="fec-card">
<span class="fec-chip-error">myth</span> "Shannon told us how to build the codes."
<div class="mt-2 text-sm text-fec-corrected">↳ No construction, no decoder. Closing the gap took ~45–60 years of engineering.</div>
</div>

<div v-click class="fec-card">
<span class="fec-chip-error">myth</span> "The formula applies to any channel."
<div class="mt-2 text-sm text-fec-corrected">↳ <i>B</i>·log₂(1+SNR) is the <b>AWGN</b> case. Fading, interference, finite blocks all change it.</div>
</div>

</div>

<SourceFoot :refs="[['Costello &amp; Forney 2007, \'Channel coding: road to capacity\'', 'https://arxiv.org/abs/cs/0611112']]" />

<!--
Slide 7. Four myths, four clicks — the click choreography IS the argument. These
are the exact misconceptions 5G engineers carry. The third myth ("he told us
how") is the hinge of the whole deck: the rest is the story of the map Shannon
withheld.
-->

---
layout: default
class: px-10
---

# The formula, as a playground

<div class="text-fec-muted mt-1 mb-4">

$C = B\log_2(1+\SNR)$ — feel the log ceiling: +3 dB of SNR buys ≈ +1 bit/s/Hz, not ×2.

</div>

<SimStub
  name="CapacityExplorer · view 1"
  task="T03"
  note="Sliders for SNR and bandwidth B, a big C readout, and 5G presets (cell edge / mid cell / peak). Drag SNR up 3 dB → C rises one bit/s/Hz, not double — the log ceiling, felt."
  height="16rem"
/>

<!--
Slide 8. INTERACTIVE — CapacityExplorer view 1 (T03). Sliders for SNR and B,
big C readout, 5G presets (cell edge / mid cell / peak). The teaching moment:
drag SNR up 3 dB and watch C rise by a fixed bit/s/Hz, not double. Until T03
lands, a placeholder stands in.
-->

---
layout: default
class: px-10
---

# From SNR to Eb/N0 — the fair yardstick

<div class="grid grid-cols-2 gap-8 mt-3">

<div class="space-y-3">

To compare codes of different rates fairly, normalise by **energy per bit**.
With spectral efficiency $\eta = \Rcode/B$:

<div v-click="1">

$$ \frac{E_b}{N_0} \ge \frac{2^{\eta}-1}{\eta} $$

</div>

<div v-click="2">

As $\eta \to 0$, the bound approaches its floor:

$$ \frac{E_b}{N_0} \to \ln 2 = -1.59\dB $$

The **ultimate limit** — no code, at any rate, beats it.

</div>

</div>

<div v-click="3">
<table class="fec-tnum text-lg w-full">
<thead>
<tr class="text-fec-muted text-sm"><th class="text-left py-1">η (b/s/Hz)</th><th class="text-right">min Eb/N0</th></tr>
</thead>
<tbody>
<tr><td>→ 0</td><td class="text-right text-fec-corrected font-semibold">−1.59 dB</td></tr>
<tr><td>0.5</td><td class="text-right">−0.82 dB</td></tr>
<tr><td>1</td><td class="text-right text-fec-info font-semibold">0.00 dB</td></tr>
<tr><td>2</td><td class="text-right">1.76 dB</td></tr>
<tr><td>4</td><td class="text-right">5.74 dB</td></tr>
<tr><td>8</td><td class="text-right">15.03 dB</td></tr>
</tbody>
</table>
<div class="text-xs text-fec-muted mt-2">Spend more bits per hertz → pay more energy per bit. Efficiency is never free.</div>
</div>

</div>

<SourceFoot :refs="[['Forney, MIT 6.451 Ch.4', 'https://ocw.mit.edu/courses/6-451-principles-of-digital-communication-ii-spring-2005/'], ['η∈{0.5,4,8} computed — re-checked in T15']]" />

<!--
Slide 9. KaTeX stepping (3 clicks: bound → ln2 floor → table). This is the
conversion that lets Voyager, Turbo, and 5G LDPC all live on one axis. The
−1.59 dB floor is the number the whole deck chases. Flag: the 0.5/4/8 rows are
computed from the formula, verified arithmetically in T15.
-->

---
layout: default
class: px-10
---

# The plane every code gets plotted on

<div class="text-fec-muted mt-1 mb-4">
Eb/N0 vs spectral efficiency η. The capacity boundary is a wall; the BPSK-input
and hard-decision curves show what your <em>choices</em> cost you.
</div>

<SimStub
  name="CapacityExplorer · view 2"
  task="T03"
  note="The Eb/N0-vs-η plane: capacity boundary with a shaded impossible region, the BPSK-input curve (rate-½ ≈ 0.19 dB), and the ≈2 dB hard-decision penalty. Historical markers march toward the wall."
  height="16rem"
/>

<SourceFoot :refs="[['Unconstrained &amp; BPSK-input limits: CCSDS 130.1-G-3', ''], ['Rate-½ BPSK-input ≈ 0.19–0.2 dB; hard-decision loss ≈ 2 dB']]" />

<!--
Slide 10. INTERACTIVE — CapacityExplorer view 2 (T03). The Eb/N0-vs-η plane:
unconstrained capacity boundary (shaded impossible region), BPSK-input
constraint curve (rate-½ ≈ 0.19 dB), and the ≈2 dB hard-decision penalty as a
shifted curve. This same plane hosts the historical "march" markers on the next
two slides. Placeholder until T03.
-->

---
layout: center
class: text-center
---

# The gap, measured

<div class="flex items-center justify-center gap-16 mt-6">
  <BigNumber value="9.6 dB" label="Uncoded BPSK @ BER 1e-5" source="Forney Ch.4" color="error" />
  <div class="text-5xl text-fec-muted">→</div>
  <BigNumber value="−1.59 dB" label="Ultimate Shannon limit" source="Forney Ch.4" color="corrected" />
</div>

<div class="mt-10 text-2xl">
An <span class="text-fec-info font-bold">11 dB</span> chasm between what we had and what physics allows.
</div>

<div class="mt-2 text-fec-muted text-lg">This deck is the story of closing it.</div>

<SourceFoot :refs="[['Forney, MIT 6.451 Ch.4', 'https://ocw.mit.edu/courses/6-451-principles-of-digital-communication-ii-spring-2005/']]" />

<!--
Slide 11. The thesis of the deck in one number: 11 dB. 9.6 dB (uncoded) minus
−1.59 dB (limit). Let it land — pause here. Everything that follows is engineers
clawing back these 11 dB, dB by dB.
-->

---
layout: default
class: px-10
---

# The march to capacity, 1950–1990

<div class="grid grid-cols-5 gap-2 text-center text-sm mt-4">
<div v-click><div class="text-fec-info font-bold">1950</div>Hamming (7,4)<div class="text-xs text-fec-muted">first error <em>correction</em></div></div>
<div v-click><div class="text-fec-info font-bold">1960</div>Reed–Solomon<div class="text-xs text-fec-muted">bursts, CDs, deep space</div></div>
<div v-click><div class="text-fec-info font-bold">1967</div>Viterbi<div class="text-xs text-fec-muted">optimal conv. decoding</div></div>
<div v-click><div class="text-fec-info font-bold">1977</div>Voyager<div class="text-xs text-fec-muted">RS + K=7 conv, ≈ 2.3 dB</div></div>
<div v-click><div class="text-fec-info font-bold">1992</div>Galileo<div class="text-xs text-fec-muted">iterative, ≈ 0.8 dB</div></div>
</div>

<DbGauge
  class="mt-6"
  caption="Two decades of concatenation walk the flag leftward — but by brute force, not theory."
  :flags="[
    { label: 'Voyager', db: 2.3, color: 'info' },
    { label: 'Galileo', db: 0.8, color: 'corrected' },
  ]"
/>

<div class="mt-4 text-center text-fec-muted">
Real coding gain, real missions — yet every dB was <em>engineered</em>, not derived from Shannon's limit.
</div>

<SourceFoot :refs="[['Voyager/Galileo gains: Costello &amp; Forney 2007', 'https://arxiv.org/abs/cs/0611112'], ['Voyager ≈2.3 dB derived — T15']]" />

<!--
Slide 12. First half of the timeline. The gauge flags (Voyager 2.3 dB, Galileo
0.8 dB) are the sourced points; Hamming/RS/Viterbi are milestones without precise
gauge flags (honest — their per-scenario dB isn't cleanly sourced). Theme: huge
progress, but achieved by piling structure on structure, not by design from the
limit. That changes in 1993.
-->

---
layout: default
class: px-10
---

# The march to capacity, 1993–2009

<div class="grid grid-cols-4 gap-2 text-center text-sm mt-4">
<div v-click><div class="text-fec-parity font-bold">1993</div>Turbo codes<div class="text-xs text-fec-muted">0.7 dB @ BER 1e-5</div></div>
<div v-click><div class="text-fec-info font-bold">1996</div>LDPC rediscovered<div class="text-xs text-fec-muted">Gallager 1962, revived</div></div>
<div v-click><div class="text-fec-corrected font-bold">2001</div>Chung et al.<div class="text-xs text-fec-muted">0.0045 dB threshold</div></div>
<div v-click><div class="text-fec-frozen font-bold">2008/09</div>Polar codes<div class="text-xs text-fec-muted"><em>provably</em> capacity-achieving</div></div>
</div>

<DbGauge
  class="mt-4"
  caption="Iterative decoding collapses the gap to a rounding error — the wall is essentially reached."
  :flags="[
    { label: 'Turbo', db: 0.7, color: 'parity' },
    { label: 'LDPC', db: 0.04, color: 'corrected' },
  ]"
/>

<div class="grid grid-cols-2 gap-6 mt-3 items-center">

<div v-click>
<BigNumber value="0.0045 dB" label="Chung–Forney–Richardson–Urbanke 2001: rate-½ LDPC threshold from the limit" source="IEEE Comm. Letters, Feb 2001" color="corrected" />
</div>

<TriviaCard v-click title="&quot;Coding is dead&quot;">
At a 1971 workshop, Ned Weldon argued coding theorists were <em>"a small, inbred
group… isolated from reality."</em> Irwin Jacobs stood up holding a chip:
<em>"This is the future of coding."</em> He later co-founded Qualcomm.
<template #source>Costello &amp; Forney 2007, arXiv:cs/0611112.</template>
</TriviaCard>

</div>

<SourceFoot :refs="[['Turbo: Berrou et al., ICC 1993', ''], ['Chung et al. 2001, IEEE Comm. Lett.', ''], ['Arıkan, polar codes, 2009']]" />

<!--
Slide 13. Second half. The emotional peak: 45 years of grind, then in ~15 years
iterative decoding closes almost all of it. 0.0045 dB is the "we basically won"
number (a design threshold; simulated within 0.04 dB at n=10⁷). Polar is the
coda — not a lower dB, but the first EXPLICIT, provably capacity-achieving code.
The Jacobs anecdote lands because he was right.
-->

---
layout: default
class: px-10
---

# The fine print: capacity needs long blocks

<div class="grid grid-cols-2 gap-8 mt-3">

<div class="space-y-3">

Shannon's promise is asymptotic. For a finite block of $n$ symbols, the
achievable rate backs off from capacity (Polyanskiy–Poor–Verdú, 2010):

$$ \Rcode \approx C - \sqrt{\tfrac{V}{n}}\,Q^{-1}(\epsilon) $$

<div v-click>

The backoff shrinks like $1/\sqrt{n}$. A **URLLC** packet of $n \approx 100\text{–}500$
sits well below $C$ — *by construction*, not by weak coding.

</div>

<div v-click class="text-sm text-fec-muted">
This is exactly why short blocks (Part 5, polar) and the URLLC rate tables
(Part 6) are their own hard problems.
</div>

</div>

<div>
<svg viewBox="0 0 480 240" class="w-full h-auto" role="img" aria-label="Achievable rate vs block length">
  <!-- URLLC region shading -->
  <rect x="60" y="40" width="66.4" height="160" style="fill: var(--fec-error)" opacity="0.10" />
  <text x="93" y="34" text-anchor="middle" style="fill: var(--fec-error); font-size: 12px">URLLC</text>
  <!-- capacity asymptote -->
  <line x1="60" y1="40" x2="440" y2="40" style="stroke: var(--fec-corrected)" stroke-width="1.5" stroke-dasharray="5 4" />
  <text x="440" y="34" text-anchor="end" style="fill: var(--fec-corrected); font-size: 12px">C (n → ∞)</text>
  <!-- axes -->
  <line x1="60" y1="200" x2="440" y2="200" style="stroke: var(--fec-line)" stroke-width="1" />
  <line x1="60" y1="40" x2="60" y2="200" style="stroke: var(--fec-line)" stroke-width="1" />
  <!-- backoff curve R(n) ≈ 1 − 3/√n of capacity -->
  <polyline
    points="60,160 88.6,124.8 126.4,93.6 155,78 200.3,62 250,52 345,43.8 440,41.2"
    fill="none" style="stroke: var(--fec-info)" stroke-width="2.5" />
  <!-- x ticks -->
  <g text-anchor="middle" style="fill: var(--fec-muted); font-size: 11px">
    <text x="60" y="216">10²</text>
    <text x="155" y="216">10³</text>
    <text x="250" y="216">10⁴</text>
    <text x="345" y="216">10⁵</text>
    <text x="440" y="216">10⁶</text>
  </g>
  <text x="250" y="234" text-anchor="middle" style="fill: var(--fec-muted); font-size: 12px; font-style: italic">block length n</text>
  <text x="20" y="120" text-anchor="middle" style="fill: var(--fec-muted); font-size: 12px; font-style: italic" transform="rotate(-90 20 120)">achievable rate</text>
</svg>
<div class="text-xs text-fec-muted text-center mt-1">Schematic — normal-approximation shape (∝ 1/√n backoff), not a specific channel.</div>
</div>

</div>

<SourceFoot :refs="[['Polyanskiy, Poor &amp; Verdú 2010, IEEE Trans. IT 56(5)', 'https://ieeexplore.ieee.org/document/5452208']]" />

<!--
Slide 14. The caveat that keeps the deck honest and sets up Parts 5 & 6. The
plot is explicitly schematic (I label it so) — it shows the SHAPE of the √(V/n)
backoff, not a computed dispersion for a named channel. The point for a 5G
engineer: a 100-bit URLLC packet is far from C for a fundamental reason, so
short-block code design is a real discipline.
-->

---
layout: center
class: text-center px-10
---

# Part 1 — the yardstick is set

<div class="flex items-center justify-center gap-12 mt-4">
  <BigNumber value="−1.59 dB" label="Ultimate limit (η → 0)" color="corrected" />
  <BigNumber value="0.00 dB" label="Rate-½ limit (η = 1)" color="info" />
  <BigNumber value="0.19 dB" label="Rate-½ BPSK-input limit" color="parity" />
</div>

<DbGauge
  class="mt-6"
  caption="Three marks on one gauge. Three code families now line up to chase them."
  :flags="[{ label: 'BPSK-input ½', db: 0.19, color: 'parity' }]"
/>

<SourceFoot :refs="[['Limits: Forney, MIT 6.451 Ch.4', ''], ['BPSK-input ≈0.19 dB: CCSDS 130.1-G-3']]" />

<!--
Slide 15. Recap = the contract for the rest of the deck. Three numbers: −1.59
(ultimate), 0.00 (rate-½ Gaussian input), 0.19 (rate-½ BPSK input, the realistic
target for a binary-modulation code). Every later part will plant its flag
relative to these. Hand off to Part 2: "but how do you even build a code?"
-->
