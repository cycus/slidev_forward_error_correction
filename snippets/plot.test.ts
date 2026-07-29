// Run with:  npm test   (node --test, native TS type-stripping on Node ≥22.6)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { linMap, logMap, dbTicks, decadeTicks } from './plot.ts'

test('linMap maps endpoints and midpoint', () => {
  const m = linMap(0, 10, 0, 100)
  assert.equal(m(0), 0)
  assert.equal(m(10), 100)
  assert.equal(m(5), 50)
})

test('logMap places decades evenly in pixel space', () => {
  const m = logMap(0.1, 10, 0, 200)
  assert.equal(m(0.1), 0)
  assert.equal(m(10), 200)
  assert.ok(Math.abs(m(1) - 100) < 1e-9) // 1 sits at the midpoint of 0.1…10
})

test('dbTicks yields integer-step ticks within range', () => {
  assert.deepEqual(dbTicks(-2, 6, 2), [-2, 0, 2, 4, 6])
})

test('decadeTicks yields powers of ten within range', () => {
  assert.deepEqual(decadeTicks(0.1, 10), [0.1, 1, 10])
})
