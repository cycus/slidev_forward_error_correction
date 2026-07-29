// Run with:  npm test   (node --test, native TS type-stripping on Node ≥22.6)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { llrBpsk, pam4MaxLog, llrMaxLogQam16 } from './llr.ts'

test('llrBpsk matches the T05 reference values', () => {
  assert.equal(llrBpsk(0.9, 0.5), 3.6)
  assert.equal(llrBpsk(-0.25, 0.5), -1.0)
})

test('llrBpsk decision flips sign exactly at y = 0', () => {
  assert.ok(llrBpsk(1e-9, 0.7) > 0) // just positive ⇒ bit 0
  assert.ok(llrBpsk(-1e-9, 0.7) < 0) // just negative ⇒ bit 1
  assert.equal(llrBpsk(0, 0.7), 0)
})

test('growing noise shrinks |LLR|', () => {
  assert.ok(Math.abs(llrBpsk(0.9, 1.2)) < Math.abs(llrBpsk(0.9, 0.3)))
})

test('repetition demo: soft sum decodes 0 while hard majority says 1', () => {
  const s2 = 0.5
  const ys = [0.9, -0.15, -0.25]
  const sum = ys.reduce((a, y) => a + llrBpsk(y, s2), 0)
  assert.equal(sum, 2.0) // +3.6 − 0.6 − 1.0
  assert.ok(sum > 0) // soft ⇒ bit 0
  const majorityOnes = ys.filter(y => y < 0).length // hard bits: 0,1,1 ⇒ two ones
  assert.ok(majorityOnes > ys.length / 2) // hard ⇒ bit 1 (wrong)
})

test('16QAM: outer bits are more reliable than inner bits at the same noise', () => {
  const s2 = 0.5
  // A point sitting on the +3 outer level (I) and −3 (Q): outer bits pinned hard.
  const llr = llrMaxLogQam16({ i: 3, q: -3 }, s2)
  const [i_hi, i_lo, q_hi, q_lo] = llr
  assert.ok(Math.abs(i_hi) > Math.abs(i_lo)) // I: outer bit stronger than inner
  assert.ok(Math.abs(q_hi) > Math.abs(q_lo)) // Q: same
  // Signs follow the point: I=+3 ⇒ hi bit 1 (LLR<0), inner (outer level) bit 0 (LLR>0).
  assert.ok(i_hi < 0 && q_hi > 0)
})

test('pam4MaxLog is exact max-log at the ideal levels', () => {
  // At x = −1 (label 0,1): hi=0 ⇒ LLR(hi)>0, lo=1 ⇒ LLR(lo)<0.
  const [hi, lo] = pam4MaxLog(-1, 0.5)
  assert.ok(hi > 0 && lo < 0)
})
