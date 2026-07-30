<script setup lang="ts">
// HarqIrDemo (T13): incremental-redundancy HARQ animated on the actual NR LDPC
// circular buffer. All arithmetic is imported from snippets/harq.ts (k0,
// effectiveRate, CANONICAL, canonicalEffectiveRates, RV_SELF_DECODABLE) — every
// displayed figure is a function output, never a template literal. The rate→SNR
// inset reads the LTE QPSK CQI anchors from snippets/blerData.ts (labelled
// illustrative).
//
// $clicks vs free-exploration: `guided` maps each click on slide 8 to one
// transmission in RV order {0,2,3,1}. Standalone it owns Step/Run/Reset, the
// Chase and BG2 toggles and the Zc/E sliders, and resets in onSlideLeave.
import { computed, ref } from 'vue'
import { onSlideLeave, useSlideContext } from '@slidev/client'
import { CANONICAL, RV_SELF_DECODABLE, effectiveRate, k0, type Bg } from '../snippets/harq'
import { lteCqi } from '../snippets/blerData'

const props = withDefaults(defineProps<{ guided?: boolean, height?: string }>(), {
  guided: false, height: '17rem',
})
const { $clicks } = useSlideContext()

function fmt(v: number, d = 1) { return v.toFixed(d).replace('-', '−') }

const K = CANONICAL.K
const rvOrder = CANONICAL.rvOrder
const MAX = rvOrder.length

// ---------- free-exploration parameters ----------
const bg = ref<Bg>('BG1')
const chase = ref(false)
const ZCS = [32, 48, 64, 96, 128]
const zcIdx = ref(1) // 48 — clean multiple; Ncb = den·Zc keeps k0 = {num}·Zc
const E = ref(CANONICAL.ePerTx)
const Zc = computed(() => ZCS[zcIdx.value])
// base-graph structure (geometry only, not shown as figures): info columns / RV denominator
const den = computed(() => bg.value === 'BG1' ? 66 : 50)
const Kb = computed(() => bg.value === 'BG1' ? 22 : 10)
const Ncb = computed(() => den.value * Zc.value)

// ---------- stepping ----------
const ownStep = ref(0)
const nTx = computed(() => Math.min(props.guided ? ($clicks.value ?? 0) : ownStep.value, MAX))

let timer: ReturnType<typeof setInterval> | null = null
function stopRun() { if (timer) { clearInterval(timer); timer = null } }
function stepFwd() { stopRun(); if (ownStep.value < MAX) ownStep.value++ }
function reset() { stopRun(); ownStep.value = 0 }
function run() {
  stopRun(); ownStep.value = 0
  timer = setInterval(() => {
    if (ownStep.value >= MAX) { stopRun(); return }
    ownStep.value++
  }, 900)
}

// ---------- donut geometry ----------
const cx = 120, cy = 120, rIn = 62, rOut = 95
const ang = (b: number) => -90 + 360 * (b / Ncb.value) // buffer position → degrees (top = 0, clockwise)
function pt(r: number, a: number) { const t = a * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)] }
function ringArc(a0: number, a1: number, ri: number, ro: number) {
  const large = ((a1 - a0) % 360 + 360) % 360 > 180 ? 1 : 0
  const [xo0, yo0] = pt(ro, a0), [xo1, yo1] = pt(ro, a1)
  const [xi1, yi1] = pt(ri, a1), [xi0, yi0] = pt(ri, a0)
  return `M ${xo0.toFixed(1)} ${yo0.toFixed(1)} A ${ro} ${ro} 0 ${large} 1 ${xo1.toFixed(1)} ${yo1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${ri} ${ri} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z`
}

const segs = computed(() => {
  const twoZc = 2 * Zc.value
  const sysEnd = Kb.value * Zc.value
  return {
    punct: ringArc(ang(0), ang(twoZc), rIn, rOut),
    sys: ringArc(ang(twoZc), ang(sysEnd), rIn, rOut),
    par: ringArc(ang(sysEnd), ang(Ncb.value), rIn, rOut),
  }
})

// RV pointers at k0 fractions
const pointers = computed(() => [0, 1, 2, 3].map((rv) => {
  const off = k0(bg.value, rv, Ncb.value, Zc.value)
  const a = ang(off)
  const [lx, ly] = pt(rOut + 13, a)
  const [tx, ty] = pt(rOut + 2, a)
  return { rv, off, num: Math.round(off / Zc.value), lx, ly, tx, ty }
}))

// transmitted arcs (opacity stacking = LLR combining; chase reuses RV0)
const txArcs = computed(() => {
  const out: { t: number, rv: number, d: string }[] = []
  for (let t = 1; t <= nTx.value; t++) {
    const rv = chase.value ? 0 : rvOrder[t - 1]
    const start = k0(bg.value, rv, Ncb.value, Zc.value)
    out.push({ t, rv, d: ringArc(ang(start), ang(start) + (E.value / Ncb.value) * 360, rIn + 4, rOut - 4) })
  }
  return out
})

// ---------- readouts ----------
const curRv = computed(() => nTx.value ? (chase.value ? 0 : rvOrder[nTx.value - 1]) : null)
const bitsSent = computed(() => E.value * nTx.value)
const uniqueBits = computed(() => chase.value ? E.value : bitsSent.value) // chase resends the same coded bits
const effRate = computed(() => nTx.value ? effectiveRate(K, uniqueBits.value) : null)
const selfDec = computed(() => curRv.value === null ? null : RV_SELF_DECODABLE.find(f => f.rv === curRv.value)!)

// ---------- rate → SNR inset (illustrative, from LTE QPSK CQI anchors) ----------
const QPSK = lteCqi.filter(r => r.modulation === 'QPSK')
  .map(r => ({ r: r.codeRate1024 / 1024, s: r.snrDb })).sort((a, b) => a.r - b.r)
function snrForRate(rate: number) {
  if (rate <= QPSK[0].r) return QPSK[0].s
  const last = QPSK.length - 1
  if (rate >= QPSK[last].r) {
    const f = (rate - QPSK[last].r) / (QPSK[last].r - QPSK[last - 1].r)
    return QPSK[last].s + f * (QPSK[last].s - QPSK[last - 1].s)
  }
  for (let i = 0; i < last; i++) {
    if (rate >= QPSK[i].r && rate <= QPSK[i + 1].r) {
      const f = (rate - QPSK[i].r) / (QPSK[i + 1].r - QPSK[i].r)
      return QPSK[i].s + f * (QPSK[i + 1].s - QPSK[i].s)
    }
  }
  return QPSK[last].s
}
// chase: fixed coding rate, energy combining ≈ +3 dB / doubling of transmissions
const CHASE_GAIN_DB = 3
const snrNeeded = computed(() => {
  if (!nTx.value) return null
  if (chase.value) return snrForRate(effectiveRate(K, E.value)) - CHASE_GAIN_DB * Math.log2(nTx.value)
  return snrForRate(effRate.value!)
})
const INS = { w: 236, x0: 20, x1: 226, dbMin: -14, dbMax: 6 }
const insX = (db: number) => INS.x0 + (Math.min(INS.dbMax, Math.max(INS.dbMin, db)) - INS.dbMin) / (INS.dbMax - INS.dbMin) * (INS.x1 - INS.x0)
const insTicks = [-12, -6, 0, 6]

// ---------- tooltip ----------
const hover = ref<{ x: number, y: number, l1: string, l2: string } | null>(null)

onSlideLeave(() => {
  stopRun(); ownStep.value = 0; chase.value = false; bg.value = 'BG1'
  zcIdx.value = 1; E.value = CANONICAL.ePerTx; hover.value = null
})
</script>

<template>
  <RenderWhen context="main">
    <div class="hq" :style="{ minHeight: height }">
      <div class="hq-main">
        <!-- circular buffer ring -->
        <svg viewBox="0 0 240 240" class="hq-ring" role="img" aria-label="NR LDPC circular buffer" @pointerleave="hover = null">
          <path :d="segs.par" :style="{ fill: 'var(--fec-parity-soft)', stroke: 'var(--fec-parity)' }" stroke-width="1" />
          <path :d="segs.sys" :style="{ fill: 'var(--fec-info-soft)', stroke: 'var(--fec-info)' }" stroke-width="1" />
          <path :d="segs.punct" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-line)' }" stroke-width="1" opacity="0.9" />

          <!-- transmitted redundancy (stacks as it wraps = LLR combining) -->
          <path v-for="a in txArcs" :key="`tx${a.t}`" :d="a.d" :style="{ fill: 'var(--fec-corrected)' }" opacity="0.26" />

          <!-- RV pointers -->
          <g v-for="p in pointers" :key="`rv${p.rv}`">
            <line :x1="cx" :y1="cy" :x2="p.tx" :y2="p.ty" :style="{ stroke: curRv === p.rv ? 'var(--fec-corrected)' : 'var(--fec-muted)' }" :stroke-width="curRv === p.rv ? 2 : 1" opacity="0.55" />
            <circle :cx="p.tx" :cy="p.ty" r="3.4" :style="{ fill: curRv === p.rv ? 'var(--fec-corrected)' : 'var(--fec-fg)', cursor: 'help' }"
              @pointerenter="hover = { x: p.tx, y: p.ty, l1: `RV${p.rv}: k₀ = ⌊${p.num}·N_cb/(${den}·Zc)⌋·Zc`, l2: `= ${p.off} bits · ${p.num}/${den} of buffer` }" />
            <text :x="p.lx" :y="p.ly + 3" text-anchor="middle" class="hq-rv fec-tnum" :style="{ fill: curRv === p.rv ? 'var(--fec-corrected)' : 'var(--fec-muted)' }">RV{{ p.rv }}</text>
          </g>

          <text :x="cx" :y="cy - 4" text-anchor="middle" class="hq-center fec-tnum" :style="{ fill: 'var(--fec-fg)' }">{{ chase ? 'Chase' : 'IR' }}</text>
          <text :x="cx" :y="cy + 12" text-anchor="middle" class="hq-centersub fec-tnum" :style="{ fill: 'var(--fec-muted)' }">Tx {{ nTx }}/{{ MAX }}</text>

          <!-- tooltip -->
          <g v-if="hover" :transform="`translate(${Math.min(Math.max(hover.x, 96), 144)}, ${hover.y + 10})`" class="hq-tip">
            <rect x="-96" y="0" width="192" height="30" rx="5" :style="{ fill: 'var(--fec-fg)' }" />
            <text x="0" y="13" text-anchor="middle" class="hq-tipt fec-tnum" :style="{ fill: 'var(--fec-surface)' }">{{ hover.l1 }}</text>
            <text x="0" y="25" text-anchor="middle" class="hq-tips fec-tnum" :style="{ fill: 'var(--fec-surface)' }">{{ hover.l2 }}</text>
          </g>
        </svg>

        <!-- readouts + inset -->
        <div class="hq-side">
          <div class="hq-legend">
            <span class="be-leg"><span class="hq-sw" :style="{ background: 'var(--fec-info)' }" /> systematic</span>
            <span class="be-leg"><span class="hq-sw" :style="{ background: 'var(--fec-parity)' }" /> parity</span>
            <span class="be-leg"><span class="hq-sw" :style="{ background: 'var(--fec-line)' }" /> punctured (2Zc)</span>
            <span class="be-leg"><span class="hq-sw" :style="{ background: 'var(--fec-corrected)' }" /> transmitted</span>
          </div>

          <div class="hq-read fec-tnum">
            <div><span class="hq-k">bits sent</span> <b>{{ bitsSent }}</b></div>
            <div><span class="hq-k">effective rate</span> <b :style="{ color: 'var(--fec-corrected)' }">{{ effRate === null ? '—' : fmt(effRate, 2) }}</b></div>
            <div v-if="selfDec">
              <span class="hq-k">RV{{ curRv }} self-decodable?</span>
              <b :style="{ color: selfDec.selfDecodable ? 'var(--fec-corrected)' : 'var(--fec-error)' }">{{ selfDec.selfDecodable ? '✓' : '✗' }}</b>
              <span class="hq-note">{{ selfDec.note }}</span>
            </div>
          </div>

          <!-- illustrative rate→SNR inset -->
          <svg :viewBox="`0 0 ${INS.w} 52`" class="hq-inset" role="img" aria-label="SNR needed at 10% BLER">
            <line :x1="INS.x0" y1="34" :x2="INS.x1" y2="34" :style="{ stroke: 'var(--fec-line)' }" stroke-width="1.4" />
            <g v-for="t in insTicks" :key="`it${t}`">
              <line :x1="insX(t)" y1="34" :x2="insX(t)" y2="38" :style="{ stroke: 'var(--fec-line)' }" />
              <text :x="insX(t)" y="48" text-anchor="middle" class="hq-itick fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ fmt(t, 0) }}</text>
            </g>
            <text :x="INS.x0" y="12" text-anchor="start" class="hq-ilab" :style="{ fill: 'var(--fec-muted)' }">SNR @10% BLER (illustrative)</text>
            <g v-if="snrNeeded !== null">
              <circle :cx="insX(snrNeeded)" cy="34" r="5" :style="{ fill: 'var(--fec-corrected)' }" />
              <text :x="insX(snrNeeded)" y="26" text-anchor="middle" class="hq-ival fec-tnum" :style="{ fill: 'var(--fec-corrected)' }">{{ fmt(snrNeeded, 1) }} dB</text>
            </g>
          </svg>
          <div v-if="chase" class="hq-note">Chase: same bits, energy only ≈ +{{ CHASE_GAIN_DB }} dB/doubling (theoretical).</div>
        </div>
      </div>

      <!-- free-exploration controls -->
      <div v-if="!guided" class="hq-ctl">
        <div class="hq-btns">
          <button type="button" @click="stepFwd" :disabled="nTx >= MAX">Tx ›</button>
          <button type="button" @click="run">Run</button>
          <button type="button" @click="reset">Reset</button>
        </div>
        <div class="hq-btns">
          <button type="button" :class="{ 'is-on': chase }" @click="chase = !chase">Chase</button>
          <button type="button" :class="{ 'is-on': bg === 'BG2' }" @click="bg = bg === 'BG1' ? 'BG2' : 'BG1'">{{ bg }}</button>
        </div>
        <label class="hq-slider">Zc <b class="fec-tnum">{{ Zc }}</b><input type="range" min="0" :max="ZCS.length - 1" step="1" v-model.number="zcIdx"></label>
        <label class="hq-slider">E <b class="fec-tnum">{{ E }}</b><input type="range" min="500" max="2000" step="250" v-model.number="E"></label>
      </div>
    </div>

    <!-- static PDF fallback: final frame, all four RV arcs -->
    <template #fallback>
      <div class="hq" :style="{ minHeight: height }">
        <svg viewBox="0 0 240 240" class="hq-ring" role="img" aria-label="NR LDPC circular buffer, four RV transmissions">
          <path :d="segs.par" :style="{ fill: 'var(--fec-parity-soft)', stroke: 'var(--fec-parity)' }" stroke-width="1" />
          <path :d="segs.sys" :style="{ fill: 'var(--fec-info-soft)', stroke: 'var(--fec-info)' }" stroke-width="1" />
          <path :d="segs.punct" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-line)' }" stroke-width="1" />
          <path v-for="rv in rvOrder" :key="`f${rv}`"
            :d="ringArc(ang(k0(bg, rv, Ncb, Zc)), ang(k0(bg, rv, Ncb, Zc)) + (E / Ncb) * 360, rIn + 4, rOut - 4)"
            :style="{ fill: 'var(--fec-corrected)' }" opacity="0.26" />
          <g v-for="p in pointers" :key="`fp${p.rv}`">
            <circle :cx="p.tx" :cy="p.ty" r="3.4" :style="{ fill: 'var(--fec-fg)' }" />
            <text :x="p.lx" :y="p.ly + 3" text-anchor="middle" class="hq-rv fec-tnum" :style="{ fill: 'var(--fec-muted)' }">RV{{ p.rv }}</text>
          </g>
          <text :x="cx" :y="cy" text-anchor="middle" class="hq-center fec-tnum" :style="{ fill: 'var(--fec-fg)' }">IR · 4 Tx</text>
        </svg>
      </div>
    </template>
  </RenderWhen>
</template>

<style scoped>
.hq { color: var(--fec-fg); font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.5rem; }
.hq-main { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start; }
.hq-ring { flex: 0 0 210px; width: 210px; height: auto; overflow: visible; touch-action: none; }
.hq-side { flex: 1 1 200px; min-width: 190px; display: flex; flex-direction: column; gap: 0.5rem; }

.hq-rv { font-size: 8.5px; font-weight: 700; }
.hq-center { font-size: 12px; font-weight: 800; }
.hq-centersub { font-size: 8.5px; }

.hq-legend { display: flex; flex-wrap: wrap; gap: 0.4rem 0.7rem; font-size: 0.68rem; }
.be-leg { display: inline-flex; align-items: center; gap: 0.3rem; }
.hq-sw { width: 11px; height: 4px; border-radius: 2px; display: inline-block; }

.hq-read { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.82rem; }
.hq-k { color: var(--fec-muted); }
.hq-note { font-size: 0.72rem; color: var(--fec-muted); font-style: italic; }

.hq-inset { width: 100%; height: auto; overflow: visible; }
.hq-itick { font-size: 8px; }
.hq-ilab { font-size: 8px; font-style: italic; }
.hq-ival { font-size: 9px; font-weight: 700; }

.hq-ctl { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.7rem; }
.hq-btns { display: inline-flex; gap: 0.3rem; }
.hq-btns button {
  cursor: pointer; border: 1px solid var(--fec-line); border-radius: 0.4rem;
  background: var(--fec-surface-2); color: var(--fec-fg); font-size: 0.76rem; font-weight: 600; padding: 0.2rem 0.55rem;
}
.hq-btns button:hover:not(:disabled) { border-color: var(--fec-info); color: var(--fec-info); }
.hq-btns button:disabled { opacity: 0.4; cursor: default; }
.hq-btns button.is-on { border-color: var(--fec-corrected); background: var(--fec-corrected-soft); color: var(--fec-corrected); }
.hq-slider { font-size: 0.76rem; color: var(--fec-muted); display: inline-flex; align-items: center; gap: 0.35rem; }
.hq-slider input { accent-color: var(--fec-info); width: 5rem; }
.hq-tip { pointer-events: none; }
.hq-tipt { font-size: 8.5px; font-weight: 700; }
.hq-tips { font-size: 8px; }
</style>
