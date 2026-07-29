<script setup lang="ts">
import { computed } from 'vue'

// Horizontal "distance from Shannon limit" gauge — the deck's connective motif
// (Parts 1/3/4/5/7). Fixed Eb/N0 scale (−2…+10 dB, per T02). Three reference
// points render by default; each code family passes `flags` to plant its flag
// on the same scale. Theme-aware: all colors are var(--fec-*) via style bindings
// (SVG presentation attributes can't resolve CSS vars, so we bind :style).
interface Marker { label: string, db: number, color?: string }
const props = withDefaults(defineProps<{
  min?: number
  max?: number
  refPoints?: Marker[]
  flags?: Marker[]
  caption?: string
}>(), {
  min: -2,
  max: 10,
  // Fixed reference points (T01 acceptance / T02 factual basis).
  refPoints: () => ([
    { label: 'Ultimate limit', db: -1.59, color: 'corrected' },
    { label: 'Rate ½ limit', db: 0, color: 'muted' },
    { label: 'Uncoded BPSK', db: 9.6, color: 'error' },
  ]),
  flags: () => [],
  caption: '',
})

const W = 840
const H = 168
const PADL = 52
const PADR = 52
const plotW = W - PADL - PADR
const axisY = 100

const xOf = (db: number) => PADL + ((db - props.min) / (props.max - props.min)) * plotW
const cvar = (name?: string) => `var(--fec-${name || 'muted'})`
const fmt = (db: number) => `${db} dB`.replace('-', '−')

const ticks = computed(() => {
  const out: { db: number, x: number }[] = []
  for (let db = Math.ceil(props.min); db <= Math.floor(props.max); db += 2)
    out.push({ db, x: xOf(db) })
  return out
})
const refs = computed(() => props.refPoints.map(r => ({ ...r, x: xOf(r.db), fill: cvar(r.color) })))
// Stagger flag labels across two vertical tiers so adjacent flags (code families
// often cluster within ~1 dB of each other) stay legible instead of overlapping.
const flagItems = computed(() => props.flags.map((f, i) => {
  const poleTop = i % 2 === 0 ? 44 : 70
  return {
    ...f,
    x: xOf(f.db),
    fill: cvar(f.color || 'info'),
    poleTop,
    rectY: poleTop - 6,
    labelY: poleTop - 14,
    valY: poleTop - 28,
  }
}))
</script>

<template>
  <figure class="db-gauge">
    <figcaption v-if="caption" class="dg-caption">{{ caption }}</figcaption>
    <svg :viewBox="`0 0 ${W} ${H}`" class="dg-svg" role="img" :aria-label="caption || 'Distance from Shannon limit in dB'">
      <defs>
        <linearGradient id="dg-track" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" :style="{ stopColor: 'var(--fec-corrected)' }" stop-opacity="0.35" />
          <stop offset="45%" :style="{ stopColor: 'var(--fec-parity)' }" stop-opacity="0.22" />
          <stop offset="100%" :style="{ stopColor: 'var(--fec-error)' }" stop-opacity="0.32" />
        </linearGradient>
      </defs>

      <!-- track -->
      <rect :x="PADL" :y="axisY - 6" :width="plotW" height="12" rx="6" fill="url(#dg-track)" />
      <line :x1="PADL" :y1="axisY" :x2="PADL + plotW" :y2="axisY" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1" />

      <!-- integer dB ticks -->
      <g v-for="t in ticks" :key="`t${t.db}`">
        <line :x1="t.x" :y1="axisY + 6" :x2="t.x" :y2="axisY + 11" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1" />
        <text :x="t.x" :y="axisY + 24" text-anchor="middle" class="dg-tick fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ t.db }}</text>
      </g>
      <text :x="PADL + plotW" :y="axisY + 40" text-anchor="end" class="dg-axis" :style="{ fill: 'var(--fec-muted)' }">Eb/N0 (dB)</text>

      <!-- reference points -->
      <g v-for="(r, i) in refs" :key="`r${i}`">
        <line :x1="r.x" :y1="axisY - 10" :x2="r.x" :y2="axisY + 10" :style="{ stroke: r.fill }" stroke-width="2" />
        <circle :cx="r.x" :cy="axisY" r="4.5" :style="{ fill: r.fill }" />
        <text :x="r.x" :y="axisY + 52 + (i % 2) * 15" text-anchor="middle" class="dg-reflabel" :style="{ fill: 'var(--fec-fg)' }">{{ r.label }}</text>
        <text :x="r.x" :y="axisY + 64 + (i % 2) * 15" text-anchor="middle" class="dg-refval fec-tnum" :style="{ fill: r.fill }">{{ fmt(r.db) }}</text>
      </g>

      <!-- code-family flags (planted per part) -->
      <g v-for="(f, i) in flagItems" :key="`f${i}`">
        <line :x1="f.x" :y1="axisY - 8" :x2="f.x" :y2="f.poleTop" :style="{ stroke: f.fill }" stroke-width="2" />
        <path :d="`M ${f.x} ${axisY - 8} l -5 -8 l 10 0 z`" :style="{ fill: f.fill }" />
        <rect :x="f.x - 3" :y="f.rectY" width="6" height="6" :style="{ fill: f.fill }" />
        <text :x="f.x" :y="f.labelY" text-anchor="middle" class="dg-flaglabel" :style="{ fill: f.fill }">{{ f.label }}</text>
        <text :x="f.x" :y="f.valY" text-anchor="middle" class="dg-flagval fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ fmt(f.db) }}</text>
      </g>
    </svg>
  </figure>
</template>

<style scoped>
.db-gauge {
  margin: 0;
  width: 100%;
}
.dg-caption {
  font-size: 0.85rem;
  color: var(--fec-muted);
  margin-bottom: 0.25rem;
}
.dg-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}
.dg-tick { font-size: 12px; }
.dg-axis { font-size: 12px; font-style: italic; }
.dg-reflabel { font-size: 12.5px; font-weight: 600; }
.dg-refval { font-size: 12px; }
.dg-flaglabel { font-size: 13px; font-weight: 700; }
.dg-flagval { font-size: 11px; }
</style>
