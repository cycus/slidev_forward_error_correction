<script setup lang="ts">
import { computed } from 'vue'

// Small hand-rolled SVG constellation blurred by AWGN. Pedagogical prop for the
// probabilistic theme: the receiver sees a *cloud*, not clean symbols.
// Reused in Part 0 (the "every bit is a guess" hook) and Part 2 (hard decision
// throws information away). Chart convention: hand-rolled inline SVG, theme-aware
// via var(--fec-*) style bindings (SVG attrs can't resolve CSS vars).
//
// Deterministic noise (a fixed hash, not Math.random) so every render — including
// PDF export — produces the identical cloud.
const props = withDefaults(defineProps<{
  order?: 4 | 16          // QPSK (4) or 16QAM
  sigma?: number          // noise std-dev in symbol units (ideal points at ±1[,±3])
  boundaries?: boolean    // draw I/Q decision boundaries; mis-sliced points turn red
  perPoint?: number       // received samples drawn per ideal point
  caption?: string
}>(), { order: 4, sigma: 0.5, boundaries: false, perPoint: 26, caption: '' })

// Fixed-hash pseudo-noise in (−1,1); classic GLSL fract(sin·k) trick.
const hash = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}
// Sum of four hashes ≈ Gaussian (has tails), so a realistic handful of samples
// actually stray across a decision boundary. std ≈ 0.577·sigma, max ≈ 2·sigma
// (in symbol units, where symbols sit at ±1) — pick sigma > 0.5 to get crossings.
const noise = (i: number, k: number) =>
  (hash(i, k) + hash(i, k + 7) + hash(i, k + 17) + hash(i, k + 31)) * props.sigma * 0.5

// Symbol amplitudes: QPSK uses {−1,+1}; 16QAM uses {−3,−1,+1,+3} normalised to ±1,±3.
const levels = computed(() => (props.order === 16 ? [-3, -1, 1, 3] : [-1, 1]))
const span = computed(() => (props.order === 16 ? 4.2 : 2.2)) // half-extent in symbol units

const S = 260
const C = S / 2
const scale = computed(() => (C - 18) / span.value)
const px = (v: number) => C + v * scale.value

const ideals = computed(() => {
  const out: { x: number, y: number }[] = []
  for (const i of levels.value) for (const q of levels.value) out.push({ x: px(i), y: px(-q) })
  return out
})

const samples = computed(() => {
  const out: { x: number, y: number, bad: boolean }[] = []
  let idx = 0
  for (const i of levels.value) for (const q of levels.value) {
    for (let n = 0; n < props.perPoint; n++) {
      const ni = i + noise(idx, n * 2)
      const nq = q + noise(idx, n * 2 + 1)
      // "bad" = falls the wrong side of a decision boundary (sign flip for QPSK,
      // nearest-level mismatch for 16QAM) ⇒ a hard-decision error.
      const bad = props.order === 4
        ? Math.sign(ni) !== Math.sign(i) || Math.sign(nq) !== Math.sign(q)
        : nearest(ni) !== i || nearest(nq) !== q
      out.push({ x: px(ni), y: px(-nq), bad })
    }
    idx++
  }
  return out
})

function nearest(v: number) {
  return levels.value.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a))
}

// Decision-boundary lines (midpoints between adjacent levels, through 0 for QPSK).
const bounds = computed(() => {
  const ls = levels.value
  const mids: number[] = []
  for (let k = 0; k < ls.length - 1; k++) mids.push((ls[k] + ls[k + 1]) / 2)
  return mids
})
</script>

<template>
  <figure class="cc">
    <figcaption v-if="caption" class="cc-cap">{{ caption }}</figcaption>
    <svg :viewBox="`0 0 ${S} ${S}`" class="cc-svg" role="img" :aria-label="caption || 'Noisy constellation'">
      <!-- I/Q axes -->
      <line :x1="18" :y1="C" :x2="S - 18" :y2="C" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1" />
      <line :x1="C" :y1="18" :x2="C" :y2="S - 18" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1" />
      <text :x="S - 16" :y="C - 6" text-anchor="end" class="cc-axis" :style="{ fill: 'var(--fec-muted)' }">I</text>
      <text :x="C + 6" :y="24" class="cc-axis" :style="{ fill: 'var(--fec-muted)' }">Q</text>

      <!-- decision boundaries -->
      <template v-if="boundaries">
        <template v-for="(m, k) in bounds" :key="`b${k}`">
          <line :x1="px(m)" :y1="18" :x2="px(m)" :y2="S - 18" :style="{ stroke: 'var(--fec-error)' }" stroke-width="1" stroke-dasharray="3 4" opacity="0.55" />
          <line :x1="18" :y1="px(m)" :x2="S - 18" :y2="px(m)" :style="{ stroke: 'var(--fec-error)' }" stroke-width="1" stroke-dasharray="3 4" opacity="0.55" />
        </template>
      </template>

      <!-- received cloud -->
      <circle
        v-for="(s, k) in samples" :key="`s${k}`"
        :cx="s.x" :cy="s.y" :r="boundaries && s.bad ? 3.8 : 3.2"
        :style="{ fill: boundaries && s.bad ? 'var(--fec-error)' : 'var(--fec-info)' }"
      />

      <!-- ideal symbols -->
      <path
        v-for="(p, k) in ideals" :key="`i${k}`"
        :d="`M ${p.x - 6} ${p.y} L ${p.x + 6} ${p.y} M ${p.x} ${p.y - 6} L ${p.x} ${p.y + 6}`"
        :style="{ stroke: 'var(--fec-fg)' }" stroke-width="2.4" stroke-linecap="round"
      />
    </svg>
  </figure>
</template>

<style scoped>
.cc { margin: 0; width: 100%; }
.cc-cap { font-size: 0.85rem; color: var(--fec-muted); margin-bottom: 0.25rem; text-align: center; }
.cc-svg { width: 100%; height: auto; max-height: 62vh; overflow: visible; }
.cc-axis { font-size: 12px; font-style: italic; }
</style>
