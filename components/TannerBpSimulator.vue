<script lang="ts">
// Module-scope explore store (runs once, shared across instances). The explore
// panel's state deliberately SURVIVES navigating away and back (T07 spec), unlike
// the guided view which is a pure function of $clicks. Only slide 8 mounts the
// explore instance, so a single store is enough.
import { reactive } from 'vue'
import type { Algorithm, Bit } from '../snippets/bp'

export const exploreStore = reactive({
  codeId: 'tanner' as 'tanner' | 'trap',
  received: [1, 0, 1, 0, 1, 1] as Bit[], // canonical y: bit v1 arrived flipped
  p: 0.2,
  algorithm: 'sp' as Algorithm,
  step: 0, // index into the animation frames
})
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onSlideEnter, onSlideLeave, useSlideContext } from '@slidev/client'
import {
  H_TANNER, H_TRAP, TRAP_CODEWORD, FAIL_FLIPS,
  bpDecode, bscLlr, flipBits, hardDecision, syndrome,
  type Algorithm, type Bit, type Msg,
} from '../snippets/bp'

// Belief propagation made visible on Johnson's (2,3)-regular (6,3) Tanner graph
// (the same code drawn on Part 3 slide 3). Two modes:
//   guided  — slide 6, presenter-driven off $clicks: channel LLRs → VN→CN →
//             CN→VN (±0.7538) → posterior (v1 flips to bit 0, +0.12) → halt.
//   explore — slide 8, self-serve: flip received bits, change noise/algorithm,
//             step/auto-play, and a "flip 2 bits" preset that loads a small
//             trapping-set code (H_TRAP) which OSCILLATES and never converges.
// The UI is a pure renderer of bpDecode()'s trace; every number is pinned in
// bp.test.ts. Node labels are 1-based (v1…, c1…) to match the deck's slide 3.

const props = withDefaults(defineProps<{ mode?: 'guided' | 'explore' }>(), { mode: 'guided' })
const { $clicks } = useSlideContext()

// ---- graph geometry (generic over any H: checks on top, variables on bottom) ---
const GW = 580
const GH = 292
const PAD_X = 50
const CHECK_CY = 44
const CHECK_HALF = 15
const VAR_CY = 206
const VAR_R = 18

function xPositions(n: number): number[] {
  const span = GW - 2 * PAD_X
  return Array.from({ length: n }, (_, i) => PAD_X + (span * (i + 0.5)) / n)
}
interface Geom {
  checks: { x: number, y: number }[]
  vars: { x: number, y: number }[]
  edges: { c: number, v: number, path: string, mx: number, my: number }[]
}
function makeGeom(H: number[][]): Geom {
  const checks = xPositions(H.length).map(x => ({ x, y: CHECK_CY }))
  const vars = xPositions(H[0].length).map(x => ({ x, y: VAR_CY }))
  const edges: Geom['edges'] = []
  H.forEach((row, c) => row.forEach((on, v) => {
    if (!on) return
    const x1 = checks[c].x, y1 = CHECK_CY + CHECK_HALF
    const x2 = vars[v].x, y2 = VAR_CY - VAR_R
    const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2
    const ctrlX = midX + (GW / 2 - midX) * 0.12 // gentle bow toward the centre
    const path = `M ${x1.toFixed(1)},${y1} Q ${ctrlX.toFixed(1)},${midY.toFixed(1)} ${x2.toFixed(1)},${y2}`
    edges.push({ c, v, path, mx: 0.25 * x1 + 0.5 * ctrlX + 0.25 * x2, my: 0.25 * y1 + 0.5 * midY + 0.25 * y2 })
  }))
  return { checks, vars, edges }
}

// ---- active problem (guided is fixed; explore reads the store) ----------------
const activeH = computed(() => (props.mode === 'explore' && exploreStore.codeId === 'trap' ? H_TRAP : H_TANNER))
const activeReceived = computed<Bit[]>(() => (props.mode === 'explore' ? exploreStore.received : [1, 0, 1, 0, 1, 1]))
const activeP = computed(() => (props.mode === 'explore' ? exploreStore.p : 0.2))
const activeAlg = computed<Algorithm>(() => (props.mode === 'explore' ? exploreStore.algorithm : 'sp'))

const geom = computed(() => makeGeom(activeH.value))
const trace = computed(() => bpDecode(activeH.value, bscLlr(activeReceived.value, activeP.value), { algorithm: activeAlg.value, maxIter: 10 }))

// ---- flatten the trace into animation frames (channel → per iteration vc/cv/post) ---
type FrameKind = 'channel' | 'vc' | 'cv' | 'post'
interface Frame { kind: FrameKind, iter: number, llr: number[], msgs: Msg[], dir: 'up' | 'down' | null }
const frames = computed<Frame[]>(() => {
  const t = trace.value
  const out: Frame[] = [{ kind: 'channel', iter: 0, llr: t.channelLlr, msgs: [], dir: null }]
  let prev = t.channelLlr
  for (const it of t.iterations) {
    out.push({ kind: 'vc', iter: it.n, llr: prev, msgs: it.vnToCn, dir: 'up' })
    out.push({ kind: 'cv', iter: it.n, llr: prev, msgs: it.cnToVn, dir: 'down' })
    out.push({ kind: 'post', iter: it.n, llr: it.posterior, msgs: [], dir: null })
    prev = it.posterior
  }
  return out
})
const maxStep = computed(() => frames.value.length - 1)
const stepIndex = computed(() => Math.min(props.mode === 'guided' ? ($clicks.value ?? 0) : exploreStore.step, maxStep.value))
const frame = computed(() => frames.value[stepIndex.value])

// ---- per-frame render state ---------------------------------------------------
const hard = computed(() => hardDecision(frame.value.llr))
const checkSat = computed(() => syndrome(activeH.value, hard.value).map(s => s === 0))
const satisfied = computed(() => checkSat.value.filter(Boolean).length)
const msgByEdge = computed(() => {
  const m = new Map<string, number>()
  for (const msg of frame.value.msgs) m.set(`${msg.c},${msg.v}`, msg.value)
  return m
})
const converged = computed(() => trace.value.converged)
const atEnd = computed(() => stepIndex.value === maxStep.value)
const clicks = computed(() => $clicks.value ?? 0)
const showSuccess = computed(() => converged.value && (props.mode === 'guided' ? clicks.value >= 4 : atEnd.value && frame.value.kind === 'post'))
const showFailure = computed(() => !converged.value && atEnd.value && frame.value.kind === 'post')

const LLR_CAP = 3
const barFrac = (l: number) => Math.min(Math.abs(l) / LLR_CAP, 1)
const isZero = (l: number) => l >= 0
const decColor = (l: number) => (l >= 0 ? 'var(--fec-info)' : 'var(--fec-parity)')
function fmt(v: number, d = 2) { return v.toFixed(d).replace('-', '−') }

function edgeVal(edge: { c: number, v: number }) { return msgByEdge.value.get(`${edge.c},${edge.v}`) }
function edgeStroke(edge: { c: number, v: number }) {
  const val = edgeVal(edge)
  return val === undefined ? 'var(--fec-line)' : val >= 0 ? 'var(--fec-info)' : 'var(--fec-parity)'
}

// ---- caption (guided narration + explore status) ------------------------------
const caption = computed(() => {
  switch (frame.value.kind) {
    case 'channel': return 'Channel LLRs from the BSC (±1.386 at p = 0.2). v1 arrived flipped — its LLR argues bit 1.'
    case 'vc': return 'Half-iteration ①  VN → CN: every variable sends its current belief up to its checks.'
    case 'cv': return 'Half-iteration ②  CN → VN: each check replies from its OTHER bits — here every message is ±0.7538.'
    case 'post': return converged.value
      ? 'Posterior = channel + all replies. v1 flips to bit 0 (+0.12); every check is satisfied.'
      : 'Posterior updated — but the checks still disagree. The beliefs never settle.'
  }
  return ''
})

// ---- explore controls ---------------------------------------------------------
const entered = ref(false)
const playing = ref(false)
let raf = 0
let lastT = 0
function tick(t: number) {
  if (!playing.value) return
  if (!lastT) lastT = t
  if (t - lastT >= 480) {
    lastT = t
    if (exploreStore.step >= maxStep.value) { stop(); return }
    exploreStore.step++
  }
  raf = requestAnimationFrame(tick)
}
function play() {
  if (exploreStore.step >= maxStep.value) exploreStore.step = 0
  playing.value = true
  lastT = 0
  raf = requestAnimationFrame(tick)
}
function stop() {
  playing.value = false
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}
function stepHalf() { stop(); exploreStore.step = Math.min(exploreStore.step + 1, maxStep.value) }
function stepBack() { stop(); exploreStore.step = Math.max(exploreStore.step - 1, 0) }
function stepIterFn() {
  stop()
  let i = exploreStore.step + 1
  while (i < maxStep.value && frames.value[i].kind !== 'post') i++
  exploreStore.step = Math.min(i, maxStep.value)
}
const ALGS: { id: Algorithm, label: string }[] = [
  { id: 'sp', label: 'sum-product' },
  { id: 'ms', label: 'min-sum' },
  { id: 'nms', label: 'norm min-sum' },
]
function setAlg(a: Algorithm) { exploreStore.algorithm = a } // step clamps; frame count is stable per code
function onNoise(e: Event) { exploreStore.p = (e.target as HTMLInputElement).valueAsNumber; exploreStore.step = 0 }
function flipVar(v: number) {
  if (props.mode !== 'explore') return
  stop()
  const w = [...exploreStore.received]
  w[v] = (w[v] ^ 1) as Bit
  exploreStore.received = w
  exploreStore.step = 0
}
function loadFailure() {
  stop()
  exploreStore.codeId = 'trap'
  exploreStore.received = flipBits(TRAP_CODEWORD, FAIL_FLIPS)
  exploreStore.p = 0.1
  exploreStore.algorithm = 'sp'
  exploreStore.step = 0
}
function resetExplore() {
  stop()
  exploreStore.codeId = 'tanner'
  exploreStore.received = [1, 0, 1, 0, 1, 1]
  exploreStore.p = 0.2
  exploreStore.algorithm = 'sp'
  exploreStore.step = 0
}

// ---- hover inspection ---------------------------------------------------------
const hover = ref<{ x: number, y: number, label: string } | null>(null)
function onEdgeHover(edge: { c: number, v: number, mx: number, my: number }) {
  const val = edgeVal(edge)
  if (val === undefined) { hover.value = null; return }
  const arrow = frame.value.dir === 'up' ? `v${edge.v + 1} → c${edge.c + 1}` : `c${edge.c + 1} → v${edge.v + 1}`
  hover.value = { x: edge.mx, y: edge.my, label: `${arrow}  =  ${fmt(val, 4)}` }
}

onSlideEnter(() => { entered.value = true })
onSlideLeave(() => { entered.value = false; stop() }) // explore state persists; only the timer stops

// ---- static PDF fallback: canonical iteration-1 snapshot ----------------------
const FB_GEOM = makeGeom(H_TANNER)
const FB = bpDecode(H_TANNER, bscLlr([1, 0, 1, 0, 1, 1], 0.2), { algorithm: 'sp' })
const FB_POST = FB.iterations[0].posterior
const FB_HARD = FB.iterations[0].hard
const FB_MSG = new Map(FB.iterations[0].cnToVn.map(m => [`${m.c},${m.v}`, m.value]))
// resolve per-edge message values up front so the fallback template stays plain
const FB_EDGES = FB_GEOM.edges.map(e => ({ ...e, value: FB_MSG.get(`${e.c},${e.v}`) ?? 0 }))
</script>

<template>
  <RenderWhen context="main">
    <div class="tb" :class="`tb-${props.mode}`">
      <!-- ================= Tanner graph ================= -->
      <svg :viewBox="`0 0 ${GW} ${GH}`" class="tb-svg" @pointerleave="hover = null">
        <!-- edges: fat invisible hit area + visible (curved) stroke -->
        <g>
          <path
            v-for="e in geom.edges" :key="`hit${e.c}-${e.v}`" :d="e.path"
            fill="none" stroke="transparent" stroke-width="14" class="tb-hit"
            @pointerenter="onEdgeHover(e)" @pointermove="onEdgeHover(e)"
          />
          <path
            v-for="e in geom.edges" :key="`edge${e.c}-${e.v}`" :d="e.path" fill="none"
            class="tb-edge"
            :class="{
              'is-active': edgeVal(e) !== undefined,
              'flow-down': edgeVal(e) !== undefined && frame.dir === 'down',
              'flow-up': edgeVal(e) !== undefined && frame.dir === 'up',
              'is-playing': edgeVal(e) !== undefined && entered,
            }"
            :style="{ stroke: edgeStroke(e) }"
          />
        </g>

        <!-- check nodes (squares): green satisfied, red violated, neutral before decisions -->
        <g v-for="(c, i) in geom.checks" :key="`c${i}`">
          <rect
            :x="c.x - CHECK_HALF" :y="c.y - CHECK_HALF" :width="CHECK_HALF * 2" :height="CHECK_HALF * 2" rx="4"
            stroke-width="2"
            :style="{
              fill: checkSat[i] ? 'var(--fec-corrected-soft)' : 'var(--fec-error-soft)',
              stroke: checkSat[i] ? 'var(--fec-corrected)' : 'var(--fec-error)',
            }"
          />
          <text :x="c.x" :y="c.y + 4" text-anchor="middle" class="tb-nlab" :style="{ fill: checkSat[i] ? 'var(--fec-corrected)' : 'var(--fec-error)' }">c{{ i + 1 }}</text>
        </g>

        <!-- variable nodes (circles) coloured by current decision + LLR bar + value -->
        <g v-for="(vn, i) in geom.vars" :key="`v${i}`">
          <circle
            :cx="vn.x" :cy="vn.y" :r="VAR_R" stroke-width="2"
            :class="{ 'tb-vclick': props.mode === 'explore' }"
            :style="{ fill: isZero(frame.llr[i]) ? 'var(--fec-info-soft)' : 'var(--fec-parity-soft)', stroke: decColor(frame.llr[i]) }"
            @click="flipVar(i)"
          />
          <text :x="vn.x" :y="vn.y + 4" text-anchor="middle" class="tb-nlab" :style="{ fill: decColor(frame.llr[i]) }">v{{ i + 1 }}</text>
          <!-- LLR bar -->
          <g :transform="`translate(${vn.x - 22}, ${vn.y + VAR_R + 8})`">
            <rect x="0" y="0" width="44" height="6" rx="2" :style="{ fill: 'var(--fec-surface-2)', stroke: 'var(--fec-line)' }" stroke-width="0.75" />
            <line x1="22" y1="-1" x2="22" y2="7" :style="{ stroke: 'var(--fec-muted)' }" stroke-width="0.75" />
            <rect
              :x="isZero(frame.llr[i]) ? 22 : 22 - barFrac(frame.llr[i]) * 22" y="1"
              :width="barFrac(frame.llr[i]) * 22" height="4" rx="1.5" :style="{ fill: decColor(frame.llr[i]) }"
            />
          </g>
          <text :x="vn.x" :y="vn.y + VAR_R + 26" text-anchor="middle" class="tb-val fec-tnum" :style="{ fill: decColor(frame.llr[i]) }">{{ fmt(frame.llr[i]) }}</text>
        </g>

        <!-- hover tooltip -->
        <g v-if="hover" :transform="`translate(${hover.x}, ${hover.y})`" class="tb-tip">
          <rect x="-52" y="-24" width="104" height="19" rx="4" :style="{ fill: 'var(--fec-fg)' }" />
          <text x="0" y="-11" text-anchor="middle" class="tb-tiptext fec-tnum">{{ hover.label }}</text>
        </g>
      </svg>

      <!-- ================= guided caption ================= -->
      <div v-if="props.mode === 'guided'" class="tb-guide">
        <div class="tb-cap">{{ caption }}</div>
        <div v-if="showSuccess" class="tb-banner is-good">
          <div class="i-carbon-checkmark-outline" /> Syndrome = 0 → stop. Corrected in <b>1 iteration</b>.
        </div>
      </div>

      <!-- ================= explore controls ================= -->
      <div v-else class="tb-explore">
        <div class="tb-row">
          <div class="tb-seg" role="group" aria-label="algorithm">
            <button v-for="a in ALGS" :key="a.id" type="button" :class="{ 'is-on': activeAlg === a.id }" @click="setAlg(a.id)">
              {{ a.label }}
            </button>
          </div>
          <label class="tb-noise">
            noise p <b class="fec-tnum">{{ fmt(activeP, 2) }}</b>
            <input type="range" min="0.05" max="0.45" step="0.01" :value="activeP" @input="onNoise">
          </label>
        </div>

        <div class="tb-row">
          <div class="tb-btns">
            <button type="button" @click="stepBack" :disabled="stepIndex === 0">‹ back</button>
            <button type="button" @click="stepHalf" :disabled="atEnd">½ step</button>
            <button type="button" @click="stepIterFn" :disabled="atEnd">iteration ›</button>
            <button type="button" class="tb-play" @click="playing ? stop() : play()">{{ playing ? '❚❚ pause' : '▶ auto' }}</button>
            <button type="button" @click="resetExplore">reset</button>
            <button type="button" class="tb-fail" @click="loadFailure">flip 2 bits ✗</button>
          </div>
          <div class="tb-status fec-tnum">
            <span class="tb-iter">{{ frame.kind === 'channel' ? 'channel' : `iter ${frame.iter}` }}</span>
            <span class="tb-sat" :class="{ 'is-all': satisfied === activeH.length }">checks {{ satisfied }}/{{ activeH.length }}</span>
          </div>
        </div>

        <div v-if="showSuccess" class="tb-banner is-good">
          <div class="i-carbon-checkmark-outline" /> Converged in {{ trace.numIterations }} iteration{{ trace.numIterations > 1 ? 's' : '' }} — syndrome satisfied, decoding done.
        </div>
        <div v-else-if="showFailure" class="tb-banner is-bad">
          <div class="i-carbon-warning-alt" />
          <div>
            <b>Decoding failed — no convergence in 10 iterations.</b> Two errors on a short code with a 4-cycle make belief
            <em>echo round the loop</em> (slide 4): the checks flip-flop and never all turn green. Escaping this needs longer,
            girth-optimised codes and retransmission — the redundancy dial of <b>Part 6</b>.
          </div>
        </div>
        <div class="tb-hint">Click any variable node to flip its received bit · hover an edge mid-step for its exact message value.</div>
      </div>
    </div>

    <!-- ================= static fallback for PDF export ================= -->
    <template #fallback>
      <svg :viewBox="`0 0 ${GW} ${GH}`" class="tb-svg">
        <path v-for="e in FB_EDGES" :key="`fe${e.c}-${e.v}`" :d="e.path" fill="none" stroke-width="2.4"
          :style="{ stroke: e.value >= 0 ? 'var(--fec-info)' : 'var(--fec-parity)' }" />
        <text v-for="e in FB_EDGES" :key="`ft${e.c}-${e.v}`" :x="e.mx" :y="e.my" text-anchor="middle" class="tb-val fec-tnum" :style="{ fill: 'var(--fec-muted)' }">{{ fmt(e.value, 2) }}</text>
        <g v-for="(c, i) in FB_GEOM.checks" :key="`fc${i}`">
          <rect :x="c.x - CHECK_HALF" :y="c.y - CHECK_HALF" :width="CHECK_HALF * 2" :height="CHECK_HALF * 2" rx="4" stroke-width="2" :style="{ fill: 'var(--fec-corrected-soft)', stroke: 'var(--fec-corrected)' }" />
          <text :x="c.x" :y="c.y + 4" text-anchor="middle" class="tb-nlab" :style="{ fill: 'var(--fec-corrected)' }">c{{ i + 1 }}</text>
        </g>
        <g v-for="(vn, i) in FB_GEOM.vars" :key="`fv${i}`">
          <circle :cx="vn.x" :cy="vn.y" :r="VAR_R" stroke-width="2" :style="{ fill: FB_HARD[i] === 0 ? 'var(--fec-info-soft)' : 'var(--fec-parity-soft)', stroke: decColor(FB_POST[i]) }" />
          <text :x="vn.x" :y="vn.y + 4" text-anchor="middle" class="tb-nlab" :style="{ fill: decColor(FB_POST[i]) }">v{{ i + 1 }}</text>
          <text :x="vn.x" :y="vn.y + VAR_R + 18" text-anchor="middle" class="tb-val fec-tnum" :style="{ fill: decColor(FB_POST[i]) }">{{ fmt(FB_POST[i]) }}</text>
        </g>
        <text :x="GW / 2" y="288" text-anchor="middle" class="tb-val" :style="{ fill: 'var(--fec-muted)' }">Iteration 1 — CN→VN = ±0.7538 · v1 posterior +0.12 → all checks satisfied</text>
      </svg>
    </template>
  </RenderWhen>
</template>

<style scoped>
.tb {
  color: var(--fec-fg);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.tb-svg { width: 100%; max-width: 620px; height: auto; margin: 0 auto; overflow: visible; display: block; }
.tb-nlab { font-size: 11px; font-weight: 700; }
.tb-val { font-size: 10px; font-weight: 600; }

/* edges */
.tb-hit { pointer-events: stroke; cursor: help; }
.tb-edge { stroke-width: 1.4; transition: stroke-width 0.15s ease; pointer-events: none; }
.tb-edge.is-active { stroke-width: 2.8; stroke-dasharray: 5 6; }
.tb-edge.is-playing.flow-down { animation: tb-flow 0.9s linear infinite; }
.tb-edge.is-playing.flow-up { animation: tb-flow 0.9s linear infinite reverse; }
@keyframes tb-flow { to { stroke-dashoffset: -11; } }
.tb-vclick { cursor: pointer; }
.tb-vclick:hover { filter: brightness(1.05); }

/* tooltip */
.tb-tip { pointer-events: none; }
.tb-tiptext { font-size: 11px; font-weight: 600; fill: var(--fec-surface); }

/* guided caption */
.tb-guide { display: flex; flex-direction: column; gap: 0.4rem; align-items: center; text-align: center; }
.tb-cap { font-size: 0.92rem; color: var(--fec-fg); max-width: 60ch; min-height: 2.4em; }

/* banners */
.tb-banner {
  display: flex; align-items: center; gap: 0.5rem;
  border-radius: var(--fec-radius); border: 1px solid var(--fec-line); border-left-width: 4px;
  padding: 0.5rem 0.8rem; font-size: 0.86rem; line-height: 1.4;
}
.tb-banner.is-good { border-left-color: var(--fec-corrected); background: var(--fec-corrected-soft); color: var(--fec-fg); }
.tb-banner.is-bad { border-left-color: var(--fec-error); background: var(--fec-error-soft); color: var(--fec-fg); }
.tb-banner [class^='i-'] { font-size: 1.2rem; flex: none; }

/* explore controls */
.tb-explore { display: flex; flex-direction: column; gap: 0.5rem; }
.tb-row { display: flex; flex-wrap: wrap; gap: 0.8rem; align-items: center; justify-content: space-between; }
.tb-seg { display: inline-flex; border: 1px solid var(--fec-line); border-radius: 0.5rem; padding: 0.15rem; gap: 0.15rem; }
.tb-seg button { cursor: pointer; border: none; background: transparent; color: var(--fec-muted); font-size: 0.78rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 0.35rem; }
.tb-seg button.is-on { background: var(--fec-info-soft); color: var(--fec-info); }
.tb-noise { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--fec-muted); }
.tb-noise input { accent-color: var(--fec-info); }
.tb-btns { display: inline-flex; flex-wrap: wrap; gap: 0.3rem; }
.tb-btns button {
  cursor: pointer; border: 1px solid var(--fec-line); border-radius: 0.4rem;
  background: var(--fec-surface-2); color: var(--fec-fg); font-size: 0.78rem; padding: 0.25rem 0.6rem;
}
.tb-btns button:hover:not(:disabled) { border-color: var(--fec-info); color: var(--fec-info); }
.tb-btns button:disabled { opacity: 0.4; cursor: default; }
.tb-btns .tb-play { border-color: var(--fec-info); color: var(--fec-info); font-weight: 600; }
.tb-btns .tb-fail { border-color: var(--fec-error); color: var(--fec-error); font-weight: 600; }
.tb-status { display: inline-flex; gap: 0.6rem; align-items: center; font-size: 0.82rem; }
.tb-iter { color: var(--fec-muted); text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.72rem; font-weight: 700; }
.tb-sat { padding: 0.1rem 0.5rem; border-radius: 0.35rem; border: 1px solid var(--fec-line); font-weight: 700; }
.tb-sat.is-all { border-color: var(--fec-corrected); background: var(--fec-corrected-soft); color: var(--fec-corrected); }
.tb-hint { font-size: 0.74rem; color: var(--fec-muted); }
</style>
