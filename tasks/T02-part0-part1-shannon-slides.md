# T02 — Part 0 (Prologue) + Part 1 (Shannon's Promise) slides

## Goal
Hook the audience, then establish the yardstick every later part measures against: channel capacity and the Eb/N0 limit.

## Slide outline

### Part 0 — Prologue (4 slides)
1. **Title.** Deck title, author, date. Subtitle: "How your phone wins an argument with thermodynamics."
2. **Hook.** "Every bit you have ever received over the air was a guess." A QPSK constellation blurred by noise (static image or minimal component) → the receiver never *sees* bits, only evidence. Sets up the probabilistic theme.
3. **The problem.** AWGN/BSC in one picture; retransmission alone is hopeless at scale (latency, throughput). One number: uncoded BPSK needs **Eb/N0 ≈ 9.6 dB for BER 1e-5** (Forney, MIT 6.451 Ch.4).
4. **Roadmap.** The 7 parts as a journey down the dB gauge (first appearance of `DbGauge`).

### Part 1 — Shannon's Promise (11 slides)
5. **1948.** Shannon, "A Mathematical Theory of Communication," BSTJ vol. 27, two parts (Jul + Oct 1948). First printed use of "bit" (credited by Shannon to J. W. Tukey). `TriviaCard`: Shannon rode a unicycle through Bell Labs hallways while juggling; at ISIT 1985 his surprise appearance stunned attendees — McEliece: "It was as if Newton had showed up at a physics conference" (IEEE Spectrum).
6. **The two theorems, plainly.** Theorem 17: C = B·log₂(1+SNR). Theorem 11: below C, error can be made *arbitrarily small*; above C, it cannot. KaTeX with click-stepped highlighting (`$$ {1|2|all} $$`).
7. **What Shannon did NOT give us.** Random-coding existence proof — no construction, no decoder. The gap took ~45–60 years to close (Costello & Forney 2007). Misconception-buster layout: 4 myths, each debunked on click ("capacity = max rate" ✗, "zero errors at capacity" ✗, "he told us how" ✗, "formula applies everywhere" ✗).
8. **INTERACTIVE — `CapacityExplorer` view 1.** C = B·log₂(1+SNR): sliders for SNR & B; show the log ceiling (doubling power ≠ doubling rate).
9. **From SNR to Eb/N0.** Derivation sketch: η = R/B, Eb/N0 ≥ (2^η − 1)/η. As η→0: **ln 2 = −1.59 dB** (ultimate limit, Forney Ch.4). Table: η=0.5→−0.82 dB, η=1→0 dB, η=2→1.76 dB, η=4→5.74 dB, η=8→15.03 dB.
10. **INTERACTIVE — `CapacityExplorer` view 2.** Eb/N0-vs-η plane with the capacity boundary; BPSK-input constraint curve (rate-1/2 BPSK limit ≈ 0.19–0.2 dB, CCSDS Green Book); hard-decision penalty ≈ 2 dB shown as a shifted curve.
11. **The 11 dB gap, 1948.** `BigNumber`: uncoded BPSK 9.6 dB vs −1.59 dB limit. "This deck is the story of closing that gap."
12. **The march, part 1 (1950–1990).** Timeline with dB flags on `DbGauge`: Hamming (7,4) 1950 (`TriviaCard`: Hamming's weekend rage — "If a machine can find out there is an error, why can't it find out where it is?"; publication delayed ~18 months by patent work); RS 1960; Viterbi 1967; Voyager 1977 RS(255,223)+K=7 conv → ~2.5 dB from limit; Galileo 1992 ≈ 0.8 dB via brute force (Costello-Forney).
13. **The march, part 2 (1993–2009).** Turbo 1993 (0.7 dB @ BER 1e-5, rate 1/2); LDPC rediscovery 1996; Chung et al. 2001 **0.0045 dB** threshold; Polar 2008/09 — first *provably* capacity-achieving explicit construction. `TriviaCard`: "Coding is dead" workshop, 1971 — Ned Weldon argued coding theorists were "a small, inbred group… isolated from reality"; Irwin Jacobs stood up holding a chip: "This is the future of coding" (Costello-Forney).
14. **Fine print: blocklength.** Polyanskiy–Poor–Verdú 2010 normal approximation R ≈ C − √(V/n)·Q⁻¹(ε): the capacity promise needs long blocks; a URLLC packet of n≈100–500 sits well below C by construction. Sets up Part 5 (polar, short blocks) and Part 6 (URLLC tables). Plot: rate backoff vs n at ε=1e-5.
15. **Part 1 recap.** The yardstick is set: −1.59 dB / 0 dB (rate-1/2) / 0.19 dB (BPSK). Three code families will now chase it.

## Acceptance criteria
- [ ] All 15 slides implemented per outline; ≤6 clicks each; presenter notes drafted.
- [ ] Every dB number above appears with `SourceFoot` citation.
- [ ] The misconception slide (7) and the two timeline slides (12–13) are click-choreographed.
- [ ] `DbGauge` motif established (slides 4, 12, 13, 15) with consistent scale (−2…+10 dB).
- [ ] KaTeX equation stepping works on slides 6 and 9.
- [ ] No dependency on `CapacityExplorer` internals beyond its T03 public props (mock acceptable until T03 lands).

## Factual basis (verified, with sources)
- Shannon 1948 two-part BSTJ publication; Theorems 11 & 17 statements: Shannon 1948 PDF (Harvard mirror).
- Ultimate limit ln 2 = −1.59 dB; rate-1/2 (η=1) limit 0 dB; uncoded BPSK 9.6 dB @ 1e-5: Forney, MIT 6.451 Ch. 4 (OCW).
- BPSK-input rate-1/2 limit ≈ 0.19–0.2 dB: CCSDS 130.1-G-3 Green Book; L. Schmalen (comp.dsp).
- Hard-decision loss > 2 dB (K=7 r=1/2 Viterbi; 8-bit quantization < 0.2 dB from ideal): CCSDS 130.1-G-1.
- Voyager concatenated RS(255,223)+K=7: ~7.3 dB real coding gain @ 1e-5 → ≈2.3 dB Eb/N0 (Costello-Forney 2007, arXiv:cs/0611112). Galileo ≈ 0.8 dB @ Pb 2e-7.
- Turbo ICC'93: BER 1e-5 @ 0.7 dB, rate 1/2, 65536-bit interleaver, 18 iterations.
- Chung–Forney–Richardson–Urbanke 2001: threshold 0.0045 dB; simulated within 0.04 dB @ BER 1e-6, n=10⁷ (IEEE Comm. Letters Feb 2001).
- PPV 2010: IEEE Trans. IT 56(5):2307–2359; approximation tight from n≈100.
- Anecdotes verified: Shannon (IEEE Spectrum "Tinkerer, Prankster…"), Hamming (NPS 1995 lecture transcript), "Coding is dead" (Costello-Forney).

## Flagged — do NOT use without T15 verification
- "0.37 dB rate-1/2 BPSK limit at BER 1e-5" — no primary source found; use 0.19–0.2 dB framing instead.
- η=0.5/4/8 table values — computed from formula (arithmetic check in T15).
- Voyager "~2.5 dB gap" — derived arithmetic.

## Dependencies
T01 (shared components). `CapacityExplorer` = T03 (parallel OK with placeholder).
