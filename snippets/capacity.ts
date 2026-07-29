// Pure capacity math for CapacityExplorer (T03). No Vue, no DOM: importable and
// unit-testable (see capacity.test.ts).

/**
 * Shannon AWGN capacity  C = B·log2(1 + SNR).
 * @param snrDb linear-in-dB signal-to-noise ratio
 * @param bMhz  bandwidth in MHz
 * @returns C in Mbps (MHz · bit/s/Hz = Mbit/s)
 */
export function shannonCapacityMbps(snrDb: number, bMhz: number): number {
  const snr = 10 ** (snrDb / 10)
  return bMhz * Math.log2(1 + snr)
}

/**
 * Unconstrained (Gaussian-input) Shannon limit on Eb/N0 for a spectral
 * efficiency η, in dB:  Eb/N0 = (2^η − 1)/η.
 * Anchors: ebn0LimitDb(1) === 0 dB exactly; as η→0 → 10·log10(ln2) = −1.59 dB
 * (the ultimate limit the whole deck chases). See styles/CONVENTIONS.md §2.
 */
export function ebn0LimitDb(eta: number): number {
  return 10 * Math.log10((2 ** eta - 1) / eta)
}
