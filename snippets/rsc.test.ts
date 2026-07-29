// Run with:  npm test   (node --test, native TS type-stripping on Node ≥22.6)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { encode, terminate, step, LTE_RSC, type Bit } from './rsc.ts'

test('LTE reference trace: input 1,1,0,1 from state 000', () => {
  const tr = encode([1, 1, 0, 1])
  // Author-derived reference (slide 5). Columns: state in → out, a, parity z.
  const expected = [
    { x: 1, stateIn: [0, 0, 0], a: 1, z: 1, stateOut: [1, 0, 0] },
    { x: 1, stateIn: [1, 0, 0], a: 1, z: 0, stateOut: [1, 1, 0] },
    { x: 0, stateIn: [1, 1, 0], a: 1, z: 0, stateOut: [1, 1, 1] },
    { x: 1, stateIn: [1, 1, 1], a: 1, z: 1, stateOut: [1, 1, 1] },
  ]
  assert.equal(tr.length, 4)
  tr.forEach((s, i) => {
    assert.equal(s.x, expected[i].x, `k${i + 1} x`)
    assert.deepEqual(s.stateIn, expected[i].stateIn, `k${i + 1} stateIn`)
    assert.equal(s.a, expected[i].a, `k${i + 1} a`)
    assert.equal(s.z, expected[i].z, `k${i + 1} parity`)
    assert.deepEqual(s.stateOut, expected[i].stateOut, `k${i + 1} stateOut`)
  })
  // The parity stream spelled out, matching the slide's fec-tnum table.
  assert.deepEqual(tr.map(s => s.z), [1, 0, 0, 1])
})

test('termination reaches 000 from every one of the 8 states in 3 tail steps', () => {
  for (let n = 0; n < 8; n++) {
    const s0: Bit[] = [((n >> 2) & 1) as Bit, ((n >> 1) & 1) as Bit, (n & 1) as Bit]
    const tail = terminate(s0)
    assert.equal(tail.length, 3, `state ${s0.join('')} tail length`)
    assert.deepEqual(tail[2].stateOut, [0, 0, 0], `state ${s0.join('')} → 000`)
    // Every tail step drives the feedback to 0 (a = 0).
    tail.forEach(t => assert.equal(t.a, 0, `state ${s0.join('')} a=0`))
  }
})

test('reference trace then termination: 111 returns to 000', () => {
  const tr = encode([1, 1, 0, 1])
  const end = tr[tr.length - 1].stateOut // 111
  assert.deepEqual(end, [1, 1, 1])
  const tail = terminate(end)
  assert.deepEqual(tail.map(t => t.stateOut), [[0, 1, 1], [0, 0, 1], [0, 0, 0]])
})

test('why recursive: a lone 1 rings forever (IIR) but dies in FIR', () => {
  const lone: Bit[] = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const iir = encode(lone, { recursive: true })
  const fir = encode(lone, { recursive: false })

  // FIR: the single 1 flushes through the 3-cell register and the state
  // returns to 000 within the constraint length, after which parity is dead.
  const firZeroAt = fir.findIndex(s => s.stateOut.every(b => b === 0))
  assert.ok(firZeroAt >= 0 && firZeroAt <= 3, 'FIR returns to 000 by step 4')
  assert.ok(fir.slice(firZeroAt + 1).every(s => s.z === 0), 'FIR parity dead after')

  // IIR: with feedback a weight-1 input never drives the register back to 000,
  // so the parity keeps toggling (rings) — the whole point of recursion.
  assert.ok(iir.every(s => !s.stateOut.every(b => b === 0)), 'IIR never returns to 000')
  assert.ok(iir.slice(5).some(s => s.z === 1), 'IIR parity still active well past constraint length')
})

test('step is polynomial-parameterized and matches the equations', () => {
  // a = x ⊕ s2 ⊕ s3 ; z = a ⊕ s1 ⊕ s3 ; next = [a, s1, s2]
  const r = step([1, 1, 1], 1, LTE_RSC, true)
  assert.equal(r.a, 1) // 1 ⊕ 1 ⊕ 1
  assert.equal(r.z, 1) // 1 ⊕ 1 ⊕ 1
  assert.deepEqual(r.next, [1, 1, 1])
})
