<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { onSlideEnter, onSlideLeave, useSlideContext } from '@slidev/client'
import { decode, encode, extractData, syndrome, type Bit, type Data } from '../snippets/hamming'

// (7,4) Hamming: encode 4 data bits, flip channel bits, watch the syndrome point
// at the error — then flip a SECOND bit and watch d_min = 3 fool the decoder.
// The two-error miscorrection is the pedagogical payload (T05).
//
// Free-exploration widget: click data bits to toggle, click received bits to
// flip, Reset to clear. When embedded on a slide with a click budget it ALSO
// plays a scripted demo off $clicks (0 clean → 1 single-flip+correct → 2
// double-flip+miscorrect) so the presenter remote drives it. State resets on leave.

const { $clicks } = useSlideContext()

// Canonical demo: data 1011 → codeword [0,1,1,0,0,1,1]; scripted flips 5 then 2.
const DEFAULT_DATA: Data = [1, 0, 1, 1]
const SCRIPT: number[][] = [[], [5], [5, 2]]

const data = reactive<Data>([...DEFAULT_DATA] as Data)
const flips = ref<Set<number>>(new Set()) // 1-based positions flipped by the "channel"

// Which positions in the codeword carry data (blue) vs parity (amber).
// Layout is position order [p1, p2, d1, p3, d2, d3, d4] (see snippets/hamming.ts).
const ROLE: ('parity' | 'data')[] = ['parity', 'parity', 'data', 'parity', 'data', 'data', 'data']
const DATA_LABEL = ['', '', 'd₁', '', 'd₂', 'd₃', 'd₄']
const PARITY_LABEL = ['p₁', 'p₂', '', 'p₃', '', '', '']

const transmitted = computed(() => encode(data as Data))
const received = computed(() => transmitted.value.map((b, i) => (flips.value.has(i + 1) ? (b ^ 1) : b) as Bit) as typeof transmitted.value)
const synd = computed(() => syndrome(received.value))
const decoded = computed(() => decode(received.value))
const dataOut = computed(() => extractData(decoded.value.corrected))

const nErr = computed(() => flips.value.size)
const isClean = computed(() => nErr.value === 0)
const isFixed = computed(() => decoded.value.corrected.every((b, i) => b === transmitted.value[i]))
const status = computed<'clean' | 'corrected' | 'miscorrect'>(() =>
  isClean.value ? 'clean' : isFixed.value ? 'corrected' : 'miscorrect')

function toggleData(k: 0 | 1 | 2 | 3) {
  data[k] = (data[k] ^ 1) as Bit
}
function toggleFlip(pos1: number) {
  const s = new Set(flips.value)
  s.has(pos1) ? s.delete(pos1) : s.add(pos1)
  flips.value = s
}
function reset() {
  data.splice(0, 4, ...DEFAULT_DATA)
  flips.value = new Set()
}
function applyScript(c: number) {
  flips.value = new Set(SCRIPT[Math.min(c, SCRIPT.length - 1)] ?? [])
}

// Presenter remote: each click advances the scripted flip set.
watch($clicks, c => applyScript(c ?? 0))
onSlideEnter(() => { reset(); applyScript($clicks.value ?? 0) })
onSlideLeave(reset)
</script>

<template>
  <RenderWhen context="main">
    <div class="hp">
      <!-- message: the four editable data bits -->
      <div class="hp-msg">
        <span class="hp-rowlab">Message</span>
        <button
          v-for="k in 4" :key="`d${k}`" type="button"
          class="hp-cell hp-data hp-click" :class="{ 'is-one': data[k - 1] === 1 }"
          @click="toggleData((k - 1) as 0 | 1 | 2 | 3)"
        >
          <span class="hp-bit">{{ data[k - 1] }}</span>
          <span class="hp-sub">d{{ k }}</span>
        </button>
        <span class="hp-encode">encode →</span>
      </div>

      <div class="hp-main">
        <!-- the three codeword strips -->
        <div class="hp-strips">
          <div class="hp-posrow">
            <span class="hp-rowlab" />
            <span v-for="p in 7" :key="`p${p}`" class="hp-pos">{{ p }}</span>
          </div>

          <div class="hp-row">
            <span class="hp-rowlab">Sent</span>
            <div
              v-for="(b, i) in transmitted" :key="`t${i}`"
              class="hp-cell" :class="ROLE[i] === 'data' ? 'hp-data' : 'hp-parity'"
            >
              <span class="hp-bit">{{ b }}</span>
              <span class="hp-sub">{{ DATA_LABEL[i] || PARITY_LABEL[i] }}</span>
            </div>
          </div>

          <div class="hp-row">
            <span class="hp-rowlab">Recv</span>
            <button
              v-for="(b, i) in received" :key="`r${i}`" type="button"
              class="hp-cell hp-click"
              :class="[ROLE[i] === 'data' ? 'hp-data' : 'hp-parity', { 'is-flipped': flips.has(i + 1) }]"
              @click="toggleFlip(i + 1)"
            >
              <span class="hp-bit">{{ b }}</span>
              <span class="hp-sub">{{ flips.has(i + 1) ? 'flip' : '' }}</span>
            </button>
          </div>

          <div class="hp-row">
            <span class="hp-rowlab">Decoded</span>
            <div
              v-for="(b, i) in decoded.corrected" :key="`o${i}`"
              class="hp-cell hp-out"
              :class="{ 'is-acted': decoded.position === i + 1, 'is-good': status === 'corrected', 'is-bad': status === 'miscorrect' && decoded.position === i + 1 }"
            >
              <span class="hp-bit">{{ b }}</span>
              <span class="hp-sub">{{ decoded.position === i + 1 ? '↺' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- readout: syndrome + verdict -->
        <div class="hp-read">
          <div class="hp-synd">
            <span class="hp-rowlab">Syndrome</span>
            <span class="hp-sbits fec-tnum">{{ synd.s3 }}{{ synd.s2 }}{{ synd.s1 }}</span>
            <span class="hp-arrow">→</span>
            <span class="hp-sdec fec-tnum">{{ synd.position }}</span>
          </div>
          <div class="hp-point">
            {{ synd.position === 0 ? 'all checks pass — no error flagged' : `points at position ${synd.position}` }}
          </div>

          <div class="hp-verdict" :class="`is-${status}`">
            <template v-if="status === 'clean'">Clean codeword — nothing to fix.</template>
            <template v-else-if="status === 'corrected'">Single error at position {{ decoded.position }} — located and corrected. ✓</template>
            <template v-else><b>Miscorrection.</b> Two errors alias to one syndrome — the decoder "fixes" position {{ decoded.position }} and lands on the wrong codeword.</template>
          </div>
          <div v-if="status === 'miscorrect'" class="hp-dmin">d_min = 3 ⇒ corrects 1 error, is fooled by 2.</div>

          <div class="hp-foot">
            <span class="hp-dataout">data out: <b class="fec-tnum">{{ dataOut.join('') }}</b></span>
            <button type="button" class="hp-reset" @click="reset">Reset</button>
          </div>
        </div>
      </div>

      <div class="hp-legend">
        <span class="hp-key hp-data">data</span>
        <span class="hp-key hp-parity">parity</span>
        <span class="hp-key hp-flip">flipped</span>
        <span class="hp-key hp-fix">decoder acted</span>
      </div>
    </div>

    <!-- static PDF fallback: the resting (7,4) codeword for the default message -->
    <template #fallback>
      <div class="hp hp-fb">
        <div class="hp-strips">
          <div class="hp-posrow">
            <span class="hp-rowlab" />
            <span v-for="p in 7" :key="`fp${p}`" class="hp-pos">{{ p }}</span>
          </div>
          <div class="hp-row">
            <span class="hp-rowlab">Sent</span>
            <div
              v-for="(b, i) in transmitted" :key="`ft${i}`"
              class="hp-cell" :class="ROLE[i] === 'data' ? 'hp-data' : 'hp-parity'"
            >
              <span class="hp-bit">{{ b }}</span>
              <span class="hp-sub">{{ DATA_LABEL[i] || PARITY_LABEL[i] }}</span>
            </div>
          </div>
        </div>
        <div class="hp-verdict is-clean">
          (7,4) Hamming codeword for message <b class="fec-tnum">{{ data.join('') }}</b>. In the
          live deck: toggle data bits, flip received bits, and watch the syndrome locate the error.
        </div>
        <div class="hp-legend">
          <span class="hp-key hp-data">data</span>
          <span class="hp-key hp-parity">parity</span>
        </div>
      </div>
    </template>
  </RenderWhen>
</template>

<style scoped>
.hp {
  --hp-cell: 2.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  color: var(--fec-fg);
  font-size: 0.9rem;
}
.hp-msg { display: flex; align-items: flex-end; gap: 0.35rem; margin-bottom: 0.6rem; }
.hp-encode { margin-left: 0.5rem; color: var(--fec-muted); font-size: 0.85rem; padding-bottom: 0.4rem; }
.hp-main { display: flex; gap: 1.4rem; align-items: flex-start; flex-wrap: wrap; }
.hp-strips { display: flex; flex-direction: column; gap: 0.3rem; }
.hp-posrow, .hp-row { display: flex; align-items: center; gap: 0.3rem; }
.hp-pos {
  width: var(--hp-cell);
  text-align: center;
  font-size: 0.7rem;
  color: var(--fec-muted);
  font-variant-numeric: tabular-nums;
}
.hp-rowlab {
  width: 3.6rem;
  flex: none;
  text-align: right;
  padding-right: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--fec-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* bit cells */
.hp-cell {
  position: relative;
  width: var(--hp-cell);
  height: var(--hp-cell);
  display: grid;
  place-items: center;
  border-radius: 0.4rem;
  border: 1.5px solid var(--fec-line);
  background: var(--fec-surface-2);
  font-family: var(--slidev-code-font-family, monospace);
  line-height: 1;
  padding: 0;
}
.hp-bit { font-size: 1.05rem; font-weight: 700; }
.hp-sub { position: absolute; bottom: -0.92rem; font-size: 0.6rem; color: var(--fec-muted); white-space: nowrap; }
.hp-row { margin-bottom: 0.55rem; }
.hp-posrow { margin-bottom: 0.1rem; }

.hp-click { cursor: pointer; transition: transform 0.08s ease, box-shadow 0.12s ease; }
.hp-click:hover { transform: translateY(-1px); box-shadow: var(--fec-shadow); }
.hp-click:focus-visible { outline: 2px solid var(--fec-info); outline-offset: 2px; }

.hp-data { border-color: var(--fec-info); color: var(--fec-info); background: var(--fec-info-soft); }
.hp-parity { border-color: var(--fec-parity); color: var(--fec-parity); background: var(--fec-parity-soft); }
.hp-data.is-one, .hp-parity.is-one { filter: none; }

.is-flipped { border-color: var(--fec-error); background: var(--fec-error-soft); color: var(--fec-error); box-shadow: 0 0 0 2px var(--fec-error) inset; }

.hp-out { border-color: var(--fec-line); background: var(--fec-surface-2); color: var(--fec-fg); }
.hp-out.is-acted { box-shadow: 0 0 0 2px var(--fec-fg) inset; }
.hp-out.is-good.is-acted { border-color: var(--fec-corrected); background: var(--fec-corrected-soft); color: var(--fec-corrected); box-shadow: 0 0 0 2px var(--fec-corrected) inset; }
.hp-out.is-bad { border-color: var(--fec-error); background: var(--fec-error-soft); color: var(--fec-error); box-shadow: 0 0 0 2px var(--fec-error) inset; }

/* readout panel */
.hp-read {
  min-width: 15rem;
  flex: 1 1 15rem;
  max-width: 24rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.hp-synd { display: flex; align-items: center; gap: 0.5rem; }
.hp-synd .hp-rowlab { width: auto; padding-right: 0; margin-right: 0.35rem; }
.hp-sbits { font-size: 1.3rem; font-weight: 800; letter-spacing: 0.15em; color: var(--fec-fg); }
.hp-arrow { color: var(--fec-muted); }
.hp-sdec {
  font-size: 1.3rem; font-weight: 800;
  min-width: 1.8rem; text-align: center;
  color: var(--fec-info);
  border: 1.5px solid var(--fec-info); border-radius: 0.4rem; padding: 0 0.4rem;
}
.hp-point { font-size: 0.8rem; color: var(--fec-muted); margin-top: -0.1rem; }
.hp-verdict {
  border-radius: var(--fec-radius);
  border: 1px solid var(--fec-line);
  border-left-width: 4px;
  padding: 0.5rem 0.7rem;
  font-size: 0.86rem;
  line-height: 1.35;
  background: var(--fec-surface-2);
}
.hp-verdict.is-clean { border-left-color: var(--fec-muted); }
.hp-verdict.is-corrected { border-left-color: var(--fec-corrected); background: var(--fec-corrected-soft); }
.hp-verdict.is-miscorrect { border-left-color: var(--fec-error); background: var(--fec-error-soft); }
.hp-dmin { font-size: 0.76rem; color: var(--fec-error); font-weight: 600; }
.hp-foot { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; margin-top: 0.1rem; }
.hp-dataout { font-size: 0.82rem; color: var(--fec-muted); }
.hp-reset {
  cursor: pointer;
  border: 1px solid var(--fec-line);
  border-radius: 0.4rem;
  background: var(--fec-surface-2);
  color: var(--fec-fg);
  font-size: 0.78rem;
  padding: 0.2rem 0.7rem;
}
.hp-reset:hover { border-color: var(--fec-info); color: var(--fec-info); }

.hp-legend { display: flex; gap: 0.9rem; font-size: 0.72rem; color: var(--fec-muted); }
.hp-key { display: inline-flex; align-items: center; gap: 0.3rem; }
.hp-key::before { content: ''; width: 0.7rem; height: 0.7rem; border-radius: 0.2rem; border: 1.5px solid currentColor; }
.hp-key.hp-data { color: var(--fec-info); }
.hp-key.hp-parity { color: var(--fec-parity); }
.hp-key.hp-flip { color: var(--fec-error); }
.hp-key.hp-fix { color: var(--fec-corrected); }
</style>
