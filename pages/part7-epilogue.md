---
layout: default
---

<SectionCover
  :part="7"
  title="Epilogue — three codes, one phone"
  thesis="LDPC / Turbo / Polar, side by side — and how close to Shannon we actually fly."
>
<div class="mt-5 text-fec-muted">
Six parts built the three families one at a time. Now put them
<b class="text-fec-fg">on one table</b>, plant every flag on
<b>one gauge</b>, and hand over the reference shelf.
</div>
</SectionCover>

<!--
Part 7 opener. The deck lands: consolidate LDPC / Turbo / Polar into one matrix an
engineer remembers, close the Shannon arc on the running DbGauge (all three family flags
at last), curate an honest "what's next", five takeaways, and the reference shelf. No new
facts — everything here traces to Parts 1–6. Arc: matrix -> gauge finale -> what's next
(cited only) -> takeaways -> references + repo link (hosted URL pending, T16).
-->

---
layout: default
class: px-10
---

# Three codes, one table

<div class="text-fec-muted text-sm mt-1 mb-2">
Everything from Parts 3–5 in one grid. Same job — protect the bits — three different bets.
</div>

<table class="fec-tnum text-xs w-full" style="border-collapse:collapse">
<thead><tr class="text-fec-muted text-left border-b border-fec-line">
<th class="px-3 py-1"></th>
<th class="px-3 py-1 text-fec-info">LDPC</th>
<th class="px-3 py-1 text-fec-parity">Turbo</th>
<th class="px-3 py-1 text-fec-frozen">Polar</th>
</tr></thead>
<tbody>
<tr class="border-b border-fec-line" v-click>
<td class="px-3 py-1 text-fec-muted">Born / boomed</td>
<td class="px-3 py-1">1962 / 1996–2003</td>
<td class="px-3 py-1">1993</td>
<td class="px-3 py-1">2008</td>
</tr>
<tr class="border-b border-fec-line" v-click>
<td class="px-3 py-1 text-fec-muted">Structure</td>
<td class="px-3 py-1">sparse graph</td>
<td class="px-3 py-1">2×RSC + interleaver</td>
<td class="px-3 py-1">polarized synthetic channels</td>
</tr>
<tr class="border-b border-fec-line" v-click>
<td class="px-3 py-1 text-fec-muted">Decoder</td>
<td class="px-3 py-1">BP / min-sum (parallel)</td>
<td class="px-3 py-1">BCJR iterations (serial trellis)</td>
<td class="px-3 py-1">SCL + CRC (serial in N, parallel in L)</td>
</tr>
<tr class="border-b border-fec-line" v-click>
<td class="px-3 py-1 text-fec-muted">Strengths</td>
<td class="px-3 py-1">throughput, high rates, no floor ≤10⁻⁵</td>
<td class="px-3 py-1">low-rate waterfall, mature</td>
<td class="px-3 py-1">short blocks, no floor, provable</td>
</tr>
<tr class="border-b border-fec-line" v-click>
<td class="px-3 py-1 text-fec-muted">Weakness</td>
<td class="px-3 py-1">short-block performance</td>
<td class="px-3 py-1">error floor + Gbps scaling</td>
<td class="px-3 py-1">throughput scaling in N</td>
</tr>
<tr class="border-b border-fec-line" v-click>
<td class="px-3 py-1 text-fec-muted">Lives in</td>
<td class="px-3 py-1">5G data, Wi-Fi 6, DVB-S2, 10GBASE-T, SSDs</td>
<td class="px-3 py-1">LTE/HSPA, deep space, DVB-RCS</td>
<td class="px-3 py-1">5G control (PDCCH/PBCH/UCI)</td>
</tr>
<tr class="border-b border-fec-line" v-click>
<td class="px-3 py-1 text-fec-muted">Flag on gauge</td>
<td class="px-3 py-1 text-fec-corrected">0.04 dB (lab)</td>
<td class="px-3 py-1 text-fec-parity">0.7 dB (1993)</td>
<td class="px-3 py-1 text-fec-frozen">at capacity (asymptotic)</td>
</tr>
</tbody>
</table>

<div v-click class="fec-card border-l-4 !border-l-fec-info text-sm mt-3">
<b>One phone call today touches all three.</b> Your 5G data rides
<span class="text-fec-info">LDPC</span>, its control channel rides
<span class="text-fec-frozen">polar</span>, and the moment it falls back to 4G it
rides <span class="text-fec-parity">turbo</span> — three revolutions, one link.
</div>

<SourceFoot :refs="[['Matrix consolidates Parts 3–5; every cell traces to a family\'s deep-dive + recap slide', ''], ['Flag dBs match each recap: LDPC Part 3, Turbo Part 4, Polar Part 5', '']]" />

<!--
Slide 1. The comparison matrix — click-revealed rows, one attribute at a time
(Born/boomed -> Structure -> Decoder -> Strengths -> Weakness -> Lives-in -> Flag-on-gauge),
then the payoff one-liner. Column identity colours match the deck: LDPC info, Turbo parity,
Polar frozen. NO new claims — each cell restates Parts 3–5. T15 resolved: the "flag on gauge"
row shows LDPC at 0.04 dB to match the running DbGauge (slide 2, Parts 1/3/4/5/7 all plot the
0.04 dB simulated gap); Chung's 0.0045 dB DESIGN threshold stays in prose/BigNumbers/TriviaCard.
Polar's cell is text ("at capacity, asymptotic"), not a dB, by design (no honest single
finite-length dB — see the Part 5 gauge comment).
-->

---
layout: default
class: px-10
---

# The gauge, final form

<div class="text-fec-muted text-sm mt-1 mb-2">
Every flag this deck has planted, on one scale. Read it left to right and the
whole story is one line.
</div>

<div class="text-sm mb-1">
<b class="text-fec-error">1948</b> — an <b>11 dB</b> chasm between uncoded BPSK
(9.6 dB) and the ultimate limit (−1.59 dB). &nbsp;→&nbsp;
<b class="text-fec-corrected">2001</b> — iterative decoding shrinks it to
<b class="fec-tnum">0.0045 dB</b> in the lab. &nbsp;→&nbsp;
<b class="text-fec-info">today</b> — a real 5G link flies at
<b class="fec-tnum">α ≈ 0.6–0.75</b> of capacity, at 10% BLER with HARQ.
</div>

<DbGauge
  class="mt-3"
  caption="Three families, three flags, one wall — the gap that took 60 years to close."
  :flags="[
    { label: 'Turbo (1993)', db: 0.7, color: 'parity' },
    { label: 'LDPC (lab)', db: 0.04, color: 'corrected' },
    { label: 'Polar (128,64) short-block', db: 2.8, color: 'frozen' },
  ]"
/>

<div class="grid grid-cols-2 gap-6 mt-3">

<div v-click class="fec-card border-l-4 !border-l-fec-corrected text-sm">
<b>The honest closing beat.</b> Labs closed the gap to a rounding error. Products
leave the last dB on the table — spent on <b>latency</b>, decoder <b>power</b> and
silicon <b>area</b>. Shannon is reached in principle; engineering decides how much
of it ships.
</div>

<TriviaCard v-click title="0.0045 dB — at what price?">
Chung et al.'s near-perfect threshold was for a rate-½ LDPC of block length
<b class="fec-tnum">n = 10⁷</b> — ten million bits per codeword. That is why a
shipping modem, decoding ~thousand-bit blocks under a latency budget, still sits
~1–2 dB out.
<template #icon><div class="i-carbon-ruler" /></template>
<template #source>Chung, Forney, Richardson &amp; Urbanke, IEEE Comm. Lett. 5(2), 2001.</template>
</TriviaCard>

</div>

<SourceFoot :refs="[['Flags: Turbo Part 4 (0.7 dB), LDPC Part 3 (0.04 dB gauge), Polar Part 5 (2.8 dB short-block); 11 dB gap Part 1; α Part 6', ''], ['0.0045 dB @ n=10⁷: Chung et al. 2001, IEEE Comm. Lett. 5(2)', '']]" />

<!--
Slide 2. The gauge finale — the deck's running DbGauge with all three family flags at once:
Turbo 0.7 (parity), LDPC 0.04 (corrected), Polar 2.8 short-block (frozen) — each value
identical to its home part so the epilogue cannot drift. Prose carries the three-beat
narrative (11 dB gap = Part 1 slide 11 = 9.6 − (−1.59) ≈ 11.2, deck rounds to "11 dB";
0.0045 dB = Chung 2001; α ≈ 0.6–0.75 = Part 6 / TR 38.921). Honest beat: the last dB is
traded for latency/power/silicon. ONE TriviaCard = the n=10⁷ price of Chung's 0.0045 dB
(fresh angle, NOT the Shenzhen medal already used in Part 5). T15 resolved: the matrix "flag
on gauge" cell is now 0.04 dB to match this gauge; 0.0045 dB stays as Chung's DESIGN threshold.
-->

---
layout: default
class: px-10
---

# What's next — only the cited parts

<div class="text-fec-muted text-sm mt-1 mb-3">
Restraint on purpose. Three directions with real paper trails — not shipping features.
</div>

<div class="grid grid-cols-3 gap-6">

<div class="fec-card border-l-4 !border-l-fec-info text-sm">
<div class="font-bold text-fec-info mb-1">6G channel coding</div>
Surveys and early 3GPP 6G study work keep <b>LDPC (data)</b> and <b>polar
(control)</b> as the baselines, with efficiency and higher-throughput evolution
under study — continuity, not replacement.
<div class="text-xs text-fec-muted mt-2">"Channel Coding Toward 6G," arXiv:2405.07547.</div>
</div>

<div class="fec-card border-l-4 !border-l-fec-corrected text-sm">
<div class="font-bold text-fec-corrected mb-1">ML-assisted decoding</div>
Trainable min-sum weights and code-agnostic transformer decoders chip at the
error floor and the short-block gap — a live <b>research</b> area, not standardized.
<div class="text-xs text-fec-muted mt-2">"Recent Advances in Deep Learning for Channel Coding: A Survey," arXiv:2406.19664.</div>
</div>

<div class="fec-card border-l-4 !border-l-fec-frozen text-sm">
<div class="font-bold text-fec-frozen mb-1">Finite-blocklength frontier</div>
URLLC lives where Shannon's asymptotics stop applying. The
<b>Polyanskiy–Poor–Verdú</b> bound (Part 1) is the yardstick for short-packet,
ultra-reliable design.
<div class="text-xs text-fec-muted mt-2">Polyanskiy, Poor &amp; Verdú, IEEE Trans. IT 56(5), 2010.</div>
</div>

</div>

<div v-click class="text-xs text-fec-muted mt-4">
Deliberately omitted: any specific unverified 3GPP study-item number. The 6G channel-coding
direction is quoted from a peer-reviewed survey, not from a spec reference we could not confirm.
</div>

<SourceFoot :refs="[['6G coding outlook: \'Channel Coding Toward 6G\', arXiv:2405.07547', 'https://arxiv.org/abs/2405.07547'], ['ML decoding survey: arXiv:2406.19664', 'https://arxiv.org/abs/2406.19664'], ['Finite blocklength: Polyanskiy, Poor &amp; Verdú 2010', 'https://ieeexplore.ieee.org/document/5452208']]" />

<!--
Slide 3. "What's next," curated during T14 with a ~30-min web check (July 2026). THREE
directions, each with a citable trail: (1) 6G continuity of LDPC/polar — sourced to the
peer-reviewed survey arXiv:2405.07547, NOT to an unverified 3GPP study-item number (3GPP 6G
study HAS begun — e.g. TR 38.901 channel-model work — but I could not confirm a specific
channel-CODING SI, so none is cited); (2) ML-assisted decoding — survey arXiv:2406.19664;
(3) finite-blocklength/URLLC — PPV 2010, already in Part 1. The muted caveat states the
omission explicitly. T15: if a firm Rel-19/20 channel-coding SI reference surfaces it can be
added; do NOT invent one.
-->

---
layout: default
class: px-10
---

# Five things to keep

<div class="space-y-3 mt-4">

<div v-click class="fec-card border-l-4 !border-l-fec-corrected">
<b class="text-fec-corrected">1 ·</b> Capacity is a <b>provable line</b>, not a vibe — −1.59 dB is a theorem you code toward.
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-info">
<b class="text-fec-info">2 ·</b> <b>Soft beats hard by ~2 dB</b> — the LLR is the currency of every modern decoder.
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-parity">
<b class="text-fec-parity">3 ·</b> Modern decoding is <b>iterative probabilistic message passing</b> — beliefs, not verdicts.
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-frozen">
<b class="text-fec-frozen">4 ·</b> Redundancy is a <b>~30 dB dial</b>, retuned every TTI by link adaptation.
</div>

<div v-click class="fec-card border-l-4 !border-l-fec-error">
<b class="text-fec-error">5 ·</b> Three code families, <b>one phone</b> — LDPC, turbo and polar all ride in your pocket.
</div>

</div>

<SourceFoot :refs="[['Consolidates Parts 1–6: −1.59 dB (Part 1), ~2 dB soft-gain (Part 2), message passing (Parts 3–5), ~29–30 dB rate dial (Part 6)', '']]" />

<!--
Slide 4. The five takeaways, verbatim from the T14 spec, one per click, each ≤1 line.
Left-border colours walk the deck's identity palette. Cross-refs: (1) −1.59 dB Part 1;
(2) ~2 dB soft-vs-hard Part 2; (3) message passing Parts 3–5; (4) the rate dial — Part 6
quantified the CQI1–15 span as ~29 dB, rounded here to "~30 dB"; (5) the one-phone motif
paid off on slide 1. Keep to five; do not add a sixth.
-->

---
layout: default
class: px-10
---

# References & further reading

<div class="text-fec-muted text-sm mt-1 mb-3">
The citations behind the deck, consolidated. Full per-claim sources sit in each slide's footer.
</div>

<div class="grid grid-cols-3 gap-6 text-xs">

<div>
<div class="font-bold text-fec-info mb-2">Primary papers</div>

- [Shannon 1948](https://ieeexplore.ieee.org/document/6773024), BSTJ 27
- Gallager 1962, IRE Trans. IT 8(1) — LDPC
- Berrou–Glavieux–Thitimajshima 1993, ICC'93 — turbo
- MacKay &amp; Neal 1996, Electron. Lett. 32(18)
- Chung et al. 2001, IEEE Comm. Lett. 5(2) — 0.0045 dB
- [Arıkan 2009](https://arxiv.org/abs/0807.3917), IEEE Trans. IT 55(7) — polar
- Tal &amp; Vardy 2015, IEEE Trans. IT 61(5) — CA-SCL
- [Polyanskiy–Poor–Verdú 2010](https://ieeexplore.ieee.org/document/5452208), IEEE Trans. IT 56(5)

</div>

<div>
<div class="font-bold text-fec-parity mb-2">Specifications</div>

- 3GPP TS 38.212 — NR channel coding (LDPC &amp; polar)
- 3GPP TS 38.214 — NR MCS / CQI procedures
- 3GPP TS 36.212 — LTE turbo coding
- CCSDS 131.0-B — deep-space codes
- CCSDS 130.1-G — coding &amp; sync guide
- ETSI TR 138.921 — α (attenuated-Shannon) model

</div>

<div>
<div class="font-bold text-fec-frozen mb-2">Accessible deep-dives</div>

- [Costello &amp; Forney 2007](https://arxiv.org/abs/cs/0611112), "Road to Capacity"
- Sklar, "Fundamentals of Turbo Codes"
- S. Johnson, "Introducing LDPC Codes"
- Maunder et al., IEEE COMST polar/coding survey (Southampton)
- Sionna tutorials (NVIDIA)
- [Forney, MIT 6.451 OCW](https://ocw.mit.edu/courses/6-451-principles-of-digital-communication-ii-spring-2005/)

</div>

</div>

<div v-click class="fec-card border-l-4 !border-l-fec-info text-sm mt-3">
<b>Slides, snippets &amp; interactive demos:</b> project repository —
<b class="text-fec-muted">hosted URL / QR pending</b> (added in final packaging).
</div>

<SourceFoot :refs="[['Every citation above appears in-context on the relevant slide across Parts 1–6', '']]" />

<!--
Slide 5. The reference shelf, grouped primary papers · specs · deep-dives — the curated
core from the T14 spec (not the full inventory, to fit 16:9 / canvasWidth 1080). Working URLs
kept where the deck already had them (Shannon, Arıkan, PPV, Costello–Forney, Forney OCW);
citations without a deck URL are listed link-free — NO URLs fabricated (Sionna, Sklar,
Johnson, Maunder, TS/CCSDS specs). Repo/QR line is a PLACEHOLDER: there is no hosted URL yet.
T16 must supply the real repo URL (and a QR if wanted) — do NOT ship with "pending" text.
Markdown lists render inside the grid columns (blank lines around them), same pattern as
Part 6 slide 9.
-->
