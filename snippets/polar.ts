// Pure polar-coding logic driving PolarizationExplorer (T11). No Vue, no DOM:
// importable and unit-tested (see polar.test.ts).
//
// Channel polarization on a BEC(ε). The 2×2 kernel splits one channel into a
// worse one (W⁻) and a better one (W⁺). In erasure probability Z:
//   Z(W⁻) = 2Z − Z²   (worse, redder)
//   Z(W⁺) = Z²         (better, greener)
// Recursing n times gives N = 2ⁿ synthetic channels (Arıkan 2009, Prop. 5).
//
// Encoding is the linear transform x = u·G_N with G_N = G₂^⊗n (5G NR drops the
// bit-reversal permutation). encode() builds G_N by Kronecker power directly;
// butterflyStages() computes the same map in place, FFT-style — the two are
// cross-checked in the tests so the on-screen butterfly equals the tested math.

export type Bit = 0 | 1

/**
 * A synthetic channel's erasure probability. `value` is always present; `num`
 * and `den` carry the exact reduced fraction (only for n ≤ 3, where the integers
 * stay well inside 2⁵³ — beyond that we keep floats only, per the spec).
 */
export interface Z {
  value: number
  num?: number
  den?: number
}

function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b] }
  return a
}

function reduce(num: number, den: number): [number, number] {
  const g = gcd(num, den) || 1
  return [num / g, den / g]
}

/**
 * Erasure probabilities of the N = 2ⁿ synthetic BEC(ε) channels, ordered as the
 * recursion emits them (each parent → [worse, better]). Exact fractions for
 * n ≤ 3, floats beyond. Slider ε is taken to the nearest tenth for the exact path.
 */
export function polarize(eps: number, n: number): Z[] {
  if (n <= 3) {
    let [num, den] = reduce(Math.round(eps * 10), 10)
    let level: [number, number][] = [[num, den]]
    for (let d = 0; d < n; d++) {
      const next: [number, number][] = []
      for (const [pn, pd] of level) {
        const den2 = pd * pd
        next.push(reduce(2 * pn * pd - pn * pn, den2)) // worse: 2Z − Z²
        next.push(reduce(pn * pn, den2)) //               better: Z²
      }
      level = next
    }
    return level.map(([n2, d2]) => ({ value: n2 / d2, num: n2, den: d2 }))
  }
  let level = [eps]
  for (let d = 0; d < n; d++) {
    const next: number[] = []
    for (const z of level) { next.push(2 * z - z * z); next.push(z * z) }
    level = next
  }
  return level.map(v => ({ value: v }))
}

/** Indices of the k most reliable (lowest-Z) channels, returned sorted ascending. */
export function infoSet(zs: Z[], k: number): number[] {
  return zs
    .map((z, i): [number, number] => [z.value, i])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .slice(0, k)
    .map(([, i]) => i)
    .sort((a, b) => a - b)
}

/** G₂^⊗n as a plain 0/1 matrix (rows indexed by u, columns by x). */
function kroneckerG(n: number): Bit[][] {
  let g: Bit[][] = [[1]]
  const base: Bit[][] = [[1, 0], [1, 1]]
  for (let s = 0; s < n; s++) {
    const size = g.length
    const out: Bit[][] = Array.from({ length: size * 2 }, () => Array(size * 2).fill(0) as Bit[])
    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        if (!base[a][b]) continue
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) out[a * size + i][b * size + j] = g[i][j]
        }
      }
    }
    g = out
  }
  return g
}

/** x = u·G₂^⊗n over GF(2). Ground-truth encoder (matrix multiply). */
export function encode(u: Bit[], n: number): Bit[] {
  const N = 1 << n
  const g = kroneckerG(n)
  const x: Bit[] = Array(N).fill(0) as Bit[]
  for (let i = 0; i < N; i++) {
    if (!u[i]) continue
    for (let j = 0; j < N; j++) x[j] = (x[j] ^ g[i][j]) as Bit
  }
  return x
}

/**
 * In-place butterfly for x = u·G₂^⊗n. Returns n+1 snapshots: stages[0] = u (the
 * input), stages[s] = the register after stage s; stages[n] equals encode(u, n).
 * Each of the n stages performs N/2 XORs — the View-2 animation reads this trace.
 */
export function butterflyStages(u: Bit[], n: number): Bit[][] {
  const N = 1 << n
  let x = u.slice() as Bit[]
  const stages: Bit[][] = [x.slice() as Bit[]]
  for (let s = 0; s < n; s++) {
    const m = 1 << s
    const next = x.slice() as Bit[]
    for (let i = 0; i < N; i++) {
      if ((i & m) === 0) next[i] = (x[i] ^ x[i + m]) as Bit
    }
    x = next
    stages.push(x.slice() as Bit[])
  }
  return stages
}

/** Butterfly XOR count = (N/2)·log₂N. */
export function xorCount(n: number): number {
  return (1 << n) / 2 * n
}
