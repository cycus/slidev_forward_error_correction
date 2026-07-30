// Run with:  npm test   (node --test, native TS type-stripping on Node ≥22.6)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { polarize, infoSet, encode, butterflyStages, xorCount, type Bit } from './polar.ts'

// All BEC(0.5) reference values are Arıkan 2009 Prop. 5, re-derivable from
// Z⁺=Z², Z⁻=2Z−Z² in one line each — embedded here as fixtures.

test('polarize BEC(0.5): N=2 = {0.75, 0.25}, exact 3/4, 1/4', () => {
  const z = polarize(0.5, 1)
  assert.deepEqual(z.map(v => v.value), [0.75, 0.25])
  assert.deepEqual(z.map(v => [v.num, v.den]), [[3, 4], [1, 4]])
})

test('polarize BEC(0.5): N=4 = {15/16, 9/16, 7/16, 1/16}', () => {
  const z = polarize(0.5, 2)
  assert.deepEqual(z.map(v => [v.num, v.den]), [[15, 16], [9, 16], [7, 16], [1, 16]])
})

test('polarize BEC(0.5): N=8 = {255,225,207,81,175,49,31,1}/256', () => {
  const z = polarize(0.5, 3)
  assert.deepEqual(z.map(v => v.num), [255, 225, 207, 81, 175, 49, 31, 1])
  assert.ok(z.every(v => v.den === 256))
})

test('polarize floats beyond n=3 (N=16 has 16 channels, no exact fraction)', () => {
  const z = polarize(0.5, 4)
  assert.equal(z.length, 16)
  assert.equal(z[0].num, undefined)
  // Extremes still pile toward 1 and 0.
  assert.ok(z.some(v => v.value > 0.99) && z.some(v => v.value < 0.01))
})

test('infoSet: N=8, k=4, ε=0.5 → {3,5,6,7}; frozen {0,1,2,4}', () => {
  const z = polarize(0.5, 3)
  const info = infoSet(z, 4)
  assert.deepEqual(info, [3, 5, 6, 7])
  const frozen = [0, 1, 2, 4, 3, 5, 6, 7].filter(i => !info.includes(i)).sort((a, b) => a - b)
  assert.deepEqual(frozen, [0, 1, 2, 4])
})

test('encode: N=2 gives [u0⊕u1, u1]', () => {
  assert.deepEqual(encode([0, 0], 1), [0, 0])
  assert.deepEqual(encode([1, 0], 1), [1, 0])
  assert.deepEqual(encode([1, 1], 1), [0, 1])
  assert.deepEqual(encode([0, 1], 1), [1, 1])
})

test('encode is GF(2)-linear: encode(a⊕b) = encode(a)⊕encode(b)', () => {
  const n = 3, N = 8
  const rnd = (): Bit[] => Array.from({ length: N }, () => (Math.random() < 0.5 ? 0 : 1) as Bit)
  for (let t = 0; t < 50; t++) {
    const a = rnd(), b = rnd()
    const ab = a.map((v, i) => (v ^ b[i]) as Bit)
    const lhs = encode(ab, n)
    const ea = encode(a, n), eb = encode(b, n)
    const rhs = ea.map((v, i) => (v ^ eb[i]) as Bit)
    assert.deepEqual(lhs, rhs)
  }
})

test('butterfly propagates to encode for every u at N=8 (property test)', () => {
  const n = 3, N = 8
  for (let mask = 0; mask < (1 << N); mask++) {
    const u: Bit[] = Array.from({ length: N }, (_, i) => ((mask >> i) & 1) as Bit)
    const stages = butterflyStages(u, n)
    assert.equal(stages.length, n + 1)
    assert.deepEqual(stages[n], encode(u, n))
  }
})

test('xorCount = (N/2)·log₂N: 12 at N=8, 2304 at N=512', () => {
  assert.equal(xorCount(3), 12)
  assert.equal(xorCount(9), 2304)
})
