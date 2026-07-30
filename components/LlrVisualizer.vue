<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onSlideLeave, useSlideContext } from '@slidev/client'
import { llrBpsk, llrMaxLogQam16 } from '../snippets/llr'

// LLR = sign (the decision) + magnitude (the confidence). Three views (T05):
//  1. BPSK/AWGN — drag the received sample, watch LLR = 2y/σ² flip at 0 and
//     collapse as σ grows.
//  2. Repetition — slide 8's canonical case: soft LLR-sum beats hard majority.
//  3. 16QAM — Gray-mapped max-log demapping: outer bits are more reliable than
//     inner bits at the same noise.
// Convention (styles/CONVENTIONS.md): positive LLR ⇒ bit 0. We colour the
// bit-0 hypothesis blue (info) and the bit-1 hypothesis amber throughout.

useSlideContext() // ensure slide context (also lets $clicks exist if a slide adds them)

type Tab = 'bpsk' | 'rep' | 'qam'
const tab = ref<Tab>('bpsk')

// ---- shared 1-D axis geometry (tabs 1 & 2) --------------------------------
const W = 520
const XPADL = 40
const XPADR = 40
const plotW = W - XPADL - XPADR
const XMIN = -2.5
const XMAX = 2.5
const xOf = (v: number) => XPADL + ((v - XMIN) / (XMAX - XMIN)) * plotW
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const valFromClientX = (cx: number, rect: DOMRect) =>
  clamp(XMIN + (((cx - rect.left) / rect.width) * W - XPADL) / plotW * (XMAX - XMIN), XMIN, XMAX)

// ---- pointer-drag plumbing -------------------------------------------------
let moveHandler: ((e: PointerEvent) => void) | null = null
function endDrag() {
  if (moveHandler) document.removeEventListener('pointermove', moveHandler)
  document.removeEventListener('pointerup', endDrag)
  moveHandler = null
}
function beginDrag(svg: SVGSVGElement | null, apply: (cx: number, cy: number, rect: DOMRect) => void, e: PointerEvent) {
  if (!svg) return
  e.preventDefault()
  const run = (ev: PointerEvent) => apply(ev.clientX, ev.clientY, svg.getBoundingClientRect())
  run(e)
  moveHandler = run
  document.addEventListener('pointermove', moveHandler)
  document.addEventListener('pointerup', endDrag)
}

// ================= Tab 1 — BPSK / AWGN =====================================
const bpskSvg = ref<SVGSVGElement | null>(null)
const y = ref(0.6)
const sigma = ref(0.7)
const sigma2 = computed(() => sigma.value * sigma.value)
const llr = computed(() => llrBpsk(y.value, sigma2.value))
const decideZero = computed(() => llr.value >= 0)
const CURVE_H = 120
const CURVE_TOP = 24
const K = 90 // pdf → px vertical scale (fixed, so larger σ visibly flattens)
const gauss = (x: number, mu: number, s: number) =>
  Math.exp(-((x - mu) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI))
function curvePath(mu: number) {
  const pts: string[] = []
  for (let i = 0; i <= 100; i++) {
    const xv = XMIN + (i / 100) * (XMAX - XMIN)
    const py = CURVE_TOP + CURVE_H - gauss(xv, mu, sigma.value) * K
    pts.push(`${xOf(xv).toFixed(1)},${py.toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
}
const curve0 = computed(() => curvePath(1))
const curve1 = computed(() => curvePath(-1))
const yMarkerX = computed(() => xOf(y.value))
const dragBpsk = (e: PointerEvent) =>
  beginDrag(bpskSvg.value, (cx, _cy, rect) => { y.value = Math.round(valFromClientX(cx, rect) * 100) / 100 }, e)
const LLR_CAP = 12
const llrBarFrac = computed(() => clamp(Math.abs(llr.value) / LLR_CAP, 0, 1))

// ================= Tab 2 — repetition (slide 8) ============================
const repSvg = ref<SVGSVGElement | null>(null)
const REP_DEFAULT = [0.9, -0.15, -0.25]
const REP_S2 = 0.5 // σ² = 0.5 ⇒ LLR = 4y (matches Part 2 slide 8)
const ys = reactive<number[]>([...REP_DEFAULT])
const repLlrs = computed(() => ys.map(v => llrBpsk(v, REP_S2)))
const repSum = computed(() => repLlrs.value.reduce((a, b) => a + b, 0))
const repSoftZero = computed(() => repSum.value >= 0)
const repHardOnes = computed(() => ys.filter(v => v < 0).length)
const repHardZero = computed(() => repHardOnes.value < ys.length / 2)
const repMismatch = computed(() => repSoftZero.value !== repHardZero.value)
function dragRep(idx: number, e: PointerEvent) {
  beginDrag(repSvg.value, (cx, _cy, rect) => { ys[idx] = Math.round(valFromClientX(cx, rect) * 100) / 100 }, e)
}
function resetRep() { ys.splice(0, ys.length, ...REP_DEFAULT) }

// ================= Tab 3 — 16QAM max-log ===================================
const qamSvg = ref<SVGSVGElement | null>(null)
const QW = 300
const QPAD = 30
const QSPAN = 4.2 // half-extent in symbol units (levels at ±1, ±3)
const qScale = (QW / 2 - QPAD) / QSPAN
const qC = QW / 2
const qPx = (v: number) => qC + v * qScale
const qPy = (v: number) => qC - v * qScale
const QLEVELS = [-3, -1, 1, 3]
const z = reactive({ i: 0.6, q: -2.4 })
const sigmaQ = ref(0.9)
const sigmaQ2 = computed(() => sigmaQ.value * sigmaQ.value)
const qamLlrs = computed(() => llrMaxLogQam16(z, sigmaQ2.value))
const QAM_LABELS = ['b₀ · I outer', 'b₁ · I inner', 'b₂ · Q outer', 'b₃ · Q inner']
const QAM_CAP = 24
function dragQam(e: PointerEvent) {
  beginDrag(qamSvg.value, (cx, cy, rect) => {
    const fx = (cx - rect.left) / rect.width * QW
    const fy = (cy - rect.top) / rect.height * QW
    z.i = clamp(Math.round((fx - qC) / qScale * 100) / 100, -QSPAN, QSPAN)
    z.q = clamp(Math.round((qC - fy) / qScale * 100) / 100, -QSPAN, QSPAN)
  }, e)
}
const qamBoundaries = [0, 2, -2]

function fmt(v: number, d = 2) { return v.toFixed(d).replace('-', '−') }
function decColor(positive: boolean) { return positive ? 'var(--fec-info)' : 'var(--fec-parity)' }

onSlideLeave(() => {
  endDrag()
  y.value = 0.6; sigma.value = 0.7
  resetRep()
  z.i = 0.6; z.q = -2.4; sigmaQ.value = 0.9
  tab.value = 'bpsk'
})
</script>

<template>
  <RenderWhen context="main">
    <div class="lv">
      <div class="lv-tabs" role="tablist">
        <button type="button" role="tab" :aria-selected="tab === 'bpsk'" :class="{ 'is-active': tab === 'bpsk' }" @click="tab = 'bpsk'">BPSK · AWGN</button>
        <button type="button" role="tab" :aria-selected="tab === 'rep'" :class="{ 'is-active': tab === 'rep' }" @click="tab = 'rep'">Repetition</button>
        <button type="button" role="tab" :aria-selected="tab === 'qam'" :class="{ 'is-active': tab === 'qam' }" @click="tab = 'qam'">16QAM</button>
      </div>

      <!-- ============ Tab 1 — BPSK / AWGN ============ -->
      <div v-show="tab === 'bpsk'" class="lv-panel">
        <div class="lv-plot">
          <svg ref="bpskSvg" :viewBox="`0 0 ${W} 210`" class="lv-svg" @pointerdown="dragBpsk">
            <!-- likelihood curves -->
            <path :d="curve0" fill="none" :style="{ stroke: 'var(--fec-info)' }" stroke-width="2" />
            <path :d="curve1" fill="none" :style="{ stroke: 'var(--fec-parity)' }" stroke-width="2" />
            <text :x="xOf(1)" :y="CURVE_TOP - 8" text-anchor="middle" class="lv-tiny" :style="{ fill: 'var(--fec-info)' }">p(y | 0)</text>
            <text :x="xOf(-1)" :y="CURVE_TOP - 8" text-anchor="middle" class="lv-tiny" :style="{ fill: 'var(--fec-parity)' }">p(y | 1)</text>
            <!-- axis -->
            <line :x1="XPADL" :y1="CURVE_TOP + CURVE_H" :x2="W - XPADR" :y2="CURVE_TOP + CURVE_H" :style="{ stroke: 'var(--fec-line)' }" />
            <line :x1="xOf(0)" :y1="CURVE_TOP" :x2="xOf(0)" :y2="CURVE_TOP + CURVE_H + 6" :style="{ stroke: 'var(--fec-line)' }" stroke-dasharray="3 3" />
            <g v-for="t in [-2, -1, 0, 1, 2]" :key="t">
              <line :x1="xOf(t)" :y1="CURVE_TOP + CURVE_H" :x2="xOf(t)" :y2="CURVE_TOP + CURVE_H + 5" :style="{ stroke: 'var(--fec-line)' }" />
              <text :x="xOf(t)" :y="CURVE_TOP + CURVE_H + 18" text-anchor="middle" class="lv-tiny fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ t }}</text>
            </g>
            <text :x="W - XPADR" :y="CURVE_TOP + CURVE_H + 32" text-anchor="end" class="lv-tiny" :style="{ fill: 'var(--fec-muted)' }">received y</text>
            <!-- draggable sample -->
            <line :x1="yMarkerX" :y1="CURVE_TOP - 4" :x2="yMarkerX" :y2="CURVE_TOP + CURVE_H" :style="{ stroke: decColor(decideZero) }" stroke-width="2" />
            <circle :cx="yMarkerX" :cy="CURVE_TOP + CURVE_H" r="7" :style="{ fill: decColor(decideZero), cursor: 'ew-resize' }" />
          </svg>
        </div>

        <div class="lv-side">
          <div class="lv-ctl">
            <label>Noise σ <b class="fec-tnum">{{ fmt(sigma, 2) }}</b> <span class="lv-mut">(σ² = {{ fmt(sigma2, 2) }})</span></label>
            <input type="range" min="0.3" max="1.2" step="0.01" v-model.number="sigma">
          </div>
          <div class="lv-llrbar">
            <div class="lv-track">
              <div class="lv-mid" />
              <div class="lv-fill" :style="{ width: `${llrBarFrac * 50}%`, left: decideZero ? '50%' : undefined, right: decideZero ? undefined : '50%', background: decColor(decideZero) }" />
            </div>
            <div class="lv-scale"><span>bit 1</span><span>0</span><span>bit 0</span></div>
          </div>
          <div class="lv-readout">
            <div>LLR = 2y/σ² = <b class="fec-tnum" :style="{ color: decColor(decideZero) }">{{ fmt(llr, 2) }}</b></div>
            <div>hard decision: <b :style="{ color: decColor(decideZero) }">bit {{ decideZero ? 0 : 1 }}</b> · confidence <b class="fec-tnum">{{ fmt(Math.abs(llr), 2) }}</b></div>
          </div>
        </div>
      </div>

      <!-- ============ Tab 2 — repetition ============ -->
      <div v-show="tab === 'rep'" class="lv-panel">
        <div class="lv-plot">
          <svg ref="repSvg" :viewBox="`0 0 ${W} 120`" class="lv-svg">
            <line :x1="XPADL" :y1="60" :x2="W - XPADR" :y2="60" :style="{ stroke: 'var(--fec-line)' }" />
            <line :x1="xOf(0)" :y1="24" :x2="xOf(0)" :y2="96" :style="{ stroke: 'var(--fec-line)' }" stroke-dasharray="3 3" />
            <g v-for="t in [-2, -1, 0, 1, 2]" :key="t">
              <line :x1="xOf(t)" :y1="60" :x2="xOf(t)" :y2="65" :style="{ stroke: 'var(--fec-line)' }" />
              <text :x="xOf(t)" :y="80" text-anchor="middle" class="lv-tiny fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ t }}</text>
            </g>
            <g v-for="(v, idx) in ys" :key="idx">
              <line :x1="xOf(v)" :y1="30" :x2="xOf(v)" :y2="60" :style="{ stroke: v >= 0 ? 'var(--fec-info)' : 'var(--fec-parity)' }" stroke-width="2" />
              <circle :cx="xOf(v)" :cy="42" r="9" :style="{ fill: v >= 0 ? 'var(--fec-info)' : 'var(--fec-parity)', cursor: 'ew-resize' }" @pointerdown="dragRep(idx, $event)" />
              <text :x="xOf(v)" :y="46" text-anchor="middle" class="lv-idx">{{ idx + 1 }}</text>
            </g>
          </svg>
        </div>

        <div class="lv-side">
          <table class="lv-tbl fec-tnum">
            <thead><tr><th>y</th><th>hard</th><th>LLR = 4y</th></tr></thead>
            <tbody>
              <tr v-for="(v, idx) in ys" :key="idx">
                <td>{{ fmt(v, 2) }}</td>
                <td :style="{ color: v >= 0 ? 'var(--fec-info)' : 'var(--fec-parity)' }">{{ v >= 0 ? 0 : 1 }}</td>
                <td :style="{ color: v >= 0 ? 'var(--fec-info)' : 'var(--fec-parity)' }">{{ fmt(repLlrs[idx], 2) }}</td>
              </tr>
              <tr class="lv-sumrow"><td /><td>Σ</td><td :style="{ color: repSoftZero ? 'var(--fec-info)' : 'var(--fec-parity)' }"><b>{{ fmt(repSum, 2) }}</b></td></tr>
            </tbody>
          </table>
          <div class="lv-verdicts">
            <div class="lv-vd" :class="{ 'is-loser': repMismatch && !repHardZero }">
              hard majority → <b :style="{ color: repHardZero ? 'var(--fec-info)' : 'var(--fec-parity)' }">bit {{ repHardZero ? 0 : 1 }}</b>
            </div>
            <div class="lv-vd" :class="{ 'is-winner': repMismatch && repSoftZero }">
              soft LLR-sum → <b :style="{ color: repSoftZero ? 'var(--fec-info)' : 'var(--fec-parity)' }">bit {{ repSoftZero ? 0 : 1 }}</b>
            </div>
          </div>
          <div v-if="repMismatch" class="lv-note">Soft and hard disagree — one loud right bit outvotes two quiet wrong ones.</div>
          <button type="button" class="lv-reset" @click="resetRep">Restore canonical case</button>
        </div>
      </div>

      <!-- ============ Tab 3 — 16QAM ============ -->
      <div v-show="tab === 'qam'" class="lv-panel">
        <div class="lv-plot">
          <svg ref="qamSvg" :viewBox="`0 0 ${QW} ${QW}`" class="lv-qsvg" @pointerdown="dragQam">
            <!-- decision boundaries -->
            <template v-for="b in qamBoundaries" :key="`bx${b}`">
              <line :x1="qPx(b)" :y1="QPAD" :x2="qPx(b)" :y2="QW - QPAD" :style="{ stroke: 'var(--fec-line)' }" stroke-dasharray="3 4" />
              <line :x1="QPAD" :y1="qPy(b)" :x2="QW - QPAD" :y2="qPy(b)" :style="{ stroke: 'var(--fec-line)' }" stroke-dasharray="3 4" />
            </template>
            <!-- constellation -->
            <template v-for="iv in QLEVELS" :key="`i${iv}`">
              <path
                v-for="qv in QLEVELS" :key="`q${iv}_${qv}`"
                :d="`M ${qPx(iv) - 5} ${qPy(qv)} L ${qPx(iv) + 5} ${qPy(qv)} M ${qPx(iv)} ${qPy(qv) - 5} L ${qPx(iv)} ${qPy(qv) + 5}`"
                :style="{ stroke: 'var(--fec-muted)' }" stroke-width="1.6"
              />
            </template>
            <!-- received sample -->
            <circle :cx="qPx(z.i)" :cy="qPy(z.q)" r="8" :style="{ fill: 'var(--fec-error)', cursor: 'grab' }" fill-opacity="0.85" />
            <circle :cx="qPx(z.i)" :cy="qPy(z.q)" r="3" :style="{ fill: 'var(--fec-surface)' }" />
          </svg>
          <div class="lv-tiny lv-mut lv-center">click / drag to move the received sample</div>
        </div>

        <div class="lv-side">
          <div class="lv-ctl">
            <label>Noise σ <b class="fec-tnum">{{ fmt(sigmaQ, 2) }}</b></label>
            <input type="range" min="0.4" max="1.6" step="0.01" v-model.number="sigmaQ">
          </div>
          <div class="lv-qbars">
            <div v-for="(l, k) in qamLlrs" :key="k" class="lv-qbar">
              <span class="lv-qlab">{{ QAM_LABELS[k] }}</span>
              <div class="lv-track lv-qtrack">
                <div class="lv-mid" />
                <div class="lv-fill" :style="{ width: `${clamp(Math.abs(l) / QAM_CAP, 0, 1) * 50}%`, left: l >= 0 ? '50%' : undefined, right: l >= 0 ? undefined : '50%', background: decColor(l >= 0) }" />
              </div>
              <span class="lv-qval fec-tnum" :style="{ color: decColor(l >= 0) }">{{ fmt(l, 1) }}</span>
            </div>
          </div>
          <div class="lv-note">Outer bits (b₀, b₂) sit far from their boundary → high |LLR|. Inner bits (b₁, b₃) hug a boundary → weak, at the <em>same</em> noise.</div>
        </div>
      </div>
    </div>

    <!-- static PDF fallback: the BPSK/AWGN readout at the default sample -->
    <template #fallback>
      <div class="lv lv-fb">
        <div class="lv-readout">
          <div>BPSK · AWGN — <b class="fec-tnum">y = {{ fmt(y, 2) }}</b>, <b class="fec-tnum">σ = {{ fmt(sigma, 2) }}</b> (σ² = {{ fmt(sigma2, 2) }})</div>
          <div>LLR = 2y/σ² = <b class="fec-tnum" :style="{ color: decColor(decideZero) }">{{ fmt(llr, 2) }}</b></div>
          <div>hard decision: <b :style="{ color: decColor(decideZero) }">bit {{ decideZero ? 0 : 1 }}</b> · confidence <b class="fec-tnum">{{ fmt(Math.abs(llr), 2) }}</b></div>
        </div>
        <div class="lv-note">Live deck: drag the received sample and noise σ across the BPSK, repetition, and 16QAM tabs to see LLR = sign (decision) + magnitude (confidence).</div>
      </div>
    </template>
  </RenderWhen>
</template>

<style scoped>
.lv {
  color: var(--fec-fg);
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.lv-tabs { display: inline-flex; gap: 0.25rem; border: 1px solid var(--fec-line); border-radius: 0.5rem; padding: 0.2rem; width: fit-content; }
.lv-tabs button {
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--fec-muted);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.28rem 0.8rem;
  border-radius: 0.35rem;
}
.lv-tabs button.is-active { background: var(--fec-info-soft); color: var(--fec-info); }

.lv-panel { display: flex; gap: 1.4rem; align-items: flex-start; flex-wrap: wrap; }
.lv-plot { flex: 1 1 300px; min-width: 260px; }
.lv-svg { width: 100%; height: auto; overflow: visible; touch-action: none; }
.lv-qsvg { width: 100%; max-width: 300px; height: auto; overflow: visible; touch-action: none; cursor: crosshair; }
.lv-side { flex: 1 1 220px; min-width: 220px; display: flex; flex-direction: column; gap: 0.6rem; }
.lv-tiny { font-size: 11px; }
.lv-idx { font-size: 10px; font-weight: 700; fill: #fff; text-anchor: middle; pointer-events: none; }
.lv-mut { color: var(--fec-muted); }
.lv-center { text-align: center; display: block; margin-top: 0.2rem; }

.lv-ctl { display: flex; flex-direction: column; gap: 0.2rem; }
.lv-ctl label { font-size: 0.82rem; color: var(--fec-muted); }
.lv-ctl input[type=range] { width: 100%; accent-color: var(--fec-info); }

.lv-llrbar { display: flex; flex-direction: column; gap: 0.2rem; }
.lv-track { position: relative; height: 1.5rem; background: var(--fec-surface-2); border: 1px solid var(--fec-line); border-radius: 0.3rem; }
.lv-mid { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: var(--fec-muted); }
.lv-fill { position: absolute; top: 2px; bottom: 2px; border-radius: 0.2rem; transition: width 0.05s linear; }
.lv-scale { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--fec-muted); }

.lv-readout { font-size: 0.86rem; line-height: 1.5; }

.lv-tbl { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
.lv-tbl th { text-align: right; color: var(--fec-muted); font-weight: 600; font-size: 0.75rem; padding: 0.1rem 0.4rem; }
.lv-tbl td { text-align: right; padding: 0.1rem 0.4rem; }
.lv-sumrow td { border-top: 1px solid var(--fec-line); }
.lv-verdicts { display: flex; flex-direction: column; gap: 0.25rem; }
.lv-vd { font-size: 0.86rem; padding: 0.3rem 0.5rem; border-radius: 0.3rem; border: 1px solid var(--fec-line); }
.lv-vd.is-winner { border-color: var(--fec-corrected); background: var(--fec-corrected-soft); }
.lv-vd.is-loser { border-color: var(--fec-error); background: var(--fec-error-soft); }
.lv-note { font-size: 0.78rem; color: var(--fec-muted); line-height: 1.35; }
.lv-reset, .lv-note + .lv-reset {
  cursor: pointer; align-self: flex-start;
  border: 1px solid var(--fec-line); border-radius: 0.4rem;
  background: var(--fec-surface-2); color: var(--fec-fg);
  font-size: 0.78rem; padding: 0.2rem 0.7rem;
}
.lv-reset:hover { border-color: var(--fec-info); color: var(--fec-info); }

.lv-qbars { display: flex; flex-direction: column; gap: 0.35rem; }
.lv-qbar { display: grid; grid-template-columns: 5.5rem 1fr 2.4rem; align-items: center; gap: 0.4rem; }
.lv-qlab { font-size: 0.74rem; color: var(--fec-muted); }
.lv-qtrack { height: 1.1rem; }
.lv-qval { text-align: right; font-size: 0.8rem; }
</style>
