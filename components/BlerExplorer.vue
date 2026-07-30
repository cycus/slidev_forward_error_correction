<script setup lang="ts">
// BlerExplorer (T13): the quantitative centerpiece — published BLER/SINR data
// made explorable. Every curve/number is imported from snippets/blerData.ts
// (single source of truth; the T12 slide-5 reference table quotes the SAME
// figures so slide and component can never drift). Log-y BLER vs dB SINR on the
// shared plot util (styles/CONVENTIONS §4: log-y grid, integer-dB x ticks).
//
// $clicks vs free-exploration: a `guided` prop switches stepping to $clicks for
// the slide-5 embed — the scripted argument is pyAerial curve → 10% target →
// steepness callout → A/B redundancy arrow. Standalone (guided=false) it owns
// layer toggles / A/B pickers / block-length animation and resets in
// onSlideLeave (free-exploration rule, CONVENTIONS §3).
import { computed, reactive, ref } from 'vue'
import { onSlideLeave, useSlideContext } from '@slidev/client'
import { dbTicks, decadeTicks, linMap, logMap } from '../snippets/plot'
import {
  blockLenAnchors, blockLenEnvelope, lteCqi, pyAerialWaterfall,
  redundancyDeltaDb, snrAt10pctBler, urllcAnchors,
} from '../snippets/blerData'

const props = withDefaults(defineProps<{ guided?: boolean, height?: string }>(), {
  guided: false, height: '17rem',
})
const { $clicks } = useSlideContext()

function fmt(v: number, d = 1) { return v.toFixed(d).replace('-', '−') }

// ---------- plot geometry (shared look: log-y BLER, dB x) ----------
const P = { w: 480, h: 244, l: 46, r: 16, t: 12, b: 30 }
const xMap = linMap(-12, 22, P.l, P.w - P.r)
const yMap = logMap(1, 1e-5, P.t, P.h - P.b)
const yb = (b: number) => yMap(Math.min(1, Math.max(1e-5, b))) // clamp to axis floor (pyAerial's 8.8 dB point is bler=0)
const xticks = dbTicks(-12, 22, 4)
const yticks = decadeTicks(1e-5, 1)
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
function decadeLabel(v: number) {
  const e = Math.round(Math.log10(v))
  return e === 0 ? '1' : `10⁻${SUP[Math.abs(e)]}`
}

// ---------- layer geometry (derived once from the data) ----------
const pyPath = 'M ' + pyAerialWaterfall.map(p => `${xMap(p.snrDb).toFixed(1)},${yb(p.bler).toFixed(1)}`).join(' L ')
const pyPts = pyAerialWaterfall.map(p => ({ x: xMap(p.snrDb), y: yb(p.bler), row: p }))
const cqiPts = lteCqi.map(r => ({ x: xMap(r.snrDb), y: yb(0.1), row: r }))
const urllcPts = urllcAnchors.map(a => ({ x: xMap(a.snrDb), y: yb(a.bler), row: a }))

// idealized waterfalls (dashed, "interpolated" per blockLenIsInterpolated):
// slope steepens with n; each family member passes through its Sionna anchor.
function slopeFor(n: number) { return 1.5 + 0.9 * (Math.log10(n) - 2) }
function waterfall(x0: number, slope: number) {
  const pts: string[] = []
  for (let x = -12; x <= 22.001; x += 0.5) pts.push(`${xMap(x).toFixed(1)},${yb(10 ** (-(3 + slope * (x - x0)))).toFixed(1)}`)
  return 'M ' + pts.join(' L ')
}
const family = blockLenAnchors.map(a => ({
  n: a.n,
  d: waterfall(a.snrDb + (Math.log10(a.bler) + 3) / slopeFor(a.n), slopeFor(a.n)),
}))

// animated bold block-length curve: the BLER=1e-3 crossing interpolates the
// envelope (n=128 @3.5 dB → n=16000 @1.25 dB) as it slides left and steepens.
const E0 = Math.log10(blockLenEnvelope[0].n), E1 = Math.log10(blockLenEnvelope[1].n)
const blockV = ref(0) // 0..1 morph
const blockN = computed(() => Math.round(10 ** (E0 + blockV.value * (E1 - E0))))
const blockX0 = computed(() => blockLenEnvelope[0].snrAt1e3Db + blockV.value * (blockLenEnvelope[1].snrAt1e3Db - blockLenEnvelope[0].snrAt1e3Db))
const blockPath = computed(() => waterfall(blockX0.value, slopeFor(blockN.value)))

// ---------- crosshair: SNR of the pyAerial curve at the target BLER ----------
const target = ref(0.1) // 0.1 (10%) or 1e-5 (URLLC mode)
function crossingSnr(t: number) {
  const pts = pyAerialWaterfall.map(p => ({ s: p.snrDb, b: Math.max(p.bler, 1e-5) }))
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], c = pts[i + 1]
    if ((a.b - t) * (c.b - t) <= 0 && a.b !== c.b) {
      const f = (Math.log10(t) - Math.log10(a.b)) / (Math.log10(c.b) - Math.log10(a.b))
      return a.s + f * (c.s - a.s)
    }
  }
  return null
}
const cross = computed(() => crossingSnr(target.value))

// ---------- steepness callout (computed from pyAerial) ----------
const steep = (() => {
  const pts = pyAerialWaterfall.map(p => ({ s: p.snrDb, b: Math.max(p.bler, 1e-5) }))
  const i0 = pts.findIndex(p => p.b <= 0.1)
  let i1 = pts.length - 1
  while (i1 > i0 && pts[i1].b <= 1e-5) i1--
  return { dec: Math.log10(pts[i0].b / pts[i1].b), ddb: pts[i1].s - pts[i0].s, x0: pts[i0].s, x1: pts[i1].s, b0: pts[i0].b, b1: pts[i1].b }
})()

// ---------- A/B redundancy arrow (money interaction) ----------
const abA = ref(6), abB = ref(1) // free-mode CQI pickers; guided forces 6→1
const cqiHi = computed(() => props.guided ? 6 : Math.max(abA.value, abB.value))
const cqiLo = computed(() => props.guided ? 1 : Math.min(abA.value, abB.value))
const abDelta = computed(() => redundancyDeltaDb(cqiHi.value, cqiLo.value))
const abXhi = computed(() => xMap(snrAt10pctBler(cqiHi.value)))
const abXlo = computed(() => xMap(snrAt10pctBler(cqiLo.value)))
const abY = yb(0.1)

// ---------- stepping: guided reads $clicks; free owns toggles ----------
const MAX_STEP = 4
const step = computed(() => props.guided ? Math.min($clicks.value ?? 0, MAX_STEP) : 0)
const layers = reactive({ cqi: true, py: true, block: false, urllc: false })
const abMode = ref(false)
const steepOn = ref(false)

const showCqi = computed(() => props.guided ? true : layers.cqi)
const showPy = computed(() => props.guided ? step.value >= 1 : layers.py)
const showBlock = computed(() => props.guided ? false : layers.block)
const showUrllc = computed(() => props.guided ? false : layers.urllc)
const showTarget = computed(() => props.guided ? step.value >= 2 : true)
const showSteep = computed(() => props.guided ? step.value >= 3 : steepOn.value)
const showAB = computed(() => props.guided ? step.value >= 4 : abMode.value)

// ---------- provenance (legend reads it from the data) ----------
const SRC = {
  cqi: lteCqi[0].source,
  py: pyAerialWaterfall[0].source,
  block: blockLenAnchors[0].source,
  urllc: urllcAnchors[0].source,
}
const legend = computed(() => [
  showCqi.value && { key: 'cqi', color: 'var(--fec-frozen)', label: 'LTE CQI @10% BLER', src: SRC.cqi },
  showPy.value && { key: 'py', color: 'var(--fec-info)', label: 'pyAerial NR waterfall', src: SRC.py },
  showBlock.value && { key: 'block', color: 'var(--fec-corrected)', label: `Sionna block-length family (n=${blockN.value}, interpolated)`, src: SRC.block },
  showUrllc.value && { key: 'urllc', color: 'var(--fec-error)', label: 'URLLC anchors @1e-5', src: SRC.urllc },
].filter(Boolean) as { key: string, color: string, label: string, src: string }[])

// ---------- hover tooltip ----------
const hover = ref<{ x: number, y: number, l1: string, l2: string } | null>(null)

// ---------- block-length animation timer ----------
let timer: ReturnType<typeof setInterval> | null = null
function stopRun() { if (timer) { clearInterval(timer); timer = null } }
function runBlock() {
  stopRun(); blockV.value = 0
  timer = setInterval(() => {
    if (blockV.value >= 1) { stopRun(); return }
    blockV.value = Math.min(1, blockV.value + 0.05)
  }, 55)
}

onSlideLeave(() => {
  stopRun(); hover.value = null; blockV.value = 0; target.value = 0.1
  abMode.value = false; steepOn.value = false; abA.value = 6; abB.value = 1
  layers.cqi = true; layers.py = true; layers.block = false; layers.urllc = false
})
</script>

<template>
  <RenderWhen context="main">
    <div class="be" :style="{ minHeight: height }">
      <svg :viewBox="`0 0 ${P.w} ${P.h}`" class="be-svg" @pointerleave="hover = null">
        <defs>
          <clipPath id="be-clip"><rect :x="P.l" :y="P.t" :width="P.w - P.l - P.r" :height="P.h - P.t - P.b" /></clipPath>
        </defs>

        <!-- grid + axes -->
        <g v-for="t in yticks" :key="`gy${t}`">
          <line :x1="P.l" :y1="yMap(t)" :x2="P.w - P.r" :y2="yMap(t)" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1" stroke-dasharray="3 4" />
          <text :x="P.l - 6" :y="yMap(t) + 3" text-anchor="end" class="be-tick fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ decadeLabel(t) }}</text>
        </g>
        <line :x1="P.l" :y1="P.h - P.b" :x2="P.w - P.r" :y2="P.h - P.b" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.5" />
        <line :x1="P.l" :y1="P.t" :x2="P.l" :y2="P.h - P.b" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.5" />
        <g v-for="t in xticks" :key="`gx${t}`">
          <line :x1="xMap(t)" :y1="P.h - P.b" :x2="xMap(t)" :y2="P.h - P.b + 4" :style="{ stroke: 'var(--fec-line)' }" />
          <text :x="xMap(t)" :y="P.h - P.b + 15" text-anchor="middle" class="be-tick fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ fmt(t, 0) }}</text>
        </g>
        <text :x="P.w - P.r" :y="P.h - 2" text-anchor="end" class="be-axis" :style="{ fill: 'var(--fec-muted)' }">SINR (dB)</text>
        <text :x="P.l" :y="P.t - 2" text-anchor="start" class="be-axis" :style="{ fill: 'var(--fec-muted)' }">BLER</text>

        <g clip-path="url(#be-clip)">
          <!-- block-length family (dashed / interpolated) -->
          <template v-if="showBlock">
            <path v-for="c in family" :key="`fam${c.n}`" :d="c.d" fill="none" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.4" />
            <path :d="blockPath" fill="none" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2.4" stroke-dasharray="6 3" />
          </template>

          <!-- pyAerial NR waterfall -->
          <path v-if="showPy" :d="pyPath" fill="none" :style="{ stroke: 'var(--fec-info)' }" stroke-width="2.6" />

          <!-- target line -->
          <line v-if="showTarget" :x1="P.l" :y1="yb(target)" :x2="P.w - P.r" :y2="yb(target)" :style="{ stroke: 'var(--fec-error)' }" stroke-width="1.6" stroke-dasharray="6 3" />

          <!-- A/B redundancy arrow along the 10% line -->
          <g v-if="showAB">
            <line :x1="abXlo" :y1="abY" :x2="abXhi" :y2="abY" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="6" opacity="0.28" />
            <line :x1="abXhi" :y1="abY" :x2="abXlo" :y2="abY" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="2" marker-end="url(#be-ab)" />
          </g>
        </g>

        <defs>
          <marker id="be-ab" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" :style="{ fill: 'var(--fec-corrected)' }" />
          </marker>
        </defs>

        <!-- target readout marker + crosshair label -->
        <g v-if="showTarget && cross !== null">
          <circle :cx="xMap(cross)" :cy="yb(target)" r="4.5" :style="{ fill: 'var(--fec-error)' }" />
          <text :x="xMap(cross)" :y="yb(target) - 8" text-anchor="middle" class="be-lab fec-tnum" :style="{ fill: 'var(--fec-error)' }">
            SNR @ {{ target === 0.1 ? '10%' : '10⁻⁵' }} = {{ fmt(cross, 2) }} dB
          </text>
        </g>

        <!-- A/B delta label -->
        <text v-if="showAB" :x="(abXlo + abXhi) / 2" :y="abY + 18" text-anchor="middle" class="be-lab fec-tnum" :style="{ fill: 'var(--fec-corrected)' }">
          −{{ fmt(abDelta, 1) }} dB: redundancy bought this (CQI{{ cqiHi }}→CQI{{ cqiLo }})
        </text>

        <!-- steepness callout, computed from pyAerial -->
        <g v-if="showSteep">
          <line :x1="xMap(steep.x0)" :y1="yb(steep.b0)" :x2="xMap(steep.x0)" :y2="yb(steep.b1)" :style="{ stroke: 'var(--fec-fg)' }" stroke-width="1" opacity="0.6" />
          <line :x1="xMap(steep.x1)" :y1="yb(steep.b0)" :x2="xMap(steep.x1)" :y2="yb(steep.b1)" :style="{ stroke: 'var(--fec-fg)' }" stroke-width="1" opacity="0.6" />
          <text :x="xMap(steep.x1) + 6" :y="yb(steep.b1) + 12" text-anchor="start" class="be-lab fec-tnum" :style="{ fill: 'var(--fec-fg)' }">
            ≈{{ fmt(steep.dec, 1) }} decades in {{ fmt(steep.ddb, 1) }} dB
          </text>
        </g>

        <!-- CQI staircase points -->
        <g v-if="showCqi">
          <circle v-for="p in cqiPts" :key="`cq${p.row.cqi}`" :cx="p.x" :cy="p.y" r="3.6" :style="{ fill: 'var(--fec-frozen-soft)', stroke: 'var(--fec-frozen)', cursor: 'help' }" stroke-width="1.5"
            @pointerenter="hover = { x: p.x, y: p.y, l1: `CQI ${p.row.cqi} · ${p.row.modulation} ${p.row.codeRate1024}/1024`, l2: `${fmt(p.row.snrDb, 2)} dB @ 10% BLER · LTE/turbo` }" />
        </g>

        <!-- pyAerial points -->
        <g v-if="showPy">
          <circle v-for="(p, i) in pyPts" :key="`py${i}`" :cx="p.x" :cy="p.y" r="3" :style="{ fill: 'var(--fec-info)', cursor: 'help' }"
            @pointerenter="hover = { x: p.x, y: p.y, l1: `pyAerial ${fmt(p.row.snrDb, 1)} dB`, l2: p.row.bler === 0 ? 'below sim floor (clamped)' : `BLER ${p.row.bler}` }" />
        </g>

        <!-- URLLC anchors -->
        <g v-if="showUrllc">
          <rect v-for="(p, i) in urllcPts" :key="`ur${i}`" :x="p.x - 3.5" :y="p.y - 3.5" width="7" height="7" :style="{ fill: 'var(--fec-error-soft)', stroke: 'var(--fec-error)', cursor: 'help' }" stroke-width="1.5"
            @pointerenter="hover = { x: p.x, y: p.y, l1: `URLLC MCS${p.row.mcs} · ${fmt(p.row.snrDb, 2)} dB @1e-5`, l2: p.row.note || 'NR LDPC, 32-byte' }" />
        </g>

        <!-- tooltip -->
        <g v-if="hover" :transform="`translate(${Math.min(Math.max(hover.x, P.l + 90), P.w - P.r - 90)}, ${hover.y + 12})`" class="be-tip">
          <rect x="-92" y="0" width="184" height="30" rx="5" :style="{ fill: 'var(--fec-fg)' }" />
          <text x="0" y="13" text-anchor="middle" class="be-tipt" :style="{ fill: 'var(--fec-surface)' }">{{ hover.l1 }}</text>
          <text x="0" y="25" text-anchor="middle" class="be-tips fec-tnum" :style="{ fill: 'var(--fec-surface)' }">{{ hover.l2 }}</text>
        </g>
      </svg>

      <div class="be-note">AWGN link-level; sources differ — see tooltips.</div>

      <div class="be-legend">
        <span v-for="l in legend" :key="l.key" class="be-leg-item">
          <span class="be-swatch" :style="{ background: l.color }" /> {{ l.label }}
          <span class="be-src">· {{ l.src }}</span>
        </span>
      </div>

      <!-- free-exploration controls (hidden when the deck drives it via $clicks) -->
      <div v-if="!guided" class="be-ctl">
        <div class="be-btns">
          <button type="button" :class="{ 'is-on': layers.cqi }" @click="layers.cqi = !layers.cqi">CQI</button>
          <button type="button" :class="{ 'is-on': layers.py }" @click="layers.py = !layers.py">pyAerial</button>
          <button type="button" :class="{ 'is-on': layers.block }" @click="layers.block = !layers.block">block-len</button>
          <button type="button" :class="{ 'is-on': layers.urllc }" @click="layers.urllc = !layers.urllc">URLLC</button>
        </div>
        <div class="be-btns">
          <button type="button" :class="{ 'is-on': target !== 0.1 }" @click="target = target === 0.1 ? 1e-5 : 0.1">target {{ target === 0.1 ? '10%' : '10⁻⁵' }}</button>
          <button type="button" :class="{ 'is-on': steepOn }" @click="steepOn = !steepOn">steepness</button>
          <button type="button" :class="{ 'is-on': abMode }" @click="abMode = !abMode">A/B</button>
        </div>
        <label v-if="layers.block" class="be-slider">n <b class="fec-tnum">{{ blockN }}</b>
          <input type="range" min="0" max="1" step="0.02" v-model.number="blockV">
          <button type="button" @click="runBlock">▶</button>
        </label>
        <div v-if="abMode" class="be-ab">
          <label class="be-slider">CQI A <b class="fec-tnum">{{ abA }}</b><input type="range" min="1" max="15" step="1" v-model.number="abA"></label>
          <label class="be-slider">CQI B <b class="fec-tnum">{{ abB }}</b><input type="range" min="1" max="15" step="1" v-model.number="abB"></label>
        </div>
      </div>
    </div>

    <!-- static PDF fallback: all layers + target line -->
    <template #fallback>
      <div class="be" :style="{ minHeight: height }">
        <svg :viewBox="`0 0 ${P.w} ${P.h}`" class="be-svg">
          <g v-for="t in yticks" :key="`fy${t}`">
            <line :x1="P.l" :y1="yMap(t)" :x2="P.w - P.r" :y2="yMap(t)" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1" stroke-dasharray="3 4" />
            <text :x="P.l - 6" :y="yMap(t) + 3" text-anchor="end" class="be-tick fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ decadeLabel(t) }}</text>
          </g>
          <line :x1="P.l" :y1="P.h - P.b" :x2="P.w - P.r" :y2="P.h - P.b" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.5" />
          <line :x1="P.l" :y1="P.t" :x2="P.l" :y2="P.h - P.b" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.5" />
          <g v-for="t in xticks" :key="`fx${t}`">
            <text :x="xMap(t)" :y="P.h - P.b + 15" text-anchor="middle" class="be-tick fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ fmt(t, 0) }}</text>
          </g>
          <path v-for="c in family" :key="`ffam${c.n}`" :d="c.d" fill="none" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.4" />
          <path :d="pyPath" fill="none" :style="{ stroke: 'var(--fec-info)' }" stroke-width="2.6" />
          <line :x1="P.l" :y1="yb(0.1)" :x2="P.w - P.r" :y2="yb(0.1)" :style="{ stroke: 'var(--fec-error)' }" stroke-width="1.6" stroke-dasharray="6 3" />
          <circle v-for="p in cqiPts" :key="`fcq${p.row.cqi}`" :cx="p.x" :cy="p.y" r="3.4" :style="{ fill: 'var(--fec-frozen-soft)', stroke: 'var(--fec-frozen)' }" stroke-width="1.4" />
          <rect v-for="(p, i) in urllcPts" :key="`fur${i}`" :x="p.x - 3.5" :y="p.y - 3.5" width="7" height="7" :style="{ fill: 'var(--fec-error-soft)', stroke: 'var(--fec-error)' }" stroke-width="1.4" />
        </svg>
        <div class="be-note">BLER vs SINR (AWGN link-level): LTE CQI staircase, pyAerial NR waterfall, Sionna block-length family, URLLC anchors.</div>
      </div>
    </template>
  </RenderWhen>
</template>

<style scoped>
.be { color: var(--fec-fg); font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.4rem; }
.be-svg { width: 100%; height: auto; overflow: visible; touch-action: none; }
.be-tick { font-size: 10px; }
.be-axis { font-size: 10px; font-style: italic; }
.be-lab { font-size: 9.5px; font-weight: 700; }
.be-note { font-size: 0.72rem; font-style: italic; color: var(--fec-muted); }

.be-legend { display: flex; flex-wrap: wrap; gap: 0.6rem; font-size: 0.7rem; color: var(--fec-fg); }
.be-leg-item { display: inline-flex; align-items: center; gap: 0.3rem; }
.be-swatch { width: 12px; height: 3px; border-radius: 2px; display: inline-block; }
.be-src { color: var(--fec-muted); }

.be-ctl { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.7rem; }
.be-btns { display: inline-flex; gap: 0.3rem; }
.be-btns button {
  cursor: pointer; border: 1px solid var(--fec-line); border-radius: 0.4rem;
  background: var(--fec-surface-2); color: var(--fec-fg); font-size: 0.74rem; font-weight: 600; padding: 0.2rem 0.5rem;
}
.be-btns button:hover { border-color: var(--fec-info); color: var(--fec-info); }
.be-btns button.is-on { border-color: var(--fec-info); background: var(--fec-info-soft); color: var(--fec-info); }
.be-slider { font-size: 0.76rem; color: var(--fec-muted); display: inline-flex; align-items: center; gap: 0.35rem; }
.be-slider input { accent-color: var(--fec-info); }
.be-slider button { cursor: pointer; border: 1px solid var(--fec-line); border-radius: 0.35rem; background: var(--fec-surface-2); color: var(--fec-fg); font-size: 0.7rem; padding: 0.1rem 0.4rem; }
.be-ab { display: inline-flex; gap: 0.7rem; }
.be-tip { pointer-events: none; }
.be-tipt { font-size: 9.5px; font-weight: 700; }
.be-tips { font-size: 8.5px; }
</style>
