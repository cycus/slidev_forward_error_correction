---
layout: default
---

# Style guide — design system

Toggle dark mode with <kbd>d</kbd> to validate both schemes. This page is
`hide: true` in the final deck (set on the `src:` import in `slides.md`, T16).

<div class="grid grid-cols-6 gap-3 mt-6">
  <div v-for="c in ['info','parity','error','corrected','frozen','trivia']" :key="c" class="text-center">
    <div class="h-14 rounded-lg border border-fec-line" :style="{ background: `var(--fec-${c})` }" />
    <div class="mt-1 text-sm font-medium" :style="{ color: `var(--fec-${c})` }">{{ c }}</div>
    <div class="h-6 rounded mt-1 border border-fec-line" :style="{ background: `var(--fec-${c}-soft)` }" />
  </div>
</div>

<div class="mt-6 flex gap-2 items-center">
  <span class="fec-chip-info">systematic</span>
  <span class="fec-chip-parity">parity</span>
  <span class="fec-chip-error">flipped</span>
  <span class="fec-chip-corrected">converged</span>
  <span class="fec-chip-frozen">frozen</span>
</div>

<SourceFoot :refs="[['styles/CONVENTIONS.md', ''], ['Design tokens: styles/index.css', '']]" />

---

<SectionCover
  :part="3"
  title="SectionCover demo"
  thesis="Eyebrow, title, one-line thesis, and 7 progress dots (part 3 active here)."
/>

---

# Cards, hero numbers & citations

<div class="grid grid-cols-2 gap-8 mt-4 items-start">

<div>

<TriviaCard title="Did you know?">
Voyager 1 still phones home from ~24 billion km using a rate-1/6 convolutional +
Reed–Solomon concatenated code — FEC is why a 20-watt transmitter is audible.
<template #source>Illustrative styleguide copy — real cards carry verified sources.</template>
</TriviaCard>

<TriviaCard class="mt-4" title="Custom icon">
<template #icon><div class="i-carbon-satellite-radar" /></template>
Icons come from the <code>#icon</code> slot so UnoCSS can detect them statically.
</TriviaCard>

</div>

<div class="flex flex-col gap-6">
  <BigNumber value="−1.59 dB" label="Ultimate Shannon limit (Eb/N0 as R→0)" source="Forney, MIT 6.451 Ch.4" color="corrected" />
  <BigNumber value="9.6 dB" label="Uncoded BPSK @ BER 1e-5" source="Forney, MIT 6.451 Ch.4" color="error" />
  <BigNumber value="11 dB" label="The gap FEC closed, 1948→today" color="info" />
</div>

</div>

<SourceFoot :refs="[['Shannon 1948', 'https://ieeexplore.ieee.org/document/6773024'], ['Forney, MIT 6.451', '']]" />

---

# DbGauge — the running motif

<DbGauge
  class="mt-8"
  caption="Distance from the Shannon limit — each code family plants its flag here."
  :flags="[
    { label: 'LDPC (5G)', db: 1.0, color: 'info' },
    { label: 'Turbo (LTE)', db: 1.3, color: 'parity' },
  ]"
/>

<div class="mt-8 text-sm text-fec-muted">
Reference points render by default: uncoded BPSK @ 9.6 dB, ultimate limit @ −1.59 dB,
rate-½ limit @ 0 dB. Flags are passed per part.
</div>

<SourceFoot :refs="[['Limits: Forney MIT 6.451 Ch.4', ''], ['Flag values illustrative — set per part in T06/T08'], ]" />
