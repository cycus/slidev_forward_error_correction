// Pure LLR helpers — the soft-decision math behind Part 2's LlrVisualizer and
// reused by the Part 3/4 decoder demos (T07/T09). No Vue, no DOM: importable and
// unit-testable (see llr.test.ts). Polarity convention (styles/CONVENTIONS.md):
// a POSITIVE LLR means bit 0 is more likely (3GPP / MATLAB).

/**
 * Log-likelihood ratio for one BPSK symbol over AWGN.
 * Mapping bit 0 → +1, bit 1 → −1, so LLR = ln P(0|y)/P(1|y) = 2y/σ².
 * Reference values (T05 spec): llrBpsk(0.9, 0.5) = +3.6; llrBpsk(−0.25, 0.5) = −1.0.
 */
export function llrBpsk(y: number, sigma2: number): number {
  return (2 * y) / sigma2
}

// --- Gray-mapped 16-QAM, max-log soft demapping -----------------------------
// Square 16-QAM is separable: the two I-axis bits and two Q-axis bits are
// independent PAM-4 decisions, so we solve one PAM-4 axis and apply it twice.
//
// Gray PAM-4, levels left→right with (hi, lo) bit labels:
//   −3:(0,0)  −1:(0,1)  +1:(1,1)  +3:(1,0)
// hi (the "outer" MSB) splits left/right  → boundary at 0, reliability grows with |x|.
// lo (the "inner" LSB) splits inner/outer → boundary at ±2, weaker at the same noise.
const PAM4: { a: number, hi: 0 | 1, lo: 0 | 1 }[] = [
  { a: -3, hi: 0, lo: 0 },
  { a: -1, hi: 0, lo: 1 },
  { a: +1, hi: 1, lo: 1 },
  { a: +3, hi: 1, lo: 0 },
]

/** Max-log LLRs [hi, lo] for one PAM-4 coordinate. Positive ⇒ bit 0. */
export function pam4MaxLog(x: number, sigma2: number): [number, number] {
  const d2 = (s: number) => (x - s) * (x - s)
  const minOver = (bit: 'hi' | 'lo', val: 0 | 1) =>
    Math.min(...PAM4.filter(p => p[bit] === val).map(p => d2(p.a)))
  // LLR(b) = [ min_{b=1} dist² − min_{b=0} dist² ] / σ²  (positive ⇒ bit 0)
  const llr = (bit: 'hi' | 'lo') => (minOver(bit, 1) - minOver(bit, 0)) / sigma2
  return [llr('hi'), llr('lo')]
}

/**
 * Max-log LLRs for one Gray-mapped 16-QAM point z = {i, q} (ideal points at
 * ±1, ±3 per axis). Returns [b0, b1, b2, b3]: b0/b1 from the I axis, b2/b3 from
 * Q, with b0/b2 the high-reliability outer bits and b1/b3 the weaker inner bits.
 */
export function llrMaxLogQam16(z: { i: number, q: number }, sigma2: number): number[] {
  const [b0, b1] = pam4MaxLog(z.i, sigma2)
  const [b2, b3] = pam4MaxLog(z.q, sigma2)
  return [b0, b1, b2, b3]
}
