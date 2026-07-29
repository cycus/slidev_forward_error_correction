// Pure RSC (recursive systematic convolutional) encoder logic for the LTE turbo
// constituent code, driving RscEncoderStepper (T09). No Vue, no DOM: importable
// and unit-tested (see rsc.test.ts).
//
// LTE constituent encoder (3GPP TS 36.212 §5.1.3.2):
//   G(D) = [ 1, g1(D)/g0(D) ],  g0 = 1 + D² + D³ (13₈),  g1 = 1 + D + D³ (15₈)
//
// 3-cell shift register, state = [s1, s2, s3] (written s1s2s3). Per step, with
// input bit x:
//   feedback  a = x ⊕ s2 ⊕ s3            (the g0 taps, minus the leading 1 = x)
//   parity    z = a ⊕ s1 ⊕ s3            (the g1 taps on the register incl. a)
//   shift     newState = [a, s1, s2]     (a → s1, s1 → s2, s2 → s3)
// Systematic output is x (passthrough) and is not returned here.
//
// A non-recursive (FIR) mode drops the feedback (a = x) so the SAME lone-1 input
// makes the parity die after the constraint length instead of ringing forever —
// the "why recursive matters" contrast (slide 4).

export type Bit = 0 | 1

/** Tap sets as 0-based indices into the state array [s1,s2,s3]. */
export interface RscPoly {
  /** g0 feedback taps (positions XORed with x to form a). LTE: [1,2] = s2,s3. */
  feedbackTaps: number[]
  /** g1 register taps XORed with a to form the parity z. LTE: [0,2] = s1,s3. */
  parityTaps: number[]
}

/** LTE / 3GPP (13,15)₈ constituent encoder. */
export const LTE_RSC: RscPoly = { feedbackTaps: [1, 2], parityTaps: [0, 2] }

export interface RscStep {
  k: number // 1-based step index
  x: Bit // input bit fed this step
  stateIn: Bit[] // [s1,s2,s3] before the step
  a: Bit // feedback / bit shifted into s1
  z: Bit // parity output
  stateOut: Bit[] // [s1,s2,s3] after the step
}

const xorTaps = (state: Bit[], taps: number[]): Bit =>
  (taps.reduce((acc, i) => acc ^ state[i], 0) & 1) as Bit

/** One encoder step. `recursive=false` gives the FIR contrast (no feedback). */
export function step(state: Bit[], x: Bit, poly: RscPoly = LTE_RSC, recursive = true): { a: Bit, z: Bit, next: Bit[] } {
  const fb = recursive ? xorTaps(state, poly.feedbackTaps) : 0
  const a = ((x ^ fb) & 1) as Bit
  const z = ((a ^ xorTaps(state, poly.parityTaps)) & 1) as Bit
  const next: Bit[] = [a, state[0], state[1]]
  return { a, z, next }
}

export interface EncodeOpts {
  poly?: RscPoly
  recursive?: boolean
  initial?: Bit[]
}

/** Encode an input bit sequence, returning the full per-step trace. */
export function encode(input: Bit[], opts: EncodeOpts = {}): RscStep[] {
  const poly = opts.poly ?? LTE_RSC
  const recursive = opts.recursive ?? true
  let state: Bit[] = (opts.initial ?? [0, 0, 0]).slice() as Bit[]
  const trace: RscStep[] = []
  input.forEach((x, i) => {
    const stateIn = state.slice() as Bit[]
    const { a, z, next } = step(state, x, poly, recursive)
    trace.push({ k: i + 1, x, stateIn, a, z, stateOut: next })
    state = next
  })
  return trace
}

/**
 * Trellis termination: 3 tail steps that flip the input to the feedback value
 * (x_tail = s2 ⊕ s3) so a = x_tail ⊕ s2 ⊕ s3 = 0, shifting zeros in and driving
 * the register to 000 from ANY reachable state. Always recursive.
 */
export function terminate(state: Bit[], poly: RscPoly = LTE_RSC): RscStep[] {
  let s: Bit[] = state.slice() as Bit[]
  const trace: RscStep[] = []
  for (let k = 1; k <= 3; k++) {
    const stateIn = s.slice() as Bit[]
    const xTail = xorTaps(s, poly.feedbackTaps) // = feedback ⇒ a becomes 0
    const { a, z, next } = step(s, xTail, poly, true)
    trace.push({ k, x: xTail, stateIn, a, z, stateOut: next })
    s = next
  }
  return trace
}

/** Convenience: render a state array as the "s1s2s3" string used in the UI. */
export function stateStr(state: Bit[]): string {
  return state.join('')
}
