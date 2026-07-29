<script setup lang="ts">
// Sklar's 2×2 single-parity product code as a turbo stand-in (T09). Pure logic
// lives in snippets/product-turbo.ts (unit-tested) so the on-screen numbers
// equal the tested ones — the component is a pure renderer of decode()'s trace.
//
// Half-iteration stepping is driven by an internal step counter (Step / Run /
// Reset) rather than $clicks: slide 9 already spends its click budget on prose
// reveals, so binding the demo to the same $clicks would desync the two. Per
// styles/CONVENTIONS.md this makes it a free-exploration component that owns and
// resets its own state (onSlideLeave). Explore mode (adjust the channel LLRs and
// re-run) sits behind an explicit toggle.
//
// Colour contract with slide 8 (BINDING): channel/systematic = info-blue,
// a-priori Lₐ = muted, extrinsic Lₑ = corrected-green. On convergence the cells
// turn corrected-green (the celebration).
import { computed, reactive, ref } from 'vue'
import { onSlideLeave, useSlideContext } from '@slidev/client'
import { decode, SKLAR_CHANNEL, type ChannelLLRs } from '../snippets/product-turbo'

withDefaults(defineProps<{ height?: string }>(), { height: '19rem' })

useSlideContext()

// ---- channel state (explore mode mutates it) ------------------------------
const channel = reactive<ChannelLLRs>({
  data: [...SKLAR_CHANNEL.data],
  rowParity: [...SKLAR_CHANNEL.rowParity],
  colParity: [...SKLAR_CHANNEL.colParity],
})
function resetChannel() {
  channel.data = [...SKLAR_CHANNEL.data]
  channel.rowParity = [...SKLAR_CHANNEL.rowParity]
  channel.colParity = [...SKLAR_CHANNEL.colParity]
}

const trace = computed(() => decode(channel, 2))
const maxStep = computed(() => trace.value.length - 1) // 4 half-iterations

// ---- stepping (own state) -------------------------------------------------
const step = ref(0)
let runTimer: ReturnType<typeof setInterval> | null = null
function stopRun() { if (runTimer) { clearInterval(runTimer); runTimer = null } }
function reset() { stopRun(); step.value = 0 }
function stepFwd() { stopRun(); if (step.value < maxStep.value) step.value++ }
function run() {
  stopRun(); step.value = 0
  runTimer = setInterval(() => {
    if (step.value >= maxStep.value) { stopRun(); return }
    step.value++
  }, 900)
}

const frame = computed(() => trace.value[Math.min(step.value, maxStep.value)])
const converged = computed(() => step.value === maxStep.value && frame.value.total.every(v => Math.abs(v) >= 2.4))

const phaseLabel = computed(() => {
  const f = frame.value
  if (f.phase === 'init') return 'Channel LLRs — only d1 is confident'
  const dir = f.phase === 'horizontal' ? 'Horizontal pass (rows)' : 'Vertical pass (columns)'
  return `Iteration ${f.iter} · ${dir}`
})

// ---- explore mode ---------------------------------------------------------
const explore = ref(false)
function toggleExplore() { explore.value = !explore.value; reset() }
const DATA_LABELS = ['d1', 'd2', 'd3', 'd4']

// ---- rendering helpers ----------------------------------------------------
const LLR_CAP = 3
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
function fmt(v: number, d = 2) { return v.toFixed(d).replace('-', '−') }
function decColor(positive: boolean) { return positive ? 'var(--fec-info)' : 'var(--fec-parity)' }
function cellColor(i: number) {
  if (converged.value) return 'var(--fec-corrected)'
  return decColor(frame.value.total[i] >= 0)
}
function barFrac(v: number) { return clamp(Math.abs(v) / LLR_CAP, 0, 1) }
// per-cell channel term (constant), a-priori and extrinsic from the current frame
function channelOf(i: number) { return channel.data[i] }
function extrinsicOf(i: number) { return frame.value.extrinsic[i] }
function aprioriOf(i: number) { return frame.value.apriori[i] }

// grid placement: data cells d1 d2 / d3 d4 ; row parities right ; col parities below
const rowParityIdx = [0, 1] // pr1, pr2
const colParityIdx = [0, 1] // pc1, pc2

onSlideLeave(() => { stopRun(); step.value = 0; explore.value = false; resetChannel() })
</script>

<template>
  <RenderWhen context="main">
    <div class="td" :style="{ minHeight: height }">
      <!-- ================= controls ================= -->
      <div class="td-ctl">
        <div class="td-phase" :class="{ 'is-done': converged }">{{ phaseLabel }}</div>
        <div class="td-btns">
          <button type="button" @click="stepFwd" :disabled="step >= maxStep">Step</button>
          <button type="button" @click="run">Run</button>
          <button type="button" @click="reset">Reset</button>
          <button type="button" class="td-expl" :class="{ 'is-on': explore }" @click="toggleExplore">Explore</button>
        </div>
      </div>

      <div class="td-main">
        <!-- ================= 2×2 grid with parities ================= -->
        <div class="td-grid">
          <!-- data cells + row parities -->
          <template v-for="r in 2" :key="`r${r}`">
            <div v-for="c in 2" :key="`c${r}${c}`" class="td-cell"
              :class="{ 'is-done': converged }"
              :style="{ borderColor: cellColor((r - 1) * 2 + (c - 1)), background: converged ? 'var(--fec-corrected-soft)' : 'var(--fec-surface-2)' }">
              <div class="td-name">{{ DATA_LABELS[(r - 1) * 2 + (c - 1)] }}</div>
              <!-- LLR bar (replicated .lv-llrbar style) -->
              <div class="td-track">
                <div class="td-mid" />
                <div class="td-fill" :style="{
                  width: `${barFrac(frame.total[(r - 1) * 2 + (c - 1)]) * 50}%`,
                  left: frame.total[(r - 1) * 2 + (c - 1)] >= 0 ? '50%' : undefined,
                  right: frame.total[(r - 1) * 2 + (c - 1)] >= 0 ? undefined : '50%',
                  background: cellColor((r - 1) * 2 + (c - 1)) }" />
              </div>
              <div class="td-val fec-tnum" :style="{ color: cellColor((r - 1) * 2 + (c - 1)) }">
                {{ fmt(frame.total[(r - 1) * 2 + (c - 1)]) }}
              </div>
              <!-- three-term breakdown, colour-matched to slide 8 -->
              <div class="td-terms fec-tnum">
                <span :style="{ color: 'var(--fec-info)' }">ch {{ fmt(channelOf((r - 1) * 2 + (c - 1)), 1) }}</span>
                <span :style="{ color: 'var(--fec-muted)' }">Lₐ {{ fmt(aprioriOf((r - 1) * 2 + (c - 1)), 1) }}</span>
                <span :style="{ color: 'var(--fec-corrected)' }">Lₑ {{ fmt(extrinsicOf((r - 1) * 2 + (c - 1)), 1) }}</span>
              </div>
            </div>
            <!-- row parity -->
            <div class="td-par td-parrow">
              <span class="td-parlab">pr{{ r }}</span>
              <span class="fec-tnum">{{ fmt(channel.rowParity[rowParityIdx[r - 1]], 1) }}</span>
            </div>
          </template>
          <!-- col parities row -->
          <div v-for="c in 2" :key="`pc${c}`" class="td-par td-parcol">
            <span class="td-parlab">pc{{ c }}</span>
            <span class="fec-tnum">{{ fmt(channel.colParity[colParityIdx[c - 1]], 1) }}</span>
          </div>
          <div class="td-corner" />
        </div>

        <!-- ================= side panel ================= -->
        <div class="td-side">
          <div v-if="!explore" class="td-legend">
            <div><span class="td-dot" :style="{ background: 'var(--fec-info)' }" /> channel / systematic</div>
            <div><span class="td-dot" :style="{ background: 'var(--fec-muted)' }" /> a-priori Lₐ (from the other pass)</div>
            <div><span class="td-dot" :style="{ background: 'var(--fec-corrected)' }" /> extrinsic Lₑ (passed on)</div>
            <div class="td-parkey"><span class="td-dot" :style="{ background: 'var(--fec-parity)' }" /> parity checks</div>
          </div>

          <!-- explore controls -->
          <div v-else class="td-explore">
            <div class="td-explbl">Drag a channel LLR, then Run:</div>
            <div v-for="(l, i) in channel.data" :key="i" class="td-slider">
              <span class="td-slab" :style="{ color: 'var(--fec-info)' }">{{ DATA_LABELS[i] }}</span>
              <input type="range" min="-3" max="3" step="0.05" :value="channel.data[i]"
                @input="channel.data[i] = Number(($event.target as HTMLInputElement).value); reset()">
              <span class="td-sval fec-tnum">{{ fmt(channel.data[i], 2) }}</span>
            </div>
            <div class="td-hint">Weaken <b>d1</b> toward 0 and Run: d2 loses its rescue — extrinsic quality depends on the neighbour's confidence.</div>
            <button type="button" class="td-restore" @click="resetChannel(); reset()">Restore Sklar values</button>
          </div>

          <div v-if="converged" class="td-win">All four bits converged — every |LLR| ≳ 2.5.</div>
        </div>
      </div>
    </div>

    <!-- static PDF fallback: the converged final frame -->
    <template #fallback>
      <div class="td td-fb">
        <div class="td-phase is-done">Converged after 2 iterations — every |LLR| ≳ 2.5</div>
        <div class="td-grid">
          <template v-for="r in 2" :key="`fr${r}`">
            <div v-for="c in 2" :key="`fc${r}${c}`" class="td-cell is-done"
              :style="{ borderColor: 'var(--fec-corrected)', background: 'var(--fec-corrected-soft)' }">
              <div class="td-name">{{ DATA_LABELS[(r - 1) * 2 + (c - 1)] }}</div>
              <div class="td-track">
                <div class="td-mid" />
                <div class="td-fill" :style="{
                  width: `${barFrac(trace[maxStep].total[(r - 1) * 2 + (c - 1)]) * 50}%`,
                  left: trace[maxStep].total[(r - 1) * 2 + (c - 1)] >= 0 ? '50%' : undefined,
                  right: trace[maxStep].total[(r - 1) * 2 + (c - 1)] >= 0 ? undefined : '50%',
                  background: 'var(--fec-corrected)' }" />
              </div>
              <div class="td-val fec-tnum" :style="{ color: 'var(--fec-corrected)' }">{{ fmt(trace[maxStep].total[(r - 1) * 2 + (c - 1)]) }}</div>
            </div>
            <div class="td-par td-parrow"><span class="td-parlab">pr{{ r }}</span><span class="fec-tnum">{{ fmt(channel.rowParity[rowParityIdx[r - 1]], 1) }}</span></div>
          </template>
          <div v-for="c in 2" :key="`fpc${c}`" class="td-par td-parcol"><span class="td-parlab">pc{{ c }}</span><span class="fec-tnum">{{ fmt(channel.colParity[colParityIdx[c - 1]], 1) }}</span></div>
          <div class="td-corner" />
        </div>
      </div>
    </template>
  </RenderWhen>
</template>

<style scoped>
.td { color: var(--fec-fg); font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.6rem; }
.td-ctl { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.6rem; }
.td-phase { font-size: 0.86rem; font-weight: 700; color: var(--fec-fg); }
.td-phase.is-done { color: var(--fec-corrected); }
.td-btns { display: inline-flex; gap: 0.3rem; }
.td-btns button {
  cursor: pointer; border: 1px solid var(--fec-line); border-radius: 0.4rem;
  background: var(--fec-surface-2); color: var(--fec-fg);
  font-size: 0.8rem; font-weight: 600; padding: 0.24rem 0.7rem;
}
.td-btns button:hover { border-color: var(--fec-info); color: var(--fec-info); }
.td-btns button:disabled { opacity: 0.4; cursor: default; }
.td-expl.is-on { border-color: var(--fec-corrected); color: var(--fec-corrected); background: var(--fec-corrected-soft); }

.td-main { display: flex; gap: 1.2rem; align-items: flex-start; flex-wrap: wrap; }

.td-grid {
  display: grid;
  grid-template-columns: 8.5rem 8.5rem 3.2rem;
  grid-template-rows: auto auto auto;
  gap: 0.45rem;
}
.td-cell {
  border: 2px solid var(--fec-line); border-radius: 0.5rem; padding: 0.35rem 0.5rem;
  display: flex; flex-direction: column; gap: 0.18rem;
  transition: border-color 0.3s, background 0.3s;
}
.td-cell.is-done { box-shadow: 0 0 0 2px var(--fec-corrected-soft); }
.td-name { font-size: 0.82rem; font-weight: 700; }
.td-track { position: relative; height: 1.1rem; background: var(--fec-surface); border: 1px solid var(--fec-line); border-radius: 0.25rem; }
.td-mid { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: var(--fec-muted); }
.td-fill { position: absolute; top: 2px; bottom: 2px; border-radius: 0.15rem; transition: width 0.35s ease, background 0.3s; }
.td-val { font-size: 0.92rem; font-weight: 700; }
.td-terms { display: flex; gap: 0.4rem; font-size: 0.64rem; }

.td-par {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border: 1.5px dashed var(--fec-parity); border-radius: 0.4rem;
  background: var(--fec-parity-soft); color: var(--fec-parity);
  font-size: 0.82rem; font-weight: 700; padding: 0.2rem;
}
.td-parlab { font-size: 0.66rem; opacity: 0.85; }
.td-parcol { grid-row: 3; }
.td-corner { grid-column: 3; grid-row: 3; }

.td-side { flex: 1 1 200px; min-width: 190px; display: flex; flex-direction: column; gap: 0.6rem; }
.td-legend { display: flex; flex-direction: column; gap: 0.28rem; font-size: 0.78rem; color: var(--fec-muted); }
.td-dot { display: inline-block; width: 0.7rem; height: 0.7rem; border-radius: 0.2rem; margin-right: 0.4rem; vertical-align: middle; }
.td-parkey { margin-top: 0.15rem; }

.td-explore { display: flex; flex-direction: column; gap: 0.35rem; }
.td-explbl { font-size: 0.78rem; color: var(--fec-muted); }
.td-slider { display: grid; grid-template-columns: 1.6rem 1fr 2.4rem; align-items: center; gap: 0.4rem; }
.td-slab { font-size: 0.8rem; font-weight: 700; }
.td-slider input[type=range] { width: 100%; accent-color: var(--fec-info); }
.td-sval { text-align: right; font-size: 0.78rem; }
.td-hint { font-size: 0.72rem; color: var(--fec-muted); line-height: 1.35; }
.td-restore {
  cursor: pointer; align-self: flex-start; margin-top: 0.1rem;
  border: 1px solid var(--fec-line); border-radius: 0.4rem;
  background: var(--fec-surface-2); color: var(--fec-fg); font-size: 0.74rem; padding: 0.2rem 0.6rem;
}
.td-restore:hover { border-color: var(--fec-info); color: var(--fec-info); }
.td-win {
  font-size: 0.8rem; font-weight: 600; color: var(--fec-corrected);
  border: 1px solid var(--fec-corrected); background: var(--fec-corrected-soft);
  border-radius: 0.4rem; padding: 0.3rem 0.5rem;
}
</style>
