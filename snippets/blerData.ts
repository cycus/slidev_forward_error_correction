// THE DATA CONTRACT for Part 6 (T12 slides) and its interactive components
// (T13: BlerExplorer + HarqIrDemo). Every datapoint carries its own provenance
// so the numbers printed on a slide and the numbers a component draws are the
// SAME curated figures — they can never silently drift. Pure data + tiny
// lookups; no Vue, no DOM. Annotation style mirrors CapacityExplorer's sourced
// marker/curve tables (per-row provenance, comments for flags).
//
// PROVENANCE (LTE vs NR — keep labelled everywhere): the CQI→SINR thresholds
// (dataset 3) are LTE/turbo measurements; the waterfall and block-length
// families are NR LDPC link-level sims (pyAerial / Sionna). URLLC anchors are
// NR LDPC. Every layer keeps its own `source` string so the legend can say so.

// ── source strings (reused across a dataset's points) ──────────────────────
const SRC_PYAERIAL = 'NVIDIA pyAerial AWGN notebook (MCS9)'
const URL_PYAERIAL = 'https://docs.nvidia.com/aerial/'
const SRC_SIONNA = 'Sionna 5G LDPC BLER tutorial (R=1/2, AWGN)'
const URL_SIONNA = 'https://nvlabs.github.io/sionna/'
const SRC_IOSR = 'IOSR-JECE, LTE CQI→SINR @ 10% BLER (turbo)'
const URL_IOSR = ''
const SRC_SADHANA = 'Khan & Jacob, Sādhanā 48:77 (2023) — NR URLLC'
const URL_SADHANA = ''
const SRC_38214 = '3GPP TS 38.214 §5.1.3.1 / §5.2.2.1 via ShareTechnote/iTecSpec'
const URL_38214 = 'https://www.sharetechnote.com/'

// ── Dataset 1: NR LDPC AWGN waterfall (pyAerial, MCS9) ──────────────────────
// The canonical "what a waterfall looks like" curve. Two orders of magnitude of
// BLER fall inside ~0.3 dB of SINR — the steepness that makes 1-dB MCS steps
// work. FLAG (T15): the notebook's MCS→modulation identity (MCS9) is unverified
// (looks like a 256QAM-table row); label the curve "as published, MCS identity
// unconfirmed" until checked. Last point is below the sim's measurable floor.
export interface BlerPoint {
  snrDb: number
  bler: number
  source: string
  url: string
  note?: string
}

export const pyAerialWaterfall: BlerPoint[] = (
  [[8.1, 1.0], [8.2, 0.9921], [8.3, 0.7812], [8.4, 0.3281],
    [8.5, 0.0657], [8.6, 0.0071], [8.7, 1e-4], [8.8, 0]] as [number, number][]
).map(([snrDb, bler]) => ({ snrDb, bler, source: SRC_PYAERIAL, url: URL_PYAERIAL }))

// ── Dataset 2: block-length family @ R=1/2 (Sionna) ─────────────────────────
// Sparse anchors: one measured (n, BLER @ SNR) per block length. Render as
// idealized waterfalls THROUGH these points, dashed, with a legend note — the
// intermediate shape is interpolated, not measured. The envelope states where
// each length crosses BLER = 1e-3: the leftward march from n=128 to n=16000.
export const blockLenIsInterpolated = true // dashed styling flag for T13

export interface BlockLenAnchor {
  k: number
  n: number
  snrDb: number
  bler: number
  source: string
  url: string
}

export const blockLenAnchors: BlockLenAnchor[] = (
  [[64, 128, 4.0, 1.33e-3], [64, 512, 2.5, 2.15e-3],
    [500, 1000, 1.75, 2.81e-3], [4000, 8000, 1.0, 0.416]] as [number, number, number, number][]
).map(([k, n, snrDb, bler]) => ({ k, n, snrDb, bler, source: SRC_SIONNA, url: URL_SIONNA }))

// BLER = 1e-3 crossing vs block length — the "n grows ⇒ curve slides left" story.
export const blockLenEnvelope: { n: number, snrAt1e3Db: number, source: string, url: string }[] = [
  { n: 128, snrAt1e3Db: 3.5, source: SRC_SIONNA, url: URL_SIONNA },
  { n: 16000, snrAt1e3Db: 1.25, source: SRC_SIONNA, url: URL_SIONNA },
]

// ── Dataset 3: LTE CQI thresholds @ 10% BLER (IOSR-JECE) ────────────────────
// The classic CQI staircase. LTE/turbo provenance — say so on every slide/legend
// that shows it. Rows carry the (modulation, R×1024) that each CQI index maps to
// (LTE CQI table, TS 36.213 Table 7.2.3-1). SINR is the operating point where
// that MCS hits 10% BLER. ~29 dB span, CQI1→CQI15; ≈2.1 dB per index step.
export interface CqiRow {
  cqi: number
  modulation: string
  codeRate1024: number
  snrDb: number // @ 10% BLER
  source: string
  url: string
}

export const lteCqi: CqiRow[] = [
  { cqi: 1, modulation: 'QPSK', codeRate1024: 78, snrDb: -9.478 },
  { cqi: 2, modulation: 'QPSK', codeRate1024: 120, snrDb: -6.658 },
  { cqi: 3, modulation: 'QPSK', codeRate1024: 193, snrDb: -4.098 },
  { cqi: 4, modulation: 'QPSK', codeRate1024: 308, snrDb: -1.798 },
  { cqi: 5, modulation: 'QPSK', codeRate1024: 449, snrDb: 0.399 },
  { cqi: 6, modulation: 'QPSK', codeRate1024: 602, snrDb: 2.424 },
  { cqi: 7, modulation: '16QAM', codeRate1024: 378, snrDb: 4.489 },
  { cqi: 8, modulation: '16QAM', codeRate1024: 490, snrDb: 6.367 },
  { cqi: 9, modulation: '16QAM', codeRate1024: 616, snrDb: 8.456 },
  { cqi: 10, modulation: '64QAM', codeRate1024: 466, snrDb: 10.266 },
  { cqi: 11, modulation: '64QAM', codeRate1024: 567, snrDb: 12.218 },
  { cqi: 12, modulation: '64QAM', codeRate1024: 666, snrDb: 14.122 },
  { cqi: 13, modulation: '64QAM', codeRate1024: 772, snrDb: 15.849 },
  { cqi: 14, modulation: '64QAM', codeRate1024: 873, snrDb: 17.786 },
  { cqi: 15, modulation: '64QAM', codeRate1024: 948, snrDb: 19.809 },
].map(r => ({ ...r, source: SRC_IOSR, url: URL_IOSR }))

/** SINR (dB) at 10% BLER for an LTE CQI index (dataset 3). */
export function snrAt10pctBler(cqi: number): number {
  const row = lteCqi.find(r => r.cqi === cqi)
  if (!row) throw new Error(`no LTE CQI row for index ${cqi}`)
  return row.snrDb
}

/**
 * SINR headroom (dB) bought by dropping from a high CQI to a low one — i.e. by
 * spending redundancy. redundancyDeltaDb(6, 1) ≈ 11.9 dB (QPSK 602→78): the
 * slide-6 headline, computed from the data rather than hard-coded.
 */
export function redundancyDeltaDb(cqiHigh: number, cqiLow: number): number {
  return snrAt10pctBler(cqiHigh) - snrAt10pctBler(cqiLow)
}

// ── Dataset 4: URLLC low-SE anchors (Sādhanā 2023) @ BLER 1e-5 ──────────────
// NR LDPC, 32-byte payloads, high-reliability target. FLAG: the rows are
// NON-MONOTONIC in SNR vs MCS (MCS3 needs MORE SNR than MCS4/MCS7) — surface
// that in tooltips rather than "fixing" it; it's what the paper reports.
export interface UrllcAnchor {
  mcs: number
  snrDb: number // @ BLER 1e-5
  bler: number
  source: string
  url: string
  note?: string
}

export const urllcAnchors: UrllcAnchor[] = [
  { mcs: 3, snrDb: 5.597, bler: 1e-5, note: 'non-monotonic: higher SNR than MCS4/7' },
  { mcs: 4, snrDb: 3.2, bler: 1e-5 },
  { mcs: 7, snrDb: 3.192, bler: 1e-5 },
].map(r => ({ ...r, source: SRC_SADHANA, url: URL_SADHANA }))

// ── Dataset 5: NR MCS/CQI table rows (TS 38.214) for the pickers ────────────
// Representative endpoints of the three NR MCS tables plus the two ends of the
// NR (256QAM) CQI table — the "rate dial" range: SE 0.0586 → 7.4063.
export interface McsRow {
  tableId: string
  tableShort: string // '64QAM' | '256QAM' | 'low-SE'
  mcs: number
  modulation: string
  codeRate1024: number
  se: number
  source: string
  url: string
}

export const nrMcsRows: McsRow[] = [
  { tableId: 'TS 38.214 Table 5.1.3.1-1', tableShort: '64QAM', mcs: 0, modulation: 'QPSK', codeRate1024: 120, se: 0.2344 },
  { tableId: 'TS 38.214 Table 5.1.3.1-1', tableShort: '64QAM', mcs: 28, modulation: '64QAM', codeRate1024: 948, se: 5.5547 },
  { tableId: 'TS 38.214 Table 5.1.3.1-2', tableShort: '256QAM', mcs: 27, modulation: '256QAM', codeRate1024: 948, se: 7.4063 },
  { tableId: 'TS 38.214 Table 5.1.3.1-3', tableShort: 'low-SE', mcs: 0, modulation: 'QPSK', codeRate1024: 30, se: 0.0586 },
].map(r => ({ ...r, source: SRC_38214, url: URL_38214 }))

// NR (256QAM) CQI table endpoints — CQI1 QPSK 78/1024 … CQI15 256QAM 948/1024.
// No SINR column: the NR spec defines CQI by modulation/rate, not a threshold
// (that's the LTE measurement in dataset 3). SE = (Qm · R/1024) rounded.
export interface NrCqiRow {
  cqi: number
  modulation: string
  codeRate1024: number
  se: number
  source: string
  url: string
}

export const nrCqiRows: NrCqiRow[] = [
  { cqi: 1, modulation: 'QPSK', codeRate1024: 78, se: 0.1523 },
  { cqi: 15, modulation: '256QAM', codeRate1024: 948, se: 7.4063 },
].map(r => ({ ...r, source: SRC_38214, url: URL_38214 }))
