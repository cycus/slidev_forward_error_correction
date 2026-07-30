// Run with:  npm test   (node --test, native TS type-stripping on Node ≥22.6)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { k0, effectiveRate, canonicalEffectiveRates, CANONICAL, RV_SELF_DECODABLE } from './harq.ts'

const rnd2 = (x: number) => Math.round(x * 100) / 100

test('k0 BG1: RV offsets map to {0, 17/66, 33/66, 56/66}·Ncb, quantised to Zc', () => {
  const Zc = 384
  const Ncb = 66 * Zc // clean case: k0 = {0,17,33,56}·Zc exactly
  assert.deepEqual(
    [0, 1, 2, 3].map(rv => k0('BG1', rv, Ncb, Zc)),
    [0, 17, 33, 56].map(n => n * Zc),
  )
  // every offset is a multiple of Zc
  for (const rv of [0, 1, 2, 3]) assert.equal(k0('BG1', rv, Ncb, Zc) % Zc, 0)
})

test('k0 BG2: RV offsets map to {0, 13, 25, 43}/50·Ncb', () => {
  const Zc = 128
  const Ncb = 50 * Zc
  assert.deepEqual(
    [0, 1, 2, 3].map(rv => k0('BG2', rv, Ncb, Zc)),
    [0, 13, 25, 43].map(n => n * Zc),
  )
})

test('effectiveRate: canonical sequence = 0.80 / 0.40 / 0.27 / 0.20', () => {
  assert.deepEqual(canonicalEffectiveRates().map(rnd2), [0.8, 0.4, 0.27, 0.2])
  // 0.27 is the rounded readout of the raw 1000/3750
  assert.equal(rnd2(effectiveRate(1000, 3750)), 0.27)
  assert.equal(effectiveRate(CANONICAL.K, CANONICAL.cumulativeBits[0]), 0.8)
})

test('RV self-decodability facts: RV0 ✓, RV2 ✗, RV3 ✓, RV1 ✗ (transmission order)', () => {
  assert.deepEqual(
    RV_SELF_DECODABLE.map(f => [f.rv, f.selfDecodable]),
    [[0, true], [2, false], [3, true], [1, false]],
  )
})
