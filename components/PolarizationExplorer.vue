<script setup lang="ts">
// Channel polarization made watchable (T11). Pure logic lives in snippets/polar.ts
// (unit-tested) so every on-screen number equals the tested one. Three views, one
// per embed on Part 5:
//   mode="tree"      (slide 4) — the BEC(ε) recursion splitting mediocre channels
//                    into great/terrible; histogram + "Z<0.1" counter + rate selector.
//   mode="butterfly" (slide 6) — the N=8 encoder butterfly; toggle u-bits, XORs
//                    propagate stage-by-stage; readout (N/2)·log₂N = 12.
//   mode="sc"        (slide 7) — SC decode walk. STRETCH → delivered as a scripted
//                    static-frame stepper: the injected û3 error cascades to u5/6/7.
//
// $clicks vs free-exploration: FREE-EXPLORATION by default (owns Step/Run/Reset,
// resets in onSlideLeave). Reason — matching RscEncoderStepper: all three Part 5
// host slides already spend their click budget on prose v-click reveals (slide 4:1,
// slide 6:1, slide 7:2), so reading $clicks would fight the slide's click stream.
// The spec requires guided modes be $clicks-drivable AND the explorer usable
// standalone, so a `guided` prop switches stepping to $clicks for presenter/standalone
// use; the deck embeds leave it false.
import { computed, ref } from 'vue'
import { onSlideLeave, useSlideContext } from '@slidev/client'
import { polarize, infoSet, butterflyStages, xorCount, type Z } from '../snippets/polar'

const props = withDefaults(defineProps<{
  mode?: 'tree' | 'butterfly' | 'sc'
  guided?: boolean
  maxN?: number
  height?: string
}>(), { mode: 'tree', guided: false, maxN: 8, height: '18rem' })

const { $clicks } = useSlideContext()

// ---- shared stepping (free-exploration owns state; guided reads $clicks) ------
const maxDepth = computed(() => Math.max(1, Math.round(Math.log2(props.maxN))))
const maxStep = computed(() =>
  props.mode === 'tree' ? maxDepth.value : props.mode === 'butterfly' ? 3 : 8)
const ownStep = ref(0)
const step = computed(() =>
  Math.min(props.guided ? ($clicks.value ?? 0) : ownStep.value, maxStep.value))

let runTimer: ReturnType<typeof setInterval> | null = null
function stopRun() { if (runTimer) { clearInterval(runTimer); runTimer = null } }
function reset() { stopRun(); ownStep.value = 0; if (props.mode === 'tree') { eps.value = 0.5; rate.value = null } if (props.mode === 'butterfly') u.value = DEFAULT_U.slice() }
function stepFwd() { stopRun(); if (ownStep.value < maxStep.value) ownStep.value++ }
function stepBack() { stopRun(); if (ownStep.value > 0) ownStep.value-- }
function run() {
  stopRun(); ownStep.value = 0
  runTimer = setInterval(() => {
    if (ownStep.value >= maxStep.value) { stopRun(); return }
    ownStep.value++
  }, 700)
}

// ---- quality colour of a channel by its erasure probability Z -----------------
function quality(v: number): { stroke: string, fill: string } {
  if (v < 0.2) return { stroke: 'var(--fec-corrected)', fill: 'var(--fec-corrected-soft)' } // good
  if (v > 0.8) return { stroke: 'var(--fec-error)', fill: 'var(--fec-error-soft)' } //          bad
  return { stroke: 'var(--fec-frozen)', fill: 'var(--fec-frozen-soft)' } //                      middling
}
function fmtDec(v: number) { return v < 0.01 ? v.toFixed(3) : v.toFixed(2) }
function fmtFrac(z: Z) { return z.num !== undefined ? `${z.num}/${z.den}` : fmtDec(z.value) }

// =============================== VIEW 1: TREE =================================
const eps = ref(0.5)
const rate = ref<number | null>(null)
const TW = 360 // tree svg width
const treeTopY = 26
const treeGap = computed(() => (200 - treeTopY) / Math.max(maxDepth.value, 1))

interface TNode { d: number, i: number, x: number, y: number, z: Z }
const levels = computed<Z[][]>(() =>
  Array.from({ length: step.value + 1 }, (_, d) => polarize(eps.value, d)))
const nodes = computed<TNode[]>(() => {
  const out: TNode[] = []
  levels.value.forEach((zs, d) => {
    const count = zs.length
    zs.forEach((z, i) => out.push({ d, i, x: (TW * (i + 0.5)) / count, y: treeTopY + d * treeGap.value, z }))
  })
  return out
})
const edges = computed(() => {
  const out: { x1: number, y1: number, x2: number, y2: number, worse: boolean }[] = []
  for (let d = 1; d <= step.value; d++) {
    const parent = polarize(eps.value, d - 1)
    const child = polarize(eps.value, d)
    child.forEach((_, i) => {
      const p = Math.floor(i / 2)
      out.push({
        x1: (TW * (p + 0.5)) / parent.length, y1: treeTopY + (d - 1) * treeGap.value,
        x2: (TW * (i + 0.5)) / child.length, y2: treeTopY + d * treeGap.value,
        worse: i % 2 === 0, // even child = W⁻ (2Z−Z², redder); odd = W⁺ (Z², greener)
      })
    })
  }
  return out
})
const leafZ = computed(() => polarize(eps.value, step.value))
const treeN = computed(() => leafZ.value.length)
const nodeR = computed(() => Math.max(9, Math.min(17, 150 / treeN.value)))
const isLeaf = (d: number) => d === step.value
const showFraction = computed(() => treeN.value <= 8)

// rate selector → info set on the current leaf level
const infoIdx = computed<Set<number>>(() => {
  if (rate.value === null) return new Set()
  const k = Math.ceil(rate.value * treeN.value)
  return new Set(infoSet(leafZ.value, k))
})
const infoList = computed(() => [...infoIdx.value].sort((a, b) => a - b))

// capacity story
const capacity = computed(() => 1 - eps.value)
const kLow = computed(() => leafZ.value.filter(z => z.value < 0.1).length)
const capTarget = computed(() => treeN.value * capacity.value)

// =========================== VIEW 2: BUTTERFLY ===============================
const N8 = 8
const FROZEN8 = new Set([0, 1, 2, 4]) // ε=0.5, R=½ frozen set (info {3,5,6,7})
const DEFAULT_U: (0 | 1)[] = [0, 0, 0, 1, 0, 0, 1, 1] // info bits pre-set for a lively trace
const u = ref<(0 | 1)[]>(DEFAULT_U.slice())
const bfStages = computed(() => butterflyStages(u.value, 3)) // 4 columns: input + 3 stages
const bfCols = 4
const colX = (c: number) => 40 + c * 100
const rowY = (r: number) => 24 + r * 26
// static butterfly edge structure for N=8 (independent of u)
const bfEdges = computed(() => {
  const out: { c: number, x1: number, y1: number, x2: number, y2: number, cross: boolean }[] = []
  for (let s = 0; s < 3; s++) {
    const m = 1 << s
    for (let i = 0; i < N8; i++) {
      out.push({ c: s, x1: colX(s), y1: rowY(i), x2: colX(s + 1), y2: rowY(i), cross: false }) // passthrough
      if ((i & m) === 0)
        out.push({ c: s, x1: colX(s), y1: rowY(i + m), x2: colX(s + 1), y2: rowY(i), cross: true }) // added term
    }
  }
  return out
})
const isXorNode = (c: number, r: number) => c > 0 && ((r & (1 << (c - 1))) === 0)
function toggleU(i: number) {
  if (props.guided || FROZEN8.has(i)) return
  const w = u.value.slice(); w[i] = (w[i] ^ 1) as 0 | 1; u.value = w
}

// =============================== VIEW 3: SC ==================================
// Scripted static-frame walk (SC decoder descoped to a deterministic story):
// decisions run left→right; frozen leaves are free; û3 is the injected flip and
// u5/u6/u7 cascade from it — "one wrong turn kills the block".
const SC_ORDER = [0, 1, 2, 3, 4, 5, 6, 7]
interface ScCell { i: number, frozen: boolean, bit: number, wrong: boolean }
const scCells = computed<ScCell[]>(() => SC_ORDER.slice(0, step.value).map((i) => {
  const frozen = FROZEN8.has(i)
  const wrong = !frozen && i >= 3 // û3 is the injected error; every later info bit cascades
  return { i, frozen, bit: frozen ? 0 : 1, wrong }
}))
const scDone = computed(() => step.value >= 8)
const scCaption = computed(() => {
  const last = scCells.value[scCells.value.length - 1]
  if (!last) return 'Press Step — SC decides û₀ … û₇ left to right; frozen bits are known for free.'
  if (last.frozen) return `û${last.i} is frozen → 0 (known, no risk).`
  if (last.i === 3) return 'û₃ decided from a flipped LLR — WRONG. SC commits and never looks back.'
  return `û${last.i} is computed from earlier decisions incl. û₃ → the error cascades.`
})

// ---- lifecycle ---------------------------------------------------------------
onSlideLeave(() => { stopRun(); ownStep.value = 0; eps.value = 0.5; rate.value = null; u.value = DEFAULT_U.slice() })

const RATES = [{ label: 'R=¼', r: 0.25 }, { label: 'R=½', r: 0.5 }, { label: 'R=¾', r: 0.75 }]
function onEps(e: Event) { eps.value = (e.target as HTMLInputElement).valueAsNumber }
function setRate(r: number) { rate.value = rate.value === r ? null : r }

// histogram: bin the current leaf level's Z into 5 buckets
const histBins = computed(() => {
  const bins = [0, 0, 0, 0, 0]
  for (const z of leafZ.value) bins[Math.min(4, Math.floor(z.value * 5))]++
  return bins
})
const histMax = computed(() => Math.max(1, ...histBins.value))
</script>

<template>
  <RenderWhen context="main">
    <div class="pe" :style="{ minHeight: height }">

      <!-- ========================= VIEW 1: TREE ========================= -->
      <template v-if="mode === 'tree'">
        <div class="pe-treewrap">
          <svg :viewBox="`0 0 ${TW} 210`" class="pe-tree" role="img" aria-label="polarization tree">
            <line v-for="(e, k) in edges" :key="`e${k}`" :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
              :style="{ stroke: e.worse ? 'var(--fec-error)' : 'var(--fec-corrected)' }" stroke-width="1.4" opacity="0.55" />
            <g v-for="nd in nodes" :key="`n${nd.d}-${nd.i}`">
              <circle :cx="nd.x" :cy="nd.y" :r="nodeR"
                :style="{ fill: quality(nd.z.value).fill, stroke: infoIdx.has(nd.i) && isLeaf(nd.d) ? 'var(--fec-info)' : quality(nd.z.value).stroke }"
                :stroke-width="infoIdx.has(nd.i) && isLeaf(nd.d) ? 3 : 1.6" />
              <text :x="nd.x" :y="nd.y + 3" text-anchor="middle" class="pe-nz" :style="{ fill: quality(nd.z.value).stroke }">{{ fmtDec(nd.z.value) }}</text>
              <text v-if="isLeaf(nd.d) && showFraction" :x="nd.x" :y="nd.y + nodeR + 10" text-anchor="middle" class="pe-nf">{{ fmtFrac(nd.z) }}</text>
            </g>
          </svg>

          <svg viewBox="0 0 110 210" class="pe-hist" role="img" aria-label="Z histogram">
            <text x="55" y="12" text-anchor="middle" class="pe-htitle">Z distribution</text>
            <g v-for="(b, i) in histBins" :key="`h${i}`">
              <rect :x="6 + i * 20" :y="196 - (b / histMax) * 150" :width="16" :height="(b / histMax) * 150" rx="2"
                :style="{ fill: i === 0 ? 'var(--fec-corrected)' : i === 4 ? 'var(--fec-error)' : 'var(--fec-frozen)' }" opacity="0.85" />
              <text :x="14 + i * 20" y="206" text-anchor="middle" class="pe-hx">{{ (i * 0.2).toFixed(1) }}</text>
            </g>
          </svg>
        </div>

        <div class="pe-ctl">
          <label class="pe-slider">ε <b class="fec-tnum">{{ eps.toFixed(1) }}</b>
            <input type="range" min="0.1" max="0.9" step="0.1" :value="eps" @input="onEps" :disabled="guided">
          </label>
          <div v-if="!guided" class="pe-btns">
            <button type="button" @click="stepBack" :disabled="step === 0">‹</button>
            <button type="button" @click="stepFwd" :disabled="step >= maxStep">Step ›</button>
            <button type="button" @click="run">Run</button>
            <button type="button" @click="reset">Reset</button>
          </div>
          <div class="pe-rates" role="group" aria-label="rate">
            <button v-for="rr in RATES" :key="rr.label" type="button" :class="{ 'is-on': rate === rr.r }" @click="setRate(rr.r)">{{ rr.label }}</button>
          </div>
        </div>

        <div class="pe-counter fec-tnum">
          <span>N = <b>{{ treeN }}</b></span>
          <span>channels Z&lt;0.1: <b :style="{ color: 'var(--fec-corrected)' }">{{ kLow }}/{{ treeN }}</b></span>
          <span :style="{ color: 'var(--fec-muted)' }">capacity 1−ε = {{ capacity.toFixed(1) }} → {{ capTarget.toFixed(1) }} of {{ treeN }}</span>
        </div>
        <div v-if="rate !== null" class="pe-info">
          <span class="fec-chip-info">info {{ '{' + infoList.join(',') + '}' }}</span>
          <span v-if="eps !== 0.5" :style="{ color: 'var(--fec-muted)' }">— the info set moves with ε; 5G freezes ONE universal sequence instead.</span>
        </div>
      </template>

      <!-- ======================= VIEW 2: BUTTERFLY ======================= -->
      <template v-else-if="mode === 'butterfly'">
        <svg viewBox="0 0 440 236" class="pe-bf" role="img" aria-label="N=8 encoder butterfly">
          <line v-for="(e, k) in bfEdges" :key="`be${k}`" :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
            :style="{ stroke: e.c < step ? 'var(--fec-fg)' : 'var(--fec-line)' }" :stroke-width="e.c < step ? 1.6 : 1" :opacity="e.cross ? 0.9 : 0.5" />
          <template v-for="c in bfCols" :key="`col${c - 1}`">
            <g v-for="r in N8" :key="`nd${c - 1}-${r - 1}`">
              <circle :cx="colX(c - 1)" :cy="rowY(r - 1)" :r="10"
                :class="{ 'pe-uclick': c - 1 === 0 && !FROZEN8.has(r - 1) && !guided }"
                :style="{
                  fill: bfStages[c - 1][r - 1] === 1 ? 'var(--fec-info-soft)' : 'var(--fec-surface-2)',
                  stroke: c - 1 === 0 && FROZEN8.has(r - 1) ? 'var(--fec-frozen)' : bfStages[c - 1][r - 1] === 1 ? 'var(--fec-info)' : 'var(--fec-line)',
                  opacity: c - 1 <= step ? 1 : 0.3,
                }"
                :stroke-width="isXorNode(c - 1, r - 1) ? 2 : 1.4"
                @click="c - 1 === 0 && toggleU(r - 1)" />
              <text :x="colX(c - 1)" :y="rowY(r - 1) + 4" text-anchor="middle" class="pe-bfbit"
                :style="{ fill: c - 1 === 0 && FROZEN8.has(r - 1) ? 'var(--fec-frozen)' : bfStages[c - 1][r - 1] === 1 ? 'var(--fec-info)' : 'var(--fec-muted)', opacity: c - 1 <= step ? 1 : 0.3 }">{{ bfStages[c - 1][r - 1] }}</text>
            </g>
          </template>
          <text v-for="r in N8" :key="`ul${r - 1}`" :x="16" :y="rowY(r - 1) + 4" text-anchor="middle" class="pe-bflab"
            :style="{ fill: FROZEN8.has(r - 1) ? 'var(--fec-frozen)' : 'var(--fec-info)' }">u{{ r - 1 }}</text>
          <text v-for="r in N8" :key="`xl${r - 1}`" :x="424" :y="rowY(r - 1) + 4" text-anchor="middle" class="pe-bflab" :style="{ fill: 'var(--fec-fg)' }">x{{ r - 1 }}</text>
        </svg>

        <div class="pe-ctl">
          <div v-if="!guided" class="pe-btns">
            <button type="button" @click="stepBack" :disabled="step === 0">‹ stage</button>
            <button type="button" @click="stepFwd" :disabled="step >= maxStep">stage ›</button>
            <button type="button" @click="reset">Reset</button>
          </div>
          <div class="pe-counter fec-tnum">
            <span>stage <b>{{ step }}</b>/3</span>
            <span>XORs = (N/2)·log₂N = <b :style="{ color: 'var(--fec-corrected)' }">{{ xorCount(3) }}</b></span>
          </div>
        </div>
        <div class="pe-hint">Click a blue u-bit to toggle it · frozen bits (gray) are locked at 0.</div>
      </template>

      <!-- ========================== VIEW 3: SC ========================== -->
      <template v-else>
        <div class="pe-scwrap">
          <div class="pe-scrow fec-tnum">
            <div v-for="i in N8" :key="`sc${i - 1}`" class="pe-sccell"
              :class="{
                'is-pending': (i - 1) >= step,
                'is-frozen': scCells[i - 1] && scCells[i - 1].frozen,
                'is-wrong': scCells[i - 1] && scCells[i - 1].wrong,
                'is-ok': scCells[i - 1] && !scCells[i - 1].frozen && !scCells[i - 1].wrong,
              }">
              <div class="pe-scname">û{{ i - 1 }}</div>
              <div class="pe-scbit">
                <template v-if="(i - 1) < step">{{ scCells[i - 1].bit }}<span v-if="scCells[i - 1].wrong"> ✗</span></template>
                <template v-else>·</template>
              </div>
              <div class="pe-sctag">{{ (i - 1) < step ? (scCells[i - 1].frozen ? 'frozen' : 'info') : '' }}</div>
            </div>
          </div>
          <div class="pe-sccap" :class="{ 'is-bad': scCells.length && scCells[scCells.length - 1].wrong }">{{ scCaption }}</div>
          <div v-if="scDone" class="pe-banner is-bad">
            <div class="i-carbon-warning-alt" /> One wrong turn killed the block — û₃ wrong, and every later info bit inherited the mistake. (SCL+CRC is the fix, next slide.)
          </div>
        </div>
        <div v-if="!guided" class="pe-ctl">
          <div class="pe-btns">
            <button type="button" @click="stepBack" :disabled="step === 0">‹</button>
            <button type="button" @click="stepFwd" :disabled="step >= maxStep">decide ›</button>
            <button type="button" @click="run">Run</button>
            <button type="button" @click="reset">Reset</button>
          </div>
        </div>
      </template>
    </div>

    <!-- ===================== static PDF fallback ===================== -->
    <template #fallback>
      <div class="pe">
        <!-- tree final frame with values (spec fallback); other modes show their final state -->
        <div v-if="mode === 'butterfly'" class="pe-fbtxt fec-tnum">N=8 encoder butterfly — u·G₂^⊗³, (N/2)·log₂N = 12 XORs, all 3 stages propagated.</div>
        <div v-else-if="mode === 'sc'" class="pe-fbtxt fec-tnum">SC decode walk on N=8 — û₃ wrong → u5/u6/u7 cascade. One wrong turn kills the block.</div>
        <svg :viewBox="`0 0 ${TW} 210`" class="pe-tree" role="img" aria-label="polarization tree N=8">
          <line v-for="(e, k) in edges" :key="`fe${k}`" :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
            :style="{ stroke: e.worse ? 'var(--fec-error)' : 'var(--fec-corrected)' }" stroke-width="1.4" opacity="0.55" />
          <g v-for="nd in nodes" :key="`fn${nd.d}-${nd.i}`">
            <circle :cx="nd.x" :cy="nd.y" :r="nodeR" :style="{ fill: quality(nd.z.value).fill, stroke: quality(nd.z.value).stroke }" stroke-width="1.6" />
            <text :x="nd.x" :y="nd.y + 3" text-anchor="middle" class="pe-nz" :style="{ fill: quality(nd.z.value).stroke }">{{ fmtDec(nd.z.value) }}</text>
            <text v-if="isLeaf(nd.d) && showFraction" :x="nd.x" :y="nd.y + nodeR + 10" text-anchor="middle" class="pe-nf">{{ fmtFrac(nd.z) }}</text>
          </g>
        </svg>
      </div>
    </template>
  </RenderWhen>
</template>

<style scoped>
.pe { color: var(--fec-fg); font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.5rem; }

/* tree */
.pe-treewrap { display: flex; gap: 0.4rem; align-items: stretch; }
.pe-tree { flex: 1 1 auto; width: 100%; max-width: 460px; height: auto; overflow: visible; }
.pe-hist { flex: 0 0 118px; height: auto; }
.pe-nz { font-size: 8.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.pe-nf { font-size: 8px; fill: var(--fec-muted); font-variant-numeric: tabular-nums; }
.pe-htitle { font-size: 8px; fill: var(--fec-muted); }
.pe-hx { font-size: 7px; fill: var(--fec-muted); }

/* controls (shared) */
.pe-ctl { display: flex; flex-wrap: wrap; align-items: center; gap: 0.7rem; }
.pe-slider { font-size: 0.8rem; color: var(--fec-muted); display: inline-flex; align-items: center; gap: 0.4rem; }
.pe-slider input { accent-color: var(--fec-info); }
.pe-btns { display: inline-flex; gap: 0.3rem; }
.pe-btns button, .pe-rates button {
  cursor: pointer; border: 1px solid var(--fec-line); border-radius: 0.4rem;
  background: var(--fec-surface-2); color: var(--fec-fg); font-size: 0.78rem; font-weight: 600; padding: 0.22rem 0.6rem;
}
.pe-btns button:hover:not(:disabled), .pe-rates button:hover { border-color: var(--fec-info); color: var(--fec-info); }
.pe-btns button:disabled { opacity: 0.4; cursor: default; }
.pe-rates { display: inline-flex; gap: 0.25rem; margin-left: auto; }
.pe-rates button.is-on { border-color: var(--fec-info); background: var(--fec-info-soft); color: var(--fec-info); }

.pe-counter { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.8rem; }
.pe-info { display: flex; align-items: center; gap: 0.6rem; font-size: 0.78rem; }

/* butterfly */
.pe-bf { width: 100%; max-width: 480px; height: auto; overflow: visible; align-self: center; }
.pe-bfbit { font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums; }
.pe-bflab { font-size: 9px; font-weight: 700; }
.pe-uclick { cursor: pointer; }
.pe-uclick:hover { filter: brightness(1.08); }
.pe-hint { font-size: 0.74rem; color: var(--fec-muted); }

/* sc */
.pe-scwrap { display: flex; flex-direction: column; gap: 0.5rem; }
.pe-scrow { display: flex; gap: 0.35rem; }
.pe-sccell {
  flex: 1; border: 1.5px solid var(--fec-line); border-radius: 0.4rem;
  padding: 0.3rem 0.1rem; text-align: center; background: var(--fec-surface-2);
}
.pe-sccell.is-pending { opacity: 0.4; }
.pe-sccell.is-frozen { border-color: var(--fec-frozen); background: var(--fec-frozen-soft); }
.pe-sccell.is-ok { border-color: var(--fec-corrected); background: var(--fec-corrected-soft); }
.pe-sccell.is-wrong { border-color: var(--fec-error); background: var(--fec-error-soft); }
.pe-scname { font-size: 0.72rem; font-weight: 700; }
.pe-scbit { font-size: 1.1rem; font-weight: 700; }
.pe-sctag { font-size: 0.62rem; color: var(--fec-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.pe-sccap { font-size: 0.82rem; color: var(--fec-fg); min-height: 1.4em; }
.pe-sccap.is-bad { color: var(--fec-error); font-weight: 600; }

.pe-banner {
  display: flex; align-items: center; gap: 0.5rem;
  border-radius: var(--fec-radius); border: 1px solid var(--fec-line); border-left-width: 4px;
  border-left-color: var(--fec-error); background: var(--fec-error-soft);
  padding: 0.5rem 0.8rem; font-size: 0.82rem; line-height: 1.4;
}
.pe-banner [class^='i-'] { font-size: 1.2rem; flex: none; }
.pe-fbtxt { font-size: 0.78rem; color: var(--fec-muted); }
</style>
