// Run with:  npm test   (node --test, native TS type-stripping on Node ≥22.6)
//
// Pins the reference trajectory from the T07 spec (Sarah Johnson, "Introducing
// LDPC Codes", ex. 2.5). Every number the simulator shows on screen is asserted
// here to ±1e-3, so a rendering that matches the trace matches the reference.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  H_TANNER, CODEWORD, H_TRAP, TRAP_CODEWORD, FAIL_FLIPS,
  bpDecode, bscLlr, flipBits, hardDecision, syndrome, type Bit,
} from './bp.ts'

const near = (a: number, b: number, tol = 1e-3) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b} (±${tol})`)

// Canonical scenario: codeword [0 0 1 0 1 1] over BSC p=0.2, first bit flipped.
const Y: Bit[] = [1, 0, 1, 0, 1, 1]
const P = 0.2
const LLR_MAG = Math.log((1 - P) / P) // ln(0.8/0.2) = ln 4 = 1.386294…

test('BSC channel LLRs are ±ln((1−p)/p), sign set by the received bit', () => {
  const llr = bscLlr(Y, P)
  near(LLR_MAG, 1.3863)
  assert.deepEqual(llr.map(x => Math.sign(x)), [-1, 1, -1, 1, -1, -1]) // received 1 ⇒ negative
  for (const x of llr) near(Math.abs(x), 1.3863)
})

test('sum-product reproduces the reference trajectory and halts after 1 iteration', () => {
  const res = bpDecode(H_TANNER, bscLlr(Y, P), { algorithm: 'sp' })
  assert.equal(res.numIterations, 1)
  assert.equal(res.converged, true)

  // Degree-3 checks ⇒ every CN→VN message has magnitude 0.7538.
  for (const m of res.iterations[0].cnToVn) near(Math.abs(m.value), 0.7538)

  // Posterior after iteration 1 (spec values).
  const post = res.iterations[0].posterior
  const expected = [0.1213, 1.3863, -2.8938, 1.3863, -1.3863, -1.3863]
  post.forEach((v, i) => near(v, expected[i]))

  // The first bit's decision flips 1 → 0, recovering the sent codeword.
  assert.deepEqual(res.decoded, CODEWORD)
  assert.deepEqual(res.iterations[0].checkSat, [true, true, true, true])
})

test('min-sum overestimates: |E| = 1.3863 (×1.84 vs sum-product)', () => {
  const res = bpDecode(H_TANNER, bscLlr(Y, P), { algorithm: 'ms' })
  for (const m of res.iterations[0].cnToVn) near(Math.abs(m.value), 1.3863)
  near(1.3863 / 0.7538, 1.84, 5e-3) // the quoted overestimate factor
  assert.deepEqual(res.decoded, CODEWORD)
})

test('normalized min-sum (α=0.75) pulls the message back to 1.0397', () => {
  const res = bpDecode(H_TANNER, bscLlr(Y, P), { algorithm: 'nms', alpha: 0.75 })
  for (const m of res.iterations[0].cnToVn) near(Math.abs(m.value), 1.0397)
  assert.deepEqual(res.decoded, CODEWORD)
})

test('VN→CN messages of iteration 1 are exactly the channel LLRs', () => {
  const llr = bscLlr(Y, P)
  const res = bpDecode(H_TANNER, llr, { algorithm: 'sp' })
  for (const m of res.iterations[0].vnToCn) near(m.value, llr[m.v])
})

test('a clean codeword decodes in one iteration with all checks satisfied', () => {
  const res = bpDecode(H_TANNER, bscLlr(CODEWORD, P), { algorithm: 'sp' })
  assert.equal(res.converged, true)
  assert.deepEqual(res.decoded, CODEWORD)
  assert.equal(res.iterations[0].satisfied, 4)
})

test('syndrome / hardDecision agree on the sent codeword', () => {
  assert.deepEqual(syndrome(H_TANNER, CODEWORD), [0, 0, 0, 0])
  assert.deepEqual(hardDecision(bscLlr(Y, P)), [1, 0, 1, 0, 1, 1]) // = the received word
})

test('failure showcase: the trapping-set code never converges within 10 iterations', () => {
  const rx = flipBits(TRAP_CODEWORD, FAIL_FLIPS)
  for (const algorithm of ['sp', 'ms', 'nms'] as const) {
    const res = bpDecode(H_TRAP, bscLlr(rx, 0.1), { algorithm, maxIter: 10 })
    assert.equal(res.converged, false, `${algorithm} should not converge`)
    assert.equal(res.numIterations, 10)
  }
})

test('failure showcase oscillates with period 2 (belief echoes round the 4-cycle)', () => {
  const rx = flipBits(TRAP_CODEWORD, FAIL_FLIPS)
  const res = bpDecode(H_TRAP, bscLlr(rx, 0.1), { algorithm: 'sp', maxIter: 10 })
  const sat = res.iterations.map(it => it.satisfied)
  // steady-state swing between "almost solved" and "collapsed": 4 ↔ 0.
  assert.deepEqual(sat.slice(-4), [4, 0, 4, 0])
})

test('a valid trapping-set codeword (all-zero) is left untouched', () => {
  const res = bpDecode(H_TRAP, bscLlr(TRAP_CODEWORD, 0.1), { algorithm: 'sp' })
  assert.equal(res.converged, true)
  assert.deepEqual(res.decoded, TRAP_CODEWORD)
})
