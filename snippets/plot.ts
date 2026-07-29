// The deck's ONE shared hand-rolled SVG plotting helper (styles/CONVENTIONS.md
// §4): value→pixel mappers plus axis-tick generators for the curve plots
// (CapacityExplorer here; BlerExplorer later). Pure math, no Vue/DOM — the
// canonical look is a dB x-axis with integer ticks and an optional log y-axis.
// Unit-tested in plot.test.ts.

/** Linear value→pixel mapper over domain [d0,d1] → pixel range [p0,p1]. */
export function linMap(d0: number, d1: number, p0: number, p1: number): (v: number) => number {
  const s = (p1 - p0) / (d1 - d0)
  return v => p0 + (v - d0) * s
}

/** Log10 value→pixel mapper over [d0,d1] → [p0,p1] (requires d0,d1 > 0). */
export function logMap(d0: number, d1: number, p0: number, p1: number): (v: number) => number {
  const l0 = Math.log10(d0)
  const s = (p1 - p0) / (Math.log10(d1) - l0)
  return v => p0 + (Math.log10(v) - l0) * s
}

/** Integer-dB ticks from min to max at the given step (default 2 dB). */
export function dbTicks(min: number, max: number, step = 2): number[] {
  const out: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) out.push(v)
  return out
}

/** Power-of-ten ticks (…, 0.1, 1, 10, …) covering [min,max] (each > 0). */
export function decadeTicks(min: number, max: number): number[] {
  const out: number[] = []
  for (let e = Math.floor(Math.log10(min)); e <= Math.ceil(Math.log10(max)); e++) {
    const v = 10 ** e
    if (v >= min && v <= max) out.push(v)
  }
  return out
}
