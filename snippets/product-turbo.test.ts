// Run with:  npm test   (node --test, native TS type-stripping on Node ≥22.6)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decode, softXor, SKLAR_CHANNEL, type ChannelLLRs, type Quad } from './product-turbo.ts'

const near = (a: number, b: number, tol = 0.05) => Math.abs(a - b) <= tol
const magsNear = (got: Quad, ref: number[], tol = 0.05) =>
  got.every((v, i) => near(Math.abs(v), ref[i], tol))

test('softXor matches the box-plus definition', () => {
  assert.equal(softXor(1.5, 2.5), -1.5) // −sgn·sgn·min = −min
  assert.equal(softXor(-1.2, 6.0), 1.2)
  assert.equal(softXor(0.1, 2.5), -0.1)
})

test('pass-1 extrinsic magnitudes match Sklar (signs aligned)', () => {
  const fr = decode(SKLAR_CHANNEL, 2)
  const h1 = fr[1] // horizontal, iteration 1
  const v1 = fr[2] // vertical, iteration 1
  assert.equal(h1.phase, 'horizontal')
  assert.equal(v1.phase, 'vertical')

  // Reference horizontal ≈ {−0.1, −1.5, −0.3, +0.2}; d2 rescued by strong d1.
  // Our symmetric soft-XOR yields the same MAGNITUDES {0.1,1.5,0.3,0.2}; the d4
  // sign is −0.2 here (a row-mate of d3 with same-sign inputs must share sign),
  // vs the +0.2 printed in the T09 spec table — a source sign artifact. FLAG
  // FOR T15: magnitude verified, d4 horizontal-extrinsic sign differs.
  assert.ok(magsNear(h1.extrinsic, [0.1, 1.5, 0.3, 0.2]), `h1 mags: ${h1.extrinsic}`)
  assert.ok(near(h1.extrinsic[1], -1.5), 'd2 gets a strong rescue extrinsic')

  // Reference vertical ≈ {+0.1, −0.1, −1.4, +1.0}; d3, d4 fixed. Exact match.
  assert.deepEqual(v1.extrinsic.map(v => Math.round(v * 100) / 100), [0.1, -0.1, -1.4, 1.0])
})

test('after 2 full iterations every |LLR| ≈ 2.5–2.6 and all bits correct', () => {
  const fr = decode(SKLAR_CHANNEL, 2)
  const final = fr[fr.length - 1]
  // Reference final |LLR| ≈ {2.6, 2.5, 2.6, 2.5}.
  assert.ok(magsNear(final.total, [2.6, 2.5, 2.6, 2.5]), `final: ${final.total}`)
  assert.ok(final.total.every(v => Math.abs(v) >= 2.4), 'uniform high confidence')
  // Decisions (positive ⇒ bit 0): 0,1,1,0 — the complement of Sklar's d=1,0,0,1
  // under his opposite convention. Consistent and correct after sign alignment.
  assert.deepEqual(final.hard, [0, 1, 1, 0])
})

test('trace shape: init + 2 half-iterations per full iteration', () => {
  const fr = decode(SKLAR_CHANNEL, 2)
  assert.equal(fr.length, 5) // init, H1, V1, H2, V2
  assert.equal(fr[0].phase, 'init')
  assert.deepEqual(fr[0].extrinsic, [0, 0, 0, 0])
  assert.deepEqual(fr.map(f => f.phase), ['init', 'horizontal', 'vertical', 'horizontal', 'vertical'])
})

test('explore mode: weakening d1 breaks d2 rescue', () => {
  const weak: ChannelLLRs = { ...SKLAR_CHANNEL, data: [0.05, 0.1, 0.2, 0.3] }
  const fr = decode(weak, 2)
  const final = fr[fr.length - 1]
  // d2's rescue relied on d1's certainty flowing through the row parity; with
  // d1 near zero, d2's confidence collapses (min() in the soft-XOR picks it up).
  assert.ok(Math.abs(final.total[1]) < 1.0, `d2 no longer rescued: ${final.total[1]}`)
  // and d1 itself stays weak
  assert.ok(Math.abs(final.total[0]) < 1.0, `d1 stays weak: ${final.total[0]}`)
})
