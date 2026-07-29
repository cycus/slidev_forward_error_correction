// Pure belief-propagation decoder behind Part 3's TannerBpSimulator (T07). No
// Vue, no DOM: importable and unit-tested (bp.test.ts). The component is a pure
// renderer of the `trace` this returns — every arrow, value and colour comes from
// here, so the numbers on screen are exactly the numbers the tests pin.
//
// Reference: Sarah Johnson, "Introducing LDPC Codes" (Examples 1.12 / 2.3 / 2.5).
// Polarity convention (styles/CONVENTIONS.md): a POSITIVE LLR ⇒ bit 0 is more
// likely, NEGATIVE ⇒ bit 1. Schedule is flooding (all nodes update together).

export type Bit = 0 | 1
export type Algorithm = 'sp' | 'ms' | 'nms'

/**
 * Johnson's (2,3)-regular rate-½ (6,3) code — the same H drawn on Part 3 slide 3
 * and carried through the erasure demo and this simulator. Every column has
 * weight 2, every row weight 3; girth 6 (no 4-cycles).
 */
export const H_TANNER: number[][] = [
  [1, 1, 0, 1, 0, 0],
  [0, 1, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 1],
  [0, 0, 1, 1, 0, 1],
]

/** The canonical transmitted codeword for the guided scenario (syndrome 0). */
export const CODEWORD: Bit[] = [0, 0, 1, 0, 1, 1]

/**
 * A short trapping-set code for the failure showcase only. It hides two
 * 4-cycles — {v0,v1}↔{c0,c1} and {v2,v3}↔{c2,c3}. Flipping one variable from
 * each cycle (FAIL_FLIPS) makes belief propagation OSCILLATE with period 2: the
 * satisfied-check count swings 4/6 → 0/6 → 4/6 … forever, never settling —
 * belief echoing round the cycle (the exact failure slide 4 warns about). Verified
 * non-convergent for every algorithm at every p ∈ [0.05, 0.45]. All-zero is a
 * codeword, so FAIL_FLIPS is a genuine 2-error pattern.
 */
export const H_TRAP: number[][] = [
  [1, 1, 0, 0, 1, 0, 0, 0],
  [1, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 0],
  [0, 0, 1, 1, 0, 0, 0, 1],
  [0, 1, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 1, 0, 1, 0, 1],
]

/** All-zero transmitted codeword for the trapping-set showcase. */
export const TRAP_CODEWORD: Bit[] = [0, 0, 0, 0, 0, 0, 0, 0]

/** The 2-bit error (one variable from each 4-cycle) that triggers oscillation. */
export const FAIL_FLIPS = [0, 2]

/** Flip the given 0-based positions of a word (returns a copy). */
export function flipBits(word: Bit[], positions: number[]): Bit[] {
  const out = [...word]
  for (const p of positions) out[p] = (out[p] ^ 1) as Bit
  return out
}

export interface DecodeOptions {
  algorithm?: Algorithm // default 'sp'
  alpha?: number // normalized-min-sum scale, default 0.75
  maxIter?: number // default 10
}

/** One message on a specific Tanner-graph edge (check c ↔ variable v). */
export interface Msg { c: number, v: number, value: number }

export interface Iteration {
  n: number // 1-based iteration index
  vnToCn: Msg[] // variable→check messages that fed this iteration's check update
  cnToVn: Msg[] // check→variable messages the checks sent back
  posterior: number[] // total LLR per variable after this iteration
  hard: Bit[] // hard decision per variable (LLR < 0 ⇒ bit 1)
  checkSat: boolean[] // per check: does the current hard decision satisfy it?
  satisfied: number // number of satisfied checks
  converged: boolean // all checks satisfied ⇒ early stop
}

export interface DecodeResult {
  channelLlr: number[]
  edges: { c: number, v: number }[]
  iterations: Iteration[]
  converged: boolean
  numIterations: number
  decoded: Bit[]
}

// tanh(±∞)=±1 makes atanh blow up; clip the product just short of 1.
const TANH_CLIP = 1 - 1e-12

/** cN[c] = variables touched by check c. */
export function checkNeighbors(H: number[][]): number[][] {
  return H.map(row => row.flatMap((x, v) => (x ? [v] : [])))
}

/** vN[v] = checks that watch variable v. */
export function varNeighbors(H: number[][]): number[][] {
  const out: number[][] = Array.from({ length: H[0].length }, () => [])
  H.forEach((row, c) => row.forEach((x, v) => { if (x) out[v].push(c) }))
  return out
}

/** BSC channel LLRs for a received word: received 0 ⇒ +ln((1−p)/p), 1 ⇒ −. */
export function bscLlr(word: Bit[], p: number): number[] {
  const mag = Math.log((1 - p) / p)
  return word.map(b => (b === 0 ? mag : -mag))
}

/** Hard decision from posterior LLRs (negative ⇒ bit 1). */
export function hardDecision(llr: number[]): Bit[] {
  return llr.map(x => (x < 0 ? 1 : 0) as Bit)
}

/** Per-check syndrome bit (0 = parity satisfied) for a hard-decision word. */
export function syndrome(H: number[][], bits: Bit[]): Bit[] {
  return H.map(row => row.reduce((a, x, v) => (a ^ (x && bits[v] ? 1 : 0)), 0) as Bit)
}

/**
 * Belief propagation on a Tanner graph, flooding schedule, returning the full
 * per-iteration message trace. `algorithm`: 'sp' (sum-product, tanh rule),
 * 'ms' (min-sum), 'nms' (normalized min-sum, magnitude ×alpha). Stops early the
 * first iteration all parity checks are satisfied.
 */
export function bpDecode(H: number[][], channelLlr: number[], opts: DecodeOptions = {}): DecodeResult {
  const algorithm = opts.algorithm ?? 'sp'
  const alpha = opts.alpha ?? 0.75
  const maxIter = opts.maxIter ?? 10
  const nChk = H.length
  const nVar = H[0].length
  const cN = checkNeighbors(H)
  const vN = varNeighbors(H)
  const edges = H.flatMap((_row, c) => cN[c].map(v => ({ c, v })))

  // vc[c][v] = current variable→check message; seed with the channel LLR.
  const vc: number[][] = H.map(() => new Array(nVar).fill(0))
  for (const { c, v } of edges) vc[c][v] = channelLlr[v]

  const iterations: Iteration[] = []
  let converged = false

  for (let n = 1; n <= maxIter; n++) {
    const vnToCn: Msg[] = edges.map(({ c, v }) => ({ c, v, value: vc[c][v] }))

    // --- check-node update: each edge excludes the message it's replying to ---
    const cv: number[][] = H.map(() => new Array(nVar).fill(0))
    for (let c = 0; c < nChk; c++) {
      for (const v of cN[c]) {
        const others = cN[c].filter(u => u !== v)
        if (algorithm === 'sp') {
          let prod = 1
          for (const u of others) prod *= Math.tanh(vc[c][u] / 2)
          prod = Math.max(-TANH_CLIP, Math.min(TANH_CLIP, prod))
          cv[c][v] = 2 * Math.atanh(prod)
        } else {
          let sign = 1
          let mag = Infinity
          for (const u of others) {
            sign *= vc[c][u] < 0 ? -1 : 1
            mag = Math.min(mag, Math.abs(vc[c][u]))
          }
          cv[c][v] = sign * (algorithm === 'nms' ? mag * alpha : mag)
        }
      }
    }
    const cnToVn: Msg[] = edges.map(({ c, v }) => ({ c, v, value: cv[c][v] }))

    // --- posterior, hard decision, syndrome ---
    const posterior = channelLlr.map((lch, v) => lch + vN[v].reduce((a, c) => a + cv[c][v], 0))
    const hard = hardDecision(posterior)
    const checkSat = syndrome(H, hard).map(s => s === 0)
    const satisfied = checkSat.filter(Boolean).length
    const iterConverged = satisfied === nChk

    iterations.push({ n, vnToCn, cnToVn, posterior, hard, checkSat, satisfied, converged: iterConverged })
    if (iterConverged) { converged = true; break }

    // --- variable-node update for the next iteration (extrinsic: posterior − reply) ---
    for (const { c, v } of edges) vc[c][v] = posterior[v] - cv[c][v]
  }

  const last = iterations[iterations.length - 1]
  return { channelLlr, edges, iterations, converged, numIterations: iterations.length, decoded: last.hard }
}
