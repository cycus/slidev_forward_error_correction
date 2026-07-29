// Pure (7,4) Hamming logic for HammingPlayground (T05). No Vue, no DOM:
// importable and unit-testable (see hamming.test.ts).
//
// Standard construction (Hamming 1950). Codeword laid out in POSITION order
// 1..7, where the parity bits sit at the power-of-two positions 1,2,4 and the
// data bits at 3,5,6,7 — the layout that makes the syndrome read out, in binary,
// the DECIMAL index of the flipped bit:
//
//   position:  1    2    3    4    5    6    7
//   content:   p1   p2   d1   p3   d2   d3   d4
//
// Parity equations (as in the T05 spec):
//   p1 = d1 ⊕ d2 ⊕ d4   (checks positions 1,3,5,7)
//   p2 = d1 ⊕ d3 ⊕ d4   (checks positions 2,3,6,7)
//   p3 = d2 ⊕ d3 ⊕ d4   (checks positions 4,5,6,7)

export type Bit = 0 | 1
export type Data = [Bit, Bit, Bit, Bit]
export type Word = [Bit, Bit, Bit, Bit, Bit, Bit, Bit]

const xor = (...bs: Bit[]): Bit => (bs.reduce((a, b) => a ^ b, 0) & 1) as Bit

/** Encode 4 data bits [d1,d2,d3,d4] into the 7-bit position-ordered codeword. */
export function encode([d1, d2, d3, d4]: Data): Word {
  const p1 = xor(d1, d2, d4)
  const p2 = xor(d1, d3, d4)
  const p3 = xor(d2, d3, d4)
  return [p1, p2, d1, p3, d2, d3, d4]
}

/** Pull the 4 data bits back out of a position-ordered word (positions 3,5,6,7). */
export function extractData(w: Word): Data {
  return [w[2], w[4], w[5], w[6]]
}

/**
 * Syndrome of a received word. The three check bits, read as the binary number
 * (s3 s2 s1), give the 1-based position of a single flipped bit — or 0 if the
 * word satisfies every parity check.
 */
export function syndrome(w: Word): { s1: Bit, s2: Bit, s3: Bit, position: number } {
  // 0-based array index i ↔ 1-based position (i+1).
  const s1 = xor(w[0], w[2], w[4], w[6]) // positions 1,3,5,7
  const s2 = xor(w[1], w[2], w[5], w[6]) // positions 2,3,6,7
  const s3 = xor(w[3], w[4], w[5], w[6]) // positions 4,5,6,7
  return { s1, s2, s3, position: s1 + 2 * s2 + 4 * s3 }
}

/**
 * Syndrome decode: flip the bit the syndrome points at (if any).
 * `position` is the 1-based bit the decoder acted on (0 = none). With a single
 * channel error this recovers the transmitted word; with two, it "corrects" the
 * wrong position — the (7,4) miscorrection that d_min = 3 permits.
 */
export function decode(w: Word): { corrected: Word, position: number } {
  const { position } = syndrome(w)
  const corrected = [...w] as Word
  if (position > 0) corrected[position - 1] ^= 1
  return { corrected, position }
}

/** All 16 codewords, in data-value order 0000..1111. */
export function allCodewords(): Word[] {
  const out: Word[] = []
  for (let n = 0; n < 16; n++) {
    const d: Data = [((n >> 3) & 1) as Bit, ((n >> 2) & 1) as Bit, ((n >> 1) & 1) as Bit, (n & 1) as Bit]
    out.push(encode(d))
  }
  return out
}

/** Minimum pairwise Hamming distance over the whole code (should be 3). */
export function minDistance(): number {
  const cws = allCodewords()
  let min = Infinity
  for (let i = 0; i < cws.length; i++) {
    for (let j = i + 1; j < cws.length; j++) {
      const d = cws[i].reduce((acc, b, k) => acc + (b ^ cws[j][k]), 0)
      if (d < min) min = d
    }
  }
  return min
}
