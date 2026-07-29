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

<div class="mt-8 text-fec-muted">
Noise is physics. FEC is why radio works. A story in seven parts.
</div>

<!--
Entry deck. Part 0 (Prologue) lives here; Parts 1–7 import from pages/ via `src:`.
The three "scaffold self-test" slides below verify the KaTeX / Mermaid / component
pipeline (T00 acceptance) and should be deleted once verified — T02 owns real Part 0.
-->

---

<!-- ══════════════ SCAFFOLD SELF-TEST — delete after T00 verification ══════════════ -->

# Scaffold self-test · KaTeX

Display math renders, and shared macros from `setup/katex.ts` resolve:

$$ C = B\log_2(1+\mathrm{SNR}) $$

Ultimate limit as $\Rcode \to 0$: $\EbNo \ge \ln 2 = -1.59\dB$.

---

# Scaffold self-test · Mermaid

```mermaid {scale: 0.8}
graph LR
  S[Source bits] --> E[FEC encoder]
  E --> C(("AWGN<br/>channel"))
  C --> D[FEC decoder]
  D --> R[Recovered bits]
```

---

# Scaffold self-test · components & clicks

Component auto-import from `components/` and `$clicks` both work:

<TriviaCard title="Pipeline check" class="mt-4 max-w-2xl">
If you can read this card, <code>components/</code> auto-imports correctly.
<template #source>Scaffold self-test — remove in T02.</template>
</TriviaCard>

<div v-click class="mt-4 text-fec-corrected font-semibold">
✓ Click reveal fired — presenter-driven choreography is live.
</div>

<!-- ════════════════════════ END SCAFFOLD SELF-TEST ════════════════════════ -->

---

<SectionCover
  :part="0"
  title="Prologue — Every bit is a guess"
  thesis="Noise is physics; FEC is why radio works."
/>

<!--
Part 0 — Prologue. Section-cover placeholder (T00 skeleton).
Full Prologue slides implemented in T02.
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
# TODO(T16): set `hide: true` to drop the styleguide from the final deck.
src: ./pages/_styleguide.md
hide: false
---
