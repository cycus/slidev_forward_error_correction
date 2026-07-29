<script lang="ts">
// Module-scope store: the view-1 sliders deliberately SURVIVE navigating away
// and back (T03 spec / CONVENTIONS §6). One instance per view, so a single
// shared store is enough.
import { reactive } from 'vue'

export interface Marker {
  name: string
  year: string
  ebn0Db: number // Eb/N0 @ BER≈1e-5, dB
  eta: number // spectral efficiency, bits/s/Hz
  note: string
}

export const capStore = reactive({
  snrDb: 13, // mid-cell default
  bMhz: 20, // a common 5G NR carrier bandwidth
  snrBaseline: 13, // anchor for the "+3 dB" log-ceiling callout
  hardDecision: false, // view-2 hard-decision curve toggle
})

// Historical "march to capacity" set (verified numbers, sources in T02). Order
// is the headline click-march: uncoded → Hamming → Voyager → Turbo → LDPC.
export const DEFAULT_MARKERS: Marker[] = [
  { name: 'Uncoded BPSK', year: '—', ebn0Db: 9.6, eta: 1.0, note: 'no coding — the starting gap' }, // Forney Ch.4
  { name: 'Hamming (7,4)', year: '1950', ebn0Db: 9.0, eta: 1.0, note: 'first error correction; ~0.6 dB net gain' }, // ~0.6 dB hard-decision NCG @1e-5, illustrative — not a primary-sourced point
  { name: 'Voyager', year: '1977', ebn0Db: 2.3, eta: 0.88, note: 'RS + K=7 convolutional concatenation' }, // Costello–Forney 2007 (≈7.3 dB real gain; ≈2.3 dB derived — flagged T15)
  { name: 'Turbo', year: '1993', ebn0Db: 0.7, eta: 1.0, note: 'iterative decoding — the revolution' }, // Berrou et al., ICC 1993
  { name: 'LDPC (n=10⁷)', year: '2001', ebn0Db: 0.23, eta: 1.0, note: 'within 0.04 dB of the limit' }, // Chung et al. 2001 (0.19 + 0.04)
]

// Binary-input AWGN capacity, read off the standard BI-AWGN curve as (η, Eb/N0)
// with η = 2·C. Anchor (sourced): rate-½ ⇒ η=1 ⇒ 0.19 dB. Intermediate points
// trace the curve shape (approximate, ±~0.1 dB).
// Source: CCSDS 130.1-G-3; Ryan & Lin, "Channel Codes", BI-AWGN capacity.
const BPSK_INPUT: { eta: number, db: number }[] = [
  { eta: 0.10, db: -1.47 },
  { eta: 0.20, db: -1.34 },
  { eta: 0.40, db: -1.06 },
  { eta: 0.60, db: -0.74 },
  { eta: 0.80, db: -0.30 },
  { eta: 1.00, db: 0.19 }, // anchor: rate-½ BPSK-input limit
  { eta: 1.20, db: 0.79 },
  { eta: 1.40, db: 1.54 },
  { eta: 1.60, db: 2.55 },
  { eta: 1.80, db: 4.13 },
  { eta: 1.90, db: 5.66 },
]
const HARD_SHIFT_DB = 2 // hard-decision (BSC) loses ≈2 dB vs soft — CONVENTIONS/T02
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onSlideEnter, onSlideLeave, useSlideContext } from '@slidev/client'
import { ebn0LimitDb, shannonCapacityMbps } from '../snippets/capacity'
import { dbTicks, decadeTicks, linMap, logMap } from '../snippets/plot'

const props = withDefaults(defineProps<{
  mode?: 'capacity' | 'ebn0'
  clicksDriven?: boolean
  markers?: Marker[]
}>(), { mode: 'capacity', clicksDriven: false, markers: () => DEFAULT_MARKERS })

const { $clicks, $renderContext } = useSlideContext()

function fmt(v: number, d = 1) { return v.toFixed(d).replace('-', '−') }

// ================= View 1 — the capacity formula ==========================
const V1 = { w: 480, h: 214, l: 46, r: 14, t: 14, b: 30 }
const bpsHz = (db: number) => Math.log2(1 + 10 ** (db / 10))
const capNow = computed(() => shannonCapacityMbps(capStore.snrDb, capStore.bMhz))
const yMax = computed(() => shannonCapacityMbps(40, capStore.bMhz))
const x1 = linMap(-10, 40, V1.l, V1.w - V1.r)
const y1 = computed(() => linMap(0, yMax.value, V1.h - V1.b, V1.t))
const curve1 = computed(() => {
  const pts: string[] = []
  for (let s = -10; s <= 40; s += 1)
    pts.push(`${x1(s).toFixed(1)},${y1.value(shannonCapacityMbps(s, capStore.bMhz)).toFixed(1)}`)
  return `M ${pts.join(' L ')}`
})
const ptX = computed(() => x1(capStore.snrDb))
const ptY = computed(() => y1.value(capNow.value))
const v1xticks = dbTicks(-10, 40, 10)

// The log ceiling: revealed once the user pushes SNR ≥ 3 dB above the anchor
// (doubling power). +3 dB buys a fixed +1 bit/s/Hz, not a doubling of rate.
const showCeiling = computed(() => capStore.snrDb >= capStore.snrBaseline + 3)
const ceilingGain = computed(() => bpsHz(capStore.snrDb) - bpsHz(capStore.snrDb - 3))

const PRESETS = [
  { label: 'cell edge', db: -5 },
  { label: 'mid cell', db: 13 },
  { label: 'peak · 256QAM', db: 30 },
]
function preset(db: number) { capStore.snrDb = db; capStore.snrBaseline = db }

// ================= View 2 — the Eb/N0 vs η plane ==========================
const V2 = { w: 480, h: 300, l: 44, r: 16, t: 18, b: 32 }
const xEb = linMap(-2, 16, V2.l, V2.w - V2.r)
const yEta = logMap(0.1, 10, V2.h - V2.b, V2.t)

// Unconstrained capacity boundary + the impossible region to its left (static).
const ETA = Array.from({ length: 81 }, (_, i) => 10 * (0.1 / 10) ** (i / 80)) // 10 → 0.1
const boundaryPts = ETA.map(e => `${xEb(ebn0LimitDb(e)).toFixed(1)},${yEta(e).toFixed(1)}`)
const boundaryPath = `M ${boundaryPts.join(' L ')}`
const impossiblePath = `M ${V2.l},${V2.t} L ${boundaryPts.join(' L ')} L ${V2.l},${V2.h - V2.b} Z`
const bpskPath = `M ${BPSK_INPUT.map(p => `${xEb(p.db).toFixed(1)},${yEta(p.eta).toFixed(1)}`).join(' L ')}`
const bpskHardPath = `M ${BPSK_INPUT.map(p => `${xEb(p.db + HARD_SHIFT_DB).toFixed(1)},${yEta(p.eta).toFixed(1)}`).join(' L ')}`
const v2xticks = dbTicks(-2, 16, 2)
const v2yticks = decadeTicks(0.1, 10)

// Click-stepped reveal (presenter remote). In non-live contexts (overview,
// print/export) show every marker so the static build carries the full march.
const liveClicks = computed(() => $renderContext.value === 'slide' || $renderContext.value === 'presenter')
const nShown = computed(() =>
  props.clicksDriven && liveClicks.value
    ? Math.min(($clicks.value ?? 0) + 1, props.markers.length)
    : props.markers.length,
)
const shownMarkers = computed(() =>
  props.markers.slice(0, nShown.value).map(m => ({
    ...m,
    x: xEb(m.ebn0Db),
    y: yEta(m.eta),
    gap: m.ebn0Db - ebn0LimitDb(m.eta),
  })),
)

const hover = ref<number | null>(null)

onSlideEnter(() => { capStore.snrBaseline = capStore.snrDb; hover.value = null })
onSlideLeave(() => { hover.value = null })
</script>

<template>
  <RenderWhen context="main">
    <!-- ================= View 1 — capacity formula ================= -->
    <div v-if="mode === 'capacity'" class="ce">
      <div class="ce-v1">
        <svg :viewBox="`0 0 ${V1.w} ${V1.h}`" class="ce-svg">
          <line :x1="V1.l" :y1="V1.h - V1.b" :x2="V1.w - V1.r" :y2="V1.h - V1.b" :style="{ stroke: 'var(--fec-line)' }" />
          <line :x1="V1.l" :y1="V1.t" :x2="V1.l" :y2="V1.h - V1.b" :style="{ stroke: 'var(--fec-line)' }" />
          <g v-for="t in v1xticks" :key="`vx${t}`">
            <line :x1="x1(t)" :y1="V1.h - V1.b" :x2="x1(t)" :y2="V1.h - V1.b + 4" :style="{ stroke: 'var(--fec-line)' }" />
            <text :x="x1(t)" :y="V1.h - V1.b + 16" text-anchor="middle" class="ce-tick fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ fmt(t, 0) }}</text>
          </g>
          <text :x="V1.w - V1.r" :y="V1.h - 2" text-anchor="end" class="ce-axis" :style="{ fill: 'var(--fec-muted)' }">SNR (dB)</text>
          <text :x="V1.l" :y="V1.t - 4" text-anchor="start" class="ce-axis" :style="{ fill: 'var(--fec-muted)' }">C (Mbps)</text>
          <path :d="curve1" fill="none" :style="{ stroke: 'var(--fec-info)' }" stroke-width="2.4" />
          <line :x1="ptX" :y1="V1.t" :x2="ptX" :y2="V1.h - V1.b" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="1" stroke-dasharray="4 4" />
          <circle :cx="ptX" :cy="ptY" r="5.5" :style="{ fill: 'var(--fec-corrected)' }" />
        </svg>
      </div>

      <div class="ce-side">
        <div class="ce-readout">
          <div class="ce-c fec-tnum" :style="{ color: 'var(--fec-info)' }">{{ fmt(capNow, 1) }}<span class="ce-unit"> Mbps</span></div>
          <div class="ce-sub fec-tnum">= {{ fmt(bpsHz(capStore.snrDb), 2) }} bit/s/Hz × {{ fmt(capStore.bMhz, 0) }} MHz</div>
        </div>

        <div class="ce-ctl">
          <label>SNR <b class="fec-tnum">{{ fmt(capStore.snrDb, 0) }} dB</b></label>
          <input type="range" min="-10" max="40" step="1" v-model.number="capStore.snrDb">
        </div>
        <div class="ce-ctl">
          <label>Bandwidth B <b class="fec-tnum">{{ fmt(capStore.bMhz, 0) }} MHz</b></label>
          <input type="range" min="1" max="100" step="1" v-model.number="capStore.bMhz">
        </div>

        <div class="ce-presets">
          <button v-for="p in PRESETS" :key="p.label" type="button" :class="{ 'is-on': capStore.snrDb === p.db }" @click="preset(p.db)">
            {{ p.label }} <span class="fec-tnum">{{ fmt(p.db, 0) }} dB</span>
          </button>
        </div>

        <div v-if="showCeiling" class="ce-note">
          <b>The log ceiling.</b> +3 dB of SNR (double the power) added just
          <b class="fec-tnum" :style="{ color: 'var(--fec-corrected)' }">+{{ fmt(ceilingGain, 2) }}</b> bit/s/Hz — not ×2.
        </div>
      </div>
    </div>

    <!-- ================= View 2 — the Eb/N0 vs η plane ================= -->
    <div v-else class="ce">
      <div class="ce-v2">
        <svg :viewBox="`0 0 ${V2.w} ${V2.h}`" class="ce-svg" @pointerleave="hover = null">
          <defs>
            <clipPath id="ce-plot"><rect :x="V2.l" :y="V2.t" :width="V2.w - V2.l - V2.r" :height="V2.h - V2.t - V2.b" /></clipPath>
          </defs>

          <g clip-path="url(#ce-plot)">
            <path :d="impossiblePath" :style="{ fill: 'var(--fec-error)' }" opacity="0.12" />
            <path :d="bpskPath" fill="none" :style="{ stroke: 'var(--fec-parity)' }" stroke-width="2" />
            <path v-if="capStore.hardDecision" :d="bpskHardPath" fill="none" :style="{ stroke: 'var(--fec-parity)' }" stroke-width="1.6" stroke-dasharray="5 4" />
            <path :d="boundaryPath" fill="none" :style="{ stroke: 'var(--fec-error)' }" stroke-width="2.4" />
          </g>

          <!-- axes -->
          <line :x1="V2.l" :y1="V2.h - V2.b" :x2="V2.w - V2.r" :y2="V2.h - V2.b" :style="{ stroke: 'var(--fec-line)' }" />
          <line :x1="V2.l" :y1="V2.t" :x2="V2.l" :y2="V2.h - V2.b" :style="{ stroke: 'var(--fec-line)' }" />
          <g v-for="t in v2xticks" :key="`x${t}`">
            <line :x1="xEb(t)" :y1="V2.h - V2.b" :x2="xEb(t)" :y2="V2.h - V2.b + 4" :style="{ stroke: 'var(--fec-line)' }" />
            <text :x="xEb(t)" :y="V2.h - V2.b + 15" text-anchor="middle" class="ce-tick fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ fmt(t, 0) }}</text>
          </g>
          <g v-for="t in v2yticks" :key="`y${t}`">
            <line :x1="V2.l - 4" :y1="yEta(t)" :x2="V2.l" :y2="yEta(t)" :style="{ stroke: 'var(--fec-line)' }" />
            <text :x="V2.l - 7" :y="yEta(t) + 3" text-anchor="end" class="ce-tick fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ t }}</text>
          </g>
          <text :x="V2.w - V2.r" :y="V2.h - 2" text-anchor="end" class="ce-axis" :style="{ fill: 'var(--fec-muted)' }">Eb/N0 (dB)</text>
          <text :x="V2.l - 30" :y="V2.t + 4" text-anchor="start" class="ce-axis" :style="{ fill: 'var(--fec-muted)' }">η (b/s/Hz)</text>

          <!-- boundary + region labels -->
          <text :x="xEb(ebn0LimitDb(3.2)) + 6" :y="yEta(3.2)" class="ce-lab" :style="{ fill: 'var(--fec-error)' }">Shannon 1948</text>
          <text :x="V2.l + 8" :y="V2.t + 20" class="ce-lab" :style="{ fill: 'var(--fec-error)' }" opacity="0.75">impossible</text>
          <text :x="xEb(0.19) + 4" :y="yEta(0.62)" class="ce-lab" :style="{ fill: 'var(--fec-parity)' }">BPSK input</text>

          <!-- march-to-capacity markers -->
          <g v-for="(m, i) in shownMarkers" :key="m.name">
            <circle
              :cx="m.x" :cy="m.y" r="6" stroke-width="2"
              :style="{ fill: 'var(--fec-info-soft)', stroke: 'var(--fec-info)', cursor: 'help' }"
              @pointerenter="hover = i" @pointermove="hover = i"
            />
            <text :x="m.x" :y="m.y - 10" text-anchor="middle" class="ce-mk fec-tnum" :style="{ fill: 'var(--fec-info)' }">{{ m.year }}</text>
          </g>

          <!-- hover tooltip -->
          <g v-if="hover !== null && shownMarkers[hover]" :transform="`translate(${shownMarkers[hover].x}, ${shownMarkers[hover].y + 14})`" class="ce-tip">
            <rect x="-88" y="0" width="176" height="46" rx="5" :style="{ fill: 'var(--fec-fg)' }" />
            <text x="0" y="15" text-anchor="middle" class="ce-tiptitle" :style="{ fill: 'var(--fec-surface)' }">{{ shownMarkers[hover].name }} · {{ shownMarkers[hover].year }}</text>
            <text x="0" y="29" text-anchor="middle" class="ce-tipsub fec-tnum" :style="{ fill: 'var(--fec-surface)' }">{{ fmt(shownMarkers[hover].ebn0Db, 1) }} dB · {{ fmt(shownMarkers[hover].gap, 1) }} dB to limit</text>
            <text x="0" y="41" text-anchor="middle" class="ce-tipnote" :style="{ fill: 'var(--fec-surface)' }">{{ shownMarkers[hover].note }}</text>
          </g>
        </svg>
      </div>

      <div class="ce-legend">
        <label class="ce-toggle">
          <input type="checkbox" v-model="capStore.hardDecision">
          hard-decision BPSK (≈ +2 dB)
        </label>
        <div class="ce-hint">Hover a marker for its year, gap to the limit, and one-line note.</div>
      </div>
    </div>

    <!-- ================= overview / thumbnail placeholder ================= -->
    <template #fallback>
      <div class="ce-ph" :style="{ minHeight: mode === 'ebn0' ? '17rem' : '13rem' }">
        <div class="i-carbon-chart-line ce-ph-icon" />
        <div class="ce-ph-name">CapacityExplorer · {{ mode === 'ebn0' ? 'the Eb/N0 plane' : 'the capacity formula' }}</div>
      </div>
    </template>
  </RenderWhen>
</template>

<style scoped>
.ce {
  color: var(--fec-fg);
  display: flex;
  gap: 1.4rem;
  align-items: flex-start;
  flex-wrap: wrap;
  font-size: 0.9rem;
}
.ce-svg { width: 100%; height: auto; overflow: visible; touch-action: none; }
.ce-v1, .ce-v2 { flex: 1 1 320px; min-width: 300px; }
.ce-side { flex: 1 1 240px; min-width: 240px; display: flex; flex-direction: column; gap: 0.7rem; }
.ce-legend { flex: 1 1 200px; min-width: 200px; display: flex; flex-direction: column; gap: 0.5rem; }
.ce-tick { font-size: 11px; }
.ce-axis { font-size: 11px; font-style: italic; }
.ce-lab { font-size: 11px; font-weight: 700; }
.ce-mk { font-size: 10px; font-weight: 700; }

/* readout */
.ce-readout { line-height: 1.1; }
.ce-c { font-size: 2.6rem; font-weight: 800; letter-spacing: -0.02em; }
.ce-unit { font-size: 1.1rem; font-weight: 600; }
.ce-sub { font-size: 0.82rem; color: var(--fec-muted); }

/* controls */
.ce-ctl { display: flex; flex-direction: column; gap: 0.2rem; }
.ce-ctl label { font-size: 0.82rem; color: var(--fec-muted); }
.ce-ctl input[type=range] { width: 100%; accent-color: var(--fec-info); }
.ce-presets { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.ce-presets button {
  cursor: pointer; border: 1px solid var(--fec-line); border-radius: 0.4rem;
  background: var(--fec-surface-2); color: var(--fec-fg); font-size: 0.76rem; padding: 0.25rem 0.55rem;
}
.ce-presets button:hover { border-color: var(--fec-info); color: var(--fec-info); }
.ce-presets button.is-on { border-color: var(--fec-info); background: var(--fec-info-soft); color: var(--fec-info); font-weight: 600; }

.ce-note {
  font-size: 0.82rem; line-height: 1.4;
  border-radius: var(--fec-radius); border: 1px solid var(--fec-line); border-left-width: 4px;
  border-left-color: var(--fec-corrected); background: var(--fec-corrected-soft); padding: 0.5rem 0.7rem;
}

/* legend / toggle */
.ce-toggle { display: inline-flex; align-items: center; gap: 0.45rem; font-size: 0.84rem; cursor: pointer; }
.ce-toggle input { accent-color: var(--fec-parity); }
.ce-hint { font-size: 0.74rem; color: var(--fec-muted); }

/* tooltip */
.ce-tip { pointer-events: none; }
.ce-tiptitle { font-size: 11px; font-weight: 700; }
.ce-tipsub { font-size: 10px; }
.ce-tipnote { font-size: 9.5px; font-style: italic; }

/* overview placeholder */
.ce-ph {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
  width: 100%; border: 1.5px dashed var(--fec-line); border-radius: var(--fec-radius);
  background: var(--fec-surface-2); color: var(--fec-muted);
}
.ce-ph-icon { font-size: 1.6rem; color: var(--fec-info); }
.ce-ph-name { font-family: var(--slidev-code-font-family, monospace); font-size: 0.95rem; font-weight: 600; }
</style>
