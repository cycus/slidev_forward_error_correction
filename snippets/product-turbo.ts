// Pure logic for TurboIterationDemo (T09): Sklar's 2×2 single-parity product
// code as a turbo stand-in. No Vue, no DOM: importable and unit-tested (see
// product-turbo.test.ts). Numbers follow Sklar, "Fundamentals of Turbo Codes".
//
// Grid of 4 data bits with one row parity per row and one col parity per column:
//
//     d1  d2 | pr1        rows:  R1 = {d1, d2, pr1},  R2 = {d3, d4, pr2}
//     d3  d4 | pr2        cols:  C1 = {d1, d3, pc1},  C2 = {d2, d4, pc2}
//     ---------
//     pc1 pc2
//
// Each half-iteration runs every single-parity check and, for each data bit,
// produces an EXTRINSIC via the soft-XOR (box-plus) approximation:
//     L(a ⊞ b) ≈ −sgn(La)·sgn(Lb)·min(|La|, |Lb|)
// The message a check receives about the partner bit is that bit's channel LLR
// plus the extrinsic it earned in the *other* dimension (the turbo principle:
// never feed a check back what it already told you).
//
// LLR polarity (styles/CONVENTIONS.md): positive ⇒ bit 0. Sklar's own example
// tabulates the transmitted word as d = 1,0,0,1 under the opposite sign
// convention, so our decision signs are the bit-for-bit complement of his —
// the MAGNITUDES (the pedagogical spine) are identical. See product-turbo.test.ts.

export type Quad = [number, number, number, number]

export interface ChannelLLRs {
  /** channel LLRs for [d1, d2, d3, d4] */
  data: Quad
  /** row parity channel LLRs [pr1 (d1,d2), pr2 (d3,d4)] */
  rowParity: [number, number]
  /** col parity channel LLRs [pc1 (d1,d3), pc2 (d2,d4)] */
  colParity: [number, number]
}

/** Sklar's worked example (verified against his published extrinsic trajectory). */
export const SKLAR_CHANNEL: ChannelLLRs = {
  data: [1.5, 0.1, 0.2, 0.3],
  rowParity: [2.5, 6.0],
  colParity: [2.0, 1.0],
}

export type Phase = 'init' | 'horizontal' | 'vertical'

export interface HalfIter {
  phase: Phase
  /** 1-based full-iteration index this half-iteration belongs to (0 for init). */
  iter: number
  /** extrinsic produced this half-iteration, per bit (all 0 for init). */
  extrinsic: Quad
  /** a-priori LLRs used this half-iteration (the other dimension's extrinsic). */
  apriori: Quad
  /** current soft output per bit = channel + latest horizontal + latest vertical. */
  total: Quad
  /** hard decision per bit (positive LLR ⇒ bit 0). */
  hard: [0 | 1, 0 | 1, 0 | 1, 0 | 1]
}

/** Soft-XOR (box-plus) approximation. */
export function softXor(la: number, lb: number): number {
  return -Math.sign(la) * Math.sign(lb) * Math.min(Math.abs(la), Math.abs(lb))
}

const hardOf = (q: Quad): [0 | 1, 0 | 1, 0 | 1, 0 | 1] =>
  q.map(v => (v >= 0 ? 0 : 1)) as [0 | 1, 0 | 1, 0 | 1, 0 | 1]

// Partner (the "other" data bit) and which parity applies, per dimension.
// Horizontal (rows):  d1↔d2 via pr1 ; d3↔d4 via pr2
// Vertical   (cols):  d1↔d3 via pc1 ; d2↔d4 via pc2
const H_PARTNER = [1, 0, 3, 2]
const H_PARITY = [0, 0, 1, 1] // index into rowParity
const V_PARTNER = [2, 3, 0, 1]
const V_PARITY = [0, 1, 0, 1] // index into colParity

/**
 * Run the product-code turbo decoder, returning the full trace: an `init`
 * frame plus a horizontal + vertical half-iteration per full iteration. The
 * component is a pure renderer of this list.
 */
export function decode(ch: ChannelLLRs, iterations = 2): HalfIter[] {
  const Lc = ch.data
  let Leh: Quad = [0, 0, 0, 0] // latest horizontal extrinsics
  let Lev: Quad = [0, 0, 0, 0] // latest vertical extrinsics

  const total = (): Quad => [0, 1, 2, 3].map(i => Lc[i] + Leh[i] + Lev[i]) as Quad
  const frames: HalfIter[] = [{
    phase: 'init', iter: 0, extrinsic: [0, 0, 0, 0], apriori: [0, 0, 0, 0],
    total: total(), hard: hardOf(total()),
  }]

  for (let it = 1; it <= iterations; it++) {
    // ---- horizontal half-iteration: a-priori = current vertical extrinsics ----
    const aH = Lev
    const nextLeh = [0, 1, 2, 3].map((i) => {
      const p = H_PARTNER[i]
      const partnerMsg = Lc[p] + Lev[p]
      return softXor(partnerMsg, ch.rowParity[H_PARITY[i]])
    }) as Quad
    Leh = nextLeh
    frames.push({ phase: 'horizontal', iter: it, extrinsic: Leh, apriori: aH, total: total(), hard: hardOf(total()) })

    // ---- vertical half-iteration: a-priori = current horizontal extrinsics ----
    const aV = Leh
    const nextLev = [0, 1, 2, 3].map((i) => {
      const p = V_PARTNER[i]
      const partnerMsg = Lc[p] + Leh[p]
      return softXor(partnerMsg, ch.colParity[V_PARITY[i]])
    }) as Quad
    Lev = nextLev
    frames.push({ phase: 'vertical', iter: it, extrinsic: Lev, apriori: aV, total: total(), hard: hardOf(total()) })
  }

  return frames
}
