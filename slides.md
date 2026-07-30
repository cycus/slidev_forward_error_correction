---
theme: seriph
title: "Approaching Shannon: FEC for 5G Engineers"
colorSchema: auto
aspectRatio: 16/9
canvasWidth: 1080
monaco: dev
transition: slide-left
comark: true
lineNumbers: false
fonts:
  sans: Inter
  mono: JetBrains Mono
drawings:
  persist: false
export:
  format: pdf
  withClicks: false
---

# Approaching Shannon

## Forward Error Correction for 5G Engineers

<div class="mt-6 text-xl text-fec-muted">
How your phone wins an argument with thermodynamics.
</div>

<div class="mt-10 text-sm text-fec-muted">
Michał Ingielewicz · 2026 · A story in seven parts
</div>

<!--
Part 0 — Prologue. Title slide (outline slide 1). The four Prologue slides
(Title · Hook · Problem · Roadmap) live here in slides.md; Parts 1–7 import
from pages/ via `src:`. Presenter: set the frame — this deck is one long answer
to "why does radio work at all?"
-->

---
layout: two-cols
class: px-4
---

# Every bit is a guess

<div class="mt-4 pr-6">

Every bit you have ever received over the air was a **guess**.

The receiver never *sees* your data. It sees a voltage — a point smeared across
the I/Q plane by thermal noise, interference, and its own front end.

<v-click>

What arrives is not `0` or `1`. It is **evidence**: "probably 0, but I'm only 70%
sure." Everything in this deck is about turning evidence into certainty.

</v-click>

</div>

::right::

<div class="pl-2">
<ConstellationCloud
  :order="4"
  :sigma="0.5"
  caption="QPSK: four symbols sent, a cloud received."
/>
</div>

<!--
Hook. The whole probabilistic theme in one picture: the demodulator's world is
a cloud, not a bitstream. Don't explain LLRs yet — just plant the idea that a
received sample carries a *confidence*, not a decision. Click reveals the payoff.
-->

---
layout: two-cols
class: px-4
---

# The problem: noise is not optional

<div class="mt-4 pr-6 space-y-3">

**AWGN channel.** The sample is the symbol plus Gaussian noise:
$$ y = x + n, \qquad n \sim \mathcal{N}(0,\sigma^2) $$

<v-click>

**Slice it hard** and you get a **Binary Symmetric Channel**: each bit flips
independently with crossover probability $p$. Information was thrown away at the
slicer.

</v-click>

<v-click>

**Just ask again?** Pure retransmission (ARQ) collapses at scale: as $p$ grows,
the expected number of tries — and the latency and throughput cost — blows up.
You cannot meet a 5G reliability target by repeating yourself.

</v-click>

</div>

::right::

<div class="pl-2 flex flex-col items-center justify-center h-full">

<BigNumber
  value="9.6 dB"
  label="Eb/N0 an uncoded BPSK link needs for BER 1e-5"
  source="Forney, MIT 6.451 Ch.4"
  color="error"
/>

<div v-click class="mt-6 fec-card text-sm max-w-xs">
FEC spends <span class="text-fec-parity font-semibold">bandwidth</span> to buy
back this margin — turning a hopeless link into a working one without shouting
louder.
</div>

</div>

<SourceFoot :refs="[['Forney, MIT 6.451 Ch.4 (OCW)', 'https://ocw.mit.edu/courses/6-451-principles-of-digital-communication-ii-spring-2005/']]" />

<!--
The problem slide. AWGN → (hard slice) → BSC is the mental model every engineer
already carries; name it. The 9.6 dB number is the villain: it's what we start
from with no coding. Retransmission-alone being hopeless motivates FEC + later
HARQ (Part 6). Presenter: resist defining code rate yet — that's Part 2.
-->

---
layout: default
class: px-10
---

# The journey — seven parts, one gauge

<div class="text-fec-muted mt-1">Each part plants a flag closer to the limit. This is the map.</div>

<div class="grid grid-cols-2 gap-x-10 gap-y-1.5 text-sm mt-4">
<div><span class="text-fec-info font-bold">Part 1</span> · Shannon's Promise — the yardstick every code is measured against</div>
<div><span class="text-fec-info font-bold">Part 2</span> · The Toolbox — parity, distance, and <b>soft bits</b></div>
<div><span class="text-fec-info font-bold">Part 3</span> · LDPC — the workhorse of 5G data</div>
<div><span class="text-fec-info font-bold">Part 4</span> · Turbo — the 1993 revolution</div>
<div><span class="text-fec-info font-bold">Part 5</span> · Polar — the theorist's triumph</div>
<div><span class="text-fec-info font-bold">Part 6</span> · Redundancy, quantified — BLER vs SINR</div>
<div class="col-span-2"><span class="text-fec-info font-bold">Part 7</span> · Epilogue — three codes, one phone</div>
</div>

<DbGauge
  class="mt-6"
  caption="The running motif: distance from the Shannon limit. Right = wasteful, left = the wall."
/>

<SourceFoot :refs="[['Limits: Forney, MIT 6.451 Ch.4', ''], ['Deck structure: BACKLOG.md']]" />

<!--
Roadmap. First appearance of DbGauge — the connective tissue of the whole deck.
Point at the three reference marks (uncoded 9.6 dB, rate-½ limit 0 dB, ultimate
−1.59 dB). Promise: every code family will plant a flag on THIS scale, so the
audience can compare 60 years of progress at a glance.
-->

---
src: ./pages/part1-shannon.md
---

---
src: ./pages/part2-toolbox.md
---

---
src: ./pages/part3-ldpc.md
---

---
src: ./pages/part4-turbo.md
---

---
src: ./pages/part5-polar.md
---

---
src: ./pages/part6-bler.md
---

---
src: ./pages/part7-epilogue.md
---

---
src: ./pages/_styleguide.md
hide: true
---
