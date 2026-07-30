// Run with:  npm test   (node --test, native TS type-stripping on Node ≥22.6)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  pyAerialWaterfall,
  blockLenAnchors,
  lteCqi,
  urllcAnchors,
  nrMcsRows,
  nrCqiRows,
  snrAt10pctBler,
  redundancyDeltaDb,
} from './blerData.ts'

test('dataset lengths match the T13 contract', () => {
  assert.equal(pyAerialWaterfall.length, 8)
  assert.equal(blockLenAnchors.length, 4)
  assert.equal(lteCqi.length, 15)
  assert.equal(urllcAnchors.length, 3)
  assert.equal(nrMcsRows.length, 4)
  assert.equal(nrCqiRows.length, 2)
})

test('every datapoint carries non-empty provenance', () => {
  const all = [
    ...pyAerialWaterfall, ...blockLenAnchors, ...lteCqi,
    ...urllcAnchors, ...nrMcsRows, ...nrCqiRows,
  ]
  for (const p of all) assert.ok(p.source && p.source.length > 0, `missing source on ${JSON.stringify(p)}`)
})

test('pyAerial waterfall is monotonically decreasing (a proper waterfall)', () => {
  for (let i = 1; i < pyAerialWaterfall.length; i++)
    assert.ok(pyAerialWaterfall[i].bler < pyAerialWaterfall[i - 1].bler)
  assert.deepEqual(pyAerialWaterfall[0], { snrDb: 8.1, bler: 1.0, source: pyAerialWaterfall[0].source, url: pyAerialWaterfall[0].url })
})

test('LTE CQI thresholds increase monotonically with the index', () => {
  for (let i = 1; i < lteCqi.length; i++)
    assert.ok(lteCqi[i].snrDb > lteCqi[i - 1].snrDb)
  assert.equal(lteCqi[0].snrDb, -9.478)
  assert.equal(lteCqi[14].snrDb, 19.809)
})

test('A/B redundancy delta CQI6→CQI1 ≈ 11.9 dB', () => {
  assert.ok(Math.abs(redundancyDeltaDb(6, 1) - 11.9) < 0.05)
  assert.equal(snrAt10pctBler(6), 2.424)
  assert.equal(snrAt10pctBler(1), -9.478)
})

test('URLLC anchors are non-monotonic (flag preserved, not "fixed")', () => {
  // MCS3 needs MORE SNR than MCS4/MCS7 despite the higher index.
  const mcs3 = urllcAnchors.find(a => a.mcs === 3)!
  const mcs4 = urllcAnchors.find(a => a.mcs === 4)!
  assert.ok(mcs3.snrDb > mcs4.snrDb)
  assert.ok(urllcAnchors.every(a => a.bler === 1e-5))
})
