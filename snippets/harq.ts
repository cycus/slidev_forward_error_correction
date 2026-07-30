// Pure HARQ arithmetic for HarqIrDemo (T13) and Part 6 slides 7–9 (T12). No Vue,
// no DOM: importable and unit-tested (see harq.test.ts). Every HARQ number a
// slide or component shows comes from here — no magic literals in templates.
//
// Incremental-redundancy HARQ on the NR LDPC circular buffer (TS 38.212
// §5.4.2.1): each redundancy version (RV) is a starting offset k0 into the
// length-Ncb buffer. Retransmitting from a different RV streams out fresh coded
// bits, so the effective code rate falls with every transmission.

export type Bg = 'BG1' | 'BG2'

// RV starting-offset "shift factors": k0 = ⌊num·Ncb/(den·Zc)⌋·Zc, indexed by RV.
// BG1: {0, 17/66, 33/66, 56/66}·Ncb ; BG2: {0, 13, 25, 43}/50·Ncb (srsRAN-verified).
const RV_NUM: Record<Bg, readonly number[]> = {
  BG1: [0, 17, 33, 56],
  BG2: [0, 13, 25, 43],
}
const RV_DEN: Record<Bg, number> = { BG1: 66, BG2: 50 }

/**
 * Starting bit offset k0 of redundancy version `rv` (0..3) in the circular
 * buffer, quantised down to a multiple of the lifting size Zc.
 * @param bg  base graph
 * @param rv  redundancy version 0..3 (transmission uses RV order {0,2,3,1})
 * @param Ncb circular-buffer length in bits
 * @param Zc  lifting size
 */
export function k0(bg: Bg, rv: number, Ncb: number, Zc: number): number {
  const num = RV_NUM[bg][rv]
  if (num === undefined) throw new Error(`invalid RV ${rv}`)
  return Math.floor((num * Ncb) / (RV_DEN[bg] * Zc)) * Zc
}

/** Effective code rate after `bitsSent` coded bits have been transmitted for a K-bit message. */
export function effectiveRate(K: number, bitsSent: number): number {
  return K / bitsSent
}

// Canonical IR scenario the slide/component walk through (T13 §HarqIrDemo).
export const CANONICAL = {
  K: 1000,
  bg: 'BG1' as Bg,
  ePerTx: 1250, // coded bits per transmission
  rvOrder: [0, 2, 3, 1] as const,
  cumulativeBits: [1250, 2500, 3750, 5000] as const, // after Tx 1..4
} as const

/** Effective rate after each transmission of the canonical scenario: 0.80, 0.40, 0.267, 0.20. */
export function canonicalEffectiveRates(): number[] {
  return CANONICAL.cumulativeBits.map(b => effectiveRate(CANONICAL.K, b))
}

// RV self-decodability, as data so slide 8 quotes it without magic literals.
// A version is self-decodable when its start lands in (or wraps into) the
// systematic region. Listed in TRANSMISSION order {0,2,3,1}. RV2 being NOT
// self-decodable is the common misconception (CafeTele states it wrong).
export interface RvFact {
  rv: number
  selfDecodable: boolean
  note: string
}

export const RV_SELF_DECODABLE: RvFact[] = [
  { rv: 0, selfDecodable: true, note: 'starts at the systematic bits' },
  { rv: 2, selfDecodable: false, note: 'parity-region start — common misconception it is' },
  { rv: 3, selfDecodable: true, note: 'wraps back into the systematic region' },
  { rv: 1, selfDecodable: false, note: 'parity-only start' },
]
