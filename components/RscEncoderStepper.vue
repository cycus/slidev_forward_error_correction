<script setup lang="ts">
// LTE turbo constituent RSC encoder, stepped (T09). Pure logic lives in
// snippets/rsc.ts (unit-tested) so the on-screen numbers equal the tested ones.
//
// Two modes, one per embed:
//  · mode="recursion" (slide 4) — feed a lone 1 and show the recursive (IIR)
//    parity ringing forever beside a non-recursive (FIR) parity that dies after
//    the constraint length. The "why recursive matters" punchline.
//  · mode="lte" (slide 5) — step 1,1,0,1 through the (13,15)₈ register (the
//    reference trace 000→100→110→111→111, parity 1,0,0,1) then 3 tail steps that
//    return the state to 000.
//
// Free-exploration component: it owns its state (editable input + Step/Run/Reset
// + mode toggle) rather than reading $clicks, because both host slides already
// spend their click budget on prose reveals. State resets on onSlideLeave.
import { computed, ref } from 'vue'
import { onSlideLeave, useSlideContext } from '@slidev/client'
import { encode, terminate, stateStr, type Bit } from '../snippets/rsc'

const props = withDefaults(defineProps<{
  mode?: 'recursion' | 'lte'
  height?: string
}>(), { mode: 'lte', height: '18rem' })

useSlideContext() // ensure slide context exists

const DEFAULT_INPUT = props.mode === 'recursion' ? '10000000' : '1101'
const inputStr = ref(DEFAULT_INPUT)
const inputBits = computed<Bit[]>(() =>
  inputStr.value.replace(/[^01]/g, '').slice(0, 16).split('').map(c => (c === '1' ? 1 : 0)) as Bit[],
)

// ---- traces (pure functions of the input) ---------------------------------
const iirTrace = computed(() => encode(inputBits.value, { recursive: true }))
const firTrace = computed(() => encode(inputBits.value, { recursive: false }))
const lastState = computed(() => {
  const t = iirTrace.value
  return t.length ? t[t.length - 1].stateOut : [0, 0, 0] as Bit[]
})
const tailTrace = computed(() => terminate(lastState.value))
// In LTE mode the full walk is the data steps followed by the 3 tail steps.
const dataSteps = computed(() => iirTrace.value)
const totalSteps = computed(() => props.mode === 'lte'
  ? dataSteps.value.length + tailTrace.value.length
  : iirTrace.value.length)

// combined LTE trace, flagging tail rows
const lteTrace = computed(() =>
  dataSteps.value.map(s => ({ ...s, tail: false }))
    .concat(tailTrace.value.map(s => ({ ...s, k: s.k + dataSteps.value.length, tail: true }))))

// ---- stepping (own state) -------------------------------------------------
const step = ref(0) // 0 = nothing executed yet (state 000); k = after step k
let runTimer: ReturnType<typeof setInterval> | null = null

function stopRun() { if (runTimer) { clearInterval(runTimer); runTimer = null } }
function reset() { stopRun(); step.value = 0 }
function stepFwd() { stopRun(); if (step.value < totalSteps.value) step.value++ }
function run() {
  stopRun()
  step.value = 0
  runTimer = setInterval(() => {
    if (step.value >= totalSteps.value) { stopRun(); return }
    step.value++
  }, 550)
}
function setInput(v: string) { reset(); inputStr.value = v }

// current transition = the one just executed (undefined at step 0)
const active = computed(() => {
  if (step.value === 0) return null
  return props.mode === 'lte' ? lteTrace.value[step.value - 1] : iirTrace.value[step.value - 1]
})
const curState = computed<Bit[]>(() => active.value ? active.value.stateOut : [0, 0, 0])
const curX = computed<Bit | null>(() => active.value ? active.value.x : null)
const curA = computed<Bit | null>(() => active.value ? active.value.a : null)
const curZ = computed<Bit | null>(() => active.value ? active.value.z : null)
const inTail = computed(() => props.mode === 'lte' && active.value ? (active.value as any).tail : false)

// visible rows build up to the current step
const visibleRows = computed(() => lteTrace.value.slice(0, step.value))

// parity streams (recursion mode) — reveal up to current step
const iirParity = computed(() => iirTrace.value.map(s => s.z))
const firParity = computed(() => firTrace.value.map(s => s.z))

// register geometry
const CELL = 54
const CX = [150, 210, 270] // s1,s2,s3 centres
const CYr = 62

// which register cell is a feedback tap (s2,s3 ⇒ idx 1,2) / parity tap (s1,s3 ⇒ 0,2)
const isFbTap = (i: number) => i === 1 || i === 2
const isParityTap = (i: number) => i === 0 || i === 2
const recursiveReg = computed(() => props.mode !== 'recursion' ? true : true) // register schematic is the recursive one

onSlideLeave(() => { stopRun(); step.value = 0; inputStr.value = DEFAULT_INPUT })

function fmtState(s: Bit[]) { return stateStr(s) }
</script>

<template>
  <RenderWhen context="main">
    <div class="rsc" :style="{ minHeight: height }">
      <!-- ================= controls ================= -->
      <div class="rsc-ctl">
        <label class="rsc-inlabel">input
          <input class="rsc-input fec-tnum" :value="inputStr" maxlength="16"
            @input="setInput(($event.target as HTMLInputElement).value)">
        </label>
        <div class="rsc-btns">
          <button type="button" @click="stepFwd" :disabled="step >= totalSteps">Step</button>
          <button type="button" @click="run">Run</button>
          <button type="button" @click="reset">Reset</button>
        </div>
        <div class="rsc-presets">
          <button type="button" class="rsc-preset" @click="setInput(mode === 'recursion' ? '10000000' : '1101')">
            {{ mode === 'recursion' ? 'lone 1' : 'reference 1101' }}
          </button>
        </div>
      </div>

      <!-- ================= shift-register schematic ================= -->
      <svg viewBox="0 0 420 130" class="rsc-svg" role="img" aria-label="RSC shift register">
        <!-- input x -->
        <text x="24" y="66" class="rsc-lab" :style="{ fill: 'var(--fec-info)' }">
          uₖ<tspan v-if="curX !== null" dx="4" class="fec-tnum">= {{ curX }}</tspan>
        </text>
        <line x1="46" y1="62" x2="112" y2="62" :style="{ stroke: 'var(--fec-info)' }" stroke-width="2" />
        <!-- systematic passthrough (top) -->
        <line x1="72" y1="62" x2="72" y2="20" :style="{ stroke: 'var(--fec-info)' }" stroke-width="1.6" />
        <line x1="72" y1="20" x2="392" y2="20" :style="{ stroke: 'var(--fec-info)' }" stroke-width="1.6" stroke-dasharray="4 3" />
        <text x="396" y="24" class="rsc-lab" :style="{ fill: 'var(--fec-info)' }">xₖˢ</text>
        <!-- feedback adder → a -->
        <circle cx="112" cy="62" r="11" :style="{ fill: 'var(--fec-surface)', stroke: recursiveReg ? 'var(--fec-corrected)' : 'var(--fec-line)' }" stroke-width="1.8" />
        <text x="112" y="67" text-anchor="middle" class="rsc-op">⊕</text>
        <line x1="123" y1="62" x2="150" y2="62" :style="{ stroke: 'var(--fec-fg)' }" stroke-width="2" />
        <text x="136" y="52" text-anchor="middle" class="rsc-tiny" :style="{ fill: 'var(--fec-muted)' }">a<tspan v-if="curA !== null" class="fec-tnum">={{ curA }}</tspan></text>

        <!-- three register cells -->
        <g v-for="(cx, i) in CX" :key="i">
          <rect :x="cx - CELL / 2" :y="CYr - 22" :width="CELL" height="44" rx="6"
            :style="{ fill: 'var(--fec-surface-2)', stroke: (isFbTap(i) || isParityTap(i)) && active ? 'var(--fec-corrected)' : 'var(--fec-line)' }"
            :stroke-width="(isFbTap(i) || isParityTap(i)) && active ? 2.4 : 1.6" />
          <text :x="cx" :y="CYr + 6" text-anchor="middle" class="rsc-cell fec-tnum">{{ curState[i] }}</text>
          <text :x="cx" :y="CYr - 28" text-anchor="middle" class="rsc-tiny" :style="{ fill: 'var(--fec-muted)' }">s{{ i + 1 }}</text>
        </g>

        <!-- feedback wire s2,s3 → adder (recursive only) -->
        <template v-if="recursiveReg">
          <line x1="270" y1="90" x2="270" y2="108" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="1.8" />
          <line x1="270" y1="108" x2="112" y2="108" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="1.8" />
          <line x1="112" y1="108" x2="112" y2="73" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="1.8" />
          <line x1="210" y1="84" x2="210" y2="108" :style="{ stroke: 'var(--fec-corrected)' }" stroke-width="1.4" stroke-dasharray="3 3" />
          <text x="180" y="122" text-anchor="middle" class="rsc-tiny" :style="{ fill: 'var(--fec-corrected)' }">feedback g₀ = 1+D²+D³</text>
        </template>

        <!-- parity output z -->
        <circle cx="330" cy="62" r="11" :style="{ fill: 'var(--fec-surface)', stroke: 'var(--fec-parity)' }" stroke-width="1.8" />
        <text x="330" y="67" text-anchor="middle" class="rsc-op" :style="{ fill: 'var(--fec-parity)' }">⊕</text>
        <line x1="297" y1="62" x2="319" y2="62" :style="{ stroke: 'var(--fec-fg)' }" stroke-width="2" />
        <line x1="341" y1="62" x2="392" y2="62" :style="{ stroke: 'var(--fec-parity)' }" stroke-width="2.4" />
        <text x="396" y="66" class="rsc-lab" :style="{ fill: 'var(--fec-parity)' }">
          zₖ<tspan v-if="curZ !== null" dx="2" class="fec-tnum">={{ curZ }}</tspan>
        </text>
      </svg>

      <!-- ================= mode-specific readout ================= -->
      <!-- recursion contrast: two parity streams -->
      <div v-if="mode === 'recursion'" class="rsc-streams">
        <div class="rsc-stream">
          <span class="rsc-slab" :style="{ color: 'var(--fec-corrected)' }">recursive (IIR)</span>
          <span v-for="(z, k) in iirParity" :key="k" class="rsc-bit"
            :class="{ 'is-on': z === 1, 'is-cur': k === step - 1 }"
            :style="{ visibility: k < step ? 'visible' : 'hidden', background: z === 1 ? 'var(--fec-parity)' : 'var(--fec-surface-2)', color: z === 1 ? '#fff' : 'var(--fec-muted)' }">{{ z }}</span>
          <span class="rsc-verdict" :style="{ color: 'var(--fec-corrected)' }">rings forever</span>
        </div>
        <div class="rsc-stream">
          <span class="rsc-slab" :style="{ color: 'var(--fec-muted)' }">non-recursive (FIR)</span>
          <span v-for="(z, k) in firParity" :key="k" class="rsc-bit"
            :class="{ 'is-cur': k === step - 1 }"
            :style="{ visibility: k < step ? 'visible' : 'hidden', background: z === 1 ? 'var(--fec-parity-soft)' : 'var(--fec-surface-2)', color: z === 1 ? 'var(--fec-parity)' : 'var(--fec-muted)' }">{{ z }}</span>
          <span class="rsc-verdict" :style="{ color: 'var(--fec-muted)' }">dies after L</span>
        </div>
        <div class="rsc-cap">A lone 1: with feedback the register never returns to 000, so parity toggles forever; without it the 1 flushes out and parity dies.</div>
      </div>

      <!-- lte: transition trace table -->
      <div v-else class="rsc-tblwrap">
        <table class="rsc-tbl fec-tnum">
          <thead><tr><th>k</th><th>uₖ</th><th>state</th><th>→</th><th>zₖ</th></tr></thead>
          <tbody>
            <tr v-for="row in visibleRows" :key="row.k" :class="{ 'is-tail': row.tail }">
              <td>{{ row.k }}</td>
              <td>{{ row.x }}</td>
              <td>{{ fmtState(row.stateIn) }}</td>
              <td>{{ fmtState(row.stateOut) }}</td>
              <td :style="{ color: 'var(--fec-parity)' }" class="rsc-zcol">{{ row.z }}</td>
            </tr>
            <tr v-if="step === 0" class="rsc-hint"><td colspan="5">press Step / Run — start state 000</td></tr>
          </tbody>
        </table>
        <div class="rsc-cap" :class="{ 'is-live': inTail }">
          <template v-if="inTail || step >= totalSteps">6 tail input bits → 12 transmitted bits (4 per stream). Tail drives the state back to 000.</template>
          <template v-else>Step 1,1,0,1 through the (13,15)₈ register, then 3 tail steps terminate the trellis.</template>
        </div>
      </div>
    </div>

    <!-- static PDF fallback: the reference trace at its final, terminated state -->
    <template #fallback>
      <div class="rsc rsc-fb">
        <div v-if="mode === 'recursion'" class="rsc-streams">
          <div class="rsc-stream">
            <span class="rsc-slab" :style="{ color: 'var(--fec-corrected)' }">recursive (IIR)</span>
            <span v-for="(z, k) in iirParity" :key="k" class="rsc-bit"
              :style="{ background: z === 1 ? 'var(--fec-parity)' : 'var(--fec-surface-2)', color: z === 1 ? '#fff' : 'var(--fec-muted)' }">{{ z }}</span>
            <span class="rsc-verdict" :style="{ color: 'var(--fec-corrected)' }">rings forever</span>
          </div>
          <div class="rsc-stream">
            <span class="rsc-slab" :style="{ color: 'var(--fec-muted)' }">non-recursive (FIR)</span>
            <span v-for="(z, k) in firParity" :key="k" class="rsc-bit"
              :style="{ background: z === 1 ? 'var(--fec-parity-soft)' : 'var(--fec-surface-2)', color: z === 1 ? 'var(--fec-parity)' : 'var(--fec-muted)' }">{{ z }}</span>
            <span class="rsc-verdict" :style="{ color: 'var(--fec-muted)' }">dies after L</span>
          </div>
        </div>
        <table v-else class="rsc-tbl fec-tnum">
          <thead><tr><th>k</th><th>uₖ</th><th>state</th><th>→</th><th>zₖ</th></tr></thead>
          <tbody>
            <tr v-for="row in lteTrace" :key="row.k" :class="{ 'is-tail': row.tail }">
              <td>{{ row.k }}</td><td>{{ row.x }}</td><td>{{ fmtState(row.stateIn) }}</td>
              <td>{{ fmtState(row.stateOut) }}</td>
              <td :style="{ color: 'var(--fec-parity)' }">{{ row.z }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </RenderWhen>
</template>

<style scoped>
.rsc { color: var(--fec-fg); font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.6rem; }
.rsc-ctl { display: flex; flex-wrap: wrap; align-items: center; gap: 0.8rem; }
.rsc-inlabel { font-size: 0.8rem; color: var(--fec-muted); display: inline-flex; align-items: center; gap: 0.4rem; }
.rsc-input {
  width: 9rem; padding: 0.2rem 0.5rem; letter-spacing: 0.15em;
  border: 1px solid var(--fec-line); border-radius: 0.35rem;
  background: var(--fec-surface-2); color: var(--fec-fg); font-size: 0.9rem;
}
.rsc-btns { display: inline-flex; gap: 0.3rem; }
.rsc-btns button, .rsc-preset {
  cursor: pointer; border: 1px solid var(--fec-line); border-radius: 0.4rem;
  background: var(--fec-surface-2); color: var(--fec-fg);
  font-size: 0.8rem; font-weight: 600; padding: 0.24rem 0.7rem;
}
.rsc-btns button:hover, .rsc-preset:hover { border-color: var(--fec-info); color: var(--fec-info); }
.rsc-btns button:disabled { opacity: 0.4; cursor: default; }
.rsc-presets { margin-left: auto; }

.rsc-svg { width: 100%; max-width: 460px; height: auto; overflow: visible; align-self: center; }
.rsc-lab { font-size: 12px; font-weight: 700; }
.rsc-cell { font-size: 18px; font-weight: 700; fill: var(--fec-fg); }
.rsc-op { font-size: 13px; fill: var(--fec-fg); }
.rsc-tiny { font-size: 10px; }

.rsc-streams { display: flex; flex-direction: column; gap: 0.4rem; }
.rsc-stream { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
.rsc-slab { font-size: 0.76rem; font-weight: 700; width: 9.5rem; }
.rsc-bit {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.4rem; height: 1.4rem; border-radius: 0.3rem; font-weight: 700;
  font-size: 0.82rem; border: 1px solid var(--fec-line); font-variant-numeric: tabular-nums;
}
.rsc-bit.is-cur { outline: 2px solid var(--fec-info); outline-offset: 1px; }
.rsc-verdict { font-size: 0.76rem; font-weight: 700; margin-left: 0.4rem; }

.rsc-tblwrap { display: flex; flex-direction: column; gap: 0.4rem; }
.rsc-tbl { border-collapse: collapse; font-size: 0.84rem; width: fit-content; }
.rsc-tbl th { color: var(--fec-muted); font-weight: 600; font-size: 0.74rem; padding: 0.12rem 0.7rem; text-align: center; }
.rsc-tbl td { padding: 0.12rem 0.7rem; text-align: center; }
.rsc-tbl .rsc-zcol { font-weight: 700; }
.rsc-tbl tr.is-tail td { background: var(--fec-corrected-soft); }
.rsc-hint td { color: var(--fec-muted); font-style: italic; text-align: left; }

.rsc-cap { font-size: 0.78rem; color: var(--fec-muted); line-height: 1.35; max-width: 60ch; }
.rsc-cap.is-live { color: var(--fec-corrected); font-weight: 600; }
</style>
