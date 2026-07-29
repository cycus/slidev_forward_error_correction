// Run with:  npm test   (node --test, native TS type-stripping on Node ≥22.6)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { encode, extractData, syndrome, decode, allCodewords, minDistance, type Data, type Word } from './hamming.ts'

test('encode produces the canonical demo codeword', () => {
  // data 1011 → p1=0,p2=1,p3=0 → position order [p1,p2,d1,p3,d2,d3,d4]
  assert.deepEqual(encode([1, 0, 1, 1]), [0, 1, 1, 0, 0, 1, 1])
})

test('every codeword has syndrome 0', () => {
  for (const w of allCodewords()) assert.equal(syndrome(w).position, 0)
})

test('extractData is the inverse of encode', () => {
  for (let n = 0; n < 16; n++) {
    const d: Data = [((n >> 3) & 1), ((n >> 2) & 1), ((n >> 1) & 1), (n & 1)] as Data
    assert.deepEqual(extractData(encode(d)), d)
  }
})

test('a single flip is located and corrected at every position', () => {
  const base = encode([1, 0, 1, 1])
  for (let pos = 1; pos <= 7; pos++) {
    const rx = [...base] as Word
    rx[pos - 1] ^= 1
    const { corrected, position } = decode(rx)
    assert.equal(position, pos) // syndrome points at the flipped bit
    assert.deepEqual(corrected, base) // and undoes it
  }
})

test('the canonical double flip (positions 5 then 2) miscorrects', () => {
  const base = encode([1, 0, 1, 1]) // [0,1,1,0,0,1,1]
  const rx = [...base] as Word
  rx[4] ^= 1 // position 5
  rx[1] ^= 1 // position 2
  const { corrected, position } = decode(rx)
  assert.equal(position, 7) // points at a THIRD position — the miscorrection
  assert.notDeepEqual(corrected, base) // decoder lands on the wrong codeword
  // ...yet the "corrected" word is itself a valid codeword (just the wrong one).
  assert.equal(syndrome(corrected).position, 0)
})

test('minimum distance of the (7,4) code is 3', () => {
  assert.equal(minDistance(), 3)
})
