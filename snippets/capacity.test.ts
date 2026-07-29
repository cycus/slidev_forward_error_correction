// Run with:  npm test   (node --test, native TS type-stripping on Node ≥22.6)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ebn0LimitDb, shannonCapacityMbps } from './capacity.ts'

const near = (a: number, b: number, tol = 0.01) =>
  assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`)

test('ebn0LimitDb(1) is exactly 0 dB', () => {
  assert.equal(ebn0LimitDb(1), 0)
})

test('ebn0LimitDb approaches the −1.59 dB ultimate limit as η→0', () => {
  near(ebn0LimitDb(1e-6), -1.59)
})

test('ebn0LimitDb matches the reference table (±0.01 dB)', () => {
  near(ebn0LimitDb(0.5), -0.82)
  near(ebn0LimitDb(2), 1.76)
  near(ebn0LimitDb(4), 5.74)
  near(ebn0LimitDb(8), 15.03)
})

test('shannonCapacityMbps: +3 dB of SNR buys ≈ +1 bit/s/Hz, not ×2', () => {
  const c0 = shannonCapacityMbps(20, 1) // 1 MHz ⇒ value reads as bits/s/Hz
  const c1 = shannonCapacityMbps(23, 1) // doubled power (+3 dB)
  near(c1 - c0, 1, 0.05) // one extra bit/s/Hz — the log ceiling
  assert.ok(c1 < 2 * c0) // definitively not a doubling of the rate
})
